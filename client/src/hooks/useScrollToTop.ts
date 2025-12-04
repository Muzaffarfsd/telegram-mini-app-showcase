import { useCallback, useRef, useEffect } from 'react';

/**
 * Global scroll-to-top utility for consistent navigation behavior
 * Handles both window scroll and scrollable container scroll
 * Aggressive implementation to work with Telegram WebApp scroll preservation
 */

// Force scroll to top - aggressive version for Telegram WebApp
function forceScrollToTop(): void {
  // Immediate scroll - no delay
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  
  // Reset all possible scrollable containers
  const scrollableSelectors = [
    '.smooth-scroll-page',
    '.overflow-auto',
    '.overflow-y-auto',
    '.overflow-scroll',
    '[data-scroll-container]',
    '[data-scroll="main"]',
    'main',
    '#root',
    '.min-h-screen',
  ];
  
  scrollableSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.scrollTop = 0;
        }
      });
    } catch (e) {
      // Ignore selector errors
    }
  });
}

// Standalone function for use outside React components
export function scrollToTop(container?: HTMLElement | null): void {
  // Immediate scroll first
  forceScrollToTop();
  
  // Reset container scroll if provided
  if (container) {
    container.scrollTop = 0;
    container.scrollLeft = 0;
  }
  
  // Use requestAnimationFrame for after-render scroll
  requestAnimationFrame(() => {
    forceScrollToTop();
    if (container) {
      container.scrollTop = 0;
    }
  });
  
  // Multiple fallbacks with different timings for Telegram WebApp
  setTimeout(() => {
    forceScrollToTop();
    if (container) {
      container.scrollTop = 0;
    }
  }, 0);
  
  setTimeout(() => {
    forceScrollToTop();
    if (container) {
      container.scrollTop = 0;
    }
  }, 50);
  
  setTimeout(() => {
    forceScrollToTop();
    if (container) {
      container.scrollTop = 0;
    }
  }, 100);
}

// Scroll to top with animation option
export function scrollToTopSmooth(container?: HTMLElement | null): void {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    if (container) {
      container.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  });
}

/**
 * React hook for scroll-to-top functionality
 * Returns a ref to attach to scrollable container and scroll functions
 */
export function useScrollToTop<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null);
  
  const scrollTop = useCallback(() => {
    scrollToTop(containerRef.current);
  }, []);
  
  const scrollTopSmooth = useCallback(() => {
    scrollToTopSmooth(containerRef.current);
  }, []);
  
  return {
    containerRef,
    scrollTop,
    scrollTopSmooth,
  };
}

/**
 * Hook that automatically scrolls to top on mount
 * Use this in page components
 */
export function useScrollToTopOnMount() {
  useEffect(() => {
    scrollToTop();
  }, []);
}

/**
 * Hook that automatically scrolls to top when dependencies change
 * Useful for route changes, tab changes, etc.
 */
export function useScrollToTopOnChange(deps: any[]) {
  const { containerRef, scrollTop } = useScrollToTop();
  
  useEffect(() => {
    scrollTop();
  }, deps);
  
  return {
    containerRef,
  };
}

export default useScrollToTop;
