import { lazy } from "react";

function lazyWithRetry<T extends { default: any }>(
  importFn: () => Promise<T>,
  retries = 2
): React.LazyExoticComponent<T["default"]> {
  return lazy(() => {
    const attempt = (remaining: number): Promise<T> =>
      importFn().catch((error) => {
        if (remaining > 0 && error.message?.includes('Failed to fetch dynamically imported module')) {
          return new Promise<T>((resolve) =>
            setTimeout(() => resolve(attempt(remaining - 1)), 500)
          );
        }
        if (error.message?.includes('Failed to fetch dynamically imported module')) {
          window.location.reload();
        }
        throw error;
      });
    return attempt(retries);
  });
}

export const ShowcasePage = lazyWithRetry(() => import("../components/ShowcasePage"));
export const PremiumAppsPage = lazyWithRetry(() => import("../components/PremiumAppsPage"));
export const ProjectsPage = lazyWithRetry(() => import("../components/ProjectsPage"));
export const AboutPage = lazyWithRetry(() => import("../components/AboutPage"));
export const DemoAppLanding = lazyWithRetry(() => import("../components/DemoAppLanding"));
export const ConstructorPage = lazyWithRetry(() => import("../components/ConstructorPage"));
export const ProfilePage = lazyWithRetry(() => import("../components/ProfilePage"));
export const CheckoutPage = lazyWithRetry(() => import("../components/CheckoutPage"));
export const DemoAppShell = lazyWithRetry(() => import("../components/DemoAppShell"));
export const HelpPage = lazyWithRetry(() => import("../components/HelpPage"));
export const ReviewPage = lazyWithRetry(() => import("../components/ReviewPage"));
export const AIAgentPage = lazyWithRetry(() => import("../components/AIAgentPage"));
export const AIProcessPage = lazyWithRetry(() => import("../components/AIProcessPage"));
export const PhotoGallery = lazyWithRetry(() => import("../pages/PhotoGallery"));
export const NotFoundPage = lazyWithRetry(() => import("../pages/NotFound"));
export const ReferralProgram = lazy(() => import("../components/ReferralProgram").then(m => ({ default: m.ReferralProgram })));
export const GamificationHub = lazy(() => import("../components/GamificationHub").then(m => ({ default: m.GamificationHub })));
export const EarningPage = lazy(() => import("../components/EarningPage").then(m => ({ default: m.EarningPage })));
export const NotificationsPage = lazyWithRetry(() => import("../pages/notifications"));
export const AnalyticsPage = lazyWithRetry(() => import("../pages/analytics"));
export const CoinShopPage = lazyWithRetry(() => import("../components/CoinShopPage"));
export const OfflineIndicator = lazy(() => import("../components/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));
export const LazyRewardsProvider = lazy(() => import("../contexts/RewardsContext").then(m => ({ default: m.RewardsProvider })));
export const LazyXPNotificationProvider = lazy(() => import("../contexts/XPNotificationContext").then(m => ({ default: m.XPNotificationProvider })));
export const LazyMotionProvider = lazy(() => import("../utils/LazyMotionProvider").then(m => ({ default: m.LazyMotionProvider })));
