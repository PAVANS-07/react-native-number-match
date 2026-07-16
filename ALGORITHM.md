# Algorithm Writeup — Deterministic Difficulty System
## Number Match Puzzle Game

---

## Problem

Classic Number Match games use pure random number generation (RNG) to populate the board and inject new rows. This leads to highly inconsistent player experiences:

- Level 1 boards that are mathematically unsolvable (no valid matches exist from the start).
- Level 10 boards that are trivially easy because accidental match clusters form.
- "Add Row" buttons that add random numbers with no relation to the board state, sometimes making things worse.
- No predictable difficulty progression — players feel the game is unfair.

**Goal**: Replace RNG with a Deterministic Logic System so that:

1. Every board is provably solvable at the start.
2. Difficulty follows a "Sawtooth" wave (rises, dips, rises higher).
3. The "Add Row" button is intelligent — it helps strategically, not randomly.
4. 90% of players complete Level 1 in ~45 seconds with 1 Add Row use.

---

## Part A — Seeding Logic: "Pair-then-Decoy" Algorithm

### Core Idea

Instead of filling cells with random numbers and hoping matches exist, we deliberately **place guaranteed pairs first**, then fill the remaining cells with carefully chosen decoys.

### Steps

#### Step 1: Deterministic PRNG Seeding
We use the **Mulberry32** algorithm, a fast and compact pseudorandom number generator, seeded by `level * 1000 + attempt`. This means:
- The same level always produces the same initial board (reproducible, testable).
- Each retry attempt uses a slightly different seed, producing a different but still deterministic board.
- No two devices will get a different board for the same level.

```
seed = level × 1000 + attempt
rng  = mulberry32(seed)
```

#### Step 2: Compute Pair Count
From the per-level `matchDensity` parameter (e.g., 0.70 for Level 1), we calculate how many cells should be part of guaranteed solvable pairs:

```
pairCellCount = floor(totalCells × matchDensity / 2) × 2
```

For Level 1 with 27 cells and 70% density: `floor(27 × 0.70 / 2) × 2 = 18 pair cells (9 pairs)`.

#### Step 3: Shuffle and Assign Positions
We shuffle all 27 cell positions using the PRNG, then split them:
- First `pairCellCount` positions → pair slots
- Remaining positions → decoy slots

For each consecutive pair of pair-slots, we randomly pick a pair type:
- **Same number**: e.g., (5, 5)
- **Sum to 10**: e.g., (3, 7), (2, 8), (4, 6), (1, 9)

#### Step 4: Fill Decoys
For each remaining slot, we collect the values of its **8 neighbors** (horizontal, vertical, diagonal) plus wrap-around neighbors. We then select a value that does **not** form a valid match with any neighbor:

```
safeValues = [1..9].filter(v => !neighbors.any(n => v == n || v + n == 10))
decoyValue = pick(safeValues, rng)
```

This prevents accidental match clusters from forming around decoys.

#### Step 5: Solvability Verification
After generating the board, we run the full **Match Engine** to verify that at least one valid match exists. If zero matches are found, we increment `attempt` and regenerate (up to 10 retries, all deterministic). A fallback board with guaranteed adjacent pairs is used if all retries fail.

### Why This Works

The sawtooth difficulty curve is controlled by a single parameter per level — `matchDensity`:

| Level | matchDensity | Effect |
|-------|-------------|--------|
| 1     | 70%         | 18 of 27 cells are in pairs — lots of easy matches |
| 5     | 35%         | Only 9 cells in pairs — buried in decoys |
| 6     | 55%         | Relief — back to normal density |
| 10    | 20%         | Only 5-6 cells in pairs — peak difficulty |

---

## Part B — Add Row Logic: "Rescue Injection" Algorithm

### Core Idea

When the player taps (+) Add Row, instead of injecting random numbers, we **analyze the current board** and inject a strategic mix of *rescue pairs* (numbers that will form valid matches) and *decoys* (hard numbers that tempt but don't match).

### Board Analysis Phase

Before building the new row, we compute:

1. **Unmatched values** — all numbers still on the board.
2. **Complements** — for each unmatched value `v`, its complements are: `[v, 10-v]` (both form valid matches).
3. **Straggler values** — values in rows where only 1 cell remains unmatched.

### Row Construction

The 9 cells of the new row are filled in order:

```
1. [If Rescue fires] → first 2 cells are a direct matching pair
2. [If Straggler fires] → next 1-2 cells are complements of straggler values
3. Remaining slots → mix of:
   - Rescue pairs (complements of random board values)
   - Hard decoys (values that are NOT complements of any board value)
   Ratio = rescuePairRatio (level-dependent)
```

The rescue/decoy mixture is then **shuffled** (using a deterministic seed based on add-row count) before being placed, so rescue pairs aren't always at predictable positions.

### Rescue Mechanic (Frustration Detector)

```
if (addRowCount >= rescueThreshold AND matchesSinceLastAdd === 0):
    force instant-match pair at start of new row
```

This detects when a player has pressed Add Row twice without making any matches — a strong signal of frustration. We respond by guaranteeing an immediate, obvious match in the new row.

`matchesSinceLastAdd` resets to 0 after every Add Row press, so the counter only measures post-add-row activity.

### Straggler Cleanup

```
stragglerRows = rows.filter(row => unmatchedCount(row) === 1)
if (stragglerRows.length >= stragglerThreshold):
    inject complements of straggler values first in new row
```

A "straggler" is a row reduced to a single orphaned cell. These block board progress because they can only be cleared by a very specific number. When too many stragglers accumulate, we prioritize injecting their exact complements so the player can tidy the board.

---

## Difficulty Curve Implementation (Sawtooth)

The sawtooth pattern is achieved by varying three parameters per level:

| Param | Level 1 | Level 5 (Peak) | Level 6 (Relief) | Level 10 (Max) |
|-------|---------|----------------|------------------|----------------|
| matchDensity | 70% | 35% | 55% | 20% |
| decoyRatio | 15% | 55% | 30% | 70% |
| rescuePairRatio | 80% | 45% | 65% | 25% |

The system never needs a timer — the difficulty parameters naturally control how long players take:
- High density = many obvious matches = fast completion.
- Low density + high decoys = few matches buried in noise = slow completion.
- The Add Row rescue ratio determines how helpful the game is when the player gets stuck.

---

## Match Detection Engine

The Match Engine identifies all valid pairs using a **line-of-sight** check across 4 directions:

1. **Horizontal**: Same row, all cells between the two are cleared.
2. **Vertical**: Same column, all cells between the two are cleared.
3. **Diagonal**: `|Δrow| == |Δcol|`, all intermediate diagonal cells are cleared.
4. **Wrap-around**: Linear flat indices — `flatIndex[a+1 .. b-1]` are all cleared.

Two values match if: `a == b` OR `a + b == 10`.

The engine operates on a flat array representation for O(1) cell access, then maps results back to (row, col) for display.

---

## Summary

| Feature | Implementation |
|---------|---------------|
| Deterministic boards | Mulberry32 PRNG seeded by `level × 1000 + attempt` |
| Guaranteed solvability | Pair-then-Decoy + BFS solvability check + retry |
| Difficulty curve | `matchDensity` + `decoyRatio` parameters per level |
| Sawtooth pattern | Explicit config table with dip at levels 6 and 11 |
| Smart Add Row | Board analysis + rescue/decoy mix at level-dependent ratio |
| Rescue mechanic | Frustration detector: 2 fruitless presses → force instant match |
| Straggler cleanup | Orphan detector: ≥N single-cell rows → inject complements |
| Match types | Same number + sum to 10 |
| Match directions | Horizontal, vertical, diagonal, wrap-around |
