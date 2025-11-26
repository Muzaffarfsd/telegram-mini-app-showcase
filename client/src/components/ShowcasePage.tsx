import { Smartphone, ShoppingCart, Bot, Headphones, ArrowRight, Play, Sparkles } from "lucide-react";
import { useCallback, useRef } from "react";
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
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
  const { isDark } = useTelegram();
  const haptic = useHaptic();
  
  const videoRef1 = useVideoPreload();
  const videoRef2 = useVideoPreload();
  const videoRef3 = useVideoLazyLoad();
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const services = [
    {
      icon: Smartphone,
      title: "Telegram-магазин",
      subtitle: "Полноценный магазин внутри мессенджера",
      metric: "24ч",
      metricLabel: "до запуска"
    },
    {
      icon: Bot,
      title: "AI-ассистент",
      subtitle: "Отвечает клиентам и принимает заказы",
      metric: "24/7",
      metricLabel: "без выходных"
    },
    {
      icon: ShoppingCart,
      title: "Автоматизация",
      subtitle: "Заказы, оплата, уведомления",
      metric: "x3",
      metricLabel: "рост продаж"
    },
    {
      icon: Headphones,
      title: "Поддержка",
      subtitle: "Помогаем на каждом этапе",
      metric: "127+",
      metricLabel: "клиентов"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Mesh Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 100% 100%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-lg mx-auto px-5">
        
        {/* HERO SECTION with Video Background */}
        <section className="relative pt-8 pb-12">
          {/* Hero Video Container */}
          <div 
            className="relative rounded-3xl overflow-hidden mb-8"
            style={{ boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)' }}
          >
            <LazyVideo
              src={heroVideo}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 30%, transparent 0%, rgba(0,0,0,0.4) 100%)' }} />
            
            {/* Hero Content */}
            <div className="relative px-6 py-14 text-center min-h-[380px] flex flex-col items-center justify-center">
              {/* Eyebrow Badge */}
              <div className="scroll-fade-in mb-5">
                <span className="glass-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white/90">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Telegram Mini Apps
                </span>
              </div>
              
              {/* Main Headline */}
              <h1 className="scroll-fade-in-delay-1 text-[32px] sm:text-[40px] font-bold leading-[1.1] tracking-tight text-white mb-4">
                Продажи там,
                <br />
                <span className="gradient-text-emerald">где ваши клиенты</span>
              </h1>
              
              {/* Subheadline */}
              <p className="scroll-fade-in-delay-2 text-[15px] text-white/70 max-w-[280px] mx-auto mb-7 leading-relaxed">
                Запустите магазин в Telegram за 24 часа. 
                Без сайта и программистов.
              </p>
              
              {/* CTA Buttons */}
              <div className="scroll-fade-in-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
                <button 
                  className="apple-button apple-button-primary w-full"
                  onClick={() => onNavigate('constructor')}
                  data-testid="button-hero-start"
                >
                  Начать бесплатно
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button 
                  className="glass-pill inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white w-full transition-all active:scale-95"
                  onClick={() => handleOpenDemo('clothing-store')}
                  data-testid="button-hero-demo"
                >
                  <Play className="w-4 h-4" />
                  Смотреть демо
                </button>
              </div>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="scroll-fade-in-delay-4 flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-white">127+</div>
              <div className="text-[11px] text-white/50">клиентов</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-bold text-white">24ч</div>
              <div className="text-[11px] text-white/50">до запуска</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-bold gradient-text-emerald">x3</div>
              <div className="text-[11px] text-white/50">рост продаж</div>
            </div>
          </div>
        </section>

        {/* DEMO APPS SECTION */}
        <section className="py-12">
          {/* Section Header */}
          <div className="scroll-fade-in text-center mb-8">
            <p className="apple-eyebrow mb-3" style={{ color: '#10B981' }}>Примеры работ</p>
            <h2 className="apple-headline mb-3">Попробуйте прямо сейчас</h2>
            <p className="apple-caption">Нажмите на карточку и посмотрите как работает магазин</p>
          </div>
          
          {/* Demo Grid */}
          <div className="space-y-4 stagger-children">
            
            {/* Featured Demo Card */}
            <div 
              className="group relative h-[340px] rounded-3xl overflow-hidden cursor-pointer interactive-lift"
              onClick={() => handleOpenDemo('clothing-store')}
              onMouseEnter={() => preloadDemo('clothing-store')}
              onTouchStart={() => preloadDemo('clothing-store')}
              data-testid="demo-card-clothing"
              style={{ boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)' }}
            >
              <video
                ref={videoRef1}
                src={fashionVideo}
                loop muted playsInline preload="none"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className="glass-pill px-3 py-1.5 text-xs font-medium text-white/90">
                  Магазин одежды
                </span>
              </div>
              
              <div className="absolute top-4 right-4">
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: '#CDFF38', color: '#000' }}
                >
                  NEW
                </span>
              </div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-3xl font-extralight tracking-[0.3em] text-white mb-2">
                  ALURE
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Премиальный магазин с автоматическими продажами 24/7
                </p>
                <span className="glass-cta glass-cta-lg">
                  Открыть приложение
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Sneaker Store */}
              <div 
                className="group relative h-[220px] rounded-2xl overflow-hidden cursor-pointer interactive-lift"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-300/90">
                    Кроссовки
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-xl font-light tracking-[0.15em] text-white mb-1">SOLE</h4>
                  <p className="text-white/50 text-xs mb-3">+180% конверсия</p>
                  <span className="glass-cta">
                    Открыть
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Watches Store */}
              <div 
                className="group relative h-[220px] rounded-2xl overflow-hidden cursor-pointer interactive-lift"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span 
                    className="text-[10px] font-semibold tracking-wider uppercase"
                    style={{ color: 'rgba(214, 185, 128, 0.9)' }}
                  >
                    Премиум
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 
                    className="text-xl font-light tracking-[0.2em] mb-1"
                    style={{
                      background: 'linear-gradient(135deg, #E8D4A0, #C9A870)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    LUXE
                  </h4>
                  <p className="text-white/50 text-xs mb-3">Средний чек x2.5</p>
                  <span className="glass-cta">
                    Открыть
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Three Column Grid */}
            <div className="grid grid-cols-3 gap-3">
              
              {/* Rascal - spans 2 columns */}
              <div 
                className="group relative h-[180px] rounded-2xl overflow-hidden cursor-pointer interactive-lift col-span-2"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400">
                    Outdoor
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded text-[9px] font-bold"
                    style={{ background: 'rgba(16, 185, 129, 0.9)', color: '#fff' }}
                  >
                    NEW
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-lg font-bold text-white mb-1">Rascal</h4>
                  <p className="text-white/50 text-[11px] mb-2">Заказы без менеджера</p>
                  <span className="glass-cta">
                    Открыть
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>

              {/* Minimal Store */}
              <div 
                className="group relative h-[180px] rounded-2xl overflow-hidden cursor-pointer interactive-lift"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-medium tracking-wider uppercase text-white/60">
                    Быстро
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-sm font-bold text-white">STORE</h4>
                  <p className="text-white/50 text-[10px] mb-2">За 24 часа</p>
                  <span className="glass-cta glass-cta-sm">
                    Открыть
                    <ArrowRight className="w-2 h-2" />
                  </span>
                </div>
              </div>
            </div>

            {/* Two Column Bottom Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Brand Store */}
              <div 
                className="group relative h-[200px] rounded-2xl overflow-hidden cursor-pointer interactive-lift"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wider uppercase text-white/60">
                    Ваш бренд
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded text-[9px] font-medium"
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    VIP
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-sm font-bold text-white mb-1">lab. SURVIVALIST</h4>
                  <p className="text-white/50 text-[11px] mb-2">Под ваш стиль</p>
                  <span className="glass-cta">
                    Открыть
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>

              {/* Interactive Catalog */}
              <div 
                className="group relative h-[200px] rounded-2xl overflow-hidden cursor-pointer interactive-lift"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wider uppercase text-blue-400">
                    Интерактив
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded text-[9px] font-bold"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: '#fff' }}
                  >
                    WOW
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-sm font-bold text-white mb-1">Nike ACG</h4>
                  <p className="text-white/50 text-[11px] mb-2">Клиенты в восторге</p>
                  <span className="glass-cta">
                    Открыть
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="py-16">
          {/* Section Header */}
          <div className="scroll-fade-in text-center mb-10">
            <p className="apple-eyebrow mb-3" style={{ color: '#3B82F6' }}>Что мы делаем</p>
            <h2 className="apple-headline mb-3">Все для продаж в Telegram</h2>
            <p className="apple-caption max-w-xs mx-auto">
              От идеи до работающего магазина за 24 часа
            </p>
          </div>
          
          {/* Services Grid */}
          <div className="grid grid-cols-2 gap-4 stagger-children">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index}
                  className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                  onClick={() => onNavigate('constructor')}
                  data-testid={`card-service-${index}`}
                >
                  {/* Icon */}
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ 
                      background: index === 0 ? 'linear-gradient(135deg, #10B981, #059669)' :
                                  index === 1 ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' :
                                  index === 2 ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' :
                                  'linear-gradient(135deg, #F59E0B, #D97706)'
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-[15px] font-semibold text-white mb-1 leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-[12px] text-white/50 leading-relaxed mb-4">
                    {service.subtitle}
                  </p>
                  
                  {/* Metric */}
                  <div className="flex items-baseline gap-1.5">
                    <span 
                      className="text-2xl font-bold"
                      style={{
                        background: index === 0 ? 'linear-gradient(135deg, #10B981, #34D399)' :
                                    index === 1 ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)' :
                                    index === 2 ? 'linear-gradient(135deg, #3B82F6, #60A5FA)' :
                                    'linear-gradient(135deg, #F59E0B, #FBBF24)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {service.metric}
                    </span>
                    <span className="text-[11px] text-white/40">{service.metricLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-12 pb-24">
          <div 
            className="scroll-fade-in relative rounded-3xl p-8 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Glow Effect */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32"
              style={{
                background: 'radial-gradient(ellipse, rgba(16, 185, 129, 0.3), transparent 70%)',
                filter: 'blur(40px)'
              }}
            />
            
            <div className="relative">
              <h3 className="apple-title mb-3">
                Готовы начать?
              </h3>
              <p className="apple-caption mb-6 max-w-xs mx-auto">
                Создайте свой магазин в Telegram уже сегодня. Первая консультация бесплатно.
              </p>
              
              <button 
                className="apple-button apple-button-primary"
                onClick={() => onNavigate('constructor')}
                data-testid="button-cta-start"
              >
                Создать магазин
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default ShowcasePage;
