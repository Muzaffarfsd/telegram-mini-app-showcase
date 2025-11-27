import { memo, useState, useEffect, useRef } from "react";
import { demoApps } from "../data/demoApps";

import heroMockup from "@assets/generated_images/premium_iphone_telegram_app.png";
import productShot from "@assets/generated_images/telegram_app_3d_product_shot.png";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const AppTile = memo(({ 
  app, 
  index,
  onOpen,
}: { 
  app: typeof demoApps[0]; 
  index: number;
  onOpen: () => void;
}) => (
  <button
    onClick={onOpen}
    className="app-tile group"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      width: '100%',
      padding: '24px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      background: 'transparent',
      textAlign: 'left',
      cursor: 'pointer',
      opacity: 0,
      animation: `tileReveal 0.6s ease-out ${0.8 + index * 0.08}s forwards`,
    }}
    data-testid={`card-app-${app.id}`}
    aria-label={`Открыть ${app.title}`}
  >
    {/* Number */}
    <span style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '14px',
      fontWeight: 400,
      color: 'rgba(255, 255, 255, 0.25)',
      width: '28px',
      flexShrink: 0,
    }}>
      {String(index + 1).padStart(2, '0')}
    </span>
    
    {/* Title */}
    <span 
      className="tile-title"
      style={{
        flex: 1,
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '20px',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        color: '#E3D9C6',
      }}
    >
      {app.title}
    </span>
    
    {/* Arrow */}
    <span 
      className="tile-arrow"
      style={{
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.2)',
        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      →
    </span>
  </button>
));
AppTile.displayName = 'AppTile';

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollY(containerRef.current.scrollTop);
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  const apps = demoApps.slice(0, 10);
  const parallaxOffset = Math.min(scrollY * 0.3, 100);

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-auto overflow-x-hidden"
      style={{ 
        background: '#020205',
      }}
    >
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />
      
      {/* Gradient ambient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(140, 155, 255, 0.07) 0%, transparent 50%)',
        }}
      />
      
      {/* ═══════════════════════════════════════════════════════════
          SCENE 1: MANIFEST
      ═══════════════════════════════════════════════════════════ */}
      <section 
        className="relative min-h-screen flex flex-col justify-end px-8 pb-16"
        style={{ paddingTop: '80px' }}
      >
        {/* Floating mockup */}
        <div 
          className="absolute right-0 top-20"
          style={{
            width: '75%',
            maxWidth: '320px',
            transform: `translateY(${-parallaxOffset * 0.5}px)`,
            opacity: 0,
            animation: 'mockupFloat 1.2s cubic-bezier(0.23, 1, 0.32, 1) 0.2s forwards',
          }}
        >
          <img 
            src={heroMockup}
            alt=""
            className="w-full"
            style={{
              filter: 'drop-shadow(0 40px 80px rgba(0, 0, 0, 0.6))',
              transform: 'rotate(6deg)',
            }}
          />
          {/* Light sweep */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
              animation: 'lightSweep 4s ease-in-out infinite',
            }}
          />
        </div>
        
        {/* Manifest text */}
        <div 
          className="relative z-10"
          style={{
            maxWidth: '300px',
            opacity: 0,
            animation: 'fadeUp 0.8s ease-out 0.4s forwards',
          }}
        >
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            color: 'rgba(140, 155, 255, 0.8)',
            marginBottom: '24px',
            textTransform: 'uppercase',
          }}>
            Atelier
          </p>
          
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(40px, 11vw, 56px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: '#E3D9C6',
            marginBottom: '32px',
          }}>
            Цифровые
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>бутики</span>
          </h1>
          
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.45)',
            marginBottom: '48px',
          }}>
            Мы создаём приложения внутри Telegram, 
            где каждая деталь — произведение.
          </p>
        </div>
        
        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-8"
          style={{
            opacity: 0,
            animation: 'fadeIn 1s ease-out 1.5s forwards',
          }}
        >
          <div 
            className="w-px h-12 mx-auto mb-3"
            style={{ 
              background: 'linear-gradient(180deg, rgba(140, 155, 255, 0.5) 0%, transparent 100%)',
            }}
          />
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: 'rgba(255, 255, 255, 0.25)',
            textTransform: 'uppercase',
          }}>
            Scroll
          </p>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════
          SCENE 2: SIGNATURE
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-8">
        {/* Section line */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: '32px',
            right: '32px',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(140, 155, 255, 0.3) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        />
        
        <div className="mb-16">
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            color: 'rgba(140, 155, 255, 0.6)',
            marginBottom: '16px',
            textTransform: 'uppercase',
          }}>
            Signature Editions
          </p>
          
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '32px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#E3D9C6',
          }}>
            Три направления
          </h2>
        </div>
        
        {/* Feature cards - asymmetric */}
        <div className="space-y-6">
          {/* Card 1 - Large */}
          <div 
            className="signature-card"
            style={{
              padding: '40px 28px',
              borderRadius: '2px',
              background: 'linear-gradient(135deg, rgba(140, 155, 255, 0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '48px',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'rgba(140, 155, 255, 0.3)',
              marginBottom: '20px',
              lineHeight: 1,
            }}>
              01
            </p>
            <h3 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '24px',
              fontWeight: 500,
              color: '#E3D9C6',
              marginBottom: '12px',
            }}>
              E-commerce
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.4)',
            }}>
              Магазины с каталогом, корзиной, оплатой. 
              Полный цикл продаж без сайта.
            </p>
          </div>
          
          {/* Cards 2 & 3 - Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="signature-card"
              style={{
                padding: '28px 20px',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '32px',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'rgba(140, 155, 255, 0.2)',
                marginBottom: '16px',
              }}>
                02
              </p>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '18px',
                fontWeight: 500,
                color: '#E3D9C6',
                marginBottom: '8px',
              }}>
                Бронирования
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'rgba(255, 255, 255, 0.35)',
              }}>
                Рестораны, салоны, услуги
              </p>
            </div>
            
            <div 
              className="signature-card"
              style={{
                padding: '28px 20px',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '32px',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'rgba(140, 155, 255, 0.2)',
                marginBottom: '16px',
              }}>
                03
              </p>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '18px',
                fontWeight: 500,
                color: '#E3D9C6',
                marginBottom: '8px',
              }}>
                Лояльность
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'rgba(255, 255, 255, 0.35)',
              }}>
                Программы, баллы, rewards
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════
          SCENE 3: ARCHIVE
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 px-8">
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: '32px',
            right: '32px',
            height: '1px',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        />
        
        <div className="flex items-end justify-between mb-12">
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              color: 'rgba(140, 155, 255, 0.6)',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}>
              Archive
            </p>
            
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '28px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: '#E3D9C6',
            }}>
              Коллекция
            </h2>
          </div>
          
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.3)',
          }}>
            {apps.length} работ
          </p>
        </div>
        
        {/* Apps list */}
        <div>
          {apps.map((app, index) => (
            <AppTile
              key={app.id}
              app={app}
              index={index}
              onOpen={() => onOpenDemo(app.id)}
            />
          ))}
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════
          SCENE 4: COLLECTOR'S NOTE
      ═══════════════════════════════════════════════════════════ */}
      <section 
        className="relative py-24 px-8"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(140, 155, 255, 0.03) 100%)',
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: '32px',
            right: '32px',
            height: '1px',
            background: 'rgba(140, 155, 255, 0.15)',
          }}
        />
        
        {/* Product shot */}
        <div className="flex justify-center mb-12">
          <img 
            src={productShot}
            alt=""
            style={{
              width: '180px',
              filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))',
            }}
          />
        </div>
        
        <div className="text-center">
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            color: 'rgba(140, 155, 255, 0.6)',
            marginBottom: '20px',
            textTransform: 'uppercase',
          }}>
            Инвестиция в бизнес
          </p>
          
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '42px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#E3D9C6',
            marginBottom: '8px',
          }}>
            от 9 990 ₽
          </p>
          
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.35)',
            marginBottom: '40px',
          }}>
            Запуск за 14 дней
          </p>
          
          <button
            onClick={() => window.location.hash = '#/constructor'}
            className="cta-button"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#020205',
              background: '#E3D9C6',
              padding: '18px 48px',
              border: 'none',
              borderRadius: '0',
              cursor: 'pointer',
            }}
            data-testid="button-order-cta"
          >
            Забронировать
          </button>
        </div>
        
        {/* Footer note */}
        <p 
          className="text-center mt-16"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '14px',
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          « Где каждая деталь имеет значение »
        </p>
      </section>
      
      {/* Bottom spacer */}
      <div className="h-24" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
        
        @keyframes mockupFloat {
          0% {
            opacity: 0;
            transform: translateY(40px) rotate(6deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotate(6deg);
          }
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes tileReveal {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes lightSweep {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
        
        .app-tile {
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .app-tile:hover {
          padding-left: 8px;
        }
        
        .app-tile:hover .tile-title {
          color: #FFFFFF;
        }
        
        .app-tile:hover .tile-arrow {
          color: rgba(140, 155, 255, 0.8);
          transform: translateX(8px);
        }
        
        .signature-card {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .signature-card:hover {
          background: rgba(140, 155, 255, 0.08);
          border-color: rgba(140, 155, 255, 0.15);
        }
        
        .cta-button {
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .cta-button:hover {
          background: #FFFFFF;
          box-shadow: 0 16px 48px rgba(227, 217, 198, 0.2);
          transform: translateY(-2px);
        }
        
        .cta-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
