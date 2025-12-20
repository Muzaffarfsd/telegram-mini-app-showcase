import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initWebVitals } from "./utils/webVitals";
import { errorMonitor } from "./utils/errorMonitoring";
import { initTelegramWebApp } from "./lib/telegram";

// Initialize and render immediately
if (typeof window !== 'undefined') {
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
