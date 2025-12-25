import React, { useRef, useState, useEffect } from 'react';
import { motion } from '@/utils/LazyMotionProvider';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';

// === GRADIENT BUTTON ===
interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'aurora' | 'emerald-cyan' | 'emerald-purple';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  'data-testid'?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  onClick,
  disabled,
  type,
  'data-testid': dataTestId,
}) => {
  const { hapticFeedback } = useTelegram();
  
  const gradients = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    aurora: 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500',
    'emerald-cyan': 'bg-gradient-to-r from-emerald-500 to-cyan-500',
    'emerald-purple': 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <motion.button
      className={cn(
        'relative rounded-full font-semibold text-white',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-300',
        'ripple-effect',
        gradients[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        hapticFeedback.medium();
        onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      }}
      disabled={disabled}
      type={type}
      data-testid={dataTestId}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// === GLASS BUTTON ===
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'subtle' | 'medium' | 'strong';
  children: React.ReactNode;
  icon?: React.ReactNode;
  'data-testid'?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'medium',
  children,
  icon,
  className,
  onClick,
  disabled,
  type,
  'data-testid': dataTestId,
}) => {
  const { hapticFeedback } = useTelegram();
  
  const variants = {
    subtle: 'glass-card',
    medium: 'glass-card-medium',
    strong: 'glass-card-strong'
  };
  
  return (
    <motion.button
      className={cn(
        'relative px-6 py-3 rounded-full',
        'font-medium text-white',
        'transition-all duration-300',
        'hover:bg-white/20',
        variants[variant],
        className
      )}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        hapticFeedback.light();
        onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      }}
      disabled={disabled}
      type={type}
      data-testid={dataTestId}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span>{icon}</span>}
        <span>{children}</span>
      </div>
    </motion.button>
  );
};

// === MORPHING BUTTON ===
interface MorphingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  'data-testid'?: string;
}

export const MorphingButton: React.FC<MorphingButtonProps> = ({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  className,
  onClick,
  disabled,
  type,
  'data-testid': dataTestId,
}) => {
  const { hapticFeedback } = useTelegram();
  
  return (
    <motion.button
      className={cn(
        'relative px-6 py-3 rounded-full',
        'bg-gradient-to-r from-emerald-500 to-teal-500',
        'font-semibold text-white',
        'shadow-lg overflow-hidden',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      animate={{
        width: isLoading ? 48 : 'auto'
      }}
      onClick={(e) => {
        if (!isLoading) {
          hapticFeedback.medium();
          onClick?.(e as React.MouseEvent<HTMLButtonElement>);
        }
      }}
      disabled={isLoading || disabled}
      type={type}
      data-testid={dataTestId}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isLoading ? 0 : 1
        }}
      >
        {children}
      </motion.div>
      
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.button>
  );
};

// === MAGNETIC BUTTON ===
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
  children: React.ReactNode;
  'data-testid'?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  strength = 20,
  children,
  className,
  onClick,
  disabled,
  type,
  'data-testid': dataTestId,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { hapticFeedback } = useTelegram();
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;
    
    setPosition({
      x: deltaX * strength,
      y: deltaY * strength
    });
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.button
      ref={ref}
      className={cn(
        'relative px-6 py-3 rounded-full',
        'bg-gradient-to-r from-purple-500 to-pink-500',
        'font-semibold text-white',
        'shadow-lg hover:shadow-xl',
        'transition-shadow duration-300',
        'magnetic-button',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20
      }}
      onClick={(e) => {
        hapticFeedback.heavy();
        onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      }}
      disabled={disabled}
      type={type}
      data-testid={dataTestId}
    >
      {children}
    </motion.button>
  );
};

// === FLOATING ACTION BUTTON (FAB) ===
interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  'data-testid'?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  position = 'bottom-right',
  className,
  onClick,
  disabled,
  type,
  'data-testid': dataTestId,
}) => {
  const { hapticFeedback } = useTelegram();
  
  const positions = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };
  
  return (
    <motion.button
      className={cn(
        'fixed z-50',
        'w-14 h-14 rounded-full',
        'bg-gradient-to-br from-emerald-500 to-teal-500',
        'text-white shadow-lg',
        'flex items-center justify-center',
        positions[position],
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
      onClick={(e) => {
        hapticFeedback.heavy();
        onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      }}
      disabled={disabled}
      type={type}
      data-testid={dataTestId}
    >
      {icon}
    </motion.button>
  );
};

// === PULSE BUTTON ===
interface PulseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  pulseColor?: string;
  'data-testid'?: string;
}

export const PulseButton: React.FC<PulseButtonProps> = ({
  children,
  pulseColor = 'rgba(16, 185, 129, 0.5)',
  className,
  onClick,
  disabled,
  type,
  'data-testid': dataTestId,
}) => {
  const { hapticFeedback } = useTelegram();
  
  return (
    <motion.button
      className={cn(
        'relative px-6 py-3 rounded-full',
        'bg-emerald-500 hover:bg-emerald-600',
        'font-semibold text-white',
        'transition-colors duration-300',
        className
      )}
      onClick={(e) => {
        hapticFeedback.medium();
        onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      }}
      disabled={disabled}
      type={type}
      data-testid={dataTestId}
    >
      <span className="absolute inset-0 rounded-full animate-ping opacity-75" 
            style={{ backgroundColor: pulseColor }} />
      <span className="absolute inset-0 rounded-full animate-pulse" 
            style={{ backgroundColor: pulseColor }} />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
