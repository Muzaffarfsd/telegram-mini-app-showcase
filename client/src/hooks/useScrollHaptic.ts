import { useEffect, useRef, useCallback } from 'react';

interface ScrollHapticConfig {
  enabled?: boolean;
  edgeBounce?: boolean;
  scrollContainerId?: string;
}

const defaultConfig: ScrollHapticConfig = {
  enabled: true,
  edgeBounce: true,
};

export function useScrollHaptic(config: ScrollHapticConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const isEnabledRef = useRef(settings.enabled);
  
  // Edge detection state
  const lastTriggerTimeRef = useRef(0);
  const wasAtTopRef = useRef(true);
  const wasAtBottomRef = useRef(false);
  const overscrollCountRef = useRef(0);

  const isTelegramAvailable = useCallback((): boolean => {
    try {
      const webApp = window.Telegram?.WebApp;
      if (!webApp?.HapticFeedback) return false;
      const version = parseFloat((webApp as any).version || '0');
      return version >= 6.1;
    } catch {
      return false;
    }
  }, []);

  const triggerEdgeBounce = useCallback(() => {
    if (!isEnabledRef.current || !settings.edgeBounce) return;
    
    const now = Date.now();
    // Cooldown 500ms between edge bounces
    if (now - lastTriggerTimeRef.current < 500) return;
    lastTriggerTimeRef.current = now;

    try {
      if (isTelegramAvailable() && window.Telegram?.WebApp?.HapticFeedback) {
        const haptic = window.Telegram.WebApp.HapticFeedback;
        // Single strong impact for edge hit
        haptic.impactOccurred('heavy');
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch {
      // Silent fail
    }
  }, [isTelegramAvailable, settings.edgeBounce]);

  useEffect(() => {
    if (!settings.enabled) return;
    isEnabledRef.current = settings.enabled;

    const getScrollContainer = (): HTMLElement | null => {
      if (settings.scrollContainerId) {
        return document.getElementById(settings.scrollContainerId);
      }
      return document.scrollingElement as HTMLElement || document.documentElement;
    };

    let touchStartY = 0;
    let initialScrollTop = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
      const container = getScrollContainer();
      initialScrollTop = container?.scrollTop ?? 0;
      overscrollCountRef.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const container = getScrollContainer();
      if (!container) return;

      const currentTouchY = e.touches[0]?.clientY ?? 0;
      const deltaY = touchStartY - currentTouchY; // positive = scrolling down, negative = scrolling up
      const currentScrollTop = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;

      // Only detect REAL overscroll - when user tries to scroll past the edge
      // Check if we're at the top and trying to scroll up (pull down)
      const isAtTop = currentScrollTop <= 0;
      const isPullingDown = deltaY < -30; // Significant pull threshold
      
      // Check if we're at the bottom and trying to scroll down (pull up)
      const isAtBottom = currentScrollTop >= maxScroll - 1;
      const isPullingUp = deltaY > 30; // Significant pull threshold

      // Top edge bounce
      if (isAtTop && isPullingDown && !wasAtTopRef.current) {
        overscrollCountRef.current++;
        if (overscrollCountRef.current >= 2) {
          triggerEdgeBounce();
          overscrollCountRef.current = 0;
        }
      }

      // Bottom edge bounce  
      if (isAtBottom && isPullingUp && !wasAtBottomRef.current) {
        overscrollCountRef.current++;
        if (overscrollCountRef.current >= 2) {
          triggerEdgeBounce();
          overscrollCountRef.current = 0;
        }
      }

      // Track edge states
      wasAtTopRef.current = isAtTop && initialScrollTop <= 0;
      wasAtBottomRef.current = isAtBottom && initialScrollTop >= maxScroll - 1;
    };

    const handleTouchEnd = () => {
      overscrollCountRef.current = 0;
    };

    // Also detect edge hit via scroll events (for when user flicks to edge)
    let lastScrollTop = 0;
    let scrollDirection: 'up' | 'down' | null = null;

    const handleScroll = () => {
      const container = getScrollContainer();
      if (!container) return;

      const currentScrollTop = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;

      // Determine scroll direction
      if (currentScrollTop > lastScrollTop + 2) {
        scrollDirection = 'down';
      } else if (currentScrollTop < lastScrollTop - 2) {
        scrollDirection = 'up';
      }

      // Hit top edge while scrolling up
      if (currentScrollTop <= 0 && scrollDirection === 'up' && lastScrollTop > 5) {
        triggerEdgeBounce();
      }

      // Hit bottom edge while scrolling down
      if (currentScrollTop >= maxScroll - 1 && scrollDirection === 'down' && lastScrollTop < maxScroll - 5) {
        triggerEdgeBounce();
      }

      lastScrollTop = currentScrollTop;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    const container = getScrollContainer();
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [settings.enabled, settings.scrollContainerId, triggerEdgeBounce]);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  return {
    setEnabled,
    triggerEdgeBounce,
  };
}
