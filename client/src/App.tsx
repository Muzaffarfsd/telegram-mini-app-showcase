import { useState, Suspense, lazy, useCallback, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useTelegram } from "./hooks/useTelegram";
import { useTelegramButtons } from "./hooks/useTelegramButtons";
import { Home, ShoppingCart, Briefcase, Bot } from "lucide-react";

import { trackDemoView } from "./hooks/useGamification";
import UserAvatar from "./components/UserAvatar";
import { ErrorBoundary } from "./components/ErrorBoundary";
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
const PremiumAppsPage = lazyWithRetry(() => import("./components/PremiumAppsPage"));
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

import GlobalSidebar from "./components/GlobalSidebar";
import { PageTransition } from "./components/PageTransition";
const OnboardingTutorial = lazy(() => import("./components/OnboardingTutorial").then(m => ({ default: m.OnboardingTutorial })));
const OfflineIndicator = lazy(() => import("./components/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));

const goBack = () => {
  window.history.back();
};

// Liquid Glass SVG Filter — subtle refraction (iOS 26 level)
const LiquidGlassFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
    <filter id="glass-distortion" x="-5%" y="-5%" width="110%" height="110%" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.015" numOctaves="2" seed="17" result="turbulence" />
      <feGaussianBlur in="turbulence" stdDeviation="4" result="softMap" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale="6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

// Liquid Glass Nav Tab
interface NavTabProps {
  onClick: () => void;
  isActive: boolean;
  ariaLabel: string;
  testId: string;
  label: string;
  children: React.ReactNode;
}

const NavTab = ({ onClick, isActive, ariaLabel, testId, label, children }: NavTabProps) => (
  <button
    type="button"
    className="relative z-30 flex items-center justify-center rounded-[14px] gpu-layer"
    style={{
      height: '44px',
      minWidth: '44px',
      appearance: 'none',
      border: 'none',
      background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
      padding: isActive ? '0 14px' : '0 12px',
      outline: 'none',
      cursor: 'pointer',
      gap: isActive ? '7px' : '0',
      willChange: 'background, padding, gap',
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
        color: '#fff',
        maxWidth: isActive ? '80px' : '0',
        opacity: isActive ? 1 : 0,
        willChange: 'max-width, opacity',
        transition: 'max-width 0.28s ease-out, opacity 0.18s ease-out',
      }}
    >
      {label}
    </span>
  </button>
);

const LiquidGlassNav = ({ route, user, hapticFeedback }: { route: any; user: any; hapticFeedback: any }) => {
  const { language } = useLanguage();
  const isAI = route.component === 'aiProcess' || route.component === 'aiAgent';
  const isProfile = ['profile', 'referral', 'rewards', 'earning'].includes(route.component);

  return (
    <>
      <LiquidGlassFilter />
      <div 
        className="fixed bottom-0 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-bottom-4 duration-300"
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
            background: 'rgba(20, 20, 22, 0.65)',
          }}
          role="navigation"
          aria-label={language === 'ru' ? 'Главное меню' : 'Main menu'}
        >
          <div 
            className="absolute inset-0 z-0 rounded-[22px] pointer-events-none"
            style={{
              backdropFilter: 'blur(40px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
              filter: 'url(#glass-distortion)',
            }}
          />
          <div 
            className="absolute inset-0 z-10 rounded-[22px] pointer-events-none"
            style={{
              boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.10), inset 0 -0.5px 0 rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)',
            }}
          />

          <NavTab
            onClick={() => {navigate('/'); hapticFeedback.light();}}
            isActive={route.component === 'showcase'}
            ariaLabel={language === 'ru' ? 'Главная' : 'Home'}
            testId="nav-showcase"
            label={language === 'ru' ? 'Главная' : 'Home'}
          >
            <Home
              className="w-[21px] h-[21px]"
              style={{
                color: route.component === 'showcase' ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s ease-out',
              }}
              strokeWidth={route.component === 'showcase' ? 2 : 1.5}
            />
          </NavTab>
          
          <NavTab
            onClick={() => {navigate('/ai-process'); hapticFeedback.light();}}
            isActive={isAI}
            ariaLabel={language === 'ru' ? 'ИИ агент' : 'AI Agent'}
            testId="nav-ai"
            label={language === 'ru' ? 'ИИ' : 'AI'}
          >
            <Bot
              className="w-[21px] h-[21px]"
              style={{
                color: isAI ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s ease-out',
              }}
              strokeWidth={isAI ? 2 : 1.5}
            />
          </NavTab>
          
          <NavTab
            onClick={() => {navigate('/projects'); hapticFeedback.light();}}
            isActive={route.component === 'projects'}
            ariaLabel={language === 'ru' ? 'Проекты' : 'Projects'}
            testId="nav-projects"
            label={language === 'ru' ? 'Кейсы' : 'Cases'}
          >
            <Briefcase
              className="w-[21px] h-[21px]"
              style={{
                color: route.component === 'projects' ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s ease-out',
              }}
              strokeWidth={route.component === 'projects' ? 2 : 1.5}
            />
          </NavTab>
          
          <NavTab
            onClick={() => {navigate('/constructor'); hapticFeedback.light();}}
            isActive={route.component === 'constructor'}
            ariaLabel={language === 'ru' ? 'Заказать' : 'Order'}
            testId="nav-constructor"
            label={language === 'ru' ? 'Заказ' : 'Order'}
          >
            <ShoppingCart
              className="w-[21px] h-[21px]"
              style={{
                color: route.component === 'constructor' ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s ease-out',
              }}
              strokeWidth={route.component === 'constructor' ? 2 : 1.5}
            />
          </NavTab>
          
          <NavTab
            onClick={() => {navigate('/profile'); hapticFeedback.light();}}
            isActive={isProfile}
            ariaLabel={language === 'ru' ? 'Профиль' : 'Profile'}
            testId="nav-profile"
            label={language === 'ru' ? 'Профиль' : 'Profile'}
          >
            <UserAvatar
              photoUrl={user?.photo_url}
              firstName={user?.first_name}
              size="sm"
              className={`w-6 h-6 ${
                isProfile ? 'ring-[1.5px] ring-white/40' : 'opacity-45'
              }`}
            />
          </NavTab>
        </nav>
      </div>
    </>
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

  const cachedTabs = ['showcase', 'projects', 'aiProcess', 'constructor', 'profile'] as const;
  const isCachedTab = cachedTabs.includes(route.component as any);

  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(['showcase']));

  useEffect(() => {
    if (cachedTabs.includes(route.component as any)) {
      setVisitedTabs(prev => {
        if (prev.has(route.component)) return prev;
        const next = new Set(prev);
        next.add(route.component);
        return next;
      });
    }
  }, [route.component]);

  const renderNonCachedRoute = () => {
    if (isCachedTab) return null;
    switch (route.component) {
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'demoLanding':
        const demoId = route.params?.id;
        if (!demoId) {
          return (
            <div className="max-w-md mx-auto px-4 py-6">
              <h1 className="ios-title font-bold mb-4">Ошибка</h1>
              <p className="ios-body text-secondary-label">ID демо не указан</p>
              <button onClick={() => navigate('/')} className="mt-4 ios-button-filled">Назад к главной</button>
            </div>
          );
        }
        return <DemoAppLanding demoId={demoId} />;
      case 'demoApp':
        return <DemoAppShell demoId={route.params?.id!} onClose={handleCloseDemo} />;
      case 'help':
        return <HelpPage onBack={() => navigate('/profile')} />;
      case 'review':
        return <ReviewPage onBack={() => navigate('/profile')} />;
      case 'checkout':
        if (!orderData) { navigate('/constructor'); return null; }
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
      case 'premiumApps':
        return <PremiumAppsPage onNavigate={handleNavigate} />;
      case 'notFound':
        return <NotFoundPage />;
      default:
        return null;
    }
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
      <Suspense fallback={<div style={{minHeight:'1px'}} />}>
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
                  {visitedTabs.has('showcase') && (
                    <div style={{ display: route.component === 'showcase' ? 'block' : 'none' }}>
                      <Suspense fallback={null}>
                        <ShowcasePage onOpenDemo={handleOpenDemo} onNavigate={handleNavigate} />
                      </Suspense>
                    </div>
                  )}
                  {visitedTabs.has('projects') && (
                    <div style={{ display: route.component === 'projects' ? 'block' : 'none' }}>
                      <Suspense fallback={null}>
                        <ProjectsPage onNavigate={handleNavigate} onOpenDemo={handleOpenDemo} />
                      </Suspense>
                    </div>
                  )}
                  {visitedTabs.has('aiProcess') && (
                    <div style={{ display: route.component === 'aiProcess' ? 'block' : 'none' }}>
                      <Suspense fallback={null}>
                        <AIProcessPage onNavigate={handleNavigate} />
                      </Suspense>
                    </div>
                  )}
                  {visitedTabs.has('constructor') && (
                    <div style={{ display: route.component === 'constructor' ? 'block' : 'none' }}>
                      <Suspense fallback={null}>
                        <ConstructorPage onNavigate={handleNavigate} />
                      </Suspense>
                    </div>
                  )}
                  {visitedTabs.has('profile') && (
                    <div style={{ display: route.component === 'profile' ? 'block' : 'none' }}>
                      <Suspense fallback={null}>
                        <ProfilePage onNavigate={handleNavigate} />
                      </Suspense>
                    </div>
                  )}
                  {!isCachedTab && (
                    <PageTransition routeKey={`${route.component}-${route.params?.id || ''}`}>
                      <ErrorBoundary>
                        <Suspense fallback={null}>
                          {renderNonCachedRoute()}
                        </Suspense>
                      </ErrorBoundary>
                    </PageTransition>
                  )}
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

              {/* Bottom Navigation - iOS 26 Liquid Glass */}
              {shouldShowBottomNav && (
                <ErrorBoundary fallback={null}>
                  <LiquidGlassNav route={route} user={user} hapticFeedback={hapticFeedback} />
                </ErrorBoundary>
              )}

          
              <Toaster />
              
              {/* Offline status indicator - lazy loaded */}
              <Suspense fallback={null}>
                <OfflineIndicator />
              </Suspense>
              
              {/* Onboarding tutorial for new users - lazy loaded */}
              {/* <Suspense fallback={null}>
                <OnboardingTutorial />
              </Suspense> */}
            </LazyXPNotificationProvider>
          </LazyRewardsProvider>
        </LazyMotionProvider>
      </Suspense>
    </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;