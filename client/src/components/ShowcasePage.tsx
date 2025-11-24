import { memo, useCallback, useMemo } from "react";
import { ChevronRight } from "lucide-react";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

// Demo apps data - 11 готовых приложений
const demoApps = [
  {
    id: 'clothing-store',
    title: 'Radiance',
    description: 'Магазин модной одежды и аксессуаров',
    gradient: 'from-pink-500/10 to-purple-500/10',
    iconBg: 'rgba(255, 45, 85, 0.15)',
    iconColor: '#FF2D55'
  },
  {
    id: 'electronics',
    title: 'TechMart',
    description: 'Магазин электроники и техники',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconBg: 'rgba(0, 122, 255, 0.15)',
    iconColor: '#007AFF'
  },
  {
    id: 'spa',
    title: 'GlowSpa',
    description: 'Салон красоты и SPA-услуги',
    gradient: 'from-green-500/10 to-emerald-500/10',
    iconBg: 'rgba(52, 199, 89, 0.15)',
    iconColor: '#34C759'
  },
  {
    id: 'restaurant',
    title: 'DeluxeDine',
    description: 'Ресторан с доставкой',
    gradient: 'from-orange-500/10 to-yellow-500/10',
    iconBg: 'rgba(255, 159, 10, 0.15)',
    iconColor: '#FF9F0A'
  },
  {
    id: 'watches',
    title: 'TimeElite',
    description: 'Магазин элитных часов',
    gradient: 'from-gray-500/10 to-slate-500/10',
    iconBg: 'rgba(142, 142, 147, 0.15)',
    iconColor: '#8E8E93'
  },
  {
    id: 'sneaker-store',
    title: 'SneakerVault',
    description: 'Магазин кроссовок',
    gradient: 'from-red-500/10 to-pink-500/10',
    iconBg: 'rgba(255, 59, 48, 0.15)',
    iconColor: '#FF3B30'
  },
  {
    id: 'fitness',
    title: 'FitnessCore',
    description: 'Фитнес-центр и тренировки',
    gradient: 'from-green-500/10 to-teal-500/10',
    iconBg: 'rgba(48, 209, 88, 0.15)',
    iconColor: '#30D158'
  },
  {
    id: 'car-service',
    title: 'AutoCare',
    description: 'Автосервис и детейлинг',
    gradient: 'from-indigo-500/10 to-blue-500/10',
    iconBg: 'rgba(88, 86, 214, 0.15)',
    iconColor: '#5856D6'
  },
  {
    id: 'coffee',
    title: 'BrewBar',
    description: 'Кофейня и десерты',
    gradient: 'from-amber-500/10 to-orange-500/10',
    iconBg: 'rgba(255, 204, 0, 0.15)',
    iconColor: '#FFCC00'
  },
  {
    id: 'pharmacy',
    title: 'HealthPlus',
    description: 'Аптека и медтовары',
    gradient: 'from-cyan-500/10 to-blue-500/10',
    iconBg: 'rgba(90, 200, 250, 0.15)',
    iconColor: '#5AC8FA'
  },
  {
    id: 'bookstore',
    title: 'BookHaven',
    description: 'Книжный магазин',
    gradient: 'from-purple-500/10 to-pink-500/10',
    iconBg: 'rgba(191, 90, 242, 0.15)',
    iconColor: '#BF5AF2'
  }
];

const ShowcasePage = memo(({ onNavigate, onOpenDemo }: ShowcasePageProps) => {
  const handleOpenDemo = useCallback((demoId: string) => {
    onOpenDemo(demoId);
  }, [onOpenDemo]);

  return (
    <div className="min-h-screen bg-[#000000] pb-32">
      <div className="max-w-md mx-auto px-6">
        
        {/* Apple-style Hero Header */}
        <header className="pt-16 pb-12 text-center">
          <h1 
            className="mb-3 scroll-fade-in"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(40px, 10vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: '1.05',
              color: '#FFFFFF'
            }}
          >
            Витрина
          </h1>
          
          <p 
            className="scroll-fade-in-delay-1"
            style={{
              fontSize: '17px',
              lineHeight: '1.47',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '-0.01em'
            }}
          >
            11 готовых приложений
          </p>
        </header>

        {/* Demo Apps Grid - iOS List Style */}
        <div className="space-y-2">
          {demoApps.map((app, index) => (
            <DemoAppCard
              key={app.id}
              app={app}
              index={index}
              onOpen={handleOpenDemo}
            />
          ))}
        </div>

        {/* Bottom Spacer for Navigation */}
        <div className="h-8" />

      </div>
    </div>
  );
});

ShowcasePage.displayName = 'ShowcasePage';

// Demo App Card - Apple iOS List Item
const DemoAppCard = memo<{
  app: typeof demoApps[0];
  index: number;
  onOpen: (id: string) => void;
}>(({ app, index, onOpen }) => {
  const handleClick = useCallback(() => {
    onOpen(app.id);
  }, [app.id, onOpen]);

  return (
    <div
      onClick={handleClick}
      className={`
        interactive-smooth active:scale-[0.98] cursor-pointer
        rounded-[20px] overflow-hidden
        scroll-fade-in-delay-${Math.min(index, 3)}
      `}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s cubic-bezier(0.42, 0, 0.58, 1)',
        animationDelay: `${index * 0.05}s`
      }}
      data-testid={`demo-card-${app.id}`}
    >
      <div className="flex items-center p-4">
        {/* App Icon - iOS style */}
        <div 
          className="flex-shrink-0 flex items-center justify-center rounded-[14px] mr-4"
          style={{
            width: '56px',
            height: '56px',
            background: app.iconBg,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: app.iconColor }}
          >
            {app.title.charAt(0)}
          </div>
        </div>

        {/* App Info */}
        <div className="flex-1 min-w-0">
          <h3 
            className="mb-0.5 truncate"
            style={{
              fontSize: '17px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#FFFFFF'
            }}
          >
            {app.title}
          </h3>
          <p 
            className="truncate"
            style={{
              fontSize: '15px',
              lineHeight: '1.4',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '-0.01em'
            }}
          >
            {app.description}
          </p>
        </div>

        {/* Chevron - iOS disclosure indicator */}
        <div className="flex-shrink-0 ml-2">
          <ChevronRight 
            className="transition-transform group-hover:translate-x-0.5"
            style={{ 
              width: '20px', 
              height: '20px',
              color: 'rgba(255, 255, 255, 0.3)'
            }} 
          />
        </div>
      </div>
    </div>
  );
});

DemoAppCard.displayName = 'DemoAppCard';

export default ShowcasePage;
