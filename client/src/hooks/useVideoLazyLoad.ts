import { useEffect, useRef, useState } from 'react';

export function useVideoLazyLoad() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Wait for video to be ready before playing
    const handleCanPlay = () => {
      setIsReady(true);
    };

    video.addEventListener('canplay', handleCanPlay);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isReady) {
            video.play().catch(() => {
              // Autoplay blocked, ignore
            });
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.5, // Play when 50% visible
        rootMargin: '50px', // Start loading earlier
      }
    );

    observer.observe(video);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      observer.disconnect();
    };
  }, [isReady]);

  return videoRef;
}
