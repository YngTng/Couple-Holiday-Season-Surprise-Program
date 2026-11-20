import { APP_NAME } from './person';

/**
 * Fixed system copy from the Phase 1 prompt. Keep wording exactly as written.
 */

export type BootLineKind = 'log' | 'success' | 'welcome';

export interface BootLine {
  text: string;
  kind: BootLineKind;
}

export const BOOT_LINES: readonly BootLine[] = [
  { text: `Initializing ${APP_NAME}...`, kind: 'log' },
  { text: 'Loading memories...', kind: 'log' },
  { text: 'Checking happiness levels...', kind: 'log' },
  { text: 'Searching for my favourite person...', kind: 'log' },
  { text: 'Person found ♡', kind: 'success' },
  { text: `Welcome to ${APP_NAME}`, kind: 'welcome' },
  { text: 'A little world made just for you.', kind: 'welcome' },
];

export interface FakeSetting {
  label: string;
  value: string;
}

export const FAKE_SETTINGS: readonly FakeSetting[] = [
  { label: 'Hug Intensity', value: 'MAXIMUM' },
  { label: 'Love Level', value: '∞' },
  { label: 'Missing You', value: 'ENABLED' },
  { label: 'Favourite Person', value: 'YOU' },
];

export const COUNTDOWN_COMPLETE_LINES = {
  stopped: 'LongDistance.exe has stopped running',
  installing: 'Installing TogetherMode.exe...',
} as const;
