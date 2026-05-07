'use client';

import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoiceButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceButton({ isListening, isSupported, onStart, onStop }: VoiceButtonProps) {
  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  const handleMouseDown = () => {
    if (isSupported && !isListening) {
      onStart();
    }
  };

  const handleMouseUp = () => {
    if (isListening) {
      onStop();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
              onClick={handleClick}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              disabled={!isSupported}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                isListening
                  ? 'text-red-400 ring-2 ring-red-500/50 hover:bg-red-500/20'
                  : 'text-chatqa-text-secondary hover:text-chatqa-text hover:bg-chatqa-border/50'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              <motion.div
                animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={isListening ? { repeat: Infinity, duration: 1.2 } : {}}
              >
                <Mic className="h-4 w-4" />
              </motion.div>
        </TooltipTrigger>
        {!isSupported && (
          <TooltipContent side="top">
            <p>Voice input not supported in this browser</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
