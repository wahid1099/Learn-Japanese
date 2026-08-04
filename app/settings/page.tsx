'use client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/stores/useApp';
import { useState } from 'react';
import { toast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { theme, setTheme, sound, toggleSound, speech, setSpeech, resetProgress, logs, cardsHira, cardsKata, achievements } = useApp();
  const [confirm, setConfirm] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ logs, cardsHira, cardsKata, achievements, theme, speech }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kanji-no-mori-progress.json'; a.click();
    URL.revokeObjectURL(url);
    toast('Export ready', 'success');
  };

  return (
    <div className="container py-8 max-w-2xl space-y-4">
      <h1 className="font-display text-3xl">Settings</h1>

      <Card>
        <h2 className="font-display text-lg">Appearance</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['light','dark','system'] as const).map(t => (
            <button key={t} onClick={() => setTheme(t)} aria-pressed={theme === t}
              className={`px-3 py-1.5 rounded-lg border text-sm ${theme === t ? 'border-akane-400 bg-akane-50 dark:bg-akane-900/20 text-akane-700 dark:text-akane-200' : 'border-sumi-200 dark:border-sumi-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg">Audio</h2>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sound effects</p>
            <p className="text-xs text-sumi-500 dark:text-sumi-400">Click & answer cues.</p>
          </div>
          <button onClick={toggleSound} aria-pressed={!sound} className={`px-3 py-1.5 rounded-lg border text-sm ${!sound ? 'border-akane-400 bg-akane-50 dark:bg-akane-900/20' : 'border-sumi-200 dark:border-sumi-700'}`}>{sound ? 'On' : 'Off'}</button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Voice language</p>
            <p className="text-xs text-sumi-500 dark:text-sumi-400">For pronunciation playback.</p>
          </div>
          <select value={speech} onChange={e => setSpeech(e.target.value as 'ja-JP' | 'en-US')} className="text-sm rounded-lg border-sumi-200 dark:border-sumi-700 bg-kinari dark:bg-sumi-900 border px-2 py-1.5">
            <option value="ja-JP">Japanese (ja-JP)</option>
            <option value="en-US">English (en-US)</option>
          </select>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg">Data</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={exportData}>Export progress JSON</Button>
          {!confirm ? (
            <Button variant="danger" onClick={() => setConfirm(true)}>Reset progress</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => { resetProgress(); toast('Progress reset','info'); }}>Confirm reset</Button>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg">About</h2>
        <p className="mt-2 text-sm text-sumi-600 dark:text-sumi-300">
          Kanji no Mori — a focused, ad-free Japanese learning experience built with Next.js, Tailwind, Framer Motion, and the SM-2 spaced repetition algorithm.
        </p>
      </Card>
    </div>
  );
}