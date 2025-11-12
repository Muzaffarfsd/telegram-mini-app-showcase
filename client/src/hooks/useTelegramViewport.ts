import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegramViewport() {
  useEffect(() => {
    const updateViewport = () => {
      // Viewport height
      const vh = WebApp.viewportHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Safe Area Insets (всегда устанавливаем для всех платформ)
      const safeAreaTop = WebApp.safeAreaInset?.top || 0;
      const safeAreaBottom = WebApp.safeAreaInset?.bottom || 0;
      const safeAreaLeft = WebApp.safeAreaInset?.left || 0;
      const safeAreaRight = WebApp.safeAreaInset?.right || 0;
      
      document.documentElement.style.setProperty('--sat', `${safeAreaTop}px`);
      document.documentElement.style.setProperty('--sab', `${safeAreaBottom}px`);
      document.documentElement.style.setProperty('--sal', `${safeAreaLeft}px`);
      document.documentElement.style.setProperty('--sar', `${safeAreaRight}px`);
      
      // Content Safe Area Insets (для учета Telegram UI элементов)
      const contentSafeAreaTop = WebApp.contentSafeAreaInset?.top || 0;
      const contentSafeAreaBottom = WebApp.contentSafeAreaInset?.bottom || 0;
      const contentSafeAreaLeft = WebApp.contentSafeAreaInset?.left || 0;
      const contentSafeAreaRight = WebApp.contentSafeAreaInset?.right || 0;
      
      document.documentElement.style.setProperty('--csat', `${contentSafeAreaTop}px`);
      document.documentElement.style.setProperty('--csab', `${contentSafeAreaBottom}px`);
      document.documentElement.style.setProperty('--csal', `${contentSafeAreaLeft}px`);
      document.documentElement.style.setProperty('--csar', `${contentSafeAreaRight}px`);
    };
    
    updateViewport();
    
    WebApp.onEvent('viewportChanged', updateViewport);
    WebApp.onEvent('safeAreaChanged', updateViewport);
    WebApp.onEvent('contentSafeAreaChanged', updateViewport);
    
    return () => {
      WebApp.offEvent('viewportChanged', updateViewport);
      WebApp.offEvent('safeAreaChanged', updateViewport);
      WebApp.offEvent('contentSafeAreaChanged', updateViewport);
    };
  }, []);
}
