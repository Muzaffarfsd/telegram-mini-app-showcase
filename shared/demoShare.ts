/** Public demo destinations. Keep share links constrained to these published demos. */
export const demoShareEntries = {
  'flower-store': { ru: 'Цветочный магазин', en: 'Flower shop' },
  'china-buyer': { ru: 'Байер из Китая', en: 'China sourcing' },
  'medical-center': { ru: 'Медицинский центр', en: 'Medical center' },
  'lumi-studio': { ru: 'Студия красоты', en: 'Beauty studio' },
  'opt-market': { ru: 'Оптовый магазин', en: 'Wholesale store' },
  'apple-store': { ru: 'Магазин техники Apple', en: 'Apple technology store' },
  'muraka-fashion': { ru: 'Магазин одежды', en: 'Clothing store' },
  'women-fashion': { ru: 'Магазин женской одежды', en: "Women's clothing store" },
  'jewelry-store': { ru: 'Магазин украшений', en: 'Jewelry store' },
  'nike-sneakers': { ru: 'Магазин кроссовок', en: 'Sneaker store' },
  'skincare-aura': { ru: 'Магазин косметики', en: 'Skincare store' },
} as const;

export type DemoShareId = keyof typeof demoShareEntries;

/** Legacy demo ID points to the same published sneaker store. */
export function canonicalDemoShareId(id: string): DemoShareId | null {
  const canonical = id === 'royal-step' ? 'nike-sneakers' : id;
  return Object.prototype.hasOwnProperty.call(demoShareEntries, canonical) ? canonical as DemoShareId : null;
}

/** Telegram startapp accepts a short URL-safe payload, not arbitrary paths. */
export function demoShareStartParam(id: DemoShareId): string {
  return `demo_${id}`;
}

export function demoShareIdFromStartParam(value: string): DemoShareId | null {
  if (!value.startsWith('demo_')) return null;
  return canonicalDemoShareId(value.slice('demo_'.length));
}
