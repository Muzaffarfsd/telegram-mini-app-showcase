import * as THREE from 'three';

function physicalModel(source: THREE.Object3D, widthM: number) {
  const model = source.clone(true),
    bounds = new THREE.Box3().setFromObject(model),
    size = bounds.getSize(new THREE.Vector3()),
    center = bounds.getCenter(new THREE.Vector3());
  if (!(size.x > 0 && widthM > 0)) throw Error('Invalid dimensions');
  const group = new THREE.Group(),
    scale = widthM / size.x;
  group.add(model);
  group.scale.setScalar(scale);
  group.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  const anchor = new THREE.Group();
  anchor.add(group);
  return anchor;
}
export async function quickLook(source: THREE.Object3D, widthM: number) {
  const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');
  const scene = new THREE.Scene();
  scene.add(physicalModel(source, widthM));
  const file = await new USDZExporter().parseAsync(scene, { maxTextureSize: 1024 });
  return URL.createObjectURL(new Blob([new Uint8Array(file).buffer], { type: 'model/vnd.usdz+zip' }));
}
export async function placeInAR(session: XRSession, source: THREE.Object3D, widthM: number) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera();
  const model = physicalModel(source, widthM);
  model.visible = false;
  scene.add(model, new THREE.HemisphereLight(0xffffff, 0x928575, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(1, 3, 2);
  scene.add(sun);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.085, 0.099, 40).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xf7f5da })
  );
  ring.matrixAutoUpdate = false;
  ring.visible = false;
  scene.add(ring);
  let hits: XRHitTestSource | undefined;
  const put = () => {
    if (!ring.visible) return;
    model.visible = true;
    model.position.setFromMatrixPosition(ring.matrix);
  };
  const end = () => {
    renderer.setAnimationLoop(null);
    session.removeEventListener('select', put);
    hits?.cancel();
    ring.geometry.dispose();
    ring.material.dispose();
    renderer.dispose();
  };
  session.addEventListener('end', end, { once: true });
  session.addEventListener('select', put);
  try {
    await renderer.xr.setSession(session);
    const viewer = await session.requestReferenceSpace('viewer');
    hits = await session.requestHitTestSource?.({ space: viewer });
    if (!hits) throw Error('Surface detection unavailable');
    renderer.setAnimationLoop((_time, frame) => {
      const space = renderer.xr.getReferenceSpace();
      if (frame && space && hits) {
        const hit = frame.getHitTestResults(hits)[0]?.getPose(space);
        ring.visible = !!hit;
        if (hit) ring.matrix.fromArray(hit.transform.matrix);
      }
      renderer.render(scene, camera);
    });
  } catch (error) {
    await session.end().catch(() => {});
    throw error;
  }
}
