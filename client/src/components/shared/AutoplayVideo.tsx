import { memo, useEffect, useRef, type VideoHTMLAttributes, type ReactNode } from 'react';

interface AutoplayVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'ref'> {
  rootMargin?: string;
  eager?: boolean;
  children?: ReactNode;
}

export const AutoplayVideo = memo(function AutoplayVideo({
  rootMargin = '200px',
  eager = false,
  children,
  ...props
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (eager) {
      video.play().catch(() => {});
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      video.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin, threshold: 0.1 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [rootMargin, eager]);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'metadata'}
      autoPlay={eager}
      {...props}
    >
      {children}
    </video>
  );
});
