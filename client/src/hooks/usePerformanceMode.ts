import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  isLowEndDevice: boolean;
  isSlowNetwork: boolean;
  isReducedMotion: boolean;
  deviceMemory: number | null;
  hardwareConcurrency: number;
  connectionType: string | null;
  effectiveType: string | null;
  saveData: boolean;
}

interface PerformanceMode {
  isLowPerformance: boolean;
  metrics: PerformanceMetrics;
  enableAnimations: boolean;
  enableBlur: boolean;
  enableGradients: boolean;
  enableShadows: boolean;
  enableTransitions: boolean;
  imageQuality: 'high' | 'medium' | 'low';
  videoAutoplay: boolean;
}

const getNavigatorConnection = () => {
  return (navigator as any).connection || 
         (navigator as any).mozConnection || 
         (navigator as any).webkitConnection;
};

const detectLowEndDevice = (): boolean => {
  const nav = navigator as any;
  
  const deviceMemory = nav.deviceMemory;
  if (deviceMemory && deviceMemory <= 4) return true;
  
  const hardwareConcurrency = nav.hardwareConcurrency;
  if (hardwareConcurrency && hardwareConcurrency <= 4) return true;
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isOldAndroid = /Android [1-7]\./i.test(navigator.userAgent);
  if (isMobile && isOldAndroid) return true;
  
  return false;
};

const detectSlowNetwork = (): boolean => {
  const connection = getNavigatorConnection();
  if (!connection) return false;
  
  const effectiveType = connection.effectiveType;
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g') {
    return true;
  }
  
  const downlink = connection.downlink;
  if (downlink && downlink < 1.5) return true;
  
  const rtt = connection.rtt;
  if (rtt && rtt > 400) return true;
  
  if (connection.saveData) return true;
  
  return false;
};

const getPerformanceMetrics = (): PerformanceMetrics => {
  const nav = navigator as any;
  const connection = getNavigatorConnection();
  
  return {
    isLowEndDevice: detectLowEndDevice(),
    isSlowNetwork: detectSlowNetwork(),
    isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    deviceMemory: nav.deviceMemory || null,
    hardwareConcurrency: nav.hardwareConcurrency || 4,
    connectionType: connection?.type || null,
    effectiveType: connection?.effectiveType || null,
    saveData: connection?.saveData || false,
  };
};

export const usePerformanceMode = (): PerformanceMode => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(getPerformanceMetrics);
  const [forceLowPerformance, setForceLowPerformance] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tma-low-performance') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setMetrics(prev => ({ ...prev, isReducedMotion: e.matches }));
    };
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    
    const connection = getNavigatorConnection();
    const handleConnectionChange = () => {
      setMetrics(getPerformanceMetrics());
    };
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isLowPerf = forceLowPerformance || metrics.isLowEndDevice || metrics.isSlowNetwork || metrics.isReducedMotion;
    
    if (isLowPerf) {
      root.classList.add('low-performance');
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('low-performance');
      root.classList.remove('reduce-motion');
    }
    
    if (metrics.isSlowNetwork) {
      root.classList.add('slow-network');
    } else {
      root.classList.remove('slow-network');
    }
  }, [metrics, forceLowPerformance]);

  const isLowPerformance = forceLowPerformance || metrics.isLowEndDevice || metrics.isSlowNetwork || metrics.isReducedMotion;

  return {
    isLowPerformance,
    metrics,
    enableAnimations: !isLowPerformance && !metrics.isReducedMotion,
    enableBlur: !isLowPerformance,
    enableGradients: !metrics.isLowEndDevice,
    enableShadows: !metrics.isLowEndDevice,
    enableTransitions: !metrics.isReducedMotion,
    imageQuality: metrics.isSlowNetwork ? 'low' : (metrics.isLowEndDevice ? 'medium' : 'high'),
    videoAutoplay: !metrics.isSlowNetwork && !metrics.saveData,
  };
};

export const toggleLowPerformanceMode = (enabled: boolean) => {
  try {
    if (enabled) {
      localStorage.setItem('tma-low-performance', 'true');
      document.documentElement.classList.add('low-performance', 'reduce-motion');
    } else {
      localStorage.removeItem('tma-low-performance');
      document.documentElement.classList.remove('low-performance', 'reduce-motion');
    }
    window.dispatchEvent(new CustomEvent('performance-mode-change', { detail: { enabled } }));
  } catch {}
};

export default usePerformanceMode;
