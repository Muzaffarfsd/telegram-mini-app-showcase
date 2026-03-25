import { ReactNode } from 'react';
import { m, AnimatePresence } from '@/utils/LazyMotionProvider';

interface PageTransitionProps {
  children: ReactNode;
  routeKey?: string;
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'scale';
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

const variants = {
  initial: { opacity: 0, y: 6 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.22, ease: ease as unknown as [number, number, number, number] }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.12, ease: ease as unknown as [number, number, number, number] }
  },
};

export function PageTransition({ children, routeKey, className = '' }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
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
