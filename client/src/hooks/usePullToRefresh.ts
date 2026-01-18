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
  const startY = useRef(0);
  const currentPullDistance = useRef(0);
  const isRefreshingRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    currentPullDistance.current = pullDistance;
  }, [pullDistance]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!enabled || !isTouchDevice) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      // Check scroll position - use multiple methods for compatibility
      const scrollTop = Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
        document.body.scrollTop
      );
      
      if (scrollTop <= 1 && !isRefreshingRef.current) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === 0 || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      // Only pull down
      if (distance > 10) {
        e.preventDefault();

        // Apply elastic resistance
        const elasticDistance = Math.min(
          distance * 0.4,
          maxPullDistance
        );
        currentPullDistance.current = elasticDistance;
        setPullDistance(elasticDistance);
      }
    };

    const handleTouchEnd = async () => {
      const distance = currentPullDistance.current;
      
      if (distance > threshold && !isRefreshingRef.current) {
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
            currentPullDistance.current = 0;
          }, 400);
        }
      } else {
        setPullDistance(0);
        currentPullDistance.current = 0;
      }

      startY.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, maxPullDistance, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = pullDistance > 0 || isRefreshing;

  return {
    pullDistance,
    isRefreshing,
    progress,
    shouldShowIndicator
  };
}
