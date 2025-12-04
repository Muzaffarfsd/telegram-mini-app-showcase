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
    <>
      <div className={`min-h-screen flex flex-col ${isDarkTheme ? 'bg-[#0A0A0A]' : 'bg-gray-100'}`}>
        {/* Mobile Container - Max width for desktop view */}
        <div className={`w-full max-w-md mx-auto ${isDarkTheme ? getBackgroundGradient() : 'bg-white'} min-h-screen flex flex-col relative shadow-2xl`}>
          
          {/* Demo Content Area - Telegram safe area bottom with GPU optimization */}
          <div 
            className="flex-1 tg-content-safe-bottom" 
            style={{ paddingBottom: 'max(6rem, var(--csab, 0px))' }} 
            data-testid="demo-content"
          >
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
      </div>

      {/* Liquid Glass Bottom Navigation - Premium glass design */}
      <nav 
        className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-3 overflow-hidden"
        style={{ 
          bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(255, 255, 255, 0.06) 100%), rgba(18, 18, 20, 0.92)',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        role="navigation" 
        aria-label="Навигация демо"
      >
        {/* Главная */}
        <button
          onClick={() => handleTabSwitch('home')}
          className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/10"
          aria-label="Главная"
          aria-current={activeTab === 'home' ? 'page' : undefined}
          data-testid="nav-home"
        >
          <Home
            className={`transition-all duration-300 ${activeTab === 'home' ? 'w-6 h-6 text-white' : 'w-5 h-5 text-white/60'}`}
            strokeWidth={2}
          />
          {activeTab === 'home' && (
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
                filter: 'blur(8px)',
                zIndex: -1,
              }}
            />
          )}
        </button>
        
        {/* Каталог */}
        <button
          onClick={() => handleTabSwitch('catalog')}
          className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/10"
          aria-label="Каталог"
          aria-current={activeTab === 'catalog' ? 'page' : undefined}
          data-testid="nav-catalog"
        >
          <Grid3X3
            className={`transition-all duration-300 ${activeTab === 'catalog' ? 'w-6 h-6 text-white' : 'w-5 h-5 text-white/60'}`}
            strokeWidth={2}
          />
          {activeTab === 'catalog' && (
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
                filter: 'blur(8px)',
                zIndex: -1,
              }}
            />
          )}
        </button>
        
        {/* Корзина */}
        <button
          onClick={() => handleTabSwitch('cart')}
          className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/10"
          aria-label="Корзина"
          aria-current={activeTab === 'cart' ? 'page' : undefined}
          data-testid="nav-cart"
        >
          <ShoppingCart
            className={`transition-all duration-300 ${activeTab === 'cart' ? 'w-6 h-6 text-white' : 'w-5 h-5 text-white/60'}`}
            strokeWidth={2}
          />
          {activeTab === 'cart' && (
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
                filter: 'blur(8px)',
                zIndex: -1,
              }}
            />
          )}
        </button>
        
        {/* Профиль */}
        <button
          onClick={() => handleTabSwitch('profile')}
          className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/10"
          aria-label="Профиль"
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          data-testid="nav-profile"
        >
          <User
            className={`transition-all duration-300 ${activeTab === 'profile' ? 'w-6 h-6 text-white' : 'w-5 h-5 text-white/60'}`}
            strokeWidth={2}
          />
          {activeTab === 'profile' && (
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
                filter: 'blur(8px)',
                zIndex: -1,
              }}
            />
          )}
        </button>
      </nav>
    </>
  );
});

export default DemoAppShell;
