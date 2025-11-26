import { ArrowRight, Play, Crown, Shield, Clock, Star } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useHaptic } from '../hooks/useHaptic';
import { LazyVideo } from './LazyVideo';

const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";
const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const heroVideo = "/videos/1341996d8f73172cbc77930dc818d88e_t4_1763643600785.mp4";

/* ═══════════════════════════════════════════════════════════════════════
   LUXURY DESIGN SYSTEM — Inspired by Louis Vuitton, Chanel, Apple
   Psychology: Exclusivity, Status, Aspiration, Craftsmanship
   ═══════════════════════════════════════════════════════════════════════ */

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const haptic = useHaptic();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['hero']));
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisibleSections(new Set(['hero', 'social', 'showcase', 'exclusive', 'cta']));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section');
            if (id) setVisibleSections((prev) => new Set(Array.from(prev).concat(id)));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
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

  const revealStyle = (id: string, delay: number = 0) => ({
    opacity: isVisible(id) ? 1 : 0,
    transform: isVisible(id) ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`
  });

  return (
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{ 
        backgroundColor: '#000000',
        color: '#FFFFFF',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif'
      }}
    >
      
      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Драматичное открытие с психологией эксклюзивности
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('hero')}
        data-section="hero"
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          minHeight: '100dvh',
          padding: '80px 24px 100px',
          background: `
            radial-gradient(ellipse 140% 70% at 50% 0%, rgba(212, 175, 55, 0.08), transparent 50%),
            radial-gradient(ellipse 80% 50% at 20% 80%, rgba(212, 175, 55, 0.03), transparent),
            #000000
          `
        }}
      >
        {/* Золотая линия сверху */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[60px]"
          style={{
            background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.6), transparent)',
            opacity: isVisible('hero') ? 1 : 0,
            transition: 'opacity 1.2s ease 0.3s'
          }}
        />

        <div style={{ maxWidth: '600px', ...revealStyle('hero', 0) }}>
          {/* Eyebrow с эксклюзивностью */}
          <div 
            className="inline-flex items-center gap-2 mb-8"
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '100px'
            }}
          >
            <Crown style={{ width: '14px', height: '14px', color: '#D4AF37' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37' }}>
              Премиум-разработка
            </span>
          </div>

          {/* Главный заголовок — психология статуса */}
          <h1 style={{
            fontSize: 'clamp(40px, 10vw, 72px)',
            fontWeight: 600,
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            marginBottom: '24px'
          }}>
            Для тех, кто
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              выбирает лучшее
            </span>
          </h1>

          {/* Подзаголовок — эмоциональный триггер */}
          <p style={{
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '40px',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Эксклюзивные Telegram-приложения для брендов, 
            которые не идут на компромиссы
          </p>

          {/* CTA — срочность и эксклюзивность */}
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => handleNavigate('constructor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                height: '56px',
                padding: '0 36px',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: '#000000',
                background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
                border: 'none',
                borderRadius: '100px',
                cursor: 'pointer',
                boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 0 60px rgba(212, 175, 55, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(212, 175, 55, 0.3)';
              }}
              data-testid="button-hero-primary"
            >
              Забронировать место
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
            
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Только 12 проектов в месяц
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SOCIAL PROOF — Доверие через авторитет
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('social')}
        data-section="social"
        style={{
          padding: '60px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.01)'
        }}
      >
        <div 
          className="flex justify-center items-center flex-wrap"
          style={{
            gap: 'clamp(32px, 6vw, 64px)',
            maxWidth: '800px',
            margin: '0 auto',
            ...revealStyle('social', 0.1)
          }}
        >
          {[
            { icon: Star, value: '4.9', label: 'рейтинг клиентов' },
            { icon: Shield, value: '127', label: 'премиум-брендов' },
            { icon: Clock, value: '14', label: 'дней до запуска' }
          ].map((stat, i) => (
            <div key={i} className="text-center" style={{ minWidth: '100px' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon style={{ width: '16px', height: '16px', color: '#D4AF37' }} />
                <span style={{
                  fontSize: 'clamp(28px, 5vw, 36px)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF'
                }}>
                  {stat.value}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SHOWCASE — Витрина работ (чистые видео без текста)
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('showcase')}
        data-section="showcase"
        style={{ padding: 'clamp(80px, 14vw, 140px) 20px' }}
      >
        {/* Заголовок секции */}
        <div className="text-center" style={{ marginBottom: '48px', ...revealStyle('showcase', 0.1) }}>
          <p style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#D4AF37',
            marginBottom: '16px'
          }}>
            Портфолио
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '12px'
          }}>
            Каждый проект —
            <br />
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>произведение искусства</span>
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.4)' }}>
            Нажмите, чтобы испытать
          </p>
        </div>

        {/* Видео-сетка — чистые карточки БЕЗ текста */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            maxWidth: '480px',
            margin: '0 auto',
            ...revealStyle('showcase', 0.2)
          }}
        >
          {videos.map((video, index) => (
            <button
              key={index}
              onClick={() => handleOpenDemo(video.id)}
              style={{
                position: 'relative',
                aspectRatio: '9 / 16',
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#0A0A0A',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                padding: 0,
                cursor: 'pointer',
                transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.5s ease, box-shadow 0.5s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02) translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                e.currentTarget.style.boxShadow = '0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
              {/* Subtle vignette */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
                  opacity: 0.6
                }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EXCLUSIVE — Что делает нас особенными
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('exclusive')}
        data-section="exclusive"
        style={{
          padding: 'clamp(80px, 14vw, 140px) 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: `
            radial-gradient(ellipse 100% 60% at 50% 100%, rgba(212, 175, 55, 0.04), transparent),
            #000000
          `
        }}
      >
        <div className="text-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={revealStyle('exclusive', 0.1)}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#D4AF37',
              marginBottom: '16px'
            }}>
              Наш подход
            </p>
            <h2 style={{
              fontSize: 'clamp(28px, 6vw, 44px)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '48px'
            }}>
              Бескомпромиссное
              <br />
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>качество</span>
            </h2>
          </div>

          {/* Преимущества */}
          <div 
            className="grid gap-8"
            style={{ ...revealStyle('exclusive', 0.2) }}
          >
            {[
              { 
                title: 'Персональный менеджер',
                desc: 'Выделенный специалист на связи 24/7'
              },
              { 
                title: 'Дизайн уровня Apple',
                desc: 'Внимание к каждому пикселю и анимации'
              },
              { 
                title: 'Гарантия результата',
                desc: 'Или полный возврат инвестиций'
              }
            ].map((item, i) => (
              <div 
                key={i}
                style={{
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px'
                }}
              >
                <h3 style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: '6px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA — Высокое давление к действию
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={setSectionRef('cta')}
        data-section="cta"
        style={{
          padding: 'clamp(100px, 18vw, 180px) 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, rgba(212, 175, 55, 0.06), transparent 60%),
            #000000
          `
        }}
      >
        <div className="text-center" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={revealStyle('cta', 0.1)}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#D4AF37',
              marginBottom: '16px'
            }}>
              Эксклюзивное предложение
            </p>
            
            <h2 style={{
              fontSize: 'clamp(28px, 6vw, 44px)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '16px'
            }}>
              Станьте одним из
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                избранных
              </span>
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '36px',
              lineHeight: 1.6
            }}>
              Бесплатная консультация и аудит
              <br />
              вашего бизнеса от эксперта
            </p>
            
            <button 
              onClick={() => handleNavigate('constructor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                height: '56px',
                padding: '0 40px',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: '#000000',
                background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
                border: 'none',
                borderRadius: '100px',
                cursor: 'pointer',
                boxShadow: '0 0 50px rgba(212, 175, 55, 0.4)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 0 80px rgba(212, 175, 55, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 50px rgba(212, 175, 55, 0.4)';
              }}
              data-testid="button-final-cta"
            >
              Получить консультацию
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
            
            <div style={{ marginTop: '24px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.3)' }}>
                Осталось 4 места на декабрь
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safe area */}
      <div style={{ height: 'env(safe-area-inset-bottom, 24px)' }} />
    </div>
  );
}

export default ShowcasePage;
