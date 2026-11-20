import { QUIZ_COUPON, type CouponContent } from '../../content/games';

/** A paper ticket: main body + a perforated stub. Fixed cream/plum colours so it reads as paper in every theme. */
export function QuizCoupon({ fresh = false, coupon = QUIZ_COUPON }: { fresh?: boolean; coupon?: CouponContent }) {
  const c = coupon;
  return (
    <figure
      aria-label={`Coupon: ${c.title}, ${c.subtitle}`}
      className={`coupon relative mx-auto w-full max-w-sm text-plum ${fresh ? 'animate-[coupon-in_700ms_cubic-bezier(0.3,1.4,0.5,1)_both]' : ''}`}
    >
      <div className="coupon-body rounded-t-2xl px-5 pb-5 pt-4 text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#9a4560]">{c.kicker}</p>
        <span aria-hidden="true" className="mt-2 block text-5xl">
          {c.icon}
        </span>
        <h4 className="mt-2 text-2xl font-black leading-tight text-balance">{c.title}</h4>
        <p className="text-base font-semibold italic text-[#6b4c8f]">{c.subtitle}</p>
        <p className="mt-3 text-xs">
          For <strong>{c.to}</strong> · from <strong>{c.from}</strong>
        </p>
        <ul className="mt-3 space-y-0.5 text-left text-[0.7rem] leading-snug text-plum/80">
          {c.terms.map((t) => (
            <li key={t} className="flex gap-1.5">
              <span aria-hidden="true">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="coupon-stub flex items-center justify-between rounded-b-2xl px-5 py-3 font-mono text-xs">
        <span>No. {c.code}</span>
        <span className="font-sans font-semibold">{c.validity}</span>
      </div>
    </figure>
  );
}
