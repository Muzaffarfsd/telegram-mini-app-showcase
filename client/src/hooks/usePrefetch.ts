import { useCallback, useRef, useEffect } from 'react';

interface PrefetchConfig {
  threshold?: number;
  delay?: number;
  maxConcurrent?: number;
}

const defaultConfig: PrefetchConfig = {
  threshold: 0.1,
  delay: 100,
  maxConcurrent: 3,
};

const prefetchedUrls = new Set<string>();
const pendingPrefetches = new Map<string, Promise<void>>();

export function usePrefetch(config: PrefetchConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<Map<Element, NodeJS.Timeout>>(new Map());

  const prefetchUrl = useCallback(async (url: string): Promise<void> => {
    if (prefetchedUrls.has(url) || pendingPrefetches.has(url)) {
      return;
    }

    if (pendingPrefetches.size >= (settings.maxConcurrent ?? 3)) {
      return;
    }

    const prefetchPromise = (async () => {
      try {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = url.endsWith('.js') ? 'script' : 
                  url.endsWith('.css') ? 'style' : 
                  url.match(/\.(png|jpg|jpeg|webp|avif|gif|svg)$/i) ? 'image' : 
                  'fetch';
        document.head.appendChild(link);
        prefetchedUrls.add(url);
      } catch (error) {
        // Silent fail
      } finally {
        pendingPrefetches.delete(url);
      }
    })();

    pendingPrefetches.set(url, prefetchPromise);
    return prefetchPromise;
  }, [settings.maxConcurrent]);

  const prefetchImage = useCallback((src: string): void => {
    if (prefetchedUrls.has(src)) return;
    
    const img = new Image();
    img.src = src;
    prefetchedUrls.add(src);
  }, []);

  const prefetchComponent = useCallback((importFn: () => Promise<unknown>): void => {
    try {
      importFn();
    } catch (error) {
      // Silent fail
    }
  }, []);

  const prefetchOnHover = useCallback((
    element: HTMLElement | null,
    urls: string[]
  ): (() => void) => {
    if (!element) return () => {};

    const handleMouseEnter = () => {
      urls.forEach(url => prefetchUrl(url));
    };

    const handleTouchStart = () => {
      urls.forEach(url => prefetchUrl(url));
    };

    element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    element.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }, [prefetchUrl]);

  const prefetchOnVisible = useCallback((
    element: HTMLElement | null,
    urls: string[]
  ): (() => void) => {
    if (!element || typeof IntersectionObserver === 'undefined') return () => {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const timeout = setTimeout(() => {
              urls.forEach(url => prefetchUrl(url));
              observer.unobserve(entry.target);
            }, settings.delay);
            timeoutRef.current.set(entry.target, timeout);
          } else {
            const timeout = timeoutRef.current.get(entry.target);
            if (timeout) {
              clearTimeout(timeout);
              timeoutRef.current.delete(entry.target);
            }
          }
        });
      },
      { threshold: settings.threshold }
    );

    observer.observe(element);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      timeoutRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutRef.current.clear();
    };
  }, [prefetchUrl, settings.delay, settings.threshold]);

  const prefetchRoute = useCallback((routePath: string): void => {
    const routeChunks: Record<string, () => Promise<unknown>> = {
      '/projects': () => import('@/components/ProjectsPage'),
      '/profile': () => import('@/components/ProfilePage'),
    };

    const chunkLoader = routeChunks[routePath];
    if (chunkLoader) {
      prefetchComponent(chunkLoader);
    }
  }, [prefetchComponent]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      timeoutRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    prefetchUrl,
    prefetchImage,
    prefetchComponent,
    prefetchOnHover,
    prefetchOnVisible,
    prefetchRoute,
    isPrefetched: (url: string) => prefetchedUrls.has(url),
  };
}

export function useLinkPrefetch() {
  const { prefetchRoute } = usePrefetch();
  
  const handleLinkHover = useCallback((routePath: string) => {
    return () => prefetchRoute(routePath);
  }, [prefetchRoute]);

  return { handleLinkHover };
}
