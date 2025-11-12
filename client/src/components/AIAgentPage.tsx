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
            {/* Premium Animated Robot - Jump & Walk Back and Forth */}
            <div className="absolute z-20 pointer-events-none"
              style={{
                left: '0',
                top: '50px',
                animation: 'robotJumpAndWalk 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)'
              }}
            >
              <div style={{ 
                animation: 'robotBodyAndFlip 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)'
              }}>
                {/* WALL-E Robot SVG */}
                <svg width="70" height="70" viewBox="0 0 70 70" className="drop-shadow-2xl">
                  <defs>
                    <linearGradient id="walleYellow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#F9B208" />
                    </linearGradient>
                    <linearGradient id="rust" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B4513" opacity="0.3" />
                      <stop offset="100%" stopColor="#704214" opacity="0.4" />
                    </linearGradient>
                    <filter id="metallic">
                      <feGaussianBlur stdDeviation="0.5" result="blur"/>
                      <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.8" specularExponent="20" result="specOut">
                        <fePointLight x="-5000" y="-10000" z="20000"/>
                      </feSpecularLighting>
                      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
                    </filter>
                  </defs>
                  
                  {/* Shadow */}
                  <ellipse cx="35" cy="65" rx="22" ry="4" fill="#000" opacity="0.4"
                    style={{ animation: 'shadowPulse 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite' }} />
                  
                  {/* Tank Tracks (Bottom) */}
                  <g className="robot-leg-left">
                    <rect x="12" y="50" width="14" height="12" rx="3" fill="#2C2C2C" stroke="#1a1a1a" strokeWidth="1.5" />
                    <rect x="13" y="51" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="17" y="51" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="21" y="51" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="13" y="54" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="17" y="54" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="21" y="54" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="13" y="58" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="17" y="58" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="21" y="58" width="3" height="2" fill="#444" rx="0.5" />
                  </g>
                  
                  <g className="robot-leg-right">
                    <rect x="44" y="50" width="14" height="12" rx="3" fill="#2C2C2C" stroke="#1a1a1a" strokeWidth="1.5" />
                    <rect x="45" y="51" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="49" y="51" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="53" y="51" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="45" y="54" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="49" y="54" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="53" y="54" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="45" y="58" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="49" y="58" width="3" height="2" fill="#444" rx="0.5" />
                    <rect x="53" y="58" width="3" height="2" fill="#444" rx="0.5" />
                  </g>
                  
                  {/* Main Body (Yellow Box) */}
                  <rect x="18" y="28" width="34" height="24" rx="3" fill="url(#walleYellow)" stroke="#D4A017" strokeWidth="2" filter="url(#metallic)" />
                  
                  {/* Rust weathering overlay */}
                  <rect x="18" y="28" width="34" height="24" rx="3" fill="url(#rust)" opacity="0.3" />
                  
                  {/* Rivets on body */}
                  <circle cx="22" cy="32" r="1.2" fill="#888" />
                  <circle cx="48" cy="32" r="1.2" fill="#888" />
                  <circle cx="22" cy="48" r="1.2" fill="#888" />
                  <circle cx="48" cy="48" r="1.2" fill="#888" />
                  
                  {/* Solar Panel / Chest Panel */}
                  <rect x="24" y="34" width="22" height="8" rx="1.5" fill="#666" opacity="0.7" />
                  <line x1="25" y1="36" x2="45" y2="36" stroke="#888" strokeWidth="0.5" />
                  <line x1="25" y1="38" x2="45" y2="38" stroke="#888" strokeWidth="0.5" />
                  <line x1="25" y1="40" x2="45" y2="40" stroke="#888" strokeWidth="0.5" />
                  
                  {/* Energy indicators (9 bars) */}
                  <rect x="25" y="45" width="1.5" height="3" rx="0.5" fill="#4CAF50" />
                  <rect x="27" y="45" width="1.5" height="3" rx="0.5" fill="#4CAF50" />
                  <rect x="29" y="45" width="1.5" height="3" rx="0.5" fill="#4CAF50" />
                  <rect x="31" y="45" width="1.5" height="3" rx="0.5" fill="#4CAF50" />
                  <rect x="33" y="45" width="1.5" height="3" rx="0.5" fill="#8BC34A" />
                  <rect x="35" y="45" width="1.5" height="3" rx="0.5" fill="#CDDC39" />
                  <rect x="37" y="45" width="1.5" height="3" rx="0.5" fill="#FFC107" />
                  <rect x="39" y="45" width="1.5" height="3" rx="0.5" fill="#FF9800" />
                  <rect x="41" y="45" width="1.5" height="3" rx="0.5" fill="#888" opacity="0.3" />
                  
                  {/* Telescoping Neck */}
                  <rect x="31" y="18" width="8" height="11" rx="1" fill="#A9A9A9" stroke="#808080" strokeWidth="1" />
                  <rect x="32" y="20" width="6" height="8" rx="1" fill="#C0C0C0" stroke="#999" strokeWidth="0.8" />
                  
                  {/* Head (Binocular Eyes Housing) */}
                  <path d="M 23 12 Q 23 8 27 8 L 43 8 Q 47 8 47 12 L 47 22 Q 47 24 45 24 L 25 24 Q 23 24 23 22 Z" 
                    fill="#D4A017" stroke="#B8860B" strokeWidth="1.5" />
                  
                  {/* Iconic Binocular Eyes */}
                  {/* Left Eye */}
                  <circle cx="28" cy="15" r="6" fill="#333" stroke="#222" strokeWidth="1.5" />
                  <circle cx="28" cy="15" r="5" fill="#4A90E2" opacity="0.9" />
                  <circle cx="28" cy="15" r="3.5" fill="#1a1a1a" className="robot-eye-left" />
                  <circle cx="29.5" cy="13.5" r="2" fill="#6AB7FF" opacity="0.6" />
                  <circle cx="29.5" cy="13.5" r="1.2" fill="#FFFFFF" opacity="0.9" />
                  
                  {/* Right Eye */}
                  <circle cx="42" cy="15" r="6" fill="#333" stroke="#222" strokeWidth="1.5" />
                  <circle cx="42" cy="15" r="5" fill="#4A90E2" opacity="0.9" />
                  <circle cx="42" cy="15" r="3.5" fill="#1a1a1a" className="robot-eye-right" />
                  <circle cx="43.5" cy="13.5" r="2" fill="#6AB7FF" opacity="0.6" />
                  <circle cx="43.5" cy="13.5" r="1.2" fill="#FFFFFF" opacity="0.9" />
                  
                  {/* Arms (on U-shaped tracks) */}
                  <g className="robot-arm-left">
                    <rect x="10" y="32" width="8" height="14" rx="2" fill="#888" stroke="#666" strokeWidth="1.5" />
                    <rect x="11" y="42" width="6" height="8" rx="1.5" fill="#999" />
                    <rect x="12" y="48" width="2" height="5" rx="1" fill="#777" />
                    <rect x="14.5" y="48" width="2" height="5" rx="1" fill="#777" />
                  </g>
                  
                  <g className="robot-arm-right">
                    <rect x="52" y="32" width="8" height="14" rx="2" fill="#888" stroke="#666" strokeWidth="1.5" />
                    <rect x="53" y="42" width="6" height="8" rx="1.5" fill="#999" />
                    <rect x="54" y="48" width="2" height="5" rx="1" fill="#777" />
                    <rect x="56.5" y="48" width="2" height="5" rx="1" fill="#777" />
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
              {/* Premium Robot Animation - Jump onto block and walk back & forth */}
              <style>{`
                /* Main horizontal movement: Jump up → Walk right → Walk left → Repeat */
                @keyframes robotJumpAndWalk {
                  /* Starting position - below block */
                  0% { 
                    transform: translateX(50px) translateY(50px);
                  }
                  
                  /* Jump up onto block (0-10%) */
                  5% {
                    transform: translateX(50px) translateY(-80px);
                  }
                  10% {
                    transform: translateX(50px) translateY(-100px);
                  }
                  
                  /* Land on block */
                  15% {
                    transform: translateX(50px) translateY(-100px);
                  }
                  
                  /* Walk right across top (15-45%) */
                  45% {
                    transform: translateX(var(--robot-path, 300px)) translateY(-100px);
                  }
                  
                  /* Pause and turn around (45-50%) */
                  50% {
                    transform: translateX(var(--robot-path, 300px)) translateY(-100px);
                  }
                  
                  /* Walk left back (50-80%) */
                  80% {
                    transform: translateX(50px) translateY(-100px);
                  }
                  
                  /* Pause and turn around (80-85%) */
                  85% {
                    transform: translateX(50px) translateY(-100px);
                  }
                  
                  /* Jump down (85-95%) */
                  90% {
                    transform: translateX(50px) translateY(-50px);
                  }
                  95% {
                    transform: translateX(50px) translateY(30px);
                  }
                  
                  /* Return to start */
                  100% {
                    transform: translateX(50px) translateY(50px);
                  }
                }
                
                /* Body motion with flip for direction change */
                @keyframes robotBodyAndFlip {
                  /* Crouch before jump */
                  0% { 
                    transform: scaleY(0.9);
                  }
                  
                  /* Jump arc up */
                  5% {
                    transform: scaleY(1.15) translateY(0px);
                  }
                  10% {
                    transform: scaleY(1.05) translateY(0px);
                  }
                  
                  /* Landing squash */
                  15% {
                    transform: scaleY(0.85) translateY(2px);
                  }
                  17% {
                    transform: scaleY(1.05) translateY(-2px);
                  }
                  20% {
                    transform: scaleY(1) translateY(0px);
                  }
                  
                  /* Walking right bounce (20-45%) */
                  22%, 30%, 38% {
                    transform: scaleY(1) translateY(0px);
                  }
                  26%, 34%, 42% {
                    transform: scaleY(1) translateY(-6px);
                  }
                  
                  /* Turn around - flip horizontally (45-50%) */
                  45% {
                    transform: scaleX(1) scaleY(1);
                  }
                  50% {
                    transform: scaleX(-1) scaleY(1);
                  }
                  
                  /* Walking left bounce (50-80%) */
                  52%, 60%, 68%, 76% {
                    transform: scaleX(-1) scaleY(1) translateY(0px);
                  }
                  56%, 64%, 72% {
                    transform: scaleX(-1) scaleY(1) translateY(-6px);
                  }
                  
                  /* Turn around back - flip to normal (80-85%) */
                  80% {
                    transform: scaleX(-1) scaleY(1);
                  }
                  85% {
                    transform: scaleX(1) scaleY(1);
                  }
                  
                  /* Jump down */
                  90% {
                    transform: scaleY(1.1);
                  }
                  95% {
                    transform: scaleY(0.9);
                  }
                  100% {
                    transform: scaleY(0.9);
                  }
                }
                
                /* Shadow synced with position */
                @keyframes shadowPulse {
                  /* Shadow fades during initial jump */
                  0% {
                    transform: scale(1.2, 0.9);
                    opacity: 0.35;
                  }
                  5% {
                    transform: scale(0.8, 0.5);
                    opacity: 0.2;
                  }
                  10% {
                    transform: scale(0.6, 0.4);
                    opacity: 0.15;
                  }
                  
                  /* Shadow appears on landing */
                  15% {
                    transform: scale(1.5, 1.1);
                    opacity: 0.4;
                  }
                  20% {
                    transform: scale(1.2, 0.9);
                    opacity: 0.3;
                  }
                  
                  /* Walking shadow pulses (20-45%) */
                  22%, 30%, 38% {
                    transform: scale(1, 0.8);
                    opacity: 0.3;
                  }
                  26%, 34%, 42% {
                    transform: scale(1.3, 1);
                    opacity: 0.25;
                  }
                  
                  /* Pause at turn */
                  45%, 50% {
                    transform: scale(1, 0.8);
                    opacity: 0.3;
                  }
                  
                  /* Walking shadow pulses (50-80%) */
                  52%, 60%, 68%, 76% {
                    transform: scale(1, 0.8);
                    opacity: 0.3;
                  }
                  56%, 64%, 72% {
                    transform: scale(1.3, 1);
                    opacity: 0.25;
                  }
                  
                  /* Pause at turn */
                  80%, 85% {
                    transform: scale(1, 0.8);
                    opacity: 0.3;
                  }
                  
                  /* Shadow during jump down */
                  90% {
                    transform: scale(0.8, 0.6);
                    opacity: 0.2;
                  }
                  95%, 100% {
                    transform: scale(1.2, 0.9);
                    opacity: 0.35;
                  }
                }
                
                /* Antenna wiggle */
                @keyframes antennaWiggle {
                  0%, 100% { 
                    transform: rotate(0deg);
                  }
                  25% { 
                    transform: rotate(-8deg);
                  }
                  75% { 
                    transform: rotate(8deg);
                  }
                }
                
                /* Arms animation with jump gesture */
                .robot-arm-left {
                  animation: armMotionLeft 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                }
                
                .robot-arm-right {
                  animation: armMotionRight 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                }
                
                @keyframes armMotionLeft {
                  /* Fast walking swing (0-70%) */
                  0%, 14%, 28%, 42%, 56%, 70% { 
                    transform: rotate(-20deg);
                  }
                  7%, 21%, 35%, 49%, 63% { 
                    transform: rotate(20deg);
                  }
                  
                  /* Jump - arms up (70-85%) */
                  75% {
                    transform: rotate(-45deg) translateY(-8px);
                  }
                  80% {
                    transform: rotate(-35deg) translateY(-5px);
                  }
                  85% {
                    transform: rotate(-10deg);
                  }
                  
                  /* Resume walking (85-100%) */
                  92% {
                    transform: rotate(20deg);
                  }
                  100% {
                    transform: rotate(-20deg);
                  }
                }
                
                @keyframes armMotionRight {
                  /* Fast walking swing (0-70%) */
                  0%, 14%, 28%, 42%, 56%, 70% { 
                    transform: rotate(20deg);
                  }
                  7%, 21%, 35%, 49%, 63% { 
                    transform: rotate(-20deg);
                  }
                  
                  /* Jump - arms up (70-85%) */
                  75% {
                    transform: rotate(45deg) translateY(-8px);
                  }
                  80% {
                    transform: rotate(35deg) translateY(-5px);
                  }
                  85% {
                    transform: rotate(10deg);
                  }
                  
                  /* Resume walking (85-100%) */
                  92% {
                    transform: rotate(-20deg);
                  }
                  100% {
                    transform: rotate(20deg);
                  }
                }
                
                /* Legs animation with jump tuck */
                .robot-leg-left {
                  animation: legMotionLeft 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                }
                
                .robot-leg-right {
                  animation: legMotionRight 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                }
                
                @keyframes legMotionLeft {
                  /* Fast walking (0-70%) */
                  0%, 14%, 28%, 42%, 56%, 70% { 
                    transform: rotate(-10deg) translateY(0px);
                  }
                  7%, 21%, 35%, 49%, 63% { 
                    transform: rotate(10deg) translateY(-3px);
                  }
                  
                  /* Jump - legs tuck (70-85%) */
                  75% {
                    transform: rotate(-25deg) translateY(-8px);
                  }
                  80% {
                    transform: rotate(-15deg) translateY(-4px);
                  }
                  85% {
                    transform: rotate(0deg) translateY(0px);
                  }
                  
                  /* Resume walking (85-100%) */
                  92% {
                    transform: rotate(10deg) translateY(-3px);
                  }
                  100% {
                    transform: rotate(-10deg) translateY(0px);
                  }
                }
                
                @keyframes legMotionRight {
                  /* Fast walking (0-70%) */
                  0%, 14%, 28%, 42%, 56%, 70% { 
                    transform: rotate(10deg) translateY(0px);
                  }
                  7%, 21%, 35%, 49%, 63% { 
                    transform: rotate(-10deg) translateY(-3px);
                  }
                  
                  /* Jump - legs tuck (70-85%) */
                  75% {
                    transform: rotate(25deg) translateY(-8px);
                  }
                  80% {
                    transform: rotate(15deg) translateY(-4px);
                  }
                  85% {
                    transform: rotate(0deg) translateY(0px);
                  }
                  
                  /* Resume walking (85-100%) */
                  92% {
                    transform: rotate(-10deg) translateY(-3px);
                  }
                  100% {
                    transform: rotate(10deg) translateY(0px);
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
