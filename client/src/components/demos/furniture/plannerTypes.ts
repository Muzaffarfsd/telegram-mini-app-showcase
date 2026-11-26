/** Dimensions are metres and must come from a verified product source. */
export type PlannerProduct = {
  id: string;
  name: string;
  category?: string;
  placement?: 'floor' | 'rug' | 'ceiling' | 'surface';
  modelUrl: string;
  widthM: number;
  depthM: number;
  heightM: number;
  imageUrl?: string;
};

export type PlannerItem = { id: string; productId: string; x: number; z: number; rotation: number };
/** Back-wall opening coordinates are metres from the left-hand corner. */
export type WallSide = 'back' | 'right' | 'front' | 'left';
export type PlannerOpening = { start: number; width: number; wall?:WallSide; hinge?:'left'|'right' };
export type PlannerOpenings = { window: PlannerOpening | null; door: PlannerOpening | null };
export type PlannerRoom = { width: number; depth: number; openings?: PlannerOpenings };

/** Legacy rooms retain their existing automatic window until explicitly edited. */
export function roomOpenings(room: PlannerRoom): PlannerOpenings {
  if (room.openings) return room.openings;
  const width = Math.min(1.9, room.width * 0.56), side = (room.width - width) / 2;
  const center = -Math.min(0.3, side * 0.22);
  return { window: { start: room.width / 2 + center - width / 2, width }, door: null };
}
export const openingWalls:WallSide[]=['back','right','front','left'];
export function wallLength(room:PlannerRoom,side:WallSide='back'){return side==='left'||side==='right'?room.depth:room.width}
export function wallPoint(room:PlannerRoom,side:WallSide='back',along=0,inward=0){const w=room.width/2,d=room.depth/2;switch(side){case 'right':return {x:w-inward,z:-d+along};case 'front':return {x:w-along,z:d-inward};case 'left':return {x:-w+inward,z:d-along};default:return {x:-w+along,z:-d+inward}}}
export function validOpenings(room: PlannerRoom): boolean {
  if (room.openings === undefined) return true;
  const openings = room.openings;
  if (!openings || typeof openings !== 'object' || !('window' in openings) || !('door' in openings)) return false;
  const valid = (o: PlannerOpening | null, min: number) => o === null || (typeof o === 'object' && Number.isFinite(o.start) && Number.isFinite(o.width) && o.width >= min && o.width <= 3 && o.start >= 0.1 && (!o.wall||openingWalls.includes(o.wall)) && (!o.hinge||['left','right'].includes(o.hinge)) && o.start + o.width <= wallLength(room,o.wall) - 0.1 + 1e-7);
  if (!valid(openings.window, 0.4) || !valid(openings.door, 0.6)) return false;
  return !openings.window || !openings.door || (openings.window.wall||'back')!==(openings.door.wall||'back') || openings.window.start + openings.window.width + 0.1 <= openings.door.start + 1e-7 || openings.door.start + openings.door.width + 0.1 <= openings.window.start + 1e-7;
}
/** Approximate 0.8 m approach zone, a warning rather than a certified clearance. */
export function doorApproachOccupied(room: PlannerRoom, items: readonly PlannerItem[], products: readonly PlannerProduct[]): boolean {
  const door = roomOpenings(room).door;
  if (!door) return false;
  const {x,z}=wallPoint(room,door.wall,door.start+door.width/2,.4), side=door.wall==='left'||door.wall==='right';
  return items.some(item => { const product = products.find(p => p.id === item.productId); if (!product || product.placement==='ceiling' || product.placement==='rug' || product.placement==='surface') return false; const half = footprint(product, item.rotation); return Math.abs(item.x - x) < half.x + (side?.4:door.width/2) && Math.abs(item.z - z) < half.z + (side?door.width/2:.4); });
}
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

/** Keep the fixed-scale shelf clear of the window and movable furniture. */
export function bookshelfPlacement(room: PlannerRoom, items: readonly PlannerItem[], products: readonly PlannerProduct[]) {
  const x = room.width / 2 - 0.63, z = -room.depth / 2 + 0.265;
  const openings = roomOpenings(room);
  const clearOfOpenings = [openings.window, openings.door].every(opening => {
    if (!opening || (opening.wall && opening.wall!=='back')) return true;
    const center = -room.width / 2 + opening.start + opening.width / 2;
    return Math.abs(x - center) >= 0.62 + opening.width / 2 + 0.3;
  });
  const clear = clearOfOpenings && items.every(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return true;
    const half = footprint(product, item.rotation);
    return Math.abs(item.x - x) >= half.x + 0.62 || Math.abs(item.z - z) >= half.z + 0.265;
  });
  return { x, z, clear };
}

/** Find an actual free span on the back wall for an optional framed picture.
 * Curtains, openings, the bookshelf and tall movable items all take precedence.
 */
export function picturePlacement(room: PlannerRoom, items: readonly PlannerItem[], products: readonly PlannerProduct[], shelfVisible: boolean): number | null {
  const margin = 0.1, pictureHalf = 0.3;
  const blocked: Array<[number, number]> = [];
  const openings = roomOpenings(room);
  if (openings.window && (!openings.window.wall||openings.window.wall==='back')) blocked.push([-room.width / 2 + openings.window.start - 0.44, -room.width / 2 + openings.window.start + openings.window.width + 0.44]);
  if (openings.door && (!openings.door.wall||openings.door.wall==='back')) blocked.push([-room.width / 2 + openings.door.start - 0.08, -room.width / 2 + openings.door.start + openings.door.width + 0.08]);
  if (shelfVisible) {
    const shelf = bookshelfPlacement(room, items, products);
    blocked.push([shelf.x - 0.68, shelf.x + 0.68]);
  }
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.heightM < 1.1) continue;
    const half = footprint(product, item.rotation);
    if (item.z - half.z <= -room.depth / 2 + 0.18) blocked.push([item.x - half.x - 0.05, item.x + half.x + 0.05]);
  }
  blocked.sort((a, b) => a[0] - b[0]);
  let start = -room.width / 2 + margin;
  let best: { length: number; x: number } | null = null;
  for (const [left, right] of [...blocked, [room.width / 2 - margin, room.width / 2 - margin] as [number, number]]) {
    const end = Math.min(left, room.width / 2 - margin);
    if (end - start >= pictureHalf * 2 + 0.1 && (!best || end - start > best.length)) best = { length: end - start, x: (start + end) / 2 };
    start = Math.max(start, right);
  }
  return best?.x ?? null;
}

/** A left-wall fallback when openings and shelves leave no usable back wall. */
export function sidePicturePlacement(room: PlannerRoom, items: readonly PlannerItem[], products: readonly PlannerProduct[]): number | null {
  const blocked: Array<[number, number]> = [];
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.heightM < 1.1) continue;
    const half = footprint(product, item.rotation);
    if (item.x - half.x <= -room.width / 2 + 0.18) blocked.push([item.z - half.z - 0.05, item.z + half.z + 0.05]);
  }
  blocked.sort((a, b) => a[0] - b[0]);
  let start = -room.depth / 2 + 0.1;
  let best: { length: number; z: number } | null = null;
  for (const [left, right] of [...blocked, [room.depth / 2 - 0.1, room.depth / 2 - 0.1] as [number, number]]) {
    const end = Math.min(left, room.depth / 2 - 0.1);
    if (end - start >= 0.7 && (!best || end - start > best.length)) best = { length: end - start, z: (start + end) / 2 };
    start = Math.max(start, right);
  }
  return best?.z ?? null;
}

/** Room containment uses a conservative rotated bounding rectangle. */
export function contain(item: PlannerItem, product: PlannerProduct, room: PlannerRoom): PlannerItem | null {
  const half = footprint(product, item.rotation);
  if (half.x * 2 > room.width || half.z * 2 > room.depth) return null;
  return { ...item, x: Math.max(-room.width / 2 + half.x, Math.min(room.width / 2 - half.x, item.x)), z: Math.max(-room.depth / 2 + half.z, Math.min(room.depth / 2 - half.z, item.z)) };
}

/** Separating-axis check on two rotated rectangular footprints. */
export function overlaps(a: PlannerItem, ap: PlannerProduct, b: PlannerItem, bp: PlannerProduct): boolean {

  if (ap.placement === 'rug' || bp.placement === 'rug') return ap.placement === bp.placement && Math.abs(a.x-b.x)<.05 && Math.abs(a.z-b.z)<.05;
  if ((ap.placement || 'floor') !== (bp.placement || 'floor')) return false;
  const axes = [a.rotation, b.rotation].flatMap(angle => [{ x: Math.cos(angle), z: Math.sin(angle) }, { x: -Math.sin(angle), z: Math.cos(angle) }]);
  const project = (p: PlannerProduct, angle: number, axis: { x: number; z: number }) => {
    const c = Math.cos(angle), s = Math.sin(angle);
    return Math.abs(axis.x * c + axis.z * s) * p.widthM / 2 + Math.abs(-axis.x * s + axis.z * c) * p.depthM / 2;
  };
  return axes.every(axis => Math.abs((a.x - b.x) * axis.x + (a.z - b.z) * axis.z) < project(ap, a.rotation, axis) + project(bp, b.rotation, axis) - 0.005);
}

export function canSupport(p:PlannerProduct){return (p.category||'').toLowerCase().includes('столы')||(p.category==='Хранение'&&p.heightM<=1.1)}
export function supportFor(piece:PlannerItem,product:PlannerProduct,items:readonly PlannerItem[],products:readonly PlannerProduct[]){
  if(product.placement!=='surface')return undefined;
  return items.find(i=>{const p=products.find(v=>v.id===i.productId);if(i.id===piece.id||!p||!canSupport(p))return false;
    const c=Math.cos(i.rotation),s=Math.sin(i.rotation),dx=piece.x-i.x,dz=piece.z-i.z,half=footprint(product,piece.rotation-i.rotation);
    return Math.abs(dx*c+dz*s)+half.x<=p.widthM/2+.002&&Math.abs(-dx*s+dz*c)+half.z<=p.depthM/2+.002;});
}
export function surfaceHeight(piece:PlannerItem,p:PlannerProduct,items:readonly PlannerItem[],products:readonly PlannerProduct[],ceiling=2.6){
  if(p.placement==='ceiling')return ceiling-p.heightM-.01;
  if(p.placement==='rug')return .022;
  const support=supportFor(piece,p,items,products);return support?products.find(v=>v.id===support.productId)?.heightM||0:0;
}
export function supportedPieces(id:string,items:readonly PlannerItem[],products:readonly PlannerProduct[]){
  return items.filter(i=>{const p=products.find(v=>v.id===i.productId);return p&&supportFor(i,p,items,products)?.id===id;});
}
export function moveWithContents(items:PlannerItem[],before:PlannerItem,after:PlannerItem,products:readonly PlannerProduct[]){
  const cargo=supportedPieces(before.id,items,products),angle=after.rotation-before.rotation,c=Math.cos(angle),s=Math.sin(angle);
  return items.map(i=>{if(i.id===before.id)return after;if(!cargo.includes(i))return i;
    const dx=i.x-before.x,dz=i.z-before.z;return {...i,x:after.x+dx*c-dz*s,z:after.z+dx*s+dz*c,rotation:i.rotation+angle};});
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
  if (!validOpenings(v.room)) return null;
  const ids = new Set<string>();
  const items: PlannerItem[] = [];
  for (const item of v.items) {
    const product = products.find(p => p.id === item?.productId);
    if (!product || typeof item.id !== 'string' || !item.id || ids.has(item.id) || ![item.x, item.z, item.rotation].every(Number.isFinite)) return null;
    const contained = contain(item, product, v.room);
    if (!allowUnmeasured && (!contained || Math.abs(contained.x - item.x) > 0.001 || Math.abs(contained.z - item.z) > 0.001 || items.some(other => overlaps(item, product, other, products.find(p => p.id === other.productId)!)))) return null;
    ids.add(item.id); items.push({ id: item.id, productId: item.productId, x: item.x, z: item.z, rotation: item.rotation });
  }
  return { version: 1, room: { width: v.room.width, depth: v.room.depth, ...(v.room.openings === undefined ? {} : { openings: { window: v.room.openings.window && { ...v.room.openings.window }, door: v.room.openings.door && { ...v.room.openings.door } } }) }, items };
}
