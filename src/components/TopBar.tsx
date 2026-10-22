import React from 'react';
import { Menu, Download, Trash2, SlidersHorizontal, Share2 } from 'lucide-react';
import { Conversation, ModelOption } from '../types.ts';

interface TopBarProps {
  conversation: Conversation | null;
  onOpenMobileMenu: () => void;
  onClearMessages: () => void;
  onExport: (format: 'markdown' | 'json') => void;
  onOpenSettings: () => void;
  availableModels: ModelOption[];
  selectedModel: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  conversation,
  onOpenMobileMenu,
  onClearMessages,
  onExport,
  onOpenSettings,
  availableModels,
  selectedModel,
}) => {
  const currentModel = availableModels.find((m) => m.id === selectedModel);

  return (
    <header className="h-14 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between gap-8 shrink-0 z-30">
      {/* Zone 1: Brand / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs truncate">
          <span className="font-semibold text-neutral-300 whitespace-nowrap">
            Omni-X
          </span>
          <span className="text-neutral-600" aria-hidden="true">
            /
          </span>
          <span className="font-medium text-neutral-100 truncate">
            {conversation?.title || 'New Workspace'}
          </span>
        </div>
      </div>

      {/* Zone 2: Model Indicator & Metadata */}
      <div className="hidden md:flex items-center gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono">
          <span className="text-indigo-400 font-semibold">{currentModel?.name || selectedModel}</span>
          <span className="text-neutral-500" aria-hidden="true">·</span>
          <span className="text-neutral-400">{currentModel?.contextWindow || '1M tokens'}</span>
        </div>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative group">
          <button
            onClick={() => onExport('markdown')}
            disabled={!conversation || conversation.messages.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg border border-neutral-800/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Export conversation"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        <button
          onClick={onClearMessages}
          disabled={!conversation || conversation.messages.length === 0}
          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-900 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Clear messages in conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors"
          title="Settings & System Prompt"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
