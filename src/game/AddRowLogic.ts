/**
 * AddRowLogic.ts
 *
 * Part B: Smart "Add Row" Logic
 *
 * When the player taps the (+) Add Row button, instead of injecting random
 * numbers, we analyze the board and inject a strategic mix of:
 *   - Rescue Pairs:  Numbers that will form valid matches with existing cells.
 *   - Decoys:        Numbers that look tempting but don't match (difficulty).
 *
 * Special Mechanics:
 *
 *   1. RESCUE MECHANIC
 *      If the player has pressed Add Row ≥ rescueThreshold times AND made
 *      zero matches since the last Add Row, we force at least one guaranteed
 *      "instant match" pair (two numbers placed adjacently that match each
 *      other immediately, requiring no navigation).
 *
 *   2. STRAGGLER CLEANUP
 *      If ≥ stragglerThreshold rows have exactly 1 unmatched cell, we
 *      prioritize injecting the complement of those straggler values so the
 *      player can clear those orphaned rows and tidy the board.
 *
 * Row Layout Strategy:
 *   - Row is filled left-to-right: 9 cells.
 *   - Rescue pairs are interspersed with decoys at the ratio from config.
 *   - If Rescue Mechanic fires, the first two cells are a direct match pair.
 *   - If Straggler Cleanup fires, straggler complements are interspersed early.
 */

import { Board, Cell, countStragglerRows, getStragglerValues, getUnmatchedValues, valuesMatch } from './MatchEngine';
import { getLevelConfig, GRID_COLS, MAX_ADD_ROWS_PER_LEVEL } from './DifficultyConfig';
import { buildBoard } from './BoardSeeder';

// ─── Mulberry32 (local copy to avoid circular import) ────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

const PAIR_TYPES: [number, number][] = [];
for (let a = 1; a <= 9; a++) {
  PAIR_TYPES.push([a, a]);
  for (let b = a + 1; b <= 9; b++) {
    if (a + b === 10) PAIR_TYPES.push([a, b]);
  }
}

// ─── Complement Calculation ──────────────────────────────────────────────────

/**
 * Given a value on the board, return the value(s) that would match it.
 * For same-number: complement = same value.
 * For sum-to-10:  complement = 10 - value (if valid 1-9).
 */
function getComplements(value: number): number[] {
  const complements: number[] = [value]; // same number always works
  const sumComp = 10 - value;
  if (sumComp >= 1 && sumComp <= 9 && sumComp !== value) {
    complements.push(sumComp);
  }
  return complements;
}

// ─── Main Add Row Logic ──────────────────────────────────────────────────────

export interface AddRowContext {
  level: number;
  addRowCount: number;       // How many times Add Row has been pressed THIS level
  matchesSinceLastAdd: number; // Matches made since the LAST Add Row press
  currentBoard: Board;
}

export interface AddRowResult {
  newBoard: Board;
  triggeredRescue: boolean;
  triggeredStraggler: boolean;
}

/**
 * Generate and inject a new row based on board analysis.
 */
export function addSmartRow(ctx: AddRowContext, seed: number): AddRowResult {
  const config = getLevelConfig(ctx.level);
  const rng = mulberry32(seed);

  const { currentBoard, addRowCount, matchesSinceLastAdd } = ctx;
  const unmatchedValues = getUnmatchedValues(currentBoard);
  const stragglerCount = countStragglerRows(currentBoard);
  const stragglerVals = getStragglerValues(currentBoard);

  // ── Determine special mechanic triggers ──────────────────────────────────
  const triggeredRescue =
    addRowCount >= config.rescueThreshold && matchesSinceLastAdd === 0;
  const triggeredStraggler =
    stragglerCount >= config.stragglerThreshold;

  // ── Build the new row's 9 values ─────────────────────────────────────────
  const newValues: number[] = [];

  // 1. If Rescue fires: first 2 cells are a direct same-number pair
  if (triggeredRescue) {
    const rescuePair = pick(PAIR_TYPES, rng);
    newValues.push(rescuePair[0], rescuePair[1]);
  }

  // 2. If Straggler fires: inject complements for up to 2 stragglers
  if (triggeredStraggler) {
    const targets = stragglerVals.slice(0, 2);
    for (const sv of targets) {
      const complement = pick(getComplements(sv), rng);
      newValues.push(complement);
    }
  }

  // 3. Fill remaining slots with rescue pairs + decoys per ratio
  const slotsLeft = GRID_COLS - newValues.length;
  const rescueSlotsTarget = Math.round(slotsLeft * config.rescuePairRatio);
  const decoySlotsTarget = slotsLeft - rescueSlotsTarget;

  // Build rescue values (complements of existing board values)
  const rescueVals: number[] = [];
  if (unmatchedValues.length > 0) {
    const pairsNeeded = Math.ceil(rescueSlotsTarget / 2);
    for (let i = 0; i < pairsNeeded; i++) {
      const targetVal = pick(unmatchedValues, rng);
      const complement = pick(getComplements(targetVal), rng);
      rescueVals.push(complement);
      // Also add the target itself if we have slots (creates a direct pair)
      if (rescueVals.length < rescueSlotsTarget) {
        rescueVals.push(targetVal);
      }
    }
  }

  // Build decoy values (numbers that avoid easy matches)
  const decoyVals: number[] = [];
  for (let i = 0; i < decoySlotsTarget; i++) {
    // Pick a value that doesn't form too many obvious matches
    const allVals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Prefer numbers that are NOT complements of existing board values
    const boardComplements = new Set<number>();
    for (const v of unmatchedValues) {
      for (const c of getComplements(v)) boardComplements.add(c);
    }
    const hardDecoys = allVals.filter((v) => !boardComplements.has(v));
    decoyVals.push(hardDecoys.length > 0 ? pick(hardDecoys, rng) : pick(allVals, rng));
  }

  // Merge rescue and decoy, shuffle, append
  const remaining = [...rescueVals.slice(0, rescueSlotsTarget), ...decoyVals];
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  newValues.push(...remaining.slice(0, slotsLeft));

  // Ensure exactly 9 values
  while (newValues.length < GRID_COLS) {
    newValues.push(Math.ceil(rng() * 9));
  }

  // ── Append new row to board ──────────────────────────────────────────────
  const newRowIndex = currentBoard.length;
  const newRow: Cell[] = newValues.slice(0, GRID_COLS).map((value, col) => ({
    id: `${newRowIndex}-${col}`,
    value,
    matched: false,
    selected: false,
  }));

  const newBoard: Board = [...currentBoard, newRow];

  return { newBoard, triggeredRescue, triggeredStraggler };
}

/**
 * Check whether Add Row is still available for this level.
 */
export function canAddRow(addRowCount: number): boolean {
  return addRowCount < MAX_ADD_ROWS_PER_LEVEL;
}
