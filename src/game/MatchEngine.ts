/**
 * MatchEngine.ts
 *
 * Detects valid matches on the Number Match Puzzle board.
 *
 * Match rules:
 *   1. Two cells match if they have the SAME number, OR if they SUM to 10.
 *   2. Cells must be "adjacent" via one of:
 *      - Horizontal (same row, consecutive columns)
 *      - Vertical   (same column, consecutive rows)
 *      - Diagonal   (±1 row, ±1 col)
 *      - Wrap-Around: last cell of row N and first cell of row N+1
 *
 * A match is also valid if the PATH between two non-adjacent cells passes
 * only through already-cleared (empty) cells. This is the classic
 * "Number Match" game mechanic.
 */

export interface Cell {
  id: string;          // `${row}-${col}`
  value: number;       // 1–9
  matched: boolean;    // cleared from board
  selected: boolean;   // currently highlighted by player
}

export type Board = Cell[][];

const COLS = 9;

/** Flat index from (row, col) */
function idx(row: number, col: number): number {
  return row * COLS + col;
}

/** (row, col) from flat index */
function pos(flatIndex: number): [number, number] {
  return [Math.floor(flatIndex / COLS), flatIndex % COLS];
}

/**
 * Returns true if two numbers form a valid match (same OR sum to 10).
 */
export function valuesMatch(a: number, b: number): boolean {
  return a === b || a + b === 10;
}

/**
 * Get the flat representation of the board (row-major order),
 * including only non-matched cells (returns 0 for matched/empty slots).
 */
function flatBoard(board: Board): number[] {
  const result: number[] = [];
  for (const row of board) {
    for (const cell of row) {
      result.push(cell.matched ? 0 : cell.value);
    }
  }
  return result;
}

/**
 * Check if two positions have a clear line-of-sight (all cells between them
 * are matched/empty). This allows matching over gaps.
 *
 * For horizontal: same row, cells between col_a and col_b all matched.
 * For vertical:   same col, cells between row_a and row_b all matched.
 * For diagonal:   |dr| == |dc|, all intermediate diagonal cells matched.
 * For wrap-around: the linear segment flat[a+1 .. b-1] all matched.
 */
function hasLineOfSight(
  flat: number[],
  rows: number,
  idxA: number,
  idxB: number
): boolean {
  if (idxA === idxB) return false;
  const [rA, cA] = pos(idxA);
  const [rB, cB] = pos(idxB);

  // Helper: all flat indices between two points must be 0 (matched)
  const allClear = (indices: number[]) => indices.every((i) => flat[i] === 0);

  // --- Horizontal (same row) ---
  if (rA === rB) {
    const [c1, c2] = [Math.min(cA, cB), Math.max(cA, cB)];
    const between = [];
    for (let c = c1 + 1; c < c2; c++) between.push(idx(rA, c));
    return allClear(between);
  }

  // --- Vertical (same column) ---
  if (cA === cB) {
    const [r1, r2] = [Math.min(rA, rB), Math.max(rA, rB)];
    const between = [];
    for (let r = r1 + 1; r < r2; r++) between.push(idx(r, cA));
    return allClear(between);
  }

  // --- Diagonal ---
  const dr = Math.sign(rB - rA);
  const dc = Math.sign(cB - cA);
  if (Math.abs(rB - rA) === Math.abs(cB - cA)) {
    const between = [];
    let r = rA + dr;
    let c = cA + dc;
    while (r !== rB || c !== cB) {
      between.push(idx(r, c));
      r += dr;
      c += dc;
    }
    return allClear(between);
  }

  // --- Wrap-Around: flat adjacency (idxA and idxB are consecutive in flat) ---
  const [i1, i2] = [Math.min(idxA, idxB), Math.max(idxA, idxB)];
  const between = [];
  for (let i = i1 + 1; i < i2; i++) between.push(i);
  return allClear(between);
}

/**
 * Find ALL valid match pairs currently on the board.
 * Returns an array of [cellA_id, cellB_id] pairs.
 */
export function findAllMatches(board: Board): [string, string][] {
  const rows = board.length;
  const flat = flatBoard(board);
  const totalCells = flat.length;
  const pairs: [string, string][] = [];

  for (let i = 0; i < totalCells; i++) {
    if (flat[i] === 0) continue; // already matched

    for (let j = i + 1; j < totalCells; j++) {
      if (flat[j] === 0) continue;

      if (!valuesMatch(flat[i], flat[j])) continue;

      if (hasLineOfSight(flat, rows, i, j)) {
        const [rA, cA] = pos(i);
        const [rB, cB] = pos(j);
        pairs.push([`${rA}-${cA}`, `${rB}-${cB}`]);
      }
    }
  }

  return pairs;
}

/**
 * Check if two specific cells on the board are a valid match.
 */
export function areCellsMatchable(board: Board, idA: string, idB: string): boolean {
  const rows = board.length;
  const flat = flatBoard(board);

  const [rA, cA] = idA.split('-').map(Number);
  const [rB, cB] = idB.split('-').map(Number);

  const cellA = board[rA]?.[cA];
  const cellB = board[rB]?.[cB];

  if (!cellA || !cellB) return false;
  if (cellA.matched || cellB.matched) return false;
  if (!valuesMatch(cellA.value, cellB.value)) return false;

  return hasLineOfSight(flat, rows, idx(rA, cA), idx(rB, cB));
}

/**
 * Apply a match: mark both cells as matched, return the updated board.
 */
export function applyMatch(board: Board, idA: string, idB: string): Board {
  return board.map((row) =>
    row.map((cell) =>
      cell.id === idA || cell.id === idB ? { ...cell, matched: true, selected: false } : cell
    )
  );
}

/**
 * Returns true if every cell is matched (level complete).
 */
export function isBoardCleared(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell.matched));
}

/**
 * Returns true if there are NO possible matches left (stuck state).
 */
export function isStuck(board: Board): boolean {
  return findAllMatches(board).length === 0;
}

/**
 * Count how many rows have exactly 1 remaining unmatched cell (stragglers).
 */
export function countStragglerRows(board: Board): number {
  return board.filter(
    (row) => row.filter((c) => !c.matched).length === 1
  ).length;
}

/**
 * Get the values of straggler cells (to help AddRowLogic target them).
 */
export function getStragglerValues(board: Board): number[] {
  const values: number[] = [];
  for (const row of board) {
    const unmatched = row.filter((c) => !c.matched);
    if (unmatched.length === 1) values.push(unmatched[0].value);
  }
  return values;
}

/**
 * Get all currently unmatched values on the board (for Add Row analysis).
 */
export function getUnmatchedValues(board: Board): number[] {
  const values: number[] = [];
  for (const row of board) {
    for (const cell of row) {
      if (!cell.matched) values.push(cell.value);
    }
  }
  return values;
}
