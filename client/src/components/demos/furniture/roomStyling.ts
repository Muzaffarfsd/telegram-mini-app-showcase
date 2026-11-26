import * as THREE from 'three';
import type { PlannerProduct } from './plannerTypes';

/** Styling belongs to the room. Product viewer and floor-plan dimensions use the original model. */
export function stylePiece(
  theme: string,
  product: PlannerProduct,
  geometry: THREE.Group
): THREE.Group | null {
  const style =
    theme === 'bedroom' && product.id === 'abo-b07k7k25zl'
      ? 'bed'
      : theme === 'dining' && product.id === 'abo-b07b78lzqc'
        ? 'table'
        : theme === 'office' && product.id === 'abo-b07jxxr83f'
          ? 'desk'
          : theme === 'reading' && product.id === 'abo-b072zlcb3m'
            ? 'books'
            : null;
  if (!style) return null;
  const group = new THREE.Group();
  group.name = 'room-styling';
  function mesh(
    shape: THREE.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
    roughness = 0.88
  ) {
    const obj = new THREE.Mesh(
      shape,
      new THREE.MeshStandardMaterial({ color, roughness, side: THREE.DoubleSide })
    );
    obj.position.set(x, y, z);
    obj.castShadow = true;
    obj.receiveShadow = true;
    group.add(obj);
    return obj;
  }
  geometry.updateWorldMatrix(true, true);
  const down = new THREE.Vector3(0, -1, 0),
    ray = new THREE.Raycaster();
  // Query the actual local surface even when its anchor has been rotated or translated.
  function top(x: number, z: number, fallback: number) {
    const anchor = geometry.parent;
    if (!anchor) return fallback;
    const origin = anchor.localToWorld(new THREE.Vector3(x, product.heightM + 1, z));
    ray.set(origin, down);
    const hit = ray.intersectObject(geometry, true)[0];
    return hit ? anchor.worldToLocal(hit.point.clone()).y : fallback;
  }
  if (style === 'bed') {
    const width = product.widthM,
      depth = product.depthM,
      base = top(0, 0.12, product.heightM * 0.46);
    const gauze = new THREE.PlaneGeometry(width * 0.99, depth * 0.59, 40, 32);
    gauze.rotateX(-Math.PI / 2);
    const pos = gauze.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        z = pos.getZ(i),
        edge = Math.max(0, (Math.abs(x) - width * 0.43) / (width * 0.065)),
        end = Math.max(0, (z - depth * 0.245) / (depth * 0.05));
      pos.setXYZ(
        i,
        x,
        0.024 +
          0.006 * Math.sin(x * 31 + z * 3) +
          0.009 * Math.cos(z * 16 + x * 2) -
          0.13 * edge * edge -
          0.045 * end * end,
        z
      );
    }
    gauze.computeVertexNormals();
    mesh(gauze, '#929a85', 0, base, depth * 0.16);
    for (const side of [-1, 1]) {
      const x = side * width * 0.215,
        z = -depth * 0.28;
      const pillow = mesh(new THREE.SphereGeometry(1, 24, 16), '#ddd4bf', x, top(x, z, base) + 0.057, z);
      pillow.scale.set(width * 0.196, 0.074, depth * 0.087);
      pillow.rotation.y = side * 0.055;
    }
    return group;
  }
  const y = top(0, 0, product.heightM);
  function book(x: number, z: number, level: number, color: string, w: number, d: number, angle: number) {
    const cover = mesh(new THREE.BoxGeometry(w, 0.024, d), color, x, level + 0.012, z);
    cover.rotation.y = angle;
    const pages = mesh(
      new THREE.BoxGeometry(w - 0.006, 0.016, d - 0.008),
      '#dbd1b7',
      x,
      level + 0.013,
      z + 0.002
    );
    pages.rotation.y = angle;
  }
  if (style === 'table') {
    const bowl = mesh(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.018, 0),
          new THREE.Vector2(0.049, 0.004),
          new THREE.Vector2(0.103, 0.031),
          new THREE.Vector2(0.119, 0.054),
          new THREE.Vector2(0.115, 0.058),
          new THREE.Vector2(0.09, 0.034),
          new THREE.Vector2(0.026, 0.009),
          new THREE.Vector2(0, 0.009),
        ],
        44
      ),
      '#a58065',
      0.015,
      y + 0.001,
      -0.025,
      0.49
    );
    bowl.rotation.y = 0.3;
    [
      [-0.021, -0.021],
      [0.052, -0.018],
      [0.012, -0.075],
    ].forEach(([x, z], i) => {
      const fruit = mesh(
        new THREE.SphereGeometry(0.031, 18, 12),
        i === 2 ? '#a68d42' : '#849151',
        x,
        y + 0.049,
        z
      );
      fruit.scale.y = 0.92;
    });
  } else if (style === 'desk') {
    book(-0.26, 0.025, y, '#485649', 0.205, 0.148, -0.15);
    const pencil = mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 0.165, 8),
      '#9a623e',
      -0.063,
      y + 0.005,
      0.055
    );
    pencil.rotation.z = Math.PI / 2;
    pencil.rotation.x = 0.18;
  } else {
    book(0, 0, y, '#9a7258', 0.18, 0.14, 0.12);
    book(0.005, 0.006, y + 0.024, '#535d4d', 0.165, 0.113, -0.065);
  }
  return group;
}
