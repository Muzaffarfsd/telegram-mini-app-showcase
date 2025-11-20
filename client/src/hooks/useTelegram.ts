import { useEffect, useState } from 'react';

// Telegram WebApp SDK types (complete as per official documentation)
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initData: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    header_bg_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    subtitle_text_color?: string;
    destructive_text_color?: string;
    accent_text_color?: string;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    selectionChanged: () => void;
  };
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Helper to apply Telegram theme colors to CSS custom properties
const applyTelegramTheme = (tg: TelegramWebApp) => {
  const root = document.documentElement;
  const isDark = tg.colorScheme === 'dark';
  
  // Neon accent colors for 2025 dark mode (adapt to light mode)
  root.style.setProperty('--tg-theme-accent', isDark ? '#00ffff' : '#0088cc'); // Cyan neon
  root.style.setProperty('--tg-theme-accent-2', isDark ? '#ff00ff' : '#cc0088'); // Magenta neon
  root.style.setProperty('--tg-theme-accent-3', isDark ? '#39ff14' : '#10B981'); // Neon green
  root.style.setProperty('--tg-theme-bg', tg.themeParams.bg_color || (isDark ? '#0A0A0A' : '#ffffff'));
  root.style.setProperty('--tg-theme-text', tg.themeParams.text_color || (isDark ? '#ffffff' : '#000000'));
  
  // Apply additional theme params if available
  if (tg.themeParams.button_color) {
    root.style.setProperty('--tg-theme-button', tg.themeParams.button_color);
  }
  if (tg.themeParams.section_bg_color) {
    root.style.setProperty('--tg-theme-section-bg', tg.themeParams.section_bg_color);
  }
};

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [initData, setInitData] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [themeParams, setThemeParams] = useState<TelegramWebApp['themeParams']>({});

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
      setInitData(tg.initData || '');
      setColorScheme(tg.colorScheme || 'dark');
      setThemeParams(tg.themeParams || {});
      
      // Apply theme on initial load
      applyTelegramTheme(tg);
      
      // Listen for theme changes and reapply CSS variables
      const handleThemeChange = () => {
        setColorScheme(tg.colorScheme || 'dark');
        setThemeParams(tg.themeParams || {});
        // Critical: reapply theme CSS variables on change
        applyTelegramTheme(tg);
      };
      
      tg.onEvent('themeChanged', handleThemeChange);
      
      tg.ready();
      tg.expand();
      
      return () => {
        tg.offEvent('themeChanged', handleThemeChange);
      };
    }
  }, []);

  const hapticFeedback = {
    light: () => webApp?.HapticFeedback.impactOccurred('light'),
    medium: () => webApp?.HapticFeedback.impactOccurred('medium'),
    heavy: () => webApp?.HapticFeedback.impactOccurred('heavy'),
    selection: () => webApp?.HapticFeedback.selectionChanged(),
  };

  return {
    webApp,
    user,
    initData,
    colorScheme,
    themeParams,
    hapticFeedback,
    isAvailable: !!webApp,
    isDark: colorScheme === 'dark',
  };
}
