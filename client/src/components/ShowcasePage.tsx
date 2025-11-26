import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
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
    <div 
      className="min-h-screen bg-black flex flex-col items-center justify-center px-5 py-16"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(120, 119, 198, 0.15), transparent),
          radial-gradient(ellipse 60% 50% at 50% 100%, rgba(45, 212, 191, 0.08), transparent),
          #000
        `
      }}
    >
      {/* Caption */}
      <p 
        className="text-center mb-4"
        style={{
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)'
        }}
      >
        Telegram Mini Apps
      </p>

      {/* Main Headline */}
      <h1 
        className="text-center text-white max-w-[600px] mb-12"
        style={{
          fontSize: 'clamp(36px, 8vw, 72px)',
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s'
        }}
      >
        Каждый магазин —
        <br />
        <span 
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          произведение искусства
        </span>
      </h1>

      {/* Video Grid */}
      <div 
        className="grid grid-cols-2 gap-3 w-full max-w-[500px] mb-12"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.2s'
        }}
      >
        {videos.map((video, index) => (
          <div
            key={index}
            onClick={() => handleOpenDemo(video.id)}
            className="group relative cursor-pointer overflow-hidden"
            style={{
              aspectRatio: '4/5',
              borderRadius: '24px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.08),
                0 20px 50px -12px rgba(0,0,0,0.5),
                0 0 80px -20px rgba(120, 119, 198, 0.15)
              `,
              transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02) translateY(-8px)';
              e.currentTarget.style.boxShadow = `
                0 0 0 1px rgba(255,255,255,0.15),
                0 40px 80px -12px rgba(0,0,0,0.6),
                0 0 120px -20px rgba(120, 119, 198, 0.3)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = `
                0 0 0 1px rgba(255,255,255,0.08),
                0 20px 50px -12px rgba(0,0,0,0.5),
                0 0 80px -20px rgba(120, 119, 198, 0.15)
              `;
            }}
            data-testid={`video-card-${index}`}
          >
            {/* Video */}
            <LazyVideo
              src={video.src}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ borderRadius: '24px' }}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
            />
            
            {/* Hover Shine Effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)',
                transition: 'opacity 0.5s ease',
                borderRadius: '24px'
              }}
            />
          </div>
        ))}
      </div>

      {/* Minimal CTA */}
      <button
        onClick={() => handleNavigate('constructor')}
        className="group inline-flex items-center gap-2"
        style={{
          fontSize: '17px',
          fontWeight: 500,
          color: '#2997ff',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.3s'
        }}
        data-testid="button-create-store"
      >
        <span className="group-hover:underline">Создать свой магазин</span>
        <ArrowRight 
          className="w-4 h-4 transition-transform group-hover:translate-x-1" 
        />
      </button>
    </div>
  );
}

export default ShowcasePage;
