import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

// Browsers report failed module fetches differently (Chromium, WebKit, Firefox).
export function isChunkLoadError(error: unknown): boolean {
  const value = error as { name?: string; message?: string } | null;
  const message = typeof error === 'string' ? error : value?.message || '';
  return value?.name === 'ChunkLoadError' || /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load module script|unable to preload css|loading (?:css )?chunk .+ failed|load failed/i.test(message);
}

/** Guard rapid reloads and cap automatic attempts per entry bundle and tab. */
export function recoverChunkLoad(error: unknown): boolean {
  if (!isChunkLoadError(error) || typeof window === 'undefined') return false;
  try {
    const entry = document.querySelector<HTMLScriptElement>('script[type="module"][src]')?.src || window.location.pathname;
    const key = 'web4tg-chunk-recovery';
    const saved = sessionStorage.getItem(key);
    let previous: { entry?: string; at?: number; count?: number } = {};
    try { previous = saved ? JSON.parse(saved) : {}; } catch { /* Old guard format. */ }
    const sameEntry = previous.entry === entry;
    const count = sameEntry && typeof previous.count === 'number' ? previous.count : 0;
    if (sameEntry && (count >= 3 || (typeof previous.at === 'number' && Date.now() - previous.at < 60_000))) return false;
    sessionStorage.setItem(key, JSON.stringify({ entry, at: Date.now(), count: count + 1 }));
    window.location.reload();
    return true;
  } catch {
    // Private browsing can disable storage; never risk an unbounded reload loop.
    return false;
  }
}

export function lazyWithRecovery<T extends ComponentType<any>>(
  load: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(() => importWithRecovery(load));
}

export function importWithRecovery<T>(load: () => Promise<T>): Promise<T> {
  return load().catch((error: unknown) => {
    recoverChunkLoad(error);
    throw error;
  });
}
