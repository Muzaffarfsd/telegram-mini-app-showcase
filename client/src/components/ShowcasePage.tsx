import { ArrowRight, ChevronDown } from "lucide-react";
import { useCallback, useRef } from "react";
import { m, useInView } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { LazyVideo } from './LazyVideo';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { useVideoPreload } from '../hooks/useVideoPreload';
import { preloadDemo } from './demos/DemoRegistry';
import { demoApps } from '../data/demoApps';

const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const appleEase = [0.25, 0.1, 0.25, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: appleEase }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <m.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </m.div>
  );
}

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const { } = useTelegram();
  const haptic = useHaptic();
  
  const videoRef1 = useVideoPreload();
  const videoRef2 = useVideoPreload();
  const videoRef3 = useVideoLazyLoad();
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const handleContact = useCallback(() => {
    haptic.light();
    onNavigate('contact');
  }, [haptic, onNavigate]);

  const scrollToDemo = useCallback(() => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div 
      className="min-h-screen w-full flex justify-center"
      style={{ 
        background: '#000000',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Mobile Container - Centered on Desktop */}
      <div 
        className="w-full overflow-x-hidden"
        style={{ 
          maxWidth: '430px',
          background: '#050505'
        }}
      >
        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
            Minimalist dark Apple-style hero
        ═══════════════════════════════════════════════════════ */}
        <section 
          className="relative flex flex-col items-center justify-center px-6"
          style={{ 
            minHeight: '100vh',
            paddingTop: '60px',
            paddingBottom: '100px'
          }}
        >
          <AnimatedSection className="text-center w-full">
            {/* Eyebrow */}
            <m.p 
              variants={fadeInUp}
              className="mb-3"
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.4)'
              }}
              data-testid="text-eyebrow"
            >
              WEB4TG STUDIO
            </m.p>
            
            {/* Main Title */}
            <m.h1 
              variants={fadeInUp}
              style={{
                fontSize: '42px',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: '#FFFFFF',
                marginBottom: '16px'
              }}
              data-testid="text-hero-title"
            >
              Telegram<br/>Mini Apps
            </m.h1>
            
            {/* Subtitle */}
            <m.p 
              variants={fadeInUp}
              style={{
                fontSize: '17px',
                fontWeight: 400,
                lineHeight: 1.4,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '32px'
              }}
              data-testid="text-hero-subtitle"
            >
              Приложения, которые<br/>продают за вас. 24/7.
            </m.p>
            
            {/* CTAs */}
            <m.div 
              variants={fadeInUp}
              className="flex flex-col gap-3 w-full"
              style={{ maxWidth: '280px', margin: '0 auto' }}
            >
              <button
                onClick={scrollToDemo}
                data-testid="button-view-demo"
                className="w-full transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: '#FFFFFF',
                  color: '#000000',
                  fontSize: '15px',
                  fontWeight: 500,
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Смотреть демо
              </button>
              
              <button
                onClick={handleContact}
                data-testid="button-contact"
                className="w-full transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '15px',
                  fontWeight: 500,
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
              >
                Связаться
              </button>
            </m.div>
          </AnimatedSection>
          
          {/* Scroll Indicator */}
          <m.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <button
              onClick={scrollToDemo}
              className="flex flex-col items-center gap-2"
              style={{ 
                color: 'rgba(255, 255, 255, 0.3)', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer' 
              }}
              data-testid="button-scroll-down"
            >
              <m.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-5 h-5" />
              </m.div>
            </button>
          </m.div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            VIDEO DEMO CARDS SECTION
            Premium dark cards with videos
        ═══════════════════════════════════════════════════════ */}
        <section 
          id="demo-section"
          className="px-4 pb-16"
        >
          <AnimatedSection>
            {/* Section Header */}
            <m.div variants={fadeInUp} className="mb-6">
              <p 
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.35)',
                  marginBottom: '8px'
                }}
                data-testid="text-collection-eyebrow"
              >
                Коллекция
              </p>
              <h2 
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF'
                }}
                data-testid="text-collection-title"
              >
                Приложения
              </h2>
            </m.div>

            {/* Video Card 1 - Sneakers */}
            <m.div
              variants={fadeInUp}
              className="group cursor-pointer mb-4"
              onClick={() => handleOpenDemo('sneaker-store')}
              onMouseEnter={() => preloadDemo('sneaker-store')}
              onTouchStart={() => preloadDemo('sneaker-store')}
              data-testid="demo-card-sneaker"
            >
              <div 
                className="relative overflow-hidden"
                style={{
                  borderRadius: '16px',
                  aspectRatio: '16/10'
                }}
              >
                <video
                  ref={videoRef1}
                  src={sneakerVideo}
                  loop
                  muted
                  playsInline
                  preload="none"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' 
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: '#FFFFFF',
                      marginBottom: '2px'
                    }}
                  >
                    SneakerVault
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    Магазин кроссовок
                  </p>
                </div>
              </div>
            </m.div>

            {/* Video Card 2 - Watches */}
            <m.div
              variants={fadeInUp}
              className="group cursor-pointer mb-4"
              onClick={() => handleOpenDemo('luxury-watches')}
              onMouseEnter={() => preloadDemo('luxury-watches')}
              onTouchStart={() => preloadDemo('luxury-watches')}
              data-testid="demo-card-watches"
            >
              <div 
                className="relative overflow-hidden"
                style={{
                  borderRadius: '16px',
                  aspectRatio: '16/10'
                }}
              >
                <video
                  ref={videoRef2}
                  src={watchesVideo}
                  loop
                  muted
                  playsInline
                  preload="none"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' 
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: '#FFFFFF',
                      marginBottom: '2px'
                    }}
                  >
                    TimeElite
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    Элитные часы
                  </p>
                </div>
              </div>
            </m.div>

            {/* Video Card 3 - Fashion */}
            <m.div
              variants={fadeInUp}
              className="group cursor-pointer mb-4"
              onClick={() => handleOpenDemo('clothing-store')}
              onMouseEnter={() => preloadDemo('clothing-store')}
              onTouchStart={() => preloadDemo('clothing-store')}
              data-testid="demo-card-fashion"
            >
              <div 
                className="relative overflow-hidden"
                style={{
                  borderRadius: '16px',
                  aspectRatio: '16/10'
                }}
              >
                <video
                  ref={videoRef3}
                  src={fashionVideo}
                  loop
                  muted
                  playsInline
                  preload="none"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' 
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: '#FFFFFF',
                      marginBottom: '2px'
                    }}
                  >
                    Radiance
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    Магазин одежды
                  </p>
                </div>
              </div>
            </m.div>

            {/* More Apps - Compact Grid */}
            <m.div 
              variants={fadeInUp}
              className="grid grid-cols-2 gap-3 mt-6"
            >
              {demoApps.slice(3, 7).map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleOpenDemo(app.id)}
                  onMouseEnter={() => preloadDemo(app.id)}
                  onTouchStart={() => preloadDemo(app.id)}
                  className="cursor-pointer active:scale-[0.98] transition-transform duration-200"
                  data-testid={`demo-card-${app.id}`}
                >
                  <div 
                    className="relative overflow-hidden"
                    style={{
                      borderRadius: '12px',
                      aspectRatio: '1/1',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {app.image && (
                      <img
                        src={app.image}
                        alt={app.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' 
                      }}
                    />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p 
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#FFFFFF'
                        }}
                      >
                        {app.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </m.div>

            {/* View All Button */}
            <m.div 
              variants={fadeInUp}
              className="mt-8"
            >
              <button
                onClick={() => onNavigate('projects')}
                data-testid="button-view-all"
                className="w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <span>Все проекты</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </m.div>
          </AnimatedSection>
        </section>

        {/* ═══════════════════════════════════════════════════════
            STATS SECTION
            Clean, minimal stats display
        ═══════════════════════════════════════════════════════ */}
        <section className="px-4 py-12">
          <AnimatedSection>
            <m.div 
              variants={fadeInUp}
              className="flex justify-between items-center"
              style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div className="text-center flex-1">
                <p 
                  style={{
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em'
                  }}
                  data-testid="stat-projects"
                >
                  50+
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  проектов
                </p>
              </div>
              
              <div 
                style={{ 
                  width: '1px', 
                  height: '40px', 
                  background: 'rgba(255, 255, 255, 0.08)' 
                }} 
              />
              
              <div className="text-center flex-1">
                <p 
                  style={{
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em'
                  }}
                  data-testid="stat-days"
                >
                  14
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  дней
                </p>
              </div>
              
              <div 
                style={{ 
                  width: '1px', 
                  height: '40px', 
                  background: 'rgba(255, 255, 255, 0.08)' 
                }} 
              />
              
              <div className="text-center flex-1">
                <p 
                  style={{
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em'
                  }}
                  data-testid="stat-support"
                >
                  24/7
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  поддержка
                </p>
              </div>
            </m.div>
          </AnimatedSection>
        </section>

        {/* ═══════════════════════════════════════════════════════
            CTA SECTION
            Final call to action
        ═══════════════════════════════════════════════════════ */}
        <section className="px-4 py-16">
          <AnimatedSection className="text-center">
            <m.h2 
              variants={fadeInUp}
              style={{
                fontSize: '32px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                marginBottom: '12px'
              }}
              data-testid="text-cta-title"
            >
              Готовы начать?
            </m.h2>
            
            <m.p 
              variants={fadeInUp}
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '28px'
              }}
              data-testid="text-cta-subtitle"
            >
              Обсудим ваш проект бесплатно
            </m.p>
            
            <m.div variants={fadeInUp}>
              <button
                onClick={handleContact}
                data-testid="button-cta-contact"
                className="w-full transition-all duration-300 active:scale-[0.98]"
                style={{
                  maxWidth: '280px',
                  background: '#FFFFFF',
                  color: '#000000',
                  fontSize: '15px',
                  fontWeight: 500,
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Связаться с нами
              </button>
            </m.div>
            
            <m.p 
              variants={fadeInUp}
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.3)',
                marginTop: '16px'
              }}
            >
              Ответим в течение часа
            </m.p>
          </AnimatedSection>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FOOTER
            Minimal footer
        ═══════════════════════════════════════════════════════ */}
        <footer 
          className="px-4 py-8 text-center"
          style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.06)' 
          }}
        >
          <p 
            style={{ 
              fontSize: '12px', 
              color: 'rgba(255, 255, 255, 0.25)' 
            }}
            data-testid="text-footer"
          >
            WEB4TG Studio · 2025
          </p>
        </footer>

        {/* Bottom Safe Area */}
        <div style={{ height: '80px' }} />
      </div>
    </div>
  );
}

export default ShowcasePage;
