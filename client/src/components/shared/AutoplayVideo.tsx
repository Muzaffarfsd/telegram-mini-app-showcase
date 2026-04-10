import { memo, useEffect, useRef, useState, type VideoHTMLAttributes, type ReactNode } from 'react';

interface AutoplayVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'ref'> {
  rootMargin?: string;
  eager?: boolean;
  children?: ReactNode;
  fallback?: ReactNode;
}

function shouldSkipVideo(): boolean {
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (conn) {
    if (conn.saveData) return true;
    const et = conn.effectiveType;
    if (et === 'slow-2g' || et === '2g' || et === '3g') return true;
    if (conn.downlink !== undefined && conn.downlink < 1.5) return true;
  }
  if (nav.deviceMemory && nav.deviceMemory <= 4) return true;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) return true;
  return document.documentElement.classList.contains('low-performance');
}

export const AutoplayVideo = memo(function AutoplayVideo({
  rootMargin = '200px',
  eager = false,
  children,
  fallback,
  ...props
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [skip] = useState(shouldSkipVideo);

  useEffect(() => {
    if (skip) return;
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
  }, [rootMargin, eager, skip]);

  if (skip) {
    return fallback ? <>{fallback}</> : null;
  }

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
