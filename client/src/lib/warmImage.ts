// Start a small number of likely-needed images before a navigation completes.
// The browser owns the HTTP/decoded cache; failed or evicted images can retry.
const pending = new Map<string, HTMLImageElement>();

export function warmImage(src: string | undefined, priority: 'high' | 'low' = 'low', responsive?: { srcSet: string; sizes: string }): void {
  if (!src || typeof window === 'undefined') return;
  const existing = pending.get(src);
  if (existing) {
    if (priority === 'high') existing.fetchPriority = 'high';
    return;
  }
  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = priority;
  pending.set(src, image);
  const release = () => { if (pending.get(src) === image) pending.delete(src); };
  image.onload = () => {
    if (typeof image.decode === 'function') void image.decode().catch(() => {}).finally(release);
    else release();
  };
  image.onerror = release;
  if (responsive) {
    image.sizes = responsive.sizes;
    image.srcset = responsive.srcSet;
  }
  image.src = src;
}

export function warmImages(sources: readonly (string | undefined)[], priority: 'high' | 'low' = 'low'): void {
  sources.forEach(src => warmImage(src, priority));
}
