import { useEffect, useState } from 'react';
import { useLatest } from '../../hooks/useLatest';
import { useReducedMotion } from '../../settings/SettingsProvider';

interface GiftStageProps {
  tag: string;
  onOpened: () => void;
}

const TAPS_TO_OPEN = 3;
const OPEN_MS = 1100;

export function GiftStage({ tag, onOpened }: GiftStageProps) {
  const reduceMotion = useReducedMotion();
  const [taps, setTaps] = useState(0);
  const opening = taps >= TAPS_TO_OPEN;
  const onOpenedRef = useLatest(onOpened);

  useEffect(() => {
    if (!opening) return;
    const timer = window.setTimeout(() => onOpenedRef.current(), reduceMotion ? 0 : OPEN_MS);
    return () => window.clearTimeout(timer);
  }, [opening, reduceMotion, onOpenedRef]);

  const left = TAPS_TO_OPEN - taps;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-6 text-center">
      <p aria-live="polite" className="text-sm font-medium text-ink-muted">
        {opening ? 'Unwrapping…' : `Tap the present to unwrap it · ${left} ${left === 1 ? 'tap' : 'taps'} to go`}
      </p>

      <button
        type="button"
        onClick={() => setTaps((t) => Math.min(TAPS_TO_OPEN, t + 1))}
        aria-disabled={opening}
        aria-label={`Present. Tap to unwrap, ${left} ${left === 1 ? 'tap' : 'taps'} to go`}
        className={`gift relative h-48 w-48 rounded-3xl ${opening ? 'gift--open' : ''}`}
      >
        {/* Key changes restart the shake; it stays fixed on the final tap so the lid can transition open. */}
        <span key={Math.min(taps, TAPS_TO_OPEN - 1)} className={`absolute inset-0 ${taps > 0 && !opening ? 'animate-[gift-shake_420ms_ease-in-out]' : ''}`}>
          <span className="gift-box" />
          <span className="gift-lid" />
          <span className="gift-ribbon" />
          <span className="gift-bow" />
        </span>
      </button>

      <p className="flex max-w-xs items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink ring-1 ring-line">
        <span aria-hidden="true">🏷️</span>
        <span>{tag}</span>
      </p>
    </div>
  );
}
