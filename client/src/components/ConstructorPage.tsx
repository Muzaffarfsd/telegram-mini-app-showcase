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
  Shield,
  DollarSign
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
    name: 'Магазин',
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
    name: 'Фитнес',
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
    <div className="min-h-screen bg-[#000000] overflow-hidden pb-32">
      
      {/* ===============================================
          HERO - Powerful Opening
          =============================================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-5">
        {/* Parallax backgrounds */}
        <div 
          className="absolute inset-0 opacity-35"
          style={{
            background: 'radial-gradient(ellipse 150% 90% at 50% -10%, rgba(139, 92, 246, 0.35) 0%, rgba(59, 130, 246, 0.25) 50%, transparent 100%)',
            transform: `translateY(${scrollY * 0.4}px)`,
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 10% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 60%)',
            transform: `translateY(${scrollY * 0.25}px)`,
          }}
        />
        
        <div className="relative z-10 text-center w-full max-w-xs mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-7">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 10px 40px rgba(139, 92, 246, 0.3)'
              }}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#8B5CF6]" strokeWidth={2.5} />
              <span 
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase'
                }}
              >
                Ваш проект
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 
            className="mb-4"
            style={{ 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(44px, 16vw, 64px)',
              fontWeight: 800,
              letterSpacing: '-0.07em',
              lineHeight: '0.9',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 30%, rgba(255, 255, 255, 0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Создайте
            <br />
            приложение
          </h1>

          {/* Gradient line */}
          <div className="flex justify-center mb-5">
            <div 
              className="h-1.5 w-20 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.7), 0 0 40px rgba(52, 211, 153, 0.5)'
              }}
            />
          </div>
          
          {/* Subheadline */}
          <p 
            className="mb-12"
            style={{
              fontSize: '19px',
              lineHeight: '1.35',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.75)',
              letterSpacing: '-0.03em',
            }}
          >
            Готово за 3 недели
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            <StatBadge number="7" label="дней" />
            <StatBadge number="35%" label="аванс" />
            <StatBadge number="24/7" label="помощь" />
          </div>
        </div>

        {/* Scroll hint */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          style={{
            opacity: Math.max(0, 1 - scrollY / 300),
          }}
        >
          <div 
            className="w-1 h-10 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
              animation: 'bounce 2.5s ease-in-out infinite'
            }}
          />
        </div>
      </section>

      {/* ===============================================
          PAYMENT MODEL - Trust Building
          =============================================== */}
      <section className="py-20 px-5">
        <div className="max-w-xs mx-auto">
          {/* Title */}
          <h2 
            className="text-center mb-4"
            style={{
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: '#FFFFFF',
              lineHeight: '0.95'
            }}
          >
            Без рисков
          </h2>
          
          <p 
            className="text-center mb-14"
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.015em'
            }}
          >
            Платите поэтапно
          </p>

          {/* Payment stages */}
          <div className="space-y-4">
            <PaymentStage
              number="1"
              percentage="35%"
              title="Старт"
              description="Начинаем создавать"
              gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
              icon={<Zap className="w-6 h-6" strokeWidth={2} />}
            />
            
            <PaymentStage
              number="2"
              percentage="65%"
              title="Готово"
              description="Тестируете, принимаете"
              gradient="linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)"
              icon={<CheckCircle className="w-6 h-6" strokeWidth={2} />}
            />
            
            <PaymentStage
              number="3"
              percentage="5,999₽"
              title="Поддержка"
              description="Всё включено, каждый месяц"
              gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
              icon={<TrendingUp className="w-6 h-6" strokeWidth={2} />}
              badge="1 месяц в подарок"
            />
          </div>
        </div>
      </section>

      {/* ===============================================
          TEMPLATE SELECTION - Choose Your App
          =============================================== */}
      {!selectedTemplate && (
        <section className="py-20 px-5">
          <div className="max-w-xs mx-auto">
            <h2 
              className="text-center mb-4"
              style={{
                fontSize: '36px',
                fontWeight: 700,
                letterSpacing: '-0.055em',
                color: '#FFFFFF',
                lineHeight: '0.95'
              }}
            >
              Выберите тип
            </h2>
            
            <p 
              className="text-center mb-14"
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '-0.015em'
              }}
            >
              Готовый шаблон
            </p>

            <div className="space-y-4">
              {appTemplates.map((template, index) => {
                const IconComponent = template.icon;
                const gradients = [
                  'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                  'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                ];
                
                return (
                  <div
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className="group relative cursor-pointer active:scale-[0.98] transition-transform"
                    data-testid={`template-${template.id}`}
                  >
                    {/* Glow effect */}
                    <div 
                      className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
                      style={{
                        background: gradients[index]
                      }}
                    />
                    
                    {/* Card */}
                    <div 
                      className="relative p-5 rounded-[24px] backdrop-blur-3xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div 
                          className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: gradients[index],
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <IconComponent className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 
                              style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                letterSpacing: '-0.03em',
                                color: '#FFFFFF'
                              }}
                            >
                              {template.name}
                            </h3>
                            {template.popular && (
                              <div 
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)'
                                }}
                              >
                                <span 
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#F59E0B',
                                    letterSpacing: '0.05em'
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
                              color: 'rgba(255, 255, 255, 0.55)',
                              marginBottom: '4px',
                              letterSpacing: '-0.01em'
                            }}
                          >
                            {template.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <span 
                              style={{
                                fontSize: '13px',
                                color: 'rgba(255, 255, 255, 0.45)',
                                letterSpacing: '-0.01em'
                              }}
                            >
                              {template.developmentTime}
                            </span>
                            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
                            <span 
                              style={{
                                fontSize: '13px',
                                color: 'rgba(255, 255, 255, 0.45)',
                                letterSpacing: '-0.01em'
                              }}
                            >
                              от {(template.estimatedPrice / 1000).toFixed(0)}k ₽
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
          </div>
        </section>
      )}

      {/* ===============================================
          SUMMARY - Final Call
          =============================================== */}
      {selectedTemplate && (
        <section className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-6 pt-4" style={{
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.95) 70%, transparent 100%)',
          backdropFilter: 'blur(40px)'
        }}>
          <div className="max-w-xs mx-auto">
            {/* Price summary */}
            <div className="mb-4 text-center">
              <div className="mb-1">
                <span 
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Стоимость
                </span>
              </div>
              <div 
                style={{
                  fontSize: '38px',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {totalPrice.toLocaleString()} ₽
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleOrderClick}
              disabled={!selectedTemplate || !projectName.trim()}
              className="w-full group relative py-4 rounded-full font-semibold active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontSize: '17px',
                letterSpacing: '-0.02em',
                background: '#FFFFFF',
                color: '#000000',
                boxShadow: '0 16px 48px rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              data-testid="button-order"
            >
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                Оформить заказ
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5 duration-300" strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </section>
      )}

      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-12px); opacity: 0.2; }
        }
      `}</style>

    </div>
  );
}

// Stats Badge - Clean metrics
const StatBadge = memo(({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div 
      style={{
        fontSize: '24px',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: '#FFFFFF',
        marginBottom: '3px'
      }}
    >
      {number}
    </div>
    <div 
      style={{
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.45)',
        letterSpacing: '-0.01em'
      }}
    >
      {label}
    </div>
  </div>
));
StatBadge.displayName = 'StatBadge';

// Payment Stage - Premium cards
const PaymentStage = memo(({ 
  number, 
  percentage, 
  title, 
  description,
  gradient,
  icon,
  badge
}: { 
  number: string;
  percentage: string;
  title: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
  badge?: string;
}) => (
  <div className="relative group">
    {/* Glow */}
    <div 
      className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
      style={{ background: gradient }}
    />
    
    {/* Card */}
    <div 
      className="relative p-5 rounded-[24px] backdrop-blur-3xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <div className="flex items-start gap-4">
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.035em',
                  color: '#FFFFFF',
                  marginBottom: '2px'
                }}
              >
                {percentage}
              </h3>
              <p 
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '-0.01em'
                }}
              >
                {title}
              </p>
            </div>
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
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
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.48)',
              letterSpacing: '-0.01em',
              lineHeight: '1.4'
            }}
          >
            {description}
          </p>

          {badge && (
            <div className="mt-3">
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <Gift className="w-3 h-3 text-[#10B981]" strokeWidth={2.5} />
                <span 
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#10B981',
                    letterSpacing: '0.01em'
                  }}
                >
                  {badge}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
));
PaymentStage.displayName = 'PaymentStage';

export default memo(ConstructorPage);
