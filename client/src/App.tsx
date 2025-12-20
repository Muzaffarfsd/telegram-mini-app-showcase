import { useState, useEffect, Suspense, lazy, useCallback, useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useTelegram } from "./hooks/useTelegram";
import { useTelegramButtons } from "./hooks/useTelegramButtons";
import { Home, ShoppingCart, Briefcase, Bot } from "lucide-react";
import { trackDemoView } from "./hooks/useGamification";
import UserAvatar from "./components/UserAvatar";
import { usePerformanceMode } from "./hooks/usePerformanceMode";
import { scrollToTop } from "./hooks/useScrollToTop";
import { m, useSpring } from "framer-motion";
import * as Sentry from '@sentry/react';
import { initializeVitals, trackPageView } from "./utils/vitals";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageLoadingFallback } from "./components/PageLoadingFallback";

// Initialize Sentry for error tracking
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  });
}

// Eager load providers to prevent blank screen (Suspense fallback={null} + #root:empty CSS loop)
import { RewardsProvider } from "./contexts/RewardsContext";
import { XPNotificationProvider } from "./contexts/XPNotificationContext";
import { LazyMotionProvider } from "./utils/LazyMotionProvider";

// Lazy load ALL pages including ShowcasePage for optimal bundle splitting
const ShowcasePage = lazy(() => import("./components/ShowcasePage"));
const ProjectsPage = lazy(() => import("./components/ProjectsPage"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const DemoAppLanding = lazy(() => import("./components/DemoAppLanding"));
const ConstructorPage = lazy(() => import("./components/ConstructorPage"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const DemoAppShell = lazy(() => import("./components/DemoAppShell"));
const HelpPage = lazy(() => import("./components/HelpPage"));
const ReviewPage = lazy(() => import("./components/ReviewPage"));
const AIAgentPage = lazy(() => import("./components/AIAgentPage"));
const AIProcessPage = lazy(() => import("./components/AIProcessPage"));
const PhotoGallery = lazy(() => import("./pages/PhotoGallery"));
const ReferralProgram = lazy(() => import("./components/ReferralProgram").then(m => ({ default: m.ReferralProgram })));
const GamificationHub = lazy(() => import("./components/GamificationHub").then(m => ({ default: m.GamificationHub })));
const PremiumTasksEarningPage = lazy(() => import("./components/PremiumTasksEarningPage").then(m => ({ default: m.PremiumTasksEarningPage })));
const NotificationsPage = lazy(() => import("./pages/notifications"));

// Global components
import GlobalSidebar from "./components/GlobalSidebar";
import { PageTransition } from "./components/PageTransition";
import { OnboardingTutorial } from "./components/OnboardingTutorial";

// Simple hash router types
interface Route {
  path: string;
  component: string;
  params?: Record<string, string>;
}

// Router utilities
const parseHash = (): Route => {
  const hash = window.location.hash.slice(1) || '/';
  const [path, ...rest] = hash.split('?');
  
  // Parse demo routes
  const demoMatch = path.match(/^\/demos\/([^\/]+)(?:\/app)?$/);
  if (demoMatch) {
    const demoId = demoMatch[1];
    const isApp = path.includes('/app');
    return {
      path: isApp ? '/demos/:id/app' : '/demos/:id',
      component: isApp ? 'demoApp' : 'demoLanding',
      params: { id: demoId }
    };
  }
  
  // Regular routes
  const routeMap: Record<string, string> = {
    '/': 'showcase',
    '/projects': 'projects',
    '/about': 'about',
    '/constructor': 'constructor',
    '/profile': 'profile',
    '/help': 'help',
    '/review': 'review',
    '/checkout': 'checkout',
    '/ai-agent': 'aiAgent',
    '/ai-process': 'aiProcess',
    '/photo-gallery': 'photoGallery',
    '/referral': 'referral',
    '/rewards': 'rewards',
    '/earning': 'earning',
    '/notifications': 'notifications'
  };
  
  // Always default to showcase page if route not found
  return {
    path,
    component: routeMap[path] || 'showcase',
    params: {}
  };
};

// Simple instant navigation without animations
const navigate = (path: string) => {
  window.location.hash = path;
};

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

function App() {
  const [route, setRoute] = useState<Route>({ path: '/', component: 'showcase', params: {} });
  const [orderData, setOrderData] = useState<any>(null);
  const { hapticFeedback, user } = useTelegram();
  
  // Initialize performance mode detection
  const performanceMode = usePerformanceMode();
  
  // Native Telegram buttons
  useTelegramButtons(route.component as any);
  
  // Force scroll to top on initial app load (Telegram preserves scroll position)
  useEffect(() => {
    // Immediate scroll on mount
    scrollToTop();
    
    // Additional scroll after Telegram WebApp initializes
    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Wait for Telegram to finish its initialization
      setTimeout(() => scrollToTop(), 100);
      setTimeout(() => scrollToTop(), 300);
    }
  }, []);
  
  // Initialize route after mount to ensure showcase is default
  useEffect(() => {
    setRoute(parseHash());
  }, []);

  // Initialize Core Web Vitals tracking
  useEffect(() => {
    initializeVitals();
  }, []);

  // Track page views
  useEffect(() => {
    trackPageView(route.component);
  }, [route.component]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global scroll to top on every route change - fixed for all pages
  useEffect(() => {
    // Use global scrollToTop helper for reliable scroll reset
    scrollToTop();
  }, [route.component, route.params?.id]);

  // Telegram BackButton - показываем на всех страницах кроме главной
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    // Определяем, нужно ли показывать кнопку "Назад"
    const isMainPage = route.component === 'showcase';
    
    if (!isMainPage) {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }

    // Обработчик клика на BackButton
    const handleBackButton = () => {
      hapticFeedback.light();
      
      // Специальная логика для разных страниц
      if (route.component === 'checkout') {
        // Из чекаута возвращаемся в конструктор
        setOrderData(null);
        navigate('/constructor');
      } else if (route.component === 'demoApp' || route.component === 'demoLanding') {
        // Из демо возвращаемся на главную
        navigate('/');
      } else if (route.component === 'help' || route.component === 'review') {
        // Из справки/отзывов возвращаемся в профиль
        navigate('/profile');
      } else {
        // Для остальных страниц - на главную
        navigate('/');
      }
    };

    tg.BackButton.onClick(handleBackButton);

    // Cleanup
    return () => {
      tg.BackButton.offClick(handleBackButton);
    };
  }, [route.component, hapticFeedback]);

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
              return <PremiumTasksEarningPage onNavigate={handleNavigate} />;
            
            case 'notifications':
              return <NotificationsPage />;
            
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

  // 3D scroll depth effect - elements scale as they approach bottom nav
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!shouldShowBottomNav) return;
    
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      // Get all elements that should have the 3D effect
      const depthElements = container.querySelectorAll('[data-depth-zone]');
      const viewportHeight = window.innerHeight;
      const navZoneStart = viewportHeight - 180; // Start effect 180px from bottom
      
      depthElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elementBottom = rect.bottom;
        
        // Calculate progress (0 = far from nav, 1 = at nav)
        if (elementBottom > navZoneStart && elementBottom < viewportHeight + 50) {
          const progress = Math.min(1, (elementBottom - navZoneStart) / (viewportHeight - navZoneStart));
          (el as HTMLElement).style.setProperty('--nav-depth-progress', progress.toFixed(3));
        } else {
          (el as HTMLElement).style.setProperty('--nav-depth-progress', '0');
        }
      });
    };
    
    // Use requestAnimationFrame for smooth updates
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', onScroll);
  }, [shouldShowBottomNav]);

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotionProvider>
        <RewardsProvider>
          <XPNotificationProvider>
              <div className="relative min-h-screen">
                <div className="floating-elements"></div>
                
                {/* Global Sidebar for all pages except demo apps */}
                {shouldShowSidebar && (
                  <GlobalSidebar 
                    currentRoute={route.component} 
                    onNavigate={handleNavigate}
                    user={user}
                  />
                )}
                
                <div ref={scrollContainerRef} className="pb-36" data-scroll="main">
                  <PageTransition routeKey={`${route.component}-${route.params?.id || ''}`} variant="fade">
                    {renderRoute()}
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
                <m.div 
                  className="fixed bottom-6 left-0 right-0 flex justify-center z-50"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                        background: 'rgba(30, 30, 35, 0.08)',
                        backdropFilter: 'blur(60px) saturate(200%) brightness(0.98)',
                        WebkitBackdropFilter: 'blur(60px) saturate(200%) brightness(0.98)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.12), inset 0 -1px 1px rgba(0, 0, 0, 0.15)',
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
                          route.component === 'showcase' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-white/80'
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
                          route.component === 'aiProcess' || route.component === 'aiAgent' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-white/80'
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
                          route.component === 'projects' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-white/80'
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
                          route.component === 'constructor' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-white/80'
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
                    </nav>
                  </div>
                </m.div>
              )}

          
              <Toaster />
              
              {/* Onboarding tutorial for new users */}
              <OnboardingTutorial />
          </XPNotificationProvider>
        </RewardsProvider>
      </LazyMotionProvider>
    </QueryClientProvider>
  );
}

export default App;