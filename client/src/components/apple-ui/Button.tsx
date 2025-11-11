import { motion } from 'framer-motion';
import { hoverScale, tapScale } from '@/utils/motionConfig';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled,
  loading,
  className = ''
}: ButtonProps) {
  const variants = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-apple-sm hover:shadow-apple-md',
    secondary: 'glass-apple text-white border border-white/20 hover:bg-white/15',
    tertiary: 'bg-transparent text-emerald-500 hover:bg-emerald-500/10'
  };
  
  const sizes = {
    small: 'px-4 py-2 text-sm rounded-lg',
    medium: 'px-6 py-3 text-base rounded-xl',
    large: 'px-8 py-4 text-lg rounded-2xl'
  };
  
  return (
    <motion.button
      className={`
        button-apple font-semibold touch-target
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? hoverScale : undefined}
      whileTap={!disabled && !loading ? tapScale : undefined}
    >
      {loading ? (
        <div className="inline-flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {children}
        </div>
      ) : children}
    </motion.button>
  );
}
