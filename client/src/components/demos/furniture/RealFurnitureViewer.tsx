import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus, RotateCcw } from 'lucide-react';
import './RealFurnitureViewer.css';

type Props = { modelUrl: string; posterUrl: string; name: string; ru: boolean; backgrounds?: readonly string[] };
type ViewerControls = { orbit: (horizontal: number, vertical: number) => void; zoom: (factor: number) => void; reset: () => void };

/** Product-only 3D inspection; the separate room planner handles placement. */
export default function RealFurnitureViewer({ modelUrl, posterUrl, name, ru }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef<ViewerControls | null>(null);
  const pointer = useRef<{ id: number; x: number; y: number; dragging: boolean; touch: boolean } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    setStatus('loading');
    void Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/libs/meshopt_decoder.module.js'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
    ]).then(async ([THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }]) => {
      if (cancelled || !canvas.current) return;
      const element = canvas.current;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: element, antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch {
        if (!cancelled) setStatus('unavailable');
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.64;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.VSMShadowMap;
      const scene = new THREE.Scene();
      const environment = new RoomEnvironment();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(environment, 0.04);
      scene.environment = env.texture;
      scene.add(new THREE.HemisphereLight(0xffffff, 0xaaa6a0, 0.55));
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(-1, 8, 1.5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -4;
      key.shadow.camera.right = 4;
      key.shadow.camera.top = 4;
      key.shadow.camera.bottom = -4;
      key.shadow.camera.near = 0.1;
      key.shadow.camera.far = 16;
      key.shadow.bias = -0.0002;
      key.shadow.normalBias = 0.02;
      key.shadow.radius = 18;
      key.shadow.blurSamples = 12;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.25);
      fill.position.set(4, 3, -3);
      scene.add(fill);
      const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
      // Both shadow layers are transparent. Render the cast shadow first and
      // avoid depth writes so it cannot clip the soft contact cue above it.
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.14, depthWrite: false }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      floor.renderOrder = 1;
      scene.add(floor);
      let disposed = false;
      let raf = 0;
      let targetY = 0;
      let radius = 1;
      let azimuth = -0.35;
      let polar = Math.PI * 0.40;
      let zoom = 1;
      const disposeObject = (object: InstanceType<typeof THREE.Object3D>) => {
        object.traverse(item => {
          if (!(item instanceof THREE.Mesh)) return;
          item.geometry.dispose();
          const materials = Array.isArray(item.material) ? item.material : [item.material];
          materials.forEach(material => {
            for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
            material.dispose();
          });
        });
      };
      const draw = () => {
        if (disposed) return;
        const width = Math.max(1, element.clientWidth);
        const height = Math.max(1, element.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // Leave room for the controls below the model, including tall chairs.
        camera.setViewOffset(width, height, 0, height * 0.055, width, height);
        camera.updateProjectionMatrix();
        const verticalFov = THREE.MathUtils.degToRad(camera.fov);
        const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
        const distance = radius / Math.sin(Math.min(verticalFov, horizontalFov) / 2) * 1.05 / zoom;
        camera.position.set(
          distance * Math.sin(polar) * Math.sin(azimuth),
          targetY + distance * Math.cos(polar),
          distance * Math.sin(polar) * Math.cos(azimuth)
        );
        camera.lookAt(0, targetY, 0);
        renderer.render(scene, camera);
      };
      const resize = new ResizeObserver(draw);
      resize.observe(element);
      const contextLost = (event: Event) => { event.preventDefault(); if (!disposed) setStatus('unavailable'); };
      element.addEventListener('webglcontextlost', contextLost);
      cleanup = () => {
        disposed = true;
        cancelAnimationFrame(raf);
        resize.disconnect();
        element.removeEventListener('webglcontextlost', contextLost);
        disposeObject(scene);
        env.dispose();
        pmrem.dispose();
        environment.dispose();
        renderer.dispose();
      };
      if (cancelled) { cleanup(); return; }
      try {
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        const gltf = await loader.loadAsync(modelUrl);
        if (cancelled || disposed) { disposeObject(gltf.scene); return; }
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        if (![size.x, size.y, size.z].every(Number.isFinite) || Math.max(size.x, size.y, size.z) <= 0) {
          disposeObject(model);
          throw new Error('Invalid model bounds');
        }
        const scale = 2.4 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
        model.traverse(item => { if (item instanceof THREE.Mesh) item.castShadow = true; });
        scene.add(model);
        // A soft studio grounding cue avoids hard, aliased shadow-map artifacts on mobile.
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = shadowCanvas.height = 256;
        const shadowContext = shadowCanvas.getContext('2d');
        if (shadowContext) {
          const gradient = shadowContext.createRadialGradient(128, 128, 0, 128, 128, 128);
          gradient.addColorStop(0, 'rgba(24, 22, 20, 0.20)');
          gradient.addColorStop(0.5, 'rgba(24, 22, 20, 0.09)');
          gradient.addColorStop(1, 'rgba(24, 22, 20, 0)');
          shadowContext.fillStyle = gradient;
          shadowContext.fillRect(0, 0, 256, 256);
          const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
          shadowTexture.colorSpace = THREE.SRGBColorSpace;
          const shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(size.x * scale * 1.5, size.z * scale * 1.5),
            new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
          );
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.y = 0.005;
          shadow.renderOrder = 2;
          scene.add(shadow);
        }
        targetY = size.y * scale / 2;
        radius = Math.max(0.4, size.length() * scale / 2);
        controls.current = {
          orbit: (horizontal, vertical) => { azimuth += horizontal; polar = THREE.MathUtils.clamp(polar + vertical, 0.12, Math.PI - 0.12); draw(); },
          zoom: factor => { zoom = THREE.MathUtils.clamp(zoom * factor, 0.7, 2); draw(); },
          reset: () => { azimuth = -0.35; polar = Math.PI * 0.40; zoom = 1; draw(); },
        };
        draw();
        raf = requestAnimationFrame(() => { if (!disposed) setStatus('ready'); });
      } catch {
        if (!disposed) setStatus('unavailable');
      }
    }).catch(() => { if (!cancelled) setStatus('unavailable'); });
    return () => { cancelled = true; controls.current = null; pointer.current = null; cleanup(); };
  }, [modelUrl]);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const active = pointer.current;
    if (!active || active.id !== event.pointerId) return;
    const dx = event.clientX - active.x, dy = event.clientY - active.y;
    if (!active.dragging) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 7) return;
      // Vertical touch gestures belong to the page. Start 3D interaction with a horizontal swipe.
      if (active.touch && Math.abs(dy) > Math.abs(dx)) { pointer.current = null; return; }
      active.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    controls.current?.orbit(-dx * 0.012, dy * 0.012);
    active.x = event.clientX;
    active.y = event.clientY;
  };
  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (status === 'ready' && event.isPrimary && event.button === 0) {
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false, touch: event.pointerType !== 'mouse' };
    }
  };
  const button = (label: string, icon: ReactNode, action: () => void) => (
    <button type="button" aria-label={label} title={label} onClick={action}>{icon}</button>
  );
  return (
    <section className="rfv" aria-label={ru ? `3D-модель: ${name}` : `3D model: ${name}`}>
      <div className="rfv-stage">
        <div className="rfv-drag" onPointerDown={start} onPointerMove={move} onPointerCancel={() => { pointer.current = null; }} onPointerUp={() => { pointer.current = null; }} onLostPointerCapture={() => { pointer.current = null; }}>
          {status !== 'ready' && <img className="rfv-poster" src={posterUrl} alt="" />}
          <canvas ref={canvas} aria-hidden="true" style={{ opacity: status === 'ready' ? 1 : 0 }} />
        </div>
        <span className="rfv-badge">{ru ? 'ОБЗОР 360°' : '360° VIEW'}</span>
        {status === 'ready' && <div className="rfv-controls" role="group" aria-label={ru ? 'Управление 3D' : '3D controls'}>
          {button(ru ? 'Повернуть влево' : 'Rotate left', <ChevronLeft size={19}/>, () => controls.current?.orbit(-Math.PI / 6, 0))}
          {button(ru ? 'Повернуть вправо' : 'Rotate right', <ChevronRight size={19}/>, () => controls.current?.orbit(Math.PI / 6, 0))}
          <span className="rfv-divider" />
          {button(ru ? 'Посмотреть сверху' : 'View from above', <ChevronUp size={19}/>, () => controls.current?.orbit(0, -Math.PI / 9))}
          {button(ru ? 'Посмотреть снизу' : 'View from below', <ChevronDown size={19}/>, () => controls.current?.orbit(0, Math.PI / 9))}
          <span className="rfv-divider" />
          {button(ru ? 'Уменьшить' : 'Zoom out', <Minus size={18}/>, () => controls.current?.zoom(0.8))}
          {button(ru ? 'Увеличить' : 'Zoom in', <Plus size={18}/>, () => controls.current?.zoom(1.25))}
          {button(ru ? 'Вернуть исходный вид' : 'Reset view', <RotateCcw size={17}/>, () => controls.current?.reset())}
        </div>}
        {status === 'unavailable' && <span className="rfv-status" role="status">{ru ? '3D недоступно. Показываем фотографию.' : '3D unavailable. Showing a photograph.'}</span>}
      </div>
      <p>{ru ? 'Проведите влево или вправо, чтобы повернуть предмет. Масштаб и ракурс можно изменить кнопками.' : 'Swipe left or right to rotate the object. Use the buttons to change zoom and angle.'}</p>
    </section>
  );
}
