// Dynamic demo registry for lazy loading
import { lazy, ComponentType } from 'react';

// Type for demo components
export interface DemoComponent {
  component: ComponentType<any>;
  preload?: () => Promise<{ default: ComponentType<any> }>;
}

// Demo registry with lazy loading
export const demoRegistry: Record<string, DemoComponent> = {
  'clothing-store': {
    component: lazy(() => import('./PremiumFashionStore')),
    preload: () => import('./PremiumFashionStore')
  },
  'premium-fashion': {
    component: lazy(() => import('./PremiumFashionStore')),
    preload: () => import('./PremiumFashionStore')
  },
  'electronics': {
    component: lazy(() => import('./Electronics')),
    preload: () => import('./Electronics')
  },
  'beauty': {
    component: lazy(() => import('./Beauty')),
    preload: () => import('./Beauty')
  },
  'restaurant': {
    component: lazy(() => import('./Restaurant')),
    preload: () => import('./Restaurant')
  },
  'fitness': {
    component: lazy(() => import('./Fitness')),
    preload: () => import('./Fitness')
  },
  'banking': {
    component: lazy(() => import('./Banking')),
    preload: () => import('./Banking')
  },
  'bookstore': {
    component: lazy(() => import('./Bookstore')),
    preload: () => import('./Bookstore')
  },
  'car-rental': {
    component: lazy(() => import('./CarRental')),
    preload: () => import('./CarRental')
  },
  'taxi': {
    component: lazy(() => import('./Taxi')),
    preload: () => import('./Taxi')
  },
  'medical': {
    component: lazy(() => import('./Medical')),
    preload: () => import('./Medical')
  },
  'courses': {
    component: lazy(() => import('./Courses')),
    preload: () => import('./Courses')
  },
  'car-wash': {
    component: lazy(() => import('./CarWash')),
    preload: () => import('./CarWash')
  },
  'florist': {
    component: lazy(() => import('./Florist')),
    preload: () => import('./Florist')
  },
  'sneaker-vault': {
    component: lazy(() => import('./SneakerVault')),
    preload: () => import('./SneakerVault')
  },
  'fragrance-royale': {
    component: lazy(() => import('./FragranceRoyale')),
    preload: () => import('./FragranceRoyale')
  },
  'time-elite': {
    component: lazy(() => import('./TimeElite')),
    preload: () => import('./TimeElite')
  },
  
  // Aliases for compatibility with demoApps.ts IDs
  'luxury-watches': {
    component: lazy(() => import('./TimeElite')),
    preload: () => import('./TimeElite')
  },
  'sneaker-store': {
    component: lazy(() => import('./SneakerVault')),
    preload: () => import('./SneakerVault')
  },
  'luxury-perfume': {
    component: lazy(() => import('./FragranceRoyale')),
    preload: () => import('./FragranceRoyale')
  },
  
  // Futuristic Fashion Collection (4 premium full stores)
  'futuristic-fashion-1': {
    component: lazy(() => import('./RascalStore')),
    preload: () => import('./RascalStore')
  },
  'futuristic-fashion-2': {
    component: lazy(() => import('./StoreBlack')),
    preload: () => import('./StoreBlack')
  },
  'futuristic-fashion-3': {
    component: lazy(() => import('./LabSurvivalist')),
    preload: () => import('./LabSurvivalist')
  },
  'futuristic-fashion-4': {
    component: lazy(() => import('./NikeACG')),
    preload: () => import('./NikeACG')
  },
  
  // Premium Design Collection - New Apps
  'oxyz-nft': {
    component: lazy(() => import('./OxyzNFT')),
    preload: () => import('./OxyzNFT')
  },
  'emily-carter-ai': {
    component: lazy(() => import('./EmilyCarterAI')),
    preload: () => import('./EmilyCarterAI')
  }
};

const preloadedSet = new Set<string>();

export const preloadCriticalDemos = () => {
  const criticalDemos = [
    'electronics', 'luxury-watches', 'luxury-perfume', 
    'sneaker-store', 'clothing-store', 'florist'
  ];
  
  criticalDemos.forEach((demoId, index) => {
    const demo = demoRegistry[demoId];
    if (demo?.preload && !preloadedSet.has(demoId)) {
      const itemDelay = index * 300;
      const doPreload = () => {
        setTimeout(() => {
          if (!preloadedSet.has(demoId)) {
            preloadedSet.add(demoId);
            demo.preload!().catch(() => {});
          }
        }, itemDelay);
      };
      if ('requestIdleCallback' in window) {
        requestIdleCallback(doPreload, { timeout: 5000 });
      } else {
        setTimeout(doPreload, 1000 + itemDelay);
      }
    }
  });
};

// Get demo component
export const getDemoComponent = (demoId: string): ComponentType<any> | null => {
  const demo = demoRegistry[demoId];
  return demo?.component || null;
};

// Check if demo exists
export const isDemoAvailable = (demoId: string): boolean => {
  return demoId in demoRegistry;
};

export const preloadDemo = (demoId: string): void => {
  if (preloadedSet.has(demoId)) return;
  const demo = demoRegistry[demoId];
  if (demo?.preload) {
    preloadedSet.add(demoId);
    demo.preload().catch(() => {
      preloadedSet.delete(demoId);
    });
  }
};