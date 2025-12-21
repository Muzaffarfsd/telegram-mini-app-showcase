import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard = ({ children, className = "", onClick }: Props) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-white/[0.03] dark:bg-white/[0.03]
        bg-black/[0.02] light:bg-black/[0.02]
        backdrop-blur-xl
        border 
        border-white/[0.08] dark:border-white/[0.08]
        border-black/[0.05] light:border-black/[0.05]
        rounded-[24px]
        p-5
        transition-all duration-300 ease-out
        active:scale-[0.98]
        active:bg-white/[0.06] dark:active:bg-white/[0.06]
        active:bg-black/[0.04] light:active:bg-black/[0.04]
        ${className}
      `}
      style={{
        background: 'var(--glass-background)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-[1px]" 
        style={{
          background: 'linear-gradient(to right, transparent, var(--glass-border), transparent)',
        }}
      />
      
      {children}
    </div>
  );
};
