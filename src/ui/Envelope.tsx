import { useEffect, useState } from 'react';
import { useLatest } from '../hooks/useLatest';
import { useReducedMotion } from '../settings/SettingsProvider';

const OPEN_MS = 1000;

/** A sealed envelope. Tapping it opens the flap, then calls onOpen. */
/** `label` is what the envelope holds, e.g. "letter" or "invitation". */
export function Envelope({ onOpen, label = 'letter' }: { onOpen: () => void; label?: string }) {
  const reduceMotion = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const onOpenRef = useLatest(onOpen);

  useEffect(() => {
    if (!opening) return;
    const timer = window.setTimeout(() => onOpenRef.current(), reduceMotion ? 0 : OPEN_MS);
    return () => window.clearTimeout(timer);
  }, [opening, reduceMotion, onOpenRef]);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setOpening(true)}
        aria-disabled={opening}
        className={`envelope relative block h-40 w-60 ${opening ? 'envelope--open' : ''}`}
      >
        <span className="sr-only">Open the {label}</span>
        <span aria-hidden="true" className="envelope-back" />
        <span aria-hidden="true" className="envelope-paper" />
        <span aria-hidden="true" className="envelope-front" />
        <span aria-hidden="true" className="envelope-flap" />
        <span aria-hidden="true" className="envelope-seal">
          ♥
        </span>
      </button>
      <p aria-hidden="true" className="text-sm font-medium text-ink-muted">
        {opening ? 'Opening…' : `Tap to open the ${label}`}
      </p>
    </div>
  );
}
