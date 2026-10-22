import React, { useState } from 'react';
import { Message } from '../types.ts';
import { MarkdownView } from './MarkdownView.tsx';
import { Bot, User, Copy, Check, Volume2, VolumeX, RotateCcw, AlertTriangle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastAssistant,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(message.timestamp);

  const isUser = message.role === 'user';

  return (
    <div
      className={`py-6 px-4 md:px-8 border-b border-neutral-900/80 transition-colors ${
        isUser ? 'bg-neutral-950/40' : 'bg-neutral-900/20'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-4">
        {/* Avatar indicator */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-xs font-medium ${
            isUser
              ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
              : 'bg-indigo-950/80 border-indigo-700/60 text-indigo-400 shadow-sm shadow-indigo-950/50'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Content body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200">
              {isUser ? 'You' : 'Omni-X'}
            </span>
            {message.model && !isUser && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  {message.model}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="text-neutral-400 font-mono text-[11px] tabular-nums">
              {formattedTime}
            </span>
          </div>

          {message.error ? (
            <div className="flex items-start gap-2.5 p-3.5 my-2 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-200 mb-1">Execution Interrupted</p>
                <p>{message.content}</p>
              </div>
            </div>
          ) : isUser ? (
            <p className="text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          ) : (
            <MarkdownView content={message.content} />
          )}

          {/* Action Bar */}
          {!message.error && (
            <div className="flex items-center gap-1.5 mt-3 pt-2 text-xs text-neutral-400">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-800/60 hover:text-neutral-200 transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              {!isUser && (
                <>
                  <button
                    onClick={handleSpeak}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-800/60 hover:text-neutral-200 transition-colors"
                    title={isSpeaking ? 'Stop readout' : 'Read aloud'}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-indigo-400 text-[11px]">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Read</span>
                      </>
                    )}
                  </button>

                  {isLastAssistant && onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-800/60 hover:text-neutral-200 transition-colors"
                      title="Regenerate this response"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Regenerate</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
