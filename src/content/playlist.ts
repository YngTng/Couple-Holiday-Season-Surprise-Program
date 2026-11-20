/**
 * Songs for Our Playlist. They play from MP3 files in public/music/, right in the site:
 * no Spotify, no login, no ads, and they work offline.
 * The taskbar ♪ button plays this list from the top; each song plays through, then the next one starts.
 *
 * To add a song: put the MP3 in public/music/ (a simple file name like "my-song.mp3" is safest)
 * and add an entry below with `audio: '/music/my-song.mp3'`.
 */
export interface Song {
  /** Unique and stable. */
  id: string;
  title: string;
  artist: string;
  /**
   * Optional: why this song matters to you both. Songs with a note get a "Why this song" button.
   * e.g. meaning: 'The song from our first road trip',
   */
  meaning?: string;
  /** The MP3, e.g. "/music/my-song.mp3". Without one, the song is listed but can't play. */
  audio?: string;
}

/** These have no MP3 yet, so they're listed but can't play. Add `audio: '/music/your-file.mp3'` once the file is in public/music/. */
export const PLAYLIST: readonly Song[] = [
  { id: 'song-1', title: 'Song Title 1', artist: 'Artist Name', meaning: 'Why this song matters to you both' },
  { id: 'song-2', title: 'Song Title 2', artist: 'Artist Name' },
];
