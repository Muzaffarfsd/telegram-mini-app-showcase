import { ReactNode } from 'react';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: ReactNode;
  routeKey?: string;
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'scale';
}

// Optimized for Telegram Mini App: removing complex framer-motion layers for raw performance
export function PageTransition({ children, className = '' }: PageTransitionProps & { className?: string }) {
  return (
    <div className={`h-full w-full ${className} animate-in fade-in duration-150`}>
      {children}
    </div>
  );
}
