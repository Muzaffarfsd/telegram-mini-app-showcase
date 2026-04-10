import { onCLS, onLCP, onFCP, onTTFB, onINP } from 'web-vitals';

function sendToAnalytics(metric: any) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value);
  }
}

function initLoAFMonitoring() {
  if (typeof PerformanceObserver === 'undefined') return;
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const loaf = entry as any;
        if (loaf.duration > 150) {
          const scripts = loaf.scripts?.map((s: any) => ({
            src: s.sourceURL || s.name || 'inline',
            duration: Math.round(s.duration),
            type: s.invokerType,
          })) || [];
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[LoAF] Long frame: ${Math.round(loaf.duration)}ms`, scripts);
          }
        }
      }
    });
    observer.observe({ type: 'long-animation-frame', buffered: true });
  } catch {}
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
  initLoAFMonitoring();
}
