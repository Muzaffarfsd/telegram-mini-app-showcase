import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { trackProjectCreation, trackFeatureAdded } from "@/hooks/useGamification";
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

interface SelectedFeature {
  id: string;
  name: string;
  price: number;
  category: string;
}

const appTemplates = [
  {
    id: 'ecommerce-basic',
    name: 'Интернет-магазин',
    icon: ShoppingCart,
    description: 'Продажа товаров онлайн',
    features: ['catalog', 'cart', 'auth', 'payments'],
    estimatedPrice: 45000,
    developmentTime: '7-10 дней',
    popular: true
  },
  {
    id: 'restaurant',
    name: 'Ресторан',
    icon: Coffee,
    description: 'Меню и заказы еды',
    features: ['catalog', 'cart', 'auth', 'booking-system'],
    estimatedPrice: 55000,
    developmentTime: '10-12 дней',
    popular: false
  },
  {
    id: 'fitness-center',
    name: 'Фитнес-клуб',
    icon: Dumbbell,
    description: 'Тренировки и абонементы',
    features: ['booking-system', 'auth', 'subscriptions', 'progress-tracking'],
    estimatedPrice: 65000,
    developmentTime: '12-15 дней',
    popular: false
  },
  {
    id: 'services',
    name: 'Услуги',
    icon: Settings,
    description: 'Бронирование услуг',
    features: ['catalog', 'booking-system', 'auth', 'payments'],
    estimatedPrice: 50000,
    developmentTime: '8-12 дней',
    popular: false
  }
];

const availableFeatures = [
  { id: 'catalog', name: 'Каталог', price: 8000, category: 'Основные', icon: Package, included: true },
  { id: 'cart', name: 'Корзина', price: 6000, category: 'Основные', icon: ShoppingCart, included: true },
  { id: 'auth', name: 'Авторизация', price: 4000, category: 'Основные', icon: User, included: true },
  { id: 'search', name: 'Поиск', price: 7000, category: 'Основные', icon: Zap, included: false },
  { id: 'favorites', name: 'Избранное', price: 4000, category: 'Основные', icon: Star, included: false },
  { id: 'reviews', name: 'Отзывы', price: 8000, category: 'Основные', icon: Star, included: false },
  
  { id: 'payments', name: 'Платежи', price: 15000, category: 'Платежи', icon: CreditCard, included: false },
  { id: 'subscriptions', name: 'Подписки', price: 18000, category: 'Платежи', icon: CreditCard, included: false },
  { id: 'installments', name: 'Рассрочка', price: 12000, category: 'Платежи', icon: CreditCard, included: false },
  
  { id: 'delivery-basic', name: 'Доставка', price: 10000, category: 'Доставка', icon: Truck, included: false },
  { id: 'pickup-points', name: 'Самовывоз', price: 12000, category: 'Доставка', icon: Package, included: false },
  { id: 'express-delivery', name: 'Экспресс', price: 8000, category: 'Доставка', icon: Truck, included: false },
  
  { id: 'push-notifications', name: 'Уведомления', price: 8000, category: 'Коммуникации', icon: Bell, included: false },
  { id: 'chat-support', name: 'Чат поддержки', price: 15000, category: 'Коммуникации', icon: MessageSquare, included: false },
  { id: 'video-calls', name: 'Видеозвонки', price: 20000, category: 'Коммуникации', icon: Smartphone, included: false },
  
  { id: 'loyalty-program', name: 'Бонусы', price: 22000, category: 'Маркетинг', icon: Crown, included: false },
  { id: 'promo-codes', name: 'Промокоды', price: 10000, category: 'Маркетинг', icon: Crown, included: false },
  { id: 'referral-system', name: 'Рефералы', price: 18000, category: 'Маркетинг', icon: Users, included: false },
  
  { id: 'basic-analytics', name: 'Аналитика', price: 15000, category: 'Управление', icon: BarChart, included: false },
  { id: 'admin-panel', name: 'Админ панель', price: 25000, category: 'Управление', icon: Settings, included: false },
  { id: 'crm-system', name: 'CRM', price: 40000, category: 'Управление', icon: Users, included: false },
  
  { id: 'booking-system', name: 'Бронирование', price: 18000, category: 'Бронирование', icon: Calendar, included: false },
  { id: 'queue-management', name: 'Очереди', price: 15000, category: 'Бронирование', icon: Clock, included: false },
  { id: 'calendar-sync', name: 'Календарь', price: 10000, category: 'Бронирование', icon: Calendar, included: false },
  
  { id: 'progress-tracking', name: 'Прогресс', price: 15000, category: 'Управление', icon: BarChart, included: false }
];

const categories = ['Основные', 'Платежи', 'Доставка', 'Коммуникации', 'Маркетинг', 'Управление', 'Бронирование'];

// Memoized Template Card Component
const TemplateCard = memo(({ template, onSelect }: any) => {
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
                <span className="ios-caption2 text-system-orange font-semibold">Популярно</span>
              </span>
            )}
          </div>
          <div className="ios-footnote text-white/70">{template.description}</div>
          <div className="ios-footnote text-white/70 flex items-center space-x-1 mt-1">
            <Clock className="w-3 h-3" />
            <span>{template.developmentTime}</span>
            <span>•</span>
            <span>от {template.estimatedPrice.toLocaleString()} ₽</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/30" />
      </div>
    </div>
  );
});
TemplateCard.displayName = 'TemplateCard';

function ConstructorPage({ onNavigate }: ConstructorPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof appTemplates[0] | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [activeCategory, setActiveCategory] = useState('Основные');
  const [projectName, setProjectName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Memoized select template handler
  const selectTemplate = useCallback((template: typeof appTemplates[0]) => {
    setSelectedTemplate(template);
    setProjectName(`Мой ${template.name}`);
    
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
  }, []);

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
      estimatedDevelopmentTime: selectedTemplate.developmentTime
    };
    
    onNavigate('checkout', orderData);
  }, [selectedTemplate, projectName, selectedFeatures, totalPrice, onNavigate]);

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
    <div className="min-h-screen bg-black text-white pb-32 smooth-scroll-page" style={{ paddingTop: '140px' }}>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* iOS 26 Premium Monochrome Payment Section */}
        <section className="scroll-fade-in ios26-payment-section">
          <style>{`
            .ios26-payment-section {
              contain: layout style;
            }
            
            .ios26-liquid-card {
              position: relative;
              background: rgba(16, 185, 129, 0.03);
              border-radius: 28px;
              border: 1px solid rgba(16, 185, 129, 0.12);
              overflow: hidden;
            }
            
            .ios26-stage-card {
              position: relative;
              background: rgba(16, 185, 129, 0.02);
              border-radius: 20px;
              padding: 20px;
            }
            
            .ios26-stage-number {
              width: 26px;
              height: 26px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 600;
            }
            
            .ios26-feature-pill {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px 14px;
              background: rgba(16, 185, 129, 0.02);
              border-radius: 12px;
            }
            
            .ios26-price-card {
              position: relative;
              background: rgba(16, 185, 129, 0.03);
              border-radius: 22px;
              padding: 28px;
              text-align: center;
              overflow: hidden;
            }
            
            .ios26-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 14px;
              border-radius: 100px;
            }
            
            .ios26-divider {
              height: 1px;
              background: rgba(16, 185, 129, 0.15);
              margin: 24px 0;
            }
            
            .ios26-check-icon {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
          `}</style>
          
          <div className="ios26-liquid-card p-7">
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <Shield className="w-6 h-6" style={{ color: '#10B981' }} />
                </div>
                <h3 className="text-[22px] font-semibold text-white mb-2 tracking-[-0.02em]">Прозрачная оплата</h3>
                <p className="text-[15px] text-white/45 max-w-[280px] mx-auto leading-relaxed">
                  Платите поэтапно — минимальный риск, максимальный контроль
                </p>
              </div>

              {/* Payment Stages */}
              <div className="space-y-3 mb-8">
                
                {/* Stage 1 */}
                <div className="ios26-stage-card" style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <Zap className="w-5 h-5" style={{ color: '#10B981' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <div className="text-[16px] font-medium text-white/90">35% предоплата</div>
                          <div className="text-[13px]" style={{ color: '#34D399' }}>Запуск разработки</div>
                        </div>
                        <div className="ios26-stage-number" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>1</div>
                      </div>
                      <p className="text-[13px] text-white/35 leading-relaxed">
                        Мы начинаем создавать ваше приложение сразу после внесения предоплаты
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="ios26-stage-card" style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <div className="text-[16px] font-medium text-white/90">65% при получении</div>
                          <div className="text-[13px]" style={{ color: '#34D399' }}>Готовое приложение</div>
                        </div>
                        <div className="ios26-stage-number" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>2</div>
                      </div>
                      <p className="text-[13px] text-white/35 leading-relaxed">
                        Оплачиваете остаток только после тестирования и принятия работы
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="ios26-stage-card" style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <TrendingUp className="w-5 h-5" style={{ color: '#10B981' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <div className="text-[16px] font-medium text-white/90">Поддержка и развитие</div>
                          <div className="text-[13px]" style={{ color: '#34D399' }}>Ежемесячная подписка</div>
                        </div>
                        <div className="ios26-stage-number" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>3</div>
                      </div>
                      <p className="text-[13px] text-white/35 leading-relaxed">
                        Стабильная работа, обновления и поддержка вашего бизнеса 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="ios26-divider" />

              {/* Subscription Details */}
              <div className="mb-6">
                <div className="text-center mb-5">
                  <div className="ios26-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Rocket className="w-4 h-4" style={{ color: '#10B981' }} />
                    <span className="text-[13px] font-medium" style={{ color: '#34D399' }}>Что входит в подписку</span>
                  </div>
                </div>
                
                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="ios26-feature-pill" style={{ border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                    <div className="ios26-check-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <Check className="w-3 h-3" style={{ color: '#10B981' }} />
                    </div>
                    <span className="text-[13px] text-white/70">Хостинг и сервера</span>
                  </div>
                  <div className="ios26-feature-pill" style={{ border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                    <div className="ios26-check-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <Check className="w-3 h-3" style={{ color: '#10B981' }} />
                    </div>
                    <span className="text-[13px] text-white/70">Поддержка 24/7</span>
                  </div>
                  <div className="ios26-feature-pill" style={{ border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                    <div className="ios26-check-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <Check className="w-3 h-3" style={{ color: '#10B981' }} />
                    </div>
                    <span className="text-[13px] text-white/70">Обновления</span>
                  </div>
                  <div className="ios26-feature-pill" style={{ border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                    <div className="ios26-check-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <Check className="w-3 h-3" style={{ color: '#10B981' }} />
                    </div>
                    <span className="text-[13px] text-white/70">Резервные копии</span>
                  </div>
                </div>
              </div>

              {/* Price Card */}
              <div className="ios26-price-card" style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div className="relative z-10">
                  {/* Free Month Badge */}
                  <div className="ios26-badge mb-5" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Gift className="w-4 h-4" style={{ color: '#10B981' }} />
                    <span className="text-[13px] font-medium" style={{ color: '#34D399' }}>Первый месяц в подарок</span>
                  </div>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-[38px] font-semibold text-white tracking-[-0.02em]">5,999</span>
                      <span className="text-[18px] font-medium text-white/50">₽</span>
                    </div>
                    <div className="text-[13px] text-white/35 mt-2">в месяц со второго месяца</div>
                  </div>

                  {/* Value proposition */}
                  <div className="flex items-center justify-center gap-3 text-[12px] text-white/30">
                    <span>Всё включено</span>
                    <span className="w-1 h-1 rounded-full bg-white/15" />
                    <span>Без скрытых платежей</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                  <div className="ios-body font-semibold text-white">Выберите тип приложения</div>
                  <div className="ios-footnote text-white/70">Готовый шаблон под ваш бизнес</div>
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
                  <div className="ios-body font-semibold text-white">Добавьте функции</div>
                  <div className="ios-footnote text-white/70">Расширьте возможности</div>
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
                  <div className="ios-body font-semibold text-white">Оформите заказ</div>
                  <div className="ios-footnote text-white/70">Запустите разработку</div>
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
              <h2 className="ios-title3 mb-2 text-white">Шаг 1: Выберите тип</h2>
              <p className="ios-subheadline text-white/70">
                Готовые решения для разных сфер бизнеса
              </p>
            </div>

            <div className="ios-list">
              {appTemplates.map((template, idx) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={templateHandlers[idx].handler}
                />
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 bg-system-blue/10 border-system-blue/20">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-system-blue mt-0.5" />
                <div>
                  <div className="ios-body font-semibold text-system-blue">Подсказка</div>
                  <div className="ios-footnote text-white/70">
                    Выберите тип, наиболее близкий к вашему бизнесу. 
                    Позже можно будет добавить дополнительные функции.
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
              <h2 className="ios-title3 mb-2 text-white">Шаг 2: Настройте функции</h2>
              <p className="ios-subheadline text-white/70">
                Добавьте нужные возможности для вашего приложения
              </p>
            </div>

            {/* Project Name */}
            <div className="liquid-glass-card rounded-2xl p-4">
              <div className="ios-field-label text-white/70">Название проекта</div>
              <input
                type="text"
                className="ios-field w-full mt-1 bg-white/10 text-white border-white/20 focus:border-system-blue"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Введите название"
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
                          <div className="ios-footnote text-system-green">Включено в шаблон</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="ios-body font-semibold text-system-blue">
                          {isIncludedInAny ? 'Включено' : `+${feature.price.toLocaleString()} ₽`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              <button
                className="ios-button-plain flex-1"
                onClick={() => goToStep(1)}
              >
                Назад
              </button>
              <button
                className="ios-button-filled flex-1"
                onClick={() => goToStep(3)}
                disabled={!projectName.trim()}
              >
                Далее
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Review and Order */}
        {currentStep === 3 && selectedTemplate && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="ios-title3 mb-2 text-white">Шаг 3: Подтвердите заказ</h2>
              <p className="ios-subheadline text-white/70">
                Проверьте конфигурацию и запустите разработку
              </p>
            </div>

            {/* Project Summary */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 space-y-4">
              <div className="text-center">
                <h3 className="ios-title3 mb-1 text-white">{projectName}</h3>
                <p className="ios-footnote text-white/70">
                  На основе шаблона "{selectedTemplate.name}"
                </p>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="ios-body text-white">Базовая стоимость</span>
                  <span className="ios-body font-semibold text-white">{selectedTemplate.estimatedPrice.toLocaleString()} ₽</span>
                </div>
                
                {additionalFeaturesPrice > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="ios-body text-white">Дополнительные функции</span>
                    <span className="ios-body font-semibold text-white">
                      +{additionalFeaturesPrice.toLocaleString()} ₽
                    </span>
                  </div>
                )}
                
                <div className="border-t border-white/20 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="ios-headline font-bold text-white">Итого</span>
                    <span className="ios-title3 font-bold text-system-blue">{totalPrice.toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 bg-system-green/10 border-system-green/20 p-4">
                <div className="flex items-center space-x-2 justify-center">
                  <Clock className="w-4 h-4 text-system-green" />
                  <span className="ios-footnote text-system-green font-semibold">
                    Готовность: {selectedTemplate.developmentTime}
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
                Заказать за {totalPrice.toLocaleString()} ₽
              </button>
              
              <button
                className="ios-button-plain w-full"
                onClick={() => goToStep(2)}
              >
                Изменить функции
              </button>
              
              <div className="text-center">
                <p className="ios-footnote text-white/70">
                  Предоплата 30% • Остальное по готовности этапов
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
                  <div className="ios-footnote text-white/70">Текущая стоимость</div>
                  <div className="ios-headline font-bold text-system-blue">
                    {totalPrice.toLocaleString()} ₽
                  </div>
                </div>
                <div className="text-right">
                  <div className="ios-footnote text-white/70">Функций</div>
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
