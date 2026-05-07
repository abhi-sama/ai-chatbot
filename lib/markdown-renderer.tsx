'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import type { Highlighter } from 'shiki';

// ─── Shiki Highlighter Singleton ────────────────────────────────────────────

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: [
          'javascript', 'typescript', 'python', 'json', 'html', 'css',
          'bash', 'markdown', 'yaml', 'sql', 'jsx', 'tsx', 'rust',
          'go', 'java', 'c', 'cpp', 'diff',
        ],
      })
    );
  }
  return highlighterPromise;
}

// ─── Theme Hook ─────────────────────────────────────────────────────────────

function useCurrentTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark ? 'github-dark' : 'github-light';
}

// ─── Diff Renderer ──────────────────────────────────────────────────────────

function DiffBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lines = code.split('\n');

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-chatqa-border bg-chatqa-code-bg">
      <div className="flex items-center justify-between border-b border-chatqa-border px-4 py-1.5 text-xs">
        <span className="text-chatqa-text-secondary">diff</span>
        <button
          onClick={handleCopy}
          className="rounded px-2 py-0.5 text-chatqa-text-secondary transition-colors hover:bg-chatqa-border hover:text-chatqa-text"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono">
        {lines.map((line, i) => {
          let lineClass = 'text-chatqa-text';
          let bgClass = '';
          if (line.startsWith('+') && !line.startsWith('+++')) {
            lineClass = 'text-green-400';
            bgClass = 'bg-green-500/10';
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            lineClass = 'text-red-400';
            bgClass = 'bg-red-500/10';
          } else if (line.startsWith('@@')) {
            lineClass = 'text-chatqa-accent';
            bgClass = 'bg-chatqa-accent/5';
          }
          return (
            <div key={i} className={`px-1 ${bgClass}`}>
              <span className={lineClass}>{line}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

// ─── Code Block Component ───────────────────────────────────────────────────

function CodeBlock({
  code,
  language,
  showLineNumbers = false,
}: {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = useCurrentTheme();

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((highlighter) => {
      if (cancelled) return;
      try {
        const html = highlighter.codeToHtml(code, {
          lang: language || 'text',
          theme,
        });
        setHighlightedHtml(html);
      } catch {
        // Language not loaded — leave as fallback
      }
    });
    return () => { cancelled = true; };
  }, [code, language, theme]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lineCount = code.split('\n').length;

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-chatqa-border bg-chatqa-code-bg">
      <div className="flex items-center justify-between border-b border-chatqa-border px-4 py-1.5 text-xs">
        <span className="text-chatqa-text-secondary">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="rounded px-2 py-0.5 text-chatqa-text-secondary transition-colors hover:bg-chatqa-border hover:text-chatqa-text"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex overflow-x-auto">
        {/* Line numbers gutter */}
        {showLineNumbers && (
          <div className="shrink-0 select-none border-r border-chatqa-border px-3 py-4 text-right text-xs leading-[1.7142857] text-chatqa-muted">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}

        {/* Code content */}
        {highlightedHtml ? (
          <div
            className="flex-1 overflow-x-auto p-4 text-sm [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="flex-1 overflow-x-auto p-4 text-sm">
            <code className="font-mono text-chatqa-text">{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

export function MarkdownRenderer({
  content,
  className,
  devMode = false,
}: {
  content: string;
  className?: string;
  devMode?: boolean;
}) {
  const components: Components = {
    code({ children, className: codeClassName, ...props }) {
      const match = /language-(\w+)/.exec(codeClassName || '');
      const isInline = !match && !String(children).includes('\n');

      if (isInline) {
        return (
          <code
            className="rounded bg-chatqa-code-bg px-1.5 font-mono text-sm"
            {...props}
          >
            {children}
          </code>
        );
      }

      const language = match ? match[1] : '';
      const code = String(children).replace(/\n$/, '');

      // Diff blocks get special rendering
      if (language === 'diff') {
        return <DiffBlock code={code} />;
      }

      return (
        <CodeBlock
          code={code}
          language={language}
          showLineNumbers={devMode}
        />
      );
    },

    pre({ children }) {
      return <>{children}</>;
    },

    a({ href, children, ...props }) {
      return (
        <a
          href={href}
          className="text-chatqa-accent underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },

    table({ children, ...props }) {
      return (
        <div className="my-4 overflow-x-auto">
          <table
            className="w-full border-collapse border border-chatqa-border text-sm"
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },

    thead({ children, ...props }) {
      return <thead className="bg-chatqa-surface" {...props}>{children}</thead>;
    },

    tr({ children, ...props }) {
      return <tr className="border-b border-chatqa-border even:bg-chatqa-surface/50" {...props}>{children}</tr>;
    },

    th({ children, ...props }) {
      return (
        <th className="border border-chatqa-border px-3 py-2 text-left font-semibold text-chatqa-text" {...props}>
          {children}
        </th>
      );
    },

    td({ children, ...props }) {
      return <td className="border border-chatqa-border px-3 py-2" {...props}>{children}</td>;
    },

    ul({ children, ...props }) {
      return <ul className="my-2 ml-4 list-disc space-y-1 marker:text-chatqa-accent" {...props}>{children}</ul>;
    },

    ol({ children, ...props }) {
      return <ol className="my-2 ml-4 list-decimal space-y-1 marker:text-chatqa-accent" {...props}>{children}</ol>;
    },

    li({ children, ...props }) {
      return <li className="pl-1" {...props}>{children}</li>;
    },

    blockquote({ children, ...props }) {
      return (
        <blockquote className="my-3 border-l-4 border-chatqa-accent pl-4 italic text-chatqa-text-secondary" {...props}>
          {children}
        </blockquote>
      );
    },

    h1({ children, ...props }) {
      return <h1 className="mb-3 mt-5 text-2xl font-bold text-chatqa-text" {...props}>{children}</h1>;
    },
    h2({ children, ...props }) {
      return <h2 className="mb-2 mt-4 text-xl font-semibold text-chatqa-text" {...props}>{children}</h2>;
    },
    h3({ children, ...props }) {
      return <h3 className="mb-2 mt-3 text-lg font-semibold text-chatqa-text" {...props}>{children}</h3>;
    },

    p({ children, ...props }) {
      return <p className="my-2 leading-relaxed" {...props}>{children}</p>;
    },

    hr() {
      return <hr className="my-4 border-chatqa-border" />;
    },
  };

  return (
    <div className={`prose-chatqa text-chatqa-text ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
