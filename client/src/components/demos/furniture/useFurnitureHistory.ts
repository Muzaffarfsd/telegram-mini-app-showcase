import { useDemoHistory } from '@/hooks/useDemoHistory';

export function useFurnitureHistory<T extends object>(options: {
  getSnapshot: () => T;
  restore: (snapshot: T) => void;
}) {
  return useDemoHistory({ ...options, demoPath: 'furniture-studio' });
}
