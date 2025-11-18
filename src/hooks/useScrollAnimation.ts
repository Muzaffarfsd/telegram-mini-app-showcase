import { useEffect, useState, useRef } from 'react';

export function useScrollAnimation() {
  const [isScrolling, setIsScrolling] = useState(false);
  
  useEffect(() => {
    let timeoutId: number;
    
    const handleScroll = () => {
      setIsScrolling(true);
      
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);
  
  return isScrolling;
}

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return throttledValue;
}
