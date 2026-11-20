import { THEME_DATES } from '../config/time';
import { REUNION_MS } from '../lib/reunion';

export const THEME_IDS = ['cosy', 'missing', 'together', 'christmas'] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type WallpaperChoice = 'auto' | ThemeId;

export interface ThemeInfo {
  label: string;
  dates: string;
}

export const THEMES: Record<ThemeId, ThemeInfo> = {
  cosy: { label: 'Cosy December', dates: 'until Dec 10' },
  missing: { label: 'Missing You', dates: 'Dec 11 – Dec 20, 6:00 pm' },
  together: { label: 'Together Mode', dates: 'from Dec 20, 6:00 pm' },
  christmas: { label: 'Christmas', dates: 'Dec 25' },
};

/**
 * Christmas is a single day and beats the ranges around it.
 * Together Mode starts at the reunion moment (REUNION_AT), so Dec 20 is Missing You until 6:00 pm.
 * Anything before Dec 1 (pre-launch) uses the cosy theme.
 *
 * @param key today's date in UNLOCK_TZ ("YYYY-MM-DD")
 * @param nowMs the current instant, from useAppDate()
 */
export function themeFor(key: string, nowMs: number): ThemeId {
  if (key === THEME_DATES.christmas) return 'christmas';
  if (nowMs >= REUNION_MS) return 'together';
  if (key >= THEME_DATES.missingFrom) return 'missing';
  return 'cosy';
}

export function isWallpaperChoice(value: unknown): value is WallpaperChoice {
  return value === 'auto' || THEME_IDS.some((id) => id === value);
}
