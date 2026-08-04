'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  char: string;
  size?: number;       // px
  animate?: boolean;
  className?: string;
  weight?: 400 | 500 | 700;
  /** When true, draws the character stroke by stroke using a moving gradient mask. */
  writing?: boolean;
}

// Approach: render the character twice. Top layer is a "shadow" of the final glyph.
// A sweeping mask reveals the writing, producing a feel of brush pen.
// If `writing` is true, the component re-runs the animation whenever `char` changes.
export function KanaGlyph({ char, size = 96, animate = true, className, weight = 700, writing = true }: Props) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!animate) return;
    setRun(r => r + 1);
  }, [char, animate]);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center font-jp select-none', className)}
      style={{ width: size, height: size, lineHeight: 1, fontWeight: weight, fontSize: size * 0.78 }}
    >
      {/* Ghost: faint full character */}
      <span aria-hidden className="absolute inset-0 grid place-items-center text-sumi-300/40 dark:text-sumi-700/60" style={{ fontSize: size * 0.78, lineHeight: 1 }}>
        {char}
      </span>
      {/* Animated reveal */}
      {writing ? (
        <motion.span
          key={`${char}-${run}`}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          aria-label={char}
          className="relative text-sumi-900 dark:text-shiro-100"
          style={{ fontSize: size * 0.78, lineHeight: 1 }}
        >
          {char}
        </motion.span>
      ) : (
        <span aria-label={char} className="relative text-sumi-900 dark:text-shiro-100" style={{ fontSize: size * 0.78, lineHeight: 1 }}>
          {char}
        </span>
      )}

      {/* Brush dot that travels with the reveal */}
      {writing && animate && (
        <motion.span
          key={`dot-${char}-${run}`}
          className="absolute top-0 bottom-0 w-[2px] bg-akane-500/80 shadow-[0_0_12px_rgba(240,48,59,0.6)]"
          initial={{ left: '0%' }}
          animate={{ left: '100%' }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          aria-hidden
        />
      )}
    </div>
  );
}