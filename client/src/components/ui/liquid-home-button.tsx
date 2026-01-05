import { Home } from "lucide-react";

interface LiquidHomeButtonProps {
  onNavigateHome: () => void;
}

export function LiquidHomeButton({ onNavigateHome }: LiquidHomeButtonProps) {
  return (
    <button
      onClick={onNavigateHome}
      className="relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] hover:bg-white/25"
      style={{
        background: 'rgba(255, 255, 255, 0.18)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
      }}
      data-testid="button-home-main"
    >
      <Home 
        className="text-white w-6 h-6" 
        strokeWidth={2}
      />
    </button>
  );
}
