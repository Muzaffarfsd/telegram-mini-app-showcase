import { ReactNode } from 'react';
import { m, AnimatePresence, LazyMotion, domMax } from 'framer-motion';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: ReactNode;
  routeKey?: string;
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'scale';
}

export function PageTransition({ children, className = '' }: PageTransitionProps & { className?: string }) {
  const [location] = useLocation();
  
  return (
    <LazyMotion features={domMax}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.15,
            ease: "easeOut"
          }}
          className={`h-full w-full ${className}`}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
