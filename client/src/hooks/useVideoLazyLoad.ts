import { useEffect, useRef, useState, useCallback } from 'react';

const isLowPerformanceMode = (): boolean => {
  return document.documentElement.classList.contains('low-performance') ||
         document.documentElement.classList.contains('slow-network');
};

const isSlowNetwork = (): boolean => {
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
  if (!connection) return false;
  
  const effectiveType = connection.effectiveType;
  return effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g' || connection.saveData;
};

interface UseVideoLazyLoadOptions {
  autoplay?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function useVideoLazyLoad(options: UseVideoLazyLoadOptions = {}) {
  const {
    autoplay = true,
    threshold = 0.1,
    rootMargin = '100px',
  } = options;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadedRef = useRef(false);
  const isIntersectingRef = useRef(false);
  const canplayHandlerRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const shouldAutoplay = useCallback(() => {
    if (!autoplay) return false;
    if (isLowPerformanceMode()) return false;
    if (isSlowNetwork()) return false;
    return true;
  }, [autoplay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersectingRef.current = entry.isIntersecting;
          setIsVisible(entry.isIntersecting);
          
          if (entry.isIntersecting) {
            if (!loadedRef.current && video.readyState === 0) {
              loadedRef.current = true;
              video.load();
            }
            
            if (!shouldAutoplay()) return;
            
            if (video.readyState >= 2) {
              video.play().catch(() => {});
            } else {
              if (!canplayHandlerRef.current) {
                canplayHandlerRef.current = () => {
                  setIsLoaded(true);
                  if (isIntersectingRef.current && shouldAutoplay()) {
                    video.play().catch(() => {});
                  }
                };
                video.addEventListener('canplay', canplayHandlerRef.current, { once: true });
              }
            }
          } else {
            if (canplayHandlerRef.current) {
              video.removeEventListener('canplay', canplayHandlerRef.current);
              canplayHandlerRef.current = null;
            }
            video.pause();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      if (canplayHandlerRef.current) {
        video.removeEventListener('canplay', canplayHandlerRef.current);
      }
    };
  }, [shouldAutoplay, threshold, rootMargin]);

  return { videoRef, isVisible, isLoaded };
}
