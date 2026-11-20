import { useEffect, useState } from 'react';
import { NYE, NYE_STOPS, type NyeStop } from '../../content/newyear';
import { useAppDate } from '../../date/DateProvider';
import { usePersistentState } from '../../hooks/usePersistentState';
import { zonedToUtc } from '../../lib/zoned';
import { Envelope } from '../../ui/Envelope';
import { Particles } from '../../ui/Particles';
import { useWindowManager } from '../../windows/WindowManager';

const OPENED_KEY = 'december-exe:nye-opened';
const RSVP_KEY = 'december-exe:nye-rsvp';
/** After she taps "I'll be there", the window closes this long after, so she sees the tick and confetti first. */
const CLOSE_AFTER_RSVP_MS = 1500;
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

const NYE_YEAR = 2026;
const MIDNIGHT_MS = zonedToUtc(NYE_YEAR + 1, 1, 1).getTime();

function untilMidnight(ms: number): string {
  const mins = Math.ceil(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} ${m === 1 ? 'minute' : 'minutes'} till midnight`;
  return `${h} h ${String(m).padStart(2, '0')} min till midnight`;
}

function Stop({ stop }: { stop: NyeStop }) {
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="absolute -left-[42px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-lg ring-2 ring-accent-soft"
      >
        {stop.icon}
      </span>
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">{stop.time}</p>
      <h3 className="mt-0.5 text-base font-semibold text-ink">{stop.title}</h3>
      <p className="mt-0.5 text-sm font-medium text-ink">{stop.place}</p>
      {stop.address && <p className="text-xs text-ink-muted">{stop.address}</p>}
      <p className="mt-1 text-sm leading-relaxed text-ink">{stop.note}</p>
    </li>
  );
}

/** New Year's Eve invitation: open the envelope, read the plan for the night, RSVP. */
export function NewYearApp() {
  const { now } = useAppDate();
  const nowMs = now.getTime();
  const [opened, setOpened] = usePersistentState(OPENED_KEY, false, isBool);
  const [rsvp, setRsvp] = usePersistentState(RSVP_KEY, false, isBool);
  // Confetti when she taps the RSVP button (and again on every later tap), not on every reopen.
  const [celebrations, setCelebrations] = useState(0);
  const { closeWindow } = useWindowManager();

  useEffect(() => {
    if (celebrations === 0) return;
    const timer = window.setTimeout(() => closeWindow('newyear'), CLOSE_AFTER_RSVP_MS);
    return () => window.clearTimeout(timer);
  }, [celebrations, closeWindow]);

  const toMidnight = MIDNIGHT_MS - nowMs;
  const isNyeDay = toMidnight > 0 && toMidnight <= 24 * 3600 * 1000;
  const isNewYear = toMidnight <= 0;

  if (!opened) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-6 px-5 py-10 text-center">
        <span aria-hidden="true" className="text-5xl">
          🎆
        </span>
        <p className="max-w-xs text-lg font-semibold text-ink">Something arrived for you.</p>
        <Envelope label="invitation" onOpen={() => setOpened(true)} />
      </div>
    );
  }

  return (
    <div className="@container relative px-5 py-6">
      {(celebrations > 0 || isNewYear) && <Particles key={celebrations} variant="confetti" count={36} />}

      <div className="grid gap-6 @2xl:grid-cols-2 @2xl:items-center @2xl:gap-10">
        <div className="relative flex flex-col gap-6">
          <header className="relative text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">{NYE.kicker}</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{NYE.title}</h2>
            <p className="mt-1 text-sm font-medium text-ink-muted">{NYE.date}</p>
            {isNewYear ? (
              <p className="mx-auto mt-3 max-w-sm text-lg font-semibold text-ink">{NYE.happyNewYear}</p>
            ) : (
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink">{NYE.intro}</p>
            )}
            {isNyeDay && (
              <p
                role="timer"
                className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-sm font-semibold text-on-accent"
              >
                {untilMidnight(toMidnight)}
              </p>
            )}
          </header>

          <p className="relative rounded-2xl bg-surface-2 px-4 py-3 text-center text-sm text-ink-muted ring-1 ring-line">
            {NYE.dressCode}
          </p>
        </div>

        <ol
          aria-label="The plan for the night"
          className="relative ml-4 flex flex-col gap-6 border-l-2 border-accent-soft pl-7"
        >
          {NYE_STOPS.map((stop) => (
            <Stop key={stop.id} stop={stop} />
          ))}
        </ol>
      </div>

      <div className="relative mt-6 flex flex-col items-center gap-2">
        {/* Once accepted, the button stays as a "✓ It's a date" button that replays the confetti. */}
        <button
          type="button"
          aria-pressed={rsvp}
          onClick={() => {
            setRsvp(true);
            setCelebrations((n) => n + 1);
          }}
          className="min-h-11 rounded-full bg-accent px-6 text-base font-semibold text-on-accent shadow-sm hover:opacity-90"
        >
          {rsvp ? `✓ ${NYE.rsvpDone}` : NYE.rsvpLabel}
        </button>
        <p className="text-sm text-ink-muted">♡ {NYE.signature}</p>
      </div>
    </div>
  );
}
