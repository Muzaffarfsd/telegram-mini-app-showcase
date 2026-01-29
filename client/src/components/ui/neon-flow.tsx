import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";

/**
 * Premium Neon Tubes Background - 2026 Edition
 * High-performance WebGL implementation with dynamic color shifting
 * and professional interaction model.
 */

const PREDEFINED_PALETTES = [
  { colors: ["#8B5CF6", "#6D28D9", "#4C1D95"], lights: ["#A78BFA", "#8B5CF6", "#7C3AED"] }, // Purple
  { colors: ["#10B981", "#059669", "#064E3B"], lights: ["#34D399", "#10B981", "#059669"] }, // Emerald
  { colors: ["#3B82F6", "#2563EB", "#1E40AF"], lights: ["#60A5FA", "#3B82F6", "#2563EB"] }, // Blue
  { colors: ["#F59E0B", "#D97706", "#B45309"], lights: ["#FBBF24", "#F59E0B", "#D97706"] }, // Amber
  { colors: ["#EF4444", "#DC2626", "#B91C1C"], lights: ["#F87171", "#EF4444", "#DC2626"] }, // Red
  { colors: ["#EC4899", "#DB2777", "#9D174D"], lights: ["#F472B6", "#EC4899", "#DB2777"] }, // Pink
  { colors: ["#06B6D4", "#0891B2", "#155E75"], lights: ["#22D3EE", "#06B6D4", "#0891B2"] }, // Cyan
];

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
  tubeColorVersion?: number;
}

export function TubesBackground({ 
  children, 
  className,
  enableClickInteraction = false,
  tubeColorVersion = 0
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const tubesRef = useRef<any>(null);
  const paletteIndexRef = useRef(0);

  // Initialize WebGL Tubes
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

        // Configuration for professional, high-quality look
        const app = TubesCursor(canvasRef.current, {
          tubes: {
            count: 8,           // More tubes for depth
            radius: 0.08,        // Thinner, more elegant lines
            colors: PREDEFINED_PALETTES[0].colors,
            lights: {
              intensity: 450,    // Higher intensity for neon pop
              colors: PREDEFINED_PALETTES[0].lights
            }
          },
          renderer: {
            antialias: true,
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
        console.error("Failed to load Premium Tubes:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  // Professional Color Transition Logic
  useEffect(() => {
    if (isLoaded && tubesRef.current && tubesRef.current.tubes) {
      // Rotate through predefined professional palettes
      paletteIndexRef.current = (paletteIndexRef.current + 1) % PREDEFINED_PALETTES.length;
      const palette = PREDEFINED_PALETTES[paletteIndexRef.current];
      
      // Smoothly update colors via the internal engine
      tubesRef.current.tubes.setColors(palette.colors);
      tubesRef.current.tubes.setLightsColors(palette.lights);
    }
  }, [isLoaded, tubeColorVersion]);

  return (
    <div 
      className={cn("relative w-full h-full overflow-hidden tubes-container bg-[#000000]", className)}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block opacity-80"
        style={{ touchAction: 'none', filter: 'contrast(1.1) brightness(1.1)' }}
      />
      
      {/* Subtle depth overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      <div className="absolute inset-0 pointer-events-none backdrop-blur-[1px] opacity-30" />
      
      <div className="relative z-10 w-full h-full">
        <div className="w-full h-full pointer-events-none">
          <div className="pointer-events-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TubesBackground;
