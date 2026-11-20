import { formatDateKeyShort } from '../lib/zoned';
import type { AppDefinition } from './types';

/** Shown if an app's window is open but the (possibly simulated) date says it is locked. */
export function LockedNotice({ app }: { app: AppDefinition }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <span aria-hidden="true" className="text-5xl grayscale">
        🔒
      </span>
      <h3 className="text-xl font-semibold text-ink">{app.title} is locked</h3>
      <p className="text-sm text-ink-muted">Unlocks {formatDateKeyShort(app.unlockAt)}</p>
    </div>
  );
}
