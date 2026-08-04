import type { Card, KanaChar } from '@/types';

// SM-2 algorithm adapted for self-paced recall (0=blackout, 5=perfect)
export interface SrsInput { quality: 0|1|2|3|4|5; }
export function review(card: Card, input: SrsInput): Card {
  const q = input.quality;
  let { ease, interval, repetitions, lapses } = card;
  if (q < 3) {
    repetitions = 0;
    interval = 1;
    lapses += 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else interval = Math.round(interval * ease);
  }
  // Update ease — clamp
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  return {
    ...card,
    ease: Math.round(ease * 100) / 100,
    interval,
    repetitions,
    lapses,
    due: Date.now() + interval * 24 * 60 * 60 * 1000,
    lastReviewed: Date.now(),
  };
}

export function newCard(char: KanaChar): Card {
  return {
    id: char.id,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    lapses: 0,
    due: Date.now(),
    lastReviewed: null,
  };
}

export function dueQueue(cards: Card[], limit = 20): Card[] {
  const now = Date.now();
  return cards
    .filter(c => c.due <= now)
    .sort((a, b) => a.due - b.due)
    .slice(0, limit);
}

export function newQueue(cards: Card[], chars: KanaChar[], limit = 20): Card[] {
  const have = new Set(cards.map(c => c.id));
  const fresh = chars.filter(c => !have.has(c.id)).slice(0, limit);
  return fresh.map(newCard);
}

export function computeMastery(cards: Card[]): number {
  if (cards.length === 0) return 0;
  const mature = cards.filter(c => c.interval >= 21 && c.lapses < 3).length;
  const young  = cards.filter(c => c.repetitions >= 1 && c.interval < 21).length;
  const score = mature * 1 + young * 0.5;
  return Math.min(1, score / cards.length);
}