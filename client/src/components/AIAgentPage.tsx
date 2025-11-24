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
          HERO SECTION - Breathtaking intro
          =============================================== */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Multi-layer parallax - Depth & atmosphere */}
        <div 
          className="absolute inset-0 opacity-28"
          style={{
            background: 'radial-gradient(ellipse 150% 100% at 50% -20%, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.3) 45%, transparent 100%)',
            transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0008})`,
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-18"
          style={{
            background: 'radial-gradient(circle at 20% 85%, rgba(139, 92, 246, 0.35) 0%, transparent 55%), radial-gradient(circle at 80% 15%, rgba(59, 130, 246, 0.35) 0%, transparent 55%)',
            transform: `translateY(${scrollY * 0.35}px)`,
          }}
        />

        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        />
        
        <div className="relative z-10 text-center w-full">
          {/* Badge - Minimalist perfection */}
          <div className="flex justify-center mb-10">
            <div 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(59, 130, 246, 0.14) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 10px 40px rgba(139, 92, 246, 0.25)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" strokeWidth={2.5} />
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                Новая эра поддержки
              </span>
            </div>
          </div>

          {/* Headline - Pure drama */}
          <h1 
            className="mb-3 px-4"
            style={{ 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(56px, 16vw, 88px)',
              fontWeight: 800,
              letterSpacing: '-0.07em',
              lineHeight: '0.85',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 35%, rgba(255, 255, 255, 0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ИИ агент
          </h1>

          {/* Accent line - Visual break */}
          <div className="flex justify-center mb-6">
            <div 
              className="h-1.5 w-24 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)',
                boxShadow: '0 0 24px rgba(139, 92, 246, 0.6), 0 0 48px rgba(59, 130, 246, 0.4)'
              }}
            />
          </div>
          
          {/* Subheadline - Powerful simplicity */}
          <p 
            className="mb-4 px-6"
            style={{
              fontSize: '24px',
              lineHeight: '1.3',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.8)',
              letterSpacing: '-0.03em',
            }}
          >
            Работает.
            <br />
            Пока вы спите.
          </p>
          
          {/* Value prop - Gradient emphasis */}
          <p 
            className="mb-14 px-6"
            style={{
              fontSize: '20px',
              lineHeight: '1.4',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Окупается за полгода
          </p>
          
          {/* CTA - Clean & confident */}
          <div className="flex flex-col items-center gap-4 px-6">
            <button
              onClick={handleNavigateProcess}
              className="w-full max-w-xs group relative py-4.5 rounded-full font-semibold overflow-hidden active:scale-95"
              style={{
                fontSize: '17px',
                letterSpacing: '-0.015em',
                background: '#FFFFFF',
                color: '#000000',
                boxShadow: '0 10px 40px rgba(255, 255, 255, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.12) inset',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              data-testid="button-start-trial"
            >
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                Попробовать
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5 duration-300" strokeWidth={2.5} />
              </span>
            </button>
            
            <p 
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '0.015em'
              }}
            >
              Бесплатно 7 дней
            </p>
          </div>
        </div>

        {/* Scroll hint - Elegant guide */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          style={{
            opacity: Math.max(0, 1 - scrollY / 400),
            transition: 'opacity 0.3s ease'
          }}
        >
          <div 
            className="w-1 h-14 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)',
              animation: 'bounce 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
        </div>
      </section>

      {/* ===============================================
          STATS SECTION - Numbers that matter
          =============================================== */}
      <section 
        className="relative py-28 px-6"
        style={{
          background: 'radial-gradient(ellipse 110% 50% at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 100%)'
        }}
      >
        <div className="max-w-sm mx-auto">
          {/* Title - Editorial style */}
          <h2 
            className="text-center mb-20"
            style={{
              fontSize: '42px',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: '#FFFFFF',
              lineHeight: '0.95'
            }}
          >
            В цифрах
          </h2>

          {/* Stats - Bold statements */}
          <div className="space-y-16">
            <StatCard
              number="192%"
              label="ROI за год"
              sublabel="Средний показатель"
              gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
            />
            <StatCard
              number="24/7"
              label="Всегда на связи"
              sublabel="Без выходных"
              gradient="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
            />
            <StatCard
              number="< 2s"
              label="Время ответа"
              sublabel="Мгновенно"
              gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            />
          </div>
        </div>
      </section>

      {/* ===============================================
          FEATURES SECTION - What makes it great
          =============================================== */}
      <section className="py-28 px-6">
        <div className="max-w-sm mx-auto">
          <h2 
            className="text-center mb-5"
            style={{
              fontSize: '42px',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: '#FFFFFF',
              lineHeight: '0.95'
            }}
          >
            Возможности
          </h2>
          
          <p 
            className="text-center mb-20"
            style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.015em'
            }}
          >
            Всё для успеха
          </p>

          <div className="space-y-12">
            <FeatureBlock
              icon={<Zap className="w-9 h-9" strokeWidth={2} />}
              title="Мгновенный запуск"
              description="10 минут — и готово. Интеграция с любыми системами."
              gradient="linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)"
            />
            
            <FeatureBlock
              icon={<Shield className="w-9 h-9" strokeWidth={2} />}
              title="Полная безопасность"
              description="Шифрование данных. GDPR, ISO 27001."
              gradient="linear-gradient(135deg, #10B981 0%, #047857 100%)"
            />
            
            <FeatureBlock
              icon={<Globe className="w-9 h-9" strokeWidth={2} />}
              title="Говорит на 150+ языках"
              description="Понимает клиента на его родном языке."
              gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            />
            
            <FeatureBlock
              icon={<Brain className="w-9 h-9" strokeWidth={2} />}
              title="Учится сам"
              description="Понимает контекст. Становится умнее с каждым днём."
              gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
            />
          </div>
        </div>
      </section>

      {/* ===============================================
          WHY SECTION - Real benefits
          =============================================== */}
      <section 
        className="py-28 px-6"
        style={{
          background: 'radial-gradient(ellipse 110% 50% at 50% 50%, rgba(59, 130, 246, 0.04) 0%, transparent 100%)'
        }}
      >
        <div className="max-w-sm mx-auto">
          <h2 
            className="text-center mb-20"
            style={{
              fontSize: '42px',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: '#FFFFFF',
              lineHeight: '0.95'
            }}
          >
            Почему мы
          </h2>

          <div className="space-y-7">
            <BenefitItem 
              icon={<Clock className="w-6 h-6" strokeWidth={2.5} />}
              text="Никогда не спит"
              subtext="24/7 без перерывов"
            />
            <BenefitItem 
              icon={<Zap className="w-6 h-6" strokeWidth={2.5} />}
              text="Отвечает мгновенно"
              subtext="Меньше 2 секунд"
            />
            <BenefitItem 
              icon={<TrendingUp className="w-6 h-6" strokeWidth={2.5} />}
              text="Окупается быстро"
              subtext="74% за первый год"
            />
          </div>
        </div>
      </section>

      {/* ===============================================
          FINAL CTA - The moment of truth
          =============================================== */}
      <section className="relative py-36 px-6 pb-40">
        {/* Atmospheric background */}
        <div 
          className="absolute inset-0 opacity-35"
          style={{
            background: 'radial-gradient(ellipse 120% 80% at 50% 50%, rgba(139, 92, 246, 0.28) 0%, transparent 85%)'
          }}
        />

        {/* Floating orbs - Living atmosphere */}
        <div 
          className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.85) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 9s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.85) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 11s ease-in-out infinite reverse'
          }}
        />
        
        <div className="relative z-10 text-center max-w-sm mx-auto">
          <h2 
            className="mb-8"
            style={{
              fontSize: '56px',
              fontWeight: 700,
              letterSpacing: '-0.06em',
              color: '#FFFFFF',
              lineHeight: '0.9'
            }}
          >
            Начните
            <br />
            сегодня
          </h2>
          
          <p 
            className="mb-14"
            style={{
              fontSize: '20px',
              lineHeight: '1.4',
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '-0.025em',
              fontWeight: 500
            }}
          >
            Сотни компаний уже доверились нам
          </p>
          
          <button
            onClick={handleNavigateProcess}
            className="w-full group relative py-5 rounded-full font-semibold overflow-hidden mb-5 active:scale-95"
            style={{
              fontSize: '18px',
              letterSpacing: '-0.02em',
              background: '#FFFFFF',
              color: '#000000',
              boxShadow: '0 16px 56px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            data-testid="button-start-cta"
          >
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              Запустить ИИ
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5 duration-300" strokeWidth={2.5} />
            </span>
          </button>
          
          <p 
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.015em'
            }}
          >
            7 дней бесплатно · Без карты
          </p>
        </div>
      </section>

      {/* Animations - Smooth & natural */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-16px); opacity: 0.2; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-18px, -25px) scale(1.05); }
          66% { transform: translate(18px, -12px) scale(0.95); }
        }
      `}</style>

    </div>
  );
});

AIAgentPage.displayName = 'AIAgentPage';

// Stat Card - Editorial precision
const StatCard = memo(({ number, label, sublabel, gradient }: { 
  number: string; 
  label: string; 
  sublabel: string;
  gradient: string;
}) => (
  <div className="text-center">
    <div 
      className="mb-5"
      style={{
        fontSize: '80px',
        fontWeight: 800,
        letterSpacing: '-0.06em',
        lineHeight: '0.9',
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {number}
    </div>
    <p 
      style={{
        fontSize: '19px',
        lineHeight: '1.3',
        color: 'rgba(255, 255, 255, 0.75)',
        letterSpacing: '-0.015em',
        fontWeight: 600,
        marginBottom: '6px'
      }}
    >
      {label}
    </p>
    <p 
      style={{
        fontSize: '15px',
        color: 'rgba(255, 255, 255, 0.45)',
        letterSpacing: '-0.01em'
      }}
    >
      {sublabel}
    </p>
  </div>
));
StatCard.displayName = 'StatCard';

// Feature Block - Clear & focused
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
    {/* Icon - Bold & beautiful */}
    <div 
      className="w-24 h-24 rounded-[28px] flex items-center justify-center mx-auto mb-6"
      style={{
        background: gradient,
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div style={{ color: 'white' }}>
        {icon}
      </div>
    </div>

    {/* Title - Confident */}
    <h3 
      className="mb-4"
      style={{
        fontSize: '26px',
        fontWeight: 700,
        letterSpacing: '-0.035em',
        color: '#FFFFFF',
        lineHeight: '1.1'
      }}
    >
      {title}
    </h3>

    {/* Description - Clear value */}
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

// Benefit Item - Two-tier info
const BenefitItem = memo(({ icon, text, subtext }: { 
  icon: React.ReactNode; 
  text: string;
  subtext: string;
}) => (
  <div className="flex items-center gap-5 py-5">
    <div 
      className="flex-shrink-0 w-14 h-14 rounded-[20px] flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.18) 0%, rgba(16, 185, 129, 0.18) 100%)',
        border: '1px solid rgba(52, 199, 89, 0.3)'
      }}
    >
      <div style={{ color: '#34C759' }}>
        {icon}
      </div>
    </div>
    <div className="flex-1">
      <p 
        style={{
          fontSize: '18px',
          lineHeight: '1.3',
          color: 'rgba(255, 255, 255, 0.9)',
          letterSpacing: '-0.02em',
          fontWeight: 600,
          marginBottom: '3px'
        }}
      >
        {text}
      </p>
      <p 
        style={{
          fontSize: '15px',
          color: 'rgba(255, 255, 255, 0.5)',
          letterSpacing: '-0.01em'
        }}
      >
        {subtext}
      </p>
    </div>
  </div>
));
BenefitItem.displayName = 'BenefitItem';

export default AIAgentPage;
