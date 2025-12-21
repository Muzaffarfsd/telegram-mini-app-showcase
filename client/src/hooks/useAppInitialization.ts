import { useEffect } from 'react';
import { scrollToTop } from './useScrollToTop';
import { initializeVitals } from '../utils/vitals';
import { initTelegramPrefetch, cleanupTelegramPrefetch } from '@/lib/telegramPrefetch';
import { setLastVisit, getLastVisit, getStorageInfo } from '@/lib/telegramStorage';

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

  useEffect(() => {
    const initStorage = async () => {
      const storageInfo = getStorageInfo();
      console.log('[Storage] Initialized:', storageInfo);
      
      const lastVisit = await getLastVisit();
      if (lastVisit) {
        const hoursSinceLastVisit = (Date.now() - lastVisit) / (1000 * 60 * 60);
        console.log(`[Storage] Last visit: ${hoursSinceLastVisit.toFixed(1)} hours ago`);
      }
      
      await setLastVisit();
    };
    
    initStorage();
  }, []);
}

export default useAppInitialization;
