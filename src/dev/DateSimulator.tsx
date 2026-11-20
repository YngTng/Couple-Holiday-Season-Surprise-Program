import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { UNLOCK_TZ } from '../config/time';
import { useAppDate } from '../date/DateProvider';
import { clearProgress } from '../lib/storage';
import { formatSimulated, parseDateTimeLocal, toDateTimeLocalValue } from '../lib/zoned';
import { useToast } from '../ui/ToastProvider';

interface Preset {
  label: string;
  value: string;
}

const PRESETS: readonly Preset[] = [
  { label: 'Nov 30', value: '2026-11-30T12:00' },
  { label: 'Dec 1', value: '2026-12-01T09:00' },
  { label: 'Dec 9', value: '2026-12-09T12:00' },
  { label: 'Dec 10', value: '2026-12-10T09:00' },
  { label: 'Dec 11', value: '2026-12-11T12:00' },
  { label: 'Dec 20', value: '2026-12-20T09:00' },
  { label: 'Dec 20, 17:59:50', value: '2026-12-20T17:59:50' },
  { label: 'Dec 25', value: '2026-12-25T09:00' },
  { label: 'Dec 30', value: '2026-12-30T09:00' },
];

const FOCUSABLE = 'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])';

export function DateSimulator({ onClose }: { onClose: () => void }) {
  const { now, isSimulated, setSimulatedDate, clearSimulatedDate } = useAppDate();
  const notify = useToast();
  const [value, setValue] = useState(() => toDateTimeLocalValue(now));
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const inputId = useId();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const apply = (raw: string) => {
    const target = parseDateTimeLocal(raw);
    if (!target) {
      setError('Enter a valid date and time.');
      return;
    }
    setSimulatedDate(target);
    notify(`Simulating ${formatSimulated(target)}`, '🧪');
    onClose();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    apply(value);
  };

  const reset = () => {
    clearSimulatedDate();
    notify('Back to real time', '🕰');
    onClose();
  };

  const resetProgress = () => {
    const ok = window.confirm(
      'Clear all saved progress (birthday, Christmas, letters, quiz coupon, best scores)? Settings and the simulated date are kept.',
    );
    if (!ok) return;
    clearProgress();
    // Components hold progress in memory, so reload to start from a clean slate.
    window.location.reload();
  };

  const onKeyDown =(e: KeyboardEvent<HTMLDivElement>) => {
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
        className="flex max-h-[90dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 text-ink shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              🧪 Date simulator
            </h2>
            <p className="text-xs text-ink-muted">
              Developer tool. Times are in {UNLOCK_TZ}. {isSimulated ? `Simulating: ${formatSimulated(now)}` : 'Using real time.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close date simulator"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-surface-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-sm font-medium">
            Fake date and time
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id={inputId}
              type="datetime-local"
              step={1}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-sm"
            />
            <button type="submit" className="min-h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent">
              Apply
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs font-medium text-accent-text">
              {error}
            </p>
          )}
        </form>

        <div>
          <p className="mb-2 text-sm font-medium">Quick jump</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => apply(preset.value)}
                className="min-h-11 rounded-xl bg-surface-2 px-2 text-xs font-medium ring-1 ring-line hover:bg-accent-soft hover:text-plum"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          disabled={!isSimulated}
          className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold hover:bg-surface-2 disabled:opacity-50"
        >
          Reset to real time
        </button>

        <button
          type="button"
          onClick={resetProgress}
          className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-accent-text hover:bg-surface-2"
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}
