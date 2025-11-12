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
            {/* Dancing Robot - Jump, Spin & Dance! */}
            <div className="absolute z-20 pointer-events-none"
              style={{
                left: '20px',
                bottom: '-80px',
                animation: 'robotJumpSpin 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)'
              }}
            >
              <div style={{ 
                animation: 'robotBodyDance 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)',
                transformOrigin: 'center center'
              }}>
                {/* Simple Cute Robot SVG */}
                <svg width="60" height="70" viewBox="0 0 60 70" className="drop-shadow-2xl">
                  <defs>
                    <linearGradient id="robotYellow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FFA500" />
                    </linearGradient>
                    <linearGradient id="robotGray" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#9E9E9E" />
                      <stop offset="100%" stopColor="#616161" />
                    </linearGradient>
                  </defs>
                  
                  {/* Shadow */}
                  <ellipse cx="30" cy="66" rx="20" ry="4" fill="#000" opacity="0.4"
                    className="robot-shadow" />
                  
                  {/* Legs */}
                  <g className="robot-leg-left">
                    <rect x="18" y="50" width="8" height="16" rx="2" fill="url(#robotGray)" stroke="#424242" strokeWidth="1.5" />
                    <rect x="18" y="63" width="8" height="4" rx="1.5" fill="#616161" />
                  </g>
                  
                  <g className="robot-leg-right">
                    <rect x="34" y="50" width="8" height="16" rx="2" fill="url(#robotGray)" stroke="#424242" strokeWidth="1.5" />
                    <rect x="34" y="63" width="8" height="4" rx="1.5" fill="#616161" />
                  </g>
                  
                  {/* Main Body */}
                  <rect x="15" y="30" width="30" height="22" rx="3" fill="url(#robotYellow)" stroke="#F57C00" strokeWidth="2" />
                  
                  {/* Chest screen */}
                  <rect x="21" y="36" width="18" height="10" rx="2" fill="#2196F3" opacity="0.8" stroke="#1976D2" strokeWidth="1" />
                  <text x="30" y="43" fontSize="8" fill="#FFF" textAnchor="middle" fontFamily="monospace">AI</text>
                  
                  {/* Arms */}
                  <g className="robot-arm-left">
                    <rect x="8" y="34" width="7" height="14" rx="2" fill="url(#robotGray)" stroke="#424242" strokeWidth="1.5" />
                    <rect x="8" y="46" width="7" height="6" rx="1.5" fill="#757575" />
                  </g>
                  
                  <g className="robot-arm-right">
                    <rect x="45" y="34" width="7" height="14" rx="2" fill="url(#robotGray)" stroke="#424242" strokeWidth="1.5" />
                    <rect x="45" y="46" width="7" height="6" rx="1.5" fill="#757575" />
                  </g>
                  
                  {/* Neck */}
                  <rect x="26" y="22" width="8" height="9" rx="1.5" fill="url(#robotGray)" stroke="#616161" strokeWidth="1" />
                  
                  {/* Head */}
                  <rect x="20" y="8" width="20" height="16" rx="3" fill="url(#robotYellow)" stroke="#F57C00" strokeWidth="2" />
                  
                  {/* Eyes */}
                  <g className="robot-eyes">
                    <circle cx="25" cy="15" r="3.5" fill="#2196F3" />
                    <circle cx="25" cy="15" r="2" fill="#0D47A1" className="robot-eye-left" />
                    <circle cx="26" cy="14" r="1" fill="#FFFFFF" opacity="0.9" />
                    
                    <circle cx="35" cy="15" r="3.5" fill="#2196F3" />
                    <circle cx="35" cy="15" r="2" fill="#0D47A1" className="robot-eye-right" />
                    <circle cx="36" cy="14" r="1" fill="#FFFFFF" opacity="0.9" />
                  </g>
                  
                  {/* Antenna */}
                  <g className="robot-antenna">
                    <line x1="30" y1="8" x2="30" y2="3" stroke="#F57C00" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="30" cy="2" r="2" fill="#FF5722" />
                    <circle cx="30" cy="2" r="1.2" fill="#FFC107" opacity="0.8" />
                  </g>
                </svg>
              </div>
            </div>
            
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
              {/* Robot Dancing Animation */}
              <style>{`
                /* Jump up and spin 360° */
                @keyframes robotJumpSpin {
                  0% {
                    transform: translateY(0px);
                  }
                  /* Jump up */
                  15% {
                    transform: translateY(-80px);
                  }
                  /* Land */
                  30% {
                    transform: translateY(0px);
                  }
                  /* Stay grounded for dance */
                  100% {
                    transform: translateY(0px);
                  }
                }
                
                /* Body rotation + dance moves */
                @keyframes robotBodyDance {
                  /* Crouch before jump */
                  0% { 
                    transform: scaleY(0.85) rotate(0deg);
                  }
                  /* Stretch for takeoff */
                  10% {
                    transform: scaleY(1.1) rotate(0deg);
                  }
                  /* Spin 360° in air */
                  15% {
                    transform: scaleY(1) rotate(180deg);
                  }
                  22% {
                    transform: scaleY(1) rotate(360deg);
                  }
                  /* Landing squash */
                  30% {
                    transform: scaleY(0.8) rotate(360deg);
                  }
                  35% {
                    transform: scaleY(1.05) rotate(360deg);
                  }
                  40% {
                    transform: scaleY(1) rotate(360deg);
                  }
                  /* Dance - tilt left */
                  50% {
                    transform: scaleY(1) rotate(345deg);
                  }
                  /* Dance - tilt right */
                  60% {
                    transform: scaleY(1) rotate(375deg);
                  }
                  /* Dance - tilt left again */
                  70% {
                    transform: scaleY(1) rotate(345deg);
                  }
                  /* Dance - tilt right again */
                  80% {
                    transform: scaleY(1) rotate(375deg);
                  }
                  /* Return to normal */
                  90% {
                    transform: scaleY(1) rotate(360deg);
                  }
                  100% {
                    transform: scaleY(0.85) rotate(360deg);
                  }
                }
                
                /* Shadow synced with jump */
                .robot-shadow {
                  animation: robotShadow 8s ease-in-out infinite;
                }
                
                @keyframes robotShadow {
                  0%, 100% {
                    transform: scale(1, 1);
                    opacity: 0.4;
                  }
                  /* Shadow shrinks during jump */
                  15% {
                    transform: scale(0.5, 0.5);
                    opacity: 0.2;
                  }
                  /* Shadow expands on landing */
                  30% {
                    transform: scale(1.3, 1.3);
                    opacity: 0.5;
                  }
                  35% {
                    transform: scale(1, 1);
                    opacity: 0.4;
                  }
                }
                
                /* Antenna wiggle */
                .robot-antenna {
                  transform-origin: center bottom;
                  animation: antennaWiggle 0.5s ease-in-out infinite alternate;
                }
                
                @keyframes antennaWiggle {
                  0% { 
                    transform: rotate(-5deg);
                  }
                  100% { 
                    transform: rotate(5deg);
                  }
                }
                
                /* Arms dancing animation */
                .robot-arm-left {
                  transform-origin: top center;
                  animation: armDanceLeft 8s ease-in-out infinite;
                }
                
                .robot-arm-right {
                  transform-origin: top center;
                  animation: armDanceRight 8s ease-in-out infinite;
                }
                
                @keyframes armDanceLeft {
                  0%, 30%, 100% {
                    transform: rotate(0deg);
                  }
                  /* Raise during jump */
                  15% {
                    transform: rotate(-30deg);
                  }
                  /* Dance moves */
                  50% {
                    transform: rotate(45deg);
                  }
                  60% {
                    transform: rotate(-45deg);
                  }
                  70% {
                    transform: rotate(45deg);
                  }
                  80% {
                    transform: rotate(-45deg);
                  }
                }
                
                @keyframes armDanceRight {
                  0%, 30%, 100% {
                    transform: rotate(0deg);
                  }
                  /* Raise during jump */
                  15% {
                    transform: rotate(30deg);
                  }
                  /* Dance moves - opposite of left arm */
                  50% {
                    transform: rotate(-45deg);
                  }
                  60% {
                    transform: rotate(45deg);
                  }
                  70% {
                    transform: rotate(-45deg);
                  }
                  80% {
                    transform: rotate(45deg);
                  }
                }
                
                /* Legs dancing animation */
                .robot-leg-left {
                  transform-origin: top center;
                  animation: legDanceLeft 8s ease-in-out infinite;
                }
                
                .robot-leg-right {
                  transform-origin: top center;
                  animation: legDanceRight 8s ease-in-out infinite;
                }
                
                @keyframes legDanceLeft {
                  0%, 30%, 100% {
                    transform: rotate(0deg);
                  }
                  /* Bend for jump */
                  10% {
                    transform: rotate(-15deg);
                  }
                  /* Dance moves */
                  50% {
                    transform: rotate(10deg);
                  }
                  70% {
                    transform: rotate(-10deg);
                  }
                }
                
                @keyframes legDanceRight {
                  0%, 30%, 100% {
                    transform: rotate(0deg);
                  }
                  /* Bend for jump */
                  10% {
                    transform: rotate(15deg);
                  }
                  /* Dance moves - opposite of left */
                  50% {
                    transform: rotate(-10deg);
                  }
                  70% {
                    transform: rotate(10deg);
                  }
                }
                
                /* Eyes blinking */
                .robot-eye-left, .robot-eye-right {
                  animation: eyeBlink 3s ease-in-out infinite;
                }
                
                @keyframes eyeBlink {
                  0%, 92%, 100% { 
                    transform: scaleY(1);
                  }
                  95% { 
                    transform: scaleY(0.1);
                  }
                }
                
                /* GPU acceleration */
                .robot-arm-left,
                .robot-arm-right,
                .robot-leg-left,
                .robot-leg-right {
                  will-change: transform;
                }
              `}</style>
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
