'use client';
import { motion } from 'framer-motion';
import { Volume2, Sparkles, Play, Star } from 'lucide-react';
import type { KanaChar } from '@/types';
import { useAudio } from '@/components/audio/AudioProvider';
import { KanaGlyph } from '@/components/learn/KanaGlyph';
import { Button } from '@/components/ui/Button';

interface Props {
  char: KanaChar;
  onPractice?: () => void;
  onClose?: () => void;
}

export function KanaDetail({ char, onPractice }: Props) {
  const { speak } = useAudio();
  return (
    <motion.div
      key={char.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className="lg:sticky lg:top-20"
    >
      <div className="rounded-3xl border border-sumi-200/60 dark:border-sumi-700/60 bg-gradient-to-br from-kinari to-shiro-100 dark:from-sumi-900 dark:to-sumi-800 p-6 md:p-8 shadow-ink">
        <div className="flex items-center justify-center py-8 bg-[radial-gradient(rgba(28,24,19,0.06)_1px,transparent_1px)] [background-size:14px_14px] rounded-2xl">
          <KanaGlyph char={char.char} size={200} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <p className="text-xs uppercase font-semibold tracking-wider text-sumi-500 dark:text-sumi-400">{char.row} · {char.kind}</p>
            <h2 className="font-display text-4xl">{char.romaji}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" iconLeft={<Volume2 className="w-4 h-4" />} onClick={() => speak(char.char)}>Listen</Button>
            <Button size="sm" iconLeft={<Play className="w-4 h-4" />} onClick={() => { speak(char.char); onPractice?.(); }}>Practice</Button>
          </div>
        </div>

        <Section title="Mnemonic" icon={<Sparkles className="w-4 h-4" />}>
          {char.mnemonic}
        </Section>

        <Section title="Example" icon={<Star className="w-4 h-4" />}>
          <p className="text-base">
            <span className="font-jp">{char.example.word}</span>
            <span className="ml-2 text-sumi-500 dark:text-sumi-400">{char.example.reading}</span>
          </p>
          <p className="text-sm text-sumi-600 dark:text-sumi-300 mt-1">"{char.example.meaning}"</p>
        </Section>
      </div>
    </motion.div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-sumi-200/60 dark:border-sumi-700/60 pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-sumi-500 dark:text-sumi-400 flex items-center gap-1.5">{icon}{title}</h3>
      <div className="mt-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}