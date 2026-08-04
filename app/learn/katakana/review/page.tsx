'use client';
import { useSearchParams } from 'next/navigation';
import { ReviewRunner } from '@/components/games/ReviewRunner';
import { FlashcardsRunner } from '@/components/games/FlashcardsRunner';

export default function Page() {
  const sp = useSearchParams();
  const mode = (sp.get('mode') ?? 'flashcards') as 'flashcards' | 'quiz' | 'listening' | 'speed' | 'memory' | 'boss';
  const deck = (sp.get('deck') ?? 'due') as 'due' | 'new' | 'all';
  if (mode === 'flashcards') return <FlashcardsRunner script="kata" deck={deck} />;
  return <ReviewRunner mode={mode} script="kata" deck={deck} />;
}