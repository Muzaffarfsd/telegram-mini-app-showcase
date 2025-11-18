import { useCallback, useEffect, useState } from 'react';
import { useTelegram } from './useTelegram';

interface HapticManagerConfig {
  enabled: boolean;
  soundEnabled: boolean;
  visualEnabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
}

const defaultConfig: HapticManagerConfig = {
  enabled: true,
  soundEnabled: true,
  visualEnabled: true,
  intensity: 'medium'
};

export const useHapticManager = (config: Partial<HapticManagerConfig> = {}) => {
  const { hapticFeedback, isAvailable } = useTelegram();
  const [settings, setSettings] = useState<HapticManagerConfig>({
    ...defaultConfig,
    ...config
  });
  
  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('haptic-settings');
    if (saved) {
      try {
        setSettings({ ...defaultConfig, ...JSON.parse(saved) });
      } catch (error) {
        console.error('[Haptic Manager] Failed to load settings:', error);
      }
    }
  }, []);
  
  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<HapticManagerConfig>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('haptic-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Play haptic feedback with optional sound and visual
  const trigger = useCallback((
    type: 'light' | 'medium' | 'heavy' | 'selection' = 'medium',
    options: { sound?: boolean; visual?: boolean } = {}
  ) => {
    if (!settings.enabled) return;
    
    // Haptic feedback
    if (isAvailable && hapticFeedback[type]) {
      hapticFeedback[type]();
    } else {
      // Fallback for non-Telegram environments (browser vibration)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const patterns = {
          light: 10,
          medium: 20,
          heavy: 50,
          selection: 5
        };
        navigator.vibrate(patterns[type]);
      }
    }
    
    // Sound feedback
    if ((options.sound ?? settings.soundEnabled) && typeof Audio !== 'undefined') {
      const sounds = {
        light: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OWeSwkPU6bn77RgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSA==',
        medium: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OWeSwkPU6bn77RgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSA==',
        heavy: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OWeSwkPU6bn77RgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSA==',
        selection: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OWeSwkPU6bn77RgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSKLh8r9pHQUsgs/y2Ik3CBlouu3mnUwJDlSm5/G1YRoFO5PZ88x6KgQlecXv3o0+CRJcserrq1IUCkii4fK/aR0FLIHO8tmJNwgZaLrw5Z5MCQ5Upufxs2AaBTuT2fPMeioEJXnF796NPgkSXLHq66tSFApIouHyv2kdBSyBzvLZiTcIGWi68OWeSwkPU6bn8bVgGgU7k9r0y3kpBCR1xe/fjj8JE12y5uurUxMKSA=='
      };
      
      try {
        const audio = new Audio(sounds[type]);
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors
      } catch (error) {
        // Silently fail
      }
    }
    
    // Visual feedback
    if ((options.visual ?? settings.visualEnabled) && typeof document !== 'undefined') {
      const pulse = document.createElement('div');
      pulse.className = 'haptic-pulse';
      pulse.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        margin: -50px 0 0 -50px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
        pointer-events: none;
        z-index: 9999;
        animation: haptic-pulse 0.6s ease-out;
      `;
      
      document.body.appendChild(pulse);
      setTimeout(() => pulse.remove(), 600);
    }
  }, [settings, isAvailable, hapticFeedback]);
  
  return {
    trigger,
    settings,
    updateSettings,
    isAvailable
  };
};

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes haptic-pulse {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
