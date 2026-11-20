import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { GAME_UNLOCKS, QUIZ } from '../../content/games';
import { useAppDate } from '../../date/DateProvider';
import { formatDateKeyShort } from '../../lib/zoned';
import { isDateOpen } from '../lock';
import { readJson } from '../../lib/storage';
import { BEST_KEYS, formatSeconds } from './bestScores';
import { LoveQuiz } from './LoveQuiz';
import { RebuildUs } from './RebuildUs';
import { SweetMerge } from './SweetMerge';

type GameId = keyof typeof BEST_KEYS;

interface GameInfo {
  id: GameId;
  icon: string;
  title: string;
  description: string;
  bestLabel: (best: number) => string;
}

/** In unlock order (see GAME_UNLOCKS). */
const GAMES: readonly GameInfo[] = [
  {
    id: 'merge',
    icon: '🫙',
    title: 'Jar Full Of You',
    description: 'Fill the jar with you. Two of the same merge into a bigger one.',
    bestLabel: (b) => `Best: ${b} points`,
  },
  {
    id: 'quiz',
    icon: '💭',
    title: QUIZ.title,
    description: 'A few multiple-choice questions.',
    bestLabel: (b) => `Best: ${b} / ${QUIZ.questions.length}`,
  },
  {
    id: 'puzzle',
    icon: '🧩',
    title: 'Rebuild Us',
    description: 'Piece one of our photos back together, against the clock.',
    bestLabel: (b) => `Best: ${formatSeconds(b)}`,
  },
];

function readBest(id: GameId): number | null {
  const value = readJson(BEST_KEYS[id]);
  return typeof value === 'number' ? value : null;
}

/** Game menu → one game at a time. Escape or "All games" returns to the menu. */
export function MiniGamesApp() {
  const { todayKey } = useAppDate();
  const isOpen = (id: GameId) => isDateOpen(GAME_UNLOCKS[id], todayKey);
  const [chosen, setActive] = useState<GameId | null>(null);
  // Drop back to the menu if the (simulated) date moves before the open game's unlock.
  const active = chosen && isOpen(chosen) ? chosen : null;
  const lastGame = useRef<GameId | null>(null);
  const cards = useRef(new Map<GameId, HTMLButtonElement>());
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (active) backRef.current?.focus();
    else if (lastGame.current) cards.current.get(lastGame.current)?.focus();
  }, [active]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && active) {
      e.preventDefault();
      setActive(null);
    }
  };

  if (active) {
    const game = GAMES.find((g) => g.id === active);
    return (
      <div onKeyDown={onKeyDown} className={`flex flex-col gap-3 p-4 ${active === 'quiz' ? 'min-h-full' : 'h-full'}`}>
        <div className="flex items-center justify-between gap-2">
          <button
            ref={backRef}
            type="button"
            onClick={() => setActive(null)}
            className="flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-accent-text hover:bg-surface-2"
          >
            <span aria-hidden="true">‹</span> All games
          </button>
          {/* Kept for screen readers only; visually the game speaks for itself. */}
          <h3 className="sr-only">{game?.title}</h3>
        </div>
        {active === 'puzzle' && <RebuildUs />}
        {active === 'merge' && <SweetMerge />}
        {active === 'quiz' && <LoveQuiz />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-center text-xs font-medium text-ink-muted">Pick a game</p>
      <ul className="flex flex-col gap-2">
        {GAMES.map((game) => {
          if (!isOpen(game.id)) {
            return (
              <li key={game.id}>
                <div
                  aria-disabled="true"
                  className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-line bg-surface p-4 text-left opacity-70"
                >
                  <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-3xl grayscale">
                    🔒
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">Locked game</span>
                    <span className="block text-sm text-ink-muted">Unlocks {formatDateKeyShort(GAME_UNLOCKS[game.id])}</span>
                  </span>
                </div>
              </li>
            );
          }
          const best = readBest(game.id);
          return (
            <li key={game.id}>
              <button
                ref={(el) => {
                  if (el) cards.current.set(game.id, el);
                  else cards.current.delete(game.id);
                }}
                type="button"
                onClick={() => {
                  lastGame.current = game.id;
                  setActive(game.id);
                }}
                className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left shadow-sm transition-colors hover:bg-surface-2"
              >
                <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-3xl">
                  {game.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{game.title}</span>
                  <span className="block text-sm text-ink-muted">{game.description}</span>
                  {best !== null && <span className="mt-1 block text-xs font-semibold text-accent-text">{game.bestLabel(best)}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
