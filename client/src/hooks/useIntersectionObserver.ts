import { useRef, useState, useEffect, useCallback, type RefObject } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  enabled?: boolean;
}

interface UseIntersectionObserverResult<T extends Element> {
  ref: RefObject<T>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
  disconnect: () => void;
}

export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult<T> {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    enabled = true,
  } = options;

  const ref = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const element = ref.current;
    
    if (!enabled || !element) {
      return;
    }

    disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [observerEntry] = entries;
        
        setIsIntersecting(observerEntry.isIntersecting);
        setEntry(observerEntry);

        if (triggerOnce && observerEntry.isIntersecting) {
          disconnect();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(element);

    return () => {
      disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce, enabled, disconnect]);

  return {
    ref,
    isIntersecting,
    entry,
    disconnect,
  };
}

interface UseIntersectionObserverCallbackOptions extends UseIntersectionObserverOptions {
  callback: (entry: IntersectionObserverEntry) => void;
}

export function useIntersectionObserverCallback<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverCallbackOptions
): RefObject<T> {
  const {
    callback,
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    enabled = true,
  } = options;

  const ref = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;

  useEffect(() => {
    const element = ref.current;
    
    if (!enabled || !element) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        callbackRef.current(entry);

        if (triggerOnce && entry.isIntersecting && observerRef.current) {
          observerRef.current.disconnect();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [root, rootMargin, threshold, triggerOnce, enabled]);

  return ref;
}

export default useIntersectionObserver;
