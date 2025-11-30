import { ArrowRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { m, useInView } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { preloadDemo } from './demos/DemoRegistry';

const heroVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   APPLE-STYLE MINIMALIST SHOWCASE
   Confidence through restraint. Typography as hero. Maximum white space.
═══════════════════════════════════════════════════════════════════════════ */

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const videoRef = useVideoLazyLoad();
  const heroRef = useRef(null);
  const proofRef = useRef(null);
  const ctaRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const proofInView = useInView(proofRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });
  
  const [videoHovered, setVideoHovered] = useState(false);

  const contact = useCallback(() => { 
    haptic.medium(); 
    onNavigate('contact'); 
  }, [haptic, onNavigate]);

  const openDemo = useCallback(() => {
    haptic.light();
    preloadDemo('clothing-store');
    onOpenDemo('clothing-store');
  }, [haptic, onOpenDemo]);

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: '#000' }}>
      <div 
        className="w-full relative"
        style={{ 
          maxWidth: '430px',
          background: '#050505',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        
        {/* ════════════════════════════════════════════════════════════
            HERO — Два слова. Максимальное воздействие.
        ════════════════════════════════════════════════════════════ */}
        <section 
          ref={heroRef}
          className="px-6 pt-16 pb-20"
          style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <m.div
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Pill */}
            <div className="mb-12">
              <span style={{
                display: 'inline-block',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                padding: '8px 16px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '100px'
              }}>
                Private Release VII
              </span>
            </div>

            {/* Main Statement */}
            <h1 style={{
              fontSize: '48px',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: '#FFFFFF',
              marginBottom: '24px'
            }}>
              Не для всех.
            </h1>

            <p style={{
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '320px'
            }}>
              Telegram Mini Apps для бизнеса, который понимает разницу.
            </p>
          </m.div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            PROOF — Один кейс. Полное погружение.
        ════════════════════════════════════════════════════════════ */}
        <section ref={proofRef} className="pb-20">
          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={proofInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Video */}
            <div 
              className="relative cursor-pointer"
              onClick={openDemo}
              onMouseEnter={() => { setVideoHovered(true); preloadDemo('clothing-store'); }}
              onMouseLeave={() => setVideoHovered(false)}
              onTouchStart={() => preloadDemo('clothing-store')}
              data-testid="demo-card-main"
            >
              <m.div
                animate={{ scale: videoHovered ? 1.02 : 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ 
                  overflow: 'hidden',
                  borderRadius: '0'
                }}
              >
                <div style={{ aspectRatio: '4/5', position: 'relative' }}>
                  <video
                    ref={videoRef}
                    src={heroVideo}
                    loop muted playsInline preload="none"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      transform: videoHovered ? 'scale(1.05)' : 'scale(1)',
                      transition: 'transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)'
                    }}
                  />
                  
                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(5,5,5,0.3) 0%, transparent 30%, transparent 60%, rgba(5,5,5,0.9) 100%)'
                    }}
                  />

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.5)',
                      marginBottom: '8px'
                    }}>
                      Case Study
                    </p>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: 400,
                      letterSpacing: '-0.02em',
                      color: '#FFFFFF',
                      marginBottom: '4px'
                    }}>
                      Radiance
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.4)'
                    }}>
                      Premium fashion. 24/7 sales.
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <m.div
                    className="absolute bottom-6 right-6"
                    animate={{ opacity: videoHovered ? 1 : 0.3, x: videoHovered ? 4 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </m.div>
                </div>
              </m.div>
            </div>

            {/* More projects link */}
            <div className="px-6 mt-6">
              <button
                onClick={() => onNavigate('projects')}
                data-testid="button-view-all"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                View all projects
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </m.div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            BENEFITS — Минимальный текст. Максимальный смысл.
        ════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="space-y-16">
            {[
              { num: '01', text: 'Продажи без выходных' },
              { num: '02', text: 'Бесшовная интеграция' },
              { num: '03', text: 'Поддержка навсегда' }
            ].map((item, i) => (
              <m.div
                key={item.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex items-baseline gap-6"
              >
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.25)',
                  fontFamily: "'SF Mono', 'Roboto Mono', monospace"
                }}>
                  {item.num}
                </span>
                <p style={{
                  fontSize: '20px',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  {item.text}
                </p>
              </m.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SCARCITY — Одна строка. Тихое давление.
        ════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-16" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p style={{
            fontSize: '14px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            Мы работаем с ограниченным числом клиентов.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>7 мест в этом сезоне.</span>
          </p>
        </section>

        {/* ════════════════════════════════════════════════════════════
            CTA — Чистое действие.
        ════════════════════════════════════════════════════════════ */}
        <section ref={ctaRef} className="px-6 py-24">
          <m.div
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 style={{
              fontSize: '32px',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              marginBottom: '32px'
            }}>
              Начать разговор
            </h2>

            <m.button
              onClick={contact}
              data-testid="button-contact"
              whileTap={{ scale: 0.98 }}
              style={{
                background: '#FFFFFF',
                color: '#000000',
                border: 'none',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '0.01em',
                padding: '16px 40px',
                borderRadius: '100px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Написать
              <ArrowRight className="w-4 h-4" />
            </m.button>

            <p style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.25)',
              marginTop: '16px'
            }}>
              Ответ в течение 24 часов
            </p>
          </m.div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ 
            fontSize: '11px', 
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.15)' 
          }}>
            WEB4TG STUDIO
          </p>
        </footer>

        <div style={{ height: '90px' }} />
      </div>
    </div>
  );
}

export default ShowcasePage;
