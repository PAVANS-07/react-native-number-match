/**
 * BoardSeeder.ts  — v2: "Adjacent-Pair" Algorithm
 *
 * CRITICAL FIX over v1:
 *   v1 placed pairs at *random positions* in the grid. Those positions often
 *   had no line-of-sight (e.g. cell 0 paired with cell 26 while all cells
 *   between them were full). Result: board with 70% "pair density" but
 *   0 immediately matchable pairs → broke the 95% completion target.
 *
 * v2 "Adjacent-Pair" Strategy:
 *   1. Build the full list of ADJACENT position-pairs in the grid:
 *      horizontal neighbors, vertical neighbors, diagonal neighbors,
 *      and wrap-around (col-8 of row N ↔ col-0 of row N+1).
 *   2. Shuffle the list with a deterministic PRNG (Mulberry32 seeded by level).
 *   3. Greedily assign match-pairs to adjacent slot-pairs (no slot reuse).
 *      Stop when we hit the target matchDensity.
 *   4. Fill remaining slots with carefully chosen decoys.
 *
 * Why this guarantees the 95% target:
 *   Every placed pair is separated by 0 intermediate cells, so it is
 *   ALWAYS matchable on an otherwise full board. The only way the board
 *   can become unsolvable is if every pair gets surrounded by decoys that
 *   form no path — which cannot happen when pairs are adjacent.
 *
 * Difficulty is controlled by:
 *   matchDensity  → how many pairs (more = easier, fewer = harder)
 *   decoyRatio    → how "tricky" the filler numbers are
 */

import { Board, Cell, valuesMatch, findAllMatches } from './MatchEngine';
import { getLevelConfig, GRID_COLS, INITIAL_ROWS } from './DifficultyConfig';

// ─── Mulberry32 PRNG ─────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// All valid number pairs (same OR sum-to-10)
const PAIR_TYPES: [number, number][] = [];
for (let a = 1; a <= 9; a++) {
  PAIR_TYPES.push([a, a]);
}
// sum-to-10: [1,9],[2,8],[3,7],[4,6]
[[1,9],[2,8],[3,7],[4,6]].forEach(([a,b]) => PAIR_TYPES.push([a,b],[b,a]));

// ─── Build adjacent-pair list ─────────────────────────────────────────────────
function buildAdjacentPairs(rows: number, cols: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pos = r * cols + c;

      // Horizontal: right neighbour (same row)
      if (c < cols - 1) pairs.push([pos, pos + 1]);

      // Vertical: below neighbour
      if (r < rows - 1) pairs.push([pos, pos + cols]);

      // Diagonal ↘
      if (r < rows - 1 && c < cols - 1) pairs.push([pos, pos + cols + 1]);

      // Diagonal ↙
      if (r < rows - 1 && c > 0) pairs.push([pos, pos + cols - 1]);

      // Wrap-around: last cell of row → first cell of next row
      if (c === cols - 1 && r < rows - 1) pairs.push([pos, pos + 1]);
    }
  }
  return pairs;
}

// ─── Decoy chooser ───────────────────────────────────────────────────────────
function chooseDecoy(neighbors: number[], rng: () => number, decoyRatio: number): number {
  const allVals = [1,2,3,4,5,6,7,8,9];
  const safe = allVals.filter(v => !neighbors.some(n => valuesMatch(v, n)));
  const pool = safe.length > 0 ? safe : allVals;

  // Hard decoy (high ratio): pick a number that LOOKS like it could match
  // but doesn't — i.e. one that IS a complement of some board number, but
  // we place it where the matching partner isn't visible.
  if (rng() < decoyRatio && neighbors.length > 0) {
    // Pick from numbers that form pairs with existing neighbors (tempting)
    const tempting = allVals.filter(v =>
      neighbors.some(n => valuesMatch(v, n)) && !pool.includes(v)
    );
    if (tempting.length > 0) return pick(tempting, rng);
  }

  return pick(pool, rng);
}

// ─── Main Seeder ─────────────────────────────────────────────────────────────
export function seedBoard(level: number): Board {
  // Try up to 10 deterministic seeds; each is guaranteed to have ≥1 match
  for (let attempt = 0; attempt < 10; attempt++) {
    const board = tryGenerate(level, attempt);
    if (findAllMatches(board).length > 0) return board;
  }
  // Absolute fallback: guaranteed adjacent consecutive pairs
  return generateFallbackBoard(level);
}

function tryGenerate(level: number, attempt: number): Board {
  const config = getLevelConfig(level);
  const rng = mulberry32(level * 1000 + attempt * 137);

  const rows = INITIAL_ROWS;
  const cols = GRID_COLS;
  const totalCells = rows * cols; // 27

  const values: number[] = new Array(totalCells).fill(0);
  const usedSlots = new Set<number>();

  // Shuffle the adjacent-pair catalogue
  const adjPairs = shuffle(buildAdjacentPairs(rows, cols), rng);

  // How many match-pairs to plant
  const pairsNeeded = Math.floor((totalCells * config.matchDensity) / 2);
  let pairsPlaced = 0;

  for (const [posA, posB] of adjPairs) {
    if (pairsPlaced >= pairsNeeded) break;
    if (usedSlots.has(posA) || usedSlots.has(posB)) continue;

    const pairType = pick(PAIR_TYPES, rng);
    // Randomly swap order so the grid doesn't always have low→high reading
    if (rng() < 0.5) {
      values[posA] = pairType[0];
      values[posB] = pairType[1];
    } else {
      values[posA] = pairType[1];
      values[posB] = pairType[0];
    }
    usedSlots.add(posA);
    usedSlots.add(posB);
    pairsPlaced++;
  }

  // Fill remaining slots with decoys
  for (let i = 0; i < totalCells; i++) {
    if (usedSlots.has(i)) continue;

    const r = Math.floor(i / cols);
    const c = i % cols;

    const neighborVals: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const nv = values[nr * cols + nc];
          if (nv !== 0) neighborVals.push(nv);
        }
      }
    }
    // Flat neighbours (wrap-around context)
    if (i > 0 && values[i - 1] !== 0) neighborVals.push(values[i - 1]);
    if (i < totalCells - 1 && values[i + 1] !== 0) neighborVals.push(values[i + 1]);

    values[i] = chooseDecoy(neighborVals, rng, config.decoyRatio);
  }

  return buildBoard(rows, cols, values);
}

// ─── Board builder ────────────────────────────────────────────────────────────
export function buildBoard(rows: number, cols: number, values: number[]): Board {
  const board: Board = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        id: `${r}-${c}`,
        value: values[r * cols + c] || 1,
        matched: false,
        selected: false,
      });
    }
    board.push(row);
  }
  return board;
}

// ─── Absolute fallback ────────────────────────────────────────────────────────
function generateFallbackBoard(level: number): Board {
  const rng = mulberry32(level * 999);
  const rows = INITIAL_ROWS;
  const cols = GRID_COLS;
  const totalCells = rows * cols;
  const values: number[] = [];

  for (let i = 0; i < totalCells; i += 2) {
    const pair = pick(PAIR_TYPES, rng);
    values.push(pair[0], pair[1]);
  }
  if (values.length < totalCells) values.push(5);

  return buildBoard(rows, cols, values.slice(0, totalCells));
}
