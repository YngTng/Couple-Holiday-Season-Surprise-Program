/**
 * Messages that rotate inside the Countdown app (one every 8 seconds, in this order).
 * Each can have an optional image or GIF from /public, e.g. "/images/our-gif.gif".
 * Add or remove as many as you like.
 */
export interface CountdownMessage {
  text: string;
  image?: string;
  /** Describe the image for screen readers. */
  imageAlt?: string;
}

export const COUNTDOWN_MESSAGES: readonly CountdownMessage[] = [
  {
    text: 'Your first countdown message',
    image: '/images/countdown-1.svg',
    imageAlt: 'Describe your first countdown image here',
  },
  {
    text: 'Your second countdown message',
    image: '/images/countdown-2.svg',
    imageAlt: 'Describe your second countdown image here',
  },
  {
    text: 'Your third countdown message (no image)',
  },
];

export const COUNTDOWN_ROTATE_MS = 8000;
