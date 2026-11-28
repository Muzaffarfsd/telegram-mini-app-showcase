/** Bound the drawing buffer; a dense screen alone does not mean a fast GPU. */
export type FurnitureRenderKind = 'viewer' | 'planner' | 'fixed';
export type FurnitureRenderHints = {
  pixelRatio: number;
  width: number;
  height: number;
  memory?: number;
  cores?: number;
  userAgent?: string;
  lowPerformance?: boolean;
};

export function furniturePixelRatio(kind: FurnitureRenderKind, hints: FurnitureRenderHints): number {
  const density = Number.isFinite(hints.pixelRatio) && hints.pixelRatio > 0 ? hints.pixelRatio : 1;
  const memory = hints.memory;
  const baseline = kind === 'viewer' ? 1.75 : kind === 'fixed' && memory !== undefined && memory <= 2 ? 1 : 1.5;
  const defaultRatio = Math.min(density, baseline);
  const constrained = hints.lowPerformance || (memory !== undefined && memory <= 4) || (hints.cores !== undefined && hints.cores > 0 && hints.cores <= 4);
  // Telegram reports a performance class for Android. Outside Telegram, only
  // upgrade when both memory and CPU information are explicitly available.
  const telegramHigh = /Telegram-Android\/[^\s]+\s*\([^)]*;\s*HIGH\s*\)/i.test(hints.userAgent || '');
  const telegramConstrained = /Telegram-Android\/[^\s]+\s*\([^)]*;\s*(?:LOW|AVERAGE)\s*\)/i.test(hints.userAgent || '');
  const capable = telegramHigh || (memory !== undefined && memory >= 8 && (hints.cores || 0) >= 6);
  if (constrained || telegramConstrained || !capable) return defaultRatio;

  const area = Math.max(1, hints.width) * Math.max(1, hints.height);
  const pixelBudget = kind === 'viewer' ? 1_100_000 : 1_400_000;
  const desired = kind === 'viewer' ? 2 : 1.75;
  // Never lower the previous ratio on larger canvases; decline the upgrade
  // instead. The cap applies to extra resolution, not baseline quality.
  return Math.max(defaultRatio, Math.min(density, desired, Math.sqrt(pixelBudget / area)));
}

export function currentFurniturePixelRatio(kind: FurnitureRenderKind, width: number, height: number): number {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return furniturePixelRatio(kind, {
    pixelRatio: window.devicePixelRatio || 1,
    width, height,
    memory: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
    userAgent: nav.userAgent,
    lowPerformance: document.documentElement.classList.contains('low-performance'),
  });
}
