// POISON PILL SERVICE WORKER - Auto-destroys old cached versions
// This SW self-destructs to fix black screen issue on Railway

const CACHE_VERSION = 'v2';

// Install immediately without waiting
self.addEventListener('install', (event) => {
  console.log('[Poison SW] Installing - will destroy old caches');
  self.skipWaiting(); // Activate immediately
});

// On activation: destroy everything and unregister
self.addEventListener('activate', (event) => {
  console.log('[Poison SW] Activated - checking for old caches');
  
  event.waitUntil(
    (async () => {
      try {
        // Check if there are old caches to clean
        const cacheNames = await caches.keys();
        const hasOldCaches = cacheNames.length > 0;
        
        if (hasOldCaches) {
          console.log('[Poison SW] Found old caches - cleaning up:', cacheNames);
          
          // Delete ALL caches
          await Promise.all(
            cacheNames.map(cacheName => {
              console.log('[Poison SW] Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
          
          // Take control of all clients immediately
          await self.clients.claim();
          
          // Force reload all clients with cache-busting (ONLY if we cleaned caches)
          const clients = await self.clients.matchAll({ type: 'window' });
          clients.forEach(client => {
            console.log('[Poison SW] Reloading client:', client.url);
            client.navigate(client.url + '?sw-reset=' + Date.now());
          });
        } else {
          console.log('[Poison SW] No old caches found - clean install');
        }
        
        // Self-destruct - unregister this service worker
        console.log('[Poison SW] Unregistering self');
        await self.registration.unregister();
        
      } catch (error) {
        console.error('[Poison SW] Error during cleanup:', error);
      }
    })()
  );
});

// NO FETCH HANDLER - all requests go directly to network
// This ensures fresh content loads immediately
