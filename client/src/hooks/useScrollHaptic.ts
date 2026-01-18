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

    // Only use scroll events for edge detection - no touch handlers
    // This avoids conflicts with pull-to-refresh
    let lastScrollTop = 0;
    let scrollDirection: 'up' | 'down' | null = null;
    let wasAtTop = true;
    let wasAtBottom = false;

    const handleScroll = () => {
      const container = getScrollContainer();
      if (!container) return;

      const currentScrollTop = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;

      // Determine scroll direction with threshold
      if (currentScrollTop > lastScrollTop + 3) {
        scrollDirection = 'down';
      } else if (currentScrollTop < lastScrollTop - 3) {
        scrollDirection = 'up';
      }

      const isAtTop = currentScrollTop <= 0;
      const isAtBottom = currentScrollTop >= maxScroll - 1;

      // Hit top edge while scrolling up (was not at top before)
      if (isAtTop && !wasAtTop && scrollDirection === 'up') {
        triggerEdgeBounce();
      }

      // Hit bottom edge while scrolling down (was not at bottom before)
      if (isAtBottom && !wasAtBottom && scrollDirection === 'down') {
        triggerEdgeBounce();
      }

      wasAtTop = isAtTop;
      wasAtBottom = isAtBottom;
      lastScrollTop = currentScrollTop;
    };

    const container = getScrollContainer();
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
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
