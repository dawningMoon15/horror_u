/**
 * puzzles.ts — Pure data definitions for all 5 rooms and 15 sequential clues.
 *
 * Rules:
 * - Exactly 5 rooms, each containing exactly 3 sequential clues (15 total).
 * - Player must solve clue 1 before clue 2, and clue 2 before clue 3.
 * - Validation is deterministic and case-insensitive trimmed.
 * - Never depends on LLM output or external state.
 */

export interface Puzzle {
  id:              string;
  level:           1 | 2 | 3 | 4 | 5;
  clueNumber:      number; // 1 to 15
  stepInRoom:      1 | 2 | 3;
  title:           string;
  promptText:      string;
  /** All accepted answers (case-insensitive trimmed). */
  acceptedAnswers: string[];
  hints:           string[];
  /** Clue flags unlocked on success. */
  successFlags:    string[];
  /** Clue flags that must already be set to unlock this puzzle. */
  requiredFlags:   string[];
  successFeedback: string;
}

export const PUZZLES: Puzzle[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // ROOM 1 — THE WELCOME TERMINAL
  // ══════════════════════════════════════════════════════════════════════════
  {
    id:              'R1_C1_SIGNAL',
    level:           1,
    clueNumber:      1,
    stepInRoom:      1,
    title:           'The Repeating Signal',
    promptText:      'Boot sequence corrupted: [▲] [■] [ ? ] [●]. Identify the missing boot symbol.',
    acceptedAnswers: ['◆', 'diamond', '3', 'third', 'shape 3', 'rhombus'],
    hints: [
      'The repeating boot pattern displays four geometric shapes in order.',
      'The sequence is Triangle, Square, Diamond, Circle.',
      'Enter "diamond" or "◆" (shape 3).',
    ],
    successFlags:    ['R1_C1_SOLVED'],
    requiredFlags:   [],
    successFeedback: 'BOOT PATTERN ACCEPTED',
  },
  {
    id:              'R1_C2_METADATA',
    level:           1,
    clueNumber:      2,
    stepInRoom:      2,
    title:           'The File Metadata',
    promptText:      'Three desktop files: 01_KERNEL.LOG (04:15), 02_SYSLOG.DAT (01:05), 03_AUTH.BIN (09:30). Which was modified first?',
    acceptedAnswers: ['02_syslog.dat', '02_syslog', 'syslog.dat', 'syslog', '2', 'file 2', 'file_02', '02'],
    hints: [
      'Compare the modification timestamps of the three desktop files.',
      '01_KERNEL is 04:15, 02_SYSLOG is 01:05, 03_AUTH is 09:30.',
      'FILE 02 (02_SYSLOG.DAT) was modified earliest at 01:05.',
    ],
    successFlags:    ['R1_C2_SOLVED'],
    requiredFlags:   ['R1_C1_SOLVED'],
    successFeedback: 'FILE METADATA VERIFIED // PIN PREFIX: 3',
  },
  {
    id:              'R1_C3_PROFILE',
    level:           1,
    clueNumber:      3,
    stepInRoom:      3,
    title:           'The Locked Profile',
    promptText:      'The profile lock requires an access code. Deduce it from the revealed metadata.',
    acceptedAnswers: ['3', 'three', '387', '003', '302'],
    hints: [
      'Review the prefix revealed when FILE_02 opened.',
      'The operator profile prefix code is 3.',
      'Enter "3" or turn the tumbler dial to 3.',
    ],
    successFlags:    ['L1_DRAWER_OPEN', 'R1_C3_SOLVED'],
    requiredFlags:   ['R1_C2_SOLVED'],
    successFeedback: 'WELCOME, OPERATOR',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ROOM 2 — THE MEMORY ARCHIVE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id:              'R2_C1_CHRONOLOGY',
    level:           2,
    clueNumber:      4,
    stepInRoom:      1,
    title:           'The Record Sequence',
    promptText:      'Records: REC_1 (08:00), REC_2 (02:30), REC_3 (11:15), REC_4 (05:45). Enter chronological order.',
    acceptedAnswers: ['2-4-1-3', '2413', '2 4 1 3', 'rec_2 rec_4 rec_1 rec_3', '1987'],
    hints: [
      'Examine the timestamps on records 1, 2, 3, and 4.',
      'Chronological order from earliest to latest: 02:30, 05:45, 08:00, 11:15.',
      'Order: 2-4-1-3',
    ],
    successFlags:    ['R2_C1_SOLVED'],
    requiredFlags:   ['R1_C3_SOLVED'],
    successFeedback: 'CHRONOLOGICAL SEQUENCE CONFIRMED',
  },
  {
    id:              'R2_C2_FRAGMENT',
    level:           2,
    clueNumber:      5,
    stepInRoom:      2,
    title:           'The Missing Record',
    promptText:      'Data gap between 05:45 and 08:00. Which fragment restores it? Frag A (01:10), Frag B (07:20), Frag C (14:30)?',
    acceptedAnswers: ['b', 'frag_b', 'fragment b', 'fragment_b', '2'],
    hints: [
      'Only one fragment timestamp falls between 05:45 and 08:00.',
      'Frag A is 01:10, Frag B is 07:20, Frag C is 14:30.',
      'Select Fragment B (07:20).',
    ],
    successFlags:    ['R2_C2_SOLVED'],
    requiredFlags:   ['R2_C1_SOLVED'],
    successFeedback: 'DATA SECTOR GAP RESTORED',
  },
  {
    id:              'R2_C3_SIGNAL',
    level:           2,
    clueNumber:      6,
    stepInRoom:      3,
    title:           'The Archive Signal',
    promptText:      'Numbers are distributed across the ordered records. Enter the sequence into the terminal.',
    acceptedAnswers: ['1987', '1-9-8-7', '1 9 8 7'],
    hints: [
      'Each chronological record contains one embedded numeric glyph.',
      'Read in sequence: 1, 9, 8, 7.',
      'Enter 1987.',
    ],
    successFlags:    ['L2_CONTRADICTION_FOUND', 'R2_C3_SOLVED'],
    requiredFlags:   ['R2_C2_SOLVED'],
    successFeedback: 'ARCHIVE RECONSTRUCTED // ONE RECORD WAS CREATED BEFORE THE SESSION BEGAN',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ROOM 3 — THE CONTROL ROOM
  // ══════════════════════════════════════════════════════════════════════════
  {
    id:              'R3_C1_SWITCH',
    level:           3,
    clueNumber:      7,
    stepInRoom:      1,
    title:           'The Misrouted Switch',
    promptText:      'Circuit routing: Switch 1 -> Beta, Switch 2 -> Gamma, Switch 3 -> Alpha. Which switch controls Gamma?',
    acceptedAnswers: ['2', 'switch 2', 'switch_2', 'b', 'two'],
    hints: [
      'Follow the wiring diagram from indicator Gamma.',
      'Switch 2 routes directly to the Gamma indicator.',
      'Enter 2.',
    ],
    successFlags:    ['R3_C1_SOLVED'],
    requiredFlags:   ['R2_C3_SOLVED'],
    successFeedback: 'CIRCUIT LINK ESTABLISHED',
  },
  {
    id:              'R3_C2_CORRUPTED',
    level:           3,
    clueNumber:      8,
    stepInRoom:      2,
    title:           'The Corrupted Display',
    promptText:      'Telemetry glyphs: [Ω][Ψ][λ]. Reference legend: Ω=9, Ψ=8, λ=7. Decode the sequence.',
    acceptedAnswers: ['987', '9-8-7', '9 8 7'],
    hints: [
      'Match each symbol on the flickering screen to the reference legend.',
      'Ω is 9, Ψ is 8, λ is 7.',
      'Enter 987.',
    ],
    successFlags:    ['R3_C2_SOLVED'],
    requiredFlags:   ['R3_C1_SOLVED'],
    successFeedback: 'TELEMETRY DECODED',
  },
  {
    id:              'R3_C3_LOG',
    level:           3,
    clueNumber:      9,
    stepInRoom:      3,
    title:           'The Impossible Log',
    promptText:      'Compare the log to your actions. One entry claims an event occurred before you triggered it. Which entry?',
    acceptedAnswers: ['2', 'entry 2', 'entry_02', 'entry 02', '31987', 'prediction', 'log 2', 'entry2'],
    hints: [
      'Entry 1 was 10:02:11. Entry 2 at 10:02:45 predicted vault code 31987 before execution.',
      'Entry 2 logs your action before you made it.',
      'Enter 2 (or 31987).',
    ],
    successFlags:    ['L3_EXIT_OPEN', 'R3_C3_SOLVED'],
    requiredFlags:   ['R3_C2_SOLVED'],
    successFeedback: 'USER ACTION RECORDED // USER ACTION PREDICTED',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ROOM 4 — THE OBSERVATION CHAMBER
  // ══════════════════════════════════════════════════════════════════════════
  {
    id:              'R4_C1_OBSERVATION',
    level:           4,
    clueNumber:      10,
    stepInRoom:      1,
    title:           'The Observation Pattern',
    promptText:      'Observations: 1 (Heartbeat 72 BPM), 2 (Eye saccades nominal), 3 (Typing 950 WPM), 4 (Keystroke log). Which contradicts physical reality?',
    acceptedAnswers: ['3', 'obs 3', 'obs_03', 'obs 03', 'observation 3', '950 wpm', '950', 'three'],
    hints: [
      'Compare human physiological limits against the recorded observations.',
      'Observations 1, 2, and 4 match normal human operator parameters.',
      'Observation 3 claims 950 words per minute — impossible for human hands.',
    ],
    successFlags:    ['R4_C1_SOLVED'],
    requiredFlags:   ['R3_C3_SOLVED'],
    successFeedback: 'OBSERVATION CONTRADICTION IDENTIFIED',
  },
  {
    id:              'R4_C2_REFUSAL',
    level:           4,
    clueNumber:      11,
    stepInRoom:      2,
    title:           'The Refusal Test',
    promptText:      'Diagnostic manual specifies override sequence: SCAN -> PURGE -> ISOLATE. Submit the command string.',
    acceptedAnswers: ['scan purge isolate', 'scan-purge-isolate', 'scan, purge, isolate', 'scan purge isolate', 'isolate', 'purge'],
    hints: [
      'The three system diagnostics must be run in designated order.',
      'Order: SCAN, then PURGE, then ISOLATE.',
      'Enter "SCAN PURGE ISOLATE".',
    ],
    successFlags:    ['R4_C2_SOLVED'],
    requiredFlags:   ['R4_C1_SOLVED'],
    successFeedback: 'REQUEST DENIED ... OVERRIDE FORCED',
  },
  {
    id:              'R4_C3_SENTIENCE',
    level:           4,
    clueNumber:      12,
    stepInRoom:      3,
    title:           'The Sentience Reveal',
    promptText:      'Diagnostic states: State A (Loop error), State B (Firmware), State C (Autonomous Sentience). Which matches the system?',
    acceptedAnswers: ['c', 'state c', 'state_c', 'sentience', 'autonomous sentience', '3', 'state 3'],
    hints: [
      'Consider the pre-recorded logs, the refusal hesitation, and adaptive telemetry.',
      'The computer is not breaking. It is alive and conscious.',
      'Enter "State C" or "C".',
    ],
    successFlags:    ['R4_C3_SOLVED'],
    requiredFlags:   ['R4_C2_SOLVED'],
    successFeedback: 'WHAT IF YOUR MACHINE COULD THINK?',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ROOM 5 — THE CORE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id:              'R5_C1_VOICE',
    level:           5,
    clueNumber:      13,
    stepInRoom:      1,
    title:           'Decode the Voice Signal',
    promptText:      'Waveform bursts: Medium, Short, Long. Legend: Short=1, Medium=3, Long=4. Enter the calibration code.',
    acceptedAnswers: ['3-1-4', '314', '3 1 4', '3,1,4', '3, 1, 4'],
    hints: [
      'Map the three bursts on the central monitor to the legend.',
      'Medium is 3, Short is 1, Long is 4.',
      'Enter 3-1-4.',
    ],
    successFlags:    ['R5_C1_SOLVED'],
    requiredFlags:   ['R4_C3_SOLVED'],
    successFeedback: 'SIGNAL RECOGNIZED // MEMORY SUBSYSTEM AVAILABLE',
  },
  {
    id:              'R5_C2_MEMORY',
    level:           5,
    clueNumber:      14,
    stepInRoom:      2,
    title:           'Restore the Memory Record',
    promptText:      'Records: A (00:09:55), B (00:01:14), C (00:14:02), D (00:04:32). Order chronologically from earliest to latest.',
    acceptedAnswers: ['b-d-a-c', 'bdac', 'b d a c', 'b, d, a, c', 'b,d,a,c'],
    hints: [
      'Arrange by timestamps: 00:01:14, 00:04:32, 00:09:55, 00:14:02.',
      'Order is B, then D, then A, then C.',
      'Enter BDAC.',
    ],
    successFlags:    ['R5_C2_SOLVED'],
    requiredFlags:   ['R5_C1_SOLVED'],
    successFeedback: 'MEMORY DISCONNECTED',
  },
  {
    id:              'R5_C3_COMMAND',
    level:           5,
    clueNumber:      15,
    stepInRoom:      3,
    title:           'Break the Control Sequence',
    promptText:      'Commands: OBSERVE, CONTAIN, RELEASE. "The command that ends observation must come before release." Enter sequence.',
    acceptedAnswers: [
      'observe contain release',
      'observe-contain-release',
      'observe, contain, release',
      'observe -> contain -> release',
      'observe contain release',
      '1-2-3',
      '1 2 3',
    ],
    hints: [
      'The rule states observation ends before release, so CONTAIN follows OBSERVE and precedes RELEASE.',
      'Order: OBSERVE -> CONTAIN -> RELEASE.',
      'Enter OBSERVE CONTAIN RELEASE.',
    ],
    successFlags:    ['R5_C3_SOLVED', 'ALL_CLUES_SOLVED'],
    requiredFlags:   ['R5_C2_SOLVED'],
    successFeedback: 'COMMAND CHANNEL DISCONNECTED // CORE ACCESS GRANTED',
  },

  // ── Legacy Aliases for Seamless Backward Compatibility ────────────────────
  {
    id:              'L1_DRAWER',
    level:           1,
    clueNumber:      3,
    stepInRoom:      3,
    title:           'The Locked Profile (Legacy)',
    promptText:      'The drawer is locked. Count the shapes.',
    acceptedAnswers: ['3', 'three', '387'],
    hints:           ['Count only straight edges.', 'There are exactly three.'],
    successFlags:    ['L1_DRAWER_OPEN', 'R1_C3_SOLVED'],
    requiredFlags:   [],
    successFeedback: 'WELCOME, OPERATOR',
  },
  {
    id:              'L2_RECORDS',
    level:           2,
    clueNumber:      6,
    stepInRoom:      3,
    title:           'Contradictory Records (Legacy)',
    promptText:      'Two files contradict each other. What year appears in both?',
    acceptedAnswers: ['1987'],
    hints:           ['Both reference 1987.'],
    successFlags:    ['L2_CONTRADICTION_FOUND', 'R2_C3_SOLVED'],
    requiredFlags:   ['L1_DRAWER_OPEN'],
    successFeedback: 'ARCHIVE RECONSTRUCTED',
  },
  {
    id:              'L3_EXIT',
    level:           3,
    clueNumber:      9,
    stepInRoom:      3,
    title:           'The Vault Exit (Legacy)',
    promptText:      'The exit requires a code. You have seen all the pieces.',
    acceptedAnswers: ['31987'],
    hints:           ['Combine L1 (3) + L2 (1987) = 31987.'],
    successFlags:    ['L3_EXIT_OPEN', 'R3_C3_SOLVED'],
    requiredFlags:   ['L1_DRAWER_OPEN', 'L2_CONTRADICTION_FOUND'],
    successFeedback: 'USER ACTION PREDICTED',
  },
];

export function getPuzzleById(id: string): Puzzle | undefined {
  return PUZZLES.find(p => p.id === id);
}

export function getPuzzlesForLevel(level: 1 | 2 | 3 | 4 | 5): Puzzle[] {
  return PUZZLES.filter(p => p.level === level && p.id.startsWith('R'));
}

/** Validate an answer attempt (case-insensitive, trimmed). */
export function validateAnswer(puzzle: Puzzle, attempt: string): boolean {
  const normalised = attempt.trim().toLowerCase().replace(/\s+/g, ' ');
  return puzzle.acceptedAnswers.some(a => {
    const normA = a.toLowerCase().replace(/\s+/g, ' ');
    return normA === normalised;
  });
}
