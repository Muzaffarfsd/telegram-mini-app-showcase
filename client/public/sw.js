// POISON PILL SERVICE WORKER v3 - Ultimate black screen fix
// Auto-destroys old cached versions and self-unregisters

const CACHE_VERSION = 'poison-v3';
const DEBUG = true;

function log(msg, data) {
  if (DEBUG) {
    console.log(`[Poison SW v3] ${msg}`, data || '');
  }
}

// Install immediately without waiting
self.addEventListener('install', (event) => {
  log('Installing - will destroy old caches immediately');
  event.waitUntil(self.skipWaiting());
});

// On activation: destroy everything and unregister
self.addEventListener('activate', (event) => {
  log('Activated - starting cleanup process');
  
  event.waitUntil(
    (async () => {
      try {
        // Get all cache names
        const cacheNames = await caches.keys();
        log('Found caches:', cacheNames);
        
        const hasOldCaches = cacheNames.length > 0;
        
        if (hasOldCaches) {
          log('OLD CACHES DETECTED - initiating cleanup', cacheNames);
          
          // Delete ALL caches
          const deletePromises = cacheNames.map(cacheName => {
            log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          });
          
          await Promise.all(deletePromises);
          log('All caches deleted successfully');
          
          // Take control of all clients
          await self.clients.claim();
          log('Claimed all clients');
          
          // Get all window clients
          const clients = await self.clients.matchAll({ 
            type: 'window',
            includeUncontrolled: true 
          });
          
          log('Active clients count:', clients.length);
          
          // Force reload each client with cache-busting
          if (clients.length > 0) {
            const timestamp = Date.now();
            clients.forEach((client, index) => {
              const url = new URL(client.url);
              url.searchParams.set('sw-reset', timestamp);
              log(`Reloading client ${index + 1}/${clients.length}:`, client.url);
              client.navigate(url.toString());
            });
          } else {
            log('No active clients to reload');
          }
          
        } else {
          log('No old caches found - clean installation');
        }
        
        // Self-destruct - unregister this service worker
        log('Self-destructing - unregistering service worker');
        const unregistered = await self.registration.unregister();
        log('Unregistration result:', unregistered);
        
        // Force update check for any remaining SW
        if (self.registration && self.registration.update) {
          await self.registration.update();
          log('Forced SW update check');
        }
        
      } catch (error) {
        console.error('[Poison SW v3] CRITICAL ERROR during cleanup:', error);
        // Try to unregister even if cleanup failed
        try {
          await self.registration.unregister();
          log('Emergency unregister successful after error');
        } catch (e) {
          console.error('[Poison SW v3] Failed to unregister after error:', e);
        }
      }
    })()
  );
});

// NO FETCH HANDLER - all requests go directly to network
// This ensures fresh content loads immediately without SW interference

log('Service Worker script loaded successfully');
