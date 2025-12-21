/**
 * Telegram DeviceStorage & SecureStorage wrapper (Bot API 9.2)
 * 
 * DeviceStorage - persistent local storage for general data
 * SecureStorage - encrypted storage for sensitive data
 * 
 * Falls back to localStorage when running outside Telegram
 */

interface TelegramStorageItem {
  value: string;
  timestamp: number;
  ttl?: number;
}

interface TelegramWebAppStorage {
  DeviceStorage?: {
    getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
    setItem: (key: string, value: string, callback?: (error: Error | null) => void) => void;
    removeItem: (key: string, callback?: (error: Error | null) => void) => void;
    getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
  };
  SecureStorage?: {
    getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
    setItem: (key: string, value: string, callback?: (error: Error | null) => void) => void;
    removeItem: (key: string, callback?: (error: Error | null) => void) => void;
    isSupported: boolean;
  };
  version?: string;
}

const STORAGE_PREFIX = 'tma_cache_';
const SECURE_PREFIX = 'tma_secure_';

function getWebApp(): TelegramWebAppStorage | null {
  try {
    return (window.Telegram?.WebApp as TelegramWebAppStorage) ?? null;
  } catch {
    return null;
  }
}

function isVersion9OrHigher(): boolean {
  const webApp = getWebApp();
  if (!webApp?.version) return false;
  const major = parseInt(webApp.version.split('.')[0], 10);
  return major >= 9;
}

function hasDeviceStorage(): boolean {
  const webApp = getWebApp();
  return isVersion9OrHigher() && !!webApp?.DeviceStorage;
}

function hasSecureStorage(): boolean {
  const webApp = getWebApp();
  return isVersion9OrHigher() && !!webApp?.SecureStorage?.isSupported;
}

/**
 * DeviceStorage - persistent storage on user's device
 * Uses Telegram DeviceStorage (Bot API 9.2) with localStorage fallback
 */
export const deviceStorage = {
  async get<T = string>(key: string): Promise<T | null> {
    const fullKey = STORAGE_PREFIX + key;
    
    if (hasDeviceStorage()) {
      return new Promise((resolve) => {
        getWebApp()!.DeviceStorage!.getItem(fullKey, (error, value) => {
          if (error || !value) {
            resolve(null);
            return;
          }
          try {
            const item: TelegramStorageItem = JSON.parse(value);
            if (item.ttl && Date.now() > item.timestamp + item.ttl) {
              deviceStorage.remove(key);
              resolve(null);
              return;
            }
            resolve(JSON.parse(item.value) as T);
          } catch {
            resolve(value as T);
          }
        });
      });
    }
    
    try {
      const value = localStorage.getItem(fullKey);
      if (!value) return null;
      
      const item: TelegramStorageItem = JSON.parse(value);
      if (item.ttl && Date.now() > item.timestamp + item.ttl) {
        localStorage.removeItem(fullKey);
        return null;
      }
      return JSON.parse(item.value) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlMs?: number): Promise<boolean> {
    const fullKey = STORAGE_PREFIX + key;
    const item: TelegramStorageItem = {
      value: JSON.stringify(value),
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    const serialized = JSON.stringify(item);
    
    if (hasDeviceStorage()) {
      return new Promise((resolve) => {
        getWebApp()!.DeviceStorage!.setItem(fullKey, serialized, (error) => {
          resolve(!error);
        });
      });
    }
    
    try {
      localStorage.setItem(fullKey, serialized);
      return true;
    } catch {
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    const fullKey = STORAGE_PREFIX + key;
    
    if (hasDeviceStorage()) {
      return new Promise((resolve) => {
        getWebApp()!.DeviceStorage!.removeItem(fullKey, (error) => {
          resolve(!error);
        });
      });
    }
    
    try {
      localStorage.removeItem(fullKey);
      return true;
    } catch {
      return false;
    }
  },

  async getKeys(): Promise<string[]> {
    if (hasDeviceStorage()) {
      return new Promise((resolve) => {
        getWebApp()!.DeviceStorage!.getKeys((error, keys) => {
          if (error) {
            resolve([]);
            return;
          }
          resolve(keys.filter(k => k.startsWith(STORAGE_PREFIX)).map(k => k.slice(STORAGE_PREFIX.length)));
        });
      });
    }
    
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.slice(STORAGE_PREFIX.length));
      }
    }
    return keys;
  },
};

/**
 * SecureStorage - encrypted storage for sensitive data
 * Uses Telegram SecureStorage (Bot API 9.2) with no fallback (security)
 */
export const secureStorage = {
  isSupported(): boolean {
    return hasSecureStorage();
  },

  async get(key: string): Promise<string | null> {
    if (!hasSecureStorage()) {
      console.warn('[SecureStorage] Not available - requires Telegram Bot API 9.2+');
      return null;
    }
    
    const fullKey = SECURE_PREFIX + key;
    return new Promise((resolve) => {
      getWebApp()!.SecureStorage!.getItem(fullKey, (error, value) => {
        resolve(error ? null : value);
      });
    });
  },

  async set(key: string, value: string): Promise<boolean> {
    if (!hasSecureStorage()) {
      console.warn('[SecureStorage] Not available - requires Telegram Bot API 9.2+');
      return false;
    }
    
    const fullKey = SECURE_PREFIX + key;
    return new Promise((resolve) => {
      getWebApp()!.SecureStorage!.setItem(fullKey, value, (error) => {
        resolve(!error);
      });
    });
  },

  async remove(key: string): Promise<boolean> {
    if (!hasSecureStorage()) {
      return false;
    }
    
    const fullKey = SECURE_PREFIX + key;
    return new Promise((resolve) => {
      getWebApp()!.SecureStorage!.removeItem(fullKey, (error) => {
        resolve(!error);
      });
    });
  },
};

/**
 * Cache TTL constants
 */
export const CACHE_TTL = {
  FIVE_MINUTES: 5 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Cache utilities for common use cases
 */
export async function getViewedDemos(): Promise<string[]> {
  return (await deviceStorage.get<string[]>('viewedDemos')) ?? [];
}

export async function addViewedDemo(demoId: string): Promise<void> {
  const viewed = await getViewedDemos();
  if (!viewed.includes(demoId)) {
    viewed.push(demoId);
    await deviceStorage.set('viewedDemos', viewed);
  }
}

export async function getFavorites(): Promise<string[]> {
  return (await deviceStorage.get<string[]>('favorites')) ?? [];
}

export async function toggleFavorite(demoId: string): Promise<boolean> {
  const favorites = await getFavorites();
  const index = favorites.indexOf(demoId);
  if (index === -1) {
    favorites.push(demoId);
  } else {
    favorites.splice(index, 1);
  }
  await deviceStorage.set('favorites', favorites);
  return index === -1;
}

export async function getLastVisit(): Promise<number | null> {
  return deviceStorage.get<number>('lastVisit');
}

export async function setLastVisit(): Promise<void> {
  await deviceStorage.set('lastVisit', Date.now());
}

export async function getUserPreferences(): Promise<Record<string, unknown>> {
  return (await deviceStorage.get<Record<string, unknown>>('preferences')) ?? {};
}

export async function setUserPreference(key: string, value: unknown): Promise<void> {
  const prefs = await getUserPreferences();
  prefs[key] = value;
  await deviceStorage.set('preferences', prefs);
}

export async function cacheApiResponse<T>(endpoint: string, data: T, ttlMs: number = CACHE_TTL.FIVE_MINUTES): Promise<void> {
  const cacheKey = `api_${endpoint.replace(/\//g, '_')}`;
  await deviceStorage.set(cacheKey, data, ttlMs);
}

export async function getCachedApiResponse<T>(endpoint: string): Promise<T | null> {
  const cacheKey = `api_${endpoint.replace(/\//g, '_')}`;
  return deviceStorage.get<T>(cacheKey);
}

/**
 * Storage info for debugging
 */
export function getStorageInfo(): {
  deviceStorageAvailable: boolean;
  secureStorageAvailable: boolean;
  telegramVersion: string | null;
  usingFallback: boolean;
} {
  const webApp = getWebApp();
  return {
    deviceStorageAvailable: hasDeviceStorage(),
    secureStorageAvailable: hasSecureStorage(),
    telegramVersion: webApp?.version ?? null,
    usingFallback: !hasDeviceStorage(),
  };
}
