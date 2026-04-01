import { memo, useEffect, useRef, type VideoHTMLAttributes, type ReactNode } from 'react';

interface AutoplayVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'ref'> {
  rootMargin?: string;
  children?: ReactNode;
}

export const AutoplayVideo = memo(function AutoplayVideo({
  rootMargin = '200px',
  children,
  ...props
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === 'undefined') {
      video?.play().catch(() => {});
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
  }, [rootMargin]);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="metadata"
      {...props}
    >
      {children}
    </video>
  );
});
