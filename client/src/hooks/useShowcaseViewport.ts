import { useLayoutEffect } from 'react';

/** Some hosts resize the webview for the native buttons. Others overlay
 * them. Capture the unobstructed edge before showing the buttons so a
 * reported resize and our fallback allowance don't add together. */
export function useShowcaseViewport(active: boolean, actionsVisible: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const viewport = window.visualViewport;
    const tg = window.Telegram?.WebApp;
    const embedded = !!tg?.platform && tg.platform !== 'unknown';
    const nativeRow = embedded && actionsVisible;
    let timer: number | undefined;
    let width = window.innerWidth;
    let fullHeight = 0;
    const measure = () => {
      if (viewport && viewport.scale !== 1) return;
      const browserEdge = Math.min(window.innerHeight, viewport && viewport.height > 0
        ? viewport.offsetTop + viewport.height : window.innerHeight);
      const stable = embedded && tg?.viewportStableHeight;
      const edge = Math.round(stable && stable > 0 ? Math.min(browserEdge, stable) : browserEdge);
      if (edge <= 0) return;
      if (width !== window.innerWidth || !nativeRow) fullHeight = edge;
      width = window.innerWidth;
      fullHeight = Math.max(fullHeight, edge);
      html.style.setProperty('--projects-visual-bottom', edge + 'px');
      html.style.setProperty('--projects-full-height', fullHeight + 'px');
    };
    // Commit browser-only changes after the native sheet animation settles.
    const queue = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 100);
    };
    const onViewport = (event?: { isStateStable?: boolean }) => {
      if (event?.isStateStable !== false) measure();
    };
    html.toggleAttribute('data-projects-native-row', nativeRow);
    html.toggleAttribute('data-projects-ios-actions', nativeRow && tg?.platform === 'ios');
    measure();
    viewport?.addEventListener('resize', queue);
    viewport?.addEventListener('scroll', queue);
    window.addEventListener('resize', queue);
    tg?.onEvent('viewportChanged', onViewport);
    return () => {
      window.clearTimeout(timer);
      tg?.offEvent('viewportChanged', onViewport);
      window.removeEventListener('resize', queue);
      viewport?.removeEventListener('resize', queue);
      viewport?.removeEventListener('scroll', queue);
      html.removeAttribute('data-projects-native-row');
      html.removeAttribute('data-projects-ios-actions');
      html.style.removeProperty('--projects-visual-bottom');
      html.style.removeProperty('--projects-full-height');
    };
  }, [active, actionsVisible]);
}
