import { useState, useMemo, useCallback, memo } from "react";
import { demoApps } from "../data/demoApps";
import { ArrowRight, ChevronRight } from "lucide-react";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'fashion', name: 'Мода' },
  { id: 'food', name: 'Рестораны' },
  { id: 'luxury', name: 'Люкс' },
  { id: 'tech', name: 'Техника' },
];

const categoryMap: Record<string, string[]> = {
  fashion: ['radiance', 'rascal', 'sneaker-vault', 'nike-acg'],
  food: ['deluxe-dine', 'restaurant'],
  luxury: ['time-elite', 'fragrance-royale', 'glow-spa'],
  tech: ['techmart', 'electronics', 'store-black', 'lab-survivalist'],
};

// Premium App Card - Clean, minimal
const AppCard = memo(({ app, index, onOpen }: { 
  app: typeof demoApps[0]; 
  index: number; 
  onOpen: () => void;
}) => (
  <button
    onClick={onOpen}
    className="app-card group w-full text-left"
    style={{
      opacity: 0,
      animation: `cardReveal 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) ${0.2 + index * 0.08}s forwards`,
    }}
    data-testid={`card-app-${app.id}`}
    aria-label={`Открыть ${app.title}`}
  >
    {/* App Icon */}
    <div 
      className="aspect-square rounded-2xl mb-4 flex items-center justify-center"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <span 
        className="text-3xl font-semibold"
        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
      >
        {app.title.charAt(0)}
      </span>
    </div>
    
    {/* App Info */}
    <h3 
      className="text-base font-semibold mb-1"
      style={{ 
        color: '#FFFFFF',
        letterSpacing: '-0.02em',
      }}
    >
      {app.title}
    </h3>
    <p 
      className="text-sm leading-relaxed line-clamp-2"
      style={{ color: 'rgba(255, 255, 255, 0.45)' }}
    >
      {app.description}
    </p>
  </button>
));
AppCard.displayName = 'AppCard';

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const handleCategoryChange = useCallback((id: string) => {
    setActiveCategory(id);
  }, []);
  
  const filteredApps = useMemo(() => {
    const allApps = demoApps.slice(0, 11);
    if (activeCategory === 'all') return allApps;
    const ids = categoryMap[activeCategory] || [];
    return allApps.filter(app => ids.includes(app.id));
  }, [activeCategory]);
  
  const featuredApp = demoApps[0];

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ background: '#0a0a0a' }}
    >
      <div className="max-w-md mx-auto px-6">
        
        {/* Hero Section */}
        <section className="pt-20 pb-16">
          {/* Overline */}
          <p 
            className="text-sm font-medium mb-4 hero-fade"
            style={{ 
              color: '#10B981',
              letterSpacing: '0.05em',
            }}
          >
            TELEGRAM MINI APPS
          </p>
          
          {/* Main Title */}
          <h1 
            className="hero-fade-delay-1"
            style={{
              fontSize: 'clamp(44px, 12vw, 56px)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
              color: '#FFFFFF',
              marginBottom: '20px',
            }}
          >
            Приложения
            <br />
            для бизнеса
          </h1>
          
          {/* Subtitle */}
          <p 
            className="hero-fade-delay-2"
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.5)',
              maxWidth: '320px',
            }}
          >
            Автоматизируйте продажи. Работайте с клиентами там, где они уже есть.
          </p>
        </section>
        
        {/* Stats Row */}
        <section 
          className="flex items-center gap-12 py-8 mb-12 hero-fade-delay-3"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div 
              className="text-3xl font-semibold"
              style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
            >
              24/7
            </div>
            <div 
              className="text-sm mt-1"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            >
              Продажи
            </div>
          </div>
          <div>
            <div 
              className="text-3xl font-semibold"
              style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
            >
              +300%
            </div>
            <div 
              className="text-sm mt-1"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            >
              Конверсия
            </div>
          </div>
        </section>
        
        {/* Featured App */}
        <section className="mb-16">
          <button
            onClick={() => onOpenDemo(featuredApp.id)}
            className="featured-card w-full text-left"
            style={{
              padding: '32px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(32px)',
            }}
            data-testid="card-featured-app"
            aria-label={`Открыть ${featuredApp.title}`}
          >
            <p 
              className="text-xs font-medium mb-6"
              style={{ 
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '0.1em',
              }}
            >
              FEATURED
            </p>
            
            <h2 
              className="text-2xl font-semibold mb-3"
              style={{ 
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              {featuredApp.title}
            </h2>
            
            <p 
              className="text-base mb-8"
              style={{ 
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: 1.6,
              }}
            >
              {featuredApp.description}
            </p>
            
            <div 
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: '#10B981' }}
            >
              <span>Смотреть</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </section>
        
        {/* Category Filters */}
        <section className="mb-8">
          <div 
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            style={{
              marginLeft: '-24px',
              marginRight: '-24px',
              paddingLeft: '24px',
              paddingRight: '24px',
            }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className="px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300"
                  style={{
                    background: isActive 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'transparent',
                    border: isActive 
                      ? '1px solid rgba(255, 255, 255, 0.15)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isActive 
                      ? '#FFFFFF' 
                      : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                  data-testid={`button-category-${cat.id}`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </section>
        
        {/* Apps Grid */}
        <section className="grid grid-cols-2 gap-6 mb-16">
          {filteredApps
            .filter(app => app.id !== featuredApp.id)
            .map((app, index) => (
              <AppCard 
                key={app.id}
                app={app}
                index={index}
                onOpen={() => onOpenDemo(app.id)}
              />
            ))}
        </section>
        
        {/* Empty State */}
        {filteredApps.length <= 1 && (
          <div className="text-center py-12">
            <p style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              Нет приложений в этой категории
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-4 text-sm font-medium"
              style={{ color: '#10B981' }}
            >
              Показать все
            </button>
          </div>
        )}
        
        {/* CTA Section */}
        <section 
          className="py-12"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <p 
            className="text-sm mb-2"
            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          >
            Создайте своё приложение
          </p>
          <p 
            className="text-2xl font-semibold mb-6"
            style={{ 
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            от 9 990 ₽
          </p>
          
          <button
            onClick={() => window.location.hash = '#/constructor'}
            className="cta-button inline-flex items-center gap-3 px-8 py-4 rounded-full font-medium transition-all duration-300"
            style={{
              background: '#FFFFFF',
              color: '#000000',
              fontSize: '15px',
            }}
            data-testid="button-order-app"
          >
            <span>Заказать</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
        
      </div>

      <style>{`
        @keyframes heroFade {
          from { 
            opacity: 0; 
            transform: translateY(16px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes cardReveal {
          from { 
            opacity: 0; 
            transform: translateY(12px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .hero-fade {
          opacity: 0;
          animation: heroFade 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        
        .hero-fade-delay-1 {
          opacity: 0;
          animation: heroFade 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) 0.1s forwards;
        }
        
        .hero-fade-delay-2 {
          opacity: 0;
          animation: heroFade 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) 0.2s forwards;
        }
        
        .hero-fade-delay-3 {
          opacity: 0;
          animation: heroFade 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) 0.3s forwards;
        }
        
        .featured-card {
          transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .featured-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .featured-card:active {
          transform: scale(0.99);
        }
        
        .app-card {
          transition: opacity 0.3s ease;
        }
        
        .app-card:active {
          opacity: 0.7;
        }
        
        .cta-button:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 32px rgba(255, 255, 255, 0.15);
        }
        
        .cta-button:active {
          transform: scale(0.98);
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
