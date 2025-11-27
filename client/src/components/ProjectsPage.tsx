import { demoApps } from "../data/demoApps";
import { ArrowRight, Clock, TrendingUp, Shield, Zap } from "lucide-react";

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
            HERO - Обещание прибыли + Дефицит + Авторитет
        ═══════════════════════════════════════════════════════ */}
        <header className="px-6 pt-16 pb-10">
          {/* Authority Badge */}
          <p 
            className="text-center mb-6 scroll-fade-in"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.15em',
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase'
            }}
          >
            Telegram Official Partner
          </p>
          
          {/* Main Promise */}
          <h1 
            className="text-center scroll-fade-in-delay-1"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: '1.15',
              color: '#FFFFFF'
            }}
          >
            Запустим Mini App,
            <br />
            <span style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
              который окупится
            </span>
            <br />
            <span 
              style={{ 
                background: 'linear-gradient(90deg, #34C759 0%, #30D158 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              за 14 дней
            </span>
          </h1>
          
          {/* Value Prop */}
          <p 
            className="text-center mt-5 scroll-fade-in-delay-2"
            style={{
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: '1.55',
              color: 'rgba(255, 255, 255, 0.5)',
              maxWidth: '300px',
              margin: '20px auto 0'
            }}
          >
            Покажем, как клиенты начнут платить через Telegram. Иначе вернём предоплату.
          </p>

          {/* Scarcity Badge */}
          <div className="flex justify-center mt-6 scroll-fade-in-delay-2">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(255, 149, 0, 0.1)',
                border: '1px solid rgba(255, 149, 0, 0.25)'
              }}
            >
              <Clock className="w-3.5 h-3.5 text-[#FF9500]" />
              <span 
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#FF9500',
                  letterSpacing: '0.01em'
                }}
              >
                Осталось 3 слота на декабрь
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="mt-7 scroll-fade-in-delay-3">
            <a
              href="https://t.me/web4tgs"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold transition-all duration-300"
              style={{
                background: '#FFFFFF',
                color: '#0A0A0A',
                fontSize: '16px',
                letterSpacing: '-0.01em',
                textDecoration: 'none'
              }}
              data-testid="button-audit-hero"
            >
              Забронировать аудит
              <ArrowRight className="w-4.5 h-4.5" />
            </a>
            
            {/* Reciprocity */}
            <p 
              className="text-center mt-3"
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)'
              }}
            >
              Бесплатно · Первый месяц поддержки в подарок
            </p>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════
            SOCIAL PROOF STRIP
        ═══════════════════════════════════════════════════════ */}
        <section 
          className="px-6 py-5"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>50+</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>компаний</p>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)' }} />
            <div className="text-center flex-1">
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>87M ₽</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>выручки</p>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)' }} />
            <div className="text-center flex-1">
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>212%</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>ROI</p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION LABEL - Editorial
        ═══════════════════════════════════════════════════════ */}
        <div className="px-6 pt-8 pb-5">
          <p 
            className="text-center"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.01em'
            }}
          >
            Выбирайте демо — адаптируем под вашу воронку за 10–14 дней
          </p>
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
            LOSS AVERSION + FUTURE PACING
        ═══════════════════════════════════════════════════════ */}
        <section className="px-6 mt-10">
          <div 
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255, 59, 48, 0.06)',
              border: '1px solid rgba(255, 59, 48, 0.12)'
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-[#FF3B30] flex-shrink-0 mt-0.5" />
              <div>
                <p 
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    marginBottom: '4px'
                  }}
                >
                  Конкуренты уже в Telegram
                </p>
                <p 
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    lineHeight: '1.5'
                  }}
                >
                  Каждый день без автоматизации = −63 000 ₽ упущенной выручки
                </p>
              </div>
            </div>
            
            <div 
              style={{
                height: '1px',
                background: 'rgba(255, 255, 255, 0.06)',
                margin: '16px 0'
              }}
            />
            
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#34C759] flex-shrink-0 mt-0.5" />
              <div>
                <p 
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    marginBottom: '4px'
                  }}
                >
                  Через 14 дней
                </p>
                <p 
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    lineHeight: '1.5'
                  }}
                >
                  MVP с вашим брендом, сценарии продаж, касса, аналитика — всё работает
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            ROI RIBBON
        ═══════════════════════════════════════════════════════ */}
        <section className="px-6 mt-8">
          <div 
            className="text-center py-5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.08) 0%, rgba(48, 209, 88, 0.04) 100%)',
              border: '1px solid rgba(52, 199, 89, 0.15)'
            }}
          >
            <p 
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: 'rgba(52, 199, 89, 0.8)',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}
            >
              Средний возврат инвестиций
            </p>
            <p 
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#34C759',
                letterSpacing: '-0.02em'
              }}
            >
              212%
            </p>
            <p 
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
                marginTop: '6px'
              }}
            >
              Окупаемость с 32-го заказа
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FINAL CTA - с гарантией
        ═══════════════════════════════════════════════════════ */}
        <section className="px-6 mt-10">
          <div 
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Headline */}
            <h2 
              style={{
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                marginBottom: '8px'
              }}
            >
              Готовы зарабатывать
              <br />
              в Telegram?
            </h2>
            
            {/* Subline */}
            <p 
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: '1.5',
                marginBottom: '20px'
              }}
            >
              Проведём стратегическую сессию, покажем прогноз оборота и дадим чек-лист. Бесплатно.
            </p>

            {/* Primary Button */}
            <a
              href="https://t.me/web4tgs"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold transition-all duration-300"
              style={{
                background: '#FFFFFF',
                color: '#0A0A0A',
                fontSize: '16px',
                letterSpacing: '-0.01em',
                textDecoration: 'none'
              }}
              data-testid="button-order-cta"
            >
              Получить стратегию
              <ArrowRight className="w-4.5 h-4.5" />
            </a>
            
            {/* Guarantee */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Shield className="w-4 h-4 text-[#34C759]" />
              <p 
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}
              >
                Докажем прибыль или вернём оплату
              </p>
            </div>

            {/* Urgency */}
            <p 
              className="mt-4 pt-4"
              style={{
                fontSize: '11px',
                color: 'rgba(255, 149, 0, 0.9)',
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              3 слота на декабрь · Цена 9 990 ₽ до 31.12
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 mt-10 pb-4 text-center">
          <p 
            style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              color: 'rgba(255, 255, 255, 0.2)',
              textTransform: 'uppercase'
            }}
          >
            Web4TG · 2025
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
          opacity: 0.92;
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
