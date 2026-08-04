'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReviewRunner } from '@/components/games/ReviewRunner';
import { FlashcardsRunner } from '@/components/games/FlashcardsRunner';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sumi-500">Loading…</div>}>
      <ReviewInner />
    </Suspense>
  );
}

function ReviewInner() {
  const sp = useSearchParams();
  const mode = (sp.get('mode') ?? 'flashcards') as 'flashcards' | 'quiz' | 'listening' | 'speed' | 'memory' | 'boss';
  const deck = (sp.get('deck') ?? 'due') as 'due' | 'new' | 'all';
  if (mode === 'flashcards') return <FlashcardsRunner script="hira" deck={deck} />;
  return <ReviewRunner mode={mode} script="hira" deck={deck} />;
}