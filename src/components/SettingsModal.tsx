import React from 'react';
import { X, Sliders, Cpu, Activity, RotateCcw, Download, Sparkles, Check } from 'lucide-react';
import { ApiStatus, ModelOption } from '../types.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  availableModels: ModelOption[];
  systemPrompt: string;
  setSystemPrompt: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  status: ApiStatus | null;
  onClearAllChats: () => void;
  onExportAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
  availableModels,
  systemPrompt,
  setSystemPrompt,
  temperature,
  setTemperature,
  status,
  onClearAllChats,
  onExportAllData,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      name: 'Software Architect',
      prompt:
        'You are Omni-X Senior Systems Architect. Analyze technical problems with rigorous algorithmic depth, evaluate concurrency and distributed scale, and write clean, resilient, typed code.',
    },
    {
      name: 'Concise Technical Pro',
      prompt:
        'You are Omni-X. Give succinct, direct, no-fluff technical answers. Prefer bullet points and clean code snippets over preamble.',
    },
    {
      name: 'Creative Brainstormer',
      prompt:
        'You are Omni-X Creative Strategist. Explore bold, unconventional hypotheses, generate vivid concepts, and propose novel multi-disciplinary angles.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-neutral-100">
              Workspace Parameters & Model Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Engine Status Card */}
          <div className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                API Engine Status
              </span>
              <span className="font-mono text-[11px] text-neutral-400">
                {status?.configured ? 'Active' : 'Unconfigured'}
              </span>
            </div>
            <div className="space-y-1.5 text-neutral-400">
              <div className="flex items-center justify-between">
                <span>Google GenAI Engine (Gemini 3.8):</span>
                <span className={`font-mono text-[11px] ${status?.hasGemini ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  {status?.hasGemini ? 'Connected (Built-in)' : 'Not detected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>OpenAI API (GPT-4.1 / GPT-4o):</span>
                <span className={`font-mono text-[11px] ${status?.hasOpenAI ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  {status?.hasOpenAI ? 'Connected' : 'Add OPENAI_API_KEY in .env'}
                </span>
              </div>
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block font-semibold text-neutral-200 mb-2">
              Active Intelligence Model
            </label>
            <div className="grid grid-cols-1 gap-2">
              {availableModels.map((m) => {
                const isSelected = m.id === selectedModel;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectModel(m.id)}
                    className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/20 text-neutral-100'
                        : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-200">{m.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-neutral-800 rounded text-neutral-300">
                          {m.contextWindow}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
                        {m.description}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-neutral-200">
                Temperature (Creativity vs Determinism)
              </label>
              <span className="font-mono tabular-nums text-indigo-400 font-medium">
                {temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 mt-1 font-mono">
              <span>0.0 (Precise / Code)</span>
              <span>0.7 (Balanced)</span>
              <span>1.5 (High Divergence)</span>
            </div>
          </div>

          {/* System Instructions / Persona */}
          <div>
            <label className="block font-semibold text-neutral-200 mb-1.5">
              System Instructions & Persona
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              placeholder="Define instructions, tone, and operational boundaries for Omni-X..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-neutral-400 mr-1">Presets:</span>
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSystemPrompt(p.prompt)}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 text-[11px] transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="pt-3 border-t border-neutral-900 flex items-center justify-between">
            <button
              onClick={onExportAllData}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-300 text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Conversations</span>
            </button>

            <button
              onClick={onClearAllChats}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950/40 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Wipe History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
