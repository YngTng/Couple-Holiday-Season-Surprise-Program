import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MEMORIES } from '../../content/memories';
import { Photo } from '../../ui/Photo';
import { PhotoViewer } from './PhotoViewer';

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

/** Anniversary.exe's polaroid-style grid of the photos in src/content/memories.ts; tap one to open the viewer. */
export function MemoryGallery({ header, footer }: { header?: ReactNode; footer?: ReactNode }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [returnIndex, setReturnIndex] = useState<number | null>(null);
  const tiles = useRef(new Map<number, HTMLButtonElement>());

  // Return focus to the tile that was open when the viewer closes.
  useEffect(() => {
    if (openIndex === null && returnIndex !== null) tiles.current.get(returnIndex)?.focus();
  }, [openIndex, returnIndex]);

  if (MEMORIES.length === 0) {
    return <p className="p-6 text-center text-sm text-ink-muted">No memories yet. Add them in src/content/memories.ts.</p>;
  }

  if (openIndex !== null) {
    return (
      <PhotoViewer
        memories={MEMORIES}
        index={openIndex}
        onIndexChange={(i) => {
          setOpenIndex(i);
          setReturnIndex(i);
        }}
        onClose={() => setOpenIndex(null)}
      />
    );
  }

  return (
    <div className="p-4">
      {header ?? (
        <p className="mb-4 text-center text-xs font-medium text-ink-muted">
          {MEMORIES.length} {MEMORIES.length === 1 ? 'memory' : 'memories'}
        </p>
      )}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
        {MEMORIES.map((memory, i) => (
          <li key={memory.id}>
            <button
              ref={(el) => {
                if (el) tiles.current.set(i, el);
                else tiles.current.delete(i);
              }}
              type="button"
              onClick={() => {
                setOpenIndex(i);
                setReturnIndex(i);
              }}
              aria-label={`${memory.caption}${memory.date ? `, ${memory.date}` : ''}. Open photo`}
              className={`group block w-full rounded-md bg-cream p-2 pb-3 text-left shadow-md ring-1 ring-line transition-transform hover:z-10 hover:rotate-0 hover:scale-[1.03] focus-visible:rotate-0 ${
                TILTS[i % TILTS.length] ?? ''
              }`}
            >
              <Photo src={memory.photo} alt="" className="aspect-square w-full rounded-sm object-cover" />
              <span className="mt-2 block truncate font-serif text-sm text-plum">{memory.caption}</span>
              {memory.date && (
                <span className="block truncate text-[11px] font-medium text-[#5f4567]">{memory.date}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {footer}
    </div>
  );
}
