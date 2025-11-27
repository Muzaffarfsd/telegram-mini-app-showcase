import { memo, useState, useEffect, useCallback } from "react";
import { demoApps } from "../data/demoApps";
import { 
  ArrowRight, 
  Sparkles,
  ShoppingBag,
  Utensils,
  Watch,
  Gem,
  Dumbbell,
  Store,
  Shirt,
  Mountain,
  Footprints,
  Cpu,
  Flower2
} from "lucide-react";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const appConfig: Record<string, { 
  icon: React.ReactNode; 
  gradient: string;
  category: string;
  stats: string;
}> = {
  'radiance': { 
    icon: <Gem className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)',
    category: 'Fashion',
    stats: '+340% продаж'
  },
  'techmart': { 
    icon: <Cpu className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
    category: 'Electronics',
    stats: '+280% заказов'
  },
  'glow-spa': { 
    icon: <Flower2 className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #BF5AF2 0%, #8E2DE2 100%)',
    category: 'Beauty',
    stats: '+95% записей'
  },
  'deluxe-dine': { 
    icon: <Utensils className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #FF9F0A 0%, #FF6B00 100%)',
    category: 'Restaurant',
    stats: '+180% броней'
  },
  'time-elite': { 
    icon: <Watch className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
    category: 'Luxury',
    stats: '+420% ROI'
  },
  'sneaker-vault': { 
    icon: <Footprints className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #FF3B30 0%, #D32F2F 100%)',
    category: 'Sneakers',
    stats: '+250% drops'
  },
  'fragrance-royale': { 
    icon: <Sparkles className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #AF52DE 0%, #9C27B0 100%)',
    category: 'Perfume',
    stats: '+190% продаж'
  },
  'rascal': { 
    icon: <Shirt className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #5856D6 0%, #3F51B5 100%)',
    category: 'Streetwear',
    stats: '+310% заказов'
  },
  'store-black': { 
    icon: <Store className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #1C1C1E 0%, #000000 100%)',
    category: 'Minimal',
    stats: '+220% конверсии'
  },
  'lab-survivalist': { 
    icon: <Mountain className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #34C759 0%, #228B22 100%)',
    category: 'Outdoor',
    stats: '+175% лояльности'
  },
  'nike-acg': { 
    icon: <ShoppingBag className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #FF6B00 0%, #E55300 100%)',
    category: 'ACG',
    stats: '+290% продаж'
  },
  'fitness': { 
    icon: <Dumbbell className="w-5 h-5" />, 
    gradient: 'linear-gradient(135deg, #30D158 0%, #00C853 100%)',
    category: 'Fitness',
    stats: '+200% клиентов'
  },
};

const ProjectsPage = memo(({ onOpenDemo }: ProjectsPageProps) => {
  const [scrollY, setScrollY] = useState(0);
  const topApps = demoApps.slice(0, 11);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenApp = useCallback((id: string) => {
    onOpenDemo(id);
  }, [onOpenDemo]);

  return (
    <div className="min-h-screen bg-[#000000] pb-24 overflow-hidden">
      <div className="max-w-md mx-auto">
        
        {/* ══════════════════════════════════════════════════════════
            HERO SECTION - Apple Style with Parallax
        ══════════════════════════════════════════════════════════ */}
        <section className="relative px-6 pt-16 pb-10">
          {/* Dynamic gradient background */}
          <div 
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(191, 90, 242, 0.15) 0%, transparent 60%)',
              transform: `translateY(${scrollY * 0.3}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          <div className="relative z-10">
            {/* Badge */}
            <div className="flex justify-center mb-6 scroll-fade-in">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(191, 90, 242, 0.1)',
                  border: '1px solid rgba(191, 90, 242, 0.25)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <Sparkles className="w-4 h-4 text-[#BF5AF2]" />
                <span 
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#BF5AF2',
                    letterSpacing: '0.02em'
                  }}
                >
                  11 ПРИЛОЖЕНИЙ
                </span>
              </div>
            </div>

            {/* Hero headline */}
            <h1 
              className="text-center mb-4 scroll-fade-in-delay-1"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(44px, 12vw, 56px)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: '1.0',
                background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Витрина
            </h1>
            
            {/* Subtitle */}
            <p 
              className="text-center mb-6 scroll-fade-in-delay-2"
              style={{
                fontSize: '17px',
                lineHeight: '1.47',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.01em'
              }}
            >
              Премиум решения для бизнеса
              <br />
              в Telegram Mini Apps
            </p>

            {/* Stats Row */}
            <div className="flex justify-center gap-6 scroll-fade-in-delay-3">
              <StatBadge number="24/7" label="продажи" />
              <div className="w-px h-10 bg-white/10" />
              <StatBadge number="14" label="дней запуск" />
              <div className="w-px h-10 bg-white/10" />
              <StatBadge number="100%" label="автоматизация" />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            APP CARDS - Premium Style
        ══════════════════════════════════════════════════════════ */}
        <section className="px-5 py-4 space-y-4">
          {topApps.map((app, index) => {
            const config = appConfig[app.id] || {
              icon: <Store className="w-5 h-5" />,
              gradient: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
              category: 'App',
              stats: '+200%'
            };

            return (
              <AppCardPremium
                key={app.id}
                app={app}
                config={config}
                index={index}
                onOpen={() => handleOpenApp(app.id)}
              />
            );
          })}
        </section>

        {/* ══════════════════════════════════════════════════════════
            CTA SECTION
        ══════════════════════════════════════════════════════════ */}
        <section className="px-6 py-10">
          <div 
            className="rounded-[24px] p-7 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(191, 90, 242, 0.12) 0%, rgba(88, 86, 214, 0.12) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(191, 90, 242, 0.25)',
              boxShadow: '0 16px 48px rgba(191, 90, 242, 0.15)'
            }}
          >
            {/* Animated glow */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(191, 90, 242, 0.3) 0%, transparent 70%)',
                animation: 'pulse 3s ease-in-out infinite'
              }}
            />
            
            <div className="relative z-10">
              <p 
                className="mb-2"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase'
                }}
              >
                Разработка под ключ
              </p>
              
              <h3 
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#FFFFFF',
                  marginBottom: '8px'
                }}
              >
                от 9 990 ₽
              </h3>
              
              <p 
                style={{
                  fontSize: '15px',
                  lineHeight: '1.47',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '20px'
                }}
              >
                Дизайн, разработка, интеграция
                <br />
                и запуск за 14 дней
              </p>

              <a
                href="https://t.me/web4tgs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-white text-black font-semibold rounded-full transition-all duration-200 active:scale-[0.97] group flex items-center justify-center gap-2"
                style={{
                  fontSize: '16px',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  textDecoration: 'none'
                }}
                data-testid="button-order-cta"
              >
                Заказать приложение
                <ArrowRight className="w-5 h-5 transition-transform group-active:translate-x-1" />
              </a>
            </div>
          </div>
        </section>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }

        .scroll-fade-in,
        .scroll-fade-in-delay-1,
        .scroll-fade-in-delay-2,
        .scroll-fade-in-delay-3,
        .scroll-fade-in-delay-4,
        .scroll-fade-in-delay-5 {
          animation: fadeSlideIn 0.6s ease-out forwards;
        }

        .scroll-fade-in-delay-1 { animation-delay: 0.08s; }
        .scroll-fade-in-delay-2 { animation-delay: 0.16s; }
        .scroll-fade-in-delay-3 { animation-delay: 0.24s; }
        .scroll-fade-in-delay-4 { animation-delay: 0.32s; }
        .scroll-fade-in-delay-5 { animation-delay: 0.40s; }
      `}</style>
    </div>
  );
});

ProjectsPage.displayName = 'ProjectsPage';

// ══════════════════════════════════════════════════════════
// STAT BADGE COMPONENT
// ══════════════════════════════════════════════════════════
const StatBadge = memo(({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div 
      style={{
        fontSize: '22px',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: '#FFFFFF',
        lineHeight: '1',
        marginBottom: '4px'
      }}
    >
      {number}
    </div>
    <div 
      style={{
        fontSize: '11px',
        color: 'rgba(255, 255, 255, 0.45)',
        letterSpacing: '0.03em',
        textTransform: 'uppercase'
      }}
    >
      {label}
    </div>
  </div>
));
StatBadge.displayName = 'StatBadge';

// ══════════════════════════════════════════════════════════
// PREMIUM APP CARD COMPONENT
// ══════════════════════════════════════════════════════════
const AppCardPremium = memo(({ 
  app,
  config,
  index,
  onOpen
}: { 
  app: typeof demoApps[0];
  config: { icon: React.ReactNode; gradient: string; category: string; stats: string };
  index: number;
  onOpen: () => void;
}) => (
  <button
    onClick={onOpen}
    className={`w-full text-left rounded-[20px] p-5 relative overflow-hidden group active:scale-[0.98] scroll-fade-in-delay-${Math.min(index + 1, 5)}`}
    style={{
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 0,
      animationDelay: `${0.1 + index * 0.05}s`,
      animationFillMode: 'forwards'
    }}
    data-testid={`card-app-${app.id}`}
    aria-label={`Открыть ${app.title}`}
  >
    {/* Gradient accent line */}
    <div 
      className="absolute top-0 left-0 right-0 h-[3px] opacity-70"
      style={{ background: config.gradient }}
    />

    <div className="flex items-start gap-4">
      {/* Icon Badge */}
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
        style={{
          width: '48px',
          height: '48px',
          background: config.gradient,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ color: 'white' }}>
          {config.icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Category badge */}
        <span 
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: 'rgba(255, 255, 255, 0.45)',
            textTransform: 'uppercase'
          }}
        >
          {config.category}
        </span>
        
        {/* Title */}
        <h3 
          style={{
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            marginTop: '2px',
            marginBottom: '4px'
          }}
          data-testid={`text-title-${app.id}`}
        >
          {app.title}
        </h3>
        
        {/* Description */}
        <p 
          style={{
            fontSize: '14px',
            lineHeight: '1.4',
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
          data-testid={`text-description-${app.id}`}
        >
          {app.description}
        </p>
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
      {/* Stats */}
      <span 
        style={{
          fontSize: '13px',
          fontWeight: 600,
          background: config.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {config.stats}
      </span>
      
      {/* Open button */}
      <div 
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 group-hover:gap-2"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <span 
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#FFFFFF'
          }}
        >
          Открыть
        </span>
        <ArrowRight 
          className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:translate-x-0.5" 
          strokeWidth={2.5}
        />
      </div>
    </div>
  </button>
));
AppCardPremium.displayName = 'AppCardPremium';

export default ProjectsPage;
