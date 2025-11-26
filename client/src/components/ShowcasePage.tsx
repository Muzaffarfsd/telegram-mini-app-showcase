import { ArrowRight, Sparkles, Zap, TrendingUp, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useHaptic } from '../hooks/useHaptic';
import { LazyVideo } from './LazyVideo';
import { preloadDemo } from './demos/DemoRegistry';

// Image assets
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import nikeAcgImage from "@assets/acc835fff3bb452f0c3b534056fbe1ea_1763719574494.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

// Video assets
const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";
const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const heroVideo = "/videos/1341996d8f73172cbc77930dc818d88e_t4_1763643600785.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const haptic = useHaptic();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const handleNavigate = useCallback((section: string) => {
    haptic.medium();
    onNavigate(section);
  }, [haptic, onNavigate]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="max-w-md mx-auto px-3 py-4">
        
        {/* ════════════════════════════════════════════════════════════════
            HERO SECTION - Full bleed video with glassmorphism overlay
            ════════════════════════════════════════════════════════════════ */}
        <div 
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{ 
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)'
          }}
        >
          {/* Background Video */}
          <LazyVideo
            src={heroVideo}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.85 }}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
          />
          
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.7) 100%)' 
            }}
          />
          
          {/* Content */}
          <div className="relative px-5 py-12 text-center min-h-[42vh] flex flex-col items-center justify-center">
            
            {/* Glassmorphism Card */}
            <div 
              className="rounded-2xl px-6 py-6 w-full max-w-[280px]"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Success Badge */}
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 text-[11px] font-bold tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
              >
                <TrendingUp className="w-3 h-3" />
                +300% К ПРОДАЖАМ
              </div>
              
              {/* Headline */}
              <h1 
                className="text-2xl font-black mb-2 tracking-tight"
                style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
              >
                ВАШИ КЛИЕНТЫ
              </h1>
              
              {/* Gradient Text */}
              <div 
                className="text-3xl font-black tracking-tight mb-4"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                УЖЕ В TELEGRAM
              </div>
              
              {/* Subtitle */}
              <p className="text-white/60 text-sm mb-5 leading-relaxed">
                Премиальный магазин там,
                <br />где ваша аудитория
              </p>
              
              {/* CTA Button */}
              <button
                onClick={() => handleNavigate('constructor')}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
                  color: '#000000',
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)'
                }}
                data-testid="button-hero-cta"
              >
                Создать магазин бесплатно
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            STATS SECTION - Trust badges
            ════════════════════════════════════════════════════════════════ */}
        <div 
          className="grid grid-cols-3 gap-3 mb-6"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s'
          }}
        >
          {[
            { icon: Zap, value: '24ч', label: 'Запуск', color: '#F59E0B' },
            { icon: Star, value: '127+', label: 'Проектов', color: '#8B5CF6' },
            { icon: Sparkles, value: 'AI', label: 'Агент', color: '#06B6D4' }
          ].map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl p-4 text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-[11px] text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION HEADER - "Каждый магазин — произведение искусства"
            ════════════════════════════════════════════════════════════════ */}
        <div 
          className="text-center mb-5"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.15s'
          }}
        >
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/40 mb-2">
            Реальные проекты
          </p>
          <h2 className="text-xl font-bold text-white">
            Каждый магазин —
            <br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              произведение искусства
            </span>
          </h2>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            NIKE GALLERY - Product image cards
            ════════════════════════════════════════════════════════════════ */}
        <div 
          className="grid grid-cols-2 gap-3 mb-4"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.2s'
          }}
        >
          {/* Card 1 - Nike Destiny */}
          <div 
            className="relative h-[200px] rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => handleOpenDemo('sneaker-store')}
            onMouseEnter={() => preloadDemo('sneaker-store')}
            onTouchStart={() => preloadDemo('sneaker-store')}
            data-testid="demo-card-destiny"
          >
            <img
              src={nikeDestinyImage}
              alt="Nike Destiny"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            {/* NEW Badge */}
            <div 
              className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[9px] font-bold"
              style={{ background: 'rgba(16, 185, 129, 0.95)', color: '#fff' }}
            >
              NEW
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-white text-sm font-bold mb-0.5">Nike Destiny</div>
              <div className="text-white/50 text-[10px] mb-2">Кроссовки премиум</div>
              <OpenButton />
            </div>
          </div>

          {/* Card 2 - Nike Green */}
          <div 
            className="relative h-[200px] rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => handleOpenDemo('fashion-boutique')}
            onMouseEnter={() => preloadDemo('fashion-boutique')}
            onTouchStart={() => preloadDemo('fashion-boutique')}
            data-testid="demo-card-green"
          >
            <img
              src={nikeGreenImage}
              alt="Nike Green"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            <div className="absolute top-3 left-3 text-[8px] font-medium uppercase tracking-widest text-emerald-400/80">
              Fashion
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-white text-sm font-bold mb-0.5">Nike Collection</div>
              <div className="text-white/50 text-[10px] mb-2">Лимитированная серия</div>
              <OpenButton />
            </div>
          </div>
        </div>

        {/* Wide Card - ACG */}
        <div 
          className="relative h-[180px] rounded-2xl overflow-hidden cursor-pointer group mb-4"
          onClick={() => handleOpenDemo('watches-store')}
          onMouseEnter={() => preloadDemo('watches-store')}
          onTouchStart={() => preloadDemo('watches-store')}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.25s'
          }}
          data-testid="demo-card-acg"
        >
          <img
            src={nikeAcgImage}
            alt="Nike ACG"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          <div 
            className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[9px] font-bold"
            style={{ background: 'rgba(139, 92, 246, 0.95)', color: '#fff' }}
          >
            HOT
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-white text-base font-bold mb-0.5">Nike ACG</div>
            <div className="text-white/50 text-xs mb-2">Outdoor коллекция для настоящих</div>
            <OpenButton />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            VIDEO GALLERY - Pure video cards
            ════════════════════════════════════════════════════════════════ */}
        <div 
          className="grid grid-cols-2 gap-3 mb-6"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.3s'
          }}
        >
          {[
            { src: fashionVideo, id: 'fashion-boutique', label: 'Fashion' },
            { src: sneakerVideo, id: 'sneaker-store', label: 'Sneakers' },
            { src: watchesVideo, id: 'watches-store', label: 'Watches' },
            { src: heroVideo, id: 'restaurant', label: 'Lifestyle' }
          ].map((video, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              style={{ 
                aspectRatio: '4/5',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
              }}
              onClick={() => handleOpenDemo(video.id)}
              onMouseEnter={() => preloadDemo(video.id)}
              onTouchStart={() => preloadDemo(video.id)}
              data-testid={`video-card-${index}`}
            >
              <LazyVideo
                src={video.src}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Category label */}
              <div className="absolute top-3 left-3 text-[8px] font-medium uppercase tracking-widest text-white/60">
                {video.label}
              </div>
              
              {/* Hover CTA */}
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <OpenButton />
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RASCAL FEATURE CARD - Wide showcase
            ════════════════════════════════════════════════════════════════ */}
        <div 
          className="relative h-[200px] rounded-2xl overflow-hidden cursor-pointer group mb-6"
          onClick={() => handleOpenDemo('futuristic-fashion-1')}
          onMouseEnter={() => preloadDemo('futuristic-fashion-1')}
          onTouchStart={() => preloadDemo('futuristic-fashion-1')}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.35s'
          }}
          data-testid="demo-card-rascal"
        >
          <img
            src={rascalImage}
            alt="Rascal Outdoor"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          
          <div className="absolute top-3 left-3 text-[8px] font-medium uppercase tracking-widest text-emerald-400/80">
            Outdoor
          </div>
          <div 
            className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[9px] font-bold"
            style={{ background: 'rgba(16, 185, 129, 0.95)', color: '#fff' }}
          >
            NEW
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-white text-lg font-bold mb-1">Rascal</div>
            <div className="text-white/50 text-xs mb-3">Заказы без менеджера 24/7</div>
            <OpenButton />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            FINAL CTA SECTION
            ════════════════════════════════════════════════════════════════ */}
        <div 
          className="text-center py-8 mb-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.4s'
          }}
        >
          <h3 className="text-lg font-bold text-white mb-2">
            Готовы выделиться?
          </h3>
          <p className="text-white/50 text-sm mb-5">
            Первая консультация бесплатно
          </p>
          
          <button
            onClick={() => handleNavigate('constructor')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
              color: '#000000',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)'
            }}
            data-testid="button-final-cta"
          >
            Создать магазин
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

// Reusable "Open" button component
function OpenButton() {
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 active:scale-95"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(255, 255, 255, 0.2)',
        color: '#FFFFFF'
      }}
    >
      <span>Открыть</span>
      <ArrowRight className="w-2.5 h-2.5" />
    </div>
  );
}

export default ShowcasePage;
