import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useCallback, memo, useState, useEffect } from "react";
import { m, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { preloadDemo } from './demos/DemoRegistry';
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import nikeAcgImage from "@assets/acc835fff3bb452f0c3b534056fbe1ea_1763719574494.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const words = ["продают", "отвечают", "работают", "растут"];

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const [wordIndex, setWordIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const handleNavigate = useCallback((section: string) => {
    haptic.light();
    onNavigate(section);
  }, [haptic, onNavigate]);

  const demos = [
    { id: 'clothing-store', image: nikeDestinyImage, name: 'Fashion', result: '+340%' },
    { id: 'sneaker-store', image: nikeGreenImage, name: 'Sneakers', result: '+280%' },
    { id: 'luxury-watches', image: rascalImage, name: 'Luxury', result: '+195%' },
    { id: 'futuristic-fashion-1', image: nikeAcgImage, name: 'Outdoor', result: '+220%' },
  ];

  return (
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      <div style={{ paddingTop: '140px' }}>
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="px-6 pb-16"
        >
          <div className="max-w-md mx-auto">
            <m.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="mb-10">
                <span 
                  className="block text-[13px] font-semibold tracking-[0.2em] uppercase mb-6"
                  style={{ color: '#10B981' }}
                >
                  Web4TG Studio
                </span>
                
                <span 
                  className="block text-[38px] leading-[1.08] font-semibold mb-1"
                  style={{ 
                    color: '#FFFFFF',
                    letterSpacing: '-0.035em',
                    fontFamily: 'Inter, -apple-system, sans-serif'
                  }}
                >
                  Пока вы спите,
                </span>
                <span 
                  className="block text-[38px] leading-[1.08] font-semibold"
                  style={{ 
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '-0.035em',
                    fontFamily: 'Inter, -apple-system, sans-serif'
                  }}
                >
                  ваши боты
                </span>
                
                <div className="h-[48px] mt-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <m.span
                      key={wordIndex}
                      initial={{ y: 60, opacity: 0, filter: 'blur(8px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -60, opacity: 0, filter: 'blur(8px)' }}
                      transition={{ 
                        duration: 0.5, 
                        ease: [0.32, 0.72, 0, 1]
                      }}
                      className="block text-[38px] leading-[1.08] font-semibold"
                      style={{ 
                        color: '#10B981',
                        letterSpacing: '-0.035em',
                        fontFamily: 'Inter, -apple-system, sans-serif'
                      }}
                    >
                      {words[wordIndex]}.
                    </m.span>
                  </AnimatePresence>
                </div>
              </h1>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-4"
              >
                <button
                  onClick={() => handleNavigate('projects')}
                  className="group flex items-center gap-2 text-[15px] font-medium transition-all duration-300"
                  style={{ color: '#FFFFFF' }}
                  data-testid="cta-start"
                >
                  <span>Начать</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                
                <div style={{ color: 'rgba(255,255,255,0.2)' }}>|</div>
                
                <button
                  onClick={() => handleOpenDemo('clothing-store')}
                  onMouseEnter={() => preloadDemo('clothing-store')}
                  onTouchStart={() => preloadDemo('clothing-store')}
                  className="text-[15px] font-medium transition-colors duration-300"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                  data-testid="cta-demo"
                >
                  Смотреть демо
                </button>
              </m.div>
            </m.div>
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="pb-12"
        >
          <div 
            className="flex gap-3 px-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {demos.map((demo, index) => (
              <m.div
                key={demo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex-shrink-0 w-[280px] rounded-2xl overflow-hidden cursor-pointer group snap-start"
                onClick={() => handleOpenDemo(demo.id)}
                onMouseEnter={() => preloadDemo(demo.id)}
                onTouchStart={() => preloadDemo(demo.id)}
                data-testid={`demo-card-${demo.id}`}
              >
                <div className="relative h-[360px]">
                  <img
                    src={demo.image}
                    alt={demo.name}
                    loading={index < 2 ? "eager" : "lazy"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)'
                    }}
                  />
                  
                  <div className="absolute top-4 right-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <div 
                          className="text-[22px] font-semibold mb-1"
                          style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
                        >
                          {demo.name}
                        </div>
                        <div 
                          className="text-[12px] font-medium"
                          style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                          Telegram Mini App
                        </div>
                      </div>
                      <div 
                        className="text-[24px] font-bold"
                        style={{ color: '#10B981', letterSpacing: '-0.02em' }}
                      >
                        {demo.result}
                      </div>
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
            
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex-shrink-0 w-[160px] rounded-2xl overflow-hidden cursor-pointer group snap-start flex items-center justify-center"
              onClick={() => handleNavigate('projects')}
              style={{ backgroundColor: '#0A0A0A' }}
              data-testid="view-all"
            >
              <div className="text-center p-6">
                <div 
                  className="text-[32px] font-bold mb-2"
                  style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
                >
                  50+
                </div>
                <div 
                  className="text-[12px] font-medium mb-4"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  проектов
                </div>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </m.div>
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="px-6 pb-16"
        >
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              {[
                { value: '24', unit: 'ч', label: 'запуск' },
                { value: '127', unit: '+', label: 'клиентов' },
                { value: '3', unit: 'x', label: 'продажи' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="py-6 text-center"
                  style={{ backgroundColor: '#000000' }}
                >
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span 
                      className="text-[32px] font-semibold"
                      style={{ color: i === 0 ? '#10B981' : '#FFFFFF', letterSpacing: '-0.03em' }}
                    >
                      {stat.value}
                    </span>
                    <span 
                      className="text-[18px] font-medium"
                      style={{ color: i === 0 ? '#10B981' : 'rgba(255,255,255,0.5)' }}
                    >
                      {stat.unit}
                    </span>
                  </div>
                  <div 
                    className="text-[11px] font-medium uppercase tracking-wider mt-1"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="px-6 pb-32"
        >
          <div className="max-w-md mx-auto">
            <div
              className="rounded-2xl p-8 cursor-pointer transition-all duration-300 active:scale-[0.99]"
              onClick={() => handleNavigate('projects')}
              data-testid="cta-bottom"
              style={{
                background: '#10B981'
              }}
            >
              <div 
                className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3"
                style={{ color: 'rgba(0,0,0,0.5)' }}
              >
                Бесплатно
              </div>
              <div 
                className="text-[28px] font-semibold leading-tight mb-6"
                style={{ color: '#000000', letterSpacing: '-0.02em' }}
              >
                Получить<br />консультацию
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
              >
                <ArrowRight className="w-5 h-5 text-black" />
              </div>
            </div>
            
            <div className="text-center mt-10">
              <div 
                className="text-[10px] font-medium tracking-[0.2em] uppercase"
                style={{ color: 'rgba(255,255,255,0.15)' }}
              >
                WEB4TG
              </div>
            </div>
          </div>
        </m.section>
      </div>
    </div>
  );
}

export default memo(ShowcasePage);
