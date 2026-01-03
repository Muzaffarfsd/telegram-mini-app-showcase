import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { trackProjectCreation, trackFeatureAdded } from "@/hooks/useGamification";
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Wrench,
  Eye,
  ShoppingCart,
  Home,
  Calculator,
  User,
  ArrowRight,
  Check,
  Package,
  Coffee,
  Dumbbell,
  GraduationCap,
  Heart,
  Settings,
  CreditCard,
  Truck,
  Bell,
  Crown,
  BarChart,
  Calendar,
  Users,
  Zap,
  Star,
  MessageSquare,
  Globe,
  Smartphone,
  Clock,
  Info,
  ChevronRight,
  Plus,
  Sparkles,
  Rocket,
  UserCircle2,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Gift,
  Shield
} from "lucide-react";

interface ConstructorPageProps {
  onNavigate: (section: string, data?: any) => void;
}

// Payment Section Component with Framer Motion animation
const PaymentSection = memo(({ t }: { t: (key: string) => string }) => {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  
  const paymentHeadlinesTranslated = useMemo(() => [
    { text: t('constructor.paymentRotating.noRisks'), color: "#10B981" },
    { text: t('constructor.paymentRotating.withGuarantee'), color: "#A78BFA" },
    { text: t('constructor.paymentRotating.stepByStep'), color: "#FF9F0A" },
    { text: t('constructor.paymentRotating.transparently'), color: "#5AC8FA" }
  ], [t]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % paymentHeadlinesTranslated.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [paymentHeadlinesTranslated]);
  
  return (
    <section className="px-3">
      {/* Section Label */}
      <p 
        className="scroll-fade-in"
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}
      >
        {t('constructor.paymentSection')}
      </p>
      
      {/* ATTENTION - Main Heading with Rotating Text */}
      <h2 
        className="scroll-fade-in-delay-1"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '32px',
          fontWeight: 600,
          letterSpacing: '-0.035em',
          lineHeight: '1.02',
          color: 'var(--text-primary)',
          marginBottom: '4px'
        }}
      >
        {t('constructor.payHeadline')}
      </h2>
      
      {/* Rotating Text - Same style as ShowcasePage */}
      <div className="scroll-fade-in-delay-1" style={{ height: '42px', overflow: 'hidden', marginBottom: '20px' }}>
        <AnimatePresence mode="wait">
          <m.span
            key={headlineIndex}
            initial={{ y: 50, opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -50, opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="block"
            style={{ 
              fontSize: '32px', 
              fontWeight: 600, 
              color: paymentHeadlinesTranslated[headlineIndex].color,
              letterSpacing: '-0.035em'
            }}
          >
            {paymentHeadlinesTranslated[headlineIndex].text}
          </m.span>
        </AnimatePresence>
      </div>
      
      {/* INTEREST - Compelling Description */}
      <p 
        className="scroll-fade-in-delay-2"
        style={{
          fontSize: '15px',
          fontWeight: 400,
          letterSpacing: '-0.01em',
          lineHeight: '1.6',
          color: 'var(--text-tertiary)',
          marginBottom: '32px',
          maxWidth: '320px'
        }}
      >
        {t('constructor.noHiddenFees')}
      </p>

      {/* STEP 1: Prepayment */}
      <div 
        className="scroll-fade-in"
        style={{
          padding: '24px',
          borderRadius: 'var(--card-radius)',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: '#10B981'
            }}>1</div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('constructor.prepayment')}</span>
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#10B981'
          }}>35%</span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
          {t('constructor.prepaymentDesc')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[t('constructor.prepaymentItems.interfaceDesign'), t('constructor.prepaymentItems.appStructure'), t('constructor.prepaymentItems.firstDemo')].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} color="#10B981" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 2: Payment after delivery */}
      <div 
        className="scroll-fade-in"
        style={{
          padding: '24px',
          borderRadius: 'var(--card-radius)',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--button-secondary-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--accent-primary)'
            }}>2</div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('constructor.afterDelivery')}</span>
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--accent-primary)'
          }}>65%</span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
          {t('constructor.afterDeliveryDesc')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[t('constructor.afterDeliveryItems.readyApp'), t('constructor.afterDeliveryItems.revisionsIncluded'), t('constructor.afterDeliveryItems.telegramPublish')].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hairline */}
      <div style={{ height: '1px', background: 'var(--divider)', margin: '24px 0' }} />

      {/* STEP 3: Monthly subscription */}
      <p 
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          marginBottom: '12px'
        }}
      >
        {t('constructor.afterLaunch')}
      </p>
      
      <div 
        className="scroll-fade-in"
        style={{
          padding: '24px',
          borderRadius: 'var(--card-radius)',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(90, 200, 250, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: '#5AC8FA'
            }}>3</div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('constructor.monthlySubscription')}</span>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
          {t('constructor.monthlySubscriptionDesc')}
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          {[
            { text: t('constructor.hosting'), sub: t('constructor.hostingDesc') },
            { text: t('constructor.support'), sub: t('constructor.supportDesc') },
            { text: t('constructor.updates'), sub: t('constructor.updatesDesc') },
            { text: t('constructor.backups'), sub: t('constructor.backupsDesc') }
          ].map((feature, index) => (
            <div 
              key={index}
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'var(--button-secondary-bg)',
                textAlign: 'center'
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{feature.text}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{feature.sub}</p>
            </div>
          ))}
        </div>
        
        {/* Pricing Tiers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Minimal */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('constructor.minimalPlan')}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{t('constructor.minimalPlanDesc')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>9 900</span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}> {t('constructor.perMonth')}</span>
              </div>
            </div>
          </div>
          
          {/* Standard */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            background: 'rgba(90, 200, 250, 0.08)',
            border: '1px solid rgba(90, 200, 250, 0.2)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '12px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#5AC8FA',
              fontSize: '9px',
              fontWeight: 700,
              color: '#000',
              letterSpacing: '0.05em'
            }}>{t('constructor.popular')}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('constructor.standardPlan')}</p>
                <p style={{ fontSize: '11px', color: '#5AC8FA', marginTop: '2px' }}>{t('constructor.standardPlanDesc')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>14 900</span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}> {t('constructor.perMonth')}</span>
              </div>
            </div>
          </div>
          
          {/* Premium */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            background: 'var(--hero-gradient)',
            border: '1px solid var(--hero-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('constructor.premiumPlan')}</p>
                <p style={{ fontSize: '11px', color: 'var(--accent-primary)', marginTop: '2px' }}>{t('constructor.premiumPlanDesc')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>24 900</span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}> {t('constructor.perMonth')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
  {
    id: 'ecommerce-basic',
    nameKey: 'constructor.onlineStore',
    icon: ShoppingCart,
    descriptionKey: 'constructor.onlineStoreDesc',
    features: ['catalog', 'cart', 'auth', 'payments'],
    estimatedPrice: 150000,
    developmentTimeKey: 'constructor.days710',
    popular: true
  },
  {
    id: 'restaurant',
    nameKey: 'constructor.restaurantTemplate',
    icon: Coffee,
    descriptionKey: 'constructor.restaurantTemplateDesc',
    features: ['catalog', 'cart', 'auth', 'booking-system'],
    estimatedPrice: 180000,
    developmentTimeKey: 'constructor.days1012',
    popular: false
  },
  {
    id: 'fitness-center',
    nameKey: 'constructor.fitnessClub',
    icon: Dumbbell,
    descriptionKey: 'constructor.fitnessClubDesc',
    features: ['booking-system', 'auth', 'subscriptions', 'progress-tracking'],
    estimatedPrice: 200000,
    developmentTimeKey: 'constructor.days1215',
    popular: false
  },
  {
    id: 'services',
    nameKey: 'constructor.servicesTemplate',
    icon: Settings,
    descriptionKey: 'constructor.servicesTemplateDesc',
    features: ['catalog', 'booking-system', 'auth', 'payments'],
    estimatedPrice: 170000,
    developmentTimeKey: 'constructor.days812',
    popular: false
  }
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
  'constructor.basicFeatures',
  'constructor.paymentsCategory', 
  'constructor.deliveryCategory',
  'constructor.communicationsCategory',
  'constructor.marketingCategory',
  'constructor.managementCategory',
  'constructor.bookingCategory',
  'constructor.aiAutomationCategory',
  'constructor.integrationsCategory'
];

const subscriptionPlansBase = [
  {
    id: 'minimal',
    nameKey: 'constructor.minimalPlan',
    price: 9900,
    descriptionKey: 'constructor.minimalPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.hosting99', 'constructor.subscriptionFeatures.minorFixes', 'constructor.subscriptionFeatures.emailSupport', 'constructor.subscriptionFeatures.monthlyBackups'],
    color: '#71717A',
    bgColor: 'rgba(113, 113, 122, 0.08)',
    borderColor: 'rgba(113, 113, 122, 0.15)'
  },
  {
    id: 'standard',
    nameKey: 'constructor.standardPlan',
    price: 14900,
    descriptionKey: 'constructor.standardPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.allFromMinimal', 'constructor.subscriptionFeatures.prioritySupport', 'constructor.subscriptionFeatures.freeUpdates', 'constructor.subscriptionFeatures.weeklyBackups', 'constructor.subscriptionFeatures.response2h'],
    color: '#5AC8FA',
    bgColor: 'rgba(90, 200, 250, 0.08)',
    borderColor: 'rgba(90, 200, 250, 0.2)',
    popular: true
  },
  {
    id: 'premium',
    nameKey: 'constructor.premiumPlan',
    price: 24900,
    descriptionKey: 'constructor.premiumPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.allFromStandard', 'constructor.subscriptionFeatures.personalManager', 'constructor.subscriptionFeatures.businessConsulting', 'constructor.subscriptionFeatures.dailyBackups', 'constructor.subscriptionFeatures.priorityImprovements', 'constructor.subscriptionFeatures.analyticsReports'],
    color: '#A78BFA',
    bgColor: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)',
    borderColor: 'rgba(167, 139, 250, 0.2)'
  }
];

// Memoized Template Card Component
const TemplateCard = memo(({ template, onSelect, t }: any) => {
  const IconComponent = template.icon;
  return (
    <div
      className="ios-list-item cursor-pointer"
      onClick={onSelect}
      data-testid={`template-${template.id}`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-system-blue/10 rounded-medium flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-system-blue" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="ios-headline font-semibold text-white">{template.name}</span>
            {template.popular && (
              <span className="px-2 py-0.5 bg-system-orange/10 rounded-full">
                <span className="ios-caption2 text-system-orange font-semibold">{t('constructor.popularTag')}</span>
              </span>
            )}
          </div>
          <div className="ios-footnote text-white/70">{template.description}</div>
          <div className="ios-footnote text-white/70 flex items-center space-x-1 mt-1">
            <Clock className="w-3 h-3" />
            <span>{template.developmentTime}</span>
            <span>•</span>
            <span>{t('constructor.from')} {template.estimatedPrice.toLocaleString()} ₽</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/30" />
      </div>
    </div>
  );
});
TemplateCard.displayName = 'TemplateCard';

function ConstructorPage({ onNavigate }: ConstructorPageProps) {
  const { t } = useLanguage();
  
  // Create translated arrays using useMemo
  const appTemplates = useMemo(() => appTemplatesBase.map(tpl => ({
    ...tpl,
    name: t(tpl.nameKey),
    description: t(tpl.descriptionKey),
    developmentTime: t(tpl.developmentTimeKey)
  })), [t]);
  
  const availableFeatures = useMemo(() => availableFeaturesBase.map(f => ({
    ...f,
    name: t(f.nameKey),
    category: t(f.categoryKey)
  })), [t]);
  
  const categories = useMemo(() => categoryKeys.map(key => t(key)), [t]);
  
  const subscriptionPlans = useMemo(() => subscriptionPlansBase.map(plan => ({
    ...plan,
    name: t(plan.nameKey),
    description: t(plan.descriptionKey),
    features: plan.featuresKeys.map(key => t(key))
  })), [t]);
  
  const [selectedTemplate, setSelectedTemplate] = useState<typeof appTemplates[0] | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [activeCategory, setActiveCategory] = useState(t('constructor.basicFeatures'));
  const [projectName, setProjectName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<typeof subscriptionPlans[0]>(subscriptionPlans[1]); // Default to Standard

  // Memoized select template handler
  const selectTemplate = useCallback((template: typeof appTemplates[0]) => {
    setSelectedTemplate(template);
    setProjectName(`${t('constructor.myProject')} ${template.name}`);
    
    const templateFeatures = template.features.map(featureId => {
      const feature = availableFeatures.find(f => f.id === featureId);
      if (feature) {
        return {
          id: feature.id,
          name: feature.name,
          price: feature.price,
          category: feature.category
        };
      }
      return null;
    }).filter(Boolean) as SelectedFeature[];
    
    setSelectedFeatures(templateFeatures);
    setCurrentStep(2);
  }, [t, appTemplates, availableFeatures]);

  // Track project creation when user first enters a name
  const hasTrackedProjectRef = useRef(false);
  useEffect(() => {
    if (projectName.trim().length > 0 && !hasTrackedProjectRef.current) {
      hasTrackedProjectRef.current = true;
      trackProjectCreation();
    }
  }, [projectName]);

  // Memoized toggle feature handler
  const toggleFeature = useCallback((feature: typeof availableFeatures[0]) => {
    if (feature.included) return;
    if (selectedTemplate?.features.includes(feature.id)) return;
    
    const isSelected = selectedFeatures.find(f => f.id === feature.id);
    if (isSelected) {
      setSelectedFeatures(prev => prev.filter(f => f.id !== feature.id));
    } else {
      setSelectedFeatures(prev => [...prev, {
        id: feature.id,
        name: feature.name,
        price: feature.price,
        category: feature.category
      }]);
      // Track feature addition for gamification
      trackFeatureAdded();
    }
  }, [selectedFeatures, selectedTemplate]);

  // Memoized total calculation
  const calculateTotal = useCallback(() => {
    const basePrice = selectedTemplate?.estimatedPrice || 0;
    const templateIncludedFeatures = selectedTemplate?.features || [];
    
    const featuresPrice = selectedFeatures
      .filter(f => {
        const feature = availableFeatures.find(af => af.id === f.id);
        const isIncluded = feature?.included;
        const isInTemplate = templateIncludedFeatures.includes(f.id);
        return !isIncluded && !isInTemplate;
      })
      .reduce((sum, feature) => sum + feature.price, 0);
    
    return basePrice + featuresPrice;
  }, [selectedTemplate, selectedFeatures]);

  const totalPrice = useMemo(() => calculateTotal(), [calculateTotal]);

  // Memoized order handler
  const handleOrderClick = useCallback(() => {
    if (!selectedTemplate || !projectName.trim()) return;
    
    const orderData = {
      projectName: projectName.trim(),
      selectedFeatures,
      selectedTemplate: selectedTemplate.name,
      totalAmount: totalPrice,
      estimatedDevelopmentTime: selectedTemplate.developmentTime,
      subscription: {
        plan: selectedSubscription.name,
        monthlyPrice: selectedSubscription.price
      }
    };
    
    onNavigate('checkout', orderData);
  }, [selectedTemplate, projectName, selectedFeatures, totalPrice, selectedSubscription, onNavigate]);

  // Memoized step navigation
  const goToStep = useCallback((step: number) => setCurrentStep(step), []);

  // Memoized filtered features
  const filteredFeatures = useMemo(() => 
    availableFeatures.filter(f => f.category === activeCategory),
    [activeCategory]
  );

  // Memoized template handlers
  const templateHandlers = useMemo(() => 
    appTemplates.map(template => ({
      id: template.id,
      handler: () => selectTemplate(template)
    })),
    [selectTemplate]
  );

  // Memoized additional features price
  const additionalFeaturesPrice = useMemo(() => {
    const templateIncludedFeatures = selectedTemplate?.features || [];
    return selectedFeatures
      .filter(f => {
        const feature = availableFeatures.find(af => af.id === f.id);
        const isIncluded = feature?.included;
        const isInTemplate = templateIncludedFeatures.includes(f.id);
        return !isIncluded && !isInTemplate;
      })
      .reduce((sum, f) => sum + f.price, 0);
  }, [selectedFeatures, selectedTemplate]);

  return (
    <div className="constructor-page min-h-screen pb-32 smooth-scroll-page" style={{ paddingTop: '140px', background: 'var(--surface)', color: 'var(--text-secondary)' }}>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Payment Section - AIDA Style with Animated Text */}
        <PaymentSection t={t} />

        {/* Progress Steps */}
        <section className="scroll-fade-in-delay-2">
          <div className="ios-list">
            <div className="ios-list-item">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-system-blue' : 'bg-white/10'
                }`}>
                  {currentStep > 1 ? (
                    <Check className="w-3 h-3 text-white/90" />
                  ) : (
                    <span className="ios-caption2 text-white font-bold">1</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="ios-body font-semibold text-white">{t('constructor.selectAppType')}</div>
                  <div className="ios-footnote text-white/70">{t('constructor.readyTemplateForBusiness')}</div>
                </div>
                {currentStep === 1 && <div className="w-2 h-2 bg-system-blue rounded-full" />}
              </div>
            </div>
            <div className="ios-list-item">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-system-blue' : 'bg-white/10'
                }`}>
                  {currentStep > 2 ? (
                    <Check className="w-3 h-3 text-white/90" />
                  ) : (
                    <span className="ios-caption2 text-white font-bold">2</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="ios-body font-semibold text-white">{t('constructor.addFeatures')}</div>
                  <div className="ios-footnote text-white/70">{t('constructor.expandCapabilities')}</div>
                </div>
                {currentStep === 2 && <div className="w-2 h-2 bg-system-blue rounded-full" />}
              </div>
            </div>
            <div className="ios-list-item">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? 'bg-system-blue' : 'bg-white/10'
                }`}>
                  <span className="ios-caption2 text-white font-bold">3</span>
                </div>
                <div className="flex-1">
                  <div className="ios-body font-semibold text-white">{t('constructor.placeOrder')}</div>
                  <div className="ios-footnote text-white/70">{t('constructor.startDevelopment')}</div>
                </div>
                {currentStep === 3 && <div className="w-2 h-2 bg-system-blue rounded-full" />}
              </div>
            </div>
          </div>
        </section>

        {/* Step 1: Template Selection */}
        {currentStep === 1 && (
          <section className="space-y-6 scroll-fade-in-delay-3">
            <div className="text-center scroll-fade-in">
              <h2 className="ios-title3 mb-2 text-white">{t('constructor.step1Title')}</h2>
              <p className="ios-subheadline text-white/70">
                {t('constructor.step1Desc')}
              </p>
            </div>

            <div className="ios-list">
              {appTemplates.map((template, idx) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={templateHandlers[idx].handler}
                  t={t}
                />
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 bg-system-blue/10 border-system-blue/20">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-system-blue mt-0.5" />
                <div>
                  <div className="ios-body font-semibold text-system-blue">{t('constructor.tip')}</div>
                  <div className="ios-footnote text-white/70">
                    {t('constructor.tipText')}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Features Selection */}
        {currentStep === 2 && selectedTemplate && (
          <section className="space-y-6 scroll-fade-in">
            <div className="text-center scroll-fade-in-delay-1">
              <h2 className="ios-title3 mb-2 text-white">{t('constructor.step2Title')}</h2>
              <p className="ios-subheadline text-white/70">
                {t('constructor.step2Desc')}
              </p>
            </div>

            {/* Project Name */}
            <div className="liquid-glass-card rounded-2xl p-4">
              <div className="ios-field-label text-white/70">{t('constructor.projectName')}</div>
              <input
                type="text"
                className="ios-field w-full mt-1 bg-white/10 text-white border-white/20 focus:border-system-blue"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t('constructor.enterProjectName')}
                data-testid="project-name-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="text"
                enterKeyHint="done"
              />
            </div>

            {/* Category Selector */}
            <div className="overflow-x-auto">
              <div className="flex space-x-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === category 
                        ? 'bg-system-blue text-white shadow-lg' 
                        : 'liquid-glass-card text-white/70 hover:text-white'
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="ios-list">
              <div className="ios-list-header text-white/70">{activeCategory}</div>
              {filteredFeatures.map((feature) => {
                const IconComponent = feature.icon;
                const isSelected = selectedFeatures.find(f => f.id === feature.id);
                const isIncluded = feature.included;
                const isInTemplate = selectedTemplate?.features.includes(feature.id);
                const isIncludedInAny = isIncluded || isInTemplate;
                
                return (
                  <div
                    key={feature.id}
                    className={`ios-list-item ${!isIncludedInAny ? 'cursor-pointer' : ''}`}
                    onClick={() => !isIncludedInAny && toggleFeature(feature)}
                    data-testid={`feature-${feature.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected || isIncludedInAny
                          ? 'bg-system-blue border-system-blue'
                          : 'border-white/30'
                      }`}>
                        {(isSelected || isIncludedInAny) && (
                          <Check className="w-3 h-3 text-white/90" />
                        )}
                      </div>
                      <IconComponent className="w-5 h-5 text-white/70" />
                      <div className="flex-1">
                        <div className="ios-body font-semibold text-white">{feature.name}</div>
                        {isIncludedInAny && (
                          <div className="ios-footnote text-system-green">{t('constructor.includedInTemplate')}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="ios-body font-semibold text-system-blue">
                          {isIncludedInAny ? t('constructor.included') : `+${feature.price.toLocaleString()} ₽`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subscription Plan Selection */}
            <div className="space-y-3">
              <div className="ios-list-header text-white/70">{t('constructor.subscriptionPlan')}</div>
              
              <div className="ios-list">
                {subscriptionPlans.map((plan) => {
                  const isSelected = selectedSubscription.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={`ios-list-item cursor-pointer ${isSelected ? 'bg-white/5' : ''}`}
                      onClick={() => setSelectedSubscription(plan)}
                      data-testid={`subscription-${plan.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Radio indicator */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-system-blue bg-system-blue' : 'border-white/30'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        
                        {/* Plan info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="ios-headline font-semibold text-white">{plan.name}</span>
                            {plan.popular && (
                              <span className="px-2 py-0.5 bg-system-blue/15 rounded-full">
                                <span className="ios-caption2 text-system-blue font-medium">{t('constructor.popularTag')}</span>
                              </span>
                            )}
                          </div>
                          <div className="ios-footnote text-white/50">{plan.description}</div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <span className="ios-body font-bold text-white">{plan.price.toLocaleString()}</span>
                          <span className="ios-footnote text-white/50"> {t('constructor.perMonth')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Selected plan features */}
              <div className="liquid-glass-card rounded-xl p-3 mt-2">
                <div className="flex flex-wrap gap-2">
                  {selectedSubscription.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-system-blue" />
                      <span className="ios-caption1 text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              <button
                className="ios-button-plain flex-1"
                onClick={() => goToStep(1)}
              >
                {t('constructor.back')}
              </button>
              <button
                className="ios-button-filled flex-1"
                onClick={() => goToStep(3)}
                disabled={!projectName.trim()}
              >
                {t('constructor.next')}
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Review and Order */}
        {currentStep === 3 && selectedTemplate && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="ios-title3 mb-2 text-white">{t('constructor.step3Title')}</h2>
              <p className="ios-subheadline text-white/70">
                {t('constructor.step3Desc')}
              </p>
            </div>

            {/* Project Summary */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 space-y-4">
              <div className="text-center">
                <h3 className="ios-title3 mb-1 text-white">{projectName}</h3>
                <p className="ios-footnote text-white/70">
                  {t('constructor.basedOnTemplate')} "{selectedTemplate.name}"
                </p>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="ios-body text-white">{t('constructor.baseCost')}</span>
                  <span className="ios-body font-semibold text-white">{selectedTemplate.estimatedPrice.toLocaleString()} ₽</span>
                </div>
                
                {additionalFeaturesPrice > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="ios-body text-white">{t('constructor.additionalFeatures')}</span>
                    <span className="ios-body font-semibold text-white">
                      +{additionalFeaturesPrice.toLocaleString()} ₽
                    </span>
                  </div>
                )}
                
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="ios-headline font-bold text-white">{t('constructor.totalDevelopment')}</span>
                    <span className="ios-title3 font-bold text-system-blue">{totalPrice.toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>
              
              {/* Subscription Plan Summary */}
              <div className="border-t border-white/20 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="ios-body text-white/70">{t('constructor.subscription')} ({selectedSubscription.name})</span>
                  <span className="ios-body font-semibold text-white">
                    {selectedSubscription.price.toLocaleString()} {t('constructor.perMonth')}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 bg-system-green/10 border-system-green/20 p-4">
                <div className="flex items-center space-x-2 justify-center">
                  <Clock className="w-4 h-4 text-system-green" />
                  <span className="ios-footnote text-system-green font-semibold">
                    {t('constructor.readinessTime')}: {selectedTemplate.developmentTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                className="ios-button-filled w-full"
                onClick={handleOrderClick}
                data-testid="button-order"
              >
                {t('constructor.orderFor')} {totalPrice.toLocaleString()} ₽
              </button>
              
              <button
                className="ios-button-plain w-full"
                onClick={() => goToStep(2)}
              >
                {t('constructor.changeFeatures')}
              </button>
              
              <div className="text-center space-y-1">
                <p className="ios-footnote text-white/70">
                  {t('constructor.prepayment35')}
                </p>
                <p className="ios-footnote text-white/50">
                  + {selectedSubscription.name} {t('constructor.subscriptionAfterLaunch')} {selectedSubscription.price.toLocaleString()} {t('constructor.perMonth')}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Sticky Summary Bar */}
      {selectedTemplate && currentStep > 1 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40" data-testid="summary-bar">
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-3 bg-black/90 backdrop-blur-xl border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="ios-footnote text-white/70">{t('constructor.development')}</div>
                  <div className="ios-headline font-bold text-system-blue">
                    {totalPrice.toLocaleString()} ₽
                  </div>
                </div>
                <div className="text-center">
                  <div className="ios-footnote text-white/70">{t('constructor.subscription')}</div>
                  <div className="ios-headline font-bold" style={{ color: selectedSubscription.color }}>
                    {selectedSubscription.price.toLocaleString()} {t('constructor.perMonth')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="ios-footnote text-white/70">{t('constructor.featuresCount')}</div>
                  <div className="ios-headline font-bold text-white">
                    {selectedFeatures.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ConstructorPage);
