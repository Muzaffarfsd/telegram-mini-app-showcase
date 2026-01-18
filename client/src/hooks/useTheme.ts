import { useState, useEffect, useCallback, useRef } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'app-theme';
let lastAppliedTheme: Theme | null = null;

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light') return 'light';
  } catch (e) {}
  return 'dark';
}

function applyTheme(theme: Theme, skipTransitions = false) {
  // Skip if already applied (prevents duplicate work)
  if (lastAppliedTheme === theme) return;
  lastAppliedTheme = theme;
  
  const root = document.documentElement;
  
  // Disable transitions for instant switch
  if (skipTransitions) {
    root.classList.add('no-theme-transition');
  }
  
  // Instant class toggle
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
  root.dataset.theme = theme;
  
  // Re-enable transitions after paint
  if (skipTransitions) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-theme-transition');
      });
    });
  }
  
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
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const isInternalUpdate = useRef(false);

  // Apply theme only on initial mount (not on every state change)
  useEffect(() => {
    applyTheme(theme, false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        if ((newTheme === 'light' || newTheme === 'dark') && newTheme !== theme) {
          isInternalUpdate.current = true;
          applyTheme(newTheme, true);
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
    
    // Apply theme immediately with transitions disabled
    applyTheme(next, true);
    
    // Update React state synchronously (no startTransition)
    isInternalUpdate.current = true;
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: next } }));
    setTheme(next);
  }, [theme]);

  const setThemeValue = useCallback((newTheme: Theme) => {
    if (newTheme !== theme) {
      applyTheme(newTheme, true);
      isInternalUpdate.current = true;
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
      setTheme(newTheme);
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
