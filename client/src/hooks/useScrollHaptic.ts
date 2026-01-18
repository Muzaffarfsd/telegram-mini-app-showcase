import { useEffect, useRef, useCallback } from 'react';

interface ScrollHapticConfig {
  enabled?: boolean;
  respectReducedMotion?: boolean;
  tickThreshold?: number;
  momentumThreshold?: number;
  cooldownMs?: number;
  edgeBounce?: boolean;
  selectionTicks?: boolean;
}

const defaultConfig: ScrollHapticConfig = {
  enabled: true,
  respectReducedMotion: true,
  tickThreshold: 25,
  momentumThreshold: 80,
  cooldownMs: 40,
  edgeBounce: true,
  selectionTicks: false,
};

type HapticIntensity = 'selection' | 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

interface ScrollState {
  position: number;
  velocity: number;
  acceleration: number;
  direction: 'up' | 'down' | 'idle';
  isAtEdge: boolean;
  isMomentum: boolean;
  lastTickPosition: number;
  lastHapticTime: number;
  velocityHistory: number[];
  positionHistory: number[];
  timeHistory: number[];
}

export function useScrollHaptic(config: ScrollHapticConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const isEnabledRef = useRef(settings.enabled);
  const rafIdRef = useRef<number | null>(null);
  const scrollStateRef = useRef<ScrollState>({
    position: 0,
    velocity: 0,
    acceleration: 0,
    direction: 'idle',
    isAtEdge: false,
    isMomentum: false,
    lastTickPosition: 0,
    lastHapticTime: 0,
    velocityHistory: [],
    positionHistory: [],
    timeHistory: [],
  });

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' 
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches 
      : false
  );

  const isTelegramAvailable = useCallback((): boolean => {
    try {
      const webApp = window.Telegram?.WebApp;
      if (!webApp?.HapticFeedback) return false;
      // HapticFeedback requires version 6.1+
      const version = parseFloat((webApp as any).version || '0');
      return version >= 6.1;
    } catch {
      return false;
    }
  }, []);

  const triggerHaptic = useCallback((intensity: HapticIntensity = 'light') => {
    if (!isEnabledRef.current) return;
    if (settings.respectReducedMotion && prefersReducedMotion.current) return;

    try {
      if (isTelegramAvailable() && window.Telegram?.WebApp?.HapticFeedback) {
        const haptic = window.Telegram.WebApp.HapticFeedback;
        
        switch (intensity) {
          case 'selection':
            haptic.selectionChanged();
            break;
          case 'light':
            haptic.impactOccurred('light');
            break;
          case 'medium':
            haptic.impactOccurred('medium');
            break;
          case 'heavy':
            haptic.impactOccurred('heavy');
            break;
          case 'rigid':
            haptic.impactOccurred('heavy');
            break;
          case 'soft':
            haptic.impactOccurred('light');
            break;
        }
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const patterns: Record<HapticIntensity, number | number[]> = {
          selection: 2,
          light: 4,
          medium: 8,
          heavy: 15,
          rigid: [8, 5, 12],
          soft: 3,
        };
        navigator.vibrate(patterns[intensity]);
      }
    } catch (error) {
      // Silent fail
    }
  }, [isTelegramAvailable, settings.respectReducedMotion]);

  const triggerEdgeBounce = useCallback((edge: 'top' | 'bottom') => {
    if (!isEnabledRef.current || !settings.edgeBounce) return;
    if (settings.respectReducedMotion && prefersReducedMotion.current) return;

    try {
      if (isTelegramAvailable() && window.Telegram?.WebApp?.HapticFeedback) {
        const haptic = window.Telegram.WebApp.HapticFeedback;
        
        // Premium iOS-style cascade: heavy → medium → light fade
        // Creates expensive "thunk" feeling like hitting a physical boundary
        haptic.impactOccurred('heavy');
        
        setTimeout(() => {
          haptic.impactOccurred('heavy');
        }, 20);
        
        setTimeout(() => {
          haptic.impactOccurred('medium');
        }, 50);
        
        setTimeout(() => {
          haptic.impactOccurred('light');
        }, 85);
        
        setTimeout(() => {
          haptic.impactOccurred('light');
        }, 120);
        
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        // Premium pattern: strong hit → decay ripples
        navigator.vibrate([18, 12, 14, 15, 10, 18, 6, 20, 3]);
      }
    } catch (error) {
      // Silent fail
    }
  }, [isTelegramAvailable, settings.edgeBounce, settings.respectReducedMotion]);

  const triggerRubberBand = useCallback((intensity: number) => {
    if (!isEnabledRef.current) return;
    if (settings.respectReducedMotion && prefersReducedMotion.current) return;

    const clampedIntensity = Math.min(Math.max(intensity, 0), 1);
    
    try {
      if (isTelegramAvailable() && window.Telegram?.WebApp?.HapticFeedback) {
        const haptic = window.Telegram.WebApp.HapticFeedback;
        if (clampedIntensity > 0.7) {
          haptic.impactOccurred('heavy');
        } else if (clampedIntensity > 0.4) {
          haptic.impactOccurred('medium');
        } else {
          haptic.impactOccurred('light');
        }
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration = Math.round(3 + clampedIntensity * 12);
        navigator.vibrate(duration);
      }
    } catch (error) {
      // Silent fail
    }
  }, [isTelegramAvailable, settings.respectReducedMotion]);

  const calculateScrollMetrics = useCallback((currentPosition: number, currentTime: number): void => {
    const state = scrollStateRef.current;
    const historyLength = 5;
    
    state.positionHistory.push(currentPosition);
    state.timeHistory.push(currentTime);
    
    if (state.positionHistory.length > historyLength) {
      state.positionHistory.shift();
      state.timeHistory.shift();
    }
    
    if (state.positionHistory.length >= 2) {
      const len = state.positionHistory.length;
      const dt = (state.timeHistory[len - 1] - state.timeHistory[len - 2]) / 1000;
      const dp = state.positionHistory[len - 1] - state.positionHistory[len - 2];
      
      if (dt > 0) {
        const newVelocity = dp / dt;
        const oldVelocity = state.velocity;
        state.velocity = newVelocity;
        state.acceleration = (newVelocity - oldVelocity) / dt;
        
        state.velocityHistory.push(Math.abs(newVelocity));
        if (state.velocityHistory.length > historyLength) {
          state.velocityHistory.shift();
        }
      }
    }
    
    const delta = currentPosition - state.position;
    if (Math.abs(delta) > 1) {
      state.direction = delta > 0 ? 'down' : 'up';
    }
    
    const avgVelocity = state.velocityHistory.length > 0
      ? state.velocityHistory.reduce((a, b) => a + b, 0) / state.velocityHistory.length
      : 0;
    state.isMomentum = avgVelocity > (settings.momentumThreshold ?? 80) * 10;
    
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    state.isAtEdge = currentPosition <= 0 || currentPosition >= maxScroll;
    
    state.position = currentPosition;
  }, [settings.momentumThreshold]);

  const determineHapticType = useCallback((): HapticIntensity | null => {
    const state = scrollStateRef.current;
    const avgVelocity = state.velocityHistory.length > 0
      ? state.velocityHistory.reduce((a, b) => a + b, 0) / state.velocityHistory.length
      : 0;

    if (state.isMomentum) {
      if (avgVelocity > 3000) return 'heavy';
      if (avgVelocity > 1500) return 'medium';
      return 'light';
    }

    if (settings.selectionTicks) {
      if (avgVelocity > 800) return 'light';
      if (avgVelocity > 300) return 'soft';
      return 'selection';
    }

    return 'light';
  }, [settings.selectionTicks]);

  useEffect(() => {
    isEnabledRef.current = settings.enabled;
  }, [settings.enabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mediaQuery) {
      prefersReducedMotion.current = mediaQuery.matches;
      
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotion.current = e.matches;
      };
      
      mediaQuery.addEventListener?.('change', handler);
      return () => mediaQuery.removeEventListener?.('change', handler);
    }
  }, []);

  useEffect(() => {
    if (!settings.enabled) return;

    let ticking = false;
    let wasAtTop = true;
    let wasAtBottom = false;
    let lastTouchY = 0;

    // Find scrollable container - check for data-scroll="main" or use document
    const getScrollContainer = (): HTMLElement | Window => {
      const mainScroll = document.querySelector('[data-scroll="main"]') as HTMLElement;
      if (mainScroll) return mainScroll;
      return window;
    };

    const getScrollPosition = (container: HTMLElement | Window): number => {
      if (container === window) {
        return window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      }
      return (container as HTMLElement).scrollTop;
    };

    const getMaxScroll = (container: HTMLElement | Window): number => {
      if (container === window) {
        return document.documentElement.scrollHeight - window.innerHeight;
      }
      const el = container as HTMLElement;
      return el.scrollHeight - el.clientHeight;
    };

    const handleScrollFrame = () => {
      ticking = false;
      
      const container = getScrollContainer();
      const now = performance.now();
      const currentScroll = getScrollPosition(container);
      const state = scrollStateRef.current;
      
      calculateScrollMetrics(currentScroll, now);
      
      const maxScroll = getMaxScroll(container);
      const isAtTop = currentScroll <= 0;
      const isAtBottom = currentScroll >= maxScroll - 1;
      
      if (isAtTop && !wasAtTop && state.direction === 'up') {
        triggerEdgeBounce('top');
        state.lastHapticTime = now;
        state.velocityHistory = [];
      } else if (isAtBottom && !wasAtBottom && state.direction === 'down') {
        triggerEdgeBounce('bottom');
        state.lastHapticTime = now;
        state.velocityHistory = [];
      }
      
      wasAtTop = isAtTop;
      wasAtBottom = isAtBottom;
      
      // Scroll tick haptics for premium feel
      const distanceSinceLastTick = Math.abs(currentScroll - state.lastTickPosition);
      const timeSinceLastHaptic = now - state.lastHapticTime;
      
      if (distanceSinceLastTick >= (settings.tickThreshold ?? 25) && timeSinceLastHaptic > (settings.cooldownMs ?? 40)) {
        const hapticType = determineHapticType();
        if (hapticType && settings.selectionTicks) {
          triggerHaptic(hapticType);
          state.lastHapticTime = now;
        }
        state.lastTickPosition = currentScroll;
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        rafIdRef.current = requestAnimationFrame(handleScrollFrame);
        ticking = true;
      }
    };

    // Touch-based scroll detection for mobile (more reliable in Telegram)
    let overscrollAmount = 0;
    let touchScrollDistance = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
      touchScrollDistance = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentTouchY = e.touches[0]?.clientY ?? 0;
      const deltaY = lastTouchY - currentTouchY;
      lastTouchY = currentTouchY;
      
      touchScrollDistance += Math.abs(deltaY);
      
      const container = getScrollContainer();
      const currentScroll = getScrollPosition(container);
      const maxScroll = getMaxScroll(container);
      
      // Detect pulling at top (scrolling up when at top)
      const isPullingAtTop = currentScroll <= 0 && deltaY < -5;
      // Detect pulling at bottom (scrolling down when at bottom)  
      const isPullingAtBottom = currentScroll >= maxScroll - 2 && deltaY > 5;
      
      // Edge bounce detection - trigger immediately on overscroll attempt
      if (isPullingAtTop || isPullingAtBottom) {
        overscrollAmount = Math.min(overscrollAmount + 3, 50);
        // Trigger haptic on first overscroll detection
        if (overscrollAmount === 3) {
          triggerEdgeBounce(isPullingAtTop ? 'top' : 'bottom');
        } else if (overscrollAmount % 20 === 0) {
          triggerRubberBand(overscrollAmount / 50);
        }
      } else if (currentScroll > 0 && currentScroll < maxScroll - 2) {
        overscrollAmount = 0;
      }
      
      // Reset touch distance tracking (haptic on scroll disabled - only edge bounce)
      if (touchScrollDistance >= (settings.tickThreshold ?? 25)) {
        touchScrollDistance = 0;
      }
    };

    const handleTouchEnd = () => {
      overscrollAmount = 0;
      touchScrollDistance = 0;
    };

    // Add listeners to both window and scroll container
    const container = getScrollContainer();
    
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    if (container !== window) {
      (container as HTMLElement).addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Touch events for mobile
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      if (container !== window) {
        (container as HTMLElement).removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [
    settings.enabled,
    settings.tickThreshold,
    settings.cooldownMs,
    calculateScrollMetrics,
    determineHapticType,
    triggerHaptic,
    triggerEdgeBounce,
    triggerRubberBand,
  ]);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
    try {
      localStorage.setItem('scroll-haptic-enabled', JSON.stringify(enabled));
    } catch {
      // Storage unavailable
    }
  }, []);

  const getEnabled = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem('scroll-haptic-enabled');
      if (saved !== null) {
        return JSON.parse(saved) as boolean;
      }
    } catch {
      // Storage unavailable
    }
    return true;
  }, []);

  return {
    triggerHaptic,
    triggerEdgeBounce,
    triggerRubberBand,
    setEnabled,
    getEnabled,
    isReducedMotion: prefersReducedMotion.current,
  };
}
