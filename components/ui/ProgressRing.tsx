'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RingProps {
  value: number;          // 0..1
  size?: number;
  stroke?: number;
  className?: string;
  label?: React.ReactNode;
  trackClass?: string;
  fillClass?: string;
}

export function ProgressRing({ value, size = 96, stroke = 8, className, label, trackClass, fillClass }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} className={cn('fill-none', trackClass ?? 'stroke-sumi-200 dark:stroke-sumi-700')} />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn('fill-none -rotate-90 origin-center', fillClass ?? 'stroke-akane-500')}
          style={{ strokeDasharray: c }}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * clamped }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-sumi-900 dark:text-shiro-100">
        {label}
      </div>
    </div>
  );
}