import { useEffect, useRef, useCallback, useState } from 'react';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryStats {
  current: number;
  peak: number;
  average: number;
  trend: 'stable' | 'increasing' | 'decreasing';
  leakSuspected: boolean;
}

interface MemoryMonitorConfig {
  enabled?: boolean;
  intervalMs?: number;
  sampleSize?: number;
  leakThresholdMB?: number;
  onLeakDetected?: (stats: MemoryStats) => void;
  onWarning?: (message: string, stats: MemoryStats) => void;
}

const defaultConfig: MemoryMonitorConfig = {
  enabled: typeof window !== 'undefined' && !!(performance as any)?.memory,
  intervalMs: 5000,
  sampleSize: 20,
  leakThresholdMB: 50,
};

export function useMemoryMonitor(config: MemoryMonitorConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const samplesRef = useRef<number[]>([]);
  const peakRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [stats, setStats] = useState<MemoryStats | null>(null);

  const getMemoryInfo = useCallback((): MemoryInfo | null => {
    if (typeof performance === 'undefined') return null;
    
    const memory = (performance as any).memory;
    if (!memory) return null;
    
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }, []);

  const bytesToMB = (bytes: number): number => {
    return Math.round((bytes / 1024 / 1024) * 100) / 100;
  };

  const calculateTrend = useCallback((samples: number[]): 'stable' | 'increasing' | 'decreasing' => {
    if (samples.length < 3) return 'stable';
    
    const recentSamples = samples.slice(-5);
    const firstHalf = recentSamples.slice(0, Math.floor(recentSamples.length / 2));
    const secondHalf = recentSamples.slice(Math.floor(recentSamples.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    const threshold = firstAvg * 0.05;
    
    if (diff > threshold) return 'increasing';
    if (diff < -threshold) return 'decreasing';
    return 'stable';
  }, []);

  const detectLeak = useCallback((samples: number[]): boolean => {
    if (samples.length < 10) return false;
    
    const recentSamples = samples.slice(-10);
    const firstValue = recentSamples[0];
    const lastValue = recentSamples[recentSamples.length - 1];
    
    const growth = lastValue - firstValue;
    const growthMB = bytesToMB(growth);
    
    return growthMB > (settings.leakThresholdMB ?? 50);
  }, [settings.leakThresholdMB]);

  const collectSample = useCallback(() => {
    const memory = getMemoryInfo();
    if (!memory) return;

    const current = memory.usedJSHeapSize;
    samplesRef.current.push(current);
    
    if (samplesRef.current.length > (settings.sampleSize ?? 20)) {
      samplesRef.current.shift();
    }
    
    if (current > peakRef.current) {
      peakRef.current = current;
    }

    const samples = samplesRef.current;
    const average = samples.reduce((a, b) => a + b, 0) / samples.length;
    const trend = calculateTrend(samples);
    const leakSuspected = detectLeak(samples);

    const newStats: MemoryStats = {
      current: bytesToMB(current),
      peak: bytesToMB(peakRef.current),
      average: bytesToMB(average),
      trend,
      leakSuspected,
    };

    setStats(newStats);

    if (leakSuspected) {
      settings.onLeakDetected?.(newStats);
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Memory Monitor] Potential memory leak detected:', newStats);
      }
    }

    const usagePercent = (current / memory.jsHeapSizeLimit) * 100;
    if (usagePercent > 80) {
      settings.onWarning?.(`High memory usage: ${usagePercent.toFixed(1)}%`, newStats);
    }
  }, [getMemoryInfo, settings, calculateTrend, detectLeak]);

  const forceGC = useCallback(() => {
    if (typeof (window as any).gc === 'function') {
      (window as any).gc();
      return true;
    }
    return false;
  }, []);

  const reset = useCallback(() => {
    samplesRef.current = [];
    peakRef.current = 0;
    setStats(null);
  }, []);

  useEffect(() => {
    if (!settings.enabled) return;
    if (typeof window === 'undefined') return;

    const memory = getMemoryInfo();
    if (!memory) {
      return;
    }

    collectSample();
    const intervalId = setInterval(collectSample, settings.intervalMs);
    intervalRef.current = intervalId;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [settings.enabled, settings.intervalMs, collectSample, getMemoryInfo]);

  return {
    stats,
    forceGC,
    reset,
    isSupported: !!getMemoryInfo(),
  };
}

export function useComponentMemoryTracker(componentName: string) {
  const mountTimeRef = useRef<number>(0);
  const initialMemoryRef = useRef<number>(0);

  useEffect(() => {
    const memory = (performance as any)?.memory;
    if (!memory) return;

    mountTimeRef.current = performance.now();
    initialMemoryRef.current = memory.usedJSHeapSize;

    return () => {
      const finalMemory = memory.usedJSHeapSize;
      const memoryDiff = finalMemory - initialMemoryRef.current;
      const lifetime = performance.now() - mountTimeRef.current;

      if (memoryDiff > 5 * 1024 * 1024) {
        console.warn(
          `[Memory Tracker] ${componentName} potentially leaked ${(memoryDiff / 1024 / 1024).toFixed(2)}MB over ${(lifetime / 1000).toFixed(1)}s`
        );
      }
    };
  }, [componentName]);
}
