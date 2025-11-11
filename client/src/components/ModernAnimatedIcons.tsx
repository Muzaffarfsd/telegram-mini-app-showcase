import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShoppingBag,
  Laptop,
  Sparkle,
  ForkKnife,
  Coffee,
  Watch,
  Armchair,
  Lightning,
  DiamondsFour,
  Disc,
  Heart,
  Coffee as TeaCup,
  Cpu,
  Barbell,
  FlowerLotus,
  Car,
  Buildings,
  AirplaneTilt,
  GraduationCap,
  PawPrint,
  Books,
  Flower,
  GameController,
  FirstAidKit,
  Suitcase,
  Scales,
} from 'phosphor-react';

// Animation presets for modern micro-interactions
const iconAnimations = {
  // Gentle swing animation (for fashion/shopping)
  swing: {
    initial: { rotate: 0 },
    animate: {
      rotate: [-2, 2, -2],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  
  // Shimmer effect (for electronics/tech)
  shimmer: {
    initial: { opacity: 0.8 },
    animate: {
      opacity: [0.8, 1, 0.8],
      scale: [1, 1.05, 1],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  
  // Glow pulse (for beauty/luxury)
  glowPulse: {
    initial: { filter: 'drop-shadow(0 0 0px rgba(255,255,255,0))' },
    animate: {
      filter: [
        'drop-shadow(0 0 0px rgba(255,255,255,0))',
        'drop-shadow(0 0 12px rgba(255,255,255,0.6))',
        'drop-shadow(0 0 0px rgba(255,255,255,0))',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  
  // Float animation (for restaurants/food)
  float: {
    initial: { y: 0 },
    animate: {
      y: [-3, 3, -3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  
  // Rotation (for vinyl/records/car wheels)
  rotate: {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
  
  // Scale pulse (for fitness/health)
  scalePulse: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  
  // Breathing (for yoga/wellness)
  breathing: {
    initial: { scale: 1, opacity: 0.9 },
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
};

interface AnimatedIconWrapperProps {
  children: React.ReactNode;
  animation?: keyof typeof iconAnimations;
  color?: string;
  glowColor?: string;
}

const AnimatedIconWrapper: React.FC<AnimatedIconWrapperProps> = ({
  children,
  animation = 'shimmer',
  color = 'white',
  glowColor = 'rgba(255, 255, 255, 0.5)',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const animationConfig = iconAnimations[animation];

  // If user prefers reduced motion, disable animations
  const shouldAnimate = !prefersReducedMotion;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={shouldAnimate ? animationConfig.initial : {}}
      animate={shouldAnimate ? animationConfig.animate : {}}
      style={{
        color,
        filter: 'drop-shadow(0 4px 20px rgba(255, 255, 255, 0.15))',
      }}
    >
      {/* Glow background effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ backgroundColor: glowColor }}
        animate={shouldAnimate ? {
          opacity: [0.2, 0.4, 0.2],
          scale: [0.8, 1.2, 0.8],
        } : { opacity: 0.3 }}
        transition={shouldAnimate ? {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {}}
      />
      
      {/* Icon */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// === MODERN BUSINESS ICONS (2025 DESIGN) ===

// 1. Fashion / Clothing Store
export const ModernClothingIcon = () => (
  <AnimatedIconWrapper animation="swing" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(168, 85, 247, 0.4)">
    <ShoppingBag size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 2. Electronics Store
export const ModernElectronicsIcon = () => (
  <AnimatedIconWrapper animation="shimmer" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(59, 130, 246, 0.4)">
    <Laptop size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 3. Beauty Salon
export const ModernBeautyIcon = () => (
  <AnimatedIconWrapper animation="glowPulse" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(236, 72, 153, 0.4)">
    <Sparkle size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 4. Restaurant
export const ModernRestaurantIcon = () => (
  <AnimatedIconWrapper animation="float" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(251, 191, 36, 0.4)">
    <ForkKnife size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 5. Coffee Shop
export const ModernCoffeeIcon = () => (
  <AnimatedIconWrapper animation="float" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(217, 119, 6, 0.4)">
    <Coffee size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 6. Luxury Watches
export const ModernWatchIcon = () => (
  <AnimatedIconWrapper animation="shimmer" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(250, 204, 21, 0.4)">
    <Watch size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 7. Home Decor
export const ModernHomeDecorIcon = () => (
  <AnimatedIconWrapper animation="float" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(16, 185, 129, 0.4)">
    <Armchair size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 8. Sneaker Store
export const ModernSneakerIcon = () => (
  <AnimatedIconWrapper animation="swing" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(239, 68, 68, 0.4)">
    <Lightning size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 9. Jewelry Boutique
export const ModernJewelryIcon = () => (
  <AnimatedIconWrapper animation="glowPulse" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(147, 51, 234, 0.4)">
    <DiamondsFour size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 10. Vinyl Records
export const ModernVinylIcon = () => (
  <AnimatedIconWrapper animation="rotate" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(99, 102, 241, 0.4)">
    <Disc size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 11. Artisan Market
export const ModernArtisanIcon = () => (
  <AnimatedIconWrapper animation="scalePulse" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(34, 197, 94, 0.4)">
    <Heart size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 12. Premium Tea
export const ModernTeaIcon = () => (
  <AnimatedIconWrapper animation="float" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(20, 184, 166, 0.4)">
    <TeaCup size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 13. Tech Gadgets
export const ModernGadgetIcon = () => (
  <AnimatedIconWrapper animation="shimmer" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(6, 182, 212, 0.4)">
    <Cpu size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 14. Fitness Club
export const ModernFitnessIcon = () => (
  <AnimatedIconWrapper animation="scalePulse" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(132, 204, 22, 0.4)">
    <Barbell size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 15. Yoga Studio
export const ModernYogaIcon = () => (
  <AnimatedIconWrapper animation="breathing" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(167, 139, 250, 0.4)">
    <FlowerLotus size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 16. Car Service
export const ModernCarServiceIcon = () => (
  <AnimatedIconWrapper animation="shimmer" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(59, 130, 246, 0.4)">
    <Car size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 17. Real Estate
export const ModernRealEstateIcon = () => (
  <AnimatedIconWrapper animation="float" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(100, 116, 139, 0.4)">
    <Buildings size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 18. Travel Agency
export const ModernTravelIcon = () => (
  <AnimatedIconWrapper animation="float" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(14, 165, 233, 0.4)">
    <AirplaneTilt size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 19. Online Education
export const ModernEducationIcon = () => (
  <AnimatedIconWrapper animation="swing" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(79, 70, 229, 0.4)">
    <GraduationCap size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 20. Pet Shop
export const ModernPetShopIcon = () => (
  <AnimatedIconWrapper animation="scalePulse" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(251, 146, 60, 0.4)">
    <PawPrint size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 21. Bookstore
export const ModernBookstoreIcon = () => (
  <AnimatedIconWrapper animation="float" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(234, 179, 8, 0.4)">
    <Books size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// 22. Flower Delivery
export const ModernFlowerIcon = () => (
  <AnimatedIconWrapper animation="breathing" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(244, 114, 182, 0.4)">
    <Flower size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

// Additional business icons
export const ModernGamingIcon = () => (
  <AnimatedIconWrapper animation="shimmer" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(168, 85, 247, 0.4)">
    <GameController size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

export const ModernMedicalIcon = () => (
  <AnimatedIconWrapper animation="scalePulse" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(239, 68, 68, 0.4)">
    <FirstAidKit size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

export const ModernLuggageIcon = () => (
  <AnimatedIconWrapper animation="swing" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(14, 165, 233, 0.4)">
    <Suitcase size={80} weight="duotone" />
  </AnimatedIconWrapper>
);

export const ModernLegalIcon = () => (
  <AnimatedIconWrapper animation="shimmer" color="rgba(255, 255, 255, 0.95)" glowColor="rgba(100, 116, 139, 0.4)">
    <Scales size={80} weight="duotone" />
  </AnimatedIconWrapper>
);
