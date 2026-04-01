import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

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
