export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  provider?: string;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  pinned?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: 'gemini' | 'openai';
  description: string;
  contextWindow: string;
  ready?: boolean;
}

export interface ApiStatus {
  configured: boolean;
  hasOpenAI: boolean;
  hasGemini: boolean;
  model: string;
  activeProvider: string;
  availableModels: ModelOption[];
}

export interface PromptTemplate {
  id: string;
  category: 'Coding' | 'Architecture' | 'Analysis' | 'Writing' | 'Reasoning';
  title: string;
  description: string;
  prompt: string;
}
