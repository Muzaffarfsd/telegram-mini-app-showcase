/**
 * Cache Buster - Automatically detects app version changes and clears caches
 * Essential for VPN/geo-location users who may have stale cached content
 */

const VERSION_CACHE_KEY = 'app_version';
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

interface CacheBusterConfig {
  onVersionChange?: () => void;
  autoReload?: boolean;
}

/**
 * Get current app version from manifest or package.json
 */
async function getAppVersion(): Promise<string> {
  try {
    // Try to get version from manifest.json if it exists
    const response = await fetch('/manifest.json', {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const manifest = await response.json();
      return manifest.version || new Date().toISOString();
    }
  } catch (error) {
    console.log('[CacheBuster] Could not fetch manifest');
  }

  // Fallback: use current timestamp as version
  return new Date().toISOString().split('T')[0];
}

/**
 * Clear all caches (localStorage, sessionStorage, Service Workers, etc)
 */
export async function clearAllCaches(): Promise<void> {
  console.log('[CacheBuster] Clearing all caches...');

  // Clear localStorage and sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('[CacheBuster] Cleared localStorage and sessionStorage');
  } catch (error) {
    console.error('[CacheBuster] Error clearing storage', error);
  }

  // Clear Service Worker caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('[CacheBuster] Cleared Service Worker caches');
    } catch (error) {
      console.error('[CacheBuster] Error clearing SW caches', error);
    }
  }

  // Unregister Service Workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('[CacheBuster] Unregistered Service Workers');
    } catch (error) {
      console.error('[CacheBuster] Error unregistering SW', error);
    }
  }
}

/**
 * Check if app version has changed and clear caches if needed
 */
export async function checkVersionAndClearCaches(
  config: CacheBusterConfig = {}
): Promise<boolean> {
  const { onVersionChange, autoReload = true } = config;

  try {
    const currentVersion = await getAppVersion();
    const cachedVersion = sessionStorage.getItem(VERSION_CACHE_KEY);

    console.log('[CacheBuster] Current version:', currentVersion);
    console.log('[CacheBuster] Cached version:', cachedVersion);

    if (cachedVersion && cachedVersion !== currentVersion) {
      console.warn('[CacheBuster] Version changed! Clearing caches...');
      
      await clearAllCaches();
      
      sessionStorage.setItem(VERSION_CACHE_KEY, currentVersion);
      
      onVersionChange?.();

      if (autoReload) {
        console.log('[CacheBuster] Reloading page with fresh content');
        // Force hard refresh to get fresh content
        window.location.href = window.location.href;
      }

      return true;
    } else {
      sessionStorage.setItem(VERSION_CACHE_KEY, currentVersion);
    }
  } catch (error) {
    console.error('[CacheBuster] Error checking version', error);
  }

  return false;
}

/**
 * Start periodic version checking
 */
export function startVersionChecker(
  config: CacheBusterConfig = {}
): () => void {
  const interval = setInterval(() => {
    checkVersionAndClearCaches(config);
  }, VERSION_CHECK_INTERVAL);

  console.log('[CacheBuster] Version checker started (interval: 5 min)');

  // Return cleanup function
  return () => {
    clearInterval(interval);
    console.log('[CacheBuster] Version checker stopped');
  };
}

/**
 * For debugging: Manual cache clearing function
 * Can be called from browser console: window.__clearAppCache?.()
 */
export function setupDebugClearCache(): void {
  (window as any).__clearAppCache = async () => {
    console.log('[CacheBuster Debug] Manually clearing cache...');
    await clearAllCaches();
    console.log('[CacheBuster Debug] Cache cleared! Reloading page...');
    window.location.reload();
  };

  (window as any).__getAppVersion = async () => {
    const version = await getAppVersion();
    console.log('[CacheBuster Debug] Current app version:', version);
    return version;
  };

  console.log('[CacheBuster Debug] Available commands:');
  console.log('  window.__clearAppCache() - Clear all caches and reload');
  console.log('  window.__getAppVersion() - Get current app version');
}
