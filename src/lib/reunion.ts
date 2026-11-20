import { REUNION_AT } from '../config/time';
import { zonedToUtc } from './zoned';

/** The reunion instant (REUNION_AT in UNLOCK_TZ). Drives both the countdown and Together Mode. */
export const REUNION_MS = zonedToUtc(
  REUNION_AT.year,
  REUNION_AT.month,
  REUNION_AT.day,
  REUNION_AT.hour,
  REUNION_AT.minute,
).getTime();
