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
            count: 6,
            radius: 0.07,
            colors: PURPLE_PALETTE.colors,
            lights: {
              intensity: 400,
              colors: PURPLE_PALETTE.lights
            }
          },
          renderer: {
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance'
          }
        });

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
    <div className={cn("relative w-full h-full overflow-hidden bg-black", className)}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block pointer-events-none"
        style={{ 
          opacity: isLoaded ? 0.8 : 0,
          transition: 'opacity 0.3s ease-out',
          filter: 'contrast(1.1) brightness(1.1)',
          contain: 'strict'
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
