import { createRoot } from "react-dom/client";
import { importWithRecovery } from "./utils/lazyWithRecovery";
import { initializeDemoShareStart } from './lib/demoShareStart';

import { warmRoute } from './lib/routeModules';
import "./index.css";

initializeDemoShareStart();
const root = createRoot(document.getElementById("root")!);
warmRoute(window.location.hash.slice(1), 'high');
// Keep storage migration ahead of consumers, but overlap its I/O with code loading.
void Promise.all([
  importWithRecovery(() => import("./App")),
  import("./lib/cleanupRetiredDemos").then(m => m.cleanupRetiredDemos()).catch(() => {}),
]).then(([{ default: App }]) => root.render(<App />))
  .catch((error) => {
    console.error('Failed to start app:', error);
    root.render(<main role="alert" style={{ minHeight: '100dvh', display: 'grid', placeContent: 'center', gap: 16, background: '#fff', color: '#171717', textAlign: 'center', padding: 24 }}>
      <p>Не удалось загрузить приложение.</p>
      <button type="button" onClick={() => window.location.reload()}>Попробовать снова</button>
    </main>);
  });

if (typeof window !== 'undefined') {
  const deferredInit = () => {
    import('./utils/webVitals').then(m => m.initWebVitals()).catch(() => {});
    import('./utils/errorMonitoring').then(m => m.errorMonitor.init()).catch(() => {});
    import('./lib/telegram').then(m => {
      try { m.initTelegramWebApp(); } catch {}
    }).catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(deferredInit, { timeout: 3000 });
  } else {
    setTimeout(deferredInit, 200);
  }

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}
