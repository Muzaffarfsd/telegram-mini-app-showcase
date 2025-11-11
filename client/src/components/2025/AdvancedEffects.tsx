import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';

// === LIQUID BUTTON (SVG morphing effect) ===
interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  children,
  className,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { hapticFeedback } = useTelegram();
  
  return (
    <button
      className={cn('relative px-8 py-4 overflow-visible', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        hapticFeedback.medium();
        props.onClick?.(e);
      }}
      {...props}
    >
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 200 60" 
        preserveAspectRatio="none"
      >
        <motion.path
          d={isHovered 
            ? "M 0 30 Q 50 10 100 30 T 200 30 L 200 60 L 0 60 Z"
            : "M 0 30 Q 50 30 100 30 T 200 30 L 200 60 L 0 60 Z"
          }
          fill="url(#liquidGradient)"
          animate={{
            d: isHovered
              ? ["M 0 30 Q 50 30 100 30 T 200 30 L 200 60 L 0 60 Z", 
                 "M 0 30 Q 50 10 100 30 T 200 30 L 200 60 L 0 60 Z",
                 "M 0 30 Q 50 40 100 30 T 200 30 L 200 60 L 0 60 Z",
                 "M 0 30 Q 50 10 100 30 T 200 30 L 200 60 L 0 60 Z"]
              : ["M 0 30 Q 50 10 100 30 T 200 30 L 200 60 L 0 60 Z",
                 "M 0 30 Q 50 30 100 30 T 200 30 L 200 60 L 0 60 Z"]
          }}
          transition={{
            duration: isHovered ? 2 : 0.6,
            repeat: isHovered ? Infinity : 0,
            ease: 'easeInOut'
          }}
        />
        <defs>
          <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <span className="relative z-10 text-white font-semibold">{children}</span>
    </button>
  );
};

// === CURSOR FOLLOWER ===
interface CursorFollowerProps {
  size?: number;
  color?: string;
  blur?: number;
}

export const CursorFollower: React.FC<CursorFollowerProps> = ({
  size = 20,
  color = 'rgba(16, 185, 129, 0.3)',
  blur = 30
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };
    
    const handleMouseLeave = () => {
      setIsVisible(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      className="fixed pointer-events-none z-50 rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        filter: `blur(${blur}px)`,
        left: position.x - size / 2,
        top: position.y - size / 2
      }}
      animate={{
        x: position.x - size / 2,
        y: position.y - size / 2
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 28
      }}
    />
  );
};

// === ANIMATED CHART (simple bar chart with animation) ===
interface AnimatedChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  className?: string;
}

export const AnimatedChart: React.FC<AnimatedChartProps> = ({
  data,
  maxValue,
  className
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm text-white/80">
            <span>{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: item.color || 'linear-gradient(90deg, #10B981, #06B6D4)'
              }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// === CIRCULAR PROGRESS ===
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * 100;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#circularGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference
          }}
        />
        
        <defs>
          <linearGradient id="circularGradient">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};
