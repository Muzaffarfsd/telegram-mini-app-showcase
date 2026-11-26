import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gardenImage from '../../../assets/furniture/house.webp';
import { cabinetPlacement, footprint, type PlannerItem, type PlannerProduct, type PlannerRoom, type PlannerView } from './plannerTypes';

type SceneState = { room: PlannerRoom; items: PlannerItem[]; products: readonly PlannerProduct[]; selected: string | null; view: PlannerView };
type Callbacks = { onSelect: (id: string | null) => void; onMove: (id: string, x: number, z: number) => void; onDragStart: () => void; onDragEnd: () => void; onError: (text: string) => void; onModelError: (id: string, text: string) => void; onBounds: (id: string, size: { widthM: number; depthM: number; heightM: number }) => void };

/** One renderer, one shared GLB per product, rendered only on interaction/change. */
export function createPlannerScene(canvas: HTMLCanvasElement, callbacks: Callbacks) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#eeeae4');
  const architecture = new THREE.Group(), objects = new THREE.Group();
  scene.add(architecture, objects);
  scene.add(new THREE.HemisphereLight('#f8f7f1', '#8d8275', 0.8));
  const sun = new THREE.DirectionalLight('#fff8ed', 1.4); sun.position.set(-4, 7, -5);
  const windowFill = new THREE.PointLight('#fff4df', 1.8, 7, 2); scene.add(windowFill);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 25;
  sun.shadow.bias = -0.00015; sun.shadow.normalBias = 0.02;
  sun.shadow.intensity = 0.3;
  scene.add(sun);
  const perspective = new THREE.PerspectiveCamera(52, 1, 0.05, 80);
  const top = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 80);
  top.up.set(0, 0, -1);
  const controls = new OrbitControls(perspective, canvas);
  controls.enableDamping = false; controls.enablePan = false; controls.minDistance = 1.2; controls.maxDistance = 20;
  controls.minPolarAngle = 0.22; controls.maxPolarAngle = Math.PI / 2.18;
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const cached = new Map<string, Promise<THREE.Group>>();
  const instances = new Map<string, THREE.Group>();
  const models = new Map<string, THREE.Group>();
  const requested = new Set<string>();
  let state: SceneState = { room: { width: 4.8, depth: 4 }, items: [], products: [], selected: null, view: 'top' };
  let destroyed = false, frame = 0, resourceFrame = 0, architectureKey = '', cameraKey = '';
  let backWall: THREE.Group | null = null, sideWall: THREE.Group | null = null, rightWall: THREE.Group | null = null, ceiling: THREE.Group | null = null;
  let wood: THREE.Texture | null = null, normal: THREE.Texture | null = null, environment: THREE.Texture | null = null, rugTexture: THREE.Texture | null = null, rugNormal: THREE.Texture | null = null, plaster: THREE.Texture | null = null, garden: THREE.Texture | null = null, linen: THREE.Texture | null = null, linenNormal: THREE.Texture | null = null;
  let plant: THREE.Group | null = null, plantRequested = false;
  let decor: THREE.Group | null = null, decorRequested = false, decorClear = false;
  let dragging: { pointer: number; id: string; x: number; z: number } | null = null;
  let highlight: THREE.BoxHelper | null = null;
  const camera = () => state.view === 'top' ? top : perspective;
  const draw = () => { if (!destroyed && !frame) frame = requestAnimationFrame(() => {
    frame = 0;
    if (!destroyed) {
      // Hide cutaway walls when the camera passes outside the room, preserving
      // unobstructed orbiting without affecting the edit-mode floor or items.
      if (backWall) backWall.visible = state.view === 'perspective' && perspective.position.z > -state.room.depth / 2 + 0.04;
      if (sideWall) sideWall.visible = state.view === 'perspective' && perspective.position.x > -state.room.width / 2 + 0.04;
      if (rightWall) rightWall.visible = state.view === 'perspective' && perspective.position.x < state.room.width / 2 - 0.04;
      if (ceiling) ceiling.visible = state.view === 'perspective' && perspective.position.y < 2.58;
      if (decor) decor.visible = decorClear && state.view === 'perspective' && perspective.position.x < state.room.width / 2 - 0.04;
      renderer.render(scene, camera());
    }
  }); };
  // Asset promises can finish across several frames. Coalesce a final shadow
  // refresh after their scene changes so a static camera does not depend on
  // a later interaction to display the finished lighting.
  const refreshAfterResourceChange = () => {
    if (destroyed) return;
    renderer.shadowMap.needsUpdate = true;
    sun.shadow.needsUpdate = true;
    draw();
    if (!resourceFrame) resourceFrame = requestAnimationFrame(() => {
      resourceFrame = 0;
      if (destroyed) return;
      renderer.shadowMap.needsUpdate = true;
      sun.shadow.needsUpdate = true;
      draw();
    });
  };
  controls.addEventListener('change', draw);
  const disposeGroup = (group: THREE.Object3D) => group.traverse(node => {
    if (!(node instanceof THREE.Mesh) && !(node instanceof THREE.LineSegments)) return;
    node.geometry.dispose();
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach(material => { for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose(); material.dispose(); });
  });
  const material = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  function block(group: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number, color: string) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color)); mesh.position.set(x, y, z); group.add(mesh); return mesh;
  }
  // Gentle ambient occlusion at the join of the walls and floor. This is a
  // local material layer on actual 3D walls, not a background room image.
  const wallFadeTexture = (() => {
    const c = document.createElement('canvas'); c.width = 2; c.height = 128;
    const ctx = c.getContext('2d');
    if (ctx) { const gradient = ctx.createLinearGradient(0, 0, 0, 128); gradient.addColorStop(0, 'rgba(54,42,31,0)'); gradient.addColorStop(1, 'rgba(54,42,31,0.24)'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 2, 128); }
    return new THREE.CanvasTexture(c);
  })();
  function rebuildRoom(room: PlannerRoom, view: PlannerView) {
    architecture.children.slice().forEach(node => { architecture.remove(node); disposeGroup(node); });
    backWall = null; sideWall = null; rightWall = null; ceiling = null;
    const { width: w, depth: d } = room;
    const floor = block(architecture, w, 0.06, d, 0, -0.031, 0, '#c3ae9c');
    floor.receiveShadow = true;
    const floorMaterial = floor.material as THREE.MeshStandardMaterial;
    if (wood) { const texture = wood.clone(); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(w / 2, d / 2); texture.needsUpdate = true; floorMaterial.map = texture; floorMaterial.color.set('#c9dce8'); floorMaterial.roughness = 0.86; }
    if (normal) { const texture = normal.clone(); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(w / 2, d / 2); texture.needsUpdate = true; floorMaterial.normalMap = texture; floorMaterial.normalScale.set(0.35, 0.35); }
    const points: number[] = [];
    for (let x = -w / 2 + 0.22; x < w / 2; x += 0.22) points.push(x, 0.001, -d / 2, x, 0.001, d / 2);
    const grid = new THREE.BufferGeometry(); grid.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    if (!wood) architecture.add(new THREE.LineSegments(grid, new THREE.LineBasicMaterial({ color: '#aa907b', transparent: true, opacity: 0.34 }))); else grid.dispose();
    const rugDepth = Math.min(d - 0.3, 1.8);
    const rugWidth = Math.min(w - 0.3, 2.65);
    const rugBase = block(architecture, rugWidth, 0.015, rugDepth, 0, 0.006, Math.min(0.2, (d - rugDepth) / 2), '#c6b9a8');
    rugBase.receiveShadow = true;
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(rugWidth, rugDepth), new THREE.MeshStandardMaterial({ color: '#f3eee5', roughness: 1 }));
    rug.receiveShadow = true;
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.014, Math.min(0.2, (d - rugDepth) / 2)); architecture.add(rug);
    if (rugTexture) { const map = rugTexture.clone(); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(rugWidth / 1.8, rugDepth / 0.9); map.needsUpdate = true; (rug.material as THREE.MeshStandardMaterial).map = map; }
    if (rugNormal) { const map = rugNormal.clone(); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(rugWidth / 1.8, rugDepth / 0.9); map.needsUpdate = true; (rug.material as THREE.MeshStandardMaterial).normalMap = map; (rug.material as THREE.MeshStandardMaterial).normalScale.set(0.3, 0.3); }
    if (view === 'perspective') {
      // A cutaway room: its shell is architectural geometry, not a picture.
      // Window and trim scale with available wall space, but never stretch the
      // movable furniture or occupy its floor footprint.
      const h = 2.6, wall = '#e7e0d5', windowWidth = Math.min(1.9, w * 0.56), side = (w - windowWidth) / 2;
      const windowX = -Math.min(0.3, side * 0.22), leftSide = side + windowX, rightSide = side - windowX;
      const backZ = -d / 2;
      windowFill.position.set(windowX, 2.0, backZ + 0.7);
      backWall = new THREE.Group(); sideWall = new THREE.Group(); rightWall = new THREE.Group(); ceiling = new THREE.Group(); architecture.add(backWall, sideWall, rightWall, ceiling);
      const leftWall = block(backWall, leftSide, h, 0.10, -w / 2 + leftSide / 2, h / 2, backZ, wall);
      const rightBackWall = block(backWall, rightSide, h, 0.10, w / 2 - rightSide / 2, h / 2, backZ, wall);
      const returnWall = block(sideWall, 0.10, h, d, -w / 2, h / 2, 0, wall);
      const rightReturnWall = block(rightWall, 0.10, h, d, w / 2, h / 2, 0, wall);
      [leftWall, rightBackWall, returnWall, rightReturnWall].forEach((mesh, i) => {
        mesh.receiveShadow = true;
        if (plaster) {
          const texture = plaster.clone(); texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set((i >= 2 ? d : side) / 1.5, h / 1.5); texture.needsUpdate = true;
          (mesh.material as THREE.MeshStandardMaterial).bumpMap = texture;
          (mesh.material as THREE.MeshStandardMaterial).bumpScale = 0.025;
        }
      });
      block(backWall, windowWidth, 0.38, 0.10, windowX, h - 0.19, backZ, wall);
      block(backWall, windowWidth, 0.43, 0.10, windowX, 0.215, backZ, wall);
      const pane = block(backWall, windowWidth, 1.79, 0.025, windowX, 1.325, backZ - 0.07, '#d1d6cf');
      pane.material.dispose();
      if (garden) {
        const map = garden.clone(); map.repeat.set(0.20, 0.70); map.offset.set(0.12, 0.29); map.needsUpdate = true;
        (pane as THREE.Mesh<THREE.BoxGeometry, THREE.Material>).material = new THREE.MeshBasicMaterial({ map, color: '#b9b9b0' });
      } else (pane as THREE.Mesh<THREE.BoxGeometry, THREE.Material>).material = new THREE.MeshBasicMaterial({ color: '#d9dfd9' });
      const frameColor = '#6f6a60';
      for (const x of [-windowWidth / 2, 0, windowWidth / 2]) block(backWall, 0.045, 1.82, 0.065, windowX + x, 1.325, backZ, frameColor);
      for (const y of [0.43, 2.22]) block(backWall, windowWidth, 0.045, 0.065, windowX, y, backZ, frameColor);
      block(backWall, windowWidth + 0.12, 0.035, 0.16, windowX, 0.412, backZ + 0.035, '#f4efe6');
      // A restrained linen curtain, modelled in shallow folds, stays against
      // the wall and does not compete with items placed in the room.
      for (const sign of [-1, 1]) {
        const curtainWidth = Math.min(0.42, side * 0.6);
        const geometry = new THREE.PlaneGeometry(curtainWidth, 2.46, 48, 8);
        const positions = geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < positions.count; i++) {
          const u = positions.getX(i) / curtainWidth + 0.5, v = positions.getY(i) / 2.46 + 0.5;
          positions.setZ(i, Math.cos(u * Math.PI * 7) * 0.032 + Math.sin(u * Math.PI * 15 + v * 1.4) * 0.006);
        }
        geometry.computeVertexNormals();
        const cloth = new THREE.MeshStandardMaterial({ color: '#e9e0d2', roughness: 1, side: THREE.DoubleSide });
        if (linen) { const map = linen.clone(); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(0.65, 2.6); map.needsUpdate = true; cloth.map = map; }
        if (linenNormal) { const map = linenNormal.clone(); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(0.65, 2.6); map.needsUpdate = true; cloth.normalMap = map; cloth.normalScale.set(0.2, 0.2); }
        const curtain = new THREE.Mesh(geometry, cloth);
        curtain.position.set(windowX + sign * (windowWidth / 2 + curtainWidth * 0.35), 1.25, backZ + 0.105); curtain.receiveShadow = true; backWall.add(curtain);
      }
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, windowWidth + 0.8, 10), new THREE.MeshStandardMaterial({ color: '#615b53', metalness: 0.5, roughness: 0.5 }));
      rod.rotation.z = Math.PI / 2; rod.position.set(windowX, 2.48, backZ + 0.095); backWall.add(rod);
      block(backWall, w, 0.085, 0.035, 0, 0.0425, backZ + 0.07, '#f1ede5');
      block(sideWall, 0.035, 0.085, d, -w / 2 + 0.07, 0.0425, 0, '#f1ede5');
      block(rightWall, 0.035, 0.085, d, w / 2 - 0.07, 0.0425, 0, '#f1ede5');
      // Ceiling edge gives the room a finished architectural boundary while
      // keeping the cutaway open for the orbit and top-down editing cameras.
      block(backWall, w, 0.045, 0.08, 0, h - 0.0225, backZ + 0.07, '#f1ede6');
      block(sideWall, 0.08, 0.045, d, -w / 2 + 0.07, h - 0.0225, 0, '#f1ede6');
      block(rightWall, 0.08, 0.045, d, w / 2 - 0.07, h - 0.0225, 0, '#f1ede6');
      const ceilingSurface = block(ceiling, w, 0.05, d, 0, h + 0.025, 0, '#eee7db');
      ceilingSurface.material.dispose();
      (ceilingSurface as THREE.Mesh<THREE.BoxGeometry, THREE.Material>).material = new THREE.MeshBasicMaterial({ color: '#eeeae3' });
      const fade = (parent: THREE.Group, length: number, x: number, z: number, angle = 0) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(length, 0.3), new THREE.MeshBasicMaterial({ map: wallFadeTexture.clone(), transparent: true, depthWrite: false, side: THREE.DoubleSide }));
        mesh.position.set(x, 0.15, z); mesh.rotation.y = angle; parent.add(mesh);
      };
      fade(backWall, w, 0, backZ + 0.061);
      fade(sideWall, d, -w / 2 + 0.061, 0, Math.PI / 2);
      fade(rightWall, d, w / 2 - 0.061, 0, -Math.PI / 2);
    }
    architectureKey = `${w}:${d}:${view}`;
  }
  function resize() {
    const width = Math.max(canvas.clientWidth, 1), height = Math.max(canvas.clientHeight, 1), aspect = width / height;
    renderer.setSize(width, height, false);
    perspective.aspect = aspect; perspective.updateProjectionMatrix();
    const span = Math.max(state.room.depth + 0.7, (state.room.width + 0.7) / aspect);
    top.left = -span * aspect / 2; top.right = span * aspect / 2; top.top = span / 2; top.bottom = -span / 2; top.updateProjectionMatrix(); draw();
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  function configureCamera(force = false) {
    const key = `${state.room.width}:${state.room.depth}:${state.view}:${state.view === 'perspective' ? state.selected : ''}`;
    if (!force && key === cameraKey) return;
    cameraKey = key;
    controls.enabled = state.view === 'perspective';
    top.position.set(0, 14, 0); top.lookAt(0, 0, 0);
    const selected = state.items.find(item => item.id === state.selected);
    const product = selected && state.products.find(p => p.id === selected.productId);
    const horizontalBounds = state.items.flatMap(item => { const p = state.products.find(product => product.id === item.productId); if (!p) return []; const half = footprint(p, item.rotation).x; return [item.x - half, item.x + half]; });
    const compositionCenter = horizontalBounds.length ? (Math.min(...horizontalBounds) + Math.max(...horizontalBounds)) / 2 : 0;
    const targetX = selected ? selected.x * 0.55 + compositionCenter * 0.45 : compositionCenter, targetZ = selected?.z ?? 0;
    const half = selected && product ? footprint(product, selected.rotation) : { x: state.room.width / 2, z: state.room.depth / 2 };
    const targetY = product ? Math.max(0.8, Math.min(1.1, product.heightM * 0.9)) : 0.95;
    const aspect = Math.max(0.3, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    const tangent = Math.tan(THREE.MathUtils.degToRad(perspective.fov / 2));
    const heightDistance = product ? (product.heightM / 2 + 0.3) / tangent : 1.8;
    const distance = half.z + Math.max(1.2, (half.x + Math.abs((selected?.x ?? targetX) - targetX) + 0.32) / (tangent * aspect), heightDistance) + 0.25;
    // Leave breathing room for foreground pieces; the missing front wall allows
    // the eye-level camera to sit just outside it when the viewport is narrow.
    const roomFramingZ = state.room.depth / 2 + Math.max(0.6, state.room.width * 0.27);
    const fitItemsZ = state.items.reduce((max, item) => {
      const p = state.products.find(entry => entry.id === item.productId);
      if (!p) return max;
      const ext = footprint(p, item.rotation);
      return Math.max(max, item.z + ext.z + (Math.abs(item.x - targetX) + ext.x + 0.22) / (tangent * aspect));
    }, 0);
    perspective.position.set(targetX + Math.min(0.55, state.room.width * 0.11), 1.5, Math.max(targetZ + distance, roomFramingZ, fitItemsZ));
    controls.target.set(targetX, targetY, targetZ); controls.update();
    resize();
  }
  const shadowTexture = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const ctx = c.getContext('2d'); if (ctx) { const g = ctx.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(30,22,16,.34)'); g.addColorStop(1,'rgba(30,22,16,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,128,128); } return new THREE.CanvasTexture(c); })();
  function addObject(item: PlannerItem, product: PlannerProduct) {
    const anchor = new THREE.Group(); anchor.userData.plannerId = item.id;
    instances.set(item.id, anchor); objects.add(anchor);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(product.widthM * 1.25, product.depthM * 1.25), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; anchor.add(shadow);
    let promise = cached.get(product.modelUrl);
    if (!promise) { promise = loader.loadAsync(product.modelUrl).then(gltf => gltf.scene); cached.set(product.modelUrl, promise); }
    requested.add(item.id);
    promise.then(source => {
      if (destroyed) return;
      if (!instances.has(item.id) || instances.get(item.id) !== anchor) return;
      const model = source.clone(true), box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      // Preserve dynamic floor shadows while avoiding self-shadow acne on
      // the highly detailed catalog meshes at mobile shadow-map resolution.
      model.traverse(node => { if (node instanceof THREE.Mesh) { node.castShadow = true; node.receiveShadow = false; } });
      if (!Number.isFinite(size.x) || size.x <= 0) { callbacks.onError(`Не удалось определить размеры: ${product.name}`); return; }
      const scale = product.widthM / size.x;
      callbacks.onBounds(product.id, { widthM: size.x * scale, depthM: size.z * scale, heightM: size.y * scale });
      const inner = new THREE.Group(); inner.add(model); inner.scale.setScalar(scale); inner.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
      anchor.add(inner); models.set(item.id, inner); requested.delete(item.id); updateHighlight(); refreshAfterResourceChange();
    }).catch(() => { requested.delete(item.id); if (!destroyed) callbacks.onModelError(product.id, `Не удалось загрузить 3D-модель: ${product.name}`); });
  }
  function updateHighlight() {
    if (highlight) { scene.remove(highlight); highlight.geometry.dispose(); (highlight.material as THREE.Material).dispose(); highlight = null; }
    const target = state.view === 'top' && state.selected ? models.get(state.selected) : undefined;
    if (target) { target.updateWorldMatrix(true, true); highlight = new THREE.BoxHelper(target, '#242424'); scene.add(highlight); }
  }
  function update(next: SceneState) {
    if (destroyed) return;
    const oldSelection = state.selected; state = next;
    if (architectureKey !== `${next.room.width}:${next.room.depth}:${next.view}`) rebuildRoom(next.room, next.view);
    if (next.view === 'perspective' && !plantRequested) {
      plantRequested = true;
      void loader.loadAsync('/furniture/materials/potted-plant/potted_plant_02_1k.gltf').then(gltf => {
        if (destroyed) { disposeGroup(gltf.scene); return; }
        plant = gltf.scene;
        const box = new THREE.Box3().setFromObject(plant), size = box.getSize(new THREE.Vector3());
        if (size.y > 0) {
          const scale = 0.9 / size.y;
          plant.scale.setScalar(scale);
          plant.position.y = -box.min.y * scale;
        }
        scene.add(plant); update(state); refreshAfterResourceChange();
      }).catch(() => {});
    }
    // This is a decorative, non-catalogue object. It is shown only while its
    // measured floor footprint is free; it never changes the saved layout.
    if (next.view === 'perspective' && !decorRequested) {
      decorRequested = true;
      void Promise.all([
        loader.loadAsync('/furniture/materials/modern-wooden-cabinet.glb'),
        loader.loadAsync('/furniture/materials/ceramic-vase.glb')
      ]).then(([cabinet, vase]) => {
        if (destroyed) { disposeGroup(cabinet.scene); disposeGroup(vase.scene); return; }
        decor = new THREE.Group(); decor.add(cabinet.scene, vase.scene);
        vase.scene.position.set(-0.74, 0.681, 0);
        decor.rotation.y = -Math.PI / 2;
        decor.traverse(node => { if (node instanceof THREE.Mesh) { node.castShadow = true; node.receiveShadow = false; } });
        scene.add(decor); update(state); refreshAfterResourceChange();
      }).catch(() => {});
    }
    if (decor) {
      const { x, z, clear } = cabinetPlacement(next.room, next.items, next.products);
      decor.position.set(x, 0, z);
      decorClear = clear;
    }
    if (plant) {
      const x = -next.room.width / 2 + 0.32, z = -next.room.depth / 2 + 0.32;
      plant.position.x = x; plant.position.z = z;
      // Decorative object never prevents placement: hide it when a real
      // product overlaps its corner or when editing the plan from above.
      const occupied = next.items.some(item => {
        const product = next.products.find(p => p.id === item.productId);
        if (!product) return false;
        const half = footprint(product, item.rotation);
        return Math.abs(item.x - x) < half.x + 0.28 && Math.abs(item.z - z) < half.z + 0.28;
      });
      plant.visible = next.view === 'perspective' && !occupied;
    }
    configureCamera();
    const live = new Set(next.items.map(item => item.id));
    instances.forEach((group, id) => { if (!live.has(id)) { objects.remove(group); const shadow = group.children[0] as THREE.Mesh; shadow?.geometry?.dispose(); (shadow?.material as THREE.Material | undefined)?.dispose(); instances.delete(id); models.delete(id); requested.delete(id); } });
    for (const item of next.items) {
      const product = next.products.find(p => p.id === item.productId); if (!product) continue;
      if (!instances.has(item.id)) addObject(item, product);
      const instance = instances.get(item.id)!; instance.position.set(item.x, 0, item.z); instance.rotation.y = -item.rotation;
    }
    if (oldSelection !== next.selected || next.selected) updateHighlight();
    draw();
  }
  void new THREE.TextureLoader().loadAsync('/furniture/materials/wood-floor-diff.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace; wood = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync('/furniture/materials/wood-floor-normal.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } normal = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync('/furniture/materials/carpet-color.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace; rugTexture = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync('/furniture/materials/carpet-normal.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } rugNormal = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync('/furniture/materials/painted-plaster.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } plaster = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync('/furniture/materials/linen-color.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace; linen = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync('/furniture/materials/linen-normal.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } linenNormal = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync(gardenImage).then(texture => { if (destroyed) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace; garden = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new RGBELoader().loadAsync('/furniture/materials/lebombo_1k.hdr').then(texture => { if (destroyed) { texture.dispose(); return; } environment = texture; texture.mapping = THREE.EquirectangularReflectionMapping; scene.environment = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  function point(e: PointerEvent) { const rect = canvas.getBoundingClientRect(); ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1); raycaster.setFromCamera(ndc, camera()); }
  function onDown(e: PointerEvent) {
    if (state.view !== 'top' || !e.isPrimary || e.button !== 0) return;
    point(e);
    const hit = raycaster.intersectObjects(Array.from(models.values()), true)[0];
    if (!hit) { callbacks.onSelect(null); return; }
    let node: THREE.Object3D | null = hit.object;
    while (node && !node.userData.plannerId) node = node.parent;
    const id = node?.userData.plannerId as string | undefined, item = state.items.find(i => i.id === id), p = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
    if (!id || !item || !p) return;
    callbacks.onSelect(id); callbacks.onDragStart(); dragging = { pointer: e.pointerId, id, x: item.x - p.x, z: item.z - p.z }; canvas.setPointerCapture(e.pointerId); e.preventDefault();
  }
  function onMove(e: PointerEvent) { if (!dragging || dragging.pointer !== e.pointerId || state.view !== 'top') return; point(e); const p = raycaster.ray.intersectPlane(ground, new THREE.Vector3()); if (p) callbacks.onMove(dragging.id, p.x + dragging.x, p.z + dragging.z); e.preventDefault(); }
  function onEnd(e: PointerEvent) { if (dragging?.pointer === e.pointerId) { dragging = null; callbacks.onDragEnd(); } }
  function lost(e: Event) { e.preventDefault(); callbacks.onError('Графический контекст недоступен. Планировка сохранена на устройстве.'); }
  canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onEnd); canvas.addEventListener('pointercancel', onEnd); canvas.addEventListener('lostpointercapture', onEnd); canvas.addEventListener('webglcontextlost', lost);
  resize();
  return {
    update,
    dispose() {
      destroyed = true; cancelAnimationFrame(frame); cancelAnimationFrame(resourceFrame); observer.disconnect(); controls.removeEventListener('change', draw); controls.dispose();
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onEnd); canvas.removeEventListener('pointercancel', onEnd); canvas.removeEventListener('lostpointercapture', onEnd); canvas.removeEventListener('webglcontextlost', lost);
      if (highlight) { highlight.geometry.dispose(); (highlight.material as THREE.Material).dispose(); }
      architecture.children.forEach(disposeGroup); instances.forEach(group => { const shadow = group.children[0] as THREE.Mesh; shadow?.geometry?.dispose(); (shadow?.material as THREE.Material | undefined)?.dispose(); });
      cached.forEach(promise => { void promise.then(disposeGroup).catch(() => {}); }); if (plant) disposeGroup(plant); if (decor) disposeGroup(decor); shadowTexture.dispose(); wallFadeTexture.dispose(); wood?.dispose(); normal?.dispose(); environment?.dispose(); rugTexture?.dispose(); rugNormal?.dispose(); plaster?.dispose(); linen?.dispose(); linenNormal?.dispose(); garden?.dispose(); renderer.dispose();
    },
  };
}
