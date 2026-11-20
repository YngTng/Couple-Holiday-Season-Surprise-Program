/** Christmas.exe content (unlocks Dec 25). */
export interface ChristmasContent {
  /** Line above the tree. */
  greeting: string;
  /** Written on the present's gift tag. */
  giftTag: string;
  /**
   * Photo of the real present, shown once they unwrap it. Path under /public, e.g. "/photos/xmas.jpg".
   * Leave empty ('') to show a 🎁 instead. Use a file name that doesn't give the gift away.
   */
  giftPhoto: string;
  /** Describe the gift photo for screen readers. */
  giftAlt: string;
  /** Shown under the gift photo. */
  giftMessage: string;
}

export const CHRISTMAS: ChristmasContent = {
  greeting: 'Your Christmas greeting',
  giftTag: 'Your gift tag text',
  giftPhoto: '/photos/gift.svg',
  giftAlt: 'Describe your Christmas present here',
  giftMessage: 'Your message about the present here.',
};

export interface ChristmasOrnament {
  /** Unique and stable: used to remember which ornaments they have lit. */
  id: string;
}

/** Ornaments to light (tapping one just lights it). Up to 8 fit on the tree (the bottom row is Santa and two reindeer); extras are ignored. */
export const CHRISTMAS_ORNAMENTS: readonly ChristmasOrnament[] = [
  { id: 'ornament-1' },
  { id: 'ornament-2' },
  { id: 'ornament-3' },
  { id: 'ornament-4' },
  { id: 'ornament-5' },
  { id: 'ornament-6' },
];
