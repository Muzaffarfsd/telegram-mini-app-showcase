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
      
      {/* Hero Section - Static skeleton */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        
        <div className="relative z-10 text-center px-6">
          <div 
            className="inline-block px-4 py-2 rounded-full mb-6"
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          >
            <span className="text-sm font-bold text-white tracking-wider">2025</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            TELEGRAM
            <br />
            <span style={{ color: '#10b981' }}>для БИЗНЕСА</span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            ЗАПУСК ЗА 24 ЧАСА
            <br />
            БЕЗ КОДА • ПРЕМИУМ КАЧЕСТВО
          </p>
          
          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-2">
            <div 
              className="w-2 h-2 rounded-full bg-emerald-500"
              style={{ 
                animation: 'bounce 1s infinite'
              }}
            />
            <div 
              className="w-2 h-2 rounded-full bg-emerald-500"
              style={{ 
                animation: 'bounce 1s infinite 0.1s'
              }}
            />
            <div 
              className="w-2 h-2 rounded-full bg-emerald-500"
              style={{ 
                animation: 'bounce 1s infinite 0.2s'
              }}
            />
          </div>
        </div>
      </div>

      {/* Business Apps Section - Static skeleton */}
      <div className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16">
            БИЗНЕС-ПРИЛОЖЕНИЯ
          </h2>
          
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className="aspect-video rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
});

ShowcaseShell.displayName = 'ShowcaseShell';

export default ShowcaseShell;
