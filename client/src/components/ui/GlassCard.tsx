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
        bg-white/[0.03]
        backdrop-blur-xl
        border border-white/[0.08]
        rounded-[24px]
        p-5
        transition-all duration-300 ease-out
        active:scale-[0.98]
        active:bg-white/[0.06]
        ${className}
      `}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {children}
    </div>
  );
};
