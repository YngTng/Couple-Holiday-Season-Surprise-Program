import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DateSimulator } from './DateSimulator';
import { SimulationBadge } from './SimulationBadge';
import { SimulatorPasswordGate } from './SimulatorPasswordGate';

interface DevToolsValue {
  openSimulator: () => void;
}

const DevToolsContext = createContext<DevToolsValue | null>(null);

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/** Set once the password is entered; lasts until the browser tab is closed. */
const UNLOCKED_KEY = 'december-exe:simulator-unlocked';

function readUnlocked(): boolean {
  try {
    return sessionStorage.getItem(UNLOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveUnlocked(): void {
  try {
    sessionStorage.setItem(UNLOCKED_KEY, 'true');
  } catch {
    // Private mode etc.: they'll just be asked again next time.
  }
}

type Panel = 'none' | 'password' | 'simulator';

/**
 * Hidden developer tools. Backtick (`) or 5 quick taps on the clock open the date simulator,
 * after the password (see src/config/devtools.ts).
 */
export function DevToolsProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>('none');
  const openRef = useRef(false);
  const unlockedRef = useRef(readUnlocked());
  const returnFocus = useRef<HTMLElement | null>(null);

  const openSimulator = useCallback(() => {
    if (openRef.current) return;
    const active = document.activeElement;
    returnFocus.current = active instanceof HTMLElement ? active : null;
    openRef.current = true;
    setPanel(unlockedRef.current ? 'simulator' : 'password');
  }, []);

  const unlock = useCallback(() => {
    unlockedRef.current = true;
    saveUnlocked();
    setPanel('simulator');
  }, []);

  const closeSimulator = useCallback(() => {
    openRef.current = false;
    setPanel('none');
    window.requestAnimationFrame(() => {
      if (returnFocus.current?.isConnected) returnFocus.current.focus();
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '`' || e.ctrlKey || e.metaKey || e.altKey || isEditable(e.target)) return;
      e.preventDefault();
      if (openRef.current) closeSimulator();
      else openSimulator();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSimulator, closeSimulator]);

  const value = useMemo(() => ({ openSimulator }), [openSimulator]);

  return (
    <DevToolsContext.Provider value={value}>
      {children}
      <SimulationBadge onOpen={openSimulator} />
      {panel === 'password' && <SimulatorPasswordGate onUnlock={unlock} onClose={closeSimulator} />}
      {panel === 'simulator' && <DateSimulator onClose={closeSimulator} />}
    </DevToolsContext.Provider>
  );
}

export function useDevTools(): DevToolsValue {
  const ctx = useContext(DevToolsContext);
  if (!ctx) throw new Error('useDevTools must be used inside <DevToolsProvider>');
  return ctx;
}
