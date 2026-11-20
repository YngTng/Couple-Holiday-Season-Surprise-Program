/**
 * The single time zone used for every unlock and theme decision.
 * Change this one constant if the "day" should roll over somewhere else.
 */
export const UNLOCK_TZ = 'UTC';

/** Calendar dates (YYYY-MM-DD in UNLOCK_TZ) that drive the theme system. */
export const THEME_DATES = {
  /** First day of the "Missing You" theme (until REUNION_AT). Before it, the cosy theme shows. */
  missingFrom: '2026-12-11',
  // Together Mode has no date here: it starts at REUNION_AT below, at the reunion moment.
  christmas: '2026-12-25',
} as const;

/** Reunion moment: when you are back together, e.g. 6:00 pm on Dec 20, 2026 (UNLOCK_TZ). */
export const REUNION_AT = { year: 2026, month: 12, day: 20, hour: 18, minute: 0 } as const;
