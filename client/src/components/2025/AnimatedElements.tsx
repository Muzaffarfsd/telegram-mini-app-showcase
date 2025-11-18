import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '@/utils/LazyMotionProvider';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';

// === ANIMATED ICON ===
interface AnimatedIconProps {
  icon: React.ReactNode;
  size?: number;
  withGlow?: boolean;
  withRing?: boolean;
  className?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon,
  size = 40,
  withGlow = true,
  withRing = true,
  className
}) => {
  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      {/* Animated ring */}
      {withRing && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-500/50"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Icon with glow */}
      <motion.div
        className={cn(
          'relative z-10 flex items-center justify-center',
          'w-full h-full rounded-full',
          withGlow && 'shadow-[0_0_20px_rgba(16,185,129,0.5)]'
        )}
        style={{
          background: 'linear-gradient(135deg, #10B981, #06B6D4)',
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-white">{icon}</div>
      </motion.div>
    </div>
  );
};

// === LIKE BUTTON WITH PARTICLES ===
interface LikeButtonProps {
  initialLiked?: boolean;
  onLike?: (liked: boolean) => void;
  size?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  initialLiked = false,
  onLike,
  size = 40
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [particles, setParticles] = useState<Particle[]>([]);
  const { hapticFeedback } = useTelegram();
  
  const handleClick = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    onLike?.(newLiked);
    
    if (newLiked) {
      hapticFeedback.heavy();
      
      // Create particles
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.cos((i / 8) * Math.PI * 2) * 30,
        y: Math.sin((i / 8) * Math.PI * 2) * 30
      }));
      
      setParticles(newParticles);
      
      // Remove particles after animation
      setTimeout(() => setParticles([]), 800);
    } else {
      hapticFeedback.light();
    }
  };
  
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full bg-pink-500"
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              left: '50%',
              top: '50%',
              marginLeft: -4,
              marginTop: -4
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Heart button */}
      <motion.button
        className={cn(
          'w-full h-full rounded-full flex items-center justify-center',
          'transition-colors duration-300',
          isLiked ? 'bg-gradient-to-br from-pink-500 to-red-500' : 'bg-white/10'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
      >
        <motion.svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill={isLiked ? 'white' : 'none'}
          stroke={isLiked ? 'white' : 'currentColor'}
          strokeWidth="2"
          initial={false}
          animate={{
            scale: isLiked ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </motion.svg>
      </motion.button>
    </div>
  );
};

// === SPLIT TEXT REVEAL ===
interface SplitTextRevealProps {
  children: string;
  delay?: number;
  className?: string;
}

export const SplitTextReveal: React.FC<SplitTextRevealProps> = ({
  children,
  delay = 0,
  className
}) => {
  const words = children.split(' ');
  
  return (
    <motion.span className={cn('inline-block', className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-2"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.05,
            ease: [0.33, 1, 0.68, 1]
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// === TYPEWRITER TEXT ===
interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  className,
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);
  
  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};

// === GLITCH TEXT ===
interface GlitchTextProps {
  children: string;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('relative inline-block', className)}>
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute top-0 left-0 text-cyan-500 opacity-70 pointer-events-none animate-glitch-1"
        aria-hidden="true"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
          animation: 'glitch-1 0.3s infinite'
        }}
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 text-pink-500 opacity-70 pointer-events-none animate-glitch-2"
        aria-hidden="true"
        style={{
          clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
          animation: 'glitch-2 0.3s infinite'
        }}
      >
        {children}
      </span>
    </div>
  );
};
