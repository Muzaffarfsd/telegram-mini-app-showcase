import { useState, useEffect, Suspense, lazy, useCallback } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useTelegram } from "./hooks/useTelegram";
import { Home, ShoppingCart, Briefcase, Bot } from "lucide-react";
import { trackDemoView } from "./hooks/useGamification";
import UserAvatar from "./components/UserAvatar";
import { usePerformanceMode } from "./hooks/usePerformanceMode";

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

// Global components
import GlobalSidebar from "./components/GlobalSidebar";

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
  const { hapticFeedback, user } = useTelegram();
  
  // Initialize performance mode detection
  const performanceMode = usePerformanceMode();
  
  // Initialize route after mount to ensure showcase is default
  useEffect(() => {
    setRoute(parseHash());
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Optimized scroll to top - single reliable mechanism
  useEffect(() => {
    // Single scroll after content renders
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
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

  // Route component rendering with Suspense - no loading fallback for smooth experience
  const renderRoute = () => {
    return (
      <Suspense fallback={null}>
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
                
                <div className="pb-28">
                  {renderRoute()}
                </div>
            
                {/* Original Bottom Navigation */}
                {shouldShowBottomNav && (
                  <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4">
                    <div className="relative">
                      {/* Ambient glow */}
                      <div 
                        className="absolute -inset-3 rounded-[28px] opacity-30"
                        style={{
                          background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                          filter: 'blur(16px)',
                        }}
                      />
                      
                      {/* Glass container */}
                      <div 
                        className="relative flex items-center gap-1 px-2 py-2 rounded-full"
                        style={{
                          background: 'rgba(24, 24, 27, 0.85)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        {[
                          { id: 'showcase', icon: Home, path: '/', label: 'Главная' },
                          { id: 'aiProcess', icon: Bot, path: '/ai-process', label: 'AI' },
                          { id: 'projects', icon: Briefcase, path: '/projects', label: 'Витрина' },
                          { id: 'constructor', icon: ShoppingCart, path: '/constructor', label: 'Заказ' },
                        ].map((item) => {
                          const isActive = route.component === item.id || 
                            (item.id === 'showcase' && route.component === 'showcase') ||
                            (item.id === 'aiProcess' && ['aiAgent', 'aiProcess'].includes(route.component));
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                hapticFeedback.light();
                                navigate(item.path);
                              }}
                              className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
                              style={{
                                background: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                              }}
                              data-testid={`nav-${item.id}`}
                            >
                              <item.icon 
                                className="w-5 h-5 transition-colors duration-300"
                                style={{
                                  color: isActive ? '#A78BFA' : 'rgba(255, 255, 255, 0.5)',
                                }}
                                strokeWidth={isActive ? 2.5 : 2}
                              />
                              {isActive && (
                                <div 
                                  className="absolute -bottom-1 w-1 h-1 rounded-full"
                                  style={{ background: '#A78BFA' }}
                                />
                              )}
                            </button>
                          );
                        })}
                        
                        {/* Profile avatar */}
                        <button
                          onClick={() => {
                            hapticFeedback.light();
                            navigate('/profile');
                          }}
                          className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
                          style={{
                            background: ['profile', 'referral', 'rewards', 'earning'].includes(route.component) 
                              ? 'rgba(139, 92, 246, 0.2)' 
                              : 'transparent',
                          }}
                          data-testid="nav-profile"
                        >
                          <UserAvatar 
                            user={user} 
                            size="sm"
                            className="ring-2 transition-all duration-300"
                            style={{
                              ringColor: ['profile', 'referral', 'rewards', 'earning'].includes(route.component)
                                ? 'rgba(167, 139, 250, 0.6)'
                                : 'rgba(255, 255, 255, 0.1)',
                            }}
                          />
                          {['profile', 'referral', 'rewards', 'earning'].includes(route.component) && (
                            <div 
                              className="absolute -bottom-1 w-1 h-1 rounded-full"
                              style={{ background: '#A78BFA' }}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
          
          <Toaster />
        </div>
      </XPNotificationProvider>
      </RewardsProvider>
      </LazyMotionProvider>
    </QueryClientProvider>
  );
}

export default App;