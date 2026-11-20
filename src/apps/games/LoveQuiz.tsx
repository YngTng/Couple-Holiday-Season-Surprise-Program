import { useEffect, useRef, useState } from 'react';
import { QUIZ } from '../../content/games';
import { usePersistentState } from '../../hooks/usePersistentState';
import { isBoolean, isNumberOrNull } from '../../lib/storage';
import { Particles } from '../../ui/Particles';
import { BEST_KEYS, QUIZ_COUPON_KEY } from './bestScores';
import { QuizCoupon } from './QuizCoupon';

const QUESTIONS = QUIZ.questions.filter((q) => q.answerIndex >= 0 && q.answerIndex < q.options.length);

/** Multiple-choice quiz. Answers are shown with text marks as well as colour. */
export function LoveQuiz() {
  // -1 = intro, QUESTIONS.length = results
  const [index, setIndex] = useState(-1);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = usePersistentState<number | null>(BEST_KEYS.quiz, null, isNumberOrNull);
  const [couponWon, setCouponWon] = usePersistentState<boolean>(QUIZ_COUPON_KEY, false, isBoolean);
  /** null = not showing; 'fresh' = just claimed (animates in); 'saved' = reopened from the start screen. */
  const [showCoupon, setShowCoupon] = useState<null | 'fresh' | 'saved'>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const finished = index >= QUESTIONS.length;
  const question = QUESTIONS[index];
  const perfect = finished && score === QUESTIONS.length;

  useEffect(() => {
    if (index >= 0) headingRef.current?.focus();
  }, [index]);

  useEffect(() => {
    if (choice !== null) nextRef.current?.focus();
  }, [choice]);

  useEffect(() => {
    if (finished) setBest((prev) => (prev === null || score > prev ? score : prev));
    if (perfect) setCouponWon(true);
  }, [finished, perfect, score, setBest, setCouponWon]);

  useEffect(() => {
    if (showCoupon) headingRef.current?.focus();
  }, [showCoupon]);

  const choose = (i: number) => {
    if (choice !== null || !question) return;
    setChoice(i);
    if (i === question.answerIndex) setScore((s) => s + 1);
  };

  const next = () => {
    setChoice(null);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setShowCoupon(null);
    setScore(0);
    setChoice(null);
    setIndex(0);
  };

  if (QUESTIONS.length === 0) {
    return <p className="text-center text-sm text-ink-muted">No questions yet. Add them in src/content/games.ts.</p>;
  }

  if (showCoupon) {
    return (
      <div className="relative flex flex-col items-center gap-4 py-4 text-center">
        {showCoupon === 'fresh' && <Particles variant="confetti" count={36} />}
        <h3 ref={headingRef} tabIndex={-1} className="text-lg font-semibold text-ink outline-none">
          {showCoupon === 'fresh' ? 'Your prize ♡' : 'Your coupon'}
        </h3>
        <QuizCoupon fresh={showCoupon === 'fresh'} />
        <p className="max-w-xs text-xs text-ink-muted">Screenshot it and show it to me when you want to cash it in.</p>
        <button
          type="button"
          onClick={() => {
            setShowCoupon(null);
            setIndex(-1);
          }}
          className="min-h-11 rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
        >
          Done
        </button>
      </div>
    );
  }

  if (index < 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span aria-hidden="true" className="text-5xl">
          💭
        </span>
        <h3 className="text-xl font-semibold text-ink">{QUIZ.title}</h3>
        <p className="max-w-sm text-sm text-ink">{QUIZ.intro}</p>
        <p className="text-xs text-ink-muted">
          {QUESTIONS.length} questions{best !== null ? ` · best ${best} / ${QUESTIONS.length}` : ''}
        </p>
        {!couponWon && (
          <p className="rounded-xl bg-surface-2 px-3 py-2 text-xs font-medium text-ink ring-1 ring-line">
            <span aria-hidden="true">🎁 </span>Get every answer right to win a prize
          </p>
        )}
        <button
          type="button"
          onClick={restart}
          className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow hover:brightness-110"
        >
          Start
        </button>
        {couponWon && (
          <button
            type="button"
            onClick={() => setShowCoupon('saved')}
            className="min-h-11 rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            <span aria-hidden="true">🎟️ </span>View my coupon
          </button>
        )}
      </div>
    );
  }

  if (finished || !question) {
    return (
      <div className="relative flex flex-col items-center gap-4 py-6 text-center">
        {perfect && <Particles variant="confetti" />}
        <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-ink outline-none">
          {score} / {QUESTIONS.length}
        </h3>
        {perfect && <p className="text-sm font-semibold text-accent-text">Perfect score! You really do know us.</p>}
        {perfect && <p className="max-w-sm text-base text-ink">{QUIZ.endMessage}</p>}
        {perfect ? (
          <button
            type="button"
            onClick={() => setShowCoupon('fresh')}
            className="tree-present min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow hover:brightness-110"
          >
            <span aria-hidden="true">🎁 </span>Claim your prize
          </button>
        ) : (
          <p className="text-xs text-ink-muted">
            {couponWon ? 'You already won the prize, but nice try!' : 'Get them all right to unlock a prize. Try again?'}
          </p>
        )}
        <button
          type="button"
          onClick={restart}
          className="min-h-11 rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
        >
          Play again
        </button>
      </div>
    );
  }

  const answered = choice !== null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-medium text-ink-muted">
        Question {index + 1} of {QUESTIONS.length} · Score {score}
      </p>
      <h3 ref={headingRef} tabIndex={-1} className="text-lg font-semibold text-ink outline-none">
        {question.question}
      </h3>

      <ul className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isAnswer = i === question.answerIndex;
          const isChoice = i === choice;
          let tone = 'border-line bg-surface text-ink hover:bg-surface-2';
          let mark = '';
          if (answered && isAnswer) {
            tone = 'border-[#7c9a7a] bg-[#dcebd3] text-plum';
            mark = isChoice ? '✓ Your answer · correct' : '✓ Correct answer';
          } else if (answered && isChoice) {
            tone = 'border-[#c2556f] bg-[#f8d6df] text-plum';
            mark = '✗ Your answer';
          } else if (answered) {
            tone = 'border-line bg-surface text-ink-muted';
          }
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => choose(i)}
                aria-disabled={answered}
                className={`flex min-h-12 w-full flex-col items-start justify-center rounded-xl border-2 px-4 py-2 text-left text-sm font-medium transition-colors ${tone}`}
              >
                <span>{option}</span>
                {mark && <span className="text-xs font-semibold">{mark}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite">
        {answered && (
          <div className="flex flex-col gap-3 animate-[fade-in_300ms_ease-out_both]">
            <p className="text-sm font-semibold text-ink">{choice === question.answerIndex ? 'Correct! ♡' : 'Not quite!'}</p>
            {question.reveal && <p className="rounded-xl bg-surface-2 p-3 text-sm text-ink">{question.reveal}</p>}
            {question.correctReveal && choice === question.answerIndex && (
              <p className="self-center rounded-2xl bg-cream px-5 py-3 text-center text-base font-semibold text-plum shadow ring-2 ring-[#f6c9d6] animate-[present-drop_600ms_cubic-bezier(0.3,1.5,0.5,1)_both]">
                {question.correctReveal}
              </p>
            )}
            <button
              ref={nextRef}
              type="button"
              onClick={next}
              className="min-h-11 self-end rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow hover:brightness-110"
            >
              {index + 1 < QUESTIONS.length ? 'Next question' : 'See my score'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
