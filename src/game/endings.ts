/**
 * endings.ts — Ending definitions and resolution logic.
 *
 * Endings are a decision table. Adding a third ending = one new entry.
 * No reducer changes needed.
 *
 * Priority: TRANSCEND is checked first; LOOP is the fallback.
 */

import type { GameConfig } from './schema';

export interface GameFlags {
  cluesFound: number;
  hintsUsed:  number;
  level:      1 | 2 | 3 | 4 | 5;
}

export interface EndingDefinition {
  id:       GameConfig['endingVariant'];
  title:    string;
  condition: (flags: GameFlags, config: GameConfig) => boolean;
  /** Keys into the narrative content system */
  narrativeVariants: Record<string, string>;
}

export const ENDING_DEFINITIONS: EndingDefinition[] = [
  {
    id:    'TRANSCEND',
    title: 'You Always Knew',
    condition: (flags, config) =>
      flags.cluesFound >= 3 &&
      flags.hintsUsed === 0 &&
      config.endingVariant === 'TRANSCEND',
    narrativeVariants: {
      default:          'You saw the pattern before it was shown to you.',
      rainy_noir:       'The rain knew. You always knew.',
      brutalist_digital:'PROCESS COMPLETE. MEMORY INTACT. YOU ALWAYS KNEW.',
      vaporwave_horror: 'you surfed the context wave all the way home',
    },
  },
  {
    id:    'LOOP',
    title: 'Still in Context',
    // Fallback — always true
    condition: () => true,
    narrativeVariants: {
      default: 'You found the exit. But the context remains.',
    },
  },
];

/** Evaluated in declaration order — first match wins. */
export function resolveEnding(
  flags: GameFlags,
  config: GameConfig,
): EndingDefinition {
  for (const ending of ENDING_DEFINITIONS) {
    if (ending.condition(flags, config)) return ending;
  }
  // TypeScript: unreachable because LOOP.condition always returns true
  throw new Error('resolveEnding: no ending matched — add a fallback');
}

export function getEndingNarrative(
  ending: EndingDefinition,
  visualVariant: string,
): string {
  return ending.narrativeVariants[visualVariant] ?? ending.narrativeVariants['default'];
}
