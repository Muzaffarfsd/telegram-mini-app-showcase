import { useState, useEffect, Suspense, lazy, useCallback, memo } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RewardsProvider } from "./contexts/RewardsContext";
import { useTelegram } from "./hooks/useTelegram";
import { Grid3x3, ShoppingCart, Briefcase, CircleUser, Sparkles } from "lucide-react";
import { preloadCriticalDemos } from "./components/demos/DemoRegistry";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy loading all major pages for better performance
const ShowcasePage = lazy(() => import("./components/ShowcasePage"));
const ProjectsPage = lazy(() => import("./components/ProjectsPage"));
const DemoAppLanding = lazy(() => import("./components/DemoAppLanding"));
const ConstructorPage = lazy(() => import("./components/ConstructorPage"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const DemoAppShell = lazy(() => import("./components/DemoAppShell"));
const HelpPage = lazy(() => import("./components/HelpPage"));
const ReviewPage = lazy(() => import("./components/ReviewPage"));
const TasksPage = lazy(() => import("./components/TasksPage"));
const AIAgentPage = lazy(() => import("./components/AIAgentPage"));

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
    '/tasks': 'tasks',
    '/ai-agent': 'aiAgent'
  };
  
  return {
    path,
    component: routeMap[path] || 'notFound',
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
  const [route, setRoute] = useState<Route>(parseHash());
  const [orderData, setOrderData] = useState<any>(null);
  const { hapticFeedback } = useTelegram();

  // Listen for hash changes and preload critical demos
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Preload critical demos for better performance
    preloadCriticalDemos();
    
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

  // Loading component for Suspense - memoized to prevent recreation
  const PageLoader = useCallback(() => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#5DD62C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#5DD62C] font-mono text-sm">Загружаем...</p>
      </div>
    </div>
  ), []);

  // Route component rendering with Suspense
  const renderRoute = () => {
    return (
      <Suspense fallback={<PageLoader />}>
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
            
            case 'tasks':
              return <TasksPage onNavigate={handleNavigate} />;
            
            case 'aiAgent':
              return <AIAgentPage onNavigate={handleNavigate} />;
            
            default:
              return (
                <div className="max-w-md mx-auto px-4 py-6 text-center">
                  <h1 className="ios-title font-bold mb-4">Страница не найдена</h1>
                  <button 
                    onClick={() => navigate('/')} 
                    className="ios-button-filled"
                  >
                    На главную
                  </button>
                </div>
              );
          }
        })()} 
      </Suspense>
    );
  };

  // Check if we should show bottom navigation
  const shouldShowBottomNav = !route.component.includes('demo') && route.component !== 'notFound';

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RewardsProvider>
          <TooltipProvider>
            <div className="relative min-h-screen">
            <div className="floating-elements"></div>
            
            <div className="pb-24">
              {renderRoute()}
            </div>
          
          {/* Ultra-Minimal Glassmorphic Bottom Navigation */}
          {shouldShowBottomNav && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <div className="relative">
                {/* Glassmorphic Container */}
                <div className="bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl px-4 py-3">
                  <nav className="flex items-center gap-2" role="navigation" aria-label="Главное меню">
                  
                    {/* Главная */}
                    <button
                      onClick={() => {navigate('/'); hapticFeedback.light();}}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 active:scale-95 ${
                        route.component === 'showcase'
                          ? 'bg-green-400/20'
                          : 'hover:bg-white/10'
                      }`}
                      aria-label="Главная страница"
                      aria-current={route.component === 'showcase' ? 'page' : undefined}
                    >
                      <Grid3x3
                        className={`w-6 h-6 transition-all duration-300 ${
                          route.component === 'showcase' 
                            ? 'text-green-400 scale-110' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        strokeWidth={route.component === 'showcase' ? 2.5 : 2}
                      />
                    </button>
                    
                    {/* ИИ Агент */}
                    <button
                      onClick={() => {navigate('/ai-agent'); hapticFeedback.light();}}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 active:scale-95 ${
                        route.component === 'aiAgent'
                          ? 'bg-green-400/20'
                          : 'hover:bg-white/10'
                      }`}
                      aria-label="ИИ агенты для бизнеса"
                      aria-current={route.component === 'aiAgent' ? 'page' : undefined}
                    >
                      <Sparkles
                        className={`w-6 h-6 transition-all duration-300 ${
                          route.component === 'aiAgent' 
                            ? 'text-green-400 scale-110' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        strokeWidth={route.component === 'aiAgent' ? 2.5 : 2}
                      />
                    </button>
                    
                    {/* Витрина */}
                    <button
                      onClick={() => {navigate('/projects'); hapticFeedback.light();}}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 active:scale-95 ${
                        route.component === 'projects'
                          ? 'bg-green-400/20'
                          : 'hover:bg-white/10'
                      }`}
                      aria-label="Витрина проектов"
                      aria-current={route.component === 'projects' ? 'page' : undefined}
                    >
                      <Briefcase
                        className={`w-6 h-6 transition-all duration-300 ${
                          route.component === 'projects' 
                            ? 'text-green-400 scale-110' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        strokeWidth={route.component === 'projects' ? 2.5 : 2}
                      />
                    </button>
                    
                    {/* Заказать */}
                    <button
                      onClick={() => {navigate('/constructor'); hapticFeedback.light();}}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 active:scale-95 ${
                        route.component === 'constructor'
                          ? 'bg-green-400/20'
                          : 'hover:bg-white/10'
                      }`}
                      aria-label="Заказать проект"
                      aria-current={route.component === 'constructor' ? 'page' : undefined}
                    >
                      <ShoppingCart
                        className={`w-6 h-6 transition-all duration-300 ${
                          route.component === 'constructor'
                            ? 'text-green-400 scale-110' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        strokeWidth={route.component === 'constructor' ? 2.5 : 2}
                      />
                    </button>
                    
                    {/* Профиль */}
                    <button
                      onClick={() => {navigate('/profile'); hapticFeedback.light();}}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 active:scale-95 ${
                        route.component === 'profile'
                          ? 'bg-green-400/20'
                          : 'hover:bg-white/10'
                      }`}
                      aria-label="Профиль пользователя"
                      aria-current={route.component === 'profile' ? 'page' : undefined}
                    >
                      <CircleUser
                        className={`w-6 h-6 transition-all duration-300 ${
                          route.component === 'profile' 
                            ? 'text-green-400 scale-110' 
                            : 'text-white/70 hover:text-white'
                        }`}
                        strokeWidth={route.component === 'profile' ? 2.5 : 2}
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
      </RewardsProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;