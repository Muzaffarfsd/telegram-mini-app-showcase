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
  'coffee': {
    component: lazy(() => import('./Coffee')),
    preload: () => import('./Coffee')
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
  'tea-house': {
    component: lazy(() => import('./TeaHouse')),
    preload: () => import('./TeaHouse')
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
  'gadget-lab': {
    component: lazy(() => import('./GadgetLab')),
    preload: () => import('./GadgetLab')
  },
  'game-forge': {
    component: lazy(() => import('./GameForge')),
    preload: () => import('./GameForge')
  },
  'interior-lux': {
    component: lazy(() => import('./InteriorLux')),
    preload: () => import('./InteriorLux')
  },
  
  // Aliases for compatibility with demoApps.ts IDs
  'luxury-watches': {
    component: lazy(() => import('./TimeElite')),
    preload: () => import('./TimeElite')
  },
  'home-decor': {
    component: lazy(() => import('./InteriorLux')),
    preload: () => import('./InteriorLux')
  },
  'sneaker-store': {
    component: lazy(() => import('./SneakerVault')),
    preload: () => import('./SneakerVault')
  },
  'premium-tea': {
    component: lazy(() => import('./TeaHouse')),
    preload: () => import('./TeaHouse')
  },
  'tech-gadgets': {
    component: lazy(() => import('./GadgetLab')),
    preload: () => import('./GadgetLab')
  },
  'luxury-perfume': {
    component: lazy(() => import('./FragranceRoyale')),
    preload: () => import('./FragranceRoyale')
  },
  'gaming-gear': {
    component: lazy(() => import('./GameForge')),
    preload: () => import('./GameForge')
  },
  'pc-builds': {
    component: lazy(() => import('./GadgetLab')),
    preload: () => import('./GadgetLab')
  },
  
  // Futuristic Fashion Collection (5 premium designs)
  'futuristic-fashion-1': {
    component: lazy(() => import('./FuturisticFashion1')),
    preload: () => import('./FuturisticFashion1')
  },
  'futuristic-fashion-2': {
    component: lazy(() => import('./FuturisticFashion2')),
    preload: () => import('./FuturisticFashion2')
  },
  'futuristic-fashion-3': {
    component: lazy(() => import('./FuturisticFashion3')),
    preload: () => import('./FuturisticFashion3')
  },
  'futuristic-fashion-4': {
    component: lazy(() => import('./FuturisticFashion4')),
    preload: () => import('./FuturisticFashion4')
  },
  'futuristic-fashion-5': {
    component: lazy(() => import('./FuturisticFashion5')),
    preload: () => import('./FuturisticFashion5')
  }
};

// Preload critical demos (reduced to essential only for performance)
export const preloadCriticalDemos = () => {
  const criticalDemos = ['clothing-store', 'electronics']; // Reduced from 4 to 2 most critical
  
  criticalDemos.forEach(demoId => {
    const demo = demoRegistry[demoId];
    if (demo?.preload) {
      // Preload on requestIdleCallback with delay to not block initial render
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          setTimeout(() => demo.preload!(), 200); // Additional delay
        });
      } else {
        // Fallback with longer delay
        setTimeout(() => demo.preload!(), 500);
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