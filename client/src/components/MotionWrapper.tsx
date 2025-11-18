import { HTMLMotionProps, Variants } from '@/utils/LazyMotionProvider';
import { m as motion } from '@/utils/LazyMotionProvider';
import { ReactNode } from 'react';

// Spring animation presets
export const springPresets = {
  gentle: { type: 'spring', stiffness: 100, damping: 15, mass: 0.5 },
  bouncy: { type: 'spring', stiffness: 200, damping: 10, mass: 0.8 },
  snappy: { type: 'spring', stiffness: 300, damping: 20, mass: 0.5 },
  smooth: { type: 'spring', stiffness: 120, damping: 18, mass: 0.6 },
} as const;

// Animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: springPresets.gentle
  }
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: springPresets.smooth
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const slideInRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springPresets.gentle
  }
};

export const slideInLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springPresets.gentle
  }
};

// Reusable Motion Components
interface MotionBoxProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  variant?: keyof typeof animationVariants;
  delay?: number;
  className?: string;
}

const animationVariants = {
  fadeInUp,
  fadeInScale,
  slideInRight,
  slideInLeft
};

export function MotionBox({ 
  children, 
  variant = 'fadeInUp', 
  delay = 0,
  className = '',
  ...props 
}: MotionBoxProps) {
  return (
    <motion.div
      variants={animationVariants[variant]}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionStagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
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
