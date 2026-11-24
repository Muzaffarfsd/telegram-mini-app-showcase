// Background imports may parse substantial code. Keep them away from the
// short period in which a foreground interaction is animating.
let blockedUntil = 0;

export function canSpeculate(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !document.hidden && !connection?.saveData && !['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '');
}

export function pauseBackgroundPrefetch(durationMs = 400): void {
  blockedUntil = Math.max(blockedUntil, Date.now() + durationMs);
}

export function backgroundPrefetchWait(): number {
  return Math.max(0, blockedUntil - Date.now());
}
