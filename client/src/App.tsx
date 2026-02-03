import { useState, Suspense, lazy, useCallback, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useTelegram } from "./hooks/useTelegram";
import { useTelegramButtons } from "./hooks/useTelegramButtons";
import { Home, ShoppingCart, Briefcase, Bot, Sun, Moon, Languages } from "lucide-react";
import { useTheme } from "./hooks/useTheme";
import { trackDemoView } from "./hooks/useGamification";
import UserAvatar from "./components/UserAvatar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageLoadingFallback } from "./components/PageLoadingFallback";
import { useRouting, navigate } from "./hooks/useRouting";
import { useScrollHaptic } from "./hooks/useScrollHaptic";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useNavigationTracking } from "./hooks/usePredictivePrefetch";

// Retry wrapper for dynamic imports - handles chunk loading failures after deploys
function lazyWithRetry<T extends { default: any }>(
  importFn: () => Promise<T>,
  retries = 2
): React.LazyExoticComponent<T["default"]> {
  return lazy(() =>
    importFn().catch((error) => {
      if (retries > 0 && error.message?.includes('Failed to fetch dynamically imported module')) {
        console.warn('[Lazy] Retrying chunk load...', retries);
        return new Promise<T>((resolve) => {
          setTimeout(() => resolve(lazyWithRetry(importFn, retries - 1) as any), 500);
        });
      }
      // Last resort: reload page to get fresh chunks
      if (error.message?.includes('Failed to fetch dynamically imported module')) {
        console.error('[Lazy] Chunk load failed, reloading page');
        window.location.reload();
      }
      throw error;
    })
  );
}

// Sentry init deferred to after first paint
const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    import('@sentry/react').then(Sentry => {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      });
    });
  }
};

// Lazy load providers - not needed for first paint
const LazyRewardsProvider = lazy(() => import("./contexts/RewardsContext").then(m => ({ default: m.RewardsProvider })));
const LazyXPNotificationProvider = lazy(() => import("./contexts/XPNotificationContext").then(m => ({ default: m.XPNotificationProvider })));
const LazyMotionProvider = lazy(() => import("./utils/LazyMotionProvider").then(m => ({ default: m.LazyMotionProvider })));

// Lazy load ALL pages with retry logic for chunk loading failures after deploys
const ShowcasePage = lazyWithRetry(() => import("./components/ShowcasePage"));
const ProjectsPage = lazyWithRetry(() => import("./components/ProjectsPage"));
const AboutPage = lazyWithRetry(() => import("./components/AboutPage"));
const DemoAppLanding = lazyWithRetry(() => import("./components/DemoAppLanding"));
const ConstructorPage = lazyWithRetry(() => import("./components/ConstructorPage"));
const ProfilePage = lazyWithRetry(() => import("./components/ProfilePage"));
const CheckoutPage = lazyWithRetry(() => import("./components/CheckoutPage"));
const DemoAppShell = lazyWithRetry(() => import("./components/DemoAppShell"));
const HelpPage = lazyWithRetry(() => import("./components/HelpPage"));
const ReviewPage = lazyWithRetry(() => import("./components/ReviewPage"));
const AIAgentPage = lazyWithRetry(() => import("./components/AIAgentPage"));
const AIProcessPage = lazyWithRetry(() => import("./components/AIProcessPage"));
const PhotoGallery = lazyWithRetry(() => import("./pages/PhotoGallery"));
const NotFoundPage = lazyWithRetry(() => import("./pages/NotFound"));
const ReferralProgram = lazy(() => import("./components/ReferralProgram").then(m => ({ default: m.ReferralProgram })));
const GamificationHub = lazy(() => import("./components/GamificationHub").then(m => ({ default: m.GamificationHub })));
const EarningPage = lazy(() => import("./components/EarningPage").then(m => ({ default: m.EarningPage })));
const NotificationsPage = lazyWithRetry(() => import("./pages/notifications"));
const AnalyticsPage = lazyWithRetry(() => import("./pages/analytics"));

// Global components - lazy loaded for faster first paint
const GlobalSidebar = lazy(() => import("./components/GlobalSidebar"));
const OnboardingTutorial = lazy(() => import("./components/OnboardingTutorial").then(m => ({ default: m.OnboardingTutorial })));
const OfflineIndicator = lazy(() => import("./components/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));
const PageTransition = lazy(() => import("./components/PageTransition").then(m => ({ default: m.PageTransition })));

const goBack = () => {
  window.history.back();
};

// Premium Glass navigation button with spring physics
interface NavButtonProps {
  onClick: () => void;
  isActive: boolean;
  ariaLabel: string;
  testId: string;
  children: React.ReactNode;
}

const NavButton = ({ onClick, isActive, ariaLabel, testId, children }: NavButtonProps) => {
  // INP Optimization: Use CSS transitions for instant visual feedback instead of spring physics
  // This ensures immediate visual response on touch/click without waiting for JS animation frames
  
  return (
    <button
      className="nav-button-instant relative flex items-center justify-center w-12 h-12 rounded-full gpu-layer"
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {/* Active background */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            boxShadow: 'inset 0 0 8px rgba(16, 185, 129, 0.2)',
          }}
        />
      )}
      
      {/* Icon */}
      {children}
    </button>
  );
};

// Language toggle button component
const LanguageToggleButton = () => {
  const { language, setLanguage } = useLanguage();
  const { hapticFeedback } = useTelegram();
  
  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
    hapticFeedback.light();
  };
  
  return (
    <button
      onClick={toggleLanguage}
      className="relative flex items-center justify-center w-10 h-10 rounded-full nav-button-instant"
      style={{
        background: 'rgba(99, 102, 241, 0.15)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      }}
      aria-label={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
      data-testid="button-language-toggle"
    >
      <span className="text-xs font-bold text-white/90 uppercase tracking-wide">
        {language === 'ru' ? 'EN' : 'RU'}
      </span>
    </button>
  );
};

// Component to sync Telegram buttons with language (must be inside LanguageProvider)
const TelegramButtonsSync = ({ routeComponent }: { routeComponent: string }) => {
  useTelegramButtons(routeComponent as any);
  return null;
};

function App() {
  const [orderData, setOrderData] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const { hapticFeedback, user } = useTelegram();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  // Custom hooks for cleaner code
  const { route } = useRouting();
  const { trackNavigation } = useNavigationTracking();
  
  // Scroll haptics hook available for manual edge bounce triggers (auto-detection removed to prevent conflicts)
  useScrollHaptic();
  
  // Track navigation for predictive prefetching
  useEffect(() => {
    if (route && route.component) {
      trackNavigation(route.component);
    }
  }, [route?.component, trackNavigation]);
  
  // Deferred initialization after first paint
  useEffect(() => {
    setIsHydrated(true);
    // Init Sentry after hydration
    initSentry();

    // Optimization for Telegram Mini App performance
    if (window.Telegram?.WebApp) {
      document.body.classList.add('tg-app-optimized');
    }
  }, []);

  // Navigation handlers - memoized for better performance with React.memo children
  const handleNavigate = useCallback((section: string, data?: any) => {
    if (data) {
      setOrderData(data);
    } else if (section !== 'checkout') {
      setOrderData(null);
    }
    
    navigate(`/${section}`);
    hapticFeedback.light();
  }, [hapticFeedback]);

  const handleOpenDemo = useCallback((demoId: string) => {
    navigate(`/demos/${demoId}/app`);
    hapticFeedback.medium();
    // Track demo view for gamification
    trackDemoView();
  }, [hapticFeedback]);

  const handleOpenDemoApp = useCallback((demoId: string) => {
    navigate(`/demos/${demoId}/app`);
    hapticFeedback.medium();
  }, [hapticFeedback]);

  const handleCloseDemo = useCallback(() => {
    // Navigate back to the main showcase page
    navigate('/');
    hapticFeedback.light();
  }, [hapticFeedback]);

  const handleCheckoutBack = useCallback(() => {
    setOrderData(null);
    navigate('/constructor');
    hapticFeedback.light();
  }, [hapticFeedback]);

  const handlePaymentSuccess = useCallback(() => {
    setOrderData(null);
    navigate('/profile');
    hapticFeedback.medium();
  }, [hapticFeedback]);

  // No loading screen - instant load
  const PageLoader = useCallback(() => null, []);

  // Route component rendering with Suspense - shows loading spinner for code-split pages
  const renderRoute = () => {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        {(() => {
          switch (route.component) {
            case 'showcase':
              return <ShowcasePage onOpenDemo={handleOpenDemo} onNavigate={handleNavigate} />;
            
            case 'projects':
              return <ProjectsPage onNavigate={handleNavigate} onOpenDemo={handleOpenDemo} />;
            
            case 'about':
              return <AboutPage onNavigate={handleNavigate} />;
            
            case 'demoLanding':
              const demoId = route.params?.id;
              if (!demoId) {
                return (
                  <div className="max-w-md mx-auto px-4 py-6">
                    <h1 className="ios-title font-bold mb-4">Ошибка</h1>
                    <p className="ios-body text-secondary-label">ID демо не указан</p>
                    <button 
                      onClick={() => navigate('/')} 
                      className="mt-4 ios-button-filled"
                    >
                      Назад к главной
                    </button>
                  </div>
                );
              }
              return <DemoAppLanding demoId={demoId} />;
            
            case 'demoApp':
              return <DemoAppShell demoId={route.params?.id!} onClose={handleCloseDemo} />;
            
            case 'constructor':
              return <ConstructorPage onNavigate={handleNavigate} />;
            
            case 'profile':
              return <ProfilePage onNavigate={handleNavigate} />;
            
            case 'help':
              return <HelpPage onBack={() => navigate('/profile')} />;
            
            case 'review':
              return <ReviewPage onBack={() => navigate('/profile')} />;
            
            case 'checkout':
              if (!orderData) {
                navigate('/constructor');
                return null;
              }
              return (
                <CheckoutPage 
                  selectedFeatures={orderData.selectedFeatures || []}
                  projectName={orderData.projectName || ''}
                  totalAmount={orderData.totalAmount || 0}
                  onBack={handleCheckoutBack}
                  onSuccess={handlePaymentSuccess}
                />
              );
            
            case 'aiAgent':
              return <AIAgentPage onNavigate={handleNavigate} />;
            
            case 'aiProcess':
              return <AIProcessPage onNavigate={handleNavigate} />;
            
            case 'photoGallery':
              return <PhotoGallery />;
            
            case 'referral':
              return <ReferralProgram />;
            
            case 'rewards':
              return <GamificationHub />;
            
            case 'earning':
              return <EarningPage onNavigate={handleNavigate} />;
            
            case 'notifications':
              return <NotificationsPage />;
            
            case 'analytics':
              return <AnalyticsPage />;
            
            case 'notFound':
              return <NotFoundPage />;
            
            // Always show showcase page as default fallback
            default:
              return <ShowcasePage onOpenDemo={handleOpenDemo} onNavigate={handleNavigate} />;
          }
        })()} 
      </Suspense>
    );
  };

  // Check if we should show bottom navigation
  const shouldShowBottomNav = !route.component.includes('demo') && route.component !== 'notFound';
  
  // Pages that should show the global sidebar (all except demo apps)
  const shouldShowSidebar = !route.component.includes('demo') && route.component !== 'notFound';

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
      {/* Sync Telegram native buttons with language changes */}
      <TelegramButtonsSync routeComponent={route.component} />
      <Suspense fallback={null}>
        <LazyMotionProvider>
          <LazyRewardsProvider>
            <LazyXPNotificationProvider>
              <div className="relative min-h-screen">
                <div className="floating-elements"></div>
                
                {/* Global Sidebar for all pages except demo apps */}
                {shouldShowSidebar && (
                  <ErrorBoundary fallback={null}>
                    <GlobalSidebar 
                      currentRoute={route.component} 
                      onNavigate={handleNavigate}
                      user={user}
                    />
                  </ErrorBoundary>
                )}
                
                <div className="pb-36" data-scroll="main">
                  <PageTransition routeKey={`${route.component}-${route.params?.id || ''}`} variant="fade">
                    <ErrorBoundary>
                      <Suspense fallback={<PageLoadingFallback />}>
                        {renderRoute()}
                      </Suspense>
                    </ErrorBoundary>
                  </PageTransition>
                </div>
              </div>
            
              {/* SVG Filter for Liquid Glass Refraction Effect */}
              <svg className="absolute" style={{ width: 0, height: 0 }}>
                <defs>
                  <filter id="liquid-refraction" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="1" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
              </svg>

              {/* Bottom Navigation - Premium Glass */}
              {shouldShowBottomNav && (
                <ErrorBoundary fallback={null}>
                  <div 
                    className="fixed bottom-6 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-bottom-4 duration-300"
                    style={{ isolation: 'isolate' }}
                  >
                  <div className="relative">
                    {/* Subtle outer glow */}
                    <div 
                      className="absolute -inset-2 rounded-[32px] pointer-events-none"
                      style={{
                        boxShadow: isDark ? '0 0 40px 5px rgba(16, 185, 129, 0.08)' : '0 0 30px 5px rgba(16, 185, 129, 0.05)',
                      }}
                    />
                    
                    {/* Deep shadow */}
                    <div 
                      className="absolute inset-0 rounded-[24px] pointer-events-none"
                      style={{
                        boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : '0 15px 35px -10px rgba(0, 0, 0, 0.15)',
                        transform: 'translateY(4px)',
                      }}
                    />
                    
                    {/* Main Glass Container */}
                    <nav 
                      className="relative flex items-center gap-0.5 rounded-[24px] px-2 py-1.5 gpu-layer"
                      style={{
                        background: isDark ? 'rgba(30, 30, 35, 0.85)' : 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: isDark 
                          ? 'inset 0 1px 1px rgba(255, 255, 255, 0.12), inset 0 -1px 1px rgba(0, 0, 0, 0.15)'
                          : '0 4px 24px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
                      }}
                      role="navigation" 
                      aria-label="Главное меню"
                    >
                      {/* Top highlight line */}
                      <div 
                        className="absolute inset-x-4 top-0 h-[1px] pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                        }}
                      />
                    
                    {/* Главная */}
                    <NavButton
                      onClick={() => {navigate('/'); hapticFeedback.light();}}
                      isActive={route.component === 'showcase'}
                      ariaLabel="Главная страница"
                      testId="nav-showcase"
                    >
                      <Home
                        className={`w-6 h-6 transition-all duration-200 ${
                          route.component === 'showcase' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isDark ? 'text-white/80' : 'text-slate-600'
                        }`}
                        strokeWidth={route.component === 'showcase' ? 2.5 : 1.75}
                      />
                    </NavButton>
                    
                    {/* ИИ Агент */}
                    <NavButton
                      onClick={() => {navigate('/ai-process'); hapticFeedback.light();}}
                      isActive={route.component === 'aiProcess' || route.component === 'aiAgent'}
                      ariaLabel="ИИ агенты для бизнеса"
                      testId="nav-ai"
                    >
                      <Bot
                        className={`w-6 h-6 transition-all duration-200 ${
                          route.component === 'aiProcess' || route.component === 'aiAgent' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isDark ? 'text-white/80' : 'text-slate-600'
                        }`}
                        strokeWidth={route.component === 'aiProcess' || route.component === 'aiAgent' ? 2.5 : 1.75}
                      />
                    </NavButton>
                    
                    {/* Витрина */}
                    <NavButton
                      onClick={() => {navigate('/projects'); hapticFeedback.light();}}
                      isActive={route.component === 'projects'}
                      ariaLabel="Витрина проектов"
                      testId="nav-projects"
                    >
                      <Briefcase
                        className={`w-6 h-6 transition-all duration-200 ${
                          route.component === 'projects' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isDark ? 'text-white/80' : 'text-slate-600'
                        }`}
                        strokeWidth={route.component === 'projects' ? 2.5 : 1.75}
                      />
                    </NavButton>
                    
                    {/* Заказать */}
                    <NavButton
                      onClick={() => {navigate('/constructor'); hapticFeedback.light();}}
                      isActive={route.component === 'constructor'}
                      ariaLabel="Заказать проект"
                      testId="nav-constructor"
                    >
                      <ShoppingCart
                        className={`w-6 h-6 transition-all duration-200 ${
                          route.component === 'constructor' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isDark ? 'text-white/80' : 'text-slate-600'
                        }`}
                        strokeWidth={route.component === 'constructor' ? 2.5 : 1.75}
                      />
                    </NavButton>
                    
                    {/* Профиль */}
                    <NavButton
                      onClick={() => {navigate('/profile'); hapticFeedback.light();}}
                      isActive={['profile', 'referral', 'rewards', 'earning'].includes(route.component)}
                      ariaLabel="Профиль пользователя"
                      testId="nav-profile"
                    >
                      <UserAvatar
                        photoUrl={user?.photo_url}
                        firstName={user?.first_name}
                        size="sm"
                        className={`w-7 h-7 transition-all duration-200 ${
                          ['profile', 'referral', 'rewards', 'earning'].includes(route.component) ? 'ring-2 ring-emerald-400/40' : 'opacity-80'
                        }`}
                      />
                    </NavButton>
                    
                    {/* Разделитель */}
                    <div className="w-px h-8 mx-1" style={{ background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)' }} />
                    
                    {/* Language Toggle */}
                    <LanguageToggleButton />
                    
                    {/* iOS 26 Liquid Glass разделитель */}
                    <div 
                      className="flex items-center justify-center mx-1"
                      style={{ width: '3px', height: '20px' }}
                    >
                      <div 
                        style={{ 
                          width: '3px', 
                          height: '3px', 
                          borderRadius: '50%',
                          background: isDark 
                            ? 'rgba(255,255,255,0.4)' 
                            : 'rgba(0,0,0,0.25)',
                          boxShadow: isDark 
                            ? '0 0 6px rgba(255,255,255,0.3)' 
                            : '0 0 4px rgba(0,0,0,0.15)'
                        }} 
                      />
                    </div>
                    
                    {/* Переключатель темы - яркий и заметный */}
                    <button
                      onClick={() => { toggleTheme(); hapticFeedback.medium(); }}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full"
                      style={{
                        background: isDark 
                          ? 'linear-gradient(145deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)' 
                          : 'linear-gradient(145deg, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.4) 100%)',
                        border: isDark 
                          ? '1px solid rgba(139,92,246,0.4)' 
                          : '1px solid rgba(245,158,11,0.6)',
                        boxShadow: isDark 
                          ? '0 0 12px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
                          : '0 0 12px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                      }}
                      aria-label="Переключить тему"
                      data-testid="button-theme-toggle-mobile"
                    >
                      <div className="relative w-5 h-5">
                        {/* Солнце */}
                        <Sun 
                          className="absolute inset-0 w-5 h-5"
                          style={{
                            color: '#FBBF24',
                            opacity: isDark ? 0 : 1,
                            filter: isDark ? 'none' : 'drop-shadow(0 0 4px rgba(251,191,36,0.6))',
                            transition: 'opacity 0.15s ease-out',
                          }}
                          strokeWidth={2.5}
                        />
                        {/* Луна */}
                        <Moon 
                          className="absolute inset-0 w-5 h-5"
                          style={{
                            color: '#C4B5FD',
                            opacity: isDark ? 1 : 0,
                            filter: 'drop-shadow(0 0 4px rgba(196,181,253,0.6))',
                            transition: 'opacity 0.15s ease-out',
                          }}
                          strokeWidth={2.5}
                        />
                      </div>
                      {/* Twinkling stars - visible in dark mode */}
                      {isDark && (
                        <>
                          {[
                            { size: 3, top: 8, left: 8 },
                            { size: 2.5, top: 28, left: 10 },
                            { size: 2, top: 18, left: 6 },
                            { size: 2.5, top: 12, left: 32 },
                            { size: 2, top: 26, left: 30 },
                          ].map((star, i) => (
                            <span
                              key={i}
                              style={{
                                position: 'absolute',
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                background: '#FFFFFF',
                                borderRadius: '50%',
                                top: `${star.top}px`,
                                left: `${star.left}px`,
                                boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.9)`,
                                animation: `twinkleMobile ${1.8 + i * 0.3}s ease-in-out infinite`,
                                animationDelay: `${i * 0.2}s`,
                                pointerEvents: 'none',
                              }}
                            />
                          ))}
                        </>
                      )}
                      <style>{`
                        @keyframes twinkleMobile {
                          0%, 100% { opacity: 0.2; transform: scale(0.8); }
                          50% { opacity: 1; transform: scale(1.2); }
                        }
                      `}</style>
                    </button>
                    </nav>
                  </div>
                  </div>
                </ErrorBoundary>
              )}

          
              <Toaster />
              
              {/* Offline status indicator - lazy loaded */}
              <Suspense fallback={null}>
                <OfflineIndicator />
              </Suspense>
              
              {/* Onboarding tutorial for new users - lazy loaded */}
              <Suspense fallback={null}>
                <OnboardingTutorial />
              </Suspense>
            </LazyXPNotificationProvider>
          </LazyRewardsProvider>
        </LazyMotionProvider>
      </Suspense>
    </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;