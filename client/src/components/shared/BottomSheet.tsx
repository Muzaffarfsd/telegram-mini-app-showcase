import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { FocusTrap } from '@/hooks/useFocusTrap';

export type BottomSheetSnapPoint = number | 'content' | 'full';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: BottomSheetSnapPoint[];
  defaultSnapPoint?: number;
  showHandle?: boolean;
  showCloseButton?: boolean;
  showOverlay?: boolean;
  overlayOpacity?: number;
  closeOnOverlayClick?: boolean;
  closeOnSwipeDown?: boolean;
  swipeThreshold?: number;
  velocityThreshold?: number;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  trapFocus?: boolean;
  'data-testid'?: string;
}

export interface BottomSheetRef {
  snapTo: (index: number) => void;
  expand: () => void;
  collapse: () => void;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(({
  isOpen,
  onClose,
  children,
  snapPoints = [0.5, 1],
  defaultSnapPoint = 0,
  showHandle = true,
  showCloseButton = true,
  showOverlay = true,
  overlayOpacity = 0.5,
  closeOnOverlayClick = true,
  closeOnSwipeDown = true,
  swipeThreshold = 0.25,
  velocityThreshold = 500,
  header,
  footer,
  className = '',
  contentClassName = '',
  trapFocus = true,
  'data-testid': testId,
}, ref) => {
  const prefersReducedMotion = useReducedMotion();
  const [currentSnapIndex, setCurrentSnapIndex] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const y = useMotionValue(0);
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const getSnapPointHeight = useCallback((snapPoint: BottomSheetSnapPoint): number => {
    if (snapPoint === 'full') return windowHeight;
    if (snapPoint === 'content') {
      return contentRef.current?.scrollHeight || windowHeight * 0.5;
    }
    return windowHeight * snapPoint;
  }, [windowHeight]);

  const currentHeight = getSnapPointHeight(snapPoints[currentSnapIndex]);

  const overlayOpacityValue = useTransform(
    y,
    [0, currentHeight],
    [overlayOpacity, 0]
  );

  const snapTo = useCallback((index: number) => {
    if (index >= 0 && index < snapPoints.length) {
      setCurrentSnapIndex(index);
    }
  }, [snapPoints.length]);

  const expand = useCallback(() => {
    snapTo(snapPoints.length - 1);
  }, [snapTo, snapPoints.length]);

  const collapse = useCallback(() => {
    snapTo(0);
  }, [snapTo]);

  useImperativeHandle(ref, () => ({
    snapTo,
    expand,
    collapse,
  }), [snapTo, expand, collapse]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const clampedY = Math.max(0, info.offset.y);
    y.set(clampedY);
  }, [y]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const velocity = info.velocity.y;
    const offset = info.offset.y;
    const currentHeightValue = getSnapPointHeight(snapPoints[currentSnapIndex]);

    if (closeOnSwipeDown && offset > currentHeightValue * swipeThreshold && velocity > 0) {
      onClose();
      return;
    }

    if (velocity > velocityThreshold) {
      if (currentSnapIndex > 0) {
        snapTo(currentSnapIndex - 1);
      } else if (closeOnSwipeDown) {
        onClose();
      }
    } else if (velocity < -velocityThreshold) {
      if (currentSnapIndex < snapPoints.length - 1) {
        snapTo(currentSnapIndex + 1);
      }
    } else {
      const snapHeights = snapPoints.map(sp => getSnapPointHeight(sp));
      const currentY = currentHeightValue + offset;
      
      let closestIndex = currentSnapIndex;
      let minDistance = Infinity;
      
      snapHeights.forEach((height, index) => {
        const distance = Math.abs(currentY - height);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== currentSnapIndex) {
        snapTo(closestIndex);
      }
    }

    y.set(0);
  }, [
    currentSnapIndex, 
    snapPoints, 
    closeOnSwipeDown, 
    swipeThreshold, 
    velocityThreshold, 
    getSnapPointHeight, 
    snapTo, 
    onClose, 
    y
  ]);

  useEffect(() => {
    if (isOpen) {
      setCurrentSnapIndex(defaultSnapPoint);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultSnapPoint]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const springTransition = prefersReducedMotion
    ? { duration: 0.15 }
    : { type: 'spring', stiffness: 400, damping: 35 };

  const sheetVariants = {
    hidden: {
      y: '100%',
    },
    visible: {
      y: 0,
    },
  };

  const content = (
    <>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isDragging ? overlayOpacityValue.get() : overlayOpacity }}
          exit={{ opacity: 0 }}
          transition={springTransition}
          className="fixed inset-0 bg-black z-40"
          onClick={closeOnOverlayClick ? onClose : undefined}
          data-testid={testId ? `${testId}-overlay` : 'bottom-sheet-overlay'}
        />
      )}

      <motion.div
        ref={sheetRef}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={sheetVariants}
        transition={springTransition}
        drag="y"
        dragConstraints={{ top: 0, bottom: currentHeight }}
        dragElastic={{ top: 0.1, bottom: 0.5 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ 
          height: currentHeight,
          y,
        }}
        className={`fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl z-50 flex flex-col ${className}`}
        data-testid={testId || 'bottom-sheet'}
        role="dialog"
        aria-modal="true"
      >
        {showHandle && (
          <div 
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
            aria-hidden="true"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {(header || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex-1">{header}</div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                data-testid={testId ? `${testId}-close` : 'bottom-sheet-close'}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        <div 
          ref={contentRef}
          className={`flex-1 overflow-y-auto overscroll-contain px-4 ${contentClassName}`}
        >
          {children}
        </div>

        {footer && (
          <div className="border-t p-4 bg-background">
            {footer}
          </div>
        )}

        {snapPoints.length > 1 && (
          <div 
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 p-1 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm"
            role="group"
            aria-label="Sheet size controls"
          >
            {snapPoints.map((_, index) => (
              <button
                key={index}
                onClick={() => snapTo(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSnapIndex 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30'
                }`}
                aria-label={`Snap to ${index === 0 ? 'small' : index === snapPoints.length - 1 ? 'full' : 'medium'}`}
                aria-pressed={index === currentSnapIndex}
              />
            ))}
          </div>
        )}
      </motion.div>
    </>
  );

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        trapFocus ? (
          <FocusTrap active={isOpen}>
            {content}
          </FocusTrap>
        ) : content
      )}
    </AnimatePresence>
  );
});

BottomSheet.displayName = 'BottomSheet';

export function useBottomSheet(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sheetRef = useRef<BottomSheetRef>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
    sheetRef,
    snapTo: (index: number) => sheetRef.current?.snapTo(index),
    expand: () => sheetRef.current?.expand(),
    collapse: () => sheetRef.current?.collapse(),
  };
}

export interface ProductBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    description?: string;
    sizes?: string[];
    colors?: string[];
  } | null;
  onAddToCart?: (product: any, size?: string, color?: string) => void;
  onAddToFavorites?: (product: any) => void;
}

export function ProductBottomSheet({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onAddToFavorites,
}: ProductBottomSheetProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || null);
      setSelectedColor(product.colors?.[0] || null);
    }
  }, [product]);

  if (!product) return null;

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.6, 0.9]}
      showCloseButton
      data-testid="product-bottom-sheet"
      footer={
        <div className="flex gap-2">
          {onAddToFavorites && (
            <Button
              variant="outline"
              onClick={() => onAddToFavorites(product)}
              className="min-h-12"
              data-testid="button-add-favorite"
            >
              Add to Wishlist
            </Button>
          )}
          <Button
            onClick={() => onAddToCart?.(product, selectedSize || undefined, selectedColor || undefined)}
            className="flex-1 min-h-12"
            data-testid="button-add-cart"
          >
            Add to Cart - ${product.price.toFixed(2)}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pb-4">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold" data-testid="text-product-name">
            {product.name}
          </h2>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" data-testid="text-product-price">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-12 min-h-12 px-4 py-2 rounded-md border transition-colors ${
                    selectedSize === size
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary'
                  }`}
                  data-testid={`button-size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors && product.colors.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Color</h3>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`min-h-12 px-4 py-2 rounded-md border transition-colors ${
                    selectedColor === color
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary'
                  }`}
                  data-testid={`button-color-${color}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
