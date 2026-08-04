'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-akane-500 hover:bg-akane-600 text-white shadow-ink',
  secondary: 'bg-sumi-900 hover:bg-sumi-800 text-kinari dark:bg-kinari dark:text-sumi-900 dark:hover:bg-shiro-100',
  ghost: 'bg-transparent hover:bg-sumi-100 dark:hover:bg-sumi-800 text-sumi-700 dark:text-sumi-100',
  danger: 'bg-akane-600 hover:bg-akane-700 text-white',
  gold: 'bg-gradient-to-br from-akane-400 to-akane-600 text-white shadow-ink',
};

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-5 text-base rounded-xl gap-2',
  xl: 'h-14 px-7 text-lg rounded-2xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, iconLeft, iconRight, className, children, ...rest },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'inline-flex items-center justify-center font-semibold select-none disabled:opacity-50 disabled:cursor-not-allowed btn-press',
        VARIANT[variant],
        SIZE[size],
        block && 'w-full',
        className
      )}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </motion.button>
  );
});