'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { KanaCard } from './KanaCard';
import { KanaDetail } from './KanaDetail';
import type { KanaChar, KanaKind } from '@/types';
import { flattenFor, HIRAGANA, KATAKANA } from '@/lib/kana';
import { useApp } from '@/stores/useApp';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEffect } from 'react';

const KINDS: { id: KanaKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'base', label: 'Base' },
  { id: 'dakuon', label: 'Dakuon' },
  { id: 'handakuon', label: 'Handakuon' },
  { id: 'youon', label: 'Combo' },
];

const ROWS: { id: string; label: string }[] = [
  { id: 'all', label: 'All rows' },
  { id: 'a', label: 'a' }, { id: 'ka', label: 'ka' }, { id: 'sa', label: 'sa' }, { id: 'ta', label: 'ta' },
  { id: 'na', label: 'na' }, { id: 'ha', label: 'ha' }, { id: 'ma', label: 'ma' }, { id: 'ya', label: 'ya' },
  { id: 'ra', label: 'ra' }, { id: 'wa', label: 'wa' }, { id: 'n', label: 'n' },
];

interface Props {
  script: 'hira' | 'kata';
  basePath: string;
}

export function KanaLearnScreen({ script, basePath }: Props) {
  const all = flattenFor(script);
  const [kind, setKind] = useState<KanaKind | 'all'>('base');
  const [row, setRow] = useState('all');
  const [selected, setSelected] = useState<KanaChar>(all[0] ?? HIRAGANA.chars[0]);
  const [search, setSearch] = useState('');
  const cards = useApp(s => script === 'hira' ? s.cardsHira : s.cardsKata);
  const initScript = useApp(s => s.initScript);
  const ensureQuest = useApp(s => s.ensureQuest);
  const getNew = useApp(s => s.getNew);
  const getDue = useApp(s => s.getDue);

  useEffect(() => { initScript(script); ensureQuest(); }, [initScript, ensureQuest, script]);

  const mastered = useMemo(() => new Set(cards.filter(c => c.repetitions >= 3 && c.interval >= 14).map(c => c.id)), [cards]);

  const list = useMemo(() => {
    return all.filter(c =>
      (kind === 'all' || c.kind === kind) &&
      (row === 'all' || c.row === row) &&
      (search === '' || c.romaji.includes(search.toLowerCase()))
    );
  }, [all, kind, row, search]);

  const fresh = getNew(script, 10);
  const due = getDue(script, 10);

  return (
    <div className="container py-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase font-semibold tracking-wider text-sora-600 dark:text-sora-300">{script === 'hira' ? 'Hiragana' : 'Katakana'}</p>
          <h1 className="font-display text-3xl md:text-4xl">{script === 'hira' ? 'Hiragana Path' : 'Katakana Path'}</h1>
          <p className="text-sumi-500 dark:text-sumi-400 text-sm mt-1">Tap any character to reveal its story, mnemonic and audio.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`${basePath}/review?mode=flashcards`}>
            <Button iconLeft={<Play className="w-4 h-4" />} variant="primary">Start review ({due.length})</Button>
          </Link>
          <Link href={`${basePath}/review?mode=flashcards&deck=new`}>
            <Button iconLeft={<Play className="w-4 h-4" />} variant="secondary">Learn new ({fresh.length})</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <section>
          <div className="rounded-2xl border border-sumi-200/60 dark:border-sumi-700/60 bg-kinari dark:bg-sumi-900 p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <label className="text-xs text-sumi-500 dark:text-sumi-400">Filter</label>
              <ChipGroup
                options={KINDS}
                value={kind}
                onChange={(v) => setKind(v as KanaKind | 'all')}
              />
              <div className="ml-auto flex items-center gap-2">
                <select
                  className="text-sm rounded-lg border-sumi-200 dark:border-sumi-700 bg-kinari dark:bg-sumi-900 border px-2 py-1.5"
                  value={row}
                  onChange={(e) => setRow(e.target.value)}
                  aria-label="Row filter"
                >
                  {ROWS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="romaji…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-sm rounded-lg border-sumi-200 dark:border-sumi-700 bg-kinari dark:bg-sumi-900 border px-3 py-1.5 w-28"
                  aria-label="Search by romaji"
                />
              </div>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10 gap-2">
              {list.map(c => (
                <KanaCard key={c.id} char={c} mastered={mastered.has(c.id)} onClick={() => setSelected(c)} />
              ))}
              {list.length === 0 && (
                <div className="col-span-full text-center text-sm text-sumi-500 dark:text-sumi-400 py-6">No characters match those filters.</div>
              )}
            </div>
          </div>
        </section>

        <aside>
          <AnimatePresence mode="wait">
            <KanaDetail key={selected.id} char={selected} onPractice={() => {}} />
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

function ChipGroup({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-sumi-100 dark:bg-sumi-800">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={cn(
            'text-xs px-2.5 py-1 rounded-md transition-colors',
            value === o.id ? 'bg-kinari dark:bg-sumi-900 shadow-ink font-semibold' : 'text-sumi-600 dark:text-sumi-300 hover:text-sumi-900 dark:hover:text-shiro-100'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Lazy Link to avoid pulling next/link into a too-narrow node module map
import Link from 'next/link';
