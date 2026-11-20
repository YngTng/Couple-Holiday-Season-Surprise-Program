import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { isRecord, readJson, writeStorage } from '../lib/storage';
import { isWallpaperChoice, type WallpaperChoice } from '../theme/themes';

export type ColorMode = 'light' | 'dark';

export interface Settings {
  wallpaper: WallpaperChoice;
  reduceMotion: boolean;
  colorMode: ColorMode;
}

interface SettingsValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

const STORAGE_KEY = 'december-exe:settings';
const SettingsContext = createContext<SettingsValue | null>(null);

function defaultSettings(): Settings {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return { wallpaper: 'auto', reduceMotion: false, colorMode: prefersDark ? 'dark' : 'light' };
}

function loadSettings(): Settings {
  const base = defaultSettings();
  const raw = readJson(STORAGE_KEY);
  if (!isRecord(raw)) return base;
  return {
    wallpaper: isWallpaperChoice(raw.wallpaper) ? raw.wallpaper : base.wallpaper,
    reduceMotion: typeof raw.reduceMotion === 'boolean' ? raw.reduceMotion : base.reduceMotion,
    colorMode: raw.colorMode === 'light' || raw.colorMode === 'dark' ? raw.colorMode : base.colorMode,
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    writeStorage(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}

/** True when the user toggled "Reduce animations" OR the OS asks for reduced motion. */
export function useReducedMotion(): boolean {
  const { settings } = useSettings();
  const systemPrefers = useMediaQuery('(prefers-reduced-motion: reduce)');
  return settings.reduceMotion || systemPrefers;
}
