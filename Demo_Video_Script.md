# 🎥 Demo Video Recording Script — Number Match Puzzle Game
## Total Duration: 12–15 Minutes | Tool: Loom / OBS / Win+Alt+R

> **Before you start**: 
> 1. Open VS Code with `number-match-game` folder
> 2. Open browser at `http://localhost:8082` (the game running)
> 3. Start your screen recorder (Loom / OBS / Windows Game Bar)

---

## SCENE 1 — Introduction & Problem Statement (0:00 – 2:30)
**Show on screen**: GitHub repo page (`github.com/PAVANS-07/react-native-number-match`)

**Read this**:
> "Hello! I'm Pavan, and today I'm presenting my project: the **Number Match Puzzle Game** with a **Deterministic Difficulty System**.
>
> This is built using **React Native with Expo SDK 54**, **React 19**, and **TypeScript**.
>
> In traditional number match puzzle games, the boards are generated using **Random Number Generation** — or RNG. This creates a major problem: Level 1 boards can sometimes be mathematically impossible to solve, while Level 10 boards might accidentally become trivially easy.
>
> The core objective of this project was to **replace RNG entirely** with a **Deterministic Logic System** that guarantees:
> - First, every board is **mathematically solvable** with a 95% or higher completion probability.
> - Second, difficulty follows a structured **Sawtooth Wave Pattern** — it rises, dips for relief, then rises higher.
> - And third, the Add Row button is **intelligent** — it analyzes the current board state and injects strategic numbers, not random ones."

**Action**: Scroll through the README on GitHub showing features list and demo GIF.

---

## SCENE 2 — Architecture Overview (2:30 – 5:00)
**Show on screen**: Open `ARCHITECTURE.md` in VS Code, then switch to the `src/` folder tree

**Read this**:
> "Let me walk you through the architecture. The application strictly separates **algorithmic business logic** from **UI presentation**.
>
> *(Open the src/game/ folder in VS Code)*
>
> All game algorithms live in `src/game/` — this folder contains 5 pure TypeScript modules:
>
> 1. **`DifficultyConfig.ts`** — *(click to open it)* — This defines the Sawtooth difficulty curve. You can see here the `LEVELS` array where each level has parameters like `matchDensity`, `decoyRatio`, and `rescuePairRatio`. Notice how Level 1 has 70% match density for easy gameplay, Level 5 drops to 35% for peak difficulty, and Level 6 jumps back to 55% — that's our **Relief Phase**. This creates the rhythmic wave pattern.
>
> 2. **`BoardSeeder.ts`** — *(click to open it)* — This is the heart of the engine. Instead of using JavaScript's `Math.random()`, we implemented the **Mulberry32 PRNG**. You can see the seed formula here: `level * 1000 + attempt`. This means the exact same level always generates the exact same board on every device — completely deterministic and reproducible.
>
> 3. **`MatchEngine.ts`** — *(click to open it)* — This handles match detection across **4 directions**: horizontal, vertical, diagonal, and wrap-around. The `valuesMatch` function checks if two numbers are identical or sum to 10.
>
> 4. **`AddRowLogic.ts`** — *(click to open it)* — When the player taps 'Add Row', this module analyzes the board, identifies straggler cells, and injects strategic numbers rather than random ones.
>
> 5. **`GameState.ts`** — *(click to open it)* — We use React's `useReducer` for centralized state management. Every action — `SELECT_CELL`, `ADD_ROW`, `RESTART` — flows through this pure reducer, eliminating race conditions during rapid tapping."

---

## SCENE 3 — The Adjacent-Pair Seeding Algorithm (5:00 – 8:00)
**Show on screen**: `BoardSeeder.ts` open in VS Code, scrolled to the `seedBoard` function

**Read this**:
> "Now let me explain the core algorithm in detail — the **Adjacent-Pair Seeding Strategy**.
>
> *(Scroll through the seedBoard function)*
>
> The initial board is a 3-row, 9-column grid — so 27 cells total. The old approach was to fill all 27 cells with random numbers and hope that valid matches existed. That failed badly — especially at lower densities.
>
> Our approach is fundamentally different:
>
> **Step 1**: We compute how many cells should contain guaranteed matching pairs based on the level's `matchDensity`. For Level 1 at 70%, that's `floor(27 × 0.70 / 2) × 2 = 18 pair cells`, meaning **9 guaranteed matching pairs**.
>
> **Step 2**: We shuffle all 27 positions using our deterministic PRNG, then assign the first 18 positions to pair slots. For each pair, we randomly choose either a **same-number match** like 5 and 5, or a **sum-to-10 match** like 3 and 7.
>
> **Step 3**: The remaining 9 positions become **decoy cells**. For each decoy, we scan its 8 neighbors and pick a number that does NOT match any of them — preventing accidental match clusters.
>
> **Step 4**: We run `MatchEngine.findAllMatches()` as a final verification. If the board fails the solvability check, `attempt` increments and we regenerate deterministically. In testing, the board passes on Attempt 0 in over 99% of cases.
>
> This is why every level starts with clear, visible matches — not because we got lucky, but because the algorithm **guarantees** it."

---

## SCENE 4 — Smart Row Injection & Rescue Mechanics (8:00 – 10:30)
**Show on screen**: `AddRowLogic.ts` open in VS Code

**Read this**:
> "The Add Row button is limited to 6 uses per level. But what makes it special is the intelligence behind it.
>
> *(Point to the rescue logic section)*
>
> **The Frustration Rescue Mechanic**: The system tracks how many matches the player has made since their last Add Row press — that's `matchesSinceLastAdd`. If this counter is zero when they press Add Row again — meaning they pressed it twice without finding ANY matches — the algorithm detects frustration and **forces an immediate matching pair** into the first two cells of the new row.
>
> *(Point to the straggler logic)*
>
> **The Straggler Cleanup Engine**: A 'straggler' is a row reduced to a single remaining cell. These block progress because only one specific number can clear them. When the algorithm detects multiple straggler rows, it prioritizes injecting their exact numeric complements — so if there's a lonely 6, we inject either another 6 or a 4 — into the new row.
>
> The remaining slots are filled with a mix of rescue pairs and hard decoys based on the level's `rescuePairRatio` — higher for easier levels, lower for harder ones."

---

## SCENE 5 — Live Gameplay Demonstration (10:30 – 14:00)
**Show on screen**: Switch to browser at `http://localhost:8082`

**Read this while playing**:
> "Now let me demonstrate the game live.
>
> *(Click on the game in browser)*
>
> Here's the **Home Screen** showing all 11 levels. Notice how Level 6 and Level 11 are marked as 'Relief' levels — that's our Sawtooth pattern visible right in the UI.
>
> *(Click Level 1)*
>
> When I start Level 1, you can see the 3×9 grid — 27 cells. The header shows the level number, current score, and the Add Row counter showing '6 left'.
>
> *(Start tapping matching pairs)*
>
> Watch — I tap this 3, then I tap the adjacent 3 — they match and fade out with a smooth animation. Notice the blue highlight when I select the first cell, and the scale-down animation when they clear. These are running at 60 FPS using React Native's `useNativeDriver`.
>
> *(Make a few more matches)*
>
> Now let me try a sum-to-10 match — I'll tap this 4, and then this 6. Four plus six equals ten — valid match! They clear instantly.
>
> *(Click Add Row)*
>
> Now I'll click the Add Row button. Watch how a new row of 9 numbers appears at the bottom. The counter decrements to '5 left'. These aren't random numbers — they were strategically generated by our `AddRowLogic` to include complements of numbers still on the board.
>
> *(Continue playing, try Level 6)*
>
> Let me also quickly show Level 6 — our Relief level. Notice how the board feels more generous with matches — that's the higher `matchDensity` of 55% giving the player a breather after the challenging climb from levels 1 to 5."
>
> *(Play for another minute)*

---

## SCENE 6 — Technical Trade-offs & Conclusion (14:00 – 15:30)
**Show on screen**: Switch back to VS Code or the GitHub repo

**Read this**:
> "Before I close, let me highlight two key engineering trade-offs:
>
> **First**, when cells are matched, we set them to `matched: true` and render them invisible — we do NOT remove them from the grid array. This preserves spatial coordinates for line-of-sight matching, even though it means keeping cleared objects in memory. At maximum board expansion of 135 cells, total memory is under 50 KB — a negligible cost for the UX benefit.
>
> **Second**, we use dynamic raycasting for match validation instead of precomputed adjacency graphs. Since the board changes every time a cell clears or a row is added, a precomputed graph would need constant rebuilding. Our O(K) raycast — where K is at most 9 — completes in under half a millisecond.
>
> For future improvements, we plan to add **Global Leaderboards** using daily challenge seeds, a **Level Editor** for community puzzle sharing, and **Haptic Feedback** integration using `expo-haptics`.
>
> The complete source code, architecture documentation, technical report, and algorithm writeup are all available on our GitHub repository. Thank you for watching!"

---

## ✅ Step 4: Stop Recording → Get Your Link

After you stop Loom recording:
1. Loom **automatically generates** your video link: `https://www.loom.com/share/xxxxx`
2. **Copy that link** → Paste it into your submission form!

### Alternative: If using Windows Screen Recorder (Win+Alt+R)
1. Video saves to `C:\Users\Pavan S\Videos\Captures\`
2. Upload to **Google Drive** → Right-click → Share → "Anyone with link" → Copy link
3. OR upload to **YouTube** → Set to "Unlisted" → Copy link
