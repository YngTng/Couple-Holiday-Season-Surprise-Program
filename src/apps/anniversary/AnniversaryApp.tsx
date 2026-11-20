import { useEffect, useRef, useState } from 'react';
import { ANNIVERSARY } from '../../content/anniversary';
import { MEMORIES } from '../../content/memories';
import { Particles } from '../../ui/Particles';
import { Photo } from '../../ui/Photo';
import { MemoryGallery } from './MemoryGallery';

/** The bouquet view: flowers and the anniversary message, with confetti. */
function BouquetMessage({ onBack }: { onBack: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onBack();
        }
      }}
      className="relative flex min-h-full flex-col p-4 outline-none"
    >
      <Particles variant="confetti" count={30} />
      <button
        type="button"
        onClick={onBack}
        className="relative flex min-h-11 items-center gap-1 self-start rounded-xl px-3 text-sm font-semibold text-accent-text hover:bg-surface-2"
      >
        <span aria-hidden="true">‹</span> Our photos
      </button>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
        <Photo
          src={ANNIVERSARY.messagePhoto}
          alt={ANNIVERSARY.messagePhotoAlt}
          eager
          className="w-full max-w-sm rounded-2xl object-cover shadow-lg ring-1 ring-line animate-[letter-in_600ms_ease-out_both]"
        />
        <p
          aria-live="polite"
          className="max-w-sm font-serif text-xl leading-relaxed text-ink animate-[letter-in_600ms_ease-out_400ms_both]"
        >
          {ANNIVERSARY.message}
        </p>
        <span aria-hidden="true" className="text-xl text-accent-text animate-[letter-in_600ms_ease-out_800ms_both]">
          ♡
        </span>
      </div>
    </div>
  );
}

/** Anniversary.exe: the Memories gallery (tap a photo to see it whole), then a bouquet with a message. */
export function AnniversaryApp() {
  const [showBouquet, setShowBouquet] = useState(false);
  const bouquetButton = useRef<HTMLButtonElement>(null);
  const [returning, setReturning] = useState(false);

  // Back from the message: put focus (and the view) on the bouquet button again.
  useEffect(() => {
    if (showBouquet || !returning) return;
    bouquetButton.current?.focus();
    bouquetButton.current?.scrollIntoView({ block: 'center' });
    setReturning(false);
  }, [showBouquet, returning]);

  if (showBouquet) {
    return (
      <BouquetMessage
        onBack={() => {
          setShowBouquet(false);
          setReturning(true);
        }}
      />
    );
  }

  return (
    <MemoryGallery
      header={
        <header className="mb-5 text-center">
          <span aria-hidden="true" className="text-4xl">
            💞
          </span>
          <p className="mx-auto mt-2 max-w-sm text-lg font-semibold text-ink">{ANNIVERSARY.intro}</p>
          <p className="mt-1 text-xs font-medium text-ink-muted">
            {MEMORIES.length} {MEMORIES.length === 1 ? 'moment' : 'moments'} · tap one to see it
          </p>
        </header>
      }
      footer={
        <div className="mt-10 flex justify-center pb-4">
          <button
            ref={bouquetButton}
            type="button"
            onClick={() => setShowBouquet(true)}
            className="group flex flex-col items-center gap-1 rounded-2xl p-2 transition-transform hover:scale-105 focus-visible:scale-105"
          >
            <Photo
              src={ANNIVERSARY.bouquetPhoto}
              alt=""
              className="h-40 w-40 object-contain drop-shadow-lg transition-transform group-hover:-rotate-3"
            />
            <span className="text-sm font-semibold text-accent-text">{ANNIVERSARY.bouquetLabel}</span>
          </button>
        </div>
      }
    />
  );
}
