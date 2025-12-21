import { useEffect, useRef, RefObject } from 'react';

export function useScrollDepthEffect(enabled: boolean): RefObject<HTMLDivElement | null> {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const depthElements = container.querySelectorAll('[data-depth-zone]');
      const viewportHeight = window.innerHeight;
      const navZoneStart = viewportHeight - 180;
      
      depthElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elementBottom = rect.bottom;
        
        if (elementBottom > navZoneStart && elementBottom < viewportHeight + 50) {
          const progress = Math.min(1, (elementBottom - navZoneStart) / (viewportHeight - navZoneStart));
          (el as HTMLElement).style.setProperty('--nav-depth-progress', progress.toFixed(3));
        } else {
          (el as HTMLElement).style.setProperty('--nav-depth-progress', '0');
        }
      });
    };
    
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);

  return scrollContainerRef;
}

export default useScrollDepthEffect;
