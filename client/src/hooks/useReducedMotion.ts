import { useState, useEffect, useCallback, useMemo } from 'react';

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const getTransition = useCallback((
    fullTransition: string | object,
    reducedTransition?: string | object
  ) => {
    if (prefersReducedMotion) {
      return reducedTransition ?? { duration: 0 };
    }
    return fullTransition;
  }, [prefersReducedMotion]);

  const getAnimation = useCallback(<T>(
    fullAnimation: T,
    reducedAnimation?: T
  ): T | { duration: 0 } => {
    if (prefersReducedMotion) {
      return reducedAnimation ?? { duration: 0 } as any;
    }
    return fullAnimation;
  }, [prefersReducedMotion]);

  const motionProps = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        initial: false,
        animate: false,
        exit: false,
        transition: { duration: 0 },
      };
    }
    return {};
  }, [prefersReducedMotion]);

  const shouldAnimate = !prefersReducedMotion;

  return {
    prefersReducedMotion,
    shouldAnimate,
    getTransition,
    getAnimation,
    motionProps,
  };
};

export const useAccessibleTransition = (
  fullTransition: string | object,
  reducedTransition?: string | object
) => {
  const { getTransition } = useReducedMotion();
  return useMemo(
    () => getTransition(fullTransition, reducedTransition),
    [getTransition, fullTransition, reducedTransition]
  );
};

export const useAccessibleAnimation = <T>(
  fullAnimation: T,
  reducedAnimation?: T
): T | { duration: 0 } => {
  const { getAnimation } = useReducedMotion();
  return useMemo(
    () => getAnimation(fullAnimation, reducedAnimation),
    [getAnimation, fullAnimation, reducedAnimation]
  );
};
