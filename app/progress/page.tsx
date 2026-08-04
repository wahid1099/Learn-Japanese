'use client';
import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useApp } from '@/stores/useApp';
import { computeMastery } from '@/lib/srs';
import { HIRAGANA, KATAKANA } from '@/lib/kana';
import { Sparkles, Flame, Trophy } from 'lucide-react';
import { todayKey } from '@/lib/utils';

export default function ProgressPage() {
  const { cardsHira, cardsKata, logs, achievements, xp, streak } = useApp();

  const accuracy = useMemo(() => {
    if (logs.length === 0) return 0;
    const ok = logs.filter(l => l.quality >= 3).length;
    return ok / logs.length;
  }, [logs]);

  const retention = useMemo(() => {
    if (logs.length < 10) return 0;
    const recent = logs.slice(-30);
    const ok = recent.filter(l => l.quality >= 3).length;
    return ok / recent.length;
  }, [logs]);

  const avgSpeed = useMemo(() => {
    const recent = logs.slice(-30);
    if (recent.length === 0) return 0;
    return recent.reduce((s, l) => s + l.ms, 0) / recent.length;
  }, [logs]);

  const hiraMastery = computeMastery(cardsHira);
  const kataMastery = computeMastery(cardsKata);

  // Heatmap (last 12 weeks)
  const days = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of logs) {
      const k = todayKey(new Date(l.ts));
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    const out: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const k = todayKey(d);
      out.push({ date: k, count: map.get(k) ?? 0 });
    }
    return out;
  }, [logs]);

  const weak = useMemo(() => {
    const failures = new Map<string, number>();
    for (const l of logs.slice(-200)) if (l.quality < 3) failures.set(l.cardId, (failures.get(l.cardId) ?? 0) + 1);
    return [...failures.entries()].sort((a,b) => b[1] - a[1]).slice(0, 6).map(([id, count]) => {
      const c = [...HIRAGANA.chars, ...KATAKANA.chars].find(c => c.id === id);
      return { char: c, count };
    }).filter(x => x.char);
  }, [logs]);

  return (
    <div className="container py-8 space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-sora-600 dark:text-sora-300">Progress</p>
        <h1 className="font-display text-3xl md:text-4xl">Your journey, in numbers</h1>
      </header>

      <div className="grid lg:grid-cols-4 gap-4">
        <StatCard icon={<Flame className="w-4 h-4" />} label="Streak" value={`${streak} days`} sublabel="Keep it going" />
        <StatCard icon={<Sparkles className="w-4 h-4" />} label="XP" value={xp.toLocaleString()} sublabel="Lifetime" />
        <StatCard icon={<Trophy className="w-4 h-4" />} label="Accuracy" value={`${Math.round(accuracy * 100)}%`} sublabel="All time" />
        <StatCard icon={<Sparkles className="w-4 h-4" />} label="Avg. speed" value={`${(avgSpeed / 1000).toFixed(1)}s`} sublabel="Per card" />
      </div>

      <Card>
        <h2 className="font-display text-xl mb-3">Mastery</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <Mastery label="Hiragana" value={hiraMastery} count={cardsHira.length} total={HIRAGANA.chars.length} accent="text-akane-500" />
          <Mastery label="Katakana" value={kataMastery} count={cardsKata.length} total={KATAKANA.chars.length} accent="text-sora-500" />
          <Mastery label="Retention" value={retention} accent="text-match-500" hideCount />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl mb-3">Activity</h2>
        <div className="grid grid-cols-[repeat(12,1fr)] gap-1">
          {days.map((d, i) => (
            <div
              key={i}
              title={`${d.date} · ${d.count} reviews`}
              className="aspect-square rounded-[3px]"
              style={{ background: `rgba(240,48,59,${d.count === 0 ? 0.08 : Math.min(1, 0.2 + d.count * 0.18)})` }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 text-xs text-sumi-500 dark:text-sumi-400">
          <span>less</span>
          {[0.08, 0.3, 0.55, 0.8].map((a, i) => (
            <span key={i} className="inline-block w-3 h-3 rounded-[3px]" style={{ background: `rgba(240,48,59,${a})` }} />
          ))}
          <span>more</span>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-display text-xl mb-3">Needs attention</h2>
          {weak.length === 0 ? (
            <p className="text-sm text-sumi-500 dark:text-sumi-400">No weak spots yet — keep going!</p>
          ) : (
            <ul className="divide-y divide-sumi-200/60 dark:divide-sumi-700/60">
              {weak.map(w => (
                <li key={w.char!.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-jp text-2xl">{w.char!.char}</span>
                    <span className="text-sm text-sumi-500 dark:text-sumi-400">{w.char!.romaji}</span>
                  </div>
                  <span className="text-xs text-akane-600">{w.count} misses</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-display text-xl mb-3">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map(a => (
              <div key={a.id} className={`rounded-xl border p-3 ${a.unlockedAt ? 'border-akane-300 bg-akane-50 dark:bg-akane-900/20' : 'border-sumi-200/60 dark:border-sumi-700/60 opacity-70'}`}>
                <div className="text-2xl">{a.icon}</div>
                <p className="font-display text-sm mt-1">{a.title}</p>
                <p className="text-[11px] text-sumi-500 dark:text-sumi-400">{a.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel }: { icon: React.ReactNode; label: string; value: string; sublabel: string }) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-sumi-500 dark:text-sumi-400">{icon}{label}</div>
      <div className="mt-1 font-display text-2xl">{value}</div>
      <div className="text-xs text-sumi-500 dark:text-sumi-400">{sublabel}</div>
    </Card>
  );
}

function Mastery({ label, value, count, total, accent, hideCount }: { label: string; value: number; count?: number; total?: number; accent: string; hideCount?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <ProgressRing value={value} size={84} stroke={7} fillClass="stroke-current" trackClass="stroke-sumi-200 dark:stroke-sumi-700" label={<span className={`text-base font-display ${accent}`}>{Math.round(value * 100)}%</span>} />
      <div>
        <p className="text-xs uppercase tracking-wide text-sumi-500 dark:text-sumi-400">{label}</p>
        {!hideCount && count !== undefined && total !== undefined && (
          <p className="text-sm">{count} of {total} started</p>
        )}
      </div>
    </div>
  );
}