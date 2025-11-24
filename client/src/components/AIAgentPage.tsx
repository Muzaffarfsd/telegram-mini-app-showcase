import { memo, useCallback, useState, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  MessageSquare,
  Clock,
  TrendingUp,
  Users,
  BarChart
} from "lucide-react";

interface AIAgentPageProps {
  onNavigate: (path: string) => void;
}

const AIAgentPage = memo(({ onNavigate }: AIAgentPageProps) => {
  const [scrollY, setScrollY] = useState(0);
  
  const handleNavigateProcess = useCallback(() => {
    onNavigate('ai-process');
  }, [onNavigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] pb-24 overflow-hidden">
      <div className="max-w-md mx-auto">
        
        {/* Apple-Perfect Hero Section with Parallax */}
        <section className="relative px-6 pt-20 pb-20">
          {/* Dynamic gradient with parallax */}
          <div 
            className="absolute inset-0 opacity-35 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 100% 60% at 50% -10%, rgba(59, 130, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)',
              transform: `translateY(${scrollY * 0.2}px) scale(${1 + scrollY * 0.0003})`,
              transition: 'transform 0.1s ease-out'
            }}
          />

          {/* Animated particles */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
              transform: `translateY(${scrollY * 0.15}px)`,
            }}
          />
          
          <div className="relative z-10">
            {/* Premium Badge */}
            <div className="flex justify-center mb-6 scroll-fade-in">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                <span 
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.02em'
                  }}
                >
                  ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ
                </span>
              </div>
            </div>

            {/* Hero headline - Gradient text */}
            <h1 
              className="text-center mb-5 scroll-fade-in-delay-1"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(44px, 12vw, 56px)',
                fontWeight: 800,
                letterSpacing: '-0.055em',
                lineHeight: '0.95',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 50%, rgba(255, 255, 255, 0.6) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '20px'
              }}
            >
              ИИ агент.
              <br />
              Для вашего
              <br />
              бизнеса.
            </h1>
            
            {/* Subtitle with gradient accent */}
            <p 
              className="text-center mb-10 scroll-fade-in-delay-2"
              style={{
                fontSize: '20px',
                lineHeight: '1.4',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '-0.015em'
              }}
            >
              Автоматизация, которая работает 24/7
              <br />
              <span style={{ 
                background: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                и окупается за 6 месяцев
              </span>
            </p>
            
            {/* CTA with premium styling */}
            <div className="flex flex-col items-center gap-3 scroll-fade-in-delay-3">
              <button
                onClick={handleNavigateProcess}
                className="w-full py-4 bg-white text-black font-semibold rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                style={{
                  fontSize: '17px',
                  letterSpacing: '-0.02em',
                  boxShadow: '0 4px 24px rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
                data-testid="button-start-trial"
              >
                <span className="flex items-center justify-center gap-2">
                  Попробовать бесплатно
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              
              <p 
                className="text-center"
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.01em'
                }}
              >
                Бесплатно 7 дней · Без привязки карты
              </p>
            </div>
          </div>
        </section>

        {/* Stats Card - Premium glassmorphism */}
        <section className="px-6 py-8">
          <div 
            className="rounded-[32px] p-8 scroll-fade-in relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.15),
                0 20px 60px rgba(0, 0, 0, 0.4),
                0 2px 8px rgba(0, 0, 0, 0.25)
              `
            }}
          >
            {/* Gradient overlay */}
            <div 
              className="absolute top-0 left-0 right-0 h-32 opacity-40"
              style={{
                background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            <div className="relative z-10 space-y-8">
              <StatRowPremium 
                number="192%" 
                label="Средний ROI за первый год"
                gradient="linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)"
              />
              <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <StatRowPremium 
                number="24/7" 
                label="Работает без выходных"
                gradient="linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)"
              />
              <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <StatRowPremium 
                number="80%" 
                label="Запросов автоматически"
                gradient="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
              />
            </div>
          </div>
        </section>

        {/* Features - Premium cards */}
        <section className="px-6 py-8">
          <h2 
            className="text-center mb-8"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
              lineHeight: '1.1'
            }}
          >
            Возможности
          </h2>
          
          <div className="space-y-4">
            <FeatureCardPremium
              icon={<Zap className="w-6 h-6" />}
              title="Мгновенный запуск"
              description="Настройка за 10 минут. Интеграция с вашими системами."
              gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
            />
            
            <FeatureCardPremium
              icon={<Shield className="w-6 h-6" />}
              title="Безопасность"
              description="Полное шифрование данных. Соответствие GDPR."
              gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            />
            
            <FeatureCardPremium
              icon={<Globe className="w-6 h-6" />}
              title="150+ языков"
              description="Общается с клиентами на их родном языке."
              gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            />
            
            <FeatureCardPremium
              icon={<MessageSquare className="w-6 h-6" />}
              title="Умная аналитика"
              description="Понимает контекст и учится на каждом разговоре."
              gradient="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
            />
          </div>
        </section>

        {/* Benefits - Elevated list */}
        <section className="px-6 py-8">
          <h2 
            className="text-center mb-8"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
              lineHeight: '1.1'
            }}
          >
            Почему выбирают нас
          </h2>
          
          <div className="space-y-3">
            <BenefitRowPremium 
              icon={<Clock className="w-5 h-5" />}
              text="Работает 24/7 без отпусков и больничных" 
            />
            <BenefitRowPremium 
              icon={<Zap className="w-5 h-5" />}
              text="Обрабатывает запросы мгновенно — ответ меньше 2 секунд" 
            />
            <BenefitRowPremium 
              icon={<TrendingUp className="w-5 h-5" />}
              text="Окупается за 6-12 месяцев — 74% вернули инвестиции" 
            />
            <BenefitRowPremium 
              icon={<BarChart className="w-5 h-5" />}
              text="Интеграция с любыми системами — CRM, ERP, мессенджеры" 
            />
          </div>
        </section>

        {/* Final CTA - Premium with animation */}
        <section className="px-6 py-12">
          <div 
            className="rounded-[32px] p-8 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)'
            }}
          >
            {/* Animated gradient overlay */}
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                animation: 'pulse 4s ease-in-out infinite'
              }}
            />

            {/* Decorative blur circles */}
            <div 
              className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}
            />
            <div 
              className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}
            />
            
            <div className="relative z-10">
              <h2 
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  color: '#FFFFFF',
                  lineHeight: '1.1',
                  marginBottom: '16px'
                }}
              >
                Начните
                <br />
                сегодня
              </h2>
              
              <p 
                style={{
                  fontSize: '18px',
                  lineHeight: '1.5',
                  color: 'rgba(255, 255, 255, 0.75)',
                  letterSpacing: '-0.015em',
                  marginBottom: '32px'
                }}
              >
                Присоединяйтесь к 85% компаний,
                <br />
                которые уже внедрили ИИ
              </p>
              
              <button
                onClick={handleNavigateProcess}
                className="w-full py-4 bg-white text-black font-semibold rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group mb-4"
                style={{
                  fontSize: '17px',
                  letterSpacing: '-0.02em',
                  boxShadow: '0 8px 32px rgba(255, 255, 255, 0.25)'
                }}
                data-testid="button-start-cta"
              >
                <span className="flex items-center justify-center gap-2">
                  Запустить ИИ агента
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              
              <p 
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.01em'
                }}
              >
                7 дней бесплатно · Без кредитной карты
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
});

AIAgentPage.displayName = 'AIAgentPage';

// Premium Stat Row with gradient
const StatRowPremium = memo(({ number, label, gradient }: { number: string; label: string; gradient: string }) => (
  <div className="text-center">
    <div 
      style={{
        fontSize: '56px',
        fontWeight: 800,
        letterSpacing: '-0.05em',
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: '1',
        marginBottom: '12px'
      }}
    >
      {number}
    </div>
    <p 
      style={{
        fontSize: '16px',
        lineHeight: '1.4',
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: '-0.01em',
        fontWeight: 500
      }}
    >
      {label}
    </p>
  </div>
));
StatRowPremium.displayName = 'StatRowPremium';

// Premium Feature Card with gradient icon
const FeatureCardPremium = memo(({ 
  icon, 
  title, 
  description,
  gradient
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) => (
  <div 
    className="rounded-[24px] p-6 interactive-smooth active:scale-[0.98] relative overflow-hidden group"
    style={{
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}
  >
    {/* Gradient line accent */}
    <div 
      className="absolute top-0 left-0 right-0 h-1 opacity-70"
      style={{ background: gradient }}
    />

    <div className="flex items-start gap-4">
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-2xl"
        style={{
          width: '52px',
          height: '52px',
          background: gradient,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ color: 'white' }}>
          {icon}
        </div>
      </div>
      <div className="flex-1 pt-1">
        <h3 
          style={{
            fontSize: '19px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            marginBottom: '6px'
          }}
        >
          {title}
        </h3>
        <p 
          style={{
            fontSize: '15px',
            lineHeight: '1.5',
            color: 'rgba(255, 255, 255, 0.65)',
            letterSpacing: '-0.01em'
          }}
        >
          {description}
        </p>
      </div>
    </div>
  </div>
));
FeatureCardPremium.displayName = 'FeatureCardPremium';

// Premium Benefit Row with icon
const BenefitRowPremium = memo(({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div 
    className="flex items-center gap-4 py-4 px-5 rounded-[20px] interactive-smooth active:scale-[0.98] group"
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      transition: 'all 0.3s ease'
    }}
  >
    <div 
      className="flex-shrink-0 flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
      style={{
        width: '32px',
        height: '32px',
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.25) 0%, rgba(48, 209, 88, 0.25) 100%)',
        border: '1px solid rgba(52, 199, 89, 0.3)'
      }}
    >
      <div style={{ color: '#34C759' }}>
        {icon}
      </div>
    </div>
    <p 
      style={{
        fontSize: '16px',
        lineHeight: '1.5',
        color: 'rgba(255, 255, 255, 0.9)',
        letterSpacing: '-0.01em',
        fontWeight: 500
      }}
    >
      {text}
    </p>
  </div>
));
BenefitRowPremium.displayName = 'BenefitRowPremium';

export default AIAgentPage;
