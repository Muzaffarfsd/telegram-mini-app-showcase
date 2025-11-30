import { useState, Suspense, memo, useEffect } from "react";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
import { demoApps } from "../data/demoApps";
import { useTelegram } from "../hooks/useTelegram";
import { getDemoComponent, isDemoAvailable } from "./demos/DemoRegistry";
import { LiquidHomeButton } from "./ui/liquid-home-button";

interface DemoAppShellProps {
  demoId: string;
  onClose: () => void;
}

type TabType = 'home' | 'catalog' | 'cart' | 'profile';

const navItems: { id: TabType; icon: any; label: string }[] = [
  { id: 'home', icon: Home, label: 'Главная' },
  { id: 'catalog', icon: Grid3X3, label: 'Каталог' },
  { id: 'cart', icon: ShoppingCart, label: 'Корзина' },
  { id: 'profile', icon: User, label: 'Профиль' },
];

const DemoAppShell = memo(function DemoAppShell({ demoId, onClose }: DemoAppShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { hapticFeedback } = useTelegram();
  
  // Scroll to top when demo opens - single optimized call
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [demoId]);
  
  // Extract base app type from ID to support variants (e.g., 'clothing-store-2' → 'clothing-store')
  const getBaseAppType = (id: string): string => {
    // Remove variant suffixes (-2, -3, etc.) to get base type
    return id.replace(/-\d+$/, '');
  };

  // Find demo app - first try exact match, then base type fallback
  const demoApp = demoApps.find(app => app.id === demoId) || 
                  demoApps.find(app => app.id === getBaseAppType(demoId));
  
  if (!demoApp) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mx-4 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Демо не найдено</h3>
          <p className="text-sm text-white/50">
            Приложение временно недоступно
          </p>
        </div>
      </div>
    );
  }

  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
    if (hapticFeedback?.selection) {
      hapticFeedback.selection();
    }
  };

  const handleStringNavigation = (tab: string) => {
    const tabType = tab as TabType;
    handleTabSwitch(tabType);
  };

  // Navigate to main app (showcase page) using hash-based routing
  const handleNavigateHome = () => {
    window.location.hash = '#/';
    if (hapticFeedback?.medium) {
      hapticFeedback.medium();
    }
  };

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
            <h3 className="text-lg font-semibold text-white mb-2">Демо недоступно</h3>
            <p className="text-sm text-white/50">
              Приложение {baseAppType} временно недоступно
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
            <h3 className="text-lg font-semibold text-white mb-2">Ошибка загрузки</h3>
            <p className="text-sm text-white/50">
              Не удалось загрузить приложение
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

  // All apps use dark theme by default for premium look
  const isDarkTheme = true;
  
  // Theme colors for each app
  const getThemeColors = () => {
    if (demoId.includes('clothing-store')) {
      return {
        accentColor: '#C5E1A5',
        glowColor: 'rgba(197, 225, 165, 0.6)',
      };
    } else if (demoId.includes('electronics')) {
      return {
        accentColor: '#00D4FF',
        glowColor: 'rgba(0, 212, 255, 0.6)',
      };
    } else if (demoId.includes('beauty')) {
      return {
        accentColor: '#EC4899',
        glowColor: 'rgba(236, 72, 153, 0.6)',
      };
    } else if (demoId.includes('restaurant')) {
      return {
        accentColor: '#D97706',
        glowColor: 'rgba(217, 119, 6, 0.6)',
      };
    }
    return {
      accentColor: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.6)',
    };
  };
  
  const theme = getThemeColors();
  
  // Get background gradient based on app - all dark by default
  const getBackgroundGradient = () => {
    // All demos use pure black background for consistent dark premium look
    return 'bg-[#0A0A0A]';
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkTheme ? 'bg-[#0A0A0A]' : 'bg-gray-100'}`}>
      {/* Mobile Container - Max width for desktop view */}
      <div className={`w-full max-w-md mx-auto ${isDarkTheme ? getBackgroundGradient() : 'bg-white'} min-h-screen flex flex-col relative shadow-2xl`}>
        
        {/* Demo Content Area - Telegram safe area bottom */}
        <div className="flex-1 tg-content-safe-bottom" style={{ paddingBottom: 'max(6rem, var(--csab, 0px))' }} data-testid="demo-content">
          {renderDemoContent()}
        </div>

        {/* Sticky Home Button */}
        <div 
          className="sticky right-5 z-50 pointer-events-none"
          style={{
            bottom: 'calc(100px + max(0px, env(safe-area-inset-bottom, 0px)))',
            marginLeft: 'auto',
            width: 'fit-content'
          }}
        >
          <div className="pointer-events-auto">
            <LiquidHomeButton onNavigateHome={handleNavigateHome} />
          </div>
        </div>
      </div>

      {/* Liquid Glass Bottom Navigation - Same style as main page */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto">
        <div className="relative">
          {/* Animated Background Glow */}
          <div 
            className="absolute -inset-2 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${theme.glowColor} 0%, ${theme.glowColor.replace('0.6', '0.2')} 50%, transparent 70%)`,
              filter: 'blur(20px)',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          />
          
          {/* Liquid Glass Container */}
          <div 
            className={`relative backdrop-blur-xl rounded-full border px-4 py-3 shadow-2xl ${
              isDarkTheme 
                ? 'border-white/20' 
                : 'border-white/30'
            }`}
            style={{
              background: isDarkTheme 
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
              boxShadow: isDarkTheme 
                ? `0 8px 32px rgba(0, 0, 0, 0.6),
                   inset 0 1px 0 rgba(255, 255, 255, 0.2),
                   inset 0 -1px 0 rgba(0, 0, 0, 0.3),
                   0 0 60px ${theme.glowColor.replace('0.6', '0.15')}`
                : `0 8px 32px rgba(0, 0, 0, 0.4),
                   inset 0 1px 0 rgba(255, 255, 255, 0.3),
                   inset 0 -1px 0 rgba(0, 0, 0, 0.2),
                   0 0 60px ${theme.glowColor.replace('0.6', '0.2')}`,
            }}
          >
            {/* Inner Highlight */}
            <div 
              className="absolute top-1 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
            />
            
            <nav className="relative flex items-center justify-center gap-2" role="navigation" aria-label="Навигация демо">
              {/* Liquid Glass Blob - анимированная капля под активной иконкой */}
              <div 
                className="absolute transition-all duration-500 ease-out pointer-events-none"
                style={{
                  left: activeTab === 'home' ? '-2px' :
                        activeTab === 'catalog' ? '54px' :
                        activeTab === 'cart' ? '110px' :
                        activeTab === 'profile' ? '166px' : '-2px',
                  top: '-2px',
                  width: '52px',
                  height: '52px',
                  zIndex: 1,
                }}
              >
                {/* Основной слой капли */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse 100% 90% at 50% 45%, ${theme.glowColor.replace('0.6', '0.35')} 0%, ${theme.glowColor.replace('0.6', '0.22')} 40%, transparent 70%)`,
                    borderRadius: '45% 55% 50% 50% / 50% 50% 45% 55%',
                    filter: 'blur(12px)',
                    animation: 'liquid-morph 4s ease-in-out infinite',
                  }}
                />
                {/* Второй слой капли */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at center, ${theme.glowColor.replace('0.6', '0.28')} 0%, ${theme.glowColor.replace('0.6', '0.15')} 50%, transparent 70%)`,
                    borderRadius: '50% 45% 55% 50% / 55% 50% 50% 45%',
                    filter: 'blur(16px)',
                    animation: 'liquid-morph-reverse 5s ease-in-out infinite',
                  }}
                />
                {/* Внутреннее свечение */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at center, ${theme.glowColor.replace('0.6', '0.4')} 0%, ${theme.glowColor.replace('0.6', '0.18')} 30%, transparent 60%)`,
                    borderRadius: '50%',
                    filter: 'blur(8px)',
                  }}
                />
              </div>
              
              {/* Главная */}
              <button
                onClick={() => handleTabSwitch('home')}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-white/10'
                }`}
                style={{ zIndex: 10 }}
                aria-label="Главная"
                aria-current={activeTab === 'home' ? 'page' : undefined}
                data-testid="nav-home"
              >
                <Home
                  className={`transition-all duration-300 ${
                    activeTab === 'home' 
                      ? 'w-6 h-6' 
                      : 'w-5 h-5'
                  } ${
                    isDarkTheme 
                      ? (activeTab === 'home' ? 'text-white' : 'text-white/70 hover:text-white')
                      : (activeTab === 'home' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')
                  }`}
                  strokeWidth={2}
                />
              </button>
              
              {/* Каталог */}
              <button
                onClick={() => handleTabSwitch('catalog')}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-white/10'
                }`}
                style={{ zIndex: 10 }}
                aria-label="Каталог"
                aria-current={activeTab === 'catalog' ? 'page' : undefined}
                data-testid="nav-catalog"
              >
                <Grid3X3
                  className={`transition-all duration-300 ${
                    activeTab === 'catalog' 
                      ? 'w-6 h-6' 
                      : 'w-5 h-5'
                  } ${
                    isDarkTheme 
                      ? (activeTab === 'catalog' ? 'text-white' : 'text-white/70 hover:text-white')
                      : (activeTab === 'catalog' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')
                  }`}
                  strokeWidth={2}
                />
              </button>
              
              {/* Корзина */}
              <button
                onClick={() => handleTabSwitch('cart')}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-white/10'
                }`}
                style={{ zIndex: 10 }}
                aria-label="Корзина"
                aria-current={activeTab === 'cart' ? 'page' : undefined}
                data-testid="nav-cart"
              >
                <ShoppingCart
                  className={`transition-all duration-300 ${
                    activeTab === 'cart' 
                      ? 'w-6 h-6' 
                      : 'w-5 h-5'
                  } ${
                    isDarkTheme 
                      ? (activeTab === 'cart' ? 'text-white' : 'text-white/70 hover:text-white')
                      : (activeTab === 'cart' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')
                  }`}
                  strokeWidth={2}
                />
              </button>
              
              {/* Профиль */}
              <button
                onClick={() => handleTabSwitch('profile')}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-white/10'
                }`}
                style={{ zIndex: 10 }}
                aria-label="Профиль"
                aria-current={activeTab === 'profile' ? 'page' : undefined}
                data-testid="nav-profile"
              >
                <User
                  className={`transition-all duration-300 ${
                    activeTab === 'profile' 
                      ? 'w-6 h-6' 
                      : 'w-5 h-5'
                  } ${
                    isDarkTheme 
                      ? (activeTab === 'profile' ? 'text-white' : 'text-white/70 hover:text-white')
                      : (activeTab === 'profile' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')
                  }`}
                  strokeWidth={2}
                />
              </button>
              
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DemoAppShell;
