import { useCallback } from 'react';

// Simplified hook - only provides manual edge bounce trigger
// All automatic detection removed to prevent conflicts with other gesture handlers
export function useScrollHaptic() {
  const triggerEdgeBounce = useCallback(() => {
    try {
      const webApp = window.Telegram?.WebApp;
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('heavy');
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch {
      // Silent fail
    }
  }, []);

  const setEnabled = useCallback(() => {
    // No-op for compatibility
  }, []);

  return {
    setEnabled,
    triggerEdgeBounce,
  };
}
