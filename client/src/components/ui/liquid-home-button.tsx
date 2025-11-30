import { Home } from "lucide-react";
import { m } from "framer-motion";

interface LiquidHomeButtonProps {
  onNavigateHome: () => void;
}

export function LiquidHomeButton({ onNavigateHome }: LiquidHomeButtonProps) {
  return (
    <m.button
      onClick={onNavigateHome}
      className="relative flex items-center justify-center w-12 h-12 rounded-full"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
      }}
      whileHover={{ 
        scale: 1.05,
        background: 'rgba(255, 255, 255, 0.12)'
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      data-testid="button-home-main"
    >
      <Home 
        className="text-white/80 w-5 h-5" 
        strokeWidth={1.5}
      />
    </m.button>
  );
}
