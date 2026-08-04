import Link from 'next/link';
import { BrainCircuit, Sword, Timer, Music, Sparkles, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Mini { href: string; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; accent: string; tag: string }

const MODES: Mini[] = [
  { href: '/learn/hiragana/review?mode=flashcards&deck=due', title: 'Hiragana Flashcards', subtitle: 'Calm, spaced-repetition review.', icon: Sparkles, accent: 'from-akane-400 to-akane-600', tag: 'Calm' },
  { href: '/learn/hiragana/review?mode=listening',         title: 'Listening',             subtitle: 'Hear it. Choose it.',         icon: Music,    accent: 'from-sora-400 to-sora-600',   tag: 'Audio' },
  { href: '/learn/hiragana/review?mode=quiz',              title: 'Quiz',                  subtitle: 'Character → romaji.',          icon: BrainCircuit, accent: 'from-match-400 to-match-600', tag: 'Classic' },
  { href: '/learn/hiragana/review?mode=speed',             title: 'Speed',                 subtitle: '8 seconds, 4 options.',        icon: Timer,    accent: 'from-akane-500 to-akane-700', tag: 'Fast' },
  { href: '/learn/hiragana/review?mode=memory',            title: 'Memory',                subtitle: 'Listen, then recall.',        icon: Layers,   accent: 'from-sora-500 to-sora-700',   tag: 'Audio' },
  { href: '/games/boss',                                    title: 'Boss Battle',           subtitle: 'Mixed characters under fire.', icon: Sword,   accent: 'from-sumi-700 to-sumi-900',   tag: 'Hard' },
];

export default function Page() {
  return (
    <div className="container py-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-akane-600 dark:text-akane-300">Game Library</p>
        <h1 className="font-display text-3xl md:text-4xl">Pick your flavor of practice</h1>
        <p className="mt-2 text-sumi-500 dark:text-sumi-400 text-sm">Different modalities help different memory pathways. Switch any time.</p>
      </header>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODES.map(m => (
          <Link key={m.href} href={m.href} className="block">
            <Card interactive className="h-full overflow-hidden">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.accent} text-white grid place-items-center shadow-ink`}>
                <m.icon className="w-6 h-6" />
              </div>
              <h3 className="mt-4 font-display text-xl">{m.title}</h3>
              <p className="mt-1 text-sm text-sumi-500 dark:text-sumi-400">{m.subtitle}</p>
              <div className="mt-3 text-[11px] uppercase tracking-wide text-akane-500">{m.tag}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}