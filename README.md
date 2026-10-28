# 🎯 Darts Tracker — 501 Double Out

A mobile-first darts scoring application for tracking 501 double-out games with multiple players.

## Features

- **501 Double Out** — Full game rules with bust detection and double-finish requirement
- **Multi-player** — Add 2+ players with individual score tracking
- **Dart-by-dart input** — Log each dart (single/double/triple × 1-20, bull, double-bull) or use quick turn total entry
- **Checkout suggestions** — Shows possible finishes when remaining score is ≤ 170
- **IndexedDB Database** — Structured offline-first client database via [Dexie.js](https://dexie.org/) storing every game, turn, and player lifetime records
- **Player Stats & Career Records** — Lifetime 3-dart averages, win/loss records, high turns, and checkout percentages
- **Installable PWA** — Offline service worker with web app manifest; install directly to your iOS or Android home screen
- **Dark theme** — Pub-vibe dark UI with emerald/red accents, optimized for quick scoring at the board

## Getting Started

### Prerequisites

This project uses [Nix](https://nixos.org/) + [direnv](https://direnv.net/) for reproducible dev environments. If you have both installed:

```bash
cd darts-tracker
direnv allow    # Automatically loads Node.js 22, TypeScript, etc.
```

Or manually install Node.js ≥ 20.

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (works great on mobile too!).

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** — dark darts theme
- **Zustand** — state management
- **localStorage** — game history persistence

## How to Play

1. Add player names on the setup screen
2. Tap **Start Game**
3. For each dart: select multiplier (Single/Double/Triple) then tap the number
4. After 3 darts, tap **Next Player**
5. First player to reach exactly 0 on a double wins! 🏆

## License

MIT
