import { UNLOCK_EVERYTHING } from '../config/testing';
import type { AppDefinition } from './types';

/** True if the app can be opened on this calendar day (or the testing switch is on). */
export function isAppUnlocked(app: AppDefinition, todayKey: string): boolean {
  return UNLOCK_EVERYTHING || todayKey >= app.unlockAt;
}

/** True if a dated item (e.g. a sealed letter) is open on this calendar day (or the testing switch is on). */
export function isDateOpen(unlockAt: string | undefined, todayKey: string): boolean {
  return UNLOCK_EVERYTHING || unlockAt === undefined || todayKey >= unlockAt;
}
