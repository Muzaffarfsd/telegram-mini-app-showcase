import { useEffect } from 'react';
import WebApp from '../lib/telegramSdk';
import { useLocation } from 'wouter';

export function useBackButton() {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (location !== '/') {
      WebApp.BackButton.show();
    } else {
      WebApp.BackButton.hide();
    }
    
    const handleBack = () => {
      window.history.back();
    };
    
    WebApp.BackButton.onClick(handleBack);
    
    return () => {
      WebApp.BackButton.offClick(handleBack);
      WebApp.BackButton.hide();
    };
  }, [location]);
}
