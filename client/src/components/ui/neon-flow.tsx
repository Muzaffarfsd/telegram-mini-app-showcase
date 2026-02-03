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
        // @ts-ignore
        const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
        const TubesCursor = module.default;

        if (!mounted) return;

        const app = TubesCursor(canvasRef.current, {
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
        
        // Override mouse tracking - set fixed position
        if (app && app.mouse) {
          app.mouse.x = 0;
          app.mouse.y = 0;
        }

        tubesRef.current = app;
        setIsLoaded(true);

        const handleResize = () => {
          if (app && app.resize) app.resize();
        };

        window.addEventListener('resize', handleResize);
        
        // Block mouse events from reaching the library
        const blockMouseEvents = (e: MouseEvent) => {
          if (canvasRef.current && canvasRef.current.contains(e.target as Node)) {
            e.stopPropagation();
          }
        };
        
        // Freeze mouse position to center
        const freezeMouse = () => {
          if (app && app.mouse) {
            app.mouse.x = 0;
            app.mouse.y = 0;
            app.mouse.lerpX = 0;
            app.mouse.lerpY = 0;
          }
        };
        
        const freezeInterval = setInterval(freezeMouse, 16);
        
        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          clearInterval(freezeInterval);
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
