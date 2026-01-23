import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Inject critical CSS before first paint (idempotent)
const injectCriticalCSS = () => {
  if (document.getElementById('critical-inline')) return;
  const style = document.createElement('style');
  style.id = 'critical-inline';
  style.textContent = `
    .gpu-layer{transform:translateZ(0);will-change:transform;backface-visibility:hidden}
    .instant-tap{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    [data-prefetch]{content-visibility:auto;contain-intrinsic-size:auto 200px}
  `;
  document.head.insertBefore(style, document.head.firstChild);
};
injectCriticalCSS();

// Render React app IMMEDIATELY - nothing blocks first paint
createRoot(document.getElementById("root")!).render(<App />);

// Hide initial hamster loader after React mounts
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  initialLoader.classList.add('hidden');
}

// ALL initialization deferred to after first paint via requestIdleCallback
if (typeof window !== 'undefined') {
  const deferredInit = () => {
    // Import and run non-critical initializations
    Promise.all([
      import('./utils/webVitals').then(m => m.initWebVitals()),
      import('./utils/errorMonitoring').then(m => m.errorMonitor.init()),
      import('./lib/telegram').then(m => {
        try { m.initTelegramWebApp(); } catch {}
      }),
      import('./utils/cacheBuster').then(m => {
        m.checkVersionAndClearCaches({ autoReload: false }).catch(() => {});
        const stop = m.startVersionChecker({ autoReload: true });
        m.setupDebugClearCache();
        window.addEventListener('beforeunload', stop);
      }),
    ]).catch(() => {});

    // Cache cleanup - very low priority
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name).catch(() => {}));
      }).catch(() => {});
    }
  };

  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(deferredInit, { timeout: 2000 });
  } else {
    setTimeout(deferredInit, 100);
  }

  // Service Worker - after load event
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}
