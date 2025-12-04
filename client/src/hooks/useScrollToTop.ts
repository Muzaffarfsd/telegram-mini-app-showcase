import { useCallback, useRef } from 'react';

/**
 * Global scroll-to-top utility for consistent navigation behavior
 * Handles both window scroll and scrollable container scroll
 */

// Standalone function for use outside React components
export function scrollToTop(container?: HTMLElement | null): void {
  // Use requestAnimationFrame for smoother execution
  requestAnimationFrame(() => {
    // Reset window scroll
    window.scrollTo({ top: 0, left: 0 });
    
    // Reset container scroll if provided
    if (container) {
      container.scrollTop = 0;
      container.scrollLeft = 0;
    }
    
    // Also try to find and reset common scrollable containers
    const scrollableSelectors = [
      '.smooth-scroll-page',
      '.overflow-auto',
      '.overflow-y-auto',
      '[data-scroll-container]',
      'main',
    ];
    
    scrollableSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el instanceof HTMLElement && el.scrollTop > 0) {
          el.scrollTop = 0;
        }
      });
    });
  });
  
  // Fallback with setTimeout for edge cases
  setTimeout(() => {
    window.scrollTo({ top: 0, left: 0 });
    if (container) {
      container.scrollTop = 0;
    }
  }, 0);
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
 * Hook that automatically scrolls to top when dependencies change
 * Useful for route changes, tab changes, etc.
 */
export function useScrollToTopOnChange(deps: any[]) {
  const { containerRef, scrollTop } = useScrollToTop();
  
  // Scroll to top whenever deps change
  // Note: This is called from useEffect in the consuming component
  const triggerScroll = useCallback(() => {
    scrollTop();
  }, [scrollTop]);
  
  return {
    containerRef,
    triggerScroll,
  };
}

export default useScrollToTop;
