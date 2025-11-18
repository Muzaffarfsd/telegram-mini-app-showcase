import { useState, useEffect, Suspense, lazy, useCallback, memo } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RewardsProvider } from "./contexts/RewardsContext";
import { XPNotificationProvider } from "./contexts/XPNotificationContext";
import { HelmetProvider } from "react-helmet-async";
import { useTelegram } from "./hooks/useTelegram";
import { Home, ShoppingCart, Briefcase, CircleUser, Bot } from "lucide-react";
import { trackDemoView } from "./hooks/useGamification";
import { LazyMotionProvider } from "./utils/LazyMotionProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Import ShowcasePage eagerly (landing page)
import ShowcasePage from "./components/ShowcasePage";

// Lazy load ALL pages except ShowcasePage
const ProjectsPage = lazy(() => import("./components/ProjectsPage"));
const DemoAppLanding = lazy(() => import("./components/DemoAppLanding"));
const ConstructorPage = lazy(() => import("./components/ConstructorPage"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const DemoAppShell = lazy(() => import("./components/DemoAppShell"));
const HelpPage = lazy(() => import("./components/HelpPage"));
const ReviewPage = lazy(() => import("./components/ReviewPage"));
const AIAgentPage = lazy(() => import("./components/AIAgentPage"));
const PhotoGallery = lazy(() => import("./pages/PhotoGallery"));
const ReferralProgram = lazy(() => import("./components/ReferralProgram").then(m => ({ default: m.ReferralProgram })));
const GamificationHub = lazy(() => import("./components/GamificationHub").then(m => ({ default: m.GamificationHub })));
const PremiumTasksEarningPage = lazy(() => import("./components/PremiumTasksEarningPage").then(m => ({ default: m.PremiumTasksEarningPage })));

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
    '/constructor': 'constructor',
    '/profile': 'profile',
    '/help': 'help',
    '/review': 'review',
    '/checkout': 'checkout',
    '/ai-agent': 'aiAgent',
    '/photo-gallery': 'photoGallery',
    '/referral': 'referral',
    '/rewards': 'rewards',
    '/earning': 'earning'
  };
  
  // Always default to showcase page if route not found
  return {
    path,
    component: routeMap[path] || 'showcase',
    params: {}
  };
};

const navigate = (path: string) => {
  window.location.hash = path;
};

const goBack = () => {
  window.history.back();
};

function App() {
  const [route, setRoute] = useState<Route>({ path: '/', component: 'showcase', params: {} });
  const [orderData, setOrderData] = useState<any>(null);
  const { hapticFeedback } = useTelegram();
  
  // Hide loader when React is mounted
  useEffect(() => {
    const appLoader = document.getElementById('app-loader');
    if (appLoader) {
      appLoader.classList.add('loaded');
      setTimeout(() => appLoader.remove(), 500);
    }
  }, []);
  
  // Initialize route after mount to ensure showcase is default
  useEffect(() => {
    setRoute(parseHash());
  }, []);

  // Listen for hash changes and preload critical demos
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
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

  // Route component rendering with Suspense
  const renderRoute = () => {
    return (
      <Suspense fallback={null}>
        {(() => {
          switch (route.component) {
            case 'showcase':
              return <ShowcasePage onOpenDemo={handleOpenDemo} onNavigate={handleNavigate} />;
            
            case 'projects':
              return <ProjectsPage onNavigate={handleNavigate} onOpenDemo={handleOpenDemo} />;
            
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
            
            case 'photoGallery':
              return <PhotoGallery />;
            
            case 'referral':
              return <ReferralProgram />;
            
            case 'rewards':
              return <GamificationHub />;
            
            case 'earning':
              return <PremiumTasksEarningPage onNavigate={handleNavigate} />;
            
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

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <LazyMotionProvider>
            <RewardsProvider>
              <XPNotificationProvider>
                <TooltipProvider>
                  <div className="relative min-h-screen">
                    <div className="floating-elements"></div>
                    
                    <div className="pb-24">
                      {renderRoute()}
                    </div>
            
                {/* Liquid Glass Bottom Navigation */}
                {shouldShowBottomNav && (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto">
                    <div className="relative">
                      {/* Animated Background Glow */}
                      <div 
                        className="absolute -inset-2 rounded-full opacity-20"
                        style={{
                          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(16, 185, 129, 0.2) 50%, transparent 70%)',
                          filter: 'blur(20px)',
                          animation: 'pulse 3s ease-in-out infinite',
                        }}
                      />
                      
                      {/* Liquid Glass Container */}
                      <div 
                        className="relative backdrop-blur-xl rounded-full border border-white/30 px-4 py-3 shadow-2xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                          boxShadow: `
                            0 8px 32px rgba(0, 0, 0, 0.4),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3),
                            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
                            0 0 60px rgba(16, 185, 129, 0.2)
                          `,
                        }}
                      >
                        {/* Inner Highlight */}
                        <div 
                          className="absolute top-1 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                        />
                        
                        <nav className="relative flex items-center justify-center gap-2" role="navigation" aria-label="Главное меню">
                          {/* Liquid Glass Blob - анимированная капля под активной иконкой */}
                          <div 
                            className="absolute transition-all duration-500 ease-out pointer-events-none"
                            style={{
                              left: route.component === 'showcase' ? '-2px' :
                                    route.component === 'aiAgent' ? '54px' :
                                    route.component === 'projects' ? '110px' :
                                    route.component === 'constructor' ? '166px' :
                                    ['profile', 'referral', 'rewards', 'earning'].includes(route.component) ? '222px' : '-2px',
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
                                background: 'radial-gradient(ellipse 100% 90% at 50% 45%, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0.22) 40%, transparent 70%)',
                                borderRadius: '45% 55% 50% 50% / 50% 50% 45% 55%',
                                filter: 'blur(12px)',
                                animation: 'liquid-morph 4s ease-in-out infinite',
                              }}
                            />
                            {/* Второй слой капли */}
                            <div 
                              className="absolute inset-0"
                              style={{
                                background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 70%)',
                                borderRadius: '50% 45% 55% 50% / 55% 50% 50% 45%',
                                filter: 'blur(16px)',
                                animation: 'liquid-morph-reverse 5s ease-in-out infinite',
                              }}
                            />
                            {/* Внутреннее свечение */}
                            <div 
                              className="absolute inset-0"
                              style={{
                                background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.18) 30%, transparent 60%)',
                                borderRadius: '50%',
                                filter: 'blur(8px)',
                              }}
                            />
                          </div>
                    
                          {/* Главная */}
                          <button
                            onClick={() => {navigate('/'); hapticFeedback.light();}}
                            className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/5"
                            style={{ zIndex: 10 }}
                            aria-label="Главная страница"
                            aria-current={route.component === 'showcase' ? 'page' : undefined}
                          >
                            <Home
                              className={`transition-all duration-300 ${
                                route.component === 'showcase' 
                                  ? 'w-6 h-6 text-white' 
                                  : 'w-5 h-5 text-white/70 hover:text-white'
                              }`}
                              strokeWidth={2}
                            />
                          </button>
                          
                          {/* ИИ Агент */}
                          <button
                            onClick={() => {navigate('/ai-agent'); hapticFeedback.light();}}
                            className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/5"
                            style={{ zIndex: 10 }}
                            aria-label="ИИ агенты для бизнеса"
                            aria-current={route.component === 'aiAgent' ? 'page' : undefined}
                          >
                            <Bot
                              className={`transition-all duration-300 ${
                                route.component === 'aiAgent' 
                                  ? 'w-6 h-6 text-white' 
                                  : 'w-5 h-5 text-white/70 hover:text-white'
                              }`}
                              strokeWidth={2}
                            />
                          </button>
                          
                          {/* Витрина */}
                          <button
                            onClick={() => {navigate('/projects'); hapticFeedback.light();}}
                            className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/5"
                            style={{ zIndex: 10 }}
                            aria-label="Витрина проектов"
                            aria-current={route.component === 'projects' ? 'page' : undefined}
                          >
                            <Briefcase
                              className={`transition-all duration-300 ${
                                route.component === 'projects' 
                                  ? 'w-6 h-6 text-white' 
                                  : 'w-5 h-5 text-white/70 hover:text-white'
                              }`}
                              strokeWidth={2}
                            />
                          </button>
                          
                          {/* Заказать */}
                          <button
                            onClick={() => {navigate('/constructor'); hapticFeedback.light();}}
                            className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/5"
                            style={{ zIndex: 10 }}
                            aria-label="Заказать проект"
                            aria-current={route.component === 'constructor' ? 'page' : undefined}
                          >
                            <ShoppingCart
                              className={`transition-all duration-300 ${
                                route.component === 'constructor'
                                  ? 'w-6 h-6 text-white' 
                                  : 'w-5 h-5 text-white/70 hover:text-white'
                              }`}
                              strokeWidth={2}
                            />
                          </button>
                          
                          {/* Профиль */}
                          <button
                            onClick={() => {navigate('/profile'); hapticFeedback.light();}}
                            className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-white/5"
                            style={{ zIndex: 10 }}
                            aria-label="Профиль пользователя"
                            aria-current={route.component === 'profile' || route.component === 'referral' || route.component === 'rewards' || route.component === 'earning' ? 'page' : undefined}
                          >
                            <CircleUser
                              className={`transition-all duration-300 ${
                                route.component === 'profile' || route.component === 'referral' || route.component === 'rewards' || route.component === 'earning'
                                  ? 'w-6 h-6 text-white' 
                                  : 'w-5 h-5 text-white/70 hover:text-white'
                              }`}
                              strokeWidth={2}
                            />
                          </button>
                    
                  </nav>
                </div>
              </div>
            </div>
          )}
          
          <Toaster />
        </div>
      </TooltipProvider>
      </XPNotificationProvider>
      </RewardsProvider>
      </LazyMotionProvider>
    </QueryClientProvider>
    </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;