# Kanji no Mori — Learn Japanese

A serene, game-like Japanese learning web app. Master Hiragana, Katakana, and a structured pathway through the language, built with spaced repetition, smooth motion, and a Japanese-inspired design language.

## Highlights

- **Hiragana & Katakana** — full 142-character dataset with mnemonics, audio (Web Speech API), and animated stroke reveals.
- **Spaced Repetition (SM-2)** — adaptive scheduling that focuses on what you're about to forget.
- **Six game modes** — Flashcards, Quiz, Listening, Speed, Memory, and a Boss Battle.
- **Progress & Achievements** — heatmap calendar, retention stats, weak-character detection, badges.
- **Beautiful UI** — paper-grain textures, Japanese-inspired palette, light + dark mode, Framer Motion micro-interactions, fully responsive.
- **Privacy-first** — all progress stored locally; no backend required. Export to JSON anytime.

## Stack

- Next.js 15 (App Router) + TypeScript (strict)
- Tailwind CSS + Framer Motion + Zustand
- canvas-confetti for celebratory moments
- Web Speech API for pronunciation (no API keys)

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Folder structure

```
app/                   # Next.js App Router pages
  page.tsx             # Dashboard
  learn/
    hiragana/          # Hiragana learning + review
    katakana/          # Katakana learning + review
  games/               # Games hub + boss battle
  progress/            # Stats, heatmap, achievements
  settings/            # Theme, audio, export, reset
components/
  audio/               # AudioProvider (Web Speech API)
  games/               # ReviewRunner + per-mode sessions
  learn/               # KanaGrid, KanaDetail, KanaGlyph
  shell/               # AppShell (header + bottom nav)
  ui/                  # Button, Card, ProgressRing, Modal, Toast
lib/
  kana.ts              # Master kana dataset
  srs.ts               # SM-2 algorithm
  utils.ts             # cn(), date helpers, shuffle
stores/
  useApp.ts            # Zustand store (persisted to localStorage)
types/
  index.ts             # Shared TypeScript types
public/
  manifest.webmanifest # PWA manifest
  icon.svg             # App icon
```

## Security

- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` headers via `next.config.mjs`.
- All persistence stays in `localStorage`. No external network calls beyond Google Fonts (configurable to self-host).
- Theme toggle is sanitized; user content never reaches `dangerouslySetInnerHTML` (except a one-line theme bootstrap, which is fixed).

## Roadmap

- Vocabulary lessons, particle drills
- AI tutor via OpenAI/Anthropic with server-side rate limiting
- Kanji path (JLPT N5 → N1)
- Multiplayer sync (optional)# Learn-Japanese
"# Learn-Japanese" 
