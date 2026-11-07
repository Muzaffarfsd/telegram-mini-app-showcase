// Cache only public application assets. API credentials, private responses and
// writes must never enter an offline cache or a background replay queue.
const CACHE_VERSION = 'v13-security';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const ASSET_CACHE = `dynamic-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';
const STATIC_ASSETS = ['/', '/offline.html', '/manifest.json', '/favicon.png'];
const MAX_ASSETS = 160;

function sameOriginUrl(value) {
  try {
    const url = new URL(value, self.location.origin);
    return url.origin === self.location.origin && !url.username && !url.password &&
      ['https:', 'http:'].includes(url.protocol) ? url : null;
  } catch { return null; }
}

function isPublicAsset(url) {
  if (!url || url.search || url.hash) return false;
  if (STATIC_ASSETS.includes(url.pathname)) return true;
  return /^\/(?:assets|icons|showcase|about-studio|attached_assets)\//.test(url.pathname) &&
    /\.(?:js|css|woff2?|ttf|png|jpe?g|webp|gif|ico|svg|avif)$/i.test(url.pathname);
}

function hasCredentials(request) {
  return ['authorization', 'x-telegram-init-data', 'x-csrf-token'].some(name => request.headers.has(name));
}

async function clearLegacyRequests() {
  // Clear an existing queue without creating one, then drop the database. An old
  // open worker may delay deletion, but clearing prevents its records replaying.
  await new Promise(resolve => {
    const request = indexedDB.open('syncQueue');
    request.onupgradeneeded = () => { request.transaction.abort(); resolve(); };
    request.onerror = () => resolve();
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingRequests')) { db.close(); resolve(); return; }
      const tx = db.transaction('pendingRequests', 'readwrite');
      tx.objectStore('pendingRequests').clear();
      tx.oncomplete = tx.onerror = tx.onabort = () => { db.close(); resolve(); };
    };
  }).catch(() => {});
  try {
    const deletion = indexedDB.deleteDatabase('syncQueue');
    deletion.onerror = () => {};
  } catch { /* The new worker still never reads or replays an old queue. */ }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await Promise.all(STATIC_ASSETS.map(async path => {
      try {
        const response = await fetch(path, { credentials: 'omit', redirect: 'error' });
        if (response.ok) await cache.put(path, response);
      } catch { /* Offline installation must not cache an error response. */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([STATIC_CACHE, ASSET_CACHE]);
    await Promise.all((await caches.keys())
      .filter(name => /^(?:static|dynamic|data|api|video)-/.test(name) && !keep.has(name))
      .map(name => caches.delete(name)));
    await clearLegacyRequests();
    if ('navigationPreload' in self.registration) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

async function navigation(event) {
  try {
    const response = await event.preloadResponse || await fetch(event.request);
    // Store only the shared shell key, never Telegram launch parameters in URLs.
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put('/', response.clone());
    }
    return response;
  } catch {
    return await caches.match('/') || await caches.match(OFFLINE_PAGE) ||
      new Response('Offline', { status: 503 });
  }
}

async function publicAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type !== 'opaque' && !/no-store|private/i.test(response.headers.get('cache-control') || '')) {
    await cache.put(request, response.clone());
    const keys = await cache.keys();
    await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_ASSETS)).map(key => cache.delete(key)));
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = sameOriginUrl(request.url);
  // Let the browser perform every API/write/credentialled request normally.
  // In particular, a failed mutation remains failed and is never replayed.
  if (!url || request.method !== 'GET' || url.pathname.startsWith('/api/') ||
      hasCredentials(request) || request.headers.has('range')) return;
  if (request.mode === 'navigate') {
    if (!['/', '/index.html'].includes(url.pathname)) return;
    event.respondWith(navigation(event));
  } else if (isPublicAsset(url)) {
    event.respondWith(publicAsset(request));
  }
});

async function trustedClient(event) {
  if (!event.source || !event.source.id) return null;
  const client = await self.clients.get(event.source.id);
  return client && client.type === 'window' && sameOriginUrl(client.url) ? client : null;
}

self.addEventListener('message', event => {
  event.waitUntil((async () => {
    const client = await trustedClient(event);
    if (!client) return;
    if (event.data === 'skipWaiting') { await self.skipWaiting(); return; }
    if (event.data?.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
      const urls = event.data.urls.slice(0, 20).map(sameOriginUrl).filter(isPublicAsset);
      await Promise.all(urls.map(async url => {
        try { await publicAsset(new Request(url.href, { credentials: 'omit', redirect: 'error' })); } catch {}
      }));
    }
    if (event.data?.type === 'GET_SYNC_STATUS' || event.data?.type === 'TRIGGER_SYNC') {
      client.postMessage({ type: 'SYNC_STATUS', pendingCount: 0 });
    }
    if (event.data?.type === 'CHECK_ONLINE') {
      let online = false;
      try { online = (await fetch('/api/health', { method: 'HEAD', cache: 'no-store', redirect: 'error' })).ok; } catch {}
      client.postMessage({ type: 'ONLINE_STATUS', online });
    }
  })());
});

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data?.json() || {}; } catch {}
  const target = sameOriginUrl(typeof data.url === 'string' ? data.url : '/');
  event.waitUntil(self.registration.showNotification(
    typeof data.title === 'string' ? data.title.slice(0, 120) : 'WEB4TG',
    {
      body: typeof data.body === 'string' ? data.body.slice(0, 500) : '',
      icon: '/favicon.png', badge: '/favicon.png',
      data: { url: target ? target.href : self.location.origin + '/' },
    },
  ));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;
  const url = sameOriginUrl(event.notification.data?.url || '/');
  if (!url) return;
  event.waitUntil((async () => {
    for (const client of await self.clients.matchAll({ type: 'window', includeUncontrolled: true })) {
      if (client.url === url.href && 'focus' in client) return client.focus();
    }
    return self.clients.openWindow(url.href);
  })());
});
