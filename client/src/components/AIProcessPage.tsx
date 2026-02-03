import { memo, useCallback, useEffect } from "react";
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

const SPLINE_SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

interface AIProcessPageProps {
  onNavigate: (path: string) => void;
}

const AIProcessPage = memo(({ onNavigate }: AIProcessPageProps) => {
  const { t, language } = useLanguage();

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

  return (
    <div className="relative min-h-screen bg-black">
      {/* Spline 3D Background - purely decorative, no interaction */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ paddingTop: '80px' }}
      >
        <SplineScene 
          scene={SPLINE_SCENE_URL}
          className="w-full h-full"
        />
      </div>
      
      {/* Content layer - scrollable */}
      <div 
        className="relative z-10 min-h-screen pb-24"
        style={{ paddingTop: '100px' }}
      >
        <div className="max-w-md mx-auto">
        
        {/* Hero section - robot visible */}
        <section className="relative px-5 pt-0 pb-4">
          {/* Robot viewing area - empty space for robot */}
          <div className="h-[320px]" />
        </section>

        {/* Main content section - cards below robot */}
        <section className="relative px-5 pt-4 pb-16">
          {/* iOS 2026 Premium Hero Card */}
          <div 
            className="rounded-[32px] px-7 py-8 mb-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(139,92,246,0.08) 0%, rgba(88,28,135,0.04) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(167,139,250,0.15)',
              boxShadow: '0 0 80px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
          >
            {/* Noise texture overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[32px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
              }}
            />
            
            {/* Purple glow accents */}
            <div 
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 60%)'
              }}
            />
            <div 
              className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 60%)'
              }}
            />
            
            {/* Badge - iOS style pill */}
            <div className="flex justify-center mb-5 relative">
              <span 
                className="px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(192,132,252,0.2) 100%)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(167,139,250,0.25)',
                  boxShadow: '0 0 20px rgba(139,92,246,0.15)'
                }}
              >
                AI Powered
              </span>
            </div>
            
            {/* Title - iOS 2026 SF Pro style */}
            <h1 className="text-center mb-4 relative">
              <span 
                className="block text-[32px] leading-[1.1] font-semibold"
                style={{ 
                  color: '#ffffff', 
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  letterSpacing: '-0.025em'
                }}
              >
                {t('aiProcess.heroTitle1')}
              </span>
              <span 
                className="block text-[32px] leading-[1.1] font-semibold mt-1"
                style={{ 
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 30%, #c084fc 60%, #e879f9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  letterSpacing: '-0.025em'
                }}
              >
                {t('aiProcess.heroTitle2')} {t('aiProcess.heroTitle3')}
              </span>
            </h1>
            
            {/* Subtitle - clean Inter typography */}
            <p 
              className="text-center text-[16px] leading-[1.5] font-medium relative"
              style={{ 
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'Inter, -apple-system, sans-serif',
                letterSpacing: '-0.01em'
              }}
            >
              {t('aiProcess.heroSubtitle1')}
            </p>
            <p 
              className="text-center text-[14px] leading-[1.5] mt-2 relative"
              style={{ 
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'Inter, -apple-system, sans-serif'
              }}
            >
              {t('aiProcess.heroSubtitle2')}
            </p>
          </div>

          {/* CTA Button - premium glass with purple glow */}
          <div className="flex items-center gap-2 mb-6">
            <a
              href="https://t.me/web4tgs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-3 rounded-2xl transition-all duration-200 active:scale-[0.97]"
              style={{ 
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(167,139,250,0.15) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                height: '58px',
                paddingLeft: '24px',
                paddingRight: '20px',
                border: '1px solid rgba(167,139,250,0.3)',
                boxShadow: '0 0 30px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              <MessageSquare className="w-5 h-5 text-violet-300 flex-shrink-0" />
              <span 
                className="text-[16px] font-semibold text-white"
                style={{ 
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  letterSpacing: '-0.01em'
                }}
              >
                {t('aiProcess.getConsultation')}
              </span>
              <ArrowRight className="w-5 h-5 text-violet-300 flex-shrink-0" />
            </a>
          </div>

          {/* Stats row - premium glass cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: '900M+', label: t('aiProcess.stats.users') },
              { value: '24/7', label: t('aiProcess.stats.support') },
              { value: '100%', label: t('aiProcess.stats.automation') }
            ].map((stat, i) => (
              <div
                key={i}
                className="py-4 px-2 rounded-2xl text-center relative overflow-hidden"
                style={{ 
                  background: 'rgba(139,92,246,0.06)', 
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(167,139,250,0.1)'
                }}
              >
                <span 
                  className="text-[20px] font-bold block"
                  style={{ 
                    color: '#e9d5ff',
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {stat.value}
                </span>
                <span 
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'rgba(196,181,253,0.6)' }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
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
              background: 'rgba(255,255,255,0.015)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: 'none'
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
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: 'none'
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
      background: 'rgba(255,255,255,0.015)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: 'none',
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
      background: 'rgba(255,255,255,0.015)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: 'none',
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
