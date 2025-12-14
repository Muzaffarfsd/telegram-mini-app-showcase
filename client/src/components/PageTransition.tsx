import { ReactNode } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { PageTransitions } from '@/design-system/motion';

interface PageTransitionProps {
  children: ReactNode;
  routeKey: string;
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'scale';
}

export function PageTransition({ children, routeKey, variant = 'fade' }: PageTransitionProps) {
  const transition = PageTransitions[variant];
  
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={routeKey}
        className="h-full w-full"
        initial={transition.initial}
        animate={transition.animate}
        exit={transition.exit}
        transition={transition.transition}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
