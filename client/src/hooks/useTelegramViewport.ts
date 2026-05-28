import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegramViewport() {
  useEffect(() => {
    const updateViewport = () => {
      // Viewport height
      const vh = WebApp.viewportHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      // Stable height (height after bot header collapses) - used by layout to
      // prevent reflow when the Telegram bot header shows/hides on boot.
      const stableH = (WebApp as any).viewportStableHeight || WebApp.viewportHeight;
      document.documentElement.style.setProperty('--tg-viewport-stable-height', `${stableH}px`);
      document.documentElement.style.setProperty('--tg-viewport-height', `${WebApp.viewportHeight}px`);
      
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

      // Telegram fullscreen overlay buffer.
      // In fullscreen mode (requestFullscreen) Telegram keeps floating
      // "X Закрыть / down-arrow / triple-dot" controls overlaid on the
      // viewport.  These do NOT show up in contentSafeAreaInset.top on most
      // clients (it stays 0), so any layout that respects only safe-area
      // gets clipped by those buttons.  We add an explicit ~60px buffer
      // when fullscreen is active to push our top UI below those controls.
      // Telegram WebApp.isFullscreen is unreliable across clients.  Use it
      // as one signal AND check the html[data-tg-fullscreen='1'] attribute we
      // set ourselves in index.html the moment we called requestFullscreen.
      const isFullscreen =
        !!(WebApp as any).isFullscreen ||
        document.documentElement.dataset.tgFullscreen === '1';
      const fullscreenOverlayBuffer = isFullscreen ? 44 : 0;
      const effectiveTopOverlay = Math.max(contentSafeAreaTop, fullscreenOverlayBuffer);

      document.documentElement.style.setProperty('--csat', `${effectiveTopOverlay}px`);
      document.documentElement.style.setProperty('--csab', `${contentSafeAreaBottom}px`);
      document.documentElement.style.setProperty('--csal', `${contentSafeAreaLeft}px`);
      document.documentElement.style.setProperty('--csar', `${contentSafeAreaRight}px`);
    };
    
    updateViewport();
    
    WebApp.onEvent('viewportChanged', updateViewport);
    WebApp.onEvent('safeAreaChanged', updateViewport);
    WebApp.onEvent('contentSafeAreaChanged', updateViewport);
    // Fullscreen state changes don't have a standard event in older Telegram
    // clients; subscribe defensively and also poll once after a short delay
    // so the buffer is correct even if requestFullscreen() resolves async.
    try { (WebApp as any).onEvent('fullscreenChanged', updateViewport); } catch (e) {}
    const fullscreenSettleTimer = setTimeout(updateViewport, 600);

    return () => {
      WebApp.offEvent('viewportChanged', updateViewport);
      WebApp.offEvent('safeAreaChanged', updateViewport);
      WebApp.offEvent('contentSafeAreaChanged', updateViewport);
      try { (WebApp as any).offEvent('fullscreenChanged', updateViewport); } catch (e) {}
      clearTimeout(fullscreenSettleTimer);
    };
  }, []);
}
