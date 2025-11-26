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
  
  const videoRef1 = useVideoPreload();
  const videoRef2 = useVideoPreload();
  const videoRef3 = useVideoLazyLoad();
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <div className="max-w-md mx-auto min-h-screen px-3 py-4 relative z-10">
        
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

        <div className="mb-4 px-1">
          <h2 className="text-lg font-black uppercase tracking-wide" style={{ color: '#FFFFFF' }}>
            Такое будет у вас
          </h2>
          <p className="text-white/40 text-[11px] mt-0.5">Нажмите и попробуйте как клиент</p>
        </div>

        <div className="space-y-3 mb-8">
          
          <div 
            className="relative h-[320px] rounded-2xl overflow-hidden group cursor-pointer"
            onClick={() => handleOpenDemo('clothing-store')}
            onMouseEnter={() => preloadDemo('clothing-store')}
            onTouchStart={() => preloadDemo('clothing-store')}
            data-testid="demo-card-clothing"
          >
            <video
              ref={videoRef1}
              src={fashionVideo}
              loop muted playsInline preload="none"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            <div className="absolute top-3 left-3 text-[9px] font-medium uppercase tracking-widest text-white/60">
              Магазин одежды
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: '#CDFF38', color: '#0A0A0A' }}
            >
              NEW
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="text-white text-3xl font-extralight tracking-[0.35em] mb-1">
                A L U R E
              </div>
              <div className="text-white/50 text-xs mb-3">Продажи 24/7 без вашего участия</div>
              <div 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold transition-all duration-200 active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '0.5px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF'
                }}
              >
                <span>Открыть</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            
            <div 
              className="relative h-[200px] rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => handleOpenDemo('sneaker-store')}
              onMouseEnter={() => preloadDemo('sneaker-store')}
              onTouchStart={() => preloadDemo('sneaker-store')}
              data-testid="demo-card-sneaker"
            >
              <video
                ref={videoRef2}
                src={sneakerVideo}
                loop muted playsInline preload="none"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3 text-[8px] font-medium uppercase tracking-widest text-cyan-300/80">
                Кроссовки
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-white text-lg font-light tracking-[0.2em] mb-0.5">SOLE</div>
                <div className="text-white/40 text-[10px] mb-2">+180% конверсия</div>
                <div 
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF'
                  }}
                >
                  <span>Открыть</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            <div 
              className="relative h-[200px] rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => handleOpenDemo('luxury-watches')}
              onMouseEnter={() => preloadDemo('luxury-watches')}
              onTouchStart={() => preloadDemo('luxury-watches')}
              data-testid="demo-card-watches"
            >
              <video
                ref={videoRef3}
                src={watchesVideo}
                loop muted playsInline preload="none"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3 text-[8px] font-medium uppercase tracking-widest"
                style={{ color: 'rgba(214, 185, 128, 0.8)' }}
              >
                Премиум
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-lg font-light tracking-[0.25em] mb-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #E8D4A0, #C9A870)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  LUXE
                </div>
                <div className="text-white/40 text-[10px] mb-2">Средний чек x2.5</div>
                <div 
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF'
                  }}
                >
                  <span>Открыть</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            
            <div 
              className="relative h-[180px] rounded-2xl overflow-hidden group cursor-pointer col-span-2"
              onClick={() => handleOpenDemo('futuristic-fashion-1')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-1')}
              onTouchStart={() => preloadDemo('futuristic-fashion-1')}
              data-testid="demo-card-outdoor"
            >
              <img
                src={rascalImage}
                alt="Outdoor"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute top-3 left-3 text-[8px] font-medium uppercase tracking-widest text-emerald-400/80">
                Outdoor
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold"
                style={{ background: 'rgba(16, 185, 129, 0.9)', color: '#fff' }}
              >
                NEW
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-white text-base font-bold mb-0.5">Rascal</div>
                <div className="text-white/40 text-[10px] mb-2">Заказы без менеджера</div>
                <div 
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF'
                  }}
                >
                  <span>Открыть</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            <div 
              className="relative h-[180px] rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => handleOpenDemo('futuristic-fashion-2')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-2')}
              onTouchStart={() => preloadDemo('futuristic-fashion-2')}
              data-testid="demo-card-minimal"
            >
              <img
                src={nikeDestinyImage}
                alt="Minimal"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <div className="absolute top-3 left-3 text-[7px] font-medium uppercase tracking-widest text-white/50">
                Быстро
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <div className="text-white text-sm font-bold">STORE</div>
                <div className="text-white/40 text-[9px] mb-1.5">За 24 часа</div>
                <div 
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF'
                  }}
                >
                  <span>Открыть</span>
                  <ArrowRight className="w-2 h-2" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            
            <div 
              className="relative h-[220px] rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => handleOpenDemo('futuristic-fashion-3')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-3')}
              onTouchStart={() => preloadDemo('futuristic-fashion-3')}
              data-testid="demo-card-brand"
            >
              <img
                src={nikeGreenImage}
                alt="Brand"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute top-3 left-3 text-[8px] font-medium uppercase tracking-widest text-white/50">
                Ваш бренд
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-medium"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(4px)' }}
              >
                VIP
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-white text-sm font-bold mb-0.5">lab. SURVIVALIST</div>
                <div className="text-white/40 text-[10px] mb-2">Под ваш стиль</div>
                <div 
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF'
                  }}
                >
                  <span>Открыть</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            <div 
              className="relative h-[220px] rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => handleOpenDemo('futuristic-fashion-4')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-4')}
              onTouchStart={() => preloadDemo('futuristic-fashion-4')}
              data-testid="demo-card-catalog"
            >
              <img
                src={nikeAcgImage}
                alt="Catalog"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute top-3 left-3 text-[8px] font-medium uppercase tracking-widest text-blue-400/80">
                Интерактив
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: '#fff' }}
              >
                WOW
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-white text-sm font-bold mb-0.5">Nike ACG</div>
                <div className="text-white/40 text-[10px] mb-2">Клиенты в восторге</div>
                <div 
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF'
                  }}
                >
                  <span>Открыть</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>

        </div>

        <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 px-1">
          
          <MotionBox variant="fadeInScale">
            <HoverScale scale={1.02}>
              <div 
                className="sm:col-span-2 relative rounded-2xl p-4 sm:p-6 cursor-pointer overflow-hidden group tg-interactive"
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
