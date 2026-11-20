import { useEffect, useRef, useState } from 'react';
import { BOOT_LINES, type BootLine } from '../content/system';
import { APP_NAME } from '../content/person';
import { useReducedMotion } from '../settings/SettingsProvider';

const CHAR_MS = 30;
const LINE_PAUSE_MS = 380;
const END_HOLD_MS = 1800;
const REDUCED_HOLD_MS = 2500;

function lineClass(kind: BootLine['kind'], previous: BootLine['kind'] | undefined): string {
  if (kind === 'success') return 'text-[#f6c9d6] font-semibold';
  if (kind === 'welcome') return `${previous === 'welcome' ? 'mt-1' : 'mt-8'} text-lg text-cream sm:text-2xl`;
  return 'text-[#d9c8f0]';
}

/** Terminal-style boot screen. Any tap, click or key skips straight to the desktop. */
export function BootSequence({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReducedMotion();
  const [line, setLine] = useState(0);
  const [char, setChar] = useState(0);
  const skipRef = useRef<HTMLButtonElement>(null);
  const finished = reduceMotion || line >= BOOT_LINES.length;

  useEffect(() => {
    skipRef.current?.focus();
  }, []);

  useEffect(() => {
    if (finished) {
      const t = window.setTimeout(onDone, reduceMotion ? REDUCED_HOLD_MS : END_HOLD_MS);
      return () => window.clearTimeout(t);
    }
    const current = BOOT_LINES[line]?.text ?? '';
    if (char < current.length) {
      const t = window.setTimeout(() => setChar((c) => c + 1), CHAR_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLine((l) => l + 1);
      setChar(0);
    }, LINE_PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [finished, line, char, reduceMotion, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      className="fixed inset-0 z-[55] flex cursor-pointer flex-col bg-plum px-6 py-10 font-mono text-sm text-cream sm:px-12 sm:text-base"
    >
      <h1 className="sr-only">{APP_NAME} is starting</h1>
      <ul className="sr-only">
        {BOOT_LINES.map((l) => (
          <li key={l.text}>{l.text}</li>
        ))}
      </ul>

      <div aria-hidden="true" className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-1.5">
        {BOOT_LINES.map((l, i) => {
          if (!finished && i > line) return null;
          const typing = !finished && i === line;
          const text = typing ? l.text.slice(0, char) : l.text;
          return (
            <p key={l.text} className={lineClass(l.kind, BOOT_LINES[i - 1]?.kind)}>
              {l.kind !== 'welcome' && <span className="mr-2 text-[#f8cbbf]">&gt;</span>}
              {text}
              {typing && <span className="ml-0.5 inline-block h-[1.1em] w-2 translate-y-0.5 bg-cream animate-[caret_1s_steps(1)_infinite]" />}
            </p>
          );
        })}
      </div>

      <button
        ref={skipRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
        className="mx-auto min-h-11 rounded-full px-5 text-xs text-[#d9c8f0] ring-1 ring-[#d9c8f0]/40 hover:bg-cream/10 sm:text-sm"
      >
        Tap or click to skip
      </button>
    </div>
  );
}
