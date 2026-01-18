import { useState, useEffect, useMemo } from 'react';
import WebApp from '@twa-dev/sdk';

export type PerformanceClass = 'high' | 'medium' | 'low';

interface PerformanceMetrics {
  hardwareConcurrency: number;
  deviceMemory: number | null;
  connectionType: string | null;
  platform: string;
  isTouch: boolean;
  screenWidth: number;
  pixelRatio: number;
}

interface UsePerformanceClassResult {
  performanceClass: PerformanceClass;
  shouldReduceMotion: boolean;
  isLowEnd: boolean;
  isHighEnd: boolean;
  metrics: PerformanceMetrics;
  capabilities: {
    supportsWebGL: boolean;
    supportsHeavyAnimations: boolean;
    supportsParallax: boolean;
    supportsBlur: boolean;
    supportsVideoBackground: boolean;
    maxParticles: number;
    animationFPS: number;
  };
}

function getDeviceMemory(): number | null {
  if ('deviceMemory' in navigator) {
    return (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;
  }
  return null;
}

function getConnectionType(): string | null {
  if ('connection' in navigator) {
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    return connection?.effectiveType ?? null;
  }
  return null;
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function checkReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getTelegramPlatform(): string {
  try {
    return WebApp.platform || 'unknown';
  } catch {
    return 'unknown';
  }
}

function calculatePerformanceClass(metrics: PerformanceMetrics): PerformanceClass {
  let score = 0;

  if (metrics.hardwareConcurrency >= 8) score += 3;
  else if (metrics.hardwareConcurrency >= 4) score += 2;
  else if (metrics.hardwareConcurrency >= 2) score += 1;

  if (metrics.deviceMemory !== null) {
    if (metrics.deviceMemory >= 8) score += 3;
    else if (metrics.deviceMemory >= 4) score += 2;
    else if (metrics.deviceMemory >= 2) score += 1;
  }

  const platform = metrics.platform.toLowerCase();
  if (platform === 'ios' || platform === 'macos') {
    score += 2;
  } else if (platform === 'android') {
    if (metrics.deviceMemory && metrics.deviceMemory >= 6) score += 1;
  }

  if (metrics.connectionType === '4g') score += 1;
  else if (metrics.connectionType === '3g') score -= 1;
  else if (metrics.connectionType === '2g' || metrics.connectionType === 'slow-2g') score -= 2;

  if (metrics.screenWidth >= 1200 && metrics.pixelRatio >= 2) score += 1;
  if (metrics.screenWidth < 375) score -= 1;

  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

export function usePerformanceClass(): UsePerformanceClassResult {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(checkReducedMotion);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const metrics = useMemo<PerformanceMetrics>(() => ({
    hardwareConcurrency: navigator.hardwareConcurrency || 2,
    deviceMemory: getDeviceMemory(),
    connectionType: getConnectionType(),
    platform: getTelegramPlatform(),
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenWidth: window.screen.width,
    pixelRatio: window.devicePixelRatio || 1,
  }), []);

  const performanceClass = useMemo(() => calculatePerformanceClass(metrics), [metrics]);

  const isLowEnd = performanceClass === 'low';
  const isHighEnd = performanceClass === 'high';
  const shouldReduceMotion = prefersReducedMotion || isLowEnd;

  const capabilities = useMemo(() => {
    const supportsWebGL = checkWebGLSupport();

    switch (performanceClass) {
      case 'high':
        return {
          supportsWebGL,
          supportsHeavyAnimations: !prefersReducedMotion,
          supportsParallax: !prefersReducedMotion,
          supportsBlur: true,
          supportsVideoBackground: true,
          maxParticles: 150,
          animationFPS: 60,
        };
      case 'medium':
        return {
          supportsWebGL,
          supportsHeavyAnimations: !prefersReducedMotion,
          supportsParallax: !prefersReducedMotion,
          supportsBlur: true,
          supportsVideoBackground: false,
          maxParticles: 50,
          animationFPS: 30,
        };
      case 'low':
      default:
        return {
          supportsWebGL: false,
          supportsHeavyAnimations: false,
          supportsParallax: false,
          supportsBlur: false,
          supportsVideoBackground: false,
          maxParticles: 10,
          animationFPS: 15,
        };
    }
  }, [performanceClass, prefersReducedMotion]);

  return {
    performanceClass,
    shouldReduceMotion,
    isLowEnd,
    isHighEnd,
    metrics,
    capabilities,
  };
}

export function useAdaptiveAnimationDuration(
  baseDuration: number,
  options?: { min?: number; max?: number }
): number {
  const { performanceClass, shouldReduceMotion } = usePerformanceClass();
  
  return useMemo(() => {
    if (shouldReduceMotion) return 0;

    const min = options?.min ?? 50;
    const max = options?.max ?? baseDuration * 2;

    let duration: number;
    switch (performanceClass) {
      case 'high':
        duration = baseDuration;
        break;
      case 'medium':
        duration = baseDuration * 0.7;
        break;
      case 'low':
        duration = baseDuration * 0.3;
        break;
      default:
        duration = baseDuration;
    }

    return Math.max(min, Math.min(max, duration));
  }, [baseDuration, performanceClass, shouldReduceMotion, options?.min, options?.max]);
}

export function useAdaptiveDebounce(baseDelay: number): number {
  const { performanceClass } = usePerformanceClass();
  
  return useMemo(() => {
    switch (performanceClass) {
      case 'high':
        return baseDelay;
      case 'medium':
        return baseDelay * 1.5;
      case 'low':
        return baseDelay * 2;
      default:
        return baseDelay;
    }
  }, [baseDelay, performanceClass]);
}

export function useAdaptiveImageQuality(): {
  quality: 'high' | 'medium' | 'low';
  maxWidth: number;
  shouldLazyLoad: boolean;
} {
  const { performanceClass, metrics } = usePerformanceClass();

  return useMemo(() => {
    switch (performanceClass) {
      case 'high':
        return {
          quality: 'high',
          maxWidth: Math.min(metrics.screenWidth * metrics.pixelRatio, 2048),
          shouldLazyLoad: false,
        };
      case 'medium':
        return {
          quality: 'medium',
          maxWidth: Math.min(metrics.screenWidth * metrics.pixelRatio, 1024),
          shouldLazyLoad: true,
        };
      case 'low':
      default:
        return {
          quality: 'low',
          maxWidth: Math.min(metrics.screenWidth, 640),
          shouldLazyLoad: true,
        };
    }
  }, [performanceClass, metrics]);
}
