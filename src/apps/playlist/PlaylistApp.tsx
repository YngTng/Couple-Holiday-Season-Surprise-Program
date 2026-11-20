import { useMusic } from '../../audio/MusicProvider';
import { PLAYLIST } from '../../content/playlist';
import { SongCard } from './SongCard';

/** The playlist: songs play from MP3s in the "Now playing" player above the taskbar. */
export function PlaylistApp() {
  const music = useMusic();
  const playable = music.playable.length;

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="text-center">
        <span aria-hidden="true" className="text-4xl">
          🎵
        </span>
        <p className="mt-1 text-xs font-medium text-ink-muted">
          {PLAYLIST.length} {PLAYLIST.length === 1 ? 'song' : 'songs'}
          {playable < PLAYLIST.length && ` · ${playable} playable`}
        </p>
      </header>

      {music.error && (
        <p role="alert" className="rounded-xl bg-surface-2 px-3 py-2 text-center text-sm font-medium text-accent-text">
          {music.error}
        </p>
      )}

      <ol aria-label="Our playlist" className="flex flex-col gap-2">
        {PLAYLIST.map((song, i) => (
          <SongCard key={song.id} song={song} index={i} />
        ))}
      </ol>

      <p className="text-center text-xs leading-relaxed text-ink-muted">
        Songs keep playing while you use other apps. Use the player above the taskbar to skip or pause.
      </p>
    </div>
  );
}
