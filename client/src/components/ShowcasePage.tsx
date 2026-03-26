import { ArrowUpRight, ChevronRight, Play, Zap, CreditCard, Bot, BarChart3, Palette, Rocket } from "lucide-react";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { m, AnimatePresence, useInView, useScroll, useTransform } from '@/utils/LazyMotionProvider';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import { FavoriteButton } from './FavoriteButton';
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

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function Cin({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const r = useRef(null);
  const v = useInView(r, { once: true, margin: "-80px" });
  const rm = prefersReducedMotion();
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

function Ct({ to, suffix = "" }: { to: number; suffix?: string }) {
  const r = useRef(null);
  const v = useInView(r, { once: true });
  const rm = prefersReducedMotion();
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

const FEATURES = [
  { icon: Rocket, color: '#34d399', tRu: 'Запуск за 24ч', tEn: 'Launch in 24h', sRu: 'От идеи до работающего приложения — один день', sEn: 'From idea to working app — one day' },
  { icon: CreditCard, color: '#60a5fa', tRu: 'Платежи', tEn: 'Payments', sRu: 'Stripe, YooKassa, криптовалюты — любой способ оплаты', sEn: 'Stripe, YooKassa, crypto — any payment method' },
  { icon: Bot, color: '#a78bfa', tRu: 'AI-ассистент', tEn: 'AI Assistant', sRu: 'Умный бот отвечает клиентам 24/7, увеличивает конверсию на 40%', sEn: 'Smart bot answers customers 24/7, boosts conversion by 40%' },
  { icon: BarChart3, color: '#f97316', tRu: 'Аналитика', tEn: 'Analytics', sRu: 'Воронка продаж, когорты, LTV — всё в реальном времени', sEn: 'Sales funnel, cohorts, LTV — all in real-time' },
  { icon: Palette, color: '#f472b6', tRu: 'Премиум дизайн', tEn: 'Premium Design', sRu: 'Уровень Apple Store. Каждый пиксель проработан', sEn: 'Apple Store level. Every pixel perfected' },
  { icon: Zap, color: '#facc15', tRu: '0% комиссий', tEn: '0% Commission', sRu: 'Маркетплейсы берут до 25%. Мы — ноль', sEn: 'Marketplaces take up to 25%. We take zero' },
];

export default function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const { t, language } = useLanguage();
  const ru = language === 'ru';
  const { videoRef } = useVideoLazyLoad({ threshold: 0.25 });
  const { markAsViewed } = useViewedDemos();
  const queryClient = useQueryClient();

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
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setWi(i => (i + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length]);

  const openDemo = useCallback((id: string) => {
    haptic.light(); markAsViewed(id); onOpenDemo(id);
  }, [haptic, onOpenDemo, markAsViewed]);

  const nav = useCallback((s: string) => {
    haptic.light(); onNavigate(s);
  }, [haptic, onNavigate]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const cases = useMemo(() => [
    { id: 'electronics', vid: true, src: "/videos/techstore_2025.mp4", label: 'TechStore', sub: ru ? 'Электроника' : 'Electronics', growth: '+220%', cat: ru ? 'Техника' : 'Tech' },
    { id: 'luxury-watches', vid: true, src: "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4", label: 'TimeElite', sub: ru ? 'Премиум часы' : 'Premium watches', growth: '+340%', cat: ru ? 'Люкс' : 'Luxury' },
    { id: 'luxury-perfume', vid: true, src: "/videos/luxury_fragrance.mp4", label: 'FragranceRoyale', sub: ru ? 'Нишевая парфюмерия' : 'Niche perfumery', growth: '+290%', cat: ru ? 'Бьюти' : 'Beauty' },
    { id: 'sneaker-store', vid: false, src: nikeGreenImage, label: 'SneakerVault', sub: ru ? 'Культ кроссовок' : 'Sneaker culture', growth: '+280%', cat: ru ? 'Мода' : 'Fashion' },
    { id: 'clothing-store', vid: false, src: rascalImage, label: 'Rascal', sub: ru ? 'Уличная мода' : 'Street fashion', growth: '+195%', cat: ru ? 'Мода' : 'Fashion' },
  ], [ru]);

  const testimonials = useMemo(() => [
    {
      text: ru ? 'Мы потратили полгода на маркетплейс и потеряли 3 миллиона на комиссиях. С WEB4TG запустились за день. Продажи — плюс 340% за первый месяц.' : 'We spent six months on a marketplace and lost $40k in fees. With WEB4TG we launched in one day. Sales — up 340% in the first month.',
      name: ru ? 'Александр М.' : 'Alexander M.',
      role: ru ? 'Основатель TimeElite' : 'Founder, TimeElite',
      initial: 'А',
    },
    {
      text: ru ? 'AI-ассистент закрывает 70% вопросов клиентов автоматически. Мы сократили расходы на поддержку вдвое и увеличили средний чек на 25%.' : 'AI assistant handles 70% of customer questions automatically. We cut support costs in half and increased average order by 25%.',
      name: ru ? 'Марина К.' : 'Marina K.',
      role: ru ? 'CEO FragranceRoyale' : 'CEO, FragranceRoyale',
      initial: 'М',
    },
    {
      text: ru ? 'Дизайн нашего магазина не отличить от приложения Apple. Клиенты думают что мы — крупный бренд. Это сразу увеличило доверие и конверсию.' : 'Our store design is indistinguishable from an Apple app. Customers think we\'re a major brand. This immediately boosted trust and conversion.',
      name: ru ? 'Дмитрий Р.' : 'Dmitry R.',
      role: ru ? 'Владелец SneakerVault' : 'Owner, SneakerVault',
      initial: 'Д',
    },
  ], [ru]);

  return (
    <div className="min-h-screen select-none overflow-x-hidden showcase-page" style={{ backgroundColor: '#050505' }}>
      <div className="relative z-10">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} shouldShow={shouldShowIndicator} progress={progress} />

        <div className="mx-auto w-full" style={{ maxWidth: 540 }}>

          {/* ═══════ HERO ═══════ */}
          <header ref={heroRef} className="relative px-6 pt-14 pb-14 overflow-hidden" role="banner" style={{ minHeight: '85vh' }}>

            <div className="absolute inset-0 z-0 overflow-hidden">
              <video
                src="/videos/c9813b0736406c97569176fcb5574fc0_720w_1774527449119.mp4"
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.5, filter: 'saturate(0.5) contrast(1.1)' }}
              />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(180deg, #050505 0%, rgba(5,5,5,0.3) 40%, rgba(5,5,5,0.3) 60%, #050505 100%)',
              }} />
              <div className="absolute inset-0" style={{
                background: `radial-gradient(ellipse at 20% 80%, ${EMERALD}0a 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.04) 0%, transparent 50%)`,
              }} />
            </div>

            <m.div className="relative z-10 flex flex-col justify-end" style={{ minHeight: '72vh', y: heroY, opacity: heroOpacity }}>

              <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
                className="mb-5"
              >
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{
                  background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
                }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: EMERALD }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: EMERALD }} />
                  </span>
                  <span style={{
                    fontFamily: INTER, fontSize: '0.6875rem',
                    fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                    color: EMERALD,
                  }}>
                    WEB4TG Studio
                  </span>
                </span>
              </m.div>

              <m.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ fontFamily: SYNE, lineHeight: 0.92, letterSpacing: '-0.06em' }}
              >
                <m.span
                  className="block"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
                  style={{ fontSize: 'clamp(3rem, 11vw, 4.5rem)', fontWeight: 800, color: '#fff' }}
                >
                  {ru ? 'Впереди' : 'Beyond'}
                </m.span>

                <span className="block overflow-hidden" style={{ height: 'clamp(3.2rem, 12vw, 5rem)' }}>
                  <AnimatePresence mode="wait">
                    <m.span
                      key={wi}
                      className="block"
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{ y: '-100%', opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      style={{
                        fontSize: 'clamp(3rem, 11vw, 4.5rem)', fontWeight: 800,
                        fontFamily: INSTRUMENT, fontStyle: 'italic',
                        background: `linear-gradient(135deg, ${EMERALD}, #a7f3d0)`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {words[wi]}
                    </m.span>
                  </AnimatePresence>
                </span>
              </m.h1>

              <m.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.9 }}
                className="mt-6 max-w-xs"
                style={{
                  fontFamily: INTER, fontSize: 'clamp(0.85rem, 2.2vw, 1rem)',
                  lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', fontWeight: 400,
                }}
              >
                {ru
                  ? 'Создаём мини-приложения для Telegram, которые продают. Без комиссий. Готово за 24 часа.'
                  : 'We build Telegram mini apps that sell. Zero fees. Ready in 24 hours.'}
              </m.p>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
                className="mt-7 flex items-center gap-4"
              >
                <button
                  onClick={() => nav('projects')}
                  className="group flex items-center gap-2.5 rounded-full px-6 transition-all duration-500 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                  style={{ height: 48, background: '#fff' }}
                >
                  <span style={{ fontFamily: SYNE, fontSize: '0.8125rem', fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>
                    {ru ? 'Начать проект' : 'Start a Project'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
                </button>

                <button
                  onClick={() => openDemo('luxury-watches')}
                  className="flex items-center gap-2 rounded-full px-4 transition-all duration-300 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:outline-offset-2"
                  style={{ height: 48, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  aria-label={ru ? 'Посмотреть демо' : 'View demo'}
                >
                  <Play className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} fill="rgba(255,255,255,0.6)" />
                  <span style={{ fontFamily: INTER, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
                    {ru ? 'Демо' : 'Demo'}
                  </span>
                </button>
              </m.div>
            </m.div>
          </header>

          {/* ═══════ MARQUEE ═══════ */}
          <div className="py-4 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <m.div
              animate={prefersReducedMotion() ? {} : { x: ['0%', '-50%'] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="flex items-center gap-8 whitespace-nowrap"
              style={{ width: 'max-content' }}
            >
              {[0, 1].map(rep => (
                <div key={rep} className="flex items-center gap-8">
                  {(ru
                    ? ['22 демо-приложения', '0% комиссий', 'Запуск за 24ч', 'AI-ассистент 24/7', 'Премиум дизайн', 'Аналитика', 'Telegram Mini Apps']
                    : ['22 Demo Apps', '0% Fees', 'Launch in 24h', 'AI Assistant 24/7', 'Premium Design', 'Analytics', 'Telegram Mini Apps']
                  ).map((txt, j) => (
                    <span key={j} className="flex items-center gap-8">
                      <span style={{
                        fontFamily: SYNE, fontSize: '0.6875rem',
                        fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                        color: 'rgba(255,255,255,0.3)',
                      }}>{txt}</span>
                      <span style={{ color: EMERALD, opacity: 0.35, fontSize: '5px' }}>●</span>
                    </span>
                  ))}
                </div>
              ))}
            </m.div>
          </div>

          {/* ═══════ CASE STUDIES ═══════ */}
          <section className="py-14" aria-label={ru ? 'Кейсы' : 'Case studies'}>
            <Cin className="px-6 mb-5">
              <div className="flex items-end justify-between">
                <div>
                  <h2 style={{
                    fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                    fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
                  }}>
                    {ru ? 'Наши работы' : 'Selected Work'}
                  </h2>
                  <p className="mt-1" style={{
                    fontFamily: INTER, fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                    color: 'rgba(255,255,255,0.45)',
                  }}>
                    {ru ? '22 готовых приложения. Каждое приносит рост.' : '22 ready apps. Each drives growth.'}
                  </p>
                </div>
                <button onClick={() => nav('projects')} className="flex items-center gap-0.5 active:opacity-50 transition-opacity pb-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-2 rounded">
                  <span style={{ fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    {ru ? 'Все' : 'All'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                </button>
              </div>
            </Cin>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3.5 px-6" style={{ width: 'max-content', paddingRight: 24 }}>
                {cases.map((c, i) => (
                    <article
                      key={c.id}
                      className="relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                      style={{ width: 260, height: 380, transition: 'transform 0.15s ease', touchAction: 'pan-x' }}
                      role="button" tabIndex={0}
                      aria-label={`${ru ? 'Открыть' : 'Open'} ${c.label}`}
                      onClick={() => openDemo(c.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDemo(c.id); } }}
                    >
                      {c.vid ? (
                        <video ref={i === 0 ? videoRef : undefined} src={c.src} loop muted playsInline autoPlay
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ filter: 'brightness(0.8) saturate(0.9)' }} />
                      ) : (
                        <img src={c.src} alt={c.label} loading="lazy" draggable={false}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ filter: 'brightness(0.8) saturate(0.9)' }} />
                      )}

                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(5,5,5,0.9) 100%)' }} />

                      <div className="absolute top-3.5 right-3.5 z-10" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <FavoriteButton demoId={c.id} size="md" />
                      </div>

                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                        <span className="inline-block rounded-full px-2.5 py-1" style={{
                          background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)',
                          fontFamily: SYNE, fontSize: '0.625rem', fontWeight: 700, color: EMERALD,
                        }}>{c.growth}</span>
                        <span className="inline-block rounded-full px-2 py-1" style={{
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)',
                          fontFamily: INTER, fontSize: '0.6rem', fontWeight: 500, color: 'rgba(255,255,255,0.45)',
                        }}>{c.cat}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 style={{
                          fontFamily: SYNE, fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)',
                          fontWeight: 800, color: '#fff', letterSpacing: '-0.04em',
                        }}>{c.label}</h3>
                        <p className="mt-0.5" style={{
                          fontFamily: INSTRUMENT, fontSize: '0.875rem',
                          fontStyle: 'italic', color: 'rgba(255,255,255,0.5)',
                        }}>{c.sub}</p>
                      </div>
                    </article>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ SOCIAL PROOF STRIP ═══════ */}
          <Cin className="px-6 pb-10">
            <div className="flex items-center justify-between py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                { n: '22', l: ru ? 'приложения' : 'apps' },
                { n: '50+', l: ru ? 'клиентов' : 'clients' },
                { n: '340%', l: ru ? 'макс. рост' : 'max growth' },
              ].map((s, i) => (
                <div key={i} className="text-center flex-1">
                  <div style={{
                    fontFamily: SYNE, fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
                    fontWeight: 800, color: '#fff', letterSpacing: '-0.04em',
                  }}>
                    {i === 0 ? <Ct to={22} /> : i === 1 ? <Ct to={50} suffix="+" /> : <Ct to={340} suffix="%" />}
                  </div>
                  <div style={{
                    fontFamily: INTER, fontSize: '0.625rem', fontWeight: 500,
                    color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em', textTransform: 'uppercase' as const, marginTop: 2,
                  }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Cin>

          {/* ═══════ FEATURES ═══════ */}
          <section className="px-6 py-12" aria-label={ru ? 'Возможности' : 'Features'} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
            <Cin>
              <h2 className="mb-8" style={{
                fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {ru ? <>Полный стек.<br />Ничего лишнего.</> : <>Full stack.<br />Nothing extra.</>}
              </h2>
            </Cin>

            <div className="space-y-2.5">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Cin key={i} delay={i * 0.04}>
                    <div
                      className="flex items-start gap-4 rounded-2xl p-4 transition-all duration-400 group"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${f.color}12` }}>
                        <Icon className="w-5 h-5" style={{ color: f.color }} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 style={{
                          fontFamily: SYNE, fontSize: '0.9rem',
                          fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
                        }}>{ru ? f.tRu : f.tEn}</h3>
                        <p className="mt-0.5" style={{
                          fontFamily: INTER, fontSize: '0.75rem',
                          lineHeight: 1.55, color: 'rgba(255,255,255,0.4)',
                        }}>{ru ? f.sRu : f.sEn}</p>
                      </div>
                    </div>
                  </Cin>
                );
              })}
            </div>
          </section>

          {/* ═══════ BIG NUMBERS ═══════ */}
          <section className="px-6 py-16" aria-label={ru ? 'Метрики' : 'Metrics'} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' }}>
            <div className="space-y-14">
              {[
                { num: 900, sfx: 'M+', title: ru ? 'пользователей Telegram' : 'Telegram users', desc: ru ? 'Ваш магазин — прямо у них в кармане. Без скачиваний, без App Store.' : 'Your store — right in their pocket. No downloads, no App Store.' },
                { num: 0, sfx: '%', title: ru ? 'комиссий маркетплейсов' : 'marketplace commission', desc: ru ? 'Wildberries берёт 15–25%. Ozon — до 20%. Вы оставляете себе всё.' : 'Amazon takes 15%. eBay takes 13%. You keep everything.' },
                { num: 24, sfx: ru ? 'ч' : 'h', title: ru ? 'от идеи до первого заказа' : 'from idea to first order', desc: ru ? 'Выбираете шаблон утром — вечером принимаете оплату.' : 'Pick a template in the morning — accept payments by evening.' },
              ].map((met, i) => (
                <Cin key={i} delay={i * 0.06}>
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0" style={{
                      fontFamily: SYNE, fontSize: 'clamp(3rem, 12vw, 5rem)',
                      fontWeight: 800, lineHeight: 0.85, letterSpacing: '-0.06em',
                      color: i === 0 ? '#fff' : 'transparent',
                      WebkitTextStroke: i === 0 ? 'none' : '1.5px rgba(255,255,255,0.12)',
                      minWidth: 'clamp(90px, 30vw, 140px)',
                    }}>
                      <Ct to={met.num} suffix={met.sfx} />
                    </div>
                    <div className="pt-2">
                      <div style={{
                        fontFamily: SYNE, fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                        fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.02em',
                      }}>{met.title}</div>
                      <p className="mt-1" style={{
                        fontFamily: INTER, fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                        lineHeight: 1.6, color: 'rgba(255,255,255,0.35)',
                      }}>{met.desc}</p>
                    </div>
                  </div>
                </Cin>
              ))}
            </div>
          </section>

          {/* ═══════ TESTIMONIALS ═══════ */}
          <section className="py-14" aria-label={ru ? 'Отзывы' : 'Testimonials'}>
            <Cin className="px-6 mb-5">
              <h2 style={{
                fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {ru ? 'Клиенты говорят' : 'Clients speak'}
              </h2>
            </Cin>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3.5 px-6" style={{ width: 'max-content', paddingRight: 24 }}>
                {testimonials.map((tm, i) => (
                  <Cin key={i} delay={i * 0.1}>
                    <figure
                      className="flex-shrink-0 rounded-2xl p-5 flex flex-col justify-between"
                      style={{
                        width: 300, minHeight: 220,
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <blockquote>
                        <p style={{
                          fontFamily: INSTRUMENT, fontSize: '0.9375rem',
                          fontStyle: 'italic', lineHeight: 1.55, color: 'rgba(255,255,255,0.55)',
                        }}>
                          "{tm.text}"
                        </p>
                      </blockquote>

                      <figcaption className="mt-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${EMERALD}18` }}>
                          <span style={{ fontFamily: SYNE, fontSize: '0.625rem', fontWeight: 700, color: EMERALD }}>{tm.initial}</span>
                        </div>
                        <div>
                          <div style={{ fontFamily: SYNE, fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                            {tm.name}
                          </div>
                          <div style={{ fontFamily: INTER, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)' }}>
                            {tm.role}
                          </div>
                        </div>
                      </figcaption>
                    </figure>
                  </Cin>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ COMPARISON — До / После ═══════ */}
          <section className="px-6 py-14" aria-label={ru ? 'Сравнение' : 'Comparison'} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 400px' }}>
            <Cin>
              <h2 className="mb-6" style={{
                fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {ru ? <>Маркетплейс<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>vs</span> WEB4TG</> : <>Marketplace<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>vs</span> WEB4TG</>}
              </h2>
            </Cin>

            <div className="space-y-2">
              {[
                { label: ru ? 'Комиссия' : 'Commission', old: '15–25%', now: '0%' },
                { label: ru ? 'Запуск' : 'Launch', old: ru ? '2–6 мес' : '2–6 mo', now: '24h' },
                { label: ru ? 'Дизайн' : 'Design', old: ru ? 'Шаблонный' : 'Template', now: ru ? 'Премиум' : 'Premium' },
                { label: ru ? 'AI-бот' : 'AI Bot', old: '—', now: '24/7' },
                { label: ru ? 'Аналитика' : 'Analytics', old: ru ? 'Базовая' : 'Basic', now: ru ? 'Продвинутая' : 'Advanced' },
                { label: ru ? 'Бренд' : 'Brand', old: ru ? 'Потерян' : 'Lost', now: ru ? 'Ваш' : 'Yours' },
              ].map((row, i) => (
                <Cin key={i} delay={i * 0.03}>
                  <div className="flex items-center rounded-xl py-3 px-4" style={{ background: 'rgba(255,255,255,0.015)' }}>
                    <span className="flex-1" style={{
                      fontFamily: INTER, fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)',
                    }}>{row.label}</span>
                    <span className="w-20 text-center" style={{
                      fontFamily: INTER, fontSize: '0.75rem', fontWeight: 500,
                      color: 'rgba(255,255,255,0.2)', textDecoration: 'line-through',
                    }}>{row.old}</span>
                    <span className="w-20 text-right" style={{
                      fontFamily: SYNE, fontSize: '0.8rem', fontWeight: 700,
                      color: EMERALD,
                    }}>{row.now}</span>
                  </div>
                </Cin>
              ))}
            </div>
          </section>

          {/* ═══════ PROCESS ═══════ */}
          <section className="px-6 py-14" aria-label={ru ? 'Процесс' : 'Process'} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
            <Cin>
              <span style={{
                fontFamily: SYNE, fontSize: '0.6875rem',
                fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.25)',
              }}>
                {ru ? 'Как это работает' : 'How it works'}
              </span>
              <h2 className="mt-2 mb-8" style={{
                fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {ru ? 'Три шага' : 'Three steps'}
              </h2>
            </Cin>

            <div className="relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-px" style={{
                background: `linear-gradient(180deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)`,
              }} />

              {[
                { n: '01', t: ru ? 'Бриф' : 'Brief', d: ru ? 'Выберите шаблон из 22 готовых или расскажите свою идею. Мы начнём в тот же день.' : 'Pick from 22 ready templates or share your idea. We start the same day.' },
                { n: '02', t: ru ? 'Сборка' : 'Build', d: ru ? 'Дизайн, фронтенд, бэкенд, платежи, AI-ассистент — всё за 24–48 часов.' : 'Design, frontend, backend, payments, AI assistant — all in 24–48 hours.' },
                { n: '03', t: ru ? 'Запуск' : 'Launch', d: ru ? 'Деплой в Telegram. Аналитика подключена. Ваш бизнес работает.' : 'Deploy to Telegram. Analytics connected. Your business is live.' },
              ].map((s, i) => (
                <Cin key={i} delay={i * 0.08}>
                  <div className="flex items-start gap-4 mb-8 last:mb-0 relative">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{
                      background: i === 2 ? `${EMERALD}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${i === 2 ? `${EMERALD}30` : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <span style={{
                        fontFamily: SYNE, fontSize: '0.6875rem', fontWeight: 800,
                        color: i === 2 ? EMERALD : 'rgba(255,255,255,0.25)',
                      }}>{s.n}</span>
                    </div>
                    <div className="pt-1.5">
                      <h3 style={{
                        fontFamily: SYNE, fontSize: '1rem',
                        fontWeight: 700, color: '#fff', letterSpacing: '-0.03em',
                      }}>{s.t}</h3>
                      <p className="mt-1" style={{
                        fontFamily: INTER, fontSize: '0.8rem',
                        lineHeight: 1.6, color: 'rgba(255,255,255,0.4)',
                      }}>{s.d}</p>
                    </div>
                  </div>
                </Cin>
              ))}
            </div>
          </section>

          {/* ═══════ TECH STACK ═══════ */}
          <Cin className="px-6 py-10">
            <div className="text-center mb-4">
              <span style={{
                fontFamily: SYNE, fontSize: '0.6875rem',
                fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.2)',
              }}>
                {ru ? 'Технологии' : 'Tech Stack'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe', 'Telegram API', 'OpenAI'].map((tech, i) => (
                <span key={i} style={{
                  fontFamily: INTER, fontSize: '0.6875rem', fontWeight: 500,
                  color: 'rgba(255,255,255,0.2)', letterSpacing: '0.02em',
                }}>{tech}</span>
              ))}
            </div>
          </Cin>

          {/* ═══════ FINAL CTA ═══════ */}
          <section className="px-6 pt-6 pb-8" aria-label="CTA" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 350px' }}>
            <Cin>
              <div className="relative overflow-hidden rounded-2xl py-12 px-6 text-center" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse at 50% 120%, ${EMERALD}0c 0%, transparent 70%)`,
                }} />

                <div className="relative z-10">
                  <h2 style={{
                    fontFamily: SYNE, fontSize: 'clamp(1.6rem, 6vw, 2.25rem)',
                    fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.05,
                  }}>
                    {ru ? 'Ваш ход' : 'Your move'}
                  </h2>
                  <p className="mt-3 mx-auto" style={{
                    maxWidth: 280,
                    fontFamily: INTER, fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.4)', lineHeight: 1.55,
                  }}>
                    {ru ? 'Бесплатная консультация. Первый прототип — завтра. Без обязательств.' : 'Free consultation. First prototype — tomorrow. No strings attached.'}
                  </p>

                  <button
                    onClick={() => nav('projects')}
                    className="mt-6 inline-flex items-center gap-2 rounded-full px-7 transition-all duration-500 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                    style={{ height: 48, background: '#fff' }}
                  >
                    <span style={{ fontFamily: SYNE, fontSize: '0.8125rem', fontWeight: 700, color: '#000' }}>
                      {ru ? 'Начать' : 'Get Started'}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </button>

                  <p className="mt-4" style={{
                    fontFamily: INTER, fontSize: '0.6875rem',
                    color: 'rgba(255,255,255,0.2)',
                  }}>
                    {ru ? 'Ответим в течение часа' : 'We reply within an hour'}
                  </p>
                </div>
              </div>
            </Cin>
          </section>

          {/* ═══════ FOOTER ═══════ */}
          <footer className="px-6 py-8 mb-20" role="contentinfo" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <Cin>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: SYNE, fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.03em' }}>
                  WEB4TG
                </span>
                <span style={{ fontFamily: INTER, fontSize: '0.625rem', color: 'rgba(255,255,255,0.15)' }}>
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
