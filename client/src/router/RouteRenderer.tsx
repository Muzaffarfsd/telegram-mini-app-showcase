import { memo } from "react";
import { navigate } from "../hooks/useRouting";
import type { Route } from "../hooks/useRouting";
import {
  ShowcasePage, PremiumAppsPage, ProjectsPage, AboutPage,
  DemoAppLanding, ConstructorPage, ProfilePage, CheckoutPage,
  DemoAppShell, HelpPage, ReviewPage, AIAgentPage, AIProcessPage,
  PhotoGallery, NotFoundPage, ReferralProgram, GamificationHub,
  EarningPage, NotificationsPage, AnalyticsPage, CoinShopPage,
} from "./lazyRoutes";

export interface RouteRendererProps {
  route: Route;
  handleNavigate: (section: string, data?: any) => void;
  handleOpenDemo: (demoId: string) => void;
  handleCloseDemo: () => void;
  handleCheckoutBack: () => void;
  handlePaymentSuccess: () => void;
  orderData: any;
}

export const RouteRenderer = memo(({
  route,
  handleNavigate,
  handleOpenDemo,
  handleCloseDemo,
  handleCheckoutBack,
  handlePaymentSuccess,
  orderData,
}: RouteRendererProps) => {
  switch (route.component) {
    case 'showcase':
      return <ShowcasePage onOpenDemo={handleOpenDemo} onNavigate={handleNavigate} />;
    case 'projects':
      return <ProjectsPage onNavigate={handleNavigate} onOpenDemo={handleOpenDemo} />;
    case 'aiProcess':
      return <AIProcessPage onNavigate={handleNavigate} />;
    case 'constructor':
      return <ConstructorPage onNavigate={handleNavigate} />;
    case 'profile':
      return <ProfilePage onNavigate={handleNavigate} />;
    case 'about':
      return <AboutPage onNavigate={handleNavigate} />;
    case 'demoLanding': {
      const demoId = route.params?.id;
      if (!demoId) {
        return (
          <div className="max-w-lg mx-auto px-4 py-6">
            <h1 className="text-lg font-bold mb-4 text-white">Error</h1>
            <p className="text-sm text-white/60">Demo ID not specified</p>
            <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium">Back</button>
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
      return <ShowcasePage onOpenDemo={handleOpenDemo} onNavigate={handleNavigate} />;
  }
});
