import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import orb from '../assets/consultant/consultant-orb.webp';

type Props = { reaction: number; onReady: (ready: boolean) => void };

const vertexShader = `
  varying vec3 vLocalPosition;
  void main() {
    vLocalPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Project the original character artwork onto an actual sphere. Only the eye
// areas are gently compressed for blinking; the rest keeps the approved look.
const fragmentShader = `
  uniform sampler2D uArtwork;
  uniform float uBlinkLeft;
  uniform float uBlinkRight;
  varying vec3 vLocalPosition;

  vec4 blinkEye(vec4 base, vec2 uv, vec2 centre, float amount) {
    vec2 distanceFromEye = abs(uv - centre);
    float edgeX = 1.0 - smoothstep(0.047, 0.061, distanceFromEye.x);
    float edgeY = 1.0 - smoothstep(0.045, 0.068, distanceFromEye.y);
    float eyeArea = edgeX * edgeY;
    float scale = max(0.17, 1.0 - amount * 0.83);
    float sourceY = clamp(centre.y + (uv.y - centre.y) / scale, centre.y - 0.075, centre.y + 0.075);
    vec4 squinted = texture2D(uArtwork, vec2(uv.x, sourceY));
    return mix(base, squinted, eyeArea);
  }

  void main() {
    vec2 uv = vec2(0.5 + vLocalPosition.x * 0.3015, 0.53125 + vLocalPosition.y * 0.3015);
    vec4 colour = texture2D(uArtwork, uv);
    colour = blinkEye(colour, uv, vec2(0.405, 0.6015), uBlinkLeft);
    colour = blinkEye(colour, uv, vec2(0.584, 0.6015), uBlinkRight);
    gl_FragColor = colour;
    #include <colorspace_fragment>
  }
`;

const smoothPulse = (value: number, duration: number) => {
  if (value <= 0 || value >= duration) return 0;
  const phase = value / duration;
  return Math.sin(Math.PI * phase) ** 2;
};

export default function AIConsultantOrb3D({ reaction, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactionTimeRef = useRef(-1);

  useEffect(() => {
    if (reaction > 0) reactionTimeRef.current = performance.now();
  }, [reaction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
        stencil: false,
      });
    } catch {
      onReady(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.testid = 'consultant-orb-canvas';
    canvas.dataset.motion = 'paused';
    container.appendChild(canvas);

    let loaded = false;
    let disposed = false;
    let visible = false;
    let contextLost = false;
    let shaderFailed = false;
    let width = 0;
    let height = 0;
    let frame = 0;
    let previousFrame = 0;
    let elapsed = 0;
    let presented = false;
    let gesture = 0;
    let blinkLeft = 0;
    let blinkRight = 0;
    renderer.debug.onShaderError = () => {
      shaderFailed = true;
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
    camera.position.z = 5;
    const geometry = new THREE.SphereGeometry(1, 40, 32);
    const texture = new THREE.TextureLoader().load(
      orb,
      () => {
        if (disposed) return;
        loaded = true;
        startIfVisible();
      },
      undefined,
      () => {
        if (!disposed) onReady(false);
      },
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uArtwork: { value: texture },
        uBlinkLeft: { value: 0 },
        uBlinkRight: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    const character = new THREE.Mesh(geometry, material);
    character.position.y = 0.105;
    scene.add(character);

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousFrame = 0;
      canvas.dataset.motion = 'paused';
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed || contextLost || !loaded || !visible || document.hidden || !width || !height) return;
      if (!previousFrame || now - previousFrame >= 1000 / 30) {
        const delta = previousFrame ? Math.min((now - previousFrame) / 1000, 0.1) : 1 / 30;
        elapsed += delta;
        previousFrame = now;
        const idleGesture = smoothPulse((elapsed % 9.5) - 2.2, 1.8);
        const touchGesture =
          reactionTimeRef.current < 0 ? 0 : smoothPulse((now - reactionTimeRef.current) / 1000, 1.7);
        const smoothing = 1 - Math.exp(-9 * delta);
        gesture += (Math.max(idleGesture, touchGesture) - gesture) * smoothing;
        blinkLeft +=
          (Math.max(smoothPulse((elapsed % 9.5) - 2.52, 0.75), touchGesture * 0.88) - blinkLeft) * smoothing;
        blinkRight +=
          (Math.max(smoothPulse((elapsed % 9.5) - 2.6, 0.75), touchGesture * 0.94) - blinkRight) * smoothing;
        character.position.y = 0.105 + Math.sin(elapsed * 0.85) * 0.035 + gesture * 0.035;
        character.rotation.y = Math.sin(elapsed * 0.55) * 0.045 + gesture * 0.065;
        character.rotation.z = Math.sin(elapsed * 0.5) * 0.014 + gesture * 0.065;
        character.scale.setScalar(1 + gesture * 0.035);
        material.uniforms.uBlinkLeft.value = blinkLeft;
        material.uniforms.uBlinkRight.value = blinkRight;
        try {
          renderer.render(scene, camera);
          if (shaderFailed) {
            onReady(false);
            stop();
            return;
          }
          if (!presented) {
            presented = true;
            onReady(true);
          }
        } catch {
          onReady(false);
          return;
        }
      }
      frame = requestAnimationFrame(render);
    };
    function startIfVisible() {
      if (!frame && loaded && visible && !document.hidden && !contextLost && width && height && !disposed) {
        canvas.dataset.motion = 'running';
        frame = requestAnimationFrame(render);
      }
    }
    const resize = () => {
      const bounds = container.getBoundingClientRect();
      width = Math.round(bounds.width);
      height = Math.round(bounds.height);
      if (!width || !height) return;
      const viewHeight = 3.32;
      const aspect = width / height;
      camera.left = (-viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      startIfVisible();
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else startIfVisible();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      presented = false;
      onReady(false);
      stop();
    };
    const onContextRestored = () => {
      contextLost = false;
      shaderFailed = false;
      startIfVisible();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);
    document.addEventListener('visibilitychange', onVisibility);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    resizeObserver?.observe(container);
    window.addEventListener('resize', resize);
    const intersectionObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting;
              if (visible) {
                resize();
                startIfVisible();
              } else stop();
            },
            { threshold: 0.05 },
          );
    if (intersectionObserver) intersectionObserver.observe(container);
    else visible = true;
    resize();

    return () => {
      disposed = true;
      stop();
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      onReady(false);
    };
  }, [onReady]);

  return <div ref={containerRef} className="ai6-orb-canvas" />;
}
