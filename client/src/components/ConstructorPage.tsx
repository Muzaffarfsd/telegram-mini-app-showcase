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
  Info
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
      <div className="max-w-md mx-auto px-5 py-6 space-y-8">
        
        {/* ===============================================
            PAYMENT MODEL - Apple Premium Style
            =============================================== */}
        <section>
          <div 
            className="relative rounded-[28px] p-6 overflow-hidden backdrop-blur-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Header - Apple style */}
            <div className="text-center mb-7">
              <h3 
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  color: '#FFFFFF',
                  marginBottom: '10px'
                }}
              >
                Прозрачная оплата
              </h3>
              <p 
                style={{
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '-0.015em'
                }}
              >
                Платите поэтапно — минимальный риск
              </p>
            </div>

            {/* Payment Stages - Premium Cards */}
            <div className="space-y-4 mb-7">
              <PaymentStageCard
                number="1"
                title="35% предоплата"
                subtitle="Запуск разработки"
                description="Начинаем создавать приложение сразу после внесения предоплаты"
                gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                icon={<Zap className="w-6 h-6" strokeWidth={2} />}
              />
              
              <PaymentStageCard
                number="2"
                title="65% при получении"
                subtitle="Готовое приложение"
                description="Оплачиваете остаток только после тестирования и принятия работы"
                gradient="linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)"
                icon={<CheckCircle className="w-6 h-6" strokeWidth={2} />}
              />
              
              <PaymentStageCard
                number="3"
                title="Поддержка и развитие"
                subtitle="Ежемесячная подписка"
                description="Стабильная работа, обновления и поддержка вашего бизнеса 24/7"
                gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                icon={<TrendingUp className="w-6 h-6" strokeWidth={2} />}
              />
            </div>

            {/* Subscription Details - Apple style */}
            <div className="relative pt-6 border-t border-white/10">
              <div className="text-center mb-5">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Rocket className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={2.5} />
                  <span 
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#10B981',
                      letterSpacing: '0.01em'
                    }}
                  >
                    Что входит в подписку
                  </span>
                </div>
              </div>
              
              {/* Features grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {['Хостинг и сервера', 'Поддержка 24/7', 'Обновления', 'Резервные копии'].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <Check className="w-3 h-3 text-[#10B981]" strokeWidth={2.5} />
                    </div>
                    <span 
                      style={{
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.85)',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.4'
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price card - Apple premium */}
              <div 
                className="relative rounded-[20px] p-6 text-center backdrop-blur-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Gift className="w-3 h-3 text-[#10B981]" strokeWidth={2.5} />
                  <span 
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#10B981',
                      letterSpacing: '0.02em'
                    }}
                  >
                    Первый месяц в подарок
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span 
                      style={{
                        fontSize: '36px',
                        fontWeight: 800,
                        color: '#10B981',
                        letterSpacing: '-0.05em'
                      }}
                    >
                      5,999
                    </span>
                    <span 
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#10B981'
                      }}
                    >
                      ₽
                    </span>
                  </div>
                  <div 
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '4px'
                    }}
                  >
                    в месяц со второго месяца
                  </div>
                </div>

                <div 
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.45)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Всё включено • Без скрытых платежей
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===============================================
            PROGRESS STEPS - Apple minimalist
            =============================================== */}
        <section>
          <div 
            className="rounded-[24px] p-5 backdrop-blur-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            {[
              { num: 1, title: 'Выберите тип приложения', desc: 'Готовый шаблон под ваш бизнес' },
              { num: 2, title: 'Добавьте функции', desc: 'Расширьте возможности' },
              { num: 3, title: 'Оформите заказ', desc: 'Запустите разработку' }
            ].map((step, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-3 py-3 ${i < 2 ? 'border-b border-white/10' : ''}`}
              >
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: currentStep >= step.num ? '#007AFF' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {currentStep > step.num ? (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  ) : (
                    <span 
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: currentStep >= step.num ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      {step.num}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div 
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      letterSpacing: '-0.015em',
                      marginBottom: '2px'
                    }}
                  >
                    {step.title}
                  </div>
                  <div 
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.55)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
                {currentStep === step.num && (
                  <div className="w-2 h-2 bg-[#007AFF] rounded-full flex-shrink-0" />
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
            <div className="text-center">
              <h2 
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  color: '#FFFFFF',
                  marginBottom: '8px'
                }}
              >
                Шаг 1: Выберите тип
              </h2>
              <p 
                style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '-0.015em'
                }}
              >
                Готовые решения для разных сфер
              </p>
            </div>

            <div className="space-y-3">
              {appTemplates.map((template, idx) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className="group cursor-pointer active:scale-[0.98] transition-transform"
                    data-testid={`template-${template.id}`}
                  >
                    <div 
                      className="rounded-[20px] p-4 backdrop-blur-3xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'rgba(0, 122, 255, 0.15)',
                            border: '1px solid rgba(0, 122, 255, 0.3)'
                          }}
                        >
                          <IconComponent className="w-6 h-6 text-[#007AFF]" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              style={{
                                fontSize: '16px',
                                fontWeight: 700,
                                color: '#FFFFFF',
                                letterSpacing: '-0.025em'
                              }}
                            >
                              {template.name}
                            </span>
                            {template.popular && (
                              <div 
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  background: 'rgba(255, 149, 0, 0.15)',
                                  border: '1px solid rgba(255, 149, 0, 0.3)'
                                }}
                              >
                                <span 
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#FF9500',
                                    letterSpacing: '0.05em'
                                  }}
                                >
                                  Популярно
                                </span>
                              </div>
                            )}
                          </div>
                          <p 
                            style={{
                              fontSize: '13px',
                              color: 'rgba(255, 255, 255, 0.6)',
                              marginBottom: '4px',
                              letterSpacing: '-0.01em'
                            }}
                          >
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-white/40" strokeWidth={2} />
                            <span 
                              style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                letterSpacing: '-0.01em'
                              }}
                            >
                              {template.developmentTime}
                            </span>
                            <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
                            <span 
                              style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                letterSpacing: '-0.01em'
                              }}
                            >
                              от {template.estimatedPrice.toLocaleString()} ₽
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/25 flex-shrink-0" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info card - Apple style */}
            <div 
              className="rounded-[20px] p-4 backdrop-blur-3xl"
              style={{
                background: 'rgba(0, 122, 255, 0.08)',
                border: '1px solid rgba(0, 122, 255, 0.2)'
              }}
            >
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-[#007AFF] mt-0.5 flex-shrink-0" strokeWidth={2} />
                <div>
                  <div 
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#007AFF',
                      marginBottom: '4px',
                      letterSpacing: '-0.015em'
                    }}
                  >
                    Подсказка
                  </div>
                  <div 
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: '1.5',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Выберите тип, наиболее близкий к вашему бизнесу. 
                    Позже можно будет добавить дополнительные функции.
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
            <div className="text-center">
              <h2 
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  color: '#FFFFFF',
                  marginBottom: '8px'
                }}
              >
                Шаг 2: Настройте функции
              </h2>
              <p 
                style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '-0.015em'
                }}
              >
                Добавьте нужные возможности
              </p>
            </div>

            {/* Project Name - Apple style input */}
            <div 
              className="rounded-[20px] p-4 backdrop-blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <div 
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '8px',
                  letterSpacing: '-0.01em'
                }}
              >
                Название проекта
              </div>
              <input
                type="text"
                className="w-full bg-transparent text-white outline-none"
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
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

            {/* Category pills - Apple style */}
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="px-4 py-2 rounded-full whitespace-nowrap transition-all active:scale-95"
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      letterSpacing: '-0.015em',
                      background: activeCategory === category ? '#007AFF' : 'rgba(255, 255, 255, 0.08)',
                      color: activeCategory === category ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                      border: `1px solid ${activeCategory === category ? '#007AFF' : 'rgba(255, 255, 255, 0.12)'}`,
                      boxShadow: activeCategory === category ? '0 4px 16px rgba(0, 122, 255, 0.3)' : 'none'
                    }}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Features list - Apple premium */}
            <div 
              className="rounded-[24px] overflow-hidden backdrop-blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <div 
                className="px-4 py-3"
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <span 
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '0.05em',
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
                    className={`${!isIncludedInAny ? 'cursor-pointer active:scale-[0.99]' : ''} ${idx < filteredFeatures.length - 1 ? 'border-b border-white/8' : ''}`}
                    onClick={() => !isIncludedInAny && toggleFeature(feature)}
                    data-testid={`feature-${feature.id}`}
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div 
                        className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          background: (isSelected || isIncludedInAny) ? '#007AFF' : 'transparent',
                          borderColor: (isSelected || isIncludedInAny) ? '#007AFF' : 'rgba(255, 255, 255, 0.25)'
                        }}
                      >
                        {(isSelected || isIncludedInAny) && (
                          <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                        )}
                      </div>
                      <IconComponent className="w-5 h-5 text-white/60 flex-shrink-0" strokeWidth={2} />
                      <div className="flex-1">
                        <div 
                          style={{
                            fontSize: '15px',
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
                              letterSpacing: '-0.01em'
                            }}
                          >
                            Включено в шаблон
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div 
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: isIncludedInAny ? '#10B981' : '#007AFF',
                            letterSpacing: '-0.02em'
                          }}
                        >
                          {isIncludedInAny ? 'Включено' : `+${feature.price.toLocaleString()} ₽`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation - Apple buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => goToStep(1)}
                className="flex-1 py-3 rounded-full transition-all active:scale-95"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#007AFF',
                  background: 'rgba(0, 122, 255, 0.1)',
                  border: '1px solid rgba(0, 122, 255, 0.2)',
                  letterSpacing: '-0.015em'
                }}
              >
                Назад
              </button>
              <button
                onClick={() => goToStep(3)}
                disabled={!projectName.trim()}
                className="flex-1 py-3 rounded-full transition-all active:scale-95 disabled:opacity-40"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: '#007AFF',
                  border: '1px solid #007AFF',
                  letterSpacing: '-0.015em',
                  boxShadow: '0 6px 24px rgba(0, 122, 255, 0.4)'
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
            <div className="text-center">
              <h2 
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  color: '#FFFFFF',
                  marginBottom: '8px'
                }}
              >
                Шаг 3: Подтвердите заказ
              </h2>
              <p 
                style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '-0.015em'
                }}
              >
                Проверьте конфигурацию
              </p>
            </div>

            {/* Summary - Apple premium card */}
            <div 
              className="rounded-[24px] p-6 backdrop-blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div className="text-center mb-6">
                <h3 
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.035em',
                    marginBottom: '6px'
                  }}
                >
                  {projectName}
                </h3>
                <p 
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '-0.01em'
                  }}
                >
                  На основе шаблона "{selectedTemplate.name}"
                </p>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span 
                    style={{
                      fontSize: '15px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      letterSpacing: '-0.015em'
                    }}
                  >
                    Базовая стоимость
                  </span>
                  <span 
                    style={{
                      fontSize: '16px',
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
                        fontSize: '15px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: '-0.015em'
                      }}
                    >
                      Дополнительные функции
                    </span>
                    <span 
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      +{additionalFeaturesPrice.toLocaleString()} ₽
                    </span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span 
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        letterSpacing: '-0.025em'
                      }}
                    >
                      Итого
                    </span>
                    <span 
                      style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        color: '#007AFF',
                        letterSpacing: '-0.04em'
                      }}
                    >
                      {totalPrice.toLocaleString()} ₽
                    </span>
                  </div>
                </div>
              </div>
              
              <div 
                className="mt-4 rounded-[16px] p-3 text-center"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
                  <span 
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#10B981',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Готовность: {selectedTemplate.developmentTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions - Apple CTA */}
            <div className="space-y-3">
              <button
                onClick={handleOrderClick}
                data-testid="button-order"
                className="w-full py-4 rounded-full transition-all active:scale-95"
                style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: '#007AFF',
                  border: '1px solid #007AFF',
                  letterSpacing: '-0.02em',
                  boxShadow: '0 10px 40px rgba(0, 122, 255, 0.5)'
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
                  background: 'rgba(0, 122, 255, 0.1)',
                  border: '1px solid rgba(0, 122, 255, 0.2)',
                  letterSpacing: '-0.015em'
                }}
              >
                Изменить функции
              </button>
              
              <div className="text-center pt-2">
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

      {/* ===============================================
          STICKY SUMMARY BAR - Apple floating
          =============================================== */}
      {selectedTemplate && currentStep > 1 && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-40" data-testid="summary-bar">
          <div className="max-w-md mx-auto">
            <div 
              className="rounded-[20px] p-4 backdrop-blur-3xl"
              style={{
                background: 'rgba(0, 0, 0, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div 
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '3px',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Текущая стоимость
                  </div>
                  <div 
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#007AFF',
                      letterSpacing: '-0.035em'
                    }}
                  >
                    {totalPrice.toLocaleString()} ₽
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '3px',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Функций
                  </div>
                  <div 
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      letterSpacing: '-0.035em'
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

// Payment Stage Card - Premium Apple
const PaymentStageCard = memo(({ 
  number, 
  title, 
  subtitle,
  description,
  gradient,
  icon
}: { 
  number: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
}) => (
  <div 
    className="rounded-[20px] p-4 backdrop-blur-3xl"
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.12)'
    }}
  >
    <div className="flex gap-3.5">
      <div 
        className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
        style={{
          background: gradient,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ color: 'white' }}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div 
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                marginBottom: '3px'
              }}
            >
              {title}
            </div>
            <div 
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.01em'
              }}
            >
              {subtitle}
            </div>
          </div>
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <span 
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              {number}
            </span>
          </div>
        </div>
        <p 
          style={{
            fontSize: '13px',
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
PaymentStageCard.displayName = 'PaymentStageCard';

export default memo(ConstructorPage);
