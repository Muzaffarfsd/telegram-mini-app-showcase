/** Remove only data belonging to retired demo applications. FLORAL ART used
 * the same `florist` ID / floralart-store keys as a different project, so
 * these ambiguous values are deliberately retained. Run again on each visit
 * so an inaccessible storage backend can be cleaned when it becomes available.
 */
const RETIRED_DEMO_IDS = new Set([
  'beauty', 'clothing-store', 'premium-fashion', 'electronics',
  'luxury-perfume', 'fragrance-royale', 'sneaker-store', 'sneaker-vault',
  'luxury-watches', 'time-elite', 'futuristic-fashion-1', 'futuristic-fashion-2',
  'futuristic-fashion-3', 'futuristic-fashion-4', 'restaurant', 'tech-nova',
  'streetwear-vanta',
]);
const RETIRED_LOCAL_KEYS = [
  'techstore-cart', 'techstore-favorites', 'techstore-orders',
  'deluxedine-cart', 'deluxedine-favorites', 'deluxedine-orders',
  'rascal-store', 'storeblack-store',
  ...['fragranceroyale-store', 'sneakervault-store', 'timeelite-store', 'nikeacg-store', 'labsurvivalist-store']
    .flatMap(prefix => ['cart', 'favorites', 'orders'].map(suffix => `${prefix}_${suffix}`)),
];

/** Preserve the wrapper's TTL and timestamp; leave malformed/unknown data alone. */
function pruneStoredList(serialized: string): string | null {
  try {
    const wrapper = JSON.parse(serialized);
    if (!wrapper || typeof wrapper !== 'object' || typeof wrapper.value !== 'string') return null;
    const values: unknown = JSON.parse(wrapper.value);
    if (!Array.isArray(values)) return null;
    const next = values.filter(value => typeof value !== 'string' || !RETIRED_DEMO_IDS.has(value));
    if (next.length === values.length) return null;
    return JSON.stringify({ ...wrapper, value: JSON.stringify(next) });
  } catch { return null; }
}

function cleanLocalStorage(): void {
  try {
    for (const key of RETIRED_LOCAL_KEYS) localStorage.removeItem(key);
    for (const key of ['tma_cache_favorites', 'tma_cache_viewedDemos']) {
      const value = localStorage.getItem(key);
      const cleaned = value && pruneStoredList(value);
      if (cleaned) localStorage.setItem(key, cleaned);
    }
    for (const [key, field] of [['gamification_stats', 'viewedDemoIds'], ['web4tg_user_behavior', 'viewedDemos']] as const) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const record = JSON.parse(raw);
        if (!record || typeof record !== 'object' || !Array.isArray(record[field])) continue;
        const previous = record[field];
        const next = previous.filter((id: unknown) => typeof id !== 'string' || !RETIRED_DEMO_IDS.has(id));
        if (next.length !== previous.length) localStorage.setItem(key, JSON.stringify({ ...record, [field]: next }));
      } catch { /* leave malformed unrelated data alone */ }
    }
    try {
      const rawQueue = localStorage.getItem('analytics_offline_queue');
      if (rawQueue) {
        const queue = JSON.parse(rawQueue);
        if (Array.isArray(queue)) {
          const next = queue.filter(event => !(event?.category === 'demo' && typeof event.label === 'string' && RETIRED_DEMO_IDS.has(event.label)));
          if (next.length !== queue.length) localStorage.setItem('analytics_offline_queue', JSON.stringify(next));
        }
      }
    } catch { /* leave a malformed queue unchanged */ }
  } catch { /* storage may be disabled, unavailable or contain malformed JSON */ }
}

/** Do not create a new database, delete other stores, or alter other records. */
function cleanViewedDemoDatabase(): Promise<void> {
  return new Promise(resolve => {
    let finished = false;
    let db: IDBDatabase | undefined;
    let tx: IDBTransaction | undefined;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      db?.close();
      resolve();
    };
    const timer = setTimeout(() => {
      try { tx?.abort(); } catch { /* transaction may already have closed */ }
      finish();
    }, 1500);
    try {
      const request = indexedDB.open('web4tg-offline');
      request.onupgradeneeded = () => request.transaction?.abort();
      request.onerror = request.onblocked = finish;
      request.onsuccess = () => {
        db = request.result;
        if (finished) { db.close(); return; }
        try {
          const stores = ['viewedDemos', 'gamificationStats'].filter(name => db!.objectStoreNames.contains(name));
          if (!stores.length) { finish(); return; }
          tx = db.transaction(stores, 'readwrite');
          if (stores.includes('viewedDemos')) {
            const cursor = tx.objectStore('viewedDemos').openCursor();
            cursor.onsuccess = () => {
              const item = cursor.result;
              if (!item) return;
              if (typeof item.value?.demoId === 'string' && RETIRED_DEMO_IDS.has(item.value.demoId)) item.delete();
              item.continue();
            };
          }
          if (stores.includes('gamificationStats')) {
            const cursor = tx.objectStore('gamificationStats').openCursor();
            cursor.onsuccess = () => {
              const item = cursor.result;
              if (!item) return;
              const value = item.value;
              if (value && Array.isArray(value.viewedDemoIds)) {
                const next = value.viewedDemoIds.filter((id: unknown) => typeof id !== 'string' || !RETIRED_DEMO_IDS.has(id));
                if (next.length !== value.viewedDemoIds.length) item.update({ ...value, viewedDemoIds: next });
              }
              item.continue();
            };
          }
          tx.oncomplete = tx.onabort = tx.onerror = finish;
        } catch { finish(); }
      };
    } catch { finish(); }
  });
}

// Telegram DeviceStorage has no cancellable/CAS write: a late callback could
// overwrite newer user selections. Leave it untouched rather than risk data loss.
export async function cleanupRetiredDemos(): Promise<void> {
  cleanLocalStorage();
  await cleanViewedDemoDatabase();
}
