import { m as motion } from '@/utils/LazyMotionProvider';
import { ReactNode } from 'react';

// Spring animation presets (kept for HoverScale/TapScale)
export const springPresets = {
  gentle: { type: 'spring', stiffness: 100, damping: 15, mass: 0.5 },
  bouncy: { type: 'spring', stiffness: 200, damping: 10, mass: 0.8 },
  snappy: { type: 'spring', stiffness: 300, damping: 20, mass: 0.5 },
  smooth: { type: 'spring', stiffness: 120, damping: 18, mass: 0.6 },
} as const;

// Reusable Motion Components
interface MotionBoxProps {
  children: ReactNode;
  variant?: string;
  delay?: number;
  className?: string;
}

export function MotionBox({ 
  children, 
  variant = 'fadeInUp', 
  delay = 0,
  className = '',
  ...props 
}: MotionBoxProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function MotionStagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Hover animation wrapper
interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({ children, scale = 1.05, className = '' }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale - 0.02 }}
      transition={springPresets.bouncy}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Tap animation wrapper
interface TapScaleProps {
  children: ReactNode;
  className?: string;
}

export function TapScale({ children, className = '' }: TapScaleProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={springPresets.snappy}
      className={className}
    >
      {children}
    </motion.div>
  );
}
