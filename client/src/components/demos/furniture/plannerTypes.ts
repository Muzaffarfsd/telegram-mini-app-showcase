/** Dimensions are metres and must come from a verified product source. */
export type PlannerProduct = {
  id: string;
  name: string;
  modelUrl: string;
  widthM: number;
  depthM: number;
  heightM: number;
  imageUrl?: string;
};

export type PlannerItem = { id: string; productId: string; x: number; z: number; rotation: number };
export type PlannerRoom = { width: number; depth: number };
export type PlannerLayout = { version: 1; room: PlannerRoom; items: PlannerItem[] };
export type PlannerView = 'top' | 'perspective';

export const PLANNER_STORAGE_KEY = 'web4tg-furniture-planner-v1';
export const DEFAULT_ROOM: PlannerRoom = { width: 4.8, depth: 4 };
export const ROOM_MIN = 2;
export const ROOM_MAX = 8;
export const MAX_ITEMS = 12;

export function footprint(product: PlannerProduct, angle: number) {
  const c = Math.abs(Math.cos(angle));
  const s = Math.abs(Math.sin(angle));
  return { x: (product.widthM * c + product.depthM * s) / 2, z: (product.widthM * s + product.depthM * c) / 2 };
}

/** Decorative cabinet is omitted when it would intersect an editable item. */
export function cabinetPlacement(room: PlannerRoom, items: readonly PlannerItem[], products: readonly PlannerProduct[]) {
  const x = room.width / 2 - 0.48, z = -room.depth / 2 + 1.32;
  const clear = room.width >= 3.2 && room.depth >= 2.8 && items.every(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return true;
    const half = footprint(product, item.rotation);
    // Cabinet is rotated along Z; the extra margin avoids visibly touching it.
    return Math.abs(item.x - x) >= half.x + 0.3 || Math.abs(item.z - z) >= half.z + 1.26;
  });
  return { x, z, clear };
}

/** Room containment uses a conservative rotated bounding rectangle. */
export function contain(item: PlannerItem, product: PlannerProduct, room: PlannerRoom): PlannerItem | null {
  const half = footprint(product, item.rotation);
  if (half.x * 2 > room.width || half.z * 2 > room.depth) return null;
  return { ...item, x: Math.max(-room.width / 2 + half.x, Math.min(room.width / 2 - half.x, item.x)), z: Math.max(-room.depth / 2 + half.z, Math.min(room.depth / 2 - half.z, item.z)) };
}

/** Separating-axis check on two rotated rectangular footprints. */
export function overlaps(a: PlannerItem, ap: PlannerProduct, b: PlannerItem, bp: PlannerProduct): boolean {
  const axes = [a.rotation, b.rotation].flatMap(angle => [{ x: Math.cos(angle), z: Math.sin(angle) }, { x: -Math.sin(angle), z: Math.cos(angle) }]);
  const project = (p: PlannerProduct, angle: number, axis: { x: number; z: number }) => {
    const c = Math.cos(angle), s = Math.sin(angle);
    return Math.abs(axis.x * c + axis.z * s) * p.widthM / 2 + Math.abs(-axis.x * s + axis.z * c) * p.depthM / 2;
  };
  return axes.every(axis => Math.abs((a.x - b.x) * axis.x + (a.z - b.z) * axis.z) < project(ap, a.rotation, axis) + project(bp, b.rotation, axis) - 0.005);
}

export function validProducts(products: readonly PlannerProduct[]): PlannerProduct[] {
  const ids = new Set<string>();
  return products.filter(p => {
    if (!p || typeof p.id !== 'string' || !p.id || ids.has(p.id) || typeof p.name !== 'string' || typeof p.modelUrl !== 'string' || !p.modelUrl || ![p.widthM, p.depthM, p.heightM].every(n => Number.isFinite(n) && n > 0 && n <= 8)) return false;
    ids.add(p.id); return true;
  });
}

export function validateLayout(value: unknown, products: readonly PlannerProduct[], allowUnmeasured = false): PlannerLayout | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as PlannerLayout;
  if (v.version !== 1 || !v.room || ![v.room.width, v.room.depth].every(n => Number.isFinite(n) && n >= ROOM_MIN && n <= ROOM_MAX) || !Array.isArray(v.items) || v.items.length > MAX_ITEMS) return null;
  const ids = new Set<string>();
  const items: PlannerItem[] = [];
  for (const item of v.items) {
    const product = products.find(p => p.id === item?.productId);
    if (!product || typeof item.id !== 'string' || !item.id || ids.has(item.id) || ![item.x, item.z, item.rotation].every(Number.isFinite)) return null;
    const contained = contain(item, product, v.room);
    if (!allowUnmeasured && (!contained || Math.abs(contained.x - item.x) > 0.001 || Math.abs(contained.z - item.z) > 0.001 || items.some(other => overlaps(item, product, other, products.find(p => p.id === other.productId)!)))) return null;
    ids.add(item.id); items.push({ id: item.id, productId: item.productId, x: item.x, z: item.z, rotation: item.rotation });
  }
  return { version: 1, room: { width: v.room.width, depth: v.room.depth }, items };
}
