import { useId, type ReactNode } from 'react';

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-3">
      <h3 id={id} className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

interface SwitchRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SwitchRow({ label, description, checked, onChange }: SwitchRowProps) {
  const descId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={description ? descId : undefined}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-left hover:bg-surface-2"
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium text-ink">{label}</span>
        {description && (
          <span id={descId} className="text-xs text-ink-muted">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-line'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-cream shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </span>
    </button>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-xl bg-surface-2 p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-medium transition-colors ${
              selected ? 'bg-accent text-on-accent shadow-sm' : 'text-ink hover:bg-surface'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
