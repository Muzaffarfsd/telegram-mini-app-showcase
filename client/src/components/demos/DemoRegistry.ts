// Dynamic demo registry for lazy loading
import { lazy, ComponentType } from 'react';

// Type for demo components
export interface DemoComponent {
  component: ComponentType<any>;
  preload?: () => Promise<{ default: ComponentType<any> }>;
}

// Demo registry with lazy loading
export const demoRegistry: Record<string, DemoComponent> = {
  'flower-store': {
    component: lazy(() => import('./FlowerStore')),
    preload: () => import('./FlowerStore')
  },
  'china-buyer': {
    component: lazy(() => import('./ChinaBuyer')),
    preload: () => import('./ChinaBuyer')
  },
  'medical-center': {
    component: lazy(() => import('./MedicalCenter')),
    preload: () => import('./MedicalCenter')
  },
  'lumi-studio': {
    component: lazy(() => import('./LumiStudio')),
    preload: () => import('./LumiStudio')
  },
  'opt-market': {
    component: lazy(() => import('./OptMarket')),
    preload: () => import('./OptMarket')
  },
  'apple-store': {
    component: lazy(() => import('./AppleStore')),
    preload: () => import('./AppleStore')
  },
  'muraka-fashion': {
    component: lazy(() => import('./MurakaFashion')),
    preload: () => import('./MurakaFashion')
  },
  'nike-sneakers': {
    component: lazy(() => import('./RoyalStep')),
    preload: () => import('./RoyalStep')
  },
  'royal-step': {
    component: lazy(() => import('./RoyalStep')),
    preload: () => import('./RoyalStep')
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
  
  // Aliases for compatibility with demoApps.ts IDs
  
  // Futuristic Fashion Collection (4 premium full stores)
  
  // Premium Design Collection - New Apps
  'oxyz-nft': {
    component: lazy(() => import('./OxyzNFT')),
    preload: () => import('./OxyzNFT')
  },
  'skincare-aura': {
    component: lazy(() => import('./SkincareStore')),
    preload: () => import('./SkincareStore')
  },
  'emily-carter-ai': {
    component: lazy(() => import('./EmilyCarterAI')),
    preload: () => import('./EmilyCarterAI')
  },
};

const preloadedSet = new Set<string>();

export const preloadCriticalDemos = () => {
  const criticalDemos = ['flower-store', 'lumi-studio', 'apple-store'];
  
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
