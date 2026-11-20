import { useEffect, useRef, useState } from 'react';
import { CHRISTMAS, CHRISTMAS_ORNAMENTS } from '../../content/christmas';
import { usePersistentState } from '../../hooks/usePersistentState';
import { isBoolean, isStringArray } from '../../lib/storage';
import { Particles } from '../../ui/Particles';
import { Photo } from '../../ui/Photo';
import { GiftStage } from '../birthday/GiftStage';
import { ChristmasTree, TREE_SLOTS } from './ChristmasTree';

const OPENED_KEY = 'december-exe:christmas-opened';
const STAR_KEY = 'december-exe:christmas-star';
const ORNAMENTS = CHRISTMAS_ORNAMENTS.slice(0, TREE_SLOTS.length);

type View = 'tree' | 'gift' | 'reveal';

/** Christmas tree: open every ornament, light the star, then unwrap the present that appears under the tree. */
export function ChristmasApp() {
  const [opened, setOpened] = usePersistentState<string[]>(OPENED_KEY, [], isStringArray);
  const [starLit, setStarLit] = usePersistentState(STAR_KEY, false, isBoolean);
  const [view, setView] = useState<View>('tree');
  const viewRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const openedCount = ORNAMENTS.filter((o) => opened.includes(o.id)).length;
  const allOpened = openedCount === ORNAMENTS.length;

  // Move keyboard / screen reader focus to the new scene.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    viewRef.current?.focus();
  }, [view]);

  const openOrnament = (id: string) => {
    setOpened((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const onStar = () => {
    if (!allOpened) return;
    setStarLit(true);
  };

  const reset = () => {
    setOpened([]);
    setStarLit(false);
    setView('tree');
  };

  if (view === 'gift') {
    return (
      <div ref={viewRef} tabIndex={-1} className="relative flex min-h-full flex-col overflow-hidden outline-none">
        <Particles variant="snow" count={26} />
        <GiftStage tag={CHRISTMAS.giftTag} onOpened={() => setView('reveal')} />
      </div>
    );
  }

  if (view === 'reveal') {
    return (
      <div
        ref={viewRef}
        tabIndex={-1}
        className="relative flex min-h-full flex-col items-center justify-center gap-8 overflow-hidden px-8 py-12 text-center outline-none"
      >
        <Particles variant="confetti" count={36} />
        <p className="relative text-sm font-semibold uppercase tracking-[0.2em] text-accent-text">Merry Christmas</p>
        {CHRISTMAS.giftPhoto ? (
          <Photo
            src={CHRISTMAS.giftPhoto}
            alt={CHRISTMAS.giftAlt}
            eager
            className="relative max-h-[45vh] w-auto max-w-[85%] rounded-2xl object-contain shadow-lg ring-1 ring-line animate-[letter-in_600ms_ease-out_both] md:max-h-[300px]"
          />
        ) : (
          <span aria-hidden="true" className="relative text-7xl animate-[letter-in_600ms_ease-out_both]">
            🎁
          </span>
        )}
        <p className="relative max-w-xs text-lg leading-relaxed text-ink">{CHRISTMAS.giftMessage}</p>
        <button
          type="button"
          onClick={() => setView('tree')}
          className="relative mt-4 min-h-11 rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
        >
          Back to the tree
        </button>
      </div>
    );
  }

  return (
    <div ref={viewRef} tabIndex={-1} className="relative flex min-h-full flex-col items-center gap-4 overflow-hidden px-4 py-5 outline-none">
      <Particles variant="snow" count={26} />

      <p className="relative max-w-sm text-center text-lg font-semibold text-ink">{CHRISTMAS.greeting}</p>

      <ChristmasTree
        ornaments={ORNAMENTS}
        opened={opened}
        starReady={allOpened}
        starLit={starLit}
        onOpen={openOrnament}
        onStar={onStar}
        presentVisible={starLit}
        onPresent={() => setView('gift')}
      />

      <div aria-live="polite" className="relative w-full max-w-sm text-center">
        {starLit ? (
          <p className="-mt-2 text-sm font-semibold text-accent-text animate-[letter-in_500ms_ease-out_800ms_both]">
            A present appeared under the tree 🎁 Tap it!
          </p>
        ) : (
          <p className="text-sm text-ink-muted">
            {allOpened
              ? 'Every ornament is lit. Tap the star ✨'
              : `Tap the ornaments to light them up${openedCount > 0 ? ` · ${ORNAMENTS.length - openedCount} to go` : ''}`}
          </p>
        )}
      </div>

      <p className="relative text-xs font-medium text-ink-muted">
        {openedCount} of {ORNAMENTS.length} ornaments lit
      </p>

      {openedCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="relative min-h-11 rounded-full px-4 text-xs font-medium text-ink-muted underline-offset-2 hover:underline"
        >
          Hang the ornaments again
        </button>
      )}
    </div>
  );
}
