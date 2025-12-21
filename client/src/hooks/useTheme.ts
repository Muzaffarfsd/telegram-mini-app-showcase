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
  const rootEl = document.getElementById('root');
  
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
    root.style.setProperty('--background', '#f8fafc');
    root.style.setProperty('--foreground', '#1e293b');
    root.style.setProperty('--card', 'rgba(255, 255, 255, 0.85)');
    root.style.setProperty('--border', 'rgba(0, 0, 0, 0.08)');
    root.style.setProperty('--glass-background', 'rgba(255, 255, 255, 0.65)');
    root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.05)');
    body.style.backgroundColor = '#f8fafc';
    body.style.color = '#1e293b';
    if (rootEl) {
      rootEl.style.backgroundColor = '#f8fafc';
      rootEl.style.color = '#1e293b';
    }
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    root.style.setProperty('--background', '#0f0f11');
    root.style.setProperty('--foreground', '#FFFFFF');
    root.style.setProperty('--card', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--border', 'rgba(255, 255, 255, 0.2)');
    root.style.setProperty('--glass-background', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
    body.style.backgroundColor = '#0f0f11';
    body.style.color = '#FFFFFF';
    if (rootEl) {
      rootEl.style.backgroundColor = '#0f0f11';
      rootEl.style.color = '#FFFFFF';
    }
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
