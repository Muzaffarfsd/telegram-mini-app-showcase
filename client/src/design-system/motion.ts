import { Transition, Variants } from 'framer-motion';

export const MotionPresets = {
  spring: {
    default: { type: 'spring', stiffness: 300, damping: 25, mass: 0.5 },
    bouncy: { type: 'spring', stiffness: 400, damping: 20, mass: 0.5 },
    gentle: { type: 'spring', stiffness: 200, damping: 30, mass: 0.5 },
    snappy: { type: 'spring', stiffness: 500, damping: 30, mass: 0.3 },
    slow: { type: 'spring', stiffness: 100, damping: 20, mass: 1 },
  },
  
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
    slower: 0.5,
    slowest: 0.8,
  },
  
  easing: {
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    apple: [0.25, 0.1, 0.25, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    smooth: [0.34, 1.56, 0.64, 1],
  },
} as const;

export const TransitionPresets: Record<string, Transition> = {
  default: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
  },
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: [0, 0, 0.2, 1],
  },
  smooth: {
    type: 'tween',
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },
  bounce: {
    type: 'spring',
    stiffness: 500,
    damping: 15,
  },
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 30,
  },
};

export const AnimationVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  
  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  
  scaleInBounce: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 15 }
    },
    exit: { opacity: 0, scale: 0.8 },
  },
  
  slideInBottom: {
    hidden: { y: '100%' },
    visible: { y: 0 },
    exit: { y: '100%' },
  },
  
  slideInTop: {
    hidden: { y: '-100%' },
    visible: { y: 0 },
    exit: { y: '-100%' },
  },
  
  slideInLeft: {
    hidden: { x: '-100%' },
    visible: { x: 0 },
    exit: { x: '-100%' },
  },
  
  slideInRight: {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' },
  },
  
  cardHover: {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.98 },
  },
  
  buttonPress: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.95 },
  },
  
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
  },
  
  parallaxSlow: {
    hidden: { y: 50 },
    visible: { y: 0 },
  },
  
  parallaxFast: {
    hidden: { y: 100 },
    visible: { y: 0 },
  },
  
  rotateIn: {
    hidden: { opacity: 0, rotate: -10, scale: 0.9 },
    visible: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 10, scale: 0.9 },
  },
  
  pulse: {
    rest: { scale: 1 },
    pulse: { 
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 2 }
    },
  },
  
  shimmer: {
    rest: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: { repeat: Infinity, duration: 1.5, ease: 'linear' }
    },
  },
  
  skeleton: {
    initial: { opacity: 0.5 },
    animate: { 
      opacity: [0.5, 1, 0.5],
      transition: { repeat: Infinity, duration: 1.5 }
    },
  },
};

export const PageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

export const GesturePresets = {
  drag: {
    dragElastic: 0.2,
    dragTransition: { bounceStiffness: 300, bounceDamping: 20 },
  },
  swipe: {
    dragDirectionLock: true,
    dragElastic: 0.1,
  },
  pullToRefresh: {
    dragConstraints: { top: 0, bottom: 100 },
    dragElastic: 0.5,
  },
};

export const getStaggerDelay = (index: number, baseDelay = 0.05) => index * baseDelay;

export const createStaggerVariants = (staggerDelay = 0.05, delayChildren = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

export const createItemVariants = (
  yOffset = 20,
  spring = MotionPresets.spring.default
): Variants => ({
  hidden: { opacity: 0, y: yOffset },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: spring,
  },
});
