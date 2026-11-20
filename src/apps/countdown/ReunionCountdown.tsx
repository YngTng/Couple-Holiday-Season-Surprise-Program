import { useRef } from 'react';
import { UNLOCK_TZ } from '../../config/time';
import { COUNTDOWN_MESSAGES, COUNTDOWN_ROTATE_MS } from '../../content/countdown';
import { useAppDate } from '../../date/DateProvider';
import { REUNION_MS } from '../../lib/reunion';
import { Photo } from '../../ui/Photo';
import { TogetherModeInstall } from './TogetherModeInstall';

const TARGET_MS = REUNION_MS;

/** e.g. "20 December 2026 at 6:00 pm" in UNLOCK_TZ, built from REUNION_AT. */
const TARGET_LABEL = new Intl.DateTimeFormat('en-GB', {
  timeZone: UNLOCK_TZ,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date(TARGET_MS));

interface Unit {
  label: string;
  value: number;
}

function splitDuration(ms: number): Unit[] {
  const totalSeconds = Math.floor(ms / 1000);
  return [
    { label: 'Days', value: Math.floor(totalSeconds / 86400) },
    { label: 'Hours', value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: 'Minutes', value: Math.floor((totalSeconds % 3600) / 60) },
    { label: 'Seconds', value: totalSeconds % 60 },
  ];
}

export function ReunionCountdown() {
  const { now } = useAppDate();
  // Rotation starts from the first message each time the app is opened.
  const openedAt = useRef(now.getTime());
  const remaining = TARGET_MS - now.getTime();

  if (remaining <= 0) return <TogetherModeInstall />;

  const units = splitDuration(remaining);
  const elapsed = Math.max(0, now.getTime() - openedAt.current);
  const messageIndex = Math.floor(elapsed / COUNTDOWN_ROTATE_MS) % Math.max(1, COUNTDOWN_MESSAGES.length);
  const message = COUNTDOWN_MESSAGES[messageIndex];
  const summary = units.map((u) => `${u.value} ${u.label.toLowerCase()}`).join(', ');

  return (
    <div className="flex flex-col gap-5 p-5">
      <p className="text-sm text-ink-muted">
        Counting down to <strong className="font-semibold text-ink">{TARGET_LABEL}</strong>{' '}
        <span className="whitespace-nowrap">({UNLOCK_TZ.split('/').pop()?.replace(/_/g, ' ')} time)</span>
      </p>

      <div role="timer" aria-label={`${summary} remaining`}>
        <ul className="grid grid-cols-4 gap-2" aria-hidden="true">
          {units.map((unit) => (
            <li key={unit.label} className="flex flex-col items-center rounded-2xl bg-surface-2 px-1 py-3 ring-1 ring-line">
              <span className="font-mono text-3xl font-bold tabular-nums text-accent-text sm:text-4xl">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-muted">{unit.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {message !== undefined && (
        <figure
          key={messageIndex}
          className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-4 animate-[fade-in_400ms_ease-out]"
        >
          {message.image && (
            <Photo
              src={message.image}
              alt={message.imageAlt ?? ''}
              eager
              className="h-32 w-32 rounded-2xl object-cover shadow-md ring-1 ring-line"
            />
          )}
          <blockquote className="text-center text-base text-ink">
            <span aria-hidden="true" className="mr-1 text-accent-text">
              ♡
            </span>
            {message.text}
          </blockquote>
        </figure>
      )}
    </div>
  );
}
