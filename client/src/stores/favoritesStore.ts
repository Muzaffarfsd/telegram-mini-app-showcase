import { create } from 'zustand';
import { getFavorites, toggleFavorite } from '@/lib/telegramStorage';

interface FavoritesState {
  favorites: string[];
  isLoading: boolean;
  isInitialized: boolean;
  
  initialize: () => Promise<void>;
  toggle: (demoId: string) => Promise<boolean>;
  isFavorite: (demoId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    
    try {
      const favs = await getFavorites();
      set({ favorites: favs, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('[FavoritesStore] Failed to load favorites:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  toggle: async (demoId: string) => {
    const { favorites } = get();
    const wasInFavorites = favorites.includes(demoId);
    
    set({
      favorites: wasInFavorites
        ? favorites.filter(id => id !== demoId)
        : [...favorites, demoId]
    });

    try {
      const isNowFavorite = await toggleFavorite(demoId);
      return isNowFavorite;
    } catch (error) {
      set({ favorites });
      console.error('[FavoritesStore] Failed to toggle favorite:', error);
      return wasInFavorites;
    }
  },

  isFavorite: (demoId: string) => {
    return get().favorites.includes(demoId);
  },
}));
