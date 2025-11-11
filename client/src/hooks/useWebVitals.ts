import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface WebVitalsMetrics {
  CLS?: number;
  FCP?: number;
  INP?: number;
  LCP?: number;
  TTFB?: number;
}

type WebVitalsCallback = (metrics: WebVitalsMetrics) => void;

export const useWebVitals = (callback?: WebVitalsCallback) => {
  useEffect(() => {
    const metrics: WebVitalsMetrics = {};
    
    const handleMetric = (metric: Metric) => {
      metrics[metric.name as keyof WebVitalsMetrics] = metric.value;
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, metric.value);
      }
      
      // Call custom callback
      callback?.(metrics);
      
      // Send to analytics (implement your own logic)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true
        });
      }
    };
    
    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }, [callback]);
};

// Performance Observer for custom metrics
export const usePerformanceObserver = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('[Performance] Navigation timing:', {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            request: navEntry.responseStart - navEntry.requestStart,
            response: navEntry.responseEnd - navEntry.responseStart,
            dom: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            load: navEntry.loadEventEnd - navEntry.loadEventStart
          });
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
    } catch (error) {
      console.error('[Performance Observer] Error:', error);
    }
    
    return () => observer.disconnect();
  }, []);
};
