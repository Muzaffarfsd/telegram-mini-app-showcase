import { ArrowRight, Play } from "lucide-react";
import { useCallback } from "react";
import { useHaptic } from '../hooks/useHaptic';
import { LazyVideo } from './LazyVideo';

// Video assets
const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";
const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const heroVideo = "/videos/1341996d8f73172cbc77930dc818d88e_t4_1763643600785.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const haptic = useHaptic();
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const handleNavigate = useCallback((section: string) => {
    haptic.medium();
    onNavigate(section);
  }, [haptic, onNavigate]);

  const demoMappings: { [key: number]: string } = {
    0: 'fashion-boutique',
    1: 'sneaker-store', 
    2: 'watches-store',
    3: 'restaurant'
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      
      {/* Ambient Glow Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(48, 209, 88, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[40%]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(10, 132, 255, 0.06) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
      </div>
      
      <div className="relative z-10">
        
        {/* HERO */}
        <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-6 text-[#86868b]">
            Telegram Mini Apps
          </p>
          
          <h1 className="text-[clamp(48px,14vw,72px)] font-bold leading-[0.95] tracking-[-0.04em] max-w-[400px] mb-8 text-white">
            Продавайте
            <br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #30d158 0%, #0a84ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              красиво
            </span>
          </h1>
          
          <p className="text-[19px] max-w-[320px] mb-12 leading-relaxed text-white/70">
            Премиальный магазин в Telegram.
            <br />
            Там, где уже ваши клиенты.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[17px] font-medium text-black bg-white rounded-full transition-all hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)] active:scale-[0.98]"
              onClick={() => handleNavigate('constructor')}
              data-testid="button-hero-start"
            >
              Начать бесплатно
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button 
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-[17px] font-medium text-white bg-white/5 border border-white/10 rounded-full backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
              onClick={() => handleNavigate('ai-agent')}
              data-testid="button-hero-demo"
            >
              <Play className="w-4 h-4" />
              Смотреть демо
            </button>
          </div>
        </section>

        {/* VIDEO GALLERY */}
        <section className="px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-4 text-[#86868b]">
              Реальные проекты
            </p>
            <h2 className="text-[clamp(28px,7vw,44px)] font-semibold leading-[1.1] tracking-[-0.025em]">
              Каждый магазин —
              <br />
              произведение искусства
            </h2>
          </div>
          
          {/* Video Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-[480px] mx-auto">
            {[heroVideo, fashionVideo, sneakerVideo, watchesVideo].map((video, index) => (
              <div
                key={index}
                className="relative rounded-3xl overflow-hidden bg-[#0a0a0a] cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] active:scale-[0.98]"
                style={{ 
                  aspectRatio: '4/5',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
                onClick={() => handleOpenDemo(demoMappings[index])}
                data-testid={`video-card-${index}`}
              >
                <LazyVideo
                  src={video}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button 
              className="inline-flex items-center gap-1.5 text-[17px] font-medium text-[#2997ff] hover:underline"
              onClick={() => handleNavigate('projects')}
              data-testid="button-view-all"
            >
              Смотреть все проекты
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Divider */}
        <div 
          className="w-full h-px my-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)'
          }}
        />

        {/* TRANSFORMATION */}
        <section className="px-6 py-24 text-center">
          <p className="text-[13px] font-medium tracking-[0.2em] uppercase mb-6 text-[#86868b]">
            Почему мы
          </p>
          
          <h2 className="text-[clamp(36px,10vw,56px)] font-semibold leading-[1.0] tracking-[-0.03em] max-w-[380px] mx-auto mb-8">
            Мы не делаем
            <br />
            <span className="text-white/50">сайты</span>
          </h2>
          
          <p className="text-[clamp(28px,7vw,44px)] font-semibold leading-[1.1] tracking-[-0.025em] max-w-[380px] mx-auto">
            Мы создаём
            <br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #30d158 0%, #0a84ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              впечатления
            </span>
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-[400px] mx-auto">
            {[
              { value: '127+', label: 'проектов' },
              { value: '24ч', label: 'до запуска' },
              { value: 'x3', label: 'конверсия' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p 
                  className="text-[clamp(20px,5vw,28px)] font-medium mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #30d158 0%, #0a84ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {stat.value}
                </p>
                <p className="text-[14px] font-medium text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div 
          className="w-full h-px my-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)'
          }}
        />

        {/* FINAL CTA */}
        <section className="px-6 py-24 pb-32 text-center">
          <h2 className="text-[clamp(28px,7vw,44px)] font-semibold leading-[1.1] tracking-[-0.025em] max-w-[340px] mx-auto mb-6">
            Готовы выделиться?
          </h2>
          
          <p className="text-[17px] text-white/70 max-w-[300px] mx-auto mb-10 leading-relaxed">
            Первая консультация бесплатно.
            <br />
            Расскажите о вашем бизнесе.
          </p>
          
          <button 
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[17px] font-medium text-black bg-white rounded-full transition-all hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)] active:scale-[0.98]"
            onClick={() => handleNavigate('constructor')}
            data-testid="button-final-cta"
          >
            Создать магазин
            <ArrowRight className="w-5 h-5" />
          </button>
        </section>

      </div>
    </div>
  );
}

export default ShowcasePage;
