import {
  supportFor,
  canSupport,
  contain,
  overlaps,
  validOpenings,
  validateLayout,
  type PlannerLayout,
  type PlannerProduct,
  type PlannerRoom,
  type PlannerItem,
} from './plannerTypes';

type Place = [product: string, x: number, z: number, degrees?: number];
export type SceneKey = 'studio' | 'dining' | 'reading' | 'office' | 'bedroom';
export type RoomKey = SceneKey | 'fixed' | 'custom' | 'shared' | 'transferred';
export interface RoomStory {
  key: SceneKey;
  title: [string, string];
  intention: [string, string];
  room: PlannerRoom;
  palette: string;
  items: Place[];
}
const item = (asin: string) => 'abo-' + asin.toLowerCase();
export const stories: RoomStory[] = [
  {
    key: 'studio',
    title: ['Компактная студия', 'Compact studio'],
    intention: ['Оставить проход у дивана', 'Leave room to walk past the sofa'],
    room: { width: 3.4, depth: 4.5 },
    palette: '#a47151',
    items: [
      [item('B07P5LMN2C'), -0.38, -1.48],
      [item('B072ZLCB3M'), 0.97, -1.46],
      [item('B07B4YXR7D'), 1.3, -0.5],
      [item('B07TR659G8'), -1.36, 0.5, 90],
      [item('B07B4WKMYK'), 0.15, -0.1],
    ],
  },
  {
    key: 'dining',
    title: ['Гостиная-столовая', 'Living & dining'],
    intention: ['Проверить место за стулом', 'Check clearance behind a chair'],
    room: {
      width: 5.2,
      depth: 5.8,
      openings: {
        window: { start: 1.65, width: 2.7 },
        door: { wall: 'front', start: 0.26, width: 0.9, hinge: 'left' },
      },
    },
    palette: '#767a65',
    items: [
      [item('B07B78LZQC'), 0.48, -0.55],
      [item('B0857JW1B9'), 0.48, -1.45],
      [item('B084S12MYC'), 0.48, 0.38, 180],
      [item('B0857JW1B9'), 1.4, -0.55, -90],
      [item('B084S12MYC'), -0.47, -0.55, 90],
      [item('B07374M9ZW'), 0.48, -0.55],
      ['movian-morat-sofa', -0.65, 2.12, 180],
      [item('B07TR659G8'), -2.22, -0.75, 90],
    ],
  },
  {
    key: 'reading',
    title: ['Угол для чтения', 'Reading corner'],
    intention: ['Сравнить кресла у окна', 'Compare armchairs by the window'],
    room: {
      width: 3.2,
      depth: 3.6,
      openings: { window: { wall: 'right', start: 0.25, width: 1.85 }, door: null },
    },
    palette: '#7d684d',
    items: [
      ['rivet-adrienne-chair', -0.55, -0.62, -12],
      [item('B072ZLCB3M'), 0.31, -0.74],
      [item('B07B4YXR7D'), -1.19, -0.75],
      [item('B07QTB45S5'), 1.33, -0.7, 90],
      [item('B07P8ST6VT'), -0.31, 0.55],
      [item('B07B4WKMYK'), -0.15, 0.21],
    ],
  },
  {
    key: 'office',
    title: ['Кабинет у окна', 'Window-side study'],
    intention: ['Оставить место для рабочего кресла', 'Leave space for the chair to roll back'],
    room: { width: 3, depth: 3.8, openings: { window: { start: 0.23, width: 2.23 }, door: null } },
    palette: '#62716c',
    items: [
      [item('B07JXXR83F'), -0.2, -1.4],
      [item('B07MKQT7V4'), -0.1, -0.67, 180],
      [item('B0825DNRXL'), 0.28, -1.4],
      [item('B07QTB45S5'), 1.18, 0.44, 90],
      [item('B07QJ1X2J4'), -0.65, 1.4],
    ],
  },
  {
    key: 'bedroom',
    title: ['Спальня на двоих', 'Bedroom for two'],
    intention: ['Проверить проход с обеих сторон', 'Check access on both sides of the bed'],
    room: {
      width: 3.4,
      depth: 4.2,
      openings: { window: { wall: 'right', start: 1.1, width: 1.55 }, door: null },
    },
    palette: '#9b8173',
    items: [
      [item('B07K7K25ZL'), 0, -0.74],
      [item('B07RPZSM4W'), -1.28, -1.53],
      [item('B07RPZSM4W'), 1.28, -1.53],
      [item('B07QJ1X2J4'), 0, 0.85],
      [item('B0825DNRXL'), -1.28, -1.53],
      [item('B07B4WKMYK'), 0, 0.5],
    ],
  },
];
export const storyByKey = (key: string) => stories.find((s) => s.key === key);
export const scenePoster = (key: SceneKey) => '/furniture/scenes/' + key + '.webp';
export function nextId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    'piece-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)
  );
}
export function findRoomSpot(
  product: PlannerProduct,
  layout: PlannerLayout,
  products: readonly PlannerProduct[],
  proposed?: PlannerItem
): PlannerItem | null {
  const draft = proposed || { id: nextId(), productId: product.id, x: 0, z: 0, rotation: 0 };
  const candidates: [number, number][] = [[draft.x, draft.z]];
  if (product.placement === 'surface')
    for (const i of layout.items) {
      const p = products.find((v) => v.id === i.productId);
      if (p && canSupport(p)) candidates.push([i.x, i.z]);
    }
  for (let z = -layout.room.depth / 2; z < layout.room.depth / 2 + 0.15; z += 0.15)
    for (let x = -layout.room.width / 2; x < layout.room.width / 2 + 0.15; x += 0.15) candidates.push([x, z]);
  for (const [x, z] of candidates) {
    const v = contain({ ...draft, x, z }, product, layout.room);
    if (
      v &&
      (product.placement !== 'surface' || supportFor(v, product, layout.items, products)) &&
      !layout.items.some((i) => {
        const p = products.find((a) => a.id === i.productId);
        return p && i.id !== v.id && overlaps(v, product, i, p);
      })
    )
      return v;
  }
  return null;
}
export function storyLayout(s: RoomStory, products: readonly PlannerProduct[]): PlannerLayout {
  const layout: PlannerLayout = { version: 1, room: { ...s.room }, items: [] };
  for (const [productId, x, z, a = 0] of s.items) {
    const p = products.find((v) => v.id === productId);
    if (!p) continue;
    const v = findRoomSpot(p, layout, products, {
      id: nextId(),
      productId,
      x,
      z,
      rotation: (a * Math.PI) / 180,
    });
    if (v) layout.items.push(v);
  }
  return layout;
}
export function fitCollection(
  items: readonly PlannerItem[],
  room: PlannerRoom,
  products: readonly PlannerProduct[],
  offset = { x: 0, z: 0 }
) {
  const layout: PlannerLayout = { version: 1, room, items: [] };
  const skipped: string[] = [];
  for (const i of [...items].sort(
    (a, b) =>
      Number(products.find((p) => p.id === a.productId)?.placement === 'surface') -
      Number(products.find((p) => p.id === b.productId)?.placement === 'surface')
  )) {
    const p = products.find((p) => p.id === i.productId);
    if (!p) continue;
    const position = findRoomSpot(p, layout, products, { ...i, x: i.x - offset.x, z: i.z - offset.z });
    if (position) layout.items.push(position);
    else skipped.push(p.name);
  }
  return { layout, skipped };
}
export type RoomProject = { id: string; name: string; scene: RoomKey; layout: PlannerLayout; date: string };
const prefix = 'web4tg-furniture-project:';
export function readProjects(products: readonly PlannerProduct[]): RoomProject[] {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .flatMap((k) => {
        try {
          const r = JSON.parse(localStorage.getItem(k) || 'null');
          const layout = validateLayout(r?.layout, products, true);
          return layout && typeof r.name === 'string' && typeof r.date === 'string'
            ? [{ ...r, id: k.slice(prefix.length), layout }]
            : [];
        } catch {
          return [];
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}
export function storeProject(name: string, scene: RoomKey, layout: PlannerLayout, id = nextId()) {
  const entry: RoomProject = {
    id,
    name: name.trim().slice(0, 70),
    scene,
    layout,
    date: new Date().toISOString(),
  };
  localStorage.setItem(prefix + id, JSON.stringify(entry));
  return entry;
}
export function restoreProject(entry: RoomProject) {
  localStorage.setItem(prefix + entry.id, JSON.stringify(entry));
}
export function removeProject(id: string) {
  localStorage.removeItem(prefix + id);
}
export function roomURL(layout: PlannerLayout, scene: RoomKey) {
  const payload = JSON.stringify([
    1,
    scene,
    layout.room,
    layout.items.map((i) => [i.productId, i.x, i.z, i.rotation]),
  ]);
  const bytes = new TextEncoder().encode(payload);
  const encoded = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const url = new URL(location.href);
  url.searchParams.set('room', encoded);
  url.hash = '/demos/furniture-studio/app';
  return url.toString();
}
export function sharedRoom(products: readonly PlannerProduct[]) {
  try {
    const data = new URL(location.href).searchParams.get('room');
    if (!data || data.length > 12000) return null;
    const [version, key, room, items] = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(data.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
      )
    );
    if (version !== 1 || !room || !validOpenings(room) || !Array.isArray(items) || items.length > 12)
      return null;
    if (
      !items.every(
        (v) =>
          Array.isArray(v) &&
          v.length === 4 &&
          typeof v[0] === 'string' &&
          v.slice(1).every(Number.isFinite) &&
          Math.abs(v[1]) < 20 &&
          Math.abs(v[2]) < 20
      )
    )
      return null;
    const layout = validateLayout(
      {
        version: 1,
        room,
        items: items.map(([productId, x, z, rotation]: [string, number, number, number]) => ({
          id: nextId(),
          productId,
          x,
          z,
          rotation,
        })),
      },
      products,
      true
    );
    return layout ? { layout, scene: (storyByKey(key)?.key || 'custom') as RoomKey } : null;
  } catch {
    return null;
  }
}
