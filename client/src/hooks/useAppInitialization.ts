import { useEffect } from 'react';
import { scrollToTop } from './useScrollToTop';
import { initializeVitals } from '../utils/vitals';
import { initTelegramPrefetch, cleanupTelegramPrefetch } from '@/lib/telegramPrefetch';

export function useAppInitialization() {
  useEffect(() => {
    scrollToTop();
    
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setTimeout(() => scrollToTop(), 100);
      setTimeout(() => scrollToTop(), 300);
    }
  }, []);

  useEffect(() => {
    initializeVitals();
  }, []);

  useEffect(() => {
    initTelegramPrefetch();
    
    return () => {
      cleanupTelegramPrefetch();
    };
  }, []);
}

export default useAppInitialization;
