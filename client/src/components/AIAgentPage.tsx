import { memo, useCallback, useState, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  MessageSquare,
  Clock
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
        
        {/* Apple-Perfect Hero Section */}
        <section className="relative px-6 pt-16 pb-20">
          {/* Subtle radial gradient - Apple style */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
              transform: `translateY(${scrollY * 0.2}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          <div className="relative z-10">
            {/* Hero headline - Apple SF Pro style */}
            <h1 
              className="text-center mb-4 scroll-fade-in-delay-1"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(40px, 11vw, 56px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: '1.05',
                color: '#FFFFFF'
              }}
            >
              ИИ агент.
              <br />
              Для вашего
              <br />
              бизнеса.
            </h1>
            
            {/* Subtitle - Apple weight */}
            <p 
              className="text-center mb-8 scroll-fade-in-delay-2"
              style={{
                fontSize: '19px',
                lineHeight: '1.42',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '-0.01em'
              }}
            >
              Автоматизация, которая работает 24/7
              <br />
              и окупается за 6 месяцев
            </p>
            
            {/* CTA - Apple blue */}
            <div className="flex flex-col items-center gap-3 scroll-fade-in-delay-3">
              <button
                onClick={handleNavigateProcess}
                className="button-apple w-full py-3.5 bg-[#0071E3] text-white font-semibold rounded-full transition-all duration-200 active:scale-[0.97]"
                style={{
                  fontSize: '17px',
                  letterSpacing: '-0.02em',
                  boxShadow: '0 2px 8px rgba(0, 113, 227, 0.3)'
                }}
                data-testid="button-start-trial"
              >
                Попробовать бесплатно
              </button>
              
              <p 
                className="text-center"
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '-0.01em'
                }}
              >
                Бесплатно 7 дней · Без привязки карты
              </p>
            </div>
          </div>
        </section>

        {/* Stats Card - Apple glassmorphism */}
        <section className="px-6 py-8">
          <div 
            className="glass-apple rounded-[28px] p-8 scroll-fade-in"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.08),
                0 8px 32px rgba(0, 0, 0, 0.35),
                0 1px 2px rgba(0, 0, 0, 0.2)
              `
            }}
          >
            <div className="space-y-8">
              <StatRow number="192%" label="Средний ROI за первый год" />
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <StatRow number="24/7" label="Работает без выходных" />
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <StatRow number="80%" label="Запросов автоматически" />
            </div>
          </div>
        </section>

        {/* Features - iOS cards */}
        <section className="px-6 py-8">
          <h2 
            className="text-center mb-6"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}
          >
            Возможности
          </h2>
          
          <div className="space-y-3">
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Мгновенный запуск"
              description="Настройка за 10 минут. Интеграция с вашими системами."
              accentColor="rgba(0, 122, 255, 0.15)"
              iconColor="#007AFF"
            />
            
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Безопасность"
              description="Полное шифрование данных. Соответствие GDPR."
              accentColor="rgba(52, 199, 89, 0.15)"
              iconColor="#34C759"
            />
            
            <FeatureCard
              icon={<Globe className="w-5 h-5" />}
              title="150+ языков"
              description="Общается с клиентами на их родном языке."
              accentColor="rgba(255, 159, 10, 0.15)"
              iconColor="#FF9F0A"
            />
            
            <FeatureCard
              icon={<MessageSquare className="w-5 h-5" />}
              title="Умная аналитика"
              description="Понимает контекст и учится на каждом разговоре."
              accentColor="rgba(191, 90, 242, 0.15)"
              iconColor="#BF5AF2"
            />
          </div>
        </section>

        {/* Benefits - Apple list */}
        <section className="px-6 py-8">
          <h2 
            className="text-center mb-6"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}
          >
            Почему выбирают нас
          </h2>
          
          <div className="space-y-2">
            <BenefitRow text="Работает 24/7 без отпусков и больничных" />
            <BenefitRow text="Обрабатывает запросы мгновенно — ответ меньше 2 секунд" />
            <BenefitRow text="Окупается за 6-12 месяцев — 74% вернули инвестиции" />
            <BenefitRow text="Интеграция с любыми системами — CRM, ERP, мессенджеры" />
          </div>
        </section>

        {/* Final CTA - Apple style */}
        <section className="px-6 py-12">
          <div className="text-center">
            <h2 
              className="mb-3"
              style={{
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                lineHeight: '1.1'
              }}
            >
              Начните
              <br />
              сегодня
            </h2>
            
            <p 
              className="mb-8"
              style={{
                fontSize: '17px',
                lineHeight: '1.47',
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '-0.01em'
              }}
            >
              Присоединяйтесь к 85% компаний,
              <br />
              которые уже внедрили ИИ
            </p>
            
            <button
              onClick={handleNavigateProcess}
              className="button-apple w-full py-3.5 bg-[#0071E3] text-white font-semibold rounded-full transition-all duration-200 active:scale-[0.97]"
              style={{
                fontSize: '17px',
                letterSpacing: '-0.02em',
                boxShadow: '0 2px 8px rgba(0, 113, 227, 0.3)'
              }}
              data-testid="button-start-cta"
            >
              Запустить ИИ агента
            </button>
            
            <p 
              className="mt-4"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '-0.01em'
              }}
            >
              7 дней бесплатно · Без кредитной карты
            </p>
          </div>
        </section>

      </div>
    </div>
  );
});

AIAgentPage.displayName = 'AIAgentPage';

// Stat Row Component - Apple numbers
const StatRow = memo(({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div 
      style={{
        fontSize: '48px',
        fontWeight: 700,
        letterSpacing: '-0.04em',
        color: '#FFFFFF',
        lineHeight: '1',
        marginBottom: '8px'
      }}
    >
      {number}
    </div>
    <p 
      style={{
        fontSize: '15px',
        lineHeight: '1.4',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: '-0.01em'
      }}
    >
      {label}
    </p>
  </div>
));
StatRow.displayName = 'StatRow';

// Feature Card - iOS style
const FeatureCard = memo(({ 
  icon, 
  title, 
  description,
  accentColor,
  iconColor
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  accentColor: string;
  iconColor: string;
}) => (
  <div 
    className="interactive-smooth rounded-[20px] p-5 active:scale-[0.98]"
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.2s cubic-bezier(0.42, 0, 0.58, 1)'
    }}
  >
    <div className="flex items-start gap-4">
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: '40px',
          height: '40px',
          background: accentColor,
          color: iconColor
        }}
      >
        {icon}
      </div>
      <div className="flex-1 pt-1">
        <h3 
          style={{
            fontSize: '17px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            marginBottom: '2px'
          }}
        >
          {title}
        </h3>
        <p 
          style={{
            fontSize: '15px',
            lineHeight: '1.4',
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
FeatureCard.displayName = 'FeatureCard';

// Benefit Row - Simple Apple list
const BenefitRow = memo(({ text }: { text: string }) => (
  <div 
    className="flex items-center gap-3 py-3 px-4 rounded-[16px] interactive-smooth active:scale-[0.98]"
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '0.5px solid rgba(255, 255, 255, 0.08)'
    }}
  >
    <div 
      className="flex-shrink-0 flex items-center justify-center rounded-full"
      style={{
        width: '24px',
        height: '24px',
        background: 'rgba(52, 199, 89, 0.2)',
        color: '#34C759'
      }}
    >
      <Check className="w-4 h-4" />
    </div>
    <p 
      style={{
        fontSize: '15px',
        lineHeight: '1.4',
        color: 'rgba(255, 255, 255, 0.85)',
        letterSpacing: '-0.01em'
      }}
    >
      {text}
    </p>
  </div>
));
BenefitRow.displayName = 'BenefitRow';

export default AIAgentPage;
