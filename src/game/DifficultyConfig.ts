/**
 * DifficultyConfig.ts
 * 
 * Per-level configuration for the Number Match Puzzle Game.
 * Implements the "Sawtooth" difficulty curve:
 *   - Levels 1–5:  Steady increase
 *   - Level 6:     Relief drop (similar to Level 3)
 *   - Levels 7–10: Ramp up again, peaking higher than Level 5
 *   - Level 11:    Relief drop again
 *
 * matchDensity: Fraction of cells that are part of a guaranteed solvable pair (0–1).
 * decoyRatio:   Fraction of non-pair cells that are "hard" decoys (0–1).
 * rescueThreshold: How many fruitless Add Row presses before Rescue fires.
 * stragglerThreshold: How many single-cell rows before Straggler Cleanup fires.
 * rescuePairRatio:  Fraction of a new row that are rescue pairs (vs decoys).
 */

export interface LevelConfig {
  level: number;
  targetTimeSeconds: number;  // 90th-percentile target (no in-game timer)
  experienceGoal: string;
  matchDensity: number;       // 0.0 – 1.0  (fraction of cells that are in guaranteed pairs)
  decoyRatio: number;         // 0.0 – 1.0  (how hard the decoys are to ignore)
  idealAddRows: number;       // Median Add Row presses to win
  rescuePairRatio: number;    // Fraction of injected row that are rescue pairs
  rescueThreshold: number;    // Fruitless presses before Rescue fires
  stragglerThreshold: number; // Single-cell rows before Straggler Cleanup fires
}

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    level: 1,
    targetTimeSeconds: 45,
    experienceGoal: 'Easy. 70% match density. Instant gratification.',
    matchDensity: 0.70,
    decoyRatio: 0.15,
    idealAddRows: 1,
    rescuePairRatio: 0.80,
    rescueThreshold: 2,
    stragglerThreshold: 2,
  },
  2: {
    level: 2,
    targetTimeSeconds: 60,
    experienceGoal: 'Easy-Normal. Slightly harder than Level 1.',
    matchDensity: 0.65,
    decoyRatio: 0.20,
    idealAddRows: 1,
    rescuePairRatio: 0.75,
    rescueThreshold: 2,
    stragglerThreshold: 2,
  },
  3: {
    level: 3,
    targetTimeSeconds: 90,
    experienceGoal: 'Normal. Requires scanning.',
    matchDensity: 0.55,
    decoyRatio: 0.30,
    idealAddRows: 2,
    rescuePairRatio: 0.65,
    rescueThreshold: 2,
    stragglerThreshold: 3,
  },
  4: {
    level: 4,
    targetTimeSeconds: 120,
    experienceGoal: 'Normal-Hard. Careful scanning needed.',
    matchDensity: 0.45,
    decoyRatio: 0.40,
    idealAddRows: 3,
    rescuePairRatio: 0.55,
    rescueThreshold: 2,
    stragglerThreshold: 3,
  },
  5: {
    level: 5,
    targetTimeSeconds: 150,
    experienceGoal: 'Hard. Matches are buried behind decoys.',
    matchDensity: 0.35,
    decoyRatio: 0.55,
    idealAddRows: 3,
    rescuePairRatio: 0.45,
    rescueThreshold: 2,
    stragglerThreshold: 3,
  },
  6: {
    level: 6,
    targetTimeSeconds: 90,
    experienceGoal: 'Relief. Back to Normal difficulty (like Level 3).',
    matchDensity: 0.55,
    decoyRatio: 0.30,
    idealAddRows: 3,
    rescuePairRatio: 0.65,
    rescueThreshold: 2,
    stragglerThreshold: 3,
  },
  7: {
    level: 7,
    targetTimeSeconds: 120,
    experienceGoal: 'Hard. Ramps up beyond Level 5.',
    matchDensity: 0.40,
    decoyRatio: 0.50,
    idealAddRows: 4,
    rescuePairRatio: 0.40,
    rescueThreshold: 2,
    stragglerThreshold: 3,
  },
  8: {
    level: 8,
    targetTimeSeconds: 150,
    experienceGoal: 'Very Hard. Harder than Level 5.',
    matchDensity: 0.30,
    decoyRatio: 0.60,
    idealAddRows: 4,
    rescuePairRatio: 0.35,
    rescueThreshold: 2,
    stragglerThreshold: 4,
  },
  9: {
    level: 9,
    targetTimeSeconds: 180,
    experienceGoal: 'Very Hard. Near-peak challenge.',
    matchDensity: 0.25,
    decoyRatio: 0.65,
    idealAddRows: 5,
    rescuePairRatio: 0.30,
    rescueThreshold: 2,
    stragglerThreshold: 4,
  },
  10: {
    level: 10,
    targetTimeSeconds: 210,
    experienceGoal: 'Peak Difficulty. Maximum decoy interference.',
    matchDensity: 0.20,
    decoyRatio: 0.70,
    idealAddRows: 5,
    rescuePairRatio: 0.25,
    rescueThreshold: 2,
    stragglerThreshold: 4,
  },
  11: {
    level: 11,
    targetTimeSeconds: 90,
    experienceGoal: 'Relief. Reset difficulty like Level 3.',
    matchDensity: 0.55,
    decoyRatio: 0.30,
    idealAddRows: 3,
    rescuePairRatio: 0.65,
    rescueThreshold: 2,
    stragglerThreshold: 3,
  },
};

export const MAX_ADD_ROWS_PER_LEVEL = 6;
export const GRID_COLS = 9;
export const INITIAL_ROWS = 3;

/**
 * Get config for a given level. Levels > 11 cycle back to level 7+ pattern.
 */
export function getLevelConfig(level: number): LevelConfig {
  if (LEVEL_CONFIGS[level]) return LEVEL_CONFIGS[level];
  // For levels beyond 11, cycle: relief every 5 levels
  const cyclePos = ((level - 7) % 5) + 7;
  const base = LEVEL_CONFIGS[Math.min(cyclePos, 10)];
  return {
    ...base,
    level,
    targetTimeSeconds: base.targetTimeSeconds + (level - 10) * 30,
  };
}
