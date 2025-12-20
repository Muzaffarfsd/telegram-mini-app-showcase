const DB_NAME = 'web4tg-offline';
const DB_VERSION = 1;

interface UserProfile {
  id: string;
  telegramId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  updatedAt: number;
}

interface GamificationStats {
  id: string;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  completedTasks: string[];
  achievements: string[];
  updatedAt: number;
}

interface ViewedDemo {
  id: string;
  demoId: string;
  viewedAt: number;
  data?: Record<string, unknown>;
}

interface PendingAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  payload: unknown;
  createdAt: number;
  retryCount: number;
}

type StoreNames = 'userProfile' | 'gamificationStats' | 'viewedDemos' | 'pendingActions';

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('userProfile')) {
          db.createObjectStore('userProfile', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('gamificationStats')) {
          db.createObjectStore('gamificationStats', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('viewedDemos')) {
          const store = db.createObjectStore('viewedDemos', { keyPath: 'id' });
          store.createIndex('demoId', 'demoId', { unique: false });
          store.createIndex('viewedAt', 'viewedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('pendingActions')) {
          const store = db.createObjectStore('pendingActions', { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: StoreNames, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.init();
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const store = await this.getStore('userProfile', 'readwrite');
    await this.promisifyRequest(store.put({ ...profile, updatedAt: Date.now() }));
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const store = await this.getStore('userProfile');
    const result = await this.promisifyRequest(store.get('current'));
    return result || null;
  }

  async saveGamificationStats(stats: GamificationStats): Promise<void> {
    const store = await this.getStore('gamificationStats', 'readwrite');
    await this.promisifyRequest(store.put({ ...stats, updatedAt: Date.now() }));
  }

  async getGamificationStats(): Promise<GamificationStats | null> {
    const store = await this.getStore('gamificationStats');
    const result = await this.promisifyRequest(store.get('current'));
    return result || null;
  }

  async saveViewedDemo(demo: Omit<ViewedDemo, 'id'>): Promise<void> {
    const store = await this.getStore('viewedDemos', 'readwrite');
    const id = `${demo.demoId}-${Date.now()}`;
    await this.promisifyRequest(store.put({ ...demo, id }));
  }

  async getViewedDemos(): Promise<ViewedDemo[]> {
    const store = await this.getStore('viewedDemos');
    return this.promisifyRequest(store.getAll());
  }

  async getDemoData(demoId: string): Promise<ViewedDemo | null> {
    const store = await this.getStore('viewedDemos');
    const index = store.index('demoId');
    const results = await this.promisifyRequest(index.getAll(demoId));
    return results.length > 0 ? results[results.length - 1] : null;
  }

  async addPendingAction(action: Omit<PendingAction, 'id' | 'createdAt' | 'retryCount'>): Promise<string> {
    const store = await this.getStore('pendingActions', 'readwrite');
    const id = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pendingAction: PendingAction = {
      ...action,
      id,
      createdAt: Date.now(),
      retryCount: 0
    };
    await this.promisifyRequest(store.put(pendingAction));
    return id;
  }

  async getPendingActions(): Promise<PendingAction[]> {
    const store = await this.getStore('pendingActions');
    return this.promisifyRequest(store.getAll());
  }

  async removePendingAction(id: string): Promise<void> {
    const store = await this.getStore('pendingActions', 'readwrite');
    await this.promisifyRequest(store.delete(id));
  }

  async updatePendingAction(id: string, updates: Partial<PendingAction>): Promise<void> {
    const store = await this.getStore('pendingActions', 'readwrite');
    const existing = await this.promisifyRequest(store.get(id));
    if (existing) {
      await this.promisifyRequest(store.put({ ...existing, ...updates }));
    }
  }

  async clearPendingActions(): Promise<void> {
    const store = await this.getStore('pendingActions', 'readwrite');
    await this.promisifyRequest(store.clear());
  }

  async getPendingActionsCount(): Promise<number> {
    const store = await this.getStore('pendingActions');
    return this.promisifyRequest(store.count());
  }

  async syncPendingActions(fetcher: (action: PendingAction) => Promise<boolean>): Promise<{ synced: number; failed: number }> {
    const actions = await this.getPendingActions();
    let synced = 0;
    let failed = 0;

    for (const action of actions) {
      try {
        const success = await fetcher(action);
        if (success) {
          await this.removePendingAction(action.id);
          synced++;
        } else {
          await this.updatePendingAction(action.id, { retryCount: action.retryCount + 1 });
          failed++;
        }
      } catch {
        await this.updatePendingAction(action.id, { retryCount: action.retryCount + 1 });
        failed++;
      }
    }

    return { synced, failed };
  }

  async saveToCache(key: string, data: unknown): Promise<void> {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  getFromCache<T>(key: string, maxAge: number = 24 * 60 * 60 * 1000): T | null {
    try {
      const item = localStorage.getItem(`offline_${key}`);
      if (!item) return null;
      
      const { data, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`offline_${key}`);
        return null;
      }
      
      return data as T;
    } catch {
      return null;
    }
  }

  clearCache(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('offline_'));
    keys.forEach(k => localStorage.removeItem(k));
  }
}

export const offlineStorage = new OfflineStorage();

export type { UserProfile, GamificationStats, ViewedDemo, PendingAction };
