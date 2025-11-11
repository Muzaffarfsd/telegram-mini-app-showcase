type Language = 'ru' | 'en';

type TranslationKeys = {
  // Common
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.cancel': string;
  'common.save': string;
  'common.delete': string;
  'common.edit': string;
  'common.close': string;
  'common.back': string;
  'common.next': string;
  'common.previous': string;
  'common.search': string;
  'common.filter': string;
  'common.sort': string;
  
  // Navigation
  'nav.home': string;
  'nav.showcases': string;
  'nav.projects': string;
  'nav.aiAgent': string;
  'nav.profile': string;
  
  // Hero
  'hero.title': string;
  'hero.subtitle': string;
  'hero.cta': string;
  'hero.socialProof': string;
  'hero.rating': string;
  
  // Features
  'features.title': string;
  'features.subtitle': string;
  
  // Gamification
  'gamification.level': string;
  'gamification.xp': string;
  'gamification.streak': string;
  'gamification.achievements': string;
  'gamification.dailyTasks': string;
  'gamification.leaderboard': string;
  
  // Referral
  'referral.title': string;
  'referral.code': string;
  'referral.share': string;
  'referral.earnings': string;
  'referral.tier': string;
  
  // Payment
  'payment.express': string;
  'payment.applePay': string;
  'payment.googlePay': string;
  'payment.sbp': string;
  'payment.card': string;
  
  // SEO
  'seo.defaultTitle': string;
  'seo.defaultDescription': string;
  
  // Errors
  'error.notFound': string;
  'error.serverError': string;
  'error.networkError': string;
  'error.validationError': string;
};

const translations: Record<Language, TranslationKeys> = {
  ru: {
    // Common
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.close': 'Закрыть',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.previous': 'Предыдущий',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.sort': 'Сортировка',
    
    // Navigation
    'nav.home': 'Главная',
    'nav.showcases': 'Демо',
    'nav.projects': 'Проекты',
    'nav.aiAgent': 'AI Агент',
    'nav.profile': 'Профиль',
    
    // Hero
    'hero.title': 'Запустите бизнес в Telegram за 24 часа',
    'hero.subtitle': 'Создайте своё приложение без программирования. Более 2,453 успешных предпринимателей уже запустили свои проекты.',
    'hero.cta': 'Начать бесплатно',
    'hero.socialProof': '2,453+ успешных запусков',
    'hero.rating': '4.9/5 рейтинг',
    
    // Features
    'features.title': 'Всё что нужно для успеха',
    'features.subtitle': 'Полный набор инструментов для роста вашего бизнеса',
    
    // Gamification
    'gamification.level': 'Уровень',
    'gamification.xp': 'Опыт',
    'gamification.streak': 'Серия',
    'gamification.achievements': 'Достижения',
    'gamification.dailyTasks': 'Ежедневные задания',
    'gamification.leaderboard': 'Таблица лидеров',
    
    // Referral
    'referral.title': 'Реферальная программа',
    'referral.code': 'Ваш код',
    'referral.share': 'Поделиться',
    'referral.earnings': 'Заработано',
    'referral.tier': 'Уровень партнёра',
    
    // Payment
    'payment.express': 'Быстрая оплата',
    'payment.applePay': 'Apple Pay',
    'payment.googlePay': 'Google Pay',
    'payment.sbp': 'СБП',
    'payment.card': 'Банковская карта',
    
    // SEO
    'seo.defaultTitle': 'WEB4TG - Telegram Mini Apps для вашего бизнеса',
    'seo.defaultDescription': 'Создайте свой бизнес в Telegram за 24 часа. Более 2,453 успешных предпринимателей уже запустили свои приложения. Рейтинг 4.9/5 ⭐',
    
    // Errors
    'error.notFound': 'Страница не найдена',
    'error.serverError': 'Ошибка сервера',
    'error.networkError': 'Ошибка сети',
    'error.validationError': 'Ошибка валидации',
  },
  
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    
    // Navigation
    'nav.home': 'Home',
    'nav.showcases': 'Showcases',
    'nav.projects': 'Projects',
    'nav.aiAgent': 'AI Agent',
    'nav.profile': 'Profile',
    
    // Hero
    'hero.title': 'Launch Your Business in Telegram in 24 Hours',
    'hero.subtitle': 'Create your app without coding. Over 2,453 successful entrepreneurs have already launched their projects.',
    'hero.cta': 'Start for Free',
    'hero.socialProof': '2,453+ successful launches',
    'hero.rating': '4.9/5 rating',
    
    // Features
    'features.title': 'Everything you need to succeed',
    'features.subtitle': 'Complete toolkit for growing your business',
    
    // Gamification
    'gamification.level': 'Level',
    'gamification.xp': 'Experience',
    'gamification.streak': 'Streak',
    'gamification.achievements': 'Achievements',
    'gamification.dailyTasks': 'Daily Tasks',
    'gamification.leaderboard': 'Leaderboard',
    
    // Referral
    'referral.title': 'Referral Program',
    'referral.code': 'Your code',
    'referral.share': 'Share',
    'referral.earnings': 'Earnings',
    'referral.tier': 'Partner Tier',
    
    // Payment
    'payment.express': 'Express Payment',
    'payment.applePay': 'Apple Pay',
    'payment.googlePay': 'Google Pay',
    'payment.sbp': 'SBP',
    'payment.card': 'Bank Card',
    
    // SEO
    'seo.defaultTitle': 'WEB4TG - Telegram Mini Apps for Your Business',
    'seo.defaultDescription': 'Create your business in Telegram in 24 hours. Over 2,453 successful entrepreneurs have launched their apps. 4.9/5 rating ⭐',
    
    // Errors
    'error.notFound': 'Page not found',
    'error.serverError': 'Server error',
    'error.networkError': 'Network error',
    'error.validationError': 'Validation error',
  },
};

class I18n {
  private currentLanguage: Language = 'ru';
  private listeners: Set<(lang: Language) => void> = new Set();

  constructor() {
    // Load language from localStorage or browser
    const stored = localStorage.getItem('language') as Language;
    const browserLang = navigator.language.split('-')[0] as Language;
    
    this.currentLanguage = stored || (browserLang === 'en' || browserLang === 'ru' ? browserLang : 'ru');
  }

  get language(): Language {
    return this.currentLanguage;
  }

  setLanguage(lang: Language) {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    this.listeners.forEach(listener => listener(lang));
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  }

  t(key: keyof TranslationKeys, variables?: Record<string, string | number>): string {
    let translation = translations[this.currentLanguage][key] || key;
    
    // Replace variables
    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        translation = translation.replace(`{{${varKey}}}`, String(value));
      });
    }
    
    return translation;
  }

  subscribe(listener: (lang: Language) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat(this.currentLanguage === 'ru' ? 'ru-RU' : 'en-US').format(num);
  }

  formatCurrency(amount: number, currency: string = 'RUB'): string {
    return new Intl.NumberFormat(this.currentLanguage === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(this.currentLanguage === 'ru' ? 'ru-RU' : 'en-US', options).format(d);
  }

  formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage === 'ru' ? 'ru-RU' : 'en-US', {
      numeric: 'auto',
    });
    
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    }
  }
}

// Create singleton instance
export const i18n = new I18n();

// Export for convenience
export const t = (key: keyof TranslationKeys, variables?: Record<string, string | number>) =>
  i18n.t(key, variables);
  
export const setLanguage = (lang: Language) => i18n.setLanguage(lang);
export const getLanguage = () => i18n.language;

// Export for debugging
if (import.meta.env.DEV) {
  (window as any).i18n = i18n;
}
