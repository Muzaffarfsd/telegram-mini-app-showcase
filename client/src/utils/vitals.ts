import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const VITALS_ENDPOINT = '/api/vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Determine rating based on metric thresholds
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds: Record<string, { good: number; poor: number }> = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 600, poor: 1200 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// Send metric to server
const sendMetric = async (metric: VitalMetric) => {
  try {
    // Only send if not in development (to reduce noise)
    if (process.env.NODE_ENV === 'production') {
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
        keepalive: true, // Important for metrics sent on page unload
      });
    }

    // Log to console in development
    console.log(
      `%c${metric.name}: ${metric.value.toFixed(2)}ms %c${metric.rating}`,
      'font-weight:bold',
      `color:${metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red'}`
    );
  } catch (error) {
    console.error('Failed to send vital metric:', error);
  }
};

// Initialize Core Web Vitals tracking
export const initializeVitals = () => {
  // First Contentful Paint
  getFCP((metric) => {
    sendMetric({
      ...metric,
      name: 'FCP',
      rating: getRating('FCP', metric.value),
    });
  });

  // Largest Contentful Paint
  getLCP((metric) => {
    sendMetric({
      ...metric,
      name: 'LCP',
      rating: getRating('LCP', metric.value),
    });
  });

  // First Input Delay
  getFID((metric) => {
    sendMetric({
      ...metric,
      name: 'FID',
      rating: getRating('FID', metric.value),
    });
  });

  // Cumulative Layout Shift
  getCLS((metric) => {
    sendMetric({
      ...metric,
      name: 'CLS',
      rating: getRating('CLS', metric.value),
    });
  });

  // Time to First Byte
  getTTFB((metric) => {
    sendMetric({
      ...metric,
      name: 'TTFB',
      rating: getRating('TTFB', metric.value),
    });
  });

  // Track navigation timing
  if (performance.getEntriesByType) {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      const metrics = {
        domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart,
        loadComplete: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
        domInteractive: navigationTiming.domInteractive - navigationTiming.fetchStart,
      };

      console.log('Navigation Timing:', metrics);
    }
  }
};

// Track custom user actions
export const trackUserAction = (actionName: string, metadata?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
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

// Track page views
export const trackPageView = (pageName: string) => {
  trackUserAction('page_view', { pageName });
};

// Track errors from React components
export const trackComponentError = (error: Error, componentName: string) => {
  console.error(`Error in ${componentName}:`, error);
  
  if (process.env.NODE_ENV === 'production') {
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
