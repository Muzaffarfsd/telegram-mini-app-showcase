import { ReactNode } from 'react';
import { m, AnimatePresence } from '@/utils/LazyMotionProvider';

interface PageTransitionProps {
  children: ReactNode;
  routeKey?: string;
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'scale';
  className?: string;
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const variants = {
  initial: { opacity: 0, y: 6 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.18, ease }
  },
  exit: { 
    opacity: 0,
    y: -4,
    transition: { duration: 0.08, ease }
  },
};

export function PageTransition({ children, routeKey, className = '' }: PageTransitionProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.div
        key={routeKey}
        className={`h-full w-full gpu-layer ${className}`}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
