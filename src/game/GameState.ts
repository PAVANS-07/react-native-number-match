/**
 * GameState.ts
 *
 * Central game state using React's useReducer pattern (no external deps).
 *
 * Manages:
 *   - Current board (Cell[][])
 *   - Selected cell (for tap-to-match)
 *   - Level number
 *   - Add Row count (max 6)
 *   - Matches made since last Add Row (for Rescue mechanic)
 *   - Win/stuck detection
 *   - Score (matches × 10)
 */

import { Board, Cell, areCellsMatchable, applyMatch, isBoardCleared, isStuck, findAllMatches } from './MatchEngine';
import { seedBoard } from './BoardSeeder';
import { addSmartRow, canAddRow, AddRowResult } from './AddRowLogic';
import { MAX_ADD_ROWS_PER_LEVEL } from './DifficultyConfig';

// ─── State Shape ──────────────────────────────────────────────────────────────

export interface GameState {
  level: number;
  board: Board;
  selectedCellId: string | null;
  addRowCount: number;
  matchesSinceLastAdd: number;
  totalMatches: number;
  score: number;
  status: 'playing' | 'won' | 'stuck';
  lastRescueTriggered: boolean;
  lastStragglerTriggered: boolean;
  addRowSeed: number;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'SELECT_CELL'; cellId: string }
  | { type: 'ADD_ROW' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'RESTART_LEVEL' }
  | { type: 'GO_TO_LEVEL'; level: number };

// ─── Initial State ────────────────────────────────────────────────────────────

function makeInitialState(level: number): GameState {
  return {
    level,
    board: seedBoard(level),
    selectedCellId: null,
    addRowCount: 0,
    matchesSinceLastAdd: 0,
    totalMatches: 0,
    score: 0,
    status: 'playing',
    lastRescueTriggered: false,
    lastStragglerTriggered: false,
    addRowSeed: level * 31337,
  };
}

export function createInitialState(level = 1): GameState {
  return makeInitialState(level);
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'SELECT_CELL': {
      if (state.status !== 'playing') return state;

      const { cellId } = action;
      const { board, selectedCellId } = state;

      // Deselect if tapping the same cell
      if (selectedCellId === cellId) {
        return {
          ...state,
          board: clearSelection(board),
          selectedCellId: null,
        };
      }

      // No cell selected yet → select this one
      if (!selectedCellId) {
        return {
          ...state,
          board: setSelected(board, cellId),
          selectedCellId: cellId,
        };
      }

      // A cell is already selected → check if these two match
      if (areCellsMatchable(board, selectedCellId, cellId)) {
        // Apply the match
        const newBoard = applyMatch(clearSelection(board), selectedCellId, cellId);
        const newMatches = state.totalMatches + 1;
        const newScore = state.score + 10;
        const newMatchesSinceLastAdd = state.matchesSinceLastAdd + 1;

        const won = isBoardCleared(newBoard);
        const stuck = !won && isStuck(newBoard) && !canAddRow(state.addRowCount);

        return {
          ...state,
          board: newBoard,
          selectedCellId: null,
          totalMatches: newMatches,
          score: newScore,
          matchesSinceLastAdd: newMatchesSinceLastAdd,
          status: won ? 'won' : stuck ? 'stuck' : 'playing',
          lastRescueTriggered: false,
          lastStragglerTriggered: false,
        };
      }

      // Cells don't match → switch selection to new cell
      return {
        ...state,
        board: setSelected(clearSelection(board), cellId),
        selectedCellId: cellId,
      };
    }

    case 'ADD_ROW': {
      if (state.status !== 'playing') return state;
      if (!canAddRow(state.addRowCount)) return state;

      const newSeed = state.addRowSeed + state.addRowCount * 7919;
      const result: AddRowResult = addSmartRow(
        {
          level: state.level,
          addRowCount: state.addRowCount,
          matchesSinceLastAdd: state.matchesSinceLastAdd,
          currentBoard: clearSelection(state.board),
        },
        newSeed
      );

      const newAddRowCount = state.addRowCount + 1;
      const stuck =
        isStuck(result.newBoard) && !canAddRow(newAddRowCount);

      return {
        ...state,
        board: result.newBoard,
        selectedCellId: null,
        addRowCount: newAddRowCount,
        matchesSinceLastAdd: 0, // reset after add row
        status: stuck ? 'stuck' : 'playing',
        lastRescueTriggered: result.triggeredRescue,
        lastStragglerTriggered: result.triggeredStraggler,
      };
    }

    case 'NEXT_LEVEL': {
      return makeInitialState(state.level + 1);
    }

    case 'RESTART_LEVEL': {
      return makeInitialState(state.level);
    }

    case 'GO_TO_LEVEL': {
      return makeInitialState(action.level);
    }

    default:
      return state;
  }
}

// ─── Board Helpers ───────────────────────────────────────────────────────────

function clearSelection(board: Board): Board {
  return board.map((row) =>
    row.map((cell) => (cell.selected ? { ...cell, selected: false } : cell))
  );
}

function setSelected(board: Board, cellId: string): Board {
  return board.map((row) =>
    row.map((cell) =>
      cell.id === cellId ? { ...cell, selected: true } : cell
    )
  );
}
