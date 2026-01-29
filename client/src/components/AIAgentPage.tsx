import { memo, useCallback, useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
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

interface AIAgentPageProps {
  onNavigate: (path: string) => void;
}

const AIAgentPage = memo(({ onNavigate }: AIAgentPageProps) => {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 25,
    stiffness: 100
  });

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
    <div className="ai-agent-page min-h-screen bg-[#000000] overflow-y-auto overflow-x-hidden" style={{ paddingTop: '140px', WebkitOverflowScrolling: 'touch' }}>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#3B82F6] z-[100] origin-left"
        style={{ scaleX: smoothProgress }}
      />

      <section className="relative min-h-screen flex items-center justify-center px-5 overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 pointer-events-none" fill="#8B5CF6" />
        
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 180% 100% at 50% -15%, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.35) 40%, transparent 100%)',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 15% 90%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 85% 10%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        
        <div className="absolute inset-0 z-0 pointer-events-none md:pointer-events-auto">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full md:w-[60%] h-[400px] md:h-[600px]">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
        
        <div className="relative z-10 text-center w-full md:flex-1 md:text-left md:pl-8">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex justify-center mb-8"
          >
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
              <Sparkles className="w-4 h-4 text-[#8B5CF6] animate-pulse" />
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
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 px-3"
            style={{ 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(52px, 20vw, 84px)',
              fontWeight: 900,
              letterSpacing: '-0.08em',
              lineHeight: '0.82',
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('aiAgent.heroTitle')}
          </motion.h1>

          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "120px" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-full mx-auto mb-8 shadow-[0_0_20px_rgba(139,92,246,0.8)]"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
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
              <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">{t('aiAgent.heroSubtitle2')}</span>
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col items-center gap-5 px-5"
          >
            <motion.button
              onClick={handleNavigateProcess}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(255, 255, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full max-w-[300px] group relative py-5 rounded-2xl font-black uppercase tracking-tighter"
              style={{
                fontSize: '18px',
                background: '#FFFFFF',
                color: '#000000',
                boxShadow: '0 15px 50px rgba(255, 255, 255, 0.3)',
                transition: 'box-shadow 0.3s ease',
                position: 'relative',
                zIndex: 50,
                pointerEvents: 'auto'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {t('aiAgent.tryButton')}
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2 duration-500" strokeWidth={3} />
              </span>
            </motion.button>
            
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {t('aiAgent.freeTrial')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative py-32 px-5">
        <div className="max-w-xs mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            className="text-center mb-24 text-[42px] font-black tracking-tighter text-white uppercase"
          >
            {t('aiAgent.inNumbers')}
          </motion.h2>

          <div className="space-y-24">
            <StatCard number="192%" label={t('aiAgent.roiPerYear')} sublabel={t('aiAgent.averageResult')} gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" />
            <StatCard number="24/7" label={t('aiAgent.alwaysOnline')} sublabel={t('aiAgent.noWeekends')} gradient="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" />
            <StatCard number="< 2s" label={t('aiAgent.responseTime')} sublabel={t('aiAgent.instant')} gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)" />
          </div>
        </div>
      </section>

      <section className="py-32 px-5 bg-gradient-to-b from-black via-neutral-900/20 to-black">
        <div className="max-w-xs mx-auto">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            className="text-center mb-6 text-[42px] font-black tracking-tighter text-white uppercase"
          >
            {t('aiAgent.capabilities')}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-20 text-[18px] text-white/40 font-medium"
          >
            {t('aiAgent.everythingForSuccess')}
          </motion.p>

          <div className="space-y-16">
            <FeatureBlock icon={<Zap className="w-10 h-10" strokeWidth={2.5} />} title={t('aiAgent.instantLaunch')} description={t('aiAgent.tenMinutesReady')} gradient="linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)" />
            <FeatureBlock icon={<Shield className="w-10 h-10" strokeWidth={2.5} />} title={t('aiAgent.security')} description={t('aiAgent.encryptionGdpr')} gradient="linear-gradient(135deg, #10B981 0%, #047857 100%)" />
            <FeatureBlock icon={<Globe className="w-10 h-10" strokeWidth={2.5} />} title={t('aiAgent.languages150')} description={t('aiAgent.understandsEveryone')} gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" />
            <FeatureBlock icon={<Brain className="w-10 h-10" strokeWidth={2.5} />} title={t('aiAgent.learnsItself')} description={t('aiAgent.getsBetter')} gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" />
          </div>
        </div>
      </section>

      <section className="py-32 px-5">
        <div className="max-w-xs mx-auto">
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-center mb-20 text-[42px] font-black tracking-tighter text-white uppercase"
          >
            {t('aiAgent.whyUs')}
          </motion.h2>

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
          <motion.h2 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-8 text-[56px] font-black tracking-[ -0.1em] text-white leading-none uppercase"
          >
            {t('aiAgent.startToday')}
          </motion.h2>
          
          <motion.button
            onClick={handleNavigateProcess}
            whileHover={{ scale: 1.1, rotate: [0, -1, 1, 0] }}
            className="w-full py-6 bg-white text-black font-black text-xl rounded-3xl shadow-[0_30px_100px_rgba(255,255,255,0.5)] active:scale-95 transition-all"
          >
            {t('aiAgent.launchAi')}
          </motion.button>
        </div>
      </section>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-20px); opacity: 0.1; }
        }
      `}</style>
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
  <motion.div 
    initial={{ opacity: 0, scale: 0.5, y: 100, rotateX: 30 }}
    whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
    viewport={{ once: false, margin: "-10%" }}
    transition={{ type: "spring", damping: 12, stiffness: 50 }}
    className="text-center p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl mb-12"
  >
    <div className="mb-4 text-[88px] font-black tracking-tighter leading-none bg-clip-text text-transparent" style={{ backgroundImage: gradient }}>
      {number}
    </div>
    <p className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{label}</p>
    <p className="text-white/40 text-sm font-medium">{sublabel}</p>
  </motion.div>
));

const FeatureBlock = memo(({ icon, title, description, gradient }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, x: -100, rotateY: -40 }}
    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
    viewport={{ once: false, margin: "-10%" }}
    className="text-center group mb-16"
  >
    <motion.div 
      whileHover={{ scale: 1.2, rotate: 10 }}
      className="w-28 h-28 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl"
      style={{ background: gradient }}
    >
      <div className="text-white drop-shadow-lg">{icon}</div>
    </motion.div>
    <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">{title}</h3>
    <p className="text-white/60 text-lg leading-relaxed px-4">{description}</p>
  </motion.div>
));

const BenefitItem = memo(({ icon, text, subtext }: { 
  icon: React.ReactNode; 
  text: string;
  subtext: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, margin: "-5%" }}
    className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 mb-6"
  >
    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
      {icon}
    </div>
    <div className="text-left">
      <p className="text-xl font-black text-white leading-tight mb-1">{text}</p>
      <p className="text-white/40 font-medium">{subtext}</p>
    </div>
  </motion.div>
));

export default AIAgentPage;
