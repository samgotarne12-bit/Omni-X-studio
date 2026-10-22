import React, { useState } from 'react';
import { X, Search, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { PROMPT_TEMPLATES } from '../data/promptTemplates.ts';
import { PromptTemplate } from '../types.ts';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Coding', 'Architecture', 'Analysis', 'Writing', 'Reasoning'];

  const filtered = PROMPT_TEMPLATES.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-neutral-100">
              Prompt Library & Engineered Blueprints
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-neutral-800/80 space-y-3 bg-neutral-900/30">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompt templates..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 text-xs text-neutral-200 placeholder-neutral-500 rounded-md border border-neutral-800 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-800 text-white font-medium border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((item: PromptTemplate) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-neutral-800/90 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-neutral-100 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mb-2.5">
                  {item.description}
                </p>
                <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-850 text-xs font-mono text-neutral-300 line-clamp-3 leading-relaxed">
                  {item.prompt}
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    onSelectPrompt(item.prompt);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                >
                  <span>Use This Prompt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-neutral-400">
              No matching prompts found for "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
