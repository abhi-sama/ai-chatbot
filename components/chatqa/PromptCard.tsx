'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { Prompt } from '@/types/chatqa';

interface PromptCardProps {
  prompt: Prompt;
  onSelect: (content: string) => void;
}

export function PromptCard({ prompt, onSelect }: PromptCardProps) {
  const IconComponent =
    (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[prompt.icon] ??
    LucideIcons.MessageSquare;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(prompt.content)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative flex flex-col gap-3 rounded-xl border border-chatqa-border bg-transparent p-5 text-left transition-colors duration-200 hover:border-chatqa-accent hover:shadow-md hover:shadow-chatqa-accent/10"
    >
      <IconComponent className="h-5 w-5 text-chatqa-accent" />

      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-chatqa-primary">
          {prompt.title}
        </span>
        <span className="line-clamp-2 text-xs text-chatqa-muted">
          {prompt.description}
        </span>
      </div>
    </motion.button>
  );
}
