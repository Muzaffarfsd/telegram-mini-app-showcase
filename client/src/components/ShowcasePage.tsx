import { ArrowRight, Play } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useHaptic } from '../hooks/useHaptic';
import { LazyVideo } from './LazyVideo';

const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";
const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const heroVideo = "/videos/1341996d8f73172cbc77930dc818d88e_t4_1763643600785.mp4";

/* ═══════════════════════════════════════════════════════════════════════
   APPLE DESIGN SYSTEM - Exact specifications
   ═══════════════════════════════════════════════════════════════════════ */
const APPLE = {
  colors: {
    black: '#050505',
    surface: '#0F0F10',
    white: '#FFFFFF',
    gray1: '#F5F5F7',
    gray2: '#86868B',
    gray3: '#48484A',
    blue: '#2997FF',
    border: 'rgba(255, 255, 255, 0.12)'
  },
  spacing: {
    section: 'clamp(120px, 18vw, 160px)',
    container: '1200px'
  },
  transition: {
    reveal: 'opacity 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    hover: 'opacity 0.24s ease'
  }
} as const;

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const haptic = useHaptic();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['hero']));
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Scroll reveal observer
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setVisibleSections(new Set(['hero', 'credibility', 'stage', 'process', 'cta']));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section');
            if (id) {
              setVisibleSections((prev) => new Set(Array.from(prev).concat(id)));
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setSectionRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const handleNavigate = useCallback((section: string) => {
    haptic.medium();
    onNavigate(section);
  }, [haptic, onNavigate]);

  const videos = [
    { src: heroVideo, id: 'fashion-boutique' },
    { src: fashionVideo, id: 'sneaker-store' },
    { src: sneakerVideo, id: 'watches-store' },
    { src: watchesVideo, id: 'restaurant' }
  ];

  return (
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{ 
        backgroundColor: APPLE.colors.black,
        color: APPLE.colors.white,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION A: HERO — Cinematic full-height opening
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('hero')}
        data-section="hero"
        className="relative flex flex-col items-center justify-center"
        style={{
          minHeight: '100dvh',
          padding: '60px 24px 80px',
          background: `
            radial-gradient(ellipse 120% 100% at 50% -30%, rgba(41, 151, 255, 0.08), transparent 60%),
            ${APPLE.colors.black}
          `
        }}
      >
        <div 
          className="text-center w-full"
          style={{
            maxWidth: '720px',
            opacity: isVisible('hero') ? 1 : 0,
            transform: isVisible('hero') ? 'translateY(0)' : 'translateY(12px)',
            transition: APPLE.transition.reveal
          }}
        >
          {/* Eyebrow */}
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: APPLE.colors.gray2,
            marginBottom: '20px'
          }}>
            Telegram Mini Apps
          </p>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(48px, 11vw, 80px)',
            fontWeight: 600,
            lineHeight: 1.0,
            letterSpacing: '-0.035em',
            color: APPLE.colors.white,
            marginBottom: '20px'
          }}>
            Создавайте,
            <br />
            как Apple.
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: '19px',
            fontWeight: 400,
            lineHeight: 1.47,
            letterSpacing: '-0.01em',
            color: APPLE.colors.gray2,
            marginBottom: '40px',
            maxWidth: '380px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Премиальные витрины для Telegram.
            <br />
            Там, где уже ваши клиенты.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => handleNavigate('constructor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: '52px',
                padding: '0 32px',
                fontSize: '17px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: APPLE.colors.black,
                backgroundColor: APPLE.colors.white,
                border: 'none',
                borderRadius: '980px',
                cursor: 'pointer',
                transition: APPLE.transition.hover
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              data-testid="button-hero-primary"
            >
              Запустить проект
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
            
            <button 
              onClick={() => handleNavigate('ai-agent')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: '44px',
                padding: '0 20px',
                fontSize: '17px',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: APPLE.colors.blue,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: APPLE.transition.hover
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              data-testid="button-hero-secondary"
            >
              <Play style={{ width: '14px', height: '14px' }} />
              Посмотреть демо
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION B: CREDIBILITY — Sparse metrics strip
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('credibility')}
        data-section="credibility"
        style={{
          padding: '64px 24px',
          borderTop: `1px solid ${APPLE.colors.border}`,
          borderBottom: `1px solid ${APPLE.colors.border}`,
          backgroundColor: APPLE.colors.black
        }}
      >
        <div 
          className="flex justify-center items-center flex-wrap"
          style={{
            gap: 'clamp(40px, 8vw, 80px)',
            maxWidth: '900px',
            margin: '0 auto',
            opacity: isVisible('credibility') ? 1 : 0,
            transform: isVisible('credibility') ? 'translateY(0)' : 'translateY(12px)',
            transition: APPLE.transition.reveal,
            transitionDelay: '0.1s'
          }}
        >
          {[
            { value: '+327%', label: 'рост продаж' },
            { value: '127', label: 'брендов' },
            { value: '24/7', label: 'AI-поддержка' }
          ].map((stat, i) => (
            <div key={i} className="text-center" style={{ minWidth: '100px' }}>
              <div style={{
                fontSize: 'clamp(32px, 6vw, 44px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: APPLE.colors.white,
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 400,
                color: APPLE.colors.gray2
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION C: VISUAL STAGE — Pure video showcase
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('stage')}
        data-section="stage"
        style={{
          padding: `${APPLE.spacing.section} 20px`,
          backgroundColor: APPLE.colors.black
        }}
      >
        {/* Section title */}
        <div 
          className="text-center"
          style={{
            marginBottom: '56px',
            opacity: isVisible('stage') ? 1 : 0,
            transform: isVisible('stage') ? 'translateY(0)' : 'translateY(12px)',
            transition: APPLE.transition.reveal,
            transitionDelay: '0.1s'
          }}
        >
          <h2 style={{
            fontSize: 'clamp(32px, 7vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            color: APPLE.colors.white
          }}>
            Витрины
          </h2>
        </div>

        {/* Video grid - 2x2 clean layout */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            maxWidth: '480px',
            margin: '0 auto',
            opacity: isVisible('stage') ? 1 : 0,
            transform: isVisible('stage') ? 'translateY(0)' : 'translateY(12px)',
            transition: APPLE.transition.reveal,
            transitionDelay: '0.2s'
          }}
        >
          {videos.map((video, index) => (
            <button
              key={index}
              onClick={() => handleOpenDemo(video.id)}
              style={{
                position: 'relative',
                aspectRatio: '9 / 16',
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: APPLE.colors.surface,
                border: `1px solid ${APPLE.colors.border}`,
                padding: 0,
                cursor: 'pointer',
                transition: APPLE.transition.hover
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              data-testid={`video-card-${index}`}
            >
              <LazyVideo
                src={video.src}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION D: PROCESS — Timeline narrative
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('process')}
        data-section="process"
        style={{
          padding: `${APPLE.spacing.section} 24px`,
          borderTop: `1px solid ${APPLE.colors.border}`,
          backgroundColor: APPLE.colors.black
        }}
      >
        <div 
          className="text-center"
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            opacity: isVisible('process') ? 1 : 0,
            transform: isVisible('process') ? 'translateY(0)' : 'translateY(12px)',
            transition: APPLE.transition.reveal,
            transitionDelay: '0.1s'
          }}
        >
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: APPLE.colors.gray2,
            marginBottom: '16px'
          }}>
            Процесс
          </p>
          
          <h2 style={{
            fontSize: 'clamp(32px, 7vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            color: APPLE.colors.white,
            marginBottom: '12px'
          }}>
            Код до запуска
          </h2>
          
          <p style={{
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: APPLE.colors.gray2,
            marginBottom: '56px'
          }}>
            за 14 дней
          </p>

          {/* Steps */}
          <div 
            className="grid gap-10"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {[
              { num: '01', title: 'Дизайн' },
              { num: '02', title: 'Разработка' },
              { num: '03', title: 'Запуск' }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: APPLE.colors.blue,
                  marginBottom: '8px'
                }}>
                  {step.num}
                </div>
                <div style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: APPLE.colors.white
                }}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION E: CONCIERGE CTA — Final conversion
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('cta')}
        data-section="cta"
        style={{
          padding: `${APPLE.spacing.section} 24px`,
          borderTop: `1px solid ${APPLE.colors.border}`,
          background: `
            radial-gradient(ellipse 100% 80% at 50% 100%, rgba(41, 151, 255, 0.06), transparent 50%),
            ${APPLE.colors.black}
          `
        }}
      >
        <div 
          className="text-center"
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            opacity: isVisible('cta') ? 1 : 0,
            transform: isVisible('cta') ? 'translateY(0)' : 'translateY(12px)',
            transition: APPLE.transition.reveal,
            transitionDelay: '0.1s'
          }}
        >
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: APPLE.colors.gray2,
            marginBottom: '16px'
          }}>
            Готовы начать?
          </p>
          
          <h2 style={{
            fontSize: 'clamp(32px, 7vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            color: APPLE.colors.white,
            marginBottom: '16px'
          }}>
            Личный консьерж
            <br />
            <span style={{ color: APPLE.colors.gray2 }}>сопровождения</span>
          </h2>
          
          <p style={{
            fontSize: '17px',
            color: APPLE.colors.gray2,
            marginBottom: '36px',
            letterSpacing: '-0.01em'
          }}>
            Первая консультация бесплатно
          </p>
          
          <button 
            onClick={() => handleNavigate('constructor')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '52px',
              padding: '0 36px',
              fontSize: '17px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: APPLE.colors.black,
              backgroundColor: APPLE.colors.white,
              border: 'none',
              borderRadius: '980px',
              cursor: 'pointer',
              transition: APPLE.transition.hover
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            data-testid="button-final-cta"
          >
            Запустить проект
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
          
          <p style={{
            fontSize: '12px',
            color: APPLE.colors.gray3,
            marginTop: '20px'
          }}>
            Без скрытых платежей
          </p>
        </div>
      </section>

      {/* Safe area footer */}
      <div style={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
    </div>
  );
}

export default ShowcasePage;
