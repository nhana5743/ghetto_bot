import { motion, AnimatePresence } from 'motion/react';

export function Toast({ message, visible, isDarkMode = false }: { message: string, visible: boolean, isDarkMode?: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-full font-semibold text-sm whitespace-nowrap shadow-xl transition-all ${isDarkMode ? 'bg-[#2A2A2A] text-white border border-[#333333]' : 'bg-[#131313] text-white'}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
