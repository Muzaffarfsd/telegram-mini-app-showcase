import { useEffect, useRef, useState, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  enabled = true
}: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use refs to avoid re-attaching listeners
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  // Keep refs in sync
  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    pullDistanceRef.current = pullDistance;
  }, [pullDistance]);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setPullDistance(threshold);

    try {
      await onRefreshRef.current();
    } finally {
      setTimeout(() => {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }, 400);
    }
  }, [threshold]);

  useEffect(() => {
    if (!enabled) return;

    const getScrollTop = (): number => {
      return Math.max(
        window.scrollY || 0,
        document.documentElement?.scrollTop || 0,
        document.body?.scrollTop || 0
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      
      const scrollTop = getScrollTop();
      
      // Only activate when at the very top
      if (scrollTop <= 2) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = false;
      } else {
        startYRef.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Quick exit if not at top or refreshing
      if (startYRef.current === 0 || isRefreshingRef.current) return;
      
      const scrollTop = getScrollTop();
      
      // If scrolled down, cancel
      if (scrollTop > 5) {
        isPullingRef.current = false;
        startYRef.current = 0;
        if (pullDistanceRef.current > 0) {
          setPullDistance(0);
          pullDistanceRef.current = 0;
        }
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // Must be pulling down with significant movement
      if (deltaY > 20 && scrollTop <= 2) {
        isPullingRef.current = true;
        
        // Apply elastic resistance
        const elasticDistance = Math.min(deltaY * 0.4, maxPullDistance);
        setPullDistance(elasticDistance);
        pullDistanceRef.current = elasticDistance;
        
        // Prevent default only after significant pull
        if (deltaY > 40) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current) {
        startYRef.current = 0;
        return;
      }

      const distance = pullDistanceRef.current;
      
      if (distance >= threshold && !isRefreshingRef.current) {
        triggerRefresh();
      } else {
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }

      startYRef.current = 0;
      isPullingRef.current = false;
    };

    // Attach to document with passive: true for start/end, passive: false for move
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, maxPullDistance, triggerRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = pullDistance > 0 || isRefreshing;

  return {
    pullDistance,
    isRefreshing,
    progress,
    shouldShowIndicator
  };
}
