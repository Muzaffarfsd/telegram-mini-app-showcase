import { memo, useState, useEffect, type ReactNode } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';

interface StickyBlurHeaderProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  blurAmount?: number;
  showBorder?: boolean;
  background?: string;
}

export const StickyBlurHeader = memo(function StickyBlurHeader({
  children,
  className = '',
  threshold = 50,
  blurAmount = 20,
  showBorder = true,
  background = 'rgba(0, 0, 0, 0.72)',
}: StickyBlurHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const backdropBlur = useTransform(
    scrollY,
    [0, threshold],
    [0, blurAmount]
  );
  
  const opacity = useTransform(
    scrollY,
    [0, threshold],
    [0, 1]
  );

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > threshold);
    });
    return () => unsubscribe();
  }, [scrollY, threshold]);

  return (
    <m.header
      className={`
        sticky top-0 z-50
        transition-colors duration-300
        ${className}
      `}
      style={{
        backdropFilter: useTransform(backdropBlur, (v) => `blur(${v}px) saturate(180%)`),
        WebkitBackdropFilter: useTransform(backdropBlur, (v) => `blur(${v}px) saturate(180%)`),
      }}
    >
      <m.div
        className="absolute inset-0 -z-10"
        style={{
          opacity,
          backgroundColor: background,
        }}
      />
      
      {showBorder && (
        <m.div
          className="absolute bottom-0 left-0 right-0 h-px bg-white/10"
          style={{ opacity }}
        />
      )}
      
      {children}
    </m.header>
  );
});

interface CollapsibleHeaderProps {
  children: ReactNode;
  collapsedContent?: ReactNode;
  className?: string;
  collapseThreshold?: number;
  expandedHeight?: number;
  collapsedHeight?: number;
}

export const CollapsibleHeader = memo(function CollapsibleHeader({
  children,
  collapsedContent,
  className = '',
  collapseThreshold = 100,
  expandedHeight = 120,
  collapsedHeight = 60,
}: CollapsibleHeaderProps) {
  const { scrollY } = useScroll();
  
  const height = useTransform(
    scrollY,
    [0, collapseThreshold],
    [expandedHeight, collapsedHeight]
  );
  
  const expandedOpacity = useTransform(
    scrollY,
    [0, collapseThreshold * 0.5],
    [1, 0]
  );
  
  const collapsedOpacity = useTransform(
    scrollY,
    [collapseThreshold * 0.5, collapseThreshold],
    [0, 1]
  );

  return (
    <m.header
      className={`
        sticky top-0 z-50
        bg-black/80 backdrop-blur-xl
        border-b border-white/10
        overflow-hidden
        ${className}
      `}
      style={{ height }}
    >
      <m.div
        className="absolute inset-0 flex items-center"
        style={{ opacity: expandedOpacity }}
      >
        {children}
      </m.div>
      
      {collapsedContent && (
        <m.div
          className="absolute inset-0 flex items-center"
          style={{ opacity: collapsedOpacity }}
        >
          {collapsedContent}
        </m.div>
      )}
    </m.header>
  );
});
