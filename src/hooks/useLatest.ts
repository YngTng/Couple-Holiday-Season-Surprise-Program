import { useLayoutEffect, useRef, type MutableRefObject } from 'react';

/** Ref that always holds the latest value, so timers don't restart when a callback's identity changes. */
export function useLatest<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
