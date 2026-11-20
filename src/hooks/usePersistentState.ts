import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { readJson, writeStorage } from '../lib/storage';

/** useState that survives reloads via localStorage. Falls back to `initial` if storage is unavailable or invalid. */
export function usePersistentState<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stored = readJson(key);
    return isValid(stored) ? stored : initial;
  });

  useEffect(() => {
    writeStorage(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
