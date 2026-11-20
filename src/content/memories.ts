/** Photos and captions for Anniversary.exe's photo grid. Shown in this order. */
export interface Memory {
  /** Unique and stable. */
  id: string;
  /** Free text, e.g. "March 2025". Leave empty ('') to show no date. */
  date: string;
  caption: string;
  /** Path under /public, e.g. "/photos/first-date.jpg". JPG, PNG, WebP or SVG. */
  photo: string;
  /** Describe the photo for screen readers. */
  alt: string;
}

const memory = (n: number, caption: string, alt: string, ext = 'svg'): Memory => ({
  id: `memory-${n}`,
  date: '',
  caption,
  photo: `/photos/${n}.${ext}`,
  alt,
});

/** Add as many as you like: put photo N at public/photos/N.jpg and pass 'jpg' as the last argument. */
export const MEMORIES: readonly Memory[] = [
  memory(1, 'Caption for memory 1', 'Describe photo 1'),
  memory(2, 'Caption for memory 2', 'Describe photo 2'),
  memory(3, 'Caption for memory 3', 'Describe photo 3'),
  memory(4, 'Caption for memory 4', 'Describe photo 4'),
  memory(5, 'Caption for memory 5', 'Describe photo 5'),
  memory(6, 'Caption for memory 6', 'Describe photo 6'),
];
