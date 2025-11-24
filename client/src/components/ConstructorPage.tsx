import { memo, useState } from "react";
import { 
  MessageSquare,
  Sparkles,
  Zap,
  BarChart3,
  Shield,
  CheckCircle2,
  ArrowRight,
  Bot,
  Users,
  Clock,
  TrendingUp,
  ShoppingBag,
  Coffee,
  Dumbbell,
  Palette,
  Smartphone
} from "lucide-react";

interface ConstructorPageProps {
  onNavigate: (path: string) => void;
}

const ConstructorPage = memo(({ onNavigate }: ConstructorPageProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#000000] pb-24">
      <div className="max-w-md mx-auto px-6">
        
        {/* Hero Section */}
        <section className="pt-16 pb-12">
          <div className="text-center">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{
                background: 'rgba(52, 199, 89, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '0.5px solid rgba(52, 199, 89, 0.3)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold tracking-wider text-green-400">
                БЕСПЛАТНО 7 ДНЕЙ
              </span>
            </div>

            <h1 
              className="mb-4"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(36px, 10vw, 48px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: '1.08',
                color: '#FFFFFF'
              }}
            >
              Как это работает
            </h1>
            
            <p 
              style={{
                fontSize: '17px',
                lineHeight: '1.47',
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '-0.01em'
              }}
            >
              ИИ агент интегрируется в ваше Telegram-приложение
              <br />
              и начинает работать за 10 минут
            </p>
          </div>
        </section>

        {/* Integration Flow */}
        <section className="space-y-4 mb-12">
          <StepCard
            number={1}
            icon={<Smartphone className="w-5 h-5" />}
            title="Ваше приложение уже готово"
            description="Мы создали для вас полноценное бизнес-приложение в Telegram с каталогом, корзиной и оплатой"
            gradient="from-blue-500/10 to-cyan-500/10"
            iconBg="rgba(0, 122, 255, 0.15)"
            iconColor="#007AFF"
            isActive={currentStep === 1}
          />

          <StepCard
            number={2}
            icon={<Bot className="w-5 h-5" />}
            title="Добавляем AI агента в чат"
            description="Интегрируем умного помощника прямо в интерфейс вашего приложения — он появляется как кнопка чата"
            gradient="from-purple-500/10 to-pink-500/10"
            iconBg="rgba(175, 82, 222, 0.15)"
            iconColor="#AF52DE"
            isActive={currentStep === 2}
          />

          <StepCard
            number={3}
            icon={<Zap className="w-5 h-5" />}
            title="Агент начинает работать"
            description="Отвечает на вопросы клиентов, помогает выбрать товар, оформляет заказы и принимает оплату — всё автоматически"
            gradient="from-green-500/10 to-emerald-500/10"
            iconBg="rgba(52, 199, 89, 0.15)"
            iconColor="#34C759"
            isActive={currentStep === 3}
          />
        </section>

        {/* What AI Agent Does */}
        <section className="mb-12">
          <h2 
            className="mb-6"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}
          >
            Что умеет агент
          </h2>

          <div className="space-y-3">
            <CapabilityCard
              icon={<MessageSquare className="w-4.5 h-4.5" />}
              title="Консультирует клиентов 24/7"
              description="Отвечает на вопросы о товарах, услугах и ценах мгновенно"
            />
            
            <CapabilityCard
              icon={<ShoppingBag className="w-4.5 h-4.5" />}
              title="Помогает с выбором"
              description="Рекомендует товары на основе предпочтений клиента"
            />

            <CapabilityCard
              icon={<CheckCircle2 className="w-4.5 h-4.5" />}
              title="Оформляет заказы"
              description="Собирает корзину, оформляет доставку и принимает оплату"
            />

            <CapabilityCard
              icon={<BarChart3 className="w-4.5 h-4.5" />}
              title="Собирает аналитику"
              description="Показывает что интересует клиентов и где они уходят"
            />

            <CapabilityCard
              icon={<Users className="w-4.5 h-4.5" />}
              title="Персонализирует общение"
              description="Запоминает историю и предпочтения каждого клиента"
            />
          </div>
        </section>

        {/* Business Examples */}
        <section className="mb-12">
          <h2 
            className="mb-6"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}
          >
            Работает для любого бизнеса
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <BusinessExample
              icon={<ShoppingBag className="w-5 h-5" />}
              title="Магазины"
              iconBg="rgba(255, 45, 85, 0.15)"
              iconColor="#FF2D55"
            />
            <BusinessExample
              icon={<Coffee className="w-5 h-5" />}
              title="Рестораны"
              iconBg="rgba(255, 159, 10, 0.15)"
              iconColor="#FF9F0A"
            />
            <BusinessExample
              icon={<Dumbbell className="w-5 h-5" />}
              title="Фитнес"
              iconBg="rgba(52, 199, 89, 0.15)"
              iconColor="#34C759"
            />
            <BusinessExample
              icon={<Palette className="w-5 h-5" />}
              title="Салоны красоты"
              iconBg="rgba(191, 90, 242, 0.15)"
              iconColor="#BF5AF2"
            />
          </div>
        </section>

        {/* Results */}
        <section className="mb-12">
          <div 
            className="rounded-[28px] p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.08),
                0 8px 32px rgba(0, 0, 0, 0.35)
              `
            }}
          >
            <h3 
              className="mb-6 text-center"
              style={{
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#FFFFFF'
              }}
            >
              Результаты через месяц
            </h3>

            <div className="space-y-6">
              <ResultStat
                icon={<TrendingUp className="w-5 h-5" />}
                value="+40%"
                label="Рост конверсии в продажи"
              />
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <ResultStat
                icon={<Clock className="w-5 h-5" />}
                value="80%"
                label="Запросов обрабатывает автоматически"
              />
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <ResultStat
                icon={<Users className="w-5 h-5" />}
                value="24/7"
                label="Работает без выходных"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-8">
          <button
            className="w-full py-3.5 bg-[#0071E3] text-white font-semibold rounded-full transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2"
            style={{
              fontSize: '17px',
              letterSpacing: '-0.02em',
              boxShadow: '0 2px 8px rgba(0, 113, 227, 0.3)'
            }}
            data-testid="button-start-setup"
          >
            Начать настройку
            <ArrowRight className="w-5 h-5" />
          </button>

          <p 
            className="text-center mt-3"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.01em'
            }}
          >
            Первые 7 дней бесплатно · Без привязки карты
          </p>
        </section>

        {/* Trust badges */}
        <section className="flex items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Безопасно
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Без карты
            </span>
          </div>
        </section>

      </div>
    </div>
  );
});

ConstructorPage.displayName = 'ConstructorPage';

// Step Card Component
const StepCard = memo<{
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  isActive: boolean;
}>(({ number, icon, title, description, gradient, iconBg, iconColor, isActive }) => (
  <div
    className="rounded-[20px] p-5 transition-all duration-300"
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: `0.5px solid ${isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
      boxShadow: isActive ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
    }}
  >
    <div className="flex items-start gap-4">
      {/* Step number */}
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: '32px',
          height: '32px',
          background: iconBg,
          color: iconColor,
          fontSize: '15px',
          fontWeight: 700
        }}
      >
        {number}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div style={{ color: iconColor }}>
            {icon}
          </div>
          <h3 
            style={{
              fontSize: '17px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#FFFFFF'
            }}
          >
            {title}
          </h3>
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
  </div>
));

StepCard.displayName = 'StepCard';

// Capability Card Component
const CapabilityCard = memo<{
  icon: React.ReactNode;
  title: string;
  description: string;
}>(({ icon, title, description }) => (
  <div
    className="rounded-[16px] p-4"
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '0.5px solid rgba(255, 255, 255, 0.08)'
    }}
  >
    <div className="flex items-start gap-3">
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-lg mt-0.5"
        style={{
          width: '36px',
          height: '36px',
          background: 'rgba(0, 122, 255, 0.15)',
          color: '#007AFF'
        }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <h4 
          className="mb-1"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#FFFFFF'
          }}
        >
          {title}
        </h4>
        <p 
          style={{
            fontSize: '13px',
            lineHeight: '1.4',
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '-0.01em'
          }}
        >
          {description}
        </p>
      </div>
    </div>
  </div>
));

CapabilityCard.displayName = 'CapabilityCard';

// Business Example Component
const BusinessExample = memo<{
  icon: React.ReactNode;
  title: string;
  iconBg: string;
  iconColor: string;
}>(({ icon, title, iconBg, iconColor }) => (
  <div
    className="rounded-[16px] p-4 flex flex-col items-center gap-3"
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '0.5px solid rgba(255, 255, 255, 0.08)'
    }}
  >
    <div 
      className="flex items-center justify-center rounded-[12px]"
      style={{
        width: '48px',
        height: '48px',
        background: iconBg,
        color: iconColor
      }}
    >
      {icon}
    </div>
    <span 
      style={{
        fontSize: '14px',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center'
      }}
    >
      {title}
    </span>
  </div>
));

BusinessExample.displayName = 'BusinessExample';

// Result Stat Component
const ResultStat = memo<{
  icon: React.ReactNode;
  value: string;
  label: string;
}>(({ icon, value, label }) => (
  <div className="flex items-center gap-4">
    <div 
      className="flex-shrink-0 flex items-center justify-center rounded-[12px]"
      style={{
        width: '44px',
        height: '44px',
        background: 'rgba(52, 199, 89, 0.15)',
        color: '#34C759'
      }}
    >
      {icon}
    </div>
    
    <div className="flex-1">
      <div 
        style={{
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: '#FFFFFF',
          marginBottom: '2px'
        }}
      >
        {value}
      </div>
      <div 
        style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '-0.01em'
        }}
      >
        {label}
      </div>
    </div>
  </div>
));

ResultStat.displayName = 'ResultStat';

export default ConstructorPage;
