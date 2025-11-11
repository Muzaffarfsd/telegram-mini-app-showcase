import { useEffect } from 'react';

interface PreloadOptions {
  images: string[];
  priority?: boolean;
}

export function useImagePreloader({ images, priority = true }: PreloadOptions) {
  useEffect(() => {
    if (!images || images.length === 0) return;

    // Optimize Unsplash URLs
    const optimizeUrl = (url: string): string => {
      if (url.includes('images.unsplash.com')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('auto', 'format,compress');
        urlObj.searchParams.set('q', '75');
        urlObj.searchParams.set('fm', 'webp');
        return urlObj.toString();
      }
      return url;
    };

    // Preload images using link tags for highest priority
    const linkElements: HTMLLinkElement[] = [];

    images.forEach((src) => {
      const optimizedSrc = optimizeUrl(src);
      
      // Use link preload for critical images
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      if (priority) {
        link.setAttribute('fetchpriority', 'high');
      }
      
      document.head.appendChild(link);
      linkElements.push(link);

      // Also create img element for browser cache
      const img = new Image();
      img.src = optimizedSrc;
      img.decoding = 'async';
    });

    // Cleanup
    return () => {
      linkElements.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [images, priority]);
}

export default useImagePreloader;
