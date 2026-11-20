import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { AppDefinition } from '../apps/types';
import type { Size } from '../hooks/useElementSize';
import { AppContent } from './AppContent';
import { useWindowManager, type OpenWindow } from './WindowManager';

interface DesktopWindowProps {
  app: AppDefinition;
  win: OpenWindow;
  isActive: boolean;
  bounds: Size;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));
const KEY_STEP = 24;

export function DesktopWindow({ app, win, isActive, bounds }: DesktopWindowProps) {
  const { focusWindow, closeWindow, moveWindow } = useWindowManager();
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<DragState | null>(null);
  const titleId = `window-title-${app.id}`;

  const width = Math.min(app.size?.width ?? 440, bounds.width - 16);
  const height = Math.min(app.size?.height ?? 360, bounds.height - 16);
  const x = clamp(win.x, 0, bounds.width - width);
  const y = clamp(win.y, 0, bounds.height - height);

  useEffect(() => {
    const el = ref.current;
    if (isActive && el && !el.contains(document.activeElement)) el.focus();
  }, [isActive]);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target instanceof Element && e.target.closest('button'))) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, originX: x, originY: y };
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    moveWindow(app.id, d.originX + e.clientX - d.startX, d.originY + e.clientY - d.startY);
  };

  const endDrag = () => {
    drag.current = null;
  };

  const onGripKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = delta[e.key];
    if (!move) return;
    e.preventDefault();
    moveWindow(app.id, x + move[0], y + move[1]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && !e.defaultPrevented) {
      e.stopPropagation();
      closeWindow(app.id);
    }
  };

  return (
    <section
      ref={ref}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      onPointerDownCapture={() => focusWindow(app.id)}
      onFocusCapture={() => focusWindow(app.id)}
      onKeyDown={onKeyDown}
      style={{ left: x, top: y, width, height, zIndex: win.z }}
      className={`pointer-events-auto absolute flex flex-col overflow-hidden rounded-2xl border bg-surface text-ink shadow-[0_24px_60px_-18px_rgba(42,22,48,0.55)] animate-[window-in_180ms_ease-out] ${
        isActive ? 'border-accent-soft ring-2 ring-accent-soft/60' : 'border-line'
      }`}
    >
      <header
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`flex h-12 shrink-0 cursor-grab touch-none select-none items-center gap-1 border-b border-line px-1 active:cursor-grabbing ${
          isActive ? 'bg-surface-2' : 'bg-surface'
        }`}
      >
        <button
          type="button"
          onKeyDown={onGripKey}
          aria-label={`Move ${app.windowTitle ?? app.title} window. Use arrow keys.`}
          className="flex h-11 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface"
        >
          <span aria-hidden="true">⠿</span>
        </button>
        <h2 id={titleId} className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm font-semibold">
          <span aria-hidden="true">{app.icon}</span>
          {app.windowTitle ?? app.title}
        </h2>
        <button
          type="button"
          onClick={() => closeWindow(app.id)}
          aria-label={`Close ${app.windowTitle ?? app.title}`}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-muted hover:bg-accent hover:text-on-accent"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <AppContent app={app} />
      </div>
    </section>
  );
}
