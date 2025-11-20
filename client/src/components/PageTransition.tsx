import { AnimatePresence } from 'framer-motion';
import { m } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  routeKey: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 30,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 1.04,
    y: -30,
  },
};

const pageTransition = {
  type: 'spring',
  damping: 30,
  stiffness: 200,
  mass: 0.8,
};

export function PageTransition({ children, routeKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={routeKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="h-full w-full"
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
