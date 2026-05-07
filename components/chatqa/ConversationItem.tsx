'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import type { Conversation } from '@/types/chatqa';
import { CONVERSATION_TITLE_MAX_LENGTH } from '@/lib/chatqa-constants';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(conversation.id, trimmed);
    } else {
      setRenameValue(conversation.title);
    }
    setIsRenaming(false);
  };

  return (
    <motion.div
      layoutId={`conversation-${conversation.id}`}
      onClick={() => !isRenaming && onSelect(conversation.id)}
      className={`group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 ${
        isActive
          ? 'bg-chatqa-accent/10 text-chatqa-text'
          : 'text-chatqa-secondary hover:bg-chatqa-surface hover:text-chatqa-text'
      }`}
    >
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) =>
              setRenameValue(e.target.value.slice(0, CONVERSATION_TITLE_MAX_LENGTH))
            }
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') {
                setRenameValue(conversation.title);
                setIsRenaming(false);
              }
            }}
            className="w-full rounded border border-chatqa-border bg-chatqa-bg px-1.5 py-0.5 text-sm text-chatqa-text outline-none focus:border-chatqa-accent"
          />
        ) : (
          <p className="truncate text-sm">{conversation.title}</p>
        )}
      </div>

      {!isRenaming && (
        <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenameValue(conversation.title);
              setIsRenaming(true);
            }}
            className="rounded p-1 text-chatqa-muted hover:bg-chatqa-border hover:text-chatqa-text"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conversation.id);
            }}
            className="rounded p-1 text-chatqa-muted hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
