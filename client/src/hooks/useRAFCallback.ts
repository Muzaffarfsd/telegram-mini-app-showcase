import { useRef, useCallback, useEffect } from 'react';

export function useRAFCallback<T extends (...args: any[]) => void>(callback: T): T {
  const rafRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  const latestArgsRef = useRef<any[]>([]);
  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return useCallback((...args: any[]) => {
    latestArgsRef.current = args;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      callbackRef.current(...latestArgsRef.current);
    });
  }, []) as unknown as T;
}
