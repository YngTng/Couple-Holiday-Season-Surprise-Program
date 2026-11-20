import { useId } from 'react';
import type { AppDefinition } from '../apps/types';
import { formatDateKeyShort } from '../lib/zoned';
import { Emoji } from '../ui/Emoji';

interface DesktopIconProps {
  app: AppDefinition;
  locked: boolean;
  /** Unlocked today: shows a "NEW" badge. */
  isNew: boolean;
  onOpen: (app: AppDefinition) => void;
}

export function DesktopIcon({ app, locked, isNew, onOpen }: DesktopIconProps) {
  const tooltipId = useId();
  const unlockLabel = `Unlocks ${formatDateKeyShort(app.unlockAt)}`;

  return (
    <button
      type="button"
      onClick={() => onOpen(app)}
      aria-label={locked ? `${app.title}, locked` : isNew ? `${app.title}, new today` : app.title}
      aria-describedby={locked ? tooltipId : undefined}
      aria-disabled={locked || undefined}
      className="group relative flex w-full flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-center transition-colors hover:bg-surface/40 md:w-28"
    >
      <span
        aria-hidden="true"
        className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-surface/90 text-3xl shadow-md ring-1 ring-line transition-transform group-hover:-translate-y-0.5 ${
          locked ? 'grayscale' : ''
        }`}
      >
        <Emoji char={app.icon} className={locked ? 'opacity-45' : ''} />
        {isNew && !locked && (
          <span className="absolute -left-2 -top-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-on-accent shadow ring-2 ring-surface">
            NEW
          </span>
        )}
        {locked && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-plum text-[11px] shadow ring-2 ring-surface">
            🔒
          </span>
        )}
      </span>
      <span
        className={`max-w-full text-balance rounded-md bg-surface/85 px-1.5 py-0.5 text-xs font-medium leading-tight ${
          locked ? 'text-ink-muted' : 'text-ink'
        }`}
      >
        {/* Long names can break before ".exe" on narrow phones instead of spilling out of the label. */}
        {app.title.endsWith('.exe') ? (
          <>
            {app.title.slice(0, -4)}
            <wbr />
            .exe
          </>
        ) : (
          app.title
        )}
      </span>
      {locked && (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-plum px-2 py-1 text-xs font-medium text-cream opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {unlockLabel}
        </span>
      )}
    </button>
  );
}
