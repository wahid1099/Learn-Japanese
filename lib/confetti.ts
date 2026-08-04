'use client';
import confetti from 'canvas-confetti';

export function confetti() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f0303b', '#3868f7', '#2f9a5c', '#ffb648'],
  });
}