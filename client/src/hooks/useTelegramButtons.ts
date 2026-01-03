import { useEffect, useCallback, useRef } from 'react';
import { useTelegram } from './useTelegram';
import { useLanguage } from '../contexts/LanguageContext';

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

type RouteType = 'showcase' | 'projects' | 'constructor' | 'checkout' | 'profile' | 'demoLanding' | 'demoApp' | 'about' | 'help' | 'review' | 'aiAgent' | 'aiProcess' | 'referral' | 'rewards' | 'earning' | 'photoGallery' | 'other';

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
  const { t, language } = useLanguage();
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
      ? (language === 'en' ? `Check out "${options.demoName}" demo in Web4TG!` : `Посмотри демо "${options.demoName}" в Web4TG!`)
      : (language === 'en' ? 'Check out cool Mini Apps for business!' : 'Посмотри крутые Mini Apps для бизнеса!');
    shareApp(demoText);
  }, [options?.demoName, shareApp, hapticFeedback, language]);

  const handleDownloadPDF = useCallback(() => {
    hapticFeedback.light();
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
        // Без нативных кнопок на главном экране
        break;

      case 'projects':
        config = {
          mainButton: {
            text: t('telegramButtons.orderProject'),
            onClick: handleOrderProject,
            color: '#8B5CF6',
          },
          secondaryButton: {
            text: t('telegramButtons.share'),
            onClick: handleShare,
          },
        };
        break;

      case 'demoLanding':
      case 'demoApp':
        config = {
          mainButton: {
            text: t('telegramButtons.wantSame'),
            onClick: handleOrderProject,
            color: '#10B981',
          },
          secondaryButton: {
            text: t('telegramButtons.share'),
            onClick: handleShare,
          },
        };
        break;

      case 'constructor':
        config = {
          mainButton: {
            text: t('telegramButtons.placeOrder'),
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
            text: t('telegramButtons.connectAI'),
            onClick: handleOrderProject,
            color: '#8B5CF6',
          },
          secondaryButton: {
            text: t('telegramButtons.consultation'),
            onClick: handleConsultation,
          },
        };
        break;

      case 'about':
        config = {
          mainButton: {
            text: t('telegramButtons.startProject'),
            onClick: handleOrderProject,
            color: '#8B5CF6',
          },
          secondaryButton: {
            text: t('telegramButtons.consultation'),
            onClick: handleConsultation,
          },
        };
        break;

      case 'profile':
        config = {
          mainButton: {
            text: t('telegramButtons.inviteFriend'),
            onClick: handleShare,
            color: '#10B981',
          },
        };
        break;

      case 'referral':
      case 'rewards':
      case 'earning':
        config = {
          mainButton: {
            text: t('telegramButtons.inviteFriends'),
            onClick: handleShare,
            color: '#10B981',
          },
        };
        break;

      case 'help':
      case 'review':
        config = {
          mainButton: {
            text: t('telegramButtons.contactUs'),
            onClick: handleConsultation,
            color: '#8B5CF6',
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
  }, [currentRoute, mainButton, secondaryButton, handleOrderProject, handleConsultation, handleShare, handleDownloadPDF, navigate, language, t]);

  return {
    shareApp: handleShare,
    downloadPDF: handleDownloadPDF,
  };
}
