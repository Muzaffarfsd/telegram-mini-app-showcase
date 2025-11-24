import { memo, useCallback, useState, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  Brain,
  TrendingUp,
  Clock,
  BarChart,
  Users
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
      
      {/* HERO SECTION - Full height dramatic intro */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6">
        {/* Multi-layer parallax background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 80%)',
            transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0005})`,
          }}
        />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.25) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.25) 0%, transparent 50%)',
            transform: `translateY(${scrollY * 0.25}px)`,
          }}
        />

        {/* Animated grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        />
        
        <div className="relative z-10 text-center max-w-4xl">
          {/* Premium Badge */}
          <div className="flex justify-center mb-8 scroll-fade-in">
            <div 
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(139, 92, 246, 0.15)'
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
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Искусственный интеллект для бизнеса
              </span>
            </div>
          </div>

          {/* Main headline - Apple style */}
          <h1 
            className="mb-8 scroll-fade-in-delay-1"
            style={{ 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(48px, 14vw, 72px)',
              fontWeight: 800,
              letterSpacing: '-0.06em',
              lineHeight: '0.9',
              background: 'linear-gradient(180deg, #FFFFFF 20%, #FFFFFF 60%, rgba(255, 255, 255, 0.5) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              paddingBottom: '8px'
            }}
          >
            ИИ агент.
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Для вашего бизнеса.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p 
            className="mb-12 scroll-fade-in-delay-2"
            style={{
              fontSize: '22px',
              lineHeight: '1.4',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.75)',
              letterSpacing: '-0.02em',
              maxWidth: '600px',
              margin: '0 auto 48px'
            }}
          >
            Автоматизация клиентской поддержки,
            <br />
            которая работает 24/7 и окупается
            <br />
            <span style={{ 
              background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}>
              за 6 месяцев
            </span>
          </p>
          
          {/* CTA */}
          <div className="flex flex-col items-center gap-4 scroll-fade-in-delay-3">
            <button
              onClick={handleNavigateProcess}
              className="group relative px-12 py-5 rounded-full font-semibold overflow-hidden"
              style={{
                fontSize: '18px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
                color: '#000000',
                boxShadow: '0 4px 24px rgba(255, 255, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              data-testid="button-start-trial"
            >
              <span className="relative z-10 flex items-center gap-3">
                Начать бесплатно
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
              </span>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                }}
              />
            </button>
            
            <p 
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.02em'
              }}
            >
              7 дней бесплатно · Без привязки карты
            </p>
          </div>
        </div>
      </section>

      {/* STATS SECTION - Floating glass card */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div 
            className="rounded-[40px] p-10 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
              backdropFilter: 'blur(60px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                0 30px 80px rgba(0, 0, 0, 0.5),
                0 8px 16px rgba(0, 0, 0, 0.3)
              `
            }}
          >
            {/* Decorative gradient orbs */}
            <div 
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
                filter: 'blur(50px)'
              }}
            />
            <div 
              className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)',
                filter: 'blur(50px)'
              }}
            />

            <div className="relative z-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-8 mb-8">
                <StatCircle number="192%" label="ROI" gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" />
                <StatCircle number="24/7" label="Работа" gradient="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" />
                <StatCircle number="80%" label="Авто" gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)" />
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

              {/* Description */}
              <p 
                className="text-center"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.7)',
                  letterSpacing: '-0.01em'
                }}
              >
                Средний ROI за первый год составляет 192%.
                <br />
                Система работает круглосуточно и автоматизирует до 80% запросов.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES SECTION */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Section title */}
          <div className="text-center mb-12">
            <h2 
              style={{
                fontSize: '44px',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                color: '#FFFFFF',
                lineHeight: '1',
                marginBottom: '16px'
              }}
            >
              Возможности
            </h2>
            <p 
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.01em'
              }}
            >
              Всё, что нужно для автоматизации поддержки
            </p>
          </div>

          {/* Capabilities cards */}
          <div className="space-y-6">
            <CapabilityCard
              icon={<Zap className="w-7 h-7" />}
              title="Мгновенный запуск"
              description="Настройка занимает 10 минут. Полная интеграция с вашими системами — CRM, базами знаний, мессенджерами."
              gradient="linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)"
            />
            
            <CapabilityCard
              icon={<Shield className="w-7 h-7" />}
              title="Корпоративная безопасность"
              description="Полное шифрование данных end-to-end. Соответствие GDPR, ISO 27001. Данные хранятся на серверах в вашей юрисдикции."
              gradient="linear-gradient(135deg, #10B981 0%, #047857 100%)"
            />
            
            <CapabilityCard
              icon={<Globe className="w-7 h-7" />}
              title="150+ языков"
              description="Автоматическое определение языка клиента. Поддержка всех популярных языков с правильной грамматикой и контекстом."
              gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            />
            
            <CapabilityCard
              icon={<Brain className="w-7 h-7" />}
              title="Глубокое понимание"
              description="ИИ понимает контекст разговора, эмоции клиента и сложные запросы. Обучается на каждом диалоге."
              gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
            />
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 
            className="text-center mb-12"
            style={{
              fontSize: '44px',
              fontWeight: 700,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: '1'
            }}
          >
            Почему мы
          </h2>

          <div className="space-y-4">
            <BenefitLine 
              icon={<Clock className="w-6 h-6" />}
              text="Работает 24/7 без отпусков, больничных и перерывов на обед"
            />
            <BenefitLine 
              icon={<Zap className="w-6 h-6" />}
              text="Обрабатывает запросы мгновенно — средний ответ меньше 2 секунд"
            />
            <BenefitLine 
              icon={<TrendingUp className="w-6 h-6" />}
              text="Окупается за 6-12 месяцев — 74% клиентов вернули инвестиции за год"
            />
            <BenefitLine 
              icon={<BarChart className="w-6 h-6" />}
              text="Интеграция с любыми системами — API для CRM, ERP, складов, мессенджеров"
            />
            <BenefitLine 
              icon={<Users className="w-6 h-6" />}
              text="Масштабируется мгновенно — от 10 до 10,000 клиентов одновременно"
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION - Dramatic */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div 
            className="rounded-[48px] p-12 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 30px 90px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Animated gradient background */}
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
                animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />

            {/* Floating orbs */}
            <div 
              className="absolute top-0 left-1/4 w-32 h-32 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
                filter: 'blur(40px)',
                animation: 'float 6s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)',
                filter: 'blur(40px)',
                animation: 'float 8s ease-in-out infinite reverse'
              }}
            />
            
            <div className="relative z-10">
              <h2 
                style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  letterSpacing: '-0.05em',
                  color: '#FFFFFF',
                  lineHeight: '1',
                  marginBottom: '20px'
                }}
              >
                Готовы начать?
              </h2>
              
              <p 
                style={{
                  fontSize: '20px',
                  lineHeight: '1.5',
                  color: 'rgba(255, 255, 255, 0.8)',
                  letterSpacing: '-0.02em',
                  marginBottom: '40px',
                  maxWidth: '500px',
                  margin: '0 auto 40px'
                }}
              >
                Присоединяйтесь к сотням компаний,
                которые уже автоматизировали поддержку с помощью ИИ
              </p>
              
              <button
                onClick={handleNavigateProcess}
                className="group relative px-12 py-5 rounded-full font-semibold overflow-hidden"
                style={{
                  fontSize: '18px',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
                  color: '#000000',
                  boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                data-testid="button-start-cta"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Запустить ИИ агента
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
                </span>
              </button>
              
              <p 
                className="mt-6"
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.02em'
                }}
              >
                7 дней бесплатно · Настройка за 10 минут · Без кредитной карты
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(-10px) translateX(-10px); }
        }
      `}</style>

    </div>
  );
});

AIAgentPage.displayName = 'AIAgentPage';

// Circular Stat Component
const StatCircle = memo(({ number, label, gradient }: { number: string; label: string; gradient: string }) => (
  <div className="text-center">
    <div 
      className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
      style={{
        background: gradient,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}
    >
      <span 
        style={{
          fontSize: '20px',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.03em'
        }}
      >
        {number}
      </span>
    </div>
    <p 
      style={{
        fontSize: '13px',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        fontWeight: 600
      }}
    >
      {label}
    </p>
  </div>
));
StatCircle.displayName = 'StatCircle';

// Capability Card Component
const CapabilityCard = memo(({ 
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
    className="group rounded-[28px] p-8 relative overflow-hidden transition-all duration-500"
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
    }}
  >
    {/* Gradient accent bar */}
    <div 
      className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
      style={{ background: gradient }}
    />

    <div className="flex gap-6">
      {/* Icon */}
      <div 
        className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
        style={{
          background: gradient,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ color: 'white' }}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <h3 
          style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            marginBottom: '8px'
          }}
        >
          {title}
        </h3>
        <p 
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
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
CapabilityCard.displayName = 'CapabilityCard';

// Benefit Line Component
const BenefitLine = memo(({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div 
    className="group flex items-center gap-5 py-5 px-6 rounded-2xl transition-all duration-300"
    style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}
  >
    <div 
      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
      style={{
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
        border: '1px solid rgba(52, 199, 89, 0.3)'
      }}
    >
      <div style={{ color: '#34C759' }}>
        {icon}
      </div>
    </div>
    <p 
      style={{
        fontSize: '17px',
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
BenefitLine.displayName = 'BenefitLine';

export default AIAgentPage;
