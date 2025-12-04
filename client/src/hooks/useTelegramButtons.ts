import { useEffect, useCallback, useRef } from 'react';
import { useTelegram } from './useTelegram';

interface ButtonConfig {
  mainButton?: {
    text: string;
    onClick: () => void;
    color?: string;
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
    color?: string;
  };
}

type RouteType = 'showcase' | 'projects' | 'constructor' | 'checkout' | 'profile' | 'demoLanding' | 'demoApp' | 'about' | 'help' | 'review' | 'aiAgent' | 'aiProcess' | 'referral' | 'rewards' | 'earning' | 'other';

export function useTelegramButtons(
  currentRoute: RouteType,
  options?: {
    onOrderProject?: () => void;
    onConsultation?: () => void;
    onShare?: () => void;
    onDownloadPDF?: () => void;
    demoName?: string;
  }
) {
  const { mainButton, secondaryButton, shareApp, openTelegramLink, hapticFeedback } = useTelegram();
  const cleanupRef = useRef<(() => void) | null>(null);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  const handleOrderProject = useCallback(() => {
    hapticFeedback.medium();
    if (options?.onOrderProject) {
      options.onOrderProject();
    } else {
      navigate('/constructor');
    }
  }, [options?.onOrderProject, navigate, hapticFeedback]);

  const handleConsultation = useCallback(() => {
    hapticFeedback.light();
    if (options?.onConsultation) {
      options.onConsultation();
    } else {
      openTelegramLink('https://t.me/web4tgs');
    }
  }, [options?.onConsultation, openTelegramLink, hapticFeedback]);

  const handleShare = useCallback(() => {
    hapticFeedback.medium();
    const demoText = options?.demoName 
      ? `Посмотри демо "${options.demoName}" в Web4TG!`
      : 'Посмотри крутые Mini Apps для бизнеса!';
    shareApp(demoText);
  }, [options?.demoName, shareApp, hapticFeedback]);

  const handleDownloadPDF = useCallback(() => {
    hapticFeedback.light();
    // Redirect to Telegram for personalized commercial proposal
    openTelegramLink('https://t.me/web4tgs?start=proposal');
  }, [openTelegramLink, hapticFeedback]);

  useEffect(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    let config: ButtonConfig = {};

    switch (currentRoute) {
      case 'showcase':
        config = {
          mainButton: {
            text: 'Заказать проект',
            onClick: handleOrderProject,
            color: '#8B5CF6',
          },
          secondaryButton: {
            text: 'Консультация',
            onClick: handleConsultation,
          },
        };
        break;

      case 'projects':
        config = {
          mainButton: {
            text: 'Заказать похожий проект',
            onClick: handleOrderProject,
            color: '#8B5CF6',
          },
          secondaryButton: {
            text: 'Скачать PDF',
            onClick: handleDownloadPDF,
          },
        };
        break;

      case 'demoLanding':
      case 'demoApp':
        config = {
          mainButton: {
            text: 'Хочу такое же',
            onClick: handleOrderProject,
            color: '#10B981',
          },
          secondaryButton: {
            text: 'Поделиться',
            onClick: handleShare,
          },
        };
        break;

      case 'constructor':
        config = {
          mainButton: {
            text: 'Оформить заказ',
            onClick: () => navigate('/checkout'),
            color: '#8B5CF6',
          },
        };
        break;

      case 'checkout':
        break;

      case 'aiAgent':
      case 'aiProcess':
        config = {
          mainButton: {
            text: 'Подключить ИИ-агента',
            onClick: handleOrderProject,
            color: '#8B5CF6',
          },
          secondaryButton: {
            text: 'Консультация',
            onClick: handleConsultation,
          },
        };
        break;

      case 'about':
        config = {
          mainButton: {
            text: 'Начать проект',
            onClick: handleOrderProject,
            color: '#8B5CF6',
          },
          secondaryButton: {
            text: 'Скачать презентацию',
            onClick: handleDownloadPDF,
          },
        };
        break;

      case 'profile':
        config = {
          mainButton: {
            text: 'Пригласить друга',
            onClick: handleShare,
            color: '#10B981',
          },
        };
        break;

      case 'referral':
        config = {
          mainButton: {
            text: 'Пригласить друзей',
            onClick: handleShare,
            color: '#10B981',
          },
        };
        break;

      default:
        break;
    }

    if (config.mainButton) {
      mainButton.show(
        config.mainButton.text,
        config.mainButton.onClick,
        config.mainButton.color
      );
    }

    if (config.secondaryButton) {
      secondaryButton.show(
        config.secondaryButton.text,
        config.secondaryButton.onClick,
        config.secondaryButton.color
      );
    }

    cleanupRef.current = () => {
      mainButton.hide();
      secondaryButton.hide();
    };

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [currentRoute, mainButton, secondaryButton, handleOrderProject, handleConsultation, handleShare, handleDownloadPDF, navigate]);

  return {
    shareApp: handleShare,
    downloadPDF: handleDownloadPDF,
  };
}
