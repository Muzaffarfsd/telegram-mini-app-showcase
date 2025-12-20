import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

const VITALS_ENDPOINT = '/api/vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds: Record<string, { good: number; poor: number }> = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    INP: { good: 200, poor: 500 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 600, poor: 1200 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

const sendMetric = async (metric: VitalMetric) => {
  try {
    if (import.meta.env.PROD) {
      await fetch(VITALS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          navigationType: metric.navigationType,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
        keepalive: true,
      });
    }

    console.log(`[Web Vitals] ${metric.name}:`, metric.value);
  } catch (error) {
    console.error('Failed to send vital metric:', error);
  }
};

export const initializeVitals = () => {
  onFCP((metric) => {
    sendMetric({
      ...metric,
      name: 'FCP',
      rating: getRating('FCP', metric.value),
    });
  });

  onLCP((metric) => {
    sendMetric({
      ...metric,
      name: 'LCP',
      rating: getRating('LCP', metric.value),
    });
  });

  onFID((metric) => {
    sendMetric({
      ...metric,
      name: 'FID',
      rating: getRating('FID', metric.value),
    });
  });

  onINP((metric) => {
    sendMetric({
      ...metric,
      name: 'INP',
      rating: getRating('INP', metric.value),
    });
  });

  onCLS((metric) => {
    sendMetric({
      ...metric,
      name: 'CLS',
      rating: getRating('CLS', metric.value),
    });
  });

  onTTFB((metric) => {
    sendMetric({
      ...metric,
      name: 'TTFB',
      rating: getRating('TTFB', metric.value),
    });
  });
};

export const trackUserAction = (actionName: string, metadata?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    fetch('/api/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: actionName,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        metadata,
      }),
      keepalive: true,
    }).catch(console.error);
  }
  
  console.log(`User Action: ${actionName}`, metadata);
};

export const trackPageView = (pageName: string) => {
  trackUserAction('page_view', { pageName });
};

export const trackComponentError = (error: Error, componentName: string) => {
  console.error(`Error in ${componentName}:`, error);
  
  if (import.meta.env.PROD) {
    fetch('/api/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errorMessage: error.message,
        errorStack: error.stack,
        componentName,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    }).catch(console.error);
  }
};
