'use client';

import { motion } from 'framer-motion';

const dotVariants = {
  initial: { y: 0 },
  animate: { y: -4 },
};

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-chatqa-muted"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.4,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}
