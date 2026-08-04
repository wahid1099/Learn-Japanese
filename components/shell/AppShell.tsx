'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Settings, Trophy, Home, BookOpen, Headphones } from 'lucide-react';
import { useApp } from '@/stores/useApp';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ToastHost } from '@/components/ui/Toast';

const NAV = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/learn/hiragana', label: 'Hiragana', icon: BookOpen },
  { href: '/learn/katakana', label: 'Katakana', icon: BookOpen },
  { href: '/games', label: 'Games', icon: Headphones },
  { href: '/progress', label: 'Progress', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { xp, streak, theme, setTheme } = useApp();
  useEffect(() => { setMounted(true); }, []);

  // Re-apply theme on mount in case persisted value differs from OS preference.
  useEffect(() => {
    if (!mounted) return;
    setTheme(theme);
  }, [mounted, theme, setTheme]);

  const isDark = mounted && (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches));

  return (
    <div className="min-h-dvh flex flex-col">
      <Header xp={xp} streak={streak} isDark={!!isDark} theme={theme} setTheme={setTheme} pathname={pathname ?? '/'} />

      <main className="flex-1 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <nav aria-label="Primary" className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-sumi-200/60 dark:border-sumi-700/60 bg-kinari/90 dark:bg-sumi-900/90 backdrop-blur-md">
        <ul className="grid grid-cols-6 px-2 py-1.5">
          {NAV.map(n => {
            const active = pathname === n.href || (n.href !== '/' && pathname?.startsWith(n.href));
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium rounded-lg btn-press',
                    active ? 'text-akane-600 dark:text-akane-300' : 'text-sumi-500 dark:text-sumi-300'
                  )}
                >
                  <n.icon className="w-5 h-5" />
                  <span>{n.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Footer />
      <ToastHost />
    </div>
  );
}

function Header({ xp, streak, isDark, theme, setTheme, pathname }: {
  xp: number; streak: number; isDark: boolean; theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  pathname: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-sumi-200/60 dark:border-sumi-700/60 bg-kinari/80 dark:bg-sumi-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group" aria-label="Kanji no Mori home">
          <span className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-akane-500 text-white font-display text-lg shadow-ink group-hover:rotate-[-6deg] transition-transform">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="font-display text-lg leading-none">Kanji no Mori</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-1 ml-4 text-sm">
          {NAV.map(n => {
            const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'px-3 py-1.5 rounded-full transition-colors',
                  active ? 'bg-sumi-900 text-kinari dark:bg-kinari dark:text-sumi-900' : 'hover:bg-sumi-100 dark:hover:bg-sumi-800 text-sumi-600 dark:text-sumi-200'
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/progress" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-match-100 text-match-800 dark:bg-match-900/40 dark:text-match-200 text-sm font-medium" aria-label={`Streak ${streak} days`}>
            <Flame className="w-4 h-4 text-akane-500" aria-hidden />
            <span>{streak}</span>
          </Link>
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sora-100 text-sora-700 dark:bg-sora-900/40 dark:text-sora-200 text-sm font-medium" aria-label={`${xp} XP`}>
            <Sparkles className="w-4 h-4" aria-hidden />
            <span>{xp} XP</span>
          </span>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
            className="btn-press w-9 h-9 rounded-full border border-sumi-200 dark:border-sumi-700 flex items-center justify-center hover:bg-sumi-100 dark:hover:bg-sumi-800"
          >
            {isDark ? '☀' : '☾'}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="hidden md:block border-t border-sumi-200/60 dark:border-sumi-700/60 py-6 text-center text-xs text-sumi-500 dark:text-sumi-400">
      <p>
        Crafted with care for Japanese learners · Built with Next.js, Tailwind, and Framer Motion.
      </p>
    </footer>
  );
}