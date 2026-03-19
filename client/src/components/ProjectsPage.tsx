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

const AppCard = memo(({ app, onOpenDemo, t, index }: { app: any, onOpenDemo: (id: string) => void, t: any, index: number }) => {
  const handleCardClick = () => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    } catch (e) {}
    onOpenDemo(app.id);
  };

  return (
    <Cin delay={index * 0.03}>
      <div
        onClick={handleCardClick}
        className="app-card group cursor-pointer overflow-hidden transition-all duration-500 active:scale-[0.97]"
        style={{
          position: 'relative',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.02)',
        }}
        data-testid={`card-app-${app.id}`}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: 'inherit' }}>
          <div className="app-card-img" style={{
            position: 'absolute',
            top: '-40%',
            right: '-25%',
            width: '75%',
            height: '180%',
            backgroundImage: `url(${app.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.08,
            transform: 'rotate(-15deg) scale(1)',
            filter: 'blur(0.5px) saturate(0.5)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(110deg, rgba(10,10,10,1) 35%, rgba(10,10,10,0.7) 65%, rgba(10,10,10,0.4) 100%)',
          }} />
          <div className="app-card-shine" style={{
            position: 'absolute',
            top: 0, left: '-100%',
            width: '50%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
            transform: 'skewX(-15deg)',
            transition: 'left 0.8s ease',
          }} />
        </div>

        <div className="relative z-10 flex items-center gap-4" style={{ padding: '16px 18px' }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: 12,
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <img
              src={app.image}
              alt=""
              loading="lazy"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.9)',
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              data-testid={`text-title-${app.id}`}
              style={{
                fontFamily: SYNE,
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#fff',
                marginBottom: 2,
              }}
            >
              {app.title}
            </h3>
            <p
              data-testid={`text-description-${app.id}`}
              style={{
                fontFamily: INTER,
                fontSize: '0.68rem',
                lineHeight: '1.4',
                color: 'rgba(255,255,255,0.35)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {t(`projectsPage.appDescriptions.${app.id}`) || app.description}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <FavoriteButton demoId={app.id} size="md" />
            <div
              className="flex items-center justify-center"
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                transition: 'background 0.3s ease',
              }}
              data-testid={`button-open-${app.id}`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.55)' }} strokeWidth={2} />
            </div>
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
          <header className="relative px-6 pt-6 pb-10 overflow-hidden">
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
        .app-card:hover .app-card-img,
        .app-card:active .app-card-img {
          opacity: 0.18 !important;
          transform: rotate(-15deg) scale(1.05) !important;
        }
        .app-card:hover .app-card-shine {
          left: 120% !important;
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
