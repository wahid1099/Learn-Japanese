'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Card, KanaChar, ReviewMode, QuizQuestion } from '@/types';
import { flattenFor } from '@/lib/kana';
import { pick, shuffle } from '@/lib/utils';
import { newCard } from '@/lib/srs';

export interface SessionState {
  mode: ReviewMode;
  script: 'hira' | 'kata';
  deck: Card[];
  chars: KanaChar[];
  /** current index in deck (0..deck.length) */
  index: number;
  correct: number;
  incorrect: number;
  startedAt: number;
  questionStart: number;
  questions: QuizQuestion[];
}

export function buildQuestions(mode: ReviewMode, chars: KanaChar[], char: KanaChar): QuizQuestion {
  const pool = chars.filter(c => c.id !== char.id);
  const distractors = shuffle(pool).slice(0, 3);
  let q: QuizQuestion;
  switch (mode) {
    case 'listening':
    case 'flashcards': {
      q = { prompt: char.char, options: shuffle([char, ...distractors]).map(c => c.romaji), correctIndex: 0, cardId: char.id };
      q.correctIndex = q.options.indexOf(char.romaji);
      break;
    }
    case 'quiz': {
      q = { prompt: char.char, options: shuffle([char, ...distractors]).map(c => c.romaji), correctIndex: 0, cardId: char.id };
      q.correctIndex = q.options.indexOf(char.romaji);
      break;
    }
    case 'speed': {
      q = { prompt: char.romaji, options: shuffle([char, ...distractors]).map(c => c.char), correctIndex: 0, cardId: char.id };
      q.correctIndex = q.options.indexOf(char.char);
      break;
    }
    case 'memory': {
      q = { prompt: char.char, options: shuffle([char, ...distractors]).map(c => c.romaji), correctIndex: 0, cardId: char.id };
      q.correctIndex = q.options.indexOf(char.romaji);
      break;
    }
    case 'boss': {
      const r = Math.random();
      if (r < 0.5) {
        q = { prompt: char.char, options: shuffle([char, ...distractors]).map(c => c.romaji), correctIndex: 0, cardId: char.id };
        q.correctIndex = q.options.indexOf(char.romaji);
      } else {
        q = { prompt: char.romaji, options: shuffle([char, ...distractors]).map(c => c.char), correctIndex: 0, cardId: char.id };
        q.correctIndex = q.options.indexOf(char.char);
      }
      break;
    }
    default: { q = { prompt: char.char, options: [char.romaji], correctIndex: 0, cardId: char.id }; }
  }
  return q;
}

export function useReviewSession(mode: ReviewMode, script: 'hira' | 'kata', cards: Card[], deckSize = 10) {
  const dataset = useMemo(() => flattenFor(script), [script]);
  const initialCards = useMemo<Card[]>(() => {
    const due = cards.filter(c => c.due <= Date.now()).slice(0, deckSize);
    if (due.length >= deckSize) return due;
    const have = new Set(cards.map(c => c.id));
    const fresh = dataset.filter(c => !have.has(c.id)).slice(0, deckSize - due.length).map(newCard);
    return [...due, ...fresh];
  }, [cards, dataset, deckSize]);

  const [state, setState] = useState<SessionState>(() => ({
    mode, script,
    deck: initialCards,
    chars: dataset,
    index: 0,
    correct: 0,
    incorrect: 0,
    startedAt: Date.now(),
    questionStart: Date.now(),
    questions: initialCards.map(c => buildQuestions(mode, dataset, dataset.find(d => d.id === c.id)!)),
  }));

  const totalAnswered = state.correct + state.incorrect;
  const finished = state.index >= state.deck.length;

  const answer = (optionIndex: number) => {
    if (finished) return null;
    const q = state.questions[state.index];
    const correct = optionIndex === q.correctIndex;
    const next = { ...state };
    if (correct) next.correct += 1; else next.incorrect += 1;
    next.index += 1;
    next.questionStart = Date.now();
    setState(next);
    return { correct, quality: (correct ? 5 : 1) as 0|1|2|3|4|5, cardId: q.cardId, ms: Date.now() - state.questionStart };
  };

  const restart = () => {
    setState({
      mode, script, deck: initialCards, chars: dataset,
      index: 0, correct: 0, incorrect: 0, startedAt: Date.now(), questionStart: Date.now(),
      questions: initialCards.map(c => buildQuestions(mode, dataset, dataset.find(d => d.id === c.id)!)),
    });
  };

  return { state, answer, restart, finished, totalAnswered };
}