import { PageBoundary } from '@/utils/loadablePage';
import { useState, useCallback, useEffect, useLayoutEffect, memo, useMemo, useRef } from "react";
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
import { afterScrollLayout } from "./lib/afterScrollLayout";
import {
  ShowcasePage, PremiumAppsPage, ProjectsPage, AboutPage, DemoAppLanding, ConstructorPage,
  ProfilePage, CheckoutPage, DemoAppShell, HelpPage, ReviewPage, AIAgentPage, PhotoGallery,
  ReferralProgram, GamificationHub, EarningPage, NotificationsPage, AnalyticsPage, CoinShopPage,
  hintRoute,
} from "./lib/routeModules";
import { RewardsProvider } from "./contexts/RewardsContext";
import { XPNotificationProvider } from "./contexts/XPNotificationContext";
import { backgroundPrefetchWait, canSpeculate, pauseBackgroundPrefetch } from "./lib/interactionBudget";
import { isProfileRoute } from "./lib/profileRoutes";
import { useScrollHaptic } from "./hooks/useScrollHaptic";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useNavigationTracking } from "./hooks/usePredictivePrefetch";
import { usePerformanceClass } from "./hooks/usePerformanceClass";
import { LazyMotionProvider } from "./utils/LazyMotionProvider";
import { lazyWithRecovery as lazyWithRetry } from "./utils/lazyWithRecovery";
import "./ProjectsShell.css";

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

const AIProcessPage = AIAgentPage;
const NotFoundPage = lazyWithRetry(() => import("./pages/NotFound"));

import GlobalSidebar from "./components/GlobalSidebar";
import { ProfileDetailSkeleton, ProfileSkeleton } from "./components/ProfileSkeleton";
import { OrderSkeleton } from "./components/OrderSkeleton";
import { AIConsultantSkeleton } from "./components/AIConsultantSkeleton";
import { StudioHomeSkeleton } from "./components/StudioHomeSkeleton";
import { DemoLoadingSkeleton } from "./components/DemoLoadingSkeleton";
import { ProjectsSkeleton } from "./components/ProjectsSkeleton";
import { PageTransition } from "./components/PageTransition";
const OfflineIndicator = lazyWithRetry(() => import("./components/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));
const AIAgentButton = lazyWithRetry(() => import("./components/AIAgent/AIAgentButton").then(m => ({ default: m.AIAgentButton })));

function MenuRouteSkeleton({ label }: { label: string }) {
  return <main role="status" aria-label={label} aria-busy="true" style={{ minHeight: '100dvh', background: '#fff', padding: 'calc(max(env(safe-area-inset-top, 0px), var(--csat, 0px), 12px) + 90px) 20px 80px' }}>
    <div aria-hidden="true" style={{ maxWidth: 448, margin: '0 auto', display: 'grid', gap: 16 }}>
      <div className="profile-skeleton" style={{ width: '38%', height: 12, borderRadius: 8 }} />
      <div className="profile-skeleton" style={{ width: '72%', height: 32, borderRadius: 8 }} />
      <div className="profile-skeleton" style={{ width: '90%', height: 14, borderRadius: 8 }} />
      <div className="profile-skeleton" style={{ width: '100%', height: 190, borderRadius: 22, marginTop: 12 }} />
    </div>
  </main>;
}

const CACHED_TABS = ['showcase', 'projects', 'aiProcess', 'constructor', 'profile'] as const;
type CachedTab = typeof CACHED_TABS[number];

const isCachedTabCheck = (component: string): component is CachedTab =>
  CACHED_TABS.includes(component as CachedTab);

const LiquidGlassFilter = memo(() => (
  <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
    <filter id="glass-distortion" x="-5%" y="-5%" width="110%" height="110%" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.015" numOctaves="2" seed="17" result="turbulence" />
      <feGaussianBlur in="turbulence" stdDeviation="4" result="softMap" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale="6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
));

interface NavTabProps {
  onClick: () => void;
  path: string;
  isActive: boolean;
  ariaLabel: string;
  testId: string;
  label: string;
  children: React.ReactNode;
}

const NavTab = memo(({ onClick, path, isActive, ariaLabel, testId, label, children }: NavTabProps) => (
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
      transition: 'background 0.22s ease-out, padding 0.28s ease-out, gap 0.28s ease-out',
      WebkitTapHighlightColor: 'transparent',
    }}
    onClick={onClick}
    onPointerDown={() => { if (!isActive) hintRoute(path); }}
    onPointerEnter={event => { if (!isActive && event.pointerType === 'mouse') hintRoute(path); }}
    onFocus={event => { if (!isActive && event.currentTarget.matches(':focus-visible')) hintRoute(path); }}
    aria-label={ariaLabel}
    aria-current={isActive ? 'page' : undefined}
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
        transition: 'max-width 0.28s ease-out, opacity 0.18s ease-out',
      }}
    >
      {label}
    </span>
  </button>
));

const LiquidGlassNav = memo(({ route, user, hapticFeedback }: { route: any; user: any; hapticFeedback: any }) => {
  const { language } = useLanguage();
  const { capabilities } = usePerformanceClass();
  const isAI = route.component === 'aiProcess' || route.component === 'aiAgent';
  const isProfile = isProfileRoute(route.component);

  const navAction = useCallback((path: string) => {
    if (path === '/ai-process') window.dispatchEvent(new Event('web4tg:consultant-home'));
    navigate(path);
    queueMicrotask(() => hapticFeedback.light());
  }, [hapticFeedback]);

  const blurStyle = capabilities.supportsBlur
    ? { backdropFilter: 'blur(24px) saturate(1.3)', WebkitBackdropFilter: 'blur(24px) saturate(1.3)' }
    : { background: 'rgba(20, 20, 22, 0.92)' };

  return (
    <>
      <LiquidGlassFilter />
      <div 
        className={`fixed bottom-0 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-bottom-4 duration-300${route.component === 'projects' ? ' projects-dock' : ''}`}
        style={{ 
          isolation: 'isolate',
          paddingBottom: route.component === 'projects' ? 'var(--projects-safe-bottom)' : 'max(12px, env(safe-area-inset-bottom))',
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '8px',
        }}
      >
        <nav 
          className={`relative flex items-center rounded-[22px] gpu-layer ${isProfile ? 'profile-nav' : route.component === 'constructor' ? 'order-nav' : isAI ? 'consultant-nav' : route.component === 'showcase' ? 'home-nav' : route.component === 'projects' || route.component === 'about' ? 'projects-nav' : ''}`}
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
            style={blurStyle}
          />
          <div 
            className="absolute inset-0 z-10 rounded-[22px] pointer-events-none"
            style={{
              boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.10), inset 0 -0.5px 0 rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)',
            }}
          />

          <NavTab
            path="/"
            onClick={() => navAction('/')}
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
            path="/ai-process"
            onClick={() => navAction('/ai-process')}
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
            path="/projects"
            onClick={() => navAction('/projects')}
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
            path="/constructor"
            onClick={() => navAction('/constructor')}
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
            path="/profile"
            onClick={() => navAction('/profile')}
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
                isProfile ? 'ring-[1.5px] ring-white/40' : ''
              }`}
            />
          </NavTab>
        </nav>
      </div>
    </>
  );
});

const TelegramButtonsSync = ({ routeComponent }: { routeComponent: string }) => {
  useTelegramButtons(routeComponent as any);
  return null;
};

const NonCachedRoute = memo(({ 
  route, 
  handleNavigate, 
  handleCloseDemo, 
  handleCheckoutBack, 
  handlePaymentSuccess, 
  orderData 
}: {
  route: any;
  handleNavigate: (section: string, data?: any) => void;
  handleCloseDemo: () => void;
  handleCheckoutBack: () => void;
  handlePaymentSuccess: () => void;
  orderData: any;
}) => {
  switch (route.component) {
    case 'about':
      return <AboutPage onNavigate={handleNavigate} />;
    case 'demoLanding': {
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
    }
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
    case 'coinshop':
      return <CoinShopPage onNavigate={handleNavigate} />;
    case 'premiumApps':
      return <PremiumAppsPage onNavigate={handleNavigate} />;
    case 'notFound':
      return <NotFoundPage />;
    default:
      return null;
  }
});

function AppContent() {
  const { language } = useLanguage();
  const [orderData, setOrderData] = useState<any>(null);
  const { hapticFeedback, user } = useTelegram();
  
  const { route } = useRouting();
  useLayoutEffect(() => {
    if (route.component === 'demoApp') pauseBackgroundPrefetch();
  }, [route.component, route.params?.id]);
  const demoReturnPath = useRef<'/' | '/projects'>('/');
  const projectsReturnScroll = useRef<number | null>(null);
  const pendingDemoHash = useRef<string | null>(null);
  const isProfile = isProfileRoute(route.component);
  const { trackNavigation } = useNavigationTracking();

  useLayoutEffect(() => {
    document.documentElement.classList.remove('demo-boot-theme');
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('profile-detail-theme', isProfile);
    return () => document.documentElement.classList.remove('profile-detail-theme');
  }, [isProfile]);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('studio-home-theme', route.component === 'showcase');
    return () => document.documentElement.classList.remove('studio-home-theme');
  }, [route.component]);

  useLayoutEffect(() => {
    if (route.component !== 'projects') return;
    const html = document.documentElement;
    html.classList.add('projects-route-theme');
    const viewport = window.visualViewport;
    const updateVisibleBottom = () => {
      if (viewport && viewport.scale === 1 && viewport.height > 0) {
        html.style.setProperty('--projects-visual-bottom', `${viewport.offsetTop + viewport.height}px`);
      }
    };
    updateVisibleBottom();
    viewport?.addEventListener('resize', updateVisibleBottom);
    viewport?.addEventListener('scroll', updateVisibleBottom);
    return () => {
      viewport?.removeEventListener('resize', updateVisibleBottom);
      viewport?.removeEventListener('scroll', updateVisibleBottom);
      html.style.removeProperty('--projects-visual-bottom');
      html.classList.remove('projects-route-theme');
    };
  }, [route.component]);
  
  useScrollHaptic();
  
  useEffect(() => {
    if (route && route.component) {
      trackNavigation(route.component);
    }
  }, [route?.component, trackNavigation]);
  
  useEffect(() => {
    initSentry();
    if (window.Telegram?.WebApp) {
      document.body.classList.add('tg-app-optimized');
    }
  }, []);

  useEffect(() => {
    const root = document.getElementById('root');
    const deferImports = () => pauseBackgroundPrefetch(250);
    root?.addEventListener('pointerdown', deferImports, { passive: true, capture: true });
    root?.addEventListener('scroll', deferImports, { passive: true, capture: true });
    return () => {
      root?.removeEventListener('pointerdown', deferImports, true);
      root?.removeEventListener('scroll', deferImports, true);
    };
  }, []);

  useEffect(() => {
    // Only prepare the other showcase tab while the current page is settled.
    const next = route.component === 'showcase' ? '/projects' : route.component === 'projects' ? '/' : null;
    if (!next || !canSpeculate()) return;
    let idle: number | undefined;
    let timer: number;
    const warm = () => {
      if (!canSpeculate()) return;
      const wait = backgroundPrefetchWait();
      if (wait) timer = window.setTimeout(schedule, wait);
      else hintRoute(next);
    };
    const schedule = () => {
      if (window.requestIdleCallback) idle = window.requestIdleCallback(warm);
      else warm();
    };
    timer = window.setTimeout(schedule, 1200);
    return () => {
      clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
    };
  }, [route.component]);

  const handleNavigate = useCallback((section: string, data?: any) => {
    if (data) {
      setOrderData(data);
    } else if (section !== 'checkout') {
      setOrderData(null);
    }
    navigate(`/${section}`);
    queueMicrotask(() => hapticFeedback.light());
  }, [hapticFeedback]);

  const handleOpenDemo = useCallback((demoId: string) => {
    projectsReturnScroll.current = route.component === 'projects' ? document.getElementById('root')?.scrollTop ?? 0 : null;
    demoReturnPath.current = route.component === 'projects' ? '/projects' : '/';
    pendingDemoHash.current = `#/demos/${demoId}/app`;
    navigate(`/demos/${demoId}/app`);
    queueMicrotask(() => hapticFeedback.medium());
    trackDemoView(demoId);
  }, [hapticFeedback, route.component]);

  useLayoutEffect(() => {
    if (route.component === 'demoApp') return;
    const top = projectsReturnScroll.current;
    projectsReturnScroll.current = null;
    if (route.component === 'projects' && top !== null) {
      return afterScrollLayout(() => document.getElementById('root')?.scrollTo({ top, behavior: 'instant' }));
    }
  }, [route.component]);

  const handleCloseDemo = useCallback(() => {
    const returnPath = demoReturnPath.current;
    demoReturnPath.current = '/';
    navigate(returnPath);
    queueMicrotask(() => hapticFeedback.light());
  }, [hapticFeedback]);

  useEffect(() => {
    // Only the navigation initiated by handleOpenDemo inherits its source.
    // Other hash changes, including browser back and later deep links, must not
    // reuse an earlier demo's return destination.
    const clearStaleDemoSource = (event: HashChangeEvent) => {
      const nextHash = new URL(event.newURL).hash;
      if (nextHash !== pendingDemoHash.current) demoReturnPath.current = '/';
      pendingDemoHash.current = null;
    };
    window.addEventListener('hashchange', clearStaleDemoSource);
    return () => window.removeEventListener('hashchange', clearStaleDemoSource);
  }, []);

  const handleCheckoutBack = useCallback(() => {
    setOrderData(null);
    navigate('/constructor');
    queueMicrotask(() => hapticFeedback.light());
  }, [hapticFeedback]);

  const handlePaymentSuccess = useCallback(() => {
    setOrderData(null);
    navigate('/profile');
    queueMicrotask(() => hapticFeedback.medium());
  }, [hapticFeedback]);

  const isCachedTab = isCachedTabCheck(route.component);

  // Do not mount and download the hidden home page when opening a deep link.
  // A tab becomes cached after it is actually visited.
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(isCachedTabCheck(route.component) ? [route.component] : []));

  useEffect(() => {
    if (isCachedTabCheck(route.component)) {
      setVisitedTabs(prev => {
        if (prev.has(route.component)) return prev;
        const next = new Set(prev);
        next.add(route.component);
        return next;
      });
    }
  }, [route.component]);

  const isRoyalStep = route.component === 'demoApp' && ['nike-sneakers', 'royal-step'].includes(route.params?.id || '');
  const isFashionDemo = route.component === 'demoApp' && ['muraka-fashion', 'women-fashion', 'jewelry-store'].includes(route.params?.id || '');
  const isAppleStore = route.component === 'demoApp' && route.params?.id === 'apple-store';
  const isOptMarket = route.component === 'demoApp' && route.params?.id === 'opt-market';
  const isLumiStudio = route.component === 'demoApp' && route.params?.id === 'lumi-studio';
  const isMedicalCenter = route.component === 'demoApp' && route.params?.id === 'medical-center';
  const isChinaBuyer = route.component === 'demoApp' && route.params?.id === 'china-buyer';
  const isFlowerStore = route.component === 'demoApp' && route.params?.id === 'flower-store';
  const shouldShowBottomNav = !route.component.includes('demo') && route.component !== 'notFound';
  const shouldShowSidebar = (!route.component.includes('demo') && route.component !== 'notFound') || isRoyalStep || isFashionDemo || isAppleStore || isOptMarket || isLumiStudio || isMedicalCenter || isChinaBuyer || isFlowerStore;

  return (
    <>
      <TelegramButtonsSync routeComponent={route.component} />
      <LazyMotionProvider>
        <PageBoundary fallback={route.component === 'showcase' ? <StudioHomeSkeleton label={language === 'ru' ? 'Загрузка главной страницы' : 'Loading home page'} /> : route.component.includes('demo') ? <DemoLoadingSkeleton label={language === 'ru' ? 'Загрузка демо-приложения' : 'Loading demo app'} /> : <div style={{minHeight:'1px'}} />}>
          <RewardsProvider>
            <XPNotificationProvider>
              <div className={route.component === 'projects' ? 'relative' : 'relative min-h-screen'}>
                <div className="floating-elements"></div>
                
                {shouldShowSidebar && (
                  <ErrorBoundary fallback={null}>
                    <GlobalSidebar 
                      currentRoute={isRoyalStep || isFashionDemo || isAppleStore || isOptMarket || isLumiStudio || isMedicalCenter || isChinaBuyer || isFlowerStore ? 'showcase' : route.component}
                      onNavigate={handleNavigate}
                      user={user}
                    />
                  </ErrorBoundary>
                )}
                
                <div className={`pb-36${isProfile ? ' profile-route-surface' : ''}`} data-scroll="main" style={route.component.includes('demo') || route.component === 'projects' ? { backgroundColor: '#fff', paddingBottom: 0 } : ['showcase', 'constructor', 'aiProcess', 'aiAgent', 'about', 'analytics'].includes(route.component) ? { backgroundColor: '#fff' } : undefined}>
                  {(visitedTabs.has('showcase') || route.component === 'showcase') && (
                    <div style={{ display: route.component === 'showcase' ? 'block' : 'none' }}>
                      <PageBoundary fallback={<StudioHomeSkeleton label={language === 'ru' ? 'Загрузка главной страницы' : 'Loading home page'} />}>
                        <ShowcasePage onOpenDemo={handleOpenDemo} onNavigate={handleNavigate} />
                      </PageBoundary>
                    </div>
                  )}
                  {(visitedTabs.has('projects') || route.component === 'projects') && (
                    <div style={{ display: route.component === 'projects' ? 'block' : 'none' }}>
                      <PageBoundary fallback={<ProjectsSkeleton label={language === 'ru' ? 'Загрузка витрины приложений' : 'Loading app showcase'} />}>
                        <ProjectsPage onNavigate={handleNavigate} onOpenDemo={handleOpenDemo} />
                      </PageBoundary>
                    </div>
                  )}
                  {(visitedTabs.has('aiProcess') || route.component === 'aiProcess') && (
                    <div style={{ display: route.component === 'aiProcess' ? 'block' : 'none' }}>
                      <PageBoundary fallback={<AIConsultantSkeleton label={language === 'ru' ? 'Загрузка страницы консультанта' : 'Loading consultant page'} />}>
                        <AIProcessPage onNavigate={handleNavigate} />
                      </PageBoundary>
                    </div>
                  )}
                  {(visitedTabs.has('constructor') || route.component === 'constructor') && (
                    <div style={{ display: route.component === 'constructor' ? 'block' : 'none' }}>
                      <PageBoundary fallback={<OrderSkeleton label={language === 'ru' ? 'Загрузка страницы заказа' : 'Loading order page'} />}>
                        <ConstructorPage onNavigate={handleNavigate} />
                      </PageBoundary>
                    </div>
                  )}
                  {(visitedTabs.has('profile') || route.component === 'profile') && (
                    <div style={{ display: route.component === 'profile' ? 'block' : 'none' }}>
                      <PageBoundary fallback={<ProfileSkeleton label={language === 'ru' ? 'Загрузка профиля' : 'Loading profile'} />}>
                        <ProfilePage onNavigate={handleNavigate} active={route.component === 'profile'} />
                      </PageBoundary>
                    </div>
                  )}
                  {!isCachedTab && (
                    <PageTransition routeKey={`${route.component}-${route.params?.id || ''}`}>
                      <ErrorBoundary>
                        <PageBoundary fallback={route.component.includes('demo') ? <DemoLoadingSkeleton label={language === 'ru' ? 'Загрузка демо-приложения' : 'Loading demo app'} /> : isProfile ? <ProfileDetailSkeleton label={language === 'ru' ? 'Загрузка страницы профиля' : 'Loading profile page'} /> : route.component === 'aiAgent' ? <AIConsultantSkeleton label={language === 'ru' ? 'Загрузка страницы консультанта' : 'Loading consultant page'} /> : <MenuRouteSkeleton label={language === 'ru' ? 'Загрузка страницы' : 'Loading page'} />}>
                          <NonCachedRoute
                            route={route}
                            handleNavigate={handleNavigate}
                            handleCloseDemo={handleCloseDemo}
                            handleCheckoutBack={handleCheckoutBack}
                            handlePaymentSuccess={handlePaymentSuccess}
                            orderData={orderData}
                          />
                        </PageBoundary>
                      </ErrorBoundary>
                    </PageTransition>
                  )}
                </div>
              </div>
            
              <svg className="absolute" style={{ width: 0, height: 0 }}>
                <defs>
                  <filter id="liquid-refraction" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="1" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
              </svg>

              {shouldShowBottomNav && (
                <ErrorBoundary fallback={null}>
                  <LiquidGlassNav route={route} user={user} hapticFeedback={hapticFeedback} />
                </ErrorBoundary>
              )}

              <Toaster />
              
              {(shouldShowBottomNav || isRoyalStep || isFashionDemo || isAppleStore || isOptMarket || isLumiStudio || isMedicalCenter || isChinaBuyer || isFlowerStore) && route.component !== 'aiProcess' && route.component !== 'aiAgent' && (
                <PageBoundary fallback={null}>
                  <div className={isProfile ? 'profile-ai-surface' : route.component === 'constructor' ? 'order-ai-surface' : route.component === 'projects' || route.component === 'about' ? 'projects-ai-surface' : route.component === 'showcase' || isRoyalStep || isFashionDemo || isAppleStore || isOptMarket || isLumiStudio || isMedicalCenter || isChinaBuyer || isFlowerStore ? 'home-ai-surface' : undefined}><AIAgentButton route={route} profileMode={isProfile || route.component === 'constructor' || route.component === 'projects' || route.component === 'about' || route.component === 'showcase' || isRoyalStep || isFashionDemo || isAppleStore || isOptMarket || isLumiStudio || isMedicalCenter || isChinaBuyer || isFlowerStore} /></div>
                </PageBoundary>
              )}

              <PageBoundary fallback={null}>
                <OfflineIndicator />
              </PageBoundary>

            </XPNotificationProvider>
          </RewardsProvider>
        </PageBoundary>
      </LazyMotionProvider>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
