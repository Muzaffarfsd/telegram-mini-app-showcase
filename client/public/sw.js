const CACHE_VERSION = 'v3';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const DATA_CACHE = `data-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.png'
];

const CRITICAL_ASSETS = [
  '/assets/',
  '.js',
  '.css',
  '.woff2',
  '.woff',
  '.ttf'
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];

const SYNC_QUEUE_DB = 'syncQueue';
const SYNC_QUEUE_STORE = 'pendingRequests';

let syncQueueDB = null;

async function openSyncDB() {
  if (syncQueueDB) return syncQueueDB;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_QUEUE_DB, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      syncQueueDB = request.result;
      resolve(syncQueueDB);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function addToSyncQueue(request, body) {
  try {
    const db = await openSyncDB();
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    
    await new Promise((resolve, reject) => {
      const req = store.add({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: body,
        timestamp: Date.now()
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    
    const count = await getPendingSyncCount();
    notifyClients({ type: 'SYNC_QUEUED', count });
  } catch (error) {
    console.error('Failed to queue request:', error);
  }
}

async function getPendingSyncCount() {
  try {
    const db = await openSyncDB();
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readonly');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return 0;
  }
}

async function processSyncQueue() {
  try {
    const db = await openSyncDB();
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readonly');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    
    const allRequests = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of allRequests) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body ? JSON.stringify(item.body) : undefined
        });
        
        if (response.ok) {
          const deleteTx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
          const deleteStore = deleteTx.objectStore(SYNC_QUEUE_STORE);
          await new Promise((resolve, reject) => {
            const deleteRequest = deleteStore.delete(item.id);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
          });
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }
    
    const remaining = await getPendingSyncCount();
    notifyClients({ 
      type: 'SYNC_COMPLETE', 
      synced: successCount, 
      failed: failCount,
      remaining
    });
    
    return { successCount, failCount, remaining };
  } catch (error) {
    console.error('Sync queue processing failed:', error);
    return { successCount: 0, failCount: 0, remaining: 0 };
  }
}

async function notifyClients(message) {
  const allClients = await clients.matchAll({ includeUncontrolled: true });
  allClients.forEach(client => client.postMessage(message));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(STATIC_ASSETS);
      
      try {
        const response = await fetch('/');
        const html = await response.text();
        
        const assetMatches = html.matchAll(/\/assets\/[^"'\s]+\.(js|css|woff2?|ttf)/g);
        const additionalAssets = [...new Set([...assetMatches].map(m => m[0]))];
        
        if (additionalAssets.length > 0) {
          await cache.addAll(additionalAssets.slice(0, 20));
        }
      } catch (e) {
        console.log('Could not pre-cache additional assets:', e);
      }
      
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(k => !k.includes(CACHE_VERSION))
          .map(k => caches.delete(k))
      );
      
      await self.clients.claim();
      
      notifyClients({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (url.origin !== location.origin) return;
  
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    event.respondWith(handleMutationRequest(request));
    return;
  }
  
  if (request.method !== 'GET') return;
  
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }
  
  if (isCriticalAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  if (isImageAsset(url.pathname)) {
    event.respondWith(cacheFirstWithLimit(request));
    return;
  }
  
  event.respondWith(staleWhileRevalidate(request));
});

async function handleMutationRequest(request) {
  const clone = request.clone();
  let body = null;
  
  try {
    body = await clone.json();
  } catch {
    body = null;
  }
  
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    await addToSyncQueue(request, body);
    
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'Request queued for sync',
        queued: true,
        timestamp: Date.now()
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function isCriticalAsset(pathname) {
  return CRITICAL_ASSETS.some(asset => pathname.includes(asset));
}

function isImageAsset(pathname) {
  return IMAGE_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext));
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function cacheFirstWithLimit(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { 
      status: 503,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      const modifiedHeaders = new Headers(cached.headers);
      modifiedHeaders.set('X-From-Cache', 'true');
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: modifiedHeaders
      });
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'No internet connection',
        cached: false,
        timestamp: Date.now()
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  if (cached) return cached;
  
  const response = await fetchPromise;
  if (response) return response;
  
  const offlinePage = await caches.match(OFFLINE_PAGE);
  if (offlinePage) return offlinePage;
  
  return new Response('Offline', { status: 503 });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processSyncQueue());
  }
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/favicon.png',
    badge: data.badge || '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'WEB4TG', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});

self.addEventListener('message', async (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
  }
  
  if (event.data?.type === 'CACHE_DEMO_DATA') {
    const { demoId, data } = event.data;
    const cache = await caches.open(DATA_CACHE);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(`/api/demos/${demoId}`, response);
  }
  
  if (event.data?.type === 'GET_SYNC_STATUS') {
    const count = await getPendingSyncCount();
    event.source.postMessage({ type: 'SYNC_STATUS', pendingCount: count });
  }
  
  if (event.data?.type === 'TRIGGER_SYNC') {
    await processSyncQueue();
  }
  
  if (event.data?.type === 'CHECK_ONLINE') {
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      event.source.postMessage({ type: 'ONLINE_STATUS', online: response.ok });
    } catch {
      event.source.postMessage({ type: 'ONLINE_STATUS', online: false });
    }
  }
});
