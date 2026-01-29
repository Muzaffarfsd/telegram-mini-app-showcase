import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { preloadDemo } from './demos/DemoRegistry';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import { FavoriteButton } from './FavoriteButton';
import { useLanguage } from '../contexts/LanguageContext';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from './PullToRefreshIndicator';
import { useQueryClient } from '@tanstack/react-query';
import { TubesBackground } from './ui/neon-flow';
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

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

export default function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const { t, language } = useLanguage();
  const headlines = language === 'ru' ? headlinesRu : headlinesEn;
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const { videoRef } = useVideoLazyLoad({ threshold: 0.25 });
  const { markAsViewed } = useViewedDemos();
  const queryClient = useQueryClient();
  const lastTapRef = useRef<number>(0);
  const [tubeColorVersion, setTubeColorVersion] = useState(0);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    await new Promise(resolve => setTimeout(resolve, 600));
  }, [queryClient]);

  const { pullDistance, isRefreshing, progress, shouldShowIndicator } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 70,
    maxPullDistance: 100
  });
  
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

  const handleInteraction = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Only process if double-click on desktop or single touch on mobile
    if ('touches' in e && e.touches.length > 1) return;

    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button') || target.closest('a') || target.closest('.nav-depth-zone') || target.closest('input') || target.closest('textarea');
    if (isInteractive) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 350;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      console.log('Double tap/click detected, rotating color');
      setTubeColorVersion(prev => prev + 1);
      haptic.medium();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [haptic]);

  return (
    <div 
      className="min-h-screen showcase-page select-none overflow-x-hidden relative"
      style={{ backgroundColor: '#000000' }}
    >
      <div 
        className="fixed inset-0 z-0 pointer-events-auto"
        onDoubleClick={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <TubesBackground 
          className="w-full h-full" 
          enableClickInteraction={false}
          tubeColorVersion={tubeColorVersion}
        />
      </div>
      
      <div className="relative z-10">
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          shouldShow={shouldShowIndicator}
          progress={progress}
        />
        
        <div className="max-w-lg mx-auto px-5" style={{ paddingTop: '100px' }}>
          <section className="min-h-[75vh] flex flex-col justify-start pt-4 animate-in fade-in duration-500">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="mb-8">
                <span 
                  className="block text-[44px] leading-[1.02] font-semibold"
                  style={{ color: '#ffffff', letterSpacing: '-0.035em', fontFamily: 'Montserrat, sans-serif', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                >
                  {t('showcase.heroTitle')}
                </span>
                <span 
                  className="block text-[44px] leading-[1.02] font-semibold"
                  style={{ color: '#ffffff', letterSpacing: '-0.035em', fontFamily: 'Montserrat, sans-serif', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
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
                      letterSpacing: '-0.035em',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    {headlines[headlineIndex]}
                  </span>
                </div>
              </h1>

              <div className="mb-10 max-w-[340px]">
                <p 
                  className="text-[17px] leading-[1.5] font-medium"
                  style={{ color: '#ffffff', textShadow: '0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}
                >
                  {t('showcase.heroDescription')}
                </p>
                <p 
                  className="text-[17px] leading-[1.5] mt-3"
                  style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}
                >
                  {t('showcase.heroDescription2')} <span style={{ color: '#10b981', whiteSpace: 'nowrap', fontWeight: 600 }}>{t('showcase.heroAccent2')}</span>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigate('projects')}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full transition-all duration-200 active:scale-[0.97] backdrop-blur-2xl"
                  style={{ 
                    background: 'rgba(16, 185, 129, 0.25)',
                    height: '48px',
                    paddingLeft: '14px',
                    paddingRight: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
                  }}
                >
                  <span className="text-[14px] text-white font-bold tracking-wide">{t('showcase.orderProject')}</span>
                  <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                </button>
                
                <button
                  onClick={() => handleOpenDemo('clothing-store')}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full transition-all duration-200 active:scale-[0.97] backdrop-blur-2xl"
                  style={{ 
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    height: '48px',
                    paddingLeft: '12px',
                    paddingRight: '14px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.3)'
                  }}
                >
                  <Play className="w-4 h-4 text-white" fill="currentColor" />
                  <span className="text-[14px] text-white font-bold tracking-wide">{t('showcase.openApp')}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-12">
                <div
                  className="p-4 rounded-2xl text-center flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 backdrop-blur-xl"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', height: '88px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="text-[26px] font-semibold leading-none text-white">
                    <AnimatedCounter value={127} suffix="+" delay={0.3} />
                  </div>
                  <div className="text-[9px] uppercase tracking-wider mt-2 text-white/60">
                    {t('showcase.clients')}
                  </div>
                </div>
                <div
                  className="p-4 rounded-2xl text-center flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 backdrop-blur-xl"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', height: '88px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="text-[26px] font-semibold leading-none text-white">
                    <AnimatedCounter value={24} suffix={t('showcase.hours')} delay={0.4} />
                  </div>
                  <div className="text-[9px] uppercase tracking-wider mt-2 text-white/60">
                    {t('showcase.toLaunch')}
                  </div>
                </div>
                <div
                  className="p-4 rounded-2xl text-center flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 backdrop-blur-xl"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', height: '88px', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                >
                  <div className="text-[26px] font-semibold leading-none text-[#10b981]">
                    +<AnimatedCounter value={300} suffix="%" delay={0.5} />
                  </div>
                  <div className="text-[9px] uppercase tracking-wider mt-2 text-[#10b981]/80">
                    {t('showcase.toSales')}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pb-8 pt-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[13px] font-medium tracking-[0.08em] uppercase text-white/60">
                {t('showcase.projectsTitle')}
              </h2>
              <button
                onClick={() => handleNavigate('projects')}
                className="text-[13px] font-medium flex items-center gap-1 text-white/60"
              >
                {t('showcase.all')} <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="col-span-2 relative rounded-3xl overflow-hidden cursor-pointer group nav-depth-zone transition-all duration-300 active:scale-[0.98] animate-in fade-in duration-500"
                onClick={() => handleOpenDemo('luxury-watches')}
              >
                <div className="relative h-[280px] overflow-hidden">
                  <video
                    ref={videoRef}
                    src="/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4"
                    loop
                    muted
                    playsInline
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.6]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute top-5 right-5 flex items-center gap-2">
                    <FavoriteButton demoId="luxury-watches" size="md" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-[22px] font-semibold mb-1 text-white">Watch Store</h3>
                        <p className="text-[14px] text-white/55">{t('showcase.watchStoreDesc')}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[24px] font-bold text-[#10b981]">+340%</div>
                        <div className="text-[11px] uppercase tracking-wider text-white/40">{t('showcase.sales')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4] nav-depth-zone transition-all duration-300 active:scale-[0.98] animate-in fade-in duration-500 delay-100"
                onClick={() => handleOpenDemo('sneaker-store')}
              >
                <img
                  src={nikeGreenImage}
                  alt="Sneaker Store"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.65] transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-[18px] font-semibold mb-0.5 text-white">Sneaker Store</div>
                  <div className="text-[12px] mb-2 text-white/50">{t('showcase.sneakerStoreDesc')}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-[16px] font-bold text-[#10b981]">+280%</div>
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4] nav-depth-zone transition-all duration-300 active:scale-[0.98] animate-in fade-in duration-500 delay-150"
                onClick={() => handleOpenDemo('clothing-store')}
              >
                <img
                  src={rascalImage}
                  alt="Premium Brand"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.65] transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-[18px] font-semibold mb-0.5 text-white">{t('showcase.premiumBrand')}</div>
                  <div className="text-[12px] mb-2 text-white/50">{t('showcase.personalSelection')}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-[16px] font-bold text-[#10b981]">+195%</div>
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
