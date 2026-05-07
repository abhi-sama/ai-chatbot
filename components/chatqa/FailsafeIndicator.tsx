'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { ConnectionStatus } from '@/types/chatqa';

interface FailsafeIndicatorProps {
  status: ConnectionStatus;
}

export function FailsafeIndicator({ status }: FailsafeIndicatorProps) {
  if (status !== 'polling') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-center gap-2 rounded-md border border-chatqa-border bg-chatqa-surface px-3 py-1.5"
    >
      <Loader2 className="h-3.5 w-3.5 animate-spin text-chatqa-secondary" />
      <span className="text-xs text-chatqa-secondary">Still thinking...</span>
    </motion.div>
  );
}
