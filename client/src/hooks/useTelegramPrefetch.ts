import { useEffect, useRef, useCallback } from 'react';
import {
  initTelegramPrefetch,
  prefetchDemoOnHover,
  prefetchDemoOnVisible,
  prefetchImages,
  createPrefetchObserver,
  cleanupTelegramPrefetch,
} from '@/lib/telegramPrefetch';

export function useTelegramPrefetchInit(): void {
  useEffect(() => {
    initTelegramPrefetch();
    
    return () => {
      cleanupTelegramPrefetch();
    };
  }, []);
}

export function useDemoPrefetchOnHover(demoId: string): {
  onMouseEnter: () => void;
  onTouchStart: () => void;
} {
  const hasPrefetched = useRef(false);
  
  const handlePrefetch = useCallback(() => {
    if (!hasPrefetched.current) {
      hasPrefetched.current = true;
      prefetchDemoOnHover(demoId);
    }
  }, [demoId]);
  
  return {
    onMouseEnter: handlePrefetch,
    onTouchStart: handlePrefetch,
  };
}

export function useDemoPrefetchOnVisible(
  demoId: string,
  elementRef: React.RefObject<HTMLElement>
): void {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = createPrefetchObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          prefetchDemoOnVisible(demoId);
          observer.disconnect();
        }
      });
    });
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [demoId, elementRef]);
}

export function useImagesPrefetch(
  sources: string[],
  enabled: boolean = true
): void {
  const hasPrefetched = useRef(false);
  
  useEffect(() => {
    if (enabled && !hasPrefetched.current && sources.length > 0) {
      hasPrefetched.current = true;
      prefetchImages(sources);
    }
  }, [sources, enabled]);
}

export function usePrefetchOnIdle(callback: () => void, timeout: number = 2000): void {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => callback(), { timeout });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, timeout);
      return () => clearTimeout(id);
    }
  }, [callback, timeout]);
}

export function useNetworkAwarePrefetch(
  highSpeedCallback: () => void,
  lowSpeedCallback?: () => void
): void {
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as { 
        connection?: { 
          effectiveType?: string; 
          saveData?: boolean;
          addEventListener?: (event: string, handler: () => void) => void;
          removeEventListener?: (event: string, handler: () => void) => void;
        } 
      }).connection;
      
      const handleChange = () => {
        if (connection?.effectiveType === '4g' && !connection?.saveData) {
          highSpeedCallback();
        } else if (lowSpeedCallback) {
          lowSpeedCallback();
        }
      };
      
      handleChange();
      
      if (connection?.addEventListener) {
        connection.addEventListener('change', handleChange);
        return () => connection.removeEventListener?.('change', handleChange);
      }
    } else {
      highSpeedCallback();
    }
  }, [highSpeedCallback, lowSpeedCallback]);
}

export default useTelegramPrefetchInit;
