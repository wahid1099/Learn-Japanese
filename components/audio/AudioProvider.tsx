'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface AudioCtx {
  speak: (text: string, lang?: 'ja-JP' | 'en-US') => void;
  enabled: boolean;
}

const Ctx = createContext<AudioCtx | null>(null);

export function useAudio() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAudio must be used within AudioProvider');
  return v;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const voicesRef = useRef<{ ja?: SpeechSynthesisVoice; en?: SpeechSynthesisVoice }>({});

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      voicesRef.current.ja = list.find(v => v.lang === 'ja-JP') ?? list.find(v => v.lang.startsWith('ja'));
      voicesRef.current.en = list.find(v => v.lang === 'en-US') ?? list.find(v => v.lang.startsWith('en'));
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Detect reduced motion / global mute via OS
  useEffect(() => {
    try {
      const s = localStorage.getItem('sound');
      if (s === 'off') setEnabled(false);
    } catch {}
  }, []);

  const speak = useCallback((text: string, lang: 'ja-JP' | 'en-US' = 'ja-JP') => {
    if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.9;
      u.pitch = 1;
      const v = lang === 'ja-JP' ? voicesRef.current.ja : voicesRef.current.en;
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch {
      /* swallow audio errors */
    }
  }, [enabled]);

  const value = useMemo(() => ({ speak, enabled }), [speak, enabled]);
  // Silence setter is exposed via window for components that toggle.
  useEffect(() => {
    (window as unknown as { __toggleSound?: () => void }).__toggleSound = () => setEnabled(e => !e);
    return () => { delete (window as unknown as { __toggleSound?: () => void }).__toggleSound; };
  }, []);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}