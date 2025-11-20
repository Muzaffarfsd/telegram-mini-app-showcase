import { memo } from 'react';

/**
 * Premium Glass Header Component
 * Жидкое стекло хедер с логотипом WEB4TG для всех страниц
 */
export const GlassHeader = memo(() => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-[100] safe-area-inset-top"
      data-testid="glass-header"
    >
      {/* Liquid Glass Container */}
      <div 
        className="relative backdrop-blur-2xl border-b"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: `
            0 4px 24px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
      >
        {/* Top highlight */}
        <div 
          className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
        
        {/* Content */}
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            {/* WEB4TG Logo - Premium Typography */}
            <h1 
              className="text-2xl font-light tracking-[0.3em] text-white relative"
              style={{
                fontFamily: 'serif',
                textShadow: '0 2px 12px rgba(255, 255, 255, 0.2)',
                letterSpacing: '0.35em'
              }}
            >
              <span className="relative inline-block">
                WEB4TG
                {/* Subtle underline accent */}
                <div 
                  className="absolute -bottom-1 left-0 right-0 h-px"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  }}
                />
              </span>
            </h1>
          </div>
        </div>
        
        {/* Bottom glow effect */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
          }}
        />
      </div>
    </header>
  );
});

GlassHeader.displayName = 'GlassHeader';
