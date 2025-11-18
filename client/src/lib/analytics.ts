interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface UserProperties {
  userId?: string;
  email?: string;
  plan?: string;
  referralCode?: string;
  [key: string]: any;
}

class Analytics {
  private enabled: boolean;
  private userId: string | null = null;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.enabled = import.meta.env.PROD; // Only in production
    this.sessionId = this.generateSessionId();
    
    if (this.enabled) {
      this.startFlushTimer();
      this.trackPageView();
      this.setupAutoTracking();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupAutoTracking() {
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent({
          category: 'Engagement',
          action: 'page_hidden',
        });
      } else {
        this.trackEvent({
          category: 'Engagement',
          action: 'page_visible',
        });
      }
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackEvent({
        category: 'Error',
        action: 'javascript_error',
        label: event.message,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent({
        category: 'Error',
        action: 'unhandled_rejection',
        label: event.reason?.toString(),
      });
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.trackEvent({
      category: 'User',
      action: 'identify',
      metadata: { userId },
    });
  }

  setUserProperties(properties: UserProperties) {
    this.trackEvent({
      category: 'User',
      action: 'set_properties',
      metadata: properties,
    });
  }

  trackPageView(path?: string) {
    const currentPath = path || window.location.pathname;
    this.trackEvent({
      category: 'Navigation',
      action: 'page_view',
      label: currentPath,
      metadata: {
        title: document.title,
        referrer: document.referrer,
        url: window.location.href,
      },
    });
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.enabled) {
      console.debug('[Analytics]', event);
      return;
    }

    const enrichedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    };

    this.eventQueue.push(enrichedEvent);

    // Flush immediately for important events
    if (event.category === 'Error' || event.category === 'Purchase') {
      this.flush();
    }
  }

  // Convenience methods for common events
  trackClick(elementName: string, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'Interaction',
      action: 'click',
      label: elementName,
      metadata,
    });
  }

  trackFormSubmit(formName: string, success: boolean, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'Form',
      action: success ? 'submit_success' : 'submit_failure',
      label: formName,
      metadata,
    });
  }

  trackSearch(query: string, resultsCount?: number) {
    this.trackEvent({
      category: 'Search',
      action: 'search',
      label: query,
      value: resultsCount,
    });
  }

  trackShare(method: string, contentType: string, contentId?: string) {
    this.trackEvent({
      category: 'Social',
      action: 'share',
      label: method,
      metadata: { contentType, contentId },
    });
  }

  trackVideoPlay(videoId: string, duration?: number) {
    this.trackEvent({
      category: 'Media',
      action: 'video_play',
      label: videoId,
      value: duration,
    });
  }

  trackPurchase(amount: number, currency: string, items: any[]) {
    this.trackEvent({
      category: 'Purchase',
      action: 'transaction',
      value: amount,
      metadata: {
        currency,
        items,
        transactionId: `txn_${Date.now()}`,
      },
    });
  }

  trackSignup(method: string) {
    this.trackEvent({
      category: 'User',
      action: 'signup',
      label: method,
    });
  }

  trackLogin(method: string) {
    this.trackEvent({
      category: 'User',
      action: 'login',
      label: method,
    });
  }

  trackLogout() {
    this.trackEvent({
      category: 'User',
      action: 'logout',
    });
  }

  trackTiming(category: string, variable: string, time: number, label?: string) {
    this.trackEvent({
      category,
      action: 'timing',
      label: `${variable}${label ? `:${label}` : ''}`,
      value: time,
    });
  }

  startTiming(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = Math.round(performance.now() - startTime);
      this.trackTiming('Performance', name, duration);
    };
  }

  private async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send to your analytics backend
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('[Analytics] Failed to send events:', error);
      // Re-add failed events to queue
      this.eventQueue.unshift(...events);
    }
  }

  async destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Final flush
    await this.flush();
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  analytics.destroy();
});

// Export for debugging
if (import.meta.env.DEV) {
  (window as any).analytics = analytics;
}
