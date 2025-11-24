import { useEffect, useRef } from 'react';

/**
 * Hook for immediate video preloading on mount
 * Use for critical above-the-fold videos that should start loading immediately
 */
export function useVideoPreload() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isIntersectingRef = useRef(false);
  const canplayHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start loading immediately on mount
    video.load();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersectingRef.current = entry.isIntersecting;
          
          if (entry.isIntersecting) {
            // Try to play when ready
            if (video.readyState >= 2) {
              video.play().catch(() => {
                // Autoplay blocked, ignore
              });
            } else {
              // Wait for canplay event if not ready yet
              if (!canplayHandlerRef.current) {
                canplayHandlerRef.current = () => {
                  // Only play if still intersecting
                  if (isIntersectingRef.current) {
                    video.play().catch(() => {
                      // Autoplay blocked, ignore
                    });
                  }
                };
                video.addEventListener('canplay', canplayHandlerRef.current, { once: true });
              }
            }
          } else {
            // Remove pending canplay handler when leaving viewport
            if (canplayHandlerRef.current) {
              video.removeEventListener('canplay', canplayHandlerRef.current);
              canplayHandlerRef.current = null;
            }
            video.pause();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '200px',
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      if (canplayHandlerRef.current) {
        video.removeEventListener('canplay', canplayHandlerRef.current);
      }
    };
  }, []);

  return videoRef;
}
