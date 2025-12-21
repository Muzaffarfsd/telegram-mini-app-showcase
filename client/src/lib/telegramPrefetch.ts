import { demoRegistry, preloadCriticalDemos } from '@/components/demos/DemoRegistry';

interface TelegramWebApp7 {
  version?: string;
  isActive?: boolean;
  isFullscreen?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  onEvent?: (event: string, callback: () => void) => void;
  offEvent?: (event: string, callback: () => void) => void;
}

function getTelegramWebApp(): TelegramWebApp7 | null {
  try {
    return (window.Telegram?.WebApp as TelegramWebApp7) ?? null;
  } catch {
    return null;
  }
}

function getVersion(): { major: number; minor: number } | null {
  const webApp = getTelegramWebApp();
  if (!webApp?.version) return null;
  
  try {
    const [major, minor] = webApp.version.split('.').map(Number);
    return { major, minor };
  } catch {
    return null;
  }
}

function isVersion7OrHigher(): boolean {
  const version = getVersion();
  return version !== null && version.major >= 7;
}

const prefetchState = {
  isInitialized: false,
  prefetchedDemos: new Set<string>(),
  prefetchedAssets: new Set<string>(),
  isAppActive: true,
  prefetchQueue: [] as string[],
};

function prefetchDemo(demoId: string): void {
  if (prefetchState.prefetchedDemos.has(demoId)) return;
  
  const demo = demoRegistry[demoId];
  if (demo?.preload) {
    prefetchState.prefetchedDemos.add(demoId);
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => demo.preload!(), { timeout: 3000 });
    } else {
      setTimeout(() => demo.preload!(), 100);
    }
  }
}

function prefetchImage(src: string, priority: 'high' | 'low' = 'low'): void {
  if (prefetchState.prefetchedAssets.has(src)) return;
  prefetchState.prefetchedAssets.add(src);
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'image';
  link.href = src;
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
}

function preloadImage(src: string): void {
  if (prefetchState.prefetchedAssets.has(src)) return;
  prefetchState.prefetchedAssets.add(src);
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
}

function prefetchScript(src: string): void {
  if (prefetchState.prefetchedAssets.has(src)) return;
  prefetchState.prefetchedAssets.add(src);
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  link.href = src;
  document.head.appendChild(link);
}

function processQueue(): void {
  if (!prefetchState.isAppActive) return;
  
  const demoId = prefetchState.prefetchQueue.shift();
  if (demoId) {
    prefetchDemo(demoId);
    
    if (prefetchState.prefetchQueue.length > 0) {
      setTimeout(processQueue, 200);
    }
  }
}

function queueDemoPrefetch(demoId: string): void {
  if (!prefetchState.prefetchedDemos.has(demoId) && 
      !prefetchState.prefetchQueue.includes(demoId)) {
    prefetchState.prefetchQueue.push(demoId);
  }
}

function handleAppActivated(): void {
  prefetchState.isAppActive = true;
  processQueue();
}

function handleAppDeactivated(): void {
  prefetchState.isAppActive = false;
}

function handleViewportChange(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  const height = webApp.viewportStableHeight ?? webApp.viewportHeight ?? window.innerHeight;
  
  if (height > 600) {
    preloadCriticalDemos();
  }
}

export function initTelegramPrefetch(): void {
  if (prefetchState.isInitialized) return;
  prefetchState.isInitialized = true;
  
  const webApp = getTelegramWebApp();
  
  if (webApp && isVersion7OrHigher()) {
    if (webApp.onEvent) {
      webApp.onEvent('activated', handleAppActivated);
      webApp.onEvent('deactivated', handleAppDeactivated);
      webApp.onEvent('viewportChanged', handleViewportChange);
    }
    
    prefetchState.isAppActive = webApp.isActive !== false;
  }
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadCriticalDemos();
    }, { timeout: 2000 });
  } else {
    setTimeout(preloadCriticalDemos, 1000);
  }
  
  if ('connection' in navigator) {
    const connection = (navigator as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    if (connection?.effectiveType === '4g' && !connection?.saveData) {
      setTimeout(() => {
        const additionalDemos = ['restaurant', 'fitness', 'beauty'];
        additionalDemos.forEach(demoId => queueDemoPrefetch(demoId));
        processQueue();
      }, 3000);
    }
  }
}

export function prefetchDemoOnHover(demoId: string): void {
  if (!prefetchState.isAppActive) return;
  prefetchDemo(demoId);
}

export function prefetchDemoOnVisible(demoId: string): void {
  queueDemoPrefetch(demoId);
  
  if (prefetchState.isAppActive && prefetchState.prefetchQueue.length === 1) {
    processQueue();
  }
}

export function prefetchImages(sources: string[]): void {
  sources.forEach((src, index) => {
    if (index < 3) {
      preloadImage(src);
    } else {
      prefetchImage(src);
    }
  });
}

export function createPrefetchObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const webApp = getTelegramWebApp();
  const viewportHeight = webApp?.viewportStableHeight ?? window.innerHeight;
  
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: `${Math.round(viewportHeight * 0.5)}px 0px`,
    threshold: 0.01,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

export function cleanupTelegramPrefetch(): void {
  const webApp = getTelegramWebApp();
  
  if (webApp?.offEvent) {
    webApp.offEvent('activated', handleAppActivated);
    webApp.offEvent('deactivated', handleAppDeactivated);
    webApp.offEvent('viewportChanged', handleViewportChange);
  }
  
  prefetchState.isInitialized = false;
  prefetchState.prefetchQueue = [];
}

export { prefetchDemo, prefetchImage, preloadImage, prefetchScript };
