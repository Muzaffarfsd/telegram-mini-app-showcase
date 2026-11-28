import { createRoot } from "react-dom/client";
import { importWithRecovery } from "./utils/lazyWithRecovery";
import { diagnosticDemoIdFromStart, initializeDemoShareStart } from './lib/demoShareStart';
import { cleanupRetiredDemos } from './lib/cleanupRetiredDemos';
import { ensureTelegramSdk } from './lib/telegramSdk';

import { warmRoute } from './lib/routeModules';
import "./index.css";

const root = createRoot(document.getElementById("root")!);
void cleanupRetiredDemos();
const bridgeReady = ensureTelegramSdk();
void bridgeReady.then(() => {
  const diagnosticId = diagnosticDemoIdFromStart();
  const openedSharedDemo = initializeDemoShareStart();
  const homeDiagnostic = diagnosticId === 'home' && (!window.location.hash.startsWith('#/') || window.location.hash.split('?')[0] === '#/');
  if (diagnosticId && (openedSharedDemo || homeDiagnostic)) {
    void import('./utils/performanceDiagnostic').then(m => m.startPerformanceDiagnostic(diagnosticId)).catch(() => {});
  }
  delete document.documentElement.dataset.sharedDemoShell;
  const path = window.location.hash.slice(1);
  warmRoute(path, 'high');
  return importWithRecovery(() => import("./App"));
}).then(({ default: App }) => root.render(<App />))
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
    bridgeReady.then(() => import('./lib/telegram')).then(m => m.initTelegramWebApp()).catch(() => {});
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
