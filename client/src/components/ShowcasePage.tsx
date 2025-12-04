import { ArrowRight, Sparkles, CreditCard, Users } from "lucide-react";
import { useCallback, memo } from "react";
import { m } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useTrackInteraction } from '@/hooks/useAIRecommendations';
import { LazyVideo } from './LazyVideo';
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const { hapticFeedback } = useTelegram();
  const haptic = useHaptic();
  const trackInteraction = useTrackInteraction();
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const handleNavigate = useCallback((section: string) => {
    haptic.light();
    onNavigate(section);
  }, [haptic, onNavigate]);

  return (
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: '#0A0A0B' }}
    >
      <div 
        className="max-w-md mx-auto px-4 pb-8"
        style={{ paddingTop: '140px' }}
      >
        <m.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-3"
        >
          <m.div
            variants={cardVariants}
            className="relative rounded-3xl overflow-hidden cursor-pointer group"
            onClick={() => handleOpenDemo('clothing-store')}
            onMouseEnter={() => preloadDemo('clothing-store')}
            onTouchStart={() => preloadDemo('clothing-store')}
            data-testid="hero-card-main"
            style={{
              backgroundColor: '#111113',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
            }}
          >
            <div className="relative h-[280px] overflow-hidden">
              <LazyVideo
                src={heroVideo}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, rgba(10,10,11,0.3) 0%, rgba(10,10,11,0.1) 40%, rgba(10,10,11,0.7) 100%)'
                }}
              />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 w-fit"
                  style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span 
                    className="text-[11px] font-semibold tracking-wide"
                    style={{ color: '#10B981' }}
                  >
                    TELEGRAM APPS
                  </span>
                </div>
                
                <h1 
                  className="text-[28px] font-bold leading-tight mb-2"
                  style={{ 
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                  }}
                >
                  Ваш бизнес в Telegram
                </h1>
                
                <p 
                  className="text-[14px] leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Магазины, записи, оплаты — всё в одном месте
                </p>
              </div>
            </div>
          </m.div>

          <div className="grid grid-cols-2 gap-3">
            <m.div
              variants={cardVariants}
              className="rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95"
              onClick={() => handleNavigate('projects')}
              data-testid="metric-card-projects"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div 
                className="text-[32px] font-bold mb-1"
                style={{ 
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                50+
              </div>
              <div 
                className="text-[13px] font-medium"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Проектов запущено
              </div>
            </m.div>

            <m.div
              variants={cardVariants}
              className="rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95"
              onClick={() => handleNavigate('projects')}
              data-testid="metric-card-launch"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div 
                className="text-[32px] font-bold mb-1"
                style={{ 
                  color: '#10B981',
                  letterSpacing: '-0.03em',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                24ч
              </div>
              <div 
                className="text-[13px] font-medium"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                До запуска
              </div>
            </m.div>
          </div>

          <m.div
            variants={cardVariants}
            className="relative rounded-3xl overflow-hidden cursor-pointer group"
            onClick={() => handleOpenDemo('clothing-store')}
            onMouseEnter={() => preloadDemo('clothing-store')}
            onTouchStart={() => preloadDemo('clothing-store')}
            data-testid="demo-card-clothing"
            style={{
              backgroundColor: '#111113',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
            }}
          >
            <div className="relative h-[200px] overflow-hidden">
              <LazyVideo
                src={fashionVideo}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 40%, rgba(17,17,19,0.95) 100%)'
                }}
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <div>
                  <div 
                    className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Fashion Store
                  </div>
                  <div 
                    className="text-[18px] font-bold"
                    style={{ 
                      color: '#FFFFFF',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Премиум каталог
                  </div>
                </div>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </m.div>

          <div className="grid grid-cols-2 gap-3">
            <m.div
              variants={cardVariants}
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square"
              onClick={() => handleOpenDemo('sneaker-store')}
              onMouseEnter={() => preloadDemo('sneaker-store')}
              onTouchStart={() => preloadDemo('sneaker-store')}
              data-testid="demo-card-sneaker"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <LazyVideo
                src={sneakerVideo}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 50%, rgba(17,17,19,0.9) 100%)'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div 
                  className="text-[11px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Sneaker Store
                </div>
              </div>
            </m.div>

            <m.div
              variants={cardVariants}
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square"
              onClick={() => handleOpenDemo('luxury-watches')}
              onMouseEnter={() => preloadDemo('luxury-watches')}
              onTouchStart={() => preloadDemo('luxury-watches')}
              data-testid="demo-card-watches"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <LazyVideo
                src={watchesVideo}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 50%, rgba(17,17,19,0.9) 100%)'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div 
                  className="text-[11px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Luxury Watches
                </div>
              </div>
            </m.div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <m.div
              variants={cardVariants}
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square"
              onClick={() => handleOpenDemo('futuristic-fashion-1')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-1')}
              onTouchStart={() => preloadDemo('futuristic-fashion-1')}
              data-testid="demo-card-outdoor"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src={rascalImage}
                alt="Outdoor Gear"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 50%, rgba(17,17,19,0.9) 100%)'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div 
                  className="text-[11px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Outdoor Gear
                </div>
              </div>
            </m.div>

            <m.div
              variants={cardVariants}
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square"
              onClick={() => handleOpenDemo('futuristic-fashion-2')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-2')}
              onTouchStart={() => preloadDemo('futuristic-fashion-2')}
              data-testid="demo-card-minimal"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src={nikeGreenImage}
                alt="Minimal Store"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 50%, rgba(17,17,19,0.9) 100%)'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div 
                  className="text-[11px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Minimal Store
                </div>
              </div>
            </m.div>
          </div>

          <m.div
            variants={cardVariants}
            className="flex items-center justify-center gap-3 py-4"
            data-testid="features-strip"
          >
            {[
              { icon: Sparkles, label: 'AI', id: 'ai' },
              { icon: CreditCard, label: 'Payments', id: 'payments' },
              { icon: Users, label: 'CRM', id: 'crm' }
            ].map((item) => (
              <div
                key={item.id}
                data-testid={`feature-pill-${item.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <item.icon 
                  className="w-3.5 h-3.5"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                />
                <span 
                  className="text-[12px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </m.div>

          <m.div
            variants={cardVariants}
            className="rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
            onClick={() => handleNavigate('projects')}
            data-testid="cta-section"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 8px 30px rgba(16,185,129,0.25)'
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div 
                  className="text-[20px] font-bold mb-1"
                  style={{ 
                    color: '#000000',
                    letterSpacing: '-0.01em',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                  }}
                >
                  Запустить проект
                </div>
                <div 
                  className="text-[14px] font-medium"
                  style={{ color: 'rgba(0,0,0,0.6)' }}
                >
                  Бесплатная консультация
                </div>
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
              >
                <ArrowRight className="w-6 h-6 text-black" />
              </div>
            </div>
          </m.div>

          <m.div
            variants={cardVariants}
            className="grid grid-cols-2 gap-3"
          >
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[4/3]"
              onClick={() => handleOpenDemo('futuristic-fashion-3')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-3')}
              onTouchStart={() => preloadDemo('futuristic-fashion-3')}
              data-testid="demo-card-brand"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src={nikeDestinyImage}
                alt="Brand Store"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 50%, rgba(17,17,19,0.9) 100%)'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div 
                  className="text-[11px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Brand Store
                </div>
              </div>
            </div>

            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[4/3]"
              onClick={() => handleOpenDemo('futuristic-fashion-4')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-4')}
              onTouchStart={() => preloadDemo('futuristic-fashion-4')}
              data-testid="demo-card-catalog"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src={nikeAcgImage}
                alt="Catalog"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 50%, rgba(17,17,19,0.9) 100%)'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div 
                  className="text-[11px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  ACG Collection
                </div>
              </div>
            </div>
          </m.div>

          <m.div
            variants={cardVariants}
            className="text-center py-6"
          >
            <div 
              className="text-[12px] font-medium"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              WEB4TG.AGENCY
            </div>
          </m.div>
        </m.div>
      </div>
    </div>
  );
}

export default memo(ShowcasePage);
