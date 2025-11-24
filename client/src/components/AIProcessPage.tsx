import { memo, useCallback } from "react";
import { 
  ArrowRight,
  Check,
  MessageSquare,
  Settings,
  Rocket,
  BarChart,
  ChevronRight
} from "lucide-react";

interface AIProcessPageProps {
  onNavigate: (path: string) => void;
}

const AIProcessPage = memo(({ onNavigate }: AIProcessPageProps) => {
  
  const handleNavigateConstructor = useCallback(() => {
    onNavigate('constructor');
  }, [onNavigate]);

  return (
    <div className="min-h-screen bg-[#000000] pb-24">
      <div className="max-w-md mx-auto px-6">
        
        {/* Hero */}
        <section className="pt-16 pb-12">
          <h1 
            className="text-center mb-4"
            style={{ 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(36px, 10vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: '1.1',
              color: '#FFFFFF'
            }}
          >
            Как это
            <br />
            работает?
          </h1>
          
          <p 
            className="text-center"
            style={{
              fontSize: '17px',
              lineHeight: '1.47',
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '-0.01em'
            }}
          >
            Внедрение AI агента за 4 простых шага
          </p>
        </section>

        {/* Process Steps */}
        <section className="space-y-4 mb-12">
          
          {/* Step 1 */}
          <ProcessStep
            number="1"
            title="Консультация"
            description="Обсудим вашу задачу и определим лучшее решение"
            duration="15 минут"
            accentColor="rgba(0, 122, 255, 0.15)"
            iconColor="#007AFF"
            icon={<MessageSquare className="w-5 h-5" />}
          />

          {/* Step 2 */}
          <ProcessStep
            number="2"
            title="Настройка"
            description="Подключим AI агента к вашим системам и обучим"
            duration="1-2 дня"
            accentColor="rgba(52, 199, 89, 0.15)"
            iconColor="#34C759"
            icon={<Settings className="w-5 h-5" />}
          />

          {/* Step 3 */}
          <ProcessStep
            number="3"
            title="Запуск"
            description="Тестовый период с нашей поддержкой 24/7"
            duration="7 дней"
            accentColor="rgba(255, 159, 10, 0.15)"
            iconColor="#FF9F0A"
            icon={<Rocket className="w-5 h-5" />}
          />

          {/* Step 4 */}
          <ProcessStep
            number="4"
            title="Масштабирование"
            description="Анализ результатов и оптимизация работы"
            duration="Постоянно"
            accentColor="rgba(191, 90, 242, 0.15)"
            iconColor="#BF5AF2"
            icon={<BarChart className="w-5 h-5" />}
          />

        </section>

        {/* What You Get */}
        <section className="mb-12">
          <h2 
            className="text-center mb-6"
            style={{
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}
          >
            Что вы получите
          </h2>
          
          <div 
            className="rounded-[24px] p-6 space-y-4"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}
          >
            <BenefitItem text="AI агент, обученный на вашем бизнесе" />
            <BenefitItem text="Интеграция с вашими системами" />
            <BenefitItem text="Бесплатная поддержка первый месяц" />
            <BenefitItem text="Аналитика и отчёты в реальном времени" />
            <BenefitItem text="Обновления и улучшения AI" />
          </div>
        </section>

        {/* Pricing Highlight */}
        <section className="mb-12">
          <div 
            className="rounded-[24px] p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              border: '0.5px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 122, 255, 0.2)'
            }}
          >
            <div 
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '-0.01em',
                marginBottom: '12px'
              }}
            >
              Стоимость внедрения
            </div>
            <div 
              style={{
                fontSize: '48px',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: '#FFFFFF',
                lineHeight: '1',
                marginBottom: '8px'
              }}
            >
              от 85 000 ₽
            </div>
            <div 
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.01em'
              }}
            >
              Включает настройку, обучение и месяц поддержки
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-12">
          <button
            onClick={handleNavigateConstructor}
            className="w-full py-3.5 bg-[#0071E3] text-white font-semibold rounded-full transition-all duration-200 active:scale-[0.97] mb-3"
            style={{
              fontSize: '17px',
              letterSpacing: '-0.02em',
              boxShadow: '0 2px 8px rgba(0, 113, 227, 0.3)'
            }}
            data-testid="button-get-started"
          >
            Начать внедрение
          </button>
          
          <p 
            className="text-center"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.01em'
            }}
          >
            Бесплатная консультация · Без обязательств
          </p>
        </section>

      </div>
    </div>
  );
});

AIProcessPage.displayName = 'AIProcessPage';

// Process Step Component
const ProcessStep = memo(({ 
  number,
  title,
  description,
  duration,
  accentColor,
  iconColor,
  icon
}: { 
  number: string;
  title: string;
  description: string;
  duration: string;
  accentColor: string;
  iconColor: string;
  icon: React.ReactNode;
}) => (
  <div 
    className="rounded-[20px] p-5 relative overflow-hidden"
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    }}
  >
    {/* Step Number Badge */}
    <div className="flex items-start gap-4 mb-3">
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: '48px',
          height: '48px',
          background: accentColor,
          color: iconColor,
          fontSize: '20px',
          fontWeight: 700
        }}
      >
        {icon}
      </div>
      
      <div className="flex-1 pt-1">
        <div className="flex items-center justify-between mb-1">
          <h3 
            style={{
              fontSize: '19px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#FFFFFF'
            }}
          >
            {title}
          </h3>
          <div 
            className="px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500
            }}
          >
            {duration}
          </div>
        </div>
        <p 
          style={{
            fontSize: '15px',
            lineHeight: '1.4',
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '-0.01em'
          }}
        >
          {description}
        </p>
      </div>
    </div>

    {/* Step Number */}
    <div 
      className="absolute top-4 right-4 opacity-10"
      style={{
        fontSize: '72px',
        fontWeight: 800,
        color: '#FFFFFF',
        lineHeight: '1',
        pointerEvents: 'none'
      }}
    >
      {number}
    </div>
  </div>
));
ProcessStep.displayName = 'ProcessStep';

// Benefit Item Component
const BenefitItem = memo(({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div 
      className="flex-shrink-0 flex items-center justify-center rounded-full"
      style={{
        width: '24px',
        height: '24px',
        background: 'rgba(52, 199, 89, 0.2)',
        color: '#34C759'
      }}
    >
      <Check className="w-4 h-4" />
    </div>
    <p 
      style={{
        fontSize: '15px',
        lineHeight: '1.4',
        color: 'rgba(255, 255, 255, 0.85)',
        letterSpacing: '-0.01em'
      }}
    >
      {text}
    </p>
  </div>
));
BenefitItem.displayName = 'BenefitItem';

export default AIProcessPage;
