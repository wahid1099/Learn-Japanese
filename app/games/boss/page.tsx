'use client';
import { ReviewRunner } from '@/components/games/ReviewRunner';
import { useApp } from '@/stores/useApp';
import { useEffect } from 'react';

export default function Page() {
  const { unlockAchievement } = useApp.getState();
  useEffect(() => { unlockAchievement('boss-1'); }, [unlockAchievement]);
  return <ReviewRunner mode="boss" script="hira" deck="due" />;
}