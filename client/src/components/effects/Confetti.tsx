import { memo, useEffect, useState, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  duration: number;
  shape: 'square' | 'circle' | 'triangle';
}

interface ConfettiProps {
  active: boolean;
  count?: number;
  colors?: string[];
  duration?: number;
  spread?: number;
  onComplete?: () => void;
}

const SHAPES = ['square', 'circle', 'triangle'] as const;
const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
  '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
  '#FF9F43', '#EE5A24', '#00D2D3', '#54A0FF',
];

export const Confetti = memo(function Confetti({
  active,
  count = 50,
  colors = DEFAULT_COLORS,
  duration = 3000,
  spread = 400,
  onComplete,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active && typeof window !== 'undefined') {
      const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * spread,
        y: -(Math.random() * 200 + 100),
        rotation: Math.random() * 720 - 360,
        scale: Math.random() * 0.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        duration: duration / 1000 + Math.random() * 0.5,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration + 500);

      return () => clearTimeout(timer);
    }
  }, [active, count, colors, duration, spread, onComplete]);

  const renderShape = useCallback((shape: string, color: string) => {
    switch (shape) {
      case 'circle':
        return <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />;
      case 'triangle':
        return (
          <div 
            className="w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: `10px solid ${color}`,
            }}
          />
        );
      default:
        return <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />;
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {pieces.map((piece) => (
          <m.div
            key={piece.id}
            initial={{ 
              x: 0, 
              y: -20, 
              opacity: 1, 
              scale: 0,
              rotate: 0,
            }}
            animate={{ 
              x: piece.x, 
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
              opacity: [1, 1, 0],
              scale: piece.scale,
              rotate: piece.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute top-1/4"
          >
            {renderShape(piece.shape, piece.color)}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback(() => {
    setIsActive(true);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
  }, []);

  return { isActive, trigger, reset };
}
