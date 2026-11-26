import * as THREE from 'three';
import {
  roomOpenings,
  wallLength,
  wallPoint,
  openingWalls,
  type PlannerOpening,
  type PlannerRoom,
  type WallSide,
} from './plannerTypes';
/** Build the clear openings on a non-back wall in wall-local coordinates. */
export function makeWall(room: PlannerRoom, side: WallSide, wallColor: string, garden: THREE.Texture | null) {
  const group = new THREE.Group(),
    span = wallLength(room, side),
    point = wallPoint(room, side, span / 2),
    openings = roomOpenings(room);
  group.position.set(point.x, 0, point.z);
  group.rotation.y = (-openingWalls.indexOf(side) * Math.PI) / 2;
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.82 })
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  const ordered: Array<{ type: string; o: PlannerOpening }> = [];
  for (const [type, o] of Object.entries(openings))
    if (o && (o.wall || 'back') === side) ordered.push({ type, o });
  ordered.sort((a, b) => a.o.start - b.o.start);
  const panel = (from: number, to: number, y: number, h: number) => {
    if (to > from + 0.001) box(to - from, h, 0.1, (from + to - span) / 2, y, 0, wallColor);
  };
  let end = 0;
  for (const { type, o } of ordered) {
    panel(end, o.start, 1.3, 2.6);
    const l = o.start - span / 2,
      r = l + o.width,
      c = (l + r) / 2;
    if (type === 'window') {
      panel(o.start, o.start + o.width, 0.215, 0.43);
      panel(o.start, o.start + o.width, 2.41, 0.38);
      for (const x of [l, c, r]) box(0.027, 1.79, 0.12, x, 1.325, 0.023, '#625b4b');
      for (const y of [0.43, 2.22]) box(o.width, 0.04, 0.15, c, y, 0.03, '#ede5d4');
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(o.width, 1.79),
        new THREE.MeshBasicMaterial({
          map: garden?.clone() || null,
          color: garden ? '#ffffff' : '#d6e2e3',
          side: THREE.DoubleSide,
          toneMapped: false,
        })
      );
      glass.position.set(c, 1.325, -0.09);
      group.add(glass);
    } else {
      panel(o.start, o.start + o.width, 2.35, 0.5);
      for (const x of [l - 0.025, r + 0.025]) box(0.05, 2.1, 0.13, x, 1.05, 0.02, '#d3bd9e');
      box(o.width + 0.09, 0.06, 0.13, c, 2.115, 0.02, '#d3bd9e');
    }
    end = o.start + o.width;
  }
  panel(end, span, 1.3, 2.6);
  return group;
}
