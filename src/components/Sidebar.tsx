import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Settings,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Conversation, ApiStatus } from '../types.ts';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  status: ApiStatus | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePin,
  onOpenSettings,
  onOpenTemplates,
  status,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedChats = filteredConversations.filter((c) => c.pinned);
  const recentChats = filteredConversations.filter((c) => !c.pinned);

  const handleStartRename = (e: React.MouseEvent, c: Conversation) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-900 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-neutral-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-sm tracking-wider">
              Ω
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-neutral-100">
                Omni-X
              </span>
              <span className="text-[10px] text-indigo-400 font-mono ml-2 uppercase tracking-wider">
                Studio
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Chat */}
        <div className="p-3 border-b border-neutral-900/60">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all group"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-indigo-700/60 rounded text-indigo-200">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Search Filter */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter conversations..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-900/60 text-xs text-neutral-200 placeholder-neutral-500 rounded-md border border-neutral-800/80 focus:outline-none focus:border-indigo-500/60"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pin className="w-3 h-3 text-indigo-400 rotate-45" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {pinnedChats.map((c) => (
                  <ChatItem
                    key={c.id}
                    conversation={c}
                    isActive={c.id === activeId}
                    isEditing={editingId === c.id}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelect(c.id);
                      onCloseMobile();
                    }}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePin(c.id);
                    }}
                    onStartRename={(e) => handleStartRename(e, c)}
                    onSaveRename={(e) => handleSaveRename(e, c.id)}
                    onCancelRename={handleCancelRename}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteChat(c.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Chats */}
          <div>
            <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Conversations</span>
              <span className="font-mono text-[10px] tabular-nums text-neutral-400">
                {conversations.length}
              </span>
            </div>

            {recentChats.length === 0 && pinnedChats.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-neutral-400">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-neutral-400 stroke-1" />
                <span>No conversation history</span>
              </div>
            ) : (
              <div className="space-y-0.5 mt-1">
                {recentChats.map((c) => (
                  <ChatItem
                    key={c.id}
                    conversation={c}
                    isActive={c.id === activeId}
                    isEditing={editingId === c.id}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelect(c.id);
                      onCloseMobile();
                    }}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePin(c.id);
                    }}
                    onStartRename={(e) => handleStartRename(e, c)}
                    onSaveRename={(e) => handleSaveRename(e, c.id)}
                    onCancelRename={handleCancelRename}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteChat(c.id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tools & Prompt Library Button */}
        <div className="p-3 border-t border-neutral-900/80 space-y-1">
          <button
            onClick={() => {
              onOpenTemplates();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Prompt Templates</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900 rounded-lg transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-neutral-400" />
              <span>Settings & Parameters</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
          </button>
        </div>

        {/* API Engine Status Footer */}
        <div className="p-3 bg-neutral-900/40 border-t border-neutral-900 text-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Engine Status</span>
            </span>
            <span className="font-mono text-[11px] text-neutral-300">
              {status?.configured ? 'Active' : 'Standby'}
            </span>
          </div>

          <div className="mt-1 text-[11px] text-neutral-400 truncate">
            {status?.hasGemini && status?.hasOpenAI
              ? 'Gemini 3.8 + OpenAI ready'
              : status?.hasGemini
              ? 'Gemini 3.8 Flash active'
              : status?.hasOpenAI
              ? 'OpenAI API active'
              : 'Add API key to connect'}
          </div>
        </div>
      </aside>
    </>
  );
};

interface ChatItemProps {
  conversation: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: (e: React.MouseEvent) => void;
  onCancelRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  conversation,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  onSelect,
  onTogglePin,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onDelete,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
        isActive
          ? 'bg-neutral-800 text-neutral-100 font-medium'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveRename(e as any);
              if (e.key === 'Escape') onCancelRename(e as any);
            }}
            autoFocus
            className="w-full bg-neutral-950 px-1.5 py-0.5 rounded border border-indigo-500 text-xs text-white focus:outline-none"
          />
        ) : (
          <span className="truncate">{conversation.title}</span>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onSaveRename}
            className="p-1 text-emerald-400 hover:text-emerald-300"
            title="Save title"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCancelRename}
            className="p-1 text-neutral-400 hover:text-neutral-300"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          <button
            onClick={onTogglePin}
            className={`p-1 rounded hover:bg-neutral-700/60 ${
              conversation.pinned ? 'text-indigo-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title={conversation.pinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className="w-3 h-3 rotate-45" />
          </button>
          <button
            onClick={onStartRename}
            className="p-1 rounded hover:bg-neutral-700/60 text-neutral-400 hover:text-neutral-200"
            title="Rename"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-neutral-700/60 text-neutral-400 hover:text-red-400"
            title="Delete conversation"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
