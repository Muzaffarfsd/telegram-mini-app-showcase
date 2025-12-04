import { ArrowRight, Zap, Shield, Clock, Users, Code, Rocket } from "lucide-react";

interface AboutPageProps {
  onNavigate: (section: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div 
      className="min-h-screen pb-32 smooth-scroll-page"
      data-scroll="about"
      style={{ 
        background: '#09090B',
        color: '#E4E4E7',
        paddingTop: '140px'
      }}
    >
      <div className="max-w-md mx-auto">
        
        {/* HERO SECTION */}
        <header className="px-7 pt-8 pb-16">
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
            О студии
          </p>
          
          <h1 
            className="scroll-fade-in-delay-1"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
              color: '#FAFAFA'
            }}
          >
            Мы создаём
            <br />
            <span style={{ color: '#A78BFA' }}>будущее продаж</span>
            <br />
            в Telegram.
          </h1>
          
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
            Web4TG Studio — команда разработчиков, специализирующихся на премиальных Telegram Mini Apps для бизнеса.
          </p>
        </header>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* MISSION SECTION */}
        <section className="px-7 py-12">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            Миссия
          </p>
          
          <div 
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.04) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.15)'
            }}
          >
            <p style={{
              fontSize: '17px',
              fontWeight: 500,
              color: '#E4E4E7',
              lineHeight: '1.5',
              fontStyle: 'italic'
            }}>
              «Сделать передовые технологии доступными для каждого бизнеса — от локальной кофейни до федеральной сети.»
            </p>
          </div>
        </section>

        {/* VALUES SECTION */}
        <section className="px-7 py-8">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            Наши принципы
          </p>
          
          <div className="space-y-4">
            {[
              { 
                icon: Shield, 
                title: 'Качество без компромиссов', 
                desc: 'Каждое приложение проходит 47 проверок перед запуском'
              },
              { 
                icon: Clock, 
                title: 'Скорость', 
                desc: 'От идеи до работающего MVP за 14 дней'
              },
              { 
                icon: Code, 
                title: 'Технологичность', 
                desc: 'React, TypeScript, современный стек 2025 года'
              },
              { 
                icon: Users, 
                title: 'Партнёрство', 
                desc: 'Мы не подрядчики — мы ваши технические партнёры'
              }
            ].map((item, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  flexShrink: 0
                }}>
                  <item.icon size={20} color="#A78BFA" />
                </div>
                <div>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#FAFAFA',
                    marginBottom: '4px'
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: '#71717A',
                    lineHeight: '1.4'
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="px-7 py-8">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            В цифрах
          </p>
          
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}
          >
            {[
              { value: '50+', label: 'проектов запущено' },
              { value: '14', label: 'дней средний срок' },
              { value: '127%', label: 'средний рост продаж' },
              { value: '24/7', label: 'поддержка клиентов' }
            ].map((stat, index) => (
              <div 
                key={index}
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  textAlign: 'center'
                }}
              >
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FAFAFA',
                  letterSpacing: '-0.03em'
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#52525B',
                  marginTop: '4px'
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-7 py-12">
          <div 
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              background: 'rgba(139, 92, 246, 0.2)',
              margin: '0 auto 16px'
            }}>
              <Rocket size={28} color="#A78BFA" />
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#FAFAFA',
              marginBottom: '8px'
            }}>
              Готовы начать?
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: '#71717A',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Обсудим ваш проект и подберём
              <br />
              оптимальное решение
            </p>
            
            <button
              onClick={() => onNavigate('constructor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                background: '#A78BFA',
                border: 'none',
                color: '#09090B',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              data-testid="button-cta-constructor"
            >
              Заказать проект
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="px-7 py-8 pb-16">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            Контакты
          </p>
          
          <div 
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '12px',
                color: '#52525B',
                marginBottom: '4px'
              }}>
                Telegram
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#FAFAFA'
              }}>
                @web4tg_studio
              </p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '12px',
                color: '#52525B',
                marginBottom: '4px'
              }}>
                Email
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#FAFAFA'
              }}>
                hello@web4tg.studio
              </p>
            </div>
            
            <div>
              <p style={{
                fontSize: '12px',
                color: '#52525B',
                marginBottom: '4px'
              }}>
                Время работы
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#FAFAFA'
              }}>
                Пн-Пт, 10:00 — 19:00 МСК
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
