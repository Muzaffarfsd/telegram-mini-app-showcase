import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  routeKey: string;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="h-full w-full">
      {children}
    </div>
  );
}
