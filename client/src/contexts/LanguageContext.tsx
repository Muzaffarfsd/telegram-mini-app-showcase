import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, startTransition } from 'react';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

import { translations } from '../lib/translations';

const translationCache = new Map<string, Map<string, string>>();

function getTranslation(lang: Language, key: string): string {
  let langCache = translationCache.get(lang);
  if (!langCache) {
    langCache = new Map();
    translationCache.set(lang, langCache);
  }
  
  const cached = langCache.get(key);
  if (cached !== undefined) return cached;
  
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      let fallback: any = translations['ru'];
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          langCache.set(key, key);
          return key;
        }
      }
      const result = typeof fallback === 'string' ? fallback : key;
      langCache.set(key, result);
      return result;
    }
  }
  
  const result = typeof value === 'string' ? value : key;
  langCache.set(key, result);
  return result;
}

// CIS and Russian-speaking region language codes
const CIS_LANGUAGES = ['ru', 'uk', 'be', 'kk', 'uz', 'ky', 'tg', 'az', 'hy', 'ka', 'mo', 'tk'];

function detectLanguageFromRegion(): Language {
  try {
    // 1. Check Telegram user language
    const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code?.toLowerCase();
    if (tgLang) {
      // If user's Telegram language is from CIS region -> Russian
      if (CIS_LANGUAGES.some(code => tgLang.startsWith(code))) {
        return 'ru';
      }
      // Otherwise -> English
      return 'en';
    }
    
    // 2. Fallback to browser language
    const browserLang = navigator.language?.toLowerCase() || '';
    if (CIS_LANGUAGES.some(code => browserLang.startsWith(code))) {
      return 'ru';
    }
    
    // 3. Check timezone for CIS regions
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const cisTimezones = ['Europe/Moscow', 'Europe/Kiev', 'Europe/Minsk', 'Asia/Almaty', 'Asia/Tashkent', 'Asia/Bishkek', 'Asia/Dushanbe', 'Asia/Baku', 'Asia/Yerevan', 'Asia/Tbilisi'];
    if (cisTimezones.some(tz => timezone.includes(tz.split('/')[1]))) {
      return 'ru';
    }
    
    // Default: English for non-CIS users
    return 'en';
  } catch {
    return 'ru';
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      // Check saved preference first
      const saved = localStorage.getItem('app-language');
      if (saved === 'en' || saved === 'ru') return saved;
      
      // Auto-detect based on region
      return detectLanguageFromRegion();
    }
    return 'ru';
  });

  const langRef = useRef(language);
  langRef.current = language;

  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.lang = language;
    
    if (language === 'en') {
      document.documentElement.classList.add('lang-en');
      document.documentElement.classList.remove('lang-ru');
    } else {
      document.documentElement.classList.add('lang-ru');
      document.documentElement.classList.remove('lang-en');
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    startTransition(() => {
      setLanguageState(lang);
    });
  }, []);

  const t = useCallback((key: string): string => {
    return getTranslation(langRef.current, key);
  }, []);

  const value = useMemo(() => ({ 
    language, 
    setLanguage, 
    t 
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { type Language };
