import { useState, useCallback, useEffect } from 'react';

interface UsePersistentFavoritesOptions {
  storageKey: string;
}

export function usePersistentFavorites({ storageKey }: UsePersistentFavoritesOptions) {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(favorites)));
      } catch (e) {
        console.warn('Failed to persist favorites:', e);
      }
    }
  }, [favorites, storageKey, isHydrated]);

  const toggleFavorite = useCallback((id: string | number) => {
    const strId = String(id);
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(strId)) {
        next.delete(strId);
      } else {
        next.add(strId);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string | number) => {
    return favorites.has(String(id));
  }, [favorites]);

  const addFavorite = useCallback((id: string | number) => {
    setFavorites(prev => new Set([...Array.from(prev), String(id)]));
  }, []);

  const removeFavorite = useCallback((id: string | number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.delete(String(id));
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
  }, []);

  return {
    favorites,
    favoritesArray: Array.from(favorites),
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    favoritesCount: favorites.size,
    isHydrated
  };
}
