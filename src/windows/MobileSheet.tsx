import { useEffect, useRef, type KeyboardEvent } from 'react';
import type { AppDefinition } from '../apps/types';
import { AppContent } from './AppContent';
import { useWindowManager } from './WindowManager';

/** Full-screen sheet used instead of windows below 768px. */
export function MobileSheet({ app }: { app: AppDefinition }) {
  const { closeWindow } = useWindowManager();
  const backRef = useRef<HTMLButtonElement>(null);
  const titleId = `sheet-title-${app.id}`;

  useEffect(() => {
    backRef.current?.focus();
  }, [app.id]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // Apps call preventDefault() when they handle Escape themselves (e.g. closing a photo viewer).
    if (e.key === 'Escape' && !e.defaultPrevented) closeWindow(app.id);
  };

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-surface text-ink animate-[sheet-in_220ms_ease-out]"
    >
      <header className="sim-offset flex shrink-0 items-center gap-2 border-b border-line bg-surface-2 px-2 pb-1 pt-[max(0.25rem,env(safe-area-inset-top))]">
        <button
          ref={backRef}
          type="button"
          onClick={() => closeWindow(app.id)}
          className="flex min-h-11 min-w-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-accent-text hover:bg-surface"
        >
          <span aria-hidden="true">‹</span> Back
        </button>
        <h2 id={titleId} className="flex min-w-0 items-center gap-2 truncate text-base font-semibold">
          <span aria-hidden="true">{app.icon}</span>
          {app.windowTitle ?? app.title}
        </h2>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <AppContent app={app} />
      </div>
    </section>
  );
}
