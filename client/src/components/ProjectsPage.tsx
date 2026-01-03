import { demoApps } from "../data/demoApps";
import { ArrowRight } from "lucide-react";
import { FavoritesSection } from "./FavoritesSection";
import { FavoriteButton } from "./FavoriteButton";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

export default function ProjectsPage({ onNavigate, onOpenDemo }: ProjectsPageProps) {
  const topApps = demoApps; // All 13 apps

  return (
    <div 
      className="min-h-screen pb-32 smooth-scroll-page"
     
      style={{ 
        background: 'var(--surface)',
        color: 'var(--text-secondary)',
        paddingTop: '140px'
      }}
    >
      <div className="max-w-md mx-auto">
        
        {/* ═══════════════════════════════════════════════════════
            TIER 1: HERO — Authority-Led, Understated
        ═══════════════════════════════════════════════════════ */}
        <header className="px-7 pt-8 pb-16">
          {/* Eyebrow */}
          <p 
            className="scroll-fade-in light:text-black"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: 'var(--text-quaternary)',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}
          >
            Web4TG Studio
          </p>
          
          {/* Headline */}
          <h1 
            className="scroll-fade-in-delay-1"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '28px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: '1.3',
              color: 'var(--text-primary)'
            }}
          >
            Премиальные приложения
            <br />
            <span style={{ color: 'var(--accent-primary)' }}>
              для Telegram.
            </span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>
              Бизнес-решения нового уровня.
            </span>
          </h1>
          
          {/* Scroll hint */}
          <div 
            className="scroll-fade-in-delay-2 flex items-center gap-3"
            style={{ marginTop: '28px' }}
          >
            <div className="scroll-icon" />
            <span style={{ fontSize: '15px', color: 'var(--accent-primary)', fontWeight: 500 }}>
              Смотреть примеры
            </span>
          </div>
          
          {/* Competitive FOMO Statement */}
          <div 
            className="scroll-fade-in-delay-3"
            style={{
              marginTop: '36px',
              padding: '24px',
              borderRadius: 'var(--card-radius)',
              background: 'var(--hero-gradient)',
              border: '1px solid var(--hero-border)',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <p style={{
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              Через 7 дней у вас будет
              <br />
              <span style={{ 
                color: 'var(--accent-primary)',
                fontWeight: 600
              }}>
                своё приложение.
              </span>
              <br />
              <span style={{ color: 'var(--text-tertiary)' }}>
                Или у вашего конкурента.
              </span>
            </p>
          </div>
          
          {/* Exclusivity Block */}
          <div 
            className="scroll-fade-in-delay-4"
            style={{
              marginTop: '12px',
              display: 'flex',
              gap: '12px'
            }}
          >
            {/* Left: What you get */}
            <div style={{
              flex: 1,
              padding: '20px 16px',
              borderRadius: 'var(--card-radius)',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                Не шаблон
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: '1.4'
              }}>
                Ваш бренд.
                <br />
                <span style={{ color: 'var(--accent-primary)' }}>Ваш стиль.</span>
                <br />
                Ваши правила.
              </p>
            </div>
            
            {/* Right: Availability */}
            <div style={{
              flex: 1,
              padding: '20px 16px',
              borderRadius: 'var(--card-radius)',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                Осталось
              </p>
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em'
              }}>
                3 слота
              </p>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-tertiary)',
                marginTop: '4px'
              }}>
                на Декабрь
              </p>
            </div>
          </div>
        </header>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: 'var(--divider)' }}
        />

        {/* ═══════════════════════════════════════════════════════
            FAVORITES SECTION — Liquid Glass Style
        ═══════════════════════════════════════════════════════ */}
        <div className="py-6">
          <FavoritesSection onOpenDemo={onOpenDemo} />
        </div>

        {/* ═══════════════════════════════════════════════════════
            TIER 2: CURATED SHOWCASE INTRO
        ═══════════════════════════════════════════════════════ */}
        <section className="px-7 py-10">
          <div className="flex items-baseline justify-between">
            <p 
              style={{
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                color: 'var(--text-quaternary)',
                textTransform: 'uppercase'
              }}
            >
              Коллекция приложений
            </p>
            <p 
              style={{
                fontSize: '13px',
                color: 'var(--text-quaternary)'
              }}
            >
              {topApps.length} проектов
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            APP CARDS — ОРИГИНАЛЬНЫЕ, БЕЗ ИЗМЕНЕНИЙ
        ═══════════════════════════════════════════════════════ */}
        <div className="px-5 space-y-3">
          {topApps.map((app, index) => (
            <div
              key={app.id}
              onClick={() => onOpenDemo(app.id)}
              className={`premium-card group scroll-fade-in-delay-${Math.min(index + 1, 4)}`}
              data-testid={`card-app-${app.id}`}
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: 'var(--card-radius)',
                padding: '20px 20px 20px 24px',
                background: 'var(--card-bg)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                opacity: 0,
                animationDelay: `${0.05 + index * 0.04}s`,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 
                    data-testid={`text-title-${app.id}`}
                    style={{
                      fontSize: '17px',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: 'var(--text-primary)',
                      marginBottom: '4px'
                    }}
                  >
                    {app.title}
                  </h3>
                  <p 
                    data-testid={`text-description-${app.id}`}
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.4',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '-0.005em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {app.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FavoriteButton demoId={app.id} size="md" />
                  
                  <button
                    className="open-button flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300"
                    style={{
                      background: 'var(--button-secondary-bg)',
                      border: '1px solid var(--button-secondary-border)',
                      color: 'var(--button-secondary-text)',
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                    }}
                    data-testid={`button-open-${app.id}`}
                  >
                    <span>Открыть</span>
                    <ArrowRight 
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" 
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            TIER 3: INSIGHT BAND — Discreet Metrics
        ═══════════════════════════════════════════════════════ */}
        <section className="px-7 mt-12">
          <div 
            style={{ 
              height: '1px', 
              background: 'var(--divider)',
              marginBottom: '32px'
            }}
          />
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                50+
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  marginTop: '4px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                проектов
              </p>
            </div>
            <div>
              <p 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                6
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  marginTop: '4px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                отраслей
              </p>
            </div>
            <div>
              <p 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                14
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  marginTop: '4px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                дней запуск
              </p>
            </div>
          </div>

          <div 
            style={{ 
              height: '1px', 
              background: 'var(--divider)',
              marginTop: '32px'
            }}
          />
        </section>

        {/* ═══════════════════════════════════════════════════════
            TIER 4: EXECUTIVE CTA — Refined & Confident
        ═══════════════════════════════════════════════════════ */}
        <section className="px-7 mt-12">
          <div className="text-center">
            {/* Pull Quote */}
            <p 
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '18px',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                marginBottom: '24px'
              }}
            >
              "Обсудим, как Telegram станет
              <br />
              вашим каналом продаж"
            </p>

            {/* CTA Button */}
            <a
              href="https://t.me/web4tgs"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button inline-flex items-center justify-center gap-2.5 w-full py-4 rounded-xl font-medium transition-all duration-300"
              style={{
                background: 'var(--button-primary-bg)',
                color: 'var(--button-primary-text)',
                fontSize: '15px',
                letterSpacing: '-0.01em',
                textDecoration: 'none'
              }}
              data-testid="button-order-cta"
            >
              Запросить консультацию
              <ArrowRight className="w-4 h-4" />
            </a>
            
            {/* Micro-copy */}
            <p 
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginTop: '16px',
                letterSpacing: '0.01em'
              }}
            >
              Бесплатно · Ответим в течение часа
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FOOTER — Minimal Signature
        ═══════════════════════════════════════════════════════ */}
        <footer className="px-7 mt-16 text-center">
          <div 
            style={{ 
              height: '1px', 
              background: 'var(--divider)',
              marginBottom: '24px'
            }}
          />
          <p 
            style={{
              fontSize: '10px',
              letterSpacing: '0.25em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase'
            }}
          >
            Web4TG · Telegram Mini Apps · 2025
          </p>
        </footer>

      </div>

      <style>{`
        .premium-card:hover {
          background: var(--card-hover);
          border-color: var(--card-border);
          box-shadow: var(--card-shadow-hover);
          transform: translateX(4px);
        }

        .premium-card:hover .open-button {
          background: var(--button-primary-bg);
          color: var(--button-primary-text);
          border-color: transparent;
        }

        .premium-card:active {
          transform: translateX(2px);
          opacity: 0.9;
        }

        .cta-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: var(--card-shadow-hover);
        }

        .cta-button:active {
          transform: translateY(0);
          box-shadow: none;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scroll-fade-in,
        .scroll-fade-in-delay-1,
        .scroll-fade-in-delay-2,
        .scroll-fade-in-delay-3,
        .scroll-fade-in-delay-4 {
          animation: fadeSlideIn 0.6s ease-out forwards;
        }

        .scroll-fade-in { animation-delay: 0.05s; }
        .scroll-fade-in-delay-1 { animation-delay: 0.1s; }
        .scroll-fade-in-delay-2 { animation-delay: 0.18s; }
        .scroll-fade-in-delay-3 { animation-delay: 0.26s; }
        .scroll-fade-in-delay-4 { animation-delay: 0.34s; }

        /* Scroll icon */
        .scroll-icon {
          width: 20px;
          height: 32px;
          border: 2px solid var(--accent-primary);
          border-radius: 10px;
          position: relative;
        }

        .scroll-icon::before {
          content: '';
          width: 4px;
          height: 6px;
          background: var(--accent-primary);
          border-radius: 2px;
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          animation: scrollPulse 2s ease-in-out infinite;
        }

        @keyframes scrollPulse {
          0%, 20% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80%, 100% { opacity: 0; transform: translateX(-50%) translateY(14px); }
        }
      `}</style>
    </div>
  );
}
