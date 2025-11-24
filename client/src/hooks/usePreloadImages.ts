import { useEffect, useState } from 'react';

/**
 * Preload critical images before app renders
 * This significantly improves perceived performance
 * 
 * Usage:
 * const { isLoading } = usePreloadImages(['/hero.webp', '/logo.png']);
 */
export function usePreloadImages(imagePaths: string[]) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (!imagePaths.length) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let loaded = 0;
    const total = imagePaths.length;

    const loadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          if (mounted) {
            loaded++;
            setLoadedCount(loaded);
            if (loaded === total) {
              setIsLoading(false);
            }
          }
          resolve();
        };

        img.onerror = () => {
          console.warn(`[Preload] Failed to load image: ${src}`);
          if (mounted) {
            loaded++;
            setLoadedCount(loaded);
            if (loaded === total) {
              setIsLoading(false);
            }
          }
          resolve();
        };

        img.src = src;
      });
    };

    // Load all images in parallel
    Promise.all(imagePaths.map(loadImage)).then(() => {
      if (mounted) {
        console.log(`[Preload] All ${total} images loaded successfully`);
      }
    });

    return () => {
      mounted = false;
    };
  }, [imagePaths]);

  return {
    isLoading,
    loadedCount,
    total: imagePaths.length,
    progress: imagePaths.length > 0 ? (loadedCount / imagePaths.length) * 100 : 100,
  };
}
