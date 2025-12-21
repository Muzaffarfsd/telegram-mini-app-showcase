import { useState, useEffect, useCallback } from 'react';
import {
  deviceStorage,
  getViewedDemos,
  addViewedDemo,
  getFavorites,
  toggleFavorite,
  getUserPreferences,
  setUserPreference,
  getCachedApiResponse,
  cacheApiResponse,
  CACHE_TTL,
} from '@/lib/telegramStorage';

/**
 * Hook for managing viewed demos with DeviceStorage
 */
export function useViewedDemos() {
  const [viewedDemos, setViewedDemos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getViewedDemos().then((demos) => {
      setViewedDemos(demos);
      setIsLoading(false);
    });
  }, []);

  const markAsViewed = useCallback(async (demoId: string) => {
    if (!viewedDemos.includes(demoId)) {
      await addViewedDemo(demoId);
      setViewedDemos((prev) => [...prev, demoId]);
    }
  }, [viewedDemos]);

  const isViewed = useCallback((demoId: string) => {
    return viewedDemos.includes(demoId);
  }, [viewedDemos]);

  return {
    viewedDemos,
    isLoading,
    markAsViewed,
    isViewed,
    viewedCount: viewedDemos.length,
  };
}

/**
 * Hook for managing favorite demos with DeviceStorage
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getFavorites().then((favs) => {
      setFavorites(favs);
      setIsLoading(false);
    });
  }, []);

  const toggle = useCallback(async (demoId: string) => {
    const isNowFavorite = await toggleFavorite(demoId);
    setFavorites((prev) =>
      isNowFavorite ? [...prev, demoId] : prev.filter((id) => id !== demoId)
    );
    return isNowFavorite;
  }, []);

  const isFavorite = useCallback((demoId: string) => {
    return favorites.includes(demoId);
  }, [favorites]);

  return {
    favorites,
    isLoading,
    toggle,
    isFavorite,
    count: favorites.length,
  };
}

/**
 * Hook for user preferences with DeviceStorage
 */
export function useUserPreferences<T = unknown>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      if (key in prefs) {
        setValue(prefs[key] as T);
      }
      setIsLoading(false);
    });
  }, [key]);

  const updateValue = useCallback(async (newValue: T) => {
    await setUserPreference(key, newValue);
    setValue(newValue);
  }, [key]);

  return [value, updateValue, isLoading] as const;
}

/**
 * Hook for caching API responses with DeviceStorage
 * Provides instant cached data while fetching fresh data in background
 */
export function useCachedQuery<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = CACHE_TTL.FIVE_MINUTES
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const refresh = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    
    try {
      const freshData = await fetchFn();
      setData(freshData);
      setIsFromCache(false);
      await cacheApiResponse(endpoint, freshData, ttlMs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [endpoint, fetchFn, ttlMs]);

  useEffect(() => {
    const loadData = async () => {
      const cached = await getCachedApiResponse<T>(endpoint);
      
      if (cached !== null) {
        setData(cached);
        setIsFromCache(true);
        setIsLoading(false);
        refresh();
      } else {
        await refresh();
      }
    };
    
    loadData();
  }, [endpoint, refresh]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    isFromCache,
    refresh,
  };
}

/**
 * Hook for simple key-value storage with DeviceStorage
 */
export function useDeviceStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    deviceStorage.get<T>(key).then((stored) => {
      if (stored !== null) {
        setValue(stored);
      }
      setIsLoading(false);
    });
  }, [key]);

  const updateValue = useCallback(async (newValue: T, ttlMs?: number) => {
    await deviceStorage.set(key, newValue, ttlMs);
    setValue(newValue);
  }, [key]);

  const removeValue = useCallback(async () => {
    await deviceStorage.remove(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return {
    value,
    setValue: updateValue,
    remove: removeValue,
    isLoading,
  };
}

export { CACHE_TTL };
