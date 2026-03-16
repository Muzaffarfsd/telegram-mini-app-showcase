import {
  ArrowRight, Play, MessageCircle, Zap, Rocket,
  Clock, CreditCard, TrendingUp, Star, Sparkles,
  CheckCircle2, ChevronRight, Shield, Globe
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
import { useTheme } from '../hooks/useTheme';
import { CardStack, type CardStackItem } from '@/components/ui/card-stack';
import { LazyMotionProvider } from '@/utils/LazyMotionProvider';
import IPhoneMockupShowcase from './IPhoneMockupShowcase';
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const cardStackItems: CardStackItem[] = [
  { id: 1, title: "Radiance", description: "Premium fashion & accessories store", imageSrc: "/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg" },
  { id: 2, title: "Nike Destiny", description: "Next-gen sportswear experience", imageSrc: "/attached_assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg" },
  { id: 3, title: "Nike Green", description: "Eco-friendly sustainable collection", imageSrc: "/attached_assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg" },
  { id: 4, title: "Rascal", description: "Urban streetwear brand identity", imageSrc: "/attached_assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg" },
  { id: 5, title: "Studio Collection", description: "Premium design portfolio showcase", imageSrc: "/attached_assets/82a7adf27f8d0e1758ca0f797349db48_1763719506416.jpg" },
];

const headlinesRu = ["у конкурентов", "на рынке", "в России", "в СНГ", "в вашей нише"];
const headlinesEn = ["your competitors have", "in the market", "in your industry", "in your region"];

const F = {
  display: '"SF Pro Display", Montserrat, -apple-system, system-ui, sans-serif',
  body: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
};

const noiseUrl = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function Counter({ value, suffix = "", delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let c = false;
    const t = setTimeout(() => {
      if (c) return;
      const s = performance.now();
      const run = (now: number) => {
        if (c) return;
        const p = Math.min((now - s) / 800, 1);
        setV(Math.round((1 - Math.pow(1 - p, 3)) * value));
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }, delay * 1000);
    return () => { c = true; clearTimeout(t); };
  }, [value, delay]);
  return <span>{v}{suffix}</span>;
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <m.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.65, ease, delay }} className={className}>
      {children}
    </m.div>
  );
}

function Marquee({ isDark }: { isDark: boolean }) {
  const words = ["WEB4TG", "✦", "TELEGRAM MINI APPS", "✦", "PREMIUM DESIGN", "✦", "24H LAUNCH", "✦", "AI POWERED", "✦", "E-COMMERCE", "✦", "NO COMMISSION", "✦"];
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden py-4" style={{ borderTop: `0.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
      <m.div className="flex gap-6 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 22, ease: "linear", repeat: Infinity }}>
        {row.map((w, i) => (
          <span key={i} className="text-[11px] font-bold tracking-[0.2em] uppercase flex-shrink-0" style={{ color: w === "✦" ? (isDark ? 'rgba(52,211,153,0.5)' : 'rgba(5,150,105,0.5)') : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)') }}>
            {w}
          </span>
        ))}
      </m.div>
    </div>
  );
}

function Glass({ children, className = "", style, isDark }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; isDark: boolean }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)',
      border: isDark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.06)',
      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
      ...style,
    }}>
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: noiseUrl }} />
      <div className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none" style={{ background: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)', borderRadius: 'inherit' }} />
      <div className="relative">{children}</div>
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
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const { videoRef } = useVideoLazyLoad({ threshold: 0.25 });
  const { markAsViewed } = useViewedDemos();
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    await new Promise(r => setTimeout(r, 600));
  }, [queryClient]);

  const { pullDistance, isRefreshing, progress, shouldShowIndicator } = usePullToRefresh({ onRefresh: handleRefresh, threshold: 70, maxPullDistance: 100 });

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => { if (!id) id = setInterval(() => setHeadlineIdx(p => (p + 1) % headlines.length), 2500); };
    const stop = () => { if (id) { clearInterval(id); id = null; } };
    const vis = () => { document.hidden ? stop() : start(); };
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', vis);
    setHeadlineIdx(i => i % headlines.length);
    return () => { stop(); document.removeEventListener('visibilitychange', vis); };
  }, [headlines.length]);

  const openDemo = useCallback((id: string) => { haptic.light(); markAsViewed(id); onOpenDemo(id); }, [haptic, onOpenDemo, markAsViewed]);
  const nav = useCallback((s: string) => { haptic.light(); onNavigate(s); }, [haptic, onNavigate]);

  const c = useMemo(() => ({
    text: isDark ? '#ffffff' : '#1d1d1f',
    sub: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(29,29,31,0.55)',
    muted: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(29,29,31,0.3)',
    accent: isDark ? '#34d399' : '#059669',
    accentBg: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
    accentBorder: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.25)',
  }), [isDark]);

  return (
    <div className="min-h-screen showcase-page select-none overflow-x-hidden relative" style={{ backgroundColor: isDark ? '#000000' : '#f5f5f7' }}>
      {isDark && <div className="fixed inset-0 z-0 pointer-events-none"><TubesBackground className="w-full h-full" /></div>}

      <div className="relative z-10">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} shouldShow={shouldShowIndicator} progress={progress} />

        <div className="max-w-lg mx-auto">

          {/* ━━━ HERO ━━━ */}
          <section className="min-h-[85vh] flex flex-col justify-center px-6 pt-[88px] pb-6">
            <div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7"
                style={{ background: c.accentBg, border: `0.5px solid ${c.accentBorder}` }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.accent }} />
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: c.accent }}>Telegram Mini Apps · 2026</span>
              </div>

              <h1>
                <span className="block leading-[1.06]"
                  style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: F.display, color: c.text }}>
                  {t('showcase.heroTitle')}
                </span>
                <span className="block leading-[1.06] mt-0.5"
                  style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: F.display, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(29,29,31,0.4)' }}>
                  {t('showcase.heroTitle2')}
                </span>
                <div className="h-[50px] overflow-hidden mt-1.5">
                  <AnimatePresence mode="wait">
                    <m.span key={headlineIdx}
                      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -18, filter: 'blur(4px)' }}
                      transition={{ duration: 0.4, ease }}
                      className="block leading-[1.06]"
                      style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: F.display, color: c.accent }}>
                      {headlines[headlineIdx]}
                    </m.span>
                  </AnimatePresence>
                </div>
              </h1>

              <div>
                <p className="mt-6 leading-[1.65]" style={{ fontSize: '15px', color: c.sub, fontFamily: F.body, maxWidth: '360px' }}>
                  {t('showcase.heroDescription')}
                </p>
                <p className="mt-2 leading-[1.65]" style={{ fontSize: '15px', color: c.sub, fontFamily: F.body, maxWidth: '360px' }}>
                  {t('showcase.heroDescription2')}{' '}
                  <span style={{ color: c.accent, fontWeight: 600 }}>{t('showcase.heroAccent2')}</span>.
                </p>
              </div>

              <div className="flex gap-3 mt-7">
                <button onClick={() => nav('projects')}
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl transition-all duration-200 active:scale-[0.97]"
                  style={{ height: '52px', background: isDark ? 'linear-gradient(180deg, rgba(52,211,153,0.9) 0%, rgba(16,185,129,0.85) 100%)' : 'linear-gradient(180deg, #10b981 0%, #059669 100%)', boxShadow: '0 10px 36px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2)', border: 'none' }}>
                  <span className="text-[15px] text-white font-bold" style={{ letterSpacing: '-0.01em' }}>{t('showcase.orderProject')}</span>
                  <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                </button>
                <button onClick={() => openDemo('clothing-store')}
                  className="flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-[0.97]"
                  style={{ height: '52px', width: '52px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', backdropFilter: 'blur(16px)', border: isDark ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(0,0,0,0.06)' }}>
                  <Play className="w-5 h-5" style={{ color: c.text }} fill="currentColor" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-10">
              {[
                { val: 127, sfx: "+", label: language === 'ru' ? 'клиентов' : 'clients', d: 0.3, hi: false },
                { val: 24, sfx: language === 'ru' ? 'ч' : 'h', label: language === 'ru' ? 'до запуска' : 'to launch', d: 0.45, hi: false },
                { val: 300, sfx: "%", label: language === 'ru' ? 'к продажам' : 'sales boost', d: 0.6, hi: true },
              ].map((s, i) => (
                <Glass key={i} isDark={isDark} className="rounded-2xl py-4 px-2 text-center" style={s.hi ? { background: c.accentBg, border: `0.5px solid ${c.accentBorder}` } : {}}>
                  <div className="text-[23px] font-bold leading-none" style={{ color: s.hi ? c.accent : c.text, fontFamily: F.display, fontVariantNumeric: 'tabular-nums' }}>
                    {s.hi && '+'}<Counter value={s.val} suffix={s.sfx} delay={s.d} />
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.12em] mt-2" style={{ color: s.hi ? c.accent : c.muted }}>{s.label}</div>
                </Glass>
              ))}
            </div>
          </section>

          <Marquee isDark={isDark} />

          {/* ━━━ PORTFOLIO ━━━ */}
          <section className="px-5 pt-10 pb-6">
            <Reveal>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: c.accent }}>{language === 'ru' ? 'ПОРТФОЛИО' : 'PORTFOLIO'}</p>
                  <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', color: c.text, fontFamily: F.display }}>{t('showcase.projectsTitle')}</h2>
                </div>
                <button onClick={() => nav('projects')} className="flex items-center gap-1 transition-all active:scale-95" style={{ color: c.sub }}>
                  <span className="text-[13px] font-medium">{t('showcase.all')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-center mb-5">
                <LazyMotionProvider>
                  <CardStack items={cardStackItems} initialIndex={0} autoAdvance intervalMs={2500} pauseOnHover showDots cardWidth={300} cardHeight={200} maxVisible={5} overlap={0.45} spreadDeg={35} depthPx={100} tiltXDeg={8} activeLiftPx={16} activeScale={1.02} inactiveScale={0.92} />
                </LazyMotionProvider>
              </div>
            </Reveal>
          </section>

          {/* ━━━ FEATURED PROJECTS ━━━ */}
          <section className="px-5 pb-6">
            <Reveal>
              <div
                className="relative rounded-[24px] overflow-hidden cursor-pointer group active:scale-[0.985] transition-transform duration-300 mb-3"
                onClick={() => openDemo('luxury-watches')}>
                <div className="relative h-[300px] overflow-hidden">
                  <video ref={videoRef} src="/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4" loop muted playsInline autoPlay className="absolute inset-0 w-full h-full object-cover brightness-[0.5] transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.08em] uppercase text-white" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.15)' }}>
                      {language === 'ru' ? 'ВИДЕО-КЕЙС' : 'VIDEO CASE'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4"><FavoriteButton demoId="luxury-watches" size="md" /></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>TIMEELITE</p>
                        <h3 className="text-[24px] font-bold text-white" style={{ letterSpacing: '-0.02em', fontFamily: F.display }}>Watch Store</h3>
                        <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('showcase.watchStoreDesc')}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-[28px] font-black" style={{ color: '#34d399', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>+340%</div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('showcase.sales')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'sneaker-store', img: nikeGreenImage, name: 'Sneaker Store', desc: t('showcase.sneakerStoreDesc'), stat: '+280%' },
                  { id: 'clothing-store', img: rascalImage, name: t('showcase.premiumBrand'), desc: t('showcase.personalSelection'), stat: '+195%' },
                ].map((p) => (
                  <div key={p.id}
                    className="relative rounded-[20px] overflow-hidden cursor-pointer group active:scale-[0.97] transition-transform duration-300"
                    style={{ aspectRatio: '3/4' }} onClick={() => openDemo(p.id)}>
                    <img src={p.img} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover brightness-[0.55] transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-[17px] font-bold text-white mb-0.5" style={{ letterSpacing: '-0.01em' }}>{p.name}</div>
                      <div className="text-[11px] mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{p.desc}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[16px] font-bold" style={{ color: '#34d399' }}>{p.stat}</span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.12)' }}>
                          <ChevronRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          <IPhoneMockupShowcase onOpenDemo={openDemo} />

          {/* ━━━ PROCESS ━━━ */}
          <section className="px-5 pb-10 pt-8">
            <Reveal>
              <div className="text-center mb-9">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: c.accent }}>{language === 'ru' ? 'ПРОЦЕСС' : 'PROCESS'}</p>
                <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', color: c.text, fontFamily: F.display }}>
                  {language === 'ru' ? 'Как это работает' : 'How It Works'}
                </h2>
                <p className="mt-2 text-[14px]" style={{ color: c.sub }}>{language === 'ru' ? 'От идеи до запуска за 3 шага' : 'From idea to launch in 3 steps'}</p>
              </div>

              <div className="space-y-3">
                {[
                  { Icon: MessageCircle, title: language === 'ru' ? 'Заявка' : 'Request', desc: language === 'ru' ? 'Опишите идею или выберите готовое решение из каталога' : 'Describe your idea or choose from our catalog', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', glow: 'rgba(59,130,246,0.2)' },
                  { Icon: Zap, title: language === 'ru' ? 'Разработка' : 'Development', desc: language === 'ru' ? 'Создаём приложение за 24-48 часов с премиум-дизайном' : 'We build your app in 24-48 hours with premium design', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', glow: 'rgba(139,92,246,0.2)' },
                  { Icon: Rocket, title: language === 'ru' ? 'Запуск' : 'Launch', desc: language === 'ru' ? 'Интеграция с Telegram, оплаты и аналитика — всё готово' : 'Telegram integration, payments & analytics — all set', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', glow: 'rgba(16,185,129,0.2)' },
                ].map((step, i) => (
                  <Glass key={i} isDark={isDark} className="rounded-[20px] p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center rounded-[14px] flex-shrink-0" style={{ width: '50px', height: '50px', background: step.gradient, boxShadow: `0 8px 24px ${step.glow}` }}>
                        <step.Icon className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: c.muted }}>0{i + 1}</span>
                          <span className="text-[16px] font-semibold" style={{ color: c.text, fontFamily: F.display }}>{step.title}</span>
                        </div>
                        <p className="text-[13px] leading-[1.55]" style={{ color: c.sub, fontFamily: F.body }}>{step.desc}</p>
                      </div>
                    </div>
                  </Glass>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ━━━ ADVANTAGES ━━━ */}
          <section className="px-5 pb-10 pt-2">
            <Reveal>
              <div className="text-center mb-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: c.accent }}>{language === 'ru' ? 'ПРЕИМУЩЕСТВА' : 'ADVANTAGES'}</p>
                <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', color: c.text, fontFamily: F.display }}>
                  {language === 'ru' ? 'Почему выбирают нас' : 'Why Clients Choose Us'}
                </h2>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: Globe, value: '900M+', label: language === 'ru' ? 'аудитория' : 'audience', color: '#3b82f6' },
                    { Icon: Clock, value: '24h', label: language === 'ru' ? 'разработка' : 'to launch', color: '#8b5cf6' },
                  ].map((f, i) => (
                    <Glass key={i} isDark={isDark} className="rounded-[18px] p-5 text-center">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mx-auto mb-3" style={{ background: `${f.color}18`, border: `0.5px solid ${f.color}30` }}>
                        <f.Icon className="w-5 h-5" style={{ color: f.color }} strokeWidth={2} />
                      </div>
                      <div className="text-[21px] font-bold mb-0.5" style={{ color: c.text, fontFamily: F.display }}>{f.value}</div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.1em]" style={{ color: c.muted }}>{f.label}</div>
                    </Glass>
                  ))}
                </div>

                <Glass isDark={isDark} className="rounded-[18px] p-5" style={{ background: c.accentBg, border: `0.5px solid ${c.accentBorder}` }}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center rounded-[14px] flex-shrink-0" style={{ width: '52px', height: '52px', background: isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.12)', border: `0.5px solid ${c.accentBorder}` }}>
                      <TrendingUp className="w-6 h-6" style={{ color: c.accent }} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[26px] font-black mb-0.5" style={{ color: c.accent, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>+300%</div>
                      <div className="text-[12px] font-medium" style={{ color: isDark ? 'rgba(52,211,153,0.65)' : 'rgba(5,150,105,0.65)' }}>{language === 'ru' ? 'средний рост продаж' : 'average sales growth'}</div>
                    </div>
                  </div>
                </Glass>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: CreditCard, value: language === 'ru' ? 'Встроено' : 'Built-in', label: language === 'ru' ? 'платежи' : 'payments', color: '#f59e0b' },
                    { Icon: Shield, value: '0%', label: language === 'ru' ? 'комиссий' : 'commission', color: '#ef4444' },
                  ].map((f, i) => (
                    <Glass key={i} isDark={isDark} className="rounded-[18px] p-5 text-center">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mx-auto mb-3" style={{ background: `${f.color}18`, border: `0.5px solid ${f.color}30` }}>
                        <f.Icon className="w-5 h-5" style={{ color: f.color }} strokeWidth={2} />
                      </div>
                      <div className="text-[21px] font-bold mb-0.5" style={{ color: c.text, fontFamily: F.display }}>{f.value}</div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.1em]" style={{ color: c.muted }}>{f.label}</div>
                    </Glass>
                  ))}
                </div>
              </div>
            </Reveal>
          </section>

          {/* ━━━ TESTIMONIALS ━━━ */}
          <section className="px-5 pb-10 pt-2">
            <Reveal>
              <div className="text-center mb-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: c.accent }}>{language === 'ru' ? 'ОТЗЫВЫ' : 'REVIEWS'}</p>
                <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', color: c.text, fontFamily: F.display }}>
                  {language === 'ru' ? 'Клиенты говорят' : 'Client Stories'}
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { q: language === 'ru' ? '«За первый месяц продажи выросли на 340%. Telegram Mini App полностью изменил наш подход к e-commerce.»' : '"Sales grew by 340% in the first month. Telegram Mini App completely changed our e-commerce approach."', name: language === 'ru' ? 'Александр М.' : 'Alexander M.', role: language === 'ru' ? 'Владелец магазина часов' : 'Watch store owner', ini: 'АМ', g: 'linear-gradient(135deg, #10b981, #059669)' },
                  { q: language === 'ru' ? '«Приложение было готово за 24 часа. Мы месяцами мучились с маркетплейсами, а тут — готовый бизнес за день.»' : '"The app was ready in 24 hours. We spent months on marketplaces, but here — a ready business in a day."', name: language === 'ru' ? 'Елена К.' : 'Elena K.', role: language === 'ru' ? 'Основатель бренда косметики' : 'Cosmetics brand founder', ini: 'ЕК', g: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
                  { q: language === 'ru' ? '«0% комиссии — это реальность. Сэкономили более 2 млн руб. за квартал по сравнению с маркетплейсами.»' : '"0% commission is real. Saved over $25k per quarter compared to marketplaces."', name: language === 'ru' ? 'Дмитрий В.' : 'Dmitry V.', role: language === 'ru' ? 'CEO интернет-магазина' : 'E-commerce CEO', ini: 'ДВ', g: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
                ].map((r, i) => (
                  <Glass key={i} isDark={isDark} className="rounded-[20px] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] text-white flex-shrink-0" style={{ background: r.g, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>{r.ini}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold truncate" style={{ color: c.text }}>{r.name}</div>
                        <div className="text-[11px] truncate" style={{ color: c.muted }}>{r.role}</div>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {[1,2,3,4,5].map(n => <Star key={n} className="w-3 h-3" style={{ color: '#fbbf24', fill: '#fbbf24' }} />)}
                      </div>
                    </div>
                    <p className="text-[14px] leading-[1.65]" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(29,29,31,0.7)', fontFamily: F.body }}>{r.q}</p>
                  </Glass>
                ))}
              </div>
            </Reveal>
          </section>

          <Marquee isDark={isDark} />

          {/* ━━━ CTA ━━━ */}
          <section className="px-5 pb-24 pt-10">
            <Reveal>
              <Glass isDark={isDark} className="rounded-[28px] p-7 text-center" style={{
                background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.07)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                border: `0.5px solid ${c.accentBorder}`,
                boxShadow: isDark ? '0 16px 64px rgba(16,185,129,0.1)' : '0 16px 64px rgba(16,185,129,0.08)',
              }}>
                <div className="w-14 h-14 rounded-[16px] flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 10px 28px rgba(16,185,129,0.3)' }}>
                  <Sparkles className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <h3 className="mb-2" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: c.text, fontFamily: F.display }}>
                  {language === 'ru' ? 'Готовы к росту?' : 'Ready to Grow?'}
                </h3>
                <p className="mb-6" style={{ fontSize: '14px', lineHeight: '1.6', color: c.sub, fontFamily: F.body }}>
                  {language === 'ru' ? 'Бесплатная консультация и запуск магазина в Telegram за 24 часа' : 'Free consultation and launch your Telegram store in 24 hours'}
                </p>
                <button onClick={() => nav('projects')}
                  className="w-full py-4 font-bold rounded-2xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2"
                  style={{ fontSize: '16px', letterSpacing: '-0.01em', background: 'linear-gradient(180deg, #10b981, #059669)', color: '#fff', boxShadow: '0 10px 36px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)', fontFamily: F.body }}>
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
                      <item.Icon className="w-3.5 h-3.5" style={{ color: c.accent }} strokeWidth={2} />
                      <span className="text-[11px] font-medium" style={{ color: c.sub }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </Glass>
            </Reveal>
          </section>

        </div>
      </div>
    </div>
  );
}
