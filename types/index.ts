export type KanaRow =
  | 'a' | 'i' | 'u' | 'e' | 'o'
  | 'ka' | 'sa' | 'ta' | 'na' | 'ha' | 'ma' | 'ya' | 'ra' | 'wa' | 'n';

export type KanaKind = 'base' | 'dakuon' | 'handakuon' | 'youon';

export interface KanaChar {
  id: string;          // hiragana stable id like 'hira-a'
  char: string;        // the actual character
  romaji: string;      // 'a', 'ka', 'cha', etc.
  row: KanaRow;
  kind: KanaKind;
  mnemonic: string;    // short visualization mnemonic
  example: { word: string; reading: string; meaning: string };
  strokes: string[];   // SVG paths for each stroke, simplified
}

export interface Card {
  id: string;                     // KanaChar.id
  ease: number;                   // SM-2 ease factor, starts 2.5
  interval: number;               // days
  repetitions: number;            // consecutive correct
  due: number;                    // ms epoch
  lapses: number;
  lastReviewed: number | null;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  ts: number;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  ms: number;
  mode: ReviewMode;
}

export type ReviewMode = 'flashcards' | 'quiz' | 'listening' | 'speed' | 'memory' | 'boss';

export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  cardId: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
}

export interface LessonProgress {
  lessonId: string;
  stars: number;     // 0-3
  bestAccuracy: number;
  attempts: number;
  lastAttempt: number | null;
}

export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  progress: number;
  reward: number;
  completedAt: number | null;
  date: string;      // YYYY-MM-DD
}
