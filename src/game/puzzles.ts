/**
 * puzzles.ts — Puzzle data definitions.
 *
 * Puzzles are defined as pure data. The game engine is logic-only.
 * Adding a new puzzle = new entry here. No engine changes needed.
 *
 * answer validation is deterministic — answers are fixed strings or
 * derived by tested functions, never from LLM output.
 */

export interface Puzzle {
  id:            string;
  level:         1 | 2 | 3;
  promptText:    string;
  /** All accepted answers (case-insensitive trimmed). */
  acceptedAnswers: string[];
  hints:         string[];
  /** Clue flags unlocked on success. */
  successFlags:  string[];
  /** Clue flags that must already be set to unlock this puzzle. */
  requiredFlags: string[];
}

export const PUZZLES: Puzzle[] = [
  // ── Level 1 ──────────────────────────────────────────────────────────────
  {
    id:             'L1_DRAWER',
    level:          1,
    promptText:     'The drawer is locked. A pattern of symbols is etched above it. Count the shapes.',
    acceptedAnswers: ['3', 'three'],
    hints: [
      'Look at the symbols more carefully.',
      'Count only the shapes with straight edges.',
      'There are exactly three.',
    ],
    successFlags:  ['L1_DRAWER_OPEN'],
    requiredFlags: [],
  },

  // ── Level 2 ──────────────────────────────────────────────────────────────
  {
    id:             'L2_RECORDS',
    level:          2,
    promptText:     'Two files. The dates contradict each other. What year appears in both?',
    acceptedAnswers: ['1987'],
    hints: [
      'One file is dated 1987. The other mentions a year in the metadata.',
      'Compare the creation dates of RECORD_A and RECORD_B.',
      'Both reference 1987.',
    ],
    successFlags:  ['L2_CONTRADICTION_FOUND'],
    requiredFlags: ['L1_DRAWER_OPEN'],
  },

  // ── Level 3 ──────────────────────────────────────────────────────────────
  {
    id:             'L3_EXIT',
    level:          3,
    promptText:     'The exit requires a code. You have seen all the pieces.',
    acceptedAnswers: ['31987'], // Combines L1 answer (3) + L2 year (1987)
    hints: [
      'Your first answer and the year you found are connected.',
      'Combine the count from Level 1 and the year from Level 2.',
      '3 + 1987 = 31987',
    ],
    successFlags:  ['L3_EXIT_OPEN'],
    requiredFlags: ['L1_DRAWER_OPEN', 'L2_CONTRADICTION_FOUND'],
  },
];

export function getPuzzleById(id: string): Puzzle | undefined {
  return PUZZLES.find(p => p.id === id);
}

export function getPuzzlesForLevel(level: 1 | 2 | 3): Puzzle[] {
  return PUZZLES.filter(p => p.level === level);
}

/** Validate an answer attempt (case-insensitive, trimmed). */
export function validateAnswer(puzzle: Puzzle, attempt: string): boolean {
  const normalised = attempt.trim().toLowerCase();
  return puzzle.acceptedAnswers.some(a => a.toLowerCase() === normalised);
}
