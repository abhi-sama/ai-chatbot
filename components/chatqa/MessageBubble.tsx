'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Code2, Eye, Zap, Clock, Cpu, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/lib/markdown-renderer';
import type { MessageBubbleProps } from '@/types/chatqa';

export function MessageBubble({ message, mode, onCopy }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const isUser = message.role === 'user';
  const isDev = mode === 'developer';

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const formattedTime = isDev
    ? new Date(message.createdAt).toLocaleString(undefined, {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : new Date(message.createdAt).toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit',
      });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' as const }}
      className={`group flex w-full flex-col ${isUser ? 'items-end' : 'items-start'}`}
    >
      {/* Message bubble */}
      <div
        className={`${
          isUser
            ? 'max-w-[80%] rounded-2xl bg-chatqa-user-bubble px-4 py-2.5 text-chatqa-user-bubble-text'
            : `w-full max-w-none ${isDev ? 'font-mono' : ''}`
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="max-w-none text-sm text-chatqa-text">
            <AnimatePresence mode="wait">
              {showRaw ? (
                <motion.pre
                  key="raw"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-pre-wrap font-mono text-xs text-chatqa-text-secondary bg-chatqa-code-bg rounded-lg p-4 border border-chatqa-border overflow-x-auto"
                >
                  {message.content}
                </motion.pre>
              ) : (
                <motion.div
                  key="rendered"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MarkdownRenderer content={message.content} devMode={isDev} />
                </motion.div>
              )}
            </AnimatePresence>
            {message.isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-chatqa-text" />
            )}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.attachments.map((attachment) => (
              <Badge
                key={attachment.id}
                variant="secondary"
                className="bg-chatqa-surface text-chatqa-text-secondary text-xs"
              >
                {attachment.fileName}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Developer mode: metadata bar for assistant messages */}
      {isDev && !isUser && !message.isStreaming && (
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] font-mono text-chatqa-muted">
          {message.model && (
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {message.model.includes('haiku') ? 'Haiku' : 'Sonnet'}
            </span>
          )}
          {message.dataSource && (
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {message.dataSource}
            </span>
          )}
          {message.tokensUsed != null && (
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {message.tokensUsed} tokens
            </span>
          )}
          {message.latencyMs != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {message.latencyMs}ms
            </span>
          )}
        </div>
      )}

      {/* Action bar + timestamp */}
      <div className={`mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Copy plain text */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-chatqa-muted hover:bg-chatqa-surface-hover hover:text-chatqa-text transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        {/* Developer mode extras for assistant messages */}
        {isDev && !isUser && (
          <>
            {/* Copy as Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-chatqa-muted hover:bg-chatqa-surface-hover hover:text-chatqa-text transition-colors"
            >
              {copiedMd ? <Check className="h-3 w-3 text-green-400" /> : <Code2 className="h-3 w-3" />}
              <span>{copiedMd ? 'Copied!' : 'Markdown'}</span>
            </button>

            {/* Raw / Rendered toggle */}
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                showRaw
                  ? 'text-chatqa-accent bg-chatqa-accent-subtle'
                  : 'text-chatqa-muted hover:bg-chatqa-surface-hover hover:text-chatqa-text'
              }`}
            >
              {showRaw ? <Eye className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
              <span>{showRaw ? 'Rendered' : 'Raw'}</span>
            </button>
          </>
        )}

        <span className="text-[10px] text-chatqa-muted">{formattedTime}</span>
      </div>
    </motion.div>
  );
}
