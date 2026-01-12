import { useEffect, useRef } from 'react';

interface CriticalCSSConfig {
  preloadFonts?: string[];
  preconnectOrigins?: string[];
  prefetchAssets?: string[];
}

const defaultConfig: CriticalCSSConfig = {
  preloadFonts: [],
  preconnectOrigins: [
    'https://api.fontshare.com',
    'https://images.unsplash.com',
  ],
  prefetchAssets: [],
};

export function useCriticalCSS(config: CriticalCSSConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const head = document.head;

    settings.preconnectOrigins?.forEach(origin => {
      if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        head.appendChild(link);
      }
    });

    settings.preloadFonts?.forEach(font => {
      if (!document.querySelector(`link[rel="preload"][href="${font}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        head.appendChild(link);
      }
    });

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        settings.prefetchAssets?.forEach(asset => {
          if (!document.querySelector(`link[rel="prefetch"][href="${asset}"]`)) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = asset;
            head.appendChild(link);
          }
        });
      }, { timeout: 3000 });
    }
  }, [settings.preconnectOrigins, settings.preloadFonts, settings.prefetchAssets]);
}

export function injectCriticalStyles() {
  const criticalCSS = `
    :root {
      --lcp-image-priority: high;
    }
    
    img[loading="eager"],
    img[fetchpriority="high"] {
      content-visibility: visible !important;
    }
    
    .lcp-element {
      content-visibility: visible !important;
      contain-intrinsic-size: auto 300px;
    }
    
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    .gpu-accelerated {
      transform: translateZ(0);
      will-change: transform;
      backface-visibility: hidden;
    }
    
    .instant-tap {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    
    .smooth-scroll {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
    }
  `;

  const existingStyle = document.getElementById('critical-css');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }
}

export function markLCPElement(element: HTMLElement | null) {
  if (!element) return;
  
  element.classList.add('lcp-element');
  
  if (element.tagName === 'IMG') {
    (element as HTMLImageElement).loading = 'eager';
    (element as HTMLImageElement).fetchPriority = 'high';
    (element as HTMLImageElement).decoding = 'async';
  }
}

export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
