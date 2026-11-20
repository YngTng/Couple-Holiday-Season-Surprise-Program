/** localStorage helpers that never throw (private mode, blocked storage, quota). */

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the app keeps working for this session only.
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore: nothing to clean up.
  }
}

const KEY_PREFIX = 'december-exe:';
/** Keys kept by clearProgress: preferences and the dev date override, not progress. */
const KEEP_ON_PROGRESS_RESET = new Set([`${KEY_PREFIX}settings`, `${KEY_PREFIX}date-override`]);

/** Remove all saved progress (completions, opened items, best scores). Returns how many keys were removed. */
export function clearProgress(): number {
  try {
    const keys = Object.keys(window.localStorage).filter(
      (key) => key.startsWith(KEY_PREFIX) && !KEEP_ON_PROGRESS_RESET.has(key),
    );
    keys.forEach((key) => window.localStorage.removeItem(key));
    return keys.length;
  } catch {
    return 0;
  }
}

export function readJson(key: string): unknown {
  const raw = readStorage(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const isNumberOrNull = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isFinite(value));

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
