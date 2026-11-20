import { useEffect } from 'react';
import { useAppDate } from '../date/DateProvider';
import { formatSimulated } from '../lib/zoned';
import { UNLOCK_TZ } from '../config/time';

export function SimulationBadge({ onOpen }: { onOpen: () => void }) {
  const { now, isSimulated, clearSimulatedDate } = useAppDate();

  // Lets mobile sheet headers make room for the badge (see .sim-offset in index.css).
  useEffect(() => {
    document.documentElement.dataset.simulating = String(isSimulated);
  }, [isSimulated]);

  if (!isSimulated) return null;

  return (
    <div className="fixed left-1/2 top-2 z-[65] flex max-w-[calc(100vw-16px)] -translate-x-1/2 items-center md:left-auto md:right-3 md:translate-x-0 rounded-full bg-plum pl-1 pr-1 text-xs text-cream shadow-lg ring-2 ring-accent-soft sm:text-sm">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-11 min-w-0 items-center gap-1.5 rounded-full px-3"
        aria-label={`Simulating: ${formatSimulated(now)} ${UNLOCK_TZ} time. Open date simulator.`}
      >
        <span aria-hidden="true">🧪</span>
        <span className="truncate">Simulating: {formatSimulated(now)}</span>
      </button>
      <button
        type="button"
        onClick={clearSimulatedDate}
        className="min-h-11 shrink-0 rounded-full bg-cream/15 px-3 font-semibold hover:bg-cream/25"
      >
        Reset
      </button>
    </div>
  );
}
