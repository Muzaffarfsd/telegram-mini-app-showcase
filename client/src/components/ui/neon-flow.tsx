import { useEffect, useRef, useState, memo } from 'react';
import { cn } from "@/lib/utils";

const PURPLE_PALETTE = { 
  colors: ["#8B5CF6", "#6D28D9", "#4C1D95"], 
  lights: ["#A78BFA", "#8B5CF6", "#7C3AED"] 
};

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const TubesBackground = memo(function TubesBackground({ 
  children, 
  className
}: TubesBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;pointer-events:none;';
    iframe.setAttribute('tabindex', '-1');
    iframe.setAttribute('aria-hidden', 'true');
    iframeRef.current = iframe;
    containerRef.current.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`<!DOCTYPE html>
<html><head><style>
  * { margin:0; padding:0; }
  html, body, canvas { width:100%; height:100%; display:block; background:#000; overflow:hidden; }
</style></head>
<body><canvas id="c"></canvas>
<script type="module">
  const canvas = document.getElementById('c');

  // Block ALL input events inside iframe
  const block = ['mousemove','mousedown','mouseup','touchstart','touchmove','touchend','pointerdown','pointermove','pointerup','click'];
  block.forEach(e => {
    document.addEventListener(e, ev => { ev.stopImmediatePropagation(); ev.preventDefault(); }, { capture: true, passive: false });
    window.addEventListener(e, ev => { ev.stopImmediatePropagation(); ev.preventDefault(); }, { capture: true, passive: false });
    canvas.addEventListener(e, ev => { ev.stopImmediatePropagation(); ev.preventDefault(); }, { capture: true, passive: false });
  });

  const mod = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
  const TubesCursor = mod.default;

  const app = TubesCursor(canvas, {
    tubes: { count: 8, radius: 0.08, colors: ${JSON.stringify(PURPLE_PALETTE.colors)}, lights: { intensity: 450, colors: ${JSON.stringify(PURPLE_PALETTE.lights)} } },
    renderer: { antialias: true, alpha: true, powerPreference: 'high-performance' },
    mouse: { disabled: true, lerp: 0 },
    cursor: { enabled: false }
  });

  if (app && app.mouse) {
    Object.defineProperty(app.mouse, 'x', { get: () => 0, set: () => {}, configurable: true });
    Object.defineProperty(app.mouse, 'y', { get: () => 0, set: () => {}, configurable: true });
    try {
      Object.defineProperty(app.mouse, 'lerpX', { get: () => 0, set: () => {}, configurable: true });
      Object.defineProperty(app.mouse, 'lerpY', { get: () => 0, set: () => {}, configurable: true });
    } catch(e) {}
  }

  window.parent.postMessage('tubes-loaded', '*');
<\/script></body></html>`);
    iframeDoc.close();

    const onMessage = (e: MessageEvent) => {
      if (e.data === 'tubes-loaded') setIsLoaded(true);
    };
    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
      if (iframeRef.current && containerRef.current) {
        containerRef.current.removeChild(iframeRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-black pointer-events-none", className)}>
      <div 
        ref={containerRef}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          opacity: isLoaded ? 0.8 : 0,
          transition: 'opacity 0.5s ease-out',
          filter: 'contrast(1.1) brightness(1.1)',
          contain: 'strict',
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
})

export default TubesBackground;
