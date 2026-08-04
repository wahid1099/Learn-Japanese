'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Card, Achievement, LessonProgress, DailyQuest, ReviewLog } from '@/types';
import { HIRAGANA, KATAKANA } from '@/lib/kana';
import { newCard, review as sm2, newQueue, dueQueue } from '@/lib/srs';
import { todayKey } from '@/lib/utils';

interface State {
  cardsHira: Card[];
  cardsKata: Card[];
  xp: number;
  streak: number;
  lastStudyDay: string | null;
  achievements: Achievement[];
  quest: DailyQuest | null;
  logs: ReviewLog[];
  lessons: Record<string, LessonProgress>;
  theme: 'light' | 'dark' | 'system';
  sound: boolean;
  speech: 'ja-JP' | 'en-US';
}

interface Actions {
  initScript: (script: 'hira' | 'kata') => void;
  grade: (id: string, quality: 0|1|2|3|4|5, ms: number, mode: ReviewLog['mode']) => void;
  bumpXp: (delta: number) => void;
  ensureQuest: () => void;
  unlockAchievement: (id: string) => void;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  toggleSound: () => void;
  setSpeech: (s: 'ja-JP' | 'en-US') => void;
  getDue: (script: 'hira' | 'kata', limit?: number) => Card[];
  getNew: (script: 'hira' | 'kata', limit?: number) => Card[];
  resetProgress: () => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id:'first-step', title:'First Steps', description:'Complete your first review.', icon:'🌱', unlockedAt:null },
  { id:'hira-10',     title:'Hiragana Apprentice',  description:'Master 10 hiragana characters.', icon:'🌸', unlockedAt:null },
  { id:'hira-all',    title:'Hiragana Master',      description:'Master every hiragana character.', icon:'🎌', unlockedAt:null },
  { id:'kata-10',     title:'Katakana Apprentice',  description:'Master 10 katakana characters.', icon:'⭐', unlockedAt:null },
  { id:'kata-all',    title:'Katakana Master',      description:'Master every katakana character.', icon:'🏯', unlockedAt:null },
  { id:'streak-3',    title:'Three-Day Streak',     description:'Study three days in a row.', icon:'🔥', unlockedAt:null },
  { id:'streak-7',    title:'Week Warrior',         description:'Study seven days in a row.', icon:'🗓️', unlockedAt:null },
  { id:'xp-500',      title:'Century Plus',         description:'Earn 500 XP.', icon:'✨', unlockedAt:null },
  { id:'xp-2500',     title:'Oni Slayer',           description:'Earn 2,500 XP.', icon:'👹', unlockedAt:null },
  { id:'boss-1',      title:'Boss Breaker',         description:'Defeat your first boss battle.', icon:'🗡️', unlockedAt:null },
];

const initial: State = {
  cardsHira: [],
  cardsKata: [],
  xp: 0,
  streak: 0,
  lastStudyDay: null,
  achievements: INITIAL_ACHIEVEMENTS,
  quest: null,
  logs: [],
  lessons: {},
  theme: 'system',
  sound: true,
  speech: 'ja-JP',
};

export const useApp = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      initScript(script) {
        const dataset = script === 'hira' ? HIRAGANA.chars : KATAKANA.chars;
        const key = script === 'hira' ? 'cardsHira' : 'cardsKata';
        const existing = get()[key];
        if (existing.length >= dataset.length) return;
        // Add missing cards
        const have = new Set(existing.map(c => c.id));
        const additions = dataset.filter(c => !have.has(c.id)).map(newCard);
        if (additions.length) set({ [key]: existing.concat(additions) } as Partial<State>);
      },

      grade(id, quality, ms, mode) {
        const char = [...HIRAGANA.chars, ...KATAKANA.chars].find(c => c.id === id);
        if (!char) return;
        const list = char.id.startsWith('hira-') ? get().cardsHira : get().cardsKata;
        const idx = list.findIndex(c => c.id === id);
        if (idx < 0) return;
        const updated = sm2(list[idx], { quality });
        const next = list.slice();
        next[idx] = updated;
        const key = char.id.startsWith('hira-') ? 'cardsHira' : 'cardsKata';
        const logs = get().logs.concat([{ id: crypto.randomUUID(), cardId: id, ts: Date.now(), quality, ms, mode }]).slice(-2000);
        const xpDelta = quality >= 3 ? 10 + Math.round(quality * 2) : 2;
        const today = todayKey();
        let { streak, lastStudyDay } = get();
        if (lastStudyDay !== today) {
          const y = new Date(); y.setDate(y.getDate() - 1);
          const yKey = todayKey(y);
          streak = lastStudyDay === yKey ? streak + 1 : 1;
          lastStudyDay = today;
        }
        set({ [key]: next, logs, xp: get().xp + xpDelta, streak, lastStudyDay } as Partial<State>);
        get().ensureQuest();
        const totalReviews = get().logs.length;
        if (totalReviews === 1) get().unlockAchievement('first-step');
        if (get().xp >= 500) get().unlockAchievement('xp-500');
        if (get().xp >= 2500) get().unlockAchievement('xp-2500');
        if (get().streak >= 3) get().unlockAchievement('streak-3');
        if (get().streak >= 7) get().unlockAchievement('streak-7');
        const masteredHira = next.filter(c => c.repetitions >= 3 && c.interval >= 14 && char.id.startsWith('hira-')).length;
        const masteredKata = next.filter(c => c.repetitions >= 3 && c.interval >= 14 && char.id.startsWith('kata-')).length;
        if (masteredHira >= 10) get().unlockAchievement('hira-10');
        if (masteredKata >= 10) get().unlockAchievement('kata-10');
        if (masteredHira >= HIRAGANA.chars.length) get().unlockAchievement('hira-all');
        if (masteredKata >= KATAKANA.chars.length) get().unlockAchievement('kata-all');
      },

      bumpXp(delta) { set({ xp: get().xp + delta }); },

      ensureQuest() {
        const today = todayKey();
        const cur = get().quest;
        if (cur && cur.date === today) return;
        const pool = [
          { id: today + '-rev', title:'Review 10 cards', target:10, reward:50 },
          { id: today + '-acc', title:'Reach 90% accuracy', target:90, reward:75 },
          { id: today + '-new', title:'Learn 5 new characters', target:5, reward:60 },
        ];
        const pick = pool[Math.floor(Math.random() * pool.length)];
        set({ quest: { ...pick, date: today, progress: 0, completedAt: null } });
      },

      unlockAchievement(id) {
        const list = get().achievements;
        if (list.find(a => a.id === id)?.unlockedAt) return;
        const next = list.map(a => a.id === id ? { ...a, unlockedAt: Date.now() } : a);
        set({ achievements: next });
      },

      setTheme(t) {
        set({ theme: t });
        if (typeof document !== 'undefined') {
          const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          document.documentElement.classList.toggle('dark', isDark);
          try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
        }
      },

      toggleSound() { set({ sound: !get().sound }); },
      setSpeech(s) { set({ speech: s }); },

      getDue(script, limit = 20) {
        const list = script === 'hira' ? get().cardsHira : get().cardsKata;
        return dueQueue(list, limit);
      },

      getNew(script, limit = 20) {
        const dataset = script === 'hira' ? HIRAGANA.chars : KATAKANA.chars;
        const list = script === 'hira' ? get().cardsHira : get().cardsKata;
        return newQueue(list, dataset, limit);
      },

      resetProgress() {
        set({ ...initial, achievements: INITIAL_ACHIEVEMENTS });
      },
    }),
    {
      name: 'kanji-no-mori:v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
