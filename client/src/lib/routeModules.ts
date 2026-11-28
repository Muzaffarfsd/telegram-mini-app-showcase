import { loadablePage } from '../utils/loadablePage';
import { preloadDemo } from '../components/demos/DemoRegistry';
import { canSpeculate } from './interactionBudget';
import { primeContractPreviewEntry } from './contractPreviewLoading';

export const ShowcasePage = loadablePage(() => import('../components/ShowcasePage'));
export const ProjectsPage = loadablePage(() => import('../components/ProjectsPage'));
export const ConstructorPage = loadablePage(() => import('../components/OrderExperience'));
export const ContractPage = loadablePage(() => import('../components/ContractPage'));
export const ProfilePage = loadablePage(() => import('../components/ProfilePage'));
export const AIAgentPage = loadablePage(() => import('../components/AIConsultantPage'));
export const AboutPage = loadablePage(() => import('../components/AboutPage'));
export const DemoAppLanding = loadablePage(() => import('../components/DemoAppLanding'));
export const DemoAppShell = loadablePage(() => import('../components/DemoAppShell'));
export const PremiumAppsPage = loadablePage(() => import('../components/PremiumAppsPage'));
export const CheckoutPage = loadablePage(() => import('../components/CheckoutPage'));
export const HelpPage = loadablePage(() => import('../components/HelpPage'));
export const ReviewPage = loadablePage(() => import('../components/ReviewPage'));
export const PhotoGallery = loadablePage(() => import('../pages/PhotoGallery'));
export const ReferralProgram = loadablePage(() => import('../components/ReferralProgram').then(m => ({ default: m.ReferralProgram })));
export const GamificationHub = loadablePage(() => import('../components/GamificationHub').then(m => ({ default: m.GamificationHub })));
export const EarningPage = loadablePage(() => import('../components/EarningPage').then(m => ({ default: m.EarningPage })));
export const NotificationsPage = loadablePage(() => import('../pages/notifications'));
export const CoinShopPage = loadablePage(() => import('../components/CoinShopPage'));

const routes: Record<string, { preload(): Promise<unknown> }> = {
  '/': ShowcasePage, '/projects': ProjectsPage, '/constructor': ConstructorPage,
  '/contract': ContractPage,
  '/profile': ProfilePage, '/ai-agent': AIAgentPage, '/ai-process': AIAgentPage,
  '/about': AboutPage, '/help': HelpPage, '/review': ReviewPage,
  '/checkout': CheckoutPage, '/photo-gallery': PhotoGallery,
  '/referral': ReferralProgram, '/rewards': GamificationHub, '/earning': EarningPage,
  '/notifications': NotificationsPage, '/premium-apps': PremiumAppsPage,
};

export function warmRoute(rawPath: string, priority: 'high' | 'low' = 'low') {
  const path = rawPath.split('?')[0] || '/';
  if (path === '/contract') primeContractPreviewEntry();
  const demo = /^\/demos\/([^/]+)(\/app)?$/.exec(path);
  if (demo?.[2]) preloadDemo(demo[1], priority);
  const page = demo ? (demo[2] ? DemoAppShell : DemoAppLanding)
    : Object.hasOwn(routes, path) ? routes[path] : ShowcasePage;
  void page.preload().catch(() => {});
}

export function hintRoute(path: string) {
  if (canSpeculate()) warmRoute(path);
}
