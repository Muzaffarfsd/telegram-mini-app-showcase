// Dynamic demo registry for lazy loading
import { ComponentType } from 'react';
import { loadablePage } from '../../utils/loadablePage';
import { warmDemoImage } from '../../lib/demoImagePreload';
import { canSpeculate } from '../../lib/interactionBudget';

// Type for demo components
export interface DemoComponent {
  component: ComponentType<any>;
  preload?: () => Promise<{ default: ComponentType<any> }>;
}

// Demo registry with lazy loading
const loaders = {
  'furniture-studio': {
    load: () => import('./furniture/FurnitureShop')
  },
  'flower-store': {
    load: () => import('./FlowerStore')
  },
  'takt-coffee': {
    load: () => import('./coffee/TaktCoffee')
  },
  'china-buyer': {
    load: () => import('./ChinaBuyer')
  },
  'medical-center': {
    load: () => import('./MedicalCenter')
  },
  'lumi-studio': {
    load: () => import('./LumiStudio')
  },
  'opt-market': {
    load: () => import('./OptMarket')
  },
  'apple-store': {
    load: () => import('./AppleStore')
  },
  'muraka-fashion': {
    load: () => import('./MurakaFashion')
  },
  'jewelry-store': {
    load: () => import('./JewelryStore')
  },
  'women-fashion': {
    load: () => import('./WomenFashion')
  },
  'nike-sneakers': {
    load: () => import('./RoyalStep')
  },
  'royal-step': {
    load: () => import('./RoyalStep')
  },
  'fitness': {
    load: () => import('./Fitness')
  },
  'banking': {
    load: () => import('./Banking')
  },
  'bookstore': {
    load: () => import('./Bookstore')
  },
  'car-rental': {
    load: () => import('./CarRental')
  },
  'taxi': {
    load: () => import('./Taxi')
  },
  'medical': {
    load: () => import('./Medical')
  },
  'courses': {
    load: () => import('./Courses')
  },
  'car-wash': {
    load: () => import('./CarWash')
  },
  
  // Aliases for compatibility with demoApps.ts IDs
  
  // Futuristic Fashion Collection (4 premium full stores)
  
  // Premium Design Collection - New Apps
  'oxyz-nft': {
    load: () => import('./OxyzNFT')
  },
  'skincare-aura': {
    load: () => import('./SkincareStore')
  },
  'emily-carter-ai': {
    load: () => import('./EmilyCarterAI')
  },
};

export const demoRegistry: Record<string, DemoComponent> = Object.fromEntries(
  Object.entries(loaders).map(([id, { load }]) => {
    const component = loadablePage<ComponentType<any>>(load);
    return [id, { component, preload: component.preload }];
  })
);

export const preloadCriticalDemos = () => {
  if (!canSpeculate()) return;
  ['flower-store', 'lumi-studio', 'apple-store'].forEach((id, index) => {
    const warm = () => { if (canSpeculate()) void demoRegistry[id].preload?.().catch(() => {}); };
    if ('requestIdleCallback' in window) requestIdleCallback(() => setTimeout(warm, index * 300), { timeout: 5000 });
    else setTimeout(warm, 1000 + index * 300);
  });
};

// Get demo component
export const getDemoComponent = (demoId: string): ComponentType<any> | null => {
  const demo = demoRegistry[demoId];
  return demo?.component || null;
};

// Check if demo exists
export const isDemoAvailable = (demoId: string): boolean => {
  return Object.hasOwn(demoRegistry, demoId);
};

export function preloadDemo(id: string, priority: 'high' | 'low' = 'low'): void {
  const key = Object.hasOwn(demoRegistry, id) ? id : id.replace(/-\d+$/, '');
  if (!Object.hasOwn(demoRegistry, key)) return;
  warmDemoImage(key, priority);
  void demoRegistry[key].preload?.().catch(() => {});
}
