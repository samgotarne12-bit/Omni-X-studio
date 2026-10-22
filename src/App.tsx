import React, { useState, useEffect, useRef, useTransition } from 'react';
import { Conversation, Message, ApiStatus } from './types.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { ChatMessage } from './components/ChatMessage.tsx';
import { ChatInput } from './components/ChatInput.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { PromptLibraryModal } from './components/PromptLibraryModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';

const STORAGE_KEY = 'omni_x_conversations_v1';
const SETTINGS_KEY = 'omni_x_settings_v1';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    const defaultChat: Conversation = {
      id: 'default-' + Date.now(),
      title: 'General Inquiries',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: 'gemini-3.8-flash',
    };
    return [defaultChat];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return conversations[0]?.id || '';
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ApiStatus | null>(null);

  // Modals & Mobile Sidebar
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const [isOpenTemplates, setIsOpenTemplates] = useState(false);

  // Settings State
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'You are Omni-X, a distinguished and highly capable AI assistant. Provide articulate, well-structured, insightful responses formatted in clear markdown with clean headings, bullet points, and syntax-highlighted code blocks when helpful.'
  );
  const [temperature, setTemperature] = useState<number>(0.7);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch API status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data: ApiStatus) => {
        setStatus(data);
        if (data.model) {
          setSelectedModel(data.model);
        }
      })
      .catch((err) => {
        console.error('Failed to load status:', err);
      });
  }, []);

  // Sync conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // storage full or disabled
    }
  }, [conversations]);

  // Load saved settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedModel) setSelectedModel(parsed.selectedModel);
        if (parsed.systemPrompt) setSystemPrompt(parsed.systemPrompt);
        if (typeof parsed.temperature === 'number') setTemperature(parsed.temperature);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ selectedModel, systemPrompt, temperature })
      );
    } catch {
      // ignore
    }
  }, [selectedModel, systemPrompt, temperature]);

  // Keyboard shortcut: Cmd/Ctrl + K for new conversation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
      if (e.key === 'Escape') {
        setIsOpenSettings(false);
        setIsOpenTemplates(false);
        setIsOpenMobile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isLoading]);

  const activeConversation =
    conversations.find((c) => c.id === activeId) || conversations[0];

  const handleNewChat = () => {
    const newChat: Conversation = {
      id: 'chat-' + Date.now(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel,
    };
    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
  };

  const handleDeleteChat = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const fallback: Conversation = {
          id: 'chat-' + Date.now(),
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: selectedModel,
        };
        setActiveId(fallback.id);
        return [fallback];
      }
      if (activeId === id) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const handleClearMessages = () => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, messages: [] } : c))
    );
  };

  const handleClearAllChats = () => {
    if (confirm('Are you sure you want to wipe all conversation history?')) {
      const freshChat: Conversation = {
        id: 'chat-' + Date.now(),
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: selectedModel,
      };
      setConversations([freshChat]);
      setActiveId(freshChat.id);
      setIsOpenSettings(false);
    }
  };

  const handleExport = (format: 'markdown' | 'json') => {
    if (!activeConversation) return;
    let content = '';
    let filename = `${activeConversation.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (format === 'markdown') {
      content = `# ${activeConversation.title}\n\nDate: ${new Intl.DateTimeFormat().format(
        activeConversation.createdAt
      )}\nModel: ${activeConversation.model}\n\n---\n\n`;

      activeConversation.messages.forEach((m) => {
        const sender = m.role === 'user' ? '### User' : `### Omni-X (${m.model || activeConversation.model})`;
        content += `${sender}\n\n${m.content}\n\n---\n\n`;
      });
      filename += '.md';
    } else {
      content = JSON.stringify(activeConversation, null, 2);
      filename += '.json';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAllData = () => {
    const content = JSON.stringify(conversations, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omni_x_all_conversations_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading || !activeConversation) return;

    const userMessage: Message = {
      id: 'msg-' + Date.now() + '-user',
      role: 'user',
      content: userText.trim(),
      timestamp: Date.now(),
    };

    // Auto update title from first message if default
    let updatedTitle = activeConversation.title;
    if (activeConversation.messages.length === 0 || activeConversation.title === 'New Conversation' || activeConversation.title === 'General Inquiries') {
      updatedTitle = userText.trim().slice(0, 36) + (userText.length > 36 ? '...' : '');
    }

    const updatedMessages = [...activeConversation.messages, userMessage];

    // Optimistically update conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              title: updatedTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          systemPrompt,
          temperature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server returned an error');
      }

      const assistantMessage: Message = {
        id: 'msg-' + Date.now() + '-assistant',
        role: 'assistant',
        content: data.reply || 'No response returned.',
        timestamp: Date.now(),
        model: data.model || selectedModel,
        provider: data.provider,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: [...updatedMessages, assistantMessage],
                updatedAt: Date.now(),
              }
            : c
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const stoppedMessage: Message = {
          id: 'msg-' + Date.now() + '-stopped',
          role: 'assistant',
          content: '*(Generation interrupted by user)*',
          timestamp: Date.now(),
          model: selectedModel,
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  messages: [...updatedMessages, stoppedMessage],
                  updatedAt: Date.now(),
                }
              : c
          )
        );
      } else {
        const errorMessage: Message = {
          id: 'msg-' + Date.now() + '-error',
          role: 'assistant',
          content: err.message || 'Could not communicate with the AI engine.',
          timestamp: Date.now(),
          error: true,
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  messages: [...updatedMessages, errorMessage],
                  updatedAt: Date.now(),
                }
              : c
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerateLast = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const msgs = [...activeConversation.messages];
    // Find last user message
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const userText = msgs[lastUserIndex].content;
    const trimmedMsgs = msgs.slice(0, lastUserIndex);

    // Set messages back to before the last user message and resend
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: trimmedMsgs } : c
      )
    );

    sendMessage(userText);
  };

  const availableModels = status?.availableModels || [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      provider: 'gemini' as const,
      description: "Google's next-gen multimodal reasoning model.",
      contextWindow: '1M tokens',
      ready: true,
    },
    {
      id: 'gpt-4.1-mini',
      name: 'GPT-4.1 Mini',
      provider: 'openai' as const,
      description: "OpenAI's efficient reasoning and coding model.",
      contextWindow: '128k tokens',
      ready: false,
    },
  ];

  const currentModelObj = availableModels.find((m) => m.id === selectedModel);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100">
      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePin={handleTogglePin}
        onOpenSettings={() => setIsOpenSettings(true)}
        onOpenTemplates={() => setIsOpenTemplates(true)}
        status={status}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Navigation Bar adhering to Top Bar Contract */}
        <TopBar
          conversation={activeConversation}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onClearMessages={handleClearMessages}
          onExport={handleExport}
          onOpenSettings={() => setIsOpenSettings(true)}
          availableModels={availableModels}
          selectedModel={selectedModel}
        />

        {/* Conversation Viewport */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {activeConversation && activeConversation.messages.length > 0 ? (
            <div className="flex-1">
              {activeConversation.messages.map((msg, idx) => {
                const isLastAssistant =
                  msg.role === 'assistant' &&
                  idx === activeConversation.messages.length - 1;
                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isLastAssistant={isLastAssistant}
                    onRegenerate={handleRegenerateLast}
                  />
                );
              })}

              {/* Streaming loading skeleton */}
              {isLoading && (
                <div className="py-6 px-4 md:px-8 bg-neutral-900/20 border-b border-neutral-900/80">
                  <div className="max-w-4xl mx-auto flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 flex items-center justify-center shrink-0 animate-pulse text-xs">
                      Ω
                    </div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="font-semibold text-neutral-200">Omni-X</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-indigo-400 font-mono text-[11px] animate-pulse">
                          Thinking & generating...
                        </span>
                      </div>
                      <div className="h-3.5 bg-neutral-800/80 rounded w-3/4 animate-pulse" />
                      <div className="h-3.5 bg-neutral-800/60 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          ) : (
            <EmptyState
              onSelectPrompt={(text) => sendMessage(text)}
              selectedModelName={currentModelObj?.name || selectedModel}
            />
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={() => sendMessage(input)}
          isLoading={isLoading}
          onStop={handleStopGeneration}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          availableModels={availableModels}
          onOpenSettings={() => setIsOpenSettings(true)}
          onOpenTemplates={() => setIsOpenTemplates(true)}
        />
      </main>

      {/* Modals */}
      <PromptLibraryModal
        isOpen={isOpenTemplates}
        onClose={() => setIsOpenTemplates(false)}
        onSelectPrompt={(promptText) => {
          setInput(promptText);
        }}
      />

      <SettingsModal
        isOpen={isOpenSettings}
        onClose={() => setIsOpenSettings(false)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        availableModels={availableModels}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        temperature={temperature}
        setTemperature={setTemperature}
        status={status}
        onClearAllChats={handleClearAllChats}
        onExportAllData={handleExportAllData}
      />
    </div>
  );
}
