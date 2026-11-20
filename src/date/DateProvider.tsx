import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isRecord, readJson, removeStorage, writeStorage } from '../lib/storage';
import { toDateKey } from '../lib/zoned';

/**
 * The ONLY place in the codebase that reads the real clock.
 * Everything else gets "now" from useAppDate().
 */

const STORAGE_KEY = 'december-exe:date-override';

export interface AppDateValue {
  /** Current instant (real or simulated). Updates every second. */
  now: Date;
  /** Today's calendar date in UNLOCK_TZ, "YYYY-MM-DD". */
  todayKey: string;
  isSimulated: boolean;
  setSimulatedDate: (target: Date) => void;
  clearSimulatedDate: () => void;
}

const AppDateContext = createContext<AppDateValue | null>(null);

function loadOffset(): number | null {
  const stored = readJson(STORAGE_KEY);
  if (isRecord(stored) && typeof stored.offsetMs === 'number' && Number.isFinite(stored.offsetMs)) {
    return stored.offsetMs;
  }
  return null;
}

export function DateProvider({ children }: { children: ReactNode }) {
  const [offsetMs, setOffsetMs] = useState<number | null>(loadOffset);
  const [realNow, setRealNow] = useState<number>(() => Date.now());

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const t = Date.now();
      setRealNow(t);
      timer = window.setTimeout(tick, 1000 - (t % 1000) + 5);
    };
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    return () => window.clearTimeout(timer);
  }, []);

  const setSimulatedDate = useCallback((target: Date) => {
    const real = Date.now();
    const offset = target.getTime() - real;
    setOffsetMs(offset);
    setRealNow(real);
    writeStorage(STORAGE_KEY, JSON.stringify({ offsetMs: offset }));
  }, []);

  const clearSimulatedDate = useCallback(() => {
    setOffsetMs(null);
    setRealNow(Date.now());
    removeStorage(STORAGE_KEY);
  }, []);

  const value = useMemo<AppDateValue>(() => {
    const now = new Date(realNow + (offsetMs ?? 0));
    return {
      now,
      todayKey: toDateKey(now),
      isSimulated: offsetMs !== null,
      setSimulatedDate,
      clearSimulatedDate,
    };
  }, [realNow, offsetMs, setSimulatedDate, clearSimulatedDate]);

  return <AppDateContext.Provider value={value}>{children}</AppDateContext.Provider>;
}

export function useAppDate(): AppDateValue {
  const ctx = useContext(AppDateContext);
  if (!ctx) throw new Error('useAppDate must be used inside <DateProvider>');
  return ctx;
}
