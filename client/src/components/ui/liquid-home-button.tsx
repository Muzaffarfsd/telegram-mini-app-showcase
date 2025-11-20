import { Home } from "lucide-react";
import { m } from "framer-motion";

interface LiquidHomeButtonProps {
  onNavigateHome: () => void;
}

export function LiquidHomeButton({ onNavigateHome }: LiquidHomeButtonProps) {
  return (
    <m.button
      onClick={onNavigateHome}
      className="relative z-40 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden group"
      style={{
        // Position inside container with safe margins
        marginRight: 'max(12px, env(safe-area-inset-right, 12px))',
        marginBottom: 'calc(100px + max(0px, var(--csab, 0px)))',
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
      
      {/* Icon - responsive sizing */}
      <Home 
        className="relative z-10 text-white drop-shadow-lg w-5 h-5 sm:w-6 sm:h-6" 
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
