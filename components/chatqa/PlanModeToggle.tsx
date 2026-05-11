'use client';

import { ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PlanModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function PlanModeToggle({ enabled, onChange }: PlanModeToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={() => onChange(!enabled)}
          className={`relative flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
            enabled
              ? 'border-chatqa-accent/40 bg-chatqa-accent/10 text-chatqa-accent'
              : 'border-chatqa-border bg-chatqa-bg/50 text-chatqa-text-muted hover:text-chatqa-text-secondary'
          }`}
        >
          {enabled && (
            <motion.div
              layoutId="plan-mode-bg"
              className="absolute inset-0 rounded-lg bg-chatqa-accent/10"
              initial={false}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
            />
          )}
          <ListChecks className="relative z-10 h-3.5 w-3.5" />
          <span className="relative z-10">Plan</span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{enabled ? 'Plan mode on — AI will outline steps before acting' : 'Enable plan mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
