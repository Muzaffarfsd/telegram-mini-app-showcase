import { useEffect, useRef, useCallback } from 'react';

interface NavigationPattern {
  from: string;
  to: string;
  count: number;
  lastVisit: number;
}

interface PredictivePrefetchConfig {
  enabled?: boolean;
  minConfidence?: number;
  maxPredictions?: number;
  decayFactor?: number;
  storageKey?: string;
}

const defaultConfig: PredictivePrefetchConfig = {
  enabled: true,
  minConfidence: 0.3,
  maxPredictions: 3,
  decayFactor: 0.9,
  storageKey: 'nav-patterns',
};

class NavigationPredictor {
  private patterns: Map<string, NavigationPattern[]> = new Map();
  private currentPath: string = '';
  private storageKey: string;
  private decayFactor: number;

  constructor(storageKey: string, decayFactor: number) {
    this.storageKey = storageKey;
    this.decayFactor = decayFactor;
    this.loadPatterns();
  }

  private loadPatterns(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Validate data structure
        if (data && typeof data === 'object') {
          this.patterns = new Map(Object.entries(data));
        }
      }
    } catch {
      // Storage unavailable or corrupt - clear invalid data
      try {
        localStorage.removeItem(this.storageKey);
      } catch {}
    }
  }

  private savePatterns(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = Object.fromEntries(this.patterns);
      const serialized = JSON.stringify(data);
      // Limit storage size to 50KB
      if (serialized.length > 50000) {
        this.pruneOldPatterns();
        return;
      }
      localStorage.setItem(this.storageKey, serialized);
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  private pruneOldPatterns(): void {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    this.patterns.forEach((patterns, from) => {
      const filtered = patterns.filter(p => now - p.lastVisit < maxAge);
      if (filtered.length === 0) {
        this.patterns.delete(from);
      } else {
        this.patterns.set(from, filtered);
      }
    });
  }

  recordNavigation(from: string, to: string): void {
    if (from === to) return;

    const patterns = this.patterns.get(from) || [];
    const existing = patterns.find(p => p.to === to);

    if (existing) {
      existing.count++;
      existing.lastVisit = Date.now();
    } else {
      patterns.push({
        from,
        to,
        count: 1,
        lastVisit: Date.now(),
      });
    }

    this.patterns.set(from, patterns);
    this.applyDecay(from);
    this.savePatterns();
  }

  private applyDecay(fromPath: string): void {
    const patterns = this.patterns.get(fromPath);
    if (!patterns) return;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    patterns.forEach(pattern => {
      const daysSinceVisit = (now - pattern.lastVisit) / dayMs;
      if (daysSinceVisit > 1) {
        pattern.count *= Math.pow(this.decayFactor, daysSinceVisit);
      }
    });

    const filtered = patterns.filter(p => p.count >= 0.5);
    this.patterns.set(fromPath, filtered);
  }

  predict(currentPath: string, maxPredictions: number, minConfidence: number): string[] {
    const patterns = this.patterns.get(currentPath);
    if (!patterns || patterns.length === 0) return [];

    const totalCount = patterns.reduce((sum, p) => sum + p.count, 0);
    
    return patterns
      .map(p => ({
        path: p.to,
        confidence: p.count / totalCount,
      }))
      .filter(p => p.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxPredictions)
      .map(p => p.path);
  }

  setCurrentPath(path: string): void {
    if (this.currentPath && this.currentPath !== path) {
      this.recordNavigation(this.currentPath, path);
    }
    this.currentPath = path;
  }

  getStats(): { totalPatterns: number; uniquePaths: number } {
    let totalPatterns = 0;
    this.patterns.forEach(p => totalPatterns += p.length);
    
    return {
      totalPatterns,
      uniquePaths: this.patterns.size,
    };
  }

  clear(): void {
    this.patterns.clear();
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Storage unavailable
    }
  }
}

const predictorInstance = new NavigationPredictor('nav-patterns', 0.9);

export function usePredictivePrefetch(config: PredictivePrefetchConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const prefetchedRef = useRef<Set<string>>(new Set());

  const prefetchRoute = useCallback((path: string) => {
    if (prefetchedRef.current.has(path)) return;

    const routeChunks: Record<string, () => Promise<unknown>> = {
      '/': () => import('@/components/ShowcasePage'),
      '/projects': () => import('@/components/ProjectsPage'),
      '/profile': () => import('@/components/ProfilePage'),
      '/constructor': () => import('@/components/ConstructorPage'),
      '/ai-process': () => import('@/components/AIProcessPage'),
    };

    const loader = routeChunks[path];
    if (loader && typeof loader === 'function') {
      try {
        const result = loader();
        if (result && typeof result.then === 'function') {
          result.then(() => {
            prefetchedRef.current.add(path);
          }).catch(() => {});
        }
      } catch {
        // Silent fail
      }
    }
  }, []);

  const recordNavigation = useCallback((from: string, to: string) => {
    if (!settings.enabled) return;
    predictorInstance.recordNavigation(from, to);
  }, [settings.enabled]);

  const getPredictions = useCallback((currentPath: string): string[] => {
    if (!settings.enabled) return [];
    
    return predictorInstance.predict(
      currentPath,
      settings.maxPredictions ?? 3,
      settings.minConfidence ?? 0.3
    );
  }, [settings.enabled, settings.maxPredictions, settings.minConfidence]);

  const prefetchPredicted = useCallback((currentPath: string) => {
    const predictions = getPredictions(currentPath);
    predictions.forEach(path => prefetchRoute(path));
  }, [getPredictions, prefetchRoute]);

  useEffect(() => {
    if (!settings.enabled) return;

    const currentPath = window.location.pathname;
    predictorInstance.setCurrentPath(currentPath);
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        prefetchPredicted(currentPath);
      }, { timeout: 2000 });
    } else {
      setTimeout(() => prefetchPredicted(currentPath), 500);
    }
  }, [settings.enabled, prefetchPredicted]);

  return {
    recordNavigation,
    getPredictions,
    prefetchPredicted,
    prefetchRoute,
    getStats: () => predictorInstance.getStats(),
    clear: () => predictorInstance.clear(),
  };
}

export function useNavigationTracking() {
  const lastPathRef = useRef<string>('');
  const { recordNavigation, prefetchPredicted } = usePredictivePrefetch();

  const trackNavigation = useCallback((newPath: string) => {
    if (lastPathRef.current && lastPathRef.current !== newPath) {
      recordNavigation(lastPathRef.current, newPath);
    }
    lastPathRef.current = newPath;
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        prefetchPredicted(newPath);
      });
    }
  }, [recordNavigation, prefetchPredicted]);

  return { trackNavigation };
}
