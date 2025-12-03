// Service Worker for WEB4TG - Offline-First PWA with Performance Optimizations
const CACHE_NAME = 'web4tg-v2';
const RUNTIME_CACHE = 'runtime-v2';
const IMAGE_CACHE = 'images-v2';
const FONT_CACHE = 'fonts-v2';

// Cache size limits
const MAX_IMAGE_CACHE_SIZE = 50; // Max images to cache
const MAX_RUNTIME_CACHE_SIZE = 100;

// Critical assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Helper to limit cache size
async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    const deleteCount = keys.length - maxSize;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Check if URL is an image
function isImageRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i) ||
         url.hostname.includes('unsplash.com') ||
         url.hostname.includes('images.unsplash.com');
}

// Check if URL is a font
function isFontRequest(url) {
  return url.pathname.match(/\.(woff|woff2|ttf|otf|eot)$/i);
}

// Fetch event - Network First strategy for API, Cache First for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Images - Cache First with long expiry (stale-while-revalidate)
  if (isImageRequest(url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE)
        .then(cache => cache.match(request)
          .then(cachedResponse => {
            const fetchPromise = fetch(request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(request, networkResponse.clone());
                  trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
                }
                return networkResponse;
              })
              .catch(() => cachedResponse);
            
            return cachedResponse || fetchPromise;
          }))
    );
    return;
  }

  // Fonts - Cache First (fonts rarely change)
  if (isFontRequest(url)) {
    event.respondWith(
      caches.open(FONT_CACHE)
        .then(cache => cache.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(request, networkResponse.clone());
                }
                return networkResponse;
              });
          }))
    );
    return;
  }

  // API requests - Network First (with fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response to cache it
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline fallback for API
            return new Response(
              JSON.stringify({ error: 'Offline', message: 'No cached data available' }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - Cache First (with network fallback)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version, but update cache in background
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(request, response);
                });
              }
            })
            .catch(() => {}); // Ignore network errors in background update
          
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone and cache the response
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });

            return response;
          })
          .catch(() => {
            // Network error - return offline page if HTML
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Sync offline data when connection is restored
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  console.log('[SW] Syncing offline data...');
  // TODO: Implement offline data sync logic
  return Promise.resolve();
}

// Push notifications support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification from WEB4TG',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'WEB4TG', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
