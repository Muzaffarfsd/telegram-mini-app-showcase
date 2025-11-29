import { ArrowRight, ChevronRight } from "lucide-react";
import { useCallback, memo } from "react";
import { m } from 'framer-motion';
import { useHaptic } from '../hooks/useHaptic';

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
};

const stagger = (delay: number) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay }
});

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const haptic = useHaptic();

  const handleCTA = useCallback(() => {
    haptic.medium();
    onNavigate('constructor');
  }, [haptic, onNavigate]);

  const handleDemo = useCallback(() => {
    haptic.light();
    onOpenDemo('clothing-store');
  }, [haptic, onOpenDemo]);

  return (
    <div className="min-h-screen text-[#f5f5f7]" style={{ background: '#000000' }}>
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO — One message. Maximum impact.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-center px-6" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        
        {/* Minimal badge */}
        <m.div {...stagger(0)} className="mb-8">
          <span 
            className="inline-block text-[11px] font-medium tracking-[0.2em] uppercase"
            style={{ color: '#86868b' }}
          >
            Invitation Only
          </span>
        </m.div>

        {/* Hero headline */}
        <m.h1 
          {...stagger(0.1)}
          className="mb-6"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            fontSize: 'clamp(40px, 10vw, 56px)',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            lineHeight: 1.08,
            color: '#f5f5f7'
          }}
        >
          Telegram-магазин,
          <br />
          <span style={{ color: '#86868b' }}>
            который запомнят.
          </span>
        </m.h1>

        {/* Subheadline */}
        <m.p 
          {...stagger(0.2)}
          className="mb-10 max-w-[320px]"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            fontSize: '17px',
            fontWeight: 400,
            lineHeight: 1.47,
            color: '#86868b'
          }}
        >
          Создаём премиальные мини-приложения для брендов, которые ценят качество.
        </m.p>

        {/* Primary CTA */}
        <m.div {...stagger(0.3)} className="flex flex-col gap-4">
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={handleCTA}
            className="inline-flex items-center justify-center gap-2 h-[50px] px-8 rounded-full"
            style={{ 
              background: '#f5f5f7',
              color: '#000000',
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
            transition={{ duration: 0.2 }}
            onClick={handleDemo}
            className="inline-flex items-center justify-center gap-1"
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
          VALUE PROPOSITION — Three simple truths
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="space-y-20">
          
          {/* Value 1 */}
          <m.div {...fadeUp}>
            <h2 
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontSize: '32px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                color: '#f5f5f7',
                marginBottom: '12px'
              }}
            >
              14 дней до запуска.
            </h2>
            <p style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '17px',
              lineHeight: 1.47,
              color: '#86868b',
              maxWidth: '300px'
            }}>
              От идеи до работающего приложения в Telegram. Без компромиссов.
            </p>
          </m.div>

          {/* Value 2 */}
          <m.div {...fadeUp}>
            <h2 
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontSize: '32px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                color: '#f5f5f7',
                marginBottom: '12px'
              }}
            >
              AI, который продаёт.
            </h2>
            <p style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '17px',
              lineHeight: 1.47,
              color: '#86868b',
              maxWidth: '300px'
            }}>
              Консьерж знает ваш каталог и работает 24/7. Ответ за 2 секунды.
            </p>
          </m.div>

          {/* Value 3 */}
          <m.div {...fadeUp}>
            <h2 
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontSize: '32px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                color: '#f5f5f7',
                marginBottom: '12px'
              }}
            >
              +280% к продажам.
            </h2>
            <p style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '17px',
              lineHeight: 1.47,
              color: '#86868b',
              maxWidth: '300px'
            }}>
              Средний результат клиентов в первый квартал после запуска.
            </p>
          </m.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SOCIAL PROOF — Minimal metrics
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20">
        <m.div 
          {...fadeUp}
          className="py-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '127+', label: 'проектов' },
              { value: '98%', label: 'довольны' },
              { value: '2.8×', label: 'рост' },
            ].map((stat) => (
              <div key={stat.label}>
                <div 
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                    fontSize: '28px',
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
                  fontSize: '13px',
                  color: '#86868b'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIAL — One voice
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20">
        <m.div {...fadeUp}>
          <p 
            className="mb-6"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontSize: '24px',
              fontWeight: 400,
              lineHeight: 1.35,
              color: '#f5f5f7',
              fontStyle: 'italic'
            }}
          >
            «Лучший UX, который наши клиенты видели в Telegram. Окупились за первый месяц.»
          </p>
          <p style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            fontSize: '15px',
            color: '#86868b'
          }}>
            Анна Козлова, MODA HOUSE
          </p>
        </m.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA — Close the loop
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <m.div {...fadeUp} className="text-center">
          <h2 
            className="mb-4"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontSize: '40px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: '#f5f5f7'
            }}
          >
            Начните сегодня.
          </h2>
          <p 
            className="mb-8 mx-auto"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '17px',
              lineHeight: 1.47,
              color: '#86868b',
              maxWidth: '280px'
            }}
          >
            Ответим в течение часа. Запуск через 14 дней.
          </p>
          
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={handleCTA}
            className="inline-flex items-center justify-center gap-2 h-[50px] px-8 rounded-full"
            style={{ 
              background: '#f5f5f7',
              color: '#000000',
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
      <footer className="px-6 py-12 text-center">
        <p style={{ 
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          fontSize: '12px',
          color: '#424245'
        }}>
          WEB4TG STUDIO
        </p>
      </footer>

      <div className="h-8" />
    </div>
  );
}

export default memo(ShowcasePage);
