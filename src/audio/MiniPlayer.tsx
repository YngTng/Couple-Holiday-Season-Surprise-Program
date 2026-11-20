import { useMusic } from './MusicProvider';

const formatTime = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * Small "Now playing" card above the taskbar. The audio itself lives in MusicProvider, so music
 * keeps playing while windows open and close. Hidden until music is first played.
 */
export function MiniPlayer() {
  const music = useMusic();
  const canStep = music.playable.length > 1;
  const { isPlaying, position, duration } = music.playback;
  const iconButton = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm hover:bg-surface-2';

  return (
    <section
      aria-label="Music player"
      aria-hidden={!music.playerVisible}
      className={`fixed right-3 z-40 w-[min(340px,calc(100vw-24px))] rounded-2xl border border-line bg-surface p-2 text-ink shadow-xl transition duration-200 bottom-[calc(64px+env(safe-area-inset-bottom))] ${
        music.playerVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none invisible translate-y-2 opacity-0'
      }`}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={music.togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent shadow hover:brightness-110"
        >
          <span aria-hidden="true">{music.isLoading ? '…' : isPlaying ? '❚❚' : '▶'}</span>
        </button>
        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-xs font-semibold">{music.current ? music.current.title : 'Music'}</p>
          <p className="truncate text-[11px] text-ink-muted">{music.current?.artist ?? ''}</p>
        </div>
        {canStep && (
          <>
            <button type="button" onClick={music.previous} aria-label="Previous song" className={iconButton}>
              <span aria-hidden="true">⏮</span>
            </button>
            <button type="button" onClick={music.next} aria-label="Next song" className={iconButton}>
              <span aria-hidden="true">⏭</span>
            </button>
          </>
        )}
        <button
          type="button"
          onClick={music.closePlayer}
          aria-label="Stop music and close player"
          className={`${iconButton} text-ink-muted`}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="flex items-center gap-2 px-1 pt-1 text-[11px] tabular-nums text-ink-muted">
        <span className="w-8 text-right">{formatTime(position)}</span>
        <input
          type="range"
          min={0}
          max={Math.max(1, duration)}
          step={1000}
          value={Math.min(position, duration)}
          disabled={duration === 0}
          onChange={(e) => music.seek(Number(e.target.value))}
          aria-label="Song position"
          aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
          className="h-1.5 flex-1 cursor-pointer accent-[var(--accent)] disabled:cursor-default"
        />
        <span className="w-8">{formatTime(duration)}</span>
      </div>

      {music.error && (
        <p role="alert" className="px-2 pt-1 text-xs font-medium text-accent-text">
          {music.error}
        </p>
      )}
    </section>
  );
}
