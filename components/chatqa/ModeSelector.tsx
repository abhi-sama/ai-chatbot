'use client';

import { MessageSquare, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ChatMode } from '@/types/chatqa';

interface ModeSelectorProps {
  value: ChatMode;
  onChange: (mode: ChatMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const toggle = () => {
    onChange(value === 'assistant' ? 'developer' : 'assistant');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
            onClick={toggle}
            className="relative flex h-7 items-center rounded-lg border border-chatqa-border bg-chatqa-bg/50 p-0.5"
          >
            <div
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                value === 'assistant' ? 'text-white' : 'text-chatqa-text-muted'
              }`}
            >
              {value === 'assistant' && (
                <motion.div
                  layoutId="mode-active"
                  className="absolute inset-0 rounded-md bg-chatqa-accent"
                  transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                />
              )}
              <MessageSquare className="relative z-10 h-3.5 w-3.5" />
            </div>
            <div
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                value === 'developer' ? 'text-white' : 'text-chatqa-text-muted'
              }`}
            >
              {value === 'developer' && (
                <motion.div
                  layoutId="mode-active"
                  className="absolute inset-0 rounded-md bg-chatqa-accent"
                  transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                />
              )}
              <Code className="relative z-10 h-3.5 w-3.5" />
            </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{value === 'assistant' ? 'Assistant Mode' : 'Developer Mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
