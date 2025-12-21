import { memo, useRef, useState, useCallback, type ReactNode } from 'react';
import { m, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';

interface SwipeNavigationProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
  leftIndicator?: ReactNode;
  rightIndicator?: ReactNode;
  disabled?: boolean;
}

export const SwipeNavigation = memo(function SwipeNavigation({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className = '',
  leftIndicator,
  rightIndicator,
  disabled = false,
}: SwipeNavigationProps) {
  const haptic = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-threshold, 0, threshold], [1, 0, 1]);
  const leftOpacity = useTransform(x, [0, threshold], [0, 1]);
  const rightOpacity = useTransform(x, [-threshold, 0], [1, 0]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const currentX = x.get();
    
    if (currentX > threshold && onSwipeRight) {
      haptic.medium();
      onSwipeRight();
    } else if (currentX < -threshold && onSwipeLeft) {
      haptic.medium();
      onSwipeLeft();
    }
  }, [x, threshold, onSwipeLeft, onSwipeRight, haptic]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden touch-pan-y ${className}`}
    >
      {leftIndicator && (
        <m.div 
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
          style={{ opacity: leftOpacity }}
        >
          {leftIndicator}
        </m.div>
      )}
      
      {rightIndicator && (
        <m.div 
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
          style={{ opacity: rightOpacity }}
        >
          {rightIndicator}
        </m.div>
      )}

      <m.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="cursor-grab active:cursor-grabbing"
      >
        {children}
      </m.div>
    </div>
  );
});

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: { icon: ReactNode; color: string; label: string };
  rightAction?: { icon: ReactNode; color: string; label: string };
  className?: string;
}

export const SwipeableCard = memo(function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = '',
}: SwipeableCardProps) {
  const haptic = useHaptic();
  const x = useMotionValue(0);
  const [isRevealed, setIsRevealed] = useState<'left' | 'right' | null>(null);
  
  const leftBgOpacity = useTransform(x, [0, 80], [0, 1]);
  const rightBgOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = useCallback(() => {
    const currentX = x.get();
    
    if (currentX > 80 && rightAction) {
      setIsRevealed('right');
      haptic.light();
    } else if (currentX < -80 && leftAction) {
      setIsRevealed('left');
      haptic.light();
    } else {
      setIsRevealed(null);
    }
  }, [x, leftAction, rightAction, haptic]);

  const executeAction = useCallback((side: 'left' | 'right') => {
    haptic.medium();
    if (side === 'left' && onSwipeLeft) {
      onSwipeLeft();
    } else if (side === 'right' && onSwipeRight) {
      onSwipeRight();
    }
    setIsRevealed(null);
  }, [onSwipeLeft, onSwipeRight, haptic]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {leftAction && (
        <m.div 
          className="absolute inset-y-0 right-0 w-20 flex items-center justify-center"
          style={{ 
            opacity: leftBgOpacity,
            backgroundColor: leftAction.color,
          }}
          onClick={() => executeAction('left')}
        >
          <div className="text-white text-center">
            {leftAction.icon}
            <span className="text-xs block mt-1">{leftAction.label}</span>
          </div>
        </m.div>
      )}
      
      {rightAction && (
        <m.div 
          className="absolute inset-y-0 left-0 w-20 flex items-center justify-center"
          style={{ 
            opacity: rightBgOpacity,
            backgroundColor: rightAction.color,
          }}
          onClick={() => executeAction('right')}
        >
          <div className="text-white text-center">
            {rightAction.icon}
            <span className="text-xs block mt-1">{rightAction.label}</span>
          </div>
        </m.div>
      )}

      <m.div
        drag="x"
        dragConstraints={{ left: -80, right: 80 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: isRevealed === 'left' ? -80 : isRevealed === 'right' ? 80 : 0 }}
        style={{ x }}
        className="relative z-10 bg-surface-1"
      >
        {children}
      </m.div>
    </div>
  );
});
