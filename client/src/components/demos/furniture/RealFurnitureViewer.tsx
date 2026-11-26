import { lockBackground } from './modalBackground';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus, RotateCcw, X } from 'lucide-react';
import './RealFurnitureViewer.css';

type Props = { modelUrl: string; dimensions?:readonly [number,number,number]; placement?:string; detailUrl?:string; posterUrl: string; name: string; ru: boolean; onClose: () => void; onPlaceInRoom?: () => void };
type ViewerControls = { orbit: (horizontal: number, vertical: number) => void; zoom: (factor: number) => void; reset: () => void; preset: (view: 'front' | 'side' | 'back' | 'top') => void };

/** Product-only 3D inspection; the separate room planner handles placement. */
export default function RealFurnitureViewer({ modelUrl, posterUrl, name, ru, dimensions, placement, detailUrl, onClose, onPlaceInRoom }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  const [portalHost] = useState(() => document.createElement('div'));
  const controls = useRef<ViewerControls | null>(null);
  const source=useRef<import('three').Object3D|null>(null),arSession=useRef<XRSession|null>(null);
  const [ar,setAR]=useState<'xr'|'apple'|null>(null),[nativeURL,setNativeURL]=useState(''),[arMessage,setARMessage]=useState(''),[detail,setDetail]=useState(false),[ruler,setRuler]=useState(false);
  useEffect(()=>{let live=true;if(dimensions&&placement!=='ceiling'&&placement!=='surface'){
    if(document.createElement('a').relList?.supports?.('ar'))setAR('apple');
    else navigator.xr?.isSessionSupported('immersive-ar').then(ok=>{if(live&&ok)setAR('xr')}).catch(()=>{});
  }return()=>{live=false;void arSession.current?.end().catch(()=>{})}},[dimensions,placement]);
  useEffect(()=>()=>{if(nativeURL)URL.revokeObjectURL(nativeURL)},[nativeURL]);
  async function openNative(){if(!source.current||!dimensions)return;try{if(ar==='xr'&&navigator.xr){const session=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['hit-test']});arSession.current=session;const {placeInAR}=await import('./productAR');await placeInAR(session,source.current,dimensions[0]);}
    else{setARMessage(ru?'Готовим модель…':'Preparing the model…');const {quickLook}=await import('./productAR');setNativeURL(await quickLook(source.current,dimensions[0]));setARMessage('')}}catch{setARMessage(ru?'Не удалось открыть AR. Предмет доступен в 3D и на плане.':'AR could not open. Use the 3D view or floor plan.')}}

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const [attempt, setAttempt] = useState(0);
  const [activeView, setActiveView] = useState<'front' | 'side' | 'back' | 'top' | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  // A separate portal keeps the viewer above the app shell, while preserving
  // the product page and its exact scroll position underneath it.
  useLayoutEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.getElementById('root');
    const oldOverflow = root?.style.overflow ?? '';
    document.body.appendChild(portalHost);
    const background = Array.from(document.body.children).filter(node => node !== portalHost);
    const release=lockBackground(background);
    if (root) root.style.overflow = 'hidden';
    close.current?.focus({ preventScroll: true });
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== 'Tab' || !dialog.current) return;
      const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled), summary, [tabindex="0"]')).filter(node => node.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      release();
      if (root) root.style.overflow = oldOverflow;
      portalHost.remove();
      const restoreTarget = previousFocus?.isConnected && previousFocus !== document.body && previousFocus !== document.documentElement
        ? previousFocus
        : document.querySelector<HTMLElement>('.fs-view-toggle');
      if (restoreTarget?.isConnected && !restoreTarget.closest('[inert]')) restoreTarget.focus({ preventScroll: true });
    };
  }, [portalHost]);

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
      let renderFrame = 0, readyFrame = 0;
      let width = 1, height = 1;
      let targetY = 0;
      let radius = 1;
      const firstAngle=/Westview|Frankie|Elvas/.test(name)?-.55:/Ian|Bristol|Table/.test(name)?.50:-.35;
      let azimuth = firstAngle;
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
      const drawNow = () => {
        if (disposed) return;
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
      const draw = () => {
        if (disposed || renderFrame) return;
        renderFrame = requestAnimationFrame(() => { renderFrame = 0; drawNow(); });
      };
      const resizeCanvas = () => {
        const nextWidth = Math.max(1, element.clientWidth), nextHeight = Math.max(1, element.clientHeight);
        if (nextWidth === width && nextHeight === height) return;
        width = nextWidth; height = nextHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        draw();
      };
      const resize = new ResizeObserver(resizeCanvas);
      resize.observe(element);
      resizeCanvas();
      const contextLost = (event: Event) => { event.preventDefault(); if (!disposed) setStatus('unavailable'); };
      element.addEventListener('webglcontextlost', contextLost);
      cleanup = () => {
        disposed = true;source.current=null;
        cancelAnimationFrame(renderFrame); cancelAnimationFrame(readyFrame);
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
        scene.add(model); source.current=model;
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
          zoom: factor => { zoom = THREE.MathUtils.clamp(zoom * factor, 0.7, 2.5); draw(); },
          reset: () => { azimuth = firstAngle; polar = Math.PI * 0.40; zoom = 1; draw(); },
          preset: view => { azimuth = view === 'side' ? -Math.PI / 2 : view === 'back' ? Math.PI : 0; polar = view === 'top' ? 0.12 : Math.PI * 0.40; zoom = 1; draw(); },
        };
        draw();
        readyFrame = requestAnimationFrame(() => { if (!disposed) setStatus('ready'); });
      } catch {
        if (!disposed) setStatus('unavailable');
      }
    }).catch(() => { if (!cancelled) setStatus('unavailable'); });
    return () => { cancelled = true; controls.current = null; pointers.current.clear(); cleanup(); };
  }, [modelUrl, attempt]);

  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (status !== 'ready' || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const points = Array.from(pointers.current.entries());
    if (points.length === 1) {
      setActiveView(null);
      controls.current?.orbit(-(event.clientX - previous.x) * 0.012, (event.clientY - previous.y) * 0.012);
    } else {
      const other = points.find(([id]) => id !== event.pointerId)?.[1];
      if (other) {
        const before = Math.hypot(previous.x - other.x, previous.y - other.y);
        const after = Math.hypot(event.clientX - other.x, event.clientY - other.y);
        if (before > 4 && after > 4) controls.current?.zoom(after / before);
      }
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  };
  const end = (event: PointerEvent<HTMLDivElement>) => { pointers.current.delete(event.pointerId); };
  const keyView = (event: KeyboardEvent<HTMLDivElement>) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => controls.current?.orbit(-Math.PI / 12, 0),
      ArrowRight: () => controls.current?.orbit(Math.PI / 12, 0),
      ArrowUp: () => controls.current?.orbit(0, -Math.PI / 12),
      ArrowDown: () => controls.current?.orbit(0, Math.PI / 12),
      '+': () => controls.current?.zoom(1.2), '=': () => controls.current?.zoom(1.2),
      '-': () => controls.current?.zoom(1 / 1.2), '0': () => controls.current?.reset(),
    };
    if (status === 'ready' && actions[event.key]) { event.preventDefault(); if (event.key.startsWith('Arrow') || event.key === '0') setActiveView(null); actions[event.key](); }
  };
  return createPortal(
    <section ref={dialog} className="rfv" role="dialog" aria-modal="true" aria-label={ru ? `3D-модель: ${name}` : `3D model: ${name}`}>
      <header className="rfv-header">
        <div><span>{ru ? 'ОБЗОР ПРЕДМЕТА / 360°' : 'PRODUCT VIEW / 360°'}</span><h2>{name}</h2></div>
        <button ref={close} type="button" className="rfv-close" onClick={onClose} aria-label={ru ? 'Закрыть 3D-обзор' : 'Close 3D view'}><X size={22} /></button>
      </header>
      <div className="rfv-tools">{dimensions&&<button type="button" aria-pressed={ruler} onClick={()=>setRuler(v=>!v)}>{ru?'Размеры':'Dimensions'}</button>}{detailUrl&&<button type="button" aria-pressed={detail} onClick={()=>setDetail(v=>!v)}>{ru?'Деталь на фото':'Photo detail'}</button>}{ar&&status==='ready'&&(nativeURL?<a rel="ar" href={nativeURL}><img src={posterUrl} alt=""/>{ru?'Открыть в AR':'Open in AR'}</a>:<button type="button" onClick={openNative}>{ru?'Примерить в AR':'View in AR'}</button>)}</div>{arMessage&&<p role="status">{arMessage}</p>}
      <div className="rfv-stage">
        {detail&&detailUrl&&<button className="rfv-detail-photo" onClick={()=>setDetail(false)} aria-label={ru?'Вернуться к модели':'Return to model'}><img src={detailUrl} alt={ru?'Фотография детали товара':'Product detail photograph'}/></button>}
        {ruler&&dimensions&&<div className="rfv-dimensions">{ru?'Ш × Г × В':'W × D × H'} · {dimensions.map(v=>Math.round(v*100)).join(' × ')} {ru?'см':'cm'} · ≈</div>}
        <div className="rfv-drag" tabIndex={status === 'ready' ? 0 : -1} role="group" aria-label={ru ? '3D-модель. Стрелки вращают, плюс и минус меняют масштаб.' : '3D model. Arrow keys rotate; plus and minus zoom.'} onKeyDown={keyView} onPointerDown={start} onPointerMove={move} onPointerCancel={end} onPointerUp={end} onLostPointerCapture={end}>
          {status !== 'ready' && <img className="rfv-poster" src={posterUrl} alt="" />}
          <canvas ref={canvas} aria-hidden="true" style={{ opacity: status === 'ready' ? 1 : 0 }} />
        </div>
        {status === 'loading' && <p className="rfv-status" role="status">{ru ? 'Загружаем 3D-модель…' : 'Loading 3D model…'}</p>}
        {status === 'unavailable' && <div className="rfv-status" role="status"><span>{ru ? '3D недоступно. Показываем фотографию.' : '3D unavailable. Showing a photograph.'}</span><button type="button" onClick={() => setAttempt(value => value + 1)}>{ru ? 'Повторить' : 'Try again'}</button></div>}
        {status === 'ready' && <div className="rfv-zoom" role="group" aria-label={ru ? 'Масштаб' : 'Zoom'}>
          <button type="button" onClick={() => controls.current?.zoom(1.25)} aria-label={ru ? 'Увеличить' : 'Zoom in'}><Plus size={18} /></button>
          <button type="button" onClick={() => controls.current?.zoom(0.8)} aria-label={ru ? 'Уменьшить' : 'Zoom out'}><Minus size={18} /></button>
        </div>}
      </div>
      <div className="rfv-footer">
        {status === 'ready' && <>
          <p className="rfv-hint">{ru ? 'Поверните одним пальцем · приблизьте двумя' : 'Drag to rotate · pinch to zoom'}</p>
          <div className="rfv-presets" role="group" aria-label={ru ? 'Быстрые ракурсы' : 'Quick views'}>
            <button type="button" aria-pressed={activeView === 'front'} onClick={() => { setActiveView('front'); controls.current?.preset('front'); }}>{ru ? 'Спереди' : 'Front'}</button>
            <button type="button" aria-pressed={activeView === 'side'} onClick={() => { setActiveView('side'); controls.current?.preset('side'); }}>{ru ? 'Сбоку' : 'Side'}</button>
            <button type="button" aria-pressed={activeView === 'back'} onClick={() => { setActiveView('back'); controls.current?.preset('back'); }}>{ru ? 'Сзади' : 'Back'}</button>
            <button type="button" aria-pressed={activeView === 'top'} onClick={() => { setActiveView('top'); controls.current?.preset('top'); }}>{ru ? 'Сверху' : 'Top'}</button>
          </div>
          <details className="rfv-precise"><summary>{ru ? 'Точное управление' : 'Precise controls'}</summary>
            <div className="rfv-controls" role="group" aria-label={ru ? 'Управление 3D' : '3D controls'}>
              <button type="button" onClick={() => { setActiveView(null); controls.current?.orbit(-Math.PI / 12, 0); }} aria-label={ru ? 'Повернуть влево' : 'Rotate left'}><ChevronLeft size={19} /></button>
              <button type="button" onClick={() => { setActiveView(null); controls.current?.orbit(Math.PI / 12, 0); }} aria-label={ru ? 'Повернуть вправо' : 'Rotate right'}><ChevronRight size={19} /></button>
              <button type="button" onClick={() => { setActiveView(null); controls.current?.orbit(0, -Math.PI / 12); }} aria-label={ru ? 'Посмотреть сверху' : 'View from above'}><ChevronUp size={19} /></button>
              <button type="button" onClick={() => { setActiveView(null); controls.current?.orbit(0, Math.PI / 12); }} aria-label={ru ? 'Посмотреть снизу' : 'View from below'}><ChevronDown size={19} /></button>
              <button type="button" onClick={() => { setActiveView(null); controls.current?.reset(); }} aria-label={ru ? 'Вернуть исходный вид' : 'Reset view'}><RotateCcw size={18} /></button>
            </div>
          </details>
        </>}
        {onPlaceInRoom && <button type="button" className="rfv-place" onClick={onPlaceInRoom}>{ru ? 'Разместить в комнате' : 'Place in a room'} <ArrowRight size={18} /></button>}
      </div>
    </section>, portalHost
  );
}
