import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronRight, 
  Star, 
  TrendingUp, 
  Sparkles,
  Heart,
  ShoppingBag,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface HeroProduct {
  id: string;
  name: string;
  tagline?: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
}

export interface HeroSectionProps {
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaSecondaryText?: string;
  onCtaClick?: () => void;
  onSecondaryClick?: () => void;
  backgroundImage?: string;
  featuredProduct?: HeroProduct;
  variant?: 'centered' | 'split' | 'fullscreen';
  className?: string;
  'data-testid'?: string;
}

export function HeroSection({
  headline,
  subheadline,
  ctaText = 'Shop Now',
  ctaSecondaryText,
  onCtaClick,
  onSecondaryClick,
  backgroundImage,
  featuredProduct,
  variant = 'centered',
  className = '',
  'data-testid': testId,
}: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  if (variant === 'split') {
    return (
      <section 
        ref={ref}
        className={`relative min-h-[70vh] flex items-center ${className}`}
        data-testid={testId || 'hero-section'}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              variants={!prefersReducedMotion ? containerVariants : undefined}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="space-y-6"
            >
              <motion.h1 
                variants={!prefersReducedMotion ? itemVariants : undefined}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              >
                {headline}
              </motion.h1>
              
              {subheadline && (
                <motion.p 
                  variants={!prefersReducedMotion ? itemVariants : undefined}
                  className="text-lg md:text-xl text-muted-foreground max-w-lg"
                >
                  {subheadline}
                </motion.p>
              )}

              <motion.div 
                variants={!prefersReducedMotion ? itemVariants : undefined}
                className="flex flex-wrap gap-4"
              >
                <Button size="lg" onClick={onCtaClick} className="min-h-12" data-testid="button-hero-cta">
                  {ctaText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {ctaSecondaryText && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={onSecondaryClick}
                    className="min-h-12"
                    data-testid="button-hero-secondary"
                  >
                    {ctaSecondaryText}
                  </Button>
                )}
              </motion.div>
            </motion.div>

            {featuredProduct && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                className="relative"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                  <img
                    src={featuredProduct.image}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover"
                  />
                  {featuredProduct.badge && (
                    <Badge className="absolute top-4 left-4">
                      {featuredProduct.badge}
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold">{featuredProduct.name}</h3>
                  {featuredProduct.tagline && (
                    <p className="text-muted-foreground">{featuredProduct.tagline}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold">${featuredProduct.price}</span>
                    {featuredProduct.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${featuredProduct.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={ref}
      className={`relative min-h-[60vh] flex items-center justify-center text-center ${
        backgroundImage ? 'text-white' : ''
      } ${className}`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
      data-testid={testId || 'hero-section'}
    >
      <motion.div
        variants={!prefersReducedMotion ? containerVariants : undefined}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="container mx-auto px-4 py-16 space-y-6"
      >
        <motion.h1 
          variants={!prefersReducedMotion ? itemVariants : undefined}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto"
        >
          {headline}
        </motion.h1>
        
        {subheadline && (
          <motion.p 
            variants={!prefersReducedMotion ? itemVariants : undefined}
            className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto"
          >
            {subheadline}
          </motion.p>
        )}

        <motion.div 
          variants={!prefersReducedMotion ? itemVariants : undefined}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <Button 
            size="lg" 
            onClick={onCtaClick} 
            className="min-h-12"
            data-testid="button-hero-cta"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          {ctaSecondaryText && (
            <Button 
              variant={backgroundImage ? 'secondary' : 'outline'}
              size="lg" 
              onClick={onSecondaryClick}
              className="min-h-12"
              data-testid="button-hero-secondary"
            >
              {ctaSecondaryText}
            </Button>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

export interface TrendingProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  soldCount?: number;
}

export interface TrendingSectionProps {
  title?: string;
  subtitle?: string;
  products: TrendingProduct[];
  onProductClick?: (product: TrendingProduct) => void;
  onViewAllClick?: () => void;
  maxVisible?: number;
  className?: string;
  'data-testid'?: string;
}

export function TrendingSection({
  title = 'Trending Now',
  subtitle,
  products,
  onProductClick,
  onViewAllClick,
  maxVisible = 4,
  className = '',
  'data-testid': testId,
}: TrendingSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const visibleProducts = products.slice(0, maxVisible);

  return (
    <section 
      ref={ref}
      className={`py-12 ${className}`}
      data-testid={testId || 'trending-section'}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {onViewAllClick && (
            <Button 
              variant="ghost" 
              onClick={onViewAllClick}
              className="min-h-12"
              data-testid="button-view-all-trending"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : undefined}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="overflow-hidden cursor-pointer group"
                onClick={() => onProductClick?.(product)}
                data-testid={`trending-product-${product.id}`}
              >
                <div className="relative aspect-square bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <Badge className="absolute top-2 left-2 gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Hot
                  </Badge>
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    {product.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {product.rating}
                      </div>
                    )}
                  </div>
                  {product.soldCount && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.soldCount}+ sold
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface PersonalizedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  reason?: string;
  matchScore?: number;
}

export interface PersonalizedSectionProps {
  title?: string;
  subtitle?: string;
  products: PersonalizedProduct[];
  onProductClick?: (product: PersonalizedProduct) => void;
  userName?: string;
  className?: string;
  'data-testid'?: string;
}

export function PersonalizedSection({
  title = 'Picked for You',
  subtitle,
  products,
  onProductClick,
  userName,
  className = '',
  'data-testid': testId,
}: PersonalizedSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const displayTitle = userName ? `${title}, ${userName}` : title;

  return (
    <section 
      ref={ref}
      className={`py-12 bg-muted/30 ${className}`}
      data-testid={testId || 'personalized-section'}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {displayTitle}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.slice(0, 3).map((product, index) => (
            <motion.div
              key={product.id}
              initial={!prefersReducedMotion ? { opacity: 0, scale: 0.95 } : undefined}
              animate={isInView ? { opacity: 1, scale: 1 } : undefined}
              transition={{ delay: index * 0.15 }}
            >
              <Card 
                className="overflow-hidden cursor-pointer group relative"
                onClick={() => onProductClick?.(product)}
                data-testid={`personalized-product-${product.id}`}
              >
                <div className="relative aspect-[4/5] bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {product.matchScore && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {product.matchScore}% match
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-xl font-bold mt-1">${product.price}</p>
                  {product.reason && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{product.reason}"
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface CheckoutProgressProps {
  currentStep: number;
  steps?: string[];
  className?: string;
  'data-testid'?: string;
}

export function CheckoutProgress({
  currentStep,
  steps = ['Cart', 'Shipping', 'Payment', 'Confirm'],
  className = '',
  'data-testid': testId,
}: CheckoutProgressProps) {
  return (
    <div 
      className={`w-full ${className}`}
      data-testid={testId || 'checkout-progress'}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={steps.length}
    >
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : isCurrent 
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span 
                  className={`text-xs mt-1 font-medium ${
                    isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface QuickActionsProps {
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  onQuickView?: () => void;
  isInWishlist?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function QuickActions({
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isInWishlist = false,
  className = '',
  'data-testid': testId,
}: QuickActionsProps) {
  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      data-testid={testId || 'quick-actions'}
    >
      {onQuickView && (
        <Button
          variant="secondary"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onQuickView(); }}
          className="w-10 h-10"
          aria-label="Quick view"
          data-testid="button-quick-view"
        >
          <Eye className="w-5 h-5" />
        </Button>
      )}
      {onAddToWishlist && (
        <Button
          variant={isInWishlist ? 'default' : 'secondary'}
          size="icon"
          onClick={(e) => { e.stopPropagation(); onAddToWishlist(); }}
          className="w-10 h-10"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          data-testid="button-wishlist"
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </Button>
      )}
      {onAddToCart && (
        <Button
          onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
          className="flex-1 min-h-10"
          data-testid="button-add-cart"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Add to Cart
        </Button>
      )}
    </div>
  );
}
