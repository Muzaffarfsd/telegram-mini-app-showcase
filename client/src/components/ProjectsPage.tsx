import { demoApps } from "../data/demoApps";
import { ArrowRight, Sparkles } from "lucide-react";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const topApps = demoApps.slice(0, 11);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto px-5">
        
        {/* Compact Hero */}
        <div className="pt-14 pb-8">
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full scroll-fade-in"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <span 
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '0.04em'
                }}
              >
                11 ГОТОВЫХ РЕШЕНИЙ
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 
            className="text-center scroll-fade-in-delay-1"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(48px, 14vw, 64px)',
              fontWeight: 700,
              letterSpacing: '-0.055em',
              lineHeight: '0.95',
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.75) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '12px'
            }}
          >
            Витрина
          </h1>
          
          {/* Subtitle */}
          <p 
            className="text-center scroll-fade-in-delay-2"
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: '1.4'
            }}
          >
            Премиум приложения для бизнеса
          </p>
        </div>

        {/* ═══════════════════════════════════════════
            ORIGINAL APP CARDS - сохранены без изменений
        ═══════════════════════════════════════════ */}
        <div className="space-y-4">
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
                
                {/* Apple-style Open Button */}
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

        {/* ═══════════════════════════════════════════
            CTA BLOCK
        ═══════════════════════════════════════════ */}
        <div 
          className="mt-8 rounded-2xl p-6 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <p 
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '12px'
            }}
          >
            Разработка под ключ от 9 990 ₽
          </p>
          
          <a
            href="https://t.me/web4tgs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 active:scale-[0.97]"
            style={{
              background: '#FFFFFF',
              color: '#000000',
              fontSize: '15px',
              letterSpacing: '-0.01em',
              textDecoration: 'none'
            }}
            data-testid="button-order-cta"
          >
            Заказать
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
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

        .scroll-fade-in-delay-1 { animation-delay: 0.1s; }
        .scroll-fade-in-delay-2 { animation-delay: 0.15s; }
        .scroll-fade-in-delay-3 { animation-delay: 0.2s; }
        .scroll-fade-in-delay-4 { animation-delay: 0.25s; }
      `}</style>
    </div>
  );
}
