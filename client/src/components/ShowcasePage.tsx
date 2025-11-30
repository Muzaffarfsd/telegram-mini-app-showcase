import { ArrowRight, Play, ArrowUpRight, Sparkles } from "lucide-react";
import { useCallback, useRef, useState, useEffect } from "react";
import { m, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoPreload } from '../hooks/useVideoPreload';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { preloadDemo } from './demos/DemoRegistry';
import { demoApps } from '../data/demoApps';

const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const spring = { type: "spring", stiffness: 400, damping: 30 };
const smooth = [0.25, 0.1, 0.25, 1];
const snappy = [0.16, 1, 0.3, 1];

function PremiumButton({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = "",
  testId
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  className?: string;
  testId?: string;
}) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const styles = {
    primary: {
      bg: '#FFFFFF',
      color: '#000000',
      border: 'none',
      shadow: hovered ? '0 8px 32px rgba(255,255,255,0.2)' : '0 4px 20px rgba(255,255,255,0.1)'
    },
    secondary: {
      bg: 'rgba(255,255,255,0.08)',
      color: 'rgba(255,255,255,0.9)',
      border: '1px solid rgba(255,255,255,0.12)',
      shadow: hovered ? '0 4px 20px rgba(255,255,255,0.05)' : 'none'
    },
    ghost: {
      bg: 'transparent',
      color: 'rgba(255,255,255,0.6)',
      border: '1px solid rgba(255,255,255,0.1)',
      shadow: 'none'
    }
  };

  const s = styles[variant];

  return (
    <m.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      data-testid={testId}
      className={className}
      animate={{
        scale: pressed ? 0.97 : hovered ? 1.02 : 1,
        y: pressed ? 1 : 0
      }}
      transition={spring}
      style={{
        background: s.bg,
        color: s.color,
        border: s.border,
        boxShadow: s.shadow,
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        padding: '14px 24px',
        borderRadius: '14px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'box-shadow 0.3s ease'
      }}
    >
      {children}
    </m.button>
  );
}

function FloatingOrb({ delay = 0, size = 100, x, y }: { 
  delay?: number; 
  size?: number;
  x: string;
  y: string;
}) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.4, 0.2],
        scale: [0, 1.1, 1],
      }}
      transition={{ 
        delay,
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }}
    />
  );
}

function Counter({ value, suffix = '' }: { value: number | string; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView && typeof value === 'number') {
      const duration = 1200;
      const start = Date.now();
      const animate = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setDisplay(Math.floor(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }
  }, [inView, value]);

  return <span ref={ref}>{typeof value === 'number' ? display : value}{suffix}</span>;
}

function VideoCard({ 
  video, 
  index, 
  active, 
  onHover, 
  onLeave, 
  onClick 
}: { 
  video: { id: string; ref: any; src: string; title: string; cat: string };
  index: number;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.12, duration: 0.7, ease: snappy }}
      className="cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => { preloadDemo(video.id); onHover(); }}
      onMouseLeave={onLeave}
      onTouchStart={() => preloadDemo(video.id)}
      data-testid={`demo-card-${video.id}`}
    >
      <m.div 
        className="relative overflow-hidden"
        style={{ borderRadius: '20px' }}
        animate={{
          scale: active ? 1.015 : 1,
          boxShadow: active 
            ? '0 24px 48px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)' 
            : '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)'
        }}
        transition={spring}
      >
        <div style={{ aspectRatio: '16/9', position: 'relative' }}>
          <video
            ref={video.ref}
            src={video.src}
            loop muted playsInline preload="none"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: active ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
          
          <div 
            className="absolute inset-0 transition-all duration-500"
            style={{ 
              background: `linear-gradient(180deg, 
                rgba(0,0,0,${active ? 0 : 0.15}) 0%,
                rgba(0,0,0,${active ? 0.2 : 0.35}) 50%,
                rgba(0,0,0,${active ? 0.6 : 0.8}) 100%)`
            }}
          />

          <AnimatePresence>
            {active && (
              <m.div 
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25, ease: snappy }}
              >
                <div style={{
                  width: '60px', height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Play className="w-6 h-6 text-white ml-1" fill="white" />
                </div>
              </m.div>
            )}
          </AnimatePresence>
          
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <m.div 
              className="flex items-end justify-between"
              animate={{ y: active ? -2 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <div>
                <p style={{
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
                  marginBottom: '4px', transition: 'color 0.3s'
                }}>
                  {video.cat}
                </p>
                <h3 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: '#FFF' }}>
                  {video.title}
                </h3>
              </div>
              <m.div animate={{ x: active ? 3 : 0, opacity: active ? 1 : 0.4 }} transition={{ duration: 0.25 }}>
                <ArrowUpRight className="w-5 h-5 text-white" />
              </m.div>
            </m.div>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const { } = useTelegram();
  const haptic = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  
  const videoRef1 = useVideoPreload();
  const videoRef2 = useVideoPreload();
  const videoRef3 = useVideoLazyLoad();
  
  useEffect(() => { setReady(true); }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  
  const openDemo = useCallback((id: string) => { haptic.light(); onOpenDemo(id); }, [haptic, onOpenDemo]);
  const contact = useCallback(() => { haptic.medium(); onNavigate('contact'); }, [haptic, onNavigate]);

  const videos = [
    { id: 'sneaker-store', ref: videoRef1, src: sneakerVideo, title: 'SneakerVault', cat: 'Кроссовки' },
    { id: 'luxury-watches', ref: videoRef2, src: watchesVideo, title: 'TimeElite', cat: 'Часы' },
    { id: 'clothing-store', ref: videoRef3, src: fashionVideo, title: 'Radiance', cat: 'Мода' },
  ];

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: '#000' }}>
      <div 
        ref={containerRef}
        className="w-full relative overflow-x-hidden"
        style={{ 
          maxWidth: '430px',
          background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        {/* ══════════ A - ATTENTION ══════════ */}
        <m.section 
          className="relative px-5 pt-6 pb-8"
          style={{ opacity: heroOpacity }}
        >
          <FloatingOrb delay={0} size={150} x="75%" y="5%" />
          <FloatingOrb delay={0.5} size={100} x="-10%" y="30%" />

          {/* Grid bg */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
          />

          <div className="relative z-10">
            {/* Label */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={ready ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6, ease: snappy }}
              className="flex items-center gap-2 mb-10"
            >
              <span style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{
                fontSize: '9px', fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)'
              }} data-testid="text-label">
                WEB4TG STUDIO
              </span>
            </m.div>

            {/* Hero Text */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8, ease: snappy }}
              className="mb-5"
            >
              <h1 style={{
                fontSize: '56px', fontWeight: 700, letterSpacing: '-0.04em',
                lineHeight: 0.9, color: '#FFF', marginBottom: '4px'
              }} data-testid="text-hero-main">
                Sell
              </h1>
              <div className="flex items-center gap-2">
                <span style={{
                  fontSize: '56px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.9,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }} data-testid="text-hero-sub">
                  24/7
                </span>
                <m.div
                  initial={{ opacity: 0, scale: 0, rotate: -20 }}
                  animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                  transition={{ delay: 0.7, duration: 0.5, ease: snappy }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </m.div>
              </div>
            </m.div>

            {/* Description */}
            <m.p
              initial={{ opacity: 0 }}
              animate={ready ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                fontSize: '15px', fontWeight: 400, lineHeight: 1.5,
                color: 'rgba(255,255,255,0.4)', maxWidth: '280px', marginBottom: '28px'
              }}
              data-testid="text-hero-description"
            >
              Telegram Mini Apps, которые превращают подписчиков в покупателей
            </m.p>

            {/* Buttons */}
            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6, ease: snappy }}
              className="flex flex-col gap-3"
            >
              <PremiumButton 
                variant="primary" 
                onClick={() => {
                  haptic.light();
                  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
                }}
                testId="button-view-demo"
                className="w-full"
              >
                Смотреть примеры
                <ArrowRight className="w-4 h-4" />
              </PremiumButton>

              <PremiumButton 
                variant="secondary" 
                onClick={contact}
                testId="button-contact"
                className="w-full"
              >
                Обсудить проект
              </PremiumButton>
            </m.div>
          </div>
        </m.section>

        {/* ══════════ I - INTEREST ══════════ */}
        <section id="work" className="px-4 pt-12 pb-10">
          <m.div 
            className="mb-6 px-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
              <p style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)'
              }}>
                Портфолио
              </p>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.025em', color: '#FFF' }}>
              Наши работы
            </h2>
          </m.div>

          <div className="space-y-4">
            {videos.map((v, i) => (
              <VideoCard
                key={v.id}
                video={v}
                index={i}
                active={activeCard === i}
                onHover={() => setActiveCard(i)}
                onLeave={() => setActiveCard(null)}
                onClick={() => openDemo(v.id)}
              />
            ))}
          </div>

          {/* Grid */}
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6"
          >
            <p style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
              marginBottom: '10px', paddingLeft: '2px'
            }}>
              Ещё проекты
            </p>
            
            <div className="grid grid-cols-2 gap-2.5">
              {demoApps.slice(3, 7).map((app, i) => (
                <m.div
                  key={app.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: snappy }}
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => openDemo(app.id)}
                  onMouseEnter={() => preloadDemo(app.id)}
                  className="cursor-pointer"
                  data-testid={`demo-card-${app.id}`}
                >
                  <div 
                    className="relative overflow-hidden"
                    style={{
                      borderRadius: '14px', aspectRatio: '1/1',
                      background: 'rgba(255,255,255,0.02)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)'
                    }}
                  >
                    {app.image && (
                      <img src={app.image} alt={app.title} loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0" style={{ 
                      background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)' 
                    }} />
                    <div className="absolute bottom-2.5 left-2.5">
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>{app.title}</p>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>

          <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-5">
            <PremiumButton variant="ghost" onClick={() => onNavigate('projects')} testId="button-view-all" className="w-full">
              Все проекты <ArrowRight className="w-4 h-4" />
            </PremiumButton>
          </m.div>
        </section>

        {/* ══════════ D - DESIRE ══════════ */}
        <section className="px-4 py-14">
          <m.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: snappy }}
            className="text-center mb-10"
          >
            <p style={{
              fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.3, color: '#FFF'
            }} data-testid="text-quote">
              Бизнес, который<br/>
              <span style={{ 
                background: 'linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>никогда не спит</span>
            </p>
          </m.div>

          <m.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
              background: 'rgba(255,255,255,0.05)', borderRadius: '18px', overflow: 'hidden'
            }}
          >
            {[
              { val: 50, suf: '+', label: 'Проектов' },
              { val: 14, suf: '', label: 'Дней' },
              { val: '24/7', suf: '', label: 'Онлайн' }
            ].map((s, i) => (
              <div key={s.label} className="text-center" style={{ padding: '24px 8px', background: '#080808' }}>
                <p style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.03em', color: '#FFF', marginBottom: '4px' }}>
                  {typeof s.val === 'number' ? <Counter value={s.val} suffix={s.suf} /> : s.val}
                </p>
                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </m.div>
        </section>

        {/* ══════════ A - ACTION ══════════ */}
        <section className="px-4 py-16">
          <m.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: snappy }}
            className="text-center"
          >
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-5"
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '100px', padding: '6px 14px'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80' }} />
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>
                Свободны для проектов
              </span>
            </m.div>

            <h2 style={{
              fontSize: '40px', fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1, color: '#FFF', marginBottom: '6px'
            }} data-testid="text-cta-title">
              Start
            </h2>
            <p style={{
              fontSize: '40px', fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1, marginBottom: '16px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              today.
            </p>
            
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '28px' }}>
              Бесплатная консультация
            </p>

            <PremiumButton variant="primary" onClick={contact} testId="button-cta-contact" className="w-full">
              Написать в Telegram <ArrowRight className="w-4 h-4" />
            </PremiumButton>

            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '16px' }}>
              Ответ в течение часа
            </p>
          </m.div>
        </section>

        {/* Footer */}
        <footer className="px-4 py-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.15)' }}>
            WEB4TG STUDIO · 2025
          </p>
        </footer>

        <div style={{ height: '90px' }} />
      </div>
    </div>
  );
}

export default ShowcasePage;
