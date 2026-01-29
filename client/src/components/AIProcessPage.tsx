import { memo, useCallback, useState, useEffect, useRef } from "react";
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
import { useLanguage } from '../contexts/LanguageContext';
import { SplineScene } from './ui/spline-scene';

interface AIProcessPageProps {
  onNavigate: (path: string) => void;
}

const AIProcessPage = memo(({ onNavigate }: AIProcessPageProps) => {
  const { t, language } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<HTMLDivElement>(null);
  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    decided: false,
    isScrolling: false,
  });

  // Sync Telegram Main Button with language changes
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.MainButton) {
        tg.MainButton.setText(t('showcase.orderProject'));
      }
    } catch (e) {}
  }, [language, t]);
  
  const handleGetConsultation = useCallback(() => {
    window.open('https://t.me/web4tgs', '_blank');
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const spline = splineRef.current;
    if (!container || !spline) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        decided: false,
        isScrolling: true,
      };
      spline.style.pointerEvents = 'none';
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchState.current.startX);
      const deltaY = Math.abs(touch.clientY - touchState.current.startY);

      if (!touchState.current.decided && (deltaX > 12 || deltaY > 12)) {
        const isHorizontalDominant = deltaX > deltaY * 1.5;
        
        touchState.current.decided = true;
        
        if (isHorizontalDominant) {
          touchState.current.isScrolling = false;
          spline.style.pointerEvents = 'auto';
        }
      }
    };

    const handleTouchEnd = () => {
      touchState.current.decided = false;
      touchState.current.isScrolling = true;
      spline.style.pointerEvents = 'none';
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-y-auto" style={{ backgroundColor: '#000000', WebkitOverflowScrolling: 'touch' }}>
      {/* Spline 3D Background - starts inactive, activates on horizontal touch */}
      <div ref={splineRef} className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: '80px' }}>
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
      
      {/* Content layer - scrollable */}
      <div 
        className="relative z-10 min-h-screen pb-24"
        style={{ paddingTop: '100px' }}
      >
        <div className="max-w-md mx-auto">
        
        {/* Hero section - robot visible */}
        <section className="relative px-5 pt-0 pb-4">
          {/* Compact title - positioned at top, robot visible below */}
          <div className="text-center mb-4">
            <h1>
              <span 
                className="block text-[32px] leading-[1.1] font-bold"
                style={{ 
                  color: '#ffffff', 
                  letterSpacing: '-0.03em', 
                  fontFamily: 'Montserrat, sans-serif',
                  textShadow: '0 2px 20px rgba(0,0,0,0.8)'
                }}
              >
                {t('aiProcess.heroTitle1')}
              </span>
              <span 
                className="block text-[32px] leading-[1.1] font-bold"
                style={{ 
                  color: '#34d399',
                  letterSpacing: '-0.03em',
                  fontFamily: 'Montserrat, sans-serif',
                  textShadow: '0 2px 20px rgba(52,211,153,0.3)'
                }}
              >
                {t('aiProcess.heroTitle3')}
              </span>
            </h1>
          </div>
          
          {/* Robot viewing area - empty space for robot */}
          <div className="h-[280px] relative flex items-end justify-center">
            {/* Hint to interact */}
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
            >
              <span className="text-[12px] text-white/60">{language === 'ru' ? '← Проведи для взаимодействия →' : '← Swipe to interact →'}</span>
            </div>
          </div>
        </section>

        {/* Main content section - cards below robot */}
        <section className="relative px-5 pt-4 pb-16">
          {/* Compact info card - glass */}
          <div 
            className="rounded-[24px] px-5 py-4 mb-5 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
          >
            <p 
              className="text-[14px] leading-[1.5] font-medium"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              {t('aiProcess.heroSubtitle1')}
            </p>
            <p 
              className="text-[13px] leading-[1.5] mt-2"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {t('aiProcess.heroSubtitle2')}
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-2 mb-5">
            <a
              href="https://t.me/web4tgs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-full transition-all duration-200 active:scale-[0.97]"
              style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)',
                height: '52px',
                paddingLeft: '16px',
                paddingRight: '14px',
                boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.4)'
              }}
            >
              <MessageSquare className="w-5 h-5 text-white flex-shrink-0" />
              <span className="text-[15px] font-bold text-white">{t('aiProcess.getConsultation')}</span>
              <ArrowRight className="w-5 h-5 text-white flex-shrink-0" />
            </a>
          </div>

          {/* Stats row - glass */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div
              className="p-3 rounded-xl text-center"
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <span className="text-[18px] font-bold text-white block">900M+</span>
              <span className="text-[10px] text-white/50">{t('aiProcess.stats.users')}</span>
            </div>
            <div
              className="p-3 rounded-xl text-center"
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <span className="text-[18px] font-bold text-white block">24/7</span>
              <span className="text-[10px] text-white/50">{t('aiProcess.stats.support')}</span>
            </div>
            <div
              className="p-3 rounded-xl text-center"
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <span className="text-[18px] font-bold text-white block">100%</span>
              <span className="text-[10px] text-white/50">{t('aiProcess.stats.automation')}</span>
            </div>
          </div>
        </section>

        <section className="px-6 py-6 space-y-5">
          
          <ProcessStepPremium
            number="1"
            title={t('aiProcess.steps.step1Title')}
            description={t('aiProcess.steps.step1Desc')}
            duration={t('aiProcess.steps.step1Duration')}
            accentGradient="linear-gradient(135deg, #007AFF 0%, #0051D5 100%)"
            icon={<Smartphone className="w-6 h-6" />}
            features={[
              t('aiProcess.steps.step1Feature1'),
              t('aiProcess.steps.step1Feature2'),
              t('aiProcess.steps.step1Feature3')
            ]}
          />

          <ProcessStepPremium
            number="2"
            title={t('aiProcess.steps.step2Title')}
            description={t('aiProcess.steps.step2Desc')}
            duration={t('aiProcess.steps.step2Duration')}
            accentGradient="linear-gradient(135deg, #BF5AF2 0%, #8E2DE2 100%)"
            icon={<Bot className="w-6 h-6" />}
            features={[
              t('aiProcess.steps.step2Feature1'),
              t('aiProcess.steps.step2Feature2'),
              t('aiProcess.steps.step2Feature3')
            ]}
          />

          <ProcessStepPremium
            number="3"
            title={t('aiProcess.steps.step3Title')}
            description={t('aiProcess.steps.step3Desc')}
            duration={t('aiProcess.steps.step3Duration')}
            accentGradient="linear-gradient(135deg, #FF9F0A 0%, #FF6B00 100%)"
            icon={<Zap className="w-6 h-6" />}
            features={[
              t('aiProcess.steps.step3Feature1'),
              t('aiProcess.steps.step3Feature2'),
              t('aiProcess.steps.step3Feature3')
            ]}
          />

          <ProcessStepPremium
            number="4"
            title={t('aiProcess.steps.step4Title')}
            description={t('aiProcess.steps.step4Desc')}
            duration={t('aiProcess.steps.step4Duration')}
            accentGradient="linear-gradient(135deg, #34C759 0%, #30D158 100%)"
            icon={<Rocket className="w-6 h-6" />}
            features={[
              t('aiProcess.steps.step4Feature1'),
              t('aiProcess.steps.step4Feature2'),
              t('aiProcess.steps.step4Feature3')
            ]}
          />

        </section>

        <section className="px-6 py-8">
          <h2 
            className="text-center mb-8"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              lineHeight: '1.1'
            }}
          >
            {t('aiProcess.benefitsTitle1')}
            <br />
            {t('aiProcess.benefitsTitle2')}
          </h2>
          
          <div 
            className="rounded-[28px] p-8 space-y-5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
          >
            <BenefitItemPremium text={t('aiProcess.benefits.benefit1')} />
            <BenefitItemPremium text={t('aiProcess.benefits.benefit2')} />
            <BenefitItemPremium text={t('aiProcess.benefits.benefit3')} />
            <BenefitItemPremium text={t('aiProcess.benefits.benefit4')} />
            <BenefitItemPremium text={t('aiProcess.benefits.benefit5')} />
            <BenefitItemPremium text={t('aiProcess.benefits.benefit6')} />
          </div>
        </section>

        <section className="px-6 py-8">
          <h2 
            className="text-center mb-8"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              lineHeight: '1.1'
            }}
          >
            {t('aiProcess.whyTelegramTitle1')}
            <br />
            {t('aiProcess.whyTelegramTitle2')}
          </h2>
          
          <div className="space-y-4">
            <WhyFeatureCard
              icon="🌍"
              title={t('aiProcess.whyTelegram.feature1Title')}
              description={t('aiProcess.whyTelegram.feature1Desc')}
            />
            <WhyFeatureCard
              icon="⚡️"
              title={t('aiProcess.whyTelegram.feature2Title')}
              description={t('aiProcess.whyTelegram.feature2Desc')}
            />
            <WhyFeatureCard
              icon="🔔"
              title={t('aiProcess.whyTelegram.feature3Title')}
              description={t('aiProcess.whyTelegram.feature3Desc')}
            />
          </div>
        </section>

        <section className="px-6 py-12">
          <div 
            className="rounded-[28px] p-8 text-center relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
          >
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
                {t('aiProcess.ctaTitle')}
              </h3>
              
              <p 
                style={{
                  fontSize: '17px',
                  lineHeight: '1.47',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '24px'
                }}
              >
                {t('aiProcess.ctaSubtitle1')}
                <br />
                {t('aiProcess.ctaSubtitle2')}
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
                  {t('aiProcess.ctaButton')}
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
                {t('aiProcess.ctaFooter')}
              </p>
            </div>
          </div>
        </section>

        </div>
      </div>
    </div>
  );
});

AIProcessPage.displayName = 'AIProcessPage';

const StatBadge = memo(({ number, label }: { number: string; label: string }) => (
  <div className="text-center" style={{ minWidth: '80px', flex: '1 1 0' }}>
    <div 
      style={{
        fontSize: '24px',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: 'var(--text-primary)',
        lineHeight: '1',
        marginBottom: '4px',
        minHeight: '24px'
      }}
    >
      {number}
    </div>
    <div 
      style={{
        fontSize: '10px',
        color: 'var(--text-quaternary)',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        minHeight: '14px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </div>
  </div>
));
StatBadge.displayName = 'StatBadge';

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
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(30px) saturate(150%)',
      WebkitBackdropFilter: 'blur(30px) saturate(150%)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}
  >
    <div 
      className="absolute top-0 left-0 right-0 h-1 opacity-60"
      style={{
        background: accentGradient
      }}
    />

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
              color: 'var(--text-primary)'
            }}
          >
            {title}
          </h3>
          <div 
            className="px-3 py-1.5 rounded-full shrink-0"
            style={{
              background: 'var(--overlay-medium)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
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
            color: 'var(--text-tertiary)',
            letterSpacing: '-0.01em',
            marginBottom: '16px'
          }}
        >
          {description}
        </p>

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
                  color: 'var(--text-tertiary)',
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

    <div 
      className="absolute -bottom-4 -right-4 opacity-5 select-none pointer-events-none"
      style={{
        fontSize: '120px',
        fontWeight: 900,
        color: 'var(--text-primary)',
        lineHeight: '1'
      }}
    >
      {number}
    </div>
  </div>
));
ProcessStepPremium.displayName = 'ProcessStepPremium';

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
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
        fontWeight: 500
      }}
    >
      {text}
    </p>
  </div>
));
BenefitItemPremium.displayName = 'BenefitItemPremium';

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
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(30px) saturate(150%)',
      WebkitBackdropFilter: 'blur(30px) saturate(150%)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
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
            color: 'var(--text-primary)',
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
            color: 'var(--text-tertiary)',
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
