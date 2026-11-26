import * as THREE from 'three';
/** Architectural finishes are attached to their walls so the cutaway can hide each wall independently. */
export function dressWall(scene: string, wall: THREE.Group, width: number, depth: number) {
  const palette: Record<string, string> = {
    studio: '#bc9272',
    dining: '#70816c',
    reading: '#866b48',
    office: '#718581',
    bedroom: '#ac857d',
  };
  const color = palette[scene];
  if (!color) return;
  const planeX = -width / 2 + 0.066;
  function part(h: number, d: number, y: number, z: number, paint: string, thickness = 0.035) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(thickness, h, d),
      new THREE.MeshStandardMaterial({ color: paint, roughness: 0.81 })
    );
    m.position.set(planeX + thickness / 2, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    wall.add(m);
    return m;
  }
  const span = Math.max(1, depth - 0.15);
  if (scene === 'bedroom') {
    part(1.28, span, 0.64, 0, color, 0.055);
    for (let z = -span / 2 + 0.12; z < span / 2; z += 0.19) part(1.28, 0.018, 0.64, z, '#866859', 0.076);
    part(0.044, span, 1.3, 0, '#c8a183', 0.088);
  }
  if (scene === 'dining') {
    part(1.03, span, 0.515, 0, color, 0.04);
    part(0.05, span, 1.045, 0, '#384438', 0.084);
    for (let z = -span / 2 + 0.19; z < span / 2; z += 0.57) part(0.9, 0.035, 0.53, z, '#51614f', 0.064);
  }
  if (scene === 'studio') {
    for (let z = -span / 2 + 0.065; z < -0.12; z += 0.085) part(2.55, 0.043, 1.275, z, color, 0.066);
    part(0.055, span, 0.08, 0, '#9b7759', 0.08);
  }
  if (scene === 'reading') {
    part(2.52, Math.min(span, 1.65), 1.26, -span * 0.18, color, 0.028);
    for (const y of [0.6, 1.13, 1.68, 2.17]) {
      part(0.035, Math.min(1.55, span * 0.68), y, -span * 0.18, '#594736', 0.17);
      for (let i = 0; i < 7; i++) {
        const col = ['#e1cfb4', '#5a6956', '#b67c59', '#403e36', '#d6b995'][i % 5];
        part(
          0.15 + (i % 3) * 0.04,
          0.038 + (i % 2) * 0.012,
          y + 0.105,
          -span * 0.18 - 0.53 + i * 0.067,
          col,
          0.135
        );
      }
    }
  }
  if (scene === 'office') {
    part(1.12, span, 0.56, 0, color, 0.04);
    part(0.028, span, 1.17, 0, '#c1ad88', 0.066);
    part(0.028, span, 1.12, 0, '#47544e', 0.05);
  }
}
