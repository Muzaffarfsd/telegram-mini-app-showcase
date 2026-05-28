import { useState, useCallback, useMemo, useEffect, useRef, memo } from "react";
import { m, AnimatePresence, useInView, useScroll, useTransform } from "@/utils/LazyMotionProvider";
import { trackProjectCreation, trackFeatureAdded } from "@/hooks/useGamification";
import { useLanguage } from "../contexts/LanguageContext";
import { useHaptic } from "../hooks/useHaptic";
import {
  ShoppingCart, User, ArrowRight, ArrowUpRight, ArrowDown, Check,
  Package, Coffee, Dumbbell, Settings, CreditCard,
  Truck, Bell, Crown, BarChart, Calendar, Users, Zap, Star, MessageSquare,
  Globe, Smartphone, Clock, Sparkles, Rocket, Shield,
  Layers, Monitor, Building2, ScrollText, FileSignature, ShieldCheck,
} from "lucide-react";
import { PricingModule } from "@/components/ui/pricing-module";

/* ====================================================================
   WEB4TG — Заказ · Apple-grade cinematic chapter scroll · OLED black
   Higgsfield image-first media · Stengazeta · Onder · Manrope · 2026
   "Платите без рисков. С гарантией." — trust narrative
   ==================================================================== */

const HF = "https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/";
const HERO_VIDEO  = HF + "hf_20260526_071020_a6f4cd77-9213-4017-bf83-4c6ee8e5f046.mp4";
const IMG_HERO    = HF + "hf_20260526_070625_ae414424-b3b2-4dca-9448-c8b1cb9088e3_min.webp";
const IMG_BRIEF   = HF + "hf_20260526_065218_a2a8679d-b6d3-46aa-bdde-dd545b2ad6c2_min.webp";
const IMG_DESIGN  = HF + "hf_20260526_065224_b369b2ae-5662-44cf-9817-c0af602ef737_min.webp";
const IMG_CODE    = HF + "hf_20260526_065233_f480aae0-fde7-45f2-af89-6741ca891df2_min.webp";
const IMG_LAUNCH  = HF + "hf_20260526_065240_b8e3ccaf-82b4-4ea2-b210-df0ad5eb8d65_min.webp";
const IMG_SHIELD  = HF + "hf_20260526_065247_fc7fd8e3-d918-4ae7-b6a3-35180000cdca_min.webp";
const IMG_ESCROW  = HF + "hf_20260526_065254_b97320ca-c3ea-413e-b046-8774e6dbaff0_min.webp";

const FONT = '"Manrope", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const DISPLAY = '"Stengazeta", "Manrope", system-ui, sans-serif';
const ONDER = '"Onder", "Manrope", system-ui, sans-serif';
const EMERALD = '#34d399';
const EMERALD_SOFT = '#6ee7b7';
const BG = '#000000';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const T = {
  ink: '#FFFFFF',
  sub: 'rgba(255,255,255,0.60)',
  faint: 'rgba(255,255,255,0.40)',
  hair: 'rgba(255,255,255,0.10)',
  hairSoft: 'rgba(255,255,255,0.06)',
  surface: 'rgba(255,255,255,0.045)',
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* — slow cinematic scroll reveal — */
function Reveal({ children, className = "", delay = 0, y = 34 }: {
  children: React.ReactNode; className?: string; delay?: number; y?: number;
}) {
  const r = useRef(null);
  const v = useInView(r, { once: true, margin: "-12% 0px" });
  const rm = prefersReducedMotion();
  return (
    <m.div ref={r}
      initial={rm ? { opacity: 1 } : { opacity: 0, y }}
      animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: rm ? 0 : 0.95, ease: EASE, delay: rm ? 0 : delay }}
      className={className}>
      {children}
    </m.div>
  );
}

/* — eyebrow label — */
function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: 8, justifyContent: center ? 'center' : 'flex-start' }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: EMERALD, display: 'inline-block' }} />
      <span style={{
        fontFamily: ONDER, fontSize: '0.52rem', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: EMERALD_SOFT,
      }}>{children}</span>
    </div>
  );
}

/* — display heading — */
function Display({ children, size = 'clamp(2.1rem, 9.6vw, 3rem)', style }: {
  children: React.ReactNode; size?: string; style?: React.CSSProperties;
}) {
  return (
    <h2 style={{
      fontFamily: DISPLAY, fontSize: size, fontWeight: 700, color: T.ink,
      letterSpacing: '0.012em', lineHeight: 1.07, ...style,
    }}>{children}</h2>
  );
}

/* — body copy — */
function Body({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: FONT, fontSize: '1.0625rem', fontWeight: 400, lineHeight: 1.6,
      color: T.sub, letterSpacing: '-0.005em', ...style,
    }}>{children}</p>
  );
}

interface ConstructorPageProps {
  onNavigate: (section: string, data?: any) => void;
}

interface SelectedFeature {
  id: string;
  name: string;
  price: number;
  category: string;
}

const appTemplatesBase = [
  { id: 'ecommerce-basic', nameKey: 'constructor.onlineStore', icon: ShoppingCart, descriptionKey: 'constructor.onlineStoreDesc', features: ['catalog', 'cart', 'auth', 'payments'], estimatedPrice: 150000, developmentTimeKey: 'constructor.days710', popular: true },
  { id: 'restaurant', nameKey: 'constructor.restaurantTemplate', icon: Coffee, descriptionKey: 'constructor.restaurantTemplateDesc', features: ['catalog', 'cart', 'auth', 'booking-system'], estimatedPrice: 180000, developmentTimeKey: 'constructor.days1012', popular: false },
  { id: 'fitness-center', nameKey: 'constructor.fitnessClub', icon: Dumbbell, descriptionKey: 'constructor.fitnessClubDesc', features: ['booking-system', 'auth', 'subscriptions', 'progress-tracking'], estimatedPrice: 200000, developmentTimeKey: 'constructor.days1215', popular: false },
  { id: 'services', nameKey: 'constructor.servicesTemplate', icon: Settings, descriptionKey: 'constructor.servicesTemplateDesc', features: ['catalog', 'booking-system', 'auth', 'payments'], estimatedPrice: 170000, developmentTimeKey: 'constructor.days812', popular: false }
];

const availableFeaturesBase = [
  { id: 'catalog', nameKey: 'constructor.catalogFeature', price: 25000, categoryKey: 'constructor.basicFeatures', icon: Package, included: true },
  { id: 'cart', nameKey: 'constructor.cartFeature', price: 20000, categoryKey: 'constructor.basicFeatures', icon: ShoppingCart, included: true },
  { id: 'auth', nameKey: 'constructor.authFeature', price: 15000, categoryKey: 'constructor.basicFeatures', icon: User, included: true },
  { id: 'search', nameKey: 'constructor.searchFeature', price: 20000, categoryKey: 'constructor.basicFeatures', icon: Zap, included: false },
  { id: 'favorites', nameKey: 'constructor.favoritesFeature', price: 12000, categoryKey: 'constructor.basicFeatures', icon: Star, included: false },
  { id: 'reviews', nameKey: 'constructor.reviewsFeature', price: 25000, categoryKey: 'constructor.basicFeatures', icon: Star, included: false },
  { id: 'payments', nameKey: 'constructor.paymentsFeature', price: 45000, categoryKey: 'constructor.paymentsCategory', icon: CreditCard, included: false },
  { id: 'subscriptions', nameKey: 'constructor.subscriptionsFeature', price: 55000, categoryKey: 'constructor.paymentsCategory', icon: CreditCard, included: false },
  { id: 'installments', nameKey: 'constructor.installmentsFeature', price: 35000, categoryKey: 'constructor.paymentsCategory', icon: CreditCard, included: false },
  { id: 'delivery-basic', nameKey: 'constructor.deliveryFeature', price: 30000, categoryKey: 'constructor.deliveryCategory', icon: Truck, included: false },
  { id: 'pickup-points', nameKey: 'constructor.pickupFeature', price: 35000, categoryKey: 'constructor.deliveryCategory', icon: Package, included: false },
  { id: 'express-delivery', nameKey: 'constructor.expressFeature', price: 25000, categoryKey: 'constructor.deliveryCategory', icon: Truck, included: false },
  { id: 'push-notifications', nameKey: 'constructor.notificationsFeature', price: 25000, categoryKey: 'constructor.communicationsCategory', icon: Bell, included: false },
  { id: 'chat-support', nameKey: 'constructor.chatSupportFeature', price: 45000, categoryKey: 'constructor.communicationsCategory', icon: MessageSquare, included: false },
  { id: 'video-calls', nameKey: 'constructor.videoCallsFeature', price: 60000, categoryKey: 'constructor.communicationsCategory', icon: Smartphone, included: false },
  { id: 'loyalty-program', nameKey: 'constructor.loyaltyFeature', price: 65000, categoryKey: 'constructor.marketingCategory', icon: Crown, included: false },
  { id: 'promo-codes', nameKey: 'constructor.promoCodesFeature', price: 30000, categoryKey: 'constructor.marketingCategory', icon: Crown, included: false },
  { id: 'referral-system', nameKey: 'constructor.referralFeature', price: 55000, categoryKey: 'constructor.marketingCategory', icon: Users, included: false },
  { id: 'basic-analytics', nameKey: 'constructor.analyticsFeature', price: 45000, categoryKey: 'constructor.managementCategory', icon: BarChart, included: false },
  { id: 'admin-panel', nameKey: 'constructor.adminPanelFeature', price: 75000, categoryKey: 'constructor.managementCategory', icon: Settings, included: false },
  { id: 'crm-system', nameKey: 'constructor.crmFeature', price: 120000, categoryKey: 'constructor.managementCategory', icon: Users, included: false },
  { id: 'booking-system', nameKey: 'constructor.bookingFeature', price: 55000, categoryKey: 'constructor.bookingCategory', icon: Calendar, included: false },
  { id: 'queue-management', nameKey: 'constructor.queueFeature', price: 45000, categoryKey: 'constructor.bookingCategory', icon: Clock, included: false },
  { id: 'calendar-sync', nameKey: 'constructor.calendarFeature', price: 30000, categoryKey: 'constructor.bookingCategory', icon: Calendar, included: false },
  { id: 'progress-tracking', nameKey: 'constructor.progressFeature', price: 45000, categoryKey: 'constructor.managementCategory', icon: BarChart, included: false },
  { id: 'ai-chatbot', nameKey: 'constructor.aiChatbotFeature', price: 49000, categoryKey: 'constructor.aiAutomationCategory', icon: MessageSquare, included: false },
  { id: 'ai-recommendations', nameKey: 'constructor.aiRecommendationsFeature', price: 55000, categoryKey: 'constructor.aiAutomationCategory', icon: Sparkles, included: false },
  { id: 'auto-responses', nameKey: 'constructor.autoResponsesFeature', price: 25000, categoryKey: 'constructor.aiAutomationCategory', icon: Zap, included: false },
  { id: 'smart-search', nameKey: 'constructor.smartSearchFeature', price: 35000, categoryKey: 'constructor.aiAutomationCategory', icon: Zap, included: false },
  { id: 'voice-assistant', nameKey: 'constructor.voiceAssistantFeature', price: 75000, categoryKey: 'constructor.aiAutomationCategory', icon: Smartphone, included: false },
  { id: 'telegram-bot', nameKey: 'constructor.telegramBotFeature', price: 35000, categoryKey: 'constructor.integrationsCategory', icon: MessageSquare, included: false },
  { id: 'whatsapp-integration', nameKey: 'constructor.whatsappFeature', price: 45000, categoryKey: 'constructor.integrationsCategory', icon: MessageSquare, included: false },
  { id: 'google-maps', nameKey: 'constructor.googleMapsFeature', price: 20000, categoryKey: 'constructor.integrationsCategory', icon: Globe, included: false },
  { id: 'sms-notifications', nameKey: 'constructor.smsFeature', price: 25000, categoryKey: 'constructor.integrationsCategory', icon: Bell, included: false },
  { id: 'email-marketing', nameKey: 'constructor.emailMarketingFeature', price: 30000, categoryKey: 'constructor.integrationsCategory', icon: Bell, included: false },
  { id: '1c-integration', nameKey: 'constructor.integration1cFeature', price: 85000, categoryKey: 'constructor.integrationsCategory', icon: Settings, included: false },
  { id: 'api-access', nameKey: 'constructor.apiAccessFeature', price: 55000, categoryKey: 'constructor.integrationsCategory', icon: Settings, included: false }
];

const categoryKeys = [
  'constructor.basicFeatures', 'constructor.paymentsCategory', 'constructor.deliveryCategory',
  'constructor.communicationsCategory', 'constructor.marketingCategory', 'constructor.managementCategory',
  'constructor.bookingCategory', 'constructor.aiAutomationCategory', 'constructor.integrationsCategory'
];

const subscriptionPlansBase = [
  { id: 'minimal', nameKey: 'constructor.minimalPlan', price: 9900, descriptionKey: 'constructor.minimalPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.hosting99', 'constructor.subscriptionFeatures.minorFixes', 'constructor.subscriptionFeatures.emailSupport', 'constructor.subscriptionFeatures.monthlyBackups'],
    color: '#9CA3AF', },
  { id: 'standard', nameKey: 'constructor.standardPlan', price: 14900, descriptionKey: 'constructor.standardPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.allFromMinimal', 'constructor.subscriptionFeatures.prioritySupport', 'constructor.subscriptionFeatures.freeUpdates', 'constructor.subscriptionFeatures.weeklyBackups', 'constructor.subscriptionFeatures.response2h'],
    color: EMERALD, popular: true },
  { id: 'premium', nameKey: 'constructor.premiumPlan', price: 24900, descriptionKey: 'constructor.premiumPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.allFromStandard', 'constructor.subscriptionFeatures.personalManager', 'constructor.subscriptionFeatures.businessConsulting', 'constructor.subscriptionFeatures.dailyBackups', 'constructor.subscriptionFeatures.priorityImprovements', 'constructor.subscriptionFeatures.analyticsReports'],
    color: '#a78bfa', }
];

/* — Stengazeta-driven template card — */
const TemplateCard = memo(({ template, onSelect, t, index, ru }: any) => {
  const IconComponent = template.icon;
  return (
    <Reveal delay={0.04 * index} y={22}>
      <button
        type="button"
        onClick={onSelect}
        className="active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-2"
        style={{
          padding: '22px 22px',
          borderRadius: 22,
          background: 'rgba(255,255,255,0.025)',
          border: `1px solid ${T.hairSoft}`,
          marginBottom: 10,
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, background-color 0.3s ease',
          width: '100%', textAlign: 'left',
          minHeight: 92,
        }}
        data-testid={`template-${template.id}`}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconComponent size={20} style={{ color: EMERALD_SOFT }} strokeWidth={1.7} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: DISPLAY, fontSize: '1.18rem', fontWeight: 700,
                color: T.ink, letterSpacing: '0.012em', lineHeight: 1.15,
              }}>
                {template.name}
              </span>
              {template.popular && (
                <span style={{
                  padding: '2px 8px', borderRadius: 999,
                  background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.24)',
                  fontFamily: ONDER, fontSize: '0.5rem', fontWeight: 700,
                  color: EMERALD_SOFT, letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                }}>
                  {t('constructor.popularTag')}
                </span>
              )}
            </div>
            <p style={{
              fontFamily: FONT, fontSize: '0.9rem', color: T.sub,
              lineHeight: 1.5, marginBottom: 12, letterSpacing: '-0.005em',
            }}>
              {template.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={11} style={{ color: T.faint }} />
                <span style={{
                  fontFamily: FONT, fontSize: '0.78rem', fontWeight: 500,
                  color: T.faint,
                }}>
                  {template.developmentTime}
                </span>
              </div>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: T.hair }} />
              <span style={{
                fontFamily: DISPLAY, fontSize: '0.92rem', fontWeight: 700,
                color: T.ink, letterSpacing: '0.01em',
              }}>
                {t('constructor.from')} {template.estimatedPrice.toLocaleString()} {t('sidebar.currencySymbol')}
              </span>
            </div>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: 999, flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 4,
          }}>
            <ArrowRight size={12} style={{ color: T.sub }} />
          </div>
        </div>
      </button>
    </Reveal>
  );
});
TemplateCard.displayName = 'TemplateCard';

/* — Step progress, restyled — */
const StepProgress = memo(({ currentStep, stepData }: {
  currentStep: number;
  stepData: { num: number; title: string }[];
}) => (
  <div style={{
    padding: '20px 18px',
    borderRadius: 22,
    background: 'rgba(255,255,255,0.025)',
    border: `1px solid ${T.hairSoft}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {stepData.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: currentStep >= s.num
                ? currentStep === s.num ? 'rgba(52,211,153,0.18)' : 'rgba(52,211,153,0.10)'
                : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${currentStep >= s.num
                ? currentStep === s.num ? 'rgba(52,211,153,0.55)' : 'rgba(52,211,153,0.28)'
                : T.hair}`,
              transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: currentStep === s.num ? `0 0 24px rgba(52,211,153,0.18)` : 'none',
            }}>
              {currentStep > s.num ? (
                <Check size={14} color={EMERALD} strokeWidth={2.6} />
              ) : (
                <span style={{
                  fontFamily: DISPLAY, fontSize: '0.92rem', fontWeight: 700,
                  color: currentStep >= s.num ? EMERALD : T.faint,
                  letterSpacing: '0.012em',
                }}>{s.num}</span>
              )}
            </div>
            <p style={{
              fontFamily: FONT, fontSize: '0.66rem', fontWeight: 600,
              color: currentStep >= s.num ? T.sub : T.faint,
              marginTop: 10, textAlign: 'center', letterSpacing: '-0.005em',
              transition: 'color 0.4s ease', lineHeight: 1.3,
              maxWidth: 84,
            }}>
              {s.title}
            </p>
          </div>
          {i < stepData.length - 1 && (
            <div style={{
              height: 1.5, flex: '0 0 24px', borderRadius: 1,
              background: currentStep > s.num
                ? `linear-gradient(90deg, rgba(52,211,153,0.55), rgba(52,211,153,0.22))`
                : T.hair,
              transition: 'background 0.4s ease',
              marginBottom: 28,
            }} />
          )}
        </div>
      ))}
    </div>
  </div>
));
StepProgress.displayName = 'StepProgress';

function ConstructorPage({ onNavigate }: ConstructorPageProps) {
  const { t, language } = useLanguage();
  const haptic = useHaptic();
  const ru = language === 'ru';
  const rm = prefersReducedMotion();

  const appTemplates = useMemo(() => appTemplatesBase.map(tpl => ({
    ...tpl, name: t(tpl.nameKey), description: t(tpl.descriptionKey), developmentTime: t(tpl.developmentTimeKey)
  })), [t]);

  const availableFeatures = useMemo(() => availableFeaturesBase.map(f => ({
    ...f, name: t(f.nameKey), category: t(f.categoryKey)
  })), [t]);

  const subscriptionPlans = useMemo(() => subscriptionPlansBase.map(plan => ({
    ...plan, name: t(plan.nameKey), description: t(plan.descriptionKey),
    features: plan.featuresKeys.map(key => t(key))
  })), [t]);

  const [selectedTemplate, setSelectedTemplate] = useState<typeof appTemplates[0] | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [activeCategoryKey, setActiveCategoryKey] = useState('constructor.basicFeatures');
  const [projectName, setProjectName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<typeof subscriptionPlans[0]>(subscriptionPlans[1]);
  const [pricingAnnual, setPricingAnnual] = useState(true);

  const selectTemplate = useCallback((template: typeof appTemplates[0]) => {
    haptic.medium();
    setSelectedTemplate(template);
    setProjectName(`${t('constructor.myProject')} ${template.name}`);
    const templateFeatures = template.features.map(featureId => {
      const feature = availableFeatures.find(f => f.id === featureId);
      if (feature) return { id: feature.id, name: feature.name, price: feature.price, category: feature.category };
      return null;
    }).filter(Boolean) as SelectedFeature[];
    setSelectedFeatures(templateFeatures);
    setCurrentStep(2);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [t, appTemplates, availableFeatures, haptic]);

  const hasTrackedProjectRef = useRef(false);
  useEffect(() => {
    if (projectName.trim().length > 0 && !hasTrackedProjectRef.current) {
      hasTrackedProjectRef.current = true;
      trackProjectCreation();
    }
  }, [projectName]);

  const toggleFeature = useCallback((feature: typeof availableFeatures[0]) => {
    if (feature.included) return;
    if (selectedTemplate?.features.includes(feature.id)) return;
    haptic.light();
    const isSelected = selectedFeatures.find(f => f.id === feature.id);
    if (isSelected) {
      setSelectedFeatures(prev => prev.filter(f => f.id !== feature.id));
    } else {
      setSelectedFeatures(prev => [...prev, { id: feature.id, name: feature.name, price: feature.price, category: feature.category }]);
      trackFeatureAdded();
    }
  }, [selectedFeatures, selectedTemplate, haptic]);

  const calculateTotal = useCallback(() => {
    const basePrice = selectedTemplate?.estimatedPrice || 0;
    const templateIncludedFeatures = selectedTemplate?.features || [];
    const featuresPrice = selectedFeatures
      .filter(f => {
        const feature = availableFeatures.find(af => af.id === f.id);
        return !feature?.included && !templateIncludedFeatures.includes(f.id);
      })
      .reduce((sum, feature) => sum + feature.price, 0);
    return basePrice + featuresPrice;
  }, [selectedTemplate, selectedFeatures, availableFeatures]);

  const totalPrice = useMemo(() => calculateTotal(), [calculateTotal]);

  const handleOrderClick = useCallback(() => {
    if (!selectedTemplate || !projectName.trim()) return;
    haptic.success();
    onNavigate('checkout', {
      projectName: projectName.trim(), selectedFeatures,
      selectedTemplate: selectedTemplate.name, totalAmount: totalPrice,
      estimatedDevelopmentTime: selectedTemplate.developmentTime,
      subscription: { plan: selectedSubscription.name, monthlyPrice: selectedSubscription.price }
    });
  }, [selectedTemplate, projectName, selectedFeatures, totalPrice, selectedSubscription, onNavigate, haptic]);

  const goToStep = useCallback((step: number) => {
    haptic.light();
    setCurrentStep(step);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [haptic]);

  const activeCategory = t(activeCategoryKey);
  const filteredFeatures = useMemo(() =>
    availableFeatures.filter(f => f.category === activeCategory), [activeCategory, availableFeatures]);

  const templateHandlers = useMemo(() =>
    appTemplates.map(template => ({ id: template.id, handler: () => selectTemplate(template) })), [appTemplates, selectTemplate]);

  const additionalFeaturesPrice = useMemo(() => {
    const templateIncludedFeatures = selectedTemplate?.features || [];
    return selectedFeatures
      .filter(f => {
        const feature = availableFeatures.find(af => af.id === f.id);
        return !feature?.included && !templateIncludedFeatures.includes(f.id);
      })
      .reduce((sum, f) => sum + f.price, 0);
  }, [selectedFeatures, selectedTemplate, availableFeatures]);

  const stepData = useMemo(() => [
    { num: 1, title: t('constructor.selectAppType') },
    { num: 2, title: t('constructor.addFeatures') },
    { num: 3, title: t('constructor.placeOrder') },
  ], [t]);

  /* — chapter content — */
  const stages = useMemo(() => [
    { img: IMG_BRIEF, num: '01', eyebrow: ru ? 'Бриф' : 'Brief',
      title: ru ? <>Слушаем,<br />а не угадываем</> : <>We listen,<br />we don't guess</>,
      body: ru ? 'Часовой созвон, чтобы погрузиться в ваш бизнес, цели и аудиторию. На выходе — короткий бриф, который вы подписываете.'
        : 'A one-hour call to dive into your business, goals and audience. Output: a short brief you sign.' },
    { img: IMG_DESIGN, num: '02', eyebrow: ru ? 'Дизайн' : 'Design',
      title: ru ? <>Прототип, который<br />вы утверждаете</> : <>The prototype<br />you sign off</>,
      body: ru ? 'Сначала кликабельный прототип, потом финальный визуал. Только после вашего «да» уходим в разработку.'
        : 'Clickable prototype first, then final visuals. Build starts only after your sign-off.' },
    { img: IMG_CODE, num: '03', eyebrow: ru ? 'Сборка' : 'Build',
      title: ru ? <>Каждый этап —<br />на ваших глазах</> : <>Every step,<br />in your view</>,
      body: ru ? 'Сборка идёт в открытом превью. Вы видите прогресс, тестируете и оставляете замечания на лету.'
        : 'Build runs in an open preview. You see progress, test and leave notes in real time.' },
    { img: IMG_LAUNCH, num: '04', eyebrow: ru ? 'Запуск' : 'Launch',
      title: ru ? <>Готово —<br />в Telegram</> : <>Shipped —<br />into Telegram</>,
      body: ru ? 'Публикуем приложение, передаём аналитику и берёмся за поддержку. Только после этого — финальный платёж.'
        : 'We publish the app, hand over analytics and step into support. Only then — the final payment.' },
  ], [ru]);

  const trustItems = useMemo(() => [
    { icon: FileSignature, t: ru ? 'Договор с гарантией' : 'Contract with guarantee',
      d: ru ? 'Сроки, объём работ и ответственность сторон зафиксированы письменно ещё до первого платежа.'
        : 'Deadlines, scope and liability are locked in writing before the first transfer.' },
    { icon: Clock, t: ru ? 'Неустойка за просрочку' : 'Late-delivery penalty',
      d: ru ? 'Если мы не сдаём этап в срок — вы получаете скидку. Это прямо в договоре, не на словах.'
        : "If we miss a milestone — you get a discount. Right in the contract, not just words." },
    { icon: ShieldCheck, t: ru ? 'Эскроу второго платежа' : 'Escrow on the second payment',
      d: ru ? '65% уходит только когда вы подтвердили приём приложения. До этого деньги «висят» на холдинге.'
        : "The 65% releases only after you sign delivery. Until then, it's held in escrow." },
    { icon: Check, t: ru ? 'Возврат на любом этапе' : 'Refund at any stage',
      d: ru ? 'Не подошёл результат этапа — возвращаем деньги за все непринятые этапы без вопросов.'
        : "If a stage doesn't fit — full refund for unaccepted stages, no questions." },
  ], [ru]);

  /* — hero scroll parallax — */
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroImgScale = useTransform(scrollYProgress, [0, 1], [1, 1.13]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroFade = useTransform(scrollYProgress, [0, 0.62], [1, 0]);

  const headlineAccents = useMemo(() => [
    ru ? 'гарантией' : 'a guarantee',
    ru ? 'этапами' : 'real stages',
    ru ? 'договором' : 'a contract',
    ru ? 'эскроу' : 'escrow',
  ], [ru]);
  const [accentIdx, setAccentIdx] = useState(0);
  useEffect(() => {
    if (rm) return;
    const iv = setInterval(() => setAccentIdx(p => (p + 1) % headlineAccents.length), 2600);
    return () => clearInterval(iv);
  }, [headlineAccents, rm]);

  return (
    <div className="min-h-screen select-none overflow-x-hidden constructor-page" style={{ backgroundColor: BG }}>
      <div className="w4-grain" aria-hidden="true" />
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="mx-auto w-full" style={{ maxWidth: 540 }}>

          {/* ═══════════ HERO ═══════════ */}
          <header ref={heroRef} className="relative overflow-hidden" role="banner" style={{ minHeight: '100dvh' }}>
            <m.div className="absolute inset-0" style={{ y: rm ? 0 : heroImgY, scale: rm ? 1 : heroImgScale }}>
              <video src={HERO_VIDEO} autoPlay muted loop playsInline preload="auto" poster={IMG_HERO}
                className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 1 }} />
              <div className="absolute inset-0" aria-hidden="true" style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.62) 22%, rgba(0,0,0,0.06) 46%, rgba(0,0,0,0.34) 74%, #000 100%)',
              }} />
            </m.div>

            {/* spacer — see ShowcasePage for rationale */}
            <div aria-hidden="true" style={{ zIndex: 2, height: 'calc(env(safe-area-inset-top, 0px) + 44px)' }} />

            <m.div className="relative px-6" style={{
              zIndex: 2, paddingTop: 'clamp(38px, 13vh, 104px)',
              y: rm ? 0 : heroTextY, opacity: rm ? 1 : heroFade,
            }}>
              <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}>
                <Eyebrow>{ru ? 'Платите без рисков' : 'Pay without risk'}</Eyebrow>
              </m.div>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.012em', lineHeight: 1.0, marginTop: 20 }}>
                <m.span className="block" initial={rm ? { opacity: 1 } : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: rm ? 0 : 0.9, ease: EASE, delay: rm ? 0 : 0.42 }}
                  style={{ fontSize: 'clamp(2.6rem, 12.6vw, 3.7rem)', color: T.ink }}>
                  {ru ? 'Платите с' : 'Pay with'}
                </m.span>
                <span className="block" style={{ fontSize: 'clamp(2.6rem, 12.6vw, 3.7rem)', height: '1.05em', overflow: 'hidden' }}>
                  <AnimatePresence mode="wait">
                    <m.span
                      key={accentIdx}
                      initial={rm ? { opacity: 1 } : { y: 48, opacity: 0, filter: 'blur(6px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={rm ? { opacity: 0 } : { y: -48, opacity: 0, filter: 'blur(6px)' }}
                      transition={{ duration: rm ? 0 : 0.55, ease: EASE }}
                      style={{ color: EMERALD, display: 'inline-block' }}
                    >
                      {headlineAccents[accentIdx]}.
                    </m.span>
                  </AnimatePresence>
                </span>
              </h1>
              <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.78 }}>
                <Body style={{ marginTop: 22, maxWidth: 360 }}>
                  {ru
                    ? '35% после утверждения дизайна, 65% — после готового приложения. Договор, неустойка, эскроу. Прозрачно на каждом шаге.'
                    : '35% on design sign-off, 65% on delivery. Contract, penalty clause, escrow. Transparent at every step.'}
                </Body>
              </m.div>
              <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.94 }}
                className="flex items-center" style={{ gap: 14, marginTop: 30 }}>
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    if (typeof document !== 'undefined') document.querySelector('#builder-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="group flex items-center transition-transform duration-300 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                  style={{ height: 54, padding: '0 26px', borderRadius: 999, background: T.ink, gap: 8 }}
                  data-testid="hero-cta-build"
                >
                  <span style={{ fontFamily: FONT, fontSize: '0.95rem', fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>
                    {ru ? 'Собрать проект' : 'Configure project'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    if (typeof document !== 'undefined') document.querySelector('#guarantee-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex items-center transition-opacity duration-300 active:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:outline-offset-2"
                  style={{ height: 54, gap: 7 }} aria-label={ru ? 'Гарантии' : 'Guarantees'}
                  data-testid="hero-cta-trust"
                >
                  <span className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.hair}` }}>
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: EMERALD }} strokeWidth={2.4} />
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: '0.95rem', fontWeight: 600, color: T.ink }}>
                    {ru ? 'Гарантии' : 'Guarantees'}
                  </span>
                </button>
              </m.div>
            </m.div>

            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.3 }}
              className="absolute left-1/2" style={{ bottom: 18, transform: 'translateX(-50%)', zIndex: 2 }} aria-hidden="true">
              <m.div animate={rm ? {} : { y: [0, 7, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <ArrowDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} strokeWidth={2} />
              </m.div>
            </m.div>
          </header>

          {/* ═══════════ STATEMENT ═══════════ */}
          <section className="px-6" style={{ paddingTop: 104, paddingBottom: 96 }}>
            <Reveal>
              <p style={{
                fontFamily: DISPLAY, fontSize: 'clamp(1.7rem, 7.4vw, 2.5rem)', fontWeight: 700,
                letterSpacing: '0.012em', lineHeight: 1.28, color: 'rgba(255,255,255,0.45)',
              }}>
                {ru ? <>Заказ — это не «доверьтесь нам».{' '}
                  <span style={{ color: T.ink }}>Это договор, этапы и эскроу, который работает за вас.</span></>
                  : <>An order isn't 'trust us'.{' '}
                    <span style={{ color: T.ink }}>It's a contract, stages and escrow working for you.</span></>}
              </p>
            </Reveal>
          </section>

          {/* ═══════════ HOW IT WORKS — 4 STAGES ═══════════ */}
          {stages.map((s, i) => (
            <section key={i} style={{ paddingTop: i === 0 ? 0 : 96, paddingBottom: 96 }}>
              <Reveal className="px-6">
                <Eyebrow>{`${s.num} · ${s.eyebrow}`}</Eyebrow>
                <Display style={{ marginTop: 16 }}>{s.title}</Display>
                <Body style={{ marginTop: 17, maxWidth: 380 }}>{s.body}</Body>
              </Reveal>
              <Reveal delay={0.06}>
                <div className="relative" style={{ marginTop: 30, height: '68vh', maxHeight: 540, overflow: 'hidden' }}>
                  <img src={s.img} alt="" loading="lazy" draggable={false}
                    className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center' }} />
                  <div className="absolute inset-0" aria-hidden="true" style={{
                    background: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 80%, #000 100%)',
                  }} />
                </div>
              </Reveal>
            </section>
          ))}

          {/* ═══════════ GUARANTEE ═══════════ */}
          <section id="guarantee-anchor" className="px-6" style={{ paddingTop: 24, paddingBottom: 96 }}>
            <Reveal>
              <Eyebrow>{ru ? 'Гарантия' : 'Guarantee'}</Eyebrow>
              <Display style={{ marginTop: 16 }}>
                {ru ? <>До оплаты —<br />уже на бумаге</> : <>On paper —<br />before you pay</>}
              </Display>
              <Body style={{ marginTop: 16, maxWidth: 380 }}>
                {ru ? 'Договор, сроки и неустойка фиксируются до первого платежа. Эскроу второго транша. Возврат на любом этапе.'
                  : 'Contract, deadlines and penalty clause locked before the first transfer. Escrow on the second payment. Refund at any stage.'}
              </Body>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="relative" style={{ marginTop: 30, height: '62vh', maxHeight: 520, overflow: 'hidden', borderRadius: 28 }}>
                <img src={IMG_SHIELD} alt="" loading="lazy" draggable={false}
                  className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center' }} />
                <div className="absolute inset-0" aria-hidden="true" style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.86) 100%)',
                }} />
              </div>
            </Reveal>
            <div style={{ marginTop: 28 }}>
              {trustItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={i} delay={i * 0.05} y={22}>
                    <div className="flex items-start" style={{
                      gap: 16, padding: '22px 2px',
                      borderTop: i ? `1px solid ${T.hairSoft}` : `1px solid ${T.hair}`,
                    }}>
                      <span className="flex items-center justify-center flex-shrink-0" style={{
                        width: 30, height: 30, borderRadius: 999, marginTop: 2,
                        background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)',
                      }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: EMERALD }} strokeWidth={2.4} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: DISPLAY, fontSize: '1.22rem', fontWeight: 700, color: T.ink, letterSpacing: '0.01em' }}>
                          {item.t}
                        </div>
                        <div style={{ fontFamily: FONT, fontSize: '0.95rem', fontWeight: 400, color: T.sub, lineHeight: 1.55, marginTop: 5 }}>
                          {item.d}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {/* ═══════════ STATS / SOCIAL PROOF ═══════════ */}
          <section className="relative overflow-hidden" style={{ paddingTop: 8, paddingBottom: 96 }}>
            <div className="absolute inset-0" aria-hidden="true" style={{
              background: `radial-gradient(ellipse 70% 50% at 50% 42%, rgba(52,211,153,0.16) 0%, transparent 72%)`,
            }} />
            <div className="relative px-6 text-center">
              <Reveal>
                <div className="flex justify-center"><Eyebrow center>{ru ? 'Цифры' : 'In numbers'}</Eyebrow></div>
                <div style={{
                  fontFamily: DISPLAY, fontSize: 'clamp(4.6rem, 26vw, 8rem)', fontWeight: 700,
                  letterSpacing: '0.005em', lineHeight: 0.94, color: T.ink, marginTop: 22,
                }}>
                  0<span style={{ color: EMERALD }}>₽</span>
                </div>
                <Body style={{ marginTop: 18, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
                  {ru
                    ? 'клиентских средств, потерянных в эскроу за всё время работы студии'
                    : "of client funds ever lost in escrow since the studio launched"}
                </Body>
                <div className="flex items-stretch justify-center" style={{ marginTop: 34 }}>
                  {[
                    { v: '47', l: ru ? 'сдано' : 'shipped' },
                    { v: '100%', l: ru ? 'в срок' : 'on time' },
                    { v: '4.9', l: ru ? 'рейтинг' : 'rating' },
                  ].map((x, i) => (
                    <div key={i} style={{
                      padding: '0 20px',
                      borderLeft: i ? `1px solid ${T.hair}` : 'none',
                    }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: '1.74rem', fontWeight: 700, color: T.ink, letterSpacing: '0.01em' }}>{x.v}</div>
                      <div style={{ fontFamily: ONDER, fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: EMERALD_SOFT, marginTop: 7 }}>{x.l}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ═══════════ PAYMENT SPLIT 35/65 ═══════════ */}
          <section className="relative overflow-hidden" style={{ paddingTop: 8, paddingBottom: 96 }}>
            <div className="absolute inset-0" aria-hidden="true" style={{
              background: `radial-gradient(ellipse 62% 42% at 50% 38%, rgba(52,211,153,0.13) 0%, transparent 70%)`,
            }} />
            <div className="relative px-6">
              <Reveal>
                <Eyebrow>{ru ? 'Оплата' : 'Payment'}</Eyebrow>
                <Display style={{ marginTop: 16 }}>
                  {ru ? <>35 + 65.<br />Никаких сюрпризов.</> : <>35 + 65.<br />No surprises.</>}
                </Display>
                <Body style={{ marginTop: 16, maxWidth: 380 }}>
                  {ru ? 'Только два платежа на разработку — оба привязаны к понятным результатам.'
                    : 'Just two development payments — both tied to clear deliverables.'}
                </Body>
              </Reveal>
              <Reveal delay={0.08}>
                <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { num: '01', pct: '35%', tl: ru ? 'После утверждения дизайна' : 'On design sign-off',
                      d: ru ? 'Готовый прототип, дизайн всех экранов, кликабельный демо.'
                        : 'Prototype, full screen set, first clickable demo.', color: EMERALD },
                    { num: '02', pct: '65%', tl: ru ? 'После сдачи приложения' : 'On delivery',
                      d: ru ? 'Готовое приложение, включённые правки, публикация в Telegram.'
                        : 'Shipped app, included revisions, Telegram publish.', color: '#60a5fa' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      position: 'relative', padding: '22px 22px', borderRadius: 22,
                      background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.hairSoft}`, overflow: 'hidden',
                    }}>
                      <div className="absolute inset-0" aria-hidden="true" style={{
                        background: `linear-gradient(135deg, ${s.color}11 0%, transparent 60%)`, pointerEvents: 'none',
                      }} />
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 18 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: ONDER, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.color, marginBottom: 9 }}>
                            {ru ? `Этап ${s.num}` : `Stage ${s.num}`}
                          </div>
                          <div style={{ fontFamily: DISPLAY, fontSize: '1.32rem', fontWeight: 700, color: T.ink, letterSpacing: '0.012em', lineHeight: 1.18 }}>
                            {s.tl}
                          </div>
                          <div style={{ fontFamily: FONT, fontSize: '0.95rem', color: T.sub, lineHeight: 1.55, marginTop: 8, maxWidth: 280 }}>
                            {s.d}
                          </div>
                        </div>
                        <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 12vw, 3.4rem)', fontWeight: 700, color: s.color, letterSpacing: '0.005em', lineHeight: 0.94, flexShrink: 0 }}>
                          {s.pct}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ═══════════ ESCROW IMAGE BLOCK ═══════════ */}
          <section style={{ paddingTop: 0, paddingBottom: 96 }}>
            <Reveal className="px-6">
              <Eyebrow>{ru ? 'Безопасно' : 'Safe transfer'}</Eyebrow>
              <Display style={{ marginTop: 16 }}>
                {ru ? <>Платёж движется,<br />когда вы видите<br />результат</> : <>The transfer moves<br />only when you see<br />the result</>}
              </Display>
              <Body style={{ marginTop: 16, maxWidth: 380 }}>
                {ru ? 'Второй платёж сидит в эскроу и уходит нам только после вашей приёмки. Если что-то не так — деньги возвращаются вам.'
                  : "The second payment sits in escrow and only releases after your acceptance. If anything's wrong — it returns to you."}
              </Body>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="relative" style={{ marginTop: 30, height: '64vh', maxHeight: 540, overflow: 'hidden' }}>
                <img src={IMG_ESCROW} alt="" loading="lazy" draggable={false}
                  className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center' }} />
                <div className="absolute inset-0" aria-hidden="true" style={{
                  background: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 80%, #000 100%)',
                }} />
              </div>
            </Reveal>
          </section>

          {/* ═══════════ TESTIMONIAL ═══════════ */}
          <section className="px-6" style={{ paddingTop: 0, paddingBottom: 96 }}>
            <Reveal>
              <Eyebrow>{ru ? 'Отзыв' : 'Word'}</Eyebrow>
              <figure style={{ marginTop: 22, position: 'relative' }}>
                <span aria-hidden="true" style={{
                  position: 'absolute', top: -28, left: -8,
                  fontFamily: DISPLAY, fontSize: '7rem', fontWeight: 700,
                  color: 'rgba(52,211,153,0.16)', lineHeight: 1,
                }}>"</span>
                <blockquote style={{
                  fontFamily: DISPLAY, fontSize: 'clamp(1.55rem, 6.6vw, 2.1rem)', fontWeight: 700,
                  letterSpacing: '0.012em', lineHeight: 1.22, color: T.ink, position: 'relative',
                }}>
                  {ru
                    ? 'Подписали договор в понедельник — в среду уже была демо-версия. 35 / 65 это лучшее, что есть на рынке для несложных запусков.'
                    : "Signed the contract Monday — by Wednesday we had a demo. The 35 / 65 split is the best thing on the market for fast launches."}
                </blockquote>
                <figcaption className="flex items-center" style={{ gap: 14, marginTop: 24 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 999,
                    background: 'linear-gradient(135deg, rgba(52,211,153,0.18), rgba(52,211,153,0.04))',
                    border: `1px solid rgba(52,211,153,0.28)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 700,
                    color: EMERALD, letterSpacing: '0.012em',
                  }} aria-hidden="true">
                    {ru ? 'АК' : 'AK'}
                  </div>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 700, color: T.ink, letterSpacing: '0.01em' }}>
                      {ru ? 'Артём Калинин' : 'Artyom Kalinin'}
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: '0.82rem', color: T.faint, marginTop: 2 }}>
                      {ru ? 'CEO · Aura Skincare' : 'CEO · Aura Skincare'}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          </section>

          {/* ═══════════ TARIFFS — custom premium 2026 ═══════════ */}
          <section className="px-6" style={{ paddingTop: 0, paddingBottom: 96 }} aria-labelledby="tariffs-h">
            <Reveal>
              <Eyebrow>{ru ? 'Поддержка' : 'Support'}</Eyebrow>
              <h2 id="tariffs-h" style={{
                fontFamily: DISPLAY, fontSize: 'clamp(2.1rem, 9.6vw, 3rem)', fontWeight: 700,
                color: T.ink, letterSpacing: '0.012em', lineHeight: 1.07, marginTop: 16,
              }}>
                {ru ? <>Поддержка<br />после запуска</> : <>Support<br />after launch</>}
              </h2>
              <Body style={{ marginTop: 16, maxWidth: 380 }}>
                {ru ? 'Хостинг, бэкапы и обновления Telegram API. Тариф выбираете после запуска.'
                  : 'Hosting, backups and Telegram API updates. Pick a plan once your app is live.'}
              </Body>
            </Reveal>

            {/* ── billing toggle ── */}
            <Reveal delay={0.04}>
              <div role="radiogroup" aria-label={ru ? 'Период оплаты' : 'Billing period'} style={{
                marginTop: 28, padding: 4, borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${T.hairSoft}`,
                display: 'inline-flex', alignItems: 'center', gap: 0,
                position: 'relative', overflow: 'hidden',
              }}>
                {[{ k: false, l: ru ? 'Ежемесячно' : 'Monthly' }, { k: true, l: ru ? 'Ежегодно' : 'Yearly', save: true }].map((opt, i) => {
                  const isOn = pricingAnnual === opt.k;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={isOn}
                      onClick={() => { haptic.light(); setPricingAnnual(opt.k); }}
                      style={{
                        position: 'relative', padding: '10px 18px', minHeight: 40,
                        borderRadius: 999, border: 'none',
                        background: isOn ? T.ink : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.28s cubic-bezier(0.22,1,0.36,1)',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <span style={{
                        fontFamily: FONT, fontSize: '0.84rem', fontWeight: 600,
                        color: isOn ? '#000' : T.sub, letterSpacing: '-0.005em',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {opt.l}
                      </span>
                      {opt.save && (
                        <span style={{
                          padding: '2px 7px', borderRadius: 999,
                          background: isOn ? 'rgba(52,211,153,0.22)' : 'rgba(52,211,153,0.12)',
                          fontFamily: ONDER, fontSize: '0.5rem', fontWeight: 700,
                          color: isOn ? EMERALD : EMERALD_SOFT, letterSpacing: '0.12em',
                          textTransform: 'uppercase' as const,
                        }}>
                          {ru ? '−17%' : '−17%'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* ── 3 plan cards ── */}
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                {
                  id: 'minimal',
                  name: t('constructor.minimalPlan'),
                  tagline: ru ? 'Базовая поддержка' : 'Essentials',
                  priceM: 9900, priceY: 99000,
                  accent: 'rgba(156,163,175,0.55)', accentSoft: 'rgba(156,163,175,0.16)',
                  recommended: false,
                  features: [
                    { l: ru ? 'Хостинг 99,9%' : 'Hosting 99.9%', on: true },
                    { l: ru ? 'Бэкапы ежемесячно' : 'Monthly backups', on: true },
                    { l: ru ? 'Мелкие правки до 2 ч/мес' : 'Minor fixes up to 2 h/mo', on: true },
                    { l: ru ? 'Поддержка по email' : 'Email support', on: true },
                    { l: ru ? 'Приоритетная поддержка' : 'Priority support', on: false },
                    { l: ru ? 'Персональный менеджер' : 'Dedicated manager', on: false },
                  ],
                },
                {
                  id: 'standard',
                  name: t('constructor.standardPlan'),
                  tagline: ru ? 'Для большинства' : 'Recommended',
                  priceM: 14900, priceY: 149000,
                  accent: EMERALD, accentSoft: 'rgba(52,211,153,0.18)',
                  recommended: true,
                  features: [
                    { l: ru ? 'Хостинг 99,9%' : 'Hosting 99.9%', on: true },
                    { l: ru ? 'Бэкапы еженедельно' : 'Weekly backups', on: true },
                    { l: ru ? 'Правки до 8 ч/мес' : 'Edits up to 8 h/mo', on: true },
                    { l: ru ? 'Поддержка в Telegram, ответ <2 ч' : 'Telegram support, reply <2 h', on: true },
                    { l: ru ? 'Бесплатные обновления Telegram API' : 'Free Telegram API updates', on: true },
                    { l: ru ? 'Персональный менеджер' : 'Dedicated manager', on: false },
                  ],
                },
                {
                  id: 'premium',
                  name: t('constructor.premiumPlan'),
                  tagline: ru ? 'Для быстрого роста' : 'Scale',
                  priceM: 24900, priceY: 249000,
                  accent: '#a78bfa', accentSoft: 'rgba(167,139,250,0.18)',
                  recommended: false,
                  features: [
                    { l: ru ? 'Всё из Стандарта' : 'Everything in Standard', on: true },
                    { l: ru ? 'Ежедневные бэкапы' : 'Daily backups', on: true },
                    { l: ru ? 'Правки без лимита' : 'Unlimited edits', on: true },
                    { l: ru ? 'Персональный менеджер' : 'Dedicated manager', on: true },
                    { l: ru ? 'Консультации по росту 1×/мес' : 'Growth consult 1×/mo', on: true },
                    { l: ru ? 'Отчёты по аналитике' : 'Analytics reports', on: true },
                  ],
                },
              ].map((plan, idx) => {
                const isOn = selectedSubscription.id === plan.id;
                const price = pricingAnnual ? plan.priceY : plan.priceM;
                const monthly = pricingAnnual ? Math.round(plan.priceY / 12) : plan.priceM;
                return (
                  <Reveal key={plan.id} delay={0.08 + idx * 0.05} y={28}
                    style={{ flexShrink: 0, width: 'min(82vw, 320px)', scrollSnapAlign: 'start', display: 'flex' }}>
                    <div style={{ position: 'relative', width: '100%', display: 'flex' }}>
                      {plan.recommended && (
                        <div aria-hidden="true" style={{
                          position: 'absolute', inset: -1, borderRadius: 28,
                          background: `linear-gradient(135deg, ${EMERALD}55, ${EMERALD}10 40%, transparent 70%)`,
                          filter: 'blur(0.5px)',
                          pointerEvents: 'none',
                          opacity: 0.85,
                        }} />
                      )}
                      <article
                        aria-current={isOn ? 'true' : undefined}
                        style={{
                          position: 'relative',
                          padding: '28px 24px 26px',
                          borderRadius: 26,
                          background: plan.recommended
                            ? 'linear-gradient(165deg, rgba(52,211,153,0.10) 0%, rgba(255,255,255,0.04) 35%, rgba(255,255,255,0.02) 100%)'
                            : 'linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.018) 100%)',
                          border: `1px solid ${plan.recommended ? 'rgba(52,211,153,0.38)' : T.hairSoft}`,
                          boxShadow: plan.recommended ? `0 24px 60px rgba(52,211,153,0.16), inset 0 1px 0 rgba(255,255,255,0.06)` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                          overflow: 'hidden',
                        }}
                        data-testid={`tariff-${plan.id}`}
                      >
                        {/* recommended badge */}
                        {plan.recommended && (
                          <div style={{ position: 'absolute', top: 16, right: 16 }}>
                            <span style={{
                              padding: '5px 11px', borderRadius: 999,
                              background: 'rgba(52,211,153,0.18)',
                              border: '1px solid rgba(52,211,153,0.35)',
                              fontFamily: ONDER, fontSize: '0.5rem', fontWeight: 700,
                              color: EMERALD, letterSpacing: '0.14em', textTransform: 'uppercase' as const,
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: 999, background: EMERALD, display: 'inline-block', boxShadow: `0 0 6px ${EMERALD}` }} />
                              {ru ? 'Популярный' : 'Popular'}
                            </span>
                          </div>
                        )}

                        {/* tagline + name */}
                        <div style={{ fontFamily: ONDER, fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: plan.accent }}>
                          {plan.tagline}
                        </div>
                        <h3 style={{
                          fontFamily: DISPLAY, fontSize: '1.62rem', fontWeight: 700,
                          color: T.ink, letterSpacing: '0.012em', lineHeight: 1.15, marginTop: 8,
                        }}>
                          {plan.name}
                        </h3>

                        {/* price block */}
                        <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                          <div style={{
                            fontFamily: DISPLAY, fontSize: 'clamp(2.6rem, 11vw, 3.2rem)', fontWeight: 700,
                            color: T.ink, letterSpacing: '-0.005em', lineHeight: 0.94,
                            fontVariantNumeric: 'tabular-nums',
                          }}>
                            {monthly.toLocaleString('ru-RU')} {t('sidebar.currencySymbol')}
                          </div>
                          <div style={{
                            fontFamily: FONT, fontSize: '0.82rem', fontWeight: 500,
                            color: T.faint, letterSpacing: '-0.005em',
                          }}>
                            /{t('constructor.monthShort')}
                          </div>
                        </div>
                        {pricingAnnual ? (
                          <div style={{ marginTop: 6, fontFamily: FONT, fontSize: '0.78rem', color: T.faint, fontVariantNumeric: 'tabular-nums' }}>
                            {ru ? 'оплата за год' : 'billed yearly'} — {price.toLocaleString('ru-RU')} {t('sidebar.currencySymbol')}
                          </div>
                        ) : (
                          <div style={{ marginTop: 6, fontFamily: FONT, fontSize: '0.78rem', color: T.faint, fontVariantNumeric: 'tabular-nums' }}>
                            {ru ? 'или' : 'or'} {Math.round(plan.priceY / 12).toLocaleString('ru-RU')} {t('sidebar.currencySymbol')}/{t('constructor.monthShort')} {ru ? 'при оплате за год' : 'billed yearly'}
                          </div>
                        )}

                        {/* divider */}
                        <div style={{ height: 1, margin: '22px 0 18px', background: `linear-gradient(90deg, transparent, ${T.hair} 18%, ${T.hair} 82%, transparent)` }} aria-hidden="true" />

                        {/* features */}
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {plan.features.map((f, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                              <span aria-hidden="true" style={{
                                width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 2,
                                background: f.on ? plan.accentSoft : 'transparent',
                                border: `1px solid ${f.on ? plan.accent + '55' : T.hair}`,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {f.on ? <Check size={10} color={f.on ? plan.accent : T.faint} strokeWidth={3} /> : <span style={{ width: 6, height: 1, background: T.faint, borderRadius: 1 }} />}
                              </span>
                              <span style={{
                                fontFamily: FONT, fontSize: '0.9rem', fontWeight: 500,
                                color: f.on ? T.sub : T.faint,
                                lineHeight: 1.45, letterSpacing: '-0.005em',
                                textDecoration: f.on ? 'none' : 'none',
                              }}>
                                {f.l}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <button
                          type="button"
                          onClick={() => {
                            haptic.medium();
                            setSelectedSubscription(subscriptionPlans.find(p => p.id === plan.id) || subscriptionPlans[1]);
                          }}
                          aria-pressed={isOn}
                          data-testid={`tariff-select-${plan.id}`}
                          className="active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                          style={{
                            width: '100%', marginTop: 24, minHeight: 52, padding: '14px 18px',
                            borderRadius: 999, border: 'none',
                            background: isOn ? T.ink : plan.recommended ? T.ink : 'rgba(255,255,255,0.06)',
                            color: isOn ? '#000' : plan.recommended ? '#000' : T.ink,
                            fontFamily: FONT, fontSize: '0.94rem', fontWeight: 700,
                            letterSpacing: '-0.005em', cursor: 'pointer',
                            transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1), background-color 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}
                        >
                          {isOn ? (
                            <>
                              <Check size={14} strokeWidth={2.6} />
                              <span>{ru ? 'Выбран' : 'Selected'}</span>
                            </>
                          ) : (
                            <>
                              <span>{ru ? 'Выбрать' : 'Choose'} {plan.name}</span>
                              <ArrowRight size={14} strokeWidth={2.4} />
                            </>
                          )}
                        </button>
                      </article>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* compare line */}
            <Reveal delay={0.22}>
              <div style={{
                marginTop: 22, padding: '14px 18px', borderRadius: 18,
                background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.hairSoft}`,
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              }}>
                <ShieldCheck size={14} style={{ color: EMERALD, flexShrink: 0 }} strokeWidth={2.4} />
                <span style={{ fontFamily: FONT, fontSize: '0.84rem', color: T.sub, letterSpacing: '-0.005em', flex: 1, minWidth: 0 }}>
                  {ru ? 'Можно сменить тариф в любой момент. Первый месяц на любом тарифе — со скидкой 50% при годовой оплате.'
                    : 'Switch plans anytime. First month 50% off on yearly billing.'}
                </span>
              </div>
            </Reveal>
          </section>

          {/* ═══════════ BUILDER ═══════════ */}
          <section id="builder-anchor" className="px-6" style={{ paddingTop: 0, paddingBottom: 56 }}>
            <Reveal>
              <Eyebrow>{ru ? 'Конструктор' : 'Builder'}</Eyebrow>
              <Display style={{ marginTop: 16 }}>
                {ru ? <>Соберите<br />своё приложение</> : <>Configure<br />your app</>}
              </Display>
              <Body style={{ marginTop: 16, maxWidth: 380 }}>
                {ru ? 'Шаблон, функции, тариф — за минуту получите смету и запустите проект.'
                  : 'Template, features, plan — get your quote and start the project in a minute.'}
              </Body>
            </Reveal>
            <Reveal delay={0.06}>
              <div style={{ marginTop: 28 }}>
                <StepProgress currentStep={currentStep} stepData={stepData} />
              </div>
            </Reveal>

            {/* — Step 1 — */}
            {currentStep === 1 && (
              <section style={{ marginTop: 32 }}>
                <Reveal>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, transparent, ${EMERALD}40)` }} />
                    <span style={{ fontFamily: ONDER, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: EMERALD_SOFT }}>
                      {t('constructor.step1Title')}
                    </span>
                  </div>
                </Reveal>

                {appTemplates.map((template, idx) => (
                  <TemplateCard key={template.id} template={template} onSelect={templateHandlers[idx].handler} t={t} index={idx} ru={ru} />
                ))}

                <Reveal delay={0.22}>
                  <div style={{
                    padding: '16px 18px', borderRadius: 18,
                    background: 'rgba(52,211,153,0.05)',
                    border: '1px dashed rgba(52,211,153,0.22)',
                    display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 16,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      background: 'rgba(52,211,153,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={13} style={{ color: EMERALD }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: '0.98rem', fontWeight: 700, color: T.ink, letterSpacing: '0.01em' }}>
                        {t('constructor.tip')}
                      </div>
                      <p style={{ fontFamily: FONT, fontSize: '0.86rem', color: T.sub, marginTop: 4, lineHeight: 1.5 }}>
                        {t('constructor.tipText')}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </section>
            )}

            {/* — Step 2 — */}
            {currentStep === 2 && selectedTemplate && (
              <section style={{ marginTop: 32 }}>
                <Reveal>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, transparent, ${EMERALD}40)` }} />
                    <span style={{ fontFamily: ONDER, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: EMERALD_SOFT }}>
                      {t('constructor.step2Title')}
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={0.04}>
                  <div style={{
                    padding: '20px 20px', borderRadius: 20,
                    background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.hairSoft}`, marginBottom: 22,
                  }}>
                    <label htmlFor="project-name-input" style={{
                      fontFamily: ONDER, fontSize: '0.52rem', fontWeight: 700,
                      color: EMERALD_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase',
                      display: 'block', marginBottom: 10,
                    }}>
                      {t('constructor.projectName')}
                    </label>
                    <input
                      id="project-name-input"
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder={t('constructor.enterProjectName')}
                      data-testid="project-name-input"
                      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      inputMode="text" enterKeyHint="done"
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: 14, minHeight: 48,
                        background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${T.hair}`,
                        fontFamily: FONT, fontSize: '1rem', fontWeight: 600,
                        color: T.ink, outline: 'none',
                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.10)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = T.hair;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </Reveal>

                <Reveal delay={0.08}>
                  <div style={{
                    display: 'flex', gap: 6, overflowX: 'auto',
                    paddingBottom: 10, marginBottom: 18,
                    scrollbarWidth: 'none', msOverflowStyle: 'none',
                  }} className="cat-scroll" role="tablist" aria-label={ru ? 'Категории функций' : 'Feature categories'}>
                    {categoryKeys.map((key) => {
                      const label = t(key);
                      const isActive = activeCategoryKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => { haptic.light(); setActiveCategoryKey(key); }}
                          style={{
                            padding: '10px 16px', borderRadius: 999, whiteSpace: 'nowrap', minHeight: 36,
                            fontFamily: FONT, fontSize: '0.78rem', fontWeight: 600,
                            letterSpacing: '-0.005em', border: '1px solid', cursor: 'pointer', flexShrink: 0,
                            transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                            background: isActive ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.025)',
                            color: isActive ? EMERALD : T.sub,
                            borderColor: isActive ? 'rgba(52,211,153,0.32)' : T.hairSoft,
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Reveal>

                <Reveal delay={0.12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredFeatures.map((feature) => {
                      const IconComponent = feature.icon;
                      const isSelected = !!selectedFeatures.find(f => f.id === feature.id);
                      const isIncluded = feature.included;
                      const isInTemplate = selectedTemplate?.features.includes(feature.id);
                      const isIncludedInAny = isIncluded || isInTemplate;
                      const isOn = isSelected || isIncludedInAny;

                      return (
                        <button
                          type="button"
                          key={feature.id}
                          className={!isIncludedInAny ? 'active:scale-[0.985]' : ''}
                          onClick={() => !isIncludedInAny && toggleFeature(feature)}
                          aria-pressed={isOn}
                          disabled={isIncludedInAny}
                          data-testid={`feature-${feature.id}`}
                          style={{
                            padding: '16px 18px', borderRadius: 18, minHeight: 60,
                            background: isOn
                              ? 'linear-gradient(135deg, rgba(52,211,153,0.07) 0%, transparent 100%)'
                              : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isOn ? 'rgba(52,211,153,0.22)' : T.hairSoft}`,
                            display: 'flex', alignItems: 'center', gap: 14,
                            transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                            width: '100%', textAlign: 'left', outline: 'none',
                            cursor: isIncludedInAny ? 'default' : 'pointer',
                          }}
                        >
                          <div style={{
                            width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                            border: `1.5px solid ${isOn ? EMERALD : T.hair}`,
                            background: isOn ? 'rgba(52,211,153,0.18)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.25s ease',
                          }}>
                            {isOn && <Check size={12} color={EMERALD} strokeWidth={2.6} />}
                          </div>
                          <div style={{
                            width: 34, height: 34, borderRadius: 11, flexShrink: 0,
                            background: 'rgba(255,255,255,0.035)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <IconComponent size={15} style={{ color: T.sub }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontFamily: FONT, fontSize: '0.92rem', fontWeight: 600,
                              color: T.ink, letterSpacing: '-0.005em',
                            }}>
                              {feature.name}
                            </span>
                            {isIncludedInAny && (
                              <p style={{
                                fontFamily: FONT, fontSize: '0.72rem', color: EMERALD_SOFT,
                                marginTop: 3,
                              }}>
                                {t('constructor.includedInTemplate')}
                              </p>
                            )}
                          </div>
                          <span style={{
                            fontFamily: DISPLAY, fontSize: '0.92rem', fontWeight: 700,
                            color: isIncludedInAny ? EMERALD : T.ink,
                            letterSpacing: '0.012em', flexShrink: 0,
                          }}>
                            {isIncludedInAny ? t('constructor.included') : `+${feature.price.toLocaleString()} ${t('sidebar.currencySymbol')}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Reveal>

                {/* — subscription plan picker — */}
                <Reveal delay={0.18}>
                  <div style={{ marginTop: 36 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, transparent, ${EMERALD}40)` }} />
                      <span style={{ fontFamily: ONDER, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: EMERALD_SOFT }}>
                        {t('constructor.subscriptionPlan')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="radiogroup" aria-label={t('constructor.subscriptionPlan')}>
                      {subscriptionPlans.map((plan) => {
                        const isOn = selectedSubscription.id === plan.id;
                        return (
                          <button
                            type="button"
                            key={plan.id}
                            role="radio"
                            aria-checked={isOn}
                            className="active:scale-[0.985]"
                            onClick={() => { haptic.light(); setSelectedSubscription(plan); }}
                            data-testid={`subscription-${plan.id}`}
                            style={{
                              padding: '18px 20px', borderRadius: 20, minHeight: 68,
                              background: isOn
                                ? `linear-gradient(135deg, ${plan.color}11 0%, transparent 100%)`
                                : 'rgba(255,255,255,0.02)',
                              border: `1.5px solid ${isOn ? plan.color + '55' : T.hairSoft}`,
                              display: 'flex', alignItems: 'center', gap: 14,
                              transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                              width: '100%', textAlign: 'left', outline: 'none',
                            }}
                          >
                            <div style={{
                              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                              border: `2px solid ${isOn ? plan.color : T.hair}`,
                              background: isOn ? plan.color : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.25s ease',
                              boxShadow: isOn ? `0 0 18px ${plan.color}33` : 'none',
                            }}>
                              {isOn && <Check size={12} color="#000" strokeWidth={3} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: DISPLAY, fontSize: '1.08rem', fontWeight: 700, color: T.ink, letterSpacing: '0.012em' }}>
                                  {plan.name}
                                </span>
                                {plan.popular && (
                                  <span style={{
                                    padding: '2px 8px', borderRadius: 999,
                                    background: `${plan.color}1f`, border: `1px solid ${plan.color}44`,
                                    fontFamily: ONDER, fontSize: '0.5rem', fontWeight: 700,
                                    color: plan.color, letterSpacing: '0.12em',
                                    textTransform: 'uppercase' as const,
                                  }}>
                                    {t('constructor.popularTag')}
                                  </span>
                                )}
                              </div>
                              <p style={{ fontFamily: FONT, fontSize: '0.78rem', color: T.faint, marginTop: 3 }}>
                                {plan.description}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <span style={{
                                fontFamily: DISPLAY, fontSize: '1.18rem', fontWeight: 700,
                                color: isOn ? plan.color : T.ink, letterSpacing: '0.012em',
                                transition: 'color 0.3s ease',
                              }}>
                                {plan.price.toLocaleString()}
                              </span>
                              <span style={{ fontFamily: FONT, fontSize: '0.7rem', color: T.faint, marginLeft: 4 }}>
                                /{t('constructor.monthShort')}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{
                      padding: '14px 16px', borderRadius: 14,
                      background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.hairSoft}`,
                      marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12,
                    }}>
                      {selectedSubscription.features.map((feature, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Check size={11} style={{ color: EMERALD, opacity: 0.85 }} strokeWidth={2.6} />
                          <span style={{ fontFamily: FONT, fontSize: '0.78rem', color: T.sub }}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.24}>
                  <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      style={{
                        flex: '0 0 auto', padding: '14px 24px', borderRadius: 14, minHeight: 48,
                        border: `1px solid ${T.hair}`,
                        background: 'transparent', fontFamily: FONT, fontSize: '0.88rem',
                        fontWeight: 600, color: T.sub, cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      data-testid="builder-back"
                    >
                      {t('constructor.back')}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      disabled={!projectName.trim()}
                      style={{
                        flex: 1, padding: '14px', borderRadius: 14, border: 'none', minHeight: 48,
                        background: !projectName.trim() ? 'rgba(255,255,255,0.05)' : T.ink,
                        fontFamily: FONT, fontSize: '0.92rem', fontWeight: 700,
                        color: !projectName.trim() ? T.faint : '#000',
                        cursor: !projectName.trim() ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        letterSpacing: '-0.005em',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}
                      data-testid="builder-next"
                    >
                      {t('constructor.next')}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </Reveal>
              </section>
            )}

            {/* — Step 3 — */}
            {currentStep === 3 && selectedTemplate && (
              <section style={{ marginTop: 32 }}>
                <Reveal>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, transparent, ${EMERALD}40)` }} />
                    <span style={{ fontFamily: ONDER, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: EMERALD_SOFT }}>
                      {t('constructor.step3Title')}
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={0.08}>
                  <div style={{ borderRadius: 26, overflow: 'hidden', border: `1px solid ${T.hairSoft}` }}>
                    <div style={{
                      padding: '32px 24px 26px',
                      background: 'linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 100%)',
                    }}>
                      <div style={{ textAlign: 'center', marginBottom: 22 }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 18,
                          background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.24)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: 16,
                        }}>
                          <Rocket size={22} style={{ color: EMERALD }} strokeWidth={1.8} />
                        </div>
                        <h3 style={{
                          fontFamily: DISPLAY, fontSize: '1.34rem', fontWeight: 700,
                          color: T.ink, letterSpacing: '0.012em', marginBottom: 6, lineHeight: 1.15,
                        }}>
                          {projectName}
                        </h3>
                        <p style={{ fontFamily: FONT, fontSize: '0.78rem', color: T.faint }}>
                          {t('constructor.basedOnTemplate')} «{selectedTemplate.name}»
                        </p>
                      </div>

                      <div style={{
                        height: 1, background: `linear-gradient(90deg, transparent, ${T.hair}, transparent)`, marginBottom: 18,
                      }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: FONT, fontSize: '0.86rem', color: T.sub }}>
                            {t('constructor.baseCost')}
                          </span>
                          <span style={{ fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 700, color: T.ink, letterSpacing: '0.012em' }}>
                            {selectedTemplate.estimatedPrice.toLocaleString()} {t('sidebar.currencySymbol')}
                          </span>
                        </div>

                        {additionalFeaturesPrice > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: FONT, fontSize: '0.86rem', color: T.sub }}>
                              {t('constructor.additionalFeatures')}
                            </span>
                            <span style={{ fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 700, color: T.ink, letterSpacing: '0.012em' }}>
                              +{additionalFeaturesPrice.toLocaleString()} {t('sidebar.currencySymbol')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{
                      padding: '22px 24px',
                      background: 'linear-gradient(165deg, rgba(52,211,153,0.10) 0%, transparent 100%)',
                      borderTop: `1px solid rgba(52,211,153,0.18)`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{
                          fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 700,
                          color: T.ink, letterSpacing: '0.012em',
                        }}>
                          {t('constructor.totalDevelopment')}
                        </span>
                        <span style={{
                          fontFamily: DISPLAY, fontSize: '1.78rem', fontWeight: 700,
                          color: EMERALD, letterSpacing: '0.005em',
                        }}>
                          {totalPrice.toLocaleString()} {t('sidebar.currencySymbol')}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.hairSoft}`,
                      }}>
                        <span style={{ fontFamily: FONT, fontSize: '0.82rem', color: T.sub }}>
                          {t('constructor.subscription')} ({selectedSubscription.name})
                        </span>
                        <span style={{ fontFamily: DISPLAY, fontSize: '0.98rem', fontWeight: 700, color: T.ink, letterSpacing: '0.012em' }}>
                          {selectedSubscription.price.toLocaleString()} {t('constructor.perMonth')}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      padding: '14px 22px',
                      background: 'rgba(52,211,153,0.06)',
                      borderTop: `1px solid ${T.hairSoft}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                      <Clock size={13} style={{ color: EMERALD }} />
                      <span style={{
                        fontFamily: FONT, fontSize: '0.82rem', fontWeight: 600,
                        color: EMERALD_SOFT,
                      }}>
                        {t('constructor.readinessTime')}: {selectedTemplate.developmentTime}
                      </span>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.18}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
                    <button
                      type="button"
                      onClick={handleOrderClick}
                      data-testid="button-order"
                      style={{
                        width: '100%', padding: '17px', borderRadius: 999, border: 'none', minHeight: 56,
                        background: T.ink,
                        fontFamily: FONT, fontSize: '0.98rem', fontWeight: 700,
                        color: '#000', cursor: 'pointer', letterSpacing: '-0.005em',
                        boxShadow: `0 8px 32px rgba(52,211,153,0.18)`,
                        transition: 'transform 0.25s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      }}
                      className="active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                    >
                      <span>{t('constructor.orderFor')} {totalPrice.toLocaleString()} {t('sidebar.currencySymbol')}</span>
                      <ArrowUpRight size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      style={{
                        width: '100%', padding: '14px', borderRadius: 14, minHeight: 48,
                        border: `1px solid ${T.hair}`,
                        background: 'transparent', fontFamily: FONT, fontSize: '0.86rem',
                        fontWeight: 600, color: T.sub, cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {t('constructor.changeFeatures')}
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <p style={{
                      fontFamily: FONT, fontSize: '0.8rem', color: T.faint,
                      lineHeight: 1.55,
                    }}>
                      {t('constructor.prepayment35')}
                    </p>
                    <p style={{
                      fontFamily: FONT, fontSize: '0.74rem', color: 'rgba(255,255,255,0.3)',
                      marginTop: 6,
                    }}>
                      + {selectedSubscription.name} {t('constructor.subscriptionAfterLaunch')} {selectedSubscription.price.toLocaleString()} {t('constructor.perMonth')}
                    </p>
                  </div>
                </Reveal>
              </section>
            )}
          </section>

          {/* ═══════════ FINAL CTA ═══════════ */}
          <section className="relative overflow-hidden" style={{ paddingTop: 24, paddingBottom: 40 }}>
            <Reveal className="px-6">
              <div className="relative overflow-hidden text-center" style={{ borderRadius: 32, padding: '60px 26px 56px' }}>
                <img src={IMG_LAUNCH} alt="" loading="lazy" draggable={false}
                  className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', opacity: 0.55 }} />
                <div className="absolute inset-0" aria-hidden="true" style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.86) 100%)',
                }} />
                <div className="absolute inset-0" aria-hidden="true" style={{
                  background: `radial-gradient(ellipse 70% 52% at 50% 46%, rgba(52,211,153,0.22) 0%, transparent 72%)`,
                }} />
                <div className="relative">
                  <div className="flex justify-center"><Eyebrow center>{ru ? 'Готовы?' : 'Ready?'}</Eyebrow></div>
                  <h2 style={{
                    fontFamily: DISPLAY, fontSize: 'clamp(2.2rem, 11vw, 3.2rem)', fontWeight: 700,
                    letterSpacing: '0.012em', lineHeight: 1.05, color: T.ink, marginTop: 18,
                  }}>
                    {ru ? <>Сделаем,<br />как договорились.</> : <>We deliver<br />what we agreed.</>}
                  </h2>
                  <Body style={{ marginTop: 18, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
                    {ru ? 'Соберите проект выше или просто напишите — пришлём концепт и смету в течение дня.'
                      : 'Configure your project above or just message us — concept and quote within a day.'}
                  </Body>
                  <button
                    type="button"
                    onClick={() => {
                      haptic.medium();
                      if (selectedTemplate && projectName.trim()) {
                        handleOrderClick();
                      } else if (typeof document !== 'undefined') {
                        document.querySelector('#builder-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="group inline-flex items-center transition-transform duration-300 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                    style={{ height: 56, padding: '0 30px', borderRadius: 999, background: T.ink, gap: 8, marginTop: 30 }}
                    data-testid="final-cta"
                  >
                    <span style={{ fontFamily: FONT, fontSize: '0.98rem', fontWeight: 700, color: '#000', letterSpacing: '-0.005em' }}>
                      {selectedTemplate ? (ru ? 'Оформить заказ' : 'Place order') : (ru ? 'Начать сборку' : 'Start configuring')}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
                  </button>
                  <div style={{ fontFamily: FONT, fontSize: '0.78rem', fontWeight: 500, color: T.faint, marginTop: 18 }}>
                    {ru ? 'Ответим в течение часа' : 'We reply within an hour'}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ═══════════ FOOTER ═══════════ */}
          <footer className="px-6 text-center" role="contentinfo" style={{ paddingTop: 28, paddingBottom: 6, marginBottom: 96 }}>
            <Reveal>
              <div style={{ fontFamily: DISPLAY, fontSize: '1.4rem', fontWeight: 700, color: T.ink, letterSpacing: '0.04em' }}>WEB4TG</div>
              <p style={{ fontFamily: FONT, fontSize: '0.78rem', fontWeight: 400, color: T.faint, lineHeight: 1.55, marginTop: 10, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }}>
                {ru ? 'Договор, эскроу, поэтапная оплата. Платите без рисков.' : 'Contract, escrow, milestone payments. Pay without risk.'}
              </p>
            </Reveal>
          </footer>

        </div>
      </div>

      {/* — sticky summary bar — */}
      {selectedTemplate && currentStep > 1 && (
        <div style={{
          position: 'fixed', bottom: 76, left: 0, right: 0,
          padding: '0 16px', zIndex: 40, pointerEvents: 'none',
        }} data-testid="summary-bar">
          <div className="mx-auto" style={{ maxWidth: 540 }}>
            <m.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{
                pointerEvents: 'auto',
                padding: '14px 18px', borderRadius: 20,
                background: 'rgba(0,0,0,0.72)',
                border: `1px solid ${T.hair}`,
                boxShadow: '0 -8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
                backdropFilter: 'blur(22px) saturate(140%)',
                WebkitBackdropFilter: 'blur(22px) saturate(140%)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{
                  fontFamily: ONDER, fontSize: '0.5rem', fontWeight: 700,
                  color: EMERALD_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4,
                }}>
                  {ru ? 'Разработка' : 'Build'}
                </p>
                <p style={{
                  fontFamily: DISPLAY, fontSize: '1.08rem', fontWeight: 700,
                  color: T.ink, letterSpacing: '0.012em',
                }}>
                  {totalPrice.toLocaleString()} {t('sidebar.currencySymbol')}
                </p>
              </div>
              <div style={{ width: 1, height: 30, background: T.hair }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: ONDER, fontSize: '0.5rem', fontWeight: 700,
                  color: EMERALD_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4,
                }}>
                  {ru ? 'Тариф' : 'Plan'}
                </p>
                <p style={{
                  fontFamily: DISPLAY, fontSize: '0.96rem', fontWeight: 700,
                  color: T.ink, letterSpacing: '0.012em',
                }}>
                  {selectedSubscription.price.toLocaleString()}/{t('constructor.monthShort')}
                </p>
              </div>
              <div style={{ width: 1, height: 30, background: T.hair }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontFamily: ONDER, fontSize: '0.5rem', fontWeight: 700,
                  color: EMERALD_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4,
                }}>
                  {ru ? 'Функции' : 'Features'}
                </p>
                <p style={{
                  fontFamily: DISPLAY, fontSize: '0.96rem', fontWeight: 700,
                  color: T.ink, letterSpacing: '0.012em',
                }}>
                  {selectedFeatures.length}
                </p>
              </div>
            </m.div>
          </div>
        </div>
      )}

      <style>{`
        .constructor-page .w4-grain{
          position:fixed; inset:0; z-index:40; pointer-events:none; opacity:0.05;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .tariff-scroller::-webkit-scrollbar { display: none; }
        .tariff-scroller { scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce){
          .constructor-page *{ animation-duration:.01ms!important; transition-duration:.01ms!important; }
        }
      `}</style>
    </div>
  );
}

export default memo(ConstructorPage);
