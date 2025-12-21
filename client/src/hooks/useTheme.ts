import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'app-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem(STORAGE_KEY) as Theme;
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    localStorage.setItem(STORAGE_KEY, theme);

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp as any;
      try {
        if (typeof tg.setHeaderColor === 'function') {
          if (theme === 'dark') {
            tg.setHeaderColor('#0f0f11');
            tg.setBackgroundColor('#0f0f11');
          } else {
            tg.setHeaderColor('#f8fafc');
            tg.setBackgroundColor('#f8fafc');
          }
        }
      } catch (e) {
        console.warn('[Theme] Failed to set Telegram colors:', e);
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setThemeValue = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  return { 
    theme, 
    toggleTheme, 
    setTheme: setThemeValue,
    isDark,
    isLight,
  };
}
