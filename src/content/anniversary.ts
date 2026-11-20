/**
 * Anniversary.exe text (unlocks on the anniversary date in src/apps/registry.ts).
 * The photos themselves are the Memories list in src/content/memories.ts, in the same order.
 */
export interface AnniversaryContent {
  /** Line at the top of the photo grid. */
  intro: string;
  /** Label on the bouquet button under the photos. */
  bouquetLabel: string;
  /** Picture used as the bouquet button, under /public. Transparent PNG works best. */
  bouquetPhoto: string;
  /** Shown when they tap the bouquet. */
  message: string;
  /** Picture above the message, under /public. */
  messagePhoto: string;
  /** Describe that picture for screen readers. */
  messagePhotoAlt: string;
}

export const ANNIVERSARY: AnniversaryContent = {
  intro: 'Your intro line here',
  bouquetLabel: 'Your bouquet button label',
  bouquetPhoto: '/photos/bouquet.svg',
  message: 'Your anniversary message here.',
  messagePhoto: '/photos/anniversary-message.svg',
  messagePhotoAlt: 'Describe your anniversary picture here',
};
