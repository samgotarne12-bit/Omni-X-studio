import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "2mb" }));

// Initialize Google GenAI client if GEMINI_API_KEY is available
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Status endpoint with comprehensive intelligence & backward compatibility
app.get("/api/status", (_req, res) => {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const configured = hasOpenAI || hasGemini;

  // Active default model
  const defaultModel = process.env.OPENAI_MODEL || (hasGemini ? "gemini-3.8-flash" : "gpt-4.1-mini");

  res.json({
    configured,
    hasOpenAI,
    hasGemini,
    model: defaultModel,
    activeProvider: hasGemini ? "gemini" : (hasOpenAI ? "openai" : "none"),
    availableModels: [
      {
        id: "gemini-3.8-flash",
        name: "Gemini 3.8 Flash",
        provider: "gemini",
        description: "Google's next-gen multimodal reasoning model. Fast, precise, and responsive.",
        contextWindow: "1,000,000 tokens",
        ready: hasGemini
      },
      {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 Mini",
        provider: "openai",
        description: "OpenAI's efficient, versatile reasoning and coding model.",
        contextWindow: "128,000 tokens",
        ready: hasOpenAI
      },
      {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "openai",
        description: "OpenAI flagship high-intelligence model for deep synthesis.",
        contextWindow: "128,000 tokens",
        ready: hasOpenAI
      }
    ]
  });
});

// Chat endpoint supporting both OpenAI and Gemini
app.post("/api/chat", async (req, res) => {
  const { messages, model, systemPrompt, temperature } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Send a non-empty messages array." });
  }

  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  if (!hasOpenAI && !hasGemini) {
    return res.status(503).json({
      error: "Demo mode is active. Add OPENAI_API_KEY or GEMINI_API_KEY to your environment to enable live AI responses."
    });
  }

  // Determine provider: prefer requested model or available key
  const requestedModel = (typeof model === "string" && model.trim())
    ? model.trim()
    : (hasGemini ? "gemini-3.8-flash" : (process.env.OPENAI_MODEL || "gpt-4.1-mini"));

  const isGemini = requestedModel.startsWith("gemini") || (!hasOpenAI && hasGemini);

  if (isGemini && ai) {
    try {
      // Format messages for @google/genai contents
      const systemInstruction = systemPrompt || "You are Omni-X, a distinguished and highly capable AI assistant. Provide articulate, well-structured, insightful responses formatted in clear markdown with clean headings, bullet points, and syntax-highlighted code blocks when helpful.";

      // Map conversation turns into format compatible with generateContent
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "").slice(0, 20000) }],
      }));

      const tempVal = typeof temperature === "number" ? Math.max(0, Math.min(2, temperature)) : 0.7;

      let response;
      let usedModel = "gemini-3.8-flash";
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction,
            temperature: tempVal,
          },
        });
      } catch (geminiErr: any) {
        console.warn("gemini-3.8-flash high demand/error, attempting fallback:", geminiErr?.message);
        try {
          usedModel = "gemini-flash-latest";
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents,
            config: {
              systemInstruction,
              temperature: tempVal,
            },
          });
        } catch (fallbackErr: any) {
          console.warn("gemini-flash-latest busy, trying gemini-3.1-flash-lite:", fallbackErr?.message);
          usedModel = "gemini-3.1-flash-lite";
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents,
            config: {
              systemInstruction,
              temperature: tempVal,
            },
          });
        }
      }

      const reply = response?.text || "I couldn't generate a response.";
      return res.json({
        reply,
        model: usedModel,
        provider: "gemini"
      });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      let errorMessage = "Could not reach the Gemini AI service. Please try again.";
      if (typeof err?.message === "string") {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error?.message) {
            errorMessage = parsed.error.message;
          }
        } catch {
          errorMessage = err.message;
        }
      }
      return res.status(500).json({ error: errorMessage });
    }
  }

  // Fallback to OpenAI if configured
  if (hasOpenAI) {
    try {
      const openAiMessages = [];
      if (systemPrompt) {
        openAiMessages.push({ role: "system", content: systemPrompt });
      }
      for (const m of messages) {
        openAiMessages.push({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || "").slice(0, 12000)
        });
      }

      const tempVal = typeof temperature === "number" ? Math.max(0, Math.min(2, temperature)) : 0.7;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: requestedModel || process.env.OPENAI_MODEL || "gpt-4.1-mini",
          messages: openAiMessages,
          temperature: tempVal
        })
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.error?.message || "The AI provider returned an error."
        });
      }

      return res.json({
        reply: data.choices?.[0]?.message?.content || "I couldn't generate a response.",
        model: requestedModel || process.env.OPENAI_MODEL || "gpt-4.1-mini",
        provider: "openai"
      });
    } catch (error: any) {
      console.error("OpenAI request error:", error);
      return res.status(500).json({
        error: "Could not reach the AI service. Please try again."
      });
    }
  }

  return res.status(503).json({
    error: "Configured AI provider is currently unreachable. Please check your credentials."
  });
});

// Mount Vite in development or static build in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend build
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(port, () => {
    console.log(`Omni-X is running at http://localhost:${port}`);
  });
}

startServer();
