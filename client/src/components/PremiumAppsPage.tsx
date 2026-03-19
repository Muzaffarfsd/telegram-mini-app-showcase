import { ArrowUpRight, ChevronRight, Smartphone, Shield, TrendingUp, Zap, Globe, CreditCard, Bot, Users, BarChart3, Layers, MessageCircle, ShoppingBag, Wallet, Calendar, Ticket, BookOpen, Headphones, Star } from "lucide-react";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { m, AnimatePresence, useInView, useScroll, useTransform } from '@/utils/LazyMotionProvider';
import { useHaptic } from '../hooks/useHaptic';
import { useLanguage } from '../contexts/LanguageContext';

interface PremiumAppsPageProps {
  onNavigate: (section: string) => void;
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

const HERO_WORDS_RU = ["бизнеса", "продаж", "клиентов", "бренда"];
const HERO_WORDS_EN = ["business", "sales", "clients", "brand"];

const APP_CATEGORIES = [
  { icon: ShoppingBag, color: '#34d399', tRu: 'E-Commerce', tEn: 'E-Commerce', sRu: 'Интернет-магазин прямо в Telegram. Каталог, корзина, оплата — без сайта', sEn: 'Online store right in Telegram. Catalog, cart, payment — no website needed' },
  { icon: Wallet, color: '#60a5fa', tRu: 'Финтех', tEn: 'Fintech', sRu: 'Платежи, переводы, криптокошельки. Банковский уровень безопасности', sEn: 'Payments, transfers, crypto wallets. Bank-level security' },
  { icon: Calendar, color: '#a78bfa', tRu: 'Букинг', tEn: 'Booking', sRu: 'Запись на услуги, бронирование столов, билеты на события', sEn: 'Service booking, table reservations, event tickets' },
  { icon: Users, color: '#f97316', tRu: 'CRM & Лояльность', tEn: 'CRM & Loyalty', sRu: 'Управление клиентами, программы лояльности, бонусные карты', sEn: 'Client management, loyalty programs, bonus cards' },
  { icon: BookOpen, color: '#f472b6', tRu: 'EdTech', tEn: 'EdTech', sRu: 'Онлайн-курсы, тесты, сертификаты. Обучение внутри мессенджера', sEn: 'Online courses, tests, certificates. Learning inside the messenger' },
  { icon: Headphones, color: '#facc15', tRu: 'Сервисы', tEn: 'Services', sRu: 'Доставка, такси, маркетплейсы услуг. Всё в одном приложении', sEn: 'Delivery, taxi, service marketplaces. All in one app' },
];

const ADVANTAGES = [
  { icon: Smartphone, color: '#34d399', tRu: 'Нативный опыт', tEn: 'Native Experience', sRu: 'Приложение неотличимо от нативного. Жесты, анимации, хаптик — всё как в iOS/Android', sEn: 'App indistinguishable from native. Gestures, animations, haptics — like iOS/Android' },
  { icon: Shield, color: '#60a5fa', tRu: 'Безопасность', tEn: 'Security', sRu: 'Telegram-авторизация, шифрование данных, защита платежей по стандартам PCI DSS', sEn: 'Telegram auth, data encryption, PCI DSS compliant payments' },
  { icon: TrendingUp, color: '#a78bfa', tRu: 'Мгновенный охват', tEn: 'Instant Reach', sRu: '900M+ пользователей Telegram. Ваше приложение доступно без скачивания', sEn: '900M+ Telegram users. Your app available without download' },
  { icon: Globe, color: '#f97316', tRu: 'Мультиязычность', tEn: 'Multilingual', sRu: 'Автоопределение языка. Интерфейс на 12 языках из коробки', sEn: 'Auto language detection. Interface in 12 languages out of the box' },
  { icon: Bot, color: '#f472b6', tRu: 'AI-интеграция', tEn: 'AI Integration', sRu: 'GPT-ассистент, умные рекомендации, автоматизация поддержки клиентов', sEn: 'GPT assistant, smart recommendations, automated customer support' },
  { icon: Layers, color: '#facc15', tRu: 'Масштабируемость', tEn: 'Scalability', sRu: 'Архитектура для роста. От 100 до 1 000 000 пользователей без переработки', sEn: 'Architecture for growth. From 100 to 1,000,000 users without rework' },
];

const PRICING_TIERS = [
  {
    nameRu: 'Старт', nameEn: 'Start',
    priceRu: '49 000 ₽', priceEn: '$490',
    descRu: 'Идеально для запуска MVP', descEn: 'Perfect for MVP launch',
    featuresRu: ['Каталог товаров', 'Корзина и оплата', 'Telegram-авторизация', 'Адаптивный дизайн', 'Базовая аналитика'],
    featuresEn: ['Product catalog', 'Cart & payment', 'Telegram auth', 'Responsive design', 'Basic analytics'],
    accent: false,
  },
  {
    nameRu: 'Бизнес', nameEn: 'Business',
    priceRu: '149 000 ₽', priceEn: '$1 490',
    descRu: 'Полный набор для роста', descEn: 'Full toolkit for growth',
    featuresRu: ['Всё из Старт', 'AI-ассистент 24/7', 'CRM-интеграция', 'Программа лояльности', 'Продвинутая аналитика', 'Мультиязычность'],
    featuresEn: ['Everything in Start', 'AI assistant 24/7', 'CRM integration', 'Loyalty program', 'Advanced analytics', 'Multilingual'],
    accent: true,
  },
  {
    nameRu: 'Энтерпрайз', nameEn: 'Enterprise',
    priceRu: 'По запросу', priceEn: 'Custom',
    descRu: 'Индивидуальное решение', descEn: 'Custom solution',
    featuresRu: ['Всё из Бизнес', 'Кастомная разработка', 'Выделенная команда', 'SLA и поддержка', 'Безлимитные интеграции', 'White-label'],
    featuresEn: ['Everything in Business', 'Custom development', 'Dedicated team', 'SLA & support', 'Unlimited integrations', 'White-label'],
    accent: false,
  },
];

export default function PremiumAppsPage({ onNavigate }: PremiumAppsPageProps) {
  const haptic = useHaptic();
  const { language } = useLanguage();
  const ru = language === 'ru';

  const heroWords = ru ? HERO_WORDS_RU : HERO_WORDS_EN;
  const [wi, setWi] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setWi(i => (i + 1) % heroWords.length), 2600);
    return () => clearInterval(id);
  }, [heroWords.length]);

  const nav = useCallback((s: string) => {
    haptic.light(); onNavigate(s);
  }, [haptic, onNavigate]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen select-none overflow-x-hidden" style={{ backgroundColor: '#050505' }}>
      <div className="relative z-10">
        <div className="mx-auto w-full" style={{ maxWidth: 540 }}>

          {/* ═══════ HERO ═══════ */}
          <header ref={heroRef} className="relative px-6 pt-14 pb-14 overflow-hidden" role="banner" style={{ minHeight: '85vh' }}>
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute inset-0" style={{
                background: `radial-gradient(ellipse at 30% 30%, ${EMERALD}08 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(99,102,241,0.05) 0%, transparent 50%)`,
              }} />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(180deg, #050505 0%, rgba(5,5,5,0.2) 40%, rgba(5,5,5,0.2) 60%, #050505 100%)',
              }} />

              <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
                {[0,1,2,3,4,5,6,7].map(i => (
                  <div key={i} className="absolute w-full" style={{
                    top: `${i * 13}%`,
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4) ${20 + i * 8}%, transparent)`,
                  }} />
                ))}
              </div>
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
                    Premium Telegram Apps
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
                  style={{ fontSize: 'clamp(2.2rem, 9vw, 3.5rem)', fontWeight: 800, color: '#fff' }}
                >
                  {ru ? 'Премиальные' : 'Premium'}
                </m.span>
                <m.span
                  className="block"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
                  style={{ fontSize: 'clamp(2.2rem, 9vw, 3.5rem)', fontWeight: 800, color: '#fff' }}
                >
                  {ru ? 'приложения' : 'Apps for'}
                </m.span>
                <m.span
                  className="block"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
                  style={{
                    fontSize: 'clamp(2.2rem, 9vw, 3.5rem)', fontWeight: 800,
                    fontFamily: INSTRUMENT, fontStyle: 'italic',
                    background: `linear-gradient(135deg, ${EMERALD}, #a7f3d0)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}
                >
                  Telegram
                </m.span>
              </m.h1>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.9 }}
                className="mt-5"
              >
                <p style={{
                  fontFamily: SYNE, fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                  fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.02em',
                }}>
                  {ru ? 'Бизнес-решения нового уровня' : 'Next-level business solutions'}
                </p>
                <p className="mt-2" style={{
                  fontFamily: INTER, fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                  lineHeight: 1.65, color: 'rgba(255,255,255,0.4)',
                }}>
                  {ru ? 'Для' : 'For'}{' '}
                  <span className="inline-block overflow-hidden align-bottom" style={{ height: '1.4em', minWidth: 80 }}>
                    <AnimatePresence mode="wait">
                      <m.span
                        key={wi}
                        className="block"
                        initial={{ y: '110%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        exit={{ y: '-110%', opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        style={{
                          fontFamily: INSTRUMENT, fontStyle: 'italic',
                          color: EMERALD, fontWeight: 500,
                        }}
                      >
                        {heroWords[wi]}
                      </m.span>
                    </AnimatePresence>
                  </span>
                  {ru ? ' — без комиссий, за 24 часа' : ' — zero fees, in 24 hours'}
                </p>
              </m.div>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
                className="mt-7 flex items-center gap-4"
              >
                <button
                  onClick={() => nav('constructor')}
                  className="group flex items-center gap-2.5 rounded-full px-6 transition-all duration-500 active:scale-[0.96]"
                  style={{ height: 48, background: '#fff' }}
                >
                  <span style={{ fontFamily: SYNE, fontSize: '0.8125rem', fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>
                    {ru ? 'Создать приложение' : 'Build an App'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
                </button>

                <button
                  onClick={() => nav('projects')}
                  className="flex items-center gap-2 rounded-full px-4 transition-all duration-300 active:scale-[0.96]"
                  style={{ height: 48, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span style={{ fontFamily: INTER, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
                    {ru ? 'Примеры' : 'Examples'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </button>
              </m.div>
            </m.div>
          </header>

          {/* ═══════ MARQUEE ═══════ */}
          <div className="py-4 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <m.div
              animate={prefersReducedMotion() ? {} : { x: ['0%', '-50%'] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="flex items-center gap-8 whitespace-nowrap"
              style={{ width: 'max-content' }}
            >
              {[0, 1].map(rep => (
                <div key={rep} className="flex items-center gap-8">
                  {(ru
                    ? ['E-Commerce', 'Финтех', 'Букинг', 'CRM', 'EdTech', 'AI-боты', 'Доставка', 'Лояльность', 'SaaS']
                    : ['E-Commerce', 'Fintech', 'Booking', 'CRM', 'EdTech', 'AI Bots', 'Delivery', 'Loyalty', 'SaaS']
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

          {/* ═══════ SOCIAL PROOF STRIP ═══════ */}
          <Cin className="px-6 py-10">
            <div className="flex items-center justify-between py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                { n: '900', s: 'M+', l: ru ? 'аудитория' : 'audience' },
                { n: '24', s: ru ? 'ч' : 'h', l: ru ? 'запуск' : 'launch' },
                { n: '0', s: '%', l: ru ? 'комиссий' : 'fees' },
              ].map((stat, i) => (
                <div key={i} className="text-center flex-1">
                  <div style={{
                    fontFamily: SYNE, fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
                    fontWeight: 800, color: '#fff', letterSpacing: '-0.04em',
                  }}>
                    {i === 0 ? <><Ct to={900} />{stat.s}</> : <Ct to={parseInt(stat.n)} suffix={stat.s} />}
                  </div>
                  <div style={{
                    fontFamily: INTER, fontSize: '0.625rem', fontWeight: 500,
                    color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em', textTransform: 'uppercase' as const, marginTop: 2,
                  }}>{stat.l}</div>
                </div>
              ))}
            </div>
          </Cin>

          {/* ═══════ APP CATEGORIES ═══════ */}
          <section className="px-6 py-12" aria-label={ru ? 'Категории приложений' : 'App Categories'}>
            <Cin>
              <span style={{
                fontFamily: SYNE, fontSize: '0.6875rem',
                fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.25)',
              }}>
                {ru ? 'Решения' : 'Solutions'}
              </span>
              <h2 className="mt-2 mb-8" style={{
                fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {ru ? <>Приложение для<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', background: `linear-gradient(135deg, ${EMERALD}, #a7f3d0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>любой ниши</span></> : <>An app for<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', background: `linear-gradient(135deg, ${EMERALD}, #a7f3d0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>every niche</span></>}
              </h2>
            </Cin>

            <div className="grid grid-cols-2 gap-2.5">
              {APP_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <Cin key={i} delay={i * 0.06}>
                    <div
                      className="rounded-2xl p-4 transition-all duration-400 group cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                      onClick={() => nav('constructor')}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110" style={{ background: `${cat.color}12` }}>
                        <Icon className="w-5 h-5" style={{ color: cat.color }} strokeWidth={1.8} />
                      </div>
                      <h3 style={{
                        fontFamily: SYNE, fontSize: '0.85rem',
                        fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
                      }}>{ru ? cat.tRu : cat.tEn}</h3>
                      <p className="mt-1" style={{
                        fontFamily: INTER, fontSize: '0.7rem',
                        lineHeight: 1.5, color: 'rgba(255,255,255,0.35)',
                      }}>{ru ? cat.sRu : cat.sEn}</p>
                    </div>
                  </Cin>
                );
              })}
            </div>
          </section>

          {/* ═══════ ADVANTAGES ═══════ */}
          <section className="px-6 py-12" aria-label={ru ? 'Преимущества' : 'Advantages'}>
            <Cin>
              <h2 className="mb-8" style={{
                fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {ru ? <>Почему<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>Telegram?</span></> : <>Why<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>Telegram?</span></>}
              </h2>
            </Cin>

            <div className="space-y-2.5">
              {ADVANTAGES.map((adv, i) => {
                const Icon = adv.icon;
                return (
                  <Cin key={i} delay={i * 0.04}>
                    <div
                      className="flex items-start gap-4 rounded-2xl p-4 transition-all duration-400 group"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: `${adv.color}12` }}>
                        <Icon className="w-5 h-5" style={{ color: adv.color }} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 style={{
                          fontFamily: SYNE, fontSize: '0.9rem',
                          fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
                        }}>{ru ? adv.tRu : adv.tEn}</h3>
                        <p className="mt-0.5" style={{
                          fontFamily: INTER, fontSize: '0.75rem',
                          lineHeight: 1.55, color: 'rgba(255,255,255,0.4)',
                        }}>{ru ? adv.sRu : adv.sEn}</p>
                      </div>
                    </div>
                  </Cin>
                );
              })}
            </div>
          </section>

          {/* ═══════ BIG NUMBERS ═══════ */}
          <section className="px-6 py-16" aria-label={ru ? 'Метрики' : 'Metrics'}>
            <div className="space-y-14">
              {[
                { num: 340, sfx: '%', title: ru ? 'рост продаж клиентов' : 'client sales growth', desc: ru ? 'Средний рост продаж после запуска Telegram-приложения в первый месяц' : 'Average sales growth after Telegram app launch in the first month' },
                { num: 70, sfx: '%', title: ru ? 'автоматизация поддержки' : 'support automation', desc: ru ? 'AI-ассистент закрывает большинство вопросов без участия менеджера' : 'AI assistant handles most questions without manager involvement' },
                { num: 12, sfx: ru ? ' языков' : ' langs', title: ru ? 'мультиязычность' : 'multilingual', desc: ru ? 'Приложение автоматически адаптируется под язык каждого пользователя' : 'App automatically adapts to each user\'s language' },
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

          {/* ═══════ PRICING ═══════ */}
          <section className="py-14" aria-label={ru ? 'Тарифы' : 'Pricing'}>
            <Cin className="px-6 mb-6">
              <span style={{
                fontFamily: SYNE, fontSize: '0.6875rem',
                fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.25)',
              }}>
                {ru ? 'Тарифы' : 'Pricing'}
              </span>
              <h2 className="mt-2" style={{
                fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {ru ? <>Прозрачные цены.<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>Без скрытых платежей.</span></> : <>Transparent pricing.<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>No hidden fees.</span></>}
              </h2>
            </Cin>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3.5 px-6" style={{ width: 'max-content', paddingRight: 24 }}>
                {PRICING_TIERS.map((tier, i) => (
                  <Cin key={i} delay={i * 0.1}>
                    <div
                      className="flex-shrink-0 rounded-2xl p-5 flex flex-col"
                      style={{
                        width: 260, minHeight: 340,
                        background: tier.accent ? `rgba(52,211,153,0.04)` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${tier.accent ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)'}`,
                      }}
                    >
                      {tier.accent && (
                        <span className="inline-flex self-start items-center gap-1.5 rounded-full px-2.5 py-1 mb-3" style={{
                          background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)',
                        }}>
                          <Star className="w-3 h-3" style={{ color: EMERALD }} fill={EMERALD} />
                          <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, color: EMERALD, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
                            {ru ? 'Популярный' : 'Popular'}
                          </span>
                        </span>
                      )}

                      <h3 style={{
                        fontFamily: SYNE, fontSize: '1.1rem',
                        fontWeight: 800, color: '#fff', letterSpacing: '-0.03em',
                      }}>{ru ? tier.nameRu : tier.nameEn}</h3>

                      <div className="mt-2" style={{
                        fontFamily: SYNE, fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                        fontWeight: 800, letterSpacing: '-0.04em',
                        color: tier.accent ? EMERALD : '#fff',
                      }}>
                        {ru ? tier.priceRu : tier.priceEn}
                      </div>

                      <p className="mt-1 mb-4" style={{
                        fontFamily: INTER, fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.35)',
                      }}>{ru ? tier.descRu : tier.descEn}</p>

                      <div className="flex-1 space-y-2">
                        {(ru ? tier.featuresRu : tier.featuresEn).map((feat, fi) => (
                          <div key={fi} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: tier.accent ? EMERALD : 'rgba(255,255,255,0.2)' }} />
                            <span style={{
                              fontFamily: INTER, fontSize: '0.75rem',
                              color: 'rgba(255,255,255,0.5)',
                            }}>{feat}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => nav('constructor')}
                        className="mt-5 w-full flex items-center justify-center gap-2 rounded-full transition-all duration-300 active:scale-[0.96]"
                        style={{
                          height: 42,
                          background: tier.accent ? '#fff' : 'rgba(255,255,255,0.06)',
                          border: tier.accent ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span style={{
                          fontFamily: SYNE, fontSize: '0.75rem', fontWeight: 700,
                          color: tier.accent ? '#000' : 'rgba(255,255,255,0.6)',
                        }}>
                          {ru ? 'Выбрать' : 'Select'}
                        </span>
                        {tier.accent && <ArrowUpRight className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />}
                      </button>
                    </div>
                  </Cin>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════ PROCESS ═══════ */}
          <section className="px-6 py-14" aria-label={ru ? 'Процесс' : 'Process'}>
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
                {ru ? 'От идеи до запуска' : 'From idea to launch'}
              </h2>
            </Cin>

            <div className="relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-px" style={{
                background: `linear-gradient(180deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)`,
              }} />

              {[
                { n: '01', t: ru ? 'Консультация' : 'Consultation', d: ru ? 'Обсуждаем вашу идею, подбираем оптимальное решение. Бесплатно и без обязательств.' : 'Discuss your idea, find the optimal solution. Free and no strings attached.' },
                { n: '02', t: ru ? 'Прототип' : 'Prototype', d: ru ? 'Создаём интерактивный прототип за 24 часа. Вы видите результат до начала разработки.' : 'Create an interactive prototype in 24 hours. You see the result before development starts.' },
                { n: '03', t: ru ? 'Разработка' : 'Development', d: ru ? 'Дизайн, бэкенд, AI-интеграции, платежи — полный цикл за 1–4 недели.' : 'Design, backend, AI integrations, payments — full cycle in 1–4 weeks.' },
                { n: '04', t: ru ? 'Запуск' : 'Launch', d: ru ? 'Деплой в Telegram, обучение команды, подключение аналитики. Поддержка 24/7.' : 'Deploy to Telegram, team training, analytics setup. 24/7 support.' },
              ].map((s, i) => (
                <Cin key={i} delay={i * 0.08}>
                  <div className="flex items-start gap-4 mb-8 last:mb-0 relative">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{
                      background: i === 3 ? `${EMERALD}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${i === 3 ? `${EMERALD}30` : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <span style={{
                        fontFamily: SYNE, fontSize: '0.6875rem', fontWeight: 800,
                        color: i === 3 ? EMERALD : 'rgba(255,255,255,0.25)',
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

          {/* ═══════ COMPARISON ═══════ */}
          <section className="px-6 py-14" aria-label={ru ? 'Сравнение' : 'Comparison'}>
            <Cin>
              <h2 className="mb-6" style={{
                fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
              }}>
                {ru ? <>Обычное приложение<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>vs</span> Telegram App</> : <>Regular App<br /><span style={{ fontFamily: INSTRUMENT, fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>vs</span> Telegram App</>}
              </h2>
            </Cin>

            <div className="space-y-2">
              {[
                { label: ru ? 'Стоимость' : 'Cost', old: ru ? 'от $50K' : 'from $50K', now: ru ? 'от $490' : 'from $490' },
                { label: ru ? 'Срок' : 'Timeline', old: ru ? '3–12 мес' : '3–12 mo', now: ru ? '1–4 нед' : '1–4 wk' },
                { label: ru ? 'Установка' : 'Install', old: ru ? 'App Store' : 'App Store', now: ru ? 'Мгновенно' : 'Instant' },
                { label: ru ? 'Аудитория' : 'Audience', old: ru ? 'Нужен маркетинг' : 'Need marketing', now: '900M+' },
                { label: ru ? 'Обновления' : 'Updates', old: ru ? 'Модерация' : 'Review', now: ru ? 'Мгновенно' : 'Instant' },
                { label: ru ? 'AI-бот' : 'AI Bot', old: ru ? 'Доп. расходы' : 'Extra cost', now: ru ? 'Встроен' : 'Built-in' },
              ].map((row, i) => (
                <Cin key={i} delay={i * 0.03}>
                  <div className="flex items-center rounded-xl py-3 px-4" style={{ background: 'rgba(255,255,255,0.015)' }}>
                    <span className="flex-1" style={{
                      fontFamily: INTER, fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)',
                    }}>{row.label}</span>
                    <span className="w-24 text-center" style={{
                      fontFamily: INTER, fontSize: '0.75rem', fontWeight: 500,
                      color: 'rgba(255,255,255,0.2)', textDecoration: 'line-through',
                    }}>{row.old}</span>
                    <span className="w-24 text-right" style={{
                      fontFamily: SYNE, fontSize: '0.8rem', fontWeight: 700,
                      color: EMERALD,
                    }}>{row.now}</span>
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
              {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe', 'Telegram API', 'OpenAI', 'Docker'].map((tech, i) => (
                <span key={i} style={{
                  fontFamily: INTER, fontSize: '0.6875rem', fontWeight: 500,
                  color: 'rgba(255,255,255,0.2)', letterSpacing: '0.02em',
                }}>{tech}</span>
              ))}
            </div>
          </Cin>

          {/* ═══════ FINAL CTA ═══════ */}
          <section className="px-6 pt-6 pb-8" aria-label="CTA">
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
                    {ru ? 'Готовы начать?' : 'Ready to start?'}
                  </h2>
                  <p className="mt-3 mx-auto" style={{
                    maxWidth: 300,
                    fontFamily: INTER, fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.4)', lineHeight: 1.55,
                  }}>
                    {ru ? 'Бесплатная консультация. Прототип за 24 часа. Запуск за неделю.' : 'Free consultation. Prototype in 24 hours. Launch in a week.'}
                  </p>

                  <button
                    onClick={() => nav('constructor')}
                    className="mt-6 inline-flex items-center gap-2 rounded-full px-7 transition-all duration-500 active:scale-[0.96]"
                    style={{ height: 48, background: '#fff' }}
                  >
                    <span style={{ fontFamily: SYNE, fontSize: '0.8125rem', fontWeight: 700, color: '#000' }}>
                      {ru ? 'Создать приложение' : 'Build Your App'}
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
