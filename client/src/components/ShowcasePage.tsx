import { ArrowRight, Play } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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

const ease = [0.16, 1, 0.3, 1];

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const { } = useTelegram();
  const haptic = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  
  const videoRef1 = useVideoPreload();
  const videoRef2 = useVideoPreload();
  const videoRef3 = useVideoLazyLoad();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const handleContact = useCallback(() => {
    haptic.light();
    onNavigate('contact');
  }, [haptic, onNavigate]);

  const videos = [
    { id: 'sneaker-store', ref: videoRef1, src: sneakerVideo, title: 'SneakerVault', subtitle: 'Кроссовки' },
    { id: 'luxury-watches', ref: videoRef2, src: watchesVideo, title: 'TimeElite', subtitle: 'Часы' },
    { id: 'clothing-store', ref: videoRef3, src: fashionVideo, title: 'Radiance', subtitle: 'Одежда' },
  ];

  return (
    <div 
      className="min-h-screen w-full flex justify-center"
      style={{ background: '#000000' }}
    >
      {/* Mobile Container */}
      <div 
        ref={containerRef}
        className="w-full relative"
        style={{ 
          maxWidth: '430px',
          background: '#050505',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        {/* ═══════════════════════════════════════════════════════
            A - ATTENTION
            Захват внимания мощным визуальным ударом
        ═══════════════════════════════════════════════════════ */}
        <m.section 
          className="relative flex flex-col justify-end px-6"
          style={{ 
            height: '100vh',
            paddingBottom: '48px',
            opacity: heroOpacity,
            scale: heroScale
          }}
        >
          {/* Floating Accent */}
          <m.div
            className="absolute top-1/4 right-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease }}
          >
            <div 
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
                filter: 'blur(20px)'
              }}
            />
          </m.div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Micro Label */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease }}
              className="mb-6"
            >
              <span 
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                data-testid="text-label"
              >
                <span 
                  style={{ 
                    width: '20px', 
                    height: '1px', 
                    background: 'rgba(255,255,255,0.25)' 
                  }} 
                />
                WEB4TG
              </span>
            </m.div>

            {/* Giant Word */}
            <m.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease }}
              style={{
                fontSize: '64px',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
                color: '#FFFFFF',
                marginBottom: '8px'
              }}
              data-testid="text-hero-main"
            >
              Sell.
            </m.h1>

            <m.h2
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease }}
              style={{
                fontSize: '64px',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '32px'
              }}
              data-testid="text-hero-sub"
            >
              24/7.
            </m.h2>

            {/* Subtext */}
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{
                fontSize: '15px',
                fontWeight: 400,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.4)',
                maxWidth: '260px',
                marginBottom: '40px'
              }}
              data-testid="text-hero-description"
            >
              Telegram приложения, которые превращают подписчиков в покупателей
            </m.p>

            {/* Scroll Hint */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <m.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: '24px',
                  height: '40px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: '8px'
                }}
              >
                <div 
                  style={{
                    width: '3px',
                    height: '8px',
                    borderRadius: '2px',
                    background: 'rgba(255,255,255,0.4)'
                  }}
                />
              </m.div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                Scroll
              </span>
            </m.div>
          </div>
        </m.section>

        {/* ═══════════════════════════════════════════════════════
            I - INTEREST
            Видео карточки с иммерсивным опытом
        ═══════════════════════════════════════════════════════ */}
        <section className="px-4 py-8">
          {/* Section Label */}
          <m.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p 
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)'
              }}
            >
              Featured Work
            </p>
          </m.div>

          {/* Stacked Video Cards */}
          <div className="space-y-4">
            {videos.map((video, index) => (
              <m.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.6, ease }}
                className="relative cursor-pointer group"
                onClick={() => handleOpenDemo(video.id)}
                onMouseEnter={() => {
                  preloadDemo(video.id);
                  setActiveVideo(index);
                }}
                onMouseLeave={() => setActiveVideo(null)}
                onTouchStart={() => preloadDemo(video.id)}
                data-testid={`demo-card-${video.id}`}
              >
                <div 
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: '20px',
                    aspectRatio: '16/9'
                  }}
                >
                  <video
                    ref={video.ref}
                    src={video.src}
                    loop
                    muted
                    playsInline
                    preload="none"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                    style={{
                      transform: activeVideo === index ? 'scale(1.05)' : 'scale(1)'
                    }}
                  />
                  
                  {/* Overlay */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{ 
                      background: `linear-gradient(
                        180deg, 
                        transparent 0%, 
                        transparent 40%,
                        rgba(0,0,0,0.8) 100%
                      )`,
                      opacity: activeVideo === index ? 0.6 : 1
                    }}
                  />

                  {/* Play Button */}
                  <m.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: activeVideo === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div 
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Play className="w-6 h-6 text-white ml-1" fill="white" />
                    </div>
                  </m.div>
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p 
                          style={{
                            fontSize: '10px',
                            fontWeight: 500,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.5)',
                            marginBottom: '4px'
                          }}
                        >
                          {video.subtitle}
                        </p>
                        <h3 
                          style={{
                            fontSize: '22px',
                            fontWeight: 600,
                            letterSpacing: '-0.02em',
                            color: '#FFFFFF'
                          }}
                        >
                          {video.title}
                        </h3>
                      </div>
                      <ArrowRight 
                        className="w-5 h-5 transition-transform duration-300"
                        style={{ 
                          color: 'rgba(255,255,255,0.5)',
                          transform: activeVideo === index ? 'translateX(4px)' : 'translateX(0)'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>

          {/* More Projects Grid */}
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-6 grid grid-cols-2 gap-3"
          >
            {demoApps.slice(3, 7).map((app, index) => (
              <m.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5, ease }}
                onClick={() => handleOpenDemo(app.id)}
                onMouseEnter={() => preloadDemo(app.id)}
                onTouchStart={() => preloadDemo(app.id)}
                className="cursor-pointer active:scale-[0.98] transition-transform duration-200"
                data-testid={`demo-card-${app.id}`}
              >
                <div 
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: '14px',
                    aspectRatio: '1/1',
                    background: 'rgba(255,255,255,0.03)'
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
                      background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)' 
                    }}
                  />
                  <div className="absolute bottom-3 left-3">
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                      {app.title}
                    </p>
                  </div>
                </div>
              </m.div>
            ))}
          </m.div>

          {/* View All */}
          <m.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => onNavigate('projects')}
            data-testid="button-view-all"
            className="w-full mt-6 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-200"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              fontWeight: 500,
              padding: '14px',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </m.button>
        </section>

        {/* ═══════════════════════════════════════════════════════
            D - DESIRE
            Статистика и социальное доказательство
        ═══════════════════════════════════════════════════════ */}
        <section className="px-4 py-16">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            {/* Quote */}
            <div 
              className="text-center mb-12"
              style={{ padding: '0 12px' }}
            >
              <p 
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                  color: '#FFFFFF'
                }}
                data-testid="text-quote"
              >
                Бизнес, который{' '}
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>никогда</span>{' '}
                не спит
              </p>
            </div>

            {/* Stats */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              {[
                { value: '50+', label: 'Проектов' },
                { value: '14', label: 'Дней запуск' },
                { value: '24/7', label: 'Поддержка' }
              ].map((stat, index) => (
                <m.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease }}
                  className="text-center"
                  style={{
                    padding: '24px 12px',
                    background: '#0a0a0a'
                  }}
                  data-testid={`stat-${index}`}
                >
                  <p 
                    style={{
                      fontSize: '32px',
                      fontWeight: 600,
                      letterSpacing: '-0.03em',
                      color: '#FFFFFF',
                      marginBottom: '4px'
                    }}
                  >
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                    {stat.label}
                  </p>
                </m.div>
              ))}
            </div>
          </m.div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            A - ACTION
            Финальный призыв к действию
        ═══════════════════════════════════════════════════════ */}
        <section className="px-4 py-16">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="text-center"
          >
            {/* CTA Text */}
            <h2 
              style={{
                fontSize: '36px',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: '#FFFFFF',
                marginBottom: '12px'
              }}
              data-testid="text-cta-title"
            >
              Start
              <br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>today.</span>
            </h2>
            
            <p 
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '32px'
              }}
              data-testid="text-cta-subtitle"
            >
              Бесплатная консультация
            </p>

            {/* CTA Button */}
            <m.button
              onClick={handleContact}
              data-testid="button-cta-contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                maxWidth: '280px',
                background: '#FFFFFF',
                color: '#000000',
                fontSize: '15px',
                fontWeight: 600,
                padding: '16px 32px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Написать нам
            </m.button>

            {/* Trust Badge */}
            <p 
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.2)',
                marginTop: '16px'
              }}
            >
              Ответ в течение часа
            </p>
          </m.div>
        </section>

        {/* Footer */}
        <footer 
          className="px-4 py-6 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
            WEB4TG · 2025
          </p>
        </footer>

        {/* Bottom Safe Area */}
        <div style={{ height: '80px' }} />
      </div>
    </div>
  );
}

export default ShowcasePage;
