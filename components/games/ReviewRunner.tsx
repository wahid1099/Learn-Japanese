'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Volume2, Timer, Trophy, ArrowRight, Star } from 'lucide-react';
import { useApp } from '@/stores/useApp';
import { useReviewSession } from '@/components/games/useReviewSession';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { HIRAGANA, KATAKANA } from '@/lib/kana';
import { useAudio } from '@/components/audio/AudioProvider';
import { cn, shuffle } from '@/lib/utils';
import { confetti } from '@/lib/confetti';
import { toast } from '@/components/ui/Toast';

type Mode = 'flashcards' | 'quiz' | 'listening' | 'speed' | 'memory' | 'boss';

interface Props {
  mode: Mode;
  script: 'hira' | 'kata';
  deck: 'due' | 'new' | 'all';
}

export function ReviewRunner({ mode, script, deck }: Props) {
  const router = useRouter();
  const cards = useApp(s => script === 'hira' ? s.cardsHira : s.cardsKata);
  const { grade } = useApp.getState();
  const { speak } = useAudio();
  const dataset = script === 'hira' ? HIRAGANA.chars : KATAKANA.chars;

  const list = useMemo(() => {
    const now = Date.now();
    if (deck === 'new') {
      const have = new Set(cards.map(c => c.id));
      const fresh = dataset.filter(c => !have.has(c.id)).slice(0, 10).map(c => ({ id: c.id, ease: 2.5, interval: 0, repetitions: 0, lapses: 0, due: now, lastReviewed: null }));
      return fresh;
    }
    if (deck === 'due') {
      return cards.filter(c => c.due <= now).slice(0, 10);
    }
    return cards.slice(0, 10);
  }, [cards, dataset, deck]);

  if (list.length === 0) {
    return (
      <div className="container py-16 text-center">
        <p className="text-sumi-500 dark:text-sumi-400">No cards to review here yet. Try a different deck.</p>
        <div className="mt-4"><Button onClick={() => router.push(`/learn/${script === 'hira' ? 'hiragana' : 'katakana'}`)}>Back to {script === 'hira' ? 'Hiragana' : 'Katakana'}</Button></div>
      </div>
    );
  }

  return (
    <Inner mode={mode} script={script} cards={list} onGrade={(g) => { const grade_ = grade; grade_(g.cardId, g.quality, g.ms, mode); }} onSpeak={speak} />
  );
}

function Inner({ mode, script, cards, onGrade, onSpeak }: {
  mode: Mode;
  script: 'hira' | 'kata';
  cards: import('@/types').Card[];
  onGrade: (g: { cardId: string; quality: 0|1|2|3|4|5; ms: number }) => void;
  onSpeak: (text: string, lang?: 'ja-JP' | 'en-US') => void;
}) {
  const dataset = script === 'hira' ? HIRAGANA.chars : KATAKANA.chars;
  const { state, answer, restart, finished, totalAnswered } = useReviewSession(mode, script, cards);
  const [last, setLast] = useState<null | { correct: boolean; q: typeof state.questions[0] }>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Speak on question change for listening / memory modes
  useEffect(() => {
    if (finished) return;
    const char = dataset.find(d => d.id === state.questions[state.index].cardId)?.char;
    if (char && (mode === 'listening' || mode === 'memory')) onSpeak(char);
  }, [state.index, finished, mode, dataset, onSpeak, state.questions]);

  const speedTimer = mode === 'speed' || mode === 'boss';

  if (finished) {
    const pct = Math.round((state.correct / state.deck.length) * 100);
    const xp = state.correct * 8 + (pct >= 80 ? 50 : 0) + (streak >= 5 ? 30 : 0);
    return (
      <div className="container py-12 grid place-items-center text-center">
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}>
          <ProgressRing value={state.correct / state.deck.length} size={140} stroke={9} label={
            <div>
              <div className="text-3xl font-display">{pct}%</div>
              <div className="text-xs text-sumi-500 dark:text-sumi-400">correct</div>
            </div>
          } />
          <h2 className="font-display text-3xl mt-6">{pct >= 80 ? 'Wonderful work.' : pct >= 50 ? 'Solid effort.' : 'Keep going.'}</h2>
          <p className="mt-2 text-sumi-600 dark:text-sumi-300">+{xp} XP earned · Best streak {bestStreak}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="secondary" onClick={restart}>Try again</Button>
            <Button onClick={() => window.location.assign(`/learn/${script === 'hira' ? 'hiragana' : 'katakana'}`)} iconRight={<ArrowRight className="w-4 h-4" />}>Back to path</Button>
          </div>
        </motion.div>
        {pct >= 80 && (confetti(), true)}
      </div>
    );
  }

  const q = state.questions[state.index];
  const progress = (state.index) / state.deck.length;

  const pickAnswer = (i: number) => {
    setPicked(i);
    const res = answer(i);
    if (!res) return;
    onGrade({ cardId: res.cardId, quality: res.quality, ms: res.ms });
    if (res.correct) {
      setStreak(s => { const nx = s + 1; setBestStreak(b => Math.max(b, nx)); return nx; });
      toast(`+${mode === 'boss' ? 12 : 8} XP`, 'success');
    } else {
      setStreak(0);
      toast('Try again next time', 'error');
    }
    setLast({ correct: res.correct, q });
    window.setTimeout(() => { setLast(null); setPicked(null); }, 600);
  };

  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sora-100 dark:bg-sora-900/40 text-sora-700 dark:text-sora-200">
            {modeLabel(mode)}
          </span>
          <span className="text-sm text-sumi-500 dark:text-sumi-400">Card {state.index + 1} of {state.deck.length}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-akane-500/10 text-akane-700 dark:text-akane-300">
            <Star className="w-3.5 h-3.5" /> {streak}
          </span>
          {speedTimer && <CountdownTimer active resetKey={state.index} />}
        </div>
      </div>

      <div className="h-2 rounded-full bg-sumi-200 dark:bg-sumi-800 overflow-hidden mb-6">
        <motion.div className="h-full bg-gradient-to-r from-akane-500 to-sora-500" initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-sumi-200/60 dark:border-sumi-700/60 bg-gradient-to-br from-kinari via-shiro-50 to-shiro-100 dark:from-sumi-900 dark:via-sumi-900 dark:to-sumi-800 p-6 md:p-10 shadow-ink text-center"
        >
          <p className="text-xs uppercase font-semibold tracking-wider text-sumi-500 dark:text-sumi-400 mb-3">
            {mode === 'speed' || (mode === 'boss' && q.options[0].length > 1) ? 'Choose the character' : 'Choose the romaji'}
          </p>

          <div className="relative">
            <div className={cn('mx-auto grid place-items-center font-jp select-none',
              mode === 'listening' || mode === 'memory' ? 'text-5xl' : 'text-7xl md:text-8xl',
            )}>
              {mode === 'listening' || mode === 'memory' ? (
                <button onClick={() => onSpeak(q.prompt, 'ja-JP')} className="rounded-full w-28 h-28 grid place-items-center border-2 border-dashed border-akane-400 text-akane-500 hover:bg-akane-50 dark:hover:bg-akane-900/20" aria-label="Play sound">
                  <Volume2 className="w-12 h-12" />
                </button>
              ) : (
                <span>{q.prompt}</span>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <motion.button
                key={i}
                disabled={picked !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => pickAnswer(i)}
                className={cn(
                  'rounded-2xl border border-sumi-200 dark:border-sumi-700 bg-kinari dark:bg-sumi-900 px-4 py-4 text-lg md:text-xl font-display btn-press shadow-ink',
                  picked === null && 'hover:border-akane-400',
                  picked !== null && i === q.correctIndex && 'ring-2 ring-match-500 bg-match-50 dark:bg-match-900/20',
                  picked === i && !last?.correct && 'ring-2 ring-akane-500 bg-akane-50 dark:bg-akane-900/20'
                )}
              >
                {opt}
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {last && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className={cn('mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold',
                  last.correct ? 'text-match-700 dark:text-match-200 bg-match-100 dark:bg-match-900/30' : 'text-akane-700 dark:text-akane-200 bg-akane-100 dark:bg-akane-900/30')}
              >
                {last.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {last.correct ? 'Correct!' : 'Not quite.'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Footer action row */}
      <div className="mt-6 flex items-center justify-between text-sm text-sumi-500 dark:text-sumi-400">
        <span>{totalAnswered} answered</span>
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-sumi-100 dark:bg-sumi-800 text-sumi-700 dark:text-sumi-200">1–4</kbd> for quick keys</span>
      </div>
    </div>
  );
}

function CountdownTimer({ active, resetKey }: { active: boolean; resetKey: number }) {
  const [t, setT] = useState(8);
  useEffect(() => { setT(8); }, [resetKey]);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setT(s => Math.max(0, s - 0.1)), 100);
    return () => window.clearInterval(id);
  }, [active, resetKey]);
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono tabular-nums',
      t < 3 ? 'bg-akane-500/15 text-akane-600 dark:text-akane-300' : 'bg-sumi-100 dark:bg-sumi-800 text-sumi-700 dark:text-sumi-200')}>
      <Timer className="w-3.5 h-3.5" />
      {t.toFixed(1)}s
    </span>
  );
}

function modeLabel(m: Mode): string {
  switch (m) {
    case 'flashcards': return 'Flashcards';
    case 'quiz': return 'Quiz';
    case 'listening': return 'Listening';
    case 'speed': return 'Speed';
    case 'memory': return 'Memory';
    case 'boss': return 'Boss Battle';
  }
}