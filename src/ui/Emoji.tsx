import { useLayoutEffect, useRef, useState } from 'react';

/** Cache of vertical corrections per emoji + font, so each is measured once. */
const offsets = new Map<string, number>();
let canvas: HTMLCanvasElement | null = null;

/**
 * How far (px) the emoji's visible shape sits from the centre of its line box.
 * Emoji fonts place glyphs at different heights (flat ones like 📷 sit low), so CSS centring alone
 * leaves them looking off. We measure the actual ink with canvas and correct for it.
 */
function measureOffset(char: string, el: HTMLElement): number {
  const cs = getComputedStyle(el);
  const key = `${char}|${cs.fontSize}|${cs.fontFamily}|${cs.lineHeight}`;
  const cached = offsets.get(key);
  if (cached !== undefined) return cached;

  canvas ??= document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = `${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText(char);
  const lineBox = el.getBoundingClientRect().height;
  // CSS centres the font's ascent+descent inside the line box; the baseline sits here:
  const baseline = (lineBox + m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
  const inkCentre = baseline + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
  const offset = Number.isFinite(inkCentre) ? lineBox / 2 - inkCentre : 0;
  offsets.set(key, offset);
  return offset;
}

interface EmojiProps {
  char: string;
  className?: string;
}

/** An emoji that is optically centred in its box. Decorative: hidden from screen readers. */
export function Emoji({ char, className = '' }: EmojiProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) setOffset(measureOffset(char, ref.current));
  }, [char]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`inline-block leading-none ${className}`}
      style={offset ? { transform: `translateY(${offset.toFixed(1)}px)` } : undefined}
    >
      {char}
    </span>
  );
}
