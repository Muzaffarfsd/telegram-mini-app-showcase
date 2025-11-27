import { demoApps } from "../data/demoApps";
import { ArrowRight } from "lucide-react";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const topApps = demoApps.slice(0, 11);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-28">
      <div className="max-w-md mx-auto">
        
        {/* ═══════════════════════════════════════════════════════
            PREMIUM HERO - Editorial Style
        ═══════════════════════════════════════════════════════ */}
        <header className="px-6 pt-20 pb-12">
          {/* Overline */}
          <p 
            className="text-center mb-8 scroll-fade-in"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.25em',
              color: 'rgba(255, 255, 255, 0.35)',
              textTransform: 'uppercase'
            }}
          >
            Telegram Mini Apps
          </p>
          
          {/* Main Title */}
          <h1 
            className="text-center scroll-fade-in-delay-1"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '52px',
              fontWeight: 600,
              letterSpacing: '-0.045em',
              lineHeight: '1.0',
              color: '#FFFFFF'
            }}
          >
            Витрина
          </h1>
          
          {/* Subtitle */}
          <p 
            className="text-center mt-5 scroll-fade-in-delay-2"
            style={{
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.4)',
              maxWidth: '280px',
              margin: '20px auto 0'
            }}
          >
            Готовые решения для автоматизации продаж и клиентского сервиса
          </p>

          {/* Divider Line */}
          <div 
            className="mt-10 scroll-fade-in-delay-3"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)'
            }}
          />
          
          {/* Bottom Caption */}
          <p 
            className="text-center mt-6 scroll-fade-in-delay-3"
            style={{
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '0.35em',
              color: 'rgba(255, 255, 255, 0.2)',
              textTransform: 'uppercase'
            }}
          >
            Для лидеров рынка
          </p>
        </header>

        {/* ═══════════════════════════════════════════════════════
            SECTION LABEL
        ═══════════════════════════════════════════════════════ */}
        <div className="px-6 mb-5">
          <div className="flex items-center gap-4">
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span 
              style={{
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.2em',
                color: 'rgba(255, 255, 255, 0.25)',
                textTransform: 'uppercase'
              }}
            >
              Коллекция
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            ORIGINAL APP CARDS - НЕ ИЗМЕНЕНЫ
        ═══════════════════════════════════════════════════════ */}
        <div className="px-5 space-y-4">
          {topApps.map((app, index) => (
            <div
              key={app.id}
              onClick={() => onOpenDemo(app.id)}
              className={`premium-card group scroll-fade-in-delay-${Math.min(index + 1, 4)}`}
              data-testid={`card-app-${app.id}`}
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '16px',
                padding: '20px 20px 20px 24px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
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
                      color: '#FFFFFF',
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
                      color: 'rgba(255, 255, 255, 0.45)',
                      letterSpacing: '-0.005em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {app.description}
                  </p>
                </div>
                
                <button
                  className="open-button flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    flexShrink: 0
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
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            PREMIUM CTA SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="px-6 mt-12">
          {/* Top Line */}
          <div 
            style={{
              height: '1px',
              background: 'rgba(255,255,255,0.06)',
              marginBottom: '32px'
            }}
          />
          
          <div className="text-center">
            {/* CTA Title */}
            <h2 
              style={{
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                marginBottom: '8px'
              }}
            >
              Обсудим ваш проект
            </h2>
            
            {/* CTA Subtitle */}
            <p 
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '-0.005em',
                marginBottom: '24px'
              }}
            >
              Разработка под ключ от 14 дней
            </p>

            {/* Primary Button */}
            <a
              href="https://t.me/web4tgs"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold transition-all duration-300"
              style={{
                background: '#FFFFFF',
                color: '#0A0A0A',
                fontSize: '15px',
                letterSpacing: '-0.01em',
                textDecoration: 'none'
              }}
              data-testid="button-order-cta"
            >
              Связаться
              <ArrowRight className="w-4 h-4" />
            </a>
            
            {/* Secondary Link */}
            <p 
              className="mt-5"
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.3)',
                letterSpacing: '0.02em'
              }}
            >
              от 9 990 ₽ · Telegram · WhatsApp
            </p>
          </div>

          {/* Bottom Signature */}
          <div 
            className="mt-10 pt-8 text-center"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.04)'
            }}
          >
            <p 
              style={{
                fontSize: '9px',
                fontWeight: 500,
                letterSpacing: '0.3em',
                color: 'rgba(255, 255, 255, 0.15)',
                textTransform: 'uppercase'
              }}
            >
              Web4TG · 2025
            </p>
          </div>
        </section>

      </div>

      <style>{`
        .premium-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
        }

        .premium-card:hover .open-button {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .premium-card:active {
          transform: translateX(2px);
          opacity: 0.9;
        }

        .cta-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .cta-button:active {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
          animation: fadeSlideIn 0.7s ease-out forwards;
        }

        .scroll-fade-in { animation-delay: 0.05s; }
        .scroll-fade-in-delay-1 { animation-delay: 0.12s; }
        .scroll-fade-in-delay-2 { animation-delay: 0.2s; }
        .scroll-fade-in-delay-3 { animation-delay: 0.28s; }
        .scroll-fade-in-delay-4 { animation-delay: 0.35s; }
      `}</style>
    </div>
  );
}
