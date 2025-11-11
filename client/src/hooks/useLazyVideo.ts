import { useEffect, useRef, useState } from 'react';

export function useLazyVideo(threshold = 0.1) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            const sources = video.querySelectorAll('source[data-src]');
            sources.forEach((source) => {
              const htmlSource = source as HTMLSourceElement;
              htmlSource.src = htmlSource.dataset.src || '';
            });
            
            video.load();
            setIsLoaded(true);
            setIsInView(true);
          } else if (!entry.isIntersecting) {
            setIsInView(false);
          }
        });
      },
      {
        rootMargin: '100px',
        threshold
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [threshold, isLoaded]);

  return { videoRef, isLoaded, isInView };
}
