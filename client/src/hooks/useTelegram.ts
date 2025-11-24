import { useEffect, useState } from 'react';

// Telegram WebApp SDK types (complete as per official documentation + 2025 features)
interface SafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

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
      photo_url?: string;
    };
  };
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  
  // 2025 Full-Screen Mode API
  requestFullscreen: () => void;
  exitFullscreen: () => void;
  isFullscreen: boolean;
  
  // 2025 Safe Area API
  safeAreaInset: SafeAreaInset;
  contentSafeAreaInset: SafeAreaInset;
  
  // 2025 Home Screen Shortcuts API
  addToHomeScreen: () => void;
  checkHomeScreenStatus: (callback: (status: 'unsupported' | 'unknown' | 'added' | 'missed') => void) => void;
  
  // Version checking
  isVersionAtLeast: (version: string) => boolean;
  
  // Swipe behavior control (Bot API 7.7+)
  disableVerticalSwipes: () => void;
  enableVerticalSwipes: () => void;
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

// Helper to apply safe area padding dynamically (2025 API)
const applySafeAreaPadding = (inset: SafeAreaInset) => {
  const body = document.body;
  body.style.paddingTop = `${inset.top}px`;
  body.style.paddingBottom = `${inset.bottom}px`;
  body.style.paddingLeft = `${inset.left}px`;
  body.style.paddingRight = `${inset.right}px`;
  console.log('[2025 API] Applied safe area padding:', inset);
};

// Helper to reset safe area padding on cleanup
const resetSafeAreaPadding = () => {
  const body = document.body;
  body.style.paddingTop = '';
  body.style.paddingBottom = '';
  body.style.paddingLeft = '';
  body.style.paddingRight = '';
  console.log('[2025 API] Reset safe area padding');
};

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [initData, setInitData] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [themeParams, setThemeParams] = useState<TelegramWebApp['themeParams']>({});
  
  // 2025 Features State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [safeArea, setSafeArea] = useState<SafeAreaInset>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [contentSafeArea, setContentSafeArea] = useState<SafeAreaInset>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [homeScreenStatus, setHomeScreenStatus] = useState<'unsupported' | 'unknown' | 'added' | 'missed'>('unknown');

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
      
      // Initialize fullscreen state (2025)
      if (typeof tg.isFullscreen !== 'undefined') {
        setIsFullscreen(tg.isFullscreen);
      }
      
      // Initialize Safe Area Insets (2025) - CRITICAL for native UI compatibility
      if (tg.safeAreaInset) {
        setSafeArea(tg.safeAreaInset);
        applySafeAreaPadding(tg.safeAreaInset);
      }
      
      // Initialize Content Safe Area Inset (2025)
      if (tg.contentSafeAreaInset) {
        setContentSafeArea(tg.contentSafeAreaInset);
      }
      
      // Listen for theme changes and reapply CSS variables
      const handleThemeChange = () => {
        setColorScheme(tg.colorScheme || 'dark');
        setThemeParams(tg.themeParams || {});
        // Critical: reapply theme CSS variables on change
        applyTelegramTheme(tg);
      };
      
      // Listen for fullscreen changes (2025)
      const handleFullscreenChange = () => {
        if (typeof tg.isFullscreen !== 'undefined') {
          setIsFullscreen(tg.isFullscreen);
          console.log('[2025 API] Fullscreen:', tg.isFullscreen);
        }
      };
      
      // Listen for home screen status changes (2025)
      const handleHomeScreenAdded = () => {
        setHomeScreenStatus('added');
        console.log('[2025 API] Home Screen: Added');
      };
      
      // Listen for safe area changes (2025) - rotation, viewport resize, etc.
      const handleSafeAreaChanged = () => {
        if (tg.safeAreaInset) {
          setSafeArea(tg.safeAreaInset);
          applySafeAreaPadding(tg.safeAreaInset);
          console.log('[2025 API] Safe Area Updated:', tg.safeAreaInset);
        }
        if (tg.contentSafeAreaInset) {
          setContentSafeArea(tg.contentSafeAreaInset);
        }
      };
      
      // Listen for viewport changes (2025) - may also affect safe area
      const handleViewportChanged = () => {
        if (tg.safeAreaInset) {
          setSafeArea(tg.safeAreaInset);
          applySafeAreaPadding(tg.safeAreaInset);
        }
        if (tg.contentSafeAreaInset) {
          setContentSafeArea(tg.contentSafeAreaInset);
        }
        console.log('[2025 API] Viewport Changed');
      };
      
      tg.onEvent('themeChanged', handleThemeChange);
      tg.onEvent('fullscreenChanged', handleFullscreenChange);
      tg.onEvent('homeScreenAdded', handleHomeScreenAdded);
      tg.onEvent('safeAreaChanged', handleSafeAreaChanged);
      tg.onEvent('viewportChanged', handleViewportChanged);
      
      tg.ready();
      tg.expand();
      
      // CRITICAL FIX: Disable vertical swipes to prevent app collapse on scroll (Bot API 7.7+)
      // This prevents Telegram from interpreting downward scroll as "close app" gesture
      if (typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast('7.7')) {
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
          console.log('[Telegram] Vertical swipes disabled - smooth scrolling enabled');
        }
      }
      
      return () => {
        // Cleanup event listeners
        tg.offEvent('themeChanged', handleThemeChange);
        tg.offEvent('fullscreenChanged', handleFullscreenChange);
        tg.offEvent('homeScreenAdded', handleHomeScreenAdded);
        tg.offEvent('safeAreaChanged', handleSafeAreaChanged);
        tg.offEvent('viewportChanged', handleViewportChanged);
        
        // Cleanup body padding to prevent stale styles
        resetSafeAreaPadding();
      };
    }
  }, []);

  const hapticFeedback = {
    light: () => webApp?.HapticFeedback.impactOccurred('light'),
    medium: () => webApp?.HapticFeedback.impactOccurred('medium'),
    heavy: () => webApp?.HapticFeedback.impactOccurred('heavy'),
    selection: () => webApp?.HapticFeedback.selectionChanged(),
  };

  // 2025 Full-Screen Mode methods
  const fullscreen = {
    request: () => {
      if (webApp?.requestFullscreen) {
        webApp.requestFullscreen();
        console.log('[2025 API] Requesting fullscreen...');
      } else {
        console.warn('[2025 API] Full-screen mode not supported');
      }
    },
    exit: () => {
      if (webApp?.exitFullscreen) {
        webApp.exitFullscreen();
        console.log('[2025 API] Exiting fullscreen...');
      }
    },
    isActive: isFullscreen,
  };

  // 2025 Home Screen Shortcuts methods
  const homeScreen = {
    add: () => {
      if (webApp?.addToHomeScreen) {
        webApp.addToHomeScreen();
        console.log('[2025 API] Adding to home screen...');
      } else {
        console.warn('[2025 API] Home screen shortcuts not supported');
      }
    },
    checkStatus: () => {
      if (webApp?.checkHomeScreenStatus) {
        webApp.checkHomeScreenStatus((status) => {
          setHomeScreenStatus(status);
          console.log('[2025 API] Home screen status:', status);
        });
      }
    },
    status: homeScreenStatus,
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
    
    // 2025 Features
    fullscreen,
    homeScreen,
    safeArea,
    contentSafeArea,
  };
}
