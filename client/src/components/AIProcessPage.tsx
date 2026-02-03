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
        <section className="relative px-4 pt-4 pb-16">
          {/* iOS 26 Liquid Glass Hero Card */}
          <div 
            className="rounded-[28px] px-6 py-7 mb-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(60px) saturate(180%)',
              WebkitBackdropFilter: 'blur(60px) saturate(180%)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 0.5px 0 rgba(255,255,255,0.08)'
            }}
          >
            {/* Liquid Glass specular highlight */}
            <div 
              className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none rounded-t-[28px]"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)'
              }}
            />
            
            {/* Floating badge - Liquid Glass pill */}
            <div className="flex justify-center mb-5 relative">
              <span 
                className="px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: 'rgba(255,255,255,0.85)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                }}
              >
                ✦ AI Powered
              </span>
            </div>
            
            {/* Title - iOS 26 SF Pro Display */}
            <h1 className="text-center mb-4 relative">
              <span 
                className="block text-[28px] leading-[1.15] font-semibold"
                style={{ 
                  color: '#ffffff', 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  letterSpacing: '-0.02em'
                }}
              >
                {t('aiProcess.heroTitle1')}
              </span>
              <span 
                className="block text-[28px] leading-[1.15] font-semibold mt-0.5"
                style={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  letterSpacing: '-0.02em'
                }}
              >
                {t('aiProcess.heroTitle2')} {t('aiProcess.heroTitle3')}
              </span>
            </h1>
            
            {/* Subtitle - SF Pro Text */}
            <p 
              className="text-center text-[15px] leading-[1.47] font-normal relative"
              style={{ 
                color: 'rgba(255,255,255,0.8)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
              }}
            >
              {t('aiProcess.heroSubtitle1')}
            </p>
            <p 
              className="text-center text-[13px] leading-[1.38] mt-2 relative"
              style={{ 
                color: 'rgba(255,255,255,0.5)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
              }}
            >
              {t('aiProcess.heroSubtitle2')}
            </p>
          </div>

          {/* CTA Button - iOS 26 Liquid Glass floating button */}
          <div className="flex items-center gap-2 mb-5">
            <a
              href="https://t.me/web4tgs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2.5 rounded-[16px] transition-all duration-300 active:scale-[0.98]"
              style={{ 
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                height: '54px',
                paddingLeft: '20px',
                paddingRight: '16px',
                border: '0.5px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15), inset 0 0.5px 0 rgba(255,255,255,0.1)'
              }}
            >
              <MessageSquare className="w-[18px] h-[18px] text-white/90 flex-shrink-0" />
              <span 
                className="text-[15px] font-semibold text-white"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
                }}
              >
                {t('aiProcess.getConsultation')}
              </span>
              <ArrowRight className="w-[18px] h-[18px] text-white/60 flex-shrink-0" />
            </a>
          </div>

          {/* Stats row - iOS 26 Liquid Glass floating cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {[
              { value: '900M+', label: t('aiProcess.stats.users') },
              { value: '24/7', label: t('aiProcess.stats.support') },
              { value: '100%', label: t('aiProcess.stats.automation') }
            ].map((stat, i) => (
              <div
                key={i}
                className="py-4 px-2 rounded-[14px] text-center relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  border: '0.5px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
                }}
              >
                <span 
                  className="text-[18px] font-bold block"
                  style={{ 
                    color: '#ffffff',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {stat.value}
                </span>
                <span 
                  className="text-[10px] font-medium uppercase tracking-wide"
                  style={{ 
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-4 space-y-3">
          
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

        <section className="px-4 py-6">
          <h2 
            className="text-center mb-6"
            style={{
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: '1.15',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
            }}
          >
            {t('aiProcess.benefitsTitle1')}
            <br />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{t('aiProcess.benefitsTitle2')}</span>
          </h2>
          
          <div 
            className="rounded-[20px] p-6 space-y-4"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(60px) saturate(180%)',
              WebkitBackdropFilter: 'blur(60px) saturate(180%)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15), inset 0 0.5px 0 rgba(255,255,255,0.06)'
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

        <section className="px-4 py-6">
          <h2 
            className="text-center mb-6"
            style={{
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: '1.15',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
            }}
          >
            {t('aiProcess.whyTelegramTitle1')}
            <br />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{t('aiProcess.whyTelegramTitle2')}</span>
          </h2>
          
          <div className="space-y-3">
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

        <section className="px-4 py-8">
          <div 
            className="rounded-[20px] p-6 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(60px) saturate(180%)',
              WebkitBackdropFilter: 'blur(60px) saturate(180%)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 0.5px 0 rgba(255,255,255,0.08)'
            }}
          >
            {/* Specular highlight */}
            <div 
              className="absolute top-0 left-0 right-0 h-[50%] pointer-events-none rounded-t-[20px]"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)'
              }}
            />
            
            <div className="relative z-10">
              <h3 
                style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                  marginBottom: '8px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
                }}
              >
                {t('aiProcess.ctaTitle')}
              </h3>
              
              <p 
                style={{
                  fontSize: '15px',
                  lineHeight: '1.47',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '20px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
                }}
              >
                {t('aiProcess.ctaSubtitle1')}
                <br />
                {t('aiProcess.ctaSubtitle2')}
              </p>

              <button
                onClick={handleGetConsultation}
                className="w-full py-3.5 font-semibold rounded-[14px] transition-all duration-200 active:scale-[0.97] mb-3"
                style={{
                  fontSize: '16px',
                  letterSpacing: '-0.01em',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  color: '#000000',
                  boxShadow: '0 4px 20px rgba(255,255,255,0.2)',
                  border: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
                }}
                data-testid="button-get-consultation"
              >
                <span className="flex items-center justify-center gap-2">
                  {t('aiProcess.ctaButton')}
                  <ArrowRight className="w-4.5 h-4.5" />
                </span>
              </button>
              
              <p 
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
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
    className="rounded-[20px] p-5 relative overflow-hidden group active:scale-[0.98]"
    style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      backdropFilter: 'blur(60px) saturate(180%)',
      WebkitBackdropFilter: 'blur(60px) saturate(180%)',
      border: '0.5px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.15), inset 0 0.5px 0 rgba(255,255,255,0.06)',
      transition: 'transform 0.2s ease'
    }}
  >
    <div className="flex items-start gap-4">
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-[14px]"
        style={{
          width: '48px',
          height: '48px',
          background: accentGradient,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{ color: 'white' }}>
          {icon}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <h3 
            style={{
              fontSize: '17px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
            }}
          >
            {title}
          </h3>
          <div 
            className="px-2.5 py-1 rounded-full shrink-0"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 500,
              border: '0.5px solid rgba(255,255,255,0.05)'
            }}
          >
            {duration}
          </div>
        </div>
        <p 
          style={{
            fontSize: '14px',
            lineHeight: '1.47',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            marginBottom: '12px'
          }}
        >
          {description}
        </p>

        <div className="space-y-1.5">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-1 h-1 rounded-full"
                style={{ background: accentGradient }}
              />
              <span 
                style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
                }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));
ProcessStepPremium.displayName = 'ProcessStepPremium';

const BenefitItemPremium = memo(({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div 
      className="flex-shrink-0 flex items-center justify-center rounded-full"
      style={{
        width: '24px',
        height: '24px',
        background: 'rgba(52, 199, 89, 0.15)',
        border: '0.5px solid rgba(52, 199, 89, 0.2)'
      }}
    >
      <Check className="w-3.5 h-3.5 text-[#34C759]" />
    </div>
    <p 
      style={{
        fontSize: '15px',
        lineHeight: '1.47',
        color: 'rgba(255,255,255,0.85)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
        fontWeight: 400
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
    className="rounded-[20px] p-5 active:scale-[0.98]"
    style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      backdropFilter: 'blur(60px) saturate(180%)',
      WebkitBackdropFilter: 'blur(60px) saturate(180%)',
      border: '0.5px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.15), inset 0 0.5px 0 rgba(255,255,255,0.06)',
      transition: 'transform 0.2s ease'
    }}
  >
    <div className="flex gap-4">
      <div 
        style={{
          fontSize: '28px',
          lineHeight: '1',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h4 
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#ffffff',
            marginBottom: '4px',
            letterSpacing: '-0.02em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}
        >
          {title}
        </h4>
        <p 
          style={{
            fontSize: '14px',
            lineHeight: '1.47',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
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
