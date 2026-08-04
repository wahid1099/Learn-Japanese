'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Sparkles, BookOpen, Headphones, BrainCircuit, Sword } from 'lucide-react';
import { useEffect } from 'react';
import { useApp } from '@/stores/useApp';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { HIRAGANA, KATAKANA } from '@/lib/kana';
import { computeMastery } from '@/lib/srs';
import { todayKey } from '@/lib/utils';

export default function HomePage() {
  const { cardsHira, cardsKata, xp, streak, lastStudyDay, ensureQuest, quest, achievements } = useApp();
  useEffect(() => { ensureQuest(); }, [ensureQuest]);

  const hiraMastery = computeMastery(cardsHira);
  const kataMastery = computeMastery(cardsKata);
  const overall = (hiraMastery + kataMastery) / 2;
  const unlocked = achievements.filter(a => a.unlockedAt).length;
  const dailyProgress = quest ? Math.min(1, quest.progress / quest.target) : 0;

  const today = todayKey();
  const studiedToday = lastStudyDay === today;

  return (
    <div className="container py-6 md:py-10">
      {/* Hero */}
      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-sumi-200/60 dark:border-sumi-700/60 bg-gradient-to-br from-akane-50 via-kinari to-sora-50 dark:from-sumi-900 dark:via-sumi-900 dark:to-sumi-800 p-6 md:p-10 shadow-ink"
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-akane-200/40 dark:bg-akane-700/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-sora-200/40 dark:bg-sora-800/30 blur-3xl pointer-events-none" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-akane-500/10 text-akane-700 dark:text-akane-300 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Kanji no Mori
            </span>
            <h1 className="mt-3 font-display text-3xl md:text-5xl leading-tight">
              {studiedToday ? 'Welcome back.' : 'Begin your journey.'}
              <br />
              <span className="brush-underline">Learn Japanese, beautifully.</span>
            </h1>
            <p className="mt-4 max-w-prose text-sumi-600 dark:text-sumi-200">
              A serene, focused path through Hiragana, Katakana, and beyond — built with a memory science
              engine so every minute you spend here actually sticks.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={hiraMastery < 0.05 ? '/learn/hiragana' : '/games'}>
                <Button size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                  {hiraMastery < 0.05 ? 'Start with Hiragana' : 'Continue practicing'}
                </Button>
              </Link>
              <Link href="/games/boss">
                <Button size="lg" variant="secondary" iconLeft={<Sword className="w-4 h-4" />}>
                  Daily Boss Battle
                </Button>
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 max-w-md">
              <Stat icon={<Flame className="w-4 h-4" />} label="Streak" value={`${streak}d`} />
              <Stat icon={<Sparkles className="w-4 h-4" />} label="XP" value={xp.toLocaleString()} />
              <Stat icon={<Sparkles className="w-4 h-4" />} label="Badges" value={`${unlocked}/${achievements.length}`} />
            </div>
          </div>
        </motion.div>

        {/* Daily quest card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <Card className="h-full flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sora-600 dark:text-sora-300">Today's Quest</p>
                <h3 className="font-display text-xl mt-1">{quest?.title ?? 'Loading…'}</h3>
              </div>
              <ProgressRing value={dailyProgress} size={72} stroke={6} label={
                <span className="text-sm font-semibold">{Math.round(dailyProgress * 100)}%</span>
              } />
            </div>
            <p className="mt-3 text-sumi-600 dark:text-sumi-200 text-sm">
              {quest ? `${quest.progress} / ${quest.target} · Reward ${quest.reward} XP` : ''}
            </p>
            <div className="mt-auto pt-5">
              <Link href="/learn/hiragana"><Button block>Open study</Button></Link>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Mastery map */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-2xl">Your path</h2>
            <p className="text-sumi-500 dark:text-sumi-400 text-sm">Tap a level to begin. Levels unlock as you progress.</p>
          </div>
          <span className="text-sm text-sumi-500 dark:text-sumi-400">{Math.round(overall * 100)}% overall mastery</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PathCard
            href="/learn/hiragana"
            title="Hiragana"
            subtitle="The cursive alphabet — 46 base + variations"
            mastery={hiraMastery}
            count={HIRAGANA.chars.length}
            learned={cardsHira.length}
            accent="bg-akane-500"
          />
          <PathCard
            href="/learn/katakana"
            title="Katakana"
            subtitle="The angular alphabet — for foreign words"
            mastery={kataMastery}
            count={KATAKANA.chars.length}
            learned={cardsKata.length}
            accent="bg-sora-500"
          />
          <LockedCard
            title="Vocabulary & Grammar"
            subtitle="Greetings · Numbers · Time · Particles"
            icon={<BookOpen className="w-5 h-5" />}
            note="Unlocks after Hiragana mastery"
          />
          <LockedCard
            title="Conversations"
            subtitle="Real-world phrases with audio"
            icon={<Headphones className="w-5 h-5" />}
            note="Unlocks after Katakana mastery"
          />
          <LockedCard
            title="AI Tutor"
            subtitle="Personal explanations in plain English"
            icon={<BrainCircuit className="w-5 h-5" />}
            note="Coming soon"
          />
          <LockedCard
            title="Mini-games"
            subtitle="Speed run · Memory · Boss battle"
            icon={<Sword className="w-5 h-5" />}
            note="Available now"
            href="/games"
            unlocked
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sumi-200/60 dark:border-sumi-700/60 bg-kinari/70 dark:bg-sumi-900/70 backdrop-blur px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-sumi-500 dark:text-sumi-400 uppercase tracking-wide">{icon}{label}</div>
      <div className="mt-0.5 text-lg font-display">{value}</div>
    </div>
  );
}

function PathCard({ href, title, subtitle, mastery, count, learned, accent }: {
  href: string; title: string; subtitle: string; mastery: number; count: number; learned: number; accent: string;
}) {
  return (
    <Link href={href} aria-label={`Open ${title}`}>
      <Card interactive className="h-full">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={learned / count}
            size={64}
            stroke={6}
            fillClass="stroke-akane-500"
            label={<span className="text-[10px] font-semibold">{Math.round((learned/count)*100)}%</span>}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${accent}`} aria-hidden />
              <h3 className="font-display text-lg leading-none">{title}</h3>
            </div>
            <p className="mt-1 text-sm text-sumi-500 dark:text-sumi-400">{subtitle}</p>
          </div>
        </div>
        <div className="mt-4 text-xs text-sumi-500 dark:text-sumi-400">
          {learned} of {count} started · {Math.round(mastery * 100)}% mastery
        </div>
      </Card>
    </Link>
  );
}

function LockedCard({ title, subtitle, icon, note, href, unlocked }: {
  title: string; subtitle: string; icon: React.ReactNode; note: string; href?: string; unlocked?: boolean;
}) {
  const body = (
    <Card interactive={!!unlocked} className={`h-full ${unlocked ? '' : 'opacity-80'}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 grid place-items-center rounded-xl bg-sumi-100 dark:bg-sumi-800 text-sumi-500 dark:text-sumi-300">
          {icon}
        </div>
        <div>
          <h3 className="font-display text-base">{title}</h3>
          <p className="text-xs text-sumi-500 dark:text-sumi-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 text-[11px] uppercase tracking-wide text-sumi-400 dark:text-sumi-500">{note}</div>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}