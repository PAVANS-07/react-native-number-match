# Number Match Puzzle Game

A **React Native / Expo** implementation of the classic Number Match puzzle game with a **Deterministic Difficulty System** that replaces RNG with principled algorithms for fair, predictable gameplay.

## Features

- ✅ **9×9 grid** starting with 3 rows, expanding dynamically
- ✅ **Match same numbers** (5 & 5) or **sum-to-10 pairs** (3 & 7)
- ✅ **4-direction matching**: horizontal, vertical, diagonal, wrap-around
- ✅ **Add Row button** — up to 6 uses per level (smart injection)
- ✅ **Sawtooth difficulty curve** — levels 1→5 hard, 6 relief, 7→10 harder, 11 relief
- ✅ **Rescue mechanic** — auto-detects frustration, forces easy matches
- ✅ **Straggler cleanup** — auto-clears orphaned single-cell rows
- ✅ **Deterministic boards** — same level = same board on every device
- ✅ **Star rating** based on Add Row efficiency

## Quick Start

```bash
cd number-match-game
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app on your Android/iOS device.

## Building APK

### Option A: EAS Build (Recommended — no Android Studio needed)
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### Option B: Local (requires Android Studio + SDK)
```bash
npx expo run:android
```

## Project Structure

```
src/
├── game/
│   ├── DifficultyConfig.ts   # Per-level config (matchDensity, decoyRatio, etc.)
│   ├── BoardSeeder.ts        # Part A: Deterministic board generation
│   ├── AddRowLogic.ts        # Part B: Smart "Add Row" injection
│   ├── MatchEngine.ts        # Match detection (all 4 directions)
│   └── GameState.ts          # useReducer game state
├── components/
│   ├── Cell.tsx              # Individual cell with animations
│   ├── GameBoard.tsx         # Scrollable 9-column board
│   ├── HUD.tsx               # Level, score, Add Row button
│   ├── LevelCompleteModal.tsx
│   └── StuckModal.tsx
└── screens/
    ├── HomeScreen.tsx
    └── GameScreen.tsx
```

## Algorithm

See [ALGORITHM.md](./ALGORITHM.md) for a detailed writeup of:
- **Part A**: "Pair-then-Decoy" deterministic seeding
- **Part B**: "Rescue Injection" smart Add Row logic
- **Sawtooth difficulty curve** implementation

## Difficulty Table

| Level | Match Density | Ideal Add Rows | Notes |
|-------|--------------|----------------|-------|
| 1     | 70%          | 1              | Easy — instant gratification |
| 3     | 55%          | 2-3            | Normal — requires scanning |
| 5     | 35%          | 3-4            | Hard — matches buried |
| 6     | 55%          | 2-4            | **Relief** — drops back |
| 10    | 20%          | 5-6            | Peak difficulty |
| 11    | 55%          | 2-4            | **Relief** — reset |
