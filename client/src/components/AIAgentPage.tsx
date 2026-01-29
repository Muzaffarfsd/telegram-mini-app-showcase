import { memo, useCallback } from "react";
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
import { useLanguage } from '../contexts/LanguageContext';
import { SplineScene } from './ui/spline-scene';
import { Spotlight } from './ui/spotlight';
import { SparklesCore } from './ui/sparkles';

interface AIAgentPageProps {
  onNavigate: (path: string) => void;
}

const AIAgentPage = memo(({ onNavigate }: AIAgentPageProps) => {
  const { t } = useLanguage();
  
  const handleNavigateProcess = useCallback(() => {
    onNavigate('ai-process');
  }, [onNavigate]);

  return (
    <div className="ai-agent-page min-h-screen bg-[#000000] overflow-y-auto overflow-x-hidden relative" style={{ paddingTop: '100px', WebkitOverflowScrolling: 'touch' }}>
      {/* Background Sparkles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={2.0}
          particleDensity={150}
          className="w-full h-full opacity-50"
          particleColor="#FFFFFF"
        />
      </div>

      <section className="relative min-h-screen flex items-center justify-center px-5 overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 pointer-events-none" fill="#8B5CF6" />
        
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 180% 100% at 50% -15%, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.35) 40%, transparent 100%)',
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 15% 90%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 85% 10%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
          }}
        />
        
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full md:w-[60%] h-[400px] md:h-[600px]">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
        
        <div className="relative z-10 text-center w-full">
          <div className="flex justify-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                minWidth: '160px',
                justifyContent: 'center'
              }}
            >
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('aiAgent.forTelegram')}
              </span>
            </div>
          </div>

          <h1 
            className="mb-6 px-3"
            style={{ 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(52px, 20vw, 84px)',
              fontWeight: 900,
              letterSpacing: '-0.08em',
              lineHeight: '0.82',
              color: '#FFFFFF'
            }}
          >
            {t('aiAgent.heroTitle')}
          </h1>

          <div className="h-2 w-[120px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-full mx-auto mb-8 shadow-[0_0_20px_rgba(139,92,246,0.8)]" />
          
          <div className="mb-12">
            <p 
              className="px-5 text-center"
              style={{
                fontSize: '24px',
                lineHeight: '1.2',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '-0.04em',
              }}
            >
              <span>{t('aiAgent.heroSubtitle1')}</span>
              <br />
              <span className="text-emerald-400">{t('aiAgent.heroSubtitle2')}</span>
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-5 px-5">
            <button
              onClick={handleNavigateProcess}
              className="w-full max-w-[300px] group relative py-5 rounded-2xl font-black uppercase tracking-tighter"
              style={{
                fontSize: '18px',
                background: '#FFFFFF',
                color: '#000000',
                boxShadow: '0 15px 50px rgba(255, 255, 255, 0.3)',
                position: 'relative',
                zIndex: 50,
                pointerEvents: 'auto'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {t('aiAgent.tryButton')}
                <ArrowRight className="w-6 h-6" strokeWidth={3} />
              </span>
            </button>
            
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {t('aiAgent.freeTrial')}
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-32 px-5">
        <div className="max-w-xs mx-auto">
          <h2 className="text-center mb-24 text-[42px] font-black tracking-tighter text-white uppercase">
            {t('aiAgent.inNumbers')}
          </h2>

          <div className="space-y-12">
            <StatCard number="192%" label={t('aiAgent.roiPerYear')} sublabel={t('aiAgent.averageResult')} gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" />
            <StatCard number="24/7" label={t('aiAgent.alwaysOnline')} sublabel={t('aiAgent.noWeekends')} gradient="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" />
            <StatCard number="< 2s" label={t('aiAgent.responseTime')} sublabel={t('aiAgent.instant')} gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)" />
          </div>
        </div>
      </section>

      <section className="relative py-32 px-5 bg-neutral-900/20">
        <div className="max-w-xs mx-auto">
          <h2 className="text-center mb-6 text-[42px] font-black tracking-tighter text-white uppercase">
            {t('aiAgent.capabilities')}
          </h2>
          
          <p className="text-center mb-20 text-[18px] text-white/40 font-medium">
            {t('aiAgent.everythingForSuccess')}
          </p>

          <div className="space-y-16">
            <FeatureBlock icon={<Zap className="w-10 h-10" strokeWidth={2.5} />} title={t('aiAgent.instantLaunch')} description={t('aiAgent.tenMinutesReady')} gradient="linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)" />
            <FeatureBlock icon={<Shield className="w-10 h-10" strokeWidth={2.5} />} title={t('aiAgent.security')} description={t('aiAgent.encryptionGdpr')} gradient="linear-gradient(135deg, #10B981 0%, #047857 100%)" />
            <FeatureBlock icon={<Globe className="w-10 h-10" strokeWidth={2.5} />} title={t('aiAgent.languages150')} description={t('aiAgent.understandsEveryone')} gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" />
            <FeatureBlock icon={<Brain className="w-10 h-10" strokeWidth={2.5} />} title={t('aiAgent.learnsItself')} description={t('aiAgent.getsBetter')} gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" />
          </div>
        </div>
      </section>

      <section className="relative py-32 px-5">
        <div className="max-w-xs mx-auto">
          <h2 className="text-center mb-20 text-[42px] font-black tracking-tighter text-white uppercase">
            {t('aiAgent.whyUs')}
          </h2>

          <div className="space-y-8">
            <BenefitItem icon={<Clock className="w-7 h-7" strokeWidth={3} />} text={t('aiAgent.neverSleeps')} subtext={t('aiAgent.noBreaks247')} />
            <BenefitItem icon={<Zap className="w-7 h-7" strokeWidth={3} />} text={t('aiAgent.respondsInstantly')} subtext={t('aiAgent.lessThan2Seconds')} />
            <BenefitItem icon={<TrendingUp className="w-7 h-7" strokeWidth={3} />} text={t('aiAgent.paysOffQuickly')} subtext={t('aiAgent.percentPerYear')} />
          </div>
        </div>
      </section>

      <section className="relative py-40 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[120px]" />
        
        <div className="relative z-10 text-center max-w-xs mx-auto">
          <h2 className="mb-8 text-[56px] font-black tracking-[-0.1em] text-white leading-none uppercase">
            {t('aiAgent.startToday')}
          </h2>
          
          <button
            onClick={handleNavigateProcess}
            className="w-full py-6 bg-white text-black font-black text-xl rounded-3xl shadow-[0_30px_100px_rgba(255,255,255,0.5)] active:scale-95 transition-all"
          >
            {t('aiAgent.launchAi')}
          </button>
        </div>
      </section>
    </div>
  );
});

AIAgentPage.displayName = 'AIAgentPage';

const StatCard = memo(({ number, label, sublabel, gradient }: { 
  number: string; 
  label: string; 
  sublabel: string;
  gradient: string;
}) => (
  <div className="text-center p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl">
    <div className="mb-4 text-[88px] font-black tracking-tighter leading-none bg-clip-text text-transparent" style={{ backgroundImage: gradient }}>
      {number}
    </div>
    <p className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{label}</p>
    <p className="text-white/40 text-sm font-medium">{sublabel}</p>
  </div>
));

const FeatureBlock = memo(({ icon, title, description, gradient }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) => (
  <div className="text-center group">
    <div 
      className="w-28 h-28 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl"
      style={{ background: gradient }}
    >
      <div className="text-white drop-shadow-lg">{icon}</div>
    </div>
    <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">{title}</h3>
    <p className="text-white/60 text-lg leading-relaxed px-4">{description}</p>
  </div>
));

const BenefitItem = memo(({ icon, text, subtext }: { 
  icon: React.ReactNode; 
  text: string;
  subtext: string;
}) => (
  <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
      {icon}
    </div>
    <div className="text-left">
      <p className="text-xl font-black text-white leading-tight mb-1">{text}</p>
      <p className="text-white/40 font-medium">{subtext}</p>
    </div>
  </div>
));

export default AIAgentPage;
