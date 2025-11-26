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
          HERO - Full screen dramatic intro
          =============================================== */}
      <section className="relative min-h-screen flex items-center justify-center px-5">
        {/* Parallax backgrounds - optimized for mobile */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 180% 100% at 50% -15%, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.35) 40%, transparent 100%)',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 15% 90%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 85% 10%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        
        <div className="relative z-10 text-center w-full">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 10px 40px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" strokeWidth={2.5} />
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
                Новая эра
              </span>
            </div>
          </div>

          {/* Main headline - Mobile optimized */}
          <h1 
            className="mb-4 px-3"
            style={{ 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(48px, 18vw, 72px)',
              fontWeight: 800,
              letterSpacing: '-0.07em',
              lineHeight: '0.88',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 30%, rgba(255, 255, 255, 0.35) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ИИ агент
          </h1>

          {/* Gradient line */}
          <div className="flex justify-center mb-5">
            <div 
              className="h-1.5 w-20 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.7), 0 0 40px rgba(59, 130, 246, 0.5)'
              }}
            />
          </div>
          
          {/* Subheadline */}
          <p 
            className="mb-3 px-5"
            style={{
              fontSize: '21px',
              lineHeight: '1.25',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.82)',
              letterSpacing: '-0.035em',
            }}
          >
            Работает.
            <br />
            Пока вы спите.
          </p>
          
          {/* Value prop */}
          <p 
            className="mb-12 px-5"
            style={{
              fontSize: '18px',
              lineHeight: '1.35',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Окупается за полгода
          </p>
          
          {/* CTA */}
          <div className="flex flex-col items-center gap-3.5 px-5">
            <button
              onClick={handleNavigateProcess}
              className="w-full max-w-[280px] group relative py-4 rounded-full font-semibold active:scale-[0.96]"
              style={{
                fontSize: '16px',
                letterSpacing: '-0.015em',
                background: '#FFFFFF',
                color: '#000000',
                boxShadow: '0 12px 48px rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              data-testid="button-start-trial"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Попробовать
                <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1 duration-300" strokeWidth={2.5} />
              </span>
            </button>
            
            <p 
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.38)',
                letterSpacing: '0.02em'
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
            opacity: Math.max(0, 1 - scrollY / 400),
          }}
        >
          <div 
            className="w-1 h-12 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
              animation: 'bounce 2.5s ease-in-out infinite'
            }}
          />
        </div>
      </section>

      {/* ===============================================
          STATS - Clean numbers
          =============================================== */}
      <section className="relative py-20 px-5 scroll-fade-in">
        <div className="max-w-xs mx-auto">
          {/* Title */}
          <h2 
            className="text-center mb-16 scroll-fade-in-delay-1"
            style={{
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: '#FFFFFF',
              lineHeight: '0.95'
            }}
          >
            В цифрах
          </h2>

          {/* Stats */}
          <div className="space-y-14">
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
          FEATURES - One at a time
          =============================================== */}
      <section className="py-20 px-5 scroll-fade-in">
        <div className="max-w-xs mx-auto">
          <h2 
            className="text-center mb-4 scroll-fade-in-delay-1"
            style={{
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: '#FFFFFF',
              lineHeight: '0.95'
            }}
          >
            Возможности
          </h2>
          
          <p 
            className="text-center mb-16"
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.48)',
              letterSpacing: '-0.015em'
            }}
          >
            Всё для успеха
          </p>

          <div className="space-y-10">
            <FeatureBlock
              icon={<Zap className="w-8 h-8" strokeWidth={2} />}
              title="Мгновенный запуск"
              description="10 минут — и готово"
              gradient="linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)"
            />
            
            <FeatureBlock
              icon={<Shield className="w-8 h-8" strokeWidth={2} />}
              title="Безопасность"
              description="Шифрование и GDPR"
              gradient="linear-gradient(135deg, #10B981 0%, #047857 100%)"
            />
            
            <FeatureBlock
              icon={<Globe className="w-8 h-8" strokeWidth={2} />}
              title="150+ языков"
              description="Понимает всех"
              gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            />
            
            <FeatureBlock
              icon={<Brain className="w-8 h-8" strokeWidth={2} />}
              title="Учится сам"
              description="Становится умнее"
              gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
            />
          </div>
        </div>
      </section>

      {/* ===============================================
          WHY - Simple benefits
          =============================================== */}
      <section className="py-20 px-5 scroll-fade-in">
        <div className="max-w-xs mx-auto">
          <h2 
            className="text-center mb-16 scroll-fade-in-delay-1"
            style={{
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              color: '#FFFFFF',
              lineHeight: '0.95'
            }}
          >
            Почему мы
          </h2>

          <div className="space-y-6">
            <BenefitItem 
              icon={<Clock className="w-5.5 h-5.5" strokeWidth={2.5} />}
              text="Никогда не спит"
              subtext="24/7 без перерывов"
            />
            <BenefitItem 
              icon={<Zap className="w-5.5 h-5.5" strokeWidth={2.5} />}
              text="Отвечает мгновенно"
              subtext="Меньше 2 секунд"
            />
            <BenefitItem 
              icon={<TrendingUp className="w-5.5 h-5.5" strokeWidth={2.5} />}
              text="Окупается быстро"
              subtext="74% за год"
            />
          </div>
        </div>
      </section>

      {/* ===============================================
          FINAL CTA - Closer
          =============================================== */}
      <section className="relative py-28 px-5 pb-32 scroll-fade-in">
        {/* Background */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse 140% 80% at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 90%)'
          }}
        />

        {/* Animated orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.9) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float 9s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-32 h-32 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.9) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float 11s ease-in-out infinite reverse'
          }}
        />
        
        <div className="relative z-10 text-center max-w-xs mx-auto">
          <h2 
            className="mb-6"
            style={{
              fontSize: '48px',
              fontWeight: 700,
              letterSpacing: '-0.065em',
              color: '#FFFFFF',
              lineHeight: '0.88'
            }}
          >
            Начните
            <br />
            сегодня
          </h2>
          
          <p 
            className="mb-12"
            style={{
              fontSize: '18px',
              lineHeight: '1.4',
              color: 'rgba(255, 255, 255, 0.68)',
              letterSpacing: '-0.025em',
              fontWeight: 500
            }}
          >
            Сотни компаний уже
            <br />
            доверились нам
          </p>
          
          <button
            onClick={handleNavigateProcess}
            className="w-full group relative py-4.5 rounded-full font-semibold mb-4 active:scale-[0.96]"
            style={{
              fontSize: '17px',
              letterSpacing: '-0.02em',
              background: '#FFFFFF',
              color: '#000000',
              boxShadow: '0 20px 60px rgba(255, 255, 255, 0.35)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.38)',
              letterSpacing: '0.02em'
            }}
          >
            7 дней бесплатно · Без карты
          </p>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-14px); opacity: 0.2; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-20px, -25px) scale(1.08); }
          66% { transform: translate(20px, -15px) scale(0.92); }
        }
      `}</style>

    </div>
  );
});

AIAgentPage.displayName = 'AIAgentPage';

// Stat Card - Mobile optimized
const StatCard = memo(({ number, label, sublabel, gradient }: { 
  number: string; 
  label: string; 
  sublabel: string;
  gradient: string;
}) => (
  <div className="text-center">
    <div 
      className="mb-4"
      style={{
        fontSize: '68px',
        fontWeight: 800,
        letterSpacing: '-0.065em',
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
        fontSize: '17px',
        lineHeight: '1.3',
        color: 'rgba(255, 255, 255, 0.75)',
        letterSpacing: '-0.02em',
        fontWeight: 600,
        marginBottom: '5px'
      }}
    >
      {label}
    </p>
    <p 
      style={{
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.42)',
        letterSpacing: '-0.01em'
      }}
    >
      {sublabel}
    </p>
  </div>
));
StatCard.displayName = 'StatCard';

// Feature Block - Mobile focused
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
      className="w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-5"
      style={{
        background: gradient,
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)'
      }}
    >
      <div style={{ color: 'white' }}>
        {icon}
      </div>
    </div>

    {/* Title */}
    <h3 
      className="mb-2.5"
      style={{
        fontSize: '22px',
        fontWeight: 700,
        letterSpacing: '-0.04em',
        color: '#FFFFFF',
        lineHeight: '1.15'
      }}
    >
      {title}
    </h3>

    {/* Description */}
    <p 
      style={{
        fontSize: '15px',
        lineHeight: '1.45',
        color: 'rgba(255, 255, 255, 0.58)',
        letterSpacing: '-0.015em'
      }}
    >
      {description}
    </p>
  </div>
));
FeatureBlock.displayName = 'FeatureBlock';

// Benefit Item - Compact mobile
const BenefitItem = memo(({ icon, text, subtext }: { 
  icon: React.ReactNode; 
  text: string;
  subtext: string;
}) => (
  <div className="flex items-center gap-4 py-4">
    <div 
      className="flex-shrink-0 w-12 h-12 rounded-[18px] flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
        border: '1px solid rgba(52, 199, 89, 0.35)'
      }}
    >
      <div style={{ color: '#34C759' }}>
        {icon}
      </div>
    </div>
    <div className="flex-1">
      <p 
        style={{
          fontSize: '16px',
          lineHeight: '1.25',
          color: 'rgba(255, 255, 255, 0.88)',
          letterSpacing: '-0.025em',
          fontWeight: 600,
          marginBottom: '3px'
        }}
      >
        {text}
      </p>
      <p 
        style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.48)',
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
