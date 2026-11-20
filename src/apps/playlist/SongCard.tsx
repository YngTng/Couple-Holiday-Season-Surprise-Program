import { useId, useState } from 'react';
import { useMusic } from '../../audio/MusicProvider';
import type { Song } from '../../content/playlist';

const formatTime = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function SongCard({ song, index }: { song: Song; index: number }) {
  const music = useMusic();
  const [expanded, setExpanded] = useState(false);
  const meaningId = useId();
  const playable = music.playable.some((s) => s.id === song.id);
  const isCurrent = music.current?.id === song.id;
  const isPlaying = isCurrent && music.playback.isPlaying;
  const loading = isCurrent && music.isLoading;
  const { position, duration } = music.playback;
  const progress = isCurrent && duration > 0 ? Math.min(1, position / duration) : 0;

  return (
    <li
      className={`rounded-2xl border bg-surface p-3 shadow-sm transition-colors ${isCurrent ? 'border-accent-soft ring-1 ring-accent-soft' : 'border-line'}`}
    >
      <div className="flex items-center gap-3">
        {playable ? (
          <button
            type="button"
            onClick={() => (isCurrent ? music.togglePlay() : music.playSong(song.id))}
            aria-label={`${isPlaying ? 'Pause' : 'Play'} ${song.title}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent shadow hover:brightness-110"
          >
            <span aria-hidden="true">{loading ? '…' : isPlaying ? '❚❚' : '▶'}</span>
          </button>
        ) : (
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-ink-muted"
          >
            {index + 1}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-semibold leading-snug text-ink">
            <span className="line-clamp-2 break-words">{song.title}</span>
            {isPlaying && (
              <span aria-hidden="true" className="eq">
                <span />
                <span />
                <span />
              </span>
            )}
          </p>
          <p className="line-clamp-2 break-words text-sm text-ink-muted">
            {song.artist}
            {!playable && <span className="text-xs"> · no MP3 yet</span>}
          </p>
        </div>

        {song.meaning && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={meaningId}
            className="flex min-h-11 shrink-0 items-center gap-1 rounded-xl px-2 text-xs font-semibold text-accent-text hover:bg-surface-2"
          >
            Why this song
            <span aria-hidden="true" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
              ⌄
            </span>
          </button>
        )}
      </div>

      {isCurrent && duration > 0 && (
        <div className="mt-3 flex items-center gap-2 text-[11px] tabular-nums text-ink-muted">
          <span>{formatTime(position)}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            <div className="h-full origin-left rounded-full bg-accent" style={{ transform: `scaleX(${progress})` }} />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      )}

      {song.meaning && (
        <div id={meaningId} hidden={!expanded} className="mt-3 rounded-xl bg-surface-2 p-3 text-sm leading-relaxed text-ink">
          {song.meaning}
        </div>
      )}
    </li>
  );
}
