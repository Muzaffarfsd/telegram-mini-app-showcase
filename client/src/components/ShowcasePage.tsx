import {
  ArrowRight, Play, Zap, Rocket, Star,
  CheckCircle2, ChevronRight, Shield, Clock, Globe,
  CreditCard, MessageCircle, Send
} from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";
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

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const F = '"SF Pro Display", -apple-system, system-ui, sans-serif';

const rotatingWords = {
  ru: ["у конкурентов", "на рынке", "в вашей нише", "в России", "в СНГ"],
  en: ["competitors have", "in the market", "in your niche", "in your region"],
};

function Num({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let c = false;
    const s = performance.now();
    const tick = (now: number) => {
      if (c) return;
      const p = Math.min((now - s) / 900, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { c = true; };
  }, [inView, to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <m.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease, delay }} className={className}>
      {children}
    </m.div>
  );
}

function GlowLine() {
  return (
    <div className="relative h-px my-2 mx-6">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.35) 50%, transparent 100%)' }} />
    </div>
  );
}

function Tape() {
  const items = ["WEB4TG", "✦", "TELEGRAM APPS", "✦", "24H LAUNCH", "✦", "PREMIUM", "✦", "E-COMMERCE", "✦", "AI POWERED", "✦", "0% FEES", "✦"];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden py-3.5" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
      <m.div className="flex gap-6 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 24, ease: "linear", repeat: Infinity }}>
        {row.map((w, i) => (
          <span key={i} className="text-[10px] font-bold tracking-[0.25em] uppercase flex-shrink-0" style={{ color: w === "✦" ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.12)' }}>
            {w}
          </span>
        ))}
      </m.div>
    </div>
  );
}

export default function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const { t, language } = useLanguage();
  const words = language === 'ru' ? rotatingWords.ru : rotatingWords.en;
  const [wordIdx, setWordIdx] = useState(0);
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
    const go = () => { if (!id) id = setInterval(() => setWordIdx(p => (p + 1) % words.length), 2400); };
    const stop = () => { if (id) { clearInterval(id); id = null; } };
    const vis = () => { document.hidden ? stop() : go(); };
    if (!document.hidden) go();
    document.addEventListener('visibilitychange', vis);
    setWordIdx(i => i % words.length);
    return () => { stop(); document.removeEventListener('visibilitychange', vis); };
  }, [words.length]);

  const open = useCallback((id: string) => { haptic.light(); markAsViewed(id); onOpenDemo(id); }, [haptic, onOpenDemo, markAsViewed]);
  const nav = useCallback((s: string) => { haptic.light(); onNavigate(s); }, [haptic, onNavigate]);

  const ac = '#34d399';

  return (
    <div className="min-h-screen showcase-page select-none overflow-x-hidden" style={{ backgroundColor: '#000000' }}>
      <div className="fixed inset-0 z-0 pointer-events-none"><TubesBackground className="w-full h-full" /></div>

      <div className="relative z-10">
        <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} shouldShow={shouldShowIndicator} progress={progress} />
        <div className="max-w-lg mx-auto">

          {/* ══════════ HERO ══════════ */}
          <section className="min-h-[92vh] flex flex-col justify-end px-6 pb-10 pt-[100px]">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 self-start"
              style={{ background: 'rgba(52,211,153,0.08)', border: '0.5px solid rgba(52,211,153,0.15)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ac }} />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: ac }}>
                {language === 'ru' ? 'Запуск за 24 часа' : 'Launch in 24 hours'}
              </span>
            </div>

            <h1 style={{ fontFamily: F }}>
              <span className="block text-[48px] font-[900] leading-[1.0] tracking-[-0.05em] text-white">
                {t('showcase.heroTitle')}
              </span>
              <span className="block text-[48px] font-[900] leading-[1.0] tracking-[-0.05em] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {t('showcase.heroTitle2')}
              </span>
              <div className="h-[52px] overflow-hidden mt-1">
                <AnimatePresence mode="wait">
                  <m.span key={wordIdx}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -22 }}
                    transition={{ duration: 0.35, ease }}
                    className="block text-[48px] font-[900] leading-[1.0] tracking-[-0.05em]"
                    style={{ color: ac }}>
                    {words[wordIdx]}
                  </m.span>
                </AnimatePresence>
              </div>
            </h1>

            <p className="mt-7 text-[15px] leading-[1.7] max-w-[340px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: F }}>
              {t('showcase.heroDescription')}
            </p>

            <div className="flex gap-3 mt-8">
              <button onClick={() => nav('projects')}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl active:scale-[0.97] transition-transform"
                style={{ height: '54px', background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)', boxShadow: '0 0 40px rgba(52,211,153,0.25), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                <span className="text-[15px] font-bold text-black tracking-[-0.01em]">{t('showcase.orderProject')}</span>
                <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
              </button>
              <button onClick={() => open('clothing-store')}
                className="flex items-center justify-center rounded-2xl active:scale-[0.97] transition-transform"
                style={{ height: '54px', width: '54px', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
                <Play className="w-5 h-5 text-white" fill="currentColor" />
              </button>
            </div>
          </section>

          {/* ══════════ STATS STRIP ══════════ */}
          <div className="flex items-center justify-between px-6 py-7" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
            {[
              { v: 127, s: "+", l: language === 'ru' ? 'клиентов' : 'clients' },
              { v: 24, s: language === 'ru' ? 'ч' : 'h', l: language === 'ru' ? 'запуск' : 'launch' },
              { v: 300, s: "%", l: language === 'ru' ? 'рост' : 'growth' },
            ].map((d, i) => (
              <div key={i} className="text-center flex-1">
                <div className="text-[28px] font-[900] leading-none tracking-[-0.03em]" style={{ color: i === 2 ? ac : '#fff', fontFamily: F, fontVariantNumeric: 'tabular-nums' }}>
                  {i === 2 && '+'}<Num to={d.v} suffix={d.s} />
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.15em] mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{d.l}</div>
              </div>
            ))}
          </div>

          <Tape />

          {/* ══════════ CASES — HORIZONTAL SCROLL ══════════ */}
          <section className="pt-12 pb-6">
            <Reveal className="px-6">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase block mb-2" style={{ color: ac }}>
                    {language === 'ru' ? 'КЕЙСЫ' : 'CASES'}
                  </span>
                  <h2 className="text-[32px] font-[800] leading-[1.05] tracking-[-0.04em] text-white" style={{ fontFamily: F }}>
                    {language === 'ru' ? 'Реальные\nрезультаты' : 'Real\nResults'}
                  </h2>
                </div>
                <button onClick={() => nav('projects')} className="flex items-center gap-1 active:scale-95 transition-transform" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <span className="text-[12px] font-medium">{t('showcase.all')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Reveal>

            <div className="overflow-x-auto scrollbar-hide px-6 -mx-0">
              <div className="flex gap-3" style={{ width: 'max-content', paddingRight: '24px' }}>
                {[
                  { id: 'luxury-watches', video: true, src: "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4", tag: 'TIMEELITE', title: 'Watch Store', stat: '+340%', desc: t('showcase.watchStoreDesc') },
                  { id: 'sneaker-store', video: false, src: nikeGreenImage, tag: 'SNEAKER VAULT', title: 'Sneaker Store', stat: '+280%', desc: t('showcase.sneakerStoreDesc') },
                  { id: 'clothing-store', video: false, src: rascalImage, tag: 'RASCAL', title: t('showcase.premiumBrand'), stat: '+195%', desc: t('showcase.personalSelection') },
                ].map((c, i) => (
                  <div key={c.id} onClick={() => open(c.id)}
                    className="relative rounded-[22px] overflow-hidden cursor-pointer group active:scale-[0.97] transition-transform flex-shrink-0"
                    style={{ width: '260px', height: '360px' }}>
                    {c.video ? (
                      <video ref={i === 0 ? videoRef : undefined} src={c.src} loop muted playsInline autoPlay className="absolute inset-0 w-full h-full object-cover brightness-[0.4] transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <img src={c.src} alt={c.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover brightness-[0.4] transition-transform duration-700 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.1em] uppercase text-white/60" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
                        {c.tag}
                      </span>
                      <FavoriteButton demoId={c.id} size="md" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="text-[34px] font-[900] leading-none tracking-[-0.03em] mb-1" style={{ color: ac, fontFamily: F }}>{c.stat}</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('showcase.sales')}</div>
                      <div className="text-[18px] font-bold text-white mb-1" style={{ fontFamily: F }}>{c.title}</div>
                      <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <GlowLine />

          {/* ══════════ BIG NUMBER BLOCK ══════════ */}
          <section className="px-6 py-14">
            <Reveal>
              <div className="text-center">
                <div className="text-[72px] font-[900] leading-none tracking-[-0.06em]" style={{ fontFamily: F, background: 'linear-gradient(180deg, #34d399 0%, rgba(52,211,153,0.3) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  900M+
                </div>
                <p className="text-[14px] mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {language === 'ru' ? 'аудитория Telegram — ваши будущие клиенты' : 'Telegram audience — your future customers'}
                </p>
              </div>
            </Reveal>
          </section>

          <GlowLine />

          {/* ══════════ WHY — VERTICAL FEATURE LIST ══════════ */}
          <section className="px-6 py-12">
            <Reveal>
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase block mb-3" style={{ color: ac }}>
                {language === 'ru' ? 'ПОЧЕМУ МЫ' : 'WHY US'}
              </span>
              <h2 className="text-[32px] font-[800] leading-[1.05] tracking-[-0.04em] text-white mb-10" style={{ fontFamily: F }}>
                {language === 'ru' ? 'Всё включено' : 'All Inclusive'}
              </h2>
            </Reveal>

            <div className="space-y-0">
              {[
                { icon: Zap, val: '24h', label: language === 'ru' ? 'Запуск за сутки' : 'Launch in a day', desc: language === 'ru' ? 'Полностью рабочее приложение' : 'Fully functional app' },
                { icon: Shield, val: '0%', label: language === 'ru' ? 'Без комиссий' : 'Zero commission', desc: language === 'ru' ? 'Вся выручка — ваша' : 'All revenue is yours' },
                { icon: CreditCard, val: '∞', label: language === 'ru' ? 'Платежи встроены' : 'Payments built-in', desc: language === 'ru' ? 'Stripe, ЮKassa, крипто' : 'Stripe, YooKassa, crypto' },
                { icon: Globe, val: 'AI', label: language === 'ru' ? 'AI-поддержка' : 'AI Support', desc: language === 'ru' ? 'Бот-ассистент 24/7' : 'Bot assistant 24/7' },
              ].map((f, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="flex items-center gap-5 py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.06)', border: '0.5px solid rgba(52,211,153,0.12)' }}>
                      <f.icon className="w-5 h-5" style={{ color: ac }} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[16px] font-bold text-white" style={{ fontFamily: F }}>{f.label}</div>
                      <div className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{f.desc}</div>
                    </div>
                    <div className="text-[22px] font-[900] flex-shrink-0 tracking-[-0.02em]" style={{ color: ac, fontFamily: F }}>{f.val}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ══════════ PROCESS — 3 STEPS MINIMAL ══════════ */}
          <section className="px-6 py-12">
            <Reveal>
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase block mb-3" style={{ color: ac }}>
                {language === 'ru' ? 'ПРОЦЕСС' : 'PROCESS'}
              </span>
              <h2 className="text-[32px] font-[800] leading-[1.05] tracking-[-0.04em] text-white mb-10" style={{ fontFamily: F }}>
                {language === 'ru' ? '3 шага до\nзапуска' : '3 Steps to\nLaunch'}
              </h2>
            </Reveal>

            <div className="space-y-4">
              {[
                { n: '01', icon: MessageCircle, title: language === 'ru' ? 'Заявка' : 'Brief', desc: language === 'ru' ? 'Расскажите о бизнесе или выберите готовый шаблон из каталога' : 'Tell us about your business or pick a ready template', color: '#3b82f6' },
                { n: '02', icon: Zap, title: language === 'ru' ? 'Сборка' : 'Build', desc: language === 'ru' ? 'Дизайн, разработка и тестирование за 24 часа' : 'Design, development and testing in 24 hours', color: '#a855f7' },
                { n: '03', icon: Rocket, title: language === 'ru' ? 'Запуск' : 'Launch', desc: language === 'ru' ? 'Деплой в Telegram, подключение оплат и аналитики' : 'Deploy to Telegram, connect payments & analytics', color: ac },
              ].map((step, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="rounded-[20px] p-5 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <div className="absolute top-0 right-0 text-[80px] font-[900] leading-none tracking-[-0.06em] select-none pointer-events-none" style={{ color: 'rgba(255,255,255,0.02)', fontFamily: F, transform: 'translate(8px, -12px)' }}>
                      {step.n}
                    </div>
                    <div className="relative flex items-start gap-4">
                      <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}15`, border: `0.5px solid ${step.color}25` }}>
                        <step.icon className="w-5 h-5" style={{ color: step.color }} strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-[16px] font-bold text-white mb-1" style={{ fontFamily: F }}>{step.title}</div>
                        <div className="text-[13px] leading-[1.55]" style={{ color: 'rgba(255,255,255,0.35)' }}>{step.desc}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <Tape />

          {/* ══════════ SOCIAL PROOF — REVIEWS ══════════ */}
          <section className="px-6 py-12">
            <Reveal>
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase block mb-3" style={{ color: ac }}>
                {language === 'ru' ? 'ОТЗЫВЫ' : 'REVIEWS'}
              </span>
              <h2 className="text-[32px] font-[800] leading-[1.05] tracking-[-0.04em] text-white mb-8" style={{ fontFamily: F }}>
                {language === 'ru' ? 'Что говорят\nклиенты' : 'What Clients\nSay'}
              </h2>
            </Reveal>

            <div className="space-y-3">
              {[
                { q: language === 'ru' ? '«Продажи +340% за первый месяц. Mini App изменил всё.»' : '"Sales +340% in the first month. Mini App changed everything."', name: language === 'ru' ? 'Александр М.' : 'Alexander M.', role: language === 'ru' ? 'Часовой бизнес' : 'Watch business', ini: 'АМ', g: '#10b981' },
                { q: language === 'ru' ? '«Готово за 24 часа. Месяцы на маркетплейсах — впустую, а тут день.»' : '"Ready in 24h. Months on marketplaces wasted, but here — one day."', name: language === 'ru' ? 'Елена К.' : 'Elena K.', role: language === 'ru' ? 'Бренд косметики' : 'Cosmetics brand', ini: 'ЕК', g: '#8b5cf6' },
                { q: language === 'ru' ? '«0% комиссии — сэкономили 2M ₽ за квартал.»' : '"0% commission — saved $25k per quarter."', name: language === 'ru' ? 'Дмитрий В.' : 'Dmitry V.', role: 'CEO', ini: 'ДВ', g: '#3b82f6' },
              ].map((r, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="rounded-[18px] p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[15px] leading-[1.6] text-white/60 mb-4" style={{ fontFamily: F }}>{r.q}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0" style={{ background: r.g }}>{r.ini}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-white/80">{r.name}</div>
                        <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{r.role}</div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => <Star key={n} className="w-3 h-3" style={{ color: '#fbbf24', fill: '#fbbf24' }} />)}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <GlowLine />

          {/* ══════════ CTA — FINAL ══════════ */}
          <section className="px-6 pt-10 pb-28">
            <Reveal>
              <div className="rounded-[24px] p-7 text-center relative overflow-hidden" style={{ background: 'rgba(52,211,153,0.04)', border: '0.5px solid rgba(52,211,153,0.12)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.08) 0%, transparent 60%)' }} />
                <div className="relative">
                  <div className="w-14 h-14 rounded-[16px] flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 0 40px rgba(52,211,153,0.2)' }}>
                    <Send className="w-6 h-6 text-black" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[26px] font-[800] tracking-[-0.04em] text-white mb-2" style={{ fontFamily: F }}>
                    {language === 'ru' ? 'Готовы?' : 'Ready?'}
                  </h3>
                  <p className="text-[14px] mb-7 max-w-[280px] mx-auto" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: '1.6' }}>
                    {language === 'ru' ? 'Бесплатная консультация и запуск вашего магазина за 24 часа' : 'Free consultation & launch your store in 24 hours'}
                  </p>
                  <button onClick={() => nav('projects')}
                    className="w-full py-4 font-bold rounded-2xl active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
                    style={{ fontSize: '16px', background: 'linear-gradient(180deg, #34d399, #10b981)', color: '#000', boxShadow: '0 0 48px rgba(52,211,153,0.2), inset 0 1px 0 rgba(255,255,255,0.15)', fontFamily: F }}>
                    {language === 'ru' ? 'Начать сейчас' : 'Start Now'}
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                  <div className="flex items-center justify-center gap-4 mt-5">
                    {[
                      { Icon: CheckCircle2, text: language === 'ru' ? 'Бесплатно' : 'Free' },
                      { Icon: Clock, text: '24h' },
                      { Icon: Shield, text: language === 'ru' ? '0% комиссии' : '0% fees' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <item.Icon className="w-3 h-3" style={{ color: 'rgba(52,211,153,0.5)' }} strokeWidth={2} />
                        <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

        </div>
      </div>
    </div>
  );
}
