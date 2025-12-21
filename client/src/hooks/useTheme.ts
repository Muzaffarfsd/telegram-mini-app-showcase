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
    
    // Core colors - iOS 26 Light Theme
    root.style.setProperty('--background', '#F2F4F6');
    root.style.setProperty('--foreground', '#0F172A');
    root.style.setProperty('--card', 'rgba(255, 255, 255, 0.85)');
    root.style.setProperty('--border', 'rgba(0, 0, 0, 0.08)');
    
    // Glass effects
    root.style.setProperty('--glass-background', 'rgba(255, 255, 255, 0.65)');
    root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.05)');
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.75)');
    root.style.setProperty('--glass-border-color', 'rgba(0, 0, 0, 0.04)');
    root.style.setProperty('--glass-shadow-style', '0 10px 40px -10px rgba(0,0,0,0.08)');
    
    // Liquid blobs
    root.style.setProperty('--liquid-1', '#60A5FA');
    root.style.setProperty('--liquid-2', '#F472B6');
    root.style.setProperty('--liquid-blur', '80px');
    
    // Labels
    root.style.setProperty('--label', '#1e293b');
    root.style.setProperty('--secondary-label', '#64748b');
    root.style.setProperty('--muted-foreground', '#64748b');
    
    // Semantic tokens
    root.style.setProperty('--surface', '#f8fafc');
    root.style.setProperty('--surface-elevated', '#ffffff');
    root.style.setProperty('--text-primary', '#1e293b');
    root.style.setProperty('--text-secondary', '#64748b');
    root.style.setProperty('--text-tertiary', '#94a3b8');
    root.style.setProperty('--text-quaternary', '#cbd5e1');
    root.style.setProperty('--text-inverted', '#ffffff');
    root.style.setProperty('--overlay-weak', 'rgba(0, 0, 0, 0.03)');
    root.style.setProperty('--overlay-medium', 'rgba(0, 0, 0, 0.06)');
    root.style.setProperty('--overlay-strong', 'rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--cta-background', '#3b82f6');
    root.style.setProperty('--cta-foreground', '#ffffff');
    root.style.setProperty('--cta-secondary-border', 'rgba(0, 0, 0, 0.12)');
    root.style.setProperty('--cta-secondary-text', '#1e293b');
    root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.8)');
    root.style.setProperty('--card-border', 'rgba(0, 0, 0, 0.06)');
    root.style.setProperty('--card-hover', 'rgba(255, 255, 255, 0.95)');
    
    // Inline styles for body/root - iOS 26 Light Theme
    body.style.backgroundColor = '#F2F4F6';
    body.style.color = '#0F172A';
    if (rootEl) {
      rootEl.style.backgroundColor = '#F2F4F6';
      rootEl.style.color = '#0F172A';
    }
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    
    // Core colors
    root.style.setProperty('--background', '#0f0f11');
    root.style.setProperty('--foreground', '#FFFFFF');
    root.style.setProperty('--card', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--border', 'rgba(255, 255, 255, 0.2)');
    
    // Glass effects
    root.style.setProperty('--glass-background', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
    root.style.setProperty('--glass-bg', 'rgba(20, 20, 20, 0.6)');
    root.style.setProperty('--glass-border-color', 'rgba(255, 255, 255, 0.08)');
    root.style.setProperty('--glass-shadow-style', '0 0 0 transparent');
    
    // Liquid blobs
    root.style.setProperty('--liquid-1', '#7928CA');
    root.style.setProperty('--liquid-2', '#FF0080');
    root.style.setProperty('--liquid-blur', '120px');
    
    // Labels
    root.style.setProperty('--label', '#FFFFFF');
    root.style.setProperty('--secondary-label', 'rgba(255, 255, 255, 0.7)');
    root.style.setProperty('--muted-foreground', 'rgba(255, 255, 255, 0.7)');
    
    // Semantic tokens
    root.style.setProperty('--surface', '#0f0f11');
    root.style.setProperty('--surface-elevated', '#1a1a1e');
    root.style.setProperty('--text-primary', '#FFFFFF');
    root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.7)');
    root.style.setProperty('--text-tertiary', 'rgba(255, 255, 255, 0.5)');
    root.style.setProperty('--text-quaternary', 'rgba(255, 255, 255, 0.3)');
    root.style.setProperty('--text-inverted', '#000000');
    root.style.setProperty('--overlay-weak', 'rgba(255, 255, 255, 0.05)');
    root.style.setProperty('--overlay-medium', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--overlay-strong', 'rgba(255, 255, 255, 0.15)');
    root.style.setProperty('--cta-background', '#10B981');
    root.style.setProperty('--cta-foreground', '#000000');
    root.style.setProperty('--cta-secondary-border', 'rgba(255, 255, 255, 0.12)');
    root.style.setProperty('--cta-secondary-text', 'rgba(255, 255, 255, 0.85)');
    root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.05)');
    root.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.08)');
    root.style.setProperty('--card-hover', 'rgba(255, 255, 255, 0.1)');
    
    // Inline styles for body/root
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
        tg.setHeaderColor(theme === 'dark' ? '#0f0f11' : '#F2F4F6');
        tg.setBackgroundColor(theme === 'dark' ? '#0f0f11' : '#F2F4F6');
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

  const toggleTheme = useCallback((event?: MouseEvent | React.MouseEvent) => {
    const switchTheme = () => {
      setTheme((prev) => {
        const next = prev === 'dark' ? 'light' : 'dark';
        console.log('[Theme] Toggle:', prev, '->', next);
        return next;
      });
    };

    // Set click position for animation
    if (event) {
      const x = event.clientX;
      const y = event.clientY;
      document.documentElement.style.setProperty('--click-x', `${x}px`);
      document.documentElement.style.setProperty('--click-y', `${y}px`);
    }

    // Use View Transitions API if available (Chrome 111+, Safari 18+)
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        switchTheme();
      });
    } else {
      switchTheme();
    }
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
