/**
 * puzzles.test.ts — Tests for puzzle data and answer validation.
 */

import { describe, it, expect } from 'vitest';
import { PUZZLES, validateAnswer, getPuzzleById, getPuzzlesForLevel } from '../game/puzzles';

describe('Puzzle data integrity', () => {
  it('every puzzle has at least one accepted answer', () => {
    PUZZLES.forEach(p => {
      expect(p.acceptedAnswers.length).toBeGreaterThan(0);
    });
  });

  it('every puzzle has at least one hint', () => {
    PUZZLES.forEach(p => {
      expect(p.hints.length).toBeGreaterThan(0);
    });
  });

  it('every puzzle ID is unique', () => {
    const ids = PUZZLES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all three levels have at least one puzzle', () => {
    expect(getPuzzlesForLevel(1).length).toBeGreaterThan(0);
    expect(getPuzzlesForLevel(2).length).toBeGreaterThan(0);
    expect(getPuzzlesForLevel(3).length).toBeGreaterThan(0);
  });
});

describe('validateAnswer', () => {
  it('accepts a correct answer', () => {
    const puzzle = getPuzzleById('L1_DRAWER')!;
    expect(validateAnswer(puzzle, '3')).toBe(true);
  });

  it('accepts case-insensitive variants', () => {
    const puzzle = getPuzzleById('L1_DRAWER')!;
    expect(validateAnswer(puzzle, 'THREE')).toBe(true);
    expect(validateAnswer(puzzle, 'Three')).toBe(true);
  });

  it('accepts trimmed whitespace', () => {
    const puzzle = getPuzzleById('L1_DRAWER')!;
    expect(validateAnswer(puzzle, '  3  ')).toBe(true);
  });

  it('rejects a wrong answer', () => {
    const puzzle = getPuzzleById('L1_DRAWER')!;
    expect(validateAnswer(puzzle, '99')).toBe(false);
  });

  it('rejects empty string', () => {
    const puzzle = getPuzzleById('L1_DRAWER')!;
    expect(validateAnswer(puzzle, '')).toBe(false);
  });
});

describe('Level 3 exit code', () => {
  it('the exit code is deterministically derived from L1 + L2 answers', () => {
    const puzzle = getPuzzleById('L3_EXIT')!;
    expect(validateAnswer(puzzle, '31987')).toBe(true);
  });
});
