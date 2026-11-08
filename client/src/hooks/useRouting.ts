import { useState, useEffect, useLayoutEffect } from 'react';
import { scrollToTop } from './useScrollToTop';
import { trackPageView } from '../utils/vitals';
import { applyLightDestinationTelegramChrome, isLightDestinationHash } from '../lib/telegramChrome';

export interface Route {
  path: string;
  component: string;
  params: Record<string, string>;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const [path] = hash.split('?');
  
  const demoMatch = path.match(/^\/demos\/([^\/]+)(?:\/app)?$/);
  if (demoMatch) {
    const demoId = demoMatch[1];
    const isApp = path.includes('/app');
    return {
      path: isApp ? '/demos/:id/app' : '/demos/:id',
      component: isApp ? 'demoApp' : 'demoLanding',
      params: { id: demoId }
    };
  }
  
  const routes: Record<string, string> = {
    '/': 'showcase',
    '/projects': 'projects',
    '/about': 'about',
    '/constructor': 'constructor',
    '/profile': 'profile',
    '/help': 'help',
    '/review': 'review',
    '/checkout': 'checkout',
    '/ai-agent': 'aiAgent',
    '/ai-process': 'aiProcess',
    '/photo-gallery': 'photoGallery',
    '/referral': 'referral',
    '/rewards': 'rewards',
    '/earning': 'earning',
    '/notifications': 'notifications',
    '/analytics': 'analytics',
    '/premium-apps': 'premiumApps',
  };
  
  return {
    path,
    component: routes[path] || 'showcase',
    params: {}
  };
}

export function navigate(path: string): void {
  window.location.hash = path;
  document.documentElement.classList.toggle('light-route-transition', isLightDestinationHash());
  applyLightDestinationTelegramChrome();
}

export function useRouting() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined' ? { path: '/', component: 'showcase', params: {} } : parseHash(),
  );

  useEffect(() => {
    setRoute(parseHash());
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const next = parseHash();
      document.documentElement.classList.toggle('light-route-transition', isLightDestinationHash());
      applyLightDestinationTelegramChrome();
      // Reset the old shell before React mounts and lays out the destination.
      // The root is the sole page scroller; avoid scroll writes when already
      // at the top so navigation doesn't force a layout of the new screen.
      if (!next.component.includes('demo')) {
        const root = document.getElementById('root');
        if (root && root.scrollTop !== 0) root.scrollTop = 0;
        if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
      }
      setRoute(next);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useLayoutEffect(() => {
    // Demos may have their own scroll containers, so preserve their existing
    // reset. Ordinary shell navigation was already reset in hashchange.
    if (route.component.includes('demo')) {
      scrollToTop();
    }
  }, [route.component, route.params?.id]);

  useEffect(() => {
    trackPageView(route.component);
  }, [route.component]);

  return { route, setRoute, navigate };
}

export default useRouting;
