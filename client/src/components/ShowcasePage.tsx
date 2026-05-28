import {
  ArrowUpRight, ArrowRight, ChevronRight, Play, TrendingUp, ArrowDown, Check,
} from "lucide-react";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { m, useInView, useScroll, useTransform } from '@/utils/LazyMotionProvider';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import { FavoriteButton } from './FavoriteButton';
import { useLanguage } from '../contexts/LanguageContext';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from './PullToRefreshIndicator';
import { useQueryClient } from '@tanstack/react-query';
import { preloadDemo } from './demos/DemoRegistry';
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

/* ====================================================================
   WEB4TG — главная · Apple-grade cinematic chapter scroll · OLED black
   Higgsfield image-first media · Manrope · ui-ux-pro-max · 2026
   ==================================================================== */

const HF = "https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/";
const HERO_VIDEO = HF + "hf_20260525_173800_1c25b882-673f-435a-94e4-382a807cf060.mp4";
const IMG_STORE = HF + "hf_20260525_191419_c5e7aaf0-5e12-4cc5-8796-1a2db461c65b_min.webp";
const IMG_BOOK  = HF + "hf_20260525_191423_4fc7d9a6-c616-4b7e-b11a-f6e7fecb1d23_min.webp";
const IMG_FORM  = HF + "hf_20260525_183551_0ac4fb31-08fa-4eca-b487-0b4838605a74_min.webp";
const IMG_MACRO = HF + "hf_20260525_183556_335bc750-5e32-42f2-809f-3a0322e47fa5_min.webp";

const FONT = '"Manrope", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const DISPLAY = '"Stengazeta", "Manrope", system-ui, sans-serif';
const ONDER = '"Onder", "Manrope", system-ui, sans-serif';
const EMERALD = '#34d399';
const EMERALD_SOFT = '#6ee7b7';
const BG = '#000000';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const T = {
  ink: '#FFFFFF',
  sub: 'rgba(255,255,255,0.60)',
  faint: 'rgba(255,255,255,0.40)',
  hair: 'rgba(255,255,255,0.10)',
  hairSoft: 'rgba(255,255,255,0.06)',
  surface: 'rgba(255,255,255,0.045)',
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* — slow cinematic scroll reveal — */
function Reveal({ children, className = "", delay = 0, y = 34 }: {
  children: React.ReactNode; className?: string; delay?: number; y?: number;
}) {
  const r = useRef(null);
  const v = useInView(r, { once: true, margin: "-12% 0px" });
  const rm = prefersReducedMotion();
  return (
    <m.div ref={r}
      initial={rm ? { opacity: 1 } : { opacity: 0, y }}
      animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: rm ? 0 : 0.95, ease: EASE, delay: rm ? 0 : delay }}
      className={className}>
      {children}
    </m.div>
  );
}

/* — eyebrow label — */
function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: 8, justifyContent: center ? 'center' : 'flex-start' }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: EMERALD, display: 'inline-block' }} />
      <span style={{
        fontFamily: ONDER, fontSize: '0.52rem', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: EMERALD_SOFT,
      }}>{children}</span>
    </div>
  );
}

/* — display heading — */
function Display({ children, size = 'clamp(2.1rem, 9.6vw, 3rem)', style }: {
  children: React.ReactNode; size?: string; style?: React.CSSProperties;
}) {
  return (
    <h2 style={{
      fontFamily: DISPLAY, fontSize: size, fontWeight: 700, color: T.ink,
      letterSpacing: '0.012em', lineHeight: 1.07, ...style,
    }}>{children}</h2>
  );
}

/* — body copy — */
function Body({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: FONT, fontSize: '1.0625rem', fontWeight: 400, lineHeight: 1.6,
      color: T.sub, letterSpacing: '-0.005em', ...style,
    }}>{children}</p>
  );
}

export default function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const { language } = useLanguage();
  const ru = language === 'ru';
  const { videoRef } = useVideoLazyLoad({ threshold: 0.25 });
  const { markAsViewed } = useViewedDemos();
  const queryClient = useQueryClient();
  const rm = prefersReducedMotion();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    await new Promise(r => setTimeout(r, 600));
  }, [queryClient]);
  const { pullDistance, isRefreshing, progress, shouldShowIndicator } = usePullToRefresh({
    onRefresh: handleRefresh, threshold: 70, maxPullDistance: 100,
  });

  const openDemo = useCallback((id: string) => {
    haptic.light(); markAsViewed(id); onOpenDemo(id);
  }, [haptic, onOpenDemo, markAsViewed]);
  const nav = useCallback((s: string) => {
    haptic.light(); onNavigate(s);
  }, [haptic, onNavigate]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroImgScale = useTransform(scrollYProgress, [0, 1], [1, 1.13]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroFade = useTransform(scrollYProgress, [0, 0.62], [1, 0]);

  const chapters = [
    {
      img: IMG_STORE, eyebrow: ru ? 'Коммерция' : 'Commerce',
      title: ru ? <>Магазин<br />внутри чата</> : <>A store<br />inside the chat</>,
      body: ru
        ? 'Каталог, корзина, оплата и доставка — клиент покупает, не выходя из Telegram. Без сайта и без установки из стора.'
        : 'Catalog, cart, checkout and delivery — your client buys without ever leaving Telegram.',
    },
    {
      img: IMG_BOOK, eyebrow: ru ? 'Услуги' : 'Services',
      title: ru ? <>Запись и оплата<br />за секунды</> : <>Booking & pay<br />in seconds</>,
      body: ru
        ? 'Свободные слоты, напоминания и предоплата — приём записей и денег работает сам, без единого звонка.'
        : 'Open slots, reminders and prepay — bookings and money flow in on their own.',
    },
    {
      img: IMG_MACRO, eyebrow: ru ? 'Ремесло' : 'Craft',
      title: ru ? <>Выверено<br />до пикселя</> : <>Refined<br />to the pixel</>,
      body: ru
        ? 'Каждый экран, отступ и переход продуман. Приложение, которое приятно открывать каждый день.'
        : 'Every screen, margin and transition considered — an app people love opening daily.',
    },
  ];

  const capsExtra = [
    { t: ru ? 'Боты и автоворонки' : 'Bots & funnels', d: ru ? 'Рассылки, прогрев и поддержка на автопилоте' : 'Broadcasts and support on autopilot' },
    { t: ru ? 'Аналитика и CRM' : 'Analytics & CRM', d: ru ? 'Клиенты, заказы и выручка в одной панели' : 'Clients, orders and revenue in one panel' },
    { t: ru ? 'Платежи без комиссий' : 'Zero-fee payments', d: ru ? 'Telegram Stars, карты и СБП — деньги сразу вам' : 'Stars, cards and instant pay — straight to you' },
    { t: ru ? 'Уведомления' : 'Notifications', d: ru ? 'Возврат клиентов прямо в их ленту Telegram' : 'Bring clients back, right into their Telegram feed' },
  ];

  const steps = [
    { n: '01', t: ru ? 'Бриф' : 'Brief', d: ru ? 'Созваниваемся и погружаемся в ваш бизнес.' : 'We call and dive into your business.' },
    { n: '02', t: ru ? 'Дизайн' : 'Design', d: ru ? 'Прототип и визуал, который вы утверждаете.' : 'A prototype and visuals you approve.' },
    { n: '03', t: ru ? 'Сборка' : 'Build', d: ru ? 'Разрабатываем, наполняем, тестируем.' : 'We develop, fill and test.' },
    { n: '04', t: ru ? 'Запуск' : 'Launch', d: ru ? 'Публикуем в Telegram и передаём аналитику.' : 'We publish and hand over analytics.' },
  ];

  const cases = useMemo(() => [
    { id: 'electronics', vid: true, src: "/videos/techstore_2025.mp4", poster: "/videos/techstore_2025_poster.jpg", label: 'TechStore', sub: ru ? 'Электроника' : 'Electronics', growth: '+220%' },
    { id: 'luxury-watches', vid: true, src: "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4", poster: "/videos/timeelite_poster.jpg", label: 'TimeElite', sub: ru ? 'Премиум часы' : 'Premium watches', growth: '+340%' },
    { id: 'luxury-perfume', vid: true, src: "/videos/luxury_fragrance.mp4", poster: "/videos/fragrance_poster.jpg", label: 'FragranceRoyale', sub: ru ? 'Парфюмерия' : 'Perfumery', growth: '+290%' },
    { id: 'sneaker-store', vid: false, src: nikeGreenImage, label: 'SneakerVault', sub: ru ? 'Кроссовки' : 'Sneakers', growth: '+280%' },
    { id: 'clothing-store', vid: false, src: rascalImage, label: 'Radiance', sub: ru ? 'Премиум-мода' : 'Premium fashion', growth: '+195%' },
  ], [ru]);

  return (
    <div className="min-h-screen select-none overflow-x-hidden showcase-page" style={{ backgroundColor: BG }}>
      <div className="w4-grain" aria-hidden="true" />
      <div className="relative" style={{ zIndex: 1 }}>
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} shouldShow={shouldShowIndicator} progress={progress} />
        <div className="mx-auto w-full" style={{ maxWidth: 540 }}>

          {/* ═══════════ HERO ═══════════ */}
          <header ref={heroRef} className="relative overflow-hidden" role="banner" style={{ minHeight: '100dvh' }}>
            <m.div className="absolute inset-0" style={{ y: rm ? 0 : heroImgY, scale: rm ? 1 : heroImgScale }}>
              <video src={HERO_VIDEO} autoPlay muted loop playsInline preload="auto"
                className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.96 }} />
              <div className="absolute inset-0" aria-hidden="true" style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.62) 22%, rgba(0,0,0,0.06) 46%, rgba(0,0,0,0.34) 74%, #000 100%)',
              }} />
            </m.div>

            {/* spacer — reserves the same vertical room the old duplicate
                WEB4TG | Telegram-студия row took, so the hero text below
                stays anchored when global topbar buffer changes. */}
            <div aria-hidden="true" style={{ zIndex: 2, height: 'calc(env(safe-area-inset-top, 0px) + 44px)' }} />

            <m.div className="relative px-6" style={{
              zIndex: 2, paddingTop: 'clamp(38px, 13vh, 104px)',
              y: rm ? 0 : heroTextY, opacity: rm ? 1 : heroFade,
            }}>
              <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}>
                <Eyebrow>{ru ? 'Студия Telegram-приложений' : 'Telegram mini-app studio'}</Eyebrow>
              </m.div>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.012em', lineHeight: 1.0, marginTop: 20 }}>
                <m.span className="block" initial={rm ? { opacity: 1 } : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: rm ? 0 : 0.9, ease: EASE, delay: rm ? 0 : 0.42 }}
                  style={{ fontSize: 'clamp(2.7rem, 13vw, 3.9rem)', color: T.ink }}>
                  {ru ? 'Магазин внутри Telegram' : 'A store inside Telegram'}
                </m.span>
                <m.span className="block" initial={rm ? { opacity: 1 } : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: rm ? 0 : 0.9, ease: EASE, delay: rm ? 0 : 0.54 }}
                  style={{ fontSize: 'clamp(2.7rem, 13vw, 3.9rem)', color: EMERALD }}>
                  {ru ? 'без скачиваний и комиссий.' : 'no downloads, no commissions.'}
                </m.span>
              </h1>
              <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.78 }}>
                <Body style={{ marginTop: 22, maxWidth: 360 }}>
                  {ru
                    ? 'ИИ-агент отвечает клиентам и принимает заказы 24/7. Запуск за неделю.'
                    : 'An AI agent replies and takes orders 24/7. Live in a week.'}
                </Body>
              </m.div>
              <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.94 }}
                className="flex items-center" style={{ gap: 14, marginTop: 30 }}>
                <button onClick={() => nav('projects')}
                  className="group flex items-center transition-transform duration-300 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                  style={{ height: 54, padding: '0 26px', borderRadius: 999, background: T.ink, gap: 8 }}>
                  <span style={{ fontFamily: FONT, fontSize: '0.95rem', fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>
                    {ru ? 'Начать проект' : 'Start a project'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
                </button>
                <button onClick={() => { preloadDemo('electronics'); openDemo('electronics'); }}
                  onTouchStart={() => preloadDemo('electronics')} onMouseEnter={() => preloadDemo('electronics')}
                  className="flex items-center transition-opacity duration-300 active:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:outline-offset-2"
                  style={{ height: 54, gap: 7 }} aria-label={ru ? 'Открыть демо' : 'Open demo'}>
                  <span className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.hair}` }}>
                    <Play className="w-3 h-3" style={{ color: EMERALD, marginLeft: 1 }} fill={EMERALD} />
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: '0.95rem', fontWeight: 600, color: T.ink }}>
                    {ru ? 'Демо' : 'Demo'}
                  </span>
                </button>
              </m.div>
            </m.div>

            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.3 }}
              className="absolute left-1/2" style={{ bottom: 18, transform: 'translateX(-50%)', zIndex: 2 }} aria-hidden="true">
              <m.div animate={rm ? {} : { y: [0, 7, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <ArrowDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} strokeWidth={2} />
              </m.div>
            </m.div>
          </header>

          {/* ═══════════ STATEMENT ═══════════ */}
          <section className="px-6" style={{ paddingTop: 104, paddingBottom: 104 }}>
            <Reveal>
              <p style={{
                fontFamily: DISPLAY, fontSize: 'clamp(1.75rem, 7.6vw, 2.55rem)', fontWeight: 700,
                letterSpacing: '0.012em', lineHeight: 1.3, color: 'rgba(255,255,255,0.5)',
              }}>
                {ru ? <>В Telegram уже 900 миллионов человек.{' '}
                  <span style={{ color: T.ink }}>Мы превращаем их в ваших клиентов.</span></>
                  : <>900 million people are already on Telegram.{' '}
                  <span style={{ color: T.ink }}>We turn them into your customers.</span></>}
              </p>
            </Reveal>
          </section>

          {/* ═══════════ CHAPTERS ═══════════ */}
          {chapters.map((ch, i) => (
            <section key={i} style={{ paddingTop: i === 0 ? 0 : 100, paddingBottom: 100 }}>
              <Reveal className="px-6">
                <Eyebrow>{ch.eyebrow}</Eyebrow>
                <Display style={{ marginTop: 16 }}>{ch.title}</Display>
                <Body style={{ marginTop: 17, maxWidth: 380 }}>{ch.body}</Body>
              </Reveal>
              <Reveal delay={0.06}>
                <div className="relative" style={{ marginTop: 34, height: '76vh', maxHeight: 600, overflow: 'hidden' }}>
                  <img src={ch.img} alt="" loading="lazy" draggable={false}
                    className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center' }} />
                  <div className="absolute inset-0" aria-hidden="true" style={{
                    background: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 80%, #000 100%)',
                  }} />
                </div>
              </Reveal>
            </section>
          ))}

          {/* ═══════════ CAPABILITIES (clean list) ═══════════ */}
          <section className="px-6" style={{ paddingTop: 4, paddingBottom: 104 }}>
            <Reveal>
              <Eyebrow>{ru ? 'И это ещё не всё' : 'And more'}</Eyebrow>
              <Display style={{ marginTop: 16 }}>
                {ru ? <>Полный продукт,<br />а не страница</> : <>A full product,<br />not a page</>}
              </Display>
            </Reveal>
            <div style={{ marginTop: 30 }}>
              {capsExtra.map((c, i) => (
                <Reveal key={i} delay={i * 0.05} y={22}>
                  <div className="flex items-start" style={{
                    gap: 16, padding: '22px 2px',
                    borderTop: i ? `1px solid ${T.hairSoft}` : `1px solid ${T.hair}`,
                  }}>
                    <span className="flex items-center justify-center flex-shrink-0" style={{
                      width: 26, height: 26, borderRadius: 999, marginTop: 2,
                      background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)',
                    }}>
                      <Check className="w-3.5 h-3.5" style={{ color: EMERALD }} strokeWidth={2.6} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: '1.24rem', fontWeight: 700, color: T.ink, letterSpacing: '0.01em' }}>
                        {c.t}
                      </div>
                      <div style={{ fontFamily: FONT, fontSize: '0.95rem', fontWeight: 400, color: T.sub, lineHeight: 1.5, marginTop: 4 }}>
                        {c.d}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ═══════════ THE NUMBER ═══════════ */}
          <section className="relative overflow-hidden" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div className="absolute inset-0" aria-hidden="true" style={{
              background: `radial-gradient(ellipse 64% 44% at 50% 44%, rgba(52,211,153,0.16) 0%, transparent 70%)`,
            }} />
            <div className="relative px-6 text-center">
              <Reveal>
                <div className="flex justify-center"><Eyebrow center>{ru ? 'Результаты клиентов' : 'Client results'}</Eyebrow></div>
                <div style={{
                  fontFamily: DISPLAY, fontSize: 'clamp(4.6rem, 26vw, 8rem)', fontWeight: 700,
                  letterSpacing: '0.005em', lineHeight: 0.94, color: T.ink, marginTop: 22,
                }}>
                  +280<span style={{ color: EMERALD }}>%</span>
                </div>
                <Body style={{ marginTop: 20, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
                  {ru
                    ? 'средний рост продаж за первые три месяца после запуска приложения WEB4TG'
                    : 'average sales growth in the first three months after a WEB4TG launch'}
                </Body>
                <div className="flex items-stretch justify-center" style={{ marginTop: 34 }}>
                  {[
                    { v: '47', l: ru ? 'проектов' : 'projects' },
                    { v: '12', l: ru ? 'ниш' : 'industries' },
                    { v: '4.9', l: ru ? 'рейтинг' : 'rating' },
                  ].map((x, i) => (
                    <div key={i} style={{
                      padding: '0 20px',
                      borderLeft: i ? `1px solid ${T.hair}` : 'none',
                    }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: '1.74rem', fontWeight: 700, color: T.ink, letterSpacing: '0.01em' }}>{x.v}</div>
                      <div style={{ fontFamily: FONT, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.faint, marginTop: 5 }}>{x.l}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ═══════════ НАШИ РАБОТЫ ═══════════ */}
          <section style={{ paddingTop: 8, paddingBottom: 104 }} aria-label={ru ? 'Наши работы' : 'Our work'}>
            <Reveal className="px-6">
              <div className="flex items-end justify-between">
                <div>
                  <Eyebrow>{ru ? 'Портфолио' : 'Portfolio'}</Eyebrow>
                  <Display style={{ marginTop: 16 }}>{ru ? 'Наши работы' : 'Selected work'}</Display>
                </div>
                <button onClick={() => nav('projects')}
                  className="flex items-center active:opacity-50 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-2 rounded"
                  style={{ gap: 2, paddingBottom: 4, minHeight: 44 }}>
                  <span style={{ fontFamily: FONT, fontSize: '0.82rem', fontWeight: 600, color: T.sub }}>{ru ? 'Все 22' : 'All 22'}</span>
                  <ChevronRight className="w-4 h-4" style={{ color: T.sub }} />
                </button>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="overflow-x-auto scrollbar-hide" style={{ marginTop: 24, WebkitOverflowScrolling: 'touch' }}>
                <div className="flex" style={{ gap: 14, padding: '0 24px', width: 'max-content' }}>
                  {cases.map((c, i) => (
                    <article key={c.id}
                      className="relative flex-shrink-0 overflow-hidden cursor-pointer group"
                      style={{ width: 292, height: 400, borderRadius: 26, border: `1px solid ${T.hair}` }}
                      role="button" tabIndex={0}
                      aria-label={`${ru ? 'Открыть' : 'Open'} ${c.label}`}
                      onClick={() => openDemo(c.id)}
                      onTouchStart={() => preloadDemo(c.id)} onMouseEnter={() => preloadDemo(c.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDemo(c.id); } }}>
                      {c.vid ? (
                        <video ref={i === 0 ? videoRef : undefined} src={c.src} loop muted playsInline autoPlay
                          preload="auto" poster={c.poster}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-active:scale-[1.05]"
                          style={{ filter: 'brightness(0.78) saturate(1.05)' }} />
                      ) : (
                        <img src={c.src} alt={c.label} loading="lazy" draggable={false}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-active:scale-[1.05]"
                          style={{ filter: 'brightness(0.78) saturate(1.05)' }} />
                      )}
                      <div className="absolute inset-0" aria-hidden="true" style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 46%, rgba(0,0,0,0.9) 100%)',
                      }} />
                      <div className="absolute top-4 right-4" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <FavoriteButton demoId={c.id} size="md" />
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center" style={{
                          gap: 4, padding: '5px 10px', borderRadius: 999,
                          background: 'rgba(52,211,153,0.13)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                          border: '1px solid rgba(52,211,153,0.24)',
                          fontFamily: FONT, fontSize: '0.66rem', fontWeight: 700, color: EMERALD,
                        }}>
                          <TrendingUp size={10} strokeWidth={2.6} />{c.growth}
                        </span>
                      </div>
                      <div className="absolute left-0 right-0 bottom-0" style={{ padding: 20 }}>
                        <h3 style={{ fontFamily: DISPLAY, fontSize: '1.62rem', fontWeight: 700, color: T.ink, letterSpacing: '0.015em', lineHeight: 1.1 }}>
                          {c.label}
                        </h3>
                        <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                          <p style={{ fontFamily: FONT, fontSize: '0.86rem', fontWeight: 400, color: T.sub }}>{c.sub}</p>
                          <span className="flex items-center" style={{ gap: 4, color: EMERALD }}>
                            <span style={{ fontFamily: FONT, fontSize: '0.74rem', fontWeight: 700 }}>{ru ? 'Открыть' : 'Open'}</span>
                            <ArrowRight size={12} strokeWidth={2.4} />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </Reveal>
          </section>

          {/* ═══════════ ПРОЦЕСС ═══════════ */}
          <section className="px-6" style={{ paddingTop: 4, paddingBottom: 104 }} aria-label={ru ? 'Процесс' : 'Process'}>
            <Reveal>
              <Eyebrow>{ru ? 'Процесс' : 'Process'}</Eyebrow>
              <Display style={{ marginTop: 16 }}>{ru ? 'От идеи до запуска' : 'From idea to launch'}</Display>
              <Body style={{ marginTop: 16, maxWidth: 360 }}>
                {ru ? 'Один день, четыре шага, полная прозрачность на каждом.' : 'One day, four steps, full transparency at each.'}
              </Body>
            </Reveal>
            <div style={{ marginTop: 26 }}>
              {steps.map((s, i) => (
                <Reveal key={i} delay={i * 0.05} y={22}>
                  <div className="flex items-baseline" style={{ gap: 18, padding: '24px 0', borderTop: `1px solid ${i ? T.hairSoft : T.hair}` }}>
                    <span style={{
                      fontFamily: FONT, fontSize: '1rem', fontWeight: 700, letterSpacing: '0.04em',
                      color: i === steps.length - 1 ? EMERALD : T.faint, minWidth: 30,
                    }}>{s.n}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: '1.5rem', fontWeight: 700, color: T.ink, letterSpacing: '0.015em' }}>{s.t}</div>
                      <div style={{ fontFamily: FONT, fontSize: '0.95rem', fontWeight: 400, color: T.sub, lineHeight: 1.5, marginTop: 5 }}>{s.d}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ═══════════ FINAL CTA ═══════════ */}
          <section className="relative overflow-hidden" style={{ paddingTop: 24, paddingBottom: 40 }}>
            <Reveal className="px-6">
              <div className="relative overflow-hidden text-center" style={{ borderRadius: 32, padding: '64px 26px 60px' }}>
                <img src={IMG_FORM} alt="" loading="lazy" draggable={false}
                  className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', opacity: 0.6 }} />
                <div className="absolute inset-0" aria-hidden="true" style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.86) 100%)',
                }} />
                <div className="absolute inset-0" aria-hidden="true" style={{
                  background: `radial-gradient(ellipse 70% 52% at 50% 46%, rgba(52,211,153,0.22) 0%, transparent 72%)`,
                }} />
                <div className="relative">
                  <h2 style={{
                    fontFamily: DISPLAY, fontSize: 'clamp(2.4rem, 11vw, 3.4rem)', fontWeight: 700,
                    letterSpacing: '0.012em', lineHeight: 1.05, color: T.ink,
                  }}>
                    {ru ? <>Запустим ваше<br />приложение?</> : <>Shall we launch<br />your app?</>}
                  </h2>
                  <Body style={{ marginTop: 18, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
                    {ru ? 'Расскажите о задаче — пришлём концепт и смету в течение дня.'
                      : 'Tell us your goal — concept and quote within a day.'}
                  </Body>
                  <button onClick={() => nav('projects')}
                    className="group inline-flex items-center transition-transform duration-300 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-2"
                    style={{ height: 56, padding: '0 30px', borderRadius: 999, background: T.ink, gap: 8, marginTop: 30 }}>
                    <span style={{ fontFamily: FONT, fontSize: '0.98rem', fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>
                      {ru ? 'Обсудить проект' : 'Discuss a project'}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
                  </button>
                  <div style={{ fontFamily: FONT, fontSize: '0.78rem', fontWeight: 500, color: T.faint, marginTop: 18 }}>
                    {ru ? 'Ответим в течение часа' : 'We reply within an hour'}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ═══════════ FOOTER ═══════════ */}
          <footer className="px-6 text-center" role="contentinfo" style={{ paddingTop: 36, paddingBottom: 8, marginBottom: 96 }}>
            <Reveal>
              <div style={{ fontFamily: DISPLAY, fontSize: '1.6rem', fontWeight: 700, color: T.ink, letterSpacing: '0.04em' }}>WEB4TG</div>
              <p style={{ fontFamily: FONT, fontSize: '0.82rem', fontWeight: 400, color: T.faint, lineHeight: 1.55, marginTop: 10, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }}>
                {ru ? 'Студия Telegram-приложений. Проектируем, разрабатываем, запускаем.'
                  : 'Telegram mini-app studio. We design, build and launch.'}
              </p>
              <div style={{ fontFamily: FONT, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.26)', marginTop: 18 }}>
                {`Москва · © ${new Date().getFullYear()}`}
              </div>
            </Reveal>
          </footer>

        </div>
      </div>

      <style>{`
        .showcase-page .w4-grain{
          position:fixed; inset:0; z-index:40; pointer-events:none; opacity:0.05;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        @media (prefers-reduced-motion: reduce){
          .showcase-page *{ animation-duration:.01ms!important; transition-duration:.01ms!important; }
        }
      `}</style>
    </div>
  );
}
