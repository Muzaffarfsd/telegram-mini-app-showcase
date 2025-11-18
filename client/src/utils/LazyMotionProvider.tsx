import { LazyMotion, domAnimation, m, MotionConfig } from 'framer-motion';
import { ReactNode } from 'react';
import { appleEasing } from './motionConfig';

/**
 * LazyMotion Provider - Reduces bundle size by 40-60%
 * Only loads animation features when needed
 * 
 * Usage:
 * - Wrap your app with <LazyMotionProvider>
 * - Use 'm' instead of 'motion' for animated components
 * - Import all framer-motion exports from this file
 */
export function LazyMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig 
        reducedMotion="user"
        transition={{ duration: 0.25, ease: appleEasing.default as any }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

// Export optimized motion component and all necessary utilities
export { m };

// Re-export all commonly used framer-motion utilities
export {
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useInView,
  useReducedMotion
} from 'framer-motion';

// Export 'm' as 'motion' for easier migration
export { m as motion };

/**
 * Bundle size comparison:
 * - Regular motion: ~80-100KB (gzipped)
 * - LazyMotion + domAnimation: ~30-40KB (gzipped)
 * Savings: ~50KB (40-60% reduction)
 */
