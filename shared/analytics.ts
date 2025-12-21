// ============================================================================
// EVENT TAXONOMY — Стандартизированная схема аналитики
// ============================================================================

// === КАТЕГОРИИ СОБЫТИЙ ===
export const EVENT_CATEGORIES = {
  PAGE: 'page',              // Просмотры страниц
  USER: 'user',              // Действия пользователя (регистрация, логин)
  DEMO: 'demo',              // Взаимодействие с демо-приложениями
  ENGAGEMENT: 'engagement',  // Клики, скролл, время на странице
  CONVERSION: 'conversion',  // Конверсии (оплата, реферал)
  ERROR: 'error',            // Ошибки JavaScript и API
  PERFORMANCE: 'performance', // Web Vitals метрики
  GAMIFICATION: 'gamification', // XP, уровни, достижения
  TELEGRAM: 'telegram',      // Telegram-специфичные события
} as const;

// === ДЕЙСТВИЯ ===
export const EVENT_ACTIONS = {
  // Страницы
  VIEW: 'view',
  LEAVE: 'leave',
  SCROLL: 'scroll',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  
  // Пользователь
  REGISTER: 'register',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_UPDATE: 'profile_update',
  
  // Демо-приложения
  DEMO_START: 'demo_start',
  DEMO_COMPLETE: 'demo_complete',
  DEMO_INTERACT: 'demo_interact',
  DEMO_ADD_TO_CART: 'demo_add_to_cart',
  DEMO_CHECKOUT: 'demo_checkout',
  
  // Вовлечённость
  CLICK: 'click',
  SHARE: 'share',
  COPY: 'copy',
  SEARCH: 'search',
  FILTER: 'filter',
  FORM_START: 'form_start',
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',
  
  // Конверсии
  REFERRAL_CLICK: 'referral_click',
  REFERRAL_COPY: 'referral_copy',
  REFERRAL_SIGNUP: 'referral_signup',
  PAYMENT_START: 'payment_start',
  PAYMENT_COMPLETE: 'payment_complete',
  PAYMENT_FAIL: 'payment_fail',
  
  // Геймификация
  XP_EARNED: 'xp_earned',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  TASK_COMPLETE: 'task_complete',
  STREAK_UPDATED: 'streak_updated',
  
  // Telegram
  TG_MAIN_BUTTON_CLICK: 'tg_main_button_click',
  TG_BACK_BUTTON_CLICK: 'tg_back_button_click',
  TG_HAPTIC_FEEDBACK: 'tg_haptic_feedback',
  TG_SHARE: 'tg_share',
  TG_INVOICE_OPENED: 'tg_invoice_opened',
  TG_INVOICE_CLOSED: 'tg_invoice_closed',
  
  // Производительность (Web Vitals)
  FCP: 'fcp',  // First Contentful Paint
  LCP: 'lcp',  // Largest Contentful Paint
  FID: 'fid',  // First Input Delay
  CLS: 'cls',  // Cumulative Layout Shift
  TTFB: 'ttfb', // Time to First Byte
  INP: 'inp',  // Interaction to Next Paint
  
  // Ошибки
  JS_ERROR: 'js_error',
  API_ERROR: 'api_error',
  NETWORK_ERROR: 'network_error',
} as const;

// === ТИПЫ ===
export type EventCategory = typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES];
export type EventAction = typeof EVENT_ACTIONS[keyof typeof EVENT_ACTIONS];

// === ИНТЕРФЕЙС СОБЫТИЯ ===
export interface AnalyticsEvent {
  id?: string;              // UUID события (генерируется на сервере)
  category: EventCategory | string;
  action: EventAction | string;
  label?: string;           // Дополнительная метка (название кнопки, страницы)
  value?: number;           // Числовое значение (время в мс, сумма)
  metadata?: Record<string, unknown>; // Любые дополнительные данные
  timestamp: number;        // Unix timestamp
  sessionId: string;        // ID сессии для группировки событий
  telegramId?: number;      // Telegram ID если авторизован
  platform?: string;        // Платформа (ios, android, web, tdesktop)
  version?: string;         // Версия Telegram WebApp
  isOnline?: boolean;       // Онлайн/офлайн статус
}

// === ПРЕСЕТЫ ДЛЯ ВОРОНОК ===
export const FUNNEL_EVENTS = {
  // Онбординг
  ONBOARDING_START: { category: EVENT_CATEGORIES.USER, action: 'onboarding_start' },
  ONBOARDING_STEP: { category: EVENT_CATEGORIES.USER, action: 'onboarding_step' },
  ONBOARDING_COMPLETE: { category: EVENT_CATEGORIES.USER, action: 'onboarding_complete' },
  ONBOARDING_SKIP: { category: EVENT_CATEGORIES.USER, action: 'onboarding_skip' },
  
  // Демо-воронка
  DEMO_FUNNEL_VIEW: { category: EVENT_CATEGORIES.DEMO, action: EVENT_ACTIONS.VIEW },
  DEMO_FUNNEL_START: { category: EVENT_CATEGORIES.DEMO, action: EVENT_ACTIONS.DEMO_START },
  DEMO_FUNNEL_INTERACT: { category: EVENT_CATEGORIES.DEMO, action: EVENT_ACTIONS.DEMO_INTERACT },
  DEMO_FUNNEL_COMPLETE: { category: EVENT_CATEGORIES.DEMO, action: EVENT_ACTIONS.DEMO_COMPLETE },
  
  // Реферальная воронка
  REFERRAL_FUNNEL_VIEW: { category: EVENT_CATEGORIES.CONVERSION, action: 'referral_view' },
  REFERRAL_FUNNEL_COPY: { category: EVENT_CATEGORIES.CONVERSION, action: EVENT_ACTIONS.REFERRAL_COPY },
  REFERRAL_FUNNEL_SHARE: { category: EVENT_CATEGORIES.CONVERSION, action: 'referral_share' },
  REFERRAL_FUNNEL_SIGNUP: { category: EVENT_CATEGORIES.CONVERSION, action: EVENT_ACTIONS.REFERRAL_SIGNUP },
} as const;

// === МЕТРИКИ WEB VITALS ===
export const WEB_VITALS_THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },     // First Contentful Paint
  LCP: { good: 2500, poor: 4000 },     // Largest Contentful Paint
  FID: { good: 100, poor: 300 },       // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },      // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 },     // Time to First Byte
  INP: { good: 200, poor: 500 },       // Interaction to Next Paint
} as const;

export function getWebVitalRating(metric: keyof typeof WEB_VITALS_THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[metric];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}
