import * as T from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { drinkById, type Recipe } from './menu';
import {
  clamp,
  ease,
  contact,
  flowColour,
  iceCount,
  addedPieces,
  fallAt,
  icePositions,
  streamAction,
  tone,
  type Action,
} from './brewSurface';

const V = (x: number, y: number, z: number) => new T.Vector3(x, y, z);
type Profile = readonly (readonly [number, number])[];
const pot = (p: Profile) =>
  new T.LatheGeometry(
    p.map(([r, y]) => new T.Vector2(r, y)),
    80,
  );
const tube = (points: T.Vector3[], r: number, n = 40) =>
  new T.TubeGeometry(new T.CatmullRomCurve3(points), n, r, 12, false);
function taper(
  points: T.Vector3[],
  radius: (t: number) => number,
  sides = 12,
  flutes = 0,
) {
  const curve = new T.CatmullRomCurve3(points),
    n = Math.max(24, points.length * 2),
    frames = curve.computeFrenetFrames(n, false);
  const positions: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= n; i++) {
    const p = curve.getPointAt(i / n);
    for (let j = 0; j <= sides; j++) {
      const t = (j * Math.PI * 2) / sides,
        r =
          radius(i / n) *
          (flutes ? 1 + 0.115 * Math.cos(flutes * t + (i / n) * 2.4) : 1);
      const v = p
        .clone()
        .addScaledVector(frames.normals[i], Math.cos(t) * r)
        .addScaledVector(frames.binormals[i], Math.sin(t) * r);
      positions.push(v.x, v.y, v.z);
      if (i < n && j < sides) {
        const a = i * (sides + 1) + j,
          b = a + sides + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
function studioLight(renderer: T.WebGLRenderer) {
  const w = 256,
    h = 128,
    data = new Float32Array(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const u = x / w,
        v = y / h;
      const window = (cx: number, cy: number, rx: number, ry: number) =>
        Math.exp(-Math.pow((u - cx) / rx, 8) - Math.pow((v - cy) / ry, 8));
      const key = window(0.28, 0.68, 0.105, 0.16) * 4.1,
        strip = window(0.74, 0.53, 0.031, 0.23) * 2.1,
        sky = window(0.58, 0.87, 0.22, 0.09) * 1.5;
      let ambient = 0.14 + 0.23 * v;
      if (v > 0.29 && v < 0.64 && u > 0.85) ambient = 0.06;
      const i = (y * w + x) * 4;
      data.set(
        [
          ambient + key + strip + sky,
          ambient * 0.97 + key * 0.96 + strip * 0.98 + sky,
          ambient * 0.93 + key * 0.89 + strip + sky * 1.04,
          1,
        ],
        i,
      );
    }
  const tex = new T.DataTexture(data, w, h, T.RGBAFormat, T.FloatType);
  tex.mapping = T.EquirectangularReflectionMapping;
  tex.needsUpdate = true;
  const gen = new T.PMREMGenerator(renderer);
  const env = gen.fromEquirectangular(tex);
  tex.dispose();
  gen.dispose();
  return env;
}
function layerMap(r: Recipe, photo?: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 256;
  const c = canvas.getContext('2d')!;
  const colors =
    r.drink === 'cherry-mocha'
      ? ['#744329', '#ccab8c', '#e8bea4', '#ac4a52', '#762a39']
      : r.drink === 'peach-tea'
        ? ['#a34a16', '#d87919', '#e99728', '#eb9c35', '#cc6e1b']
        : r.drink === 'cold-brew'
          ? ['#392018', '#512a15', '#713917', '#7b421e', '#6a3419']
          : ['#75452b', '#a97048', tone(r), '#dfc09a', '#f2d9b8'];
  const g = c.createLinearGradient(0, 0, 0, 256);
  colors.forEach((q, i) => g.addColorStop(i / 4, q));
  c.fillStyle = g;
  c.fillRect(0, 0, 240, 256);
  if (drinkById[r.drink].milk) {
    for (let i = 0; i < 13; i++) {
      const x = i * 21 + 7,
        y = 24 + 17 * Math.sin(i * 7);
      c.beginPath();
      c.moveTo(x, y);
      c.bezierCurveTo(
        x + 32,
        89,
        x - 12,
        100 + (i % 3) * 22,
        x + 8,
        155 + Math.sin(i) * 41,
      );
      c.strokeStyle = 'rgba(246,218,176,.16)';
      c.lineWidth = 3 + (i % 4);
      c.stroke();
    }
  }
  if (photo?.naturalWidth) {
    c.globalAlpha = 0.97;
    c.drawImage(photo, 0, 0, canvas.width, canvas.height);
    c.globalAlpha = 1;
    if (r.milk === 'oat' || r.shot === 'extra') {
      c.globalCompositeOperation = 'multiply';
      c.fillStyle = r.shot === 'extra' ? '#ad8769' : '#eed5ad';
      c.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}
function contactShadow(
  canvas: T.Object3D,
  x: number,
  z: number,
  w: number,
  d: number,
  opacity: number,
  height = 0.012,
) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!,
    g = ctx.createRadialGradient(64, 64, 1, 64, 64, 64);
  g.addColorStop(0, 'rgba(63,47,38,.83)');
  g.addColorStop(0.35, 'rgba(65,49,41,.56)');
  g.addColorStop(0.74, 'rgba(65,49,41,.17)');
  g.addColorStop(1, 'rgba(60,47,41,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  const m = new T.Mesh(
    new T.PlaneGeometry(w, d),
    new T.MeshBasicMaterial({
      map: t,
      opacity,
      transparent: true,
      depthWrite: false,
    }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, height, z);
  canvas.add(m);
}
export function createBrewScene(
  canvas: HTMLCanvasElement,
  surface: HTMLCanvasElement,
  initial: Recipe,
  stone: HTMLImageElement,
  fluid?: HTMLImageElement,
) {
  const context = canvas.getContext('webgl2', {
    alpha: false,
    antialias: true,
    powerPreference: 'low-power',
  });
  if (!context) throw new Error('WebGL2 unavailable');
  const renderer = new T.WebGLRenderer({
    canvas,
    context,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.93;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  const scene = new T.Scene();
  scene.background = new T.Color('#f3efe9');
  const env = studioLight(renderer);
  scene.environment = env.texture;
  const camera = new T.OrthographicCamera(-2, 2, 1.7, -1.7, 0.1, 45);
  const iced = !!drinkById[initial.drink].iced;
  const key = new T.DirectionalLight('#fff1da', 2.05);
  key.position.set(-3.9, 6.5, 3.4);
  key.castShadow = true;
  key.shadow.mapSize.set(768, 768);
  Object.assign(key.shadow.camera, {
    left: -3,
    right: 3,
    top: 3,
    bottom: -3,
    near: 0.3,
    far: 18,
  });
  key.shadow.normalBias = 0.014;
  key.shadow.bias = -0.00015;
  key.shadow.radius = 3;
  scene.add(key, new T.HemisphereLight('#fff7ec', '#796c61', 0.44));
  const edge = new T.DirectionalLight('#d8e5ff', 0.7);
  edge.position.set(2, 3, -3);
  scene.add(edge);
  const stoneMap = new T.Texture(stone);
  stoneMap.colorSpace = T.SRGBColorSpace;
  stoneMap.wrapS = stoneMap.wrapT = T.RepeatWrapping;
  stoneMap.repeat.set(26, 26);
  let hasStone = false;
  const groundMaterial = new T.MeshStandardMaterial({
    color: '#e5ddce',
    roughness: 0.97,
  });
  const floor = new T.Mesh(new T.PlaneGeometry(80, 80), groundMaterial);
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  contactShadow(scene, 0.22, 0.08, 3.8, 2.75, 0.57);
  contactShadow(scene, 0.05, 0.0, iced ? 1.7 : 2.8, iced ? 1.6 : 2.68, 0.68);
  const cup = new T.Group();
  scene.add(cup);
  const mat = (color: T.ColorRepresentation, roughness = 0.35, metalness = 0) =>
    new T.MeshStandardMaterial({ color, roughness, metalness });
  function mesh(g: T.BufferGeometry, m: T.Material, parent: T.Object3D = cup) {
    const o = new T.Mesh(g, m);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  const clay = document.createElement('canvas');
  clay.width = clay.height = 256;
  const glaze = clay.getContext('2d')!;
  glaze.fillStyle = '#f5f0e6';
  glaze.fillRect(0, 0, 256, 256);
  let seed = 7;
  const rand = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 3900; i++) {
    glaze.fillStyle =
      i % 5 === 0 ? 'rgba(108,83,55,.31)' : 'rgba(150,127,95,.14)';
    glaze.fillRect(
      rand() * 256,
      rand() * 256,
      0.35 + rand() * 1.25,
      0.3 + rand() * 1.1,
    );
  }
  const glazeMap = new T.CanvasTexture(clay);
  glazeMap.colorSpace = T.SRGBColorSpace;
  const porcelain = new T.MeshPhysicalMaterial({
    color: '#f0e5cf',
    map: glazeMap,
    roughness: 0.25,
    bumpMap: glazeMap,
    bumpScale: 0.003,
    clearcoat: 0.51,
    clearcoatRoughness: 0.13,
  });
  const glass = new T.MeshPhysicalMaterial({
    color: '#f2f7fc',
    roughness: 0.1,
    metalness: 0.25,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    side: T.DoubleSide,
  });
  const rimGlass = new T.MeshPhysicalMaterial({
    color: '#e0ece9',
    roughness: 0.12,
    metalness: 0.4,
    transparent: true,
    opacity: 0.67,
  });
  const H = iced ? 1.87 : 1.31,
    R = iced ? 0.787 : 0.858;
  let body: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial> | undefined;
  function torus(
    radius: number,
    thickness: number,
    y: number,
    material: T.Material,
  ) {
    const o = mesh(new T.TorusGeometry(radius, thickness, 12, 88), material);
    o.rotation.x = Math.PI / 2;
    o.position.y = y;
    return o;
  }
  if (!iced) {
    mesh(
      pot(
        [
          [0, 0.055],
          [0.36, 0.053],
          [0.49, 0.066],
          [0.69, 0.092],
          [0.9, 0.12],
          [1.15, 0.17],
          [1.31, 0.215],
          [1.37, 0.241],
          [1.395, 0.225],
          [1.39, 0.198],
          [1.35, 0.17],
          [1.1, 0.097],
          [0.71, 0.048],
          [0.47, 0.032],
          [0.45, 0.02],
          [0.33, 0.02],
          [0.31, 0.04],
          [0, 0.04],
        ].reverse() as [number, number][],
      ),
      porcelain,
    );
    contactShadow(cup, 0.14, -0.025, 1.95, 1.47, 0.72, 0.147);
    mesh(
      pot([
        [0, 0.12],
        [0.38, 0.12],
        [0.42, 0.136],
        [0.45, 0.18],
        [0.49, 0.205],
        [0.57, 0.242],
        [0.65, 0.31],
        [0.72, 0.42],
        [0.79, 0.58],
        [0.845, 0.78],
        [0.879, 0.99],
        [0.894, 1.2],
        [0.903, 1.335],
        [0.897, 1.363],
        [0.88, 1.374],
        [0.86, 1.368],
        [0.847, 1.345],
        [0.837, 1.24],
        [0.822, 1.03],
        [0.78, 0.86],
        [0.71, 0.65],
        [0.62, 0.49],
        [0.5, 0.37],
        [0.37, 0.32],
        [0, 0.32],
      ]),
      porcelain,
    );
    torus(0.434, 0.018, 0.166, mat('#bda884', 0.72));
    torus(0.871, 0.014, 1.351, mat('#d5c3a7', 0.29));
    const handle = tube(
      [
        V(0.837, 1.09, 0.02),
        V(1.05, 1.15, 0.025),
        V(1.26, 1.13, 0.045),
        V(1.35, 0.98, 0.06),
        V(1.32, 0.8, 0.065),
        V(1.17, 0.61, 0.05),
        V(0.965, 0.52, 0.035),
        V(0.757, 0.57, 0.02),
      ],
      0.074,
      46,
    );
    mesh(handle, porcelain);
    if (initial.drink === 'espresso') cup.scale.set(0.86, 0.83, 0.86);
  } else {
    mesh(
      pot([
        [0.012, 0.038],
        [0.55, 0.038],
        [0.62, 0.06],
        [0.65, 0.13],
        [0.805, 1.91],
        [0.81, 1.97],
        [0.799, 1.986],
        [0.78, 1.977],
        [0.771, 1.951],
        [0.61, 0.19],
        [0.57, 0.145],
        [0.01, 0.145],
      ]),
      glass,
    ).renderOrder = 3;
    torus(0.795, 0.015, 1.97, rimGlass);
    torus(0.597, 0.026, 0.1, rimGlass);
    body = new T.Mesh(
      pot([
        [0, 0.142],
        [0.578, 0.14],
        [0.617, 0.19],
        [0.774, 1.86],
        [0, 1.86],
      ]),
      new T.MeshStandardMaterial({
        roughness: 0.32,
        map: layerMap(initial, fluid),
        envMapIntensity: 0.32,
      }),
    );
    const vertices = body.geometry.attributes.position,
      uv = body.geometry.attributes.uv;
    for (let i = 0; i < vertices.count; i++)
      uv.setXY(
        i,
        clamp(0.5 + (vertices.getX(i) * 0.94 - vertices.getZ(i) * 0.34) / 1.57),
        clamp((vertices.getY(i) - 0.14) / 1.72),
      );
    cup.add(body);
    const beadGeo = new T.SphereGeometry(1, 6, 5);
    const beadMat = new T.MeshPhysicalMaterial({
      color: '#e0d6bb',
      roughness: 0.1,
      metalness: 0.35,
      transparent: true,
      opacity: 0.44,
    });
    const beads = new T.InstancedMesh(beadGeo, beadMat, 64),
      pose = new T.Object3D();
    for (let i = 0; i < 64; i++) {
      const a = rand() * Math.PI * 2,
        y = 0.34 + rand() * 1.42,
        rad = 0.635 + 0.086 * y,
        sz = 0.005 + rand() * 0.015;
      pose.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad);
      pose.scale.set(sz * 0.72, sz * 1.3, sz * 0.72);
      pose.updateMatrix();
      beads.setMatrixAt(i, pose.matrix);
    }
    beads.renderOrder = 5;
    cup.add(beads);
    const highlight = new T.MeshBasicMaterial({
      color: '#fffdf3',
      opacity: 0.36,
      transparent: true,
      depthWrite: false,
    });
    for (const x of [-0.64, 0.66]) {
      const s = mesh(
        tube(
          [V(x * 0.77, 0.23, 0.36), V(x * 0.9, 1, 0.43), V(x, 1.85, 0.44)],
          x < 0 ? 0.009 : 0.015,
        ),
        highlight,
      );
      s.renderOrder = 4;
    }
  }
  const texture = new T.CanvasTexture(surface);
  texture.colorSpace = T.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = T.LinearFilter;
  const liquid = mesh(
    new T.CircleGeometry(R, 96),
    new T.MeshBasicMaterial({ map: texture, toneMapped: false }),
  );
  liquid.position.y = H;
  liquid.rotation.x = -Math.PI / 2;
  liquid.castShadow = false;
  const iceSkin = document.createElement('canvas');
  iceSkin.width = iceSkin.height = 128;
  const frost = iceSkin.getContext('2d')!;
  frost.fillStyle = '#f4f7f6';
  frost.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 85; i++) {
    const x = rand() * 128,
      y = rand() * 128,
      r = 0.35 + rand() * 1.6;
    frost.beginPath();
    frost.fillStyle = 'rgba(109,129,134,.34)';
    frost.arc(x, y, r, 0, Math.PI * 2);
    frost.fill();
    frost.fillStyle = '#fff';
    frost.fillRect(x - r * 0.55, y - r * 0.65, r, r * 0.72);
  }
  for (let i = 0; i < 4; i++) {
    const x = rand() * 110,
      y = rand() * 115;
    frost.beginPath();
    frost.moveTo(x, y);
    frost.lineTo(x + 5, y - 4);
    frost.lineTo(x + 7, y - 10);
    frost.lineTo(x + 15, y - 14);
    frost.strokeStyle = 'rgba(136,151,155,.39)';
    frost.lineWidth = 0.75;
    frost.stroke();
  }
  const iceMap = new T.CanvasTexture(iceSkin);
  iceMap.colorSpace = T.SRGBColorSpace;
  const iceMat = new T.MeshPhysicalMaterial({
    color: '#e8f3f4',
    map: iceMap,
    bumpMap: iceMap,
    bumpScale: 0.012,
    roughness: 0.09,
    metalness: 0,
    transmission: 0.88,
    ior: 1.31,
    thickness: 0.24,
    attenuationColor: '#c8dce2',
    attenuationDistance: 0.7,
    clearcoat: 0.9,
    envMapIntensity: 1.25,
  });
  const iceG = new RoundedBoxGeometry(0.37, 0.28, 0.35, 3, 0.078),
    ices = icePositions.map(([x, z, angle], i) => {
      const o = mesh(iceG, iceMat);
      o.rotation.set(0.14 + (i % 2) * 0.2, angle, 0.13 * i);
      o.scale.set(
        0.9 + (i % 3) * 0.16,
        0.85 + (i % 2) * 0.22,
        1.08 - (i % 3) * 0.09,
      );
      o.position.set(x, H + 0.052, z);
      o.renderOrder = 2;
      return o;
    });
  const toppings = new T.Group();
  cup.add(toppings);
  if (initial.drink === 'cherry-mocha' || initial.drink === 'caramel-frappe') {
    const pts: T.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80,
        ang = t * 4.9 * Math.PI,
        rr = 0.35 * (1 - t);
      pts.push(
        V(
          0.26 + Math.cos(ang) * rr,
          H + 0.035 + 0.39 * t,
          Math.sin(ang) * rr - 0.15,
        ),
      );
    }
    mesh(
      taper(pts, (t) => 0.125 * Math.pow(1 - t, 0.54) + 0.006, 30, 6),
      mat('#fff2d5', 0.36),
      toppings,
    );
    if (initial.drink === 'cherry-mocha') {
      const cherry = mesh(
        new T.SphereGeometry(0.125, 22, 15),
        mat('#9d1933', 0.23),
        toppings,
      );
      cherry.position.set(0.35, H + 0.37, -0.08);
      mesh(
        tube(
          [
            V(0.36, H + 0.46, -0.08),
            V(0.4, H + 0.61, -0.09),
            V(0.52, H + 0.68, -0.12),
          ],
          0.011,
        ),
        mat('#70532e'),
        toppings,
      );
    } else
      mesh(
        taper(
          pts
            .filter((_, i) => i % 2 === 0)
            .map((v) => v.clone().add(V(0.012, 0.085, 0))),
          (t) => 0.018 * (1 - t) + 0.004,
        ),
        mat('#b37631', 0.3),
        toppings,
      );
  }
  if (initial.drink === 'peach-tea') {
    const fleshShape = new T.Shape();
    fleshShape.moveTo(-0.32, 0);
    fleshShape.bezierCurveTo(-0.21, 0.265, 0.22, 0.265, 0.32, 0);
    fleshShape.bezierCurveTo(0.105, 0.115, -0.12, 0.115, -0.32, 0);
    const wedge = mesh(
      new T.ExtrudeGeometry(fleshShape, {
        depth: 0.055,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.011,
        bevelThickness: 0.012,
        steps: 1,
      }),
      mat('#ffc272', 0.49),
      toppings,
    );
    wedge.rotation.set(-0.62, -0.35, 0.4);
    wedge.position.set(0.27, H + 0.035, -0.08);
    const peel = mesh(
      new T.TorusGeometry(0.29, 0.022, 9, 28, Math.PI),
      mat('#e28b45'),
      toppings,
    );
    peel.rotation.copy(wedge.rotation);
    peel.scale.y = 0.68;
    peel.position.copy(wedge.position);
  }
  const effects = new T.Group();
  cup.add(effects);
  const steel = new T.MeshStandardMaterial({
    color: '#ccd0cf',
    roughness: 0.18,
    metalness: 0.95,
  });
  const pitcher = new T.Group();
  effects.add(pitcher);
  const pitcherGeometry = pot([
    [0, 0],
    [0.24, 0.005],
    [0.29, 0.033],
    [0.32, 0.21],
    [0.28, 0.56],
    [0.245, 0.68],
    [0.242, 0.71],
    [0.23, 0.708],
    [0.221, 0.69],
    [0.213, 0.53],
    [0.26, 0.16],
    [0.2, 0.05],
    [0, 0.045],
  ]);
  const pos = pitcherGeometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      y = pos.getY(i),
      z = pos.getZ(i);
    if (y > 0.4) {
      const n = clamp(x / 0.23) * clamp((y - 0.4) / 0.31);
      pos.setXYZ(
        i,
        x + 0.2 * Math.pow(n, 3),
        y + 0.09 * Math.pow(n, 3),
        z * (1 - 0.46 * n),
      );
    }
  }
  pitcherGeometry.computeVertexNormals();
  mesh(pitcherGeometry, steel, pitcher);
  mesh(
    tube(
      [
        V(-0.255, 0.54, 0),
        V(-0.42, 0.53, 0),
        V(-0.45, 0.34, 0),
        V(-0.4, 0.19, 0),
        V(-0.29, 0.2, 0),
      ],
      0.027,
    ),
    steel,
    pitcher,
  );
  const streamMat = new T.MeshPhysicalMaterial({
    color: '#fff3dc',
    roughness: 0.3,
    clearcoat: 0.36,
  });
  const streamGeometry = new T.PlaneGeometry(1, 1, 12, 18);
  const flowPositions = streamGeometry.attributes.position;
  const stream = mesh(streamGeometry, streamMat, effects);
  streamMat.side = T.DoubleSide;
  stream.frustumCulled = false;
  const shine = mesh(new T.SphereGeometry(1, 18, 10), streamMat, effects);
  const sugarMat = mat('#fff4dc', 0.94),
    flakeMat = mat('#513021', 0.69),
    spiceMat = mat('#98572d', 0.88);
  const sugarG = new RoundedBoxGeometry(0.195, 0.196, 0.194, 2, 0.017),
    flakeG = new T.BoxGeometry(0.069, 0.027, 0.046),
    spiceG = new T.IcosahedronGeometry(0.015, 0);
  const solids = Array.from({ length: 27 }, () =>
    mesh(sugarG, sugarMat, effects),
  );
  const drops = Array.from({ length: 8 }, () =>
    mesh(new T.SphereGeometry(0.032, 8, 6), mat('#c39460', 0.24), effects),
  );
  const origin = V(0, 0, 0),
    end = V(0, 0, 0);
  let lastBodyKey = '';
  function render(r: Recipe, a: Action, p: number, before?: Recipe) {
    texture.needsUpdate = true;
    if (!hasStone && stone.naturalWidth) {
      hasStone = true;
      stoneMap.needsUpdate = true;
      groundMaterial.map = stoneMap;
      groundMaterial.needsUpdate = true;
    }
    const sizeIndex = drinkById[r.drink].sizes.indexOf(r.ml),
      size = 1 + sizeIndex * 0.055,
      demi = r.drink === 'espresso' ? 0.85 : 1;
    cup.scale.setScalar(size * demi);
    camera.position.set(2.25, 5.65, 6.25);
    camera.lookAt(0.02, iced ? 1.12 : 0.99, 0);
    if (body) {
      const key =
        r.drink + r.milk + r.shot + (fluid?.naturalWidth ? 'photo' : '');
      if (lastBodyKey && key !== lastBodyKey) {
        body.material.map?.dispose();
        body.material.map = layerMap(r, fluid);
      }
      lastBodyKey = key;
    }
    const count = iceCount(r),
      addedIce = a === 'ice' ? addedPieces('ice', r, before) : 0;
    ices.forEach((o, i) => {
      const [x, z, angle] = icePositions[i],
        index = i - count + addedIce,
        fall = addedIce > 0 && index >= 0 ? fallAt(p, index, addedIce) : 2;
      o.visible = i < count && fall >= 0;
      const flight = 1 - clamp(fall),
        bounce =
          fall >= 1 && fall < 1.42
            ? Math.sin(((fall - 1) * Math.PI) / 0.42) * 0.067
            : 0;
      o.position.set(
        x - 0.16 * flight,
        H + 0.052 + 1.34 * (1 - clamp(fall) ** 2) - bounce,
        z - 0.045 * flight,
      );
      o.rotation.set(
        0.14 + (i % 2) * 0.2 + flight * 1.63,
        angle + flight * 1.2,
        0.13 * i + flight * 0.68,
      );
    });
    const flow = streamAction(a),
      show = p > 0.035 && p < 0.86,
      hit = contact(a, p),
      strength = Math.min(ease((p - 0.11) / 0.13), ease((0.83 - p) / 0.16));
    pitcher.visible = flow && show;
    stream.visible = shine.visible = flow && strength > 0.015;
    if (pitcher.visible || stream.visible) {
      const arrival = Math.min(
        ease((p - 0.035) / 0.16),
        ease((0.86 - p) / 0.14),
      );
      const milk = a === 'milk' || a === 'art' || a === 'foam';
      pitcher.scale.setScalar(milk ? 0.87 : 0.67);
      pitcher.rotation.set(0.09, 0.12, -0.77 * arrival - 0.07);
      end.set(hit.x, H + 0.008, hit.z);
      const lip = V(0.437, 0.794, 0)
        .multiplyScalar(pitcher.scale.x)
        .applyEuler(pitcher.rotation);
      origin.set(
        hit.x - 0.22 - 0.31 * (1 - arrival),
        H + 0.84 + 0.46 * (1 - arrival),
        hit.z - 0.06,
      );
      pitcher.position.copy(origin).sub(lip);
      if (stream.visible) {
        const bottom = end.clone().lerp(origin, 1 - ease((p - 0.11) / 0.12));
        const rad =
          (a === 'syrup' ? 0.014 : a === 'espresso' ? 0.021 : 0.039) * strength;
        for (let row = 0; row <= 18; row++) {
          const t = row / 18,
            side = 1 - (1 - t) * (1 - t),
            x = T.MathUtils.lerp(origin.x, bottom.x, side),
            y = T.MathUtils.lerp(origin.y, bottom.y, t * (0.33 + 0.67 * t)),
            z = T.MathUtils.lerp(origin.z, bottom.z, side),
            radius =
              rad * (1.14 - 0.43 * t + 0.025 * Math.sin(t * 19 + p * 24));
          for (let k = 0; k <= 12; k++) {
            const ang = (k / 12) * Math.PI * 2;
            flowPositions.setXYZ(
              row * 13 + k,
              x + Math.cos(ang) * radius,
              y,
              z + Math.sin(ang) * radius,
            );
          }
        }
        flowPositions.needsUpdate = true;
        streamGeometry.computeVertexNormals();
        streamMat.color.set(flowColour(r, a));
        shine.position.copy(end);
        shine.scale.set(
          (0.036 + rad) * strength,
          0.014 * strength,
          (0.03 + rad) * strength,
        );
      }
    }
    const pieces =
      a === 'sugar'
        ? addedPieces('sugar', r, before)
        : a === 'spice'
          ? 27
          : a === 'flakes'
            ? 15
            : 0;
    solids.forEach((o, i) => {
      const delay = (i / Math.max(1, pieces)) * 0.23,
        t = (p - 0.11 - delay) / 0.49;
      o.visible = i < pieces && t >= 0 && t < 1.15;
      if (!o.visible) return;
      const spread = a === 'flakes' || a === 'spice' ? 0.62 : 0.34;
      const ang = i * 2.4;
      const x =
        hit.x +
        (i === 0 ? 0 : Math.cos(ang) * spread * (0.35 + (i % 4) * 0.16));
      const z = hit.z + Math.sin(ang) * spread * 0.7;
      o.geometry = a === 'flakes' ? flakeG : a === 'spice' ? spiceG : sugarG;
      o.material =
        a === 'flakes' ? flakeMat : a === 'spice' ? spiceMat : sugarMat;
      const sink = ease((t - 0.88) / 0.27);
      o.position.set(
        x - 0.19 * (1 - clamp(t)),
        H + Math.max(-0.07, 1.31 * (1 - t * t)) + 0.07 - sink * 0.11,
        z,
      );
      o.rotation.set(t * 3.3 + i, t * 2.1 + i * 0.85, t * 1.4 + 0.3);
      o.scale.setScalar(1 - sink * 0.95);
    });
    drops.forEach((o, i) => {
      const t = (p - 0.54 - (i % 2) * 0.12) / 0.23;
      o.visible = (a === 'ice' || a === 'sugar') && t > 0 && t < 1;
      if (o.visible) {
        const [hitX, hitZ] =
          a === 'ice'
            ? icePositions[
                Math.max(0, count - addedIce) +
                  Math.min(i % 2, Math.max(0, addedIce - 1))
              ]
            : [hit.x, hit.z];
        const theta = i * 2.4,
          dist = 0.055 + t * (0.18 + (i % 3) * 0.05);
        o.position.set(
          hitX + Math.cos(theta) * dist,
          H + 0.016 + Math.sin(Math.PI * t) * (0.08 + (i % 3) * 0.055),
          hitZ + Math.sin(theta) * dist,
        );
        o.scale.setScalar(Math.sin(Math.PI * t) * 0.86);
      }
    });
    renderer.render(scene, camera);
  }
  return {
    render,
    resize(w: number, h: number) {
      const aspect = w / h,
        hSpan = Math.max(iced ? 3.17 : 2.91, 3.42 / aspect);
      camera.left = (-hSpan * aspect) / 2;
      camera.right = -camera.left;
      camera.top = hSpan / 2;
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    },
    dispose() {
      const materials = new Set<T.Material>([
          sugarMat,
          spiceMat,
          flakeMat,
          iceMat,
        ]),
        geos = new Set<T.BufferGeometry>([sugarG, iceG, spiceG, flakeG]),
        textures = new Set<T.Texture>([texture]);
      scene.traverse((o) => {
        if (o instanceof T.Mesh) {
          geos.add(o.geometry);
          for (const m of ([] as T.Material[]).concat(o.material)) {
            materials.add(m);
            if ('map' in m && m.map instanceof T.Texture) textures.add(m.map);
          }
        }
      });
      scene.clear();
      materials.forEach((m) => m.dispose());
      geos.forEach((g) => g.dispose());
      textures.add(stoneMap);
      textures.add(iceMap);
      textures.forEach((t) => t.dispose());
      key.shadow.dispose();
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
