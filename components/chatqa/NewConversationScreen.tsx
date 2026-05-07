'use client';

import { motion } from 'framer-motion';
import type { Prompt } from '@/types/chatqa';
import { PromptCard } from './PromptCard';

interface NewConversationScreenProps {
  prompts: Prompt[];
  onSelectPrompt: (content: string) => void;
  onManagePrompts: () => void;
  onReorder?: (newOrder: string[]) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function NewConversationScreen({
  prompts,
  onSelectPrompt,
  onManagePrompts,
}: NewConversationScreenProps) {
  const displayPrompts = prompts.slice(0, 6);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-2xl flex-col items-center gap-8"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold text-chatqa-text">
            How can I help you today?
          </h1>
          <p className="text-sm text-chatqa-muted">
            Choose a prompt or start typing below
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid w-full grid-cols-2 gap-3 md:grid-cols-3"
        >
          {displayPrompts.map((prompt) => (
            <motion.div key={prompt.id} variants={itemVariants}>
              <PromptCard prompt={prompt} onSelect={onSelectPrompt} />
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="button"
          onClick={onManagePrompts}
          className="text-sm text-chatqa-text-secondary transition-colors hover:text-chatqa-accent"
        >
          Manage Prompts
        </motion.button>
      </motion.div>
    </div>
  );
}
