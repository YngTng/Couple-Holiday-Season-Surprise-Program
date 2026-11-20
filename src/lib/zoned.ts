import { UNLOCK_TZ } from '../config/time';

/** Wall-clock parts of an instant, as seen in UNLOCK_TZ. */
export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: UNLOCK_TZ,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
});

const simulatedFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: UNLOCK_TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const pad2 = (n: number): string => String(n).padStart(2, '0');

export function getZonedParts(instant: Date): ZonedParts {
  const values: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {};
  for (const part of partsFormatter.formatToParts(instant)) {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  }
  return {
    year: values.year ?? 1970,
    month: values.month ?? 1,
    day: values.day ?? 1,
    hour: values.hour ?? 0,
    minute: values.minute ?? 0,
    second: values.second ?? 0,
  };
}

/** "YYYY-MM-DD" for the instant's calendar day in UNLOCK_TZ. Lexically comparable. */
export function toDateKey(instant: Date): string {
  const p = getZonedParts(instant);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

function offsetMs(instant: Date): number {
  const p = getZonedParts(instant);
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return wall - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Converts a wall-clock time in UNLOCK_TZ into a real instant (DST-safe). */
export function zonedToUtc(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date {
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  const firstGuess = wall - offsetMs(new Date(wall));
  return new Date(wall - offsetMs(new Date(firstGuess)));
}

/** Value for <input type="datetime-local">, in UNLOCK_TZ. */
export function toDateTimeLocalValue(instant: Date): string {
  const p = getZonedParts(instant);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`;
}

export function parseDateTimeLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  return zonedToUtc(Number(y), Number(mo), Number(d), Number(h), Number(mi), Number(s ?? 0));
}

/** "2026-12-10" -> "Dec 10" */
export function formatDateKeyShort(key: string): string {
  const [, month, day] = key.split('-');
  return `${MONTHS[Number(month) - 1] ?? ''} ${Number(day)}`;
}

export function formatSimulated(instant: Date): string {
  return simulatedFormatter.format(instant);
}
