import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { PUZZLE, PUZZLE_PRIZE } from '../../content/games';
import { useElementSize } from '../../hooks/useElementSize';
import { usePersistentState } from '../../hooks/usePersistentState';
import { isBoolean, isNumberOrNull } from '../../lib/storage';
import { useReducedMotion } from '../../settings/SettingsProvider';
import { Particles } from '../../ui/Particles';
import { Photo } from '../../ui/Photo';
import { BEST_KEYS, PUZZLE_PRIZE_KEY, formatSeconds } from './bestScores';
import { QuizCoupon } from './QuizCoupon';

/**
 * Classic jigsaw. All positions are in "cell units": one piece is 1×1, the board is SIZE×SIZE.
 * A piece's (x, y) is the top-left of its 1×1 cell; tabs stick out up to PAD beyond it.
 */
const SIZE = 4;
const PAD = 0.3;
const BOARD = { x: 0.4, y: 0.4 };
const SNAP = 0.3;
const MAX_UNIT_PX = 100;
/** Rounding on the puzzle's outer corners, in cell units. */
const CORNER_R = 0.12;
/** Space kept under the finished photo for the time and "best yet" lines, in px. */
const FINISHED_TEXT_PX = 80;

type Edge = -1 | 0 | 1; // 1 = tab sticks out, -1 = hole, 0 = flat border

interface Piece {
  id: number;
  row: number;
  col: number;
  /** top, right, bottom, left */
  edges: [Edge, Edge, Edge, Edge];
  /** Outline in the piece's own 0..1 box. */
  path: string;
  x: number;
  y: number;
  placed: boolean;
  z: number;
}

interface Layout {
  wide: boolean;
  width: number;
  height: number;
  /** Where loose pieces get scattered (range for a piece's top-left). */
  tray: { x0: number; y0: number; x1: number; y1: number };
}

const LAYOUTS: Record<'wide' | 'narrow', Layout> = {
  // Board on the left, pieces on the right.
  wide: { wide: true, width: 9.6, height: 4.8, tray: { x0: 5.2, y0: 0.35, x1: 8.25, y1: 3.45 } },
  // Board on top, pieces underneath.
  narrow: { wide: false, width: 4.8, height: 8.9, tray: { x0: 0.35, y0: 5.05, x1: 3.45, y1: 7.55 } },
};

const random = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const flip = (): Edge => (Math.random() < 0.5 ? 1 : -1);

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = a[i];
    const y = a[j];
    if (x !== undefined && y !== undefined) {
      a[i] = y;
      a[j] = x;
    }
  }
  return a;
}

/** Jittered grid in the tray, in random order, so pieces overlap a little but not completely. */
function scatterSpots(layout: Layout, count: number): { x: number; y: number }[] {
  const { x0, y0, x1, y1 } = layout.tray;
  const spots = Array.from({ length: count }, (_, i) => {
    const c = i % SIZE;
    const r = Math.floor(i / SIZE);
    return {
      x: clamp(x0 + (c / (SIZE - 1)) * (x1 - x0) + random(-0.12, 0.12), x0, x1),
      y: clamp(y0 + (r / (SIZE - 1)) * (y1 - y0) + random(-0.12, 0.12), y0, y1),
    };
  });
  return shuffle(spots);
}

function makePieces(layout: Layout): Piece[] {
  // Shared edges: a tab on one piece is a hole on its neighbour.
  const below = Array.from({ length: SIZE - 1 }, () => Array.from({ length: SIZE }, flip));
  const right = Array.from({ length: SIZE }, () => Array.from({ length: SIZE - 1 }, flip));
  const spots = scatterSpots(layout, SIZE * SIZE);
  const pieces: Piece[] = [];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const id = row * SIZE + col;
      const top: Edge = row === 0 ? 0 : ((-(below[row - 1]?.[col] ?? 0)) as Edge);
      const bottom: Edge = row === SIZE - 1 ? 0 : (below[row]?.[col] ?? 0);
      const left: Edge = col === 0 ? 0 : ((-(right[row]?.[col - 1] ?? 0)) as Edge);
      const rightEdge: Edge = col === SIZE - 1 ? 0 : (right[row]?.[col] ?? 0);
      const spot = spots[id] ?? { x: layout.tray.x0, y: layout.tray.y0 };
      const edges: Piece['edges'] = [top, rightEdge, bottom, left];
      pieces.push({ id, row, col, edges, path: piecePath(edges), x: spot.x, y: spot.y, placed: false, z: id + 1 });
    }
  }
  return pieces;
}

/** Tab outline along an edge, as (along, outward) pairs, drawn from 0 to 1 along the edge. */
const TAB: readonly [number, number][][] = [
  [[0.4, 0], [0.42, 0.05], [0.38, 0.11]],
  [[0.31, 0.22], [0.4, 0.28], [0.5, 0.28]],
  [[0.6, 0.28], [0.69, 0.22], [0.62, 0.11]],
  [[0.58, 0.05], [0.6, 0], [0.65, 0]],
];

const round = (n: number) => Math.round(n * 1000) / 1000;

/** SVG path for one piece in its own 0..1 box. */
function piecePath(edges: Piece['edges']): string {
  const corners: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  // Only the puzzle's four outer corners have two flat edges meeting; those get rounded.
  const rounded = (i: number) => edges[i % 4] === 0 && edges[(i + 3) % 4] === 0;
  const lerp = (i: number, t: number) => {
    const [ax, ay] = corners[i % 4] ?? [0, 0];
    const [bx, by] = corners[(i + 1) % 4] ?? [0, 0];
    return `${round(ax + t * (bx - ax))},${round(ay + t * (by - ay))}`;
  };
  let d = `M${rounded(0) ? lerp(0, CORNER_R) : '0,0'}`;
  edges.forEach((edge, i) => {
    const [ax, ay] = corners[i] ?? [0, 0];
    const [bx, by] = corners[(i + 1) % 4] ?? [0, 0];
    const dx = bx - ax;
    const dy = by - ay;
    // Outward normal for a clockwise outline with y pointing down.
    const nx = dy;
    const ny = -dx;
    const at = (t: number, s: number) => `${round(ax + t * dx + s * edge * nx)},${round(ay + t * dy + s * edge * ny)}`;
    if (edge !== 0) {
      d += ` L${at(0.35, 0)}`;
      for (const curve of TAB) d += ` C${curve.map(([t, s]) => at(t, s)).join(' ')}`;
    }
    if (rounded(i + 1)) {
      const [cx, cy] = corners[(i + 1) % 4] ?? [0, 0];
      d += ` L${at(1 - CORNER_R, 0)} Q${cx},${cy} ${lerp(i + 1, CORNER_R)}`;
    } else {
      d += ` L${at(1, 0)}`;
    }
  });
  return `${d} Z`;
}

const isHome = (p: Piece) => Math.abs(p.x - (BOARD.x + p.col)) < SNAP && Math.abs(p.y - (BOARD.y + p.row)) < SNAP;

/** "Rebuild Us": a 4×4 jigsaw of one of your photos, timed. */
export function RebuildUs() {
  const uid = useId().replace(/:/g, '');
  const reducedMotion = useReducedMotion();
  const [wrapRef, wrapSize] = useElementSize<HTMLDivElement>();
  // Size to fit the space left in the window, both ways, so it never needs scrolling.
  // Pieces go beside the board unless stacking them underneath gives bigger pieces (phones).
  const fit = (l: Layout) => Math.floor(Math.min(MAX_UNIT_PX, wrapSize.width / l.width, wrapSize.height / l.height));
  const layout = fit(LAYOUTS.narrow) > fit(LAYOUTS.wide) ? LAYOUTS.narrow : LAYOUTS.wide;
  const unit = wrapSize.width > 0 && wrapSize.height > 0 ? fit(layout) : 0;

  const [pieces, setPieces] = useState<Piece[]>(() => makePieces(layout));
  const [dragId, setDragId] = useState<number | null>(null);
  const [focusId, setFocusId] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [peek, setPeek] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [best, setBest] = usePersistentState<number | null>(BEST_KEYS.puzzle, null, isNumberOrNull);
  const [prizeWon, setPrizeWon] = usePersistentState<boolean>(PUZZLE_PRIZE_KEY, false, isBoolean);
  /** null = not showing; 'fresh' = just collected (confetti); 'saved' = reopened later. */
  const [showPrize, setShowPrize] = useState<null | 'fresh' | 'saved'>(null);
  const prizeHeadingRef = useRef<HTMLHeadingElement>(null);

  const areaRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const zTop = useRef(SIZE * SIZE + 1);
  const pieceRefs = useRef(new Map<number, SVGPathElement>());
  const layoutRef = useRef(layout);

  const placedCount = pieces.filter((p) => p.placed).length;
  const won = placedCount === pieces.length;

  // Tell her if the photo path is wrong instead of showing blank pieces.
  useEffect(() => {
    setPhotoError(false);
    const img = new Image();
    img.onerror = () => setPhotoError(true);
    img.src = PUZZLE.photo;
  }, []);

  // Window resized across the wide/narrow line: put loose pieces back in the new tray.
  useEffect(() => {
    if (layoutRef.current === layout) return;
    layoutRef.current = layout;
    const spots = scatterSpots(layout, SIZE * SIZE);
    setPieces((prev) => prev.map((p, i) => (p.placed ? p : { ...p, ...(spots[i] ?? p) })));
  }, [layout]);

  // Timer: starts on the first touch, stops when the last piece goes in.
  useEffect(() => {
    if (startedAt === null || won) return;
    const tick = () => setElapsed(Math.floor((performance.now() - startedAt) / 1000));
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [startedAt, won]);

  useEffect(() => {
    if (!won || startedAt === null) return;
    const final = Math.max(1, Math.round((performance.now() - startedAt) / 1000));
    setElapsed(final);
    setBest((prev) => (prev === null || final < prev ? final : prev));
    setAnnouncement(`Finished in ${formatSeconds(final)}!`);
    setPrizeWon(true);
  }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showPrize) prizeHeadingRef.current?.focus();
  }, [showPrize]);

  const startClock = () => setStartedAt((s) => s ?? performance.now());

  const toUnits = (e: PointerEvent) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect || unit === 0) return { x: 0, y: 0 };
    return { x: (e.clientX - rect.left) / unit, y: (e.clientY - rect.top) / unit };
  };

  const clampToArea = (x: number, y: number) => ({
    x: clamp(x, PAD, layout.width - 1 - PAD),
    y: clamp(y, PAD, layout.height - 1 - PAD),
  });

  const update = (id: number, change: Partial<Piece>) =>
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, ...change } : p)));

  const settle = useCallback(
    (piece: Piece) => {
      if (isHome(piece)) {
        update(piece.id, { x: BOARD.x + piece.col, y: BOARD.y + piece.row, placed: true, z: 0 });
        setAnnouncement(`Piece placed. ${placedCount + 1} of ${SIZE * SIZE}.`);
        return true;
      }
      return false;
    },
    [placedCount],
  );

  const onPointerDown = (e: PointerEvent<SVGPathElement>, piece: Piece) => {
    if (piece.placed || e.button > 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const at = toUnits(e);
    dragOffset.current = { x: at.x - piece.x, y: at.y - piece.y };
    setDragId(piece.id);
    update(piece.id, { z: zTop.current++ });
    startClock();
  };

  const onPointerMove = (e: PointerEvent<SVGPathElement>, piece: Piece) => {
    if (dragId !== piece.id) return;
    const at = toUnits(e);
    update(piece.id, clampToArea(at.x - dragOffset.current.x, at.y - dragOffset.current.y));
  };

  const onPointerUp = (piece: Piece) => {
    if (dragId !== piece.id) return;
    setDragId(null);
    settle(piece);
  };

  /** Keyboard: arrows hop the piece between board cells, Enter or Space drops it in. */
  const onKeyDown = (e: KeyboardEvent<SVGPathElement>, piece: Piece) => {
    if (piece.placed) return;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      startClock();
      const col = clamp(Math.round(piece.x - BOARD.x), 0, SIZE - 1);
      const row = clamp(Math.round(piece.y - BOARD.y), 0, SIZE - 1);
      const onCell = piece.x === BOARD.x + col && piece.y === BOARD.y + row;
      const nc = onCell ? clamp(col + move[0], 0, SIZE - 1) : col;
      const nr = onCell ? clamp(row + move[1], 0, SIZE - 1) : row;
      update(piece.id, { x: BOARD.x + nc, y: BOARD.y + nr, z: zTop.current++ });
      setAnnouncement(`Row ${nr + 1}, column ${nc + 1}`);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (settle(piece)) {
        const next = pieces.find((p) => !p.placed && p.id !== piece.id);
        if (next) window.setTimeout(() => pieceRefs.current.get(next.id)?.focus(), 0);
      } else {
        setAnnouncement("That piece doesn't go here.");
      }
    }
  };

  const restart = () => {
    setPieces(makePieces(layout));
    setStartedAt(null);
    setElapsed(0);
    setDragId(null);
    setAnnouncement('');
  };

  const box = 1 + 2 * PAD;
  const boardPx = SIZE * unit;
  /** Finished photo: as big as the space allows, leaving room for the time underneath. */
  const finishedPx = Math.max(0, Math.floor(Math.min(wrapSize.width, wrapSize.height - FINISHED_TEXT_PX, SIZE * MAX_UNIT_PX)));
  const photo = (
    <image href={PUZZLE.photo} x={0} y={0} width={SIZE} height={SIZE} preserveAspectRatio="xMidYMid slice" />
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-3">
      {showPrize && (
        // Covers the puzzle rather than replacing it, so a game in progress stays put underneath.
        <div className="absolute inset-0 z-[2000] flex flex-col items-center gap-4 overflow-y-auto bg-surface py-4 text-center">
          {showPrize === 'fresh' && <Particles variant="confetti" count={36} />}
          <h3 ref={prizeHeadingRef} tabIndex={-1} className="px-4 text-lg font-semibold text-ink outline-none">
            {showPrize === 'fresh' ? PUZZLE_PRIZE.reveal : 'Your coupon'}
          </h3>
          <QuizCoupon fresh={showPrize === 'fresh'} coupon={PUZZLE_PRIZE.coupon} />
          <p className="max-w-xs text-xs text-ink-muted">Screenshot it and show it to me when you want to cash it in.</p>
          <button
            type="button"
            onClick={() => setShowPrize(null)}
            className="min-h-11 rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            Back to the puzzle
          </button>
        </div>
      )}
      <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-full bg-surface-2 px-5 py-2 text-sm text-ink-muted ring-1 ring-line">
        <span>
          Time: <strong className="tabular-nums text-ink">{formatSeconds(elapsed)}</strong>
        </span>
        <span>
          Pieces: <strong className="tabular-nums text-ink">{placedCount}</strong> / {SIZE * SIZE}
        </span>
        <span>
          Best: <strong className="tabular-nums text-ink">{best === null ? '–' : formatSeconds(best)}</strong>
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {photoError && (
        <p role="alert" className="rounded-xl bg-surface-2 p-3 text-center text-sm text-ink">
          Couldn't load the puzzle photo ({PUZZLE.photo}).
        </p>
      )}

      <div ref={wrapRef} className="min-h-0 w-full flex-1 overflow-hidden">
        {won && (
          // Finished: the whole photo, centred, with her time right underneath.
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Photo
              src={PUZZLE.photo}
              alt={PUZZLE.alt}
              eager
              className={`aspect-square rounded-2xl object-cover shadow-lg ring-1 ring-line ${reducedMotion ? '' : 'animate-[fade-in_700ms_ease-out_both]'}`}
              style={{ width: finishedPx, height: finishedPx }}
            />
            <div role="status" className="flex flex-col items-center gap-1 text-center animate-[letter-in_400ms_ease-out_both]">
              <p className="text-lg font-semibold text-ink">Rebuilt in {formatSeconds(elapsed)}!</p>
              {best === elapsed && <p className="text-sm text-accent-text">That's your best yet ✨</p>}
            </div>
          </div>
        )}
        {!won && unit > 0 && (
          <div
            ref={areaRef}
            className="puzzle-area relative mx-auto overflow-hidden rounded-2xl"
            style={{ width: layout.width * unit, height: layout.height * unit }}
          >
            {/* Board: faint photo when peeking, plus a dashed outer edge. */}
            <svg
              aria-hidden="true"
              className="absolute"
              style={{ left: BOARD.x * unit, top: BOARD.y * unit, width: boardPx, height: boardPx, overflow: 'visible' }}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
            >
              <defs>
                <clipPath id={`${uid}-board`}>
                  <rect width={SIZE} height={SIZE} rx={CORNER_R} />
                </clipPath>
              </defs>
              <rect width={SIZE} height={SIZE} rx={CORNER_R} className="puzzle-board" />
              <g style={{ opacity: peek && !won ? 0.25 : 0, transition: reducedMotion ? undefined : 'opacity 200ms' }}>
                <g clipPath={`url(#${uid}-board)`}>{photo}</g>
              </g>
              {/* Outer edge only: no slot outlines inside, so she has to work out where pieces go. */}
              {!won && <rect width={SIZE} height={SIZE} rx={CORNER_R} className="puzzle-edge" vectorEffect="non-scaling-stroke" />}
            </svg>

            {/* Pieces. Placed ones sit underneath (z 0); the one you're holding is on top. */}
            {pieces.map((p) => {
              const dragging = dragId === p.id;
              const clipId = `${uid}-clip-${p.id}`;
              return (
                <svg
                  key={p.id}
                  className="absolute"
                  style={{
                    left: (p.x - PAD) * unit,
                    top: (p.y - PAD) * unit,
                    width: box * unit,
                    height: box * unit,
                    zIndex: dragging ? 1000 : p.z,
                    pointerEvents: 'none',
                    touchAction: 'none',
                    filter: dragging ? 'drop-shadow(0 6px 8px rgba(42,22,48,0.35))' : p.placed ? undefined : 'drop-shadow(0 2px 3px rgba(42,22,48,0.25))',
                    transition: dragging || reducedMotion ? undefined : 'left 140ms ease-out, top 140ms ease-out',
                  }}
                  viewBox={`${-PAD} ${-PAD} ${box} ${box}`}
                >
                  <defs>
                    <clipPath id={clipId}>
                      <path d={p.path} />
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#${clipId})`}>
                    <g transform={`translate(${-p.col} ${-p.row})`}>{photo}</g>
                  </g>
                  <path
                    ref={(el) => {
                      if (el) pieceRefs.current.set(p.id, el);
                      else pieceRefs.current.delete(p.id);
                    }}
                    d={p.path}
                    role={p.placed ? undefined : 'button'}
                    aria-label={p.placed ? undefined : `Puzzle piece ${p.id + 1}`}
                    aria-hidden={p.placed || undefined}
                    tabIndex={p.placed ? -1 : 0}
                    vectorEffect="non-scaling-stroke"
                    className={`puzzle-piece ${p.placed ? 'is-placed' : ''} ${focusId === p.id ? 'is-focused' : ''}`}
                    style={{ pointerEvents: p.placed ? 'none' : 'all', cursor: dragging ? 'grabbing' : 'grab', outline: 'none' }}
                    onPointerDown={(e) => onPointerDown(e, p)}
                    onPointerMove={(e) => onPointerMove(e, p)}
                    onPointerUp={() => onPointerUp(p)}
                    onPointerCancel={() => onPointerUp(p)}
                    onKeyDown={(e) => onKeyDown(e, p)}
                    onFocus={() => setFocusId(p.id)}
                    onBlur={() => setFocusId((f) => (f === p.id ? null : f))}
                  />
                </svg>
              );
            })}
          </div>
        )}
      </div>

      {!won && (
        <p className="text-center text-xs text-ink-muted">
          Drag each piece onto the board. With a keyboard: Tab to a piece, arrows to move it, Enter to drop it in.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {won && (
          <button
            type="button"
            onClick={() => setShowPrize('fresh')}
            className="tree-present min-h-11 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent shadow hover:brightness-110"
          >
            <span aria-hidden="true">🎁 </span>Collect your prize
          </button>
        )}
        {!won && prizeWon && (
          <button
            type="button"
            onClick={() => setShowPrize('saved')}
            className="min-h-11 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            <span aria-hidden="true">🎟️ </span>View my prize
          </button>
        )}
        {!won && (
          <button
            type="button"
            aria-pressed={peek}
            onClick={() => setPeek((v) => !v)}
            className="min-h-11 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            {peek ? 'Hide the photo' : 'Peek at the photo'}
          </button>
        )}
        <button
          type="button"
          onClick={restart}
          className="min-h-11 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2"
        >
          {won ? 'Play again' : 'Shuffle and restart'}
        </button>
      </div>
    </div>
  );
}
