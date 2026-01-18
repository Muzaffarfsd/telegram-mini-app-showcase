import { useState, useEffect, useCallback, useRef, startTransition } from 'react';

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
  
  // Instant class toggle for immediate visual feedback
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
  root.dataset.theme = theme;
  
  // Defer non-critical operations
  requestIdleCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp as any;
      const bgColor = theme === 'dark' ? '#000000' : '#F2F4F6';
      try {
        if (typeof tg.setHeaderColor === 'function') {
          tg.setHeaderColor(bgColor);
        }
        if (typeof tg.setBackgroundColor === 'function') {
          tg.setBackgroundColor(bgColor);
        }
        if (typeof tg.setBottomBarColor === 'function') {
          tg.setBottomBarColor(bgColor);
        }
      } catch (e) {}
    }
  }, { timeout: 100 });
  
  console.log('[Theme] Applied:', theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        if ((newTheme === 'light' || newTheme === 'dark') && newTheme !== theme) {
          isInternalUpdate.current = true;
          setTheme(newTheme);
        }
      }
    };

    const handleThemeChange = (e: CustomEvent<{ theme: Theme }>) => {
      if (!isInternalUpdate.current && e.detail.theme !== theme) {
        setTheme(e.detail.theme);
      }
      isInternalUpdate.current = false;
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    
    // Apply theme immediately to DOM for instant visual feedback
    applyTheme(next);
    
    // Update React state with low priority
    startTransition(() => {
      isInternalUpdate.current = true;
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: next } }));
      setTheme(next);
    });
  }, [theme]);

  const setThemeValue = useCallback((newTheme: Theme) => {
    if (newTheme !== theme) {
      applyTheme(newTheme);
      startTransition(() => {
        isInternalUpdate.current = true;
        window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
        setTheme(newTheme);
      });
    }
  }, [theme]);

  return { 
    theme, 
    toggleTheme, 
    setTheme: setThemeValue,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}
