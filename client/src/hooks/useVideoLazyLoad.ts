import { useEffect, useRef } from 'react';

export function useVideoLazyLoad() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadedRef = useRef(false);
  const isIntersectingRef = useRef(false);
  const canplayHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersectingRef.current = entry.isIntersecting;
          
          if (entry.isIntersecting) {
            // Start loading video if not already loaded
            if (!loadedRef.current && video.readyState === 0) {
              loadedRef.current = true;
              video.load(); // Force load for preload="none" videos
            }
            
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
        threshold: 0.1, // Play when 10% visible
        rootMargin: '200px', // Start loading earlier
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
