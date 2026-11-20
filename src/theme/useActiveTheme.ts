import { useEffect } from 'react';
import { useAppDate } from '../date/DateProvider';
import { useReducedMotion, useSettings } from '../settings/SettingsProvider';
import { themeFor, type ThemeId } from './themes';

export interface ActiveTheme {
  /** Theme chosen by the date. Drives colours. */
  themeId: ThemeId;
  /** Wallpaper shown: the date theme, unless the user picked one in Settings. */
  wallpaperId: ThemeId;
}

export function useActiveTheme(): ActiveTheme {
  const { now, todayKey } = useAppDate();
  const { settings } = useSettings();
  const themeId = themeFor(todayKey, now.getTime());
  return { themeId, wallpaperId: settings.wallpaper === 'auto' ? themeId : settings.wallpaper };
}

/** Mirrors theme, colour mode and motion preference onto <html> as data attributes. */
export function ThemeController() {
  const { themeId } = useActiveTheme();
  const { settings } = useSettings();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeId;
    root.dataset.mode = settings.colorMode;
    root.dataset.reduceMotion = String(reduceMotion);
  }, [themeId, settings.colorMode, reduceMotion]);

  return null;
}
