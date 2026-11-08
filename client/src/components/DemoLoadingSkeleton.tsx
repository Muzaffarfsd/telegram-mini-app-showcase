import { useLayoutEffect } from 'react';
import { restoreTelegramChrome } from '../lib/telegramChrome';
import './DemoLoadingSkeleton.css';

let activeSkeletons = 0;
let previousColors: { background?: string; header?: string; bottom?: string } = {};

/** Light placeholder shared by every demo while its code is loading. */
export function DemoLoadingSkeleton({ label = 'Загрузка демо-приложения' }: { label?: string }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const tg = window.Telegram?.WebApp as any;
    if (activeSkeletons++ === 0) {
      previousColors = { background: tg?.backgroundColor, header: tg?.headerColor, bottom: tg?.bottomBarColor };
      root.classList.add('demo-loading-theme');
      try { tg?.setBackgroundColor?.('#ffffff'); tg?.setHeaderColor?.('#ffffff'); tg?.setBottomBarColor?.('#ffffff'); } catch { /* Older clients may omit these methods. */ }
    }
    return () => {
      if (--activeSkeletons === 0) {
        root.classList.remove('demo-loading-theme');
        restoreTelegramChrome(tg, previousColors);
      }
    };
  }, []);

  return <main className="demo-loading" role="status" aria-label={label} aria-busy="true">
    <div className="demo-loading__content" aria-hidden="true">
      <div className="demo-loading__shape" style={{ width: '32%', height: 11 }} />
      <div className="demo-loading__shape" style={{ width: '72%', height: 30 }} />
      <div className="demo-loading__shape" style={{ width: '50%', height: 13 }} />
      <div className="demo-loading__shape demo-loading__hero" />
      <div className="demo-loading__shape" style={{ width: '42%', height: 18 }} />
      <div className="demo-loading__cards"><div className="demo-loading__shape" /><div className="demo-loading__shape" /></div>
    </div>
  </main>;
}
