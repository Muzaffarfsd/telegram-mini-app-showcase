import { Home } from "lucide-react";
import { m } from "framer-motion";

interface LiquidHomeButtonProps {
  onNavigateHome: () => void;
}

export function LiquidHomeButton({ onNavigateHome }: LiquidHomeButtonProps) {
  return (
    <m.button
      onClick={onNavigateHome}
      className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) inset'
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      data-testid="button-home-main"
    >
      {/* Liquid Blob Effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
          filter: 'blur(10px)',
          animation: 'liquid-pulse 3s ease-in-out infinite'
        }}
      />
      
      {/* Icon - larger sizing */}
      <Home 
        className="relative z-10 text-white drop-shadow-lg w-6 h-6 sm:w-7 sm:h-7" 
        strokeWidth={2.5}
      />

      {/* Animated Ring */}
      <m.div
        className="absolute inset-0 rounded-full border-2 border-white/50"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ 
          scale: [1, 1.25, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <style>{`
        @keyframes liquid-pulse {
          0%, 100% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.15) translateY(-3px);
          }
        }
      `}</style>
    </m.button>
  );
}
