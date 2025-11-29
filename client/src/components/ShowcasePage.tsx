import { ArrowRight, ArrowDown } from "lucide-react";
import { useCallback, memo, useRef, useState } from "react";
import { m, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useHaptic } from '../hooks/useHaptic';

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const smoothConfig = { stiffness: 100, damping: 20 };

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const haptic = useHaptic();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const [activeChapter, setActiveChapter] = useState(0);
  
  const bgY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100]), smoothConfig);

  const handleCTA = useCallback(() => {
    haptic.medium();
    onNavigate('constructor');
  }, [haptic, onNavigate]);

  const handleDemo = useCallback(() => {
    haptic.light();
    onOpenDemo('clothing-store');
  }, [haptic, onOpenDemo]);

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen relative overflow-x-hidden"
      style={{ 
        background: '#0a0a0a',
        paddingTop: '100px'
      }}
    >
      {/* Ambient gradient background */}
      <m.div 
        style={{ y: bgY }}
        className="fixed inset-0 pointer-events-none"
      >
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        />
      </m.div>

      <div className="max-w-[430px] mx-auto relative z-10">

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 0: PRELUDE — Atmospheric Opening
        ═══════════════════════════════════════════════════════════════ */}
        <section className="min-h-[70vh] flex flex-col justify-end px-8 pb-16">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Minimal word mark */}
            <div className="mb-16">
              <span 
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  fontSize: '11px',
                  fontWeight: 300,
                  letterSpacing: '0.3em',
                  color: 'rgba(212, 175, 55, 0.6)',
                  textTransform: 'uppercase'
                }}
              >
                WEB4TG
              </span>
            </div>

            {/* Hero statement — ultra minimal */}
            <h1 
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontSize: '56px',
                fontWeight: 200,
                letterSpacing: '-0.03em',
                lineHeight: 1.0,
                color: '#fafafa'
              }}
            >
              Мы не
              <br />
              создаём
              <br />
              <span style={{ color: 'rgba(212, 175, 55, 0.9)' }}>
                приложения.
              </span>
            </h1>
            
            <m.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8"
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '15px',
                fontWeight: 300,
                lineHeight: 1.6,
                color: 'rgba(250,250,250,0.4)',
                maxWidth: '280px'
              }}
            >
              Мы создаём впечатления, которые невозможно забыть.
            </m.p>
          </m.div>

          {/* Scroll indicator */}
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-16 flex items-center gap-3"
          >
            <m.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4" style={{ color: 'rgba(212, 175, 55, 0.5)' }} />
            </m.div>
            <span style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.1em',
              color: 'rgba(250,250,250,0.25)',
              textTransform: 'uppercase'
            }}>
              Листайте
            </span>
          </m.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 1: THE STATEMENT — Single powerful claim
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-32 px-8">
          <ChapterReveal>
            <p 
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontSize: '28px',
                fontWeight: 300,
                letterSpacing: '-0.015em',
                lineHeight: 1.4,
                color: '#fafafa'
              }}
            >
              Telegram-магазин — это не про технологии.
              <br />
              <br />
              <span style={{ color: 'rgba(250,250,250,0.35)' }}>
                Это про то, как клиент чувствует ваш бренд в своих руках.
              </span>
            </p>
          </ChapterReveal>
        </section>

        {/* Elegant fold line */}
        <div className="mx-8">
          <div 
            className="h-px"
            style={{ 
              background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.2) 50%, transparent 100%)' 
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 2: THE CRAFT — Process glimpse
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-8">
          <ChapterReveal>
            <div className="mb-12">
              <span 
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.2em',
                  color: 'rgba(212, 175, 55, 0.6)',
                  textTransform: 'uppercase'
                }}
              >
                Ателье
              </span>
            </div>

            <div className="space-y-12">
              {[
                { num: '01', title: 'Стратегия', time: '3 дня' },
                { num: '02', title: 'Дизайн', time: '5 дней' },
                { num: '03', title: 'Разработка', time: '6 дней' },
              ].map((step, i) => (
                <m.div 
                  key={step.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="flex items-baseline justify-between"
                >
                  <div className="flex items-baseline gap-6">
                    <span style={{ 
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                      fontSize: '12px',
                      fontWeight: 300,
                      color: 'rgba(212, 175, 55, 0.5)'
                    }}>
                      {step.num}
                    </span>
                    <span style={{ 
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                      fontSize: '24px',
                      fontWeight: 300,
                      letterSpacing: '-0.02em',
                      color: '#fafafa'
                    }}>
                      {step.title}
                    </span>
                  </div>
                  <span style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: 'rgba(250,250,250,0.25)'
                  }}>
                    {step.time}
                  </span>
                </m.div>
              ))}
            </div>

            <div 
              className="mt-12 pt-8"
              style={{ borderTop: '1px solid rgba(250,250,250,0.06)' }}
            >
              <div className="flex items-baseline justify-between">
                <span style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'rgba(250,250,250,0.4)'
                }}>
                  Итого
                </span>
                <span style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  fontSize: '20px',
                  fontWeight: 300,
                  color: 'rgba(212, 175, 55, 0.9)'
                }}>
                  14 дней
                </span>
              </div>
            </div>
          </ChapterReveal>
        </section>

        {/* Elegant fold line */}
        <div className="mx-8">
          <div 
            className="h-px"
            style={{ 
              background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.2) 50%, transparent 100%)' 
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 3: THE PROOF — Minimal metrics
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-8">
          <ChapterReveal>
            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              {[
                { value: '127', label: 'проектов' },
                { value: '14', label: 'дней' },
                { value: '280', label: '% рост' },
                { value: '98', label: '% довольны' },
              ].map((stat, i) => (
                <m.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                    fontSize: '42px',
                    fontWeight: 200,
                    letterSpacing: '-0.03em',
                    color: '#fafafa',
                    lineHeight: 1
                  }}>
                    {stat.value}
                  </div>
                  <div 
                    className="mt-2"
                    style={{ 
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.05em',
                      color: 'rgba(250,250,250,0.3)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {stat.label}
                  </div>
                </m.div>
              ))}
            </div>
          </ChapterReveal>
        </section>

        {/* Elegant fold line */}
        <div className="mx-8">
          <div 
            className="h-px"
            style={{ 
              background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.2) 50%, transparent 100%)' 
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 4: THE VOICE — Testimonial
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-8">
          <ChapterReveal>
            <div className="mb-8">
              <span 
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  fontSize: '48px',
                  fontWeight: 200,
                  color: 'rgba(212, 175, 55, 0.3)'
                }}
              >
                "
              </span>
            </div>
            
            <p style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontSize: '22px',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              lineHeight: 1.45,
              color: '#fafafa'
            }}>
              Окупились за первый месяц. Клиенты говорят — лучший UX, который они видели.
            </p>
            
            <div className="mt-10 flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-full"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.1) 100%)',
                  border: '1px solid rgba(212,175,55,0.2)'
                }}
              />
              <div>
                <div style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#fafafa'
                }}>
                  Анна Козлова
                </div>
                <div style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'rgba(250,250,250,0.35)'
                }}>
                  MODA HOUSE
                </div>
              </div>
            </div>
          </ChapterReveal>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CHAPTER 5: THE DECISION — Final CTA
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-32 px-8">
          <ChapterReveal>
            <div className="text-center">
              <h2 style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                fontSize: '36px',
                fontWeight: 200,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                color: '#fafafa',
                marginBottom: '16px'
              }}>
                Готовы начать?
              </h2>
              
              <p style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'rgba(250,250,250,0.35)',
                marginBottom: '40px'
              }}>
                Ответим в течение часа
              </p>

              {/* Premium CTA */}
              <m.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={handleCTA}
                className="relative w-full h-[56px] rounded-full flex items-center justify-center gap-3 overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.9) 0%, rgba(180,140,40,0.9) 100%)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  boxShadow: '0 0 40px -10px rgba(212,175,55,0.4)'
                }}
                data-testid="button-cta-final"
              >
                <span style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#0a0a0a'
                }}>
                  Оставить заявку
                </span>
                <ArrowRight className="w-4 h-4" style={{ color: '#0a0a0a' }} />
              </m.button>

              {/* Secondary action */}
              <m.button
                whileHover={{ opacity: 0.7 }}
                onClick={handleDemo}
                className="mt-6 inline-flex items-center gap-2"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'rgba(212, 175, 55, 0.7)'
                }}
                data-testid="button-demo"
              >
                Посмотреть работы
                <ArrowRight className="w-3.5 h-3.5" />
              </m.button>
            </div>
          </ChapterReveal>
        </section>

        {/* Footer */}
        <footer className="py-16 px-8 text-center">
          <span style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.15em',
            color: 'rgba(250,250,250,0.15)',
            textTransform: 'uppercase'
          }}>
            WEB4TG Studio · 2024
          </span>
        </footer>

        <div className="h-8" />
      </div>
    </div>
  );
}

const ChapterReveal = memo(({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </m.div>
  );
});

export default memo(ShowcasePage);
