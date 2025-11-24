import { memo, useCallback, useState, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Brain,
  TrendingUp,
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
    <div className="min-h-screen bg-[#000000] overflow-hidden">
      
      {/* ===============================================
          HERO SECTION - Full Screen Dramatic Intro
          =============================================== */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Animated gradient background - multi-layer parallax */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            background: 'radial-gradient(ellipse 140% 100% at 50% -30%, rgba(59, 130, 246, 0.35) 0%, rgba(139, 92, 246, 0.25) 50%, transparent 100%)',
            transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0007})`,
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            background: 'radial-gradient(circle at 25% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 60%), radial-gradient(circle at 75% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 60%)',
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        
        <div className="relative z-10 text-center w-full">
          {/* Premium Badge */}
          <div className="flex justify-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.12) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(139, 92, 246, 0.2)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                Искусственный интеллект
              </span>
            </div>
          </div>

          {/* Main headline - Dramatic Apple style */}
          <h1 
            className="mb-6 px-4"
            style={{ 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(52px, 15vw, 80px)',
              fontWeight: 800,
              letterSpacing: '-0.065em',
              lineHeight: '0.88',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 40%, rgba(255, 255, 255, 0.45) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ИИ агент
          </h1>

          {/* Gradient accent line */}
          <div 
            className="h-1 w-20 mx-auto mb-6 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.5)'
            }}
          />
          
          {/* Subtitle */}
          <p 
            className="mb-10 px-6"
            style={{
              fontSize: '22px',
              lineHeight: '1.35',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.75)',
              letterSpacing: '-0.025em',
            }}
          >
            Автоматизация,
            <br />
            которая работает 24/7
          </p>
          
          <p 
            className="mb-12 px-6"
            style={{
              fontSize: '19px',
              lineHeight: '1.4',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Окупается за 6 месяцев
          </p>
          
          {/* CTA */}
          <div className="flex flex-col items-center gap-3 px-6">
            <button
              onClick={handleNavigateProcess}
              className="w-full max-w-xs group relative py-4 rounded-full font-semibold overflow-hidden"
              style={{
                fontSize: '17px',
                letterSpacing: '-0.02em',
                background: '#FFFFFF',
                color: '#000000',
                boxShadow: '0 8px 32px rgba(255, 255, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              data-testid="button-start-trial"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Начать
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            
            <p 
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.45)',
                letterSpacing: '0.01em'
              }}
            >
              Бесплатно 7 дней
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{
            opacity: Math.max(0, 1 - scrollY / 300)
          }}
        >
          <div 
            className="w-1 h-12 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
              animation: 'bounce 2s infinite'
            }}
          />
        </div>
      </section>

      {/* ===============================================
          STATS SECTION - Minimal & Powerful
          =============================================== */}
      <section 
        className="relative py-24 px-6"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 100%)'
        }}
      >
        <div className="max-w-sm mx-auto">
          {/* Title */}
          <h2 
            className="text-center mb-16"
            style={{
              fontSize: '40px',
              fontWeight: 700,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: '1'
            }}
          >
            В цифрах
          </h2>

          {/* Stats */}
          <div className="space-y-12">
            <StatCard
              number="192%"
              label="Средний ROI за год"
              gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
            />
            <StatCard
              number="24/7"
              label="Работа без выходных"
              gradient="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
            />
            <StatCard
              number="80%"
              label="Запросов автоматом"
              gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            />
          </div>
        </div>
      </section>

      {/* ===============================================
          FEATURES SECTION - One at a time focus
          =============================================== */}
      <section className="py-24 px-6">
        <div className="max-w-sm mx-auto">
          <h2 
            className="text-center mb-4"
            style={{
              fontSize: '40px',
              fontWeight: 700,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: '1'
            }}
          >
            Возможности
          </h2>
          
          <p 
            className="text-center mb-16"
            style={{
              fontSize: '17px',
              color: 'rgba(255, 255, 255, 0.55)',
              letterSpacing: '-0.01em'
            }}
          >
            Всё для автоматизации
          </p>

          <div className="space-y-8">
            <FeatureBlock
              icon={<Zap className="w-8 h-8" />}
              title="Мгновенный запуск"
              description="Настройка 10 минут. Интеграция с вашими системами."
              gradient="linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)"
            />
            
            <FeatureBlock
              icon={<Shield className="w-8 h-8" />}
              title="Безопасность"
              description="Полное шифрование. Соответствие GDPR и ISO 27001."
              gradient="linear-gradient(135deg, #10B981 0%, #047857 100%)"
            />
            
            <FeatureBlock
              icon={<Globe className="w-8 h-8" />}
              title="150+ языков"
              description="Общается на родном языке вашего клиента."
              gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            />
            
            <FeatureBlock
              icon={<Brain className="w-8 h-8" />}
              title="Умная аналитика"
              description="Понимает контекст и учится на разговорах."
              gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
            />
          </div>
        </div>
      </section>

      {/* ===============================================
          WHY SECTION - Clean list
          =============================================== */}
      <section 
        className="py-24 px-6"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 50% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 100%)'
        }}
      >
        <div className="max-w-sm mx-auto">
          <h2 
            className="text-center mb-16"
            style={{
              fontSize: '40px',
              fontWeight: 700,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: '1'
            }}
          >
            Почему мы
          </h2>

          <div className="space-y-6">
            <BenefitItem 
              icon={<Clock className="w-6 h-6" />}
              text="Работает круглосуточно без перерывов"
            />
            <BenefitItem 
              icon={<Zap className="w-6 h-6" />}
              text="Ответ меньше 2 секунд"
            />
            <BenefitItem 
              icon={<TrendingUp className="w-6 h-6" />}
              text="74% вернули инвестиции за год"
            />
          </div>
        </div>
      </section>

      {/* ===============================================
          FINAL CTA - Dramatic closer
          =============================================== */}
      <section className="relative py-32 px-6 pb-32">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(139, 92, 246, 0.25) 0%, transparent 80%)'
          }}
        />

        {/* Animated orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float 8s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float 10s ease-in-out infinite reverse'
          }}
        />
        
        <div className="relative z-10 text-center max-w-sm mx-auto">
          <h2 
            className="mb-6"
            style={{
              fontSize: '52px',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: '#FFFFFF',
              lineHeight: '0.95'
            }}
          >
            Готовы
            <br />
            начать?
          </h2>
          
          <p 
            className="mb-12"
            style={{
              fontSize: '19px',
              lineHeight: '1.45',
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '-0.02em'
            }}
          >
            Присоединяйтесь к сотням компаний, которые уже автоматизировали поддержку
          </p>
          
          <button
            onClick={handleNavigateProcess}
            className="w-full group relative py-5 rounded-full font-semibold overflow-hidden mb-4"
            style={{
              fontSize: '18px',
              letterSpacing: '-0.02em',
              background: '#FFFFFF',
              color: '#000000',
              boxShadow: '0 12px 48px rgba(255, 255, 255, 0.25)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            data-testid="button-start-cta"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Запустить ИИ агента
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          
          <p 
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.45)',
              letterSpacing: '0.01em'
            }}
          >
            7 дней бесплатно · Без карты
          </p>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-15px, -20px); }
          66% { transform: translate(15px, -10px); }
        }
      `}</style>

    </div>
  );
});

AIAgentPage.displayName = 'AIAgentPage';

// Stat Card Component - Clean & Minimal
const StatCard = memo(({ number, label, gradient }: { number: string; label: string; gradient: string }) => (
  <div className="text-center">
    <div 
      className="mb-4"
      style={{
        fontSize: '72px',
        fontWeight: 800,
        letterSpacing: '-0.055em',
        lineHeight: '1',
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {number}
    </div>
    <p 
      style={{
        fontSize: '17px',
        lineHeight: '1.4',
        color: 'rgba(255, 255, 255, 0.65)',
        letterSpacing: '-0.01em',
        fontWeight: 500
      }}
    >
      {label}
    </p>
  </div>
));
StatCard.displayName = 'StatCard';

// Feature Block - One feature at a time
const FeatureBlock = memo(({ 
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
  <div className="text-center">
    {/* Icon */}
    <div 
      className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
      style={{
        background: gradient,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)'
      }}
    >
      <div style={{ color: 'white' }}>
        {icon}
      </div>
    </div>

    {/* Title */}
    <h3 
      className="mb-3"
      style={{
        fontSize: '24px',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: '#FFFFFF'
      }}
    >
      {title}
    </h3>

    {/* Description */}
    <p 
      style={{
        fontSize: '17px',
        lineHeight: '1.5',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: '-0.015em'
      }}
    >
      {description}
    </p>
  </div>
));
FeatureBlock.displayName = 'FeatureBlock';

// Benefit Item - Minimal with icon
const BenefitItem = memo(({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-4 py-4">
    <div 
      className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
        border: '1px solid rgba(52, 199, 89, 0.25)'
      }}
    >
      <div style={{ color: '#34C759' }}>
        {icon}
      </div>
    </div>
    <p 
      style={{
        fontSize: '17px',
        lineHeight: '1.4',
        color: 'rgba(255, 255, 255, 0.85)',
        letterSpacing: '-0.015em',
        fontWeight: 500
      }}
    >
      {text}
    </p>
  </div>
));
BenefitItem.displayName = 'BenefitItem';

export default AIAgentPage;
