import { Smartphone, ShoppingCart, Code, Star, Users, ArrowRight } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { m } from 'framer-motion';
import { MotionStagger, MotionBox, HoverScale } from './MotionWrapper';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useTrackInteraction } from '@/hooks/useAIRecommendations';
import { LazyVideo } from './LazyVideo';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { useVideoPreload } from '../hooks/useVideoPreload';
import { preloadDemo } from './demos/DemoRegistry';
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import nikeAcgImage from "@assets/acc835fff3bb452f0c3b534056fbe1ea_1763719574494.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";
const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const heroVideo = "/videos/1341996d8f73172cbc77930dc818d88e_t4_1763643600785.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const OpenAppButton = memo<{ 
  onClick: () => void; 
  variant?: 'light' | 'dark' | 'accent';
  size?: 'sm' | 'md';
}>(({ onClick, variant = 'light', size = 'md' }) => {
  const baseStyles = size === 'sm' 
    ? "px-3 py-1.5 text-[10px]" 
    : "px-4 py-2 text-xs";
  
  const variantStyles = {
    light: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: '#FFFFFF'
    },
    dark: {
      background: 'rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#FFFFFF'
    },
    accent: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      border: 'none',
      color: '#FFFFFF'
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`${baseStyles} rounded-full font-bold tracking-wide uppercase flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95`}
      style={{
        ...variantStyles[variant],
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}
      data-testid="button-open-app"
    >
      <span>Открыть</span>
      <ArrowRight className="w-3 h-3" />
    </button>
  );
});

const VideoHeroCard = memo<{ onOpenDemo: (id: string) => void }>(({ onOpenDemo }) => {
  const videoRef = useVideoPreload();
  
  return (
    <div 
      className="relative h-full rounded-3xl overflow-hidden group tg-interactive cursor-pointer"
      data-testid="hero-card-clothing"
      onClick={() => onOpenDemo('clothing-store')}
      onMouseEnter={() => preloadDemo('clothing-store')}
      onTouchStart={() => preloadDemo('clothing-store')}
    >
      <video
        ref={videoRef}
        src={fashionVideo}
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
      
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold"
        style={{
          background: 'rgba(205, 255, 56, 0.95)',
          color: '#0A0A0A'
        }}
      >
        NEW
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="text-white text-4xl font-light mb-2"
          style={{ letterSpacing: '0.4em' }}
        >
          A L U R E
        </div>
        <div className="text-white/70 text-sm uppercase tracking-widest mb-4">
          Premium Streetwear
        </div>
        <OpenAppButton onClick={() => onOpenDemo('clothing-store')} variant="accent" />
      </div>
    </div>
  );
});

const SneakerDemoCard = memo<{ onOpenDemo: (id: string) => void }>(({ onOpenDemo }) => {
  const videoRef = useVideoPreload();
  
  return (
    <div 
      className="relative h-full rounded-2xl overflow-hidden group tg-interactive cursor-pointer"
      data-testid="demo-card-sneaker-store"
      onClick={() => onOpenDemo('sneaker-store')}
      onMouseEnter={() => preloadDemo('sneaker-store')}
      onTouchStart={() => preloadDemo('sneaker-store')}
    >
      <video
        ref={videoRef}
        src={sneakerVideo}
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
    
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white text-xl font-light tracking-[0.35em]"
              style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
            >
              S O L E
            </div>
            <div className="h-[1px] w-10 mt-1"
              style={{ background: 'linear-gradient(90deg, rgba(100, 235, 220, 0.6), transparent)' }}
            ></div>
          </div>
          
          <div className="px-2 py-0.5 text-[8px] font-medium tracking-wide"
            style={{
              background: 'rgba(100, 235, 220, 0.15)',
              border: '1px solid rgba(100, 235, 220, 0.3)',
              borderRadius: '6px',
              color: '#64EBDC'
            }}
          >
            EXCLUSIVE
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-white/60 text-[9px] uppercase tracking-wider mb-2">Premium Sneakers</div>
          <OpenAppButton onClick={() => onOpenDemo('sneaker-store')} variant="light" size="sm" />
        </div>
      </div>
    </div>
  );
});

const WatchesDemoCard = memo<{ onOpenDemo: (id: string) => void }>(({ onOpenDemo }) => {
  const videoRef = useVideoLazyLoad();
  
  return (
    <div 
      className="relative h-full rounded-2xl overflow-hidden group tg-interactive cursor-pointer"
      data-testid="demo-card-luxury-watches"
      onClick={() => onOpenDemo('luxury-watches')}
      onMouseEnter={() => preloadDemo('luxury-watches')}
      onTouchStart={() => preloadDemo('luxury-watches')}
    >
      <video
        ref={videoRef}
        src={watchesVideo}
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
    
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-light tracking-[0.40em]"
              style={{
                background: 'linear-gradient(135deg, #E8D4A0 0%, #D6B980 50%, #C9A870 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              L U X E
            </div>
            <div className="h-[1px] w-10 mt-1"
              style={{ background: 'linear-gradient(90deg, rgba(214, 185, 128, 0.4), transparent)' }}
            ></div>
          </div>
          
          <div className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#D6B980',
              boxShadow: '0 0 8px rgba(214, 185, 128, 0.6)'
            }}
          ></div>
        </div>
        
        <div className="text-center">
          <div className="text-white/50 text-[9px] uppercase tracking-wider mb-2">Swiss Timepieces</div>
          <OpenAppButton onClick={() => onOpenDemo('luxury-watches')} variant="light" size="sm" />
        </div>
      </div>
    </div>
  );
});

const ImageDemoCard = memo<{
  id: string;
  image: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  badgeStyle?: React.CSSProperties;
  onOpenDemo: (id: string) => void;
}>(({ id, image, title, subtitle, category, badge, badgeStyle, onOpenDemo }) => (
  <div 
    className="relative h-full rounded-2xl overflow-hidden cursor-pointer group tg-interactive"
    onClick={() => onOpenDemo(id)}
    onMouseEnter={() => preloadDemo(id)}
    onTouchStart={() => preloadDemo(id)}
    data-testid={`demo-card-${id}`}
  >
    <img
      src={image}
      alt={title}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
    
    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
      style={badgeStyle || { background: 'rgba(16, 185, 129, 0.9)', color: '#FFFFFF' }}
    >
      {badge}
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="text-emerald-400 text-[10px] mb-1.5 font-bold tracking-wider">{category}</div>
      <h3 className="text-white text-lg font-bold mb-0.5">{title}</h3>
      <p className="text-white/60 text-xs mb-3">{subtitle}</p>
      <OpenAppButton onClick={() => onOpenDemo(id)} variant="light" size="sm" />
    </div>
  </div>
));

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const { hapticFeedback, isDark, colorScheme, devicePerformance } = useTelegram();
  const haptic = useHaptic();
  const trackInteraction = useTrackInteraction();
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <div className="max-w-md mx-auto min-h-screen p-4 relative z-10">
        
        <div className="relative py-8 mb-8 overflow-hidden">
          <div className="space-y-6">
            
            <div className="relative rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }}
            >
              <div className="relative rounded-2xl overflow-hidden" style={{ background: '#000000' }}>
                <LazyVideo
                  src={heroVideo}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                />
                
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)' }}
                ></div>
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px]"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
                  }}
                />
              
                <div className="relative px-4 py-12 text-center flex items-center justify-center min-h-[45vh]">
                  <div 
                    className="relative rounded-2xl px-5 py-6 mx-auto w-full max-w-[280px]"
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div 
                      className="inline-block px-3 py-1 rounded-full mb-3 text-xs font-bold tracking-wider"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      2025
                    </div>
                    
                    <h1 
                      className="text-3xl font-black mb-2 leading-tight"
                      style={{
                        color: '#FFFFFF',
                        textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      TELEGRAM
                    </h1>
                    
                    <div 
                      className="text-lg font-bold tracking-wide mb-3"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      ДЛЯ БИЗНЕСА
                    </div>
                    
                    <div 
                      className="w-12 h-0.5 mx-auto mb-3 rounded-full"
                      style={{ background: 'linear-gradient(90deg, transparent, #10B981, transparent)' }}
                    />
                    
                    <p className="text-xs font-semibold tracking-wide" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      ПРЕМИАЛЬНЫЕ ПРИЛОЖЕНИЯ
                    </p>
                    <p className="text-[10px] font-medium tracking-wider mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      РАЗРАБОТКА • ДИЗАЙН • ЗАПУСК
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4 text-center px-4">
              <h2 className="text-xl font-black uppercase tracking-wider" style={{ color: '#FFFFFF', letterSpacing: '0.1em' }}>
                ДЕМО-ПРИЛОЖЕНИЯ
              </h2>
              <p className="text-white/50 text-xs mt-1">Нажмите чтобы открыть</p>
            </div>

            <div className="grid grid-cols-2 gap-3 px-2">
              
              <div className="col-span-2 h-[380px]">
                <VideoHeroCard onOpenDemo={handleOpenDemo} />
              </div>
              
              <div className="col-span-1 h-[200px]">
                <SneakerDemoCard onOpenDemo={handleOpenDemo} />
              </div>
              <div className="col-span-1 h-[200px]">
                <WatchesDemoCard onOpenDemo={handleOpenDemo} />
              </div>
              
              <div className="col-span-1 h-[260px]">
                <ImageDemoCard
                  id="futuristic-fashion-1"
                  image={rascalImage}
                  title="Rascal"
                  subtitle="Waterproof Fashion"
                  category="OUTDOOR"
                  badge="NEW"
                  badgeStyle={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF' }}
                  onOpenDemo={handleOpenDemo}
                />
              </div>

              <div className="col-span-1 h-[260px]">
                <ImageDemoCard
                  id="futuristic-fashion-2"
                  image={nikeDestinyImage}
                  title="STORE"
                  subtitle="Black Minimal"
                  category="MINIMAL"
                  badge="PREMIUM"
                  badgeStyle={{ background: '#000000', color: '#FFFFFF' }}
                  onOpenDemo={handleOpenDemo}
                />
              </div>

              <div className="col-span-1 h-[260px]">
                <ImageDemoCard
                  id="futuristic-fashion-3"
                  image={nikeGreenImage}
                  title="lab. SURVIVALIST"
                  subtitle="Black & White"
                  category="LUXURY"
                  badge="LUXURY"
                  badgeStyle={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }}
                  onOpenDemo={handleOpenDemo}
                />
              </div>

              <div className="col-span-1 h-[260px]">
                <ImageDemoCard
                  id="futuristic-fashion-4"
                  image={nikeAcgImage}
                  title="Nike ACG"
                  subtitle="3D Card Design"
                  category="INTERACTIVE"
                  badge="3D"
                  badgeStyle={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFFFFF' }}
                  onOpenDemo={handleOpenDemo}
                />
              </div>

            </div>

          </div>
        </div>

        <MotionStagger className="grid grid-cols-2 gap-3 mt-6 px-2">
          
          <MotionBox variant="fadeInScale">
            <HoverScale scale={1.02}>
              <div 
                className="col-span-2 relative rounded-2xl p-5 cursor-pointer overflow-hidden group tg-interactive"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                }}
                onClick={() => onNavigate('projects')}
                data-testid="card-main-services"
              >
                <div className="absolute inset-0 opacity-20"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 70%)' }}
                />
                
                <div className="absolute top-4 left-4 z-10">
                  <div className="w-8 h-8 text-black" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))' }}>
                    <Star className="w-full h-full" fill="currentColor" />
                  </div>
                </div>
                
                <div className="relative text-black text-[72px] font-black leading-none mb-1 tracking-tighter"
                  style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)' }}
                >
                  4
                </div>
                
                <div className="relative text-black font-black text-xl mb-0.5 tracking-tight">
                  SERVICES
                </div>
                
                <div className="relative text-black/70 text-xs font-medium">
                  Готовые решения для бизнеса
                </div>
                
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)' }}
                >
                  <span className="text-white text-[10px] font-bold tracking-wide">WEB4TG.AGENCY</span>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp">
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-2xl p-4 cursor-pointer overflow-hidden group tg-interactive"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
                }}
                onClick={() => onOpenDemo('clothing-store')}
                data-testid="card-telegram-apps"
              >
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                >
                  <span className="text-white text-[10px] font-bold tracking-wide">24H</span>
                </div>
                
                <div className="text-black/80 text-2xl font-thin mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '2px' }}>1/4</div>
                
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-black text-base font-bold leading-tight">Mini Apps</h3>
                  <p className="text-black/70 text-[11px] leading-tight">Запуск за 24 часа</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp" delay={0.1}>
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-2xl p-4 cursor-pointer tg-interactive"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
                onClick={() => onOpenDemo('electronics')}
              >
                <div className="absolute top-3 right-3 bg-white/15 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                  REMOTE
                </div>
                
                <div className="text-white/80 text-2xl font-thin mb-2" style={{ letterSpacing: '2px' }}>2/4</div>
                
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center mb-3">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-white text-base font-bold leading-tight">E-Commerce</h3>
                  <p className="text-white/60 text-[11px] leading-tight">Онлайн-магазины</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp" delay={0.15}>
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-2xl p-4 cursor-pointer tg-interactive"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
                onClick={() => onOpenDemo('beauty')}
              >
                <div className="absolute top-3 right-3 bg-white/15 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                  AI
                </div>
                
                <div className="text-white/80 text-2xl font-thin mb-2" style={{ letterSpacing: '2px' }}>3/4</div>
                
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center mb-3">
                  <Code className="w-5 h-5 text-white" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-white text-base font-bold leading-tight">Automation</h3>
                  <p className="text-white/60 text-[11px] leading-tight">AI-боты и CRM</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp" delay={0.2}>
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-2xl p-4 cursor-pointer tg-interactive"
                style={{ backgroundColor: '#10B981' }}
                onClick={() => onNavigate('projects')}
              >
                <div className="absolute top-3 right-3 bg-black/20 text-black text-[10px] px-2 py-1 rounded-full font-bold">
                  VIEW
                </div>
                
                <div className="text-black/80 text-2xl font-thin mb-2" style={{ letterSpacing: '2px' }}>4/4</div>
                
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-black text-base font-bold leading-tight">Портфолио</h3>
                  <p className="text-black/70 text-[11px] leading-tight">Наши проекты</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

        </MotionStagger>
        
      </div>
    </div>
  );
}

export default React.memo(ShowcasePage);
