import { demoShareIdFromStartParam } from '@shared/demoShare';

/** Diagnostics are explicitly requested by a separate launch parameter. */
export function diagnosticDemoIdFromStart(): string | null {
  if (typeof window === 'undefined') return null;
  const initParams = new URLSearchParams(window.Telegram?.WebApp?.initData || '');
  const start = initParams.get('start_param') || new URLSearchParams(window.location.search).get('tgWebAppStartParam') || '';
  if (start === 'diag_home') return 'home';
  return start.startsWith('diag_demo_') ? demoShareIdFromStartParam(start) : null;
}

/** Open a shared demo once during bootstrap, after Telegram's SDK has read its launch data. */
export function initializeDemoShareStart(): boolean {
  if (typeof window === 'undefined') return false;

  // An explicit in-app route wins: returning home or refreshing a different
  // page must not reopen the original shared demo.
  if (window.location.hash.startsWith('#/') && window.location.hash.slice(1).split('?')[0] !== '/') return false;

  const tg = window.Telegram?.WebApp;
  const initParams = new URLSearchParams(tg?.initData || '');
  const authenticatedLaunchData = initParams.get('start_param');
  const queryLaunchData = new URLSearchParams(window.location.search).get('tgWebAppStartParam');
  const start = authenticatedLaunchData || queryLaunchData || '';
  const id = demoShareIdFromStartParam(start);
  if (!id) return false;

  // Telegram may configure the Mini App URL with an initial #/. Remember a
  // consumed launch for this webview so returning home and refreshing cannot
  // reopen the same demo. Store only the public ID and timestamp, never the
  // signed init data or user details. New Telegram launches normally get a
  // new auth_date; without it the marker lasts for this webview session.
  const authDate = initParams.get('auth_date');
  const launchKey = `${start.startsWith('diag_demo_') ? 'diagnostic|' : ''}${id}|${authDate && /^\d{1,12}$/.test(authDate) ? authDate : 'no-date'}`;
  try {
    if (window.sessionStorage.getItem('web4tg:consumed-demo-start') === launchKey) return false;
    window.sessionStorage.setItem('web4tg:consumed-demo-start', launchKey);
  } catch { /* Storage may be unavailable in restricted webviews. */ }

  const destination = `/demos/${id}/app`;
  try {
    const url = new URL(window.location.href);
    url.hash = destination;
    window.history.replaceState(window.history.state, '', url.href);
  } catch {
    window.location.hash = destination;
  }

  // Match the demo loading surface from the first React frame.
  document.documentElement.classList.remove('studio-home-theme', 'light-route-transition');
  document.documentElement.classList.add('demo-boot-theme');
  return true;
}
