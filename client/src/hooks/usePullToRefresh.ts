import { useEffect, useRef, useState } from 'react';

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
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Only activate on touch-capable devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!enabled || !isTouchDevice) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate pull-to-refresh when scrolled to top
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop === 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === 0 || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      // Only pull down and only prevent if actively pulling
      if (distance > threshold * 0.3) {
        // Only prevent default when actually engaging the gesture
        e.preventDefault();

        // Apply elastic resistance
        const elasticDistance = Math.min(
          distance * 0.5,
          maxPullDistance
        );
        setPullDistance(elasticDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(threshold); // Keep indicator visible during refresh

        // Haptic feedback
        if (window.navigator.vibrate) {
          window.navigator.vibrate(20);
        }

        try {
          await onRefresh();
        } finally {
          // Reset after refresh
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 500);
        }
      } else {
        // Reset if didn't reach threshold
        setPullDistance(0);
      }

      startY.current = 0;
    };

    // Use passive listeners where possible
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false }); // Can't be passive - needs preventDefault
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isRefreshing, pullDistance, threshold, maxPullDistance, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = pullDistance > 0 || isRefreshing;

  return {
    pullDistance,
    isRefreshing,
    progress,
    shouldShowIndicator,
    containerRef
  };
}
