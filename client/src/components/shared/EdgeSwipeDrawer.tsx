import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface EdgeSwipeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  width?: number | string;
  edgeWidth?: number;
  swipeThreshold?: number;
  velocityThreshold?: number;
  enableEdgeSwipe?: boolean;
  showHandle?: boolean;
  showOverlay?: boolean;
  overlayOpacity?: number;
  className?: string;
  'data-testid'?: string;
}

export function EdgeSwipeDrawer({
  isOpen,
  onClose,
  onOpen,
  children,
  side = 'left',
  width = 280,
  edgeWidth = 20,
  swipeThreshold = 0.3,
  velocityThreshold = 500,
  enableEdgeSwipe = true,
  showHandle = true,
  showOverlay = true,
  overlayOpacity = 0.5,
  className = '',
  'data-testid': testId,
}: EdgeSwipeDrawerProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const isEdgeSwipeRef = useRef(false);

  const drawerWidth = typeof width === 'number' ? width : parseInt(width);
  const isLeft = side === 'left';

  const handleDragStart = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const progress = isLeft
      ? Math.max(0, Math.min(1, (drawerWidth + offset) / drawerWidth))
      : Math.max(0, Math.min(1, (drawerWidth - offset) / drawerWidth));
    setDragProgress(isOpen ? progress : 1 - progress);
  }, [isOpen, isLeft, drawerWidth]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    const shouldClose = isLeft
      ? (offset < -drawerWidth * swipeThreshold || velocity < -velocityThreshold)
      : (offset > drawerWidth * swipeThreshold || velocity > velocityThreshold);

    const shouldOpen = isLeft
      ? (offset > drawerWidth * swipeThreshold || velocity > velocityThreshold)
      : (offset < -drawerWidth * swipeThreshold || velocity < -velocityThreshold);

    if (isOpen && shouldClose) {
      onClose();
    } else if (!isOpen && shouldOpen) {
      onOpen?.();
    }
    setDragProgress(0);
  }, [isOpen, isLeft, drawerWidth, swipeThreshold, velocityThreshold, onClose, onOpen]);

  useEffect(() => {
    if (!enableEdgeSwipe || !isMobile || isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const windowWidth = window.innerWidth;
      
      const isLeftEdge = touch.clientX <= edgeWidth;
      const isRightEdge = touch.clientX >= windowWidth - edgeWidth;
      
      if ((isLeft && isLeftEdge) || (!isLeft && isRightEdge)) {
        isEdgeSwipeRef.current = true;
        startXRef.current = touch.clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isEdgeSwipeRef.current) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startXRef.current;
      const progress = Math.max(0, Math.min(1, Math.abs(deltaX) / drawerWidth));
      
      if ((isLeft && deltaX > 0) || (!isLeft && deltaX < 0)) {
        setDragProgress(progress);
        setIsDragging(true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isEdgeSwipeRef.current) return;
      
      if (dragProgress > swipeThreshold) {
        onOpen?.();
      }
      
      isEdgeSwipeRef.current = false;
      setIsDragging(false);
      setDragProgress(0);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableEdgeSwipe, isMobile, isOpen, isLeft, edgeWidth, drawerWidth, swipeThreshold, dragProgress, onOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const springTransition = prefersReducedMotion
    ? { duration: 0.15 }
    : { type: 'spring', stiffness: 400, damping: 30 };

  const drawerVariants = {
    closed: {
      x: isLeft ? '-100%' : '100%',
    },
    open: {
      x: 0,
    },
  };

  return (
    <>
      {enableEdgeSwipe && !isOpen && isMobile && (
        <div
          className={`fixed top-0 ${isLeft ? 'left-0' : 'right-0'} h-full z-40`}
          style={{ width: edgeWidth }}
          aria-hidden="true"
        />
      )}

      <AnimatePresence mode="wait">
        {(isOpen || isDragging) && (
          <>
            {showOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isDragging ? dragProgress * overlayOpacity : overlayOpacity }}
                exit={{ opacity: 0 }}
                transition={springTransition}
                className="fixed inset-0 bg-black z-40"
                onClick={onClose}
                data-testid={testId ? `${testId}-overlay` : 'drawer-overlay'}
              />
            )}

            <motion.div
              ref={containerRef}
              initial="closed"
              animate={isDragging ? undefined : 'open'}
              exit="closed"
              variants={drawerVariants}
              transition={springTransition}
              drag={isMobile ? 'x' : false}
              dragConstraints={{ 
                left: isLeft ? -drawerWidth : 0, 
                right: isLeft ? 0 : drawerWidth 
              }}
              dragElastic={0.1}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{
                width: typeof width === 'number' ? `${width}px` : width,
                x: isDragging 
                  ? isLeft 
                    ? `${(dragProgress - 1) * 100}%`
                    : `${(1 - dragProgress) * 100}%`
                  : undefined,
              }}
              className={`fixed top-0 ${isLeft ? 'left-0' : 'right-0'} h-full bg-background border-${isLeft ? 'r' : 'l'} z-50 flex flex-col ${className}`}
              data-testid={testId || 'edge-swipe-drawer'}
              role="dialog"
              aria-modal="true"
            >
              {showHandle && (
                <div className="flex items-center justify-between p-4 border-b">
                  <div 
                    className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto cursor-grab active:cursor-grabbing"
                    aria-hidden="true"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-2 right-2"
                    data-testid={testId ? `${testId}-close` : 'drawer-close'}
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto overscroll-contain">
                {children}
              </div>

              {isMobile && (
                <div
                  className={`absolute top-1/2 ${isLeft ? '-right-3' : '-left-3'} -translate-y-1/2 w-6 h-12 bg-muted rounded-full flex items-center justify-center`}
                  aria-hidden="true"
                >
                  <div className="w-1 h-6 bg-muted-foreground/30 rounded-full" />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function useEdgeSwipeDrawer(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}
