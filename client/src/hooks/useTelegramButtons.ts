import { useEffect, useEffectEvent, useCallback, useRef, useState } from 'react';
import { useTelegram, type TelegramButton } from './useTelegram';
import { useShowcaseViewport } from './useShowcaseViewport';
import { useLanguage } from '../contexts/LanguageContext';
import { profilePost } from '../lib/profileRequest';
import { navigate as navigateRoute } from './useRouting';
import { canonicalDemoShareId, demoShareEntries } from '@shared/demoShare';

interface ButtonAction {
  text: string;
  onClick: () => void;
  primary?: boolean;
  position?: 'left';
}

interface ButtonConfig {
  mainButton?: ButtonAction;
  secondaryButton?: ButtonAction;
}

type RouteType = 'showcase' | 'projects' | 'constructor' | 'checkout' | 'profile' | 'demoLanding' | 'demoApp' | 'about' | 'help' | 'review' | 'aiAgent' | 'aiProcess' | 'referral' | 'rewards' | 'earning' | 'photoGallery' | 'other';

const NATIVE_BUTTON_COLOR = '#FFFFFF';
const NATIVE_BUTTON_TEXT_COLOR = '#1C1C1E';

// A native visibility change resizes the WebView. Replace the label in place
// and keep one listener per SDK button, even when the current callback changes.
function useNativeButton(button: TelegramButton | undefined, action: ButtonAction | undefined) {
  const press = useEffectEvent(() => action?.onClick());
  const label = action?.text;
  const primary = !!action?.primary;
  const position = action?.position;

  useEffect(() => {
    if (!button) return;
    const click = () => { press(); };
    button.onClick(click);
    return () => {
      button.offClick(click);
      if (button.isVisible) button.hide();
    };
  }, [button]);

  useEffect(() => {
    if (!button) return;
    if (label) {
      button.setParams({ text: label, color: primary ? NATIVE_BUTTON_TEXT_COLOR : NATIVE_BUTTON_COLOR,
        text_color: primary ? NATIVE_BUTTON_COLOR : NATIVE_BUTTON_TEXT_COLOR, is_visible: true,
        ...(position ? { position } : {}) });
    } else if (button.isVisible) {
      button.hide();
    }
  }, [button, label, primary, position]);
}

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
  const { webApp, shareApp, openTelegramLink, hapticFeedback } = useTelegram();
  const { t, language } = useLanguage();
  const [chatOpen, setChatOpen] = useState(() => document.body.dataset.aiChatOpen === 'true');
  const sharingRef = useRef(false);
  const shareListenersRef = useRef<(() => void) | null>(null);

  const navigate = useCallback((path: string) => {
    navigateRoute(path);
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

  const handleShare = useCallback(async () => {
    if (sharingRef.current) return;
    hapticFeedback.medium();
    const routeDemoId = (currentRoute === 'demoApp' || currentRoute === 'demoLanding')
      ? window.location.hash.match(/^#\/demos\/([^/?#]+)(?:\/app)?(?:\?|$)/)?.[1]
      : undefined;
    const demoId = routeDemoId ? canonicalDemoShareId(routeDemoId) : null;
    const text = demoId
      ? language === 'en' ? `Explore the ${demoShareEntries[demoId].en} demo in Telegram.` : `Посмотри демо: ${demoShareEntries[demoId].ru}.`
      : language === 'en' ? 'See what a store for your business can look like in Telegram.' : 'Посмотри, как может выглядеть магазин для бизнеса прямо в Telegram.';
    const tg = window.Telegram?.WebApp;
    const version = String(tg?.version || '').split('.').map(Number);
    const supportsPreparedShare = typeof tg?.shareMessage === 'function' && Number.isFinite(version[0]) && version[0] >= 8;
    if (!supportsPreparedShare || !tg?.initData) {
      shareApp(text, undefined, demoId || undefined);
      return;
    }

    sharingRef.current = true;
    const sourceHash = window.location.hash;
    const isCurrentPage = () => window.location.hash === sourceHash;
    const nativeButton = currentRoute === 'projects' || currentRoute === 'demoLanding' || currentRoute === 'demoApp'
      ? tg.SecondaryButton : tg.MainButton;
    try { nativeButton?.showProgress?.(true); } catch { /* Optional in older clients. */ }
    let dialogOpened = false;
    let referralCode: string | undefined;
    try {
      const result = await profilePost<{ messageId: string; deepLink?: string }>(
        '/api/telegram/prepare-invite', tg.initData,
        { language, referral: ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute), ...(demoId ? { demoId } : {}) },
      );
      if (!isCurrentPage()) return;
      if (typeof result.messageId !== 'string' || !result.messageId) throw new Error('Missing prepared message');
      if (result.deepLink) {
        const url = new URL(result.deepLink);
        const code = url.searchParams.get('startapp');
        if (url.origin === 'https://t.me' && url.pathname === '/w4tg_bot/w4tg' && code && /^[A-Za-z0-9_-]{1,64}$/.test(code)) referralCode = code;
      }
      try { nativeButton?.hideProgress?.(); } catch { /* Optional in older clients. */ }

      // The callback only returns true/false; events distinguish cancellation
      // from errors so declining never opens a second sharing dialog.
      let timer: number | undefined;
      const cleanup = () => {
        if (timer !== undefined) window.clearTimeout(timer);
        tg.offEvent('shareMessageSent', onSent);
        tg.offEvent('shareMessageFailed', onFailed);
        if (shareListenersRef.current === cleanup) shareListenersRef.current = null;
        sharingRef.current = false;
      };
      const onSent = () => cleanup();
      const onFailed = (event: { error?: string }) => {
        cleanup();
        if (event?.error !== 'USER_DECLINED' && isCurrentPage()) shareApp(text, referralCode, demoId || undefined);
      };
      tg.onEvent('shareMessageSent', onSent);
      tg.onEvent('shareMessageFailed', onFailed);
      shareListenersRef.current = cleanup;
      timer = window.setTimeout(cleanup, 5 * 60 * 1000);
      tg.shareMessage(result.messageId);
      dialogOpened = true;
    } catch {
      shareListenersRef.current?.();
      if (isCurrentPage()) shareApp(text, referralCode, demoId || undefined);
    } finally {
      try { nativeButton?.hideProgress?.(); } catch { /* Optional in older clients. */ }
      if (!dialogOpened) sharingRef.current = false;
    }
  }, [currentRoute, shareApp, hapticFeedback, language]);

  useEffect(() => () => { shareListenersRef.current?.(); }, []);

  const handleDownloadPDF = useCallback(() => {
    hapticFeedback.light();
    openTelegramLink('https://t.me/web4tgs?start=proposal');
  }, [openTelegramLink, hapticFeedback]);

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
          primary: true,
        },
        secondaryButton: {
          text: t('telegramButtons.share'),
          onClick: handleShare,
          position: 'left',
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
      // The order has its own persistent action and price; avoid a second Telegram button.
      break;

    case 'checkout':
      break;

    case 'aiAgent':
    case 'aiProcess':
      // Consultant screens have their own contextual actions.
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

  useShowcaseViewport(currentRoute === 'projects', !chatOpen);
  useNativeButton(webApp?.MainButton, chatOpen ? undefined : config.mainButton);
  useNativeButton(webApp?.SecondaryButton, chatOpen ? undefined : config.secondaryButton);

  const shareLanding = useEffectEvent(() => {
    if (currentRoute === 'demoLanding') void handleShare();
  });
  useEffect(() => {
    const syncChat = () => setChatOpen(document.body.dataset.aiChatOpen === 'true');
    const share = () => shareLanding();
    syncChat();
    window.addEventListener('web4tg:ai-chat-open', syncChat);
    window.addEventListener('web4tg:share-current-demo', share);
    return () => {
      window.removeEventListener('web4tg:ai-chat-open', syncChat);
      window.removeEventListener('web4tg:share-current-demo', share);
    };
  }, []);

  return {
    shareApp: handleShare,
    downloadPDF: handleDownloadPDF,
  };
}
