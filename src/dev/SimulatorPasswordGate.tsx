import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { SIMULATOR_PASSWORD_SHA256 } from '../config/devtools';
import { sha256Hex } from '../lib/sha256';

const FOCUSABLE = 'button, input, [tabindex]:not([tabindex="-1"])';

/** Asks for the simulator password. Calls onUnlock when it's right. */
export function SimulatorPasswordGate({ onUnlock, onClose }: { onUnlock: () => void; onClose: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const inputId = useId();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (sha256Hex(value) === SIMULATOR_PASSWORD_SHA256) {
      onUnlock();
      return;
    }
    setError(true);
    setValue('');
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-plum/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-t-3xl border border-line bg-surface p-5 text-ink shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 id={titleId} className="text-lg font-semibold">
            🔒 Password
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-surface-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <label htmlFor={inputId} className="sr-only">
            Password
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id={inputId}
              type="password"
              autoComplete="off"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-sm"
            />
            <button type="submit" className="min-h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent">
              Enter
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs font-medium text-accent-text">
              Wrong password.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
