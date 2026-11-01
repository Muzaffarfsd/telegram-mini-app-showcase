import { useEffect, useCallback, useRef } from 'react';
import { useTelegram } from './useTelegram';
import { useLanguage } from '../contexts/LanguageContext';

interface ButtonConfig {
  mainButton?: {
    text: string;
    onClick: () => void;
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
}

type RouteType = 'showcase' | 'projects' | 'constructor' | 'checkout' | 'profile' | 'demoLanding' | 'demoApp' | 'about' | 'help' | 'review' | 'aiAgent' | 'aiProcess' | 'referral' | 'rewards' | 'earning' | 'photoGallery' | 'other';

const NATIVE_BUTTON_COLOR = '#FFFFFF';
const NATIVE_BUTTON_TEXT_COLOR = '#1C1C1E';

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
            text: document.querySelector('.order-page')?.getAttribute('data-order-step') === '3'
              ? (language === 'ru' ? 'Открыть заявку' : 'Open request')
              : (language === 'ru' ? 'Продолжить' : 'Continue'),
            onClick: () => window.dispatchEvent(new Event('web4tg:order-continue')),
          },
        };
        break;

      case 'checkout':
        break;

      case 'aiAgent':
      case 'aiProcess':
        config = {
          mainButton: {
            text: language === 'ru' ? 'Обсудить консультанта' : 'Discuss your consultant',
            onClick: () => window.dispatchEvent(new Event('web4tg:consultant-contact')),
          },
        };
        break;

      case 'about':
        config = {
          mainButton: {
            text: t('telegramButtons.startProject'),
            onClick: handleOrderProject,
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
          },
        };
        break;

      case 'help':
      case 'review':
        config = {
          mainButton: {
            text: t('telegramButtons.contactUs'),
            onClick: handleConsultation,
          },
        };
        break;

      default:
        break;
    }

    let orderButtonText = config.mainButton?.text || '';
    let orderInfoOpen = currentRoute === 'constructor' && document.body.dataset.orderInfoOpen === 'true';
    const updateOrderLabel = (event: Event) => {
      if (currentRoute !== 'constructor') return;
      orderButtonText = (event as CustomEvent<string>).detail;
      if (!orderInfoOpen) mainButton.setText(orderButtonText);
    };
    const updateOrderInfo = (event: Event) => {
      if (currentRoute !== 'constructor' || !config.mainButton) return;
      orderInfoOpen = (event as CustomEvent<boolean>).detail;
      if (orderInfoOpen) mainButton.hide();
      else mainButton.show(orderButtonText, config.mainButton.onClick, NATIVE_BUTTON_COLOR, NATIVE_BUTTON_TEXT_COLOR);
    };
    if (currentRoute === 'constructor') {
      window.addEventListener('web4tg:order-label', updateOrderLabel);
      window.addEventListener('web4tg:order-info', updateOrderInfo);
    }

    if (config.mainButton && !orderInfoOpen) {
      mainButton.show(
        config.mainButton.text,
        config.mainButton.onClick,
        NATIVE_BUTTON_COLOR,
        NATIVE_BUTTON_TEXT_COLOR
      );
    }

    if (config.secondaryButton) {
      secondaryButton.show(
        config.secondaryButton.text,
        config.secondaryButton.onClick,
        NATIVE_BUTTON_COLOR,
        NATIVE_BUTTON_TEXT_COLOR
      );
    }

    cleanupRef.current = () => {
      window.removeEventListener('web4tg:order-label', updateOrderLabel);
      window.removeEventListener('web4tg:order-info', updateOrderInfo);
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
