import { useState, useMemo, useCallback, memo } from "react";
import { demoApps } from "../data/demoApps";
import { ArrowRight, Sparkles, Star, TrendingUp, Zap, ShoppingBag, Utensils, Watch, Shirt, Dumbbell } from "lucide-react";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const categories = [
  { id: 'all', name: 'Все', icon: Sparkles },
  { id: 'fashion', name: 'Мода', icon: Shirt },
  { id: 'food', name: 'Еда', icon: Utensils },
  { id: 'tech', name: 'Техника', icon: Zap },
  { id: 'luxury', name: 'Люкс', icon: Watch },
  { id: 'sport', name: 'Спорт', icon: Dumbbell },
  { id: 'retail', name: 'Ритейл', icon: ShoppingBag },
];

const categoryMap: Record<string, string[]> = {
  fashion: ['radiance', 'rascal', 'sneaker-vault', 'nike-acg'],
  food: ['deluxe-dine', 'restaurant'],
  tech: ['techmart', 'electronics', 'store-black'],
  luxury: ['time-elite', 'fragrance-royale'],
  sport: ['fitness', 'sneaker-vault', 'nike-acg'],
  retail: ['store-black', 'lab-survivalist'],
};

const FeaturedApp = memo(({ app, onOpen }: { app: typeof demoApps[0], onOpen: () => void }) => (
  <div 
    onClick={onOpen}
    className="featured-card relative overflow-hidden cursor-pointer"
    style={{
      borderRadius: '24px',
      background: 'linear-gradient(135deg, rgba(120, 119, 198, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)',
      backdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '32px 28px',
      marginBottom: '32px',
    }}
    data-testid="card-featured-app"
  >
    {/* Glow effect */}
    <div 
      className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30"
      style={{ background: 'radial-gradient(circle, rgba(120, 119, 198, 0.8) 0%, transparent 70%)' }}
    />
    
    {/* Featured badge */}
    <div 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-6"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 180, 0, 0.1) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
      }}
    >
      <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
      <span className="text-xs font-semibold text-yellow-400 tracking-wide">FEATURED</span>
    </div>
    
    <h3 
      className="text-2xl font-bold text-white mb-2 tracking-tight"
      style={{ letterSpacing: '-0.02em' }}
    >
      {app.title}
    </h3>
    <p 
      className="text-base mb-6"
      style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5 }}
    >
      {app.description}
    </p>
    
    <button
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%)',
        color: '#000000',
      }}
      data-testid="button-open-featured"
    >
      <span>Открыть приложение</span>
      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
    </button>
  </div>
));
FeaturedApp.displayName = 'FeaturedApp';

const AppCard = memo(({ app, index, onOpen }: { app: typeof demoApps[0], index: number, onOpen: () => void }) => (
  <div
    onClick={onOpen}
    className="app-card group cursor-pointer"
    style={{
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '20px',
      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      animation: `cardFadeIn 0.5s ease-out ${0.1 + index * 0.05}s forwards`,
      opacity: 0,
    }}
    data-testid={`card-app-${app.id}`}
  >
    {/* App icon placeholder with gradient */}
    <div 
      className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${getAppGradient(app.id)})`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <span className="text-2xl font-bold text-white">{app.title.charAt(0)}</span>
    </div>
    
    <h4 
      className="text-base font-semibold text-white mb-1 tracking-tight"
      data-testid={`text-title-${app.id}`}
    >
      {app.title}
    </h4>
    <p 
      className="text-xs mb-4 line-clamp-2"
      style={{ color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.4 }}
      data-testid={`text-description-${app.id}`}
    >
      {app.description}
    </p>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" />
          ))}
        </div>
        <span className="text-xs text-white/40 ml-1">5.0</span>
      </div>
      
      <button
        className="open-btn flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
        }}
        data-testid={`button-open-${app.id}`}
      >
        Открыть
        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  </div>
));
AppCard.displayName = 'AppCard';

function getAppGradient(id: string): string {
  const gradients: Record<string, string> = {
    'radiance': '#FF6B6B 0%, #FF8E53 100%',
    'techmart': '#4F46E5 0%, #7C3AED 100%',
    'glow-spa': '#EC4899 0%, #F472B6 100%',
    'deluxe-dine': '#F59E0B 0%, #EF4444 100%',
    'time-elite': '#1F2937 0%, #374151 100%',
    'sneaker-vault': '#10B981 0%, #059669 100%',
    'fragrance-royale': '#8B5CF6 0%, #A855F7 100%',
    'rascal': '#EF4444 0%, #DC2626 100%',
    'store-black': '#000000 0%, #1F2937 100%',
    'lab-survivalist': '#65A30D 0%, #84CC16 100%',
    'nike-acg': '#1E3A8A 0%, #3B82F6 100%',
  };
  return gradients[id] || '#6366F1 0%, #8B5CF6 100%';
}

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);
  
  const filteredApps = useMemo(() => {
    const allApps = demoApps.slice(0, 11);
    if (activeCategory === 'all') return allApps;
    
    const categoryAppIds = categoryMap[activeCategory] || [];
    return allApps.filter(app => categoryAppIds.includes(app.id));
  }, [activeCategory]);
  
  const featuredApp = demoApps[0]; // Radiance as featured
  const gridApps = filteredApps.filter(app => app.id !== featuredApp.id);

  return (
    <div className="min-h-screen bg-black text-white pb-32 overflow-x-hidden">
      {/* Ambient background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)',
        }}
      />
      
      <div className="relative max-w-md mx-auto px-5">
        
        {/* Hero Section - Apple Style */}
        <div className="pt-16 pb-8 text-center">
          {/* Overline */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">+300% К ПРОДАЖАМ</span>
          </div>
          
          {/* Main headline */}
          <h1 
            className="animate-fade-in-up"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(40px, 12vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '12px',
            }}
          >
            Премиум
          </h1>
          <h2
            className="animate-fade-in-up-delay"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(40px, 12vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
            }}
          >
            Витрина
          </h2>
          
          {/* Subheadline */}
          <p 
            className="animate-fade-in-up-delay-2 max-w-xs mx-auto"
            style={{
              fontSize: '17px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: 1.5,
            }}
          >
            Telegram Mini Apps для вашего бизнеса. Автоматизация продаж 24/7.
          </p>
        </div>
        
        {/* Stats Bar */}
        <div 
          className="flex items-center justify-center gap-8 py-6 mb-8 animate-fade-in-delay-3"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">11+</div>
            <div className="text-xs text-white/40">Приложений</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-xs text-white/40">Продажи</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <div className="text-xs text-white/40">Telegram</div>
          </div>
        </div>
        
        {/* Category Pills */}
        <div 
          className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide animate-fade-in-delay-3"
          style={{ 
            marginLeft: '-20px', 
            marginRight: '-20px', 
            paddingLeft: '20px', 
            paddingRight: '20px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300"
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isActive 
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                }}
                data-testid={`button-category-${cat.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            );
          })}
        </div>
        
        {/* Featured App */}
        {activeCategory === 'all' && (
          <FeaturedApp 
            app={featuredApp} 
            onOpen={() => onOpenDemo(featuredApp.id)} 
          />
        )}
        
        {/* Apps Grid */}
        <div className="grid grid-cols-2 gap-3">
          {gridApps.map((app, index) => (
            <AppCard 
              key={app.id}
              app={app}
              index={index}
              onOpen={() => onOpenDemo(app.id)}
            />
          ))}
        </div>
        
        {/* Empty state */}
        {gridApps.length === 0 && (
          <div 
            className="text-center py-16"
            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          >
            <p className="text-lg mb-2">Нет приложений в этой категории</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-emerald-400 text-sm font-medium"
            >
              Показать все
            </button>
          </div>
        )}
        
        {/* CTA Section */}
        <div 
          className="mt-12 text-center py-10 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.03) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
          }}
        >
          <p className="text-white/60 text-sm mb-3">Хотите такое же приложение?</p>
          <p className="text-white text-xl font-bold mb-4">от 9 990 ₽</p>
          <button
            onClick={() => window.location.hash = '#/constructor'}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            }}
            data-testid="button-order-app"
          >
            <Zap className="w-4 h-4" />
            <span>Заказать приложение</span>
          </button>
        </div>
        
        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes cardFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(16px) scale(0.96); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }
        
        .animate-fade-in-up-delay {
          opacity: 0;
          animation: fadeInUp 0.7s ease-out 0.1s forwards;
        }
        
        .animate-fade-in-up-delay-2 {
          opacity: 0;
          animation: fadeInUp 0.7s ease-out 0.2s forwards;
        }
        
        .animate-fade-in-delay-3 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.3s forwards;
        }
        
        .featured-card {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .featured-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        
        .featured-card:active {
          transform: translateY(-2px);
        }
        
        .app-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
        }
        
        .app-card:hover .open-btn {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .app-card:active {
          transform: translateY(-2px);
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
