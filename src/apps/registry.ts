import { ChristmasApp } from './christmas/ChristmasApp';
import { ReunionCountdown } from './countdown/ReunionCountdown';
import { NewYearApp } from './newyear/NewYearApp';
import { SettingsApp } from './settings/SettingsApp';
import { PlaylistApp } from './playlist/PlaylistApp';
import { MiniGamesApp } from './games/MiniGamesApp';
import type { AppDefinition, AppId } from './types';

/**
 * Every app on the desktop. Order here = order on the desktop.
 * unlockAt is a calendar date in UNLOCK_TZ (see src/config/time.ts).
 *
 * Mini Games unlocks on Dec 1, 2026. Our Playlist, Countdown, Settings and NYE.exe are always unlocked.
 */
const ALWAYS_UNLOCKED = '2000-01-01';

export const APPS: readonly AppDefinition[] = [
  {
    id: 'games',
    title: 'Mini Games',
    icon: '🎮',
    // Opens Dec 1 with every game locked; each game unlocks on its own date inside the app (GAME_UNLOCKS).
    unlockAt: '2026-12-01',
    component: MiniGamesApp,
    // Wide enough for Rebuild Us to sit the loose pieces beside the board.
    size: { width: 860, height: 640 },
  },
  {
    id: 'playlist',
    title: 'Our Playlist',
    icon: '🎵',
    unlockAt: ALWAYS_UNLOCKED,
    component: PlaylistApp,
    size: { width: 500, height: 560 },
  },
  {
    id: 'countdown',
    title: 'Countdown',
    windowTitle: 'Time until we meet',
    icon: '⏳',
    unlockAt: ALWAYS_UNLOCKED,
    component: ReunionCountdown,
    size: { width: 500, height: 470 },
  },
  // On desktop the icons fill columns of 4 rows (md:grid-rows-4 in IconGrid), so the special-day apps start the second column.
  {
    id: 'settings',
    title: 'Settings',
    icon: '⚙️',
    unlockAt: ALWAYS_UNLOCKED,
    component: SettingsApp,
    size: { width: 460, height: 620 },
  },
  {
    id: 'christmas',
    title: 'Christmas.exe',
    icon: '🎄',
    unlockAt: '2026-12-25',
    component: ChristmasApp,
    size: { width: 520, height: 700 },
  },
  {
    // The New Year's Eve invitation: they already know about it, so it's open from the start.
    id: 'newyear',
    title: 'NYE.exe',
    icon: '🎆',
    unlockAt: ALWAYS_UNLOCKED,
    component: NewYearApp,
    // Wide enough for the two-column layout, so the invitation fits without scrolling.
    size: { width: 780, height: 560 },
  },
];

export function getApp(id: AppId): AppDefinition {
  const app = APPS.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}
