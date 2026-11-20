import { useState, type CSSProperties } from 'react';
import { asset } from '../lib/asset';

interface PhotoProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** Load straight away (e.g. the photo being viewed) instead of lazily. */
  eager?: boolean;
}

/** An image from /public that shows a soft placeholder frame if the file is missing. */
export function Photo({ src, alt, className = '', style, eager = false }: PhotoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return (
      <div role="img" aria-label={alt} style={style} className={`${className} flex items-center justify-center bg-surface-2 text-3xl`}>
        <span aria-hidden="true">📷</span>
      </div>
    );
  }

  return (
    <img
      src={asset(src)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={className}
      style={style}
    />
  );
}
