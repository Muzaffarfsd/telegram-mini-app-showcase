import { memo, useState, useEffect } from "react";
import { 
  MessageSquare,
  Sparkles,
  Zap,
  BarChart3,
  Shield,
  CheckCircle2,
  ArrowRight,
  Bot,
  Users,
  Clock,
  TrendingUp,
  ShoppingBag,
  Coffee,
  Dumbbell,
  Palette,
  Smartphone,
  Star,
  Target,
  Rocket
} from "lucide-react";

interface ConstructorPageProps {
  onNavigate: (path: string) => void;
}

const ConstructorPage = memo(({ onNavigate }: ConstructorPageProps) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] pb-32 relative overflow-hidden">
      {/* Premium background gradient - Apple style */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(0, 113, 227, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(52, 199, 89, 0.08) 0%, transparent 50%)',
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: 0.6
        }}
      />

      <div className="max-w-md mx-auto px-6 relative z-10">
        
        {/* Premium Hero Section */}
        <section className="pt-20 pb-16">
          <div className="text-center space-y-6">
            
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full scroll-fade-in"
              style={{
                background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(48, 209, 88, 0.1) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '0.5px solid rgba(52, 199, 89, 0.4)',
                boxShadow: '0 8px 32px rgba(52, 199, 89, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#30D158' }} />
              <span 
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: '#30D158',
                  textTransform: 'uppercase'
                }}
              >
                Бесплатно 7 дней
              </span>
            </div>

            {/* Hero headline - Apple precision */}
            <h1 
              className="scroll-fade-in-delay-1"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(44px, 12vw, 56px)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: '1.05',
                color: '#FFFFFF',
                textShadow: '0 2px 40px rgba(255, 255, 255, 0.1)'
              }}
            >
              ИИ агент.
              <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #0071E3 0%, #00A3FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Работает сам.
              </span>
            </h1>
            
            {/* Subtitle - refined */}
            <p 
              className="scroll-fade-in-delay-2"
              style={{
                fontSize: '19px',
                lineHeight: '1.52',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.8)',
                letterSpacing: '-0.011em',
                maxWidth: '340px',
                margin: '0 auto'
              }}
            >
              Автоматизация для вашего Telegram-бизнеса. 
              Запуск за 10 минут.
            </p>
          </div>
        </section>

        {/* Premium Integration Flow */}
        <section className="mb-16 space-y-5">
          <PremiumStepCard
            number={1}
            icon={<Smartphone className="w-6 h-6" />}
            title="Готовое приложение"
            description="Полноценный магазин в Telegram с каталогом товаров, корзиной и приёмом платежей"
            accentColor="#007AFF"
          />

          <PremiumStepCard
            number={2}
            icon={<Bot className="w-6 h-6" />}
            title="Интеграция агента"
            description="Умный помощник встраивается в чат вашего приложения одной кнопкой"
            accentColor="#AF52DE"
          />

          <PremiumStepCard
            number={3}
            icon={<Rocket className="w-6 h-6" />}
            title="Автопилот продаж"
            description="Агент консультирует клиентов, оформляет заказы и принимает оплату 24/7"
            accentColor="#30D158"
          />
        </section>

        {/* Capabilities Section - Premium cards */}
        <section className="mb-16">
          <h2 
            className="mb-8 text-center"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#FFFFFF'
            }}
          >
            Возможности
          </h2>

          <div className="space-y-4">
            <PremiumCapability
              icon={<MessageSquare className="w-5 h-5" />}
              title="Мгновенные ответы"
              description="Консультирует клиентов по товарам, ценам и наличию без задержек"
              gradient="from-blue-500/20 to-cyan-500/20"
            />
            
            <PremiumCapability
              icon={<Target className="w-5 h-5" />}
              title="Умные рекомендации"
              description="Подбирает товары на основе интересов и истории покупок"
              gradient="from-purple-500/20 to-pink-500/20"
            />

            <PremiumCapability
              icon={<ShoppingBag className="w-5 h-5" />}
              title="Автоматические заказы"
              description="Собирает корзину, оформляет доставку и проводит оплату"
              gradient="from-green-500/20 to-emerald-500/20"
            />

            <PremiumCapability
              icon={<BarChart3 className="w-5 h-5" />}
              title="Аналитика поведения"
              description="Отслеживает интересы клиентов и показывает точки роста"
              gradient="from-orange-500/20 to-yellow-500/20"
            />
          </div>
        </section>

        {/* Results Card - Premium glassmorphism */}
        <section className="mb-16">
          <div 
            className="rounded-[32px] p-10 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
              backdropFilter: 'blur(60px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.4),
                0 1px 2px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }}
          >
            {/* Subtle gradient overlay */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(0, 113, 227, 0.2) 0%, transparent 50%)'
              }}
            />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '0.5px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Star className="w-3.5 h-3.5" style={{ color: '#FFD60A' }} />
                  <span 
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: 'rgba(255, 255, 255, 0.9)',
                      textTransform: 'uppercase'
                    }}
                  >
                    Результаты
                  </span>
                </div>
                
                <h3 
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: '#FFFFFF'
                  }}
                >
                  Через месяц
                </h3>
              </div>

              <div className="space-y-7">
                <PremiumStat
                  icon={<TrendingUp className="w-5 h-5" />}
                  value="+40%"
                  label="Рост конверсии"
                  accentColor="#30D158"
                />
                
                <div 
                  className="h-px"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)'
                  }}
                />
                
                <PremiumStat
                  icon={<Zap className="w-5 h-5" />}
                  value="80%"
                  label="Запросов автоматически"
                  accentColor="#007AFF"
                />
                
                <div 
                  className="h-px"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)'
                  }}
                />
                
                <PremiumStat
                  icon={<Clock className="w-5 h-5" />}
                  value="24/7"
                  label="Без выходных"
                  accentColor="#AF52DE"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Premium CTA */}
        <section className="mb-10">
          <button
            className="w-full py-4 rounded-full transition-all duration-300 active:scale-[0.98] relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
              boxShadow: `
                0 8px 24px rgba(0, 113, 227, 0.35),
                0 2px 8px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
              `
            }}
            data-testid="button-start-setup"
          >
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)'
              }}
            />
            
            <div className="relative flex items-center justify-center gap-2">
              <span 
                style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF'
                }}
              >
                Начать настройку
              </span>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <p 
            className="text-center mt-4"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.01em'
            }}
          >
            Первые 7 дней бесплатно • Без привязки карты
          </p>
        </section>

        {/* Trust indicators */}
        <section className="flex items-center justify-center gap-8 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>
              Безопасно
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>
              Без карты
            </span>
          </div>
        </section>

      </div>
    </div>
  );
});

ConstructorPage.displayName = 'ConstructorPage';

// Premium Step Card Component
const PremiumStepCard = memo<{
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
}>(({ number, icon, title, description, accentColor }) => (
  <div
    className="rounded-[24px] p-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.01]"
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)',
      backdropFilter: 'blur(30px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.08)
      `
    }}
  >
    {/* Accent glow on hover */}
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${accentColor}15 0%, transparent 60%)`
      }}
    />

    <div className="relative z-10 flex items-start gap-5">
      {/* Number badge */}
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-[14px] relative overflow-hidden"
        style={{
          width: '44px',
          height: '44px',
          background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 4px 16px ${accentColor}15`
        }}
      >
        <span 
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: accentColor
          }}
        >
          {number}
        </span>
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div style={{ color: accentColor }}>
            {icon}
          </div>
          <h3 
            style={{
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#FFFFFF'
            }}
          >
            {title}
          </h3>
        </div>
        
        <p 
          style={{
            fontSize: '15px',
            lineHeight: '1.5',
            color: 'rgba(255, 255, 255, 0.65)',
            letterSpacing: '-0.011em'
          }}
        >
          {description}
        </p>
      </div>
    </div>
  </div>
));

PremiumStepCard.displayName = 'PremiumStepCard';

// Premium Capability Card
const PremiumCapability = memo<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}>(({ icon, title, description, gradient }) => (
  <div
    className={`rounded-[20px] p-5 relative overflow-hidden group transition-all duration-200 hover:scale-[1.01]`}
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      backdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
    }}
  >
    <div className="flex items-start gap-4">
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-[12px] mt-0.5"
        style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.08) 100%)',
          border: '0.5px solid rgba(0, 122, 255, 0.2)',
          color: '#007AFF'
        }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <h4 
          className="mb-1.5"
          style={{
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#FFFFFF'
          }}
        >
          {title}
        </h4>
        <p 
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '-0.011em'
          }}
        >
          {description}
        </p>
      </div>
    </div>
  </div>
));

PremiumCapability.displayName = 'PremiumCapability';

// Premium Stat Component
const PremiumStat = memo<{
  icon: React.ReactNode;
  value: string;
  label: string;
  accentColor: string;
}>(({ icon, value, label, accentColor }) => (
  <div className="flex items-center gap-5">
    <div 
      className="flex-shrink-0 flex items-center justify-center rounded-[14px]"
      style={{
        width: '52px',
        height: '52px',
        background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
        border: `1px solid ${accentColor}30`,
        color: accentColor,
        boxShadow: `0 4px 16px ${accentColor}15`
      }}
    >
      {icon}
    </div>
    
    <div className="flex-1">
      <div 
        style={{
          fontSize: '34px',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: '#FFFFFF',
          marginBottom: '2px',
          lineHeight: 1
        }}
      >
        {value}
      </div>
      <div 
        style={{
          fontSize: '15px',
          color: 'rgba(255, 255, 255, 0.65)',
          letterSpacing: '-0.011em'
        }}
      >
        {label}
      </div>
    </div>
  </div>
));

PremiumStat.displayName = 'PremiumStat';

export default ConstructorPage;
