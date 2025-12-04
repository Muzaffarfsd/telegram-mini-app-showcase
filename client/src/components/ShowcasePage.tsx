import { ArrowRight, Zap, MessageSquare, BarChart3, Rocket } from "lucide-react";
import { useCallback, memo, useState, useEffect } from "react";
import { m, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { preloadDemo } from './demos/DemoRegistry';
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const words = [
  "приносят выручку",
  "общаются с клиентами", 
  "собирают заявки",
  "масштабируются"
];

const timeline = [
  { icon: MessageSquare, title: "Бриф", desc: "1 час", active: true },
  { icon: Zap, title: "Спринт", desc: "24 часа", active: false },
  { icon: Rocket, title: "Запуск", desc: "Live", active: false },
  { icon: BarChart3, title: "Рост", desc: "∞", active: false },
];

const demos = [
  { id: 'clothing-store', image: nikeDestinyImage, type: 'Retail', metric: '+340%' },
  { id: 'sneaker-store', image: nikeGreenImage, type: 'Luxury', metric: '+280%' },
  { id: 'luxury-watches', image: rascalImage, type: 'Services', metric: '+195%' },
];

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
  const haptic = useHaptic();
  const [wordIndex, setWordIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
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

  return (
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      <div style={{ paddingTop: '140px' }} className="pb-32">
        
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="px-6 mb-20"
        >
          <div className="max-w-md mx-auto">
            <m.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1>
                <span 
                  className="block text-[15px] font-medium tracking-wide mb-8"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Когда другие обещают —
                </span>
                
                <span 
                  className="block text-[36px] leading-[1.1] font-semibold mb-2"
                  style={{ 
                    color: '#FFFFFF',
                    letterSpacing: '-0.03em'
                  }}
                >
                  ваши продукты уже
                </span>
                
                <div className="h-[50px] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <m.span
                      key={wordIndex}
                      initial={{ y: 60, opacity: 0, filter: 'blur(12px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -60, opacity: 0, filter: 'blur(12px)' }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="block text-[36px] leading-[1.1] font-semibold"
                      style={{ 
                        color: '#10B981',
                        letterSpacing: '-0.03em'
                      }}
                    >
                      {words[wordIndex]}.
                    </m.span>
                  </AnimatePresence>
                </div>
              </h1>
            </m.div>
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="px-6 mb-16"
        >
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              {timeline.map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-all duration-300"
                    style={{ 
                      backgroundColor: i === 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                      border: i === 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <step.icon 
                      className="w-4.5 h-4.5"
                      style={{ color: i === 0 ? '#10B981' : 'rgba(255,255,255,0.4)' }}
                    />
                  </div>
                  <span 
                    className="text-[12px] font-medium"
                    style={{ color: i === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                  >
                    {step.title}
                  </span>
                  <span 
                    className="text-[10px] font-medium"
                    style={{ color: i === 0 ? '#10B981' : 'rgba(255,255,255,0.25)' }}
                  >
                    {step.desc}
                  </span>
                </div>
              ))}
            </div>
            <div 
              className="h-px mt-4"
              style={{ 
                background: 'linear-gradient(90deg, #10B981 0%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.05) 100%)'
              }}
            />
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mb-16"
        >
          <div className="max-w-md mx-auto px-6 mb-5">
            <div className="flex items-center justify-between">
              <span 
                className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Результаты
              </span>
              <button
                onClick={() => handleNavigate('projects')}
                className="text-[12px] font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                data-testid="view-all"
              >
                Все проекты
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 px-6 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
            {demos.map((demo, index) => (
              <m.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex-shrink-0 w-[200px] rounded-2xl overflow-hidden cursor-pointer group snap-start"
                onClick={() => handleOpenDemo(demo.id)}
                onMouseEnter={() => preloadDemo(demo.id)}
                onTouchStart={() => preloadDemo(demo.id)}
                data-testid={`demo-${demo.id}`}
              >
                <div className="relative h-[280px]">
                  <img
                    src={demo.image}
                    alt={demo.type}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <div 
                          className="text-[11px] font-medium uppercase tracking-wider mb-1"
                          style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                          {demo.type}
                        </div>
                      </div>
                      <div 
                        className="text-[20px] font-bold"
                        style={{ color: '#10B981' }}
                      >
                        {demo.metric}
                      </div>
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="px-6 mb-16"
        >
          <div className="max-w-md mx-auto">
            <div 
              className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-5"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Интеграции
            </div>
            <div className="flex flex-wrap gap-2">
              {['Stripe', 'ЮKassa', 'OpenAI', 'Notion', 'Airtable', 'WhatsApp'].map((name) => (
                <div
                  key={name}
                  className="px-4 py-2 rounded-full text-[12px] font-medium"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.6)'
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="px-6 mb-16"
        >
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div 
                  className="text-[28px] font-bold mb-1"
                  style={{ color: '#10B981', letterSpacing: '-0.02em' }}
                >
                  24ч
                </div>
                <div 
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Time to Value
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-[28px] font-bold mb-1"
                  style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
                >
                  4.9
                </div>
                <div 
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  CSAT Score
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-[28px] font-bold mb-1"
                  style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
                >
                  99.9%
                </div>
                <div 
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Uptime
                </div>
              </div>
            </div>
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="px-6"
        >
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => handleNavigate('projects')}
                className="flex items-center gap-2 text-[14px] font-medium transition-colors"
                style={{ color: '#10B981' }}
                data-testid="cta-start"
              >
                <span>Создать проект</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleOpenDemo('clothing-store')}
                onMouseEnter={() => preloadDemo('clothing-store')}
                onTouchStart={() => preloadDemo('clothing-store')}
                className="text-[14px] font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                data-testid="cta-demo"
              >
                Смотреть процесс
              </button>
            </div>
            
            <div className="text-center mt-12">
              <div 
                className="text-[10px] font-medium tracking-[0.2em] uppercase"
                style={{ color: 'rgba(255,255,255,0.12)' }}
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
