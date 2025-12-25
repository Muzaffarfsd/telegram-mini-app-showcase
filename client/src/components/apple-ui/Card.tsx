import { motion } from '@/utils/LazyMotionProvider';
import { hoverScale } from '@/utils/motionConfig';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'premium';
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  onClick,
}: CardProps) {
  const variants = {
    default: 'bg-white/10 border border-white/20',
    glass: 'glass-apple',
    premium: 'card-premium glass-apple'
  };
  
  return (
    <motion.div
      className={`
        rounded-2xl p-6 card-apple
        ${variants[variant]}
        ${className}
      `}
      whileHover={hoverable ? hoverScale : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-xl font-bold tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-white/70 mt-2 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
