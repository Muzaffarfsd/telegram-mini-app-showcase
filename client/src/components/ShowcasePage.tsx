import { ArrowRight, ChevronRight } from "lucide-react";
import { useCallback, memo, useRef } from "react";
import { m } from 'framer-motion';
import { useHaptic } from '../hooks/useHaptic';
import { preloadDemo } from './demos/DemoRegistry';

const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
};

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const haptic = useHaptic();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleCTA = useCallback(() => {
    haptic.medium();
    onNavigate('constructor');
  }, [haptic, onNavigate]);

  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const handleVideoHover = useCallback((index: number, play: boolean) => {
    const video = videoRefs.current[index];
    if (video) {
      if (play) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, []);

  return (
    <div className="min-h-screen text-[#f5f5f7]" style={{ background: '#000' }}>
      <div className="max-w-[430px] mx-auto">
        
        {/* ═══════════════════════════════════════════════════════════════
            HERO — Attention
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-6 pt-28 pb-16">
          
          <m.p 
            {...fadeUp}
            className="mb-5"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: '#86868b',
              textTransform: 'uppercase'
            }}
          >
            Invitation Only
          </m.p>

          <m.h1 
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="mb-5"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontSize: '44px',
              fontWeight: 600,
              letterSpacing: '-0.022em',
              lineHeight: 1.06,
              color: '#f5f5f7'
            }}
          >
            Telegram-магазин,
            <br />
            <span style={{ color: '#86868b' }}>который запомнят.</span>
          </m.h1>

          <m.p 
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mb-8"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '17px',
              fontWeight: 400,
              lineHeight: 1.47,
              color: '#86868b',
              maxWidth: '300px'
            }}
          >
            Премиальные мини-приложения для брендов, которые ценят качество.
          </m.p>

          <m.div 
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="space-y-4"
          >
            <m.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.15 }}
              onClick={handleCTA}
              className="w-full h-[52px] rounded-full flex items-center justify-center gap-2"
              style={{ 
                background: '#f5f5f7',
                color: '#000',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '17px',
                fontWeight: 400
              }}
              data-testid="button-cta-hero"
            >
              Оставить заявку
              <ArrowRight className="w-4 h-4" />
            </m.button>
            
            <m.button
              whileHover={{ opacity: 0.7 }}
              transition={{ duration: 0.15 }}
              onClick={() => handleOpenDemo('clothing-store')}
              className="w-full flex items-center justify-center gap-1 py-2"
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
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PORTFOLIO — Interest / Desire
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-5 pb-16">
          <m.p 
            {...fadeUp}
            className="mb-5 px-1"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: '#86868b',
              textTransform: 'uppercase'
            }}
          >
            Портфолио
          </m.p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { 
                id: 'sneaker-store',
                video: sneakerVideo,
                title: 'Sneaker Vault',
                subtitle: 'Дропы и релизы'
              },
              { 
                id: 'luxury-watches',
                video: watchesVideo,
                title: 'Time Elite',
                subtitle: 'Luxury & Vintage'
              },
            ].map((item, i) => (
              <m.div
                key={item.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenDemo(item.id)}
                onMouseEnter={() => {
                  preloadDemo(item.id);
                  handleVideoHover(i, true);
                }}
                onMouseLeave={() => handleVideoHover(i, false)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                style={{ background: '#1d1d1f' }}
                data-testid={`card-portfolio-${item.id}`}
              >
                <video
                  ref={el => videoRefs.current[i] = el}
                  src={item.video}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)' 
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 
                    style={{ 
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#f5f5f7',
                      marginBottom: '2px'
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                    fontSize: '13px',
                    color: '#86868b'
                  }}>
                    {item.subtitle}
                  </p>
                </div>
              </m.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            VALUE PROPOSITION — Interest
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-16">
          <div className="space-y-14">
            {[
              { 
                title: '14 дней до запуска.',
                desc: 'От идеи до работающего приложения. Без компромиссов.'
              },
              { 
                title: 'AI, который продаёт.',
                desc: 'Консьерж знает каталог и работает 24/7.'
              },
              { 
                title: '+280% к продажам.',
                desc: 'Средний рост в первый квартал.'
              },
            ].map((item, i) => (
              <m.div key={item.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }}>
                <h2 
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                    fontSize: '28px',
                    fontWeight: 600,
                    letterSpacing: '-0.015em',
                    lineHeight: 1.14,
                    color: '#f5f5f7',
                    marginBottom: '8px'
                  }}
                >
                  {item.title}
                </h2>
                <p style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '15px',
                  lineHeight: 1.47,
                  color: '#86868b'
                }}>
                  {item.desc}
                </p>
              </m.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* ═══════════════════════════════════════════════════════════════
            SOCIAL PROOF — Desire
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-14">
          <m.div {...fadeUp} className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '127+', label: 'проектов' },
              { value: '98%', label: 'довольны' },
              { value: '2.8×', label: 'рост' },
            ].map((stat) => (
              <div key={stat.label}>
                <div 
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                    fontSize: '24px',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: '#f5f5f7',
                    marginBottom: '4px'
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '12px',
                  color: '#86868b'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </m.div>
        </section>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* ═══════════════════════════════════════════════════════════════
            TESTIMONIAL — Desire
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-14">
          <m.div {...fadeUp}>
            <p 
              className="mb-5"
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontSize: '21px',
                fontWeight: 400,
                lineHeight: 1.38,
                color: '#f5f5f7',
                fontStyle: 'italic'
              }}
            >
              «Лучший UX в Telegram. Окупились за первый месяц.»
            </p>
            <p style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '13px',
              color: '#86868b'
            }}>
              Анна Козлова, MODA HOUSE
            </p>
          </m.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FINAL CTA — Action
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-16">
          <m.div {...fadeUp} className="text-center">
            <h2 
              className="mb-3"
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontSize: '32px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                color: '#f5f5f7'
              }}
            >
              Начните сегодня.
            </h2>
            <p 
              className="mb-8 mx-auto"
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '15px',
                lineHeight: 1.47,
                color: '#86868b',
                maxWidth: '260px'
              }}
            >
              Ответим в течение часа. Запуск через 14 дней.
            </p>
            
            <m.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.15 }}
              onClick={handleCTA}
              className="w-full h-[52px] rounded-full flex items-center justify-center gap-2"
              style={{ 
                background: '#f5f5f7',
                color: '#000',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '17px',
                fontWeight: 400
              }}
              data-testid="button-cta-final"
            >
              Оставить заявку
              <ArrowRight className="w-4 h-4" />
            </m.button>
          </m.div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-10 text-center">
          <p style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            fontSize: '11px',
            color: '#424245'
          }}>
            WEB4TG STUDIO
          </p>
        </footer>

        <div className="h-6" />
      </div>
    </div>
  );
}

export default memo(ShowcasePage);
