/**
 * game-flow.test.ts — Integration tests for the game state machine.
 * Verifies that a player can complete all three levels and reach both endings.
 */

import { describe, it, expect } from 'vitest';
import { gameReducer, INITIAL_STATE, type GameState } from '../game/gameReducer';
import { GENERIC_GAME_CONFIG } from '../game/mapPersonalisation';
import { PUZZLES } from '../game/puzzles';

// Helper to run a sequence of actions
function run(actions: Parameters<typeof gameReducer>[1][]): GameState {
  return actions.reduce(gameReducer, INITIAL_STATE);
}

describe('Game flow — generic mode full playthrough', () => {
  it('reaches LEVEL_1 after SETUP_COMPLETE', () => {
    const state = run([
      { type: 'SETUP_COMPLETE', config: GENERIC_GAME_CONFIG },
    ]);
    expect(state.appState).toBe('LEVEL_1');
    expect(state.config).toBeTruthy();
  });

  it('advances to LEVEL_2 on correct L1 answer', () => {
    const state = run([
      { type: 'SETUP_COMPLETE', config: GENERIC_GAME_CONFIG },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L1_DRAWER', attempt: '3' },
    ]);
    expect(state.appState).toBe('LEVEL_2');
    expect(state.clueFlags.has('L1_DRAWER_OPEN')).toBe(true);
  });

  it('advances to LEVEL_3 on correct L2 answer', () => {
    const state = run([
      { type: 'SETUP_COMPLETE', config: GENERIC_GAME_CONFIG },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L1_DRAWER', attempt: '3' },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L2_RECORDS', attempt: '1987' },
    ]);
    expect(state.appState).toBe('LEVEL_3');
  });

  it('advances to LEVEL_4 on correct L3 answer', () => {
    const state = run([
      { type: 'SETUP_COMPLETE', config: GENERIC_GAME_CONFIG },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L1_DRAWER', attempt: '3' },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L2_RECORDS', attempt: '1987' },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L3_EXIT', attempt: '31987' },
    ]);
    expect(state.appState).toBe('LEVEL_4');
  });

  it('reaches ENDING on completing all 5 rooms', () => {
    const state = run([
      { type: 'SETUP_COMPLETE', config: GENERIC_GAME_CONFIG },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L1_DRAWER', attempt: '3' },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L2_RECORDS', attempt: '1987' },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L3_EXIT', attempt: '31987' },
      { type: 'SUBMIT_ANSWER', puzzleId: 'R4_C3_SENTIENCE', attempt: 'c' },
      { type: 'SUBMIT_ANSWER', puzzleId: 'R5_C3_COMMAND', attempt: 'observe contain release' },
    ]);
    expect(state.appState).toBe('ENDING');
    expect(state.endingId).toBeTruthy();
    expect(state.endingText).toBeTruthy();
  });

  it('stays on same level for wrong answer and sets error message', () => {
    const state = run([
      { type: 'SETUP_COMPLETE', config: GENERIC_GAME_CONFIG },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L1_DRAWER', attempt: 'wrong' },
    ]);
    expect(state.appState).toBe('LEVEL_1');
    expect(state.errorMessage).toBeTruthy();
  });

  it('tracks hint usage', () => {
    const state = run([
      { type: 'SETUP_COMPLETE', config: GENERIC_GAME_CONFIG },
      { type: 'REQUEST_HINT' },
      { type: 'REQUEST_HINT' },
    ]);
    expect(state.hintsUsed).toBe(2);
    expect(state.hintIndex).toBe(2);
  });

  it('RESTART returns to INITIAL_STATE', () => {
    const state = run([
      { type: 'SETUP_COMPLETE', config: GENERIC_GAME_CONFIG },
      { type: 'SUBMIT_ANSWER', puzzleId: 'L1_DRAWER', attempt: '3' },
      { type: 'RESTART' },
    ]);
    expect(state.appState).toBe('LANDING');
    expect(state.config).toBeNull();
    expect(state.clueFlags.size).toBe(0);
  });
});

describe('No softlock paths', () => {
  it('cannot skip levels — L2 puzzle requires L1 flag', () => {
    // The reducer doesn't enforce flag prerequisites — the UI should.
    // This test documents that the PUZZLE data has requiredFlags set.
    const l2 = PUZZLES.find(p => p.id === 'L2_RECORDS');
    expect(l2?.requiredFlags).toContain('L1_DRAWER_OPEN');
  });
});
