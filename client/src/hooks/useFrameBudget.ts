import { useEffect, useRef, useCallback, useState } from 'react';

interface FrameStats {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  jank: boolean;
}

interface FrameBudgetConfig {
  enabled?: boolean;
  targetFPS?: number;
  sampleSize?: number;
  jankThreshold?: number;
  onJank?: (stats: FrameStats) => void;
  autoSimplify?: boolean;
}

const defaultConfig: FrameBudgetConfig = {
  enabled: true,
  targetFPS: 60,
  sampleSize: 60,
  jankThreshold: 50,
  autoSimplify: true,
};

export function useFrameBudget(config: FrameBudgetConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);
  const droppedFramesRef = useRef<number>(0);
  const [stats, setStats] = useState<FrameStats>({
    fps: 60,
    frameTime: 16.67,
    droppedFrames: 0,
    jank: false,
  });
  const [shouldSimplify, setShouldSimplify] = useState(false);

  const targetFrameTime = 1000 / (settings.targetFPS ?? 60);

  const measureFrame = useCallback((timestamp: number) => {
    if (lastFrameTimeRef.current > 0) {
      const frameTime = timestamp - lastFrameTimeRef.current;
      frameTimesRef.current.push(frameTime);

      if (frameTimesRef.current.length > (settings.sampleSize ?? 60)) {
        frameTimesRef.current.shift();
      }

      if (frameTime > targetFrameTime * 2) {
        droppedFramesRef.current++;
      }

      if (frameTimesRef.current.length >= 10) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const fps = Math.round(1000 / avgFrameTime);
        const jank = avgFrameTime > (settings.jankThreshold ?? 50);

        const newStats: FrameStats = {
          fps,
          frameTime: Math.round(avgFrameTime * 100) / 100,
          droppedFrames: droppedFramesRef.current,
          jank,
        };

        setStats(newStats);

        if (jank) {
          settings.onJank?.(newStats);
          
          if (settings.autoSimplify && !shouldSimplify) {
            setShouldSimplify(true);
            console.info('[Frame Budget] Enabling simplified mode due to low FPS');
          }
        } else if (shouldSimplify && fps > 55) {
          setShouldSimplify(false);
          console.info('[Frame Budget] Disabling simplified mode - performance recovered');
        }
      }
    }

    lastFrameTimeRef.current = timestamp;
    rafIdRef.current = requestAnimationFrame(measureFrame);
  }, [settings, targetFrameTime, shouldSimplify]);

  useEffect(() => {
    if (!settings.enabled) return;

    rafIdRef.current = requestAnimationFrame(measureFrame);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [settings.enabled, measureFrame]);

  const reset = useCallback(() => {
    frameTimesRef.current = [];
    droppedFramesRef.current = 0;
    lastFrameTimeRef.current = 0;
    setShouldSimplify(false);
    setStats({
      fps: 60,
      frameTime: 16.67,
      droppedFrames: 0,
      jank: false,
    });
  }, []);

  return {
    stats,
    shouldSimplify,
    reset,
    isPerformant: stats.fps >= 55 && !stats.jank,
  };
}

export function useAnimationQuality() {
  const { shouldSimplify, stats } = useFrameBudget();
  
  return {
    quality: shouldSimplify ? 'low' : stats.fps < 45 ? 'medium' : 'high',
    shouldReduceMotion: shouldSimplify || stats.fps < 30,
    shouldDisableEffects: stats.fps < 20,
    stats,
  };
}

export function useAdaptiveAnimation<T extends Record<string, unknown>>(
  fullConfig: T,
  simplifiedConfig: Partial<T>
): T {
  const { shouldSimplify } = useFrameBudget({ enabled: true });
  
  if (shouldSimplify) {
    return { ...fullConfig, ...simplifiedConfig };
  }
  
  return fullConfig;
}
