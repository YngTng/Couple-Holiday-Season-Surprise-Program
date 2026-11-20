import { HER_NAME, MY_NAME } from './person';

/** The letter text in one language. */
export interface LetterTranslation {
  /** Button label for this language on the letter page, e.g. "Français". */
  label: string;
  letter: string;
  signOff: string;
  postscript: string;
}

/** Birthday.exe content (unlocks on the birthday date in src/apps/registry.ts). */
export interface BirthdayContent {
  /** Headline on the first screen. */
  greeting: string;
  /** Candles on the cake, 1 to 30. More than fit side by side are placed in rows, back to front. */
  candleCount: number;
  /** Written on the gift tag. */
  giftTag: string;
  /** Button label for the main letter's language, e.g. "English". */
  languageLabel: string;
  /** The birthday letter. Separate paragraphs with a blank line (\n\n). */
  letter: string;
  /** e.g. "All my love," */
  signOff: string;
  signature: string;
  /** Shown below the signature. Leave empty ('') for none. */
  postscript: string;
  /** A second-language version of the letter. The letter page has a toggle between the two. */
  translation: LetterTranslation;
}

export const BIRTHDAY: BirthdayContent = {
  greeting: `Happy Birthday, ${HER_NAME}!`,
  candleCount: 21,
  giftTag: 'Your gift tag text',
  languageLabel: 'English',
  letter: [
    'Your birthday letter, first paragraph.',
    'Second paragraph. Separate paragraphs with a blank line.',
    'Last paragraph.',
  ].join('\n\n'),
  signOff: 'All my love,',
  signature: MY_NAME,
  postscript: 'PS. Your postscript here (or leave empty).',
  translation: {
    label: 'Other language',
    letter: ['Your letter in a second language, first paragraph.', 'Last paragraph.'].join('\n\n'),
    signOff: 'Your sign-off in the second language,',
    postscript: 'Your postscript in the second language (or leave empty).',
  },
};
