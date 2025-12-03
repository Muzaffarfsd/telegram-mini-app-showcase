import { demoApps } from "../data/demoApps";
import { ArrowRight } from "lucide-react";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

export default function ProjectsPage({ onNavigate, onOpenDemo }: ProjectsPageProps) {
  const topApps = demoApps; // All 13 apps

  return (
    <div 
      className="min-h-screen pb-32 relative"
      style={{ 
        background: '#09090B',
        color: '#E4E4E7',
        paddingTop: '140px'
      }}
    >
      {/* Premium ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 right-0 w-72 h-72 bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-48 left-0 w-56 h-56 bg-blue-500/5 rounded-full blur-[80px]" />
      </div>
      
      <div className="max-w-md mx-auto relative z-10">
        
        {/* ═══════════════════════════════════════════════════════
            TIER 1: HERO — Authority-Led, Understated
        ═══════════════════════════════════════════════════════ */}
        <header className="px-7 pt-8 pb-16">
          {/* Eyebrow */}
          <p 
            className="scroll-fade-in"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: '#71717A',
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
              color: '#FAFAFA'
            }}
          >
            Ваш следующий клиент
            <br />
            напишет через 4 минуты.
            <br />
            <span style={{ color: '#FFFFFF' }}>
              Кто ему ответит?
            </span>
          </h1>
          
          {/* Subtext */}
          <p 
            className="scroll-fade-in-delay-2"
            style={{
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: '1.6',
              color: '#71717A',
              marginTop: '20px',
              maxWidth: '320px'
            }}
          >
            Telegram Mini App отвечает мгновенно, консультирует и закрывает сделки — пока вы занимаетесь чем угодно. 50+ бизнесов уже продают на автомате.
          </p>
          
          {/* Competitive FOMO Statement */}
          <div 
            className="scroll-fade-in-delay-3"
            style={{
              marginTop: '36px',
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.04) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}
          >
            <p style={{
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: '#E4E4E7',
              lineHeight: '1.6'
            }}>
              Через 14 дней у вас будет
              <br />
              <span style={{ 
                color: '#A78BFA',
                fontWeight: 600
              }}>
                своё приложение.
              </span>
              <br />
              <span style={{ color: '#71717A' }}>
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
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#52525B',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                Не шаблон
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#FAFAFA',
                lineHeight: '1.4'
              }}>
                Ваш бренд.
                <br />
                Ваш стиль.
                <br />
                Ваши правила.
              </p>
            </div>
            
            {/* Right: Availability */}
            <div style={{
              flex: 1,
              padding: '20px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#52525B',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                Декабрь
              </p>
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#FAFAFA',
                letterSpacing: '-0.03em'
              }}>
                3
              </p>
              <p style={{
                fontSize: '12px',
                color: '#71717A',
                marginTop: '4px'
              }}>
                слота осталось
              </p>
            </div>
          </div>
        </header>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

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
                color: '#52525B',
                textTransform: 'uppercase'
              }}
            >
              Коллекция приложений
            </p>
            <p 
              style={{
                fontSize: '13px',
                color: '#52525B'
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
            TIER 3: INSIGHT BAND — Discreet Metrics
        ═══════════════════════════════════════════════════════ */}
        <section className="px-7 mt-12">
          <div 
            style={{ 
              height: '1px', 
              background: '#27272A',
              marginBottom: '32px'
            }}
          />
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#FAFAFA',
                  letterSpacing: '-0.02em'
                }}
              >
                50+
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: '#52525B',
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
                  color: '#FAFAFA',
                  letterSpacing: '-0.02em'
                }}
              >
                6
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: '#52525B',
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
                  color: '#FAFAFA',
                  letterSpacing: '-0.02em'
                }}
              >
                14
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: '#52525B',
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
              background: '#27272A',
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
                color: '#A1A1AA',
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
                background: '#FAFAFA',
                color: '#09090B',
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
                color: '#52525B',
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
              background: '#18181B',
              marginBottom: '24px'
            }}
          />
          <p 
            style={{
              fontSize: '10px',
              letterSpacing: '0.25em',
              color: '#3F3F46',
              textTransform: 'uppercase'
            }}
          >
            Web4TG · Telegram Mini Apps · 2025
          </p>
        </footer>

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
          background: #FFFFFF;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(250, 250, 250, 0.1);
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
      `}</style>
    </div>
  );
}
