import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  fallbackColor?: string;
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height,
  priority = false,
  blurDataURL,
  sizes = '100vw',
  className = '',
  onLoad,
  fallbackColor = 'bg-gradient-to-br from-gray-800 to-gray-900',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || '');
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const generateSrcSet = (url: string) => {
    if (!url.includes('unsplash.com')) return '';
    
    const widths = [320, 640, 750, 828, 1080, 1200, 1920];
    return widths
      .filter(w => w <= width * 2)
      .map(w => `${url}&w=${w}&q=75&fm=webp&auto=format ${w}w`)
      .join(', ');
  };
  
  const optimizedSrc = src.includes('unsplash.com')
    ? `${src}&w=${width}&h=${height || Math.round(width * 1.5)}&q=75&fm=webp&auto=format,compress&fit=crop`
    : src;
  
  const lowQualitySrc = src.includes('unsplash.com')
    ? `${src}&w=20&q=10&blur=200&fm=jpg`
    : blurDataURL;
  
  useEffect(() => {
    if (!imgRef.current) return;
    
    if (!priority && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSrc(optimizedSrc);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px'
        }
      );
      
      observer.observe(imgRef.current);
      
      return () => observer.disconnect();
    } else {
      setCurrentSrc(optimizedSrc);
    }
  }, [optimizedSrc, priority]);
  
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setError(true);
  };
  
  if (error) {
    return (
      <div 
        className={`${className} ${fallbackColor} flex items-center justify-center text-white/40`}
        {...props}
      >
        <span className="text-xs font-semibold">{alt.slice(0, 2)}</span>
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className={`absolute inset-0 ${fallbackColor} overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer-animation" />
        </div>
      )}
      
      {lowQualitySrc && !isLoaded && (
        <img
          src={lowQualitySrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
          aria-hidden="true"
        />
      )}
      
      <img
        ref={imgRef}
        src={currentSrc}
        srcSet={currentSrc ? generateSrcSet(src) : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        {...props}
      />
    </div>
  );
}

export async function getBlurDataURL(imageUrl: string): Promise<string> {
  if (imageUrl.includes('unsplash.com')) {
    return `${imageUrl}&w=10&q=10&blur=10&fm=jpg`;
  }
  return '';
}
