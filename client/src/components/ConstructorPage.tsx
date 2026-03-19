import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { m, AnimatePresence, useInView } from "@/utils/LazyMotionProvider";
import { trackProjectCreation, trackFeatureAdded } from "@/hooks/useGamification";
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Wrench, Eye, ShoppingCart, Home, Calculator, User, ArrowRight, Check,
  Package, Coffee, Dumbbell, GraduationCap, Heart, Settings, CreditCard,
  Truck, Bell, Crown, BarChart, Calendar, Users, Zap, Star, MessageSquare,
  Globe, Smartphone, Clock, Info, ChevronRight, Plus, Sparkles, Rocket,
  UserCircle2, DollarSign, TrendingUp, CheckCircle, Gift, Shield,
  Layers, Monitor, Building2
} from "lucide-react";
import { PricingModule, type PricingPlan } from "@/components/ui/pricing-module";

const SYNE = '"Syne", system-ui, sans-serif';
const INSTRUMENT = '"Instrument Serif", Georgia, serif';
const INTER = '"Inter", -apple-system, system-ui, sans-serif';
const EMERALD = '#34d399';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function Cin({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const r = useRef<HTMLDivElement>(null);
  const v = useInView(r, { once: true, margin: "-60px" });
  const rm = prefersReducedMotion();
  return (
    <m.div ref={r}
      initial={rm ? { opacity: 1 } : { opacity: 0, y: 32 }}
      animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: rm ? 0 : 0.7, ease: EASE, delay: rm ? 0 : delay }}
      className={className}>
      {children}
    </m.div>
  );
}

interface ConstructorPageProps {
  onNavigate: (section: string, data?: any) => void;
}

const PaymentSection = memo(({ t }: { t: (key: string) => string }) => {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  const headlines = useMemo(() => [
    { text: t('constructor.paymentRotating.noRisks'), color: EMERALD },
    { text: t('constructor.paymentRotating.withGuarantee'), color: "#a78bfa" },
    { text: t('constructor.paymentRotating.stepByStep'), color: "#fbbf24" },
    { text: t('constructor.paymentRotating.transparently'), color: "#60a5fa" }
  ], [t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [headlines]);

  return (
    <section className="px-2">
      <Cin>
        <span style={{
          fontFamily: SYNE, fontSize: '0.6875rem', fontWeight: 600,
          letterSpacing: '0.15em', textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.25)',
        }}>
          {t('constructor.paymentSection')}
        </span>
      </Cin>

      <Cin delay={0.1}>
        <h2 style={{
          fontFamily: SYNE, fontSize: 'clamp(1.6rem, 6vw, 2rem)',
          fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1,
          color: '#fff', marginTop: 12, marginBottom: 4,
        }}>
          {t('constructor.payHeadline')}
        </h2>
      </Cin>

      <Cin delay={0.15}>
        <div style={{ height: 40, overflow: 'hidden', marginBottom: 20 }}>
          <AnimatePresence mode="wait">
            <m.span
              key={headlineIndex}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="block"
              style={{
                fontFamily: INSTRUMENT, fontStyle: 'italic',
                fontSize: 'clamp(1.6rem, 6vw, 2rem)',
                fontWeight: 400, color: headlines[headlineIndex].color,
                letterSpacing: '-0.02em',
              }}
            >
              {headlines[headlineIndex].text}
            </m.span>
          </AnimatePresence>
        </div>
      </Cin>

      <Cin delay={0.2}>
        <p style={{
          fontFamily: INTER, fontSize: '0.8rem', lineHeight: 1.6,
          color: 'rgba(255,255,255,0.4)', maxWidth: 340,
          letterSpacing: '-0.01em', marginBottom: 28,
        }}>
          {t('constructor.noHiddenFees')}
        </p>
      </Cin>

      {[
        { step: 1, pct: '35%', title: t('constructor.prepayment'), desc: t('constructor.prepaymentDesc'),
          items: [t('constructor.prepaymentItems.interfaceDesign'), t('constructor.prepaymentItems.appStructure'), t('constructor.prepaymentItems.firstDemo')],
          accent: EMERALD },
        { step: 2, pct: '65%', title: t('constructor.afterDelivery'), desc: t('constructor.afterDeliveryDesc'),
          items: [t('constructor.afterDeliveryItems.readyApp'), t('constructor.afterDeliveryItems.revisionsIncluded'), t('constructor.afterDeliveryItems.telegramPublish')],
          accent: '#60a5fa' },
      ].map((s, i) => (
        <Cin key={i} delay={0.25 + i * 0.08}>
          <div style={{
            padding: '20px',
            borderRadius: 20,
            background: 'linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 6px 20px -6px rgba(0,0,0,0.25)',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 10,
                  background: `${s.accent}15`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontFamily: SYNE, fontSize: '0.75rem', fontWeight: 800, color: s.accent,
                }}>{s.step}</div>
                <span style={{ fontFamily: SYNE, fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                  {s.title}
                </span>
              </div>
              <span style={{
                fontFamily: SYNE, fontSize: '1.1rem', fontWeight: 800,
                color: s.accent, letterSpacing: '-0.03em',
              }}>{s.pct}</span>
            </div>
            <p style={{
              fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.5, marginBottom: 14, letterSpacing: '-0.01em',
            }}>
              {s.desc}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 5,
                    background: `${s.accent}12`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Check size={10} color={s.accent} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Cin>
      ))}

      <Cin delay={0.4}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '24px 0' }} />
      </Cin>

      <Cin delay={0.45}>
        <span style={{
          fontFamily: SYNE, fontSize: '0.6875rem', fontWeight: 600,
          letterSpacing: '0.15em', textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.25)', display: 'block', marginBottom: 12,
        }}>
          {t('constructor.afterLaunch')}
        </span>
      </Cin>

      <Cin delay={0.5}>
        <div style={{
          padding: '20px',
          borderRadius: 20,
          background: 'linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 6px 20px -6px rgba(0,0,0,0.25)',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: 'rgba(90,200,250,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontFamily: SYNE, fontSize: '0.75rem', fontWeight: 800, color: '#5AC8FA',
            }}>3</div>
            <span style={{ fontFamily: SYNE, fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              {t('constructor.monthlySubscription')}
            </span>
          </div>
          <p style={{
            fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.5, marginBottom: 16, letterSpacing: '-0.01em',
          }}>
            {t('constructor.monthlySubscriptionDesc')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { text: t('constructor.hosting'), sub: t('constructor.hostingDesc') },
              { text: t('constructor.support'), sub: t('constructor.supportDesc') },
              { text: t('constructor.updates'), sub: t('constructor.updatesDesc') },
              { text: t('constructor.backups'), sub: t('constructor.backupsDesc') }
            ].map((feature, index) => (
              <div key={index} style={{
                padding: '10px 12px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
              }}>
                <p style={{ fontFamily: INTER, fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
                  {feature.text}
                </p>
                <p style={{ fontFamily: INTER, fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
                  {feature.sub}
                </p>
              </div>
            ))}
          </div>

          <PricingModule
            title={t('constructor.pricingTitle')}
            subtitle={t('constructor.pricingSubtitle')}
            annualBillingLabel={t('constructor.annualBilling')}
            monthlyLabel={t('constructor.monthLabel')}
            yearlyLabel={t('constructor.yearLabel')}
            buttonLabel={t('constructor.selectPlan')}
            currency=""
            highlightsLabel={t('constructor.highlights')}
            overviewLabel={t('constructor.overview')}
            recommendedLabel={t('constructor.popular')}
            plans={[
              {
                id: "minimal",
                name: t('constructor.minimalPlan'),
                description: t('constructor.minimalPlanDesc'),
                icon: <Layers className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.5)' }} />,
                priceMonthly: 9900,
                priceYearly: 99000,
                users: t('constructor.hosting') + ' + ' + t('constructor.support'),
                features: [
                  { label: t('constructor.hosting') + ' 99.9%', included: true },
                  { label: t('constructor.updates'), included: true },
                  { label: t('constructor.backups'), included: true },
                  { label: t('constructor.pricingFeature.prioritySupport'), included: false },
                ],
              },
              {
                id: "standard",
                name: t('constructor.standardPlan'),
                description: t('constructor.standardPlanDesc'),
                icon: <Monitor className="w-6 h-6" style={{ color: '#5AC8FA' }} />,
                priceMonthly: 14900,
                priceYearly: 149000,
                users: t('constructor.hosting') + ' + ' + t('constructor.support') + ' + ' + t('constructor.updates'),
                features: [
                  { label: t('constructor.hosting') + ' 99.9%', included: true },
                  { label: t('constructor.updates'), included: true },
                  { label: t('constructor.backups'), included: true },
                  { label: t('constructor.pricingFeature.prioritySupport'), included: true },
                ],
                recommended: true,
              },
              {
                id: "premium",
                name: t('constructor.premiumPlan'),
                description: t('constructor.premiumPlanDesc'),
                icon: <Building2 className="w-6 h-6" style={{ color: '#a78bfa' }} />,
                priceMonthly: 24900,
                priceYearly: 249000,
                users: t('constructor.pricingFeature.allInclusive'),
                features: [
                  { label: t('constructor.hosting') + ' 99.9%', included: true },
                  { label: t('constructor.updates'), included: true },
                  { label: t('constructor.backups'), included: true },
                  { label: t('constructor.pricingFeature.prioritySupport'), included: true },
                  { label: t('constructor.pricingFeature.consultations'), included: true },
                ],
              },
            ]}
            defaultAnnual={false}
          />
        </div>
      </Cin>
    </section>
  );
});
PaymentSection.displayName = 'PaymentSection';

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
    color: '#71717A', },
  { id: 'standard', nameKey: 'constructor.standardPlan', price: 14900, descriptionKey: 'constructor.standardPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.allFromMinimal', 'constructor.subscriptionFeatures.prioritySupport', 'constructor.subscriptionFeatures.freeUpdates', 'constructor.subscriptionFeatures.weeklyBackups', 'constructor.subscriptionFeatures.response2h'],
    color: '#5AC8FA', popular: true },
  { id: 'premium', nameKey: 'constructor.premiumPlan', price: 24900, descriptionKey: 'constructor.premiumPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.allFromStandard', 'constructor.subscriptionFeatures.personalManager', 'constructor.subscriptionFeatures.businessConsulting', 'constructor.subscriptionFeatures.dailyBackups', 'constructor.subscriptionFeatures.priorityImprovements', 'constructor.subscriptionFeatures.analyticsReports'],
    color: '#A78BFA', }
];

const TemplateCard = memo(({ template, onSelect, t }: any) => {
  const IconComponent = template.icon;
  return (
    <div
      onClick={onSelect}
      className="cursor-pointer active:scale-[0.97]"
      style={{
        padding: '16px 18px',
        borderRadius: 18,
        background: 'linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 16px -4px rgba(0,0,0,0.2)',
        marginBottom: 10,
        transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}
      data-testid={`template-${template.id}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${EMERALD}10`,
          border: `1px solid ${EMERALD}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <IconComponent className="w-5 h-5" style={{ color: EMERALD }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: SYNE, fontSize: '0.82rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              {template.name}
            </span>
            {template.popular && (
              <span style={{
                padding: '2px 8px', borderRadius: 8,
                background: `${EMERALD}15`, border: `1px solid ${EMERALD}20`,
                fontFamily: INTER, fontSize: '0.58rem', fontWeight: 700,
                color: EMERALD, letterSpacing: '0.02em',
                textTransform: 'uppercase' as const,
              }}>
                {t('constructor.popularTag')}
              </span>
            )}
          </div>
          <p style={{ fontFamily: INTER, fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: 2, letterSpacing: '-0.01em' }}>
            {template.description}
          </p>
          <div style={{
            fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
          }}>
            <Clock className="w-3 h-3" />
            <span>{template.developmentTime}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{t('constructor.from')} {template.estimatedPrice.toLocaleString()} ₽</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
      </div>
    </div>
  );
});
TemplateCard.displayName = 'TemplateCard';

function ConstructorPage({ onNavigate }: ConstructorPageProps) {
  const { t } = useLanguage();

  const appTemplates = useMemo(() => appTemplatesBase.map(tpl => ({
    ...tpl, name: t(tpl.nameKey), description: t(tpl.descriptionKey), developmentTime: t(tpl.developmentTimeKey)
  })), [t]);

  const availableFeatures = useMemo(() => availableFeaturesBase.map(f => ({
    ...f, name: t(f.nameKey), category: t(f.categoryKey)
  })), [t]);

  const categories = useMemo(() => categoryKeys.map(key => t(key)), [t]);

  const subscriptionPlans = useMemo(() => subscriptionPlansBase.map(plan => ({
    ...plan, name: t(plan.nameKey), description: t(plan.descriptionKey),
    features: plan.featuresKeys.map(key => t(key))
  })), [t]);

  const [selectedTemplate, setSelectedTemplate] = useState<typeof appTemplates[0] | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [activeCategory, setActiveCategory] = useState(t('constructor.basicFeatures'));
  const [projectName, setProjectName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<typeof subscriptionPlans[0]>(subscriptionPlans[1]);

  const selectTemplate = useCallback((template: typeof appTemplates[0]) => {
    setSelectedTemplate(template);
    setProjectName(`${t('constructor.myProject')} ${template.name}`);
    const templateFeatures = template.features.map(featureId => {
      const feature = availableFeatures.find(f => f.id === featureId);
      if (feature) return { id: feature.id, name: feature.name, price: feature.price, category: feature.category };
      return null;
    }).filter(Boolean) as SelectedFeature[];
    setSelectedFeatures(templateFeatures);
    setCurrentStep(2);
  }, [t, appTemplates, availableFeatures]);

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
    const isSelected = selectedFeatures.find(f => f.id === feature.id);
    if (isSelected) {
      setSelectedFeatures(prev => prev.filter(f => f.id !== feature.id));
    } else {
      setSelectedFeatures(prev => [...prev, { id: feature.id, name: feature.name, price: feature.price, category: feature.category }]);
      trackFeatureAdded();
    }
  }, [selectedFeatures, selectedTemplate]);

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
  }, [selectedTemplate, selectedFeatures]);

  const totalPrice = useMemo(() => calculateTotal(), [calculateTotal]);

  const handleOrderClick = useCallback(() => {
    if (!selectedTemplate || !projectName.trim()) return;
    onNavigate('checkout', {
      projectName: projectName.trim(), selectedFeatures,
      selectedTemplate: selectedTemplate.name, totalAmount: totalPrice,
      estimatedDevelopmentTime: selectedTemplate.developmentTime,
      subscription: { plan: selectedSubscription.name, monthlyPrice: selectedSubscription.price }
    });
  }, [selectedTemplate, projectName, selectedFeatures, totalPrice, selectedSubscription, onNavigate]);

  const goToStep = useCallback((step: number) => setCurrentStep(step), []);

  const filteredFeatures = useMemo(() =>
    availableFeatures.filter(f => f.category === activeCategory), [activeCategory]);

  const templateHandlers = useMemo(() =>
    appTemplates.map(template => ({ id: template.id, handler: () => selectTemplate(template) })), [selectTemplate]);

  const additionalFeaturesPrice = useMemo(() => {
    const templateIncludedFeatures = selectedTemplate?.features || [];
    return selectedFeatures
      .filter(f => {
        const feature = availableFeatures.find(af => af.id === f.id);
        return !feature?.included && !templateIncludedFeatures.includes(f.id);
      })
      .reduce((sum, f) => sum + f.price, 0);
  }, [selectedFeatures, selectedTemplate]);

  const stepData = [
    { num: 1, title: t('constructor.selectAppType'), desc: t('constructor.readyTemplateForBusiness') },
    { num: 2, title: t('constructor.addFeatures'), desc: t('constructor.expandCapabilities') },
    { num: 3, title: t('constructor.placeOrder'), desc: t('constructor.startDevelopment') },
  ];

  return (
    <div className="min-h-screen select-none overflow-x-hidden" style={{ backgroundColor: '#050505', paddingTop: 120, paddingBottom: 140 }}>
      <div className="mx-auto w-full px-4" style={{ maxWidth: 540 }}>

        <PaymentSection t={t} />

        <Cin className="mt-10 mb-8">
          <div style={{ display: 'flex', gap: 0 }}>
            {stepData.map((s, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {i > 0 && (
                  <div style={{
                    position: 'absolute', top: 14, right: '50%', left: '-50%', height: 1,
                    background: currentStep > i ? EMERALD : 'rgba(255,255,255,0.06)',
                    transition: 'background 0.3s ease',
                  }} />
                )}
                <div style={{
                  width: 28, height: 28, borderRadius: 10, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1,
                  background: currentStep >= s.num ? `${EMERALD}18` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${currentStep >= s.num ? `${EMERALD}30` : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.3s ease',
                }}>
                  {currentStep > s.num ? (
                    <Check size={12} color={EMERALD} strokeWidth={2.5} />
                  ) : (
                    <span style={{
                      fontFamily: SYNE, fontSize: '0.65rem', fontWeight: 800,
                      color: currentStep >= s.num ? EMERALD : 'rgba(255,255,255,0.3)',
                    }}>{s.num}</span>
                  )}
                </div>
                <p style={{
                  fontFamily: INTER, fontSize: '0.58rem', fontWeight: 600,
                  color: currentStep >= s.num ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                  marginTop: 6, textAlign: 'center', letterSpacing: '-0.01em',
                  transition: 'color 0.3s ease',
                }}>
                  {s.title}
                </p>
              </div>
            ))}
          </div>
        </Cin>

        {currentStep === 1 && (
          <section>
            <Cin>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{
                  fontFamily: SYNE, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                  fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', marginBottom: 6,
                }}>
                  {t('constructor.step1Title')}
                </h2>
                <p style={{ fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em' }}>
                  {t('constructor.step1Desc')}
                </p>
              </div>
            </Cin>

            {appTemplates.map((template, idx) => (
              <Cin key={template.id} delay={0.05 * idx}>
                <TemplateCard template={template} onSelect={templateHandlers[idx].handler} t={t} />
              </Cin>
            ))}

            <Cin delay={0.25}>
              <div style={{
                padding: '16px 18px', borderRadius: 16,
                background: `${EMERALD}06`, border: `1px solid ${EMERALD}15`,
                display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 10,
              }}>
                <Info className="w-4 h-4 flex-shrink-0" style={{ color: EMERALD, marginTop: 1 }} />
                <div>
                  <span style={{ fontFamily: SYNE, fontSize: '0.72rem', fontWeight: 700, color: EMERALD, letterSpacing: '-0.01em' }}>
                    {t('constructor.tip')}
                  </span>
                  <p style={{ fontFamily: INTER, fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: 2, lineHeight: 1.4 }}>
                    {t('constructor.tipText')}
                  </p>
                </div>
              </div>
            </Cin>
          </section>
        )}

        {currentStep === 2 && selectedTemplate && (
          <section>
            <Cin>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{
                  fontFamily: SYNE, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                  fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', marginBottom: 6,
                }}>
                  {t('constructor.step2Title')}
                </h2>
                <p style={{ fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em' }}>
                  {t('constructor.step2Desc')}
                </p>
              </div>
            </Cin>

            <Cin delay={0.05}>
              <div style={{
                padding: '16px 18px', borderRadius: 16,
                background: 'linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.07)', marginBottom: 16,
              }}>
                <label style={{
                  fontFamily: INTER, fontSize: '0.65rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em',
                  textTransform: 'uppercase' as const, display: 'block', marginBottom: 8,
                }}>
                  {t('constructor.projectName')}
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t('constructor.enterProjectName')}
                  data-testid="project-name-input"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  inputMode="text" enterKeyHint="done"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: INTER, fontSize: '0.82rem', fontWeight: 600,
                    color: '#fff', outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = `${EMERALD}40`}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </Cin>

            <Cin delay={0.1}>
              <div style={{
                display: 'flex', gap: 6, overflowX: 'auto',
                paddingBottom: 8, marginBottom: 16,
                scrollbarWidth: 'none', msOverflowStyle: 'none',
              }} className="cat-scroll">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    style={{
                      padding: '7px 14px', borderRadius: 10, whiteSpace: 'nowrap',
                      fontFamily: INTER, fontSize: '0.68rem', fontWeight: 600,
                      letterSpacing: '-0.01em', border: 'none', cursor: 'pointer', flexShrink: 0,
                      transition: 'all 0.25s ease',
                      background: activeCategory === category ? `${EMERALD}18` : 'rgba(255,255,255,0.04)',
                      color: activeCategory === category ? EMERALD : 'rgba(255,255,255,0.35)',
                      ...(activeCategory === category ? { boxShadow: `0 0 12px ${EMERALD}15` } : {}),
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </Cin>

            <Cin delay={0.15}>
              <span style={{
                fontFamily: SYNE, fontSize: '0.6875rem', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: 10, paddingLeft: 2,
              }}>
                {activeCategory}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredFeatures.map((feature) => {
                  const IconComponent = feature.icon;
                  const isSelected = selectedFeatures.find(f => f.id === feature.id);
                  const isIncluded = feature.included;
                  const isInTemplate = selectedTemplate?.features.includes(feature.id);
                  const isIncludedInAny = isIncluded || isInTemplate;

                  return (
                    <div
                      key={feature.id}
                      className={!isIncludedInAny ? 'cursor-pointer active:scale-[0.98]' : ''}
                      onClick={() => !isIncludedInAny && toggleFeature(feature)}
                      data-testid={`feature-${feature.id}`}
                      style={{
                        padding: '14px 16px', borderRadius: 16,
                        background: 'linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        border: `1px solid ${isSelected || isIncludedInAny ? `${EMERALD}20` : 'rgba(255,255,255,0.06)'}`,
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        border: `1.5px solid ${isSelected || isIncludedInAny ? EMERALD : 'rgba(255,255,255,0.15)'}`,
                        background: isSelected || isIncludedInAny ? `${EMERALD}20` : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}>
                        {(isSelected || isIncludedInAny) && <Check size={11} color={EMERALD} strokeWidth={2.5} />}
                      </div>
                      <IconComponent className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: INTER, fontSize: '0.78rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
                          {feature.name}
                        </span>
                        {isIncludedInAny && (
                          <p style={{ fontFamily: INTER, fontSize: '0.62rem', color: EMERALD, marginTop: 1 }}>
                            {t('constructor.includedInTemplate')}
                          </p>
                        )}
                      </div>
                      <span style={{
                        fontFamily: SYNE, fontSize: '0.72rem', fontWeight: 700,
                        color: isIncludedInAny ? EMERALD : 'rgba(255,255,255,0.5)',
                        letterSpacing: '-0.02em', flexShrink: 0,
                      }}>
                        {isIncludedInAny ? t('constructor.included') : `+${feature.price.toLocaleString()} ₽`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Cin>

            <Cin delay={0.2} className="mt-6">
              <span style={{
                fontFamily: SYNE, fontSize: '0.6875rem', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: 10,
              }}>
                {t('constructor.subscriptionPlan')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subscriptionPlans.map((plan) => {
                  const isSelected = selectedSubscription.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className="cursor-pointer active:scale-[0.98]"
                      onClick={() => setSelectedSubscription(plan)}
                      data-testid={`subscription-${plan.id}`}
                      style={{
                        padding: '14px 16px', borderRadius: 16,
                        background: isSelected
                          ? 'linear-gradient(165deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                          : 'linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                        border: `1px solid ${isSelected ? `${EMERALD}20` : 'rgba(255,255,255,0.05)'}`,
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: `1.5px solid ${isSelected ? EMERALD : 'rgba(255,255,255,0.15)'}`,
                        background: isSelected ? EMERALD : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}>
                        {isSelected && <Check size={10} color="#000" strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: SYNE, fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                            {plan.name}
                          </span>
                          {plan.popular && (
                            <span style={{
                              padding: '2px 7px', borderRadius: 6,
                              background: `${EMERALD}15`, fontFamily: INTER,
                              fontSize: '0.55rem', fontWeight: 700, color: EMERALD,
                            }}>
                              {t('constructor.popularTag')}
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                          {plan.description}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontFamily: SYNE, fontSize: '0.85rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
                          {plan.price.toLocaleString()}
                        </span>
                        <span style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginLeft: 3 }}>
                          {t('constructor.perMonth')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{
                padding: '12px 14px', borderRadius: 14,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
                marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8,
              }}>
                {selectedSubscription.features.map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Check className="w-3 h-3" style={{ color: EMERALD }} />
                    <span style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </Cin>

            <Cin delay={0.25} className="mt-8">
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => goToStep(1)}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent', fontFamily: INTER, fontSize: '0.78rem',
                    fontWeight: 600, color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {t('constructor.back')}
                </button>
                <button
                  onClick={() => goToStep(3)}
                  disabled={!projectName.trim()}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 14, border: 'none',
                    background: !projectName.trim() ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${EMERALD}, #10b981)`,
                    fontFamily: INTER, fontSize: '0.78rem', fontWeight: 700,
                    color: !projectName.trim() ? 'rgba(255,255,255,0.2)' : '#000',
                    cursor: !projectName.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: projectName.trim() ? `0 4px 16px ${EMERALD}30` : 'none',
                  }}
                >
                  {t('constructor.next')}
                </button>
              </div>
            </Cin>
          </section>
        )}

        {currentStep === 3 && selectedTemplate && (
          <section>
            <Cin>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{
                  fontFamily: SYNE, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                  fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', marginBottom: 6,
                }}>
                  {t('constructor.step3Title')}
                </h2>
                <p style={{ fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '-0.01em' }}>
                  {t('constructor.step3Desc')}
                </p>
              </div>
            </Cin>

            <Cin delay={0.1}>
              <div style={{
                padding: '24px', borderRadius: 22,
                background: 'linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -6px rgba(0,0,0,0.25)',
              }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <h3 style={{
                    fontFamily: SYNE, fontSize: '1.1rem', fontWeight: 800,
                    color: '#fff', letterSpacing: '-0.03em', marginBottom: 4,
                  }}>
                    {projectName}
                  </h3>
                  <p style={{ fontFamily: INTER, fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
                    {t('constructor.basedOnTemplate')} "{selectedTemplate.name}"
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      {t('constructor.baseCost')}
                    </span>
                    <span style={{ fontFamily: SYNE, fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                      {selectedTemplate.estimatedPrice.toLocaleString()} ₽
                    </span>
                  </div>

                  {additionalFeaturesPrice > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        {t('constructor.additionalFeatures')}
                      </span>
                      <span style={{ fontFamily: SYNE, fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                        +{additionalFeaturesPrice.toLocaleString()} ₽
                      </span>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: SYNE, fontSize: '0.85rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
                        {t('constructor.totalDevelopment')}
                      </span>
                      <span style={{
                        fontFamily: SYNE, fontSize: '1.2rem', fontWeight: 800,
                        background: `linear-gradient(135deg, ${EMERALD}, #a7f3d0)`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.03em',
                      }}>
                        {totalPrice.toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14, marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: INTER, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                      {t('constructor.subscription')} ({selectedSubscription.name})
                    </span>
                    <span style={{ fontFamily: SYNE, fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                      {selectedSubscription.price.toLocaleString()} {t('constructor.perMonth')}
                    </span>
                  </div>
                </div>

                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 12,
                  background: `${EMERALD}08`, border: `1px solid ${EMERALD}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: EMERALD }} />
                  <span style={{ fontFamily: INTER, fontSize: '0.72rem', fontWeight: 600, color: EMERALD }}>
                    {t('constructor.readinessTime')}: {selectedTemplate.developmentTime}
                  </span>
                </div>
              </div>
            </Cin>

            <Cin delay={0.2} className="mt-6">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleOrderClick}
                  data-testid="button-order"
                  style={{
                    width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                    background: `linear-gradient(135deg, ${EMERALD}, #10b981)`,
                    fontFamily: SYNE, fontSize: '0.85rem', fontWeight: 800,
                    color: '#000', cursor: 'pointer', letterSpacing: '-0.02em',
                    boxShadow: `0 4px 20px ${EMERALD}30`,
                    transition: 'all 0.25s ease',
                  }}
                >
                  {t('constructor.orderFor')} {totalPrice.toLocaleString()} ₽
                </button>
                <button
                  onClick={() => goToStep(2)}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent', fontFamily: INTER, fontSize: '0.78rem',
                    fontWeight: 600, color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                  }}
                >
                  {t('constructor.changeFeatures')}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <p style={{ fontFamily: INTER, fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                  {t('constructor.prepayment35')}
                </p>
                <p style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                  + {selectedSubscription.name} {t('constructor.subscriptionAfterLaunch')} {selectedSubscription.price.toLocaleString()} {t('constructor.perMonth')}
                </p>
              </div>
            </Cin>
          </section>
        )}
      </div>

      {selectedTemplate && currentStep > 1 && (
        <div style={{ position: 'fixed', bottom: 76, left: 0, right: 0, padding: '0 16px', zIndex: 40 }} data-testid="summary-bar">
          <div className="mx-auto" style={{ maxWidth: 540 }}>
            <div style={{
              padding: '12px 18px', borderRadius: 18,
              background: 'rgba(5,5,5,0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                  {t('constructor.development')}
                </p>
                <p style={{
                  fontFamily: SYNE, fontSize: '0.9rem', fontWeight: 800,
                  background: `linear-gradient(135deg, ${EMERALD}, #a7f3d0)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.03em',
                }}>
                  {totalPrice.toLocaleString()} ₽
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                  {t('constructor.subscription')}
                </p>
                <p style={{ fontFamily: SYNE, fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                  {selectedSubscription.price.toLocaleString()} /м
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                  {t('constructor.featuresCount')}
                </p>
                <p style={{ fontFamily: SYNE, fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                  {selectedFeatures.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cat-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default memo(ConstructorPage);
