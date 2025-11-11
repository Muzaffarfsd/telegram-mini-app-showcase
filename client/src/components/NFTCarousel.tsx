import { useState, useEffect } from "react";
import { demoApps } from "@/data/demoApps";

interface NFTCarouselProps {
  onOpenDemo: (demoId: string) => void;
}

export default function NFTCarousel({ onOpenDemo }: NFTCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const getCardGradient = (category: string): string => {
    const gradients: Record<string, string> = {
      'БИЗНЕС ПРИЛОЖЕНИЕ': 'rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.4)',
      'ЭЛЕКТРОННАЯ КОММЕРЦИЯ': 'rgba(236, 72, 153, 0.8), rgba(251, 113, 133, 0.4)',
      'ОБРАЗОВАНИЕ': 'rgba(16, 185, 129, 0.8), rgba(52, 211, 153, 0.4)',
      'ЗДОРОВЬЕ': 'rgba(245, 101, 101, 0.8), rgba(248, 113, 113, 0.4)',
      'РАЗВЛЕЧЕНИЯ': 'rgba(168, 85, 247, 0.8), rgba(196, 181, 253, 0.4)',
      'ФИНАНСЫ': 'rgba(251, 191, 36, 0.8), rgba(252, 211, 77, 0.4)',
      'СОЦИАЛЬНЫЕ СЕТИ': 'rgba(14, 165, 233, 0.8), rgba(59, 130, 246, 0.4)',
      'ПУТЕШЕСТВИЯ': 'rgba(34, 197, 94, 0.8), rgba(74, 222, 128, 0.4)',
      'СПОРТ': 'rgba(239, 68, 68, 0.8), rgba(248, 113, 113, 0.4)',
      'МУЗЫКА': 'rgba(147, 51, 234, 0.8), rgba(167, 139, 250, 0.4)'
    };
    return gradients[category] || 'rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.4)';
  };

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % demoApps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getCardClass = (index: number) => {
    const diff = index - activeIndex;
    const total = demoApps.length;
    
    if (diff === 0) return "active";
    if (diff === 1 || diff === -(total - 1)) return "next";
    if (diff === -1 || diff === total - 1) return "prev";
    if (diff === 2 || diff === -(total - 2)) return "far-next";
    if (diff === -2 || diff === total - 2) return "far-prev";
    return "hidden";
  };

  const getGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
      'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
      'linear-gradient(135deg, rgba(245, 101, 101, 0.1) 0%, rgba(190, 24, 93, 0.1) 100%)',
      'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
      'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(126, 34, 206, 0.1) 100%)',
      'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)',
      'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(190, 24, 93, 0.1) 100%)',
      'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
      'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(120, 53, 15, 0.1) 100%)'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="relative w-full h-[500px] flex justify-center items-center max-w-md mx-auto">
      <style>{`
        .carousel {
          position: relative;
          width: 100%;
          height: 500px;
          transform-style: preserve-3d;
          perspective: 800px;
        }

        .nft-card {
          position: absolute;
          width: 280px;
          height: 400px;
          left: 50%;
          margin-left: -140px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: #000000;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-style: preserve-3d;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.15),
            0 10px 20px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          will-change: transform, opacity;
          backface-visibility: hidden;
          overflow: hidden;
        }

        .nft-card.active {
          transform: translate3d(0, 0, 50px) rotateY(0deg) scale3d(1, 1, 1);
          opacity: 1;
          z-index: 10;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.15),
            0 8px 16px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .nft-card.next {
          transform: translate3d(200px, 0, -100px) rotateY(-25deg) scale3d(0.8, 0.8, 0.3);
          opacity: 0.7;
          z-index: 5;
        }

        .nft-card.prev {
          transform: translate3d(-200px, 0, -100px) rotateY(25deg) scale3d(0.8, 0.8, 0.3);
          opacity: 0.7;
          z-index: 5;
        }

        .nft-card.far-next {
          transform: translate3d(300px, 0, -200px) rotateY(-40deg) scale3d(0.6, 0.6, 0.1);
          opacity: 0.4;
          z-index: 1;
        }

        .nft-card.far-prev {
          transform: translate3d(-300px, 0, -200px) rotateY(40deg) scale3d(0.6, 0.6, 0.1);
          opacity: 0.4;
          z-index: 1;
        }

        .nft-card.hidden {
          transform: translate3d(0, 0, -400px) rotateY(0deg) scale3d(0.3, 0.3, 0.01);
          opacity: 0;
          z-index: 0;
          pointer-events: none;
        }

        .cosmic-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            radial-gradient(circle at 40% 70%, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          animation: twinkle 4s ease-in-out infinite alternate;
          border-radius: 20px;
        }

        @keyframes twinkle {
          0% { opacity: 0.4; }
          100% { opacity: 0.8; }
        }

        .card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, 
            transparent 40%, 
            rgba(255, 255, 255, 0.1) 50%, 
            transparent 60%);
          animation: shimmer 8s linear infinite;
          border-radius: 20px;
        }

        @keyframes shimmer {
          0% { transform: translate3d(-100%, -100%, 0) rotate(45deg); }
          100% { transform: translate3d(100%, 100%, 0) rotate(45deg); }
        }

        .indicators {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 100;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 165, 0, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: rgba(255, 140, 0, 0.9);
          transform: scale(1.4);
        }
      `}</style>

      <div className="carousel">
        {demoApps.map((app, index) => (
          <div
            key={app.id}
            className={`nft-card ${getCardClass(index)}`}
            style={{ 
              background: `linear-gradient(135deg, ${getCardGradient(app.category)})`
            }}
            onClick={() => onOpenDemo(app.id)}
          >
            <div className="cosmic-bg"></div>
            <div className="card-glow"></div>
            
            <div className="card-content relative z-10 p-6">
              <div className="inline-block px-3 py-1 text-xs font-bold text-white bg-black/30 backdrop-blur-sm rounded-full mb-4" 
                   style={{fontFamily: 'Montserrat, sans-serif'}}>
                {app.category}
              </div>
              
              <h3 className="text-2xl font-bold mb-4 leading-tight text-black" 
                  style={{fontFamily: 'Montserrat, sans-serif', fontWeight: '700'}}>
                {app.title}
              </h3>
              
              <div className="w-16 h-px bg-black/20 my-4 mx-auto"></div>
              
              <div className="text-sm font-semibold mb-3 text-black"
                   style={{fontFamily: 'Montserrat, sans-serif', fontWeight: '600'}}>
                {app.description}
              </div>
              
              <div className="text-xs text-black mb-4 font-medium"
                   style={{fontFamily: 'Montserrat, sans-serif', fontWeight: '500'}}>
                Современное решение для бизнеса
              </div>
              
              <div className="text-lg font-bold text-black bg-white/60 px-3 py-1 rounded-full inline-block"
                   style={{fontFamily: 'Montserrat, sans-serif', fontWeight: '700'}}>
                2024
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="indicators">
        {demoApps.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}