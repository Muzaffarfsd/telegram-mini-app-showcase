import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { useCallback, memo, useState, useEffect, useRef } from "react";
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { preloadDemo } from './demos/DemoRegistry';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import { FavoriteButton } from './FavoriteButton';
import { useLanguage } from '../contexts/LanguageContext';
import { Stories, type Story } from './Stories';
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

const demoStories: Story[] = [
  {
    id: 'story-1',
    title: 'Radiance',
    subtitle: 'Digital Fashion Store',
    image: '/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg',
    demoId: 'clothing-store'
  },
  {
    id: 'story-2',
    title: 'TimeElite',
    subtitle: 'Luxury Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80',
    video: '/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4',
    demoId: 'luxury-watches'
  },
  {
    id: 'story-3',
    title: 'SneakerVault',
    subtitle: 'Rare Drops',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80',
    demoId: 'sneaker-store'
  },
  {
    id: 'story-4',
    title: 'GlowSpa',
    subtitle: 'Premium Beauty',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80',
    demoId: 'beauty'
  }
];

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

function AnimatedCounter({ value, suffix = "", delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      const startTime = performance.now();
      const duration = 800;
      
      const animate = (currentTime: number) => {
        if (cancelled) return;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return <span>{displayValue}{suffix}</span>;
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
  
  // Optimized headline rotation - pauses when page hidden or reduced motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    let intervalId: ReturnType<typeof setInterval> | null = null;
    
    const startInterval = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          setHeadlineIndex((prev) => (prev + 1) % headlines.length);
        }, 2500);
      }
    };
    
    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    
    const handleVisibility = () => {
      if (document.hidden) stopInterval();
      else startInterval();
    };
    
    if (!document.hidden) startInterval();
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [headlines.length]);

    
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
        <section
          className="min-h-[75vh] flex flex-col justify-start pt-4 animate-in fade-in duration-500"
        >
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
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
              <div className="h-[54px] overflow-visible mt-1 relative">
                <div 
                  key={`glow-${headlineIndex}`}
                  className="absolute inset-0 animate-in fade-in duration-700"
                  style={{
                    background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 40%, transparent 70%)',
                    filter: 'blur(20px)',
                    transform: 'translateY(4px) scale(1.2)',
                    pointerEvents: 'none'
                  }}
                />
                <span
                  key={headlineIndex}
                  className="block text-[44px] leading-[1.02] font-semibold animate-in fade-in slide-in-from-bottom-8 duration-500 relative"
                  style={{ 
                    color: 'var(--cta-background)', 
                    letterSpacing: '-0.035em'
                  }}
                >
                  {headlines[headlineIndex]}
                </span>
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigate('projects')}
                className="flex-1 flex items-center justify-center gap-2 rounded-full transition-all duration-200 active:scale-[0.97]"
                style={{ 
                  background: 'var(--cta-background)',
                  height: '48px',
                  paddingLeft: '14px',
                  paddingRight: '12px',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
                data-testid="cta-primary"
              >
                <span 
                  className="text-[13px]" 
                  style={{ 
                    color: 'var(--cta-foreground)', 
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('showcase.orderProject')}
                </span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cta-foreground)' }} strokeWidth={2.5} />
              </button>
              
              <button
                onClick={() => handleOpenDemo('clothing-store')}
                onMouseEnter={() => preloadDemo('clothing-store')}
                onTouchStart={() => preloadDemo('clothing-store')}
                className="flex-1 flex items-center justify-center gap-2 rounded-full transition-all duration-200 active:scale-[0.97]"
                style={{ 
                  border: '1.5px solid var(--cta-secondary-border)',
                  height: '48px',
                  paddingLeft: '12px',
                  paddingRight: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  boxShadow: '0 8px 24px rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                }}
                data-testid="cta-demo"
              >
                <Play className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cta-secondary-text)' }} fill="currentColor" />
                <span 
                  className="text-[13px]" 
                  style={{ 
                    color: 'var(--cta-secondary-text)',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('showcase.openApp')}
                </span>
              </button>
            </div>

            <div className="mt-12 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-system-blue/10 blur-[80px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-system-purple/10 blur-[80px] rounded-full" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-system-blue to-system-purple flex items-center justify-center shadow-lg shadow-system-blue/20">
                    <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                  <div>
                    <h2 
                      className="text-[17px] font-bold tracking-tight leading-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {language === 'ru' ? 'Быстрый обзор демо' : 'Quick Demo Overview'}
                    </h2>
                    <p className="text-[12px] text-system-blue font-medium mt-0.5 opacity-80">
                      {language === 'ru' ? 'Посмотрите ключевые функции за 15 секунд' : 'See key features in 15 seconds'}
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <Stories stories={demoStories} onOpenDemo={handleOpenDemo} />
                  
                  {/* Visual Instruction Overlay (visible only first time or subtle hint) */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="flex flex-col items-center gap-1 animate-bounce">
                      <ArrowRight className="w-4 h-4 text-system-blue opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div
                className="p-4 rounded-2xl text-center transition-colors duration-300 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ backgroundColor: 'var(--card-bg)', height: '88px' }}
              >
                <div className="text-[26px] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedCounter value={127} suffix="+" delay={0.3} />
                </div>
                <div className="text-[9px] uppercase tracking-wider mt-2 h-[24px] flex items-center justify-center" style={{ color: 'var(--text-tertiary)', lineHeight: '1.3' }}>
                  {t('showcase.clients')}
                </div>
              </div>
              <div
                className="p-4 rounded-2xl text-center transition-colors duration-300 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100"
                style={{ backgroundColor: 'var(--card-bg)', height: '88px' }}
              >
                <div className="text-[26px] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedCounter value={24} suffix={t('showcase.hours')} delay={0.4} />
                </div>
                <div className="text-[9px] uppercase tracking-wider mt-2 h-[24px] flex items-center justify-center" style={{ color: 'var(--text-tertiary)', lineHeight: '1.3' }}>
                  {t('showcase.toLaunch')}
                </div>
              </div>
              <div
                className="p-4 rounded-2xl text-center transition-colors duration-300 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200"
                style={{ backgroundColor: 'color-mix(in srgb, var(--cta-background) 15%, transparent)', height: '88px' }}
              >
                <div className="text-[26px] font-semibold leading-none" style={{ color: 'var(--cta-background)' }}>
                  +<AnimatedCounter value={300} suffix="%" delay={0.5} />
                </div>
                <div className="text-[9px] uppercase tracking-wider mt-2 h-[24px] flex items-center justify-center" style={{ color: 'color-mix(in srgb, var(--cta-background) 60%, transparent)', lineHeight: '1.3' }}>
                  {t('showcase.toSales')}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-8 animate-in fade-in duration-500">
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
            <div
              className="col-span-2 relative rounded-3xl overflow-hidden cursor-pointer group nav-depth-zone transition-all duration-300 active:scale-[0.98] animate-in fade-in duration-500"
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
                  <button
                    className="mt-4 w-full py-3 rounded-xl text-[14px] font-medium transition-all duration-200 active:scale-[0.97]"
                    style={{ backgroundColor: 'var(--overlay-medium)', color: 'var(--text-inverted)' }}
                    onClick={(e) => { e.stopPropagation(); handleOpenDemo('luxury-watches'); }}
                    data-testid="btn-open-watches"
                  >
                    {t('showcase.open')}
                  </button>
                </div>
              </div>
            </div>

            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4] nav-depth-zone transition-all duration-300 active:scale-[0.98] animate-in fade-in duration-500 delay-100"
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
            </div>

            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4] nav-depth-zone transition-all duration-300 active:scale-[0.98] animate-in fade-in duration-500 delay-150"
              onClick={() => handleOpenDemo('clothing-store')}
              onMouseEnter={() => preloadDemo('clothing-store')}
              onTouchStart={() => preloadDemo('clothing-store')}
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
            </div>

            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square nav-depth-zone transition-all duration-300 active:scale-[0.98] animate-in fade-in duration-500 delay-200"
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
            </div>

            <div
              className="rounded-2xl cursor-pointer group aspect-square flex flex-col items-center justify-center nav-depth-zone transition-all duration-300 active:scale-[0.98] animate-in fade-in duration-500 delay-300"
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
            </div>
          </div>
        </section>

        <section
          className="py-12 border-t transition-colors duration-300 animate-in fade-in duration-500"
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
                className={`p-4 rounded-xl transition-all duration-300 ios26-feature-card ${item.tonal} ios26-luminous h-[72px] flex flex-col justify-center`}
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div className="text-[14px] font-medium leading-tight transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div className="text-[12px] mt-0.5 transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="py-12 border-t transition-colors duration-300 animate-in fade-in duration-500"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center flex flex-col items-center justify-center h-[60px]">
              <div className="text-[28px] font-semibold leading-none transition-colors duration-300" style={{ color: 'var(--cta-background)' }}>24{t('showcase.hours')}</div>
              <div className="text-[10px] uppercase tracking-wider mt-1 h-[20px] flex items-center justify-center transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
                {t('showcase.launch')}
              </div>
            </div>
            <div className="text-center flex flex-col items-center justify-center h-[60px]">
              <div className="text-[28px] font-semibold leading-none transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>127+</div>
              <div className="text-[10px] uppercase tracking-wider mt-1 h-[20px] flex items-center justify-center transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
                {t('showcase.projects')}
              </div>
            </div>
            <div className="text-center flex flex-col items-center justify-center h-[60px]">
              <div className="text-[28px] font-semibold leading-none transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>4.9</div>
              <div className="text-[10px] uppercase tracking-wider mt-1 h-[20px] flex items-center justify-center transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
                {t('showcase.rating')}
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 cursor-pointer transition-all duration-200 active:scale-[0.985]"
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
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--overlay-strong)' }}
              >
                <ArrowRight className="w-6 h-6" style={{ color: 'var(--cta-foreground)' }} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default memo(ShowcasePage);
