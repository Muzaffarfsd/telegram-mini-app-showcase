import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegramViewport() {
  useEffect(() => {
    const updateViewport = () => {
      const vh = WebApp.viewportHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      if (WebApp.platform === 'ios') {
        const safeAreaTop = WebApp.safeAreaInset.top;
        const safeAreaBottom = WebApp.safeAreaInset.bottom;
        
        document.documentElement.style.setProperty('--sat', `${safeAreaTop}px`);
        document.documentElement.style.setProperty('--sab', `${safeAreaBottom}px`);
      }
    };
    
    updateViewport();
    
    WebApp.onEvent('viewportChanged', updateViewport);
    
    return () => {
      WebApp.offEvent('viewportChanged', updateViewport);
    };
  }, []);
}
