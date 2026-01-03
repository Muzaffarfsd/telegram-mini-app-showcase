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
import { useLanguage } from '../contexts/LanguageContext';

interface AIProcessPageProps {
  onNavigate: (path: string) => void;
}

const AIProcessPage = memo(({ onNavigate }: AIProcessPageProps) => {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  
  const handleGetConsultation = useCallback(() => {
    window.open('https://t.me/web4tgs', '_blank');
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen pb-24 overflow-hidden smooth-scroll-page" style={{ paddingTop: '140px', backgroundColor: 'var(--surface)' }}>
      <div className="max-w-md mx-auto">
        
        <section className="relative px-6 pt-8 pb-16">
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 122, 255, 0.2) 0%, transparent 60%)',
              transform: `translateY(${scrollY * 0.3}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          <div className="relative z-10">
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
                  {t('aiProcess.badge')}
                </span>
              </div>
            </div>

            <h1 
              className="text-center mb-5 scroll-fade-in-delay-1"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(40px, 11vw, 52px)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: '1.05',
                color: 'var(--text-primary)'
              }}
            >
              {t('aiProcess.heroTitle1')}
              <br />
              {t('aiProcess.heroTitle2')}
              <br />
              {t('aiProcess.heroTitle3')}
            </h1>
            
            <p 
              className="text-center mb-3 scroll-fade-in-delay-2"
              style={{
                fontSize: '19px',
                lineHeight: '1.42',
                fontWeight: 400,
                color: 'var(--text-tertiary)',
                letterSpacing: '-0.015em'
              }}
            >
              {t('aiProcess.heroSubtitle1')}
              <br />
              {t('aiProcess.heroSubtitle2')}
            </p>

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
                {t('aiProcess.getConsultation')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <div className="flex justify-center gap-8 mb-8 scroll-fade-in-delay-4">
              <StatBadge number="900M+" label={t('aiProcess.stats.users')} />
              <StatBadge number="24/7" label={t('aiProcess.stats.support')} />
              <StatBadge number="100%" label={t('aiProcess.stats.automation')} />
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
              background: 'var(--card-bg)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--glass-shadow-style)'
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
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(88, 86, 214, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 122, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 122, 255, 0.2)'
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
  );
});

AIProcessPage.displayName = 'AIProcessPage';

const StatBadge = memo(({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div 
      style={{
        fontSize: '24px',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: 'var(--text-primary)',
        lineHeight: '1',
        marginBottom: '4px'
      }}
    >
      {number}
    </div>
    <div 
      style={{
        fontSize: '12px',
        color: 'var(--text-quaternary)',
        letterSpacing: '0.02em',
        textTransform: 'uppercase'
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
      background: 'var(--card-bg)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--card-border)',
      boxShadow: 'var(--glass-shadow-style)',
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
      background: 'var(--card-bg)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--card-border)',
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
