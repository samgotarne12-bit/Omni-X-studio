import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square, Sparkles, SlidersHorizontal, BookOpen } from 'lucide-react';
import { ModelOption } from '../types.ts';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onStop?: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  availableModels: ModelOption[];
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading,
  onStop,
  selectedModel,
  onSelectModel,
  availableModels,
  onOpenSettings,
  onOpenTemplates,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 220)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSubmit();
      }
    }
  };

  const currentModel = availableModels.find((m) => m.id === selectedModel) || availableModels[0];

  return (
    <div className="border-t border-neutral-900 bg-neutral-950/90 backdrop-blur-md p-3 md:p-5">
      <div className="max-w-4xl mx-auto">
        {/* Workspace Toolbar above input */}
        <div className="flex items-center justify-between mb-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            {/* Model Selector dropdown */}
            <div className="relative group">
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                disabled={isLoading}
                className="bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors focus:outline-none focus:border-indigo-500/70"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id} className="bg-neutral-900 text-neutral-200">
                    {m.name} {m.ready ? '✓' : '(Demo/Key needed)'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenTemplates}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300 border border-neutral-800/80 transition-colors"
              title="Open Prompt Library"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Templates</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-neutral-400 tabular-nums hidden sm:inline">
              {input.length} characters
            </span>
            <button
              onClick={onOpenSettings}
              type="button"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Model & System Parameters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Parameters</span>
            </button>
          </div>
        </div>

        {/* Input Text Box */}
        <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/70 focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isLoading
                ? 'Omni-X is synthesizing response...'
                : `Message Omni-X with ${currentModel?.name || 'AI'}...`
            }
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent px-4 py-3.5 pr-14 text-sm text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none max-h-56 overflow-y-auto leading-relaxed"
          />

          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-colors"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={!input.trim()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  input.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-neutral-800/80 text-neutral-500 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Omni-X Intelligence Engine</span>
          </span>
          <span className="hidden sm:inline font-mono">
            Enter to send · Shift + Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};
