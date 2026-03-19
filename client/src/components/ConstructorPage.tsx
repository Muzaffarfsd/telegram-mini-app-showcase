import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { m, AnimatePresence, useInView } from "@/utils/LazyMotionProvider";
import { trackProjectCreation, trackFeatureAdded } from "@/hooks/useGamification";
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShoppingCart, User, ArrowRight, Check,
  Package, Coffee, Dumbbell, Settings, CreditCard,
  Truck, Bell, Crown, BarChart, Calendar, Users, Zap, Star, MessageSquare,
  Globe, Smartphone, Clock, Sparkles, Rocket, Shield,
  Layers, Monitor, Building2, ChevronDown
} from "lucide-react";
import { PricingModule } from "@/components/ui/pricing-module";

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

const HeroSection = memo(({ t }: { t: (key: string) => string }) => {
  const [wordIdx, setWordIdx] = useState(0);
  const words = useMemo(() => [
    { text: t('constructor.paymentRotating.noRisks'), color: EMERALD },
    { text: t('constructor.paymentRotating.withGuarantee'), color: "#a78bfa" },
    { text: t('constructor.paymentRotating.stepByStep'), color: "#fbbf24" },
    { text: t('constructor.paymentRotating.transparently'), color: "#60a5fa" }
  ], [t]);

  useEffect(() => {
    const iv = setInterval(() => setWordIdx(p => (p + 1) % words.length), 2400);
    return () => clearInterval(iv);
  }, [words]);

  return (
    <section style={{ position: 'relative', paddingBottom: 56 }}>
      <div style={{
        position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${EMERALD}08 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <Cin>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px 5px 8px', borderRadius: 100,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 28,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: EMERALD,
              boxShadow: `0 0 8px ${EMERALD}60`,
            }} />
            <span style={{
              fontFamily: INTER, fontSize: '0.65rem', fontWeight: 500,
              color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em',
            }}>
              {t('constructor.paymentSection')}
            </span>
          </div>
        </div>
      </Cin>

      <Cin delay={0.08}>
        <h1 style={{
          fontFamily: SYNE, fontSize: 'clamp(2rem, 8vw, 2.6rem)',
          fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05,
          color: '#fff', textAlign: 'center', margin: 0,
        }}>
          {t('constructor.payHeadline')}
        </h1>
      </Cin>

      <Cin delay={0.14}>
        <div style={{ height: 48, overflow: 'hidden', marginTop: 4, textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            <m.div
              key={wordIdx}
              initial={{ y: 48, opacity: 0, filter: 'blur(6px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -48, opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span style={{
                fontFamily: INSTRUMENT, fontStyle: 'italic',
                fontSize: 'clamp(2rem, 8vw, 2.6rem)',
                fontWeight: 400, color: words[wordIdx].color,
                letterSpacing: '-0.02em',
              }}>
                {words[wordIdx].text}
              </span>
            </m.div>
          </AnimatePresence>
        </div>
      </Cin>

      <Cin delay={0.22}>
        <p style={{
          fontFamily: INTER, fontSize: '0.82rem', lineHeight: 1.65,
          color: 'rgba(255,255,255,0.38)', textAlign: 'center',
          maxWidth: 360, margin: '20px auto 0',
          letterSpacing: '-0.01em',
        }}>
          {t('constructor.noHiddenFees')}
        </p>
      </Cin>

      <Cin delay={0.3}>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <m.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
          </m.div>
        </div>
      </Cin>
    </section>
  );
});
HeroSection.displayName = 'HeroSection';

const PaymentTimeline = memo(({ t }: { t: (key: string) => string }) => {
  const steps = useMemo(() => [
    {
      num: '01', pct: '35%', title: t('constructor.prepayment'),
      desc: t('constructor.prepaymentDesc'),
      items: [t('constructor.prepaymentItems.interfaceDesign'), t('constructor.prepaymentItems.appStructure'), t('constructor.prepaymentItems.firstDemo')],
      accent: EMERALD, accentBg: `${EMERALD}08`,
    },
    {
      num: '02', pct: '65%', title: t('constructor.afterDelivery'),
      desc: t('constructor.afterDeliveryDesc'),
      items: [t('constructor.afterDeliveryItems.readyApp'), t('constructor.afterDeliveryItems.revisionsIncluded'), t('constructor.afterDeliveryItems.telegramPublish')],
      accent: '#60a5fa', accentBg: 'rgba(96,165,250,0.06)',
    },
  ], [t]);

  return (
    <section style={{ padding: '0 2px' }}>
      <Cin>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28,
        }}>
          <div style={{
            width: 40, height: 1, background: `linear-gradient(90deg, transparent, ${EMERALD}40)`,
          }} />
          <span style={{
            fontFamily: SYNE, fontSize: '0.62rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.22)',
          }}>
            {t('constructor.paymentSection')}
          </span>
        </div>
      </Cin>

      <div style={{ position: 'relative', paddingLeft: 28 }}>
        <div style={{
          position: 'absolute', left: 10, top: 8, bottom: 8,
          width: 1,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        }} />

        {steps.map((s, i) => (
          <Cin key={i} delay={0.05 + i * 0.12}>
            <div style={{ position: 'relative', marginBottom: i < steps.length - 1 ? 20 : 0 }}>
              <div style={{
                position: 'absolute', left: -22, top: 22,
                width: 10, height: 10, borderRadius: '50%',
                background: s.accent,
                boxShadow: `0 0 12px ${s.accent}40`,
              }} />

              <div style={{
                padding: '22px 20px',
                borderRadius: 22,
                background: 'linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <span style={{
                      fontFamily: SYNE, fontSize: '0.58rem', fontWeight: 700,
                      color: s.accent, letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                      display: 'block', marginBottom: 6,
                    }}>
                      {t('constructor.step')} {s.num}
                    </span>
                    <span style={{
                      fontFamily: SYNE, fontSize: '0.92rem', fontWeight: 800,
                      color: '#fff', letterSpacing: '-0.03em',
                    }}>
                      {s.title}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: SYNE, fontSize: '1.5rem', fontWeight: 800,
                    color: s.accent, letterSpacing: '-0.04em', lineHeight: 1,
                    opacity: 0.9,
                  }}>
                    {s.pct}
                  </div>
                </div>

                <p style={{
                  fontFamily: INTER, fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.55, marginBottom: 16, letterSpacing: '-0.01em',
                }}>
                  {s.desc}
                </p>

                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 10,
                  padding: '14px 16px', borderRadius: 14,
                  background: s.accentBg,
                }}>
                  {s.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 6,
                        border: `1px solid ${s.accent}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Check size={10} color={s.accent} strokeWidth={3} />
                      </div>
                      <span style={{
                        fontFamily: INTER, fontSize: '0.72rem', fontWeight: 500,
                        color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em',
                      }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Cin>
        ))}
      </div>
    </section>
  );
});
PaymentTimeline.displayName = 'PaymentTimeline';

const AfterLaunchSection = memo(({ t }: { t: (key: string) => string }) => (
  <section style={{ padding: '0 2px' }}>
    <Cin>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28,
      }}>
        <div style={{
          width: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(90,200,250,0.3))',
        }} />
        <span style={{
          fontFamily: SYNE, fontSize: '0.62rem', fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.22)',
        }}>
          {t('constructor.afterLaunch')}
        </span>
      </div>
    </Cin>

    <Cin delay={0.06}>
      <div style={{
        padding: '24px 20px', borderRadius: 22,
        background: 'linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(90,200,250,0.08)',
            border: '1px solid rgba(90,200,250,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={16} style={{ color: '#5AC8FA' }} />
          </div>
          <div>
            <span style={{
              fontFamily: SYNE, fontSize: '0.88rem', fontWeight: 800,
              color: '#fff', letterSpacing: '-0.03em',
            }}>
              {t('constructor.monthlySubscription')}
            </span>
            <p style={{
              fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
              marginTop: 1,
            }}>
              {t('constructor.monthlySubscriptionDesc')}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
          {[
            { text: t('constructor.hosting'), sub: t('constructor.hostingDesc'), icon: Globe },
            { text: t('constructor.support'), sub: t('constructor.supportDesc'), icon: MessageSquare },
            { text: t('constructor.updates'), sub: t('constructor.updatesDesc'), icon: Zap },
            { text: t('constructor.backups'), sub: t('constructor.backupsDesc'), icon: Shield }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} style={{
                padding: '14px 12px', borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
                textAlign: 'center',
              }}>
                <Icon size={14} style={{ color: 'rgba(255,255,255,0.25)', marginBottom: 6 }} />
                <p style={{
                  fontFamily: INTER, fontSize: '0.7rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)', marginBottom: 3,
                }}>
                  {feature.text}
                </p>
                <p style={{
                  fontFamily: INTER, fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.25)', lineHeight: 1.35,
                }}>
                  {feature.sub}
                </p>
              </div>
            );
          })}
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
));
AfterLaunchSection.displayName = 'AfterLaunchSection';

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

const TemplateCard = memo(({ template, onSelect, t, index }: any) => {
  const IconComponent = template.icon;
  const gradients = [
    `linear-gradient(135deg, ${EMERALD}06 0%, transparent 60%)`,
    'linear-gradient(135deg, rgba(96,165,250,0.04) 0%, transparent 60%)',
    'linear-gradient(135deg, rgba(167,139,250,0.04) 0%, transparent 60%)',
    'linear-gradient(135deg, rgba(251,191,36,0.04) 0%, transparent 60%)',
  ];

  return (
    <Cin delay={0.06 * index}>
      <div
        onClick={onSelect}
        className="cursor-pointer active:scale-[0.97]"
        style={{
          padding: '20px',
          borderRadius: 20,
          background: gradients[index % 4],
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 10,
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        data-testid={`template-${template.id}`}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IconComponent size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontFamily: SYNE, fontSize: '0.88rem', fontWeight: 700,
                color: '#fff', letterSpacing: '-0.025em',
              }}>
                {template.name}
              </span>
              {template.popular && (
                <span style={{
                  padding: '3px 8px', borderRadius: 8,
                  background: `${EMERALD}12`, border: `1px solid ${EMERALD}18`,
                  fontFamily: INTER, fontSize: '0.55rem', fontWeight: 700,
                  color: EMERALD, letterSpacing: '0.03em',
                  textTransform: 'uppercase' as const,
                }}>
                  {t('constructor.popularTag')}
                </span>
              )}
            </div>
            <p style={{
              fontFamily: INTER, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.45, marginBottom: 10, letterSpacing: '-0.01em',
            }}>
              {template.description}
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
                <span style={{
                  fontFamily: INTER, fontSize: '0.65rem', fontWeight: 500,
                  color: 'rgba(255,255,255,0.3)',
                }}>
                  {template.developmentTime}
                </span>
              </div>
              <div style={{
                width: 3, height: 3, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
              }} />
              <span style={{
                fontFamily: SYNE, fontSize: '0.72rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.02em',
              }}>
                {t('constructor.from')} {template.estimatedPrice.toLocaleString()} ₽
              </span>
            </div>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            marginTop: 2,
          }}>
            <ArrowRight size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
          </div>
        </div>
      </div>
    </Cin>
  );
});
TemplateCard.displayName = 'TemplateCard';

const StepProgress = memo(({ currentStep, stepData, t }: {
  currentStep: number;
  stepData: { num: number; title: string; desc: string }[];
  t: (key: string) => string;
}) => (
  <Cin>
    <div style={{
      padding: '20px',
      borderRadius: 20,
      background: 'linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.05)',
      marginBottom: 32,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {stepData.map((s, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: currentStep >= s.num
                  ? currentStep === s.num ? `${EMERALD}15` : `${EMERALD}10`
                  : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${currentStep >= s.num
                  ? currentStep === s.num ? `${EMERALD}50` : `${EMERALD}25`
                  : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                boxShadow: currentStep === s.num ? `0 0 20px ${EMERALD}15` : 'none',
              }}>
                {currentStep > s.num ? (
                  <Check size={14} color={EMERALD} strokeWidth={2.5} />
                ) : (
                  <span style={{
                    fontFamily: SYNE, fontSize: '0.72rem', fontWeight: 800,
                    color: currentStep >= s.num ? EMERALD : 'rgba(255,255,255,0.2)',
                  }}>{s.num}</span>
                )}
              </div>
              <p style={{
                fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600,
                color: currentStep >= s.num ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
                marginTop: 8, textAlign: 'center', letterSpacing: '-0.01em',
                transition: 'color 0.4s ease', lineHeight: 1.3,
                maxWidth: 80,
              }}>
                {s.title}
              </p>
            </div>
            {i < stepData.length - 1 && (
              <div style={{
                height: 1.5, flex: '0 0 24px',
                borderRadius: 1,
                background: currentStep > s.num
                  ? `linear-gradient(90deg, ${EMERALD}60, ${EMERALD}30)`
                  : 'rgba(255,255,255,0.05)',
                transition: 'background 0.4s ease',
                marginBottom: 28,
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  </Cin>
));
StepProgress.displayName = 'StepProgress';

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
    <div className="min-h-screen select-none overflow-x-hidden" style={{ backgroundColor: '#050505', paddingTop: 120, paddingBottom: 160 }}>
      <div className="mx-auto w-full px-5" style={{ maxWidth: 540 }}>

        <HeroSection t={t} />

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin: '8px 0 48px' }} />

        <PaymentTimeline t={t} />

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin: '48px 0' }} />

        <AfterLaunchSection t={t} />

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin: '48px 0 40px' }} />

        <Cin>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{
              fontFamily: SYNE, fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase' as const,
              color: EMERALD, display: 'block', marginBottom: 12,
              opacity: 0.7,
            }}>
              {t('constructor.constructor')}
            </span>
            <h2 style={{
              fontFamily: SYNE, fontSize: 'clamp(1.6rem, 6vw, 2.1rem)',
              fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1,
              color: '#fff', marginBottom: 8,
            }}>
              {t('constructor.buildYourApp')}
            </h2>
            <p style={{
              fontFamily: INTER, fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)',
              lineHeight: 1.55, letterSpacing: '-0.01em',
            }}>
              {t('constructor.constructorDesc')}
            </p>
          </div>
        </Cin>

        <StepProgress currentStep={currentStep} stepData={stepData} t={t} />

        {currentStep === 1 && (
          <section>
            <Cin>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 40, height: 1,
                    background: `linear-gradient(90deg, transparent, ${EMERALD}30)`,
                  }} />
                  <span style={{
                    fontFamily: SYNE, fontSize: '0.62rem', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase' as const,
                    color: 'rgba(255,255,255,0.22)',
                  }}>
                    {t('constructor.step1Title')}
                  </span>
                </div>
                <p style={{
                  fontFamily: INTER, fontSize: '0.74rem', color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '-0.01em', paddingLeft: 50,
                }}>
                  {t('constructor.step1Desc')}
                </p>
              </div>
            </Cin>

            {appTemplates.map((template, idx) => (
              <TemplateCard key={template.id} template={template} onSelect={templateHandlers[idx].handler} t={t} index={idx} />
            ))}

            <Cin delay={0.28}>
              <div style={{
                padding: '16px 18px', borderRadius: 16,
                background: `${EMERALD}04`,
                border: `1px dashed ${EMERALD}15`,
                display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 14,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${EMERALD}08`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Sparkles size={12} style={{ color: EMERALD }} />
                </div>
                <div>
                  <span style={{
                    fontFamily: SYNE, fontSize: '0.72rem', fontWeight: 700,
                    color: EMERALD, letterSpacing: '-0.01em',
                  }}>
                    {t('constructor.tip')}
                  </span>
                  <p style={{
                    fontFamily: INTER, fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)',
                    marginTop: 3, lineHeight: 1.45,
                  }}>
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
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 40, height: 1,
                    background: `linear-gradient(90deg, transparent, ${EMERALD}30)`,
                  }} />
                  <span style={{
                    fontFamily: SYNE, fontSize: '0.62rem', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase' as const,
                    color: 'rgba(255,255,255,0.22)',
                  }}>
                    {t('constructor.step2Title')}
                  </span>
                </div>
                <p style={{
                  fontFamily: INTER, fontSize: '0.74rem', color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '-0.01em', paddingLeft: 50,
                }}>
                  {t('constructor.step2Desc')}
                </p>
              </div>
            </Cin>

            <Cin delay={0.05}>
              <div style={{
                padding: '18px 20px', borderRadius: 18,
                background: 'linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
              }}>
                <label style={{
                  fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const, display: 'block', marginBottom: 10,
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
                    width: '100%', padding: '12px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)',
                    fontFamily: INTER, fontSize: '0.85rem', fontWeight: 600,
                    color: '#fff', outline: 'none',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = `${EMERALD}40`;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${EMERALD}08`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </Cin>

            <Cin delay={0.1}>
              <div style={{
                display: 'flex', gap: 6, overflowX: 'auto',
                paddingBottom: 10, marginBottom: 18,
                scrollbarWidth: 'none', msOverflowStyle: 'none',
              }} className="cat-scroll">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    style={{
                      padding: '8px 16px', borderRadius: 12, whiteSpace: 'nowrap',
                      fontFamily: INTER, fontSize: '0.68rem', fontWeight: 600,
                      letterSpacing: '-0.01em', border: 'none', cursor: 'pointer', flexShrink: 0,
                      transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                      background: activeCategory === category ? `${EMERALD}14` : 'rgba(255,255,255,0.03)',
                      color: activeCategory === category ? EMERALD : 'rgba(255,255,255,0.3)',
                      borderBottom: activeCategory === category ? `2px solid ${EMERALD}60` : '2px solid transparent',
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </Cin>

            <Cin delay={0.15}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                        background: isSelected || isIncludedInAny
                          ? `linear-gradient(135deg, ${EMERALD}06 0%, transparent 100%)`
                          : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected || isIncludedInAny ? `${EMERALD}18` : 'rgba(255,255,255,0.05)'}`,
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        border: `1.5px solid ${isSelected || isIncludedInAny ? EMERALD : 'rgba(255,255,255,0.12)'}`,
                        background: isSelected || isIncludedInAny ? `${EMERALD}20` : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.25s ease',
                      }}>
                        {(isSelected || isIncludedInAny) && <Check size={11} color={EMERALD} strokeWidth={2.5} />}
                      </div>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <IconComponent size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontFamily: INTER, fontSize: '0.78rem', fontWeight: 600,
                          color: '#fff', letterSpacing: '-0.01em',
                        }}>
                          {feature.name}
                        </span>
                        {isIncludedInAny && (
                          <p style={{
                            fontFamily: INTER, fontSize: '0.6rem', color: EMERALD,
                            marginTop: 2, opacity: 0.8,
                          }}>
                            {t('constructor.includedInTemplate')}
                          </p>
                        )}
                      </div>
                      <span style={{
                        fontFamily: SYNE, fontSize: '0.72rem', fontWeight: 700,
                        color: isIncludedInAny ? EMERALD : 'rgba(255,255,255,0.45)',
                        letterSpacing: '-0.02em', flexShrink: 0,
                      }}>
                        {isIncludedInAny ? t('constructor.included') : `+${feature.price.toLocaleString()} ₽`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Cin>

            <Cin delay={0.2} className="mt-8">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              }}>
                <div style={{
                  width: 40, height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08))',
                }} />
                <span style={{
                  fontFamily: SYNE, fontSize: '0.62rem', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase' as const,
                  color: 'rgba(255,255,255,0.22)',
                }}>
                  {t('constructor.subscriptionPlan')}
                </span>
              </div>

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
                        padding: '16px 18px', borderRadius: 18,
                        background: isSelected
                          ? `linear-gradient(135deg, ${plan.color}08 0%, transparent 100%)`
                          : 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${isSelected ? `${plan.color}30` : 'rgba(255,255,255,0.05)'}`,
                        display: 'flex', alignItems: 'center', gap: 14,
                        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: `2px solid ${isSelected ? plan.color : 'rgba(255,255,255,0.12)'}`,
                        background: isSelected ? plan.color : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.25s ease',
                        boxShadow: isSelected ? `0 0 12px ${plan.color}30` : 'none',
                      }}>
                        {isSelected && <Check size={11} color="#000" strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontFamily: SYNE, fontSize: '0.82rem', fontWeight: 700,
                            color: '#fff', letterSpacing: '-0.025em',
                          }}>
                            {plan.name}
                          </span>
                          {plan.popular && (
                            <span style={{
                              padding: '2px 8px', borderRadius: 6,
                              background: `${plan.color}12`,
                              fontFamily: INTER, fontSize: '0.55rem', fontWeight: 700,
                              color: plan.color, letterSpacing: '0.02em',
                              textTransform: 'uppercase' as const,
                            }}>
                              {t('constructor.popularTag')}
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)',
                          marginTop: 2,
                        }}>
                          {plan.description}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{
                          fontFamily: SYNE, fontSize: '0.92rem', fontWeight: 800,
                          color: isSelected ? plan.color : '#fff',
                          letterSpacing: '-0.03em',
                          transition: 'color 0.3s ease',
                        }}>
                          {plan.price.toLocaleString()}
                        </span>
                        <span style={{
                          fontFamily: INTER, fontSize: '0.58rem',
                          color: 'rgba(255,255,255,0.25)', marginLeft: 3,
                        }}>
                          {t('constructor.perMonth')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{
                padding: '14px 16px', borderRadius: 14,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 10,
              }}>
                {selectedSubscription.features.map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={10} style={{ color: EMERALD, opacity: 0.7 }} />
                    <span style={{
                      fontFamily: INTER, fontSize: '0.65rem',
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </Cin>

            <Cin delay={0.25} className="mt-10">
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => goToStep(1)}
                  style={{
                    flex: '0 0 auto', padding: '14px 24px', borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent', fontFamily: INTER, fontSize: '0.78rem',
                    fontWeight: 600, color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t('constructor.back')}
                </button>
                <button
                  onClick={() => goToStep(3)}
                  disabled={!projectName.trim()}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 14, border: 'none',
                    background: !projectName.trim()
                      ? 'rgba(255,255,255,0.04)'
                      : `linear-gradient(135deg, ${EMERALD}, #10b981)`,
                    fontFamily: SYNE, fontSize: '0.82rem', fontWeight: 800,
                    color: !projectName.trim() ? 'rgba(255,255,255,0.15)' : '#000',
                    cursor: !projectName.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: projectName.trim() ? `0 4px 20px ${EMERALD}25` : 'none',
                    letterSpacing: '-0.02em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {t('constructor.next')}
                  <ArrowRight size={14} />
                </button>
              </div>
            </Cin>
          </section>
        )}

        {currentStep === 3 && selectedTemplate && (
          <section>
            <Cin>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 40, height: 1,
                    background: `linear-gradient(90deg, transparent, ${EMERALD}30)`,
                  }} />
                  <span style={{
                    fontFamily: SYNE, fontSize: '0.62rem', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase' as const,
                    color: 'rgba(255,255,255,0.22)',
                  }}>
                    {t('constructor.step3Title')}
                  </span>
                </div>
                <p style={{
                  fontFamily: INTER, fontSize: '0.74rem', color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '-0.01em', paddingLeft: 50,
                }}>
                  {t('constructor.step3Desc')}
                </p>
              </div>
            </Cin>

            <Cin delay={0.1}>
              <div style={{
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  padding: '28px 22px 24px',
                  background: 'linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
                }}>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${EMERALD}08`, border: `1px solid ${EMERALD}15`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 14,
                    }}>
                      <Rocket size={20} style={{ color: EMERALD }} />
                    </div>
                    <h3 style={{
                      fontFamily: SYNE, fontSize: '1.15rem', fontWeight: 800,
                      color: '#fff', letterSpacing: '-0.03em', marginBottom: 4,
                    }}>
                      {projectName}
                    </h3>
                    <p style={{
                      fontFamily: INTER, fontSize: '0.68rem',
                      color: 'rgba(255,255,255,0.28)',
                    }}>
                      {t('constructor.basedOnTemplate')} "{selectedTemplate.name}"
                    </p>
                  </div>

                  <div style={{
                    height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                    marginBottom: 18,
                  }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
                      }}>
                        {t('constructor.baseCost')}
                      </span>
                      <span style={{
                        fontFamily: SYNE, fontSize: '0.85rem', fontWeight: 700,
                        color: '#fff', letterSpacing: '-0.02em',
                      }}>
                        {selectedTemplate.estimatedPrice.toLocaleString()} ₽
                      </span>
                    </div>

                    {additionalFeaturesPrice > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
                        }}>
                          {t('constructor.additionalFeatures')}
                        </span>
                        <span style={{
                          fontFamily: SYNE, fontSize: '0.85rem', fontWeight: 700,
                          color: '#fff', letterSpacing: '-0.02em',
                        }}>
                          +{additionalFeaturesPrice.toLocaleString()} ₽
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  padding: '20px 22px',
                  background: `linear-gradient(165deg, ${EMERALD}06 0%, transparent 100%)`,
                  borderTop: `1px solid ${EMERALD}10`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: SYNE, fontSize: '0.82rem', fontWeight: 800,
                      color: '#fff', letterSpacing: '-0.03em',
                    }}>
                      {t('constructor.totalDevelopment')}
                    </span>
                    <span style={{
                      fontFamily: SYNE, fontSize: '1.4rem', fontWeight: 800,
                      background: `linear-gradient(135deg, ${EMERALD}, #a7f3d0)`,
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.04em',
                    }}>
                      {totalPrice.toLocaleString()} ₽
                    </span>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: 10, paddingTop: 10,
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <span style={{
                      fontFamily: INTER, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)',
                    }}>
                      {t('constructor.subscription')} ({selectedSubscription.name})
                    </span>
                    <span style={{
                      fontFamily: SYNE, fontSize: '0.82rem', fontWeight: 700,
                      color: '#fff', letterSpacing: '-0.02em',
                    }}>
                      {selectedSubscription.price.toLocaleString()} {t('constructor.perMonth')}
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: '14px 22px',
                  background: `${EMERALD}04`,
                  borderTop: '1px solid rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <Clock size={13} style={{ color: EMERALD, opacity: 0.7 }} />
                  <span style={{
                    fontFamily: INTER, fontSize: '0.72rem', fontWeight: 600,
                    color: EMERALD, opacity: 0.8,
                  }}>
                    {t('constructor.readinessTime')}: {selectedTemplate.developmentTime}
                  </span>
                </div>
              </div>
            </Cin>

            <Cin delay={0.2} className="mt-8">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleOrderClick}
                  data-testid="button-order"
                  style={{
                    width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                    background: `linear-gradient(135deg, ${EMERALD}, #10b981)`,
                    fontFamily: SYNE, fontSize: '0.88rem', fontWeight: 800,
                    color: '#000', cursor: 'pointer', letterSpacing: '-0.02em',
                    boxShadow: `0 4px 24px ${EMERALD}30, 0 0 0 1px ${EMERALD}20 inset`,
                    transition: 'all 0.3s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {t('constructor.orderFor')} {totalPrice.toLocaleString()} ₽
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => goToStep(2)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'transparent', fontFamily: INTER, fontSize: '0.78rem',
                    fontWeight: 600, color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t('constructor.changeFeatures')}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p style={{
                  fontFamily: INTER, fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)',
                  lineHeight: 1.55,
                }}>
                  {t('constructor.prepayment35')}
                </p>
                <p style={{
                  fontFamily: INTER, fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)',
                  marginTop: 6,
                }}>
                  + {selectedSubscription.name} {t('constructor.subscriptionAfterLaunch')} {selectedSubscription.price.toLocaleString()} {t('constructor.perMonth')}
                </p>
              </div>
            </Cin>
          </section>
        )}
      </div>

      {selectedTemplate && currentStep > 1 && (
        <div style={{
          position: 'fixed', bottom: 76, left: 0, right: 0,
          padding: '0 16px', zIndex: 40,
        }} data-testid="summary-bar">
          <div className="mx-auto" style={{ maxWidth: 540 }}>
            <m.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{
                padding: '14px 20px', borderRadius: 20,
                background: 'rgba(5,5,5,0.88)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 -4px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.04) inset',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{
                  fontFamily: INTER, fontSize: '0.55rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const, marginBottom: 3,
                }}>
                  {t('constructor.development')}
                </p>
                <p style={{
                  fontFamily: SYNE, fontSize: '0.95rem', fontWeight: 800,
                  background: `linear-gradient(135deg, ${EMERALD}, #a7f3d0)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.03em',
                }}>
                  {totalPrice.toLocaleString()} ₽
                </p>
              </div>
              <div style={{
                width: 1, height: 28, background: 'rgba(255,255,255,0.06)',
              }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: INTER, fontSize: '0.55rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const, marginBottom: 3,
                }}>
                  {t('constructor.subscription')}
                </p>
                <p style={{
                  fontFamily: SYNE, fontSize: '0.88rem', fontWeight: 700,
                  color: '#fff', letterSpacing: '-0.02em',
                }}>
                  {selectedSubscription.price.toLocaleString()} /{t('constructor.monthShort')}
                </p>
              </div>
              <div style={{
                width: 1, height: 28, background: 'rgba(255,255,255,0.06)',
              }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontFamily: INTER, fontSize: '0.55rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const, marginBottom: 3,
                }}>
                  {t('constructor.featuresCount')}
                </p>
                <p style={{
                  fontFamily: SYNE, fontSize: '0.88rem', fontWeight: 700,
                  color: '#fff',
                }}>
                  {selectedFeatures.length}
                </p>
              </div>
            </m.div>
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
