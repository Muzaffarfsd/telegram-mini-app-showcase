import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  scrollElement?: HTMLElement | null;
}

interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

export function useListVirtualization<T>(
  items: T[],
  config: VirtualizationConfig
) {
  const { itemHeight, containerHeight, overscan = 3, scrollElement } = config;
  
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement | null>(scrollElement || null);

  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const virtualItems = useMemo((): VirtualItem[] => {
    const result: VirtualItem[] = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      result.push({
        index: i,
        start: i * itemHeight,
        size: itemHeight,
      });
    }
    
    return result;
  }, [visibleRange, itemHeight]);

  const getItemStyle = useCallback((index: number): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: itemHeight,
    transform: `translateY(${index * itemHeight}px)`,
    willChange: 'transform',
  }), [itemHeight]);

  const containerStyle = useMemo((): React.CSSProperties => ({
    position: 'relative',
    height: totalHeight,
    width: '100%',
  }), [totalHeight]);

  useEffect(() => {
    const element = scrollElementRef.current || scrollElement;
    
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (element) {
            setScrollTop(element.scrollTop);
          } else {
            setScrollTop(window.scrollY || window.pageYOffset || 0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
      return () => element.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [scrollElement]);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const element = scrollElementRef.current || scrollElement;
    if (!element) return;

    const targetTop = index * itemHeight;
    element.scrollTo({ top: targetTop, behavior });
  }, [scrollElement, itemHeight]);

  const getVisibleItems = useCallback((): T[] => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  return {
    virtualItems,
    totalHeight,
    containerStyle,
    getItemStyle,
    scrollToIndex,
    getVisibleItems,
    visibleRange,
    isItemVisible: (index: number) => 
      index >= visibleRange.startIndex && index <= visibleRange.endIndex,
  };
}

export function useWindowVirtualization<T>(
  items: T[],
  itemHeight: number,
  overscan: number = 5
) {
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return useListVirtualization(items, {
    itemHeight,
    containerHeight: windowHeight,
    overscan,
  });
}
