import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from '@/utils/LazyMotionProvider';
import { cn } from '@/lib/utils';

// === GLASS CARD ===
interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'subtle' | 'medium' | 'strong' | 'gradient' | 'frosted';
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'medium',
  className,
  hover = true
}) => {
  const variants = {
    subtle: 'glass-card',
    medium: 'glass-card-medium',
    strong: 'glass-card-strong',
    gradient: 'glass-card-gradient',
    frosted: 'glass-card-frosted'
  };
  
  return (
    <motion.div
      className={cn(
        'rounded-xl p-6',
        variants[variant],
        hover && 'hover-lift',
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// === TILT CARD (3D effect on hover) ===
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  maxTilt = 15
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]));
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]));
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((event.clientX - centerX) / rect.width);
    y.set((event.clientY - centerY) / rect.height);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      ref={ref}
      className={cn('glass-card-medium rounded-xl p-6', className)}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
    >
      <div style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>
    </motion.div>
  );
};

// === MORPHING CARD (shape changes on hover) ===
interface MorphingCardProps {
  children: React.ReactNode;
  className?: string;
}

export const MorphingCard: React.FC<MorphingCardProps> = ({
  children,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className={cn('glass-card-medium p-6 relative overflow-hidden', className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        borderRadius: isHovered ? '24px' : '16px'
      }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

// === PARALLAX CARD (depth layers) ===
interface ParallaxCardProps {
  children: React.ReactNode;
  backgroundLayer?: React.ReactNode;
  className?: string;
}

export const ParallaxCard: React.FC<ParallaxCardProps> = ({
  children,
  backgroundLayer,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const backgroundX = useSpring(useTransform(x, [-0.5, 0.5], [-20, 20]));
  const backgroundY = useSpring(useTransform(y, [-0.5, 0.5], [-20, 20]));
  const contentX = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]));
  const contentY = useSpring(useTransform(y, [-0.5, 0.5], [-5, 5]));
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((event.clientX - centerX) / rect.width);
    y.set((event.clientY - centerY) / rect.height);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <div
      ref={ref}
      className={cn('relative rounded-xl overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {backgroundLayer && (
        <motion.div
          className="absolute inset-0"
          style={{ x: backgroundX, y: backgroundY }}
        >
          {backgroundLayer}
        </motion.div>
      )}
      <motion.div
        className="relative z-10 glass-card-medium p-6"
        style={{ x: contentX, y: contentY }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// === FLIP CARD (flip animation) ===
interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  className
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div className={cn('relative h-full cursor-pointer', className)} onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div
        className="w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute w-full h-full glass-card-medium rounded-xl p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        
        <div
          className="absolute w-full h-full glass-card-strong rounded-xl p-6"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

// === EXPANDABLE PANEL ===
interface ExpandablePanelProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const ExpandablePanel: React.FC<ExpandablePanelProps> = ({
  title,
  children,
  defaultExpanded = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className={cn('glass-card-medium rounded-xl overflow-hidden', className)}>
      <button
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>{title}</div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.div>
      </button>
      
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// === BLOB CARD (organic shape with animated blob) ===
interface BlobCardProps {
  children: React.ReactNode;
  className?: string;
  blobColor?: string;
}

export const BlobCard: React.FC<BlobCardProps> = ({
  children,
  className,
  blobColor = 'rgba(16, 185, 129, 0.2)'
}) => {
  return (
    <div className={cn('relative glass-card-medium rounded-3xl p-6 overflow-hidden', className)}>
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-50"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          fill={blobColor}
          d="M44.3,-76.7C58.1,-69.3,70.7,-58.4,78.9,-44.8C87.1,-31.2,90.9,-15.6,89.8,-0.7C88.7,14.2,82.7,28.4,74.4,41.2C66.1,54,55.5,65.4,42.7,72.8C29.9,80.2,14.9,83.6,0.5,82.7C-13.9,81.8,-27.8,76.6,-40.9,69.4C-54,62.2,-66.3,53,-74.5,40.8C-82.7,28.6,-86.8,14.3,-86.3,0.3C-85.8,-13.7,-80.7,-27.4,-72.8,-39.6C-64.9,-51.8,-54.2,-62.5,-41.5,-70.4C-28.8,-78.3,-14.4,-83.4,0.6,-84.4C15.6,-85.4,31.2,-82.3,44.3,-76.7Z"
          animate={{
            d: [
              "M44.3,-76.7C58.1,-69.3,70.7,-58.4,78.9,-44.8C87.1,-31.2,90.9,-15.6,89.8,-0.7C88.7,14.2,82.7,28.4,74.4,41.2C66.1,54,55.5,65.4,42.7,72.8C29.9,80.2,14.9,83.6,0.5,82.7C-13.9,81.8,-27.8,76.6,-40.9,69.4C-54,62.2,-66.3,53,-74.5,40.8C-82.7,28.6,-86.8,14.3,-86.3,0.3C-85.8,-13.7,-80.7,-27.4,-72.8,-39.6C-64.9,-51.8,-54.2,-62.5,-41.5,-70.4C-28.8,-78.3,-14.4,-83.4,0.6,-84.4C15.6,-85.4,31.2,-82.3,44.3,-76.7Z",
              "M51.1,-85.8C65.4,-77.1,75.9,-61.5,82.5,-44.8C89.1,-28.1,91.8,-10.3,89.2,6.4C86.6,23.1,78.7,38.7,68.1,51.8C57.5,64.9,44.2,75.5,29.3,80.8C14.4,86.1,-2.1,86.1,-17.8,82.3C-33.5,78.5,-48.4,70.9,-60.8,59.5C-73.2,48.1,-83.1,32.9,-86.5,16.3C-89.9,-0.3,-86.8,-18.3,-79.2,-34.3C-71.6,-50.3,-59.5,-64.3,-44.7,-72.7C-29.9,-81.1,-12.5,-83.9,3.8,-89.7C20.1,-95.5,36.8,-94.5,51.1,-85.8Z",
              "M44.3,-76.7C58.1,-69.3,70.7,-58.4,78.9,-44.8C87.1,-31.2,90.9,-15.6,89.8,-0.7C88.7,14.2,82.7,28.4,74.4,41.2C66.1,54,55.5,65.4,42.7,72.8C29.9,80.2,14.9,83.6,0.5,82.7C-13.9,81.8,-27.8,76.6,-40.9,69.4C-54,62.2,-66.3,53,-74.5,40.8C-82.7,28.6,-86.8,14.3,-86.3,0.3C-85.8,-13.7,-80.7,-27.4,-72.8,-39.6C-64.9,-51.8,-54.2,-62.5,-41.5,-70.4C-28.8,-78.3,-14.4,-83.4,0.6,-84.4C15.6,-85.4,31.2,-82.3,44.3,-76.7Z"
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// === NOISE CARD (with grain texture effect) ===
interface NoiseCardProps {
  children: React.ReactNode;
  className?: string;
  noiseOpacity?: number;
}

export const NoiseCard: React.FC<NoiseCardProps> = ({
  children,
  className,
  noiseOpacity = 0.05
}) => {
  return (
    <div className={cn('relative glass-card-medium rounded-xl p-6 overflow-hidden', className)}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          opacity: noiseOpacity
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
