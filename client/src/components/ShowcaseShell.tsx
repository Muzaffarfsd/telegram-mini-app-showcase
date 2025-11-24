import { memo } from 'react';

/**
 * Lightweight static shell for instant first paint
 * No heavy dependencies, inline critical CSS
 */
interface ShowcaseShellProps {
  onOpenDemo?: (id: string) => void;
  onNavigate?: (section: string) => void;
}

const ShowcaseShell = memo<ShowcaseShellProps>(() => {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      
      {/* Hero Section - Rich content for fast LCP */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background gradient - no images for instant paint */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 40%), linear-gradient(180deg, #000 0%, #0a0a0a 50%, #000 100%)'
            }}
          />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div 
            className="inline-block px-6 py-2 rounded-full mb-8"
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
            }}
          >
            <span className="text-sm font-bold text-white tracking-widest">2025</span>
          </div>
          
          <h1 
            className="text-6xl md:text-8xl font-black mb-8 leading-tight"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            TELEGRAM
            <br />
            <span 
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              для БИЗНЕСА
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-4 font-medium">
            ЗАПУСК ЗА 24 ЧАСА
          </p>
          <p className="text-base text-gray-500 mb-12">
            БЕЗ КОДА • ПРЕМИУМ КАЧЕСТВО
          </p>
          
          {/* Feature cards for LCP content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { title: 'AI АГЕНТЫ', desc: '24/7 поддержка' },
              { title: 'E-COMMERCE', desc: 'Готовые решения' },
              { title: 'АВТОМАТИЗАЦИЯ', desc: 'Умные боты' }
            ].map((item, i) => (
              <div 
                key={i}
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="text-emerald-500 text-sm font-bold mb-2">{item.title}</div>
                <div className="text-gray-400 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* Faster animations */
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
});

ShowcaseShell.displayName = 'ShowcaseShell';

export default ShowcaseShell;
