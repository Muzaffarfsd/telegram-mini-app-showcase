import { memo, Suspense, type ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { DemoThemeProvider } from './DemoThemeProvider';
import { ProductGridSkeleton } from './ProductSkeleton';
import { PageTransitions } from '@/design-system/motion';
import { GlassClasses } from '@/design-system/glassmorphism';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoShellProps {
  themeId: string;
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  showScrollTop?: boolean;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
  loadingFallback?: ReactNode;
  pageTransition?: keyof typeof PageTransitions;
  'data-testid'?: string;
}

const ScrollToTopButton = memo(function ScrollToTopButton({ 
  visible,
  onClick 
}: { 
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={onClick}
          className={cn(
            'fixed bottom-24 right-4 z-50 p-3 rounded-full',
            GlassClasses.floating,
            'shadow-lg'
          )}
          aria-label="Scroll to top"
          data-testid="button-scroll-top"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
});

const PullToRefreshIndicator = memo(function PullToRefreshIndicator({
  progress,
  isRefreshing
}: {
  progress: number;
  isRefreshing: boolean;
}) {
  if (progress <= 0 && !isRefreshing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ 
        opacity: progress > 0 || isRefreshing ? 1 : 0, 
        y: isRefreshing ? 0 : Math.min(progress * 60, 60) - 40 
      }}
      className={cn(
        'absolute top-0 left-1/2 -translate-x-1/2 z-50',
        'flex items-center justify-center p-3 rounded-full',
        GlassClasses.pill
      )}
    >
      <motion.div
        animate={{ rotate: isRefreshing ? 360 : progress * 360 }}
        transition={{ 
          duration: isRefreshing ? 1 : 0,
          repeat: isRefreshing ? Infinity : 0,
          ease: 'linear'
        }}
      >
        <Loader2 className="w-5 h-5 text-white" />
      </motion.div>
    </motion.div>
  );
});

const DefaultLoadingFallback = memo(function DefaultLoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--theme-background,#0a0a0b)] p-4">
      <ProductGridSkeleton count={6} />
    </div>
  );
});

export const DemoShell = memo(function DemoShell({
  themeId,
  children,
  className,
  header,
  footer,
  showScrollTop = true,
  enablePullToRefresh = false,
  onRefresh,
  loadingFallback,
  pageTransition = 'fade',
  'data-testid': dataTestId,
}: DemoShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const { progress, isRefreshing } = usePullToRefresh({
    onRefresh: enablePullToRefresh && onRefresh ? onRefresh : async () => {},
    threshold: 80,
    enabled: enablePullToRefresh,
  });

  const handleScroll = useCallback(() => {
    const currentScrollY = containerRef.current?.scrollTop || window.scrollY;
    setScrollY(currentScrollY);
    setShowScrollButton(currentScrollY > 300);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleScrollTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <DemoThemeProvider themeId={themeId}>
      <LazyMotion features={domAnimation}>
        <div
          ref={containerRef}
          className={cn(
            'demo-scroll-container relative min-h-screen',
            'bg-[var(--theme-background,#0a0a0b)]',
            'text-[var(--theme-foreground,#fafafa)]',
            className
          )}
          style={{
            fontFamily: 'var(--theme-font-body)',
          }}
          data-testid={dataTestId}
        >
          {enablePullToRefresh && (
            <PullToRefreshIndicator 
              progress={progress} 
              isRefreshing={isRefreshing} 
            />
          )}

          {header && (
            <header className="sticky top-0 z-40">
              {header}
            </header>
          )}

          <Suspense fallback={loadingFallback || <DefaultLoadingFallback />}>
            <main className="relative">
              {children}
            </main>
          </Suspense>

          {footer && (
            <footer>
              {footer}
            </footer>
          )}

          {showScrollTop && (
            <ScrollToTopButton 
              visible={showScrollButton} 
              onClick={handleScrollTop} 
            />
          )}
        </div>
      </LazyMotion>
    </DemoThemeProvider>
  );
});

export default DemoShell;
