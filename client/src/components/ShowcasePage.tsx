import { ArrowRight, Play, Sparkles, Zap, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useHaptic } from '../hooks/useHaptic';
import { LazyVideo } from './LazyVideo';

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
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  const handleNavigate = useCallback((section: string) => {
    haptic.medium();
    onNavigate(section);
  }, [haptic, onNavigate]);

  const videos = [
    { src: heroVideo, id: 'fashion-boutique' },
    { src: fashionVideo, id: 'sneaker-store' },
    { src: sneakerVideo, id: 'watches-store' },
    { src: watchesVideo, id: 'restaurant' }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════
          HERO - Cinematic Opening
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        className="relative min-h-[100vh] flex flex-col items-center justify-center px-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% -20%, rgba(99, 102, 241, 0.15), transparent 70%),
            radial-gradient(ellipse 80% 50% at 80% 50%, rgba(168, 85, 247, 0.08), transparent 60%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(34, 211, 238, 0.06), transparent 50%),
            #000
          `
        }}
      >
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-[500px] h-[500px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
              top: '-10%',
              left: '50%',
              transform: 'translateX(-50%)',
              filter: 'blur(60px)',
              animation: 'pulse 8s ease-in-out infinite'
            }}
          />
        </div>

        {/* Content */}
        <div 
          className="relative z-10 text-center max-w-[440px]"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Eyebrow */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[13px] font-medium text-white/70">Telegram Mini Apps</span>
          </div>

          {/* Main headline */}
          <h1 
            className="mb-6"
            style={{
              fontSize: 'clamp(48px, 12vw, 80px)',
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: '-0.04em'
            }}
          >
            <span className="text-white">Продавайте</span>
            <br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              красиво
            </span>
          </h1>

          {/* Sub-headline */}
          <p 
            className="text-[19px] leading-relaxed mb-10 max-w-[320px] mx-auto"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            Премиум-витрина в Telegram.
            <br />
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Там, где уже ваши клиенты.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => handleNavigate('constructor')}
              className="group relative px-8 py-4 rounded-2xl text-[17px] font-semibold overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
                color: '#000',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 50px -10px rgba(255,255,255,0.25)'
              }}
              data-testid="button-hero-primary"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Создать за 7 дней
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            
            <button 
              onClick={() => handleNavigate('ai-agent')}
              className="group px-7 py-4 rounded-2xl text-[17px] font-medium flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                backdropFilter: 'blur(10px)'
              }}
              data-testid="button-hero-secondary"
            >
              <Play className="w-4 h-4" />
              Смотреть демо
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{
            opacity: isVisible ? 0.5 : 0,
            transition: 'opacity 1s ease 1s'
          }}
        >
          <div 
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          >
            <div 
              className="w-1 h-2 bg-white/50 rounded-full"
              style={{ animation: 'scrollPulse 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PROOF STRIP - Social Validation
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        className="py-12 px-6 border-y"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.06)'
        }}
      >
        <div 
          className="max-w-[500px] mx-auto grid grid-cols-3 gap-4"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.3s'
          }}
        >
          {[
            { icon: Zap, value: '+327%', label: 'к продажам', color: '#fbbf24' },
            { icon: Users, value: '127', label: 'брендов', color: '#a855f7' },
            { icon: Sparkles, value: '24/7', label: 'AI-агент', color: '#22d3ee' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div 
                className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center"
                style={{ 
                  background: `${stat.color}15`,
                  boxShadow: `0 0 20px ${stat.color}20`
                }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-[13px] text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          VIDEO WALL - Pure Visual Showcase (NO TEXT INSIDE)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-5">
        <div 
          className="text-center mb-16 max-w-[400px] mx-auto"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.4s'
          }}
        >
          <h2 
            className="mb-4"
            style={{
              fontSize: 'clamp(32px, 8vw, 52px)',
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: '-0.03em'
            }}
          >
            Каждый магазин —
            <br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              шедевр
            </span>
          </h2>
          <p className="text-[17px] text-white/50">
            Нажмите на любую витрину
          </p>
        </div>

        {/* Video Grid - Clean, no text overlay */}
        <div 
          className="grid grid-cols-2 gap-3 max-w-[520px] mx-auto"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease 0.5s'
          }}
        >
          {videos.map((video, index) => (
            <div
              key={index}
              onClick={() => handleOpenDemo(video.id)}
              className="group relative cursor-pointer"
              style={{
                aspectRatio: '3/4',
                borderRadius: '28px',
                overflow: 'hidden',
                background: '#0a0a0a',
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.08),
                  0 25px 60px -15px rgba(0,0,0,0.7),
                  0 0 100px -30px rgba(139, 92, 246, 0.2)
                `,
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'scale(1.03) translateY(-12px)';
                el.style.boxShadow = `
                  0 0 0 1px rgba(255,255,255,0.15),
                  0 50px 100px -20px rgba(0,0,0,0.8),
                  0 0 150px -30px rgba(139, 92, 246, 0.4)
                `;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'scale(1) translateY(0)';
                el.style.boxShadow = `
                  0 0 0 1px rgba(255,255,255,0.08),
                  0 25px 60px -15px rgba(0,0,0,0.7),
                  0 0 100px -30px rgba(139, 92, 246, 0.2)
                `;
              }}
              data-testid={`video-card-${index}`}
            >
              <LazyVideo
                src={video.src}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
              
              {/* Shine effect on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.05) 60%, transparent 80%)'
                }}
              />
              
              {/* Bottom gradient for depth */}
              <div 
                className="absolute inset-x-0 bottom-0 h-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TRANSFORMATION - Emotional Story
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        className="py-24 px-6 text-center"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99, 102, 241, 0.08), transparent),
            #000
          `
        }}
      >
        <div 
          className="max-w-[400px] mx-auto"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.6s'
          }}
        >
          <p 
            className="text-[13px] font-medium tracking-[0.2em] uppercase mb-6"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Наш подход
          </p>
          
          <h2 
            className="mb-6"
            style={{
              fontSize: 'clamp(36px, 9vw, 56px)',
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: '-0.03em'
            }}
          >
            Из идеи в
            <br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              приложение
            </span>
          </h2>
          
          <p 
            className="text-[19px] mb-12"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            За <span className="text-white font-medium">14 дней</span>
          </p>

          {/* Process steps */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { num: '01', text: 'Дизайн' },
              { num: '02', text: 'Сборка' },
              { num: '03', text: 'Запуск' }
            ].map((step, i) => (
              <div key={i}>
                <div 
                  className="text-2xl font-bold mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {step.num}
                </div>
                <div className="text-[15px] text-white/60">{step.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA - High Pressure Close
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        className="py-24 px-6"
        style={{
          background: `
            linear-gradient(180deg, #000 0%, #0a0a0a 50%, #000 100%),
            radial-gradient(ellipse 100% 100% at 50% 0%, rgba(139, 92, 246, 0.1), transparent 60%)
          `
        }}
      >
        <div 
          className="max-w-[380px] mx-auto text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.7s'
          }}
        >
          <h2 
            className="mb-5"
            style={{
              fontSize: 'clamp(28px, 7vw, 40px)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.02em'
            }}
          >
            Запустите приложение,
            <br />
            <span className="text-white/50">о котором будут говорить</span>
          </h2>
          
          <p 
            className="text-[17px] mb-10"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Первая консультация — бесплатно
          </p>
          
          <button 
            onClick={() => handleNavigate('constructor')}
            className="group w-full max-w-[300px] px-8 py-5 rounded-2xl text-[17px] font-semibold"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
              color: '#000',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 25px 60px -10px rgba(255,255,255,0.3)'
            }}
            data-testid="button-final-cta"
          >
            <span className="flex items-center justify-center gap-2">
              Начать сейчас
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          
          <p 
            className="mt-6 text-[13px]"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Без скрытых платежей. Отмена в любой момент.
          </p>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateX(-50%) scale(1.1); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.5; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}

export default ShowcasePage;
