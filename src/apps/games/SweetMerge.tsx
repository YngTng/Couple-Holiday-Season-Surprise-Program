import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useElementSize } from '../../hooks/useElementSize';
import { usePersistentState } from '../../hooks/usePersistentState';
import { MERGE_BALLS, MERGE_PRIZE, type MergeBall } from '../../content/games';
import { asset } from '../../lib/asset';
import { isBoolean, isNumberOrNull } from '../../lib/storage';
import { Particles } from '../../ui/Particles';
import { BEST_KEYS, MERGE_PRIZE_KEY } from './bestScores';
import { QuizCoupon } from './QuizCoupon';

/**
 * Jar Full Of You: drop photo balls into the jar. Two of the same kind that touch merge into the next one up.
 * Game over when the pile stays above the dashed line.
 *
 * Everything is simulated in a fixed 300×400 "logical" box and scaled to fit the canvas.
 */

/** Radii (logical units), smallest to biggest, one per ball in MERGE_BALLS. */
const RADII = [16, 24, 33, 44, 58] as const;

interface Tier extends MergeBall {
  r: number;
}

const TIERS: readonly Tier[] = MERGE_BALLS.map((b, i) => ({ ...b, r: RADII[i] ?? 20 }));
/** TIERS[i], for an index known to be in range. */
const tierOf = (i: number): Tier => TIERS[i] ?? (TIERS[0] as Tier);
const MAX_TIER = TIERS.length - 1;
/** Only the three smallest are ever dropped. */
const DROPPABLE = 3;

const W = 300;
const H = 400;
const DROP_Y = 34;
const LINE_Y = 66;
const GRAVITY = 900;
const STEP = 1 / 120;
const ITERATIONS = 4;
const DROP_COOLDOWN_S = 0.45;
/** How long the pile may poke above the line before it's game over. */
const OVER_AFTER_S = 2;
const AIM_STEP = 18;
/** Reaching this score wins the game (they can keep playing after). */
const WIN_SCORE = 200;

/** Points for making a tier: 1, 3, 6, 10, … */
const pointsFor = (tier: number) => ((tier + 1) * (tier + 2)) / 2;

interface Ball {
  id: number;
  tier: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seconds since it appeared (for the pop-in and the line check). */
  age: number;
  dead: boolean;
}

interface World {
  balls: Ball[];
  nextId: number;
  aimX: number;
  current: number;
  next: number;
  cooldown: number;
  overFor: number;
  score: number;
  biggest: number;
  /** Set once the win screen has been shown, so it only appears once per game. */
  won: boolean;
}

type Status = 'ready' | 'playing' | 'won' | 'over';

const randomTier = () => Math.floor(Math.random() * DROPPABLE);
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const clampAim = (x: number, tier: number) => clamp(x, tierOf(tier).r, W - tierOf(tier).r);

const freshWorld = (): World => ({
  balls: [],
  nextId: 1,
  aimX: W / 2,
  current: Math.floor(Math.random() * 2),
  next: randomTier(),
  cooldown: 0,
  overFor: 0,
  score: 0,
  biggest: 0,
  won: false,
});

function simulate(w: World, dt: number) {
  const balls = w.balls;
  for (const b of balls) {
    b.age += dt;
    b.vy += GRAVITY * dt;
    b.vx *= 0.995;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  for (let it = 0; it < ITERATIONS; it++) {
    for (let i = 0; i < balls.length; i++) {
      const a = balls[i]!;
      if (a.dead) continue;
      for (let j = i + 1; j < balls.length; j++) {
        const b = balls[j]!;
        if (b.dead) continue;
        const ra = tierOf(a.tier).r;
        const rb = tierOf(b.tier).r;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist2 = dx * dx + dy * dy;
        const min = ra + rb;
        if (dist2 >= min * min) continue;

        if (a.tier === b.tier) {
          merge(w, a, b);
          continue;
        }

        const dist = Math.sqrt(dist2) || 0.001;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = min - dist;
        const ma = ra * ra;
        const mb = rb * rb;
        const total = ma + mb;
        a.x -= nx * overlap * (mb / total);
        a.y -= ny * overlap * (mb / total);
        b.x += nx * overlap * (ma / total);
        b.y += ny * overlap * (ma / total);

        // Inelastic bounce along the contact normal.
        const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rel < 0) {
          const impulse = (-(1 + 0.15) * rel) / (1 / ma + 1 / mb);
          a.vx -= (impulse / ma) * nx;
          a.vy -= (impulse / ma) * ny;
          b.vx += (impulse / mb) * nx;
          b.vy += (impulse / mb) * ny;
        }
      }
    }

    for (const b of balls) {
      const r = tierOf(b.tier).r;
      if (b.x < r) {
        b.x = r;
        b.vx = Math.abs(b.vx) * 0.3;
      } else if (b.x > W - r) {
        b.x = W - r;
        b.vx = -Math.abs(b.vx) * 0.3;
      }
      if (b.y > H - r) {
        b.y = H - r;
        b.vy = -Math.abs(b.vy) * 0.15;
        b.vx *= 0.97;
      }
    }
  }

  w.balls = balls.filter((b) => !b.dead);
}

function merge(w: World, a: Ball, b: Ball) {
  a.dead = true;
  b.dead = true;
  if (a.tier === MAX_TIER) {
    // Two of the biggest: they burst for a bonus and make room.
    w.score += pointsFor(MAX_TIER) * 2;
    return;
  }
  const tier = a.tier + 1;
  w.score += pointsFor(tier);
  w.biggest = Math.max(w.biggest, tier);
  w.balls.push({
    id: w.nextId++,
    tier,
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    vx: (a.vx + b.vx) / 2,
    vy: Math.min(0, (a.vy + b.vy) / 2),
    age: 0,
    dead: false,
  });
}

/** Loaded pictures, by tier. Missing or broken ones fall back to the emoji. */
const images: (HTMLImageElement | null)[] = TIERS.map((t) => {
  if (!t.photo || typeof Image === 'undefined') return null;
  const img = new Image();
  img.src = asset(t.photo);
  return img;
});

function drawBall(ctx: CanvasRenderingContext2D, tier: number, x: number, y: number, scale = 1) {
  const t = tierOf(tier);
  const r = t.r * scale;
  const img = images[tier];
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = t.color;
  ctx.fill();

  if (img && img.complete && img.naturalWidth > 0) {
    // Cover-fit the picture into the circle, inside a thin coloured ring.
    const inner = r - Math.max(1.5, r * 0.07);
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, inner, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, x - inner, y - inner, inner * 2, inner * 2);
    ctx.restore();
    return;
  }

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(42, 22, 48, 0.18)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  // Soft highlight so they read as round.
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fill();
  ctx.font = `${Math.round(r * 1.15)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  ctx.fillText(t.emoji, x, y + r * 0.06);
}

function draw(ctx: CanvasRenderingContext2D, w: World, status: Status, dark: boolean) {
  ctx.clearRect(0, 0, W, H);

  // Danger line: faint normally, strong and red while the pile is over it.
  const danger = w.overFor > 0;
  ctx.save();
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = danger ? 2 : 1.5;
  ctx.strokeStyle = danger ? '#c2556f' : dark ? 'rgba(255,255,255,0.25)' : 'rgba(42,22,48,0.2)';
  ctx.beginPath();
  ctx.moveTo(0, LINE_Y);
  ctx.lineTo(W, LINE_Y);
  ctx.stroke();
  ctx.restore();

  if (status === 'playing') {
    const ready = w.cooldown <= 0;
    // Aim guide.
    ctx.save();
    ctx.setLineDash([2, 6]);
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(42,22,48,0.22)';
    ctx.beginPath();
    ctx.moveTo(w.aimX, DROP_Y);
    ctx.lineTo(w.aimX, H);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = ready ? 1 : 0.45;
    drawBall(ctx, w.current, w.aimX, DROP_Y);
    ctx.globalAlpha = 1;
  }

  for (const b of w.balls) {
    const pop = b.age < 0.15 ? 0.6 + (b.age / 0.15) * 0.4 : 1;
    drawBall(ctx, b.tier, b.x, b.y, pop);
  }
}

export function SweetMerge() {
  const [status, setStatus] = useState<Status>('ready');
  const [score, setScore] = useState(0);
  const [next, setNext] = useState(0);
  const [biggest, setBiggest] = useState(0);
  const [best, setBest] = usePersistentState<number | null>(BEST_KEYS.merge, null, isNumberOrNull);
  const [prizeWon, setPrizeWon] = usePersistentState<boolean>(MERGE_PRIZE_KEY, false, isBoolean);
  /** null = not showing; 'fresh' = just collected (confetti); 'saved' = reopened from the start screen. */
  const [showPrize, setShowPrize] = useState<null | 'fresh' | 'saved'>(null);
  const prizeHeadingRef = useRef<HTMLHeadingElement>(null);
  const world = useRef<World>(freshWorld());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [wrapRef, wrapSize] = useElementSize<HTMLDivElement>();

  // Fit a 3:4 jar into the space available.
  const cssW = Math.max(0, Math.floor(Math.min(wrapSize.width, 340, wrapSize.height * 0.75)));
  const cssH = Math.round((cssW * H) / W);

  const sync = useCallback(() => {
    const w = world.current;
    setScore(w.score);
    setNext(w.next);
    setBiggest(w.biggest);
  }, []);

  // Size the backing store for sharp drawing on high-DPI screens, and redraw once.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cssW === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform((cssW * dpr) / W, 0, 0, (cssH * dpr) / H, 0, 0);
    draw(ctx, world.current, status, document.documentElement.dataset.mode === 'dark');
  }, [cssW, cssH, status]);

  // Game loop with a fixed physics step.
  useEffect(() => {
    if (status !== 'playing') return;
    let raf = 0;
    let last: number | null = null;
    let acc = 0;
    let lastScore = -1;

    const frame = (t: number) => {
      const w = world.current;
      const dt = last === null ? 0 : Math.min(0.05, (t - last) / 1000);
      last = t;
      acc += dt;
      while (acc >= STEP) {
        simulate(w, STEP);
        acc -= STEP;
      }
      w.cooldown = Math.max(0, w.cooldown - dt);

      // Settled pieces above the line count down to game over.
      const above = w.balls.some((b) => b.age > 1 && b.y - tierOf(b.tier).r < LINE_Y && Math.abs(b.vy) < 60);
      w.overFor = above ? w.overFor + dt : 0;

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) draw(ctx, w, 'playing', document.documentElement.dataset.mode === 'dark');

      if (w.score !== lastScore) {
        lastScore = w.score;
        sync();
      }
      if (w.overFor >= OVER_AFTER_S) {
        sync();
        setStatus('over');
        return;
      }
      if (!w.won && w.score >= WIN_SCORE) {
        w.won = true;
        sync();
        setStatus('won');
        return;
      }
      raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(raf);
  }, [status, sync]);

  useEffect(() => {
    if (status === 'over' || status === 'won') setBest((prev) => (prev === null || score > prev ? score : prev));
    if (status === 'won') setPrizeWon(true);
  }, [status, score, setBest, setPrizeWon]);

  useEffect(() => {
    if (showPrize) prizeHeadingRef.current?.focus();
  }, [showPrize]);

  const start = () => {
    world.current = freshWorld();
    sync();
    setStatus('playing');
    areaRef.current?.focus();
  };

  /** Back into the same jar after the win screen. */
  const keepPlaying = () => {
    const w = world.current;
    w.overFor = 0;
    w.cooldown = DROP_COOLDOWN_S;
    setStatus('playing');
    areaRef.current?.focus();
  };

  const drop = () => {
    const w = world.current;
    if (status !== 'playing' || w.cooldown > 0) return;
    w.balls.push({
      id: w.nextId++,
      tier: w.current,
      x: clampAim(w.aimX, w.current),
      y: DROP_Y,
      vx: 0,
      vy: 0,
      age: 0,
      dead: false,
    });
    w.current = w.next;
    w.next = randomTier();
    w.aimX = clampAim(w.aimX, w.current);
    w.cooldown = DROP_COOLDOWN_S;
    setNext(w.next);
  };

  const aimAt = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = world.current;
    w.aimX = clampAim(((e.clientX - rect.left) / rect.width) * W, w.current);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const w = world.current;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      w.aimX = clampAim(w.aimX + (e.key === 'ArrowLeft' ? -AIM_STEP : AIM_STEP), w.current);
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (status === 'playing') drop();
      else if (status === 'won') keepPlaying();
      else start();
    }
  };

  const isNewBest = status === 'over' && best === score && score > 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-3">
      {showPrize && (
        // Covers the game rather than replacing it, so the jar (and a won game they may keep playing) stays put underneath.
        <div className="absolute inset-0 z-10 flex flex-col items-center gap-4 overflow-y-auto bg-surface py-4 text-center">
          {showPrize === 'fresh' && <Particles variant="confetti" count={36} />}
          <h3 ref={prizeHeadingRef} tabIndex={-1} className="px-4 text-lg font-semibold text-ink outline-none">
            {showPrize === 'fresh' ? MERGE_PRIZE.reveal : 'Your coupon'}
          </h3>
          <QuizCoupon fresh={showPrize === 'fresh'} coupon={MERGE_PRIZE.coupon} />
          <p className="max-w-xs text-xs text-ink-muted">Screenshot it and show it to me when you want to cash it in.</p>
          <button
            type="button"
            onClick={() => {
              setShowPrize(null);
              areaRef.current?.focus();
            }}
            className="min-h-11 rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            Back to the jar
          </button>
        </div>
      )}

      <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-full bg-surface-2 px-5 py-2 text-sm text-ink-muted ring-1 ring-line">
        <span>
          Score: <strong className="tabular-nums text-ink">{score}</strong>
          {!world.current.won && <span className="tabular-nums"> / {WIN_SCORE}</span>}
        </span>
        <span className="flex items-center gap-1">
          Next:{' '}
          <BallIcon tier={next} className="h-5 w-5 text-xs" />
        </span>
        <span>
          Best: <strong className="tabular-nums text-ink">{best ?? '–'}</strong>
        </span>
      </div>

      <div ref={wrapRef} className="relative min-h-[280px] flex-1">
        <div
          ref={areaRef}
          tabIndex={0}
          role="application"
          aria-label="Jar Full Of You game area. Arrow keys move, Enter or Space drops."
          onKeyDown={onKeyDown}
          onPointerMove={aimAt}
          onPointerDown={aimAt}
          onPointerUp={(e) => {
            aimAt(e);
            drop();
          }}
          style={{ width: cssW, height: cssH }}
          className="merge-area absolute left-1/2 top-0 -translate-x-1/2 touch-none select-none overflow-hidden rounded-2xl ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <canvas ref={canvasRef} aria-hidden="true" style={{ width: cssW, height: cssH }} className="block" />

          {status !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/85 p-6 text-center backdrop-blur-sm">
              {status === 'ready' ? (
                <>
                  <p className="text-lg font-semibold text-ink">Fill the jar with you</p>
                  <p className="text-sm text-ink">Two of the same merge into the next size up. Reach {WIN_SCORE} points to win!</p>
                  <p className="flex items-center justify-center gap-1" aria-label="From smallest to biggest">
                    {TIERS.map((_, i) => (
                      <BallIcon key={i} tier={i} className={`${ICON_SIZES[i] ?? ""} text-sm`} />
                    ))}
                  </p>
                  <p className="text-xs text-ink-muted">Tap or click to drop · ← → and Space work too · don't stack past the line</p>
                </>
              ) : status === 'won' ? (
                <div role="status" className="flex flex-col gap-1">
                  <p className="text-2xl">🎉💖🎉</p>
                  <p className="text-lg font-semibold text-ink">You win! {score} points</p>
                  <p className="text-sm text-ink-muted">The jar is full of love. Keep going for a new best?</p>
                </div>
              ) : (
                <div role="status" className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-ink">The jar's full! {score} points</p>
                  <p className="text-sm text-ink-muted">
                    <span className="inline-flex items-center gap-1.5">
                      Biggest: <BallIcon tier={biggest} className="h-6 w-6 text-xs" /> {tierOf(biggest).name}
                    </span>
                  </p>
                  {isNewBest && <p className="text-sm text-accent-text">New best ✨</p>}
                </div>
              )}
              {status === 'won' ? (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={() => setShowPrize('fresh')}
                    className="tree-present min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow hover:brightness-110"
                  >
                    <span aria-hidden="true">🎁 </span>Collect your prize
                  </button>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={keepPlaying}
                    className="min-h-11 rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
                  >
                    Keep playing
                  </button>
                  <button
                    type="button"
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={start}
                    className="min-h-11 rounded-full bg-surface-2 px-6 text-sm font-semibold text-ink ring-1 ring-line hover:brightness-95"
                  >
                    New game
                  </button>
                </div>
                </div>
              ) : (
                <button
                  type="button"
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={start}
                  className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow hover:brightness-110"
                >
                  {status === 'ready' ? 'Start' : 'Play again'}
                </button>
              )}
              {status !== 'won' && prizeWon && (
                <button
                  type="button"
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={() => setShowPrize('saved')}
                  className="min-h-11 rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
                >
                  <span aria-hidden="true">🎟️ </span>View my prize
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ICON_SIZES = ['h-5 w-5', 'h-6 w-6', 'h-7 w-7', 'h-8 w-8', 'h-10 w-10'] as const;

/** Small round preview of a ball: its picture, or the emoji until there is one. */
function BallIcon({ tier, className = '' }: { tier: number; className?: string }) {
  const t = tierOf(tier);
  const [broken, setBroken] = useState(false);
  return (
    <span
      role="img"
      aria-label={t.name}
      title={t.name}
      style={{ backgroundColor: t.color }}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full leading-none ${className}`}
    >
      {t.photo && !broken ? (
        <img src={asset(t.photo)} alt="" onError={() => setBroken(true)} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{t.emoji}</span>
      )}
    </span>
  );
}
