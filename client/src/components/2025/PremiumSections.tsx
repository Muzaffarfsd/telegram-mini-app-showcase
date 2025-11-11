import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

// === PREMIUM HERO SECTION ===
interface PremiumHeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  background?: 'gradient' | 'mesh' | 'aurora' | 'particles';
  className?: string;
}

export const PremiumHero: React.FC<PremiumHeroProps> = ({
  title,
  subtitle,
  cta,
  background = 'gradient',
  className
}) => {
  const backgrounds = {
    gradient: 'bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-purple-500/20',
    mesh: 'mesh-gradient',
    aurora: 'aurora-bg',
    particles: 'bg-transparent'
  };
  
  return (
    <motion.section
      className={cn(
        'relative min-h-screen flex items-center justify-center overflow-hidden',
        backgrounds[background],
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {title}
        </motion.div>
        
        {subtitle && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6"
          >
            {subtitle}
          </motion.div>
        )}
        
        {cta && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10"
          >
            {cta}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

// === FLOATING NAVIGATION ===
interface FloatingNavProps {
  items: { label: string; href: string; icon?: React.ReactNode }[];
  className?: string;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  items,
  className
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  return (
    <motion.nav
      className={cn(
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-50',
        'glass-card-frosted rounded-full px-6 py-3',
        'shadow-lg',
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : 100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ duration: 0.3 }}
    >
      <ul className="flex items-center gap-6">
        {items.map((item, index) => (
          <motion.li key={index}>
            <button
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative px-4 py-2 rounded-full transition-colors',
                activeIndex === index 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white/80'
              )}
            >
              {activeIndex === index && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-emerald-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
};

// === TAB NAVIGATION ===
interface TabNavigationProps {
  tabs: { label: string; content: React.ReactNode }[];
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  className
}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div className={className}>
      <div className="glass-card-medium rounded-xl p-2 inline-flex gap-2">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={cn(
              'relative px-6 py-2 rounded-lg transition-colors',
              activeTab === index
                ? 'text-white'
                : 'text-white/60 hover:text-white/80'
            )}
          >
            {activeTab === index && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-emerald-500 rounded-lg"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {tabs[activeTab].content}
        </motion.div>
      </div>
    </div>
  );
};

// === PARALLAX SECTION ===
interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
  
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, opacity }}>
        {children}
      </motion.div>
    </div>
  );
};

// === REVEAL ON SCROLL ===
interface RevealOnScrollProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  direction = 'up',
  delay = 0,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { y: 0, x: 50 },
    right: { y: 0, x: -50 }
  };
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ 
        opacity: 0,
        ...directions[direction]
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        x: 0 
      } : {}}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

// === STICKY SECTION ===
interface StickySectionProps {
  children: React.ReactNode;
  className?: string;
  stickyClassName?: string;
}

export const StickySection: React.FC<StickySectionProps> = ({
  children,
  className,
  stickyClassName
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end']
  });
  
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 1], [1, 0.85]),
    { stiffness: 100, damping: 30 }
  );
  
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.3]),
    { stiffness: 100, damping: 30 }
  );
  
  return (
    <div ref={ref} className={cn('relative', className)}>
      <motion.div
        className={cn('sticky top-20', stickyClassName)}
        style={{ scale, opacity }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// === SCROLL PROGRESS INDICATOR ===
export const ScrollProgressIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  return (
    <motion.div
      className={cn(
        'fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500',
        'origin-left z-50',
        className
      )}
      style={{ scaleX }}
    />
  );
};
