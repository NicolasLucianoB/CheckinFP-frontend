'use client';

import { motion } from 'framer-motion';

export default function LoadingMessage({ text = 'Pelejando...' }: { text?: string }) {
  return (
    <motion.p
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.2, repeat: Infinity }}
      className="text-gray-500 text-sm"
    >
      {text}
    </motion.p>
  );
}