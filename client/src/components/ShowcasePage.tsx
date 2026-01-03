import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { useCallback, memo, useState, useEffect, useRef } from "react";
import { m, AnimatePresence, useSpring, useTransform, useInView } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { preloadDemo } from './demos/DemoRegistry';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import { FavoriteButton } from './FavoriteButton';
import { useLanguage } from '../contexts/LanguageContext';
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

function AnimatedCounter({ value, suffix = "", delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: 1500, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        spring.set(value);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, spring, value, delay]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [display]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

const headlinesRu = [
  "у конкурентов",
  "на рынке",
  "в России", 
  "в СНГ",
  "в вашей нише"
];

const headlinesEn = [
  "your competitors have",
  "in the market",
  "in your industry", 
  "in your region"
];

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const { t, language } = useLanguage();
  const headlines = language === 'ru' ? headlinesRu : headlinesEn;
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const { videoRef } = useVideoLazyLoad({ threshold: 0.25 });
  const { markAsViewed, viewedCount } = useViewedDemos();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

    
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    markAsViewed(demoId);
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo, markAsViewed]);

  const handleNavigate = useCallback((section: string) => {
    haptic.light();
    onNavigate(section);
  }, [haptic, onNavigate]);

  return (
    <div 
      className="min-h-screen transition-colors duration-300 showcase-page"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div 
        className="max-w-lg mx-auto px-5"
        style={{ paddingTop: '120px' }}
      >
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-[75vh] flex flex-col justify-start pt-4"
        >
          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="mb-8">
              <span 
                className="block text-[44px] leading-[1.02] font-semibold"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.035em' }}
              >
                {t('showcase.heroTitle')}
              </span>
              <span 
                className="block text-[44px] leading-[1.02] font-semibold"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.035em' }}
              >
                {t('showcase.heroTitle2')}
              </span>
              <div className="h-[54px] overflow-hidden mt-1">
                <AnimatePresence mode="wait">
                  <m.span
                    key={headlineIndex}
                    initial={{ y: 60, opacity: 0, filter: 'blur(8px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -60, opacity: 0, filter: 'blur(8px)' }}
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    className="block text-[44px] leading-[1.02] font-semibold"
                    style={{ color: 'var(--cta-background)', letterSpacing: '-0.035em' }}
                  >
                    {headlines[headlineIndex]}
                  </m.span>
                </AnimatePresence>
              </div>
            </h1>

            <div className="mb-10 max-w-[340px]">
              <p 
                className="text-[17px] leading-[1.5]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {t('showcase.heroDescription')}
              </p>
              <p 
                className="text-[17px] leading-[1.5] mt-3"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {t('showcase.heroDescription2')} <span style={{ color: 'var(--cta-background)', whiteSpace: 'nowrap' }}>{t('showcase.heroAccent2')}</span>.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <m.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavigate('projects')}
                className="flex items-center justify-center gap-3 rounded-full transition-colors duration-300"
                style={{ 
                  background: 'var(--cta-background)',
                  minWidth: '180px',
                  height: '52px',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}
                data-testid="cta-primary"
              >
                <span className="text-[15px] font-semibold" style={{ color: 'var(--cta-foreground)', whiteSpace: 'nowrap' }}>
                  {t('showcase.orderProject')}
                </span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cta-foreground)' }} />
              </m.button>
              
              <m.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleOpenDemo('clothing-store')}
                onMouseEnter={() => preloadDemo('clothing-store')}
                onTouchStart={() => preloadDemo('clothing-store')}
                className="flex items-center justify-center gap-2 rounded-full transition-colors duration-300"
                style={{ 
                  border: '1px solid var(--cta-secondary-border)',
                  minWidth: '140px',
                  height: '52px',
                  paddingLeft: '20px',
                  paddingRight: '20px'
                }}
                data-testid="cta-demo"
              >
                <span className="text-[15px] font-medium" style={{ color: 'var(--cta-secondary-text)', whiteSpace: 'nowrap' }}>
                  {t('showcase.openApp')}
                </span>
              </m.button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-12">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-4 rounded-2xl text-center transition-colors duration-300"
                style={{ backgroundColor: 'var(--card-bg)', minHeight: '88px' }}
              >
                <div className="text-[26px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedCounter value={127} suffix="+" delay={0.3} />
                </div>
                <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-tertiary)', lineHeight: '1.3' }}>
                  {t('showcase.clients')}
                </div>
              </m.div>
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="p-4 rounded-2xl text-center transition-colors duration-300"
                style={{ backgroundColor: 'var(--card-bg)', minHeight: '88px' }}
              >
                <div className="text-[26px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedCounter value={24} suffix={t('showcase.hours')} delay={0.4} />
                </div>
                <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-tertiary)', lineHeight: '1.3' }}>
                  {t('showcase.toLaunch')}
                </div>
              </m.div>
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="p-4 rounded-2xl text-center transition-colors duration-300"
                style={{ backgroundColor: 'color-mix(in srgb, var(--cta-background) 15%, transparent)', minHeight: '88px' }}
              >
                <div className="text-[26px] font-semibold" style={{ color: 'var(--cta-background)' }}>
                  +<AnimatedCounter value={300} suffix="%" delay={0.5} />
                </div>
                <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'color-mix(in srgb, var(--cta-background) 60%, transparent)', lineHeight: '1.3' }}>
                  {t('showcase.toSales')}
                </div>
              </m.div>
            </div>
          </m.div>
        </m.section>

        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-[13px] font-medium tracking-[0.08em] uppercase transition-colors duration-300"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {t('showcase.projectsTitle')}
            </h2>
            <button
              onClick={() => handleNavigate('projects')}
              className="text-[13px] font-medium flex items-center gap-1 transition-colors duration-300"
              style={{ color: 'var(--text-tertiary)' }}
              data-testid="view-all"
            >
              {t('showcase.all')} <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileTap={{ scale: 0.98 }}
              className="col-span-2 relative rounded-3xl overflow-hidden cursor-pointer group nav-depth-zone transition-colors duration-300"
              onClick={() => handleOpenDemo('luxury-watches')}
              onMouseEnter={() => preloadDemo('luxury-watches')}
              onTouchStart={() => preloadDemo('luxury-watches')}
              data-testid="bento-main"
              data-depth-zone
              style={{ backgroundColor: 'var(--surface-elevated)' }}
            >
              <div className="relative h-[280px] overflow-hidden">
                <video
                  ref={videoRef}
                  src="/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4"
                  loop
                  muted
                  playsInline
                  autoPlay
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: 'brightness(0.6)' }}
                />
                <div 
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.95) 100%)' }}
                />
                
                <div className="absolute top-5 right-5 flex items-center gap-2">
                  <FavoriteButton demoId="luxury-watches" size="md" />
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{ backgroundColor: 'var(--overlay-strong)' }}
                  >
                    <Play className="w-4 h-4" style={{ color: 'var(--text-inverted)', fill: 'var(--text-inverted)' }} />
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-[22px] font-semibold mb-1 text-white">
                        Watch Store
                      </h3>
                      <p className="text-[14px] text-white/55">
                        {t('showcase.watchStoreDesc')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[24px] font-bold" style={{ color: 'var(--cta-background)' }}>+340%</div>
                      <div className="text-[11px] uppercase tracking-wider text-white/40">
                        {t('showcase.sales')}
                      </div>
                    </div>
                  </div>
                  <m.button
                    whileTap={{ scale: 0.97 }}
                    className="mt-4 w-full py-3 rounded-xl text-[14px] font-medium transition-colors duration-300"
                    style={{ backgroundColor: 'var(--overlay-medium)', color: 'var(--text-inverted)' }}
                    onClick={(e) => { e.stopPropagation(); handleOpenDemo('luxury-watches'); }}
                    data-testid="btn-open-watches"
                  >
                    {t('showcase.open')}
                  </m.button>
                </div>
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4] nav-depth-zone transition-colors duration-300"
              onClick={() => handleOpenDemo('sneaker-store')}
              onMouseEnter={() => preloadDemo('sneaker-store')}
              onTouchStart={() => preloadDemo('sneaker-store')}
              data-testid="bento-sneaker"
              data-depth-zone
              style={{ backgroundColor: 'var(--surface-elevated)' }}
            >
              <img
                src={nikeGreenImage}
                alt="Sneaker Store"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'brightness(0.65)' }}
              />
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.95) 100%)' }}
              />
              <div className="absolute top-3 right-3">
                <FavoriteButton demoId="sneaker-store" size="sm" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[18px] font-semibold mb-0.5 text-white">
                  Sneaker Store
                </div>
                <div className="text-[12px] mb-2 text-white/50">
                  {t('showcase.sneakerStoreDesc')}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[16px] font-bold" style={{ color: 'var(--cta-background)' }}>+280%</div>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--overlay-medium)' }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4] nav-depth-zone transition-colors duration-300"
              onClick={() => handleOpenDemo('luxury-watches')}
              onMouseEnter={() => preloadDemo('luxury-watches')}
              onTouchStart={() => preloadDemo('luxury-watches')}
              data-testid="bento-luxury"
              data-depth-zone
              style={{ backgroundColor: 'var(--surface-elevated)' }}
            >
              <img
                src={rascalImage}
                alt="Premium Brand"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'brightness(0.65)' }}
              />
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.95) 100%)' }}
              />
              <div className="absolute top-3 right-3">
                <FavoriteButton demoId="clothing-store" size="sm" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[18px] font-semibold mb-0.5 text-white">
                  {t('showcase.premiumBrand')}
                </div>
                <div className="text-[12px] mb-2 text-white/50">
                  {t('showcase.personalSelection')}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[16px] font-bold" style={{ color: 'var(--cta-background)' }}>+195%</div>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--overlay-medium)' }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square nav-depth-zone transition-colors duration-300"
              onClick={() => handleOpenDemo('restaurant')}
              onMouseEnter={() => preloadDemo('restaurant')}
              onTouchStart={() => preloadDemo('restaurant')}
              data-testid="bento-restaurant"
              data-depth-zone
              style={{ backgroundColor: 'var(--surface-elevated)' }}
            >
              <img
                src={nikeDestinyImage}
                alt="Restaurant"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'brightness(0.65)' }}
              />
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.95) 100%)' }}
              />
              <div className="absolute top-3 right-3">
                <FavoriteButton demoId="restaurant" size="sm" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[16px] font-semibold mb-0.5 text-white">
                  {t('showcase.restaurant')}
                </div>
                <div className="text-[11px] text-white/50">
                  {t('showcase.menuDelivery')}
                </div>
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl cursor-pointer group aspect-square flex flex-col items-center justify-center nav-depth-zone transition-colors duration-300"
              onClick={() => handleNavigate('projects')}
              data-testid="bento-all"
              data-depth-zone
              style={{ backgroundColor: 'var(--surface-elevated)' }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ border: '1px solid var(--card-border)' }}
              >
                <ArrowRight className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </div>
              <div className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t('showcase.allProjects')}
              </div>
              <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                {t('showcase.cases')}
              </div>
            </m.div>
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="py-12 border-t transition-colors duration-300"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <h2 
            className="text-[13px] font-medium tracking-[0.08em] uppercase mb-6 transition-colors duration-300"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {t('showcase.includedTitle')}
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: t('showcase.payment'), desc: t('showcase.paymentDesc'), tonal: 'ios26-tonal-blue', icon: '💳' },
              { title: t('showcase.aiBot'), desc: t('showcase.aiBotDesc'), tonal: 'ios26-tonal-purple', icon: '🤖' },
              { title: t('showcase.analytics'), desc: 'Realtime', tonal: 'ios26-tonal-green', icon: '📊' },
              { title: t('showcase.crm'), desc: t('showcase.crmDesc'), tonal: 'ios26-tonal-orange', icon: '📋' },
            ].map((item, i) => (
              <div 
                key={i}
                className={`p-4 rounded-xl transition-all duration-300 ios26-feature-card ${item.tonal} ios26-luminous`}
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div className="text-[14px] font-medium mb-0.5 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div className="text-[12px] transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="py-12 border-t transition-colors duration-300"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center">
              <div className="text-[28px] font-semibold mb-0.5 transition-colors duration-300" style={{ color: 'var(--cta-background)' }}>24{t('showcase.hours')}</div>
              <div className="text-[10px] uppercase tracking-wider transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
                {t('showcase.launch')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[28px] font-semibold mb-0.5 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>127+</div>
              <div className="text-[10px] uppercase tracking-wider transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
                {t('showcase.projects')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[28px] font-semibold mb-0.5 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>4.9</div>
              <div className="text-[10px] uppercase tracking-wider transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
                {t('showcase.rating')}
              </div>
            </div>
          </div>

          <m.div
            whileTap={{ scale: 0.985 }}
            className="rounded-2xl p-6 cursor-pointer transition-colors duration-300"
            onClick={() => handleNavigate('projects')}
            data-testid="cta-bottom"
            style={{ background: 'var(--cta-background)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold mb-0.5" style={{ color: 'var(--cta-foreground)' }}>
                  {t('showcase.discussProject')}
                </div>
                <div className="text-[13px]" style={{ color: 'color-mix(in srgb, var(--cta-foreground) 60%, transparent)' }}>
                  {t('showcase.freeConsultation')}
                </div>
              </div>
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'color-mix(in srgb, var(--cta-foreground) 15%, transparent)' }}
              >
                <ArrowRight className="w-5 h-5" style={{ color: 'var(--cta-foreground)' }} />
              </div>
            </div>
          </m.div>
        </m.section>

        <div className="pb-32 pt-4">
          <div className="text-center">
            <div 
              className="text-[10px] font-medium tracking-[0.2em] uppercase transition-colors duration-300 light:text-black"
              style={{ color: 'var(--text-quaternary)' }}
            >
              WEB4TG
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ShowcasePage);
