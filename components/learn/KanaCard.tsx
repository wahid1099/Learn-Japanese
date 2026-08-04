'use client';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import type { KanaChar } from '@/types';
import { useAudio } from '@/components/audio/AudioProvider';
import { cn } from '@/lib/utils';

interface Props {
  char: KanaChar;
  size?: 'sm' | 'md' | 'lg';
  mastered?: boolean;
  onClick?: () => void;
}

export function KanaCard({ char, size = 'md', mastered, onClick }: Props) {
  const { speak } = useAudio();
  const sizes = {
    sm: 'w-14 h-16 text-2xl',
    md: 'w-20 h-24 text-4xl',
    lg: 'w-28 h-32 text-5xl',
  };
  return (
    <motion.button
      type="button"
      onClick={() => {
        speak(char.char);
        onClick?.();
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'group relative rounded-2xl border bg-kinari dark:bg-sumi-900 border-sumi-200 dark:border-sumi-700 shadow-ink flex flex-col items-center justify-center font-jp btn-press',
        sizes[size],
        mastered && 'ring-2 ring-match-400/70'
      )}
      aria-label={`${char.romaji} ${char.char}`}
    >
      <span className="leading-none">{char.char}</span>
      <span className="absolute bottom-1 text-[10px] font-sans text-sumi-500 dark:text-sumi-400">{char.romaji}</span>
      <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-akane-500">
        <Volume2 className="w-3.5 h-3.5" />
      </span>
      {mastered && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-match-500 text-white text-[10px] grid place-items-center shadow">✓</span>
      )}
    </motion.button>
  );
}