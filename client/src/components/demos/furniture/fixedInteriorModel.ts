import { supportFor, canSupport, footprint, overlaps, type PlannerItem, type PlannerProduct } from './plannerTypes';
export const FIXED_BOUNDS = { left: -3.18, right: 4.8, back: -2.7, front: 6.4 } as const;

export const FIXED_STORAGE_KEY = 'web4tg-fixed-interior-v1';
export const FIXED_ITEM_LIMIT = 8;
export type FixedLayout = { version: 1; items: PlannerItem[]; selected?: string | null };

// Fixed architectural furnishings: console and floor lamp. A conservative
// rectangle keeps movable products clear of their physical geometry.
const fixtures = [
  { x0: 2.04, x1: 3.86, z0: -2.63, z1: -1.94 },
  { x0: 1.04, x1: 1.60, z0: -1.72, z1: -1.14 },
];
export function fixedCanPlace(item: PlannerItem, product: PlannerProduct, items: readonly PlannerItem[], products: readonly PlannerProduct[]): boolean {
  if (![item.x, item.z, item.rotation].every(Number.isFinite)) return false;
  const half = footprint(product, item.rotation);
  if (item.x - half.x < FIXED_BOUNDS.left || item.x + half.x > FIXED_BOUNDS.right || item.z - half.z < FIXED_BOUNDS.back || item.z + half.z > FIXED_BOUNDS.front) return false;
  if (product.placement==='surface'&&!supportFor(item,product,items,products))return false;
  if ((!product.placement||product.placement==='floor') && fixtures.some(f => item.x + half.x > f.x0 && item.x - half.x < f.x1 && item.z + half.z > f.z0 && item.z - half.z < f.z1)) return false;
  return items.every(other => { if (other.id === item.id) return true; const p = products.find(entry => entry.id === other.productId); return !p || !overlaps(item, product, other, p); });
}
export function validateFixedLayout(raw: unknown, products: readonly PlannerProduct[]): FixedLayout | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<FixedLayout>;
  if (value.version !== 1 || !Array.isArray(value.items) || value.items.length > FIXED_ITEM_LIMIT) return null;
  const items: PlannerItem[] = [], ids = new Set<string>();
  for (const entry of value.items) {
    if (!entry || typeof entry.id !== 'string' || !entry.id || entry.id.length > 100 || ids.has(entry.id) || typeof entry.productId !== 'string') return null;
    const product = products.find(p => p.id === entry.productId);
    if (!product || !fixedCanPlace(entry, product, items, products)) return null;
    ids.add(entry.id); items.push({ id: entry.id, productId: entry.productId, x: entry.x, z: entry.z, rotation: entry.rotation });
  }
  if (value.selected !== undefined && value.selected !== null && (typeof value.selected !== 'string' || !ids.has(value.selected))) return null;
  return { version: 1, items, selected: value.selected ?? null };
}
export function findFixedPosition(product: PlannerProduct, items: readonly PlannerItem[], products: readonly PlannerProduct[]): PlannerItem | null {
  const id = globalThis.crypto?.randomUUID?.() ?? `fixed-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const positions = [{ x: -.65, z: -1.85 }, { x: -1.6, z: .1 }, { x: 1.25, z: .15 }, { x: -.8, z: .05 }];
  if(product.placement==='surface')positions.unshift(...items.filter(i=>{const p=products.find(v=>v.id===i.productId);return p&&canSupport(p)}).map(i=>({x:i.x,z:i.z})));
  for (let z = -2.1; z <= 5.6; z += .35) for (let x = -2.8; x <= 4; x += .35) positions.push({ x, z });
  for (const p of positions) { const item = { id, productId: product.id, x: p.x, z: p.z, rotation: 0 }; if (fixedCanPlace(item, product, items, products)) return item; }
  return null;
}
