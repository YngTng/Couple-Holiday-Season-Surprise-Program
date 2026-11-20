import type { CSSProperties, ReactNode } from 'react';
import type { ChristmasOrnament } from '../../content/christmas';

/**
 * Ornament positions in tree units (viewBox 100 x 115). Spaced for 44px touch targets.
 * The bottom row is Santa's face with a reindeer either side (see DECORATIONS), so there are no ornament slots there.
 */
export const TREE_SLOTS: readonly (readonly [number, number])[] = [
  [50, 24],
  [40, 39],
  [60, 39],
  [50, 54],
  [33, 62],
  [67, 62],
  [42, 74],
  [58, 74],
];

const BAUBLE_COLOURS = ['#e58fa8', '#b59ae0', '#f4b183', '#c2556f', '#e9c46a', '#8fb3d9'];
const LIGHTS: readonly (readonly [number, number])[] = [
  [44, 30], [56, 31], [36, 47], [64, 47], [28, 66], [72, 66], [20, 84], [80, 84], [35, 83], [65, 83], [50, 66],
];

interface ChristmasTreeProps {
  ornaments: readonly ChristmasOrnament[];
  opened: readonly string[];
  starReady: boolean;
  starLit: boolean;
  onOpen: (id: string) => void;
  onStar: () => void;
  /** Show the wrapped present beside the trunk (once the star is lit). */
  presentVisible: boolean;
  onPresent: () => void;
}

const pos = (x: number, y: number): CSSProperties => ({ left: `${x}%`, top: `${(y / 115) * 100}%` });

export function ChristmasTree({
  ornaments,
  opened,
  starReady,
  starLit,
  onOpen,
  onStar,
  presentVisible,
  onPresent,
}: ChristmasTreeProps) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]" style={{ aspectRatio: '100 / 115' }}>
      <svg viewBox="0 0 100 115" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <ellipse cx="50" cy="110" rx="40" ry="4" fill="#fff8ef" opacity="0.8" />
        <rect x="44" y="96" width="12" height="13" rx="1.5" fill="#8a5a44" />
        <polygon points="50,46 8,99 92,99" fill="#4f7a5c" />
        <polygon points="50,24 17,71 83,71" fill="#5d8a6a" />
        <polygon points="50,9 28,44 72,44" fill="#6f9a7a" />
        {LIGHTS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="1.3"
            fill="#fff3c4"
            className="tree-light"
            style={{ animationDelay: `${(i * 0.37) % 2.4}s` }}
          />
        ))}
      </svg>

      <button
        type="button"
        onClick={onStar}
        aria-disabled={!starReady}
        aria-label={starLit ? 'Star, lit' : starReady ? 'Star. Tap to light it' : 'Star. Open every ornament to light it'}
        className={`absolute left-1/2 -top-2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full ${
          starLit ? 'star-lit' : starReady ? 'star-ready' : ''
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
          <path
            d="M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8 6.2 20l1.4-6.4L2.7 9.2l6.5-.7z"
            fill={starLit || starReady ? '#f2d27a' : '#d9cfb5'}
            stroke="#b8963e"
            strokeWidth="0.8"
          />
        </svg>
      </button>

      <Decoration {...DECORATIONS.reindeerLeft}>
        <ReindeerFace />
      </Decoration>
      <Decoration {...DECORATIONS.santa}>
        <SantaFace />
      </Decoration>
      <Decoration {...DECORATIONS.reindeerRight}>
        <ReindeerFace />
      </Decoration>

      {ornaments.map((ornament, i) => {
        const slot = TREE_SLOTS[i];
        if (!slot) return null;
        const isOpened = opened.includes(ornament.id);
        return (
          <button
            key={ornament.id}
            type="button"
            onClick={() => onOpen(ornament.id)}
            aria-pressed={isOpened}
            aria-label={`Ornament ${i + 1}`}
            style={pos(slot[0], slot[1])}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-start justify-center rounded-full pt-2"
          >
            <span
              className={`bauble ${isOpened ? 'bauble--opened' : 'bauble--swing'}`}
              style={{ '--bauble': BAUBLE_COLOURS[i % BAUBLE_COLOURS.length], animationDelay: `${(i * 0.45) % 3}s` } as CSSProperties}
            />
          </button>
        );
      })}

      {/* The present: drops in beside the trunk once the star is lit. */}
      {presentVisible && (
        <button
          type="button"
          onClick={onPresent}
          aria-label="A present under the tree. Tap to open it"
          className="tree-present absolute"
          style={{ ...pos(PRESENT.x, PRESENT.y), width: `${PRESENT.w}%`, height: `${(PRESENT.h / 115) * 100}%` }}
        >
          <svg viewBox="0 0 20 18" className="h-full w-full overflow-visible" aria-hidden="true">
            <ellipse cx="10" cy="17.6" rx="9" ry="0.9" fill="#2a1630" opacity="0.18" />
            <rect x="2" y="7.5" width="16" height="10" rx="1.2" fill="#c2556f" />
            <rect x="2" y="7.5" width="16" height="10" rx="1.2" fill="#000" opacity="0.06" />
            <rect x="1.2" y="5" width="17.6" height="3.4" rx="0.9" fill="#d96a84" />
            <rect x="8.8" y="5" width="2.4" height="12.5" fill="#f2d27a" />
            <ellipse cx="7.3" cy="3.4" rx="2.6" ry="1.5" transform="rotate(-20 7.3 3.4)" fill="none" stroke="#f2d27a" strokeWidth="1.1" />
            <ellipse cx="12.7" cy="3.4" rx="2.6" ry="1.5" transform="rotate(20 12.7 3.4)" fill="none" stroke="#f2d27a" strokeWidth="1.1" />
            <circle cx="10" cy="4.6" r="1.1" fill="#e9c46a" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Bottom-row faces: position (centre) and width in tree units. Decorative, not tappable. */
const DECORATIONS = {
  reindeerLeft: { x: 29, y: 89, w: 15 },
  santa: { x: 50, y: 88, w: 17 },
  reindeerRight: { x: 71, y: 89, w: 15 },
} as const;

function Decoration({ x, y, w, children }: { x: number; y: number; w: number; children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ ...pos(x, y), width: `${w}%`, aspectRatio: '20 / 22' }}
    >
      <svg viewBox="0 0 20 22" className="h-full w-full overflow-visible">
        {children}
      </svg>
    </div>
  );
}

function SantaFace() {
  return (
    <>
      {/* face */}
      <circle cx="10" cy="13" r="5.5" fill="#f6d2b8" />
      <circle cx="6.8" cy="13.6" r="1" fill="#f2a3bb" opacity="0.75" />
      <circle cx="13.2" cy="13.6" r="1" fill="#f2a3bb" opacity="0.75" />
      <circle cx="8" cy="12.2" r="0.65" fill="#2a1630" />
      <circle cx="12" cy="12.2" r="0.65" fill="#2a1630" />
      {/* beard and moustache */}
      <path d="M4.3 13.4 Q4.3 21.6 10 21.6 Q15.7 21.6 15.7 13.4 Q13 16.2 10 16.2 Q7 16.2 4.3 13.4Z" fill="#fff8ef" />
      <ellipse cx="8.3" cy="15.4" rx="1.9" ry="0.95" fill="#fff8ef" stroke="#e6dccf" strokeWidth="0.3" />
      <ellipse cx="11.7" cy="15.4" rx="1.9" ry="0.95" fill="#fff8ef" stroke="#e6dccf" strokeWidth="0.3" />
      <circle cx="10" cy="14.4" r="0.85" fill="#e5877c" />
      {/* hat */}
      <path d="M3.4 9 Q6 2.5 12.5 1.4 Q15.5 1 16.6 3.2 Q14.5 4.5 16.6 9Z" fill="#c8413f" />
      <rect x="2.4" y="7.8" width="15.2" height="2.6" rx="1.3" fill="#fff8ef" />
      <circle cx="16.8" cy="3.2" r="1.5" fill="#fff8ef" />
    </>
  );
}

function ReindeerFace() {
  return (
    <>
      {/* antlers */}
      <g fill="none" stroke="#8a5a44" strokeWidth="1.1" strokeLinecap="round">
        <path d="M7 8 L4.6 2.6 M5.6 4.8 L2.8 4 M5 3.6 L6.2 1.4" />
        <path d="M13 8 L15.4 2.6 M14.4 4.8 L17.2 4 M15 3.6 L13.8 1.4" />
      </g>
      {/* ears */}
      <ellipse cx="4.4" cy="10.2" rx="2.2" ry="1.05" transform="rotate(-25 4.4 10.2)" fill="#a8735a" />
      <ellipse cx="15.6" cy="10.2" rx="2.2" ry="1.05" transform="rotate(25 15.6 10.2)" fill="#a8735a" />
      {/* head and muzzle */}
      <ellipse cx="10" cy="13" rx="5" ry="5.6" fill="#a8735a" />
      <ellipse cx="10" cy="16.8" rx="3.6" ry="2.9" fill="#ecd3b6" />
      <circle cx="6.9" cy="14.2" r="0.9" fill="#f2a3bb" opacity="0.6" />
      <circle cx="13.1" cy="14.2" r="0.9" fill="#f2a3bb" opacity="0.6" />
      <circle cx="8" cy="11.8" r="0.65" fill="#2a1630" />
      <circle cx="12" cy="11.8" r="0.65" fill="#2a1630" />
      <circle cx="10" cy="15.6" r="1.3" fill="#c8413f" />
      <path d="M8.8 18 Q10 18.9 11.2 18" fill="none" stroke="#8a5a44" strokeWidth="0.45" strokeLinecap="round" />
    </>
  );
}

/** Present position and size in tree units: right of the trunk, sitting on the snow. */
const PRESENT = { x: 80, y: 97, w: 18, h: 15 };
