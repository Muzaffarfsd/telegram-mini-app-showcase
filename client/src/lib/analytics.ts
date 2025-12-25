// ============================================================================
// ANALYTICS CLIENT — Профессиональная система аналитики
// ============================================================================

import { 
  EVENT_CATEGORIES, 
  EVENT_ACTIONS, 
  WEB_VITALS_THRESHOLDS,
  getWebVitalRating,
  type AnalyticsEvent,
  type EventCategory,
  type EventAction 
} from '@shared/analytics';

// === КОНФИГУРАЦИЯ ===
const CONFIG = {
  FLUSH_INTERVAL: 1000,       // Батчинг: отправка каждую секунду
  MAX_QUEUE_SIZE: 100,        // Максимум событий в очереди
  MAX_RETRIES: 3,             // Максимум повторных попыток
  SCROLL_THRESHOLD: 25,       // Порог для scroll depth (25%, 50%, 75%, 100%)
  MIN_TIME_ON_PAGE: 5000,     // Минимум 5 сек для time_on_page
} as const;

// === СЕССИЯ ===
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
}

// === TELEGRAM DATA ===
function getTelegramData(): { telegramId?: number; platform?: string; version?: string } {
  try {
    const tg = window.Telegram?.WebApp;
    if (!tg) return {};
    
    return {
      telegramId: tg.initDataUnsafe?.user?.id,
      platform: (tg as any).platform,
      version: (tg as any).version,
    };
  } catch {
    return {};
  }
}

// === ОЧЕРЕДЬ СОБЫТИЙ ===
class AnalyticsQueue {
  private queue: AnalyticsEvent[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;
  private retryCount: number = 0;
  private enabled: boolean;
  private sessionId: string;
  private pageLoadTime: number;
  private scrollDepthTracked: Set<number> = new Set();
  private visibilityStartTime: number;
  
  constructor() {
    this.enabled = true;
    this.sessionId = getSessionId();
    this.pageLoadTime = Date.now();
    this.visibilityStartTime = Date.now();
    
    if (typeof window !== 'undefined') {
      this.setupAutoTracking();
      this.setupWebVitals();
      this.setupTelegramEvents();
      
      // Sync offline queue on initialization if online
      if (navigator.onLine) {
        this.syncOfflineQueue();
      }
    }
  }

  // === ГЛАВНЫЙ МЕТОД ТРЕКИНГА ===
  track(
    category: EventCategory | string,
    action: EventAction | string,
    label?: string,
    value?: number,
    metadata?: Record<string, unknown>
  ): void {
    const telegramData = getTelegramData();
    
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      metadata,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      telegramId: telegramData.telegramId,
      platform: telegramData.platform,
      version: telegramData.version,
      isOnline: navigator.onLine,
    };

    this.queue.push(event);

    if (import.meta.env.DEV) {
      console.debug('[Analytics]', event);
    }

    // Немедленный flush для критических событий
    if (category === EVENT_CATEGORIES.ERROR || category === EVENT_CATEGORIES.CONVERSION) {
      this.flush();
      return;
    }

    // Стандартный батчинг
    if (this.queue.length >= CONFIG.MAX_QUEUE_SIZE) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) return;
    this.flushTimeout = setTimeout(() => {
      this.flushTimeout = null;
      this.flush();
    }, CONFIG.FLUSH_INTERVAL);
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      if (!navigator.onLine) {
        await this.saveToOfflineQueue(events);
        return;
      }

      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true,
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      this.retryCount = 0;
    } catch (error) {
      console.error('[Analytics] Flush failed:', error);
      
      if (this.retryCount < CONFIG.MAX_RETRIES) {
        this.retryCount++;
        this.queue.unshift(...events);
        this.scheduleFlush();
      } else {
        await this.saveToOfflineQueue(events);
        this.retryCount = 0;
      }
    }
  }

  private async saveToOfflineQueue(events: AnalyticsEvent[]): Promise<void> {
    try {
      const existing = localStorage.getItem('analytics_offline_queue');
      const queue = existing ? JSON.parse(existing) : [];
      queue.push(...events);
      
      // Ограничиваем размер офлайн-очереди
      const trimmed = queue.slice(-500);
      localStorage.setItem('analytics_offline_queue', JSON.stringify(trimmed));
    } catch (error) {
      console.error('[Analytics] Offline save failed:', error);
    }
  }

  async syncOfflineQueue(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const stored = localStorage.getItem('analytics_offline_queue');
      if (!stored) return;

      const events = JSON.parse(stored);
      if (events.length === 0) return;

      localStorage.removeItem('analytics_offline_queue');

      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events, offline: true }),
      });

      if (!response.ok) {
        localStorage.setItem('analytics_offline_queue', stored);
      }
    } catch (error) {
      console.error('[Analytics] Offline sync failed:', error);
    }
  }

  // === АВТОТРЕКИНГ ===
  private setupAutoTracking(): void {
    // Page View при загрузке
    this.pageView(window.location.pathname, document.title);

    // SPA навигация
    const originalPushState = history.pushState.bind(history);
    history.pushState = (...args) => {
      originalPushState(...args);
      this.pageView(window.location.pathname, document.title);
      this.resetPageTracking();
    };

    window.addEventListener('popstate', () => {
      this.pageView(window.location.pathname, document.title);
      this.resetPageTracking();
    });

    // Scroll Depth
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

    // Visibility (time on page)
    document.addEventListener('visibilitychange', this.handleVisibility.bind(this));

    // Errors
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleRejection.bind(this));

    // Beforeunload — финальный flush
    window.addEventListener('beforeunload', () => {
      this.trackTimeOnPage();
      this.flush();
    });

    // Online/Offline
    window.addEventListener('online', () => {
      this.syncOfflineQueue();
      this.track(EVENT_CATEGORIES.ENGAGEMENT, 'connection_restored');
    });

    window.addEventListener('offline', () => {
      this.track(EVENT_CATEGORIES.ENGAGEMENT, 'connection_lost');
    });
  }

  private resetPageTracking(): void {
    this.pageLoadTime = Date.now();
    this.scrollDepthTracked.clear();
    this.visibilityStartTime = Date.now();
  }

  private handleScroll(): void {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;

    const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
    
    for (const threshold of [25, 50, 75, 100]) {
      if (scrollPercent >= threshold && !this.scrollDepthTracked.has(threshold)) {
        this.scrollDepthTracked.add(threshold);
        this.track(
          EVENT_CATEGORIES.ENGAGEMENT,
          EVENT_ACTIONS.SCROLL_DEPTH,
          window.location.pathname,
          threshold,
          { page: window.location.pathname }
        );
      }
    }
  }

  private handleVisibility(): void {
    if (document.hidden) {
      this.trackTimeOnPage();
      this.flush();
    } else {
      this.visibilityStartTime = Date.now();
    }
  }

  private trackTimeOnPage(): void {
    const timeSpent = Date.now() - this.visibilityStartTime;
    if (timeSpent >= CONFIG.MIN_TIME_ON_PAGE) {
      this.track(
        EVENT_CATEGORIES.ENGAGEMENT,
        EVENT_ACTIONS.TIME_ON_PAGE,
        window.location.pathname,
        Math.round(timeSpent / 1000),
        { page: window.location.pathname }
      );
    }
  }

  private handleError(event: ErrorEvent): void {
    this.track(
      EVENT_CATEGORIES.ERROR,
      EVENT_ACTIONS.JS_ERROR,
      event.message,
      undefined,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack?.slice(0, 1000),
      }
    );
  }

  private handleRejection(event: PromiseRejectionEvent): void {
    this.track(
      EVENT_CATEGORIES.ERROR,
      EVENT_ACTIONS.JS_ERROR,
      `Unhandled Promise: ${event.reason?.message || event.reason}`,
      undefined,
      { type: 'unhandledrejection' }
    );
  }

  // === WEB VITALS ===
  private setupWebVitals(): void {
    import('web-vitals').then(({ onFCP, onLCP, onCLS, onTTFB, onINP }) => {
      onFCP((metric: { value: number }) => this.trackWebVital('FCP', metric.value));
      onLCP((metric: { value: number }) => this.trackWebVital('LCP', metric.value));
      onCLS((metric: { value: number }) => this.trackWebVital('CLS', metric.value));
      onTTFB((metric: { value: number }) => this.trackWebVital('TTFB', metric.value));
      onINP((metric: { value: number }) => this.trackWebVital('INP', metric.value));
    }).catch(() => {
      // web-vitals не загрузился
    });
  }

  private trackWebVital(name: keyof typeof WEB_VITALS_THRESHOLDS, value: number): void {
    const rating = getWebVitalRating(name, value);
    this.track(
      EVENT_CATEGORIES.PERFORMANCE,
      name.toLowerCase(),
      rating,
      Math.round(value),
      { rating, name }
    );
  }

  // === TELEGRAM EVENTS ===
  private setupTelegramEvents(): void {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Main Button
    tg.MainButton?.onClick?.(() => {
      this.track(EVENT_CATEGORIES.TELEGRAM, EVENT_ACTIONS.TG_MAIN_BUTTON_CLICK);
    });

    // Back Button
    tg.BackButton?.onClick?.(() => {
      this.track(EVENT_CATEGORIES.TELEGRAM, EVENT_ACTIONS.TG_BACK_BUTTON_CLICK);
    });
  }

  // === ПУБЛИЧНЫЕ МЕТОДЫ ===
  
  pageView(path: string, title?: string): void {
    this.track(
      EVENT_CATEGORIES.PAGE,
      EVENT_ACTIONS.VIEW,
      path,
      undefined,
      { title, referrer: document.referrer }
    );
  }

  demoStart(demoId: string, demoName: string): void {
    this.track(
      EVENT_CATEGORIES.DEMO,
      EVENT_ACTIONS.DEMO_START,
      demoId,
      undefined,
      { demoName }
    );
  }

  demoComplete(demoId: string, durationMs: number): void {
    this.track(
      EVENT_CATEGORIES.DEMO,
      EVENT_ACTIONS.DEMO_COMPLETE,
      demoId,
      durationMs
    );
  }

  demoInteract(demoId: string, interactionType: string, details?: Record<string, unknown>): void {
    this.track(
      EVENT_CATEGORIES.DEMO,
      EVENT_ACTIONS.DEMO_INTERACT,
      demoId,
      undefined,
      { interactionType, ...details }
    );
  }

  click(element: string, context?: Record<string, unknown>): void {
    this.track(
      EVENT_CATEGORIES.ENGAGEMENT,
      EVENT_ACTIONS.CLICK,
      element,
      undefined,
      context
    );
  }

  share(method: string, contentId?: string): void {
    this.track(
      EVENT_CATEGORIES.ENGAGEMENT,
      EVENT_ACTIONS.SHARE,
      method,
      undefined,
      { contentId }
    );
  }

  search(query: string, resultsCount?: number): void {
    this.track(
      EVENT_CATEGORIES.ENGAGEMENT,
      EVENT_ACTIONS.SEARCH,
      query,
      resultsCount
    );
  }

  referralClick(code: string): void {
    this.track(
      EVENT_CATEGORIES.CONVERSION,
      EVENT_ACTIONS.REFERRAL_CLICK,
      code
    );
  }

  referralCopy(code: string): void {
    this.track(
      EVENT_CATEGORIES.CONVERSION,
      EVENT_ACTIONS.REFERRAL_COPY,
      code
    );
  }

  paymentStart(amount: number, currency: string, productId?: string): void {
    this.track(
      EVENT_CATEGORIES.CONVERSION,
      EVENT_ACTIONS.PAYMENT_START,
      productId,
      amount,
      { currency }
    );
  }

  paymentComplete(amount: number, currency: string, transactionId: string): void {
    this.track(
      EVENT_CATEGORIES.CONVERSION,
      EVENT_ACTIONS.PAYMENT_COMPLETE,
      transactionId,
      amount,
      { currency }
    );
  }

  xpEarned(amount: number, source: string): void {
    this.track(
      EVENT_CATEGORIES.GAMIFICATION,
      EVENT_ACTIONS.XP_EARNED,
      source,
      amount
    );
  }

  levelUp(newLevel: number): void {
    this.track(
      EVENT_CATEGORIES.GAMIFICATION,
      EVENT_ACTIONS.LEVEL_UP,
      undefined,
      newLevel
    );
  }

  achievementUnlocked(achievementId: string, achievementName: string): void {
    this.track(
      EVENT_CATEGORIES.GAMIFICATION,
      EVENT_ACTIONS.ACHIEVEMENT_UNLOCKED,
      achievementId,
      undefined,
      { achievementName }
    );
  }

  apiError(endpoint: string, status: number, message?: string): void {
    this.track(
      EVENT_CATEGORIES.ERROR,
      EVENT_ACTIONS.API_ERROR,
      endpoint,
      status,
      { message }
    );
  }

  // === TIMING ===
  startTiming(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = Math.round(performance.now() - startTime);
      this.track(
        EVENT_CATEGORIES.PERFORMANCE,
        'timing',
        name,
        duration
      );
    };
  }

  // === USER IDENTIFICATION ===
  identify(telegramId: number, properties?: Record<string, unknown>): void {
    this.track(
      EVENT_CATEGORIES.USER,
      'identify',
      String(telegramId),
      undefined,
      properties
    );
  }
}

// === SINGLETON ===
export const analytics = new AnalyticsQueue();

// === ЭКСПОРТ ДЛЯ ДЕБАГА ===
if (import.meta.env.DEV) {
  (window as Window & { analytics?: AnalyticsQueue }).analytics = analytics;
}

// Re-export types
export { EVENT_CATEGORIES, EVENT_ACTIONS } from '@shared/analytics';
