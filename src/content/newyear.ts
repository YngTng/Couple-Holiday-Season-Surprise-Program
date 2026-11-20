import { MY_NAME } from './person';

/** NYE.exe content: the New Year's Eve invitation (always unlocked). */
export interface NyeStop {
  id: string;
  icon: string;
  /** Wall-clock time on Dec 31, e.g. "6:15 pm". Free text. */
  time: string;
  title: string;
  /** Venue name. */
  place: string;
  /** Street address, shown under the venue. Leave '' to hide. */
  address: string;
  note: string;
}

export interface NyeContent {
  /** Small line above the title. */
  kicker: string;
  title: string;
  /** Free text date under the title. */
  date: string;
  intro: string;
  dressCode: string;
  /** Button text before they accept. */
  rsvpLabel: string;
  /** Button text once they have accepted. */
  rsvpDone: string;
  /** Shown from midnight on Jan 1. */
  happyNewYear: string;
  signature: string;
}

export const NYE: NyeContent = {
  kicker: "You're invited",
  title: "New Year's Eve, with me",
  date: 'Thursday 31 December 2026',
  intro: 'Your invitation intro here.',
  dressCode: 'Dress code: your dress code here',
  rsvpLabel: "I'll be there",
  rsvpDone: "It's a date.",
  happyNewYear: 'Your Happy New Year message here.',
  signature: MY_NAME,
};

/** Shown top to bottom, in this order. */
export const NYE_STOPS: readonly NyeStop[] = [
  {
    id: 'dinner',
    icon: '🍽️',
    time: '7:00 pm',
    title: 'Dinner',
    place: 'Restaurant Name',
    address: '123 Example Street, City',
    note: 'Your note about dinner.',
  },
  {
    id: 'dessert',
    icon: '🍰',
    time: 'after dinner',
    title: 'Dessert',
    place: 'Dessert Place Name',
    address: '',
    note: 'Your note about dessert.',
  },
  {
    id: 'midnight',
    icon: '🎆',
    time: '12:00 am',
    title: 'Midnight',
    place: 'Where you will watch the fireworks',
    address: '',
    note: 'Your note about midnight.',
  },
];
