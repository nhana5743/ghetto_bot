import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  isDarkMode?: boolean;
}

export function Modal({ isOpen, onClose, title, children, isDarkMode = false }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 backdrop-blur-sm z-[60] transition-colors ${isDarkMode ? 'bg-black/60' : 'bg-black/40'}`}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm rounded-[2rem] p-6 z-[70] shadow-2xl flex flex-col max-h-[80vh] transition-colors ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
              <button 
                onClick={onClose} 
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-[#2A2A2A] hover:bg-[#333333] text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar pr-2 -mr-2">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
