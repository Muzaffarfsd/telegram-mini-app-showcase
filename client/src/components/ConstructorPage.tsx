import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { trackProjectCreation, trackFeatureAdded } from "@/hooks/useGamification";
import { 
  ShoppingCart,
  Check,
  Zap,
  Sparkles,
  Rocket,
  CheckCircle,
  Gift,
  ArrowRight,
  Package,
  Coffee,
  Dumbbell,
  Settings,
  CreditCard,
  Truck,
  Bell,
  Crown,
  BarChart,
  Calendar,
  Users,
  Star,
  MessageSquare,
  Smartphone,
  Clock,
  User,
  ChevronRight,
  TrendingUp,
  Info,
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
    popular: true,
    gradient: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
    hoverColor: 'rgba(0, 122, 255, 0.15)'
  },
  {
    id: 'restaurant',
    name: 'Ресторан',
    icon: Coffee,
    description: 'Меню и заказы еды',
    features: ['catalog', 'cart', 'auth', 'booking-system'],
    estimatedPrice: 55000,
    developmentTime: '10-12 дней',
    popular: false,
    gradient: 'linear-gradient(135deg, #FF9F0A 0%, #FF6B00 100%)',
    hoverColor: 'rgba(255, 159, 10, 0.15)'
  },
  {
    id: 'fitness-center',
    name: 'Фитнес-клуб',
    icon: Dumbbell,
    description: 'Тренировки и абонементы',
    features: ['booking-system', 'auth', 'subscriptions', 'progress-tracking'],
    estimatedPrice: 65000,
    developmentTime: '12-15 дней',
    popular: false,
    gradient: 'linear-gradient(135deg, #BF5AF2 0%, #8E2DE2 100%)',
    hoverColor: 'rgba(191, 90, 242, 0.15)'
  },
  {
    id: 'services',
    name: 'Услуги',
    icon: Settings,
    description: 'Бронирование услуг',
    features: ['catalog', 'booking-system', 'auth', 'payments'],
    estimatedPrice: 50000,
    developmentTime: '8-12 дней',
    popular: false,
    gradient: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    hoverColor: 'rgba(52, 199, 89, 0.15)'
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

function ConstructorPage({ onNavigate }: ConstructorPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof appTemplates[0] | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [activeCategory, setActiveCategory] = useState('Основные');
  const [projectName, setProjectName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setSelectedFeatures(prev => [...prev, {
        id: feature.id,
        name: feature.name,
        price: feature.price,
        category: feature.category
      }]);
      trackFeatureAdded();
    }
  }, [selectedFeatures, selectedTemplate]);

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

  const goToStep = useCallback((step: number) => setCurrentStep(step), []);

  const filteredFeatures = useMemo(() => 
    availableFeatures.filter(f => f.category === activeCategory),
    [activeCategory]
  );

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
    <div className="min-h-screen bg-[#000000] pb-32 overflow-hidden">
      <div className="max-w-md mx-auto">
        
        {/* ===============================================
            HERO - Apple Presentation Style
            =============================================== */}
        <section className="relative px-6 pt-20 pb-16">
          {/* Parallax gradient background */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 122, 255, 0.25) 0%, transparent 70%)',
              transform: `translateY(${scrollY * 0.4}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          <div className="relative z-10">
            {/* Animated badge */}
            <div className="flex justify-center mb-6 scroll-fade-in">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full animate-pulse-subtle"
                style={{
                  background: 'rgba(0, 122, 255, 0.12)',
                  border: '1px solid rgba(0, 122, 255, 0.25)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 20px rgba(0, 122, 255, 0.15)'
                }}
              >
                <Sparkles className="w-4 h-4 text-[#007AFF]" strokeWidth={2.5} />
                <span 
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#007AFF',
                    letterSpacing: '0.03em'
                  }}
                >
                  КОНСТРУКТОР ПРИЛОЖЕНИЙ
                </span>
              </div>
            </div>

            {/* Hero headline - Apple gradient text */}
            <h1 
              className="text-center mb-5 scroll-fade-in-delay-1"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(44px, 12vw, 64px)',
                fontWeight: 800,
                letterSpacing: '-0.06em',
                lineHeight: '1.0',
                background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.65) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '20px'
              }}
            >
              Создайте
              <br />
              приложение
              <br />
              мечты
            </h1>
            
            {/* Subtitle - Apple style */}
            <p 
              className="text-center mb-8 scroll-fade-in-delay-2"
              style={{
                fontSize: '19px',
                lineHeight: '1.5',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.65)',
                letterSpacing: '-0.015em',
                maxWidth: '340px',
                margin: '0 auto 32px'
              }}
            >
              Выберите тип, настройте функции
              <br />
              и получите готовое решение
            </p>

            {/* Stats badges - Apple premium */}
            <div className="flex justify-center gap-6 mb-2 scroll-fade-in-delay-3">
              <StatBadge number="7 дней" label="разработка" />
              <StatBadge number="35%" label="аванс" />
              <StatBadge number="24/7" label="поддержка" />
            </div>
          </div>

          {/* Scroll indicator */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 scroll-fade-in-delay-4"
            style={{
              width: '2px',
              height: '40px',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
              animation: 'bounce 2s infinite'
            }}
          />
        </section>

        <div className="px-6 space-y-8">
          {/* ===============================================
              PAYMENT MODEL - Apple Premium Cards
              =============================================== */}
          <section>
            <div 
              className="relative rounded-[28px] p-7 overflow-hidden backdrop-blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Radial gradient overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  background: 'radial-gradient(circle at 30% 20%, rgba(0, 122, 255, 0.15) 0%, transparent 60%)'
                }}
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 
                    style={{
                      fontSize: '32px',
                      fontWeight: 800,
                      letterSpacing: '-0.05em',
                      color: '#FFFFFF',
                      marginBottom: '12px'
                    }}
                  >
                    Без рисков
                  </h3>
                  <p 
                    style={{
                      fontSize: '17px',
                      lineHeight: '1.5',
                      color: 'rgba(255, 255, 255, 0.6)',
                      letterSpacing: '-0.015em'
                    }}
                  >
                    Платите поэтапно
                  </p>
                </div>

                {/* Payment cards */}
                <div className="space-y-4 mb-8">
                  <PaymentCard
                    number="1"
                    title="35% Старт"
                    subtitle="Начинаем создавать"
                    description="Мы начинаем работать сразу после внесения предоплаты"
                    gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                    icon={<Zap className="w-6 h-6" strokeWidth={2.5} />}
                  />
                  
                  <PaymentCard
                    number="2"
                    title="65% Готово"
                    subtitle="Тестируете, принимаете"
                    description="Оплачиваете после тестирования и принятия работы"
                    gradient="linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)"
                    icon={<CheckCircle className="w-6 h-6" strokeWidth={2.5} />}
                  />
                  
                  <PaymentCard
                    number="3"
                    title="5,999₽ / мес"
                    subtitle="Всё включено"
                    description="Хостинг, поддержка, обновления и резервные копии"
                    gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
                    icon={<TrendingUp className="w-6 h-6" strokeWidth={2.5} />}
                    badge={
                      <div className="flex items-center gap-1.5">
                        <Gift className="w-3 h-3" strokeWidth={2.5} />
                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em' }}>
                          1 месяц в подарок
                        </span>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ===============================================
              PROGRESS STEPS - Apple minimalist
              =============================================== */}
          <section>
            <div 
              className="rounded-[24px] p-6 backdrop-blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
              }}
            >
              {[
                { num: 1, title: 'Выберите тип приложения', desc: 'Готовый шаблон под ваш бизнес' },
                { num: 2, title: 'Добавьте функции', desc: 'Расширьте возможности' },
                { num: 3, title: 'Оформите заказ', desc: 'Запустите разработку' }
              ].map((step, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-4 py-4 ${i < 2 ? 'border-b border-white/8' : ''}`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: currentStep >= step.num 
                        ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      boxShadow: currentStep >= step.num 
                        ? '0 4px 16px rgba(0, 122, 255, 0.4)'
                        : 'none'
                    }}
                  >
                    {currentStep > step.num ? (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    ) : (
                      <span 
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: currentStep >= step.num ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'
                        }}
                      >
                        {step.num}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div 
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        letterSpacing: '-0.02em',
                        marginBottom: '3px'
                      }}
                    >
                      {step.title}
                    </div>
                    <div 
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {step.desc}
                    </div>
                  </div>
                  {currentStep === step.num && (
                    <div 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                      style={{
                        background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                        boxShadow: '0 0 12px rgba(0, 122, 255, 0.6)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ===============================================
              STEP 1: TEMPLATE SELECTION
              =============================================== */}
          {currentStep === 1 && (
            <section className="space-y-6">
              {/* Section header */}
              <div className="text-center">
                <h2 
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    color: '#FFFFFF',
                    marginBottom: '10px'
                  }}
                >
                  Шаг 1: Выберите тип
                </h2>
                <p 
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '-0.015em'
                  }}
                >
                  Готовые решения для бизнеса
                </p>
              </div>

              {/* Template cards */}
              <div className="space-y-3">
                {appTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <div
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className="group cursor-pointer active:scale-[0.98] transition-all duration-200"
                      data-testid={`template-${template.id}`}
                    >
                      <div 
                        className="rounded-[20px] p-5 backdrop-blur-3xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.04) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {/* Hover glow */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at 50% 0%, ${template.gradient.match(/rgba?\([^)]+\)/)?.[0] || 'rgba(0, 122, 255, 0.1)'} 0%, transparent 70%)`,
                            filter: 'blur(20px)'
                          }}
                        />

                        <div className="relative z-10 flex items-center gap-4">
                          {/* Icon */}
                          <div 
                            className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0"
                            style={{
                              background: template.gradient,
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            <IconComponent className="w-6 h-6 text-white" strokeWidth={2.5} />
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span 
                                style={{
                                  fontSize: '17px',
                                  fontWeight: 700,
                                  color: '#FFFFFF',
                                  letterSpacing: '-0.03em'
                                }}
                              >
                                {template.name}
                              </span>
                              {template.popular && (
                                <div 
                                  className="px-2.5 py-0.5 rounded-full"
                                  style={{
                                    background: 'rgba(255, 149, 0, 0.15)',
                                    border: '1px solid rgba(255, 149, 0, 0.35)'
                                  }}
                                >
                                  <span 
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      color: '#FF9500',
                                      letterSpacing: '0.06em',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    ТОП
                                  </span>
                                </div>
                              )}
                            </div>
                            <p 
                              style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                marginBottom: '6px',
                                letterSpacing: '-0.01em'
                              }}
                            >
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2.5">
                              <Clock className="w-3.5 h-3.5 text-white/40" strokeWidth={2} />
                              <span 
                                style={{
                                  fontSize: '13px',
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  letterSpacing: '-0.01em'
                                }}
                              >
                                {template.developmentTime}
                              </span>
                              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
                              <span 
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  letterSpacing: '-0.01em'
                                }}
                              >
                                {template.estimatedPrice.toLocaleString()} ₽
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight 
                            className="w-5 h-5 text-white/25 flex-shrink-0 group-hover:text-white/40 group-hover:translate-x-1 transition-all" 
                            strokeWidth={2.5} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info card */}
              <div 
                className="rounded-[20px] p-5 backdrop-blur-3xl"
                style={{
                  background: 'rgba(0, 122, 255, 0.08)',
                  border: '1px solid rgba(0, 122, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 122, 255, 0.1)'
                }}
              >
                <div className="flex gap-3.5">
                  <Shield className="w-5 h-5 text-[#007AFF] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <div>
                    <div 
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#007AFF',
                        marginBottom: '6px',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      Гарантия качества
                    </div>
                    <div 
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: '1.5',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Выберите тип приложения наиболее близкий к вашему бизнесу. 
                      На следующем шаге добавите нужные функции.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ===============================================
              STEP 2: FEATURES SELECTION
              =============================================== */}
          {currentStep === 2 && selectedTemplate && (
            <section className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    color: '#FFFFFF',
                    marginBottom: '10px'
                  }}
                >
                  Шаг 2: Настройте
                </h2>
                <p 
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '-0.015em'
                  }}
                >
                  Добавьте нужные функции
                </p>
              </div>

              {/* Project name */}
              <div 
                className="rounded-[20px] p-5 backdrop-blur-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.04) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div 
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '10px',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}
                >
                  Название проекта
                </div>
                <input
                  type="text"
                  className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    letterSpacing: '-0.025em',
                    padding: '10px 0',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.15)'
                  }}
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

              {/* Categories */}
              <div className="overflow-x-auto">
                <div className="flex gap-2.5 min-w-max pb-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className="px-4 py-2.5 rounded-full whitespace-nowrap transition-all active:scale-95"
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        letterSpacing: '-0.015em',
                        background: activeCategory === category 
                          ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: activeCategory === category ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                        border: `1px solid ${activeCategory === category ? '#007AFF' : 'rgba(255, 255, 255, 0.12)'}`,
                        boxShadow: activeCategory === category 
                          ? '0 6px 20px rgba(0, 122, 255, 0.35)'
                          : 'none'
                      }}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features list */}
              <div 
                className="rounded-[24px] overflow-hidden backdrop-blur-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div 
                  className="px-5 py-4"
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <span 
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'rgba(255, 255, 255, 0.6)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {activeCategory}
                  </span>
                </div>
                
                {filteredFeatures.map((feature, idx) => {
                  const IconComponent = feature.icon;
                  const isSelected = selectedFeatures.find(f => f.id === feature.id);
                  const isIncluded = feature.included;
                  const isInTemplate = selectedTemplate?.features.includes(feature.id);
                  const isIncludedInAny = isIncluded || isInTemplate;
                  
                  return (
                    <div
                      key={feature.id}
                      className={`${!isIncludedInAny ? 'cursor-pointer active:scale-[0.99]' : ''} ${idx < filteredFeatures.length - 1 ? 'border-b border-white/6' : ''} transition-all`}
                      onClick={() => !isIncludedInAny && toggleFeature(feature)}
                      data-testid={`feature-${feature.id}`}
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Checkbox */}
                        <div 
                          className="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: (isSelected || isIncludedInAny) 
                              ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)'
                              : 'transparent',
                            borderColor: (isSelected || isIncludedInAny) ? '#007AFF' : 'rgba(255, 255, 255, 0.25)',
                            boxShadow: (isSelected || isIncludedInAny) 
                              ? '0 4px 12px rgba(0, 122, 255, 0.3)'
                              : 'none'
                          }}
                        >
                          {(isSelected || isIncludedInAny) && (
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          )}
                        </div>

                        {/* Icon */}
                        <IconComponent 
                          className="w-5 h-5 flex-shrink-0" 
                          style={{ color: isIncludedInAny ? '#10B981' : 'rgba(255, 255, 255, 0.6)' }}
                          strokeWidth={2} 
                        />

                        {/* Info */}
                        <div className="flex-1">
                          <div 
                            style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#FFFFFF',
                              letterSpacing: '-0.02em',
                              marginBottom: '2px'
                            }}
                          >
                            {feature.name}
                          </div>
                          {isIncludedInAny && (
                            <div 
                              style={{
                                fontSize: '12px',
                                color: '#10B981',
                                letterSpacing: '-0.01em',
                                fontWeight: 600
                              }}
                            >
                              Включено в шаблон
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <div 
                            style={{
                              fontSize: '16px',
                              fontWeight: 700,
                              color: isIncludedInAny ? '#10B981' : '#007AFF',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {isIncludedInAny ? 'Готово' : `+${feature.price.toLocaleString()} ₽`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={() => goToStep(1)}
                  className="flex-1 py-3.5 rounded-full transition-all active:scale-95"
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#007AFF',
                    background: 'rgba(0, 122, 255, 0.12)',
                    border: '1px solid rgba(0, 122, 255, 0.25)',
                    letterSpacing: '-0.015em'
                  }}
                >
                  Назад
                </button>
                <button
                  onClick={() => goToStep(3)}
                  disabled={!projectName.trim()}
                  className="flex-1 py-3.5 rounded-full transition-all active:scale-95 disabled:opacity-40"
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    border: '1px solid #007AFF',
                    letterSpacing: '-0.015em',
                    boxShadow: '0 8px 28px rgba(0, 122, 255, 0.45)'
                  }}
                >
                  Далее
                </button>
              </div>
            </section>
          )}

          {/* ===============================================
              STEP 3: REVIEW AND ORDER
              =============================================== */}
          {currentStep === 3 && selectedTemplate && (
            <section className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    color: '#FFFFFF',
                    marginBottom: '10px'
                  }}
                >
                  Шаг 3: Подтвердите
                </h2>
                <p 
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '-0.015em'
                  }}
                >
                  Проверьте конфигурацию
                </p>
              </div>

              {/* Summary card */}
              <div 
                className="rounded-[28px] p-7 backdrop-blur-3xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Gradient overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background: selectedTemplate.gradient,
                    filter: 'blur(60px)'
                  }}
                />

                <div className="relative z-10">
                  {/* Project name */}
                  <div className="text-center mb-7">
                    <h3 
                      style={{
                        fontSize: '26px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        letterSpacing: '-0.04em',
                        marginBottom: '8px'
                      }}
                    >
                      {projectName}
                    </h3>
                    <p 
                      style={{
                        fontSize: '15px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      На основе шаблона "{selectedTemplate.name}"
                    </p>
                  </div>
                  
                  {/* Price breakdown */}
                  <div className="space-y-3.5 pt-6 border-t border-white/15">
                    <div className="flex justify-between items-center">
                      <span 
                        style={{
                          fontSize: '16px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          letterSpacing: '-0.015em'
                        }}
                      >
                        Базовая стоимость
                      </span>
                      <span 
                        style={{
                          fontSize: '17px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {selectedTemplate.estimatedPrice.toLocaleString()} ₽
                      </span>
                    </div>
                    
                    {additionalFeaturesPrice > 0 && (
                      <div className="flex justify-between items-center">
                        <span 
                          style={{
                            fontSize: '16px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            letterSpacing: '-0.015em'
                          }}
                        >
                          Дополнительно
                        </span>
                        <span 
                          style={{
                            fontSize: '17px',
                            fontWeight: 600,
                            color: '#FFFFFF',
                            letterSpacing: '-0.02em'
                          }}
                        >
                          +{additionalFeaturesPrice.toLocaleString()} ₽
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-white/15">
                      <div className="flex justify-between items-center">
                        <span 
                          style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            letterSpacing: '-0.03em'
                          }}
                        >
                          Итого
                        </span>
                        <span 
                          style={{
                            fontSize: '32px',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.05em'
                          }}
                        >
                          {totalPrice.toLocaleString()} ₽
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline badge */}
                  <div 
                    className="mt-6 rounded-[16px] p-4 text-center"
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2.5">
                      <Clock className="w-4.5 h-4.5 text-[#10B981]" strokeWidth={2.5} />
                      <span 
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#10B981',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        Готовность: {selectedTemplate.developmentTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleOrderClick}
                  data-testid="button-order"
                  className="w-full py-4 rounded-full transition-all active:scale-95"
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    border: '1px solid #007AFF',
                    letterSpacing: '-0.025em',
                    boxShadow: '0 12px 48px rgba(0, 122, 255, 0.5)'
                  }}
                >
                  Заказать за {totalPrice.toLocaleString()} ₽
                </button>
                
                <button
                  onClick={() => goToStep(2)}
                  className="w-full py-3.5 rounded-full transition-all active:scale-95"
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#007AFF',
                    background: 'rgba(0, 122, 255, 0.12)',
                    border: '1px solid rgba(0, 122, 255, 0.25)',
                    letterSpacing: '-0.015em'
                  }}
                >
                  Изменить функции
                </button>
                
                <div className="text-center pt-3">
                  <p 
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Предоплата 35% • Остальное по готовности
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ===============================================
          STICKY SUMMARY BAR
          =============================================== */}
      {selectedTemplate && currentStep > 1 && (
        <div className="fixed bottom-20 left-0 right-0 px-6 z-40" data-testid="summary-bar">
          <div className="max-w-md mx-auto">
            <div 
              className="rounded-[20px] p-4 backdrop-blur-3xl"
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div 
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: '4px',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    Стоимость
                  </div>
                  <div 
                    style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.04em'
                    }}
                  >
                    {totalPrice.toLocaleString()} ₽
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: '4px',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    Функций
                  </div>
                  <div 
                    style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      letterSpacing: '-0.04em'
                    }}
                  >
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

// ===============================================
// PREMIUM COMPONENTS - Apple Style
// ===============================================

// Stat Badge - Hero stats
const StatBadge = memo(({ number, label }: { number: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div 
      style={{
        fontSize: '24px',
        fontWeight: 800,
        color: '#FFFFFF',
        letterSpacing: '-0.04em',
        marginBottom: '2px'
      }}
    >
      {number}
    </div>
    <div 
      style={{
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: '-0.01em'
      }}
    >
      {label}
    </div>
  </div>
));
StatBadge.displayName = 'StatBadge';

// Payment Card - Premium payment stage
const PaymentCard = memo(({ 
  number, 
  title, 
  subtitle,
  description,
  gradient,
  icon,
  badge
}: { 
  number: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}) => (
  <div 
    className="rounded-[20px] p-5 backdrop-blur-3xl relative overflow-hidden group"
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.04) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease'
    }}
  >
    {/* Hover glow */}
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{
        background: `radial-gradient(circle at 20% 30%, ${gradient.match(/rgba?\([^)]+\)/)?.[0] || 'rgba(0, 122, 255, 0.15)'} 0%, transparent 65%)`,
        filter: 'blur(30px)'
      }}
    />

    <div className="relative z-10 flex gap-4">
      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0"
        style={{
          background: gradient,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ color: 'white' }}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <div 
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                marginBottom: '4px'
              }}
            >
              {title}
            </div>
            <div 
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.01em'
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Number badge */}
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <span 
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              {number}
            </span>
          </div>
        </div>

        {/* Badge */}
        {badge && (
          <div 
            className="inline-flex items-center px-3 py-1 rounded-full mb-2.5"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <span style={{ color: '#10B981' }}>
              {badge}
            </span>
          </div>
        )}

        {/* Description */}
        <p 
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.55)',
            lineHeight: '1.5',
            letterSpacing: '-0.01em'
          }}
        >
          {description}
        </p>
      </div>
    </div>
  </div>
));
PaymentCard.displayName = 'PaymentCard';

export default memo(ConstructorPage);
