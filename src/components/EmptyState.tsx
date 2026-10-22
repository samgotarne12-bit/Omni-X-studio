import React from 'react';
import { Terminal, ShieldCheck, Cpu, Code2, Zap } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
  selectedModelName: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  selectedModelName,
}) => {
  const starterPrompts = [
    {
      title: 'Architect Scalable Systems',
      subtitle: 'Design resilient microservices & caching tier',
      icon: Cpu,
      prompt: 'Draft an architectural blueprint for a distributed notification service processing 100k events/sec. Detail service boundaries, message queues, and failure recovery.',
    },
    {
      title: 'Code Review & Refactor',
      subtitle: 'Analyze complexity, memory, and race conditions',
      icon: Code2,
      prompt: 'Review the following TypeScript algorithm for time and space complexity, identify potential concurrency issues, and suggest an optimal refactor with code snippets.',
    },
    {
      title: 'Security & Auth Audit',
      subtitle: 'Examine API authentication and token rotation',
      icon: ShieldCheck,
      prompt: 'Outline best practices for implementing short-lived JWTs with secure HTTP-only refresh token rotation in a full-stack web application.',
    },
    {
      title: 'SQL & Database Optimization',
      subtitle: 'Diagnose slow indexes and table locking',
      icon: Terminal,
      prompt: 'Explain the difference between B-Tree, GIN, and BRIN indexes in PostgreSQL, and when each should be chosen for multi-million row analytics tables.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-3xl mx-auto text-center">
      {/* Omni-X Brand Mark */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-xl shadow-indigo-600/25 mb-5 font-bold text-2xl tracking-wider ring-1 ring-white/20">
        Ω
      </div>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-100 mb-2">
        Omni-X Studio
      </h1>

      <p className="text-xs md:text-sm text-neutral-400 max-w-lg mb-8 leading-relaxed">
        High-performance workspace powered by {selectedModelName}. Ready for deep reasoning, architectural design, algorithmic synthesis, and creative exploration.
      </p>

      {/* Starter Prompts Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {starterPrompts.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 rounded-xl border border-neutral-850 bg-neutral-900/40 hover:bg-neutral-900/90 hover:border-neutral-700 transition-all text-left group flex items-start gap-3 shadow-xs"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center shrink-0 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">
                <Icon className="w-4 h-4 text-neutral-300 group-hover:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-200 group-hover:text-indigo-300 transition-colors truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-8 text-xs text-neutral-400">
        <Zap className="w-3.5 h-3.5 text-indigo-400" />
        <span>Select any blueprint above or start typing below</span>
      </div>
    </div>
  );
};
