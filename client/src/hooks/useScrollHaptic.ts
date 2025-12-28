import { useEffect, useRef, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';

interface ScrollHapticConfig {
  enabled?: boolean;
  scrollThreshold?: number;
  cooldownMs?: number;
}

const defaultConfig: ScrollHapticConfig = {
  enabled: true,
  scrollThreshold: 35,
  cooldownMs: 50,
};

export function useScrollHaptic(config: ScrollHapticConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const lastScrollRef = useRef(0);
  const lastHapticTimeRef = useRef(0);
  const isEnabledRef = useRef(settings.enabled);
  const scrollDirectionRef = useRef<'up' | 'down'>('down');
  const velocityHistoryRef = useRef<number[]>([]);
  const lastScrollTimeRef = useRef(0);

  const isTelegramAvailable = useCallback(() => {
    try {
      return !!(window.Telegram?.WebApp?.HapticFeedback);
    } catch {
      return false;
    }
  }, []);

  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isEnabledRef.current) return;

    try {
      if (isTelegramAvailable() && window.Telegram?.WebApp?.HapticFeedback) {
        const haptic = window.Telegram.WebApp.HapticFeedback;
        if (intensity === 'light') {
          haptic.impactOccurred('light');
        } else if (intensity === 'medium') {
          haptic.impactOccurred('medium');
        } else {
          haptic.impactOccurred('heavy');
        }
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const patterns = {
          light: 5,
          medium: 10,
          heavy: 20,
        };
        navigator.vibrate(patterns[intensity]);
      }
    } catch (error) {
      console.debug('[ScrollHaptic] Haptic feedback failed:', error);
    }
  }, [isTelegramAvailable]);

  const triggerBounce = useCallback(() => {
    if (!isEnabledRef.current) return;

    try {
      if (isTelegramAvailable() && window.Telegram?.WebApp?.HapticFeedback) {
        const haptic = window.Telegram.WebApp.HapticFeedback;
        haptic.impactOccurred('heavy');
        setTimeout(() => haptic.impactOccurred('medium'), 30);
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([15, 30, 25]);
      }
    } catch (error) {
      console.debug('[ScrollHaptic] Bounce haptic failed:', error);
    }
  }, [isTelegramAvailable]);

  const triggerSelection = useCallback(() => {
    if (!isEnabledRef.current) return;

    try {
      if (isTelegramAvailable() && window.Telegram?.WebApp?.HapticFeedback) {
        const haptic = window.Telegram.WebApp.HapticFeedback;
        haptic.selectionChanged();
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(3);
      }
    } catch (error) {
      console.debug('[ScrollHaptic] Selection haptic failed:', error);
    }
  }, [isTelegramAvailable]);

  useEffect(() => {
    isEnabledRef.current = settings.enabled;
  }, [settings.enabled]);

  useEffect(() => {
    if (!settings.enabled) return;

    const handleScroll = () => {
      const now = Date.now();
      const currentScroll = window.scrollY;
      const scrollDelta = currentScroll - lastScrollRef.current;
      const absDelta = Math.abs(scrollDelta);
      const timeDelta = now - lastScrollTimeRef.current;

      if (scrollDelta > 0) {
        scrollDirectionRef.current = 'down';
      } else if (scrollDelta < 0) {
        scrollDirectionRef.current = 'up';
      }

      if (timeDelta > 0) {
        const velocity = absDelta / timeDelta;
        velocityHistoryRef.current.push(velocity);
        if (velocityHistoryRef.current.length > 5) {
          velocityHistoryRef.current.shift();
        }
      }
      lastScrollTimeRef.current = now;

      if (now - lastHapticTimeRef.current < (settings.cooldownMs ?? 50)) {
        lastScrollRef.current = currentScroll;
        return;
      }

      if (absDelta >= (settings.scrollThreshold ?? 35)) {
        const avgVelocity = velocityHistoryRef.current.reduce((a, b) => a + b, 0) / 
          (velocityHistoryRef.current.length || 1);
        
        const intensity = avgVelocity > 3 ? 'heavy' : avgVelocity > 1.5 ? 'medium' : 'light';
        triggerHaptic(intensity);
        lastHapticTimeRef.current = now;
        lastScrollRef.current = currentScroll;
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentScroll <= 0 && lastScrollRef.current > 5) {
        triggerBounce();
        velocityHistoryRef.current = [];
      } else if (currentScroll >= maxScroll - 5 && lastScrollRef.current < maxScroll - 10) {
        triggerBounce();
        velocityHistoryRef.current = [];
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [settings.enabled, settings.scrollThreshold, settings.cooldownMs, triggerHaptic, triggerBounce]);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
    localStorage.setItem('scroll-haptic-enabled', JSON.stringify(enabled));
  }, []);

  const getEnabled = useCallback(() => {
    const saved = localStorage.getItem('scroll-haptic-enabled');
    if (saved !== null) {
      try {
        return JSON.parse(saved) as boolean;
      } catch {
        return true;
      }
    }
    return true;
  }, []);

  return {
    triggerHaptic,
    triggerBounce,
    triggerSelection,
    setEnabled,
    getEnabled,
  };
}
