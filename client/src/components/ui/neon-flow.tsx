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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const tubesRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const initTubes = async () => {
      if (!canvasRef.current) return;

      try {
        const canvas = canvasRef.current;

        const origAddEventListener = canvas.addEventListener.bind(canvas);
        const blockedEvents = new Set(['mousemove', 'mousedown', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointermove', 'pointerup', 'click']);
        canvas.addEventListener = function(type: string, listener: any, options?: any) {
          if (blockedEvents.has(type)) return;
          origAddEventListener(type, listener, options);
        } as any;

        const origDocAdd = document.addEventListener.bind(document);
        const docListeners: Array<{ type: string; listener: any; options?: any }> = [];
        document.addEventListener = function(type: string, listener: any, options?: any) {
          if (blockedEvents.has(type)) {
            docListeners.push({ type, listener, options });
            return;
          }
          origDocAdd(type, listener, options);
        } as any;

        const origWinAdd = window.addEventListener.bind(window);
        const winListeners: Array<{ type: string; listener: any; options?: any }> = [];
        window.addEventListener = function(type: string, listener: any, options?: any) {
          if (blockedEvents.has(type)) {
            winListeners.push({ type, listener, options });
            return;
          }
          origWinAdd(type, listener, options);
        } as any;

        // @ts-ignore
        const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
        const TubesCursor = module.default;

        if (!mounted) {
          document.addEventListener = origDocAdd;
          window.addEventListener = origWinAdd;
          return;
        }

        const app = TubesCursor(canvas, {
          tubes: {
            count: 8,
            radius: 0.08,
            colors: PURPLE_PALETTE.colors,
            lights: {
              intensity: 450,
              colors: PURPLE_PALETTE.lights
            }
          },
          renderer: {
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          },
          mouse: {
            disabled: true,
            lerp: 0
          },
          cursor: {
            enabled: false
          }
        });

        document.addEventListener = origDocAdd;
        window.addEventListener = origWinAdd;

        if (app && app.mouse) {
          Object.defineProperty(app.mouse, 'x', { get: () => 0, set: () => {}, configurable: true });
          Object.defineProperty(app.mouse, 'y', { get: () => 0, set: () => {}, configurable: true });
          if ('lerpX' in app.mouse) {
            Object.defineProperty(app.mouse, 'lerpX', { get: () => 0, set: () => {}, configurable: true });
            Object.defineProperty(app.mouse, 'lerpY', { get: () => 0, set: () => {}, configurable: true });
          }
        }

        tubesRef.current = app;
        setIsLoaded(true);

        const handleResize = () => {
          if (app && app.resize) app.resize();
        };

        window.addEventListener('resize', handleResize);

        cleanup = () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (error) {
        console.error("Failed to load Tubes:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-black pointer-events-none", className)}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block pointer-events-none"
        style={{ 
          opacity: isLoaded ? 0.8 : 0,
          transition: 'opacity 0.3s ease-out',
          filter: 'contrast(1.1) brightness(1.1)',
          contain: 'strict',
          touchAction: 'none',
          userSelect: 'none'
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
