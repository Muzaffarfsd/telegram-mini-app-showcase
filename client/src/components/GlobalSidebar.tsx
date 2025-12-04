import { useState, useCallback, useEffect, useRef, forwardRef } from "react";
import { Sparkles, MessageCircle, Bot, Users, Home, Send, ChevronRight } from "lucide-react";
import { SiInstagram, SiTelegram } from "react-icons/si";
import UserAvatar from "./UserAvatar";

interface GlobalSidebarProps {
  currentRoute: string;
  onNavigate: (section: string) => void;
  user?: {
    photo_url?: string;
    first_name?: string;
  };
}

interface AnimatedHamburgerIconProps {
  isOpen: boolean;
  onClick: () => void;
}

const AnimatedHamburgerIcon = forwardRef<HTMLButtonElement, AnimatedHamburgerIconProps>(
  ({ isOpen, onClick }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className="hamburger-btn"
        aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={isOpen}
        data-testid="button-hamburger"
      >
        <div className="hamburger-icon">
          <span className={`hamburger-line line-1 ${isOpen ? 'open' : ''}`} />
          <span className={`hamburger-line line-2 ${isOpen ? 'open' : ''}`} />
          <span className={`hamburger-line line-3 ${isOpen ? 'open' : ''}`} />
        </div>
      </button>
    );
  }
);

AnimatedHamburgerIcon.displayName = 'AnimatedHamburgerIcon';

export default function GlobalSidebar({ currentRoute, onNavigate, user }: GlobalSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  // Swipe to open state
  const [swipeOpenOffset, setSwipeOpenOffset] = useState(0);
  const isSwipingToOpen = useRef(false);
  const edgeSwipeStartX = useRef<number>(0);
  const edgeSwipeStartY = useRef<number>(0);
  const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);

  const menuItems = [
    { 
      icon: Home, 
      label: 'Главная', 
      section: '', 
      routes: ['showcase'],
      description: 'Все возможности'
    },
    { 
      icon: Sparkles, 
      label: 'Бизнес приложения', 
      section: 'projects', 
      routes: ['projects'],
      description: 'Готовые решения'
    },
    { 
      icon: Bot, 
      label: 'ИИ агент для бизнеса', 
      section: 'ai-process', 
      routes: ['aiProcess', 'aiAgent'],
      description: 'Автоматизация 24/7'
    },
    { 
      icon: Users, 
      label: 'О студии', 
      section: 'about', 
      routes: ['about'],
      description: 'Наша команда'
    },
    { 
      icon: MessageCircle, 
      label: 'Заказать проект', 
      section: 'constructor', 
      routes: ['constructor', 'checkout'],
      description: 'Индивидуальное решение'
    },
  ];

  const socialLinks = [
    { 
      icon: SiInstagram, 
      label: 'Instagram', 
      url: 'https://instagram.com/web4tg',
      color: '#E4405F',
      hoverBg: 'rgba(228, 64, 95, 0.15)'
    },
    { 
      icon: SiTelegram, 
      label: 'Telegram канал', 
      url: 'https://t.me/web4_tg',
      color: '#26A5E4',
      hoverBg: 'rgba(38, 165, 228, 0.15)'
    },
    { 
      icon: Send, 
      label: 'Консультация', 
      url: 'https://t.me/web4tgs',
      color: '#A78BFA',
      hoverBg: 'rgba(167, 139, 250, 0.15)'
    },
  ];

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        if (type === 'light') tg.HapticFeedback.impactOccurred('light');
        else if (type === 'medium') tg.HapticFeedback.impactOccurred('medium');
        else tg.HapticFeedback.impactOccurred('heavy');
      }
    } catch (e) {}
  }, []);

  const openSidebar = useCallback(() => {
    setIsAnimating(true);
    setSidebarOpen(true);
    triggerHaptic('medium');
    setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 100);
  }, [triggerHaptic]);

  const closeSidebar = useCallback(() => {
    setIsAnimating(true);
    setSidebarOpen(false);
    setSwipeOffset(0);
    triggerHaptic('light');
    setTimeout(() => {
      setIsAnimating(false);
      triggerButtonRef.current?.focus();
    }, 350);
  }, [triggerHaptic]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };
    
    if (sidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen || !sidebarRef.current) return;

    const sidebar = sidebarRef.current;
    const focusableElements = sidebar.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    sidebar.addEventListener('keydown', handleTabKey);
    return () => sidebar.removeEventListener('keydown', handleTabKey);
  }, [sidebarOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 320));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 100) {
      closeSidebar();
    } else {
      setSwipeOffset(0);
    }
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  }, [closeSidebar]);

  // Edge swipe to open handlers
  const handleEdgeTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    // Only activate if touch starts within 30px of left edge
    if (touch.clientX <= 30 && !sidebarOpen) {
      isSwipingToOpen.current = true;
      edgeSwipeStartX.current = touch.clientX;
      edgeSwipeStartY.current = touch.clientY;
      swipeDirection.current = null;
    }
  }, [sidebarOpen]);

  const handleEdgeTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwipingToOpen.current) return;
    
    const touch = e.touches[0];
    const diffX = touch.clientX - edgeSwipeStartX.current;
    const diffY = touch.clientY - edgeSwipeStartY.current;
    
    // Determine swipe direction on first significant movement
    if (swipeDirection.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      swipeDirection.current = Math.abs(diffX) > Math.abs(diffY) ? 'horizontal' : 'vertical';
    }
    
    // Only process horizontal swipes
    if (swipeDirection.current === 'horizontal' && diffX > 0) {
      // Prevent scrolling while swiping to open
      e.preventDefault();
      const sidebarWidth = Math.min(320, window.innerWidth - 48);
      const offset = Math.min(diffX, sidebarWidth);
      setSwipeOpenOffset(offset);
    }
  }, []);

  const handleEdgeTouchEnd = useCallback(() => {
    if (!isSwipingToOpen.current) return;
    
    const sidebarWidth = Math.min(320, window.innerWidth - 48);
    // Open if swiped more than 30% of sidebar width
    if (swipeOpenOffset > sidebarWidth * 0.3) {
      openSidebar();
    }
    
    setSwipeOpenOffset(0);
    isSwipingToOpen.current = false;
    edgeSwipeStartX.current = 0;
    edgeSwipeStartY.current = 0;
    swipeDirection.current = null;
  }, [swipeOpenOffset, openSidebar]);

  // Global edge swipe detection
  useEffect(() => {
    if (sidebarOpen) return;
    
    document.addEventListener('touchstart', handleEdgeTouchStart, { passive: true });
    document.addEventListener('touchmove', handleEdgeTouchMove, { passive: false });
    document.addEventListener('touchend', handleEdgeTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleEdgeTouchStart);
      document.removeEventListener('touchmove', handleEdgeTouchMove);
      document.removeEventListener('touchend', handleEdgeTouchEnd);
    };
  }, [sidebarOpen, handleEdgeTouchStart, handleEdgeTouchMove, handleEdgeTouchEnd]);

  const isActive = (routes: string[]) => routes.includes(currentRoute);

  const handleNavClick = useCallback((section: string) => {
    setPressedItem(section);
    triggerHaptic('light');
    setTimeout(() => {
      onNavigate(section);
      closeSidebar();
      setPressedItem(null);
    }, 150);
  }, [onNavigate, closeSidebar, triggerHaptic]);

  const isProfileActive = ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute);
  const isProfilePressed = pressedItem === 'profile';

  return (
    <>
      <style>{`
        .hamburger-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          transition: transform 0.15s ease-out, background 0.15s ease-out;
          will-change: transform;
          -webkit-tap-highlight-color: transparent;
        }
        .hamburger-btn:active {
          transform: scale(0.92);
          background: rgba(255,255,255,0.15);
        }
        
        .hamburger-icon {
          width: 18px;
          height: 14px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .hamburger-line {
          display: block;
          width: 100%;
          height: 2px;
          background: #FAFAFA;
          border-radius: 2px;
          transition: transform 0.2s ease-out, opacity 0.15s ease-out;
          transform-origin: center;
          will-change: transform;
        }
        
        .hamburger-line.line-1.open {
          transform: translateY(6px) rotate(45deg);
        }
        
        .hamburger-line.line-2.open {
          opacity: 0;
          transform: scaleX(0);
        }
        
        .hamburger-line.line-3.open {
          transform: translateY(-6px) rotate(-45deg);
        }
        
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,0.85);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease-out;
          will-change: opacity;
        }
        .sidebar-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        
        .sidebar-panel {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          z-index: 101;
          width: min(320px, calc(100vw - 48px));
          background: #0C0C0E;
          border-right: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          transform: translateX(-100%);
          transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
          will-change: transform;
          -webkit-overflow-scrolling: touch;
        }
        .sidebar-panel.open {
          transform: translateX(0);
        }
        
        .sidebar-gradient-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.6) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.5s ease 0.2s;
        }
        .sidebar-panel.open .sidebar-gradient-line {
          opacity: 1;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 0.12s ease-out, transform 0.12s ease-out;
          position: relative;
          width: 100%;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
        }
        .menu-item:active {
          transform: scale(0.98);
          background: rgba(139, 92, 246, 0.2);
        }
        .menu-item.active {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
        }
        
        .menu-item-glow {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%);
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.5);
        }
        
        .menu-icon-wrap {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid transparent;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }
        .menu-item.active .menu-icon-wrap {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.2);
        }
        
        .social-link {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: transform 0.12s ease-out, background 0.12s ease-out;
          -webkit-tap-highlight-color: transparent;
        }
        .social-link:active {
          transform: scale(0.95);
          background: rgba(255,255,255,0.08);
        }
        
        .boost-btn {
          position: relative;
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
          border: none;
          cursor: pointer;
          transition: transform 0.12s ease-out;
          -webkit-tap-highlight-color: transparent;
        }
        .boost-btn:active {
          transform: scale(0.98);
        }
        
        .close-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: transform 0.12s ease-out;
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .close-btn:active {
          transform: scale(0.92);
        }
        
        .progress-bar {
          position: relative;
          width: 100%;
          height: 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .progress-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 5%;
          border-radius: 4px;
          background: linear-gradient(90deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%);
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.5);
          transition: width 0.5s ease;
        }
        .progress-shimmer {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .top-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 90;
          background: rgba(10,10,10,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-top: max(env(safe-area-inset-top, 0px), 12px);
        }
      `}</style>

      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
        style={{
          opacity: sidebarOpen ? 1 : swipeOpenOffset > 0 ? swipeOpenOffset / 320 : 0,
          pointerEvents: sidebarOpen ? 'auto' : swipeOpenOffset > 0 ? 'auto' : 'none'
        }}
      />
      
      <div 
        ref={sidebarRef}
        className={`sidebar-panel ${sidebarOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Главное меню"
        style={{
          transform: sidebarOpen 
            ? `translateX(${-swipeOffset}px)` 
            : swipeOpenOffset > 0
              ? `translateX(calc(-100% + ${swipeOpenOffset}px))`
              : 'translateX(-100%)',
          transition: swipeOpenOffset > 0 ? 'none' : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sidebar-gradient-line" />

        <div style={{ 
          padding: '60px 24px 28px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <UserAvatar
                  photoUrl={user?.photo_url}
                  firstName={user?.first_name}
                  size="md"
                  className="ring-2 ring-white/10"
                />
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#22C55E',
                  border: '2px solid #0C0C0E'
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#FAFAFA',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.first_name || 'Гость'}
                </p>
                
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.15) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.25)'
                      }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#A78BFA',
                          letterSpacing: '0.02em'
                        }}>
                          LVL 1
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: '#52525B'
                      }}>
                        Новичок
                      </span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#71717A'
                    }}>
                      0/100 XP
                    </span>
                  </div>
                  
                  <div className="progress-bar">
                    <div className="progress-fill" />
                    <div className="progress-shimmer" />
                  </div>
                </div>
              </div>
            </div>
            <button
              ref={firstFocusableRef}
              onClick={closeSidebar}
              className="close-btn"
              aria-label="Закрыть меню"
              data-testid="button-close-sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4L14 14M14 4L4 14" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <p style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              Статус вашего проекта
            </p>
            
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FAFAFA',
                  letterSpacing: '-0.01em'
                }}>
                  Разработка приложения
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#71717A'
                }}>
                  0%
                </span>
              </div>
              
              <div style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.08)',
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: '2%',
                  borderRadius: '2px',
                  background: '#A78BFA',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                {[
                  { name: 'Бриф', num: 1, active: true },
                  { name: 'Дизайн', num: 2, active: false },
                  { name: 'Код', num: 3, active: false },
                  { name: 'Запуск', num: 4, active: false }
                ].map((stage) => (
                  <div key={stage.name} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: stage.active 
                        ? 'rgba(167, 139, 250, 0.15)'
                        : 'rgba(255,255,255,0.04)',
                      border: stage.active 
                        ? '1.5px solid rgba(167, 139, 250, 0.4)'
                        : '1.5px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: stage.active ? '#A78BFA' : '#52525B'
                      }}>
                        {stage.num}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: stage.active ? 600 : 500,
                      color: stage.active ? '#A1A1AA' : '#52525B',
                      textAlign: 'center'
                    }}>
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <nav style={{ padding: '24px 16px', flex: 1 }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#52525B',
            textTransform: 'uppercase',
            padding: '0 16px',
            marginBottom: '12px'
          }}>
            Навигация
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const active = isActive(item.routes);
              const isPressed = pressedItem === item.section;
              
              return (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item.section)}
                  className={`menu-item ${active ? 'active' : ''} ${isPressed ? 'pressed' : ''}`}
                  data-testid={`button-nav-${item.section || 'home'}`}
                >
                  {active && <div className="menu-item-glow" />}
                  
                  <div className="menu-icon-wrap">
                    <item.icon 
                      size={20} 
                      color={isPressed || active ? '#A78BFA' : '#71717A'} 
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: isPressed || active ? 600 : 500,
                      color: isPressed || active ? '#FAFAFA' : '#A1A1AA',
                      display: 'block'
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#52525B',
                      marginTop: '2px',
                      display: 'block'
                    }}>
                      {item.description}
                    </span>
                  </div>
                  
                  <ChevronRight 
                    size={16} 
                    color={active ? '#A78BFA' : '#3F3F46'}
                    style={{ opacity: active ? 1 : 0.5 }}
                  />
                </button>
              );
            })}
          </div>
          
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            margin: '16px 0'
          }} />
          
          <button
            onClick={() => handleNavClick('profile')}
            className={`menu-item ${isProfileActive ? 'active' : ''} ${isProfilePressed ? 'pressed' : ''}`}
            data-testid="button-nav-profile"
          >
            {isProfileActive && <div className="menu-item-glow" />}
            
            <div style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserAvatar
                photoUrl={user?.photo_url}
                firstName={user?.first_name}
                size="sm"
                className={isProfilePressed || isProfileActive ? 'ring-2 ring-violet-400/40' : ''}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: '15px',
                fontWeight: isProfilePressed || isProfileActive ? 600 : 500,
                color: isProfilePressed || isProfileActive ? '#FAFAFA' : '#A1A1AA',
                display: 'block'
              }}>
                Мой профиль
              </span>
              <span style={{
                fontSize: '11px',
                color: '#52525B',
                marginTop: '2px',
                display: 'block'
              }}>
                Награды и достижения
              </span>
            </div>
            
            <ChevronRight 
              size={16} 
              color={isProfileActive ? '#A78BFA' : '#3F3F46'}
              style={{ opacity: isProfileActive ? 1 : 0.5 }}
            />
          </button>
        </nav>
        
        <div style={{
          margin: '0 16px 16px',
          padding: '20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.06) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }} />
          
          <div style={{ position: 'relative' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: '#A78BFA',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              Декабрь 2025
            </p>
            <p style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FAFAFA',
              letterSpacing: '-0.03em',
              lineHeight: 1
            }}>
              3 слота
            </p>
            <p style={{
              fontSize: '13px',
              color: '#71717A',
              marginTop: '6px'
            }}>
              осталось на этот месяц
            </p>
          </div>
        </div>
        
        <div style={{ 
          padding: '16px 20px',
          marginTop: 'auto'
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px'
            }}>
              <Sparkles size={18} color="#A78BFA" />
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#FAFAFA'
              }}>
                Boost with <span style={{ color: '#A78BFA' }}>AI</span>
              </span>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#71717A',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              ИИ-ассистент для бизнеса: ответы 24/7, рост продаж на 300%
            </p>
            
            <button
              onClick={() => handleNavClick('ai-process')}
              className="boost-btn"
              data-testid="button-upgrade-pro"
            >
              <div className="boost-btn-glow" />
              <span style={{
                position: 'relative',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                letterSpacing: '0.02em'
              }}>
                Узнать больше
              </span>
            </button>
          </div>
        </div>

        <div style={{
          padding: '20px 24px 28px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)'
        }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            Связаться с нами
          </p>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                style={{ '--hover-bg': social.hoverBg, '--hover-border': `${social.color}40` } as any}
                aria-label={social.label}
                data-testid={`link-social-${social.label.toLowerCase().replace(' ', '-')}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = social.hoverBg;
                  e.currentTarget.style.borderColor = `${social.color}40`;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${social.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <social.icon size={22} color={social.color} />
              </a>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#71717A'
              }}>
                Web4TG Studio
              </p>
              <p style={{
                fontSize: '11px',
                color: '#3F3F46',
                marginTop: '2px'
              }}>
                2025
              </p>
            </div>
            <div style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#22C55E',
                letterSpacing: '0.02em'
              }}>
                ONLINE
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="top-bar">
        <div className="max-w-md mx-auto px-5 pt-12 pb-4 flex items-center justify-between gap-4">
          <AnimatedHamburgerIcon 
            ref={triggerButtonRef}
            isOpen={sidebarOpen} 
            onClick={() => sidebarOpen ? closeSidebar() : openSidebar()} 
          />
          
          <p style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: '#FAFAFA',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            WEB4TG STUDIO
          </p>
          
          <div style={{ width: '44px' }} />
        </div>
      </div>
    </>
  );
}
