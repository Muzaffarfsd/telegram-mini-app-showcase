import { Smartphone, ShoppingCart, Code, Star, Users, ArrowRight, Zap, TrendingUp } from "lucide-react";
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

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const { hapticFeedback, isDark, colorScheme, devicePerformance } = useTelegram();
  const haptic = useHaptic();
  const trackInteraction = useTrackInteraction();
  
  const videoRef2 = useVideoPreload();
  const { videoRef: videoRef3 } = useVideoLazyLoad();
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Premium ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 animated-gradient-bg opacity-40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px]" />
      </div>
      
      <div className="max-w-md mx-auto min-h-screen px-3 pb-4 relative z-10" style={{ paddingTop: '120px' }}>
        
        <div className="relative rounded-2xl overflow-hidden mb-6"
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
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)' }}
            />
          
            <div className="relative px-4 py-10 text-center flex items-center justify-center min-h-[38vh]">
              <div 
                className="relative rounded-2xl px-5 py-5 mx-auto w-full max-w-[260px]"
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div 
                  className="inline-block px-3 py-1 rounded-full mb-3 text-[10px] font-bold tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  +300% К ПРОДАЖАМ
                </div>
                
                <h1 className="text-xl font-black mb-1.5" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  ВАШИ КЛИЕНТЫ
                </h1>
                
                <div 
                  className="text-base font-bold tracking-wide mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  УЖЕ В TELEGRAM
                </div>
                
                <p className="text-[11px] font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Получайте заказы 24/7 без сайта
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          
          {/* Main Hero Card - White/Light style like T-P67 */}
          <div 
            className="relative rounded-3xl overflow-hidden group cursor-pointer tap-scale card-animate premium-glow"
            onClick={() => handleOpenDemo('clothing-store')}
            onMouseEnter={() => preloadDemo('clothing-store')}
            onTouchStart={() => preloadDemo('clothing-store')}
            data-testid="demo-card-clothing"
            style={{ 
              background: 'linear-gradient(180deg, #F5F5F7 0%, #E8E8ED 100%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.1)'
            }}
          >
            <div className="p-5 pb-4">
              {/* Header with logo */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-2xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>
                  ALURE
                </div>
                {/* Decorative tribal-style icon */}
                <svg width="40" height="32" viewBox="0 0 40 32" fill="none" className="opacity-80">
                  <path d="M20 4C20 4 12 8 8 16C4 24 8 28 8 28M20 4C20 4 28 8 32 16C36 24 32 28 32 28M20 4V12M14 20C14 20 17 24 20 24C23 24 26 20 26 20" stroke="#1D1D1F" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="20" cy="16" r="2" fill="#1D1D1F"/>
                </svg>
              </div>
              
              {/* Warning section */}
              <div className="text-center mb-4">
                <div className="text-[10px] font-bold tracking-[0.2em] mb-2" style={{ color: '#1D1D1F' }}>
                  МАГАЗИН В TELEGRAM
                </div>
                <p className="text-[9px] leading-relaxed px-2" style={{ color: 'rgba(29, 29, 31, 0.6)' }}>
                  АВТОМАТИЧЕСКИЕ ПРОДАЖИ. КАТАЛОГ ТОВАРОВ. КОРЗИНА И ОПЛАТА. 
                  ИНТЕГРАЦИЯ С CRM. УВЕДОМЛЕНИЯ О ЗАКАЗАХ. БЕЗ САЙТА И ПРИЛОЖЕНИЯ.
                </p>
              </div>
              
              {/* Price and CTA */}
              <div 
                className="flex items-center justify-between rounded-full px-4 py-2.5 mt-3"
                style={{ background: 'rgba(29, 29, 31, 0.08)' }}
              >
                <span className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>от 9 990 ₽</span>
                <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#1D1D1F' }}>
                  <span>ОТКРЫТЬ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 2x2 Grid - Dark cards with images */}
          <div className="grid grid-cols-2 gap-3">
            {/* ART STORE style card */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer tap-scale card-animate border-glow"
              onClick={() => handleOpenDemo('sneaker-store')}
              onMouseEnter={() => preloadDemo('sneaker-store')}
              onTouchStart={() => preloadDemo('sneaker-store')}
              data-testid="demo-card-sneaker"
              style={{ background: '#1C1C1E' }}
            >
              <video
                ref={videoRef2}
                src={sneakerVideo}
                loop muted playsInline preload="none"
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  SNEAKER STORE
                </div>
              </div>
            </div>

            {/* SOUND SHOP style card - Blue tinted */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer tap-scale card-animate border-glow"
              onClick={() => handleOpenDemo('luxury-watches')}
              onMouseEnter={() => preloadDemo('luxury-watches')}
              onTouchStart={() => preloadDemo('luxury-watches')}
              data-testid="demo-card-watches"
              style={{ background: '#4A5568' }}
            >
              <video
                ref={videoRef3}
                src={watchesVideo}
                loop muted playsInline preload="none"
                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'saturate(0.8) brightness(0.9)' }}
              />
              <div className="absolute inset-0" style={{ background: 'rgba(59, 130, 246, 0.15)' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  LUXURY WATCHES
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Colored cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Olive/Khaki card like T-P67 DISCOVER */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer tap-scale card-animate border-glow"
              onClick={() => handleOpenDemo('futuristic-fashion-1')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-1')}
              onTouchStart={() => preloadDemo('futuristic-fashion-1')}
              data-testid="demo-card-outdoor"
              style={{ background: 'linear-gradient(180deg, #6B7B5C 0%, #5A6A4D 100%)' }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="text-xl font-black tracking-tight mb-2 text-white">
                  RASCAL
                </div>
                {/* Star icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-4 opacity-80">
                  <path d="M12 2L14 10H22L16 14L18 22L12 18L6 22L8 14L2 10H10L12 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                </svg>
                
                {/* DISCOVER button */}
                <div 
                  className="px-6 py-2 rounded-full text-[10px] font-bold tracking-wider transition-all duration-200 active:scale-95"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.25)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  ОТКРЫТЬ
                </div>
              </div>
            </div>

            {/* Dark gray card like MUSIC CLUB */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer tap-scale card-animate border-glow"
              onClick={() => handleOpenDemo('futuristic-fashion-2')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-2')}
              onTouchStart={() => preloadDemo('futuristic-fashion-2')}
              data-testid="demo-card-minimal"
              style={{ background: 'linear-gradient(180deg, #3A3A3C 0%, #2C2C2E 100%)' }}
            >
              {/* Arrow icon in top right */}
              <div 
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              >
                <ArrowRight className="w-3.5 h-3.5 text-white -rotate-45" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-sm font-bold text-white mb-0.5">FASHION STORE</div>
                <div className="text-sm font-bold text-white mb-0.5">CATALOG</div>
                <div className="text-[10px] font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  MOSCOW/DUBAI
                </div>
              </div>
            </div>
          </div>

          {/* Additional row - More cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Brand card */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer tap-scale card-animate border-glow"
              onClick={() => handleOpenDemo('futuristic-fashion-3')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-3')}
              onTouchStart={() => preloadDemo('futuristic-fashion-3')}
              data-testid="demo-card-brand"
              style={{ background: '#1C1C1E' }}
            >
              <img
                src={nikeGreenImage}
                alt="Brand"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  BRAND STORE
                </div>
              </div>
            </div>

            {/* Catalog card */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer tap-scale card-animate border-glow"
              onClick={() => handleOpenDemo('futuristic-fashion-4')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-4')}
              onTouchStart={() => preloadDemo('futuristic-fashion-4')}
              data-testid="demo-card-catalog"
              style={{ background: '#1C1C1E' }}
            >
              <img
                src={nikeAcgImage}
                alt="Catalog"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  OUTDOOR GEAR
                </div>
              </div>
            </div>
          </div>

        </div>

        <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 px-1">
          
          <MotionBox variant="fadeInScale">
            <HoverScale scale={1.02}>
              <div 
                className="sm:col-span-2 relative rounded-2xl p-4 sm:p-6 cursor-pointer overflow-hidden group tg-interactive tap-scale pulse-glow"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                onClick={() => onNavigate('projects')}
                data-testid="card-main-services"
              >
                <div className="absolute inset-0 opacity-20"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 70%)' }}
                />
                
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
                  <div className="w-7 sm:w-9 h-7 sm:h-9 text-black" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))' }}>
                    <Star className="w-full h-full" fill="currentColor" />
                  </div>
                </div>
                
                <div className="relative text-black text-[72px] sm:text-[96px] font-black leading-none mb-1 sm:mb-2 tracking-tighter"
                  style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)' }}
                >
                  24ч
                </div>
                
                <div className="relative text-black font-black text-xl sm:text-2xl mb-0.5 sm:mb-1 tracking-tight">
                  ДО ЗАПУСКА
                </div>
                
                <div className="relative text-black/70 text-xs sm:text-sm font-medium">
                  Пока конкуренты думают - вы продаете
                </div>
                
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full"
                  style={{ background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)' }}
                >
                  <span className="text-white text-[10px] sm:text-xs font-bold tracking-wide whitespace-nowrap">WEB4TG.AGENCY</span>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp">
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-3xl p-4 cursor-pointer overflow-hidden group tg-interactive"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
                }}
                onClick={() => handleOpenDemo('clothing-store')}
                data-testid="card-telegram-apps"
              >
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                >
                  <span className="text-white text-[10px] font-bold tracking-wide">УДАЛЕННО</span>
                </div>
                
                <div className="text-black text-3xl font-thin mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '3px' }}>1/4</div>
                
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-black text-lg font-bold leading-tight">Магазин в Telegram</h3>
                  <p className="text-black/70 text-xs leading-tight mb-2">Клиенты покупают прямо в чате. Без сайта, без приложения</p>
                  <p className="text-black/60 text-sm font-medium">ОТ 49 000 Р</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp" delay={0.1}>
            <HoverScale scale={1.05}>
              <div 
                className="relative bg-white/15 border border-white/20 rounded-3xl p-4 cursor-pointer tg-interactive"
                style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}
                onClick={() => handleOpenDemo('electronics')}
              >
                <div className="absolute top-3 right-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                  ХИТ
                </div>
                
                <div className="text-white text-2xl font-black mb-2">x3</div>
                
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold leading-tight">Рост продаж</h3>
                  <p className="text-white/70 text-xs leading-tight mb-2">Автоматические продажи пока вы спите</p>
                  <p className="text-white/60 text-sm font-medium">ГАРАНТИЯ</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp" delay={0.15}>
            <HoverScale scale={1.05}>
              <div 
                className="relative bg-white/15 border border-white/20 rounded-3xl p-4 cursor-pointer tg-interactive"
                style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}
                onClick={() => handleOpenDemo('beauty')}
              >
                <div className="absolute top-3 right-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                  AI
                </div>
                
                <div className="text-white text-2xl font-black mb-2">24/7</div>
                
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                  <Code className="w-5 h-5 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold leading-tight">AI-Ассистент</h3>
                  <p className="text-white/70 text-xs leading-tight mb-2">Отвечает клиентам, принимает заказы за вас</p>
                  <p className="text-white/60 text-sm font-medium">ВКЛЮЧЕНО</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp" delay={0.2}>
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-3xl p-4 cursor-pointer tg-interactive"
                style={{ backgroundColor: '#10B981' }}
                onClick={() => onNavigate('projects')}
              >
                <div className="absolute top-3 right-3 bg-black/20 text-black text-xs px-2 py-1 rounded-full font-medium">
                  КЕЙСЫ
                </div>
                
                <div className="text-black text-3xl font-thin mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '3px' }}>127+</div>
                
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-black text-lg font-bold leading-tight">Довольных клиентов</h3>
                  <p className="text-black/70 text-xs leading-tight mb-2">Реальные результаты. Смотрите сами</p>
                  <p className="text-black/60 text-sm font-medium">ОТЗЫВЫ</p>
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
