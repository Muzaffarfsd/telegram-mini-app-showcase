import { memo, useState } from "react";
import { 
  ArrowRight, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Shield,
  Zap,
  CreditCard,
  Code,
  Headphones
} from "lucide-react";

interface HelpPageProps {
  onBack: () => void;
}

const faq = [
  {
    q: "Сколько времени занимает разработка?",
    a: "Простой магазин — 5-7 дней. Ресторан с доставкой — 7-10 дней. Сложные проекты — до 14 дней.",
    icon: Clock
  },
  {
    q: "Какие способы оплаты вы принимаете?",
    a: "Банковские карты, СБП, электронные кошельки. Оплата поэтапно: 50% аванс, 50% при сдаче.",
    icon: CreditCard
  },
  {
    q: "Нужен ли мне Telegram Bot Token?",
    a: "Нет. Мы создаём Mini App, которое работает внутри Telegram без отдельного бота.",
    icon: Code
  },
  {
    q: "Можно ли вносить изменения после запуска?",
    a: "Первый месяц — бесплатная поддержка. Мелкие правки — бесплатно. Срочные исправления — 2 часа.",
    icon: Shield
  },
  {
    q: "Какую поддержку вы предоставляете?",
    a: "Техподдержка 24/7. Ответ в Telegram — 30 минут. Критические ошибки — 15 минут.",
    icon: Headphones
  }
];

const HelpPage = memo(function HelpPage({ onBack }: HelpPageProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ 
        background: '#09090B',
        color: '#E4E4E7',
        paddingTop: '140px'
      }}
    >
      <div className="max-w-md mx-auto">
        
        {/* HERO */}
        <header className="px-7 pt-8 pb-16">
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#71717A',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: '20px',
              padding: 0
            }}
            data-testid="button-back"
          >
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            Назад
          </button>
          
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
            Поддержка
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
            Мы всегда
            <br />
            <span style={{ color: '#A78BFA' }}>на связи.</span>
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
            Ответы на вопросы, техническая помощь и консультации — быстро и без очереди.
          </p>
        </header>

        {/* Hairline */}
        <div className="mx-7" style={{ height: '1px', background: '#27272A' }} />

        {/* CONTACT */}
        <section className="px-7 py-12">
          <p style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            Связаться
          </p>
          
          <div className="space-y-3">
            {[
              { 
                icon: MessageCircle, 
                title: 'Telegram', 
                value: '@web4tg_studio',
                desc: 'Ответ за 30 минут',
                action: () => window.open('https://t.me/web4tgs', '_blank'),
                primary: true
              },
              { 
                icon: Phone, 
                title: 'Телефон', 
                value: '+7 (999) 999-99-99',
                desc: '10:00 — 19:00 МСК',
                action: () => window.open('tel:+79999999999', '_blank'),
                primary: false
              },
              { 
                icon: Mail, 
                title: 'Email', 
                value: 'hello@web4tg.studio',
                desc: 'Для документов',
                action: () => window.open('mailto:hello@web4tg.studio', '_blank'),
                primary: false
              }
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '14px',
                  background: item.primary 
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.04) 100%)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: item.primary 
                    ? '1px solid rgba(139, 92, 246, 0.15)'
                    : '1px solid rgba(255, 255, 255, 0.04)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                data-testid={`button-contact-${index}`}
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
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#FAFAFA',
                    marginBottom: '2px'
                  }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: '13px', color: '#A1A1AA' }}>
                    {item.value}
                  </p>
                  <p style={{ fontSize: '11px', color: '#52525B', marginTop: '2px' }}>
                    {item.desc}
                  </p>
                </div>
                <ArrowRight size={18} color="#52525B" />
              </button>
            ))}
          </div>
        </section>

        {/* Hairline */}
        <div className="mx-7" style={{ height: '1px', background: '#27272A' }} />

        {/* FAQ */}
        <section className="px-7 py-12">
          <p style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            Частые вопросы
          </p>
          
          <div className="space-y-3">
            {faq.map((item, index) => {
              const isOpen = expanded === index;
              return (
                <div 
                  key={index}
                  style={{
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : index)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '18px 20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    data-testid={`button-faq-${index}`}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      flexShrink: 0
                    }}>
                      <item.icon size={18} color="#A78BFA" />
                    </div>
                    <p style={{
                      flex: 1,
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#FAFAFA',
                      lineHeight: '1.4'
                    }}>
                      {item.q}
                    </p>
                    {isOpen ? (
                      <ChevronUp size={18} color="#52525B" />
                    ) : (
                      <ChevronDown size={18} color="#52525B" />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div style={{ padding: '0 20px 18px 70px' }}>
                      <p style={{
                        fontSize: '13px',
                        color: '#71717A',
                        lineHeight: '1.6'
                      }}>
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Hairline */}
        <div className="mx-7" style={{ height: '1px', background: '#27272A' }} />

        {/* STATS */}
        <section className="px-7 py-12">
          <p style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            Наши гарантии
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { value: '30м', label: 'время ответа' },
              { value: '24/7', label: 'техподдержка' },
              { value: '100%', label: 'гарантия качества' },
              { value: '14', label: 'дней на проект' }
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

        {/* CTA */}
        <section className="px-7 py-8 pb-16">
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
              <Zap size={28} color="#A78BFA" />
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#FAFAFA',
              marginBottom: '8px'
            }}>
              Не нашли ответ?
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: '#71717A',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Напишите нам — ответим
              <br />
              в течение 30 минут
            </p>
            
            <button
              onClick={() => window.open('https://t.me/web4tgs', '_blank')}
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
                cursor: 'pointer'
              }}
              data-testid="button-telegram-support"
            >
              Написать в Telegram
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
});

export default HelpPage;
