import { useCallback, useRef, useEffect } from 'react';

interface INPOptimizerConfig {
  yieldInterval?: number;
  prioritizeInteractions?: boolean;
  useIdleCallback?: boolean;
}

const defaultConfig: INPOptimizerConfig = {
  yieldInterval: 50,
  prioritizeInteractions: true,
  useIdleCallback: true,
};

export function useINPOptimizer(config: INPOptimizerConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const taskQueueRef = useRef<Array<() => void>>([]);
  const isProcessingRef = useRef(false);
  const lastYieldTimeRef = useRef(performance.now());

  const shouldYield = useCallback((): boolean => {
    const now = performance.now();
    const elapsed = now - lastYieldTimeRef.current;
    return elapsed >= (settings.yieldInterval ?? 50);
  }, [settings.yieldInterval]);

  const yieldToMain = useCallback((): Promise<void> => {
    return new Promise(resolve => {
      lastYieldTimeRef.current = performance.now();
      
      if (settings.useIdleCallback && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(resolve, { timeout: 100 });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }, [settings.useIdleCallback]);

  const scheduleTask = useCallback((task: () => void, priority: 'high' | 'normal' | 'low' = 'normal') => {
    if (priority === 'high') {
      queueMicrotask(task);
    } else if (priority === 'low') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => task(), { timeout: 5000 });
      } else {
        setTimeout(task, 100);
      }
    } else {
      taskQueueRef.current.push(task);
      processQueue();
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || taskQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;

    while (taskQueueRef.current.length > 0) {
      const task = taskQueueRef.current.shift();
      
      if (task) {
        try {
          task();
        } catch (error) {
          console.error('[INP Optimizer] Task error:', error);
        }
      }

      if (shouldYield()) {
        await yieldToMain();
      }
    }

    isProcessingRef.current = false;
  }, [shouldYield, yieldToMain]);

  const deferredUpdate = useCallback(<T>(
    updateFn: () => T,
    onComplete?: (result: T) => void
  ) => {
    scheduleTask(() => {
      const result = updateFn();
      if (onComplete) {
        queueMicrotask(() => onComplete(result));
      }
    }, 'normal');
  }, [scheduleTask]);

  const immediateResponse = useCallback((
    visualFeedbackFn: () => void,
    heavyWorkFn: () => void
  ) => {
    visualFeedbackFn();
    
    scheduleTask(heavyWorkFn, 'low');
  }, [scheduleTask]);

  const batchUpdates = useCallback((updates: Array<() => void>) => {
    const batchedUpdate = () => {
      updates.forEach(update => update());
    };

    if ('startViewTransition' in document) {
      (document as any).startViewTransition(batchedUpdate);
    } else {
      requestAnimationFrame(batchedUpdate);
    }
  }, []);

  const measureInteraction = useCallback((
    interactionName: string,
    interactionFn: () => void
  ) => {
    const startTime = performance.now();
    
    interactionFn();
    
    requestAnimationFrame(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        const rating = duration < 200 ? 'good' : duration < 500 ? 'needs-improvement' : 'poor';
        console.log(`[INP] ${interactionName}: ${duration.toFixed(2)}ms (${rating})`);
      }
    });
  }, []);

  useEffect(() => {
    if (!settings.prioritizeInteractions) return;

    const prioritizeOnInteraction = () => {
      lastYieldTimeRef.current = performance.now();
    };

    document.addEventListener('pointerdown', prioritizeOnInteraction, { passive: true });
    document.addEventListener('keydown', prioritizeOnInteraction, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', prioritizeOnInteraction);
      document.removeEventListener('keydown', prioritizeOnInteraction);
    };
  }, [settings.prioritizeInteractions]);

  return {
    scheduleTask,
    deferredUpdate,
    immediateResponse,
    batchUpdates,
    measureInteraction,
    yieldToMain,
  };
}

export function useDeferredValue<T>(value: T, delay: number = 100): T {
  const deferredRef = useRef(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      deferredRef.current = value;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return deferredRef.current;
}
