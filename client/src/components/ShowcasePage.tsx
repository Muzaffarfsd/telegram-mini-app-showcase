import { ArrowRight, Check, Star } from "lucide-react";
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

const headlines = [
  "продаёт",
  "зарабатывает",
  "масштабируется",
  "растёт"
];

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  
  return <span>{count}{suffix}</span>;
}

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const { hapticFeedback } = useTelegram();
  const haptic = useHaptic();
  const [headlineIndex, setHeadlineIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 1800);
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
      style={{ backgroundColor: '#0A0A0B' }}
    >
      <div 
        className="max-w-md mx-auto px-5"
        style={{ paddingTop: '140px' }}
      >
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-[calc(100vh-120px)] flex flex-col"
        >
          <div className="flex-1 flex flex-col justify-center pb-8">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="mb-6">
                <span 
                  className="block text-[42px] leading-[1.05] font-black"
                  style={{ 
                    color: '#FFFFFF',
                    letterSpacing: '-0.04em',
                    fontFamily: 'Inter, -apple-system, sans-serif'
                  }}
                >
                  Пока вы спите,
                </span>
                <span 
                  className="block text-[42px] leading-[1.05] font-black"
                  style={{ 
                    color: '#FFFFFF',
                    letterSpacing: '-0.04em',
                    fontFamily: 'Inter, -apple-system, sans-serif'
                  }}
                >
                  ваш бизнес
                </span>
                <div className="h-[52px] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <m.span
                      key={headlineIndex}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -50, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="block text-[42px] leading-[1.05] font-black"
                      style={{ 
                        color: '#10B981',
                        letterSpacing: '-0.04em',
                        fontFamily: 'Inter, -apple-system, sans-serif'
                      }}
                    >
                      {headlines[headlineIndex]}.
                    </m.span>
                  </AnimatePresence>
                </div>
              </h1>

              <p 
                className="text-[16px] leading-[1.6] mb-8 max-w-[300px]"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Запускаем Telegram-приложения для бизнеса за 24 часа. Продажи, записи, оплаты — без вашего участия.
              </p>

              <div className="flex items-center gap-3">
                <m.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavigate('projects')}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full"
                  style={{
                    background: '#10B981',
                    boxShadow: '0 0 40px rgba(16,185,129,0.4)'
                  }}
                  data-testid="cta-primary"
                >
                  <span 
                    className="text-[14px] font-bold"
                    style={{ color: '#000000' }}
                  >
                    Заказать проект
                  </span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </m.button>
                
                <m.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOpenDemo('clothing-store')}
                  onMouseEnter={() => preloadDemo('clothing-store')}
                  onTouchStart={() => preloadDemo('clothing-store')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-full"
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(255,255,255,0.03)'
                  }}
                  data-testid="cta-demo"
                >
                  <span 
                    className="text-[14px] font-medium"
                    style={{ color: 'rgba(255,255,255,0.9)' }}
                  >
                    Открыть приложение
                  </span>
                </m.button>
              </div>
            </m.div>
          </div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-2 mb-10"
          >
            <div 
              className="text-center py-4 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <div 
                className="text-[28px] font-bold mb-0.5"
                style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
              >
                <AnimatedCounter target={127} suffix="+" />
              </div>
              <div 
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Клиентов
              </div>
            </div>
            <div 
              className="text-center py-4 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <div 
                className="text-[28px] font-bold mb-0.5"
                style={{ color: '#10B981', letterSpacing: '-0.02em' }}
              >
                <AnimatedCounter target={24} suffix="ч" />
              </div>
              <div 
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                До запуска
              </div>
            </div>
            <div 
              className="text-center py-4 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <div 
                className="text-[28px] font-bold mb-0.5"
                style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
              >
                <AnimatedCounter target={300} suffix="%" />
              </div>
              <div 
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                К продажам
              </div>
            </div>
          </m.div>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="pb-8"
        >
          <div 
            className="text-[10px] font-bold tracking-[0.2em] uppercase mb-5"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Кейсы
          </div>

          <div className="space-y-3">
            <m.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative rounded-3xl overflow-hidden cursor-pointer group"
              onClick={() => handleOpenDemo('clothing-store')}
              onMouseEnter={() => preloadDemo('clothing-store')}
              onTouchStart={() => preloadDemo('clothing-store')}
              data-testid="demo-card-main"
              style={{ backgroundColor: '#0A0A0A' }}
            >
              <div className="relative h-[220px] overflow-hidden">
                <img
                  src={nikeDestinyImage}
                  alt="Fashion Store"
                  loading="eager"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: 'brightness(0.85)' }}
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)'
                  }}
                />
                
                <div className="absolute top-4 left-4">
                  <div 
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(16,185,129,0.9)' }}
                  >
                    <Star className="w-3 h-3 text-black fill-black" />
                    <span className="text-[10px] font-bold text-black">ТОП</span>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div 
                    className="text-[22px] font-bold mb-1"
                    style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
                  >
                    Fashion Store
                  </div>
                  <div 
                    className="text-[13px] mb-3"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    Каталог • Корзина • Оплата • CRM
                  </div>
                  <div className="flex items-center gap-2">
                    {['Продажи +340%', 'LTV +85%'].map((stat) => (
                      <div 
                        key={stat}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span 
                          className="text-[11px] font-medium"
                          style={{ color: 'rgba(255,255,255,0.8)' }}
                        >
                          {stat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'sneaker-store', image: nikeGreenImage, title: 'Sneaker Store', tag: 'E-commerce' },
                { id: 'luxury-watches', image: rascalImage, title: 'Luxury Watches', tag: 'Премиум' },
              ].map((item) => (
                <m.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[4/5]"
                  onClick={() => handleOpenDemo(item.id)}
                  onMouseEnter={() => preloadDemo(item.id)}
                  onTouchStart={() => preloadDemo(item.id)}
                  data-testid={`demo-card-${item.id}`}
                  style={{ backgroundColor: '#0A0A0A' }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ filter: 'brightness(0.8)' }}
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.9) 100%)'
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <div 
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.8)'
                      }}
                    >
                      {item.tag}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div 
                      className="text-[15px] font-bold"
                      style={{ color: '#FFFFFF' }}
                    >
                      {item.title}
                    </div>
                  </div>
                </m.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'futuristic-fashion-1', image: nikeAcgImage, title: 'Outdoor Gear' },
                { id: 'futuristic-fashion-2', title: 'Все проекты', isLink: true },
              ].map((item) => (
                <m.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-square"
                  onClick={() => item.isLink ? handleNavigate('projects') : handleOpenDemo(item.id)}
                  onMouseEnter={() => !item.isLink && preloadDemo(item.id)}
                  onTouchStart={() => !item.isLink && preloadDemo(item.id)}
                  data-testid={item.isLink ? 'view-all' : `demo-card-${item.id}`}
                  style={{ backgroundColor: item.isLink ? '#111111' : '#0A0A0A' }}
                >
                  {!item.isLink && item.image && (
                    <>
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ filter: 'brightness(0.75)' }}
                      />
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.85) 100%)'
                        }}
                      />
                    </>
                  )}
                  {item.isLink ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                          border: '1px solid rgba(255,255,255,0.15)',
                          backgroundColor: 'rgba(255,255,255,0.03)'
                        }}
                      >
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                      <div 
                        className="text-[13px] font-semibold"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {item.title}
                      </div>
                      <div 
                        className="text-[11px] mt-1"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        50+ кейсов
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div 
                        className="text-[14px] font-semibold"
                        style={{ color: '#FFFFFF' }}
                      >
                        {item.title}
                      </div>
                    </div>
                  )}
                </m.div>
              ))}
            </div>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="py-8"
        >
          <div 
            className="text-[10px] font-bold tracking-[0.2em] uppercase mb-5"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Что включено
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { title: 'AI-Ассистент', desc: 'Отвечает 24/7' },
              { title: 'Оплаты', desc: 'Stripe, ЮKassa' },
              { title: 'CRM система', desc: 'Клиенты и заказы' },
              { title: 'Аналитика', desc: 'Метрики в реальном времени' },
            ].map((item, i) => (
              <div 
                key={i}
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div 
                  className="text-[13px] font-semibold mb-0.5"
                  style={{ color: '#FFFFFF' }}
                >
                  {item.title}
                </div>
                <div 
                  className="text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="pb-32"
        >
          <m.div
            whileTap={{ scale: 0.99 }}
            className="rounded-2xl p-6 cursor-pointer"
            onClick={() => handleNavigate('projects')}
            data-testid="cta-bottom"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 0 60px rgba(16,185,129,0.3)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div 
                  className="text-[18px] font-bold mb-0.5"
                  style={{ color: '#000000', letterSpacing: '-0.01em' }}
                >
                  Готовы запустить?
                </div>
                <div 
                  className="text-[13px]"
                  style={{ color: 'rgba(0,0,0,0.6)' }}
                >
                  Бесплатная консультация
                </div>
              </div>
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
              >
                <ArrowRight className="w-5 h-5 text-black" />
              </div>
            </div>
          </m.div>
          
          <div className="text-center mt-8">
            <div 
              className="text-[10px] font-medium tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,255,255,0.15)' }}
            >
              WEB4TG STUDIO
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
}

export default memo(ShowcasePage);
