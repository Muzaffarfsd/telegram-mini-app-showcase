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

let initialization: Promise<void> | undefined;
let pendingWrite: Promise<unknown> = Promise.resolve();

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    
    initialization ??= getFavorites().then(favorites => {
      set({ favorites, isLoading: false, isInitialized: true });
    }).catch(() => set({ isLoading: false, isInitialized: true }));
    return initialization;
  },

  toggle: (demoId: string) => {
    const result = pendingWrite.then(async () => {
      await get().initialize();
      const previous = get().favorites;
      const saved = previous.includes(demoId);
      set({ favorites: saved ? previous.filter(id => id !== demoId) : [...previous, demoId] });
      try {
        const persisted = await toggleFavorite(demoId);
        if (persisted === saved) set({ favorites: await getFavorites() });
        return persisted;
      } catch {
        set({ favorites: previous });
        return saved;
      }
    });
    pendingWrite = result.catch(() => {});
    return result;
  },

  isFavorite: (demoId: string) => {
    return get().favorites.includes(demoId);
  },
}));
