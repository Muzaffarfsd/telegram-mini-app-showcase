import { useEffect } from 'react';
import { navigate } from './useRouting';

interface UseTelegramBackButtonOptions {
  routeComponent: string;
  onCheckoutBack?: () => void;
  hapticFeedback: {
    light: () => void;
  };
}

export function useTelegramBackButtonHandler({
  routeComponent,
  onCheckoutBack,
  hapticFeedback,
}: UseTelegramBackButtonOptions) {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const isMainPage = routeComponent === 'showcase';
    
    if (!isMainPage) {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }

    const handleBackButton = () => {
      hapticFeedback.light();
      
      if (routeComponent === 'checkout') {
        if (onCheckoutBack) {
          onCheckoutBack();
        } else {
          navigate('/constructor');
        }
      } else if (routeComponent === 'demoApp' || routeComponent === 'demoLanding') {
        navigate('/');
      } else if (routeComponent === 'help' || routeComponent === 'review') {
        navigate('/profile');
      } else {
        navigate('/');
      }
    };

    tg.BackButton.onClick(handleBackButton);

    return () => {
      tg.BackButton.offClick(handleBackButton);
    };
  }, [routeComponent, hapticFeedback, onCheckoutBack]);
}

export default useTelegramBackButtonHandler;
