import { COUNTDOWN_COMPLETE_LINES } from '../../content/system';

/** Completion state of the Countdown app, shown from REUNION_AT (see src/config/time.ts). */
export function TogetherModeInstall() {
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6 font-mono text-sm" role="status">
      <p className="flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-ink ring-1 ring-line">
        <span aria-hidden="true">⚠</span>
        <span>{COUNTDOWN_COMPLETE_LINES.stopped}</span>
      </p>
      <p className="text-ink animate-[fade-in_600ms_ease-out_800ms_both]">{COUNTDOWN_COMPLETE_LINES.installing}</p>
      <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-line" aria-hidden="true">
        <div className="h-full w-full origin-left rounded-full bg-accent animate-[install-progress_5s_ease-in-out_1s_both]" />
      </div>
    </div>
  );
}
