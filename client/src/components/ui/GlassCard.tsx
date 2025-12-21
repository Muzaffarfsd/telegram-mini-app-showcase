import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "active";
}

export const GlassCard = ({ 
  children, 
  className = "", 
  onClick,
  variant = "default"
}: GlassCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-300",
        "active:scale-[0.98]",
        className
      )}
      style={{
        backgroundColor: "var(--glass-bg)",
        borderColor: "var(--glass-border-color)",
        borderWidth: "1px",
        borderStyle: "solid",
        boxShadow: "var(--glass-shadow-style)",
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none" 
        style={{
          background: 'linear-gradient(to right, transparent, var(--glass-border-color), transparent)',
        }}
      />
      
      {children}
    </div>
  );
};
