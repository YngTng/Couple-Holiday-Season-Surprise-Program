/** localStorage keys for personal bests. */
export const BEST_KEYS = {
  /** Fastest Rebuild Us jigsaw, in whole seconds. */
  puzzle: 'december-exe:best-puzzle-seconds',
  /** Highest Jar Full Of You score. */
  merge: 'december-exe:best-merge-score',
  /** Best quiz score (correct answers). */
  quiz: 'december-exe:best-quiz-score',
} as const;

/** Set to true once they get every quiz question right; unlocks the coupon for good. */
export const QUIZ_COUPON_KEY = 'december-exe:quiz-coupon-won';

/** Set to true once they reach the winning score in Jar Full Of You; unlocks its prize for good. */
export const MERGE_PRIZE_KEY = 'december-exe:merge-prize-won';

/** Set to true once they finish the Rebuild Us jigsaw; unlocks its prize for good. */
export const PUZZLE_PRIZE_KEY = 'december-exe:puzzle-prize-won';

/** 83 → "1:23" */
export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
