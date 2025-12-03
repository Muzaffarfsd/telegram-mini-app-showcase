import { useState, memo } from "react";
import { 
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Shield,
  CreditCard,
  Code,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowRight,
  Headphones,
  HelpCircle,
  Settings,
  Smartphone,
  Package,
  DollarSign
} from "lucide-react";

interface HelpPageProps {
  onBack: () => void;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon: any;
  color: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "Сколько времени занимает разработка?",
    answer: "Простой магазин — 5-7 дней\nРесторан с доставкой — 7-10 дней\nФитнес-центр — 8-12 дней\nСложные проекты — до 14 дней",
    icon: Clock,
    color: "#3B82F6"
  },
  {
    id: 2,
    question: "Какие способы оплаты вы принимаете?",
    answer: "Банковские карты, СБП, онлайн-банкинг, электронные кошельки.\nОплата поэтапно: 50% аванс, 50% при сдаче проекта.",
    icon: CreditCard,
    color: "#22C55E"
  },
  {
    id: 3,
    question: "Нужен ли мне Telegram Bot Token?",
    answer: "Нет! Мы создаём Mini App, которое работает внутри Telegram без отдельного бота.\nАвтоматическая интеграция, работает на всех устройствах.",
    icon: Smartphone,
    color: "#A78BFA"
  },
  {
    id: 4,
    question: "Можно ли вносить изменения после запуска?",
    answer: "Первый месяц — бесплатная поддержка.\nМелкие правки — бесплатно.\nСрочные исправления — в течение 2 часов.",
    icon: Package,
    color: "#F59E0B"
  },
  {
    id: 5,
    question: "Насколько безопасны платежи?",
    answer: "Сертифицированные платёжные системы.\nЗащищённый протокол HTTPS.\nСтандарт PCI DSS.\nИнтеграция с Telegram Payments.",
    icon: Shield,
    color: "#EF4444"
  },
  {
    id: 6,
    question: "Какую поддержку вы предоставляете?",
    answer: "Техподдержка 24/7.\nОтвет в Telegram — 30 минут.\nКритические ошибки — 15 минут.\nОбучение работе с админ-панелью.",
    icon: Headphones,
    color: "#14B8A6"
  },
  {
    id: 7,
    question: "Что входит в базовый пакет?",
    answer: "Каталог товаров/услуг.\nКорзина и оформление заказов.\nАдминистративная панель.\nАдаптивный дизайн.\nБазовая аналитика.",
    icon: Settings,
    color: "#3B82F6"
  },
  {
    id: 8,
    question: "Сколько стоит разработка?",
    answer: "Магазин — от 25 000 ₽\nРесторан — от 30 000 ₽\nФитнес — от 35 000 ₽\nУникальные проекты — от 40 000 ₽",
    icon: DollarSign,
    color: "#22C55E"
  },
  {
    id: 9,
    question: "Предоставляете ли вы исходный код?",
    answer: "Да! Полный исходный код.\nДокументация по развёртыванию.\nПрава на коммерческое использование.\nВы — полноправный владелец.",
    icon: Code,
    color: "#A78BFA"
  }
];

const contactMethods = [
  {
    id: 1,
    title: "Telegram",
    description: "@web4tgs",
    detail: "Отвечаем за 30 минут",
    action: () => window.open('https://t.me/web4tgs', '_blank'),
    icon: MessageCircle,
    color: "#3B82F6",
    urgent: true
  },
  {
    id: 2,
    title: "Телефон",
    description: "+7 (999) 999-99-99",
    detail: "9:00 — 21:00 МСК",
    action: () => window.open('tel:+79999999999', '_blank'),
    icon: Phone,
    color: "#22C55E",
    urgent: false
  },
  {
    id: 3,
    title: "Email",
    description: "support@web4tg.com",
    detail: "Подробные вопросы",
    action: () => window.open('mailto:support@web4tg.com', '_blank'),
    icon: Mail,
    color: "#A78BFA",
    urgent: false
  }
];

const HelpPage = memo(function HelpPage({ onBack }: HelpPageProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

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
            Центр
            <br />
            <span style={{ color: '#3B82F6' }}>поддержки</span>
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
            Найдите ответы на все вопросы о создании Telegram приложений.
          </p>
        </header>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* CONTACT SECTION */}
        <section className="px-7 py-12">
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
            Связаться с нами
          </p>
          
          <div className="space-y-3">
            {contactMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div 
                  key={method.id}
                  onClick={method.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  data-testid={`button-contact-${method.id}`}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: `${method.color}15`,
                    flexShrink: 0
                  }}>
                    <IconComponent size={24} color={method.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#FAFAFA'
                      }}>
                        {method.title}
                      </p>
                      {method.urgent && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#EF4444',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Быстро
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', color: '#A1A1AA' }}>{method.description}</p>
                    <p style={{ fontSize: '12px', color: '#52525B' }}>{method.detail}</p>
                  </div>
                  <ArrowRight size={18} color="#52525B" />
                </div>
              );
            })}
          </div>
        </section>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* FAQ SECTION */}
        <section className="px-7 py-12">
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
            Частые вопросы
          </p>
          
          <div className="space-y-3">
            {faqItems.map((item) => {
              const IconComponent = item.icon;
              const isExpanded = expandedFAQ === item.id;
              
              return (
                <div 
                  key={item.id}
                  style={{
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px 20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    data-testid={`button-faq-${item.id}`}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      background: `${item.color}15`,
                      flexShrink: 0
                    }}>
                      <IconComponent size={18} color={item.color} />
                    </div>
                    <p style={{
                      flex: 1,
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#FAFAFA',
                      lineHeight: '1.4'
                    }}>
                      {item.question}
                    </p>
                    {isExpanded ? (
                      <ChevronUp size={18} color="#52525B" />
                    ) : (
                      <ChevronDown size={18} color="#52525B" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div style={{
                      padding: '0 20px 16px 68px'
                    }}>
                      <p style={{
                        fontSize: '13px',
                        color: '#71717A',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-line'
                      }}>
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* FEATURES SECTION */}
        <section className="px-7 py-12">
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
            Почему мы
          </p>
          
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}
          >
            {[
              { icon: Zap, value: '5-14', label: 'дней на разработку', color: '#A78BFA' },
              { icon: Shield, value: '100%', label: 'гарантия качества', color: '#22C55E' },
              { icon: Clock, value: '24/7', label: 'техподдержка', color: '#3B82F6' },
              { icon: Headphones, value: '30м', label: 'время ответа', color: '#F59E0B' }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
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
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    background: `${feature.color}15`,
                    margin: '0 auto 12px'
                  }}>
                    <IconComponent size={20} color={feature.color} />
                  </div>
                  <p style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#FAFAFA',
                    letterSpacing: '-0.03em',
                    marginBottom: '4px'
                  }}>
                    {feature.value}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#52525B'
                  }}>
                    {feature.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-7 py-8 pb-24">
          <div 
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
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
              background: 'rgba(59, 130, 246, 0.2)',
              margin: '0 auto 16px'
            }}>
              <HelpCircle size={28} color="#3B82F6" />
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
              Напишите нам в Telegram —
              <br />
              ответим в течение 30 минут
            </p>
            
            <button
              onClick={() => window.open('https://t.me/web4tgs', '_blank')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                background: '#3B82F6',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              data-testid="button-telegram-support"
            >
              <MessageCircle size={18} />
              Написать в Telegram
            </button>
          </div>
        </section>

      </div>
    </div>
  );
});

export default HelpPage;
