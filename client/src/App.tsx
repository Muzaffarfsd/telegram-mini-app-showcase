import { Suspense, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useTelegram } from "./hooks/useTelegram";
import { useTelegramButtons } from "./hooks/useTelegramButtons";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useRouting } from "./hooks/useRouting";
import { useScrollHaptic } from "./hooks/useScrollHaptic";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useNavigationTracking } from "./hooks/usePredictivePrefetch";
import { BottomNav } from "./components/Navigation/BottomNav";
import { PageTransition } from "./components/PageTransition";
import { RouteRenderer } from "./router/RouteRenderer";
import { useAppNavigation } from "./hooks/useAppNavigation";
import { LazyMotionProvider, LazyRewardsProvider, LazyXPNotificationProvider, OfflineIndicator } from "./router/lazyRoutes";

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

const TelegramButtonsSync = ({ routeComponent }: { routeComponent: string }) => {
  useTelegramButtons(routeComponent as any);
  return null;
};

function AppContent() {
  const { hapticFeedback, user } = useTelegram();
  const { route } = useRouting();
  const { trackNavigation } = useNavigationTracking();
  const nav = useAppNavigation(hapticFeedback);

  useScrollHaptic();

  useEffect(() => {
    if (route?.path) trackNavigation(route.path);
  }, [route?.path, trackNavigation]);

  useEffect(() => {
    initSentry();
    if (window.Telegram?.WebApp) document.body.classList.add('tg-app-optimized');
  }, []);

  const shouldShowBottomNav = !route.component.includes('demo') && route.component !== 'notFound';

  return (
    <>
      <TelegramButtonsSync routeComponent={route.component} />
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}>
        <LazyMotionProvider>
          <LazyRewardsProvider>
            <LazyXPNotificationProvider>
              <div className="relative min-h-screen">
                <div className="pb-24" data-scroll="main">
                  <PageTransition routeKey={`${route.component}-${route.params?.id || ''}`}>
                    <ErrorBoundary>
                      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}>
                        <RouteRenderer route={route} {...nav} />
                      </Suspense>
                    </ErrorBoundary>
                  </PageTransition>
                </div>
              </div>
              {shouldShowBottomNav && (
                <ErrorBoundary fallback={null}>
                  <BottomNav route={route} user={user} hapticFeedback={hapticFeedback} />
                </ErrorBoundary>
              )}
              <Toaster />
              <Suspense fallback={null}>
                <OfflineIndicator />
              </Suspense>
            </LazyXPNotificationProvider>
          </LazyRewardsProvider>
        </LazyMotionProvider>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
