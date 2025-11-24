import { memo, useCallback, useState, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  Clock,
  TrendingUp
} from "lucide-react";

interface AIAgentPageProps {
  onNavigate: (path: string) => void;
}

const AIAgentPage = memo(({ onNavigate }: AIAgentPageProps) => {
  const [scrollY, setScrollY] = useState(0);
  
  const handleNavigateConstructor = useCallback(() => {
    onNavigate('constructor');
  }, [onNavigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] pb-24">
      <div className="max-w-md mx-auto">
        
        {/* Apple-style Hero Section - Massive whitespace, minimal text */}
        <section className="relative min-h-[85vh] flex items-center justify-center px-6 pt-20 pb-32">
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
              transform: `translateY(${scrollY * 0.3}px)`
            }}
          />
          
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Tiny label - Apple style */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/30 mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                Новое
              </span>
            </div>
            
            {/* Massive headline - 72px */}
            <h1 
              className="text-5xl sm:text-6xl font-semibold tracking-tight mb-6"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                letterSpacing: '-0.03em',
                lineHeight: '1.05'
              }}
            >
              <span className="text-white">ИИ агент.</span>
              <br />
              <span className="text-white">Для вашего</span>
              <br />
              <span className="text-white">бизнеса.</span>
            </h1>
            
            {/* Subtle description - light weight */}
            <p className="text-lg sm:text-xl font-normal text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Автоматизация, которая работает 24/7 и окупается за 6 месяцев
            </p>
            
            {/* Single clear CTA - Apple blue */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleNavigateConstructor}
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                data-testid="button-start-trial"
              >
                Попробовать бесплатно
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button 
                className="px-8 py-4 text-blue-400 font-medium rounded-full hover:bg-gray-900 transition-colors"
                data-testid="button-learn-more"
              >
                Узнать больше
              </button>
            </div>
            
            {/* Tiny caption */}
            <p className="text-sm text-gray-600 mt-6">
              Бесплатно 7 дней. Без привязки карты.
            </p>
          </div>
        </section>

        {/* Product Showcase - Large visuals like Apple */}
        <section className="px-6 py-20">
          <div className="mx-auto">
            {/* Floating card with product visual */}
            <div 
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(20, 20, 20, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div className="relative p-8">
                {/* Stats grid - clean, minimal */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-semibold text-white mb-2">
                      192%
                    </div>
                    <p className="text-base text-gray-400">
                      Средний ROI за первый год
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-5xl font-semibold text-white mb-2">
                      24/7
                    </div>
                    <p className="text-base text-gray-400">
                      Работает без выходных
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-5xl font-semibold text-white mb-2">
                      80%
                    </div>
                    <p className="text-base text-gray-400">
                      Запросов автоматически
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Apple grid layout */}
        <section className="px-6 py-20">
          <div className="mx-auto">
            <div className="grid grid-cols-1 gap-4">
              
              {/* Feature card 1 */}
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Мгновенный запуск"
                description="Настройка за 10 минут. Интеграция с вашими системами."
                gradient="from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20"
                iconColor="text-blue-600 dark:text-blue-400"
              />
              
              {/* Feature card 2 */}
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Безопасность"
                description="Полное шифрование данных. Соответствие GDPR."
                gradient="from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20"
                iconColor="text-green-600 dark:text-green-400"
              />
              
              {/* Feature card 3 */}
              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title="150+ языков"
                description="Общается с клиентами на их родном языке."
                gradient="from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20"
                iconColor="text-purple-600 dark:text-purple-400"
              />
              
              {/* Feature card 4 */}
              <FeatureCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Умная аналитика"
                description="Понимает контекст и учится на каждом разговоре."
                gradient="from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20"
                iconColor="text-orange-600 dark:text-orange-400"
              />
              
            </div>
          </div>
        </section>

        {/* Benefits - Clean list like Apple */}
        <section className="px-6 py-20">
          <div className="mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-12 text-center">
              Почему выбирают нас
            </h2>
            
            <div className="space-y-6">
              <BenefitRow
                icon={<Check className="w-6 h-6" />}
                title="Работает 24/7 без отпусков"
                description="Никогда не устаёт, не болеет, не уходит в отпуск"
              />
              
              <BenefitRow
                icon={<Check className="w-6 h-6" />}
                title="Обрабатывает запросы мгновенно"
                description="Средний ответ меньше 2 секунд"
              />
              
              <BenefitRow
                icon={<Check className="w-6 h-6" />}
                title="Окупается за 6-12 месяцев"
                description="74% компаний вернули инвестиции в первый год"
              />
              
              <BenefitRow
                icon={<Check className="w-6 h-6" />}
                title="Интеграция с любыми системами"
                description="CRM, ERP, мессенджеры, соцсети"
              />
            </div>
          </div>
        </section>

        {/* Final CTA - Apple style minimalism */}
        <section className="px-6 py-20">
          <div className="mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
              Начните сегодня
            </h2>
            
            <p className="text-lg text-gray-400 mb-12">
              Присоединяйтесь к 85% компаний, которые уже внедрили ИИ
            </p>
            
            <button
              onClick={handleNavigateConstructor}
              className="group px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-3"
              data-testid="button-start-cta"
            >
              Запустить ИИ агента
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
            
            <p className="text-sm text-gray-600 mt-8">
              7 дней бесплатно · Без кредитной карты · Настройка за 10 минут
            </p>
          </div>
        </section>

      </div>
    </div>
  );
});

AIAgentPage.displayName = 'AIAgentPage';

// Feature Card Component
const FeatureCard = memo(({ 
  icon, 
  title, 
  description, 
  gradient, 
  iconColor 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  gradient: string;
  iconColor: string;
}) => (
  <div 
    className="group relative p-6 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-default"
    style={{
      background: 'rgba(20, 20, 20, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
    }}
  >
    <div className={`${iconColor} mb-4`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">
      {title}
    </h3>
    <p className="text-base text-gray-400 leading-relaxed">
      {description}
    </p>
  </div>
));
FeatureCard.displayName = 'FeatureCard';

// Benefit Row Component
const BenefitRow = memo(({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="flex items-start gap-4 p-5 rounded-2xl hover:bg-gray-900/50 transition-colors">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-base font-semibold text-white mb-1">
        {title}
      </h4>
      <p className="text-sm text-gray-400">
        {description}
      </p>
    </div>
  </div>
));
BenefitRow.displayName = 'BenefitRow';

export default AIAgentPage;
