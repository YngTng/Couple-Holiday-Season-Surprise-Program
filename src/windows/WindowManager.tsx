import { createContext, useCallback, useContext, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { AppId } from '../apps/types';

export interface OpenWindow {
  appId: AppId;
  x: number;
  y: number;
  z: number;
}

interface State {
  windows: OpenWindow[];
  topZ: number;
}

type Action =
  | { type: 'open'; appId: AppId }
  | { type: 'close'; appId: AppId }
  | { type: 'focus'; appId: AppId }
  | { type: 'move'; appId: AppId; x: number; y: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open': {
      if (state.windows.some((w) => w.appId === action.appId)) {
        return reducer(state, { type: 'focus', appId: action.appId });
      }
      const slot = state.windows.length % 6;
      const z = state.topZ + 1;
      return { topZ: z, windows: [...state.windows, { appId: action.appId, x: 240 + slot * 36, y: 24 + slot * 32, z }] };
    }
    case 'close':
      return { ...state, windows: state.windows.filter((w) => w.appId !== action.appId) };
    case 'focus': {
      const target = state.windows.find((w) => w.appId === action.appId);
      if (!target || target.z === state.topZ) return state;
      const z = state.topZ + 1;
      return { topZ: z, windows: state.windows.map((w) => (w.appId === action.appId ? { ...w, z } : w)) };
    }
    case 'move':
      return {
        ...state,
        windows: state.windows.map((w) => (w.appId === action.appId ? { ...w, x: action.x, y: action.y } : w)),
      };
  }
}

interface WindowManagerValue {
  windows: OpenWindow[];
  activeAppId: AppId | null;
  openWindow: (appId: AppId) => void;
  closeWindow: (appId: AppId) => void;
  focusWindow: (appId: AppId) => void;
  moveWindow: (appId: AppId, x: number, y: number) => void;
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { windows: [], topZ: 10 });
  /** Element that had focus when each window opened, so focus can return on close. */
  const returnFocus = useRef(new Map<AppId, HTMLElement>());

  const openWindow = useCallback((appId: AppId) => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && !returnFocus.current.has(appId)) {
      returnFocus.current.set(appId, active);
    }
    dispatch({ type: 'open', appId });
  }, []);

  const closeWindow = useCallback((appId: AppId) => {
    const target = returnFocus.current.get(appId);
    returnFocus.current.delete(appId);
    dispatch({ type: 'close', appId });
    window.requestAnimationFrame(() => {
      if (target?.isConnected) target.focus();
    });
  }, []);

  const focusWindow = useCallback((appId: AppId) => dispatch({ type: 'focus', appId }), []);
  const moveWindow = useCallback((appId: AppId, x: number, y: number) => dispatch({ type: 'move', appId, x, y }), []);

  const value = useMemo<WindowManagerValue>(() => {
    const top = state.windows.reduce<OpenWindow | null>((best, w) => (!best || w.z > best.z ? w : best), null);
    return {
      windows: state.windows,
      activeAppId: top?.appId ?? null,
      openWindow,
      closeWindow,
      focusWindow,
      moveWindow,
    };
  }, [state.windows, openWindow, closeWindow, focusWindow, moveWindow]);

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used inside <WindowManagerProvider>');
  return ctx;
}
