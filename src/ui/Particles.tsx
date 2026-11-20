import type { CSSProperties } from 'react';
import { useReducedMotion } from '../settings/SettingsProvider';

const CONFETTI_COLORS = ['#f2a3bb', '#c7b2ec', '#ffcfa8', '#9a4560', '#6b4c8f', '#cfe0c3', '#f2d27a'];

interface ParticlesProps {
  variant: 'confetti' | 'snow';
  count?: number;
}

/**
 * Decorative falling confetti (plays once) or snow (loops). Fills the nearest positioned parent.
 * Not rendered at all when animations are reduced.
 */
export function Particles({ variant, count = 28 }: ParticlesProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  const snow = variant === 'snow';
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const style: CSSProperties = {
          left: `${(i * 37 + 7) % 100}%`,
          animationDelay: `${((i * 0.29) % (snow ? 9 : 1.4)).toFixed(2)}s`,
          animationDuration: `${snow ? 8 + (i % 5) * 1.4 : 2.6 + (i % 5) * 0.4}s`,
          backgroundColor: snow ? undefined : CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        };
        return <span key={i} className={snow ? 'snowflake' : 'confetti-piece'} style={style} />;
      })}
    </div>
  );
}
