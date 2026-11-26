import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { makeWall } from './wallApertures';
import { dressWall } from './roomArchitecture';
import gardenImage from '../../../assets/furniture/house.webp';
import { stylePiece } from './roomStyling';
import { supportedPieces, surfaceHeight, bookshelfPlacement, cabinetPlacement, footprint, picturePlacement, roomOpenings, wallPoint, sidePicturePlacement, type PlannerItem, type PlannerProduct, type PlannerRoom, type PlannerView } from './plannerTypes';

type SceneState = { room: PlannerRoom; items: PlannerItem[]; products: readonly PlannerProduct[]; selected: string | null; view: PlannerView };
type Callbacks = { onSelect: (id: string | null) => void; onMove: (id: string, x: number, z: number) => void; onRotate: (id: string, rotation: number) => void; onDragStart: () => void; onDragEnd: () => void; onDragCancel: () => void; onError: (text: string) => void; onModelError: (id: string, text: string) => void; onBounds: (id: string, size: { widthM: number; depthM: number; heightM: number }) => void };

/** One renderer, one shared GLB per product, rendered only on interaction/change. */
export function createPlannerScene(canvas: HTMLCanvasElement, callbacks: Callbacks, theme='custom') {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  // VSM uses additional float render targets. Only opt in when a browser
  // explicitly reports enough memory; unknown or constrained devices use PCF.
  const reportedMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const canUseSoftShadows = reportedMemory !== undefined && reportedMemory >= 4 && renderer.capabilities.isWebGL2 && renderer.extensions.has('EXT_color_buffer_float');
  renderer.shadowMap.type = canUseSoftShadows ? THREE.VSMShadowMap : THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#eeeae4');
  const architecture = new THREE.Group(), objects = new THREE.Group();
  scene.add(architecture, objects);
  scene.add(new THREE.HemisphereLight('#faf9f5', '#b5a89b', 0.85));
  // A plan is viewed from a cutaway above the room, so it needs independent
  // fill light rather than inheriting the much darker inside-room exposure.
  const planFill = new THREE.HemisphereLight('#ffffff', '#d2c4b4', 1.05);
  scene.add(planFill);
  const sun = new THREE.DirectionalLight('#fff2dd', 2.6); sun.position.set(3.5, 6, -9);
  const windowFill = new THREE.PointLight('#fff4df', 0.65, 7, 2); scene.add(windowFill);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.radius = 4;
  sun.shadow.blurSamples = 8;
  sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 25;
  sun.shadow.bias = -0.00012; sun.shadow.normalBias = 0.015;
  sun.shadow.intensity = 0.65;
  scene.add(sun);
  const perspective = new THREE.PerspectiveCamera(52, 1, 0.05, 80);
  const top = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 80);
  top.up.set(0, 0, -1);
  top.position.set(0, 14, 0); top.lookAt(0, 0, 0);
  const controls = new OrbitControls(perspective, canvas);
  controls.enableDamping = false; controls.enablePan = false; controls.minDistance = 1.2; controls.maxDistance = 20;
  controls.minPolarAngle = 0.22; controls.maxPolarAngle = Math.PI / 2.18;
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder); const basis=new KTX2Loader().setTranscoderPath('/furniture/basis/').detectSupport(renderer); loader.setKTX2Loader(basis);
  const cached = new Map<string, Promise<THREE.Group>>();
  const instances = new Map<string, THREE.Group>();
  const models = new Map<string, THREE.Group>();
  const requested = new Set<string>();
  let state: SceneState = { room: { width: 4.8, depth: 4 }, items: [], products: [], selected: null, view: 'top' };
  let destroyed = false, frame = 0, resourceFrame = 0, architectureKey = '', cameraKey = '';
  let evening=false,frontWall:THREE.Group|null=null;
  let backWall: THREE.Group | null = null, sideWall: THREE.Group | null = null, rightWall: THREE.Group | null = null, ceiling: THREE.Group | null = null;
  let wood: THREE.Texture | null = null, normal: THREE.Texture | null = null, environment: THREE.Texture | null = null, rugTexture: THREE.Texture | null = null, rugNormal: THREE.Texture | null = null, plaster: THREE.Texture | null = null, garden: THREE.Texture | null = null, linen: THREE.Texture | null = null, linenNormal: THREE.Texture | null = null;
  let plant: THREE.Group | null = null, plantRequested = false;
  let decor: THREE.Group | null = null, decorRequested = false, decorClear = false;
  let bookshelf: THREE.Group | null = null, bookshelfRequested = false, bookshelfClear = false;
  let pendant: THREE.Group | null = null, pendantRequested = false;
  let wallPicture: THREE.Group | null = null, wallPictureRequested = false, pictureClear = false, pictureOnSide = false;
  let perspectiveResourcesRequested = false;
  let dragging: { pointer: number; id: string; x: number; z: number; startX: number; startY: number; moved: boolean } | null = null;
  let panning: { pointer: number; x: number; y: number } | null = null;
  let rotating: { id: string; angle: number; rotation: number } | null = null;
  const planTouches = new Map<number, { x: number; y: number }>();
  let planPinch: { distance: number; midpoint: { x: number; y: number } } | null = null;
  let highlight: THREE.LineLoop | null = null;
  const camera = () => state.view === 'top' ? top : perspective;
  const draw = () => { if (!destroyed && !frame) frame = requestAnimationFrame(() => {
    frame = 0;
    if (!destroyed) {
      // Hide cutaway walls when the camera passes outside the room, preserving
      // unobstructed orbiting without affecting the edit-mode floor or items.
      if (backWall) backWall.visible = state.view === 'perspective' && perspective.position.z > -state.room.depth / 2 + 0.04;
      if (sideWall) sideWall.visible = state.view === 'perspective' && perspective.position.x > -state.room.width / 2 + 0.04;
      if (rightWall) rightWall.visible = state.view === 'perspective' && perspective.position.x < state.room.width / 2 - 0.04;
      if(frontWall)frontWall.visible=state.view==='perspective'&&perspective.position.z<state.room.depth/2-.04;
      if (ceiling) ceiling.visible = state.view === 'perspective' && perspective.position.y < 2.58;
      if (decor) decor.visible = decorClear && state.view === 'perspective' && perspective.position.x < state.room.width / 2 - 0.04;
      if (bookshelf) bookshelf.visible = bookshelfClear && state.view === 'perspective' && perspective.position.z > -state.room.depth / 2 + 0.04;
      if (pendant) pendant.visible = state.view === 'perspective' && perspective.position.y < 2.58 && !state.items.some(i=>state.products.find(p=>p.id===i.productId)?.placement==='ceiling');
      if (wallPicture) wallPicture.visible = pictureClear && state.view === 'perspective' && (pictureOnSide ? perspective.position.x > -state.room.width / 2 + 0.04 : perspective.position.z > -state.room.depth / 2 + 0.04);
      planFill.visible = state.view === 'top';
      sun.intensity = state.view === 'top' ? 1.15 : evening? .72:2.1;
      sun.shadow.intensity = state.view === 'top' ? 0.15 : .85;
      renderer.toneMappingExposure = state.view === 'top' ? 1.22 : evening?.79:.93;
      (scene.background as THREE.Color).set(state.view === 'top' ? '#d8d4ce' : '#eeeae4');
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
    frontWall=null;backWall = null; sideWall = null; rightWall = null; ceiling = null;
    const { width: w, depth: d } = room;
    const shadowExtent = Math.max(4, Math.hypot(w, d) / 2 + 2);
    sun.shadow.camera.left = -shadowExtent; sun.shadow.camera.right = shadowExtent;
    sun.shadow.camera.top = shadowExtent; sun.shadow.camera.bottom = -shadowExtent;
    sun.shadow.camera.updateProjectionMatrix();
    const floor = block(architecture, w, 0.06, d, 0, -0.031, 0, '#c3ae9c');
    floor.receiveShadow = true;
    const floorMaterial = floor.material as THREE.MeshStandardMaterial;
    if (wood) { const texture = wood.clone(); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(w / 1.7, d / 1.7); texture.needsUpdate = true; floorMaterial.map = texture; floorMaterial.color.set('#fffdf9'); floorMaterial.roughness = 0.86; }
    if (normal) { const texture = normal.clone(); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(w / 1.7, d / 1.7); texture.needsUpdate = true; floorMaterial.normalMap = texture; floorMaterial.normalScale.set(0.25, 0.25); }
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
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.014, Math.min(0.2, (d - rugDepth) / 2)); architecture.add(rug); const hasOwnRug=state.items.some(i=>state.products.find(p=>p.id===i.productId)?.placement==='rug');rug.visible=rugBase.visible=!hasOwnRug;
    if (rugTexture) { const map = rugTexture.clone(); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(rugWidth / 1.8, rugDepth / 0.9); map.needsUpdate = true; (rug.material as THREE.MeshStandardMaterial).map = map; }
    if (rugNormal) { const map = rugNormal.clone(); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(rugWidth / 1.8, rugDepth / 0.9); map.needsUpdate = true; (rug.material as THREE.MeshStandardMaterial).normalMap = map; (rug.material as THREE.MeshStandardMaterial).normalScale.set(0.3, 0.3); }
    if (view === 'top') {
      // Show a physical cut through walls on the exterior side of the room
      // boundary.  This keeps the advertised floor area and product footprints
      // unchanged; the gaps use exactly the perspective room's coordinates.
      const openings = roomOpenings(room), z = -d / 2;
      const spans = [openings.window, openings.door].filter((opening): opening is NonNullable<typeof opening> => Boolean(opening)).sort((a, b) => a.start - b.start);
      const wallDepth = 0.12, wallHeight = 0.14;
      const planWall = (width: number, depth: number, x: number, wallZ: number) => {
        if (width < 0.001 || depth < 0.001) return;
        const part = block(architecture, width, wallHeight, depth, x, wallHeight / 2, wallZ, '#f1eee8');
        part.castShadow = true; part.receiveShadow = true;
      };
      planWall(w + 2 * wallDepth, wallDepth, 0, d / 2 + wallDepth / 2);
      planWall(wallDepth, d, -w / 2 - wallDepth / 2, 0);
      planWall(wallDepth, d, w / 2 + wallDepth / 2, 0);
      let cursor = -w / 2;
      for (const opening of spans) {
        const start = -w / 2 + opening.start;
        planWall(start - cursor, wallDepth, (cursor + start) / 2, z - wallDepth / 2);
        cursor = start + opening.width;
      }
      planWall(w / 2 - cursor, wallDepth, (cursor + w / 2) / 2, z - wallDepth / 2);
      // Close the outside corners without bridging door or window openings.
      planWall(wallDepth, wallDepth, -w / 2 - wallDepth / 2, z - wallDepth / 2);
      planWall(wallDepth, wallDepth, w / 2 + wallDepth / 2, z - wallDepth / 2);
      for (const [opening, color] of [[openings.window, '#568794'], [openings.door, '#b07442']] as const) {
        if (!opening) continue;
        const marker = new THREE.Mesh(new THREE.PlaneGeometry(opening.width, 0.055), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
        marker.rotation.x = -Math.PI / 2; marker.position.set(-w / 2 + opening.start + opening.width / 2, 0.045, z); architecture.add(marker);
      }
    }
    if (view === 'perspective') {
      // A cutaway room: its shell is architectural geometry, not a picture.
      // Window and trim scale with available wall space, but never stretch the
      // movable furniture or occupy its floor footprint.
      const h = 2.6, wall = ({studio:'#e7dfca',dining:'#d6d8c8',reading:'#d5c4a6',office:'#d0d8d2',bedroom:'#ebdcd3'} as Record<string,string>)[theme] || '#e7e0d5', backZ = -d / 2;
      const all=roomOpenings(room);const openings={window:all.window&&(!all.window.wall||all.window.wall==='back')?all.window:null,door:all.door&&(!all.door.wall||all.door.wall==='back')?all.door:null};
      const windowWidth = openings.window?.width ?? 0;
      const windowX = openings.window ? -w / 2 + openings.window.start + windowWidth / 2 : 0;
      const side = (w - windowWidth) / 2;
      windowFill.position.set(windowX, 2.0, backZ + 0.7);
      backWall = new THREE.Group(); sideWall = new THREE.Group(); rightWall = new THREE.Group(); ceiling = new THREE.Group(); architecture.add(backWall, sideWall, rightWall, ceiling); if(![all.window,all.door].some(o=>o?.wall==='left'))dressWall(theme,sideWall,w,d);
      const backWallGroup = backWall;
      const wallPieces: THREE.Mesh[] = [];
      const segment = (a: number, b: number, y: number, height: number) => {
        if (b - a > 0.001) wallPieces.push(block(backWallGroup, b - a, height, 0.10, (a + b) / 2, y, backZ, wall));
      };
      const spans = [openings.window && { ...openings.window, kind: 'window' }, openings.door && { ...openings.door, kind: 'door' }].filter((opening): opening is { start: number; width: number; kind: string } => Boolean(opening)).sort((a, b) => a.start - b.start);
      let cursor = -w / 2;
      for (const opening of spans) {
        const left = -w / 2 + opening.start, right = left + opening.width;
        segment(cursor, left, h / 2, h);
        if (opening.kind === 'window') { segment(left, right, 0.215, 0.43); segment(left, right, h - 0.19, 0.38); }
        else segment(left, right, 2.35, 0.5);
        cursor = right;
      }
      segment(cursor, w / 2, h / 2, h);
      const returnWall = block(sideWall, 0.10, h, d, -w / 2, h / 2, 0, wall);
      const rightReturnWall = block(rightWall, 0.10, h, d, w / 2, h / 2, 0, wall);
      [...wallPieces, returnWall, rightReturnWall].forEach(mesh => {
        mesh.receiveShadow = true; mesh.castShadow = true;
        if (plaster) {
          const texture = plaster.clone(); texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set((mesh === returnWall || mesh === rightReturnWall ? d : w) / 1.5, h / 1.5); texture.needsUpdate = true;
          (mesh.material as THREE.MeshStandardMaterial).bumpMap = texture;
          (mesh.material as THREE.MeshStandardMaterial).bumpScale = 0.025;
        }
      });
      for(const side of ['left','right','front'] as const){if(![all.window,all.door].some(o=>o?.wall===side))continue;
        const target=side==='left'?sideWall:side==='right'?rightWall:new THREE.Group();if(side==='front'){frontWall=target;architecture.add(target);}
        if(side==='left')returnWall.visible=false;if(side==='right')rightReturnWall.visible=false;
        target.add(makeWall(room,side,wall,garden));}
      if(all.window){const o=all.window,side=o.wall||'back',offset=o.start+o.width/2;const lamp=wallPoint(room,side,offset,.38);windowFill.position.set(lamp.x,1.84,lamp.z);const outside=wallPoint(room,side,offset-.65,-1.6);sun.position.set(outside.x,2.5,outside.z);sun.target.position.set(-outside.x*.42,0,-outside.z*.42);sun.target.updateMatrixWorld();}
      if (openings.window) {
        const pane = block(backWall, windowWidth, 1.79, 0.025, windowX, 1.325, backZ - 0.07, '#d1d6cf');
        pane.material.dispose();
        if (garden) {
          // Keep the outdoor view behind this window only.  A large unmasked
          // backdrop would incorrectly appear through doors and cutaway walls.
          const map = garden.clone();
          const crop = Math.min(1, windowWidth / 1.79 / (1100 / 329));
          map.repeat.set(crop, 1); map.offset.set((1 - crop) / 2, 0); map.needsUpdate = true;
          const landscape = new THREE.Mesh(new THREE.PlaneGeometry(windowWidth, 1.79), new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide, toneMapped: false }));
          landscape.position.set(windowX, 1.325, backZ - 0.22); backWall.add(landscape);
          (pane as THREE.Mesh<THREE.BoxGeometry, THREE.Material>).material = new THREE.MeshPhysicalMaterial({ color: '#e5eeec', transparent: true, opacity: 0.12, roughness: 0.12, metalness: 0, depthWrite: false });
        } else (pane as THREE.Mesh<THREE.BoxGeometry, THREE.Material>).material = new THREE.MeshBasicMaterial({ color: '#d9dfd9' });
        const frameColor = '#6f6a60';
        for (const x of [-windowWidth / 2, 0, windowWidth / 2]) block(backWall, 0.045, 1.82, 0.065, windowX + x, 1.325, backZ, frameColor).castShadow = true;
        for (const y of [0.43, 2.22]) block(backWall, windowWidth, 0.045, 0.065, windowX, y, backZ, frameColor).castShadow = true;
        block(backWall, windowWidth + 0.12, 0.035, 0.16, windowX, 0.412, backZ + 0.035, '#f4efe6');
        // Each curtain is clamped to the actual available wall beside the opening.
        for (const sign of [-1, 1]) {
          let available = sign < 0 ? openings.window.start : w - openings.window.start - windowWidth;
          if (openings.door && sign < 0 && openings.door.start < openings.window.start) available = Math.min(available, openings.window.start - openings.door.start - openings.door.width);
          if (openings.door && sign > 0 && openings.door.start > openings.window.start) available = Math.min(available, openings.door.start - openings.window.start - windowWidth);
          const curtainWidth = Math.min(0.42, Math.max(0, available - 0.04));
          if (curtainWidth < 0.04) continue;
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
          curtain.position.set(windowX + sign * (windowWidth / 2 + curtainWidth * 0.35), 1.25, backZ + 0.105); curtain.receiveShadow = true; curtain.castShadow = true; backWall.add(curtain);
        }
      }
      if (openings.door) {
        const doorLeft = -w / 2 + openings.door.start, doorRight = doorLeft + openings.door.width;
        for (const [a, b] of [[-w / 2, doorLeft], [doorRight, w / 2]]) if (b - a > 0.001) block(backWall, b - a, 0.085, 0.035, (a + b) / 2, 0.0425, backZ + 0.07, '#f1ede5');
        // Doorway casing stays outside the stated clear opening. The passage
        // remains empty: there is deliberately no invented door or swing.
        for (const x of [doorLeft - 0.025, doorRight + 0.025]) {
          const jamb = block(backWall, 0.05, 2.1, 0.14, x, 1.05, backZ - 0.01, '#e8e2d9');
          jamb.castShadow = true; jamb.receiveShadow = true;
        }
        const lintel = block(backWall, openings.door.width + 0.1, 0.05, 0.14, (doorLeft + doorRight) / 2, 2.125, backZ - 0.01, '#e8e2d9');
        lintel.castShadow = true; lintel.receiveShadow = true;
      } else block(backWall, w, 0.085, 0.035, 0, 0.0425, backZ + 0.07, '#f1ede5');
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
      if (!openings.door) fade(backWall, w, 0, backZ + 0.061);
      fade(sideWall, d, -w / 2 + 0.061, 0, Math.PI / 2);
      fade(rightWall, d, w / 2 - 0.061, 0, -Math.PI / 2);
    }
    architectureKey = `${w}:${d}:${view}:${JSON.stringify(room.openings ?? null)}`;
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
  const shadowTexture = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const ctx = c.getContext('2d'); if (ctx) { const g = ctx.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(30,22,16,.67)'); g.addColorStop(.48,'rgba(30,22,16,.32)'); g.addColorStop(1,'rgba(30,22,16,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,128,128); } return new THREE.CanvasTexture(c); })();
  function addObject(item: PlannerItem, product: PlannerProduct) {
    const anchor = new THREE.Group(); anchor.userData.plannerId = item.id; anchor.userData.modelUrl=product.modelUrl;
    instances.set(item.id, anchor); objects.add(anchor);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(product.widthM * 1.25, product.depthM * 1.25), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .043;shadow.visible=product.placement!=='ceiling'&&product.placement!=='rug';anchor.add(shadow);
    let promise = cached.get(product.modelUrl);
    if (!promise) { promise = loader.loadAsync(product.modelUrl).then(gltf => gltf.scene); cached.set(product.modelUrl, promise); }
    requested.add(item.id);
    promise.then(source => {
      if (destroyed) return;
      if (!instances.has(item.id) || instances.get(item.id) !== anchor) return;
      const model = source.clone(true);
      // Product GLBs may contain studio lights for individual inspection.
      // Room lighting belongs to the room, so copies must not add extra lights.
      const embeddedLights: THREE.Light[] = [];
      model.traverse(node => { if (node instanceof THREE.Light) embeddedLights.push(node); });
      embeddedLights.forEach(light => light.removeFromParent());
      const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      // Preserve dynamic floor shadows while avoiding self-shadow acne on
      // the highly detailed catalog meshes at mobile shadow-map resolution.
      model.traverse(node => { if (node instanceof THREE.Mesh) { node.castShadow = true; node.receiveShadow = false; } });
      if (!Number.isFinite(size.x) || size.x <= 0) { callbacks.onError(`Не удалось определить размеры: ${product.name}`); return; }
      const scale = product.widthM / size.x;
      callbacks.onBounds(product.id, { widthM: size.x * scale, depthM: size.z * scale, heightM: size.y * scale });
      const inner = new THREE.Group(); inner.add(model); inner.scale.setScalar(scale); inner.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
      anchor.add(inner);const styling=stylePiece(theme,product,inner);if(styling){anchor.add(styling);styling.visible=!supportedPieces(item.id,state.items,state.products).length;}models.set(item.id, inner); requested.delete(item.id); updateHighlight(); refreshAfterResourceChange();
    }).catch(() => { requested.delete(item.id); if (!destroyed) callbacks.onModelError(product.id, `Не удалось загрузить 3D-модель: ${product.name}`); });
  }
  function updateHighlight() {
    if (highlight) { scene.remove(highlight); highlight.geometry.dispose(); (highlight.material as THREE.Material).dispose(); highlight = null; }
    const selected = state.view === 'top' ? state.items.find(item => item.id === state.selected) : undefined;
    const product = selected && state.products.find(entry => entry.id === selected.productId);
    if (selected && product && models.has(selected.id)) {
      const x = product.widthM / 2 + 0.055, z = product.depthM / 2 + 0.055;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-x, 0, -z), new THREE.Vector3(x, 0, -z),
        new THREE.Vector3(x, 0, z), new THREE.Vector3(-x, 0, z),
      ]);
      highlight = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: '#34483f', transparent: true, opacity: 0.86 }));
      highlight.position.set(selected.x, 0.045, selected.z);
      highlight.rotation.y = -selected.rotation;
      scene.add(highlight);
    }
  }
  function update(next: SceneState) {
    if (destroyed) return;
    const oldSelection = state.selected;
    if (state.view !== next.view || state.room.width !== next.room.width || state.room.depth !== next.room.depth) {
      planTouches.clear(); planPinch = null; panning = null;
      if (dragging || rotating) callbacks.onDragEnd();
      dragging = null; rotating = null;
      if (state.room.width !== next.room.width || state.room.depth !== next.room.depth) {
        top.zoom = 1; top.position.set(0, 14, 0); top.updateProjectionMatrix();
      }
    }
    state = next;
    if (architectureKey !== `${next.room.width}:${next.room.depth}:${next.view}:${JSON.stringify(next.room.openings ?? null)}`) rebuildRoom(next.room, next.view);
    if (next.view === 'perspective') loadPerspectiveResources();
    if (next.view === 'perspective' && !pendantRequested) {
      pendantRequested = true;
      void loader.loadAsync('/furniture/materials/ceiling-pendant/modern_ceiling_lamp_01_1k.gltf').then(gltf => {
        if (destroyed) { disposeGroup(gltf.scene); return; }
        const box = new THREE.Box3().setFromObject(gltf.scene), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
        if (!(size.y > 0)) { disposeGroup(gltf.scene); return; }
        const scale = 0.62 / size.y;
        gltf.scene.scale.setScalar(scale);
        gltf.scene.position.set(-center.x * scale, 2.58 - box.max.y * scale, -center.z * scale);
        pendant = new THREE.Group(); pendant.add(gltf.scene); scene.add(pendant);
        update(state); refreshAfterResourceChange();
      }).catch(() => {});
    }
    if (next.view === 'perspective' && !wallPictureRequested) {
      wallPictureRequested = true;
      void new THREE.TextureLoader().loadAsync('/furniture/materials/pissarro-landscape.jpg').then(texture => {
        if (destroyed) { texture.dispose(); return; }
        texture.colorSpace = THREE.SRGBColorSpace;
        wallPicture = new THREE.Group();
        // A real public-domain artwork on a shallow, physical frame and mat.
        const mat = new THREE.Mesh(new THREE.PlaneGeometry(0.57, 0.817), new THREE.MeshStandardMaterial({ color: '#f4f0e8', roughness: 0.9 }));
        wallPicture.add(mat);
        const print = new THREE.Mesh(new THREE.PlaneGeometry(0.50, 0.661), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
        print.position.z = 0.002; wallPicture.add(print);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: '#3d352e', roughness: 0.6 });
        for (const [width, height, x, y] of [[0.594, 0.012, 0, 0.414], [0.594, 0.012, 0, -0.414], [0.012, 0.817, -0.291, 0], [0.012, 0.817, 0.291, 0]]) {
          const edge = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.016), frameMaterial);
          edge.position.set(x, y, 0.005); wallPicture.add(edge);
        }
        scene.add(wallPicture);
        update(state); refreshAfterResourceChange();
      }).catch(() => {});
    }
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
    // Fixed-scale decorative geometry: its baked light is on the module only.
    // Loading failure leaves the original room and product layout untouched.
    if (next.view === 'perspective' && !bookshelfRequested) {
      bookshelfRequested = true;
      void Promise.allSettled([
        loader.loadAsync('/furniture/materials/baked-bookshelf.glb'),
        new THREE.TextureLoader().loadAsync('/furniture/materials/baked-bookshelf.webp')
      ]).then(([modelResult, textureResult]) => {
        if (modelResult.status !== 'fulfilled' || textureResult.status !== 'fulfilled') {
          if (modelResult.status === 'fulfilled') disposeGroup(modelResult.value.scene);
          if (textureResult.status === 'fulfilled') textureResult.value.dispose();
          return;
        }
        const gltf = modelResult.value, texture = textureResult.value;
        if (destroyed) { disposeGroup(gltf.scene); texture.dispose(); return; }
        texture.flipY = false; texture.colorSpace = THREE.SRGBColorSpace;
        const bounds = new THREE.Box3().setFromObject(gltf.scene), center = bounds.getCenter(new THREE.Vector3());
        gltf.scene.position.x -= center.x; gltf.scene.position.y -= bounds.min.y; gltf.scene.position.z -= center.z;
        const baked = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false });
        const originalMaterials = new Set<THREE.Material>();
        gltf.scene.traverse(node => { if (node instanceof THREE.Mesh) { (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => originalMaterials.add(material)); node.material = baked; node.castShadow = false; node.receiveShadow = false; } });
        originalMaterials.forEach(material => { for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose(); material.dispose(); });
        bookshelf = new THREE.Group();
        const contact = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.62), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.7 }));
        contact.rotation.x = -Math.PI / 2; contact.position.y = 0.018;
        bookshelf.add(contact, gltf.scene); scene.add(bookshelf);
        update(state); refreshAfterResourceChange();
      }).catch(() => {});
    }
    if (bookshelf) {
      const { x, z, clear } = bookshelfPlacement(next.room, next.items, next.products);
      bookshelf.position.set(x, 0, z);
      bookshelfClear = clear;
    }
    // The existing cabinet occupies this back-right corner; show one module.
    if (bookshelfClear) decorClear = false;
    if (wallPicture) {
      const position = picturePlacement(next.room, next.items, next.products, bookshelfClear);
      const side = position === null ? sidePicturePlacement(next.room, next.items, next.products) : null;
      pictureClear = position !== null || side !== null; pictureOnSide = position === null;
      if (position !== null) { wallPicture.position.set(position, 1.55, -next.room.depth / 2 + 0.055); wallPicture.rotation.y = 0; }
      else if (side !== null) { wallPicture.position.set(-next.room.width / 2 + 0.055, 1.55, side); wallPicture.rotation.y = Math.PI / 2; }
    }
    const doorway = roomOpenings(next.room).door;
    const doorCenter = doorway ? -next.room.width / 2 + doorway.start + doorway.width / 2 : 0;
    if (doorway && decor) {
      const placement = cabinetPlacement(next.room, next.items, next.products);
      if (Math.abs(placement.x - doorCenter) < doorway.width / 2 + 0.3 && placement.z - 1.26 < -next.room.depth / 2 + 0.8) decorClear = false;
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
      const blocksDoor = doorway && Math.abs(x - doorCenter) < doorway.width / 2 + 0.28 && z - 0.28 < -next.room.depth / 2 + 0.8;
      plant.visible = next.view === 'perspective' && !occupied && !blocksDoor;
    }
    configureCamera();
    const live = new Map(next.items.map(item=>[item.id,next.products.find(p=>p.id===item.productId)?.modelUrl] as const));
    instances.forEach((group, id) => { if (live.get(id)!==group.userData.modelUrl) {const styling=group.getObjectByName('room-styling');if(styling)disposeGroup(styling); objects.remove(group); const shadow = group.children[0] as THREE.Mesh; shadow?.geometry?.dispose(); (shadow?.material as THREE.Material | undefined)?.dispose(); instances.delete(id); models.delete(id); requested.delete(id); } });
    for (const item of next.items) {
      const product = next.products.find(p => p.id === item.productId); if (!product) continue;
      if (!instances.has(item.id)) addObject(item, product);
      const instance = instances.get(item.id)!;const styling=instance.getObjectByName('room-styling');if(styling)styling.visible=!supportedPieces(item.id,next.items,next.products).length;
      instance.position.set(item.x,surfaceHeight(item,product,next.items,next.products),item.z); instance.rotation.y = -item.rotation;
    }
    if (oldSelection !== next.selected || next.selected) updateHighlight();
    renderer.shadowMap.needsUpdate = true;
    draw();
  }
  void new THREE.TextureLoader().loadAsync('/furniture/materials/laminate-floor-diff.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace; wood = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync('/furniture/materials/laminate-floor-normal.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } normal = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync('/furniture/materials/carpet-color.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace; rugTexture = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  void new THREE.TextureLoader().loadAsync('/furniture/materials/carpet-normal.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } rugNormal = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  function loadPerspectiveResources() {
    if (perspectiveResourcesRequested || destroyed) return;
    perspectiveResourcesRequested = true;
    void new THREE.TextureLoader().loadAsync('/furniture/materials/painted-plaster.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } plaster = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
    void new THREE.TextureLoader().loadAsync('/furniture/materials/linen-color.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace; linen = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
    void new THREE.TextureLoader().loadAsync('/furniture/materials/linen-normal.jpg').then(texture => { if (destroyed) { texture.dispose(); return; } linenNormal = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
    void new THREE.TextureLoader().loadAsync(gardenImage).then(texture => { if (destroyed) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace; garden = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
    void new RGBELoader().loadAsync('/furniture/materials/lebombo_1k.hdr').then(texture => { if (destroyed) { texture.dispose(); return; } environment = texture; texture.mapping = THREE.EquirectangularReflectionMapping; scene.environment = texture; architectureKey = ''; update(state); refreshAfterResourceChange(); }).catch(() => {});
  }
  function pointAt(x: number, y: number, viewCamera = camera()) { const rect = canvas.getBoundingClientRect(); ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1); raycaster.setFromCamera(ndc, viewCamera); }
  function point(e: PointerEvent) { pointAt(e.clientX, e.clientY); }
  function pair() {
    const [a, b] = Array.from(planTouches.values());
    if (!a || !b) return null;
    return { distance: Math.hypot(a.x - b.x, a.y - b.y), angle: Math.atan2(b.y - a.y, b.x - a.x), midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  }
  function onDown(e: PointerEvent) {
    if (state.view !== 'top') return;
    if (e.pointerType === 'touch') {
      planTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (planTouches.size === 2) {
        const gesture = pair();
        const item = dragging && state.items.find(i => i.id === dragging?.id);
        if (gesture && item) rotating = { id: item.id, angle: gesture.angle, rotation: item.rotation };
        else planPinch = gesture;
        dragging = null; panning = null;
        canvas.setPointerCapture(e.pointerId); e.preventDefault(); return;
      }
      if (planTouches.size > 1) return;
    }
    if (!e.isPrimary || e.button !== 0) return;
    point(e);
    const hit = raycaster.intersectObjects(Array.from(models.values()), true)[0];
    if (!hit) { panning = { pointer: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    let node: THREE.Object3D | null = hit.object;
    while (node && !node.userData.plannerId) node = node.parent;
    const id = node?.userData.plannerId as string | undefined, item = state.items.find(i => i.id === id), p = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
    if (!id || !item || !p) return;
    callbacks.onSelect(id); callbacks.onDragStart(); dragging = { pointer: e.pointerId, id, x: item.x - p.x, z: item.z - p.z, startX: e.clientX, startY: e.clientY, moved: false }; canvas.setPointerCapture(e.pointerId); e.preventDefault();
  }
  function onMove(e: PointerEvent) {
    if (state.view !== 'top') return;
    if (planTouches.has(e.pointerId)) planTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (rotating && planTouches.size === 2) {
      const current = pair();
      if (!current) return;
      let delta = current.angle - rotating.angle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      rotating.rotation += delta; rotating.angle = current.angle;
      callbacks.onRotate(rotating.id, rotating.rotation); e.preventDefault(); return;
    }
    if (planPinch && planTouches.size === 2) {
      const current = pair();
      if (!current || !planPinch.distance || !current.distance) return;
      pointAt(planPinch.midpoint.x, planPinch.midpoint.y, top);
      const before = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
      top.zoom = THREE.MathUtils.clamp(top.zoom * current.distance / planPinch.distance, 1, 2.5);
      top.updateProjectionMatrix();
      pointAt(current.midpoint.x, current.midpoint.y, top);
      const after = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
      if (before && after) {
        top.position.x = THREE.MathUtils.clamp(top.position.x + before.x - after.x, -state.room.width / 2, state.room.width / 2);
        top.position.z = THREE.MathUtils.clamp(top.position.z + before.z - after.z, -state.room.depth / 2, state.room.depth / 2);
      }
      top.updateMatrixWorld();
      planPinch = current; draw(); e.preventDefault(); return;
    }
    if (panning?.pointer === e.pointerId) {
      pointAt(panning.x, panning.y, top);
      const before = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
      pointAt(e.clientX, e.clientY, top);
      const after = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
      if (before && after) {
        top.position.x = THREE.MathUtils.clamp(top.position.x + before.x - after.x, -state.room.width / 2, state.room.width / 2);
        top.position.z = THREE.MathUtils.clamp(top.position.z + before.z - after.z, -state.room.depth / 2, state.room.depth / 2);
        top.updateMatrixWorld(); draw();
      }
      panning.x = e.clientX; panning.y = e.clientY; e.preventDefault(); return;
    }
    if (!dragging || dragging.pointer !== e.pointerId) return;
    if (!dragging.moved) {
      if (Math.hypot(e.clientX - dragging.startX, e.clientY - dragging.startY) < 7) return;
      dragging.moved = true;
    }
    point(e); const p = raycaster.ray.intersectPlane(ground, new THREE.Vector3()); if (p) callbacks.onMove(dragging.id, p.x + dragging.x, p.z + dragging.z); e.preventDefault();
  }
  function onEnd(e: PointerEvent) {
    const cancelled = e.type === 'pointercancel' || (e.type === 'lostpointercapture' && (dragging?.pointer === e.pointerId || (rotating && planTouches.has(e.pointerId))));
    if (cancelled) {
      if (dragging || rotating) callbacks.onDragCancel();
      dragging = null; rotating = null; panning = null; planPinch = null; planTouches.clear(); return;
    }
    planTouches.delete(e.pointerId);
    if (planTouches.size < 2) {
      planPinch = null;
      if (rotating) { rotating = null; callbacks.onDragEnd(); }
    }
    if (panning?.pointer === e.pointerId) panning = null;
    if (dragging?.pointer === e.pointerId) { dragging = null; callbacks.onDragEnd(); }
  }
  function lost(e: Event) { e.preventDefault(); callbacks.onError('Графический контекст недоступен. Планировка сохранена на устройстве.'); }
  canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onEnd); canvas.addEventListener('pointercancel', onEnd); canvas.addEventListener('lostpointercapture', onEnd); canvas.addEventListener('webglcontextlost', lost);
  resize();
  return {
    update,
    cameraPose(){return [...perspective.position.toArray(),...controls.target.toArray()];},
    restoreCamera(pose:number[]){if(pose.length!==6||!pose.every(n=>Number.isFinite(n)&&Math.abs(n)<100))return;perspective.position.fromArray(pose);controls.target.fromArray(pose,3);controls.update();draw();},
    setEvening(enabled:boolean){evening=enabled;sun.color.set(enabled?'#ffbd80':'#fff2dd');sun.intensity=enabled?1.0:2.6;windowFill.color.set(enabled?'#ffd298':'#fff4df');windowFill.intensity=enabled?3.0:.65;scene.environmentIntensity=enabled?.32:.65;renderer.toneMappingExposure=enabled?.88:1;refreshAfterResourceChange();},
    editorialCamera(view:'entrance'|'seated'|'detail'){
      const chosen=state.items.find(i=>i.id===state.selected)||state.items[0],p=chosen&&state.products.find(p=>p.id===chosen.productId);
      const w=state.room.width,d=state.room.depth;
      if(view==='detail'&&chosen&&p){const distance=Math.max(.55,Math.min(2,p.widthM*.85));perspective.position.set(chosen.x+distance*.66,Math.max(.48,p.heightM*.92),chosen.z+distance);controls.target.set(chosen.x,p.heightM*.57,chosen.z)}
      else {perspective.position.set((view==='seated'?-.29:.29)*w,view==='seated'?1.12:1.53,d*.5-.13);controls.target.set((chosen?.x||0)*.54,.75,(chosen?.z||0)*.70-.15)}
      controls.update();draw();
    },
    resetPlanView() { top.zoom = 1; top.position.set(0, 14, 0); top.updateProjectionMatrix(); draw(); },
    showRoomOverview() { if (state.view === 'perspective') configureCamera(true); },
    showInside() {
      if (state.view !== 'perspective') return false;
      const { width, depth } = state.room;
      const positions = [
        { x: width * 0.3, z: depth / 2 - 0.3 },
        { x: -width * 0.3, z: depth / 2 - 0.3 },
        { x: 0, z: depth / 2 - 0.3 },
      ];
      const position = positions.find(point => state.items.every(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (!product) return true;
        const half = footprint(product, item.rotation);
        return Math.abs(item.x - point.x) >= half.x + 0.2 || Math.abs(item.z - point.z) >= half.z + 0.2;
      }));
      if (!position) return false;
      const selected = state.items.find(item => item.id === state.selected);
      perspective.position.set(position.x, 1.45, position.z);
      controls.target.set(selected?.x ?? 0, 0.75, selected?.z ?? 0);
      controls.update(); draw();
      return true;
    },
    dispose() {
      destroyed = true; cancelAnimationFrame(frame); cancelAnimationFrame(resourceFrame); observer.disconnect(); controls.removeEventListener('change', draw); controls.dispose();
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onEnd); canvas.removeEventListener('pointercancel', onEnd); canvas.removeEventListener('lostpointercapture', onEnd); canvas.removeEventListener('webglcontextlost', lost);
      if (highlight) { highlight.geometry.dispose(); (highlight.material as THREE.Material).dispose(); }
      architecture.children.forEach(disposeGroup); instances.forEach(group => { const styling=group.getObjectByName('room-styling');if(styling)disposeGroup(styling); const shadow = group.children[0] as THREE.Mesh; shadow?.geometry?.dispose(); (shadow?.material as THREE.Material | undefined)?.dispose(); });
      cached.forEach(promise => { void promise.then(disposeGroup).catch(() => {}); }); if (plant) disposeGroup(plant); if (decor) disposeGroup(decor); if (bookshelf) disposeGroup(bookshelf); if (pendant) disposeGroup(pendant); if (wallPicture) disposeGroup(wallPicture); shadowTexture.dispose(); wallFadeTexture.dispose(); wood?.dispose(); normal?.dispose(); environment?.dispose(); rugTexture?.dispose(); rugNormal?.dispose(); plaster?.dispose(); linen?.dispose(); linenNormal?.dispose(); garden?.dispose(); basis.dispose(); renderer.dispose();
    },
  };
}
