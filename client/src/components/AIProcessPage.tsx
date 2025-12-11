import { memo, useCallback, useState, useEffect } from "react";
import { 
  Check,
  MessageSquare,
  Smartphone,
  Rocket,
  Bot,
  Sparkles,
  ArrowRight,
  Zap
} from "lucide-react";

interface AIProcessPageProps {
  onNavigate: (path: string) => void;
}

const AIProcessPage = memo(({ onNavigate }: AIProcessPageProps) => {
  const [scrollY, setScrollY] = useState(0);
  
  const handleGetConsultation = useCallback(() => {
    // Open Telegram for consultation
    window.open('https://t.me/your_username', '_blank');
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] pb-24 overflow-hidden smooth-scroll-page" style={{ paddingTop: '140px' }}>
      <div className="max-w-md mx-auto">
        
        {/* Apple-Style Hero with Parallax */}
        <section className="relative px-6 pt-8 pb-16">
          {/* Dynamic gradient background */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 122, 255, 0.2) 0%, transparent 60%)',
              transform: `translateY(${scrollY * 0.3}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          <div className="relative z-10">
            {/* Badge */}
            <div className="flex justify-center mb-6 scroll-fade-in">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(0, 122, 255, 0.1)',
                  border: '1px solid rgba(0, 122, 255, 0.2)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <Sparkles className="w-4 h-4 text-[#007AFF]" />
                <span 
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#007AFF',
                    letterSpacing: '0.02em'
                  }}
                >
                  ИИ + TELEGRAM
                </span>
              </div>
            </div>

            {/* Hero headline - Apple SF Pro style */}
            <h1 
              className="text-center mb-5 scroll-fade-in-delay-1"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(40px, 11vw, 52px)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: '1.05',
                background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              ИИ агент
              <br />
              для вашего
              <br />
              приложения
            </h1>
            
            {/* Subtitle */}
            <p 
              className="text-center mb-3 scroll-fade-in-delay-2"
              style={{
                fontSize: '19px',
                lineHeight: '1.42',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.65)',
                letterSpacing: '-0.015em'
              }}
            >
              Подключите умного помощника
              <br />
              к вашему Telegram Mini App
            </p>

            {/* CTA Button */}
            <div className="flex justify-center mb-8 scroll-fade-in-delay-3">
              <a
                href="https://t.me/web4tgs"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold transition-all duration-300 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                  color: '#FFFFFF',
                  fontSize: '17px',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 8px 32px rgba(0, 122, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
                data-testid="button-consultation"
              >
                <MessageSquare className="w-5 h-5" />
                Получить консультацию
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center gap-8 mb-8 scroll-fade-in-delay-4">
              <StatBadge number="900M+" label="пользователей" />
              <StatBadge number="24/7" label="поддержка" />
              <StatBadge number="100%" label="автоматизация" />
            </div>
          </div>
        </section>

        {/* Process Steps - Premium Cards */}
        <section className="px-6 py-6 space-y-5">
          
          <ProcessStepPremium
            number="1"
            title="Разработка приложения"
            description="Создаём Telegram Mini App с современным дизайном и удобной навигацией"
            duration="7-14 дней"
            accentGradient="linear-gradient(135deg, #007AFF 0%, #0051D5 100%)"
            icon={<Smartphone className="w-6 h-6" />}
            features={[
              "Адаптивный дизайн",
              "Быстрая загрузка",
              "Полная интеграция с Telegram"
            ]}
          />

          <ProcessStepPremium
            number="2"
            title="Внедрение ИИ агента"
            description="Интегрируем умного ассистента с пониманием контекста вашего бизнеса"
            duration="3-5 дней"
            accentGradient="linear-gradient(135deg, #BF5AF2 0%, #8E2DE2 100%)"
            icon={<Bot className="w-6 h-6" />}
            features={[
              "Обучение на ваших данных",
              "150+ языков",
              "Умная аналитика"
            ]}
          />

          <ProcessStepPremium
            number="3"
            title="Настройка и обучение"
            description="Обучаем систему вашим процессам и оптимизируем работу"
            duration="2-3 дня"
            accentGradient="linear-gradient(135deg, #FF9F0A 0%, #FF6B00 100%)"
            icon={<Zap className="w-6 h-6" />}
            features={[
              "Тонкая настройка",
              "Тестирование сценариев",
              "Обучение команды"
            ]}
          />

          <ProcessStepPremium
            number="4"
            title="Запуск и поддержка"
            description="Мягкий запуск с мониторингом и бесплатной поддержкой"
            duration="7 дней"
            accentGradient="linear-gradient(135deg, #34C759 0%, #30D158 100%)"
            icon={<Rocket className="w-6 h-6" />}
            features={[
              "Постепенный запуск",
              "Мониторинг 24/7",
              "Месяц поддержки"
            ]}
          />

        </section>

        {/* Benefits - Glass Card */}
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
            Что вы
            <br />
            получите
          </h2>
          
          <div 
            className="rounded-[28px] p-8 space-y-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '0.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 20px 60px rgba(0, 0, 0, 0.4),
                0 2px 8px rgba(0, 0, 0, 0.25)
              `
            }}
          >
            <BenefitItemPremium text="Telegram Mini App с премиум дизайном" />
            <BenefitItemPremium text="ИИ агент с глубоким пониманием бизнеса" />
            <BenefitItemPremium text="Автоматизация поддержки клиентов" />
            <BenefitItemPremium text="Аналитика и инсайты в реальном времени" />
            <BenefitItemPremium text="Месяц бесплатной технической поддержки" />
            <BenefitItemPremium text="Регулярные обновления и улучшения" />
          </div>
        </section>

        {/* Why Telegram - Feature Grid */}
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
            Почему
            <br />
            Telegram?
          </h2>
          
          <div className="space-y-4">
            <WhyFeatureCard
              icon="🌍"
              title="900M+ активных пользователей"
              description="Ваши клиенты уже здесь. Не нужно их убеждать установить новое приложение."
            />
            <WhyFeatureCard
              icon="⚡️"
              title="Мгновенный доступ"
              description="Открывается прямо в Telegram. Без установки, без регистрации, без трения."
            />
            <WhyFeatureCard
              icon="🔔"
              title="Нативные уведомления"
              description="100% доставка сообщений. Ваши клиенты всегда в курсе важных событий."
            />
          </div>
        </section>

        {/* CTA Section - Premium */}
        <section className="px-6 py-12">
          <div 
            className="rounded-[28px] p-8 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(88, 86, 214, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 122, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 122, 255, 0.2)'
            }}
          >
            {/* Animated glow */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(0, 122, 255, 0.4) 0%, transparent 70%)',
                animation: 'pulse 3s ease-in-out infinite'
              }}
            />
            
            <div className="relative z-10">
              <h3 
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#FFFFFF',
                  marginBottom: '12px'
                }}
              >
                Готовы начать?
              </h3>
              
              <p 
                style={{
                  fontSize: '17px',
                  lineHeight: '1.47',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '24px'
                }}
              >
                Обсудим ваш проект и рассчитаем
                <br />
                точную стоимость за 15 минут
              </p>

              <button
                onClick={handleGetConsultation}
                className="w-full py-4 bg-white text-black font-semibold rounded-full transition-all duration-200 active:scale-[0.97] mb-3 group"
                style={{
                  fontSize: '17px',
                  letterSpacing: '-0.02em',
                  boxShadow: '0 4px 24px rgba(255, 255, 255, 0.25)',
                  border: 'none'
                }}
                data-testid="button-get-consultation"
              >
                <span className="flex items-center justify-center gap-2">
                  Получить консультацию
                  <ArrowRight className="w-5 h-5 transition-transform group-active:translate-x-1" />
                </span>
              </button>
              
              <p 
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.01em'
                }}
              >
                Бесплатная консультация · Расчёт стоимости · Без обязательств
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
});

AIProcessPage.displayName = 'AIProcessPage';

// Stat Badge Component
const StatBadge = memo(({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div 
      style={{
        fontSize: '24px',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: '#FFFFFF',
        lineHeight: '1',
        marginBottom: '4px'
      }}
    >
      {number}
    </div>
    <div 
      style={{
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: '0.02em',
        textTransform: 'uppercase'
      }}
    >
      {label}
    </div>
  </div>
));
StatBadge.displayName = 'StatBadge';

// Premium Process Step Component
const ProcessStepPremium = memo(({ 
  number,
  title,
  description,
  duration,
  accentGradient,
  icon,
  features
}: { 
  number: string;
  title: string;
  description: string;
  duration: string;
  accentGradient: string;
  icon: React.ReactNode;
  features: string[];
}) => (
  <div 
    className="rounded-[24px] p-6 relative overflow-hidden group interactive-smooth active:scale-[0.98]"
    style={{
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}
  >
    {/* Gradient accent line */}
    <div 
      className="absolute top-0 left-0 right-0 h-1 opacity-60"
      style={{
        background: accentGradient
      }}
    />

    {/* Icon Badge */}
    <div className="flex items-start gap-4 mb-4">
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-2xl"
        style={{
          width: '56px',
          height: '56px',
          background: accentGradient,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ color: 'white' }}>
          {icon}
        </div>
      </div>
      
      <div className="flex-1 pt-1">
        <div className="flex items-center justify-between mb-2">
          <h3 
            style={{
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#FFFFFF'
            }}
          >
            {title}
          </h3>
          <div 
            className="px-3 py-1.5 rounded-full shrink-0"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600
            }}
          >
            {duration}
          </div>
        </div>
        <p 
          style={{
            fontSize: '15px',
            lineHeight: '1.5',
            color: 'rgba(255, 255, 255, 0.65)',
            letterSpacing: '-0.01em',
            marginBottom: '16px'
          }}
        >
          {description}
        </p>

        {/* Features list */}
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: accentGradient }}
              />
              <span 
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '-0.01em'
                }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Large number background */}
    <div 
      className="absolute -bottom-4 -right-4 opacity-5 select-none pointer-events-none"
      style={{
        fontSize: '120px',
        fontWeight: 900,
        color: '#FFFFFF',
        lineHeight: '1'
      }}
    >
      {number}
    </div>
  </div>
));
ProcessStepPremium.displayName = 'ProcessStepPremium';

// Premium Benefit Item
const BenefitItemPremium = memo(({ text }: { text: string }) => (
  <div className="flex items-center gap-3 group">
    <div 
      className="flex-shrink-0 flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
      style={{
        width: '28px',
        height: '28px',
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.3) 0%, rgba(48, 209, 88, 0.3) 100%)',
        border: '1px solid rgba(52, 199, 89, 0.3)'
      }}
    >
      <Check className="w-4 h-4 text-[#34C759]" />
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
BenefitItemPremium.displayName = 'BenefitItemPremium';

// Why Feature Card
const WhyFeatureCard = memo(({ 
  icon, 
  title, 
  description 
}: { 
  icon: string; 
  title: string; 
  description: string;
}) => (
  <div 
    className="rounded-[20px] p-5 interactive-smooth active:scale-[0.98]"
    style={{
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(10px)',
      border: '0.5px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease'
    }}
  >
    <div className="flex gap-4">
      <div 
        style={{
          fontSize: '32px',
          lineHeight: '1',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h4 
          style={{
            fontSize: '17px',
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: '6px',
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h4>
        <p 
          style={{
            fontSize: '15px',
            lineHeight: '1.5',
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '-0.01em'
          }}
        >
          {description}
        </p>
      </div>
    </div>
  </div>
));
WhyFeatureCard.displayName = 'WhyFeatureCard';

export default AIProcessPage;
