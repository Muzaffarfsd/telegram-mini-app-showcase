import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Badge } from '@/components/ui/badge';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number | string;
  disabled?: boolean;
}

export interface AdaptiveNavigationProps {
  items: NavigationItem[];
  variant?: 'tabs' | 'pill' | 'auto';
  position?: 'bottom' | 'top';
  showLabels?: boolean;
  showLabelsOnActive?: boolean;
  hideOnScroll?: boolean;
  scrollThreshold?: number;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  'data-testid'?: string;
}

export function AdaptiveNavigation({
  items,
  variant = 'auto',
  position = 'bottom',
  showLabels = true,
  showLabelsOnActive = true,
  hideOnScroll = false,
  scrollThreshold = 50,
  className = '',
  activeClassName = '',
  inactiveClassName = '',
  'data-testid': testId,
}: AdaptiveNavigationProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const effectiveVariant = useMemo(() => {
    if (variant === 'auto') {
      return isMobile ? 'tabs' : 'pill';
    }
    return variant;
  }, [variant, isMobile]);

  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < scrollThreshold) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, scrollThreshold, lastScrollY]);

  const isActive = useCallback((href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  }, [location]);

  const springTransition = prefersReducedMotion
    ? { duration: 0.1 }
    : { type: 'spring', stiffness: 500, damping: 30 };

  if (effectiveVariant === 'tabs') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            initial={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
            transition={springTransition}
            className={`fixed ${position === 'bottom' ? 'bottom-0 border-t' : 'top-0 border-b'} left-0 right-0 z-50 bg-background safe-area-inset-bottom ${className}`}
            data-testid={testId || 'adaptive-navigation'}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex items-center justify-around">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`relative flex flex-col items-center justify-center py-2 px-4 min-w-[64px] min-h-[56px] transition-colors ${
                      item.disabled 
                        ? 'opacity-50 pointer-events-none' 
                        : ''
                    } ${active ? activeClassName : inactiveClassName}`}
                    aria-current={active ? 'page' : undefined}
                    data-testid={`nav-item-${item.id}`}
                  >
                    <div className="relative">
                      <motion.div
                        initial={false}
                        animate={{ 
                          scale: active ? 1 : 0.9,
                          y: active && !showLabels ? 0 : 0,
                        }}
                        transition={springTransition}
                      >
                        <Icon 
                          className={`w-6 h-6 transition-colors ${
                            active 
                              ? 'text-primary' 
                              : 'text-muted-foreground'
                          }`}
                        />
                      </motion.div>
                      
                      {item.badge !== undefined && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px]"
                        >
                          {typeof item.badge === 'number' && item.badge > 99 
                            ? '99+' 
                            : item.badge}
                        </Badge>
                      )}
                    </div>
                    
                    {(showLabels || (showLabelsOnActive && active)) && (
                      <motion.span
                        initial={false}
                        animate={{ 
                          opacity: showLabels || active ? 1 : 0,
                          y: showLabels || active ? 0 : 10,
                        }}
                        className={`text-[10px] mt-1 font-medium transition-colors ${
                          active 
                            ? 'text-primary' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                    
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                        transition={springTransition}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
          transition={springTransition}
          className={`fixed ${position === 'bottom' ? 'bottom-6' : 'top-6'} left-1/2 -translate-x-1/2 z-50 ${className}`}
          data-testid={testId || 'adaptive-navigation'}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-1 p-1.5 bg-background/80 backdrop-blur-lg border rounded-full shadow-lg">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full transition-all ${
                    item.disabled 
                      ? 'opacity-50 pointer-events-none' 
                      : ''
                  } ${
                    active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  data-testid={`nav-item-${item.id}`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    
                    {item.badge !== undefined && !active && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 min-w-[16px] h-[16px] flex items-center justify-center p-0 text-[9px]"
                      >
                        {typeof item.badge === 'number' && item.badge > 99 
                          ? '99+' 
                          : item.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {active && showLabels && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={springTransition}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                        {item.badge !== undefined && (
                          <span className="ml-1 opacity-75">({item.badge})</span>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  label?: string;
  badge?: number | string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  hideOnScroll?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function FloatingActionButton({
  icon: Icon,
  onClick,
  label,
  badge,
  position = 'bottom-right',
  variant = 'primary',
  size = 'md',
  hideOnScroll = false,
  className = '',
  'data-testid': testId,
}: FloatingActionButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, lastScrollY]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'bg-background border-2 hover:bg-muted',
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const springTransition = prefersReducedMotion
    ? { duration: 0.1 }
    : { type: 'spring', stiffness: 500, damping: 30 };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={springTransition}
          onClick={onClick}
          className={`fixed ${positionClasses[position]} ${sizeClasses[size]} ${variantClasses[variant]} rounded-full shadow-lg flex items-center justify-center z-50 ${className}`}
          aria-label={label}
          data-testid={testId || 'floating-action-button'}
        >
          <div className="relative">
            <Icon className={iconSizes[size]} />
            
            {badge !== undefined && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px]"
              >
                {typeof badge === 'number' && badge > 99 ? '99+' : badge}
              </Badge>
            )}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export interface MobileTabBarProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
  'data-testid'?: string;
}

export function MobileTabBar({
  items,
  onItemClick,
  className = '',
  'data-testid': testId,
}: MobileTabBarProps) {
  const [location, setLocation] = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const handleClick = (item: NavigationItem) => {
    if (!item.disabled) {
      setLocation(item.href);
      onItemClick?.(item);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe ${className}`}
      data-testid={testId || 'mobile-tab-bar'}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              disabled={item.disabled}
              className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors ${
                item.disabled ? 'opacity-50' : ''
              }`}
              aria-current={active ? 'page' : undefined}
              data-testid={`tab-${item.id}`}
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: active ? 1.1 : 1,
                    y: active ? -2 : 0,
                  }}
                  transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Icon 
                    className={`w-6 h-6 ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                </motion.div>
                
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full">
                    {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              
              <span 
                className={`text-[10px] mt-0.5 font-medium ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
