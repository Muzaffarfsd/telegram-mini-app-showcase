import { ArrowRight, ChevronRight, Play } from "lucide-react";
import { useCallback, memo, useRef, useState, useEffect } from "react";
import { m, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import { useHaptic } from '../hooks/useHaptic';
import { preloadDemo } from './demos/DemoRegistry';

const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const spring = { type: "spring", stiffness: 400, damping: 30 };
const smoothSpring = { type: "spring", stiffness: 100, damping: 20 };

const AnimatedCounter = memo(({ value, suffix = '' }: { value: string; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    if (!isInView) return;
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    const duration = 1200;
    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = numericValue * eased;
      
      if (value.includes('.')) {
        setDisplayValue(currentValue.toFixed(1));
      } else {
        setDisplayValue(Math.floor(currentValue).toString());
      }
      
      if (current >= steps) {
        clearInterval(timer);
        setDisplayValue(value.replace(/[^0-9.]/g, ''));
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [isInView, value]);
  
  return <span ref={ref}>{displayValue}{suffix}</span>;
});

const PremiumVideoCard = memo(({ 
  video, 
  title, 
  subtitle, 
  onClick,
  onHoverStart,
  index 
}: { 
  video: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  onHoverStart: () => void;
  index: number;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [4, -4]), smoothSpring);
  const rotateY = useSpring(useTransform(x, [-100, 100], [-4, 4]), smoothSpring);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  }, [x, y]);
  
  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [x, y]);
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHoverStart();
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [onHoverStart]);

  return (
    <m.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ 
        rotateX, 
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-[3/4] rounded-[20px] overflow-hidden cursor-pointer group"
      data-testid={`card-video-${index}`}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video}
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
        style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
      />
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{ 
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
          opacity: isHovered ? 0.9 : 1
        }}
      />
      
      {/* Glass effect on hover */}
      <m.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)'
        }}
      />
      
      {/* Play indicator */}
      <m.div 
        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300"
        style={{ 
          background: 'rgba(255,255,255,0.15)',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scale(1)' : 'scale(0.8)'
        }}
      >
        <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
      </m.div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <m.div
          animate={{ y: isHovered ? -4 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h3 
            className="mb-1"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontSize: '17px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: '#fff'
            }}
          >
            {title}
          </h3>
          <p style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.6)'
          }}>
            {subtitle}
          </p>
        </m.div>
      </div>
      
      {/* Border glow on hover */}
      <div 
        className="absolute inset-0 rounded-[20px] pointer-events-none transition-opacity duration-500"
        style={{ 
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
          opacity: isHovered ? 1 : 0.5
        }}
      />
    </m.div>
  );
});

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const haptic = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -30]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const handleCTA = useCallback(() => {
    haptic.medium();
    onNavigate('constructor');
  }, [haptic, onNavigate]);

  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  return (
    <div ref={containerRef} className="min-h-screen text-[#f5f5f7] relative overflow-x-hidden" style={{ background: '#000', position: 'relative' }}>
      
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: 'overlay'
        }}
      />
      
      <div className="max-w-[430px] mx-auto relative">
        
        {/* ═══════════════════════════════════════════════════════════════
            HERO — Maximum Impact
        ═══════════════════════════════════════════════════════════════ */}
        <m.section 
          style={{ y: heroY, opacity: heroOpacity }}
          className="px-7 pt-32 pb-20"
        >
          {/* Badge */}
          <m.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-6"
          >
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ 
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#34d399' }}
              />
              <span style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.02em',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Открыт набор
              </span>
            </span>
          </m.div>

          {/* Headline */}
          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-6"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontSize: '48px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1.04
            }}
          >
            <span style={{ color: '#f5f5f7' }}>Telegram-</span>
            <br />
            <span style={{ color: '#f5f5f7' }}>магазин,</span>
            <br />
            <span 
              style={{ 
                background: 'linear-gradient(135deg, #86868b 0%, #a1a1a6 50%, #86868b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              который
            </span>
            <br />
            <span 
              style={{ 
                background: 'linear-gradient(135deg, #86868b 0%, #a1a1a6 50%, #86868b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              запомнят.
            </span>
          </m.h1>

          {/* Subheadline */}
          <m.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-10"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '17px',
              fontWeight: 400,
              lineHeight: 1.53,
              color: '#86868b',
              maxWidth: '300px'
            }}
          >
            Премиальные мини-приложения для брендов, которые ценят детали.
          </m.p>

          {/* CTA Buttons */}
          <m.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-4"
          >
            {/* Primary CTA with glow */}
            <m.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              onClick={handleCTA}
              className="relative w-full h-[54px] rounded-full flex items-center justify-center gap-2 overflow-hidden group"
              style={{ 
                background: '#f5f5f7',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '17px',
                fontWeight: 500,
                color: '#000'
              }}
              data-testid="button-cta-hero"
            >
              {/* Shimmer effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  animation: 'shimmer 2s infinite'
                }}
              />
              <span className="relative z-10">Оставить заявку</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </m.button>
            
            {/* Secondary CTA */}
            <m.button
              whileHover={{ opacity: 0.7 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleOpenDemo('clothing-store')}
              className="w-full flex items-center justify-center gap-1 py-3"
              style={{ 
                color: '#2997ff',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '17px',
                fontWeight: 400
              }}
              data-testid="button-demo"
            >
              Смотреть демо
              <ChevronRight className="w-4 h-4" />
            </m.button>
          </m.div>
        </m.section>

        {/* ═══════════════════════════════════════════════════════════════
            PORTFOLIO — Premium Video Cards
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-5 pb-20">
          {/* Section label */}
          <m.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-5 px-2"
          >
            <span style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: '#86868b',
              textTransform: 'uppercase'
            }}>
              Портфолио
            </span>
          </m.div>

          {/* Video cards grid */}
          <div className="grid grid-cols-2 gap-3">
            <PremiumVideoCard
              video={sneakerVideo}
              title="Sneaker Vault"
              subtitle="Дропы и релизы"
              onClick={() => handleOpenDemo('sneaker-store')}
              onHoverStart={() => preloadDemo('sneaker-store')}
              index={0}
            />
            <PremiumVideoCard
              video={watchesVideo}
              title="Time Elite"
              subtitle="Luxury коллекции"
              onClick={() => handleOpenDemo('luxury-watches')}
              onHoverStart={() => preloadDemo('luxury-watches')}
              index={1}
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            VALUE PROPOSITION — Three Pillars
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-7 py-20">
          <div className="space-y-16">
            {[
              { 
                title: '14 дней',
                subtitle: 'до запуска.',
                desc: 'От концепции до работающего приложения.'
              },
              { 
                title: 'AI-консьерж',
                subtitle: '24/7.',
                desc: 'Знает каталог. Отвечает за 2 секунды.'
              },
              { 
                title: '+280%',
                subtitle: 'к продажам.',
                desc: 'Средний результат в первый квартал.'
              },
            ].map((item, i) => (
              <m.div 
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <h2 style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  fontSize: '32px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  color: '#f5f5f7',
                  marginBottom: '4px'
                }}>
                  {item.title}
                  <br />
                  <span style={{ color: '#86868b' }}>{item.subtitle}</span>
                </h2>
                <p style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '15px',
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: '#6e6e73',
                  marginTop: '12px'
                }}>
                  {item.desc}
                </p>
              </m.div>
            ))}
          </div>
        </section>

        {/* Elegant divider */}
        <div className="mx-7">
          <div 
            className="h-px"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)' }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            METRICS — Social Proof
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-7 py-16">
          <m.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-3 gap-6"
          >
            {[
              { value: '127', suffix: '+', label: 'проектов' },
              { value: '98', suffix: '%', label: 'довольны' },
              { value: '2.8', suffix: '×', label: 'рост' },
            ].map((stat, i) => (
              <m.div 
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  fontSize: '28px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#f5f5f7',
                  marginBottom: '4px'
                }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#6e6e73'
                }}>
                  {stat.label}
                </div>
              </m.div>
            ))}
          </m.div>
        </section>

        {/* Elegant divider */}
        <div className="mx-7">
          <div 
            className="h-px"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)' }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TESTIMONIAL — Trust
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-7 py-16">
          <m.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <blockquote>
              <p style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontSize: '22px',
                fontWeight: 400,
                lineHeight: 1.36,
                color: '#f5f5f7',
                fontStyle: 'italic',
                marginBottom: '16px'
              }}>
                «Лучший UX в Telegram. Окупились за первый месяц.»
              </p>
              <footer>
                <cite style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  color: '#6e6e73'
                }}>
                  Анна Козлова
                  <span style={{ color: '#424245' }}> — </span>
                  <span style={{ color: '#86868b' }}>MODA HOUSE</span>
                </cite>
              </footer>
            </blockquote>
          </m.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FINAL CTA — Close
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-7 py-20">
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h2 style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontSize: '36px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: '#f5f5f7',
              marginBottom: '12px'
            }}>
              Начните сегодня.
            </h2>
            <p style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: 1.5,
              color: '#6e6e73',
              marginBottom: '32px',
              maxWidth: '260px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Ответим в течение часа.
              <br />
              Запуск через 14 дней.
            </p>
            
            <m.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              onClick={handleCTA}
              className="w-full h-[54px] rounded-full flex items-center justify-center gap-2"
              style={{ 
                background: '#f5f5f7',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '17px',
                fontWeight: 500,
                color: '#000'
              }}
              data-testid="button-cta-final"
            >
              Оставить заявку
              <ArrowRight className="w-4 h-4" />
            </m.button>
          </m.div>
        </section>

        {/* Footer */}
        <footer className="px-7 py-12 text-center">
          <p style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.02em',
            color: '#424245'
          }}>
            WEB4TG STUDIO
          </p>
        </footer>

        <div className="h-8" />
      </div>
      
      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export default memo(ShowcasePage);
