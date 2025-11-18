import { MotionConfig } from 'framer-motion';
import { DesignTokens } from '@/design-tokens';

export const appleEasing = {
  default: [0.25, 0.1, 0.25, 1],
  in: [0.42, 0, 1, 1],
  out: [0, 0, 0.58, 1],
  inOut: [0.42, 0, 0.58, 1],
  springBounce: [0.68, -0.55, 0.265, 1.55],
  springSmooth: [0.34, 1.56, 0.64, 1],
};

export const appleSpring = DesignTokens.spring;

export const motionConfig = {
  transition: {
    type: 'tween',
    duration: 0.25,
    ease: appleEasing.default
  },
  reducedMotion: 'user'
};

export const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: 20,
    translateZ: 0
  },
  animate: { 
    opacity: 1, 
    y: 0,
    translateZ: 0,
    transition: {
      duration: 0.25,
      ease: appleEasing.out
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    translateZ: 0,
    transition: {
      duration: 0.2,
      ease: appleEasing.in
    }
  }
};

export const scaleIn = {
  initial: { 
    scale: 0.95, 
    opacity: 0,
    translateZ: 0
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    translateZ: 0,
    transition: {
      type: 'spring',
      ...appleSpring.default
    }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    translateZ: 0,
    transition: {
      duration: 0.2,
      ease: appleEasing.in
    }
  }
};

export const slideIn = {
  initial: { 
    x: -20, 
    opacity: 0,
    translateZ: 0
  },
  animate: { 
    x: 0, 
    opacity: 1,
    translateZ: 0,
    transition: {
      duration: 0.25,
      ease: appleEasing.out
    }
  },
  exit: {
    x: 20,
    opacity: 0,
    translateZ: 0,
    transition: {
      duration: 0.2,
      ease: appleEasing.in
    }
  }
};

export const modalFromBottom = {
  initial: {
    opacity: 0,
    y: 100,
    scale: 0.95,
    translateZ: 0
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    translateZ: 0,
    transition: {
      type: 'spring',
      ...appleSpring.default
    }
  },
  exit: {
    opacity: 0,
    y: 100,
    scale: 0.95,
    translateZ: 0,
    transition: {
      duration: 0.2,
      ease: appleEasing.in
    }
  }
};

export const layoutTransition = {
  layout: true,
  transition: {
    layout: { 
      duration: 0.25,
      ease: appleEasing.out
    }
  }
};

export const hoverScale = {
  scale: 1.02,
  transition: {
    duration: 0.15,
    ease: appleEasing.out
  }
};

export const tapScale = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: appleEasing.in
  }
};

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return children;
}
