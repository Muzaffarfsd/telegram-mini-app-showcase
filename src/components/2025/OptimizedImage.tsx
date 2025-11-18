import React, { useState, useEffect } from 'react';
import { motion } from '@/utils/LazyMotionProvider';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: string;
  skeleton?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fallback = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 300\'%3E%3Crect fill=\'%23111\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\' font-family=\'sans-serif\' font-size=\'18\'%3EImage%3C/text%3E%3C/svg%3E',
  skeleton = true,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(priority ? src : fallback);
  
  useEffect(() => {
    if (!priority) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
        onLoad?.();
      };
      img.onerror = () => {
        setError(true);
        setIsLoading(false);
        onError?.();
      };
    } else {
      setIsLoading(false);
    }
  }, [src, priority, onLoad, onError]);
  
  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {isLoading && skeleton && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
      
      <motion.img
        src={error ? fallback : imageSrc}
        alt={alt}
        className={cn('w-full h-full object-cover', className)}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: isLoading ? 0 : 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => {
          setError(true);
          onError?.();
        }}
      />
    </div>
  );
};

// === PROGRESSIVE IMAGE (with blur-up effect) ===
interface ProgressiveImageProps {
  src: string;
  placeholder: string;
  alt: string;
  className?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  placeholder,
  alt,
  className
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.img
        src={placeholder}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover blur-lg"
        style={{ filter: isLoaded ? 'blur(0px)' : 'blur(20px)' }}
      />
      
      <motion.img
        src={src}
        alt={alt}
        className="relative w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};
