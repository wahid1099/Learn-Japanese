'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          aria-modal="true" role="dialog"
        >
          <div className="absolute inset-0 bg-sumi-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`relative w-full ${maxWidth} rounded-2xl bg-kinari dark:bg-sumi-900 border border-sumi-200 dark:border-sumi-700 shadow-brush p-6`}
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full hover:bg-sumi-100 dark:hover:bg-sumi-800">
              <X className="w-4 h-4" />
            </button>
            {title && <h2 className="text-xl font-display pr-8">{title}</h2>}
            <div className="mt-3">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}