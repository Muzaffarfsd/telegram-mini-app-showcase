import { useState, useCallback, useEffect, useRef, forwardRef, memo, useMemo } from "react";
import { Sparkles, MessageCircle, Bot, Users, Home, Send, ChevronRight, Bell, BarChart3 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { SiInstagram, SiTelegram } from "react-icons/si";
import UserAvatar from "./UserAvatar";
import { useLanguage } from "../contexts/LanguageContext";

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
  ariaLabel: string;
}

const AnimatedHamburgerIcon = memo(forwardRef<HTMLButtonElement, AnimatedHamburgerIconProps>(
  ({ isOpen, onClick, ariaLabel }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const rippleRef = useRef<HTMLSpanElement>(null);
    const rippleTimeoutRef = useRef<number | null>(null);
    
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (rippleRef.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        rippleRef.current.style.left = `${x}px`;
        rippleRef.current.style.top = `${y}px`;
        rippleRef.current.classList.remove('active');
        void rippleRef.current.offsetWidth;
        rippleRef.current.classList.add('active');
        
        if (rippleTimeoutRef.current) {
          clearTimeout(rippleTimeoutRef.current);
        }
        rippleTimeoutRef.current = window.setTimeout(() => {
          rippleRef.current?.classList.remove('active');
        }, 500);
      }
      onClick();
    }, [onClick]);
    
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);
    
    const className = useMemo(() => 
      `hamburger-btn ${isOpen ? 'open' : ''} ${isHovered ? 'hovered' : ''}`,
      [isOpen, isHovered]
    );
    
    return (
      <button
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        data-testid="button-hamburger"
      >
        <div className="hamburger-glow" />
        <div className="hamburger-shine" />
        <div className="hamburger-border-glow" />
        <span ref={rippleRef} className="hamburger-ripple" />
        
        <div className="hamburger-icon">
          <span className={`hamburger-line line-1 ${isOpen ? 'open' : ''}`} />
          <span className={`hamburger-line line-2 ${isOpen ? 'open' : ''}`} />
          <span className={`hamburger-line line-3 ${isOpen ? 'open' : ''}`} />
        </div>
      </button>
    );
  }
));

AnimatedHamburgerIcon.displayName = 'AnimatedHamburgerIcon';

export default function GlobalSidebar({ currentRoute, onNavigate, user }: GlobalSidebarProps) {
  const { toggleTheme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  // Sync Telegram Secondary Button with language changes
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.SecondaryButton) {
        tg.SecondaryButton.setText(t('actions.share'));
      }
    } catch (e) {}
  }, [language, t]);
  const [isAnimating, setIsAnimating] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
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

  // iOS 26 Design System - Professional Theme Colors
  const colors = useMemo(() => {
    if (isDark) {
      // Dark Theme - Glass morphism with emerald accent
      return {
        // Text hierarchy
        textPrimary: '#FFFFFF',
        textSecondary: 'rgba(255, 255, 255, 0.7)',
        textMuted: 'rgba(255, 255, 255, 0.45)',
        textLabel: 'rgba(255, 255, 255, 0.55)',
        
        // iOS System accent
        accent: '#A78BFA',
        accentLight: 'rgba(167, 139, 250, 0.15)',
        accentBorder: 'rgba(167, 139, 250, 0.3)',
        
        // Surfaces - Glass effect
        panelBg: 'rgba(28, 28, 30, 0.85)',
        cardBg: 'rgba(255, 255, 255, 0.04)',
        cardBorder: 'rgba(255, 255, 255, 0.08)',
        cardShadow: 'none',
        
        // Interactive states
        hoverBg: 'rgba(255, 255, 255, 0.06)',
        activeBg: 'rgba(167, 139, 250, 0.12)',
        
        // Progress & indicators
        progressBg: 'rgba(255, 255, 255, 0.1)',
        progressFill: 'linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%)',
        
        // Semantic
        success: '#34C759',
        sectionBorder: 'rgba(255, 255, 255, 0.06)',
        avatarRing: 'rgba(255, 255, 255, 0.15)',
        onlineDot: '#30D158',
        onlineDotBorder: 'rgba(0, 0, 0, 0.9)',
      };
    } else {
      // Light Theme - iOS 26 "Stacked Sheets" with excellent contrast
      return {
        // Text hierarchy - High contrast for readability
        textPrimary: '#1C1C1E',           // Deep black for maximum readability
        textSecondary: '#3C3C43',          // Dark gray - very readable
        textMuted: '#636366',              // Medium gray - still readable
        textLabel: '#8E8E93',              // System gray - visible labels
        
        // iOS System Blue
        accent: '#007AFF',
        accentLight: 'rgba(0, 122, 255, 0.12)',
        accentBorder: 'rgba(0, 122, 255, 0.25)',
        
        // Surfaces - Clean white with subtle depth
        panelBg: '#FFFFFF',
        cardBg: '#F2F2F7',                 // iOS system gray 6
        cardBorder: 'rgba(0, 0, 0, 0.08)',
        cardShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)',
        
        // Interactive states
        hoverBg: 'rgba(0, 0, 0, 0.04)',
        activeBg: 'rgba(0, 122, 255, 0.12)',
        
        // Progress & indicators
        progressBg: 'rgba(0, 0, 0, 0.08)',
        progressFill: 'linear-gradient(90deg, #007AFF 0%, #5856D6 100%)',
        
        // Semantic
        success: '#34C759',
        sectionBorder: 'rgba(0, 0, 0, 0.08)',
        avatarRing: 'rgba(0, 0, 0, 0.1)',
        onlineDot: '#30D158',
        onlineDotBorder: '#FFFFFF',
      };
    }
  }, [isDark]);

  // Monochrome icon colors - professional and minimal
  const iconStyle = isDark 
    ? { color: '#A1A1AA', bg: 'rgba(255, 255, 255, 0.06)' }
    : { color: '#6B7280', bg: 'rgba(0, 0, 0, 0.05)' };
  
  const menuItems = [
    { 
      icon: Home, 
      label: t('sidebar.home'), 
      section: '', 
      routes: ['showcase'],
      description: t('sidebar.allFeatures'),
    },
    { 
      icon: Sparkles, 
      label: t('sidebar.businessApps'), 
      section: 'projects', 
      routes: ['projects'],
      description: t('sidebar.readySolutions'),
    },
    { 
      icon: Bot, 
      label: t('sidebar.aiForBusiness'), 
      section: 'ai-process', 
      routes: ['aiProcess', 'aiAgent'],
      description: t('sidebar.automation247'),
    },
    { 
      icon: Users, 
      label: t('sidebar.aboutStudio'), 
      section: 'about', 
      routes: ['about'],
      description: t('sidebar.ourTeam'),
    },
    { 
      icon: MessageCircle, 
      label: t('sidebar.orderProject'), 
      section: 'constructor', 
      routes: ['constructor', 'checkout'],
      description: t('sidebar.customSolution'),
    },
    { 
      icon: Bell, 
      label: t('sidebar.notifications'), 
      section: 'notifications', 
      routes: ['notifications'],
      description: t('sidebar.telegramBotApi'),
    },
    { 
      icon: BarChart3, 
      label: t('sidebar.analytics'), 
      section: 'analytics', 
      routes: ['analytics'],
      description: t('sidebar.businessMetrics'),
    },
  ];

  // Social links use muted colors
  const socialIconColor = isDark ? '#71717A' : '#9CA3AF';
  const socialLinks = [
    { 
      icon: SiInstagram, 
      label: 'Instagram', 
      url: 'https://instagram.com/web4tg',
    },
    { 
      icon: SiTelegram, 
      label: t('sidebar.telegramChannel'), 
      url: 'https://t.me/web4_tg',
    },
    { 
      icon: Send, 
      label: t('sidebar.consultation'), 
      url: 'https://t.me/web4tgs',
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
    // Activate if touch starts within 80px of left edge (larger zone for easier access)
    if (touch.clientX <= 80 && !sidebarOpen) {
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
        /* ═══════════════════════════════════════════════════════════════
           iOS 26 LIQUID GLASS HAMBURGER - OPTIMIZED PROFESSIONAL EDITION
           GPU-Accelerated with contain and transform3d
           ═══════════════════════════════════════════════════════════════ */
        
        /* Hamburger Button - Main Container */
        .hamburger-btn {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.2s ease,
                      border-color 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: visible;
          isolation: isolate;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
        
        /* Ambient Glow Effect */
        .hamburger-glow {
          position: absolute;
          inset: -50%;
          background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
          transform: translate3d(0, 0, 0);
        }
        
        .hamburger-btn.hovered .hamburger-glow,
        .hamburger-btn.open .hamburger-glow {
          opacity: 1;
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate3d(0, 0, 0) scale(1.1); opacity: 1; }
        }
        
        /* Glass Shine Effect */
        .hamburger-shine {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 25%, transparent 50%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.08) 100%);
          pointer-events: none;
          z-index: 1;
        }
        
        /* Animated Border Glow */
        .hamburger-border-glow {
          position: absolute;
          inset: -6px;
          border-radius: 24px;
          background: conic-gradient(from 0deg, transparent 0deg, rgba(139,92,246,0.6) 60deg, rgba(167,139,250,0.9) 120deg, transparent 180deg, rgba(139,92,246,0.6) 240deg, rgba(167,139,250,0.7) 300deg, transparent 360deg);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
          filter: blur(6px);
          transform: translate3d(0, 0, 0);
        }
        
        .hamburger-btn.open .hamburger-border-glow {
          opacity: 1;
          animation: rotate-border 3s linear infinite;
        }
        
        @keyframes rotate-border {
          to { transform: translate3d(0, 0, 0) rotate(360deg); }
        }
        
        /* Ripple Effect - Single reusable element */
        .hamburger-ripple {
          position: absolute;
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          transform: translate3d(-50%, -50%, 0) scale(0);
          pointer-events: none;
          z-index: 2;
          opacity: 0;
        }
        
        .hamburger-ripple.active {
          animation: ripple-expand 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes ripple-expand {
          0% { transform: translate3d(-50%, -50%, 0) scale(0); opacity: 1; }
          100% { transform: translate3d(-50%, -50%, 0) scale(10); opacity: 0; }
        }
        
        /* Hover State */
        .hamburger-btn.hovered {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translate3d(0, 0, 0) scale(1.02);
        }
        
        /* Open State */
        .hamburger-btn.open {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);
        }
        
        /* Active/Press State */
        .hamburger-btn:active {
          transform: translate3d(0, 0, 0) scale(0.9) !important;
          transition-duration: 0.1s;
        }
        
        /* Hamburger Icon Container */
        .hamburger-icon {
          width: 22px;
          height: 16px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          z-index: 3;
          contain: layout style;
        }
        
        /* Hamburger Lines - GPU Optimized */
        .hamburger-line {
          display: block;
          height: 2.5px;
          background: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, #fff 50%, rgba(255,255,255,0.9) 100%);
          border-radius: 3px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 0.35s cubic-bezier(0.68, -0.6, 0.32, 1.6),
                      opacity 0.25s ease,
                      background 0.25s ease;
          transform-origin: center;
          backface-visibility: hidden;
        }
        
        .hamburger-line.line-1 {
          width: 100%;
          transform: translate3d(0, 0, 0);
        }
        
        .hamburger-line.line-2 {
          width: 70%;
          align-self: flex-end;
          transform: translate3d(0, 0, 0);
        }
        
        .hamburger-line.line-3 {
          width: 100%;
          transform: translate3d(0, 0, 0);
        }
        
        /* Hover animation for lines */
        .hamburger-btn.hovered .hamburger-line.line-2 {
          width: 100%;
        }
        
        /* Open State - X Transform */
        .hamburger-line.line-1.open {
          transform: translate3d(0, 6.75px, 0) rotate(45deg);
          width: 100%;
          background: linear-gradient(90deg, #A78BFA 0%, #C4B5FD 50%, #A78BFA 100%);
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
        }
        
        .hamburger-line.line-2.open {
          opacity: 0;
          transform: translate3d(10px, 0, 0) scaleX(0);
        }
        
        .hamburger-line.line-3.open {
          transform: translate3d(0, -6.75px, 0) rotate(-45deg);
          width: 100%;
          background: linear-gradient(90deg, #A78BFA 0%, #C4B5FD 50%, #A78BFA 100%);
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
        }
        
        /* ═══════════════════════════════════════════════════════════════
           SIDEBAR OVERLAY - OPTIMIZED
           ═══════════════════════════════════════════════════════════════ */
        
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.6);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          transform: translate3d(0, 0, 0);
          will-change: opacity;
        }
        
        .sidebar-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        
        /* ═══════════════════════════════════════════════════════════════
           SIDEBAR PANEL - OPTIMIZED
           ═══════════════════════════════════════════════════════════════ */
        
        .sidebar-panel {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          z-index: 101;
          width: min(320px, calc(100vw - 48px));
          background: rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(60px) saturate(200%) brightness(0.98);
          -webkit-backdrop-filter: blur(60px) saturate(200%) brightness(0.98);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 20px 0 60px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow-y: scroll;
          overflow-x: visible;
          overscroll-behavior: contain;
          transform: translate3d(-100%, 0, 0);
          transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
          -webkit-overflow-scrolling: touch;
          contain: strict;
          will-change: transform;
        }
        
        .sidebar-panel.open {
          transform: translate3d(0, 0, 0);
        }
        
        /* Top Gradient Line - Simplified */
        .sidebar-gradient-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 10%, rgba(167,139,250,0.6) 30%, rgba(196,181,253,0.8) 50%, rgba(167,139,250,0.6) 70%, rgba(139,92,246,0.3) 90%, transparent 100%);
          opacity: 0;
          transform: translate3d(0, 0, 0) scaleX(0);
          transition: opacity 0.4s ease 0.15s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s;
        }
        
        .sidebar-panel.open .sidebar-gradient-line {
          opacity: 1;
          transform: translate3d(0, 0, 0) scaleX(1);
        }
        
        /* ═══════════════════════════════════════════════════════════════
           MENU ITEMS - OPTIMIZED
           ═══════════════════════════════════════════════════════════════ */
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 16px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.2s ease,
                      border-color 0.2s ease;
          position: relative;
          width: 100%;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
          overflow: hidden;
          contain: layout style;
          transform: translate3d(0, 0, 0);
        }
        
        .menu-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.06);
        }
        
        .menu-item:active {
          transform: translate3d(2px, 0, 0) scale(0.97);
        }
        
        .menu-item.active {
          background: linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(167,139,250,0.06) 100%);
          border-color: rgba(139, 92, 246, 0.2);
        }
        
        /* Active Indicator Glow */
        .menu-item-glow {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translate3d(0, -50%, 0);
          width: 3px;
          height: 28px;
          border-radius: 0 6px 6px 0;
          background: linear-gradient(180deg, #C4B5FD 0%, #A78BFA 30%, #8B5CF6 70%, #7C3AED 100%);
          box-shadow: 0 0 16px rgba(139, 92, 246, 0.7);
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 
              0 0 20px rgba(139, 92, 246, 0.8),
              0 0 40px rgba(139, 92, 246, 0.4);
          }
          50% { 
            box-shadow: 
              0 0 30px rgba(139, 92, 246, 1),
              0 0 60px rgba(139, 92, 246, 0.6);
          }
        }
        
        /* Icon Container */
        .menu-icon-wrap {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.06);
          contain: layout style;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        
        .menu-icon-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 50%
          );
          pointer-events: none;
        }
        
        .menu-item:hover .menu-icon-wrap {
          background: rgba(255, 255, 255, 0.08);
        }
        
        .menu-item.active .menu-icon-wrap {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.25) 0%,
            rgba(167, 139, 250, 0.15) 100%
          );
          border-color: rgba(139, 92, 246, 0.35);
          box-shadow: 
            0 4px 20px rgba(139, 92, 246, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        /* ═══════════════════════════════════════════════════════════════
           SOCIAL LINKS - PROFESSIONAL
           ═══════════════════════════════════════════════════════════════ */
        
        .social-link {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
        }
        
        .social-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 50%
          );
          pointer-events: none;
        }
        
        .social-link:hover {
          transform: translateY(-3px) scale(1.05);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 8px 25px rgba(0, 0, 0, 0.25),
            0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .social-link:active {
          transform: scale(0.92);
        }
        
        /* ═══════════════════════════════════════════════════════════════
           BOOST BUTTON - PREMIUM
           ═══════════════════════════════════════════════════════════════ */
        
        .boost-btn {
          position: relative;
          width: 100%;
          padding: 18px 24px;
          border-radius: 16px;
          background: linear-gradient(
            135deg, 
            #7C3AED 0%, 
            #8B5CF6 35%, 
            #A78BFA 65%, 
            #8B5CF6 100%
          );
          background-size: 200% 200%;
          border: none;
          cursor: pointer;
          transition: 
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.35s ease;
          -webkit-tap-highlight-color: transparent;
          box-shadow: 
            0 6px 30px rgba(139, 92, 246, 0.5),
            0 2px 10px rgba(139, 92, 246, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          overflow: hidden;
          animation: gradient-shift 4s ease infinite;
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .boost-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.1) 30%,
            transparent 60%
          );
          pointer-events: none;
        }
        
        .boost-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 40%,
            rgba(255, 255, 255, 0.15) 50%,
            transparent 60%
          );
          animation: shine-sweep 3s ease-in-out infinite;
          pointer-events: none;
        }
        
        @keyframes shine-sweep {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        
        .boost-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 10px 40px rgba(139, 92, 246, 0.6),
            0 4px 15px rgba(139, 92, 246, 0.4);
        }
        
        .boost-btn:active {
          transform: scale(0.97);
        }
        
        /* ═══════════════════════════════════════════════════════════════
           CLOSE BUTTON - PROFESSIONAL
           ═══════════════════════════════════════════════════════════════ */
        
        .close-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
        }
        
        .close-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 50%
          );
          pointer-events: none;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(90deg) scale(1.05);
        }
        
        .close-btn:active {
          transform: rotate(90deg) scale(0.9);
        }
        
        /* ═══════════════════════════════════════════════════════════════
           PROGRESS BAR - ANIMATED
           ═══════════════════════════════════════════════════════════════ */
        
        .progress-bar {
          position: relative;
          width: 100%;
          height: 6px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        .progress-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 5%;
          border-radius: 6px;
          background: linear-gradient(
            90deg, 
            #7C3AED 0%, 
            #8B5CF6 30%, 
            #A78BFA 60%, 
            #C4B5FD 100%
          );
          box-shadow: 
            0 0 20px rgba(139, 92, 246, 0.7),
            0 0 40px rgba(139, 92, 246, 0.4);
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .progress-shimmer {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(
            90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.2) 50%, 
            transparent 100%
          );
          animation: shimmer 2s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* ═══════════════════════════════════════════════════════════════
           TOP BAR - GLASS HEADER
           ═══════════════════════════════════════════════════════════════ */
        
        .top-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 90;
          background: rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(60px) saturate(200%) brightness(0.98);
          -webkit-backdrop-filter: blur(60px) saturate(200%) brightness(0.98);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: max(env(safe-area-inset-top, 0px), 12px);
          overflow: hidden;
        }
        
        /* ═══════════════════════════════════════════════════════════════
           BREATHING ANIMATION FOR IDLE STATE
           ═══════════════════════════════════════════════════════════════ */
        
        @keyframes subtle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .hamburger-btn:not(.open):not(.hovered):not(:active) {
          animation: subtle-breathe 4s ease-in-out infinite;
        }
        
        /* ═══════════════════════════════════════════════════════════════
           LIGHT THEME OVERRIDES
           ═══════════════════════════════════════════════════════════════ */
        
        html.light .hamburger-btn {
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        html.light .hamburger-btn.hovered {
          background: rgba(0, 0, 0, 0.08);
          border-color: rgba(0, 0, 0, 0.12);
        }
        
        html.light .hamburger-line {
          background: linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%);
        }
        
        html.light .hamburger-ripple {
          background: rgba(0, 0, 0, 0.2);
        }
        
        html.light .sidebar-overlay {
          background: rgba(255, 255, 255, 0.6);
        }
        
        html.light .sidebar-panel {
          background: rgba(248, 250, 252, 0.95);
          border-right-color: rgba(0, 0, 0, 0.08);
          box-shadow: 20px 0 60px rgba(0, 0, 0, 0.1);
        }
        
        html.light .sidebar-menu-item {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.05);
          color: #1e293b;
        }
        
        html.light .sidebar-menu-item:hover,
        html.light .sidebar-menu-item.active {
          background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.05) 100%);
          border-color: rgba(59, 130, 246, 0.2);
        }
        
        html.light .sidebar-menu-item .menu-item-glow {
          background: rgba(59, 130, 246, 0.15);
        }
        
        html.light .top-bar {
          background: rgba(248, 250, 252, 0.8);
          border-bottom-color: rgba(0, 0, 0, 0.06);
        }
        
        html.light .social-link {
          background: rgba(0, 0, 0, 0.04);
          border-color: rgba(0, 0, 0, 0.06);
        }
        
        html.light .social-link:hover {
          background: rgba(0, 0, 0, 0.08);
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; filter: brightness(0.8); }
          50% { opacity: 1; filter: brightness(1.2); }
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
        className={`sidebar-panel global-sidebar-panel ${sidebarOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('sidebar.navigation')}
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
          borderBottom: `1px solid ${colors.sectionBorder}`,
          overflow: 'visible'
        }}>
          <div className="flex items-center justify-between gap-3" style={{ overflow: 'visible' }}>
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
                  border: `2px solid ${colors.onlineDotBorder}`
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: colors.textPrimary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.first_name || t('sidebar.guest')}
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
                        background: colors.accentLight,
                        border: `1px solid ${colors.accentBorder}`
                      }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: colors.accent,
                          letterSpacing: '0.02em'
                        }}>
                          LVL 1
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: colors.textMuted
                      }}>
                        {t('sidebar.beginner')}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: colors.textSecondary
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
            <AnimatedHamburgerIcon
              ref={firstFocusableRef}
              isOpen={true}
              onClick={closeSidebar}
              ariaLabel={t('sidebar.closeMenu')}
            />
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <p style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: colors.textMuted,
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              {t('sidebar.projectStatus')}
            </p>
            
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`
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
                  color: colors.textPrimary,
                  letterSpacing: '-0.01em'
                }}>
                  {t('sidebar.appDevelopment')}
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.textSecondary
                }}>
                  0%
                </span>
              </div>
              
              <div style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                background: colors.progressBg,
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: '2%',
                  borderRadius: '2px',
                  background: colors.progressFill,
                  transition: 'width 0.4s ease'
                }} />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                {[
                  { name: t('sidebar.brief'), num: 1, active: true },
                  { name: t('sidebar.design'), num: 2, active: false },
                  { name: t('sidebar.code'), num: 3, active: false },
                  { name: t('sidebar.launch'), num: 4, active: false }
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
                        ? (isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                        : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                      border: stage.active 
                        ? `1.5px solid ${isDark ? 'rgba(167, 139, 250, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`
                        : `1.5px solid ${colors.cardBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: stage.active ? colors.accent : colors.textMuted
                      }}>
                        {stage.num}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: stage.active ? 600 : 500,
                      color: stage.active ? colors.textSecondary : colors.textMuted,
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
            color: colors.textMuted,
            textTransform: 'uppercase',
            padding: '0 16px',
            marginBottom: '12px'
          }}>
            {t('sidebar.navigation')}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const active = isActive(item.routes);
              const isPressed = pressedItem === item.section;
              
              return (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item.section)}
                  className={`menu-item global-sidebar-item ${active ? 'active' : ''} ${isPressed ? 'pressed' : ''}`}
                  data-testid={`button-nav-${item.section || 'home'}`}
                >
                  {active && <div className="menu-item-glow" />}
                  
                  <div 
                    className="menu-icon-wrap"
                    style={{
                      background: iconStyle.bg,
                      borderRadius: '10px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <item.icon 
                      size={20} 
                      color={iconStyle.color} 
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: isPressed || active ? 600 : 500,
                      color: isPressed || active ? colors.textPrimary : colors.textSecondary,
                      display: 'block'
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: colors.textMuted,
                      marginTop: '2px',
                      display: 'block'
                    }}>
                      {item.description}
                    </span>
                  </div>
                  
                  <ChevronRight 
                    size={16} 
                    color={active ? colors.accent : colors.textMuted}
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
            className={`menu-item global-sidebar-item ${isProfileActive ? 'active' : ''} ${isProfilePressed ? 'pressed' : ''}`}
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
                color: isProfilePressed || isProfileActive ? colors.textPrimary : colors.textSecondary,
                display: 'block'
              }}>
                {t('sidebar.myProfile')}
              </span>
              <span style={{
                fontSize: '11px',
                color: colors.textMuted,
                marginTop: '2px',
                display: 'block'
              }}>
                {t('sidebar.rewardsAchievements')}
              </span>
            </div>
            
            <ChevronRight 
              size={16} 
              color={isProfileActive ? colors.accent : colors.textMuted}
              style={{ opacity: isProfileActive ? 1 : 0.5 }}
            />
          </button>
        </nav>
        
        <div style={{ 
          padding: '16px 20px',
          marginTop: 'auto'
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px'
            }}>
              <Sparkles size={18} color={colors.accent} />
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.textPrimary
              }}>
                Boost with <span style={{ color: colors.accent }}>AI</span>
              </span>
            </div>
            <p style={{
              fontSize: '12px',
              color: colors.textSecondary,
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              {t('sidebar.aiAssistantDesc')}
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
                {t('sidebar.learnMore')}
              </span>
            </button>
          </div>
        </div>

        <div style={{
          padding: '20px 24px 28px',
          borderTop: `1px solid ${colors.sectionBorder}`,
          background: isDark 
            ? 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.03) 100%)'
        }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: colors.textMuted,
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            {t('sidebar.contactUs')}
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
                aria-label={social.label}
                data-testid={`link-social-${social.label.toLowerCase().replace(' ', '-')}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                }}
              >
                <social.icon size={20} color={socialIconColor} />
              </a>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p 
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: colors.textSecondary
                }}
              >
                Web4TG Studio
              </p>
              <p style={{
                fontSize: '11px',
                color: colors.textMuted,
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
                color: colors.success,
                letterSpacing: '0.02em'
              }}>
                ONLINE
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="top-bar">
        <div className="max-w-md mx-auto px-5 pt-16 pb-4 flex items-center justify-between gap-4" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ marginTop: '8px' }}>
            <AnimatedHamburgerIcon 
              ref={triggerButtonRef}
              isOpen={false} 
              onClick={() => sidebarOpen ? closeSidebar() : openSidebar()} 
              ariaLabel={sidebarOpen ? t('sidebar.closeMenu') : t('sidebar.openMenu')}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: isDark ? '#FAFAFA' : '#000000',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              textShadow: isDark ? '0 0 20px rgba(255,255,255,0.1)' : 'none'
            }}>
              WEB4TG STUDIO
            </p>
          </div>
          
          <button
            ref={themeButtonRef}
            onClick={() => {
              triggerHaptic('medium');
              toggleTheme();
            }}
            data-testid="button-theme-toggle"
            className="day-night-toggle"
            style={{
              width: '52px',
              height: '28px',
              borderRadius: '14px',
              border: isDark 
                ? '1px solid rgba(255,255,255,0.15)'
                : '1px solid rgba(0,0,0,0.25)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'visible',
              background: isDark 
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.12)',
            }}
            aria-label={isDark ? t('sidebar.enableLightTheme') : t('sidebar.enableDarkTheme')}
          >
            {/* Sun/Moon orb - instant switch */}
            <div style={{
              position: 'absolute',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              top: '3px',
              left: isDark ? '27px' : '3px',
              background: isDark ? '#D4D4D8' : '#FFD93D',
              boxShadow: isDark 
                ? 'inset -2px -2px 4px rgba(0,0,0,0.15), inset 1px 1px 2px rgba(255,255,255,0.3)' 
                : '0 0 8px rgba(255,217,61,0.6)',
            }}>
              {isDark && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%' }}>
                  {/* Large crater */}
                  <div style={{ 
                    position: 'absolute', 
                    width: '7px', 
                    height: '7px', 
                    background: 'rgba(120,120,130,0.5)', 
                    borderRadius: '50%', 
                    top: '3px', 
                    left: '4px',
                    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.3)'
                  }} />
                  {/* Medium crater */}
                  <div style={{ 
                    position: 'absolute', 
                    width: '5px', 
                    height: '5px', 
                    background: 'rgba(130,130,140,0.45)', 
                    borderRadius: '50%', 
                    top: '12px', 
                    left: '12px',
                    boxShadow: 'inset 1px 1px 1px rgba(0,0,0,0.25)'
                  }} />
                  {/* Small crater */}
                  <div style={{ 
                    position: 'absolute', 
                    width: '4px', 
                    height: '4px', 
                    background: 'rgba(140,140,150,0.4)', 
                    borderRadius: '50%', 
                    top: '8px', 
                    left: '13px',
                    boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.2)'
                  }} />
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
