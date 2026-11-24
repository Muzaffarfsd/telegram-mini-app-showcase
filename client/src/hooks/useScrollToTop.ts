import { cancelPendingPageScroll } from '@/lib/afterScrollLayout';
import { useCallback, useRef, useEffect } from 'react';

/**
 * Global scroll-to-top utility for consistent navigation behavior
 * Handles both window scroll and scrollable container scroll
 * Reset during navigation without overriding a gesture that follows it.
 */

// Each page has one scrolling element. A caller with an inner scroller supplies it explicitly.
function pageScroller(container?: HTMLElement | null) {
  return container ?? document.getElementById('root') ?? document.scrollingElement;
}

export function scrollToTop(container?: HTMLElement | null): void {
  cancelPendingPageScroll();
  const target = pageScroller(container);
  if (target && (target.scrollTop || target.scrollLeft)) {
    target.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
}

export function scrollToTopSmooth(container?: HTMLElement | null): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  pageScroller(container)?.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
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
