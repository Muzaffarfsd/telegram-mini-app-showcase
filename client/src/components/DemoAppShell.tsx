import { useState, Suspense, memo, useEffect } from "react";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
import { demoApps } from "../data/demoApps";
import { useTelegram } from "../hooks/useTelegram";
import { getDemoComponent, isDemoAvailable } from "./demos/DemoRegistry";
import { LiquidHomeButton } from "./ui/liquid-home-button";
import { scrollToTop } from "@/hooks/useScrollToTop";

interface DemoAppShellProps {
  demoId: string;
  onClose: () => void;
}

type TabType = 'home' | 'catalog' | 'cart' | 'profile';

const DemoAppShell = memo(function DemoAppShell({ demoId, onClose }: DemoAppShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { hapticFeedback } = useTelegram();
  
  // Scroll to top when demo opens
  useEffect(() => {
    scrollToTop();
  }, [demoId]);
  
  // Scroll to top when tab changes
  useEffect(() => {
    scrollToTop();
  }, [activeTab]);
  
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
    scrollToTop(); // Scroll to top on tab change
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

  return (
    <>
      <div className={`min-h-screen flex flex-col ${isDarkTheme ? 'bg-[#0A0A0A]' : 'bg-gray-100'}`}>
        {/* Mobile Container - Max width for desktop view */}
        <div className={`w-full max-w-md mx-auto ${isDarkTheme ? 'bg-[#0A0A0A]' : 'bg-white'} min-h-screen flex flex-col relative shadow-2xl`}>
          
          {/* Demo Content Area - Telegram safe area bottom with GPU optimization */}
          <div 
            className="flex-1 tg-content-safe-bottom" 
            style={{ paddingBottom: 'max(6rem, var(--csab, 0px))' }} 
            data-testid="demo-content"
            data-scroll-container="true"
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

      {/* Premium Glass Bottom Navigation - Main Page Style */}
      <div 
        className="fixed bottom-6 left-0 right-0 flex justify-center z-50"
        style={{ isolation: 'isolate' }}
      >
        <div className="relative">
          {/* Subtle outer glow */}
          <div 
            className="absolute -inset-2 rounded-[36px] pointer-events-none"
            style={{
              boxShadow: '0 0 40px 5px rgba(16, 185, 129, 0.08)',
            }}
          />
          
          {/* Deep shadow */}
          <div 
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              transform: 'translateY(4px)',
            }}
          />
          
          {/* Main Glass Container */}
          <nav 
            className="relative flex items-center gap-1 rounded-[28px] px-3 py-2"
            style={{
              background: 'rgba(35, 35, 40, 0.6)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            role="navigation" 
            aria-label="Навигация демо"
          >
            {/* Top highlight line */}
            <div 
              className="absolute inset-x-4 top-0 h-[1px] pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
              }}
            />
          
            {/* Главная */}
            <button
              onClick={() => handleTabSwitch('home')}
              className="relative flex items-center justify-center w-12 h-12 rounded-full"
              aria-label="Главная"
              aria-current={activeTab === 'home' ? 'page' : undefined}
              data-testid="nav-home"
            >
              {activeTab === 'home' && (
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    boxShadow: 'inset 0 0 8px rgba(16, 185, 129, 0.2)',
                  }}
                />
              )}
              <Home
                className={`transition-all duration-200 ${
                  activeTab === 'home' ? 'w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'w-6 h-6 text-white/80'
                }`}
                strokeWidth={activeTab === 'home' ? 2.5 : 1.75}
              />
            </button>
            
            {/* Каталог */}
            <button
              onClick={() => handleTabSwitch('catalog')}
              className="relative flex items-center justify-center w-12 h-12 rounded-full"
              aria-label="Каталог"
              aria-current={activeTab === 'catalog' ? 'page' : undefined}
              data-testid="nav-catalog"
            >
              {activeTab === 'catalog' && (
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    boxShadow: 'inset 0 0 8px rgba(16, 185, 129, 0.2)',
                  }}
                />
              )}
              <Grid3X3
                className={`transition-all duration-200 ${
                  activeTab === 'catalog' ? 'w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'w-6 h-6 text-white/80'
                }`}
                strokeWidth={activeTab === 'catalog' ? 2.5 : 1.75}
              />
            </button>
            
            {/* Корзина */}
            <button
              onClick={() => handleTabSwitch('cart')}
              className="relative flex items-center justify-center w-12 h-12 rounded-full"
              aria-label="Корзина"
              aria-current={activeTab === 'cart' ? 'page' : undefined}
              data-testid="nav-cart"
            >
              {activeTab === 'cart' && (
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    boxShadow: 'inset 0 0 8px rgba(16, 185, 129, 0.2)',
                  }}
                />
              )}
              <ShoppingCart
                className={`transition-all duration-200 ${
                  activeTab === 'cart' ? 'w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'w-6 h-6 text-white/80'
                }`}
                strokeWidth={activeTab === 'cart' ? 2.5 : 1.75}
              />
            </button>
            
            {/* Профиль */}
            <button
              onClick={() => handleTabSwitch('profile')}
              className="relative flex items-center justify-center w-12 h-12 rounded-full"
              aria-label="Профиль"
              aria-current={activeTab === 'profile' ? 'page' : undefined}
              data-testid="nav-profile"
            >
              {activeTab === 'profile' && (
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    boxShadow: 'inset 0 0 8px rgba(16, 185, 129, 0.2)',
                  }}
                />
              )}
              <User
                className={`transition-all duration-200 ${
                  activeTab === 'profile' ? 'w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'w-6 h-6 text-white/80'
                }`}
                strokeWidth={activeTab === 'profile' ? 2.5 : 1.75}
              />
            </button>
          </nav>
        </div>
      </div>
    </>
  );
});

export default DemoAppShell;
