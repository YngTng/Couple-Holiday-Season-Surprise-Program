import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PLAYLIST, type Song } from '../content/playlist';
import { asset } from '../lib/asset';

export interface PlayableSong extends Song {
  audio: string;
}

interface Playback {
  isPlaying: boolean;
  /** ms */
  position: number;
  /** ms */
  duration: number;
}

interface MusicValue {
  /** Playlist songs that have an MP3, in order. */
  playable: readonly PlayableSong[];
  current: PlayableSong | null;
  playback: Playback;
  isLoading: boolean;
  error: string | null;
  playerVisible: boolean;
  /** Must be triggered by a click/tap/key. Nothing autoplays. */
  playSong: (id: string) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  /** Jump to a point in the current song, in ms. */
  seek: (ms: number) => void;
  closePlayer: () => void;
}

const MusicContext = createContext<MusicValue | null>(null);

const PLAYABLE: readonly PlayableSong[] = PLAYLIST.flatMap((song) => (song.audio ? [{ ...song, audio: song.audio }] : []));

/** One <audio> element for the whole app, so music keeps playing while they use other apps. */
export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIdRef = useRef<string | null>(null);
  const advanceRef = useRef<() => void>(() => undefined);

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playback, setPlayback] = useState<Playback>({ isPlaying: false, position: 0, duration: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerVisible, setPlayerVisible] = useState(false);

  /** Created on first play, so nothing loads until they ask for music. */
  const getAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    audio.preload = 'auto';
    const sync = () =>
      setPlayback({
        isPlaying: !audio.paused && !audio.ended,
        position: audio.currentTime * 1000,
        duration: Number.isFinite(audio.duration) ? audio.duration * 1000 : 0,
      });
    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('durationchange', sync);
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('playing', () => {
      setIsLoading(false);
      sync();
    });
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('ended', () => {
      sync();
      advanceRef.current();
    });
    audio.addEventListener('error', () => {
      setIsLoading(false);
      setError("This song couldn't be played. Its MP3 may be missing from public/music/.");
      sync();
    });
    audioRef.current = audio;
    return audio;
  }, []);

  useEffect(() => () => audioRef.current?.pause(), []);

  const playSong = useCallback(
    (id: string) => {
      const song = PLAYABLE.find((s) => s.id === id);
      if (!song) return;
      const audio = getAudio();
      currentIdRef.current = id;
      setCurrentId(id);
      setPlayerVisible(true);
      setIsLoading(true);
      setError(null);
      setPlayback({ isPlaying: false, position: 0, duration: 0 });
      audio.src = asset(song.audio);
      audio.play().catch((e: unknown) => {
        // A newer play() call interrupting this one is normal when skipping quickly.
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setIsLoading(false);
      });
    },
    [getAudio],
  );

  const step = useCallback(
    (delta: number) => {
      if (PLAYABLE.length === 0) return;
      const index = PLAYABLE.findIndex((s) => s.id === currentIdRef.current);
      const nextIndex = index === -1 ? 0 : (index + delta + PLAYABLE.length) % PLAYABLE.length;
      const song = PLAYABLE[nextIndex];
      if (song) playSong(song.id);
    },
    [playSong],
  );

  advanceRef.current = () => step(1);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio && currentIdRef.current) {
      setPlayerVisible(true);
      if (audio.paused) void audio.play().catch(() => undefined);
      else audio.pause();
      return;
    }
    const first = PLAYABLE[0];
    if (first) playSong(first.id);
    else {
      setPlayerVisible(true);
      setError('No songs have an MP3 yet. Add them in src/content/playlist.ts.');
    }
  }, [playSong]);

  const seek = useCallback((ms: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(0, ms / 1000), audio.duration);
  }, []);

  const closePlayer = useCallback(() => {
    audioRef.current?.pause();
    setPlayerVisible(false);
  }, []);

  const value = useMemo<MusicValue>(
    () => ({
      playable: PLAYABLE,
      current: PLAYABLE.find((s) => s.id === currentId) ?? null,
      playback,
      isLoading,
      error,
      playerVisible,
      playSong,
      togglePlay,
      next: () => step(1),
      previous: () => step(-1),
      seek,
      closePlayer,
    }),
    [currentId, playback, isLoading, error, playerVisible, playSong, togglePlay, step, seek, closePlayer],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic(): MusicValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>');
  return ctx;
}
