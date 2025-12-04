import { ArrowRight, ArrowUpRight } from "lucide-react";
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

const headlines = [
  "продаёт",
  "зарабатывает", 
  "масштабируется",
  "растёт"
];

const projects = [
  { 
    id: 'clothing-store', 
    image: nikeDestinyImage, 
    title: 'Магазин одежды',
    description: 'Каталог, корзина, оплата онлайн',
    metric: '+340%',
    metricLabel: 'продажи'
  },
  { 
    id: 'sneaker-store', 
    image: nikeGreenImage, 
    title: 'Sneaker Store',
    description: 'Лимитки, предзаказы, уведомления',
    metric: '+280%',
    metricLabel: 'конверсия'
  },
  { 
    id: 'luxury-watches', 
    image: rascalImage, 
    title: 'Премиум бренд',
    description: 'Персональный подбор, консьерж',
    metric: '+195%',
    metricLabel: 'средний чек'
  },
];

const features = [
  { title: 'Оплата', desc: 'Stripe, ЮKassa, СБП' },
  { title: 'AI-ассистент', desc: 'Поддержка 24/7' },
  { title: 'Аналитика', desc: 'В реальном времени' },
  { title: 'CRM', desc: 'Клиенты и заказы' },
];

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  useTelegram();
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
      className="min-h-screen"
      style={{ backgroundColor: '#000000' }}
    >
      <div 
        className="max-w-lg mx-auto px-6"
        style={{ paddingTop: '140px' }}
      >
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-[70vh] flex flex-col justify-center"
        >
          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="mb-8">
              <span 
                className="block text-[44px] leading-[1.02] font-semibold"
                style={{ 
                  color: '#FFFFFF',
                  letterSpacing: '-0.035em',
                }}
              >
                Пока вы спите,
              </span>
              <span 
                className="block text-[44px] leading-[1.02] font-semibold"
                style={{ 
                  color: '#FFFFFF',
                  letterSpacing: '-0.035em',
                }}
              >
                ваш бизнес
              </span>
              <div className="h-[54px] overflow-hidden mt-1">
                <AnimatePresence mode="wait">
                  <m.span
                    key={headlineIndex}
                    initial={{ y: 60, opacity: 0, filter: 'blur(8px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -60, opacity: 0, filter: 'blur(8px)' }}
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    className="block text-[44px] leading-[1.02] font-semibold"
                    style={{ 
                      color: '#10B981',
                      letterSpacing: '-0.035em',
                    }}
                  >
                    {headlines[headlineIndex]}.
                  </m.span>
                </AnimatePresence>
              </div>
            </h1>

            <p 
              className="text-[17px] leading-[1.5] mb-10 max-w-[340px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Telegram-приложения для бизнеса. Продажи, записи, оплаты — работают без вашего участия.
            </p>

            <div className="flex items-center gap-4">
              <m.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavigate('projects')}
                className="flex items-center gap-3 px-7 py-4 rounded-full"
                style={{
                  background: '#10B981',
                }}
                data-testid="cta-primary"
              >
                <span 
                  className="text-[15px] font-semibold"
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
                className="flex items-center gap-2 px-6 py-4 rounded-full transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  backgroundColor: 'transparent'
                }}
                data-testid="cta-demo"
              >
                <span 
                  className="text-[15px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  Открыть приложение
                </span>
              </m.button>
            </div>
          </m.div>
        </m.section>

        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 
              className="text-[13px] font-medium tracking-[0.08em] uppercase"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Проекты
            </h2>
            <button
              onClick={() => handleNavigate('projects')}
              className="text-[13px] font-medium flex items-center gap-1 transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              data-testid="view-all-projects"
            >
              Все
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((project, index) => (
              <m.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileTap={{ scale: 0.985 }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => handleOpenDemo(project.id)}
                onMouseEnter={() => preloadDemo(project.id)}
                onTouchStart={() => preloadDemo(project.id)}
                data-testid={`project-card-${project.id}`}
                style={{ backgroundColor: '#0A0A0A' }}
              >
                <div className="relative h-[200px] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ filter: 'brightness(0.7)' }}
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.95) 100%)'
                    }}
                  />
                  
                  <div className="absolute top-4 right-4">
                    <div 
                      className="flex items-center justify-center w-9 h-9 rounded-full transition-transform duration-300 group-hover:scale-110"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-end justify-between">
                      <div className="flex-1">
                        <h3 
                          className="text-[20px] font-semibold mb-1"
                          style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
                        >
                          {project.title}
                        </h3>
                        <p 
                          className="text-[14px]"
                          style={{ color: 'rgba(255,255,255,0.55)' }}
                        >
                          {project.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div 
                          className="text-[22px] font-bold"
                          style={{ color: '#10B981', letterSpacing: '-0.02em' }}
                        >
                          {project.metric}
                        </div>
                        <div 
                          className="text-[11px] font-medium uppercase tracking-wider"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          {project.metricLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="py-16 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <h2 
            className="text-[13px] font-medium tracking-[0.08em] uppercase mb-8"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Что включено
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {features.map((item, i) => (
              <div 
                key={i}
                className="p-5 rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }}
              >
                <div 
                  className="text-[15px] font-medium mb-1"
                  style={{ color: '#FFFFFF' }}
                >
                  {item.title}
                </div>
                <div 
                  className="text-[13px]"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="py-16 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="grid grid-cols-3 gap-4 mb-16">
            <div className="text-center">
              <div 
                className="text-[32px] font-semibold mb-1"
                style={{ color: '#10B981', letterSpacing: '-0.03em' }}
              >
                24ч
              </div>
              <div 
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                до запуска
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-[32px] font-semibold mb-1"
                style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}
              >
                127+
              </div>
              <div 
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                проектов
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-[32px] font-semibold mb-1"
                style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}
              >
                4.9
              </div>
              <div 
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                рейтинг
              </div>
            </div>
          </div>

          <m.div
            whileTap={{ scale: 0.985 }}
            className="rounded-2xl p-6 cursor-pointer"
            onClick={() => handleNavigate('projects')}
            data-testid="cta-bottom"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div 
                  className="text-[18px] font-semibold mb-1"
                  style={{ color: '#000000', letterSpacing: '-0.02em' }}
                >
                  Обсудить проект
                </div>
                <div 
                  className="text-[14px]"
                  style={{ color: 'rgba(0,0,0,0.55)' }}
                >
                  Бесплатная консультация
                </div>
              </div>
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
              >
                <ArrowRight className="w-5 h-5 text-black" />
              </div>
            </div>
          </m.div>
        </m.section>

        <div className="pb-32 pt-8">
          <div className="text-center">
            <div 
              className="text-[11px] font-medium tracking-[0.2em] uppercase"
              style={{ color: 'rgba(255,255,255,0.12)' }}
            >
              WEB4TG
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ShowcasePage);
