import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light') return 'light';
  } catch (e) {}
  return 'dark';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const body = document.body;
  
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
    body.style.backgroundColor = '#f8fafc';
    body.style.color = '#1e293b';
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    body.style.backgroundColor = '#0f0f11';
    body.style.color = '#ffffff';
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {}

  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp as any;
    try {
      if (typeof tg.setHeaderColor === 'function') {
        tg.setHeaderColor(theme === 'dark' ? '#0f0f11' : '#f8fafc');
        tg.setBackgroundColor(theme === 'dark' ? '#0f0f11' : '#f8fafc');
      }
    } catch (e) {}
  }
  
  console.log('[Theme] Applied:', theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      console.log('[Theme] Toggle:', prev, '->', next);
      return next;
    });
  }, []);

  const setThemeValue = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  return { 
    theme, 
    toggleTheme, 
    setTheme: setThemeValue,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}
