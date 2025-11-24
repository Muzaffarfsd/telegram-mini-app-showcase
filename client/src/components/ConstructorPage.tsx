import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { trackProjectCreation, trackFeatureAdded } from "@/hooks/useGamification";
import { 
  ShoppingCart,
  Check,
  Zap,
  Sparkles,
  CheckCircle,
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
  Shield,
  ChevronRight,
  TrendingUp,
  Gift
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

// Professional monochrome templates - solid business style
const appTemplates = [
  {
    id: 'ecommerce-basic',
    name: 'Интернет-магазин',
    icon: ShoppingCart,
    description: 'Каталог, корзина, оплата',
    features: ['catalog', 'cart', 'auth', 'payments'],
    estimatedPrice: 45000,
    developmentTime: '7-10 дней',
    popular: true
  },
  {
    id: 'restaurant',
    name: 'Ресторан',
    icon: Coffee,
    description: 'Меню, заказы, бронирование',
    features: ['catalog', 'cart', 'auth', 'booking-system'],
    estimatedPrice: 55000,
    developmentTime: '10-12 дней',
    popular: false
  },
  {
    id: 'fitness-center',
    name: 'Фитнес-клуб',
    icon: Dumbbell,
    description: 'Тренировки, абонементы',
    features: ['booking-system', 'auth', 'subscriptions', 'progress-tracking'],
    estimatedPrice: 65000,
    developmentTime: '12-15 дней',
    popular: false
  },
  {
    id: 'services',
    name: 'Услуги',
    icon: Settings,
    description: 'Бронирование, платежи',
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
    <div className="min-h-screen bg-[#000000] pb-32 relative overflow-hidden">
      {/* Subtle professional gradient background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(0, 113, 227, 0.08) 0%, transparent 50%)',
          opacity: 0.6
        }}
      />

      <div className="max-w-md mx-auto px-6 relative z-10">
        
        {/* ===============================================
            HERO - Professional Business Style
            =============================================== */}
        <section className="pt-20 pb-16">
          <div className="text-center space-y-6">
            
            {/* Professional badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(0, 122, 255, 0.10)',
                border: '0.5px solid rgba(0, 122, 255, 0.3)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.12)'
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#007AFF' }} />
              <span 
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: '#007AFF',
                  textTransform: 'uppercase'
                }}
              >
                Конструктор приложений
              </span>
            </div>

            {/* Hero headline - professional sizing */}
            <h1 
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(36px, 10vw, 44px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
                color: '#FFFFFF',
                marginBottom: '16px'
              }}
            >
              Выберите тип приложения
            </h1>
            
            {/* Subtitle */}
            <p 
              style={{
                fontSize: '17px',
                lineHeight: '1.47',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '-0.011em',
                maxWidth: '320px',
                margin: '0 auto'
              }}
            >
              Готовые решения для вашего бизнеса
              <br />
              с поэтапной оплатой
            </p>
          </div>
        </section>

        {/* ===============================================
            PROGRESS STEPS
            =============================================== */}
        <section className="mb-8">
          <div 
            className="rounded-[20px] p-5 backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            {[
              { num: 1, title: 'Выберите тип', desc: 'Готовый шаблон' },
              { num: 2, title: 'Добавьте функции', desc: 'Расширьте возможности' },
              { num: 3, title: 'Оформите заказ', desc: 'Запустите разработку' }
            ].map((step, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-4 py-3.5 ${i < 2 ? 'border-b border-white/8' : ''}`}
              >
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                  style={{
                    background: currentStep >= step.num 
                      ? 'rgba(0, 122, 255, 1)'
                      : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: currentStep >= step.num 
                      ? '0 4px 12px rgba(0, 122, 255, 0.3)'
                      : 'none'
                  }}
                >
                  {currentStep > step.num ? (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  ) : (
                    <span 
                      style={{
                        fontSize: '13px',
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
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      letterSpacing: '-0.01em',
                      marginBottom: '2px'
                    }}
                  >
                    {step.title}
                  </div>
                  <div 
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      letterSpacing: '-0.005em'
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
                {currentStep === step.num && (
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background: '#007AFF',
                      boxShadow: '0 0 8px rgba(0, 122, 255, 0.6)'
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
          <section className="space-y-4">
            {appTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <div
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className="group cursor-pointer active:scale-[0.99] transition-transform duration-200"
                  data-testid={`template-${template.id}`}
                >
                  <div 
                    className="rounded-[18px] p-5 backdrop-blur-xl transition-all duration-500"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '0.5px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div 
                        className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-all duration-500"
                        style={{
                          background: 'rgba(0, 122, 255, 0.1)',
                          border: '0.5px solid rgba(0, 122, 255, 0.2)'
                        }}
                      >
                        <IconComponent 
                          className="w-6 h-6" 
                          style={{ color: '#007AFF' }}
                          strokeWidth={2}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 
                            style={{
                              fontSize: '18px',
                              fontWeight: 700,
                              color: '#FFFFFF',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {template.name}
                          </h3>
                          {template.popular && (
                            <div 
                              className="px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{
                                background: 'rgba(52, 199, 89, 0.15)',
                                border: '0.5px solid rgba(52, 199, 89, 0.3)'
                              }}
                            >
                              <span 
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  color: '#30D158',
                                  letterSpacing: '0.02em',
                                  textTransform: 'uppercase'
                                }}
                              >
                                ХИТ
                              </span>
                            </div>
                          )}
                        </div>

                        <p 
                          style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            letterSpacing: '-0.01em',
                            marginBottom: '12px'
                          }}
                        >
                          {template.description}
                        </p>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                            <span 
                              style={{
                                fontSize: '13px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                letterSpacing: '-0.005em'
                              }}
                            >
                              {template.developmentTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span 
                            style={{
                              fontSize: '22px',
                              fontWeight: 700,
                              color: '#FFFFFF',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {template.estimatedPrice.toLocaleString('ru-RU')} ₽
                          </span>
                          <ArrowRight 
                            className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                            style={{ color: '#007AFF' }} 
                            strokeWidth={2.5}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ===============================================
            STEP 2: FEATURE CUSTOMIZATION
            =============================================== */}
        {currentStep === 2 && selectedTemplate && (
          <section className="space-y-5">
            {/* Selected template summary */}
            <div 
              className="rounded-[18px] p-5 backdrop-blur-xl"
              style={{
                background: 'rgba(0, 122, 255, 0.08)',
                border: '0.5px solid rgba(0, 122, 255, 0.2)',
                boxShadow: '0 4px 24px rgba(0, 122, 255, 0.12)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {selectedTemplate.name}
                </h3>
                <button
                  onClick={() => goToStep(1)}
                  className="text-sm transition-opacity duration-200 active:opacity-60"
                  style={{ color: '#007AFF', fontWeight: 600 }}
                  data-testid="button-change-template"
                >
                  Изменить
                </button>
              </div>
              <p 
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  letterSpacing: '-0.01em'
                }}
              >
                {selectedTemplate.description}
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 flex-shrink-0"
                  style={{
                    background: activeCategory === cat 
                      ? 'rgba(0, 122, 255, 0.15)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `0.5px solid ${activeCategory === cat ? 'rgba(0, 122, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: activeCategory === cat ? '#007AFF' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    fontWeight: activeCategory === cat ? 600 : 500
                  }}
                  data-testid={`category-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-2.5">
              {filteredFeatures.map((feature) => {
                const IconComponent = feature.icon;
                const isIncluded = feature.included;
                const isInTemplate = selectedTemplate?.features.includes(feature.id);
                const isSelected = selectedFeatures.find(f => f.id === feature.id);
                const isDisabled = isIncluded || isInTemplate;

                return (
                  <div
                    key={feature.id}
                    onClick={() => !isDisabled && toggleFeature(feature)}
                    className={`rounded-[16px] p-4 backdrop-blur-xl transition-all duration-300 ${
                      isDisabled ? 'opacity-50' : 'cursor-pointer active:scale-[0.99]'
                    }`}
                    style={{
                      background: isSelected 
                        ? 'rgba(0, 122, 255, 0.1)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `0.5px solid ${
                        isSelected ? 'rgba(0, 122, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                      }`,
                      boxShadow: isSelected 
                        ? '0 4px 16px rgba(0, 122, 255, 0.15)' 
                        : '0 2px 12px rgba(0, 0, 0, 0.2)'
                    }}
                    data-testid={`feature-${feature.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '0.5px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <IconComponent 
                          className="w-5 h-5" 
                          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          strokeWidth={2}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span 
                            style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#FFFFFF',
                              letterSpacing: '-0.01em'
                            }}
                          >
                            {feature.name}
                          </span>
                          {isInTemplate && (
                            <span 
                              className="px-2 py-0.5 rounded-full"
                              style={{
                                background: 'rgba(52, 199, 89, 0.15)',
                                border: '0.5px solid rgba(52, 199, 89, 0.3)',
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#30D158',
                                letterSpacing: '0.02em',
                                textTransform: 'uppercase'
                              }}
                            >
                              В тарифе
                            </span>
                          )}
                        </div>
                        <span 
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: isDisabled ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {feature.price.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>

                      {!isDisabled && (
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                          style={{
                            background: isSelected ? '#007AFF' : 'rgba(255, 255, 255, 0.1)',
                            border: `1.5px solid ${isSelected ? '#007AFF' : 'rgba(255, 255, 255, 0.2)'}`
                          }}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue button */}
            <button
              onClick={() => setCurrentStep(3)}
              className="w-full py-4 rounded-[16px] transition-all duration-300 active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)',
                fontSize: '17px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.01em'
              }}
              data-testid="button-continue-to-checkout"
            >
              Продолжить
            </button>
          </section>
        )}

        {/* ===============================================
            STEP 3: CHECKOUT
            =============================================== */}
        {currentStep === 3 && selectedTemplate && (
          <section className="space-y-5">
            {/* Order summary */}
            <div 
              className="rounded-[18px] p-5 backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '0.5px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <h3 
                style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  marginBottom: '16px'
                }}
              >
                Ваш заказ
              </h3>

              <div className="space-y-3">
                {/* Base template */}
                <div className="flex items-center justify-between py-2 border-b border-white/8">
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {selectedTemplate.name}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                    {selectedTemplate.estimatedPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                {/* Additional features */}
                {selectedFeatures
                  .filter(f => {
                    const feature = availableFeatures.find(af => af.id === f.id);
                    const isIncluded = feature?.included;
                    const isInTemplate = selectedTemplate.features.includes(f.id);
                    return !isIncluded && !isInTemplate;
                  })
                  .map((f) => (
                    <div key={f.id} className="flex items-center justify-between py-2">
                      <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {f.name}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
                        {f.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  ))}

                {/* Total */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/15">
                  <span style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
                    Итого
                  </span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    {totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Payment info */}
            <div 
              className="rounded-[18px] p-5 backdrop-blur-xl"
              style={{
                background: 'rgba(52, 199, 89, 0.08)',
                border: '0.5px solid rgba(52, 199, 89, 0.2)',
                boxShadow: '0 4px 24px rgba(52, 199, 89, 0.12)'
              }}
            >
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#30D158' }} />
                <div>
                  <h4 
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      letterSpacing: '-0.01em',
                      marginBottom: '6px'
                    }}
                  >
                    Поэтапная оплата
                  </h4>
                  <p 
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      letterSpacing: '-0.01em',
                      lineHeight: '1.4'
                    }}
                  >
                    35% аванс → 65% после принятия работы
                  </p>
                </div>
              </div>
            </div>

            {/* Payment schedule - Professional monochrome cards */}
            <div 
              className="rounded-[18px] p-5 backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <h3 
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  marginBottom: '16px'
                }}
              >
                График оплаты
              </h3>

              <div className="space-y-3">
                <PaymentCard
                  number="1"
                  title="35% Старт"
                  subtitle="Начинаем создавать"
                  description="Мы начинаем работать сразу после внесения предоплаты"
                  gradient="linear-gradient(135deg, #30D158 0%, #248A3D 100%)"
                  icon={<Zap className="w-5 h-5" strokeWidth={2.5} />}
                />
                
                <PaymentCard
                  number="2"
                  title="65% Готово"
                  subtitle="Тестируете, принимаете"
                  description="Оплачиваете после тестирования и принятия работы"
                  gradient="linear-gradient(135deg, #007AFF 0%, #0051D5 100%)"
                  icon={<CheckCircle className="w-5 h-5" strokeWidth={2.5} />}
                />
                
                <PaymentCard
                  number="3"
                  title="5,999₽ / мес"
                  subtitle="Всё включено"
                  description="Хостинг, поддержка, обновления и резервные копии"
                  gradient="linear-gradient(135deg, #5E5CE6 0%, #3634A3 100%)"
                  icon={<TrendingUp className="w-5 h-5" strokeWidth={2.5} />}
                  badge={
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-3 h-3" strokeWidth={2.5} />
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em' }}>
                        Первый месяц бесплатно
                      </span>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleOrderClick}
                className="w-full py-4 rounded-[16px] transition-all duration-300 active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                  boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.01em'
                }}
                data-testid="button-submit-order"
              >
                Оформить заказ
              </button>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-3.5 rounded-[14px] transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.8)',
                  letterSpacing: '-0.01em'
                }}
                data-testid="button-back-to-features"
              >
                Назад
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Bottom sticky summary (only on step 2 and 3) */}
      {currentStep >= 2 && selectedTemplate && (
        <div 
          className="fixed bottom-0 left-0 right-0 backdrop-blur-3xl z-50 safe-area-inset-bottom"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div 
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }}
                >
                  Общая стоимость
                </div>
                <div 
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </div>
              </div>
              {currentStep === 2 && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-[14px] transition-all duration-300 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em',
                    boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)'
                  }}
                  data-testid="button-proceed-checkout"
                >
                  Далее
                  <ChevronRight className="w-4 h-4 inline-block ml-1" strokeWidth={3} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// PaymentCard component - Professional monochrome style
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
    className="rounded-[16px] p-4 backdrop-blur-xl relative overflow-hidden group"
    style={{
      background: 'rgba(255, 255, 255, 0.04)',
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease'
    }}
  >
    <div className="relative z-10 flex gap-3.5">
      {/* Icon */}
      <div 
        className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
        style={{
          background: gradient,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ color: 'white' }}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div 
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
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

          {/* Number badge */}
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '0.5px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <span 
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              {number}
            </span>
          </div>
        </div>

        {/* Badge */}
        {badge && (
          <div 
            className="inline-flex items-center px-2.5 py-1 rounded-full mb-2"
            style={{
              background: 'rgba(52, 199, 89, 0.12)',
              border: '0.5px solid rgba(52, 199, 89, 0.2)'
            }}
          >
            <div style={{ color: '#30D158', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {badge}
            </div>
          </div>
        )}

        {/* Description */}
        <p 
          style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.65)',
            letterSpacing: '-0.01em',
            lineHeight: '1.4'
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
