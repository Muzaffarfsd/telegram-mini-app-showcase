import { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  blurhash?: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

const ProgressiveImage = memo(function ProgressiveImage({
  src,
  alt,
  placeholder,
  blurhash,
  className = '',
  containerClassName = '',
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading === 'eager' || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px', threshold: 0.01 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    if (!isInView || !src) return;

    let isMounted = true;
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      if (isMounted) {
        setIsLoaded(true);
        setHasError(false);
        onLoad?.();
      }
    };
    
    img.onerror = () => {
      if (isMounted) {
        setHasError(true);
        onError?.();
      }
    };

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src, onLoad, onError]);

  const generatePlaceholder = (): string => {
    if (placeholder) return placeholder;
    if (blurhash) return `data:image/svg+xml,${encodeURIComponent(generateBlurhashSVG(blurhash))}`;
    return generateGradientPlaceholder();
  };

  const generateGradientPlaceholder = (): string => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width || 400}" height="${height || 300}">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(var(--muted));stop-opacity:1" />
            <stop offset="100%" style="stop-color:hsl(var(--muted-foreground)/0.1);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  const generateBlurhashSVG = (hash: string): string => {
    const colors = hash.split('').map((_, i) => 
      `hsl(${(i * 37) % 360}, 40%, ${50 + (i % 20)}%)`
    );
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width || 400}" height="${height || 300}">
        <defs>
          <filter id="blur" x="0" y="0">
            <feGaussianBlur stdDeviation="20"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="${colors[0] || '#888'}" filter="url(#blur)"/>
      </svg>
    `;
  };

  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          containerClassName
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', containerClassName)}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      <img
        src={generatePlaceholder()}
        alt=""
        aria-hidden="true"
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-0' : 'opacity-100',
          'blur-xl scale-110'
        )}
        style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
      />

      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}

      {/* Loading shimmer - uses Tailwind animate-pulse */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      )}
    </div>
  );
});

export default ProgressiveImage;

