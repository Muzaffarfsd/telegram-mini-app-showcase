import { useEffect, useState, useRef } from 'react';
import { ensureTelegramPolyfill } from '../lib/telegram';

// Telegram WebApp SDK types (complete as per official documentation + 2025 features)
interface SafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// MainButton interface
interface TelegramButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText: (text: string) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
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
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  
  // MainButton & SecondaryButton (Bot API 6.0+)
  MainButton: TelegramButton;
  SecondaryButton: TelegramButton;
  
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
  
  // 2025 Share & Download API
  shareMessage: (msg_id: string, callback?: (success: boolean) => void) => void;
  downloadFile: (params: { url: string; file_name: string }, callback?: (success: boolean) => void) => void;
  
  // Open links
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  
  // Switch inline query
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
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
// Uses CSS variables for better performance and flexibility
const applySafeAreaPadding = (inset: SafeAreaInset) => {
  const root = document.documentElement;
  
  // Set CSS variables for safe area (can be used anywhere in CSS)
  root.style.setProperty('--tg-safe-area-top', `${inset.top}px`);
  root.style.setProperty('--tg-safe-area-bottom', `${inset.bottom}px`);
  root.style.setProperty('--tg-safe-area-left', `${inset.left}px`);
  root.style.setProperty('--tg-safe-area-right', `${inset.right}px`);
  
  // Apply to body for backwards compatibility
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

// Helper to apply viewport height CSS variables
const applyViewportVariables = (tg: TelegramWebApp) => {
  const root = document.documentElement;
  
  // @ts-ignore - These properties exist on TelegramWebApp
  const viewportHeight = tg.viewportHeight || window.innerHeight;
  // @ts-ignore
  const viewportStableHeight = tg.viewportStableHeight || window.innerHeight;
  
  root.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
  root.style.setProperty('--tg-viewport-stable-height', `${viewportStableHeight}px`);
  
  // Also set to CSS viewport units for better compatibility
  root.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
};

// Helper to detect device performance (for adaptive quality)
const detectDevicePerformance = (tg: TelegramWebApp): 'low' | 'medium' | 'high' => {
  // @ts-ignore
  const platform = tg.platform || 'unknown';
  
  // Check if mobile
  const isMobile = /android|ios|iphone|ipad/i.test(platform);
  
  // Basic performance detection based on hardware concurrency
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 4; // GB
  
  if (!isMobile) return 'high'; // Desktop is always high
  if (cores >= 8 && memory >= 6) return 'high';
  if (cores >= 4 && memory >= 4) return 'medium';
  return 'low';
};

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [initData, setInitData] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [themeParams, setThemeParams] = useState<TelegramWebApp['themeParams']>({});
  const [devicePerformance, setDevicePerformance] = useState<'low' | 'medium' | 'high'>('medium');
  
  // 2025 Features State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [safeArea, setSafeArea] = useState<SafeAreaInset>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [contentSafeArea, setContentSafeArea] = useState<SafeAreaInset>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [homeScreenStatus, setHomeScreenStatus] = useState<'unsupported' | 'unknown' | 'added' | 'missed'>('unknown');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      // CRITICAL: Apply polyfill FIRST before using any methods
      ensureTelegramPolyfill();
      
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
      setInitData(tg.initData || '');
      setColorScheme(tg.colorScheme || 'dark');
      setThemeParams(tg.themeParams || {});
      
      // Apply theme on initial load
      applyTelegramTheme(tg);
      
      // CRITICAL: Apply viewport height CSS variables
      applyViewportVariables(tg);
      
      // CRITICAL: Detect device performance for adaptive quality
      const performance = detectDevicePerformance(tg);
      setDevicePerformance(performance);
      console.log('[Performance] Device class:', performance);
      
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
        // Update viewport height variables on viewport change
        applyViewportVariables(tg);
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

  // Track current handlers for cleanup - use refs to persist across renders
  const mainButtonHandlerRef = useRef<(() => void) | null>(null);
  const secondaryButtonHandlerRef = useRef<(() => void) | null>(null);

  // MainButton methods
  const mainButton = {
    show: (text: string, onClick: () => void, color?: string) => {
      if (webApp?.MainButton) {
        // CRITICAL: Remove old handler before adding new one
        if (mainButtonHandlerRef.current) {
          webApp.MainButton.offClick(mainButtonHandlerRef.current);
        }
        
        webApp.MainButton.setText(text);
        if (color) {
          webApp.MainButton.setParams({ color });
        }
        
        // Store and set new handler
        mainButtonHandlerRef.current = onClick;
        webApp.MainButton.onClick(onClick);
        webApp.MainButton.show();
        console.log('[TG API] MainButton shown:', text);
      }
    },
    hide: () => {
      if (webApp?.MainButton) {
        // Remove handler on hide
        if (mainButtonHandlerRef.current) {
          webApp.MainButton.offClick(mainButtonHandlerRef.current);
          mainButtonHandlerRef.current = null;
        }
        webApp.MainButton.hide();
        console.log('[TG API] MainButton hidden');
      }
    },
    setText: (text: string) => {
      if (webApp?.MainButton) {
        webApp.MainButton.setText(text);
      }
    },
    showProgress: () => {
      if (webApp?.MainButton) {
        webApp.MainButton.showProgress(true);
      }
    },
    hideProgress: () => {
      if (webApp?.MainButton) {
        webApp.MainButton.hideProgress();
      }
    },
    isAvailable: !!webApp?.MainButton,
  };

  // SecondaryButton methods
  const secondaryButton = {
    show: (text: string, onClick: () => void, color?: string) => {
      if (webApp?.SecondaryButton) {
        // CRITICAL: Remove old handler before adding new one
        if (secondaryButtonHandlerRef.current) {
          webApp.SecondaryButton.offClick(secondaryButtonHandlerRef.current);
        }
        
        webApp.SecondaryButton.setText(text);
        if (color) {
          webApp.SecondaryButton.setParams({ color });
        }
        
        // Store and set new handler
        secondaryButtonHandlerRef.current = onClick;
        webApp.SecondaryButton.onClick(onClick);
        webApp.SecondaryButton.show();
        console.log('[TG API] SecondaryButton shown:', text);
      }
    },
    hide: () => {
      if (webApp?.SecondaryButton) {
        // Remove handler on hide
        if (secondaryButtonHandlerRef.current) {
          webApp.SecondaryButton.offClick(secondaryButtonHandlerRef.current);
          secondaryButtonHandlerRef.current = null;
        }
        webApp.SecondaryButton.hide();
        console.log('[TG API] SecondaryButton hidden');
      }
    },
    isAvailable: !!webApp?.SecondaryButton,
  };

  // Share message (2025 API)
  const shareApp = (text?: string) => {
    const botUsername = 'web4tg_bot'; // Bot username
    const shareUrl = `https://t.me/${botUsername}/app`;
    const shareText = text || 'Посмотри крутые Mini Apps для бизнеса!';
    
    // Use Telegram's native sharing
    if (webApp?.switchInlineQuery) {
      webApp.switchInlineQuery(shareText, ['users', 'groups', 'channels']);
      console.log('[TG API] Sharing via inline query');
    } else if (webApp?.openTelegramLink) {
      // Fallback: open share dialog
      const encodedText = encodeURIComponent(shareText + '\n' + shareUrl);
      webApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodedText}`);
      console.log('[TG API] Sharing via link');
    } else {
      // Browser fallback
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    }
    hapticFeedback.medium();
  };

  // Download file (2025 API)
  const downloadFile = (url: string, fileName: string) => {
    if (webApp?.downloadFile) {
      webApp.downloadFile({ url, file_name: fileName }, (success) => {
        if (success) {
          console.log('[TG API] File download started:', fileName);
          hapticFeedback.light();
        } else {
          console.warn('[TG API] File download failed');
        }
      });
    } else {
      // Browser fallback
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('[TG API] File download via browser:', fileName);
    }
  };

  // Open external link
  const openLink = (url: string, instantView?: boolean) => {
    if (webApp?.openLink) {
      webApp.openLink(url, { try_instant_view: instantView });
    } else {
      window.open(url, '_blank');
    }
  };

  // Open Telegram link
  const openTelegramLink = (url: string) => {
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
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
    
    // Performance Optimization
    devicePerformance, // 'low' | 'medium' | 'high' for adaptive quality
    
    // MainButton & SecondaryButton
    mainButton,
    secondaryButton,
    
    // Share & Download
    shareApp,
    downloadFile,
    openLink,
    openTelegramLink,
  };
}
