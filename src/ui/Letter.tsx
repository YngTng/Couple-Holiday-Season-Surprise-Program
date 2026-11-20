import { forwardRef } from 'react';

interface LetterProps {
  body: string;
  signOff: string;
  signature: string;
  /** Shown below the signature, e.g. "PS. ...". Omit or leave empty for none. */
  postscript?: string;
  /** Tailwind max-width class for the paper. Defaults to max-w-md. */
  maxWidth?: string;
}

/** A letter on paper. Paragraphs are split on blank lines. Stays paper-coloured in dark mode. */
export const Letter = forwardRef<HTMLElement, LetterProps>(function Letter({ body, signOff, signature, postscript, maxWidth = 'max-w-md' }, ref) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article
      ref={ref}
      tabIndex={-1}
      aria-label="Letter"
      className={`paper-letter relative mx-auto w-full ${maxWidth} rounded-2xl px-6 py-7 font-serif shadow-lg outline-none [word-break:keep-all] animate-[letter-in_600ms_ease-out_both] sm:px-8`}
    >
      <div className="flex flex-col gap-8 text-[17px] leading-8">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
      <p className="mt-8 text-[17px] italic leading-8">{signOff}</p>
      <p className="text-lg font-semibold leading-8">{signature}</p>
      {postscript && <p className="mt-8 whitespace-pre-line text-[17px] leading-8">{postscript}</p>}
    </article>
  );
});
