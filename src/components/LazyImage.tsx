import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  threshold?: number;
  eager?: boolean; // Force eager loading for above-the-fold images
}

export function LazyImage({ 
  src, 
  alt, 
  fallback = '/placeholder.jpg', 
  className = '', 
  threshold = 0.1,
  eager = false,
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoaded(false);
    setError(false);
  }, [src]);

  useEffect(() => {
    if (!imgRef.current || eager) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold,
        rootMargin: '200px', // Start loading 200px before viewport (instant feel)
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [threshold, eager]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Instant CSS-only placeholder - no network request */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm animate-pulse"
          style={{
            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%)',
            backgroundSize: '20px 20px',
          }}
        />
      )}
      
      {/* Only load image when in view */}
      {isInView && (
        <img
          {...props}
          src={error ? fallback : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
        />
      )}
    </div>
  );
}
