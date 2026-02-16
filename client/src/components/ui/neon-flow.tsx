import { useEffect, useRef, useState, memo, useCallback } from 'react';
import { cn } from "@/lib/utils";

const COLORS = [
  'rgba(139, 92, 246, 0.6)',
  'rgba(109, 40, 217, 0.5)',
  'rgba(76, 29, 149, 0.4)',
  'rgba(167, 139, 250, 0.5)',
  'rgba(124, 58, 237, 0.45)',
  'rgba(139, 92, 246, 0.35)',
  'rgba(109, 40, 217, 0.3)',
  'rgba(167, 139, 250, 0.4)',
];

interface Tube {
  points: { x: number; y: number; vx: number; vy: number }[];
  color: string;
  width: number;
  speed: number;
  phase: number;
}

function createTube(w: number, h: number, color: string, index: number): Tube {
  const numPoints = 5;
  const points = [];
  const startX = (w / (COLORS.length + 1)) * (index + 1);
  const speed = 0.3 + Math.random() * 0.4;

  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: startX + (Math.random() - 0.5) * w * 0.3,
      y: (h / (numPoints - 1)) * i,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed * 0.3,
    });
  }

  return {
    points,
    color,
    width: 1.5 + Math.random() * 2,
    speed,
    phase: Math.random() * Math.PI * 2,
  };
}

function drawTube(ctx: CanvasRenderingContext2D, tube: Tube) {
  const { points, color, width } = tube;
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
  }

  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();

  ctx.strokeStyle = color.replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * 1.8})`);
  ctx.lineWidth = width * 0.4;
  ctx.stroke();
}

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const TubesBackground = memo(function TubesBackground({ 
  children, 
  className
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tubesRef = useRef<Tube[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    timeRef.current += 0.008;
    const t = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    for (const tube of tubesRef.current) {
      for (let i = 0; i < tube.points.length; i++) {
        const p = tube.points[i];
        const wave = Math.sin(t * tube.speed + tube.phase + i * 1.2) * 1.2;
        const drift = Math.cos(t * tube.speed * 0.7 + tube.phase + i * 0.8) * 0.6;

        p.x += wave + p.vx;
        p.y += drift + p.vy;

        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;
      }

      drawTube(ctx, tube);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      tubesRef.current = COLORS.map((color, i) =>
        createTube(rect.width, rect.height, color, i)
      );
    };

    resize();
    setIsLoaded(true);
    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-black pointer-events-none", className)}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block pointer-events-none"
        style={{ 
          opacity: isLoaded ? 0.8 : 0,
          transition: 'opacity 0.5s ease-out',
          filter: 'blur(1px) contrast(1.1) brightness(1.1)',
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
