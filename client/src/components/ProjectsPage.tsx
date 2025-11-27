import { memo, useState } from "react";
import { demoApps } from "../data/demoApps";
import { ChevronRight } from "lucide-react";

import heroImage from "@assets/generated_images/premium_iphone_telegram_app.png";
import productShot from "@assets/generated_images/telegram_app_3d_product_shot.png";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const GlassCard = memo(({ 
  app, 
  index,
  onOpen,
  isHovered,
  onHover,
}: { 
  app: typeof demoApps[0]; 
  index: number;
  onOpen: () => void;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) => {
  const taglines: Record<string, string> = {
    'radiance': 'Премиальная мода',
    'techmart': 'Электроника',
    'glow-spa': 'Красота и SPA',
    'deluxe-dine': 'Рестораны',
    'time-elite': 'Люксовые часы',
    'sneaker-vault': 'Кроссовки',
    'fragrance-royale': 'Парфюмерия',
    'rascal': 'Streetwear',
    'store-black': 'Минимализм',
    'lab-survivalist': 'Outdoor',
    'nike-acg': 'ACG',
  };

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => onHover(app.id)}
      onMouseLeave={() => onHover(null)}
      className="glass-card relative overflow-hidden text-left w-full"
      style={{
        borderRadius: '24px',
        padding: '28px',
        background: isHovered 
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: isHovered
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        opacity: 0,
        animation: `revealCard 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${0.4 + index * 0.1}s forwards`,
      }}
      data-testid={`card-app-${app.id}`}
      aria-label={`Открыть ${app.title}`}
    >
      {/* Gradient glow on hover */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          right: '-50%',
          bottom: '-50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.03) 0%, transparent 60%)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />
      
      <div className="relative">
        <p style={{
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          color: 'rgba(255, 255, 255, 0.4)',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}>
          {taglines[app.id] || 'Приложение'}
        </p>
        
        <h3 style={{
          fontSize: '22px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          marginBottom: '16px',
          lineHeight: 1.2,
        }}>
          {app.title}
        </h3>
        
        <div 
          className="flex items-center gap-1"
          style={{ 
            color: isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
            transition: 'color 0.3s ease',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Открыть</span>
          <ChevronRight 
            style={{ 
              width: '16px', 
              height: '16px',
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 0.3s ease',
            }} 
          />
        </div>
      </div>
    </button>
  );
});
GlassCard.displayName = 'GlassCard';

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const apps = demoApps.slice(0, 10);

  return (
    <div 
      className="min-h-screen pb-32 overflow-hidden"
      style={{ 
        background: 'linear-gradient(180deg, #0A0A0C 0%, #0F1015 50%, #0A0A0C 100%)',
      }}
    >
      {/* Ambient glow */}
      <div 
        className="fixed pointer-events-none"
        style={{
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140%',
          height: '60%',
          background: 'radial-gradient(ellipse at center, rgba(120, 119, 198, 0.08) 0%, transparent 70%)',
        }}
      />
      
      {/* Hero Section */}
      <section className="relative text-center px-6">
        {/* Hero Image */}
        <div 
          className="relative mx-auto hero-image"
          style={{
            maxWidth: '320px',
            marginTop: '40px',
            marginBottom: '32px',
            opacity: 0,
            animation: 'heroReveal 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards',
          }}
        >
          <img 
            src={heroImage}
            alt="Premium Telegram App"
            className="w-full h-auto"
            style={{
              filter: 'drop-shadow(0 32px 64px rgba(0, 0, 0, 0.5))',
            }}
          />
          {/* Reflection */}
          <div 
            style={{
              position: 'absolute',
              bottom: '-40%',
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
              transform: 'scaleY(-1)',
              opacity: 0.3,
              filter: 'blur(8px)',
              pointerEvents: 'none',
            }}
          />
        </div>
        
        {/* Hero Text */}
        <div 
          style={{
            opacity: 0,
            animation: 'fadeUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.3s forwards',
          }}
        >
          <h1 style={{
            fontSize: 'clamp(36px, 10vw, 48px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}>
            Telegram Apps
            <br />
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>для бизнеса</span>
          </h1>
          
          <p style={{
            fontSize: '17px',
            color: 'rgba(255, 255, 255, 0.4)',
            maxWidth: '280px',
            margin: '0 auto 32px',
            lineHeight: 1.5,
          }}>
            Премиальные приложения для автоматизации продаж
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => window.location.hash = '#/constructor'}
          className="cta-primary"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#000000',
            fontSize: '15px',
            fontWeight: 600,
            padding: '14px 28px',
            borderRadius: '100px',
            border: 'none',
            cursor: 'pointer',
            opacity: 0,
            animation: 'fadeUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.5s forwards',
          }}
          data-testid="button-order-hero"
        >
          Заказать от 9 990 ₽
        </button>
      </section>
      
      {/* Divider */}
      <div 
        style={{
          margin: '64px 24px 48px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
        }}
      />
      
      {/* Section Header */}
      <section className="px-6 mb-6">
        <h2 style={{
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          color: 'rgba(255, 255, 255, 0.35)',
          textTransform: 'uppercase',
        }}>
          Примеры работ
        </h2>
      </section>
      
      {/* Apps Grid */}
      <section className="px-6">
        <div className="grid grid-cols-2 gap-4">
          {apps.map((app, index) => (
            <GlassCard
              key={app.id}
              app={app}
              index={index}
              onOpen={() => onOpenDemo(app.id)}
              isHovered={hoveredId === app.id}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </section>
      
      {/* Bottom Feature */}
      <section 
        className="mx-6 mt-12"
        style={{
          borderRadius: '28px',
          padding: '40px 28px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(32px)',
        }}
      >
        <img 
          src={productShot}
          alt="3D Product"
          style={{
            width: '200px',
            height: 'auto',
            margin: '-80px auto 24px',
            display: 'block',
            filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.4))',
          }}
        />
        
        <h3 style={{
          fontSize: '24px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '12px',
        }}>
          Под ключ за 14 дней
        </h3>
        
        <p style={{
          fontSize: '15px',
          color: 'rgba(255, 255, 255, 0.5)',
          textAlign: 'center',
          maxWidth: '260px',
          margin: '0 auto 28px',
          lineHeight: 1.5,
        }}>
          Дизайн, разработка, интеграция с Telegram и запуск
        </p>
        
        <button
          onClick={() => window.location.hash = '#/constructor'}
          className="cta-secondary w-full"
          style={{
            background: 'transparent',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 600,
            padding: '16px 24px',
            borderRadius: '100px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
          }}
          data-testid="button-order-bottom"
        >
          Начать проект
        </button>
      </section>

      <style>{`
        @keyframes heroReveal {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes revealCard {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .cta-primary {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .cta-primary:hover {
          transform: scale(1.03);
          box-shadow: 0 12px 40px rgba(255, 255, 255, 0.15);
        }
        
        .cta-primary:active {
          transform: scale(0.98);
        }
        
        .cta-secondary {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .cta-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .cta-secondary:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
