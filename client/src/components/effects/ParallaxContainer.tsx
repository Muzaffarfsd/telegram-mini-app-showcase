import { memo, useRef, useEffect, type ReactNode } from 'react';

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
}

export const ParallaxContainer = memo(function ParallaxContainer({
  children,
  className = '',
  speed = 0.5,
  direction = 'up',
}: ParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    let animationId: number | null = null;
    
    const handleScroll = () => {
      if (!ticking) {
        animationId = window.requestAnimationFrame(() => {
          if (containerRef.current && innerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distance = elementCenter - viewportCenter;
            const multiplier = direction === 'up' ? -1 : 1;
            const offset = distance * speed * multiplier * 0.1;
            innerRef.current.style.transform = `translateY(${offset}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationId !== null) {
        window.cancelAnimationFrame(animationId);
      }
    };
  }, [speed, direction]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div ref={innerRef} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
});

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  zIndex?: number;
}

export const ParallaxLayer = memo(function ParallaxLayer({
  children,
  className = '',
  speed = 0.3,
  zIndex = 0,
}: ParallaxLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    let animationId: number | null = null;
    
    const handleScroll = () => {
      if (!ticking) {
        animationId = window.requestAnimationFrame(() => {
          if (layerRef.current) {
            const offset = window.scrollY * speed;
            layerRef.current.style.transform = `translateY(${offset}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationId !== null) {
        window.cancelAnimationFrame(animationId);
      }
    };
  }, [speed]);

  return (
    <div
      ref={layerRef}
      className={`absolute inset-0 ${className}`}
      style={{
        zIndex,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
});
