import { useState, Suspense, memo, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
import { demoApps } from "../data/demoApps";
import { useTelegram } from "../hooks/useTelegram";
import { getDemoComponent, isDemoAvailable } from "./demos/DemoRegistry";
import { LiquidHomeButton } from "./ui/liquid-home-button";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { useLanguage } from "../contexts/LanguageContext";

interface DemoAppShellProps {
  demoId: string;
  onClose: () => void;
}

type TabType = 'home' | 'catalog' | 'cart' | 'profile';

interface DemoTheme {
  background: string;
  isDark: boolean;
  activeIconColor: string;
  inactiveIconColor: string;
  navOverlay: string;
}

const darkTheme: DemoTheme = {
  background: '#0A0A0A',
  isDark: true,
  activeIconColor: '#fff',
  inactiveIconColor: 'rgba(255,255,255,0.45)',
  navOverlay: 'rgba(20, 20, 22, 0.65)',
};

const lightTheme: DemoTheme = {
  background: '#F5F3F0',
  isDark: false,
  activeIconColor: 'rgba(0,0,0,0.85)',
  inactiveIconColor: 'rgba(0,0,0,0.35)',
  navOverlay: 'rgba(255, 255, 255, 0.65)',
};

const demoThemes: Record<string, Partial<DemoTheme>> = {
  'florist': { background: '#FDF8F5', isDark: false },
  'tea-house': { background: '#FAF6F1', isDark: false },
  'interior-lux': { background: '#F5F3F0', isDark: false },
  'clothing-store': { background: '#0A0A0A', isDark: true },
  'electronics': { background: '#0A0A0A', isDark: true },
  'beauty': { background: '#0A0A0A', isDark: true },
  'restaurant': { background: '#0A0A0A', isDark: true },
  'luxury-watches': { background: '#0A0A0A', isDark: true },
  'sneaker-store': { background: '#0A0A0A', isDark: true },
  'luxury-perfume': { background: '#0A0A0A', isDark: true },
  'futuristic-fashion-1': { background: '#0A0A0A', isDark: true },
  'futuristic-fashion-2': { background: '#000000', isDark: true },
  'futuristic-fashion-3': { background: '#0A0A0A', isDark: true },
  'futuristic-fashion-4': { background: '#0A0A0A', isDark: true },
};

const getTheme = (demoId: string): DemoTheme => {
  const custom = demoThemes[demoId] || {};
  const base = custom.isDark === false ? lightTheme : darkTheme;
  return { ...base, ...custom };
};

const DemoLiquidGlassFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
    <filter id="demo-glass-distortion" x="-5%" y="-5%" width="110%" height="110%" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.015" numOctaves="2" seed="23" result="turbulence" />
      <feGaussianBlur in="turbulence" stdDeviation="4" result="softMap" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale="6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

interface DemoNavTabProps {
  onClick: () => void;
  isActive: boolean;
  ariaLabel: string;
  testId: string;
  label: string;
  activeColor: string;
  inactiveColor: string;
  children: React.ReactNode;
}

const DemoNavTab = ({ onClick, isActive, ariaLabel, testId, label, activeColor, inactiveColor, children }: DemoNavTabProps) => (
  <button
    type="button"
    className="relative z-30 flex items-center justify-center rounded-[14px] gpu-layer"
    style={{
      height: '44px',
      minWidth: '44px',
      appearance: 'none',
      border: 'none',
      background: isActive ? (activeColor === '#fff' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)') : 'transparent',
      padding: isActive ? '0 14px' : '0 12px',
      outline: 'none',
      cursor: 'pointer',
      gap: isActive ? '7px' : '0',
      transition: 'background 0.22s ease-out, padding 0.28s ease-out, gap 0.28s ease-out',
      WebkitTapHighlightColor: 'transparent',
    }}
    onClick={onClick}
    aria-label={ariaLabel}
    data-testid={testId}
  >
    <div className="relative z-10 flex-shrink-0 nav-tab-icon">
      {children}
    </div>
    <span
      className="relative z-10 leading-none overflow-hidden whitespace-nowrap"
      style={{
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: activeColor,
        maxWidth: isActive ? '80px' : '0',
        opacity: isActive ? 1 : 0,
        transition: 'max-width 0.28s ease-out, opacity 0.18s ease-out',
      }}
    >
      {label}
    </span>
  </button>
);

const DemoAppShell = memo(function DemoAppShell({ demoId, onClose }: DemoAppShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { hapticFeedback } = useTelegram();
  const { t } = useLanguage();
  
  // Scroll to top when demo opens
  useEffect(() => {
    scrollToTop();
  }, [demoId]);
  
  const getBaseAppType = useCallback((id: string): string => {
    return id.replace(/-\d+$/, '');
  }, []);

  const demoApp = useMemo(() => 
    demoApps.find(app => app.id === demoId) || 
    demoApps.find(app => app.id === getBaseAppType(demoId)),
    [demoId, getBaseAppType]
  );
  
  if (!demoApp) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mx-4 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">{t('demo.notFound')}</h3>
          <p className="text-sm text-white/50">
            {t('demo.appUnavailable')}
          </p>
        </div>
      </div>
    );
  }

  const handleTabSwitch = useCallback((tab: TabType) => {
    setActiveTab(tab);
    scrollToTop();
    if (hapticFeedback?.selection) {
      queueMicrotask(() => hapticFeedback.selection());
    }
  }, [hapticFeedback]);

  const handleStringNavigation = useCallback((tab: string) => {
    handleTabSwitch(tab as TabType);
  }, [handleTabSwitch]);

  const handleNavigateHome = useCallback(() => {
    window.location.hash = '#/';
    if (hapticFeedback?.medium) {
      queueMicrotask(() => hapticFeedback.medium());
    }
  }, [hapticFeedback]);

  // No loading screen - instant load
  const DemoLoader = () => null;

  const renderDemoContent = () => {
    // First try exact ID match, then fallback to base type
    const exactMatch = isDemoAvailable(demoId);
    const baseAppType = exactMatch ? demoId : getBaseAppType(demoId);
    
    // Check if demo is available in registry
    if (!isDemoAvailable(baseAppType)) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mx-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">{t('demo.unavailable')}</h3>
            <p className="text-sm text-white/50">
              {t('demo.appTypeUnavailable').replace('{type}', baseAppType)}
            </p>
          </div>
        </div>
      );
    }

    // Get dynamic component from registry
    const DemoComponent = getDemoComponent(baseAppType);
    
    if (!DemoComponent) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mx-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">{t('demo.loadError')}</h3>
            <p className="text-sm text-white/50">
              {t('demo.loadErrorDesc')}
            </p>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={null}>
        <DemoComponent activeTab={activeTab} onTabChange={handleStringNavigation} />
      </Suspense>
    );
    
  };

  // Get theme for current demo
  const baseAppType = getBaseAppType(demoId);
  const theme = getTheme(baseAppType);

  return (
    <>
      {/* Fixed background layer - covers entire viewport including bottom edge */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: theme.background }} />
      
      {/* ALWAYS add 'dark' class to force dark CSS variables for ALL demos, regardless of main app theme */}
      <div className="demo-app-shell dark min-h-screen flex flex-col" style={{ backgroundColor: theme.background }}>
        {/* Mobile Container - Max width for desktop view */}
        <div className="w-full max-w-md mx-auto min-h-screen flex flex-col relative shadow-2xl" style={{ backgroundColor: theme.background }}>
          
          {/* Demo Content Area - Telegram safe area bottom with GPU optimization */}
          <div 
            className="flex-1 tg-content-safe-bottom" 
            style={{ paddingBottom: 'max(6rem, var(--csab, 0px))' }} 
            data-testid="demo-content"
            data-scroll-container="true"
          >
            {renderDemoContent()}
          </div>

          </div>
      </div>

      {/* Fixed UI via Portal - bypasses all transform/contain ancestors */}
      {createPortal(
        <>
          <DemoLiquidGlassFilter />

          {/* Fixed Home Button */}
          <div 
            className="fixed z-[9999] pointer-events-none flex justify-end"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(100%, 448px)',
              paddingRight: '16px',
              bottom: 'calc(100px + max(0px, env(safe-area-inset-bottom, 0px)))',
            }}
          >
            <div className="pointer-events-auto">
              <LiquidHomeButton onNavigateHome={handleNavigateHome} />
            </div>
          </div>

          {/* Bottom Navigation — Liquid Glass */}
          <div 
            className="fixed bottom-0 left-0 right-0 flex justify-center z-[9999]"
            style={{ 
              isolation: 'isolate',
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '8px',
            }}
          >
            <nav 
              className="relative flex items-center rounded-[22px] gpu-layer"
              style={{
                padding: '5px 6px',
                gap: '2px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0,0,0,0.1)',
                background: theme.navOverlay,
              }}
              role="navigation" 
              aria-label={t('nav.navigation')}
            >
              <div 
                className="absolute inset-0 z-0 rounded-[22px] pointer-events-none"
                style={{
                  backdropFilter: 'blur(40px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
                  filter: 'url(#demo-glass-distortion)',
                }}
              />
              <div 
                className="absolute inset-0 z-10 rounded-[22px] pointer-events-none"
                style={{
                  boxShadow: theme.isDark
                    ? 'inset 0 0.5px 0 rgba(255,255,255,0.10), inset 0 -0.5px 0 rgba(255,255,255,0.04)'
                    : 'inset 0 0.5px 0 rgba(255,255,255,0.40), inset 0 -0.5px 0 rgba(0,0,0,0.04)',
                  border: theme.isDark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.06)',
                }}
              />

              <DemoNavTab
                onClick={() => handleTabSwitch('home')}
                isActive={activeTab === 'home'}
                ariaLabel={t('nav.home')}
                testId="nav-home"
                label={t('nav.home')}
                activeColor={theme.activeIconColor}
                inactiveColor={theme.inactiveIconColor}
              >
                <Home
                  className="w-[21px] h-[21px]"
                  style={{
                    color: activeTab === 'home' ? theme.activeIconColor : theme.inactiveIconColor,
                    transition: 'color 0.2s ease-out',
                  }}
                  strokeWidth={activeTab === 'home' ? 2 : 1.5}
                />
              </DemoNavTab>

              <DemoNavTab
                onClick={() => handleTabSwitch('catalog')}
                isActive={activeTab === 'catalog'}
                ariaLabel={t('nav.catalog')}
                testId="nav-catalog"
                label={t('nav.catalog')}
                activeColor={theme.activeIconColor}
                inactiveColor={theme.inactiveIconColor}
              >
                <Grid3X3
                  className="w-[21px] h-[21px]"
                  style={{
                    color: activeTab === 'catalog' ? theme.activeIconColor : theme.inactiveIconColor,
                    transition: 'color 0.2s ease-out',
                  }}
                  strokeWidth={activeTab === 'catalog' ? 2 : 1.5}
                />
              </DemoNavTab>

              <DemoNavTab
                onClick={() => handleTabSwitch('cart')}
                isActive={activeTab === 'cart'}
                ariaLabel={t('nav.cart')}
                testId="nav-cart"
                label={t('nav.cart')}
                activeColor={theme.activeIconColor}
                inactiveColor={theme.inactiveIconColor}
              >
                <ShoppingCart
                  className="w-[21px] h-[21px]"
                  style={{
                    color: activeTab === 'cart' ? theme.activeIconColor : theme.inactiveIconColor,
                    transition: 'color 0.2s ease-out',
                  }}
                  strokeWidth={activeTab === 'cart' ? 2 : 1.5}
                />
              </DemoNavTab>

              <DemoNavTab
                onClick={() => handleTabSwitch('profile')}
                isActive={activeTab === 'profile'}
                ariaLabel={t('nav.profile')}
                testId="nav-profile"
                label={t('nav.profile')}
                activeColor={theme.activeIconColor}
                inactiveColor={theme.inactiveIconColor}
              >
                <User
                  className="w-[21px] h-[21px]"
                  style={{
                    color: activeTab === 'profile' ? theme.activeIconColor : theme.inactiveIconColor,
                    transition: 'color 0.2s ease-out',
                  }}
                  strokeWidth={activeTab === 'profile' ? 2 : 1.5}
                />
              </DemoNavTab>
            </nav>
          </div>
        </>,
        document.body
      )}
    </>
  );
});

export default DemoAppShell;
