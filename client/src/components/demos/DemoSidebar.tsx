import { useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { X, Home, ShoppingBag, Heart, User, Settings, LogOut, ChevronRight } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { scrollToTop } from "@/hooks/useScrollToTop";

export interface DemoMenuItem {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string;
  badgeColor?: string;
}

export interface DemoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  menuItems: DemoMenuItem[];
  title?: string;
  subtitle?: string;
  accentColor?: string;
  bgColor?: string;
  userName?: string;
  userAvatar?: string;
  children?: ReactNode;
}

export function useDemoSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const isSwipingToOpen = useRef(false);
  const edgeSwipeStartX = useRef<number>(0);
  const edgeSwipeStartY = useRef<number>(0);
  const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const [closeSwipeOffset, setCloseSwipeOffset] = useState(0);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const handleEdgeTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX <= 50 && !isOpen) {
      isSwipingToOpen.current = true;
      edgeSwipeStartX.current = touch.clientX;
      edgeSwipeStartY.current = touch.clientY;
      swipeDirection.current = null;
    }
  }, [isOpen]);

  const handleEdgeTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwipingToOpen.current) return;
    
    const touch = e.touches[0];
    const diffX = touch.clientX - edgeSwipeStartX.current;
    const diffY = touch.clientY - edgeSwipeStartY.current;
    
    if (swipeDirection.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      swipeDirection.current = Math.abs(diffX) > Math.abs(diffY) ? 'horizontal' : 'vertical';
    }
    
    if (swipeDirection.current === 'horizontal' && diffX > 0) {
      e.preventDefault();
      const sidebarWidth = Math.min(280, window.innerWidth - 48);
      const offset = Math.min(diffX, sidebarWidth);
      setSwipeOffset(offset);
    }
  }, []);

  const handleEdgeTouchEnd = useCallback(() => {
    if (!isSwipingToOpen.current) return;
    
    const sidebarWidth = Math.min(280, window.innerWidth - 48);
    if (swipeOffset > sidebarWidth * 0.3) {
      setIsOpen(true);
    }
    
    setSwipeOffset(0);
    isSwipingToOpen.current = false;
    edgeSwipeStartX.current = 0;
    edgeSwipeStartY.current = 0;
    swipeDirection.current = null;
  }, [swipeOffset]);

  const handleSidebarTouchStart = useCallback((e: TouchEvent) => {
    if (!isOpen) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, [isOpen]);

  const handleSidebarTouchMove = useCallback((e: TouchEvent) => {
    if (!isOpen) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 0) {
      setCloseSwipeOffset(Math.min(diff, 280));
    }
  }, [isOpen]);

  const handleSidebarTouchEnd = useCallback(() => {
    if (!isOpen) return;
    if (closeSwipeOffset > 100) {
      setIsOpen(false);
    }
    setCloseSwipeOffset(0);
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  }, [isOpen, closeSwipeOffset]);

  useEffect(() => {
    if (isOpen) return;
    
    document.addEventListener('touchstart', handleEdgeTouchStart, { passive: true });
    document.addEventListener('touchmove', handleEdgeTouchMove, { passive: false });
    document.addEventListener('touchend', handleEdgeTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleEdgeTouchStart);
      document.removeEventListener('touchmove', handleEdgeTouchMove);
      document.removeEventListener('touchend', handleEdgeTouchEnd);
    };
  }, [isOpen, handleEdgeTouchStart, handleEdgeTouchMove, handleEdgeTouchEnd]);

  return {
    isOpen,
    open,
    close,
    toggle,
    swipeOffset,
    closeSwipeOffset,
    handleSidebarTouchStart,
    handleSidebarTouchMove,
    handleSidebarTouchEnd,
  };
}

export default function DemoSidebar({
  isOpen,
  onClose,
  menuItems,
  title = "Меню",
  subtitle,
  accentColor = "#A78BFA",
  bgColor = "#0A0A0A",
  userName,
  userAvatar,
  children,
}: DemoSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.touches[0].clientX;
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 280));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset > 100) {
      onClose();
    }
    setSwipeOffset(0);
    touchStartX.current = 0;
  }, [swipeOffset, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sidebarWidth = Math.min(280, typeof window !== 'undefined' ? window.innerWidth - 48 : 280);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
            data-testid="demo-sidebar-overlay"
          />
          
          <m.div
            ref={sidebarRef}
            initial={{ x: -sidebarWidth }}
            animate={{ x: -swipeOffset }}
            exit={{ x: -sidebarWidth }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-[9999] overflow-y-auto overflow-x-hidden"
            style={{
              width: sidebarWidth,
              backgroundColor: bgColor,
              borderRight: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            data-testid="demo-sidebar"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 
                    className="text-lg font-semibold text-white"
                    style={{ color: accentColor }}
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  aria-label="Закрыть меню"
                  data-testid="button-close-sidebar"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {(userName || userAvatar) && (
                <div 
                  className="flex items-center gap-3 p-3 rounded-xl mb-5"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName || 'User'} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ backgroundColor: accentColor, color: bgColor }}
                    >
                      {userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{userName || 'Гость'}</p>
                    <p className="text-xs text-white/50">Личный кабинет</p>
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.onClick?.();
                      onClose();
                      // Always scroll to top when navigating via menu
                      scrollToTop();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                      item.active 
                        ? 'text-white' 
                        : 'text-white/70 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: item.active 
                        ? `${accentColor}20` 
                        : 'transparent',
                      borderLeft: item.active ? `3px solid ${accentColor}` : '3px solid transparent',
                    }}
                    data-testid={`menu-item-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ color: item.active ? accentColor : 'inherit' }}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span 
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: item.badgeColor || accentColor,
                            color: bgColor 
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </div>
                  </button>
                ))}
              </nav>

              {children && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  {children}
                </div>
              )}
            </div>

            <div 
              className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-white/30"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              Свайп влево для закрытия
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
