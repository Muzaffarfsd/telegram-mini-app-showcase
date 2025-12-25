import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initWebVitals } from "./utils/webVitals";
import { errorMonitor } from "./utils/errorMonitoring";
import { initTelegramWebApp } from "./lib/telegram";
import { checkVersionAndClearCaches, startVersionChecker, setupDebugClearCache } from "./utils/cacheBuster";

// Initialize and render immediately
if (typeof window !== 'undefined') {
  // CRITICAL: Force clear browser cache on every load for VPN/geo users
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name).catch(() => {});
      });
    }).catch(() => {});
  }

  // Disable back/forward cache (bfcache) to ensure fresh load
  window.addEventListener('pagehide', () => {
    if (performance.getEntriesByType('navigation')[0]?.toJSON().type === 'navigate') {
      // Prevent bfcache
      (window as any).__PREVENT_BFCACHE = true;
    }
  });

  // Check for version changes and clear stale caches (fixes VPN/geo issues)
  checkVersionAndClearCaches({ autoReload: false }).catch(err => {
    console.error('[CacheBuster] Startup check failed:', err);
  });

  // Start periodic version checking
  const stopVersionChecker = startVersionChecker({ autoReload: true });

  // Setup debug cache clearing for troubleshooting
  setupDebugClearCache();

  // Init Telegram ASAP (ready() already called in HTML)
  try {
    initTelegramWebApp();
  } catch (error) {
    console.log('[Telegram] Not running in Telegram environment');
  }
  
  // Defer non-critical init to after render
  setTimeout(() => {
    initWebVitals();
    errorMonitor.init();
  }, 0);

  // Cleanup on unload
  window.addEventListener('beforeunload', stopVersionChecker);
}

// Render React app immediately
createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker for caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration.scope))
      .catch(error => console.log('SW registration failed:', error));
  });
}
