/**
 * gameReducer.ts — Pure finite-state machine for game progression.
 *
 * Rules:
 * - All state transitions go through this reducer. No scattered booleans.
 * - The reducer only consumes GameConfig and player actions.
 * - It never sees RawCapsule or any personal data.
 * - Progress is persisted as opaque flag IDs only (no content, no GameConfig).
 */

import { type GameConfig, type PersistedProgress, PROGRESS_SCHEMA_VERSION } from './schema';
import { getPuzzlesForLevel, getPuzzleById, validateAnswer } from './puzzles';
import { resolveEnding, getEndingNarrative, type GameFlags } from './endings';

// ─── App state machine ──────────────────────────────────────────────────────

export type AppState =
  | 'LANDING'
  | 'CONSENT'
  | 'PROMPT_READY'
  | 'CAPSULE_ENTRY'
  | 'VALIDATING'
  | 'GAME_SETUP'
  | 'LEVEL_1'
  | 'LEVEL_2'
  | 'LEVEL_3'
  | 'LEVEL_4'
  | 'LEVEL_5'
  | 'ENDING';

export interface GameState {
  appState:       AppState;
  config:         GameConfig | null;
  clueFlags:      Set<string>;
  currentPuzzleId: string | null;
  hintIndex:      number;
  hintsUsed:      number;
  endingId:       string | null;
  endingText:     string | null;
  errorMessage:   string | null;
}

export const INITIAL_STATE: GameState = {
  appState:        'LANDING',
  config:          null,
  clueFlags:       new Set(),
  currentPuzzleId: null,
  hintIndex:       0,
  hintsUsed:       0,
  endingId:        null,
  endingText:      null,
  errorMessage:    null,
};

// ─── Actions ────────────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'START_CONSENT' }
  | { type: 'CANCEL_CONSENT' }
  | { type: 'START_GENERIC' }
  | { type: 'PROMPT_READY' }
  | { type: 'OPEN_CAPSULE_ENTRY' }
  | { type: 'SETUP_COMPLETE'; config: GameConfig }
  | { type: 'SETUP_ERROR'; message: string }
  | { type: 'BEGIN_LEVEL'; level: 1 | 2 | 3 | 4 | 5 }
  | { type: 'SUBMIT_ANSWER'; puzzleId: string; attempt: string }
  | { type: 'REQUEST_HINT' }
  | { type: 'RESTART' };

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'START_CONSENT':
      return { ...state, appState: 'CONSENT', errorMessage: null };

    case 'CANCEL_CONSENT':
      return { ...state, appState: 'LANDING' };

    case 'START_GENERIC':
      return { ...state, appState: 'GAME_SETUP' };

    case 'PROMPT_READY':
      return { ...state, appState: 'PROMPT_READY' };

    case 'OPEN_CAPSULE_ENTRY':
      return { ...state, appState: 'CAPSULE_ENTRY', errorMessage: null };

    case 'SETUP_COMPLETE': {
      const puzzles = getPuzzlesForLevel(1);
      return {
        ...state,
        appState:        'LEVEL_1',
        config:          action.config,
        clueFlags:       new Set(),
        currentPuzzleId: puzzles[0]?.id ?? null,
        hintIndex:       0,
        hintsUsed:       0,
        endingId:        null,
        endingText:      null,
        errorMessage:    null,
      };
    }

    case 'SETUP_ERROR':
      return { ...state, appState: 'CAPSULE_ENTRY', errorMessage: action.message };

    case 'BEGIN_LEVEL': {
      const puzzles = getPuzzlesForLevel(action.level);
      const stateKey = `LEVEL_${action.level}` as AppState;
      return {
        ...state,
        appState:        stateKey,
        currentPuzzleId: puzzles[0]?.id ?? null,
        hintIndex:       0,
        errorMessage:    null,
      };
    }

    case 'SUBMIT_ANSWER': {
      const puzzle = getPuzzleById(action.puzzleId);
      if (!puzzle) return state;

      const correct = validateAnswer(puzzle, action.attempt);
      if (!correct) {
        return { ...state, errorMessage: 'Not quite. Try again.' };
      }

      const newFlags = new Set(state.clueFlags);
      puzzle.successFlags.forEach(f => newFlags.add(f));

      // Check if there are more sequential clues in this room
      const levelPuzzles = getPuzzlesForLevel(puzzle.level);
      const currentIndexInLevel = levelPuzzles.findIndex(p => p.id === puzzle.id);

      if (currentIndexInLevel !== -1 && currentIndexInLevel < levelPuzzles.length - 1) {
        // Advance to next sequential clue within this room
        const nextClue = levelPuzzles[currentIndexInLevel + 1];
        return {
          ...state,
          clueFlags:       newFlags,
          currentPuzzleId: nextClue.id,
          hintIndex:       0,
          errorMessage:    null,
        };
      }

      // Room completed! Transition to next room or ending
      let nextAppState: AppState = state.appState;
      let nextLevel: 1 | 2 | 3 | 4 | 5 = puzzle.level;

      if (puzzle.level === 1) {
        nextAppState = 'LEVEL_2';
        nextLevel = 2;
      } else if (puzzle.level === 2) {
        nextAppState = 'LEVEL_3';
        nextLevel = 3;
      } else if (puzzle.level === 3) {
        nextAppState = 'LEVEL_4';
        nextLevel = 4;
      } else if (puzzle.level === 4) {
        nextAppState = 'LEVEL_5';
        nextLevel = 5;
      } else if (puzzle.level === 5) {
        nextAppState = 'ENDING';
      }

      if (nextAppState === 'ENDING' && state.config) {
        const flags: GameFlags = {
          cluesFound: newFlags.size,
          hintsUsed:  state.hintsUsed,
          level:      5,
        };
        const ending   = resolveEnding(flags, state.config);
        const endingText = getEndingNarrative(ending, state.config.visualVariant);

        return {
          ...state,
          appState:   'ENDING',
          clueFlags:  newFlags,
          endingId:   ending.id,
          endingText,
          errorMessage: null,
        };
      }

      const nextPuzzles = getPuzzlesForLevel(nextLevel);
      return {
        ...state,
        appState:        nextAppState,
        clueFlags:       newFlags,
        currentPuzzleId: nextPuzzles[0]?.id ?? null,
        hintIndex:       0,
        errorMessage:    null,
      };
    }

    case 'REQUEST_HINT': {
      if (!state.currentPuzzleId) return state;
      const puzzle = getPuzzleById(state.currentPuzzleId);
      if (!puzzle) return state;
      const nextHintIndex = Math.min(state.hintIndex + 1, puzzle.hints.length);
      return {
        ...state,
        hintIndex:  nextHintIndex,
        hintsUsed:  state.hintsUsed + 1,
        errorMessage: null,
      };
    }

    case 'RESTART':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ─── Progress persistence (safe — no personal data) ─────────────────────────

export function saveProgress(state: GameState): void {
  if (!['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'].includes(state.appState)) return;
  const level = parseInt(state.appState.split('_')[1]) as 1 | 2 | 3 | 4 | 5;
  const progress: PersistedProgress = {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    level,
    clueFlags:     Array.from(state.clueFlags),
    hintsUsed:     state.hintsUsed,
  };
  try {
    sessionStorage.setItem('progress', JSON.stringify(progress));
  } catch {
    // Storage full or unavailable — non-fatal
  }
}

export function clearProgress(): void {
  try { sessionStorage.removeItem('progress'); } catch { /* non-fatal */ }
}
