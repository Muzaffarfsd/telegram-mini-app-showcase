import { Smartphone, ShoppingCart, Code, Star, Users, Search } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { m } from 'framer-motion';
import { MotionStagger, MotionBox, HoverScale } from './MotionWrapper';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useTrackInteraction } from '@/hooks/useAIRecommendations';
import { ClothingIcon, ElectronicsIcon, BeautyIcon, RestaurantIcon, FitnessIcon, CarServiceIcon } from './AnimatedBusinessIcons';
import { LazyVideo } from './LazyVideo';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import blackHoodieImage from "@assets/c63bf9171394787.646e06bedc2c7_1761732722277.jpg";
import colorfulHoodieImage from "@assets/fb10cc201496475.6675676d24955_1761732737648.jpg";
import storeHomepageImage from "@assets/image_1761735146810.png";
import sneakerStoreImage from "@assets/image_1761735746522.png";
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";

// Videos served from public/videos/ to reduce Docker image size for Railway deployment
const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";
const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const heroVideo = "/videos/1341996d8f73172cbc77930dc818d88e_t4_1763643600785.mp4";

// Lazy load heavy components for better initial load performance

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

// 3D Perspective Container (use once at parent level to avoid nested contexts)
const Perspective3DContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      style={{ 
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      className={className}
    >
      {children}
    </div>
  );
};

// Enhanced 3D Card Animation Wrapper with Glassmorphism (2025 Trend)
// NOTE: Must be used inside Perspective3DContainer for 3D effects
const Glass3DCard: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void;
  delay?: number;
  accentColor?: string;
}> = ({ children, onClick, delay = 0, accentColor = 'var(--tg-theme-accent, #00ffff)' }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        scale: 1.03,
        rotateY: 5,
        rotateX: 5,
        z: 50,
        transition: { 
          type: "spring", 
          stiffness: 300,
          damping: 20
        }
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        transformStyle: 'preserve-3d'
      }}
      className="flex group relative cursor-pointer h-full w-full"
      onClick={onClick}
    >
      {/* Neon glow effect on hover */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `radial-gradient(circle at center, ${accentColor}40 0%, transparent 70%)`,
          zIndex: -1
        }}
      />
      {children}
    </m.div>
  );
};

// SVG Dollar Bill Component
const DollarSVG = () => (
  <svg width="90" height="41" viewBox="0 0 120 55" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Main bill background */}
    <rect width="120" height="55" rx="3" fill="url(#dollarGradient)" stroke="#1a4d2e" strokeWidth="1.5"/>
    
    {/* Gradient definition */}
    <defs>
      <linearGradient id="dollarGradient" x1="0" y1="0" x2="120" y2="55">
        <stop offset="0%" stopColor="#85bb65"/>
        <stop offset="50%" stopColor="#6b9b52"/>
        <stop offset="100%" stopColor="#85bb65"/>
      </linearGradient>
    </defs>
    
    {/* Decorative border */}
    <rect x="4" y="4" width="112" height="47" rx="2" fill="none" stroke="#2d5a3d" strokeWidth="0.8" strokeDasharray="2 2"/>
    
    {/* Left portrait circle */}
    <circle cx="22" cy="27.5" r="12" fill="#2d5a3d" stroke="#1a4d2e" strokeWidth="1"/>
    <text x="22" y="32" fontSize="10" fontWeight="bold" fill="#85bb65" textAnchor="middle">$</text>
    
    {/* Center "100" */}
    <text x="60" y="34" fontSize="24" fontWeight="900" fill="#1a4d2e" textAnchor="middle">100</text>
    
    {/* Top corners */}
    <text x="8" y="13" fontSize="8" fontWeight="bold" fill="#1a4d2e">100</text>
    <text x="103" y="13" fontSize="8" fontWeight="bold" fill="#1a4d2e" textAnchor="end">100</text>
    
    {/* Bottom text */}
    <text x="8" y="48" fontSize="6" fill="#2d5a3d">USA</text>
    <text x="112" y="48" fontSize="6" fill="#2d5a3d" textAnchor="end">$100</text>
    
    {/* Right seal */}
    <circle cx="98" cy="27.5" r="8" fill="#1a4d2e" stroke="#2d5a3d" strokeWidth="0.8"/>
    <circle cx="98" cy="27.5" r="4" fill="#85bb65"/>
    
    {/* Decorative lines */}
    <line x1="40" y1="15" x2="80" y2="15" stroke="#2d5a3d" strokeWidth="0.5" opacity="0.5"/>
    <line x1="40" y1="40" x2="80" y2="40" stroke="#2d5a3d" strokeWidth="0.5" opacity="0.5"/>
  </svg>
);

// Generate stable random values for dollar animations (outside component to avoid re-renders)
const dollarAnimations = Array.from({ length: 8 }, (_, i) => ({
  left: 5 + Math.random() * 90,
  top: -(40 + Math.random() * 60),
  delay: Math.random() * 10,
  duration: 6 + Math.random() * 4,
  rotateStart: -15 + Math.random() * 30,
  driftX1: -10 + Math.random() * 20,
  rotateIntensity: 1,
  blurIntensity: 0,
}));

// Video Hero Card Component with lazy loading
const VideoHeroCard = memo<{ onOpenDemo: (id: string) => void }>(({ onOpenDemo }) => {
  const videoRef = useVideoLazyLoad();
  
  return (
    <div 
      className="relative h-full rounded-3xl overflow-hidden group tg-interactive cursor-pointer"
      data-testid="hero-card-clothing"
      onClick={() => onOpenDemo('clothing-store')}
    >
      <video
        ref={videoRef}
        src={fashionVideo}
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="text-white text-5xl font-light mb-2"
          style={{ letterSpacing: '0.4em' }}
        >
          A L U R E
        </div>
        <div className="text-white/70 text-sm uppercase tracking-widest mb-4">
          Premium Streetwear
        </div>
        <div className="px-4 py-2 bg-[#CDFF38] text-black rounded-full inline-block text-xs font-bold uppercase">
          NEW COLLECTION
        </div>
      </div>
      
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold"
        style={{
          background: 'rgba(205, 255, 56, 0.95)',
          color: '#0A0A0A'
        }}
      >
        NEW
      </div>
    </div>
  );
});

// Sneaker Demo Card Component - Premium Minimal
const SneakerDemoCard = memo<{ onOpenDemo: (id: string) => void }>(({ onOpenDemo }) => (
  <div 
    className="relative h-full rounded-2xl overflow-hidden group tg-interactive cursor-pointer"
    data-testid="demo-card-sneaker-store"
    onClick={() => onOpenDemo('sneaker-store')}
  >
      <img
        src="/images/nike-acg.jpg"
        alt="Nike ACG"
        className="absolute inset-0 w-full h-full object-cover"
      />
    
    {/* Content */}
    <div className="absolute inset-0 p-5 flex flex-col">
      
      {/* Top Section - Title and Badge aligned */}
      <div className="flex items-center justify-between mb-auto">
        <div>
          <div className="text-white text-2xl font-light tracking-[0.35em]"
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6)'
            }}
          >
            S O L E
          </div>
          <div className="h-[1px] w-12 mt-1.5"
            style={{
              background: 'linear-gradient(90deg, rgba(100, 235, 220, 0.6), transparent)'
            }}
          ></div>
        </div>
        
        {/* Exclusive Badge */}
        <div className="px-2 py-0.5 text-[8px] font-medium tracking-wide whitespace-nowrap"
          style={{
            background: 'rgba(100, 235, 220, 0.1)',
            border: '1px solid rgba(100, 235, 220, 0.25)',
            borderRadius: '6px',
            color: '#64EBDC'
          }}
        >
          EXCLUSIVE
        </div>
      </div>
      
      {/* Bottom Section - Centered content */}
      <div className="text-center">
        <div className="text-white/70 text-[10px] uppercase tracking-[0.15em] mb-3 font-light"
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
          }}
        >
          Premium Sneakers
        </div>
        
        <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-semibold tracking-wider uppercase w-full max-w-[200px]"
          style={{
            background: 'rgba(100, 235, 220, 0.25)',
            border: '1px solid rgba(100, 235, 220, 0.4)',
            borderRadius: '10px',
            color: '#64EBDC',
            backdropFilter: 'blur(10px)'
          }}
        >
          <span>EXPLORE</span>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
));

// Watches Demo Card Component - Premium Minimal
const WatchesDemoCard = memo<{ onOpenDemo: (id: string) => void }>(({ onOpenDemo }) => {
  const videoRef = useVideoLazyLoad();
  
  return (
  <div 
    className="relative h-full rounded-2xl overflow-hidden group tg-interactive cursor-pointer"
    data-testid="demo-card-luxury-watches"
    onClick={() => onOpenDemo('luxury-watches')}
  >
      <video
        ref={videoRef}
        src={watchesVideo}
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />
    
    {/* Lighter Gradient Overlay - better video visibility */}
    <div className="absolute inset-0"
      style={{
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.7) 100%)'
      }}
    ></div>
    
    {/* Content - Vertical Layout */}
    <div className="absolute inset-0 p-5 flex flex-col">
      
      {/* Top Section */}
      <div className="flex items-center justify-between mb-auto">
        <div>
          <div className="text-2xl font-light tracking-[0.40em]"
            style={{
              background: 'linear-gradient(135deg, #E8D4A0 0%, #D6B980 50%, #C9A870 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            L U X E
          </div>
          <div className="h-[1px] w-12 mt-1.5"
            style={{
              background: 'linear-gradient(90deg, rgba(214, 185, 128, 0.4), transparent)'
            }}
          ></div>
        </div>
        
        {/* Limited Edition Badge */}
        <div className="w-1.5 h-1.5 rounded-full"
          style={{
            background: '#D6B980',
            boxShadow: '0 0 8px rgba(214, 185, 128, 0.6)'
          }}
        ></div>
      </div>
      
      {/* Bottom Section - Centered */}
      <div className="text-center">
        <div className="text-white/50 text-[10px] uppercase tracking-[0.15em] mb-3 font-light">
          Swiss Timepieces
        </div>
        
        <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-semibold tracking-wider uppercase w-full max-w-[200px]"
          style={{
            background: 'rgba(214, 185, 128, 0.12)',
            border: '1px solid rgba(214, 185, 128, 0.25)',
            borderRadius: '10px',
            color: '#D6B980',
            backdropFilter: 'blur(10px)'
          }}
        >
          <span>EXPLORE</span>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
  );
});

// Demo Card Component
const DemoCard = memo<{ 
  id: string; 
  title: string;
  subtitle: string;
  videoSrc?: string;
  imageSrc?: string;
  onOpenDemo: (id: string) => void;
}>(({ id, title, subtitle, videoSrc, imageSrc, onOpenDemo }) => {
  const videoRef = useVideoLazyLoad();
  
  return (
    <div 
      className="relative h-full rounded-2xl overflow-hidden cursor-pointer group tg-interactive"
      onClick={() => onOpenDemo(id)}
      data-testid={`demo-card-${id}`}
    >
      {videoSrc && (
        <video 
          ref={videoRef}
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
      
      {imageSrc && !videoSrc && (
        <img 
          src={imageSrc} 
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="text-white text-2xl font-light mb-1"
          style={{ letterSpacing: '0.3em' }}
        >
          {title}
        </div>
        <div className="text-white/60 text-xs uppercase tracking-wider">
          {subtitle}
        </div>
      </div>
    </div>
  );
});

// Stat Card Component
const StatCard = memo<{ title: string; subtitle: string }>(({ title, subtitle }) => (
  <div className="relative h-full rounded-2xl overflow-hidden backdrop-blur-3xl"
    style={{
      background: 'rgba(10, 10, 10, 0.9)',
      border: '2px solid rgba(255, 255, 255, 0.15)'
    }}
    data-testid={`stat-card-${subtitle.toLowerCase()}`}
  >
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <div className="text-white text-4xl font-black mb-2"
        style={{ letterSpacing: '0.05em' }}
      >
        {title}
      </div>
      <div className="text-white/50 text-xs uppercase tracking-widest font-bold">
        {subtitle}
      </div>
    </div>
  </div>
));

// AI Assistant Card Component
const AIAssistantCardPreview = memo(() => (
  <div className="relative h-full rounded-2xl overflow-hidden backdrop-blur-3xl"
    style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      border: '2px solid rgba(59, 130, 246, 0.2)'
    }}
    data-testid="ai-assistant-card"
  >
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🤖</div>
        <div className="text-white text-lg font-bold mb-2 uppercase tracking-wider">
          AI Ассистент
        </div>
        <div className="text-white/60 text-sm">
          24/7 поддержка и консультации
        </div>
      </div>
    </div>
  </div>
));

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const { hapticFeedback, isDark, colorScheme } = useTelegram();
  const haptic = useHaptic();
  const trackInteraction = useTrackInteraction();
  const [showDecorations, setShowDecorations] = useState(false);
  
  // Обработчик с haptic feedback для открытия демо
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light(); // Легкая вибрация при нажатии
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);
  
  // Load decorative elements after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDecorations(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Mobile Container */}
      <div className="max-w-md mx-auto min-h-screen p-4 relative z-10">
        
        {/* Premium Dark Minimal Hero Section */}
        <div className="relative py-12 mb-12 overflow-hidden">
          
          {/* Main Container */}
          <div className="space-y-6">
            
            {/* Premium Minimal Hero Block with Video */}
            <div className="relative rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Inner Block */}
              <div className="relative rounded-2xl overflow-hidden"
                style={{
                  background: '#000000'
                }}
              >
                {/* Background Video */}
                <LazyVideo
                  src={heroVideo}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                />
                
                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)'
                  }}
                ></div>
                
                {/* Subtle Top Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px]"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
                  }}
                />
              
              {/* Content - Mobile-First 2025 Style */}
              <div className="relative px-4 sm:px-6 py-8 sm:py-12 md:py-16 text-center flex items-center justify-center min-h-[50vh] sm:min-h-[55vh]">
                
                {/* Glassmorphic Container - Mobile Optimized */}
                <div 
                  className="relative rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-6 sm:py-8 mx-auto w-full max-w-[300px] sm:max-w-sm"
                  style={{
                    background: 'rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {/* Accent Badge */}
                  <div 
                    className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4 text-xs font-bold tracking-wider"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    2025
                  </div>
                  
                  {/* Main Headline - Mobile Responsive */}
                  <h1 
                    className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 leading-tight"
                    style={{
                      color: '#FFFFFF',
                      textShadow: '0 2px 20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.2)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    TELEGRAM
                  </h1>
                  
                  {/* Subtitle with Accent Color */}
                  <div 
                    className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide mb-3 sm:mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    ДЛЯ БИЗНЕСА
                  </div>
                  
                  {/* Clean Separator Line */}
                  <div 
                    className="w-12 sm:w-14 h-0.5 mx-auto mb-3 sm:mb-4 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #10B981, transparent)'
                    }}
                  />
                  
                  {/* Tagline - Mobile Optimized */}
                  <p 
                    className="text-xs sm:text-sm font-semibold tracking-wide"
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    ЗАПУСК ЗА 24 ЧАСА
                  </p>
                  <p 
                    className="text-[10px] sm:text-xs font-medium tracking-wider mt-1 sm:mt-1.5"
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    БЕЗ КОДА • ПРЕМИУМ КАЧЕСТВО
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* Section Header - Mobile Optimized */}
            <div className="mb-4 sm:mb-6 text-center px-4">
              <h2 className="text-xl sm:text-2xl md:text-[1.5rem] font-sans font-black uppercase tracking-wider"
                style={{
                  color: '#FFFFFF',
                  letterSpacing: '0.1em'
                }}
              >
                БИЗНЕС-ПРИЛОЖЕНИЯ
              </h2>
            </div>

            {/* Bento Grid Layout - Fixed Desktop Layout for All Screens */}
            <div className="grid grid-cols-12 gap-3 px-4">
              
                {/* Hero - большая плитка */}
                <div className="col-span-8 h-[500px]">
                  <VideoHeroCard onOpenDemo={handleOpenDemo} />
                </div>
              
              {/* Средние плитки */}
              <div className="col-span-4 h-[240px]">
                <SneakerDemoCard onOpenDemo={handleOpenDemo} />
              </div>
              <div className="col-span-4 h-[240px]">
                <WatchesDemoCard onOpenDemo={handleOpenDemo} />
              </div>
              
              {/* Futuristic Fashion Collection - 5 новых приложений */}
              <div className="col-span-4 h-[300px]">
                <div 
                  className="relative h-full rounded-3xl overflow-hidden cursor-pointer group tg-interactive"
                  onClick={() => onOpenDemo('futuristic-fashion-1')}
                >
                  <video
                    src="/videos/rascal.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e2a]/90 via-[#1a2e2a]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-[#7FB069] text-xs mb-2 font-bold">ФУТУРИСТИКА</div>
                    <h3 className="text-white text-2xl font-bold mb-1">Rascal®</h3>
                    <p className="text-white/70 text-sm">Waterproof Fashion</p>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs font-bold">
                    NEW
                  </div>
                </div>
              </div>

              <div className="col-span-4 h-[300px]">
                <div 
                  className="relative h-full rounded-3xl overflow-hidden cursor-pointer group tg-interactive"
                  onClick={() => onOpenDemo('futuristic-fashion-2')}
                >
                  <img
                    src={nikeDestinyImage}
                    alt="STORE"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-white/60 text-xs mb-2 font-bold">МИНИМАЛИЗМ</div>
                    <h3 className="text-white text-2xl font-bold mb-1">STORE</h3>
                    <p className="text-white/70 text-sm">Black Minimal</p>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black text-white text-xs font-bold">
                    PREMIUM
                  </div>
                </div>
              </div>

              <div className="col-span-4 h-[300px]">
                <div 
                  className="relative h-full rounded-3xl overflow-hidden cursor-pointer group tg-interactive"
                  onClick={() => onOpenDemo('futuristic-fashion-3')}
                >
                  <img
                    src={nikeGreenImage}
                    alt="lab. SURVIVALIST"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-white/60 text-xs mb-2 font-bold">ПРЕМИУМ</div>
                    <h3 className="text-white text-2xl font-bold mb-1">lab. SURVIVALIST</h3>
                    <p className="text-white/70 text-sm">Black & White</p>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold">
                    LUXURY
                  </div>
                </div>
              </div>

              <div className="col-span-6 h-[300px]">
                <div 
                  className="relative h-full rounded-3xl overflow-hidden cursor-pointer group tg-interactive"
                  onClick={() => onOpenDemo('futuristic-fashion-4')}
                >
                  <img
                    src="/attached_assets/stock_images/futuristic_fashion_m_4203db1e.jpg"
                    alt="Nike ACG"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-white/60 text-xs mb-2 font-bold">ИНТЕРАКТИВ</div>
                    <h3 className="text-white text-2xl font-bold mb-1">Nike ACG</h3>
                    <p className="text-white/70 text-sm">3D Card Design</p>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-800 to-black text-white text-xs font-bold">
                    3D
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Services Grid - Fixed Desktop Layout */}
        <MotionStagger className="grid grid-cols-2 gap-4 mt-6 px-4">
          
          {/* Main Services Card */}
          <MotionBox variant="fadeInScale">
            <HoverScale scale={1.02}>
              <div 
                className="col-span-2 relative rounded-3xl p-6 cursor-pointer overflow-hidden group tg-interactive"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                onClick={() => onNavigate('projects')}
                data-testid="card-main-services"
              >
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                animation: 'float 6s ease-in-out infinite'
              }}
            />
            
            {/* Top Left Icon with Glow */}
            <div className="absolute top-4 left-4 z-10">
              <div className="w-9 h-9 text-black"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))'
                }}
              >
                <Star className="w-full h-full" fill="currentColor" />
              </div>
            </div>
            
            {/* Large Number with Shadow */}
            <div className="relative text-black text-[96px] font-black leading-none mb-2 tracking-tighter"
              style={{
                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)'
              }}
            >
              4
            </div>
            
            <div className="relative text-black font-black text-2xl mb-1 tracking-tight">
              SERVICES
            </div>
            
            <div className="relative text-black/70 text-sm font-medium">
              Готовые решения для бизнеса
            </div>
            
            {/* Agency Label with Badge */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <span className="text-white text-xs font-bold tracking-wide whitespace-nowrap">
                WEB4TG.AGENCY
              </span>
            </div>
          </div>
            </HoverScale>
          </MotionBox>

          {/* Service Card 1 - Telegram Apps (Premium Style) */}
          <MotionBox variant="fadeInUp">
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-3xl p-4 cursor-pointer overflow-hidden group tg-interactive"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
                }}
                onClick={() => onOpenDemo('clothing-store')}
                data-testid="card-telegram-apps"
              >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'shimmerWave 3s ease-in-out infinite'
              }}
            />
            
            {/* Remote Label */}
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <span className="text-white text-[10px] font-bold tracking-wide">УДАЛЕННО</span>
            </div>
            
            {/* Card Number */}
            <div className="text-black text-3xl font-thin mb-2" style={{fontFamily: 'Inter, sans-serif', letterSpacing: '3px'}}>1/4</div>
            
            {/* Icon */}
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5" style={{color: '#10B981'}} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-black text-lg font-bold leading-tight">
                Telegram-приложения под ключ
              </h3>
              <p className="text-black/70 text-xs leading-tight mb-2">
                Запуск за 24 часа. Все инструменты для продаж и клиентов
              </p>
              <p className="text-black/60 text-sm font-medium">
                ПО ПРЕДОПЛАТЕ
              </p>
            </div>
          </div>
            </HoverScale>
          </MotionBox>

          {/* Service Card 2 - E-commerce */}
          <MotionBox variant="fadeInUp" delay={0.1}>
            <HoverScale scale={1.05}>
              <div 
                className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 cursor-pointer tg-interactive"
            onClick={() => onOpenDemo('electronics')}
          >
            {/* Remote Label */}
            <div className="absolute top-3 right-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
              REMOTE
            </div>
            
            {/* Card Number */}
            <div className="text-white text-2xl font-black mb-2">2/4</div>
            
            {/* Icon */}
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-white text-lg font-bold leading-tight">
                E-COMMERCE SOLUTIONS
              </h3>
              <p className="text-white/70 text-xs leading-tight mb-2">
                Полнофункциональные платформы электронной коммерции
              </p>
              <p className="text-white/60 text-sm font-medium">
                FULLTIME
              </p>
            </div>
          </div>
            </HoverScale>
          </MotionBox>

          {/* Service Card 3 - Automation */}
          <MotionBox variant="fadeInUp" delay={0.15}>
            <HoverScale scale={1.05}>
              <div 
                className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 cursor-pointer tg-interactive"
                onClick={() => onOpenDemo('beauty')}
              >
            {/* Remote Label */}
            <div className="absolute top-3 right-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
              REMOTE
            </div>
            
            {/* Card Number */}
            <div className="text-white text-2xl font-black mb-2">3/4</div>
            
            {/* Icon */}
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <Code className="w-5 h-5 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-white text-lg font-bold leading-tight">
                BUSINESS AUTOMATION
              </h3>
              <p className="text-white/70 text-xs leading-tight mb-2">
                Умные боты и системы для оптимизации работы
              </p>
              <p className="text-white/60 text-sm font-medium">
                PARTTIME
              </p>
            </div>
          </div>
            </HoverScale>
          </MotionBox>

          {/* Portfolio Card */}
          <MotionBox variant="fadeInUp" delay={0.2}>
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-3xl p-4 cursor-pointer tg-interactive"
                style={{backgroundColor: '#10B981'}}
                onClick={() => onNavigate('projects')}
              >
            {/* Remote Label */}
            <div className="absolute top-3 right-3 bg-black/20 text-black text-xs px-2 py-1 rounded-full font-medium">
              УДАЛЕННО
            </div>
            
            {/* Card Number */}
            <div className="text-black text-3xl font-thin mb-2" style={{fontFamily: 'Inter, sans-serif', letterSpacing: '3px'}}>4/4</div>
            
            {/* Icon */}
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-3">
              <Users className="w-5 h-5" style={{color: '#10B981'}} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-black text-lg font-bold leading-tight">
                ПОРТФОЛИО И КЕЙСЫ
              </h3>
              <p className="text-black/70 text-xs leading-tight mb-2">
                Успешные проекты и практические решения для бизнеса
              </p>
              <p className="text-black/60 text-sm font-medium">
                ДОСТУПНО
              </p>
            </div>
          </div>
            </HoverScale>
          </MotionBox>

        </MotionStagger>
        
      </div>
      
    </div>
  );
}

// Memoize the component for better performance
export default React.memo(ShowcasePage);
