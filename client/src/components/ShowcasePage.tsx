import { ArrowRight, Sparkles, CreditCard, Users, Zap } from "lucide-react";
import { useCallback, memo } from "react";
import { m } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useTrackInteraction } from '@/hooks/useAIRecommendations';
import { preloadDemo } from './demos/DemoRegistry';
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import nikeAcgImage from "@assets/acc835fff3bb452f0c3b534056fbe1ea_1763719574494.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
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
        className="max-w-md mx-auto px-5 pb-32"
        style={{ paddingTop: '140px' }}
      >
        <m.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-8"
        >
          <m.div variants={fadeUp} className="space-y-6">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ 
                backgroundColor: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.2)'
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span 
                className="text-[11px] font-semibold tracking-[0.08em] uppercase"
                style={{ color: '#10B981' }}
              >
                Telegram Apps
              </span>
            </div>

            <div className="space-y-4">
              <h1 
                className="text-[32px] leading-[1.1] font-bold"
                style={{ 
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                Ваши клиенты уже в Telegram.
                <br />
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                  А ваш бизнес?
                </span>
              </h1>
              
              <p 
                className="text-[15px] leading-[1.6] max-w-[320px]"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Магазин, записи, оплаты — всё работает внутри Telegram. Без сайта. Без приложения. Запуск за 24 часа.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleNavigate('projects')}
                className="flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
                }}
                data-testid="cta-primary"
              >
                <span 
                  className="text-[14px] font-semibold"
                  style={{ color: '#000000' }}
                >
                  Запустить проект
                </span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
              
              <button
                onClick={() => handleOpenDemo('clothing-store')}
                onMouseEnter={() => preloadDemo('clothing-store')}
                onTouchStart={() => preloadDemo('clothing-store')}
                className="px-5 py-3 rounded-full transition-all duration-200 active:scale-[0.97]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                data-testid="cta-secondary"
              >
                <span 
                  className="text-[14px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  Смотреть демо
                </span>
              </button>
            </div>
          </m.div>

          <m.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            <div 
              className="p-5 rounded-2xl"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div 
                className="text-[36px] font-bold mb-1"
                style={{ 
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em'
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
            </div>
            
            <div 
              className="p-5 rounded-2xl"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div 
                className="text-[36px] font-bold mb-1"
                style={{ 
                  color: '#10B981',
                  letterSpacing: '-0.03em'
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
            </div>
          </m.div>

          <m.div variants={fadeUp} className="space-y-3">
            <div 
              className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-4"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Примеры работ
            </div>
            
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => handleOpenDemo('clothing-store')}
              onMouseEnter={() => preloadDemo('clothing-store')}
              onTouchStart={() => preloadDemo('clothing-store')}
              data-testid="demo-card-clothing"
              style={{
                backgroundColor: '#111113',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div className="relative h-[180px] overflow-hidden">
                <img
                  src={nikeDestinyImage}
                  alt="Fashion Store"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 30%, rgba(17,17,19,0.95) 100%)'
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                  <div>
                    <div 
                      className="text-[18px] font-semibold mb-1"
                      style={{ color: '#FFFFFF', letterSpacing: '-0.01em' }}
                    >
                      Fashion Store
                    </div>
                    <div 
                      className="text-[12px]"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      Каталог + корзина + оплата
                    </div>
                  </div>
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square"
                onClick={() => handleOpenDemo('sneaker-store')}
                onMouseEnter={() => preloadDemo('sneaker-store')}
                onTouchStart={() => preloadDemo('sneaker-store')}
                data-testid="demo-card-sneaker"
                style={{
                  backgroundColor: '#111113',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <img
                  src={nikeGreenImage}
                  alt="Sneaker Store"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(17,17,19,0.9) 100%)'
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div 
                    className="text-[13px] font-semibold"
                    style={{ color: '#FFFFFF' }}
                  >
                    Sneaker Store
                  </div>
                </div>
              </div>

              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square"
                onClick={() => handleOpenDemo('luxury-watches')}
                onMouseEnter={() => preloadDemo('luxury-watches')}
                onTouchStart={() => preloadDemo('luxury-watches')}
                data-testid="demo-card-watches"
                style={{
                  backgroundColor: '#111113',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <img
                  src={rascalImage}
                  alt="Luxury Watches"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(17,17,19,0.9) 100%)'
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div 
                    className="text-[13px] font-semibold"
                    style={{ color: '#FFFFFF' }}
                  >
                    Luxury Watches
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square"
                onClick={() => handleOpenDemo('futuristic-fashion-1')}
                onMouseEnter={() => preloadDemo('futuristic-fashion-1')}
                onTouchStart={() => preloadDemo('futuristic-fashion-1')}
                data-testid="demo-card-outdoor"
                style={{
                  backgroundColor: '#111113',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <img
                  src={nikeAcgImage}
                  alt="Outdoor Gear"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(17,17,19,0.9) 100%)'
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div 
                    className="text-[13px] font-semibold"
                    style={{ color: '#FFFFFF' }}
                  >
                    Outdoor Gear
                  </div>
                </div>
              </div>

              <div
                className="flex flex-col items-center justify-center rounded-2xl cursor-pointer group aspect-square transition-all duration-200 active:scale-[0.98]"
                onClick={() => handleNavigate('projects')}
                data-testid="view-all-projects"
                style={{
                  backgroundColor: '#111113',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
                <div 
                  className="text-[13px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Все проекты
                </div>
              </div>
            </div>
          </m.div>

          <m.div 
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-2 py-4"
            data-testid="features-strip"
          >
            {[
              { icon: Sparkles, label: 'AI-ассистент', id: 'ai' },
              { icon: CreditCard, label: 'Оплаты', id: 'payments' },
              { icon: Users, label: 'CRM', id: 'crm' },
              { icon: Zap, label: 'Автоматизация', id: 'automation' }
            ].map((item) => (
              <div
                key={item.id}
                data-testid={`feature-pill-${item.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <item.icon 
                  className="w-3.5 h-3.5"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                />
                <span 
                  className="text-[12px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </m.div>

          <m.div variants={fadeUp}>
            <div
              className="rounded-2xl p-6 cursor-pointer transition-all duration-200 active:scale-[0.99]"
              onClick={() => handleNavigate('projects')}
              data-testid="cta-bottom"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.25)'
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div 
                    className="text-[18px] font-semibold mb-1"
                    style={{ color: '#000000', letterSpacing: '-0.01em' }}
                  >
                    Готовы начать?
                  </div>
                  <div 
                    className="text-[13px]"
                    style={{ color: 'rgba(0,0,0,0.6)' }}
                  >
                    Бесплатная консультация
                  </div>
                </div>
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
                >
                  <ArrowRight className="w-5 h-5 text-black" />
                </div>
              </div>
            </div>
          </m.div>

          <m.div variants={fadeUp} className="text-center pt-4 pb-8">
            <div 
              className="text-[11px] font-medium tracking-[0.1em] uppercase"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              WEB4TG STUDIO
            </div>
          </m.div>
        </m.div>
      </div>
    </div>
  );
}

export default memo(ShowcasePage);
