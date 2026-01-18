import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export type ActivityMode = 'visible' | 'hidden';

interface UseActivityOptions {
  mode: ActivityMode;
  preserveState?: boolean;
  onModeChange?: (mode: ActivityMode) => void;
}

interface PreservedState<T = unknown> {
  scrollPosition: number;
  formData: Map<string, T>;
  customState: Map<string, T>;
  timestamp: number;
}

interface UseActivityResult<T = unknown> {
  isVisible: boolean;
  isHidden: boolean;
  preservedState: PreservedState<T>;
  saveState: (key: string, value: T) => void;
  getState: <V = T>(key: string, defaultValue?: V) => V | undefined;
  clearState: () => void;
  saveScrollPosition: () => void;
  restoreScrollPosition: () => void;
}

export function useActivity<T = unknown>(options: UseActivityOptions): UseActivityResult<T> {
  const { mode, preserveState = true, onModeChange } = options;
  
  const previousModeRef = useRef<ActivityMode>(mode);
  const scrollPositionRef = useRef(0);
  const stateMapRef = useRef<Map<string, T>>(new Map());
  const formDataRef = useRef<Map<string, T>>(new Map());
  const timestampRef = useRef(Date.now());

  const isVisible = mode === 'visible';
  const isHidden = mode === 'hidden';

  useEffect(() => {
    if (previousModeRef.current !== mode) {
      if (preserveState && mode === 'hidden') {
        scrollPositionRef.current = window.scrollY;
        timestampRef.current = Date.now();
      }
      
      onModeChange?.(mode);
      previousModeRef.current = mode;
    }
  }, [mode, preserveState, onModeChange]);

  useEffect(() => {
    if (preserveState && mode === 'visible' && previousModeRef.current === 'hidden') {
      const raf = requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [mode, preserveState]);

  const saveState = useCallback((key: string, value: T) => {
    stateMapRef.current.set(key, value);
    timestampRef.current = Date.now();
  }, []);

  const getState = useCallback(<V = T>(key: string, defaultValue?: V): V | undefined => {
    const value = stateMapRef.current.get(key);
    return (value !== undefined ? value : defaultValue) as V | undefined;
  }, []);

  const clearState = useCallback(() => {
    stateMapRef.current.clear();
    formDataRef.current.clear();
    scrollPositionRef.current = 0;
    timestampRef.current = Date.now();
  }, []);

  const saveScrollPosition = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
  }, []);

  const restoreScrollPosition = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });
  }, []);

  const preservedState = useMemo<PreservedState<T>>(() => ({
    scrollPosition: scrollPositionRef.current,
    formData: formDataRef.current,
    customState: stateMapRef.current,
    timestamp: timestampRef.current,
  }), [mode]);

  return {
    isVisible,
    isHidden,
    preservedState,
    saveState,
    getState,
    clearState,
    saveScrollPosition,
    restoreScrollPosition,
  };
}

export function useActivityState<T>(
  initialValue: T,
  options: { mode: ActivityMode }
): [T, (value: T | ((prev: T) => T)) => void] {
  const { mode } = options;
  const [state, setState] = useState<T>(initialValue);
  const preservedValueRef = useRef<T>(initialValue);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (mode === 'hidden') {
      preservedValueRef.current = state;
      hasRestoredRef.current = false;
    } else if (mode === 'visible' && !hasRestoredRef.current) {
      setState(preservedValueRef.current);
      hasRestoredRef.current = true;
    }
  }, [mode, state]);

  const setActivityState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const newValue = typeof value === 'function' 
        ? (value as (prev: T) => T)(prev) 
        : value;
      preservedValueRef.current = newValue;
      return newValue;
    });
  }, []);

  return [state, setActivityState];
}

export function useActivityEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  options: { mode: ActivityMode; runWhenHidden?: boolean }
): void {
  const { mode, runWhenHidden = false } = options;
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const effectRef = useRef(effect);
  const runWhenHiddenRef = useRef(runWhenHidden);
  
  effectRef.current = effect;
  runWhenHiddenRef.current = runWhenHidden;

  useEffect(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = undefined;
    }
    
    if (mode === 'visible' || runWhenHiddenRef.current) {
      const cleanup = effectRef.current();
      if (typeof cleanup === 'function') {
        cleanupRef.current = cleanup;
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
    };
  }, [mode, ...deps]);
}

export function useActivityCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList,
  options: { mode: ActivityMode }
): T {
  const { mode } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (mode === 'visible') {
        return callbackRef.current(...args);
      }
    }) as T,
    [mode, ...deps]
  );
}

export function useActivityMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: { mode: ActivityMode; recomputeOnVisible?: boolean }
): T {
  const { mode, recomputeOnVisible = false } = options;
  const cachedValueRef = useRef<T | undefined>(undefined);
  const hasCachedRef = useRef(false);

  return useMemo(() => {
    if (mode === 'hidden' && hasCachedRef.current) {
      return cachedValueRef.current as T;
    }

    if (mode === 'visible' || !hasCachedRef.current) {
      const value = factory();
      cachedValueRef.current = value;
      hasCachedRef.current = true;
      return value;
    }

    return cachedValueRef.current as T;
  }, recomputeOnVisible ? [mode, ...deps] : deps);
}
