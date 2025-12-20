import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineStorage, PendingAction } from '@/lib/offlineStorage';

interface OfflineStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
}

interface SyncResult {
  synced: number;
  failed: number;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function useOfflineData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  options: {
    maxAge?: number;
    enabled?: boolean;
  } = {}
) {
  const { maxAge = 24 * 60 * 60 * 1000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const isOnline = useOnlineStatus();

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    const cachedData = offlineStorage.getFromCache<T>(cacheKey, maxAge);

    if (!isOnline) {
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
      } else {
        setError(new Error('No cached data available offline'));
      }
      setIsLoading(false);
      return;
    }

    try {
      const freshData = await fetchFn();
      setData(freshData);
      setIsFromCache(false);
      await offlineStorage.saveToCache(cacheKey, freshData);
    } catch (err) {
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, cacheKey, maxAge, isOnline, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, isFromCache, refetch, isOnline };
}

export function useOfflineSync() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingSyncCount: 0,
    isSyncing: false,
    lastSyncTime: null
  });

  const isOnline = useOnlineStatus();
  const syncInProgressRef = useRef(false);

  useEffect(() => {
    setStatus(prev => ({ ...prev, isOnline }));
  }, [isOnline]);

  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await offlineStorage.getPendingActionsCount();
      setStatus(prev => ({ ...prev, pendingSyncCount: count }));
    };
    updatePendingCount();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_QUEUED') {
        setStatus(prev => ({ ...prev, pendingSyncCount: event.data.count }));
      }
      if (event.data?.type === 'SYNC_COMPLETE') {
        setStatus(prev => ({
          ...prev,
          pendingSyncCount: event.data.remaining,
          isSyncing: false,
          lastSyncTime: Date.now()
        }));
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (syncInProgressRef.current || !isOnline) {
      return { synced: 0, failed: 0 };
    }

    syncInProgressRef.current = true;
    setStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const result = await offlineStorage.syncPendingActions(async (action: PendingAction) => {
        const response = await fetch(action.endpoint, {
          method: action.type === 'DELETE' ? 'DELETE' : action.type === 'UPDATE' ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload)
        });
        return response.ok;
      });

      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC' });
      }

      const remainingCount = await offlineStorage.getPendingActionsCount();
      setStatus(prev => ({
        ...prev,
        pendingSyncCount: remainingCount,
        isSyncing: false,
        lastSyncTime: Date.now()
      }));

      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      setStatus(prev => ({ ...prev, isSyncing: false }));
      return { synced: 0, failed: 0 };
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && status.pendingSyncCount > 0 && !syncInProgressRef.current) {
      const timer = setTimeout(() => {
        syncNow();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, status.pendingSyncCount, syncNow]);

  const queueAction = useCallback(async (
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    endpoint: string,
    payload: unknown
  ): Promise<string> => {
    const id = await offlineStorage.addPendingAction({ type, endpoint, payload });
    const count = await offlineStorage.getPendingActionsCount();
    setStatus(prev => ({ ...prev, pendingSyncCount: count }));
    return id;
  }, []);

  return {
    ...status,
    syncNow,
    queueAction
  };
}

export function useOfflineMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    endpoint: string;
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    onOfflineQueued?: (id: string) => void;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useOnlineStatus();
  const { queueAction } = useOfflineSync();

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    setIsLoading(true);
    setError(null);

    if (!isOnline) {
      try {
        const id = await queueAction('CREATE', options.endpoint, variables);
        options.onOfflineQueued?.(id);
        setIsLoading(false);
        return null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to queue action');
        setError(error);
        options.onError?.(error);
        setIsLoading(false);
        return null;
      }
    }

    try {
      const data = await mutationFn(variables);
      options.onSuccess?.(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      
      try {
        const id = await queueAction('CREATE', options.endpoint, variables);
        options.onOfflineQueued?.(id);
      } catch {
        setError(error);
        options.onError?.(error);
      }
      
      setIsLoading(false);
      return null;
    }
  }, [mutationFn, isOnline, queueAction, options]);

  return { mutate, isLoading, error, isOnline };
}
