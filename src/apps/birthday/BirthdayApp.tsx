import { useCallback, useEffect, useRef, useState } from 'react';
import { BIRTHDAY } from '../../content/birthday';
import { usePersistentState } from '../../hooks/usePersistentState';
import { isBoolean } from '../../lib/storage';
import { Letter } from '../../ui/Letter';
import { Particles } from '../../ui/Particles';
import { CandleStage } from './CandleStage';
import { GiftStage } from './GiftStage';

type Stage = 'intro' | 'candles' | 'gift' | 'letter';
const STAGES: readonly Stage[] = ['intro', 'candles', 'gift', 'letter'];
const STAGE_NAMES: Record<Stage, string> = { intro: 'Start', candles: 'Candles', gift: 'Present', letter: 'Letter' };
const COMPLETE_KEY = 'december-exe:birthday-complete';

/** Birthday adventure: intro → blow out candles → unwrap present → letter. */
export function BirthdayApp() {
  const [stage, setStage] = useState<Stage>('intro');
  const [completed, setCompleted] = usePersistentState(COMPLETE_KEY, false, isBoolean);
  const stageRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const stageIndex = STAGES.indexOf(stage);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Move keyboard / screen reader focus to the new scene.
    if (stage === 'letter') {
      setCompleted(true);
      letterRef.current?.focus();
    } else {
      stageRef.current?.focus();
    }
  }, [stage, setCompleted]);

  const goToLetter = useCallback(() => setStage('letter'), []);
  const [language, setLanguage] = useState<'main' | 'alt'>('main');
  const letterText = language === 'alt' ? BIRTHDAY.translation : BIRTHDAY;

  return (
    <div className="relative flex min-h-full flex-col">
      <div className="flex items-center justify-center gap-2 pt-4" aria-hidden="true">
        {STAGES.map((s, i) => (
          <span
            key={s}
            className={`h-2 rounded-full transition-all ${i === stageIndex ? 'w-6 bg-accent' : i < stageIndex ? 'w-2 bg-accent-soft' : 'w-2 bg-line'}`}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Step {stageIndex + 1} of {STAGES.length}: {STAGE_NAMES[stage]}
      </p>

      <div ref={stageRef} tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {stage === 'intro' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center">
            <span aria-hidden="true" className="text-6xl">
              🎂
            </span>
            <p className="max-w-sm text-2xl font-semibold text-ink">{BIRTHDAY.greeting}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setStage('candles')}
                className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow hover:brightness-110"
              >
                {completed ? 'Start again' : 'Start'}
              </button>
              {completed && (
                <button
                  type="button"
                  onClick={goToLetter}
                  className="min-h-11 rounded-full border border-line px-6 text-sm font-semibold text-ink hover:bg-surface-2"
                >
                  Read the letter again
                </button>
              )}
            </div>
          </div>
        )}

        {stage === 'candles' && (
          <CandleStage candleCount={BIRTHDAY.candleCount} onDone={() => setStage('gift')} />
        )}

        {stage === 'gift' && <GiftStage tag={BIRTHDAY.giftTag} onOpened={goToLetter} />}

        {stage === 'letter' && (
          <div className="relative flex flex-1 flex-col items-center gap-5 px-4 py-6">
            <Particles variant="confetti" count={36} />
            <div role="group" aria-label="Letter language" className="relative flex gap-1 rounded-full border border-line bg-surface p-1">
              {(['main', 'alt'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  aria-pressed={language === lang}
                  onClick={() => setLanguage(lang)}
                  className={`min-h-9 rounded-full px-4 text-sm font-semibold ${language === lang ? 'bg-accent text-on-accent' : 'text-ink hover:bg-surface-2'}`}
                >
                  {lang === 'main' ? BIRTHDAY.languageLabel : BIRTHDAY.translation.label}
                </button>
              ))}
            </div>
            <Letter
              key={language}
              ref={letterRef}
              body={letterText.letter}
              signOff={letterText.signOff}
              signature={BIRTHDAY.signature}
              postscript={letterText.postscript}
              maxWidth="max-w-xl"
            />
            <button
              type="button"
              onClick={() => setStage('intro')}
              className="relative min-h-11 rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
            >
              Back to the start
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
