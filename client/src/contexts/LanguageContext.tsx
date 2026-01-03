import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import translations
import { translations } from '../lib/translations';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-language');
      if (saved === 'en' || saved === 'ru') return saved;
      
      // Try to detect from Telegram
      try {
        const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
        if (tgLang === 'en' || tgLang?.startsWith('en')) return 'en';
      } catch {}
    }
    return 'ru';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.lang = language;
    
    // Update font based on language
    if (language === 'en') {
      document.documentElement.classList.add('lang-en');
      document.documentElement.classList.remove('lang-ru');
    } else {
      document.documentElement.classList.add('lang-ru');
      document.documentElement.classList.remove('lang-en');
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Russian if key not found
        let fallback: any = translations['ru'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if not found in fallback
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
