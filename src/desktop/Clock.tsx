import { useRef, type MouseEvent } from 'react';
import { useAppDate } from '../date/DateProvider';
import { useDevTools } from '../dev/DevToolsProvider';

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const TAPS_TO_OPEN = 5;
const TAP_WINDOW_MS = 1500;

/** Taskbar clock (viewer's local time). Tap 5 times quickly to open the date simulator. */
export function Clock() {
  const { now } = useAppDate();
  const { openSimulator } = useDevTools();
  const taps = useRef({ count: 0, last: 0 });

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const t = e.timeStamp;
    if (t - taps.current.last > TAP_WINDOW_MS) taps.current.count = 0;
    taps.current.count += 1;
    taps.current.last = t;
    if (taps.current.count >= TAPS_TO_OPEN) {
      taps.current.count = 0;
      openSimulator();
    }
  };

  const time = TIME_FORMAT.format(now);
  const date = DATE_FORMAT.format(now);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${date}, ${time}`}
      className="flex min-h-11 flex-col items-end justify-center rounded-xl px-3 text-right leading-tight hover:bg-surface-2"
    >
      <span className="text-sm font-semibold tabular-nums">{time}</span>
      <span className="hidden text-xs text-ink-muted sm:block">{date}</span>
    </button>
  );
}
