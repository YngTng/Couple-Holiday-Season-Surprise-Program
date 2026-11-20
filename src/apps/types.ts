import type { ComponentType } from 'react';

export type AppId =
  | 'playlist'
  | 'games'
  | 'countdown'
  | 'birthday'
  | 'christmas'
  | 'anniversary'
  | 'newyear'
  | 'settings';

export interface AppDefinition {
  id: AppId;
  /** Name on the desktop icon, taskbar and notifications. */
  title: string;
  /** Optional different title shown in the opened window's title bar. Defaults to `title`. */
  windowTitle?: string;
  /** Emoji used as the desktop icon. */
  icon: string;
  /** "YYYY-MM-DD", evaluated in UNLOCK_TZ. The app opens from 00:00 that day. */
  unlockAt: string;
  component: ComponentType;
  /** Preferred desktop window size in px. */
  size?: { width: number; height: number };
}
