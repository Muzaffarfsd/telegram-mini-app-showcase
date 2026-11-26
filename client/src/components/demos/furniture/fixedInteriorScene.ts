import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { PlannerItem, PlannerProduct, PlannerView } from './plannerTypes';

import { surfaceHeight } from './plannerTypes';
export type FixedSceneState = { items: PlannerItem[]; products: readonly PlannerProduct[]; selected: string | null; view: PlannerView };
type Callbacks = {
  onSelect: (id: string) => void; onMove: (id: string, x: number, z: number) => void;
  onRotate: (id: string, rotation: number) => void; onGestureStart: () => void;
  onGestureEnd: () => void; onGestureCancel: () => void; onError: (message: string) => void;
  onBounds: (id: string, size: { widthM: number; depthM: number; heightM: number }) => void;
};
import { FIXED_BOUNDS } from './fixedInteriorModel';
export { FIXED_BOUNDS };
const CENTER = { x: (FIXED_BOUNDS.left + FIXED_BOUNDS.right) / 2, z: (FIXED_BOUNDS.back + FIXED_BOUNDS.front) / 2 };

/** Fixed architectural scene. Camera and products are independent of the light bake. */
export async function createFixedInteriorScene(canvas: HTMLCanvasElement, callbacks: Callbacks) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, deviceMemory !== undefined && deviceMemory <= 2 ? 1 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#d5cec5');
  scene.add(new THREE.HemisphereLight('#f9faf7', '#9a8671', 1.6));
  const sun = new THREE.DirectionalLight('#fff2d9', 1.7); sun.position.set(-7, 7, 2); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.1, far: 30 });
  sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.025; scene.add(sun);
  const camera = new THREE.PerspectiveCamera(65, 1, 0.05, 100); camera.position.set(.95, 1.62, 4.65);
  const top = new THREE.OrthographicCamera(-4.5, 4.5, 10, -10, 0.1, 100); top.position.set(CENTER.x, 16, CENTER.z); top.up.set(0, 0, -1); top.lookAt(CENTER.x, 0, CENTER.z);
  const controls = new OrbitControls(camera, canvas); controls.target.set(-.35, .70, -.95); controls.enablePan = false;
  controls.minDistance = 1.5; controls.maxDistance = 9; controls.maxPolarAngle = Math.PI / 2.05; controls.update();
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder); const basis=new KTX2Loader().setTranscoderPath('/furniture/basis/').detectSupport(renderer); loader.setKTX2Loader(basis);
  const objects = new THREE.Group(); scene.add(objects);
  const instances = new Map<string, THREE.Group>(), models = new Map<string, THREE.Group>(), cached = new Map<string, Promise<THREE.Group>>();
  let state: FixedSceneState = { items: [], products: [], selected: null, view: 'perspective' };
  let destroyed = false, frame = 0, room: THREE.Group | null = null, highlight: THREE.LineLoop | null = null;
  const currentCamera = () => state.view === 'top' ? top : camera;
  function draw() { if (destroyed || frame) return; frame = requestAnimationFrame(() => {
    frame = 0; if (destroyed) return;
    room?.traverse(node => {
      if (node.name === 'architectureceiling') node.visible = state.view === 'perspective' && camera.position.y < 3.12;
      if (node.name === 'architecturefront-wall') node.visible = state.view === 'top' || camera.position.z < FIXED_BOUNDS.front;
      if (node.name === 'architectureback-wall') node.visible = state.view === 'top' || camera.position.z > FIXED_BOUNDS.back;
      if (node.name === 'architectureright-wall') node.visible = state.view === 'top' || camera.position.x < FIXED_BOUNDS.right;
    });
    renderer.render(scene, currentCamera());
  }); }
  const cameraChanged = () => {
    // The room is a fixed interior, not a cutaway model for viewing from the
    // garden. Keep the orbit camera inside the walls and below the ceiling.
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, FIXED_BOUNDS.left + .15, FIXED_BOUNDS.right - .15);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, FIXED_BOUNDS.back + .15, FIXED_BOUNDS.front - .15);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, .65, 2.95);
    camera.lookAt(controls.target); draw();
  };
  controls.addEventListener('change', cameraChanged);
  const dispose = (root: THREE.Object3D) => {
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    root.traverse(node => { if (!(node instanceof THREE.Mesh)) return; geometries.add(node.geometry); (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => materials.add(m)); });
    materials.forEach(m => { for (const value of Object.values(m)) if (value instanceof THREE.Texture) textures.add(value); m.dispose(); });
    geometries.forEach(g => g.dispose()); textures.forEach(t => t.dispose());
  };
  const shadowTexture = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const ctx = c.getContext('2d');
    if (ctx) { const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, 'rgba(35,25,20,.27)'); g.addColorStop(1, 'rgba(35,25,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128); } return new THREE.CanvasTexture(c); })();
  try {
    const gltf = await loader.loadAsync('/furniture/interiors/living-light.glb');
    if (destroyed) { dispose(gltf.scene); throw new Error('cancelled'); }
    room = gltf.scene;
    room.traverse(node => {
      if (!(node instanceof THREE.Mesh) || Array.isArray(node.material)) return;
      const source = node.material;
      if (source.name.startsWith('rebaked_') && source instanceof THREE.MeshStandardMaterial && source.map) {
        node.material = new THREE.MeshBasicMaterial({ map: source.map, toneMapped: false, side: source.side }); source.dispose();
      }
    });
    scene.add(room);
  } catch (error) { basis.dispose(); renderer.dispose(); shadowTexture.dispose(); controls.dispose(); throw error; }

  function setHighlight() {
    if (highlight) { scene.remove(highlight); highlight.geometry.dispose(); (highlight.material as THREE.Material).dispose(); highlight = null; }
    const item = state.view === 'top' ? state.items.find(i => i.id === state.selected) : undefined;
    const product = item && state.products.find(p => p.id === item.productId);
    if (!item || !product || !models.has(item.id)) return;
    const x = product.widthM / 2 + .055, z = product.depthM / 2 + .055;
    highlight = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-x, 0, -z), new THREE.Vector3(x, 0, -z), new THREE.Vector3(x, 0, z), new THREE.Vector3(-x, 0, z)]), new THREE.LineBasicMaterial({ color: '#33483f' }));
    highlight.position.set(item.x, .045, item.z); highlight.rotation.y = -item.rotation; scene.add(highlight);
  }
  function add(item: PlannerItem, product: PlannerProduct) {
    const anchor = new THREE.Group(); anchor.userData.plannerId = item.id; instances.set(item.id, anchor); objects.add(anchor);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(product.widthM * 1.2, product.depthM * 1.2), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .016; anchor.add(shadow);
    let promise = cached.get(product.modelUrl);
    if (!promise) { promise = loader.loadAsync(product.modelUrl).then(result => result.scene); cached.set(product.modelUrl, promise); }
    promise.then(source => {
      if (destroyed || instances.get(item.id) !== anchor) return;
      const model = source.clone(true), box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      if (!(size.x > 0)) throw new Error('invalid model bounds');
      const scale = product.widthM / size.x, inner = new THREE.Group(); inner.add(model); inner.scale.setScalar(scale);
      callbacks.onBounds(product.id, { widthM: size.x * scale, depthM: size.z * scale, heightM: size.y * scale });
      inner.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
      const lights: THREE.Object3D[] = []; model.traverse(node => { if (node instanceof THREE.Light) lights.push(node); }); lights.forEach(light => light.removeFromParent());
      model.traverse(node => { if (node instanceof THREE.Mesh) { node.castShadow = true; node.receiveShadow = false; } });
      anchor.add(inner); models.set(item.id, inner); setHighlight(); draw();
    }).catch(() => { if (cached.get(product.modelUrl) === promise) cached.delete(product.modelUrl); if (!destroyed) callbacks.onError(product.name); });
  }
  function update(next: FixedSceneState) {
    if (destroyed) return;
    const previousSelection = state.selected; state = next; controls.enabled = next.view === 'perspective';
    const live = new Set(next.items.map(item => item.id));
    instances.forEach((anchor, id) => { if (!live.has(id)) { objects.remove(anchor); const shadow = anchor.children[0] as THREE.Mesh; shadow.geometry.dispose(); (shadow.material as THREE.Material).dispose(); instances.delete(id); models.delete(id); } });
    for (const item of next.items) {
      const product = next.products.find(p => p.id === item.productId); if (!product) continue;
      if (!instances.has(item.id)) add(item, product);
      const anchor = instances.get(item.id)!; anchor.position.set(item.x, surfaceHeight(item,product,next.items,next.products,2.8), item.z); anchor.rotation.y = -item.rotation;
    }
    if (next.view === 'perspective' && previousSelection !== null && previousSelection !== next.selected) {
      const selected = next.items.find(item => item.id === next.selected), product = selected && next.products.find(p => p.id === selected.productId);
      if (selected && product) {
        const distance = Math.max(2.8, product.widthM * 2.0);
        camera.position.set(selected.x + Math.min(1.1, distance * .25), 1.5, selected.z + distance);
        controls.target.set(selected.x, Math.max(.55, product.heightM * .72), selected.z); controls.update();
      }
    }
    setHighlight(); draw();
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const touches = new Map<number, { x: number; y: number }>();
  type Gesture = { distance: number; angle: number; midpoint: { x: number; y: number } };
  let pinch: Gesture | null = null, rotate: { id: string; angle: number; rotation: number } | null = null;
  let drag: { pointer: number; id: string; dx: number; dz: number; sx: number; sy: number; moved: boolean } | null = null;
  let pan: { pointer: number; x: number; y: number } | null = null;
  const point = (x: number, y: number) => { const r = canvas.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, top); return ray.ray.intersectPlane(ground, new THREE.Vector3()); };
  const pair = (): Gesture | null => { const [a, b] = Array.from(touches.values()); return a && b ? { distance: Math.hypot(a.x - b.x, a.y - b.y), angle: Math.atan2(b.y - a.y, b.x - a.x), midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } } : null; };
  function down(e: PointerEvent) {
    if (state.view !== 'top') return;
    if (e.pointerType === 'touch') { touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (touches.size === 2) {
      const g = pair(), item = drag && state.items.find(i => i.id === drag?.id);
      if (g && item) rotate = { id: item.id, angle: g.angle, rotation: item.rotation }; else pinch = g;
      drag = null; pan = null; canvas.setPointerCapture(e.pointerId); e.preventDefault(); return;
    } if (touches.size > 1) return; }
    if (!e.isPrimary || e.button !== 0) return;
    const p = point(e.clientX, e.clientY), hit = ray.intersectObjects(Array.from(models.values()), true)[0];
    if (!hit) { pan = { pointer: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); return; }
    let node: THREE.Object3D | null = hit.object; while (node && !node.userData.plannerId) node = node.parent;
    const item = state.items.find(i => i.id === node?.userData.plannerId); if (!item || !p) return;
    callbacks.onSelect(item.id); callbacks.onGestureStart(); drag = { pointer: e.pointerId, id: item.id, dx: item.x - p.x, dz: item.z - p.z, sx: e.clientX, sy: e.clientY, moved: false };
    canvas.setPointerCapture(e.pointerId); e.preventDefault();
  }
  function move(e: PointerEvent) {
    if (state.view !== 'top') return; if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (rotate && touches.size === 2) { const g = pair(); if (!g) return; let d = g.angle - rotate.angle; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      rotate.rotation += d; rotate.angle = g.angle; callbacks.onRotate(rotate.id, rotate.rotation); e.preventDefault(); return; }
    if (pinch && touches.size === 2) { const g = pair(); if (!g || !pinch.distance || !g.distance) return; const before = point(pinch.midpoint.x, pinch.midpoint.y);
      top.zoom = THREE.MathUtils.clamp(top.zoom * g.distance / pinch.distance, .85, 3); top.updateProjectionMatrix(); const after = point(g.midpoint.x, g.midpoint.y);
      if (before && after) { top.position.x += before.x - after.x; top.position.z += before.z - after.z; top.updateMatrixWorld(); } pinch = g; draw(); e.preventDefault(); return; }
    if (pan?.pointer === e.pointerId) { const before = point(pan.x, pan.y), after = point(e.clientX, e.clientY); if (before && after) {
      top.position.x = THREE.MathUtils.clamp(top.position.x + before.x - after.x, FIXED_BOUNDS.left, FIXED_BOUNDS.right);
      top.position.z = THREE.MathUtils.clamp(top.position.z + before.z - after.z, FIXED_BOUNDS.back, FIXED_BOUNDS.front); top.updateMatrixWorld(); draw(); }
      pan.x = e.clientX; pan.y = e.clientY; e.preventDefault(); return; }
    if (!drag || drag.pointer !== e.pointerId) return; if (!drag.moved) { if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 7) return; drag.moved = true; }
    const p = point(e.clientX, e.clientY); if (p) callbacks.onMove(drag.id, p.x + drag.dx, p.z + drag.dz); e.preventDefault();
  }
  function end(e: PointerEvent) {
    const cancelled = e.type === 'pointercancel' || (e.type === 'lostpointercapture' && (drag?.pointer === e.pointerId || (!!rotate && touches.has(e.pointerId))));
    if (cancelled) { if (drag || rotate) callbacks.onGestureCancel(); drag = null; rotate = null; pan = null; pinch = null; touches.clear(); return; }
    touches.delete(e.pointerId); if (touches.size < 2) { pinch = null; if (rotate) { rotate = null; callbacks.onGestureEnd(); } }
    if (pan?.pointer === e.pointerId) pan = null; if (drag?.pointer === e.pointerId) { drag = null; callbacks.onGestureEnd(); }
  }
  const lost = (e: Event) => { e.preventDefault(); callbacks.onError('webgl'); };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end); canvas.addEventListener('lostpointercapture', end); canvas.addEventListener('webglcontextlost', lost);
  const resize = () => { const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight), aspect = w / h; renderer.setSize(w, h, false);
    camera.aspect = aspect; camera.updateProjectionMatrix(); const span = Math.max(9.8, 8.7 / aspect); top.left = -span * aspect / 2; top.right = span * aspect / 2; top.top = span / 2; top.bottom = -span / 2; top.updateProjectionMatrix(); draw(); };
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  async function measureProduct(product: PlannerProduct) {
    let promise = cached.get(product.modelUrl); if (!promise) { promise = loader.loadAsync(product.modelUrl).then(result => result.scene); cached.set(product.modelUrl, promise); }
    let model: THREE.Group;
    try { model = await promise; } catch (error) { if (cached.get(product.modelUrl) === promise) cached.delete(product.modelUrl); throw error; }
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    if (!(size.x > 0)) throw new Error('invalid model bounds'); const scale = product.widthM / size.x;
    const result = { widthM: size.x * scale, depthM: size.z * scale, heightM: size.y * scale }; callbacks.onBounds(product.id, result); return result;
  }
  return { update, measureProduct, resetPlan() { top.position.set(CENTER.x, 16, CENTER.z); top.zoom = 1; top.updateProjectionMatrix(); top.updateMatrixWorld(); draw(); },
    dispose() { destroyed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.removeEventListener('change', cameraChanged); controls.dispose();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', end); canvas.removeEventListener('pointercancel', end); canvas.removeEventListener('lostpointercapture', end); canvas.removeEventListener('webglcontextlost', lost);
      if (highlight) { highlight.geometry.dispose(); (highlight.material as THREE.Material).dispose(); } if (room) dispose(room);
      instances.forEach(a => { const shadow = a.children[0] as THREE.Mesh; shadow.geometry.dispose(); (shadow.material as THREE.Material).dispose(); });
      cached.forEach(p => { void p.then(dispose).catch(() => {}); }); shadowTexture.dispose(); basis.dispose(); renderer.dispose();
    } };
}
