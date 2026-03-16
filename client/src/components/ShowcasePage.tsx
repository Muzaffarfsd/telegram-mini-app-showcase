import { ArrowUpRight, ChevronRight } from "lucide-react";
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

/* ─────────── Design System ─────────── */
const SYNE = '"Syne", system-ui, sans-serif';
const INSTRUMENT = '"Instrument Serif", Georgia, serif';
const INTER = '"Inter", -apple-system, system-ui, sans-serif';
const EMERALD = '#34d399';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ─────────── Scroll-triggered reveal ─────────── */
function Cin({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const r = useRef(null);
  const v = useInView(r, { once: true, margin: "-100px" });
  const rm = prefersReducedMotion();
  return (
    <m.div ref={r}
      initial={rm ? { opacity: 1 } : { opacity: 0, y: 50 }}
      animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: rm ? 0 : 0.9, ease: EASE, delay: rm ? 0 : delay }}
      className={className}>
      {children}
    </m.div>
  );
}

/* ─────────── Animated counter ─────────── */
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

/* ─────────── Rotating tagline words ─────────── */
const TAG_WORDS = {
  ru: ["конкурентов", "рынка", "ожиданий", "привычного"],
  en: ["competition", "expectations", "the ordinary", "the status quo"],
};

/* ══════════════════════════════════════════════════ */

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
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setWi(i => (i + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length]);

  const openDemo = useCallback((id: string) => {
    haptic.light(); markAsViewed(id); onOpenDemo(id);
  }, [haptic, onOpenDemo, markAsViewed]);

  const nav = useCallback((s: string) => {
    haptic.light(); onNavigate(s);
  }, [haptic, onNavigate]);

  /* hero parallax */
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const cases = useMemo(() => [
    { id: 'luxury-watches', vid: true, src: "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4", label: 'TimeElite', sub: ru ? 'Роскошь на запястье' : 'Luxury on your wrist', growth: '+340%' },
    { id: 'sneaker-store', vid: false, src: nikeGreenImage, label: 'SneakerVault', sub: ru ? 'Культ кроссовок' : 'Sneaker culture', growth: '+280%' },
    { id: 'clothing-store', vid: false, src: rascalImage, label: 'Rascal', sub: ru ? 'Уличная мода' : 'Street fashion', growth: '+195%' },
  ], [ru]);

  return (
    <div className="min-h-screen select-none overflow-x-hidden showcase-page" style={{ backgroundColor: '#050505' }}>
      <div className="relative z-10">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} shouldShow={shouldShowIndicator} progress={progress} />

        <div className="mx-auto w-full" style={{ maxWidth: 540 }}>

          {/* ═══════ HERO — full-screen cinematic ═══════ */}
          <header ref={heroRef} className="relative px-6 pt-16 pb-16 overflow-hidden" role="banner">

            {/* Background gradient layer */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 80%, ${EMERALD}08 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.02) 0%, transparent 50%)` }} />
            </div>

            <m.div className="relative z-10" style={{ y: heroY, opacity: heroOpacity }}>

              {/* Small eyebrow */}
              <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
                className="mb-6"
              >
                <span style={{
                  fontFamily: INTER, fontSize: 'clamp(0.55rem, 1.2vw, 0.65rem)',
                  fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase' as const,
                  color: EMERALD, opacity: 0.9
                }}>
                  WEB4TG Studio
                </span>
              </m.div>

              {/* Cinematic headline — each word on its own line */}
              <m.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ fontFamily: SYNE, lineHeight: 0.92, letterSpacing: '-0.06em' }}
              >
                <m.span
                  className="block"
                  initial={{ opacity: 0, y: 60, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
                  style={{ fontSize: 'clamp(3.2rem, 12vw, 5rem)', fontWeight: 800, color: '#fff' }}
                >
                  {ru ? 'Впереди' : 'Beyond'}
                </m.span>

                {/* rotating word */}
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

              {/* Subtitle */}
              <m.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.9 }}
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

              {/* CTA */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
                className="mt-8 flex items-center gap-4"
              >
                <button
                  onClick={() => nav('projects')}
                  className="group flex items-center gap-2.5 rounded-full px-6 transition-all duration-500 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                  style={{
                    height: 50, background: '#fff',
                    boxShadow: '0 0 0 0 rgba(255,255,255,0)',
                  }}
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
                  className="flex items-center gap-2 transition-opacity duration-300 active:opacity-60"
                  aria-label={ru ? 'Посмотреть демо' : 'View demo'}
                >
                  <span style={{
                    fontFamily: INTER, fontSize: 'clamp(0.7rem, 1.5vw, 0.8125rem)',
                    fontWeight: 500, color: 'rgba(255,255,255,0.5)',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                    paddingBottom: 2,
                  }}>
                    {ru ? 'Демо' : 'Demo'}
                  </span>
                </button>
              </m.div>
            </m.div>
          </header>

          {/* ═══════ MARQUEE — horizontal ticker ═══════ */}
          <div className="py-5 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <m.div
              animate={prefersReducedMotion() ? {} : { x: ['0%', '-50%'] }}
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

          {/* ═══════ REEL — case studies ═══════ */}
          <section className="py-16" aria-label={ru ? 'Кейсы' : 'Case studies'}>
            <Cin className="px-6 mb-6">
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
                    {ru ? 'Каждый проект — рост продаж от 195%' : 'Every project — 195%+ sales growth'}
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

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 px-6" style={{ width: 'max-content', paddingRight: 24 }}>
                {cases.map((c, i) => (
                  <Cin key={c.id} delay={i * 0.1}>
                    <article
                      className="relative flex-shrink-0 rounded-3xl overflow-hidden group cursor-pointer transition-transform duration-500 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                      style={{ width: 280, height: 400 }}
                      role="button" tabIndex={0}
                      aria-label={`${ru ? 'Открыть' : 'Open'} ${c.label}`}
                      onClick={() => openDemo(c.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDemo(c.id); } }}
                    >
                      {c.vid ? (
                        <video ref={i === 0 ? videoRef : undefined} src={c.src} loop muted playsInline autoPlay
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                          style={{ filter: 'brightness(0.4) saturate(0.6)' }} />
                      ) : (
                        <img src={c.src} alt={c.label} loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                          style={{ filter: 'brightness(0.4) saturate(0.6)' }} />
                      )}

                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(5,5,5,0.95) 100%)' }} />

                      <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <FavoriteButton demoId={c.id} size="md" />
                      </div>

                      {/* Growth badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-block rounded-full px-2.5 py-1" style={{
                          background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)',
                          fontFamily: SYNE, fontSize: '0.6875rem', fontWeight: 700, color: EMERALD,
                        }}>{c.growth}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 style={{
                          fontFamily: SYNE, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
                          fontWeight: 800, color: '#fff', letterSpacing: '-0.04em',
                        }}>{c.label}</h3>
                        <p className="mt-1" style={{
                          fontFamily: INSTRUMENT, fontSize: 'clamp(0.8rem, 2vw, 0.9375rem)',
                          fontStyle: 'italic', color: 'rgba(255,255,255,0.4)',
                        }}>{c.sub}</p>
                      </div>
                    </article>
                  </Cin>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ BIG NUMBERS — cinematic metrics ═══════ */}
          <section className="px-6 py-20" aria-label={ru ? 'Метрики' : 'Metrics'}>
            <div className="space-y-16">
              {[
                { num: 900, sfx: 'M+', title: ru ? 'пользователей Telegram' : 'Telegram users', desc: ru ? 'Ваш магазин — прямо у них в кармане' : 'Your store — right in their pocket' },
                { num: 0, sfx: '%', title: ru ? 'комиссий' : 'commission', desc: ru ? 'Маркетплейсы забирают до 25%. Мы — ноль' : 'Marketplaces take up to 25%. We take zero' },
                { num: 24, sfx: ru ? 'ч' : 'h', title: ru ? 'до запуска' : 'to launch', desc: ru ? 'От идеи до первого заказа — один день' : 'From idea to first order — one day' },
              ].map((m, i) => (
                <Cin key={i} delay={i * 0.06}>
                  <div>
                    <div style={{
                      fontFamily: SYNE, fontSize: 'clamp(4rem, 16vw, 7rem)',
                      fontWeight: 800, lineHeight: 0.85, letterSpacing: '-0.06em',
                      color: i === 0 ? '#fff' : 'transparent',
                      WebkitTextStroke: i === 0 ? 'none' : '1.5px rgba(255,255,255,0.15)',
                    }}>
                      <Ct to={m.num} suffix={m.sfx} />
                    </div>
                    <div className="mt-3" style={{
                      fontFamily: SYNE, fontSize: 'clamp(0.7rem, 1.8vw, 0.875rem)',
                      fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.02em',
                    }}>{m.title}</div>
                    <div className="mt-1" style={{
                      fontFamily: INSTRUMENT, fontSize: 'clamp(0.8rem, 2vw, 0.9375rem)',
                      fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5,
                    }}>{m.desc}</div>
                  </div>
                </Cin>
              ))}
            </div>
          </section>

          {/* ═══════ WHAT WE BUILD — visual grid ═══════ */}
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
              {[
                { emoji: '⚡', t: ru ? 'Запуск' : 'Launch', s: '24h', span: '' },
                { emoji: '💳', t: ru ? 'Платежи' : 'Payments', s: 'Stripe · YooKassa', span: '' },
                { emoji: '🤖', t: ru ? 'AI-агент' : 'AI Agent', s: ru ? 'Поддержка 24/7' : 'Support 24/7', span: 'col-span-2' },
                { emoji: '📊', t: ru ? 'Аналитика' : 'Analytics', s: ru ? 'Реальное время' : 'Real-time', span: '' },
                { emoji: '🎨', t: ru ? 'Дизайн' : 'Design', s: ru ? 'Уровень Apple' : 'Apple-level', span: '' },
              ].map((f, i) => (
                <Cin key={i} delay={i * 0.04} className={f.span}>
                  <div
                    className="rounded-2xl p-4 transition-all duration-500 group"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                  >
                    <span className="text-xl transition-transform duration-300 inline-block group-hover:scale-125">{f.emoji}</span>
                    <div className="mt-2" style={{
                      fontFamily: SYNE, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                      fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
                    }}>{f.t}</div>
                    <div className="mt-0.5" style={{
                      fontFamily: INTER, fontSize: 'clamp(0.65rem, 1.4vw, 0.75rem)',
                      color: 'rgba(255,255,255,0.45)',
                    }}>{f.s}</div>
                  </div>
                </Cin>
              ))}
            </div>
          </section>

          {/* ═══════ SINGLE TESTIMONIAL — editorial ═══════ */}
          <section className="px-6 py-20" aria-label={ru ? 'Отзыв' : 'Testimonial'}>
            <Cin>
              <div className="relative">
                <span style={{
                  fontFamily: INSTRUMENT, fontSize: 'clamp(5rem, 18vw, 8rem)',
                  lineHeight: 0.7, color: 'rgba(52,211,153,0.08)', fontStyle: 'italic',
                  position: 'absolute', top: -24, left: -8, pointerEvents: 'none',
                }}>"</span>

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
                    <div style={{ fontFamily: INTER, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.25)' }}>
                      {ru ? 'Основатель TimeElite' : 'Founder, TimeElite'}
                    </div>
                  </div>
                </div>
              </div>
            </Cin>
          </section>

          {/* ═══════ PROCESS — minimal timeline ═══════ */}
          <section className="px-6 py-16" aria-label={ru ? 'Процесс' : 'Process'}>
            <Cin>
              <h2 className="mb-10" style={{
                fontFamily: SYNE, fontSize: 'clamp(0.6rem, 1.3vw, 0.7rem)',
                fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.25)',
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
                    color: i === 2 ? EMERALD : 'rgba(255,255,255,0.06)',
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

          {/* ═══════ FINAL CTA — cinematic close ═══════ */}
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

          {/* ═══════ FOOTER ═══════ */}
          <footer className="px-6 py-8 mb-20" role="contentinfo" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <Cin>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: SYNE, fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.03em' }}>
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
