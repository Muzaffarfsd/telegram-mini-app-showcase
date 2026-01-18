import { useEffect, useRef, useState, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  enabled?: boolean;
  containerId?: string;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  enabled = true,
  containerId
}: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const isPulling = useRef(false);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setPullDistance(threshold);

    try {
      await onRefresh();
    } finally {
      setTimeout(() => {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        setPullDistance(0);
      }, 400);
    }
  }, [onRefresh, threshold]);

  useEffect(() => {
    if (!enabled) return;

    const getContainer = (): HTMLElement | null => {
      if (containerId) {
        return document.getElementById(containerId);
      }
      return document.scrollingElement as HTMLElement || document.documentElement;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      
      const container = getContainer();
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      
      // Only activate when at the very top
      if (scrollTop <= 2) {
        startY.current = e.touches[0].clientY;
        startScrollTop.current = scrollTop;
        isPulling.current = false;
      } else {
        startY.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === 0 || isRefreshingRef.current) return;
      
      const container = getContainer();
      if (!container) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;
      const currentScrollTop = container.scrollTop;

      // Must be pulling down AND still at top
      if (deltaY > 15 && currentScrollTop <= 2) {
        isPulling.current = true;
        
        // Apply elastic resistance
        const elasticDistance = Math.min(deltaY * 0.4, maxPullDistance);
        setPullDistance(elasticDistance);
        
        // Only prevent default after significant pull to avoid blocking normal touches
        if (deltaY > 30) {
          e.preventDefault();
        }
      } else if (currentScrollTop > 5) {
        // User scrolled down, cancel pull
        isPulling.current = false;
        startY.current = 0;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) {
        startY.current = 0;
        return;
      }

      const distance = pullDistance;
      
      if (distance >= threshold && !isRefreshingRef.current) {
        triggerRefresh();
      } else {
        setPullDistance(0);
      }

      startY.current = 0;
      isPulling.current = false;
    };

    // Use container-specific listeners if possible, otherwise document
    const container = getContainer();
    const target = container || document;

    target.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
    target.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
    target.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });

    return () => {
      target.removeEventListener('touchstart', handleTouchStart as EventListener);
      target.removeEventListener('touchmove', handleTouchMove as EventListener);
      target.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [enabled, threshold, maxPullDistance, containerId, pullDistance, triggerRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = pullDistance > 0 || isRefreshing;

  return {
    pullDistance,
    isRefreshing,
    progress,
    shouldShowIndicator
  };
}
