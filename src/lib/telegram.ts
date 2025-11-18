import WebApp from '@twa-dev/sdk';

export function initTelegramWebApp() {
  // ready() and expand() already called in index.html for instant load
  
  // Continue with other setup
  
  // Request fullscreen mode (hides bot name header)
  try {
    if (WebApp.requestFullscreen) {
      WebApp.requestFullscreen();
    }
  } catch (e) {
    console.debug('[Telegram] Fullscreen not supported');
  }
  
  // Make header transparent/invisible by matching background
  WebApp.setHeaderColor('bg_color');
  WebApp.setBackgroundColor('#0A0A0B');
  
  // Disable vertical swipes to prevent accidental close
  WebApp.disableVerticalSwipes();
  
  // Lock orientation for better UX
  try {
    if (WebApp.lockOrientation) {
      WebApp.lockOrientation();
    }
  } catch (e) {
    console.debug('[Telegram] Orientation lock not supported');
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
