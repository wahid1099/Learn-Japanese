'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/stores/useApp';
import { useAudio } from '@/components/audio/AudioProvider';
import { HIRAGANA, KATAKANA } from '@/lib/kana';
import { newCard } from '@/lib/srs';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface Props {
  script: 'hira' | 'kata';
  deck: 'due' | 'new';
}

export function FlashcardsRunner({ script, deck }: Props) {
  const cards = useApp(s => script === 'hira' ? s.cardsHira : s.cardsKata);
  const { grade } = useApp.getState();
  const { speak } = useAudio();
  const dataset = script === 'hira' ? HIRAGANA.chars : KATAKANA.chars;
  const [queue, setQueue] = useState(() => {
    if (deck === 'new') {
      const have = new Set(cards.map(c => c.id));
      return dataset.filter(c => !have.has(c.id)).slice(0, 10);
    }
    const due = cards.filter(c => c.due <= Date.now());
    return due.map(c => dataset.find(d => d.id === c.id)).filter(Boolean) as typeof dataset;
  });
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const cur = queue[i];

  if (!cur) {
    return (
      <div className="container py-16 text-center">
        <p className="text-sumi-500 dark:text-sumi-400">Nothing in this deck right now. Try "Learn new" or "Review".</p>
      </div>
    );
  }

  const onGrade = (q: 0|1|2|3|4|5) => {
    grade(cur.id, q, Date.now(), 'flashcards');
    if (q < 3) {
      // requeue at end
      setQueue(qq => [...qq, cur]);
      toast('Marked to revisit', 'info');
    } else {
      toast(`+${q * 2} XP`, 'success');
    }
    setRevealed(false);
    setI(idx => idx + 1);
  };

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ') { e.preventDefault(); setRevealed(r => !r); speak(cur.char, 'ja-JP'); }
      if (revealed && ['1','2','3','4'].includes(e.key)) {
        const map: Record<string, 0|1|2|3> = { '1':0,'2':1,'3':2,'4':3 };
        onGrade(map[e.key]!);
      }
      if (!revealed && e.key === 'Enter') setRevealed(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, cur]);

  if (i >= queue.length) {
    return (
      <div className="container py-12 text-center">
        <h2 className="font-display text-3xl">All done.</h2>
        <p className="mt-2 text-sumi-500">You reviewed {queue.length} cards in this session.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={() => location.reload()} variant="secondary">Run again</Button>
          <Button onClick={() => location.assign(`/learn/${script === 'hira' ? 'hiragana' : 'katakana'}`)}>Back to path</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center justify-between mb-3 text-sm text-sumi-500 dark:text-sumi-400">
        <span>Flashcards · {deck === 'new' ? 'New' : 'Review'}</span>
        <span>{Math.min(i, queue.length)} / {queue.length}</span>
      </div>
      <div className="h-1.5 rounded-full bg-sumi-200 dark:bg-sumi-800 overflow-hidden mb-6">
        <motion.div className="h-full bg-akane-500" initial={{ width: 0 }} animate={{ width: `${(i / queue.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={cur.id + i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-3xl border border-sumi-200/70 dark:border-sumi-700/70 bg-gradient-to-br from-kinari to-shiro-100 dark:from-sumi-900 dark:to-sumi-800 p-10 text-center shadow-ink"
        >
          <div className="font-jp text-7xl md:text-8xl leading-none">{cur.char}</div>
          <button onClick={() => speak(cur.char, 'ja-JP')} className="mt-4 inline-flex items-center gap-2 text-sm text-akane-600 hover:text-akane-700">
            <Volume2 className="w-4 h-4" /> Listen
          </button>
          {revealed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
              <p className="font-display text-3xl">{cur.romaji}</p>
              <p className="mt-2 text-sumi-500 dark:text-sumi-400 text-sm">{cur.example.word} — {cur.example.reading} — "{cur.example.meaning}"</p>
              <p className="mt-3 text-sm text-sumi-600 dark:text-sumi-300 italic">{cur.mnemonic}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {!revealed ? (
          <Button block size="lg" onClick={() => { setRevealed(true); speak(cur.char, 'ja-JP'); }}>Show answer</Button>
        ) : (
          <>
            <Button variant="secondary" size="lg" onClick={() => onGrade(2)}>Hard</Button>
            <Button variant="secondary" size="lg" onClick={() => onGrade(3)}>Good</Button>
            <Button variant="secondary" size="lg" onClick={() => onGrade(4)}>Easy</Button>
            <Button variant="danger" size="lg" onClick={() => onGrade(0)}>Missed</Button>
          </>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-sumi-500 dark:text-sumi-400">Space reveals · 1–4 grades · Enter continues</p>
    </div>
  );
}