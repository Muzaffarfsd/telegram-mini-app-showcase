import { ArrowUpRight, ChevronRight, Zap, CreditCard, Bot, BarChart3, Palette, Pause, Play } from "lucide-react";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { m, AnimatePresence, useInView, useScroll, useTransform } from '@/utils/LazyMotionProvider';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from './PullToRefreshIndicator';
import { useQueryClient } from '@tanstack/react-query';
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const SYNE = '"Syne", system-ui, sans-serif';
const INSTRUMENT = '"Instrument Serif", Georgia, serif';
const INTER = '"Inter", -apple-system, system-ui, sans-serif';
const EMERALD = '#34d399';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function useReducedMotion() {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setRm(mq.matches);
    const h = (e: MediaQueryListEvent) => setRm(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return rm;
}

function Cin({ children, className = "", delay = 0, rm = false }: {
  children: React.ReactNode; className?: string; delay?: number; rm?: boolean;
}) {
  const r = useRef(null);
  const v = useInView(r, { once: true, margin: "-80px" });
  return (
    <m.div ref={r}
      initial={rm ? { opacity: 1 } : { opacity: 0, y: 40 }}
      animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: rm ? 0 : 0.8, ease: EASE, delay: rm ? 0 : delay }}
      className={className}>
      {children}
    </m.div>
  );
}

function Ct({ to, suffix = "", rm = false }: { to: number; suffix?: string; rm?: boolean }) {
  const r = useRef(null);
  const v = useInView(r, { once: true });
  const [n, setN] = useState(rm ? to : 0);
  useEffect(() => {
    if (!v || rm) { setN(to); return; }
    let dead = false;
    const s = performance.now();
    const loop = (t: number) => {
      if (dead) return;
      const p = Math.min((t - s) / 1600, 1);
      setN(Math.round((1 - Math.pow(1 - p, 5)) * to));
      if (p < 1) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => { dead = true; };
  }, [v, to, rm]);
  return <span ref={r}>{n}{suffix}</span>;
}

const TAG_WORDS = {
  ru: ["конкурентов", "рынка", "ожиданий", "привычного"],
  en: ["competition", "expectations", "the ordinary", "the status quo"],
};

const FEATURE_ICONS = {
  launch: Zap,
  payments: CreditCard,
  ai: Bot,
  analytics: BarChart3,
  design: Palette,
} as const;

export default function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const { language } = useLanguage();
  const ru = language === 'ru';
  const { markAsViewed } = useViewedDemos();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();

  const words = ru ? TAG_WORDS.ru : TAG_WORDS.en;
  const [wi, setWi] = useState(0);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    await new Promise(resolve => setTimeout(resolve, 600));
  }, [queryClient]);
  const { pullDistance, isRefreshing, progress, shouldShowIndicator } = usePullToRefresh({
    onRefresh: handleRefresh, threshold: 70, maxPullDistance: 100,
  });

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setWi(i => (i + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length, reducedMotion]);

  const openDemo = useCallback((id: string) => {
    haptic.light(); markAsViewed(id); onOpenDemo(id);
  }, [haptic, onOpenDemo, markAsViewed]);

  const nav = useCallback((s: string) => {
    haptic.light(); onNavigate(s);
  }, [haptic, onNavigate]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef(null);
  const videoInView = useInView(videoWrapRef, { once: true, margin: "200px" });
  useEffect(() => {
    if (videoInView && videoRef.current && !videoRef.current.src) {
      videoRef.current.src = "/videos/hero-bg.mp4";
      videoRef.current.load();
    }
  }, [videoInView]);

  const stackCards = useMemo(() => [
    { id: 'luxury-perfume', src: '/screenshots/fragrance-app.png', label: 'FragranceRoyale', sub: ru ? 'Премиальная парфюмерия' : 'Premium Fragrances', growth: '+310%' },
    { id: 'florist', src: '/screenshots/florist-app.png', label: 'Bloom', sub: ru ? 'Цветочный магазин' : 'Flower Shop', growth: '+240%' },
    { id: 'sneaker-store', src: nikeGreenImage, label: 'SneakerVault', sub: ru ? 'Культ кроссовок' : 'Sneaker culture', growth: '+280%' },
    { id: 'clothing-store', src: rascalImage, label: 'Radiance', sub: ru ? 'Уличная мода' : 'Street fashion', growth: '+195%' },
  ], [ru]);

  const [stackIdx, setStackIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const autoResumeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(autoResumeRef.current);
  }, []);

  const visibleCards = useMemo(() => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(stackCards[(stackIdx + i) % stackCards.length]);
    }
    return result;
  }, [stackIdx, stackCards]);

  const pauseAutoPlay = useCallback(() => {
    setAutoPlay(false);
    clearTimeout(autoResumeRef.current);
    autoResumeRef.current = setTimeout(() => setAutoPlay(true), 8000);
  }, []);

  const handleStackNext = useCallback(() => {
    haptic.light();
    setStackIdx(i => (i + 1) % stackCards.length);
    pauseAutoPlay();
  }, [haptic, stackCards.length, pauseAutoPlay]);

  const handleStackPrev = useCallback(() => {
    haptic.light();
    setStackIdx(i => (i - 1 + stackCards.length) % stackCards.length);
    pauseAutoPlay();
  }, [haptic, stackCards.length, pauseAutoPlay]);

  useEffect(() => {
    if (!autoPlay || reducedMotion) return;
    const id = setInterval(() => {
      setStackIdx(i => (i + 1) % stackCards.length);
    }, 4500);
    return () => clearInterval(id);
  }, [autoPlay, stackCards.length, reducedMotion]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swiping.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      swiping.current = true;
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swiping.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) handleStackNext();
      else handleStackPrev();
    }
  }, [handleStackNext, handleStackPrev]);

  const currentCardIdx = stackIdx % stackCards.length;

  return (
    <div className="min-h-screen select-none overflow-x-hidden showcase-page" style={{ backgroundColor: '#050505' }}>
      <div className="fixed inset-0 pointer-events-none z-[2]" aria-hidden="true" style={{ mixBlendMode: 'overlay' }}>
        <svg width="100%" height="100%" style={{ opacity: 0.04 }}>
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      <div className="relative z-10">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} shouldShow={shouldShowIndicator} progress={progress} />

        <div className="mx-auto w-full" style={{ maxWidth: 540 }}>

          <header ref={heroRef} className="relative px-6 pt-16 pb-16 overflow-hidden" role="banner">
            <div className="absolute inset-0 z-0" ref={videoWrapRef}>
              <video
                ref={videoRef}
                autoPlay loop muted playsInline
                preload="none"
                className="w-full h-full object-cover"
                style={{ opacity: 0.18, filter: 'saturate(0.35) contrast(1.15)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #050505 0%, transparent 30%, transparent 60%, #050505 100%)' }} />
            </div>

            <m.div className="relative z-10" style={{ y: reducedMotion ? 0 : heroY, opacity: reducedMotion ? 1 : heroOpacity }}>

              <m.div
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.7, ease: EASE, delay: reducedMotion ? 0 : 0.3 }}
                className="mb-6 flex items-center gap-2"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: EMERALD, boxShadow: `0 0 6px ${EMERALD}` }} />
                <span style={{
                  fontFamily: INTER, fontSize: 'clamp(0.55rem, 1.2vw, 0.65rem)',
                  fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  {ru ? '22 приложения запущено' : '22 apps launched'}
                </span>
              </m.div>

              <m.h1
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.4 }}
                style={{ fontFamily: SYNE, lineHeight: 0.92, letterSpacing: '-0.06em' }}
              >
                <m.span
                  className="block"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 60, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: reducedMotion ? 0 : 0.8, ease: EASE, delay: reducedMotion ? 0 : 0.5 }}
                  style={{ fontSize: 'clamp(3.2rem, 12vw, 5rem)', fontWeight: 800, color: '#fff' }}
                >
                  {ru ? 'Впереди' : 'Beyond'}
                </m.span>

                <span className="block overflow-hidden" style={{ height: 'clamp(3.5rem, 13vw, 5.5rem)' }}>
                  <AnimatePresence mode="wait">
                    <m.span
                      key={wi}
                      className="block"
                      initial={{ y: '110%', opacity: 0, rotateX: -25 }}
                      animate={{ y: '0%', opacity: 1, rotateX: 0 }}
                      exit={{ y: '-100%', opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.55, ease: EASE }}
                      style={{
                        fontSize: 'clamp(3.2rem, 12vw, 5rem)', fontWeight: 800,
                        fontFamily: SYNE,
                        background: `linear-gradient(135deg, ${EMERALD}, #6ee7b7)`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {words[wi]}
                    </m.span>
                  </AnimatePresence>
                </span>
              </m.h1>

              <m.p
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.7, ease: EASE, delay: reducedMotion ? 0 : 0.9 }}
                className="mt-7 max-w-xs"
                style={{
                  fontFamily: INTER, fontSize: 'clamp(0.8rem, 2vw, 0.9375rem)',
                  lineHeight: 1.75, color: 'rgba(255,255,255,0.5)', fontWeight: 400,
                }}
              >
                {ru
                  ? 'Создаём мини-приложения для Telegram, которые продают. Без комиссий маркетплейсов. Готово за 24 часа.'
                  : 'We build Telegram mini apps that sell. Zero marketplace fees. Ready in 24 hours.'}
              </m.p>

              <m.div
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.6, ease: EASE, delay: reducedMotion ? 0 : 1.1 }}
                className="mt-8 flex items-center gap-4"
              >
                <button
                  onClick={() => nav('projects')}
                  className="group flex items-center gap-2.5 rounded-full px-6 transition-all duration-500 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                  style={{ height: 50, background: '#fff', boxShadow: '0 0 0 0 rgba(255,255,255,0)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 0 rgba(255,255,255,0)'; }}
                >
                  <span style={{ fontFamily: SYNE, fontSize: '0.8125rem', fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>
                    {ru ? 'Начать проект' : 'Start a Project'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
                </button>

                <button
                  onClick={() => openDemo('clothing-store')}
                  className="flex items-center gap-2 transition-opacity duration-300 active:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:outline-offset-2 rounded"
                  aria-label={ru ? 'Посмотреть демо' : 'View demo'}
                >
                  <span style={{
                    fontFamily: INTER, fontSize: 'clamp(0.7rem, 1.5vw, 0.8125rem)',
                    fontWeight: 500, color: 'rgba(255,255,255,0.5)',
                    borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 2,
                  }}>
                    {ru ? 'Демо' : 'Demo'}
                  </span>
                </button>
              </m.div>
            </m.div>
          </header>

          <div className="py-5 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <m.div
              animate={reducedMotion ? {} : { x: ['0%', '-50%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="flex items-center gap-6 whitespace-nowrap"
              style={{ width: 'max-content' }}
            >
              {[...Array(2)].map((_, rep) => (
                <div key={rep} className="flex items-center gap-6">
                  {(ru
                    ? ['Telegram Mini Apps', '0% комиссий', 'Запуск за 24ч', 'AI-ассистент', 'Аналитика', 'Платежи', 'CRM', 'Премиум дизайн']
                    : ['Telegram Mini Apps', '0% Fees', 'Launch in 24h', 'AI Assistant', 'Analytics', 'Payments', 'CRM', 'Premium Design']
                  ).map((txt, j) => (
                    <span key={j} className="flex items-center gap-6">
                      <span style={{
                        fontFamily: SYNE, fontSize: 'clamp(0.6rem, 1.4vw, 0.7rem)',
                        fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                        color: 'rgba(255,255,255,0.35)',
                      }}>{txt}</span>
                      <span style={{ color: EMERALD, opacity: 0.4, fontSize: '6px' }}>●</span>
                    </span>
                  ))}
                </div>
              ))}
            </m.div>
          </div>

          <Cin>
            <div className="px-6 py-6 flex items-center justify-center gap-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                { n: '22', l: ru ? 'приложения' : 'apps' },
                { n: '5', l: ru ? 'индустрий' : 'industries' },
                { n: '2024', l: ru ? 'с года' : 'since' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span style={{ fontFamily: SYNE, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{item.n}</span>
                  <span style={{ fontFamily: INTER, fontSize: 'clamp(0.55rem, 1.2vw, 0.65rem)', color: 'rgba(255,255,255,0.5)' }}>{item.l}</span>
                  {i < 2 && <span className="ml-4 inline-block" style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />}
                </div>
              ))}
            </div>
          </Cin>

          <section className="px-6 py-20" aria-label={ru ? 'Метрики' : 'Metrics'}>
            <div className="space-y-16">
              {[
                { num: 900, sfx: 'M+', title: ru ? 'пользователей Telegram' : 'Telegram users', desc: ru ? 'Ваш магазин — прямо у них в кармане' : 'Your store — right in their pocket' },
                { num: 0, sfx: '%', title: ru ? 'комиссий' : 'commission', desc: ru ? 'Маркетплейсы забирают до 25%. Мы — ноль' : 'Marketplaces take up to 25%. We take zero' },
                { num: 24, sfx: ru ? 'ч' : 'h', title: ru ? 'до запуска' : 'to launch', desc: ru ? 'От идеи до первого заказа — один день' : 'From idea to first order — one day' },
              ].map((metric, i) => (
                <Cin key={i} delay={i * 0.06}>
                  <div>
                    <div style={{
                      fontFamily: SYNE, fontSize: 'clamp(4rem, 16vw, 7rem)',
                      fontWeight: 800, lineHeight: 0.85, letterSpacing: '-0.06em',
                      color: i === 0 ? '#fff' : 'transparent',
                      WebkitTextStroke: i === 0 ? 'none' : '1.5px rgba(255,255,255,0.15)',
                    }}>
                      <Ct to={metric.num} suffix={metric.sfx} />
                    </div>
                    <div className="mt-3" style={{
                      fontFamily: SYNE, fontSize: 'clamp(0.7rem, 1.8vw, 0.875rem)',
                      fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.02em',
                    }}>{metric.title}</div>
                    <div className="mt-1" style={{
                      fontFamily: INSTRUMENT, fontSize: 'clamp(0.8rem, 2vw, 0.9375rem)',
                      fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5,
                    }}>{metric.desc}</div>
                  </div>
                </Cin>
              ))}
            </div>
          </section>

          <section className="py-16 px-6" aria-label={ru ? 'Наши работы' : 'Our work'}>
            <Cin className="mb-6">
              <div className="flex items-end justify-between">
                <div>
                  <h2 style={{
                    fontFamily: SYNE, fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                    fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
                  }}>
                    {ru ? 'Наши работы' : 'Selected Work'}
                  </h2>
                  <p className="mt-1.5" style={{
                    fontFamily: INTER, fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                    color: 'rgba(255,255,255,0.45)',
                  }}>
                    {ru ? 'Свайпните или нажмите' : 'Swipe or tap to explore'}
                  </p>
                </div>
                <button onClick={() => nav('projects')} className="flex items-center gap-0.5 active:opacity-50 transition-opacity pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-2 rounded">
                  <span style={{ fontFamily: INTER, fontSize: 'clamp(0.65rem, 1.3vw, 0.75rem)', color: 'rgba(255,255,255,0.5)' }}>
                    {ru ? 'Все' : 'All'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                </button>
              </div>
            </Cin>

            <Cin delay={0.1}>
              <div className="relative" style={{ height: 420 }}>
                <div
                  className="relative w-full overflow-hidden touch-pan-y"
                  style={{ height: 380 }}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <AnimatePresence initial={false}>
                    {visibleCards.map((card, index) => {
                      const scales = [1, 0.94, 0.88];
                      const yPositions = [0, -20, -40];
                      const zIndexes = [3, 2, 1];

                      return (
                        <m.div
                          key={`${card.id}-${stackIdx}-${index}`}
                          initial={index === 2 ? { y: -40, scale: 0.88, opacity: 0 } : undefined}
                          animate={{
                            y: yPositions[index],
                            scale: scales[index],
                            opacity: index === 2 ? 0.6 : 1,
                          }}
                          exit={index === 0 ? { y: 380, scale: 1, opacity: 0 } : undefined}
                          transition={{ type: 'spring', duration: 0.7, bounce: 0 }}
                          style={{
                            zIndex: zIndexes[index],
                            position: 'absolute',
                            left: '50%',
                            bottom: 0,
                            transform: 'translateX(-50%)',
                            width: '100%',
                            maxWidth: 400,
                            x: '-50%',
                          }}
                          className="will-change-transform"
                        >
                          <article
                            className="relative overflow-hidden rounded-2xl cursor-pointer group active:scale-[0.98] transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                            style={{
                              height: 320,
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                            role="button"
                            tabIndex={index === 0 ? 0 : -1}
                            aria-label={`${ru ? 'Открыть' : 'Open'} ${card.label}`}
                            onClick={() => { if (index === 0) openDemo(card.id); }}
                            onKeyDown={e => {
                              if (index === 0 && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault(); openDemo(card.id);
                              }
                            }}
                          >
                            <div className="overflow-hidden rounded-xl m-1.5" style={{ height: 220 }}>
                              <img
                                src={card.src}
                                alt={card.label}
                                loading="lazy"
                                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>

                            <div className="flex items-center justify-between px-4 pb-4 pt-2">
                              <div className="min-w-0 flex-1">
                                <h3 style={{
                                  fontFamily: SYNE, fontSize: 'clamp(0.875rem, 2.2vw, 1rem)',
                                  fontWeight: 700, color: '#fff', letterSpacing: '-0.03em',
                                }}>{card.label}</h3>
                                <p style={{
                                  fontFamily: INTER, fontSize: 'clamp(0.65rem, 1.4vw, 0.75rem)',
                                  color: 'rgba(255,255,255,0.45)',
                                }}>{card.sub}</p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="inline-block rounded-full px-2 py-0.5" style={{
                                  background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)',
                                  fontFamily: SYNE, fontSize: '0.625rem', fontWeight: 700, color: EMERALD,
                                }}>{card.growth}</span>

                                {index === 0 && (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: '#fff' }}>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </article>
                        </m.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="relative z-10 flex items-center justify-center gap-4 mt-3">
                  <button
                    onClick={handleStackNext}
                    className="flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-300 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-2"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    aria-label={ru ? 'Следующий проект' : 'Next project'}
                  >
                    <span style={{ fontFamily: SYNE, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                      {ru ? 'Листать' : 'Next'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </button>

                  <button
                    onClick={() => { setAutoPlay(p => !p); haptic.light(); }}
                    className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    aria-label={autoPlay ? (ru ? 'Остановить' : 'Pause') : (ru ? 'Воспроизвести' : 'Play')}
                  >
                    {autoPlay
                      ? <Pause className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.5)' }} strokeWidth={2.5} />
                      : <Play className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.5)' }} strokeWidth={2.5} />
                    }
                  </button>

                  <div className="flex items-center gap-1.5" aria-label={ru ? 'Индикатор проектов' : 'Project indicator'}>
                    {stackCards.map((card, i) => (
                      <button
                        key={card.id}
                        onClick={() => { haptic.light(); setStackIdx(i); pauseAutoPlay(); }}
                        className="transition-all duration-300 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50"
                        style={{
                          width: i === currentCardIdx ? 16 : 6,
                          height: 6,
                          background: i === currentCardIdx ? EMERALD : 'rgba(255,255,255,0.15)',
                        }}
                        aria-current={i === currentCardIdx ? 'true' : undefined}
                        aria-label={card.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Cin>
          </section>

          <section className="px-6 py-16" aria-label={ru ? 'Что мы создаём' : 'What we build'}>
            <Cin>
              <h2 className="mb-10" style={{
                fontFamily: SYNE, fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {ru ? <>Полный стек.<br />Ничего лишнего.</> : <>Full stack.<br />Nothing extra.</>}
              </h2>
            </Cin>

            <div className="grid grid-cols-2 gap-2.5">
              {([
                { icon: 'launch' as const, t: ru ? 'Запуск' : 'Launch', s: '24h', span: '' },
                { icon: 'payments' as const, t: ru ? 'Платежи' : 'Payments', s: 'Stripe · YooKassa', span: '' },
                { icon: 'ai' as const, t: ru ? 'AI-агент' : 'AI Agent', s: ru ? 'Поддержка 24/7' : 'Support 24/7', span: 'col-span-2' },
                { icon: 'analytics' as const, t: ru ? 'Аналитика' : 'Analytics', s: ru ? 'Реальное время' : 'Real-time', span: '' },
                { icon: 'design' as const, t: ru ? 'Дизайн' : 'Design', s: ru ? 'Уровень Apple' : 'Apple-level', span: '' },
              ]).map((f, i) => {
                const Icon = FEATURE_ICONS[f.icon];
                return (
                  <Cin key={i} delay={i * 0.04} className={f.span}>
                    <div
                      className="rounded-2xl p-4 transition-all duration-500 group"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.1)' }}>
                        <Icon className="w-4 h-4" style={{ color: EMERALD }} strokeWidth={2} />
                      </div>
                      <div style={{
                        fontFamily: SYNE, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                        fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
                      }}>{f.t}</div>
                      <div className="mt-0.5" style={{
                        fontFamily: INTER, fontSize: 'clamp(0.65rem, 1.4vw, 0.75rem)',
                        color: 'rgba(255,255,255,0.45)',
                      }}>{f.s}</div>
                    </div>
                  </Cin>
                );
              })}
            </div>
          </section>

          <section className="px-6 py-16" aria-label={ru ? 'Процесс' : 'Process'}>
            <Cin>
              <h2 className="mb-10" style={{
                fontFamily: SYNE, fontSize: 'clamp(0.65rem, 1.4vw, 0.75rem)',
                fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.45)',
              }}>
                {ru ? 'Три шага' : 'Three Steps'}
              </h2>
            </Cin>

            {[
              { n: '01', t: ru ? 'Бриф' : 'Brief', d: ru ? 'Выберите шаблон или расскажите идею. Мы начнём в тот же день.' : 'Pick a template or share your idea. We start the same day.' },
              { n: '02', t: ru ? 'Сборка' : 'Build', d: ru ? 'Дизайн, фронтенд, бэкенд, платежи — всё за 24–48 часов.' : 'Design, frontend, backend, payments — all in 24–48 hours.' },
              { n: '03', t: ru ? 'Запуск' : 'Launch', d: ru ? 'Деплой в Telegram. Аналитика подключена. Вы зарабатываете.' : 'Deploy to Telegram. Analytics connected. You earn.' },
            ].map((s, i) => (
              <Cin key={i} delay={i * 0.08}>
                <div className="flex items-start gap-5 mb-9 last:mb-0">
                  <span style={{
                    fontFamily: SYNE, fontSize: 'clamp(2rem, 7vw, 3rem)',
                    fontWeight: 800, lineHeight: 1, letterSpacing: '-0.05em',
                    color: i === 2 ? EMERALD : 'rgba(255,255,255,0.08)',
                  }}>{s.n}</span>
                  <div className="pt-1.5">
                    <h3 style={{
                      fontFamily: SYNE, fontSize: 'clamp(0.95rem, 2.5vw, 1.125rem)',
                      fontWeight: 700, color: '#fff', letterSpacing: '-0.03em',
                    }}>{s.t}</h3>
                    <p className="mt-1" style={{
                      fontFamily: INTER, fontSize: 'clamp(0.7rem, 1.5vw, 0.8125rem)',
                      lineHeight: 1.65, color: 'rgba(255,255,255,0.45)',
                    }}>{s.d}</p>
                  </div>
                </div>
              </Cin>
            ))}
          </section>

          <section className="px-6 py-20" aria-label={ru ? 'Отзывы' : 'Testimonials'}>
            <Cin>
              <div className="rounded-2xl p-6 mb-10" style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.08)' }}>
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: SYNE, fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', fontWeight: 800, color: EMERALD, letterSpacing: '-0.05em', lineHeight: 1 }}>
                    +340%
                  </span>
                  <span style={{ fontFamily: INTER, fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', color: 'rgba(255,255,255,0.5)' }}>
                    {ru ? 'продаж за 30 дней' : 'sales in 30 days'}
                  </span>
                </div>
                <p className="mt-2" style={{ fontFamily: INTER, fontSize: 'clamp(0.65rem, 1.3vw, 0.75rem)', color: 'rgba(255,255,255,0.5)' }}>
                  {ru ? 'Средний результат наших клиентов после запуска в Telegram' : 'Average result for our clients after launching in Telegram'}
                </p>
              </div>
            </Cin>

            <Cin delay={0.1}>
              <div className="relative">
                <span style={{
                  fontFamily: INSTRUMENT, fontSize: 'clamp(5rem, 18vw, 8rem)',
                  lineHeight: 0.7, color: 'rgba(52,211,153,0.08)', fontStyle: 'italic',
                  position: 'absolute', top: -24, left: -8, pointerEvents: 'none',
                }} aria-hidden="true">"</span>

                <blockquote className="relative z-10">
                  <p style={{
                    fontFamily: INSTRUMENT, fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                    fontStyle: 'italic', lineHeight: 1.45, color: 'rgba(255,255,255,0.6)',
                    letterSpacing: '-0.01em',
                  }}>
                    {ru
                      ? 'Мы потратили полгода на маркетплейс и потеряли 3 миллиона на комиссиях. С WEB4TG запустились за день. Продажи — плюс 340% за первый месяц.'
                      : 'We spent six months on a marketplace and lost $40k in fees. With WEB4TG we launched in one day. Sales — up 340% in the first month.'}
                  </p>
                </blockquote>

                <div className="mt-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
                    <span style={{ fontFamily: SYNE, fontSize: '0.6875rem', fontWeight: 700, color: EMERALD }}>А</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: SYNE, fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                      {ru ? 'Александр М.' : 'Alexander M.'}
                    </div>
                    <div style={{ fontFamily: INTER, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)' }}>
                      {ru ? 'Основатель TimeElite' : 'Founder, TimeElite'}
                    </div>
                  </div>
                </div>
              </div>
            </Cin>
          </section>

          <section className="px-6 pt-8 pb-10" aria-label="CTA">
            <Cin>
              <div className="relative overflow-hidden rounded-3xl py-14 px-7 text-center" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse at 50% 120%, ${EMERALD}10 0%, transparent 70%)`,
                }} />

                <div className="relative z-10">
                  <h2 style={{
                    fontFamily: SYNE, fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
                    fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.05,
                  }}>
                    {ru ? 'Ваш ход' : 'Your move'}
                  </h2>
                  <p className="mt-3 mx-auto" style={{
                    maxWidth: 260,
                    fontFamily: INSTRUMENT, fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                    fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5,
                  }}>
                    {ru ? 'Бесплатная консультация. Первый прототип — завтра.' : 'Free consultation. First prototype — tomorrow.'}
                  </p>

                  <button
                    onClick={() => nav('projects')}
                    className="mt-7 inline-flex items-center gap-2 rounded-full px-7 transition-all duration-500 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                    style={{ height: 50, background: '#fff', boxShadow: '0 0 60px rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 80px rgba(255,255,255,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 60px rgba(255,255,255,0.06)'; }}
                  >
                    <span style={{ fontFamily: SYNE, fontSize: '0.8125rem', fontWeight: 700, color: '#000' }}>
                      {ru ? 'Начать' : 'Get Started'}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </Cin>
          </section>

          <footer className="px-6 py-8 mb-20" role="contentinfo" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Cin>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: SYNE, fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.03em' }}>
                  WEB4TG
                </span>
                <span style={{ fontFamily: INTER, fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>
                  &copy; {new Date().getFullYear()}
                </span>
              </div>
            </Cin>
          </footer>

        </div>
      </div>
    </div>
  );
}
