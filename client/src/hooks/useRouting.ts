import { useState, useEffect, useCallback } from 'react';
import { scrollToTop } from './useScrollToTop';
import { trackPageView } from '../utils/vitals';

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
  };
  
  return {
    path,
    component: routes[path] || 'notFound',
    params: {}
  };
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function useRouting() {
  const [route, setRoute] = useState<Route>({ path: '/', component: 'showcase', params: {} });

  useEffect(() => {
    setRoute(parseHash());
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [route.component, route.params?.id]);

  useEffect(() => {
    trackPageView(route.component);
  }, [route.component]);

  return { route, setRoute, navigate };
}

export default useRouting;
