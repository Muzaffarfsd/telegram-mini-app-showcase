import WebApp from '@twa-dev/sdk';

/**
 * Ensure Telegram WebView 7.7+ polyfill is applied
 * Call this BEFORE using any WebApp methods
 */
export function ensureTelegramPolyfill() {
  if (!window.Telegram?.WebApp) {
    return;
  }

  const tg = window.Telegram.WebApp;

  // Check if already polyfilled
  if ((tg as any).__polyfilled) {
    return;
  }

  console.log('[Telegram Polyfill] Applying WebView 7.7+ API');

  // Override version check
  const originalIsVersionAtLeast = tg.isVersionAtLeast;
  tg.isVersionAtLeast = function(version: string) {
    return true; // Always return true in dev
  };

  // Add missing methods
  if (!tg.disableVerticalSwipes) {
    tg.disableVerticalSwipes = () => console.log('[Polyfill] disableVerticalSwipes()');
    tg.enableVerticalSwipes = () => console.log('[Polyfill] enableVerticalSwipes()');
  }

  if (!tg.requestFullscreen) {
    (tg as any).isFullscreen = false;
    tg.requestFullscreen = () => {
      (tg as any).isFullscreen = true;
      console.log('[Polyfill] requestFullscreen()');
    };
    tg.exitFullscreen = () => {
      (tg as any).isFullscreen = false;
      console.log('[Polyfill] exitFullscreen()');
    };
  }

  if (!(tg as any).setHeaderColor) {
    (tg as any).setHeaderColor = (color: string) => console.log('[Polyfill] setHeaderColor(' + color + ')');
  }

  if (!(tg as any).setBottomBarColor) {
    (tg as any).setBottomBarColor = (color: string) => console.log('[Polyfill] setBottomBarColor(' + color + ')');
  }

  (tg as any).__polyfilled = true;
  console.log('[Telegram Polyfill] ✅ Ready');
}

export function initTelegramWebApp() {
  // CRITICAL: Apply polyfill FIRST before any WebApp API usage
  ensureTelegramPolyfill();
  
  // Use native Telegram API (not @twa-dev/sdk wrapper) after polyfill
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    console.warn('[Telegram] WebApp not available');
    return WebApp; // Fallback to SDK
  }
  
  // ready() and expand() already called in index.html for instant load
  
  // Continue with other setup - use native API to avoid SDK version checks
  
  // Request fullscreen mode (hides bot name header)
  if (typeof tg.requestFullscreen === 'function') {
    tg.requestFullscreen();
  }
  
  // Make header transparent/invisible by matching background
  if (typeof (tg as any).setHeaderColor === 'function') {
    (tg as any).setHeaderColor('bg_color');
  }
  if (typeof (tg as any).setBackgroundColor === 'function') {
    (tg as any).setBackgroundColor('#0A0A0B');
  }
  
  // Disable vertical swipes to prevent accidental close
  if (typeof tg.disableVerticalSwipes === 'function') {
    tg.disableVerticalSwipes();
  }
  
  // Lock orientation for better UX
  if (typeof (tg as any).lockOrientation === 'function') {
    (tg as any).lockOrientation();
  }
  
  // Set viewport height for full screen experience
  if (WebApp.platform === 'ios' || WebApp.platform === 'android') {
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${WebApp.viewportHeight}px`
    );
    
    // Update on viewport changes
    WebApp.onEvent('viewportChanged', () => {
      document.documentElement.style.setProperty(
        '--viewport-height',
        `${WebApp.viewportHeight}px`
      );
    });
  }
  
  // Maximize safe area usage
  document.documentElement.style.setProperty(
    '--safe-area-inset-top',
    '0px'
  );
  
  return WebApp;
}

class HapticManager {
  private lastHaptic = 0;
  private readonly throttleTime = 50;
  private enabled = true;
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  
  light() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastHaptic < this.throttleTime) return;
    
    try {
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (e) {
      console.debug('[Haptic] Not available');
    }
    this.lastHaptic = now;
  }
  
  medium() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastHaptic < this.throttleTime) return;
    
    try {
      WebApp.HapticFeedback.impactOccurred('medium');
    } catch (e) {
      console.debug('[Haptic] Not available');
    }
    this.lastHaptic = now;
  }
  
  heavy() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastHaptic < this.throttleTime) return;
    
    try {
      WebApp.HapticFeedback.impactOccurred('heavy');
    } catch (e) {
      console.debug('[Haptic] Not available');
    }
    this.lastHaptic = now;
  }
  
  success() {
    if (!this.enabled) return;
    try {
      WebApp.HapticFeedback.notificationOccurred('success');
    } catch (e) {
      console.debug('[Haptic] Not available');
    }
  }
  
  error() {
    if (!this.enabled) return;
    try {
      WebApp.HapticFeedback.notificationOccurred('error');
    } catch (e) {
      console.debug('[Haptic] Not available');
    }
  }
  
  warning() {
    if (!this.enabled) return;
    try {
      WebApp.HapticFeedback.notificationOccurred('warning');
    } catch (e) {
      console.debug('[Haptic] Not available');
    }
  }
  
  selection() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastHaptic < this.throttleTime) return;
    
    try {
      WebApp.HapticFeedback.selectionChanged();
    } catch (e) {
      console.debug('[Haptic] Not available');
    }
    this.lastHaptic = now;
  }
}

export const haptic = new HapticManager();

export interface ShareMessageOptions {
  text: string;
  parseMode?: 'HTML' | 'Markdown';
}

export async function shareMessage(options: ShareMessageOptions): Promise<boolean> {
  const tg = window.Telegram?.WebApp;
  if (!tg || typeof (tg as any).shareMessage !== 'function') {
    console.warn('[Telegram] shareMessage not supported');
    return false;
  }
  
  try {
    haptic.medium();
    await (tg as any).shareMessage(options);
    return true;
  } catch (error) {
    console.error('[Telegram] shareMessage failed:', error);
    return false;
  }
}

export function isShareMessageSupported(): boolean {
  const tg = window.Telegram?.WebApp;
  return !!(tg && typeof (tg as any).shareMessage === 'function');
}
