import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useElementSize } from '../../hooks/useElementSize';

interface CandleStageProps {
  candleCount: number;
  onDone: () => void;
}

const MAX_CANDLES = 30;
/** Candle button width plus the gap between candles: 36px tap targets, or 28px on narrow phones so the cake stays short. */
const CANDLE_PITCH = 38;
const CANDLE_PITCH_NARROW = 30;
const NARROW_BELOW = 380;
/** Widest the bottom tier gets, even on a wide window. */
const MAX_TIER_WIDTH = 440;
/** Space at the ends of each tier, outside the candles. */
const TIER_PADDING = 28;
const MIN_TIERS = 3;
const MAX_TIERS = 6;
/** Height of one tier drawing (frosting + sponge), and how far the next tier's candles reach up over it. */
const TIER_HEIGHT = 130;
/** Height of a candle button (flame + stick), and how far a candle sinks into the frosting it stands in. */
const CANDLE_HEIGHT = 96;
const CANDLE_SINK = 8;
/** How far each tier sits down into the frosting of the tier below, so the tiers touch instead of floating. */
const TIER_SEAT = 8;
/** Candle colours, used in turn. Chosen to stand out against the pink cake and cream frosting. */
const CANDLE_COLOURS = ['#4f9fd8', '#f2b84b', '#5fb39a', '#9a7fd6'];

/** Cartoon palette from the reference: maroon outline, cream frosting, pink sponge with a darker stripe. */
const OUTLINE = '#8b2f3c';
const FROSTING = '#fffaf6';
const SPONGE = '#f5b8c6';
const STRIPE = '#ea8fa6';

interface Tier {
  width: number;
  candles: number;
}

const capacity = (width: number, pitch: number) => Math.max(0, Math.floor((width - TIER_PADDING) / pitch));

/**
 * Stacks the candles on a tiered cake, bottom tier first. Uses the fewest tiers (at least 3) that hold every
 * candle, then shares the candles out in proportion to each tier's room so the cake keeps its tapered shape.
 * The top tier keeps its middle free for the heart.
 */
function layoutTiers(count: number, availableWidth: number, pitch: number): Tier[] {
  const bottom = Math.max(200, Math.min(MAX_TIER_WIDTH, availableWidth));
  let widths: number[] = [];
  let caps: number[] = [];
  // Prefer a strong taper like a real tiered cake; flatten it only if the candles don't fit otherwise.
  search: for (const taper of [0.17, 0.1, 0.05]) {
    const step = Math.max(16, Math.round(bottom * taper));
    for (let tiers = MIN_TIERS; tiers <= MAX_TIERS; tiers++) {
      widths = Array.from({ length: tiers }, (_, i) => Math.max(120, bottom - i * step));
      caps = widths.map((w, i) => capacity(w, pitch) - (i === tiers - 1 ? 1 : 0));
      if (caps.reduce((sum, c) => sum + c, 0) >= count) break search;
    }
  }
  // Last resort (very narrow screens): the bottom tier takes whatever is left, even if its candles hang over.
  const short = count - caps.reduce((sum, c) => sum + c, 0);
  if (short > 0) caps[0] = (caps[0] ?? 0) + short;
  const total = caps.reduce((sum, c) => sum + c, 0);
  // Largest-remainder rounding, never more candles than a tier can hold.
  const exact = caps.map((c) => Math.min(c, (count * c) / total));
  const sizes = exact.map(Math.floor);
  const order = exact.map((x, i) => [x - Math.floor(x), i] as const).sort((a, b) => b[0] - a[0]);
  let left = count - sizes.reduce((sum, n) => sum + n, 0);
  for (const [, i] of order) {
    if (left <= 0) break;
    if ((sizes[i] ?? 0) < (caps[i] ?? 0)) {
      sizes[i] = (sizes[i] ?? 0) + 1;
      left--;
    }
  }
  // The heart sits in the middle of the top tier, so that tier needs an even number of candles (same on each
  // side). Move one candle down to a lower tier with room, or else up from a lower tier, to even it up.
  const topIdx = sizes.length - 1;
  if (topIdx > 0 && (sizes[topIdx] ?? 0) % 2 === 1) {
    const lower = Array.from({ length: topIdx }, (_, i) => topIdx - 1 - i); // nearest tier first
    const roomy = lower.find((i) => (sizes[i] ?? 0) < (caps[i] ?? 0));
    const spare = lower.find((i) => (sizes[i] ?? 0) > 1);
    if (roomy !== undefined) {
      sizes[topIdx] = (sizes[topIdx] ?? 0) - 1;
      sizes[roomy] = (sizes[roomy] ?? 0) + 1;
    } else if ((sizes[topIdx] ?? 0) < (caps[topIdx] ?? 0) && spare !== undefined) {
      sizes[topIdx] = (sizes[topIdx] ?? 0) + 1;
      sizes[spare] = (sizes[spare] ?? 0) - 1;
    }
  }
  return widths.map((width, i) => ({ width, candles: sizes[i] ?? 0 }));
}

/** A small four-point sparkle centred on (x, y). */
function star(x: number, y: number, r: number): string {
  const k = r * 0.32;
  return `M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k}Z`;
}

/** One cake tier: pink sponge narrowing slightly towards the bottom, with wavy cream frosting dripping over the top. */
function TierDrawing({ width, seed }: { width: number; seed: number }) {
  const clipId = `tier-${useId().replace(/:/g, '')}`;
  const pad = 3;
  const l = pad;
  const r = pad + width;
  const h = TIER_HEIGHT;
  const top = pad + 2;
  const capBottom = 40;
  const drip = 56;
  const bodyTop = 34;
  const bodyBottom = h - 4;

  // Frosting: rounded top, wavy drips along the bottom edge (drawn right to left).
  const waves = Math.max(4, Math.round(width / 40));
  const seg = width / waves;
  let frosting = `M${l} ${capBottom} L${l} ${top + 14} Q${l} ${top} ${l + 18} ${top} L${r - 18} ${top} Q${r} ${top} ${r} ${top + 14} L${r} ${capBottom}`;
  for (let i = waves - 1; i >= 0; i--) {
    const x0 = l + (i + 1) * seg;
    const x1 = l + i * seg;
    const depth = (i + seed) % 2 === 0 ? drip : drip - 9;
    frosting += ` C${x0 - seg * 0.2} ${depth} ${x1 + seg * 0.2} ${depth} ${x1} ${capBottom}`;
  }
  frosting += 'Z';

  // Sponge: a little narrower at the bottom, with rounded bottom corners.
  const body = `M${l + 6} ${bodyTop} L${r - 6} ${bodyTop} L${r - 16} ${bodyBottom - 10} Q${r - 17} ${bodyBottom} ${r - 28} ${bodyBottom} L${l + 28} ${bodyBottom} Q${l + 17} ${bodyBottom} ${l + 16} ${bodyBottom - 10}Z`;
  const stripe = `M${r - width * 0.3} ${bodyTop - 2} L${r - width * 0.15} ${bodyTop - 2} L${r - width * 0.2} ${h} L${r - width * 0.35} ${h}Z`;
  // Light squiggle on the frosting, like piping.
  const sx = l + width * 0.26;
  const squiggle = `M${sx} 22 q7 -4 14 0 t14 0 t14 0`;

  return (
    <svg
      width={width + pad * 2}
      height={TIER_HEIGHT}
      viewBox={`0 0 ${width + pad * 2} ${TIER_HEIGHT}`}
      className="block overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={body} fill={SPONGE} />
      <path d={stripe} fill={STRIPE} clipPath={`url(#${clipId})`} />
      <path d={star(l + width * 0.22, bodyBottom - 22, 4.5)} fill="#fff" />
      <path d={star(r - width * 0.44, bodyBottom - 12, 3.5)} fill="#fff" />
      <path d={body} fill="none" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={frosting} fill={FROSTING} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={squiggle} fill="none" stroke="#f2a3bb" strokeWidth="1.6" strokeLinecap="round" />
      <path d={star(r - width * 0.16, 19, 5)} fill="#e87e99" />
    </svg>
  );
}

/** The heart on top of the cake. */
function Heart() {
  return (
    // A cake-topper heart on a stick. Its top sits just above the candle flames (candles are 96px tall with the
    // flame top about 27px down; the heart's top is about 22px down).
    <span aria-hidden="true" className="flex h-24 w-9 shrink-0 flex-col items-center justify-end">
      <svg viewBox="0 0 32 30" className="relative z-10 -mb-1 h-7 w-7 shrink-0 overflow-visible">
        <path
          d="M16 28 C6 20 2 15 2 9.5 C2 5 5.5 2 9.5 2 C12.5 2 14.8 3.8 16 6 C17.2 3.8 19.5 2 22.5 2 C26.5 2 30 5 30 9.5 C30 15 26 20 16 28Z"
          fill="#ef6f8f"
          stroke={OUTLINE}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M8 8.5 Q9 6 11.5 5.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      </svg>
      <span className="h-[50px] w-1.5 shrink-0 rounded-full" style={{ background: FROSTING, boxShadow: `0 0 0 1.5px ${OUTLINE}` }} />
    </span>
  );
}

/** Cake stand under the bottom tier. */
function Stand({ width }: { width: number }) {
  const w = width + 40;
  const c = w / 2;
  return (
    <svg width={w + 6} height={46} viewBox={`0 0 ${w + 6} 46`} className="-mt-3 block overflow-visible" aria-hidden="true">
      <path
        d={`M${c + 3 - 18} 16 L${c + 3 + 18} 16 L${c + 3 + 30} 40 L${c + 3 - 30} 40Z`}
        fill={FROSTING}
        stroke={OUTLINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x={c + 3 - 40} y={38} width={80} height={6} rx={3} fill={FROSTING} stroke={OUTLINE} strokeWidth="2.5" />
      <rect x={3} y={6} width={w} height={11} rx={5.5} fill={FROSTING} stroke={OUTLINE} strokeWidth="2.5" />
      <path d={`M${w * 0.18} 11.5 L${w * 0.32} 11.5`} stroke="#f2a3bb" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CandleStage({ candleCount, onDone }: CandleStageProps) {
  const count = Math.min(MAX_CANDLES, Math.max(1, Math.round(candleCount)));
  const [lit, setLit] = useState<boolean[]>(() => Array.from({ length: count }, () => true));
  const continueRef = useRef<HTMLButtonElement>(null);
  const remaining = lit.filter(Boolean).length;
  const allOut = remaining === 0;
  const [areaRef, area] = useElementSize<HTMLDivElement>();
  // Laid out bottom tier first; drawn top tier first.
  const available = area.width > 0 ? area.width - 56 : MAX_TIER_WIDTH;
  const pitch = available < NARROW_BELOW ? CANDLE_PITCH_NARROW : CANDLE_PITCH;
  const tiers = layoutTiers(count, available, pitch);
  const topDown = tiers.map((tier, i) => ({ ...tier, level: i })).reverse();

  useEffect(() => {
    if (allOut) continueRef.current?.focus();
  }, [allOut]);

  const blowOut = (index: number) => {
    setLit((prev) => prev.map((isLit, i) => (i === index ? false : isLit)));
  };

  const candle = (i: number) => {
    const isLit = lit[i] ?? false;
    return (
      <button
        key={i}
        type="button"
        onClick={() => isLit && blowOut(i)}
        aria-disabled={!isLit}
        aria-label={isLit ? `Candle ${i + 1}, lit. Blow it out` : `Candle ${i + 1}, blown out`}
        className="flex h-24 flex-col items-center justify-end rounded-xl"
        style={{ width: pitch - 2 }}
      >
        {isLit ? <span className="flame" /> : <span className="smoke" />}
        <span
          className="candle-stick h-11 w-3"
          style={{ '--candle': CANDLE_COLOURS[i % CANDLE_COLOURS.length] } as CSSProperties}
        />
      </button>
    );
  };

  // Candle numbers run top tier to bottom, left to right.
  let next = 0;

  return (
    <div ref={areaRef} className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-6 text-center">
      <p aria-live="polite" className="text-sm font-medium text-ink-muted">
        {allOut ? 'All the candles are out' : `Tap each candle to blow it out · ${remaining} left`}
      </p>

      <div className="flex max-w-full flex-col items-center">
        {topDown.map((tier, t) => {
          const first = next;
          next += tier.candles;
          const indices = Array.from({ length: tier.candles }, (_, j) => first + j);
          const isTop = t === 0;
          const half = Math.ceil(indices.length / 2);
          return (
            <div key={tier.level} className="relative flex flex-col items-center" style={{ zIndex: t + 1 }}>
              {/* Candles stand in this tier's frosting; below the top tier they stand in front of the tier above. */}
              <div
                className="relative z-10 flex items-end justify-center gap-0.5"
                // Below the top tier, the candle row is pulled up so this tier's frosting meets the bottom of
                // the tier above; its candles then stand on the visible ledge in front of that tier.
                style={{
                  marginTop: t > 0 ? -(CANDLE_HEIGHT - CANDLE_SINK + TIER_SEAT) : 0,
                  marginBottom: -CANDLE_SINK,
                }}
              >
                {isTop ? (
                  <>
                    {indices.slice(0, half).map(candle)}
                    <Heart />
                    {indices.slice(half).map(candle)}
                  </>
                ) : (
                  indices.map(candle)
                )}
              </div>
              <TierDrawing width={tier.width} seed={tier.level} />
            </div>
          );
        })}
        <div className="relative" style={{ zIndex: topDown.length + 1 }}>
          <Stand width={tiers[0]?.width ?? MAX_TIER_WIDTH} />
        </div>
      </div>

      {allOut && (
        <div className="flex flex-col items-center gap-4 animate-[fade-in_500ms_ease-out_both]">
          <button
            ref={continueRef}
            type="button"
            onClick={onDone}
            className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow hover:brightness-110"
          >
            Open your present <span aria-hidden="true">🎁</span>
          </button>
        </div>
      )}
    </div>
  );
}
