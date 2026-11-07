// Background imports may parse substantial code. Keep them away from the
// short period in which a foreground interaction is animating.
let blockedUntil = 0;

export function pauseBackgroundPrefetch(durationMs = 400): void {
  blockedUntil = Math.max(blockedUntil, Date.now() + durationMs);
}

export function backgroundPrefetchWait(): number {
  return Math.max(0, blockedUntil - Date.now());
}
