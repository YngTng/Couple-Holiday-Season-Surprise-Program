import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { Memory } from '../../content/memories';
import { Photo } from '../../ui/Photo';

interface PhotoViewerProps {
  memories: readonly Memory[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const SWIPE_PX = 50;

/** One memory at a time. Arrow keys or swipe to move, Escape or the back button to return. */
export function PhotoViewer({ memories, index, onIndexChange, onClose }: PhotoViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);
  const memory = memories[index];
  const count = memories.length;

  useEffect(() => {
    ref.current?.focus();
  }, []);

  if (!memory) return null;

  const go = (delta: number) => onIndexChange((index + delta + count) % count);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = e.clientX;
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null || count < 2) return;
    const dx = e.clientX - start;
    if (Math.abs(dx) >= SWIPE_PX) go(dx < 0 ? 1 : -1);
  };

  return (
    <div
      ref={ref}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      role="region"
      aria-roledescription="photo viewer"
      aria-label={`Memory ${index + 1} of ${count}. Use the left and right arrow keys to move between photos.`}
      className="flex min-h-full flex-col gap-3 p-4 outline-none"
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-accent-text hover:bg-surface-2"
        >
          <span aria-hidden="true">‹</span> All photos
        </button>
        <p className="text-sm tabular-nums text-ink-muted">
          {index + 1} / {count}
        </p>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
        className="flex touch-pan-y select-none items-center justify-center"
      >
        <Photo
          key={memory.id}
          src={memory.photo}
          alt={memory.alt}
          eager
          className="max-h-[55vh] w-auto max-w-full rounded-2xl object-contain shadow-lg ring-1 ring-line animate-[fade-in_250ms_ease-out] md:max-h-[340px]"
        />
      </div>

      <div aria-live="polite" className="text-center">
        {memory.date && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-text">{memory.date}</p>
        )}
        <p className="text-base text-ink">{memory.caption}</p>
      </div>

      {count > 1 && (
        <div className="mt-auto flex justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous memory"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-lg hover:bg-surface-2"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next memory"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-lg hover:bg-surface-2"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
