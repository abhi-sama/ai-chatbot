'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { FailsafeIndicator } from './FailsafeIndicator';
import type {
  Message,
  ConnectionStatus,
  ChatMode,
  ExportFormat,
  ExportScope,
} from '@/types/chatqa';

interface ChatWindowProps {
  messages: Message[];
  isStreaming: boolean;
  connectionStatus: ConnectionStatus;
  mode: ChatMode;
  conversationTitle: string;
  onExport: (format: ExportFormat, scope: ExportScope) => void;
}

export function ChatWindow({
  messages,
  isStreaming,
  connectionStatus,
  mode,
  conversationTitle,
  onExport,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Render nothing when there are no messages (parent shows NewConversationScreen)
  if (messages.length === 0) return null;

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-chatqa-border px-4 py-3">
        <h2 className="text-sm font-medium text-chatqa-text truncate">
          {conversationTitle || 'New Conversation'}
        </h2>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-chatqa-text-secondary hover:bg-chatqa-surface hover:text-chatqa-text">
              <Download className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-chatqa-surface border-chatqa-border"
          >
            <DropdownMenuItem className="text-chatqa-text" onClick={() => onExport('pdf', 'full')}>
              Export Full Conversation as PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="text-chatqa-text" onClick={() => onExport('word', 'full')}>
              Export Full Conversation as Word
            </DropdownMenuItem>
            <DropdownMenuItem className="text-chatqa-text" onClick={() => onExport('pdf', 'assistant-only')}>
              Export Assistant Responses as PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="text-chatqa-text" onClick={() => onExport('word', 'assistant-only')}>
              Export Assistant Responses as Word
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages — native scroll */}
      <div className="flex-1 overflow-y-auto chatqa-scroll px-4 py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                mode={mode}
                onCopy={handleCopy}
              />
            ))}
          </AnimatePresence>

          {isStreaming && <TypingIndicator />}

          {connectionStatus === 'polling' && (
            <FailsafeIndicator status={connectionStatus} />
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
