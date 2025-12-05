import { memo, useState, useEffect, useRef, useCallback, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type PlaceholderType = 'blur' | 'skeleton';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string;
  alt: string;
  className?: string;
  placeholder?: PlaceholderType;
  aspectRatio?: string;
  quality?: number;
  priority?: boolean;
  onLoadComplete?: () => void;
  'data-testid'?: string;
}

function optimizeUnsplashUrl(url: string, quality: number): string {
  if (!url || !url.includes('images.unsplash.com')) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('auto', 'format,compress');
    urlObj.searchParams.set('fm', 'webp');
    urlObj.searchParams.set('q', String(quality));
    if (!urlObj.searchParams.has('w')) {
      urlObj.searchParams.set('w', '800');
    }
    return urlObj.toString();
  } catch {
    return url;
  }
}

const BlurPlaceholder = memo(function BlurPlaceholder({ 
  isLoading 
}: { 
  isLoading: boolean 
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-opacity duration-500',
        'bg-gradient-to-br from-muted/50 to-muted',
        'backdrop-blur-xl',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      style={{
        backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '20px 20px',
      }}
      aria-hidden="true"
    />
  );
});

const SkeletonPlaceholder = memo(function SkeletonPlaceholder({ 
  isLoading 
}: { 
  isLoading: boolean 
}) {
  return (
    <Skeleton
      className={cn(
        'absolute inset-0 transition-opacity duration-300',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    />
  );
});

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  placeholder = 'blur',
  aspectRatio,
  quality = 80,
  priority = false,
  onLoadComplete,
  'data-testid': dataTestId = 'lazy-image',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const optimizedSrc = optimizeUnsplashUrl(src, quality);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (priority || !containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '200px 0px',
        threshold: 0.01,
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  const PlaceholderComponent = placeholder === 'skeleton' ? SkeletonPlaceholder : BlurPlaceholder;

  const containerStyle = aspectRatio
    ? { aspectRatio }
    : undefined;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={containerStyle}
      data-testid={dataTestId}
    >
      <PlaceholderComponent isLoading={!isLoaded} />
      
      {isInView && !hasError && (
        <img
          {...props}
          src={optimizedSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className={cn(
            'w-full h-full object-cover',
            'transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          data-testid={`${dataTestId}-img`}
        />
      )}
      
      {hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-muted"
          data-testid={`${dataTestId}-error`}
        >
          <span className="text-muted-foreground text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
});

export default LazyImage;
