import { ArrowRight, ArrowUpRight, Play, MessageCircle, Zap, Rocket, Users, Clock, CreditCard, TrendingUp, Quote, Star, Sparkles, CheckCircle2, ChevronRight, Eye, ShoppingBag, Palette, BarChart3, Shield, Globe, Smartphone } from "lucide-react";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { m, AnimatePresence, useInView } from '@/utils/LazyMotionProvider';
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
import { useTheme } from '../hooks/useTheme';
import { CardStack, type CardStackItem } from '@/components/ui/card-stack';
import { LazyMotionProvider } from '@/utils/LazyMotionProvider';
import IPhoneMockupShowcase from './IPhoneMockupShowcase';
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const showcaseCardStackItems: CardStackItem[] = [
  { id: 1, title: "Radiance", description: "Premium fashion & accessories store", imageSrc: "/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg" },
  { id: 2, title: "Nike Destiny", description: "Next-gen sportswear experience", imageSrc: "/attached_assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg" },
  { id: 3, title: "Nike Green", description: "Eco-friendly sustainable collection", imageSrc: "/attached_assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg" },
  { id: 4, title: "Rascal", description: "Urban streetwear brand identity", imageSrc: "/attached_assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg" },
  { id: 5, title: "Studio Collection", description: "Premium design portfolio showcase", imageSrc: "/attached_assets/82a7adf27f8d0e1758ca0f797349db48_1763719506416.jpg" },
];

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
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [value, delay]);
  return <span>{displayValue}{suffix}</span>;
}

const headlinesRu = ["у конкурентов", "на рынке", "в России", "в СНГ", "в вашей нише"];
const headlinesEn = ["your competitors have", "in the market", "in your industry", "in your region"];

const sectionReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

function SectionWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <m.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionReveal}
      className={className}
    >
      {children}
    </m.div>
  );
}

function MarqueeStrip({ isDark }: { isDark: boolean }) {
  const items = ["WEB4TG", "✦", "TELEGRAM MINI APPS", "✦", "PREMIUM DESIGN", "✦", "24H LAUNCH", "✦", "AI POWERED", "✦", "E-COMMERCE", "✦", "NO COMMISSION", "✦"];
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-4" style={{ borderTop: isDark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.06)', borderBottom: isDark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.06)' }}>
      <motion.div
        className="flex gap-6 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-[11px] font-bold tracking-[0.2em] uppercase flex-shrink-0" style={{ color: item === "✦" ? (isDark ? 'rgba(52,211,153,0.6)' : 'rgba(5,150,105,0.6)') : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)') }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const headlines = language === 'ru' ? headlinesRu : headlinesEn;
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const { videoRef } = useVideoLazyLoad({ threshold: 0.25 });
  const { markAsViewed } = useViewedDemos();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    await new Promise(resolve => setTimeout(resolve, 600));
  }, [queryClient]);

  const { pullDistance, isRefreshing, progress, shouldShowIndicator } = usePullToRefresh({ onRefresh: handleRefresh, threshold: 70, maxPullDistance: 100 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startInterval = () => { if (!intervalId) intervalId = setInterval(() => setHeadlineIndex((prev) => (prev + 1) % headlines.length), 2500); };
    const stopInterval = () => { if (intervalId) { clearInterval(intervalId); intervalId = null; } };
    const handleVisibility = () => { if (document.hidden) stopInterval(); else startInterval(); };
    if (!document.hidden) startInterval();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { stopInterval(); document.removeEventListener('visibilitychange', handleVisibility); };
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

  const glass = useMemo(() => ({
    bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
    bgHover: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
    border: isDark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.06)',
    shadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
    text: isDark ? '#ffffff' : '#1d1d1f',
    textSecondary: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(29,29,31,0.55)',
    textTertiary: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(29,29,31,0.35)',
    accent: isDark ? '#34d399' : '#059669',
    accentBg: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
    accentBorder: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.3)',
  }), [isDark]);

  const noiseOverlay = (
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
  );

  return (
    <div ref={scrollRef} className="min-h-screen showcase-page select-none overflow-x-hidden relative" style={{ backgroundColor: isDark ? '#000000' : '#f5f5f7' }}>
      {isDark && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <TubesBackground className="w-full h-full" />
        </div>
      )}

      <div className="relative z-10">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} shouldShow={shouldShowIndicator} progress={progress} />

        <div className="max-w-lg mx-auto">

          {/* ═══════════════════════════════════════════════════
              HERO — Cinematic Full-Viewport
          ═══════════════════════════════════════════════════ */}
          <section className="min-h-[88vh] flex flex-col justify-center px-6" style={{ paddingTop: '80px' }}>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{ background: glass.accentBg, border: `0.5px solid ${glass.accentBorder}` }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: glass.accent }} />
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: glass.accent }}>
                  {language === 'ru' ? 'Telegram Mini Apps • 2026' : 'Telegram Mini Apps • 2026'}
                </span>
              </motion.div>

              <h1>
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  className="block leading-[1.05]"
                  style={{
                    fontSize: '46px', fontWeight: 800, letterSpacing: '-0.04em',
                    fontFamily: '"SF Pro Display", Montserrat, -apple-system, sans-serif',
                    background: isDark
                      ? 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)'
                      : 'linear-gradient(180deg, #1d1d1f 0%, #3a3a3c 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}
                >
                  {t('showcase.heroTitle')}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="block leading-[1.05] mt-1"
                  style={{
                    fontSize: '46px', fontWeight: 800, letterSpacing: '-0.04em',
                    fontFamily: '"SF Pro Display", Montserrat, -apple-system, sans-serif',
                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(29,29,31,0.45)',
                  }}
                >
                  {t('showcase.heroTitle2')}
                </motion.span>
                <div className="h-[52px] overflow-hidden mt-2">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={headlineIndex}
                      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                      className="block leading-[1.05]"
                      style={{
                        fontSize: '46px', fontWeight: 800, letterSpacing: '-0.04em',
                        fontFamily: '"SF Pro Display", Montserrat, -apple-system, sans-serif',
                        color: glass.accent,
                      }}
                    >
                      {headlines[headlineIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-7 leading-[1.65]"
                style={{ fontSize: '16px', color: glass.textSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif', maxWidth: '380px' }}
              >
                {t('showcase.heroDescription')}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-2 leading-[1.65]"
                style={{ fontSize: '16px', color: glass.textSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif', maxWidth: '380px' }}
              >
                {t('showcase.heroDescription2')}{' '}
                <span style={{ color: glass.accent, fontWeight: 600 }}>{t('showcase.heroAccent2')}</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex gap-3 mt-8"
              >
                <button
                  onClick={() => handleNavigate('projects')}
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl transition-all duration-200 active:scale-[0.97]"
                  style={{
                    height: '54px',
                    background: isDark ? 'linear-gradient(180deg, rgba(52,211,153,0.9) 0%, rgba(16,185,129,0.9) 100%)' : 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                    boxShadow: `0 12px 40px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.25)`,
                    border: 'none',
                  }}
                >
                  <span className="text-[15px] text-white font-bold" style={{ letterSpacing: '-0.01em' }}>{t('showcase.orderProject')}</span>
                  <ArrowRight className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => handleOpenDemo('clothing-store')}
                  className="flex items-center justify-center gap-2 rounded-2xl transition-all duration-200 active:scale-[0.97]"
                  style={{
                    height: '54px', width: '54px',
                    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: isDark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <Play className="w-5 h-5" style={{ color: glass.text }} fill="currentColor" />
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="grid grid-cols-3 gap-2.5 mt-12"
            >
              {[
                { val: 127, sfx: "+", label: language === 'ru' ? 'клиентов' : 'clients', d: 0.3, accent: false },
                { val: 24, sfx: language === 'ru' ? 'ч' : 'h', label: language === 'ru' ? 'до запуска' : 'to launch', d: 0.45, accent: false },
                { val: 300, sfx: "%", label: language === 'ru' ? 'к продажам' : 'sales boost', d: 0.6, accent: true },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl py-4 px-2 text-center relative overflow-hidden" style={{
                  background: stat.accent ? glass.accentBg : glass.bg,
                  border: stat.accent ? `0.5px solid ${glass.accentBorder}` : glass.border,
                }}>
                  {noiseOverlay}
                  <div className="relative">
                    <div className="text-[24px] font-bold leading-none" style={{
                      color: stat.accent ? glass.accent : glass.text,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {stat.accent && '+'}<AnimatedCounter value={stat.val} suffix={stat.sfx} delay={stat.d} />
                    </div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.12em] mt-2" style={{ color: stat.accent ? glass.accent : glass.textTertiary }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </section>

          {/* ═══════════════════════════════════════════════════
              MARQUEE STRIP
          ═══════════════════════════════════════════════════ */}
          <MarqueeStrip isDark={isDark} />

          {/* ═══════════════════════════════════════════════════
              FEATURED PROJECTS — Immersive Cards
          ═══════════════════════════════════════════════════ */}
          <section className="px-5 pt-10 pb-6">
            <SectionWrapper>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: glass.accent }}>{language === 'ru' ? 'ПОРТФОЛИО' : 'PORTFOLIO'}</p>
                  <h2 style={{
                    fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', color: glass.text,
                    fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                  }}>
                    {t('showcase.projectsTitle')}
                  </h2>
                </div>
                <button onClick={() => handleNavigate('projects')} className="flex items-center gap-1 transition-all active:scale-95" style={{ color: glass.textSecondary }}>
                  <span className="text-[13px] font-medium">{t('showcase.all')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-5 flex justify-center">
                <LazyMotionProvider>
                  <CardStack
                    items={showcaseCardStackItems}
                    initialIndex={0}
                    autoAdvance
                    intervalMs={2500}
                    pauseOnHover
                    showDots
                    cardWidth={300}
                    cardHeight={200}
                    maxVisible={5}
                    overlap={0.45}
                    spreadDeg={35}
                    depthPx={100}
                    tiltXDeg={8}
                    activeLiftPx={16}
                    activeScale={1.02}
                    inactiveScale={0.92}
                  />
                </LazyMotionProvider>
              </div>
            </SectionWrapper>
          </section>

          {/* ═══════════════════════════════════════════════════
              VIDEO + GRID PROJECTS
          ═══════════════════════════════════════════════════ */}
          <section className="px-5 pb-6">
            <SectionWrapper>
              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
                <motion.div
                  variants={staggerItem}
                  className="relative rounded-[24px] overflow-hidden cursor-pointer group active:scale-[0.985] transition-transform duration-300 mb-3"
                  onClick={() => handleOpenDemo('luxury-watches')}
                >
                  <div className="relative h-[300px] overflow-hidden">
                    <video ref={videoRef} src="/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4" loop muted playsInline autoPlay className="absolute inset-0 w-full h-full object-cover brightness-[0.55] transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.08em] uppercase text-white" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.18)' }}>
                        {language === 'ru' ? 'ВИДЕО-КЕЙС' : 'VIDEO CASE'}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <FavoriteButton demoId="luxury-watches" size="md" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>TIMEELITE</p>
                          <h3 className="text-[24px] font-bold text-white" style={{ letterSpacing: '-0.02em', fontFamily: '"SF Pro Display", -apple-system, sans-serif' }}>Watch Store</h3>
                          <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{t('showcase.watchStoreDesc')}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="text-[28px] font-black" style={{ color: '#34d399', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>+340%</div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('showcase.sales')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'sneaker-store', img: nikeGreenImage, name: 'Sneaker Store', desc: t('showcase.sneakerStoreDesc'), stat: '+280%' },
                    { id: 'clothing-store', img: rascalImage, name: t('showcase.premiumBrand'), desc: t('showcase.personalSelection'), stat: '+195%' },
                  ].map((project) => (
                    <motion.div
                      key={project.id}
                      variants={staggerItem}
                      className="relative rounded-[20px] overflow-hidden cursor-pointer group active:scale-[0.97] transition-transform duration-300"
                      style={{ aspectRatio: '3/4' }}
                      onClick={() => handleOpenDemo(project.id)}
                    >
                      <img src={project.img} alt={project.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover brightness-[0.6] transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{project.name.toUpperCase()}</p>
                        <div className="text-[17px] font-bold text-white mb-0.5" style={{ letterSpacing: '-0.01em' }}>{project.name}</div>
                        <div className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{project.desc}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-[16px] font-bold" style={{ color: '#34d399' }}>{project.stat}</span>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)' }}>
                            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </SectionWrapper>
          </section>

          <IPhoneMockupShowcase onOpenDemo={handleOpenDemo} />

          {/* ═══════════════════════════════════════════════════
              PROCESS — Premium Timeline
          ═══════════════════════════════════════════════════ */}
          <section className="px-5 pb-10 pt-8">
            <SectionWrapper>
              <div className="text-center mb-10">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: glass.accent }}>{language === 'ru' ? 'ПРОЦЕСС' : 'PROCESS'}</p>
                <h2 style={{
                  fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em',
                  background: isDark ? 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)' : 'linear-gradient(180deg, #1d1d1f 0%, #3a3a3c 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                }}>
                  {language === 'ru' ? 'Как это работает' : 'How It Works'}
                </h2>
                <p className="mt-2 text-[14px]" style={{ color: glass.textSecondary }}>{language === 'ru' ? 'От идеи до запуска за 3 шага' : 'From idea to launch in 3 steps'}</p>
              </div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="space-y-3">
                {[
                  { Icon: MessageCircle, title: language === 'ru' ? 'Заявка' : 'Request', desc: language === 'ru' ? 'Опишите идею или выберите готовое решение из каталога' : 'Describe your idea or choose from our catalog', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', glow: 'rgba(59,130,246,0.25)' },
                  { Icon: Zap, title: language === 'ru' ? 'Разработка' : 'Development', desc: language === 'ru' ? 'Создаём приложение за 24-48 часов с премиум-дизайном' : 'We build your app in 24-48 hours with premium design', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', glow: 'rgba(139,92,246,0.25)' },
                  { Icon: Rocket, title: language === 'ru' ? 'Запуск' : 'Launch', desc: language === 'ru' ? 'Интеграция с Telegram, оплаты и аналитика — всё готово' : 'Telegram integration, payments & analytics — all set', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', glow: 'rgba(16,185,129,0.25)' },
                ].map((step, i) => (
                  <motion.div key={i} variants={staggerItem} className="rounded-[20px] p-5 relative overflow-hidden group" style={{ background: glass.bg, border: glass.border, boxShadow: glass.shadow }}>
                    {noiseOverlay}
                    <div className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none rounded-t-[20px]" style={{ background: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }} />
                    <div className="flex items-start gap-4 relative">
                      <div className="flex items-center justify-center rounded-[14px] flex-shrink-0" style={{ width: '52px', height: '52px', background: step.gradient, boxShadow: `0 8px 24px ${step.glow}` }}>
                        <step.Icon className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: glass.textTertiary }}>0{i + 1}</span>
                          <span className="text-[16px] font-semibold" style={{ color: glass.text, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>{step.title}</span>
                        </div>
                        <p className="text-[14px] leading-[1.55]" style={{ color: glass.textSecondary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>{step.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </SectionWrapper>
          </section>

          {/* ═══════════════════════════════════════════════════
              ADVANTAGES — Premium Bento Grid
          ═══════════════════════════════════════════════════ */}
          <section className="px-5 pb-10 pt-2">
            <SectionWrapper>
              <div className="text-center mb-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: glass.accent }}>{language === 'ru' ? 'ПРЕИМУЩЕСТВА' : 'ADVANTAGES'}</p>
                <h2 style={{
                  fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em',
                  background: isDark ? 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)' : 'linear-gradient(180deg, #1d1d1f 0%, #3a3a3c 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                }}>
                  {language === 'ru' ? 'Почему выбирают нас' : 'Why Clients Choose Us'}
                </h2>
              </div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: Globe, value: '900M+', label: language === 'ru' ? 'аудитория Telegram' : 'Telegram audience', color: '#3b82f6' },
                    { Icon: Clock, value: '24h', label: language === 'ru' ? 'до запуска' : 'to launch', color: '#8b5cf6' },
                  ].map((feat, i) => (
                    <motion.div key={i} variants={staggerItem} className="rounded-[18px] p-5 relative overflow-hidden text-center" style={{ background: glass.bg, border: glass.border, boxShadow: glass.shadow }}>
                      {noiseOverlay}
                      <div className="relative">
                        <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mx-auto mb-3" style={{ background: `linear-gradient(135deg, ${feat.color}20 0%, ${feat.color}08 100%)`, border: `0.5px solid ${feat.color}35` }}>
                          <feat.Icon className="w-5 h-5" style={{ color: feat.color }} strokeWidth={2} />
                        </div>
                        <div className="text-[22px] font-bold mb-1" style={{ color: glass.text, fontFamily: '-apple-system, "SF Pro Display", sans-serif' }}>{feat.value}</div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: glass.textTertiary }}>{feat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div variants={staggerItem} className="rounded-[18px] p-5 relative overflow-hidden" style={{ background: glass.accentBg, border: `0.5px solid ${glass.accentBorder}`, boxShadow: glass.shadow }}>
                  {noiseOverlay}
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)', border: `0.5px solid ${glass.accentBorder}` }}>
                      <TrendingUp className="w-7 h-7" style={{ color: glass.accent }} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[28px] font-black mb-0.5" style={{ color: glass.accent, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>+300%</div>
                      <div className="text-[12px] font-medium" style={{ color: isDark ? 'rgba(52,211,153,0.7)' : 'rgba(5,150,105,0.7)' }}>{language === 'ru' ? 'средний рост продаж клиентов' : 'average client sales growth'}</div>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: CreditCard, value: language === 'ru' ? 'Встроено' : 'Built-in', label: language === 'ru' ? 'платежи' : 'payments', color: '#f59e0b' },
                    { Icon: Shield, value: language === 'ru' ? '0%' : '0%', label: language === 'ru' ? 'комиссий' : 'commission', color: '#ef4444' },
                  ].map((feat, i) => (
                    <motion.div key={i} variants={staggerItem} className="rounded-[18px] p-5 relative overflow-hidden text-center" style={{ background: glass.bg, border: glass.border, boxShadow: glass.shadow }}>
                      {noiseOverlay}
                      <div className="relative">
                        <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mx-auto mb-3" style={{ background: `linear-gradient(135deg, ${feat.color}20 0%, ${feat.color}08 100%)`, border: `0.5px solid ${feat.color}35` }}>
                          <feat.Icon className="w-5 h-5" style={{ color: feat.color }} strokeWidth={2} />
                        </div>
                        <div className="text-[22px] font-bold mb-1" style={{ color: glass.text, fontFamily: '-apple-system, "SF Pro Display", sans-serif' }}>{feat.value}</div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: glass.textTertiary }}>{feat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </SectionWrapper>
          </section>

          {/* ═══════════════════════════════════════════════════
              TESTIMONIALS — Multiple Reviews
          ═══════════════════════════════════════════════════ */}
          <section className="px-5 pb-10 pt-2">
            <SectionWrapper>
              <div className="text-center mb-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: glass.accent }}>{language === 'ru' ? 'ОТЗЫВЫ' : 'REVIEWS'}</p>
                <h2 style={{
                  fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em',
                  background: isDark ? 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)' : 'linear-gradient(180deg, #1d1d1f 0%, #3a3a3c 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                }}>
                  {language === 'ru' ? 'Клиенты говорят' : 'Client Stories'}
                </h2>
              </div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="space-y-3">
                {[
                  {
                    quote: language === 'ru' ? '«За первый месяц продажи выросли на 340%. Telegram Mini App полностью изменил наш подход к e-commerce.»' : '"Sales grew by 340% in the first month. Telegram Mini App completely changed our approach to e-commerce."',
                    name: language === 'ru' ? 'Александр М.' : 'Alexander M.',
                    role: language === 'ru' ? 'Владелец магазина часов' : 'Watch store owner',
                    initials: 'АМ',
                    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  },
                  {
                    quote: language === 'ru' ? '«Приложение было готово за 24 часа. Мы потратили месяцы на маркетплейсы, а тут — готовый бизнес за день.»' : '"The app was ready in 24 hours. We spent months on marketplaces, but here — a ready business in a day."',
                    name: language === 'ru' ? 'Елена К.' : 'Elena K.',
                    role: language === 'ru' ? 'Основатель бренда косметики' : 'Cosmetics brand founder',
                    initials: 'ЕК',
                    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  },
                  {
                    quote: language === 'ru' ? '«Наконец-то 0% комиссии. Сэкономили более 2 млн руб. за квартал по сравнению с маркетплейсами.»' : '"Finally 0% commission. Saved over $25k per quarter compared to marketplaces."',
                    name: language === 'ru' ? 'Дмитрий В.' : 'Dmitry V.',
                    role: language === 'ru' ? 'CEO интернет-магазина' : 'E-commerce CEO',
                    initials: 'ДВ',
                    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  },
                ].map((review, i) => (
                  <motion.div key={i} variants={staggerItem} className="rounded-[20px] p-5 relative overflow-hidden" style={{ background: glass.bg, border: glass.border, boxShadow: glass.shadow }}>
                    {noiseOverlay}
                    <div className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none rounded-t-[20px]" style={{ background: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }} />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] text-white flex-shrink-0" style={{ background: review.gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                          {review.initials}
                        </div>
                        <div className="flex-1">
                          <div className="text-[14px] font-semibold" style={{ color: glass.text }}>{review.name}</div>
                          <div className="text-[11px]" style={{ color: glass.textTertiary }}>{review.role}</div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(n => (<Star key={n} className="w-3.5 h-3.5" style={{ color: '#fbbf24', fill: '#fbbf24' }} />))}
                        </div>
                      </div>
                      <p className="text-[14px] leading-[1.65]" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(29,29,31,0.75)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                        {review.quote}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </SectionWrapper>
          </section>

          <MarqueeStrip isDark={isDark} />

          {/* ═══════════════════════════════════════════════════
              CTA — Final Conversion Block
          ═══════════════════════════════════════════════════ */}
          <section className="px-5 pb-20 pt-10">
            <SectionWrapper>
              <div className="rounded-[28px] p-7 relative overflow-hidden" style={{
                background: isDark
                  ? 'linear-gradient(180deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)'
                  : 'linear-gradient(180deg, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0.05) 100%)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                border: `0.5px solid ${glass.accentBorder}`,
                boxShadow: isDark ? '0 16px 64px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 16px 64px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
              }}>
                {noiseOverlay}
                <div className="absolute top-0 left-0 right-0 h-[50%] pointer-events-none rounded-t-[28px]" style={{ background: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }} />

                <div className="relative text-center">
                  <div className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 12px 32px rgba(16,185,129,0.35)' }}>
                    <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>

                  <h3 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', color: glass.text, marginBottom: '10px', fontFamily: '"SF Pro Display", -apple-system, sans-serif' }}>
                    {language === 'ru' ? 'Готовы к росту?' : 'Ready to Grow?'}
                  </h3>
                  <p className="mb-6" style={{ fontSize: '15px', lineHeight: '1.6', color: glass.textSecondary, fontFamily: '-apple-system, "SF Pro Text", sans-serif' }}>
                    {language === 'ru' ? 'Бесплатная консультация и запуск вашего магазина в Telegram за 24 часа' : 'Free consultation and launch your Telegram store in 24 hours'}
                  </p>

                  <button
                    onClick={() => handleNavigate('projects')}
                    className="w-full py-4 font-bold rounded-2xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2.5"
                    style={{
                      fontSize: '16px', letterSpacing: '-0.01em',
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      boxShadow: '0 12px 40px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
                      fontFamily: '-apple-system, "SF Pro Text", sans-serif',
                    }}
                  >
                    {language === 'ru' ? 'Начать сейчас' : 'Start Now'}
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>

                  <div className="flex items-center justify-center gap-5 mt-5">
                    {[
                      { Icon: CheckCircle2, text: language === 'ru' ? 'Бесплатно' : 'Free' },
                      { Icon: Clock, text: language === 'ru' ? '24 часа' : '24 hours' },
                      { Icon: Shield, text: language === 'ru' ? '0% комиссии' : '0% fees' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <item.Icon className="w-3.5 h-3.5" style={{ color: glass.accent }} strokeWidth={2} />
                        <span className="text-[11px] font-medium" style={{ color: glass.textSecondary }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionWrapper>
          </section>

        </div>
      </div>
    </div>
  );
}
