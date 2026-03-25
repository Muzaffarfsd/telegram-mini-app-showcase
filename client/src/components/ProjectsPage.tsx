import { memo, useMemo, useRef, useState, useEffect } from "react";
import { demoApps } from "../data/demoApps";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { FavoritesSection } from "./FavoritesSection";
import { FavoriteButton } from "./FavoriteButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { VerticalImageStack, type VerticalImageItem } from "@/components/ui/vertical-image-stack";
import { m, useInView } from "@/utils/LazyMotionProvider";

interface ProjectsPageProps {
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

const CATEGORIES_RU = ['Все', 'E-Commerce', 'Финтех', 'Еда', 'Букинг', 'AI', 'Крипто'];
const CATEGORIES_EN = ['All', 'E-Commerce', 'Fintech', 'Food', 'Booking', 'AI', 'Crypto'];

const APP_ICONS: Record<string, { emoji: string; grad: string }> = {
  'clothing-store':    { emoji: '👗', grad: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  'electronics':       { emoji: '⚡', grad: 'linear-gradient(135deg, #0a1628, #1a2744)' },
  'beauty':            { emoji: '✨', grad: 'linear-gradient(135deg, #1e0a1e, #2a1230)' },
  'restaurant':        { emoji: '🍽', grad: 'linear-gradient(135deg, #1a1408, #2a2010)' },
  'luxury-watches':    { emoji: '⌚', grad: 'linear-gradient(135deg, #1a1610, #2a2418)' },
  'sneaker-store':     { emoji: '👟', grad: 'linear-gradient(135deg, #0a1a0a, #142814)' },
  'luxury-perfume':    { emoji: '🌸', grad: 'linear-gradient(135deg, #1e0a18, #2a1224)' },
  'futuristic-fashion-1': { emoji: '🔮', grad: 'linear-gradient(135deg, #120a1e, #1a1230)' },
  'futuristic-fashion-2': { emoji: '🖤', grad: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)' },
  'futuristic-fashion-3': { emoji: '◻️', grad: 'linear-gradient(135deg, #121212, #1e1e1e)' },
  'futuristic-fashion-4': { emoji: '💎', grad: 'linear-gradient(135deg, #0a0e1a, #141e30)' },
  'florist':           { emoji: '🌺', grad: 'linear-gradient(135deg, #1a0e10, #2a1618)' },
  'medical':           { emoji: '🏥', grad: 'linear-gradient(135deg, #0a1a1a, #0e2828)' },
};
const DEFAULT_ICON = { emoji: '📱', grad: 'linear-gradient(135deg, #111, #1a1a1a)' };

const AppCard = memo(({ app, onOpenDemo, t, index }: { app: any, onOpenDemo: (id: string) => void, t: any, index: number }) => {
  const handleCardClick = () => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    } catch (e) {}
    onOpenDemo(app.id);
  };

  const icon = APP_ICONS[app.id] || DEFAULT_ICON;

  return (
    <Cin delay={index * 0.04}>
      <div
        onClick={handleCardClick}
        className="app-card group cursor-pointer active:scale-[0.97]"
        style={{
          position: 'relative',
          borderRadius: 24,
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        data-testid={`card-app-${app.id}`}
      >
        <div className="app-card-glass absolute inset-0 pointer-events-none" style={{
          borderRadius: 'inherit',
          background: `linear-gradient(165deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.05) 100%)`,
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 24px -6px rgba(0,0,0,0.3)',
        }} />

        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: 'inherit' }}>
          <div className="app-card-shine" style={{
            position: 'absolute',
            top: 0, left: '-130%',
            width: '70%', height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
            transform: 'skewX(-18deg) translateZ(0)',
            willChange: 'left',
          }} />
        </div>

        <div className="relative z-10 flex items-center gap-4" style={{ padding: '18px 20px' }}>
          <div className="flex-1 min-w-0">
            <h3
              data-testid={`text-title-${app.id}`}
              style={{
                fontFamily: SYNE,
                fontSize: '0.9rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'rgba(255,255,255,0.95)',
                marginBottom: 4,
              }}
            >
              {app.title}
            </h3>
            <p
              data-testid={`text-description-${app.id}`}
              style={{
                fontFamily: INTER,
                fontSize: '0.7rem',
                lineHeight: '1.45',
                color: 'rgba(255,255,255,0.4)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {t(`projectsPage.appDescriptions.${app.id}`) || app.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <FavoriteButton demoId={app.id} size="md" />
            <button
              className="app-card-btn flex items-center gap-1.5 active:scale-[0.95]"
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
              data-testid={`button-open-${app.id}`}
            >
              <span style={{
                fontFamily: INTER,
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '-0.01em',
              }}>
                {t('projectsPage.open')}
              </span>
              <ArrowUpRight className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.45)' }} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </Cin>
  );
});

AppCard.displayName = 'AppCard';

const verticalImageItems: VerticalImageItem[] = [
  { id: 1, src: "/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg", alt: "Radiance — Premium fashion" },
  { id: 2, src: "/attached_assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg", alt: "Nike Destiny — Sportswear" },
  { id: 3, src: "/attached_assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg", alt: "Nike Green — Sustainable" },
  { id: 4, src: "/attached_assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg", alt: "Rascal — Urban streetwear" },
  { id: 5, src: "/attached_assets/82a7adf27f8d0e1758ca0f797349db48_1763719506416.jpg", alt: "Studio Collection" },
];

export default memo(function ProjectsPage({ onNavigate, onOpenDemo }: ProjectsPageProps) {
  const { t, language } = useLanguage();
  const ru = language === 'ru';
  const topApps = useMemo(() => demoApps, []);
  const [activeCat, setActiveCat] = useState(0);
  const categories = ru ? CATEGORIES_RU : CATEGORIES_EN;

  return (
    <div
      className="min-h-screen select-none overflow-x-hidden"
      style={{ backgroundColor: '#050505' }}
    >
      <div className="relative z-10">
        <div className="mx-auto w-full" style={{ maxWidth: 540 }}>

          {/* ═══════ HERO ═══════ */}
          <header className="relative px-6 pt-32 pb-10 overflow-hidden">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute inset-0" style={{
                background: `radial-gradient(ellipse at 50% 0%, ${EMERALD}06 0%, transparent 60%)`,
              }} />
            </div>

            <div className="relative z-10">
              <m.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                style={{
                  fontFamily: SYNE,
                  fontSize: 'clamp(1.8rem, 7vw, 2.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 1.1,
                  color: '#fff',
                }}
              >
                {t('projectsPage.heroLine1')}
                <br />
                <span style={{
                  fontFamily: INSTRUMENT, fontStyle: 'italic',
                  background: `linear-gradient(135deg, ${EMERALD}, #a7f3d0)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {t('projectsPage.heroLine2')}
                </span>
                <br />
                {t('projectsPage.heroLine3')}
              </m.h1>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
                className="mt-8 flex items-center gap-5"
              >
                <div className="scroll-line-indicator">
                  <div className="scroll-line-track" />
                  <div className="scroll-line-glow" />
                </div>
                <span style={{
                  fontFamily: SYNE, fontSize: '0.7rem',
                  fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                  color: 'rgba(255,255,255,0.45)',
                }}>
                  {t('projectsPage.viewExamples')}
                </span>
              </m.div>

            </div>
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
                    ? ['22 приложения', 'Премиум дизайн', 'E-Commerce', 'AI-боты', 'Финтех', 'Доставка', 'Бронирование']
                    : ['22 Apps', 'Premium Design', 'E-Commerce', 'AI Bots', 'Fintech', 'Delivery', 'Booking']
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

          {/* ═══════ IMAGE STACK ═══════ */}
          <section className="px-4 py-10">
            <Cin className="mb-4 px-2">
              <span style={{
                fontFamily: SYNE, fontSize: '0.6875rem',
                fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.25)',
              }}>
                {t('projectsPage.projects')}
              </span>
            </Cin>
            <Cin delay={0.1}>
              <VerticalImageStack
                images={verticalImageItems}
                height={480}
                cardWidth={260}
                cardHeight={380}
              />
            </Cin>
          </section>

          {/* ═══════ SOCIAL PROOF STRIP ═══════ */}
          <Cin className="px-6 pb-10">
            <div className="flex items-center justify-between py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                { l: ru ? 'проектов' : 'projects' },
                { l: ru ? 'индустрий' : 'industries' },
                { l: ru ? 'дней до запуска' : 'days to launch' },
              ].map((s, i) => (
                <div key={i} className="text-center flex-1">
                  <div style={{
                    fontFamily: SYNE, fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
                    fontWeight: 800, color: '#fff', letterSpacing: '-0.04em',
                  }}>
                    {i === 0 ? <Ct to={50} suffix="+" /> : i === 1 ? <Ct to={6} /> : <Ct to={14} />}
                  </div>
                  <div style={{
                    fontFamily: INTER, fontSize: '0.625rem', fontWeight: 500,
                    color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em', textTransform: 'uppercase' as const, marginTop: 2,
                  }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Cin>

          {/* ═══════ FAVORITES ═══════ */}
          <div className="py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <FavoritesSection onOpenDemo={onOpenDemo} />
          </div>

          {/* ═══════ APP COLLECTION ═══════ */}
          <section className="px-6 py-10">
            <Cin>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 style={{
                    fontFamily: SYNE, fontSize: 'clamp(1.4rem, 5vw, 1.875rem)',
                    fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.1,
                  }}>
                    {ru ? 'Все проекты' : 'All Projects'}
                  </h2>
                  <p className="mt-1" style={{
                    fontFamily: INTER, fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                    color: 'rgba(255,255,255,0.45)',
                  }}>
                    {topApps.length} {t('projectsPage.projectsCount')}
                  </p>
                </div>
              </div>
            </Cin>

            <div className="space-y-2.5">
              {topApps.map((app, i) => (
                <AppCard key={app.id} app={app} onOpenDemo={onOpenDemo} t={t} index={i} />
              ))}
            </div>
          </section>

          {/* ═══════ QUOTE + CTA ═══════ */}
          <section className="px-6 pt-6 pb-8" aria-label="CTA">
            <Cin>
              <div className="relative overflow-hidden rounded-2xl py-12 px-6 text-center" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse at 50% 120%, ${EMERALD}0c 0%, transparent 70%)`,
                }} />

                <div className="relative z-10">
                  <p className="mx-auto mb-6" style={{
                    maxWidth: 300,
                    fontFamily: INSTRUMENT, fontSize: '1.05rem',
                    fontStyle: 'italic', lineHeight: 1.55,
                    color: 'rgba(255,255,255,0.5)',
                  }}>
                    "{t('projectsPage.pullQuote')}"
                  </p>

                  <a
                    href="https://t.me/web4tgs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-7 transition-all duration-500 active:scale-[0.96]"
                    style={{
                      height: 48,
                      background: '#fff',
                      textDecoration: 'none',
                    }}
                    data-testid="button-order-cta"
                  >
                    <span style={{ fontFamily: SYNE, fontSize: '0.8125rem', fontWeight: 700, color: '#000' }}>
                      {t('projectsPage.requestConsultation')}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </a>

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

      <style>{`
        .app-card-shine {
          display: none;
        }
        .scroll-line-indicator {
          position: relative;
          width: 1px;
          height: 48px;
          overflow: hidden;
        }
        .scroll-line-track {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.08);
        }
        .scroll-line-glow {
          position: absolute;
          top: -100%;
          left: -1px;
          width: 3px;
          height: 50%;
          background: linear-gradient(to bottom, transparent, ${EMERALD}, transparent);
          border-radius: 2px;
          animation: lineTravel 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          filter: blur(0.5px);
          box-shadow: 0 0 6px rgba(52,211,153,0.4);
        }
        @keyframes lineTravel {
          0% { top: -50%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
});
