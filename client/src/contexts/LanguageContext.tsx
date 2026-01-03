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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-language');
      if (saved === 'en' || saved === 'ru') return saved;
      
      try {
        const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
        if (tgLang === 'en' || tgLang?.startsWith('en')) return 'en';
      } catch {}
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
