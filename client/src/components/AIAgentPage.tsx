import { memo, useCallback, useRef, useLayoutEffect } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Zap, 
  DollarSign, 
  Users, 
  MessageSquare, 
  BarChart3, 
  ShoppingCart, 
  Check, 
  ArrowRight, 
  Bot,
  Target,
  Rocket,
  Star,
  Trophy,
  Globe,
  Shield,
  Smartphone,
  Brain,
  ChevronRight,
  Crown,
  Phone,
  LineChart,
  Percent,
  TrendingDown
} from "lucide-react";

interface AIAgentPageProps {
  onNavigate: (path: string) => void;
}

const AIAgentPage = memo(({ onNavigate }: AIAgentPageProps) => {
  const heroBlockRef = useRef<HTMLDivElement>(null);
  
  const handleNavigateConstructor = useCallback(() => {
    onNavigate('constructor');
  }, [onNavigate]);

  useLayoutEffect(() => {
    const updateRobotPath = () => {
      if (heroBlockRef.current) {
        const blockWidth = heroBlockRef.current.offsetWidth;
        document.documentElement.style.setProperty('--robot-path', `${blockWidth - 60}px`);
      }
    };
    
    updateRobotPath();
    
    // Use ResizeObserver for container changes
    let resizeObserver: ResizeObserver | null = null;
    if (heroBlockRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateRobotPath);
      resizeObserver.observe(heroBlockRef.current);
    }
    
    // Fallback to window resize
    window.addEventListener('resize', updateRobotPath);
    
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateRobotPath);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto py-6 space-y-6">
        
        {/* Horizontal Gradient Banner - Static for instant load */}
        <div className="px-4">
          <div className="relative rounded-3xl overflow-hidden h-[200px]">
            {/* Animated gradient background */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(16, 185, 129, 0.3) 0%, 
                    rgba(5, 150, 105, 0.25) 25%,
                    rgba(6, 78, 59, 0.2) 50%,
                    rgba(5, 46, 22, 0.25) 75%,
                    rgba(16, 185, 129, 0.3) 100%)
                `,
                animation: 'gradient-shift 8s ease infinite',
                backgroundSize: '200% 200%'
              }}
            />
            
            {/* Dark gradient overlay */}
            <div className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)'
              }}
            />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"
                  style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)' }}
                />
                <span className="text-xs font-semibold tracking-[0.25em] text-emerald-400">
                  AI REVOLUTION 2025
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                ИИ Агент для бизнеса
              </h2>
              <p className="text-sm text-white/80">
                Автоматизация, которая окупается за 6-12 месяцев
              </p>
            </div>
          </div>
        </div>
        
        {/* Liquid Glass Hero Block */}
        <div className="px-4">
          <div ref={heroBlockRef} className="relative rounded-3xl p-[2px]"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(5, 150, 105, 0.5))'
            }}
          >
            <div className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: `
                  inset 0 2px 15px rgba(16, 185, 129, 0.15),
                  inset -8px -8px 0px -8px rgba(255, 255, 255, 0.2),
                  0 0 15px rgba(16, 185, 129, 0.4),
                  0 0 30px rgba(16, 185, 129, 0.2)
                `
              }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Bot className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">
                    ИИ Агент — сотрудник, который не спит
                  </h2>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Работает 24/7 без отпусков и больничных</p>
                      <p className="text-sm text-white/60">85% компаний уже внедрили в 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Обрабатывает 80% запросов автоматически</p>
                      <p className="text-sm text-white/60">Без участия человека</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">192% средний ROI за первый год</p>
                      <p className="text-sm text-white/60">74% компаний окупили за 6-12 месяцев</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleNavigateConstructor}
                  className="w-full py-4 font-semibold text-white text-base tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-2xl relative overflow-hidden group"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1.5px solid rgba(16, 185, 129, 0.4)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Попробовать 7 дней бесплатно
                </button>
                <p className="text-xs text-center text-white/50 mt-3">
                  Без привязки карты • Отмена в любой момент
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <KeyBenefits />

        {/* Why Telegram */}
        <WhyTelegram />

        {/* Capabilities */}
        <Capabilities />

        {/* Final CTA */}
        <div className="px-4">
          <div className="relative rounded-3xl p-[2px]"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(5, 150, 105, 0.5))'
            }}
          >
            <div className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: `
                  inset 0 2px 15px rgba(16, 185, 129, 0.15),
                  inset -8px -8px 0px -8px rgba(255, 255, 255, 0.2),
                  0 0 15px rgba(16, 185, 129, 0.4),
                  0 0 30px rgba(16, 185, 129, 0.2)
                `
              }}
            >
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Начните зарабатывать с ИИ уже сегодня
                </h3>
                <p className="text-white/70 mb-6">
                  74% компаний окупили вложения за 6-12 месяцев
                </p>
                
                <button
                  onClick={handleNavigateConstructor}
                  className="w-full py-4 font-semibold text-white text-base tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-2xl relative overflow-hidden group"
                  style={{
                    background: 'rgba(16, 185, 129, 0.25)',
                    border: '1.5px solid rgba(16, 185, 129, 0.5)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.35)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.7)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Запустить ИИ агента
                </button>
                
                <p className="text-xs text-white/50 mt-4">
                  Настройка за 10 минут • Без кредитной карты
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

AIAgentPage.displayName = 'AIAgentPage';

const KeyBenefits = memo(() => (
  <section className="px-4">
    <h3 className="text-lg font-semibold text-white/90 mb-4 px-2">
      Конкретная выгода для вашего бизнеса
    </h3>
    
    {/* ROI & Cost Savings Block */}
    <div className="relative rounded-3xl p-[2px] mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(22, 163, 74, 0.4))'
      }}
    >
      <div className="rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          boxShadow: `
            inset 0 2px 12px rgba(34, 197, 94, 0.1),
            inset -6px -6px 0px -6px rgba(255, 255, 255, 0.15),
            0 0 12px rgba(34, 197, 94, 0.3)
          `
        }}
      >
        <div className="p-5">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-white">Финансовая отдача</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-2xl"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}
            >
              <div className="text-2xl font-bold text-green-400">192%</div>
              <div className="text-xs text-white/60 mt-1">Средний ROI</div>
              <div className="text-[10px] text-white/40 mt-0.5">за первый год</div>
            </div>
            
            <div className="text-center p-3 rounded-2xl"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}
            >
              <div className="text-2xl font-bold text-green-400">20-30%</div>
              <div className="text-xs text-white/60 mt-1">Снижение затрат</div>
              <div className="text-[10px] text-white/40 mt-0.5">на операции</div>
            </div>
          </div>
          
          <p className="text-sm text-white/70 mt-4 text-center">
            <span className="text-green-400 font-semibold">74% компаний</span> окупили вложения за 6-12 месяцев
          </p>
        </div>
      </div>
    </div>

    {/* Productivity Block */}
    <div className="relative rounded-3xl p-[2px] mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.4))'
      }}
    >
      <div className="rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: `
            inset 0 2px 12px rgba(59, 130, 246, 0.1),
            inset -6px -6px 0px -6px rgba(255, 255, 255, 0.15),
            0 0 12px rgba(59, 130, 246, 0.3)
          `
        }}
      >
        <div className="p-5">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-white">Производительность</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(59, 130, 246, 0.1)' }}
            >
              <span className="text-sm text-white/80">Автоматизация задач</span>
              <span className="text-base font-bold text-blue-400">36%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(59, 130, 246, 0.1)' }}
            >
              <span className="text-sm text-white/80">Рост эффективности</span>
              <span className="text-base font-bold text-blue-400">40%+</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(59, 130, 246, 0.1)' }}
            >
              <span className="text-sm text-white/80">Сокращение времени</span>
              <span className="text-base font-bold text-blue-400">87%</span>
            </div>
          </div>
          
          <p className="text-sm text-white/70 mt-4 text-center">
            <span className="text-blue-400 font-semibold">39% компаний</span> удвоили продуктивность
          </p>
        </div>
      </div>
    </div>

    {/* Customer Service Block */}
    <div className="relative rounded-3xl p-[2px]"
      style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(147, 51, 234, 0.4))'
      }}
    >
      <div className="rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          boxShadow: `
            inset 0 2px 12px rgba(168, 85, 247, 0.1),
            inset -6px -6px 0px -6px rgba(255, 255, 255, 0.15),
            0 0 12px rgba(168, 85, 247, 0.3)
          `
        }}
      >
        <div className="p-5">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h4 className="font-semibold text-white">Клиентский сервис</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-2xl"
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}
            >
              <div className="text-2xl font-bold text-purple-400">80%</div>
              <div className="text-xs text-white/60 mt-1">Запросов</div>
              <div className="text-[10px] text-white/40 mt-0.5">автоматом</div>
            </div>
            
            <div className="text-center p-3 rounded-2xl"
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}
            >
              <div className="text-2xl font-bold text-purple-400">70%</div>
              <div className="text-xs text-white/60 mt-1">Экономия</div>
              <div className="text-[10px] text-white/40 mt-0.5">на поддержке</div>
            </div>
          </div>
          
          <p className="text-sm text-white/70 mt-4 text-center">
            Работает <span className="text-purple-400 font-semibold">24/7</span> с мгновенным ответом
          </p>
        </div>
      </div>
    </div>
  </section>
));
KeyBenefits.displayName = 'KeyBenefits';

const WhyTelegram = memo(() => (
  <section className="px-4">
    <h3 className="text-lg font-semibold text-white/90 mb-4 px-2">
      Почему 85% бизнеса выбирают ИИ агентов в 2025?
    </h3>
    
    <div className="relative rounded-3xl p-[2px]"
      style={{
        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.4), rgba(234, 88, 12, 0.4))'
      }}
    >
      <div className="rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(249, 115, 22, 0.25)',
          boxShadow: `
            inset 0 2px 12px rgba(249, 115, 22, 0.1),
            inset -6px -6px 0px -6px rgba(255, 255, 255, 0.15),
            0 0 12px rgba(249, 115, 22, 0.3)
          `
        }}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(249, 115, 22, 0.2)' }}
            >
              <Trophy className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                Рынок $7.6 млрд в 2025 → $47.1 млрд к 2030
              </h4>
              <p className="text-sm text-white/70">
                Рост <span className="text-orange-400 font-semibold">+45.8% в год</span> — революция уже здесь
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(249, 115, 22, 0.2)' }}
            >
              <LineChart className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                96% IT-лидеров расширяют использование ИИ
              </h4>
              <p className="text-sm text-white/70">
                Кто не внедряет сейчас — отстают навсегда
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(249, 115, 22, 0.2)' }}
            >
              <Rocket className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                Telegram — платформа #1 для ИИ агентов
              </h4>
              <p className="text-sm text-white/70">
                <span className="text-orange-400 font-semibold">950+ млн</span> пользователей, запуск за 10 минут, в 5 раз дешевле WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));
WhyTelegram.displayName = 'WhyTelegram';

const Capabilities = memo(() => (
  <section className="px-4">
    <h3 className="text-lg font-semibold text-white/90 mb-4 px-2">
      Что умеет ИИ агент
    </h3>
    
    <div className="relative rounded-3xl p-[2px]"
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(79, 70, 229, 0.4))'
      }}
    >
      <div className="rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: `
            inset 0 2px 12px rgba(99, 102, 241, 0.1),
            inset -6px -6px 0px -6px rgba(255, 255, 255, 0.15),
            0 0 12px rgba(99, 102, 241, 0.3)
          `
        }}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            <h4 className="font-semibold text-white">Продаёт 24/7: товары, услуги, консультации</h4>
          </div>
          
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h4 className="font-semibold text-white">Общается как человек + 150 языков</h4>
          </div>
          
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h4 className="font-semibold text-white">Анализирует поведение, дает рекомендации</h4>
          </div>
          
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-indigo-400" />
            <h4 className="font-semibold text-white">Возвращает клиентов через персонализацию</h4>
          </div>
        </div>
      </div>
    </div>
  </section>
));
Capabilities.displayName = 'Capabilities';

export default AIAgentPage;
