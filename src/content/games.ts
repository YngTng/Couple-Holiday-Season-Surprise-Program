import { THEIR_NAME, MY_NAME } from './person';

/** Content for the Mini Games app. */

export interface MergeBall {
  /** Read out to screen readers and shown on the game-over screen. */
  name: string;
  /**
   * Picture for this ball, e.g. "/images/merge/1.png" (put the file in public/images/merge/).
   * It's cropped to a centred circle. Leave it empty to show the emoji instead.
   */
  photo: string;
  /** Fallback while there's no photo. */
  emoji: string;
  /** Ring colour around the ball. */
  color: string;
}

/**
 * Jar Full Of You (merge game): five balls, smallest first. Two of the same merge into the next one.
 * Only the first three are ever dropped; the last two have to be made by merging.
 */
export const MERGE_BALLS: readonly [MergeBall, MergeBall, MergeBall, MergeBall, MergeBall] = [
  { name: 'Ball 1 name', photo: '/images/merge/1.svg', emoji: '🍓', color: '#f6c9d6' },
  { name: 'Ball 2 name', photo: '/images/merge/2.svg', emoji: '🧁', color: '#ffcfa8' },
  { name: 'Ball 3 name', photo: '/images/merge/3.svg', emoji: '🍩', color: '#c7b2ec' },
  { name: 'Ball 4 name', photo: '/images/merge/4.svg', emoji: '🍦', color: '#f2d27a' },
  { name: 'Ball 5 name', photo: '/images/merge/5.svg', emoji: '💖', color: '#9a4560' },
];

/**
 * Rebuild Us: a 4×4 jigsaw made from one photo.
 * Put the photo in public/photos/ and point `photo` at it, e.g. "/photos/puzzle.jpg".
 * Any shape works: it's cropped to a centred square, so keep faces away from the edges.
 */
export const PUZZLE = {
  photo: '/photos/puzzle.svg',
  /** Describe the photo for screen readers. */
  alt: 'Describe your puzzle photo here',
} as const;

export interface QuizQuestion {
  id: string;
  question: string;
  /** 2 to 4 options. */
  options: readonly string[];
  /** Index into options of the right answer (0 = first). */
  answerIndex: number;
  /** Optional line shown after they answer, e.g. the story behind it. */
  reveal?: string;
  /** Optional line shown only when they get it right. */
  correctReveal?: string;
}

export interface QuizContent {
  title: string;
  intro: string;
  questions: readonly QuizQuestion[];
  /** Shown on the final screen after a perfect score. */
  endMessage: string;
}

export const QUIZ: QuizContent = {
  title: 'How well do you know us?',
  intro: 'Your quiz intro here',
  questions: [
    {
      id: 'question-1',
      question: 'Your first question?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answerIndex: 0,
    },
    {
      id: 'question-2',
      question: 'Your second question?',
      options: ['Option A', 'Option B', 'Option C'],
      answerIndex: 1,
      reveal: 'Optional story behind the answer.',
    },
    {
      id: 'question-3',
      question: 'Who is more likely to ...?',
      options: [MY_NAME, THEIR_NAME],
      answerIndex: 1,
      correctReveal: 'Optional line shown when they get it right',
    },
  ],
  endMessage: 'Your perfect-score message here',
};

/** What goes on a prize coupon (see QuizCoupon.tsx). */
export interface CouponContent {
  /** Small line above the title. */
  kicker: string;
  title: string;
  subtitle: string;
  icon: string;
  to: string;
  from: string;
  terms: readonly string[];
  code: string;
  validity: string;
}

/**
 * The prize for a perfect quiz score. Once won it stays unlocked on their device,
 * so they can open it again from the quiz's start screen to "redeem" it.
 */
export const QUIZ_COUPON = {
  /** Small line above the title. */
  kicker: 'Official coupon · perfect score',
  title: 'Your Quiz Prize',
  subtitle: 'Your prize subtitle',
  icon: '🎁',
  /** Names on the coupon (from person.ts; replace with text to write them differently here). */
  to: THEIR_NAME,
  from: MY_NAME,
  /** The fine print. Keep it short and silly. */
  terms: [
    'Your first coupon term.',
    'Your second coupon term.',
  ],
  /** Fake serial printed on the stub. */
  code: 'QUIZ-PRIZE-0001',
  validity: 'Never expires',
} as const satisfies CouponContent;

/**
 * The prize for finishing the Rebuild Us jigsaw (any time counts). Once won it stays unlocked
 * on their device, so they can open it again from the puzzle screen.
 */
export const PUZZLE_PRIZE = {
  /** Shown above the coupon when they collect it. */
  reveal: 'You rebuilt us! Your prize is ...',
  coupon: {
    kicker: 'Official coupon · puzzle solved',
    title: 'Your Puzzle Prize',
    subtitle: 'Your prize subtitle',
    icon: '🎁',
    to: THEIR_NAME,
    from: MY_NAME,
    terms: [
      'Your first coupon term.',
      'Your second coupon term.',
    ],
    code: 'PUZZLE-PRIZE-0002',
    validity: 'Never expires',
  },
} as const satisfies { reveal: string; coupon: CouponContent };

/**
 * The prize for reaching the winning score in Jar Full Of You. Once won it stays unlocked
 * on their device, so they can open it again from the game's start screen.
 */
export const MERGE_PRIZE = {
  /** Shown above the coupon when they collect it. */
  reveal: 'You filled the jar! Your prize is ...',
  coupon: {
    kicker: 'Official coupon · 200 points',
    title: 'Your Jar Prize',
    subtitle: 'Your prize subtitle',
    icon: '🎁',
    to: THEIR_NAME,
    from: MY_NAME,
    terms: [
      'Your first coupon term.',
      'Your second coupon term.',
    ],
    code: 'JAR-PRIZE-0003',
    validity: 'Never expires',
  },
} as const satisfies { reveal: string; coupon: CouponContent };

/**
 * When each mini game opens ("YYYY-MM-DD" in UNLOCK_TZ). They sit between the fixed event days:
 * Jar → Quiz → Christmas (Dec 25) → Rebuild Us.
 * The Mini Games app itself opens earlier, on Dec 1 (see registry.ts), with these showing as locked.
 */
export const GAME_UNLOCKS = {
  /** Jar Full Of You → jar prize. */
  merge: '2026-12-14',
  /** How well do you know us? → quiz prize. A few days before Christmas. */
  quiz: '2026-12-19',
  /** Rebuild Us → puzzle prize. The day after Christmas. */
  puzzle: '2026-12-26',
} as const;
