import { memo } from "react";
import { demoApps } from "../data/demoApps";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const ProductCard = memo(({ 
  app, 
  index,
  onOpen 
}: { 
  app: typeof demoApps[0]; 
  index: number;
  onOpen: () => void;
}) => {
  const isNew = index < 3;
  const taglines: Record<string, string> = {
    'radiance': 'Премиальная мода. Безупречный стиль.',
    'techmart': 'Техника будущего. Уже сегодня.',
    'glow-spa': 'Красота и уход. Без компромиссов.',
    'deluxe-dine': 'Изысканная кухня. Незабываемый вкус.',
    'time-elite': 'Время — это роскошь.',
    'sneaker-vault': 'Культовые кроссовки. Лимитированные дропы.',
    'fragrance-royale': 'Ароматы, которые запоминают.',
    'rascal': 'Streetwear без правил.',
    'store-black': 'Минимализм. Максимум стиля.',
    'lab-survivalist': 'Снаряжение для настоящих.',
    'nike-acg': 'All Conditions Gear.',
  };

  return (
    <button
      onClick={onOpen}
      className="product-card w-full text-center"
      style={{
        padding: '48px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'transparent',
        opacity: 0,
        animation: `fadeUp 0.8s ease-out ${0.1 + index * 0.08}s forwards`,
      }}
      data-testid={`card-app-${app.id}`}
      aria-label={`Открыть ${app.title}`}
    >
      {/* New Badge */}
      {isNew && (
        <p style={{ 
          color: '#FF6B00',
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '0.02em',
          marginBottom: '8px',
        }}>
          New
        </p>
      )}
      
      {/* Product Name */}
      <h2 style={{
        fontSize: '32px',
        fontWeight: 600,
        letterSpacing: '-0.02em',
        color: '#FFFFFF',
        marginBottom: '12px',
        lineHeight: 1.1,
      }}>
        {app.title}
      </h2>
      
      {/* Tagline */}
      <p style={{
        fontSize: '17px',
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: '24px',
        lineHeight: 1.4,
      }}>
        {taglines[app.id] || app.description}
      </p>
      
      {/* CTAs */}
      <div className="flex items-center justify-center gap-5">
        <span 
          className="cta-link"
          style={{
            color: '#2997FF',
            fontSize: '17px',
            fontWeight: 400,
          }}
        >
          Подробнее →
        </span>
        <span 
          style={{
            color: '#2997FF',
            fontSize: '17px',
            fontWeight: 400,
          }}
        >
          Открыть →
        </span>
      </div>
    </button>
  );
});
ProductCard.displayName = 'ProductCard';

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const apps = demoApps.slice(0, 11);

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ background: '#000000' }}
    >
      {/* Hero Section - Apple Style */}
      <section 
        className="text-center"
        style={{ 
          padding: '80px 24px 60px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Overline */}
        <p 
          className="hero-text"
          style={{
            color: '#FF6B00',
            fontSize: '17px',
            fontWeight: 500,
            marginBottom: '16px',
            opacity: 0,
            animation: 'fadeUp 0.8s ease-out forwards',
          }}
        >
          Telegram Mini Apps
        </p>
        
        {/* Main Headline */}
        <h1 
          className="hero-text"
          style={{
            fontSize: 'clamp(48px, 14vw, 72px)',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: '#FFFFFF',
            lineHeight: 1,
            marginBottom: '16px',
            opacity: 0,
            animation: 'fadeUp 0.8s ease-out 0.1s forwards',
          }}
        >
          Витрина
        </h1>
        
        {/* Subheadline */}
        <p 
          className="hero-text"
          style={{
            fontSize: '21px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: 400,
            maxWidth: '320px',
            margin: '0 auto 32px',
            lineHeight: 1.4,
            opacity: 0,
            animation: 'fadeUp 0.8s ease-out 0.2s forwards',
          }}
        >
          Приложения для бизнеса в Telegram
        </p>
        
        {/* Hero CTAs */}
        <div 
          className="flex items-center justify-center gap-6"
          style={{
            opacity: 0,
            animation: 'fadeUp 0.8s ease-out 0.3s forwards',
          }}
        >
          <button
            onClick={() => window.location.hash = '#/constructor'}
            style={{
              color: '#2997FF',
              fontSize: '21px',
              fontWeight: 400,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            data-testid="button-order-hero"
          >
            Заказать →
          </button>
        </div>
      </section>

      {/* Price Banner */}
      <section
        className="text-center"
        style={{
          padding: '40px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <p style={{
          fontSize: '17px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '8px',
        }}>
          Разработка под ключ
        </p>
        <p style={{
          fontSize: '28px',
          fontWeight: 600,
          color: '#FFFFFF',
          letterSpacing: '-0.02em',
        }}>
          от 9 990 ₽
        </p>
      </section>

      {/* Products List */}
      <div className="max-w-lg mx-auto">
        {apps.map((app, index) => (
          <ProductCard
            key={app.id}
            app={app}
            index={index}
            onOpen={() => onOpenDemo(app.id)}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <section
        className="text-center"
        style={{ padding: '64px 24px' }}
      >
        <p style={{
          fontSize: '21px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '24px',
        }}>
          Хотите такое же приложение?
        </p>
        <button
          onClick={() => window.location.hash = '#/constructor'}
          style={{
            background: '#FFFFFF',
            color: '#000000',
            fontSize: '17px',
            fontWeight: 500,
            padding: '16px 32px',
            borderRadius: '980px',
            border: 'none',
            cursor: 'pointer',
          }}
          data-testid="button-order-bottom"
        >
          Заказать разработку
        </button>
      </section>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .product-card {
          transition: background 0.3s ease;
          cursor: pointer;
          border: none;
        }
        
        .product-card:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        
        .product-card:active {
          background: rgba(255, 255, 255, 0.04);
        }
        
        .cta-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
