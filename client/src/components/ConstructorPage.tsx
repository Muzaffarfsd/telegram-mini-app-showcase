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
  { id: 'progress-tracking', name: 'Трекинг прогресса', price: 12000, category: 'Бронирование', icon: TrendingUp, included: false },
];

// Memoized Template Card Component
const TemplateCard = memo(({ template, onSelect }: { 
  template: typeof appTemplates[0], 
  onSelect: () => void 
}) => {
  const IconComponent = template.icon;
  
  return (
    <div
      className="relative group cursor-pointer"
      onClick={onSelect}
      data-testid={`template-${template.id}`}
    >
      {/* Hover Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#06b6d4]/20 via-[#8b5cf6]/20 to-[#10b981]/20 rounded-[1.75rem] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700" />
      
      {/* Glass Card */}
      <div className="relative bg-white/[0.06] backdrop-blur-[40px] rounded-3xl border border-white/[0.08] p-6 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.02] group-hover:border-white/20 group-hover:shadow-[0_20px_60px_-12px_rgba(6,182,212,0.15)]">
        {/* Popular Badge */}
        {template.popular && (
          <div className="absolute -top-3 -right-3 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full blur-md opacity-75" />
              <div className="relative bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-[11px] font-bold text-white tracking-wide uppercase">Хит</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Embossed Icon Container */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/30 to-[#10b981]/30 rounded-2xl blur-lg" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl flex items-center justify-center border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] backdrop-blur-sm">
              <IconComponent className="w-7 h-7 text-white/90" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-semibold text-white tracking-[-0.02em] mb-1">
              {template.name}
            </h3>
            <p className="text-[13px] text-white/65 leading-relaxed mb-3">
              {template.description}
            </p>
            
            {/* Price and Time */}
            <div className="flex items-center gap-4 text-[13px]">
              <div className="flex items-center gap-1.5">
                <div className="font-mono font-semibold text-transparent bg-gradient-to-r from-[#06b6d4] to-[#10b981] bg-clip-text">
                  {template.estimatedPrice.toLocaleString()} ₽
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-white/50">
                <Clock className="w-3.5 h-3.5" />
                <span>{template.developmentTime}</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-white/30 shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/60" />
        </div>
      </div>
    </div>
  );
});

TemplateCard.displayName = 'TemplateCard';

function ConstructorPage({ onNavigate }: ConstructorPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof appTemplates[0] | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  const [projectName, setProjectName] = useState("");
  const [activeCategory, setActiveCategory] = useState("Основные");

  const categories = useMemo(() => 
    Array.from(new Set(availableFeatures.map(f => f.category))),
    []
  );

  const filteredFeatures = useMemo(() => 
    availableFeatures.filter(f => f.category === activeCategory),
    [activeCategory]
  );

  const totalPrice = useMemo(() => {
    if (!selectedTemplate) return 0;
    
    const templateIncludedFeatures = selectedTemplate.features;
    const additionalCost = selectedFeatures
      .filter(f => {
        const feature = availableFeatures.find(af => af.id === f.id);
        const isIncluded = feature?.included;
        const isInTemplate = templateIncludedFeatures.includes(f.id);
        return !isIncluded && !isInTemplate;
      })
      .reduce((sum, f) => sum + f.price, 0);
    
    return selectedTemplate.estimatedPrice + additionalCost;
  }, [selectedTemplate, selectedFeatures]);

  const selectTemplate = useCallback((template: typeof appTemplates[0]) => {
    setSelectedTemplate(template);
    setProjectName(`${template.name} - Мой проект`);
    setCurrentStep(2);
  }, []);

  const toggleFeature = useCallback((feature: typeof availableFeatures[0]) => {
    setSelectedFeatures(prev => {
      const exists = prev.find(f => f.id === feature.id);
      if (exists) {
        return prev.filter(f => f.id !== feature.id);
      }
      
      trackFeatureAdded();
      
      return [...prev, {
        id: feature.id,
        name: feature.name,
        price: feature.price,
        category: feature.category
      }];
    });
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleOrderClick = useCallback(() => {
    if (!selectedTemplate) return;
    
    trackProjectCreation();
    
    onNavigate('order-success', {
      template: selectedTemplate,
      features: selectedFeatures,
      totalPrice,
      projectName
    });
  }, [selectedTemplate, selectedFeatures, totalPrice, projectName, onNavigate]);

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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0d12] to-[#0f0f14] text-white pb-32">
      <div className="max-w-md mx-auto px-4 py-8 space-y-8">
        
        {/* Payment Model Section - Premium Apple Keynote Style */}
        <section>
          <div className="relative overflow-hidden rounded-[2rem]">
            {/* Aurora Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/8 via-[#8b5cf6]/5 to-[#10b981]/8" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#06b6d4]/10 via-transparent to-transparent" />
            
            {/* Glass Panel */}
            <div className="relative bg-black/60 backdrop-blur-[60px] border border-white/[0.08] p-8">
              {/* Header with Gradient Text */}
              <div className="text-center mb-8">
                <h3 className="text-[28px] font-bold mb-3 leading-tight tracking-[-0.03em]">
                  <span className="text-transparent bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text">
                    Прозрачная оплата
                  </span>
                </h3>
                <p className="text-[15px] text-white/65 max-w-xs mx-auto leading-relaxed">
                  Платите поэтапно — минимальный риск, максимальный контроль
                </p>
              </div>

              {/* Payment Track with Luminous Stages */}
              <div className="relative mb-8">
                {/* Vertical Gradient Track */}
                <div className="absolute left-[27px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#10b981]/40 via-[#06b6d4]/40 to-[#10b981]/40" />
                
                <div className="space-y-6">
                  {/* Stage 1 - 35% Prepayment */}
                  <div className="relative group">
                    {/* Hover Glow */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#10b981]/15 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />
                    
                    {/* Glass Card */}
                    <div className="relative bg-white/[0.04] backdrop-blur-[40px] rounded-2xl border border-white/[0.06] p-6 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.01] group-hover:border-[#10b981]/20 group-hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.15)]">
                      <div className="flex items-start gap-5">
                        {/* Luminous Orb */}
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-[#10b981] rounded-2xl blur-xl opacity-40" />
                          <div className="relative w-[56px] h-[56px] bg-gradient-to-br from-[#10b981]/25 to-[#10b981]/10 rounded-2xl flex items-center justify-center border border-[#10b981]/30 shadow-[inset_0_1px_2px_rgba(16,185,129,0.2),0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-sm">
                            <Zap className="w-7 h-7 text-[#10b981]" />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-[17px] font-semibold text-white tracking-[-0.02em] mb-1">
                                35% предоплата
                              </div>
                              <div className="text-[13px] font-semibold text-[#10b981]">
                                Запуск разработки
                              </div>
                            </div>
                            {/* Step Number Orb */}
                            <div className="relative">
                              <div className="absolute inset-0 bg-[#10b981]/30 rounded-full blur-md" />
                              <div className="relative w-9 h-9 bg-[#10b981]/15 rounded-full flex items-center justify-center border border-[#10b981]/30 backdrop-blur-sm">
                                <span className="text-[13px] font-bold text-[#10b981]">1</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[13px] text-white/65 leading-relaxed">
                            Мы начинаем создавать ваше приложение сразу после внесения предоплаты
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stage 2 - 65% After Delivery */}
                  <div className="relative group">
                    {/* Hover Glow */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#06b6d4]/15 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />
                    
                    {/* Glass Card */}
                    <div className="relative bg-white/[0.04] backdrop-blur-[40px] rounded-2xl border border-white/[0.06] p-6 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.01] group-hover:border-[#06b6d4]/20 group-hover:shadow-[0_20px_40px_-12px_rgba(6,182,212,0.15)]">
                      <div className="flex items-start gap-5">
                        {/* Luminous Orb */}
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-[#06b6d4] rounded-2xl blur-xl opacity-40" />
                          <div className="relative w-[56px] h-[56px] bg-gradient-to-br from-[#06b6d4]/25 to-[#06b6d4]/10 rounded-2xl flex items-center justify-center border border-[#06b6d4]/30 shadow-[inset_0_1px_2px_rgba(6,182,212,0.2),0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-sm">
                            <CheckCircle className="w-7 h-7 text-[#06b6d4]" />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-[17px] font-semibold text-white tracking-[-0.02em] mb-1">
                                65% при получении
                              </div>
                              <div className="text-[13px] font-semibold text-[#06b6d4]">
                                Готовое приложение
                              </div>
                            </div>
                            {/* Step Number Orb */}
                            <div className="relative">
                              <div className="absolute inset-0 bg-[#10b981]/30 rounded-full blur-md" />
                              <div className="relative w-9 h-9 bg-[#10b981]/15 rounded-full flex items-center justify-center border border-[#10b981]/30 backdrop-blur-sm">
                                <span className="text-[13px] font-bold text-[#10b981]">2</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[13px] text-white/65 leading-relaxed">
                            Оплачиваете остаток только после тестирования и принятия работы
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stage 3 - Monthly Subscription */}
                  <div className="relative group">
                    {/* Hover Glow */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#10b981]/15 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />
                    
                    {/* Glass Card */}
                    <div className="relative bg-white/[0.04] backdrop-blur-[40px] rounded-2xl border border-white/[0.06] p-6 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.01] group-hover:border-[#10b981]/20 group-hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.15)]">
                      <div className="flex items-start gap-5">
                        {/* Luminous Orb */}
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-[#10b981] rounded-2xl blur-xl opacity-40" />
                          <div className="relative w-[56px] h-[56px] bg-gradient-to-br from-[#10b981]/25 to-[#10b981]/10 rounded-2xl flex items-center justify-center border border-[#10b981]/30 shadow-[inset_0_1px_2px_rgba(16,185,129,0.2),0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-sm">
                            <TrendingUp className="w-7 h-7 text-[#10b981]" />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-[17px] font-semibold text-white tracking-[-0.02em] mb-1">
                                Поддержка и развитие
                              </div>
                              <div className="text-[13px] font-semibold text-[#10b981]">
                                Ежемесячная подписка
                              </div>
                            </div>
                            {/* Step Number Orb */}
                            <div className="relative">
                              <div className="absolute inset-0 bg-[#10b981]/30 rounded-full blur-md" />
                              <div className="relative w-9 h-9 bg-[#10b981]/15 rounded-full flex items-center justify-center border border-[#10b981]/30 backdrop-blur-sm">
                                <span className="text-[13px] font-bold text-[#10b981]">3</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[13px] text-white/65 leading-relaxed">
                            Стабильная работа, обновления и поддержка вашего бизнеса 24/7
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Subscription Details */}
              <div className="relative mt-8 pt-8 border-t border-white/[0.08]">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center px-4 py-2 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full mb-4 backdrop-blur-sm">
                    <Rocket className="w-4 h-4 text-[#10b981] mr-2.5" />
                    <span className="text-[13px] text-[#10b981] font-semibold tracking-wide">Что входит в подписку</span>
                  </div>
                </div>
                
                {/* What's included - Grid Layout */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    'Хостинг и сервера',
                    'Поддержка 24/7',
                    'Обновления',
                    'Резервные копии'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="relative shrink-0 mt-0.5">
                        <div className="absolute inset-0 bg-[#10b981]/20 rounded-full blur-sm" />
                        <div className="relative w-5 h-5 bg-[#10b981]/15 rounded-full flex items-center justify-center border border-[#10b981]/25">
                          <Check className="w-3 h-3 text-[#10b981]" />
                        </div>
                      </div>
                      <span className="text-[13px] text-white/85 leading-tight">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Price Card - Apple Pricing Style */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/15 via-[#8b5cf6]/10 to-[#10b981]/15 rounded-3xl blur-2xl" />
                  <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-[50px] rounded-3xl border border-white/[0.12] p-8 text-center shadow-[0_20px_60px_-12px_rgba(6,182,212,0.2)]">
                    {/* Free Month Badge */}
                    <div className="inline-flex items-center justify-center px-4 py-2 bg-[#10b981]/15 border border-[#10b981]/30 rounded-full mb-5 backdrop-blur-sm">
                      <Gift className="w-4 h-4 text-[#10b981] mr-2" />
                      <span className="text-[13px] text-[#10b981] font-bold tracking-wide">Первый месяц в подарок</span>
                    </div>
                    
                    {/* Price with Tabular Numerals */}
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-[48px] font-bold text-transparent bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          5,999
                        </span>
                        <span className="text-[24px] font-semibold text-transparent bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text">₽</span>
                      </div>
                      <div className="text-[13px] text-white/50 mt-2">в месяц со второго месяца</div>
                    </div>

                    {/* Value proposition */}
                    <div className="text-[12px] text-white/40 tracking-wide">
                      Всё включено • Без скрытых платежей
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Steps */}
        <section>
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
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="ios-title3 mb-2 text-white">Шаг 1: Выберите тип</h2>
              <p className="ios-subheadline text-white/70">
                Готовые решения для разных сфер бизнеса
              </p>
            </div>

            <div className="space-y-4">
              {appTemplates.map((template, idx) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={templateHandlers[idx].handler}
                />
              ))}
            </div>

            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/5 to-transparent" />
              <div className="relative bg-white/[0.04] backdrop-blur-[30px] rounded-2xl border border-[#06b6d4]/20 p-5">
                <div className="flex items-start gap-3.5">
                  <Info className="w-5 h-5 text-[#06b6d4] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[15px] font-semibold text-[#06b6d4] mb-1">Подсказка</div>
                    <div className="text-[13px] text-white/65 leading-relaxed">
                      Выберите тип, наиболее близкий к вашему бизнесу. 
                      Позже можно будет добавить дополнительные функции.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Features Selection */}
        {currentStep === 2 && selectedTemplate && (
          <section className="space-y-6">
            <div className="text-center">
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
