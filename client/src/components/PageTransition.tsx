import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  routeKey?: string;
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'scale';
}

// Page transitions disabled for instant navigation
export function PageTransition({ children, className = '' }: PageTransitionProps & { className?: string }) {
  return (
    <div className={`h-full w-full ${className}`}>
      {children}
    </div>
  );
}
