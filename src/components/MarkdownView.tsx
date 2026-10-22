import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Terminal } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-neutral-200 text-sm leading-relaxed break-words space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-semibold text-neutral-100 mt-5 mb-2 pb-1 border-b border-neutral-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-neutral-100 mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-neutral-150 mt-3 mb-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-2 text-neutral-200 leading-normal">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 my-2 space-y-1 text-neutral-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 my-2 space-y-1 text-neutral-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-500/50 pl-4 py-1 my-3 bg-neutral-900/60 rounded-r text-neutral-300 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border border-neutral-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-900/90 text-neutral-300 font-medium border-b border-neutral-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-neutral-800/60">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-neutral-900/40 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-medium text-neutral-300 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 font-mono tabular-nums text-neutral-300">
              {children}
            </td>
          ),
          hr: () => <hr className="border-neutral-800 my-4" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-100">{children}</strong>
          ),
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const codeString = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-xs text-indigo-300"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock language={match ? match[1] : 'code'} code={codeString} />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({
  language,
  code,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-4 rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-900/90 border-b border-neutral-800/80">
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language || 'text'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 rounded transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-neutral-200">
        <pre className="m-0 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
