import {
  ArrowRight, Play, Star, ChevronRight, ArrowUpRight,
  Zap, CreditCard, Bot, BarChart3, Palette, ShieldCheck
} from "lucide-react";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { m, AnimatePresence, useInView } from '@/utils/LazyMotionProvider';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import { FavoriteButton } from './FavoriteButton';
import { useLanguage } from '../contexts/LanguageContext';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from './PullToRefreshIndicator';
import { useQueryClient } from '@tanstack/react-query';
import { TubesBackground } from './ui/neon-flow';
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

/* ─── Types ─── */
interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

/* ─── Design Tokens ─── */
const ACCENT = '#34d399';
const BORDER = 'rgba(255,255,255,0.06)';
const SURFACE = 'rgba(255,255,255,0.03)';
const TEXT = { primary: '#fff', secondary: 'rgba(255,255,255,0.6)', muted: 'rgba(255,255,255,0.5)' };
const FONT = {
  sans: '"Inter", -apple-system, "SF Pro Display", system-ui, sans-serif',
  serif: '"Playfair Display", Georgia, "Times New Roman", serif',
};
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── Fluid Typography (clamp-based) ─── */
const fluid = {
  hero: 'clamp(2.75rem, 8vw, 4rem)',
  h2: 'clamp(1.75rem, 5vw, 2.5rem)',
  h3: 'clamp(1.25rem, 3.5vw, 1.75rem)',
  body: 'clamp(0.875rem, 2vw, 1rem)',
  caption: 'clamp(0.6875rem, 1.5vw, 0.8125rem)',
  overline: 'clamp(0.5625rem, 1.2vw, 0.6875rem)',
};

/* ─── Scroll-Reveal Wrapper ─── */
function Reveal({ children, className = "", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/* ─── Animated Number Counter ─── */
function AnimatedNumber({ value, suffix = "", prefix = "" }: {
  value: number; suffix?: string; prefix?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const start = performance.now();
    const duration = 1400;

    function tick(now: number) {
      if (cancelled) return;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, [inView, value]);

  return <span ref={ref}>{prefix}{current}{suffix}</span>;
}

/* ─── Rotating Words in Hero ─── */
const ROTATING_WORDS = {
  ru: ["у конкурентов", "на рынке", "в России", "в вашей нише"],
  en: ["competitors lack", "the market needs", "your niche craves"],
};

/* ═══════════════════════════════════════════════ */
/*                 SHOWCASE PAGE                   */
/* ═══════════════════════════════════════════════ */

export default function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const { t, language } = useLanguage();
  const ru = language === 'ru';
  const { videoRef } = useVideoLazyLoad({ threshold: 0.25 });
  const { markAsViewed } = useViewedDemos();
  const queryClient = useQueryClient();

  const words = ru ? ROTATING_WORDS.ru : ROTATING_WORDS.en;
  const [wordIndex, setWordIndex] = useState(0);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    await new Promise(r => setTimeout(r, 600));
  }, [queryClient]);

  const { pullDistance, isRefreshing, progress, shouldShowIndicator } = usePullToRefresh({
    onRefresh: handleRefresh, threshold: 70, maxPullDistance: 100
  });

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => setWordIndex(i => (i + 1) % words.length), 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  const openDemo = useCallback((id: string) => {
    haptic.light(); markAsViewed(id); onOpenDemo(id);
  }, [haptic, onOpenDemo, markAsViewed]);

  const navigate = useCallback((section: string) => {
    haptic.light(); onNavigate(section);
  }, [haptic, onNavigate]);

  /* ─── Case Studies Data ─── */
  const cases = useMemo(() => [
    {
      id: 'luxury-watches', isVideo: true,
      src: "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4",
      name: 'TimeElite', desc: ru ? 'Часы премиум' : 'Premium Watches', stat: '+340%',
    },
    {
      id: 'sneaker-store', isVideo: false,
      src: nikeGreenImage,
      name: 'SneakerVault', desc: ru ? 'Лимитки, предзаказы' : 'Limited editions', stat: '+280%',
    },
    {
      id: 'clothing-store', isVideo: false,
      src: rascalImage,
      name: 'Rascal', desc: ru ? 'Одежда, бренд' : 'Fashion brand', stat: '+195%',
    },
  ], [ru]);

  /* ─── Bento Grid Features Data ─── */
  const features = useMemo(() => [
    { icon: Zap, title: ru ? 'Запуск за 24ч' : 'Launch in 24h', desc: ru ? 'Полный цикл разработки за сутки' : 'Full development cycle in one day', accent: '#34d399', span: 'col-span-1' },
    { icon: CreditCard, title: ru ? 'Платежи' : 'Payments', desc: ru ? 'Stripe · ЮKassa · Крипто' : 'Stripe · YooKassa · Crypto', accent: '#818cf8', span: 'col-span-1' },
    { icon: Bot, title: ru ? 'AI-ассистент' : 'AI Assistant', desc: ru ? 'Умная поддержка клиентов 24/7' : 'Smart customer support 24/7', accent: '#fb923c', span: 'col-span-2' },
    { icon: BarChart3, title: ru ? 'Аналитика' : 'Analytics', desc: ru ? 'Дашборд в реальном времени' : 'Real-time dashboard', accent: '#38bdf8', span: 'col-span-1' },
    { icon: Palette, title: ru ? 'Премиум дизайн' : 'Premium Design', desc: ru ? 'Уровень Apple и Stripe' : 'Apple & Stripe quality', accent: '#f472b6', span: 'col-span-1' },
    { icon: ShieldCheck, title: ru ? '0% комиссий' : '0% Commission', desc: ru ? 'Вся выручка — ваша' : 'All revenue stays with you', accent: '#34d399', span: 'col-span-2' },
  ], [ru]);

  return (
    <div className="min-h-screen select-none overflow-x-hidden showcase-page" style={{ backgroundColor: '#000' }}>

      {/* ─── Background Layer ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <TubesBackground className="w-full h-full" />
      </div>

      <div className="relative z-10">
        <PullToRefreshIndicator
          pullDistance={pullDistance} isRefreshing={isRefreshing}
          shouldShow={shouldShowIndicator} progress={progress}
        />

        <div className="mx-auto w-full" style={{ maxWidth: '540px' }}>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  SECTION 1 · HERO                      */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <header className="px-6 pt-14 pb-16" role="banner">

            {/* Overline badge */}
            <m.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              className="flex items-center gap-2.5 mb-8"
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}28` }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
                <span style={{ fontFamily: FONT.sans, fontSize: fluid.overline, color: ACCENT, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                  Telegram Mini Apps
                </span>
              </span>
            </m.div>

            {/* Main heading with rotating word */}
            <m.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
              className="mb-5"
            >
              <span className="block" style={{ fontFamily: FONT.serif, fontSize: fluid.hero, lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 700, color: TEXT.primary }}>
                {ru ? 'Приложение,' : 'The app'}
              </span>
              <span className="block mt-1" style={{ fontFamily: FONT.serif, fontSize: fluid.hero, lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 400, fontStyle: 'italic', color: TEXT.secondary }}>
                {ru ? 'которого нет' : 'they don\'t have'}
              </span>
              <span className="block mt-1 overflow-hidden" style={{ height: 'calc(1em + 8px)' }}>
                <AnimatePresence mode="wait">
                  <m.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -24, filter: 'blur(4px)' }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="block"
                    style={{ fontFamily: FONT.serif, fontSize: fluid.hero, lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 700, color: ACCENT }}
                  >
                    {words[wordIndex]}
                  </m.span>
                </AnimatePresence>
              </span>
            </m.h1>

            {/* Subheading */}
            <m.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
              className="max-w-xs mb-8"
              style={{ fontFamily: FONT.sans, fontSize: fluid.body, lineHeight: 1.7, color: TEXT.muted }}
            >
              {ru
                ? 'Маркетплейсы забирают до 25% выручки. Своё приложение в Telegram — 0% комиссий, запуск за 24 часа.'
                : 'Marketplaces take up to 25% of your revenue. Your own Telegram app — 0% fees, live in 24 hours.'}
            </m.p>

            {/* CTA buttons */}
            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
              className="flex gap-3"
            >
              <button
                onClick={() => navigate('projects')}
                className="flex-1 flex items-center justify-center gap-2 rounded-full transition-all duration-300 active:scale-[0.97]"
                style={{ height: 52, background: ACCENT, boxShadow: `0 0 40px ${ACCENT}30, 0 4px 16px ${ACCENT}20` }}
                onMouseEnter={e => { (e.currentTarget.style.boxShadow = `0 0 60px ${ACCENT}45, 0 8px 24px ${ACCENT}30`); (e.currentTarget.style.transform = 'translateY(-1px)'); }}
                onMouseLeave={e => { (e.currentTarget.style.boxShadow = `0 0 40px ${ACCENT}30, 0 4px 16px ${ACCENT}20`); (e.currentTarget.style.transform = 'translateY(0)'); }}
              >
                <span style={{ fontFamily: FONT.sans, fontSize: '0.875rem', fontWeight: 600, color: '#000' }}>
                  {t('showcase.orderProject')}
                </span>
                <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
              </button>

              <button
                onClick={() => openDemo('clothing-store')}
                aria-label={ru ? 'Смотреть демо' : 'Watch demo'}
                className="flex items-center justify-center rounded-full transition-all duration-300 active:scale-[0.97]"
                style={{ width: 52, height: 52, border: `1px solid ${BORDER}`, background: SURFACE }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = SURFACE; }}
              >
                <Play className="w-4 h-4 text-white/80" fill="currentColor" />
              </button>
            </m.div>

            {/* Stats strip */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
              className="flex items-center justify-between mt-10 pt-6"
              style={{ borderTop: `1px solid ${BORDER}` }}
            >
              {[
                { n: 127, s: '+', label: ru ? 'клиентов' : 'clients' },
                { n: 24, s: ru ? 'ч' : 'h', label: ru ? 'запуск' : 'launch' },
                { n: 0, s: '%', label: ru ? 'комиссий' : 'fees' },
              ].map((stat, i) => (
                <div key={i} className={i === 1 ? 'text-center' : i === 2 ? 'text-right' : ''}>
                  <div style={{ fontFamily: FONT.sans, fontSize: 'clamp(1.5rem, 4vw, 1.75rem)', fontWeight: 700, color: TEXT.primary, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                    <AnimatedNumber value={stat.n} suffix={stat.s} />
                  </div>
                  <div style={{ fontFamily: FONT.sans, fontSize: fluid.overline, fontWeight: 500, color: TEXT.muted, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </m.div>
          </header>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  SECTION 2 · EDITORIAL STATEMENT       */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="px-6 py-16" aria-label={ru ? 'О платформе' : 'About the platform'}>
            <Reveal>
              <blockquote className="border-none p-0 m-0">
                <p style={{ fontFamily: FONT.serif, fontSize: fluid.h2, lineHeight: 1.25, letterSpacing: '-0.025em' }}>
                  <span style={{ fontWeight: 700, color: TEXT.primary }}>
                    {ru ? '900 миллионов ' : '900 million '}
                  </span>
                  <span style={{ fontWeight: 400, fontStyle: 'italic', color: TEXT.secondary }}>
                    {ru
                      ? 'пользователей Telegram — и ваш магазин прямо у них в\u00A0кармане. '
                      : 'Telegram users — and your store right in\u00A0their pocket. '}
                  </span>
                  <span style={{ fontWeight: 700, color: ACCENT }}>
                    {ru ? 'Без\u00A0посредников.' : 'No\u00A0middlemen.'}
                  </span>
                </p>
              </blockquote>
            </Reveal>
          </section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  SECTION 3 · SOCIAL PROOF / CASES      */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="pb-14" aria-label={ru ? 'Кейсы' : 'Case studies'}>
            <Reveal className="px-6 mb-5">
              <div className="flex items-baseline justify-between">
                <h2 style={{ fontFamily: FONT.sans, fontSize: fluid.overline, fontWeight: 600, color: TEXT.muted, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
                  {ru ? 'Избранные кейсы' : 'Featured Cases'}
                </h2>
                <button
                  onClick={() => navigate('projects')}
                  className="flex items-center gap-0.5 transition-opacity duration-200 active:opacity-60"
                  style={{ fontFamily: FONT.sans, fontSize: fluid.caption, color: TEXT.muted }}
                >
                  {t('showcase.all')}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Reveal>

            {/* Horizontal scroll showcase */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 px-6" style={{ width: 'max-content', paddingRight: 24 }}>
                {cases.map((c, i) => (
                  <Reveal key={c.id} delay={i * 0.08}>
                    <article
                      className="relative flex-shrink-0 rounded-2xl overflow-hidden group transition-transform duration-300 active:scale-[0.97] cursor-pointer"
                      style={{ width: 260, height: 370 }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${ru ? 'Открыть' : 'Open'} ${c.name}`}
                      onClick={() => openDemo(c.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDemo(c.id); } }}
                    >
                      {c.isVideo ? (
                        <video
                          ref={i === 0 ? videoRef : undefined}
                          src={c.src} loop muted playsInline autoPlay
                          className="absolute inset-0 w-full h-full object-cover brightness-[0.3] saturate-[0.7] transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <img
                          src={c.src} alt={c.name} loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover brightness-[0.3] saturate-[0.7] transition-transform duration-700 group-hover:scale-105"
                        />
                      )}

                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />

                      <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <FavoriteButton demoId={c.id} size="md" />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div style={{ fontFamily: FONT.sans, fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 800, color: ACCENT, lineHeight: 1, letterSpacing: '-0.03em' }}>
                          {c.stat}
                        </div>
                        <div style={{ fontFamily: FONT.sans, fontSize: fluid.overline, fontWeight: 600, color: TEXT.muted, letterSpacing: '0.08em', textTransform: 'uppercase' as const, margin: '4px 0 14px' }}>
                          {t('showcase.sales')}
                        </div>
                        <div className="h-px mb-3.5" style={{ background: BORDER }} />
                        <div style={{ fontFamily: FONT.sans, fontSize: fluid.body, fontWeight: 600, color: TEXT.primary, letterSpacing: '-0.01em' }}>
                          {c.name}
                        </div>
                        <div style={{ fontFamily: FONT.sans, fontSize: fluid.caption, color: TEXT.muted, marginTop: 2 }}>
                          {c.desc}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Testimonials row */}
            <div className="px-6 mt-10 space-y-3">
              {[
                {
                  text: ru ? 'Продажи +340% за первый месяц. Приложение полностью изменило подход.' : 'Sales +340% in the first month. The app changed everything.',
                  author: ru ? 'Александр М.' : 'Alexander M.',
                  role: ru ? 'Часовой бизнес' : 'Watch business',
                  color: '#10b981',
                },
                {
                  text: ru ? 'Готово за 24 часа. Месяцами мучились с маркетплейсами.' : 'Ready in 24h. We struggled with marketplaces for months.',
                  author: ru ? 'Елена К.' : 'Elena K.',
                  role: ru ? 'Косметика' : 'Cosmetics',
                  color: '#8b5cf6',
                },
                {
                  text: ru ? '0% комиссии — сэкономили 2 млн за квартал.' : '0% commission — saved $25k per quarter.',
                  author: ru ? 'Дмитрий В.' : 'Dmitry V.',
                  role: 'CEO',
                  color: '#3b82f6',
                },
              ].map((review, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <figure
                    className="rounded-2xl p-5 transition-colors duration-300"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; }}
                  >
                    <blockquote>
                      <p style={{ fontFamily: FONT.sans, fontSize: fluid.body, lineHeight: 1.65, color: TEXT.secondary }}>
                        "{review.text}"
                      </p>
                    </blockquote>
                    <figcaption className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: review.color }}
                        >
                          <span style={{ fontFamily: FONT.sans, fontSize: '0.625rem', fontWeight: 700, color: '#fff' }}>
                            {review.author.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontFamily: FONT.sans, fontSize: fluid.caption, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
                            {review.author}
                          </div>
                          <div style={{ fontFamily: FONT.sans, fontSize: '0.625rem', color: TEXT.muted }}>
                            {review.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5" role="img" aria-label={ru ? '5 из 5 звёзд' : '5 out of 5 stars'}>
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className="w-3 h-3" aria-hidden="true" style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                        ))}
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  SECTION 4 · FEATURES (BENTO GRID)     */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="px-6 py-16" aria-label={ru ? 'Возможности' : 'Features'}>
            <Reveal>
              <h2 className="mb-2" style={{ fontFamily: FONT.serif, fontSize: fluid.h2, fontWeight: 700, color: TEXT.primary, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {ru ? 'Что внутри' : 'What\'s Inside'}
              </h2>
              <p className="mb-8" style={{ fontFamily: FONT.sans, fontSize: fluid.body, color: TEXT.muted }}>
                {ru ? 'Каждый проект включает полный стек технологий.' : 'Every project ships with the full tech stack.'}
              </p>
            </Reveal>

            <div className="grid grid-cols-2 gap-3">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <Reveal key={i} delay={i * 0.05} className={feat.span}>
                    <div
                      className="rounded-2xl p-4 h-full transition-all duration-300 group"
                      style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${feat.accent}30`;
                        e.currentTarget.style.background = `${feat.accent}08`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = BORDER;
                        e.currentTarget.style.background = SURFACE;
                      }}
                    >
                      <div className="mb-3 transition-transform duration-300 group-hover:scale-110 inline-block">
                        <Icon className="w-5 h-5" style={{ color: feat.accent }} strokeWidth={1.8} />
                      </div>
                      <div style={{ fontFamily: FONT.sans, fontSize: fluid.body, fontWeight: 600, color: TEXT.primary, letterSpacing: '-0.01em' }}>
                        {feat.title}
                      </div>
                      <div style={{ fontFamily: FONT.sans, fontSize: fluid.caption, color: TEXT.muted, lineHeight: 1.5, marginTop: 2 }}>
                        {feat.desc}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  SECTION 5 · THE NUMBERS               */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="px-6 py-16" aria-label={ru ? 'Метрики' : 'Metrics'}>
            <Reveal>
              <h2 style={{ fontFamily: FONT.sans, fontSize: fluid.overline, fontWeight: 600, color: TEXT.muted, letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: 32 }}>
                {ru ? 'В цифрах' : 'By the Numbers'}
              </h2>
            </Reveal>

            {[
              { value: 300, prefix: '+', suffix: '%', text: ru ? 'Средний рост продаж наших клиентов в\u00A0первый месяц.' : 'Average sales growth for our clients in\u00A0the first month.', highlight: true },
              { value: 24, prefix: '', suffix: ru ? ' ч' : 'h', text: ru ? 'От идеи до рабочего приложения. Дизайн, код, деплой.' : 'From idea to working app. Design, code, deploy.', highlight: false },
              { value: 0, prefix: '', suffix: '%', text: ru ? 'Комиссий. Вся выручка остаётся у вас.' : 'Commission. All revenue stays with you.', highlight: false },
            ].map((metric, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="py-5" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <div className="flex items-start gap-5">
                    <div
                      className="flex-shrink-0"
                      style={{
                        fontFamily: FONT.sans,
                        fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                        color: metric.highlight ? ACCENT : TEXT.primary,
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 120,
                      }}
                    >
                      <AnimatedNumber value={metric.value} suffix={metric.suffix} prefix={metric.prefix} />
                    </div>
                    <p className="pt-2.5" style={{ fontFamily: FONT.sans, fontSize: fluid.body, lineHeight: 1.6, color: TEXT.muted }}>
                      {metric.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  SECTION 6 · PROCESS TIMELINE          */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="px-6 py-16" aria-label={ru ? 'Процесс' : 'Process'}>
            <Reveal>
              <h2 style={{ fontFamily: FONT.sans, fontSize: fluid.overline, fontWeight: 600, color: TEXT.muted, letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: 32 }}>
                {ru ? 'Как это работает' : 'How It Works'}
              </h2>
            </Reveal>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, ${ACCENT}50, ${BORDER}, transparent)` }} />

              {[
                { title: ru ? 'Заявка' : 'Brief', desc: ru ? 'Расскажите идею или выберите шаблон из каталога — мы начнём в\u00A0тот\u00A0же день.' : 'Share your idea or pick a template — we start the same day.' },
                { title: ru ? 'Разработка' : 'Build', desc: ru ? 'Дизайн, фронтенд, бэкенд, платежи. Приложение готово за 24–48 часов.' : 'Design, frontend, backend, payments. App ready in 24–48 hours.' },
                { title: ru ? 'Запуск' : 'Launch', desc: ru ? 'Деплой в Telegram, подключение аналитики — сразу работает и зарабатывает.' : 'Deploy to Telegram, connect analytics — works and earns from day one.' },
              ].map((step, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="flex items-start gap-4 mb-7 last:mb-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-300"
                      style={{
                        background: i === 2 ? ACCENT : '#000',
                        border: `1.5px solid ${i === 2 ? ACCENT : 'rgba(255,255,255,0.12)'}`,
                        boxShadow: i === 2 ? `0 0 20px ${ACCENT}30` : 'none',
                      }}
                    >
                      <span style={{ fontFamily: FONT.sans, fontSize: '0.75rem', fontWeight: 700, color: i === 2 ? '#000' : TEXT.secondary }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="pt-1">
                      <h3 style={{ fontFamily: FONT.sans, fontSize: fluid.h3, fontWeight: 600, color: TEXT.primary, letterSpacing: '-0.02em', marginBottom: 4 }}>
                        {step.title}
                      </h3>
                      <p style={{ fontFamily: FONT.sans, fontSize: fluid.caption, lineHeight: 1.6, color: TEXT.muted }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  SECTION 7 · CTA                       */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <section className="px-6 pt-4 pb-12" aria-label="CTA">
            <Reveal>
              <div
                className="relative overflow-hidden rounded-3xl p-7"
                style={{ border: `1px solid ${ACCENT}18` }}
              >
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% -30%, ${ACCENT}12 0%, transparent 70%)` }} />

                <div className="relative">
                  <h2 className="mb-3" style={{ fontFamily: FONT.serif, fontSize: fluid.h2, fontWeight: 700, color: TEXT.primary, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                    {ru ? 'Запустим ваш\u00A0проект' : 'Let\'s launch your\u00A0project'}
                  </h2>
                  <p className="mb-7 max-w-[280px]" style={{ fontFamily: FONT.sans, fontSize: fluid.body, lineHeight: 1.65, color: TEXT.muted }}>
                    {ru ? 'Бесплатная консультация. Первый результат — через 24\u00A0часа.' : 'Free consultation. First result — within 24\u00A0hours.'}
                  </p>

                  <button
                    onClick={() => navigate('projects')}
                    className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97]"
                    style={{ background: ACCENT, boxShadow: `0 0 48px ${ACCENT}20` }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 64px ${ACCENT}35`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 48px ${ACCENT}20`; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <span style={{ fontFamily: FONT.sans, fontSize: '0.9375rem', fontWeight: 600, color: '#000' }}>
                      {ru ? 'Начать сейчас' : 'Start Now'}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </button>

                  <div className="flex items-center gap-5 mt-4 justify-center">
                    {[
                      ru ? 'Бесплатно' : 'Free',
                      '24h',
                      ru ? '0% комиссий' : '0% fees',
                    ].map((item, i) => (
                      <span key={i} style={{ fontFamily: FONT.sans, fontSize: fluid.overline, fontWeight: 500, color: TEXT.muted }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  FOOTER                                */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <footer className="px-6 py-10 mb-20" role="contentinfo" style={{ borderTop: `1px solid ${BORDER}` }}>
            <Reveal>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontFamily: FONT.sans, fontSize: fluid.body, fontWeight: 700, color: TEXT.primary, letterSpacing: '-0.02em' }}>
                    WEB4TG
                  </div>
                  <div style={{ fontFamily: FONT.sans, fontSize: fluid.overline, color: TEXT.muted, marginTop: 2 }}>
                    Telegram Mini Apps Studio
                  </div>
                </div>
                <div style={{ fontFamily: FONT.sans, fontSize: fluid.overline, color: TEXT.muted }}>
                  &copy; {new Date().getFullYear()}
                </div>
              </div>
            </Reveal>
          </footer>

        </div>
      </div>
    </div>
  );
}
