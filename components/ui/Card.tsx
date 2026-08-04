'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  glow?: boolean;
  interactive?: boolean;
}

export function Card({ className, glow, interactive, children, ...rest }: CardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'rounded-2xl border bg-kinari dark:bg-sumi-900 border-sumi-200/70 dark:border-sumi-700/70 shadow-ink p-5',
        glow && 'shadow-glow',
        interactive && 'cursor-pointer',
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}