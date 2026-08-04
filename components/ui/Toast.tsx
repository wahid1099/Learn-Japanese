'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem { id: string; text: string; variant: ToastVariant; }

type Listener = (item: ToastItem) => void;
let subscribers: Listener | null = null;

export function toast(text: string, variant: ToastVariant = 'success') {
  const item: ToastItem = { id: Math.random().toString(36).slice(2), text, variant };
  subscribers?.(item);
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    subscribers = (item) => {
      setItems((cur) => [...cur, item]);
      window.setTimeout(() => setItems((cur) => cur.filter(t => t.id !== item.id)), 2400);
    };
    return () => { subscribers = null; };
  }, []);

  return (
    <div className="pointer-events-none fixed top-16 inset-x-0 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: -10, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="pointer-events-auto rounded-full border border-sumi-200 dark:border-sumi-700 bg-kinari dark:bg-sumi-900 shadow-ink px-4 py-2 flex items-center gap-2 text-sm"
          >
            {t.variant === 'success' && <CheckCircle2 className="w-4 h-4 text-match-500" />}
            {t.variant === 'error' && <XCircle className="w-4 h-4 text-akane-500" />}
            {t.variant === 'info' && <Sparkles className="w-4 h-4 text-sora-500" />}
            <span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}