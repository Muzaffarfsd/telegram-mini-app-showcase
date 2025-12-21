export function debounce<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  delay: number
): (...args: TArgs) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: TArgs): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

export function debounceAsync<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  delay: number
): (...args: TArgs) => Promise<TReturn> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: {
    resolve: (value: TReturn) => void;
    reject: (reason?: unknown) => void;
  } | null = null;

  return (...args: TArgs): Promise<TReturn> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise<TReturn>((resolve, reject) => {
      pendingPromise = { resolve, reject };

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          pendingPromise?.resolve(result);
        } catch (error) {
          pendingPromise?.reject(error);
        }
        timeoutId = null;
        pendingPromise = null;
      }, delay);
    });
  };
}

export function throttle<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  limit: number
): (...args: TArgs) => TReturn | undefined {
  let lastCall = 0;
  let lastResult: TReturn | undefined;

  return (...args: TArgs): TReturn | undefined => {
    const now = Date.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      lastResult = fn(...args);
    }

    return lastResult;
  };
}

export function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

import { useState, useEffect, useMemo, useCallback } from 'react';

export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  return debouncedFn;
}

export function useThrottledCallback<TArgs extends unknown[], TReturn>(
  callback: (...args: TArgs) => TReturn,
  limit: number
): (...args: TArgs) => TReturn | undefined {
  return useMemo(
    () => throttle(callback, limit),
    [callback, limit]
  );
}
