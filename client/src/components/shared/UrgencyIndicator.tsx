import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Flame, 
  Users, 
  Eye, 
  TrendingUp, 
  AlertTriangle,
  Package,
  Zap,
  Timer,
  Heart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface UrgencyIndicatorProps {
  type: 'countdown' | 'stock' | 'viewers' | 'popularity' | 'flash-sale' | 'limited';
  value?: number;
  maxValue?: number;
  endTime?: Date;
  message?: string;
  variant?: 'badge' | 'inline' | 'card' | 'banner';
  animated?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function UrgencyIndicator({
  type,
  value = 0,
  maxValue = 100,
  endTime,
  message,
  variant = 'inline',
  animated = true,
  className = '',
  'data-testid': testId,
}: UrgencyIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const renderContent = () => {
    switch (type) {
      case 'countdown':
        return (
          <CountdownTimer 
            endTime={endTime || new Date(Date.now() + 3600000)} 
            message={message}
            variant={variant}
            animated={shouldAnimate}
          />
        );
      case 'stock':
        return (
          <StockIndicator 
            remaining={value} 
            total={maxValue}
            message={message}
            variant={variant}
            animated={shouldAnimate}
          />
        );
      case 'viewers':
        return (
          <ViewerCount 
            count={value}
            message={message}
            variant={variant}
            animated={shouldAnimate}
          />
        );
      case 'popularity':
        return (
          <PopularityIndicator 
            score={value}
            message={message}
            variant={variant}
            animated={shouldAnimate}
          />
        );
      case 'flash-sale':
        return (
          <FlashSaleBadge 
            endTime={endTime}
            discount={value}
            message={message}
            variant={variant}
            animated={shouldAnimate}
          />
        );
      case 'limited':
        return (
          <LimitedEditionBadge 
            remaining={value}
            message={message}
            variant={variant}
            animated={shouldAnimate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={className} data-testid={testId || 'urgency-indicator'}>
      {renderContent()}
    </div>
  );
}

interface CountdownTimerProps {
  endTime: Date;
  message?: string;
  variant: string;
  animated: boolean;
}

function CountdownTimer({ endTime, message, variant, animated }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = endTime.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (isExpired) {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        Expired
      </Badge>
    );
  }

  const timeString = `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;

  if (variant === 'badge') {
    return (
      <Badge variant="destructive" className="gap-1">
        <Clock className="w-3 h-3" />
        {timeString}
      </Badge>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div 
        className="flex items-center justify-center gap-3 p-3 bg-destructive text-destructive-foreground rounded-lg"
        animate={animated ? { scale: [1, 1.02, 1] } : undefined}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Flame className="w-5 h-5" />
        <span className="font-medium">{message || 'Sale ends in'}</span>
        <div className="flex items-center gap-1 font-mono font-bold text-lg">
          <span className="bg-black/20 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span>:</span>
          <span className="bg-black/20 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span>:</span>
          <span className="bg-black/20 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-destructive">
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">{message || 'Ends in'}</span>
      <span className="font-mono font-bold">{timeString}</span>
    </div>
  );
}

interface StockIndicatorProps {
  remaining: number;
  total: number;
  message?: string;
  variant: string;
  animated: boolean;
}

function StockIndicator({ remaining, total, message, variant, animated }: StockIndicatorProps) {
  const percentage = (remaining / total) * 100;
  const isLow = percentage <= 20;
  const isVeryLow = percentage <= 10;

  const getStockColor = () => {
    if (isVeryLow) return 'text-destructive';
    if (isLow) return 'text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
  };

  const getProgressColor = () => {
    if (isVeryLow) return 'bg-destructive';
    if (isLow) return 'bg-amber-500';
    return 'bg-primary';
  };

  if (variant === 'badge') {
    return (
      <Badge 
        variant={isVeryLow ? 'destructive' : 'secondary'}
        className="gap-1"
      >
        <Package className="w-3 h-3" />
        {remaining} left
      </Badge>
    );
  }

  if (variant === 'card') {
    return (
      <div className="p-3 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${getStockColor()}`}>
            {message || `Only ${remaining} left`}
          </span>
          {isLow && (
            <motion.div
              animate={animated ? { scale: [1, 1.1, 1] } : undefined}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </motion.div>
          )}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getProgressColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${getStockColor()}`}>
      <Package className="w-4 h-4" />
      <span className="text-sm font-medium">
        {message || `Only ${remaining} left in stock`}
      </span>
    </div>
  );
}

interface ViewerCountProps {
  count: number;
  message?: string;
  variant: string;
  animated: boolean;
}

function ViewerCount({ count, message, variant, animated }: ViewerCountProps) {
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    if (!animated) {
      setDisplayCount(count);
      return;
    }

    const variation = Math.floor(Math.random() * 5) - 2;
    const newCount = Math.max(1, count + variation);
    
    const timer = setInterval(() => {
      const v = Math.floor(Math.random() * 5) - 2;
      setDisplayCount(Math.max(1, count + v));
    }, 3000 + Math.random() * 2000);

    setDisplayCount(newCount);
    return () => clearInterval(timer);
  }, [count, animated]);

  if (variant === 'badge') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Eye className="w-3 h-3" />
        {displayCount} viewing
      </Badge>
    );
  }

  return (
    <motion.div 
      className="flex items-center gap-2 text-muted-foreground"
      animate={animated ? { opacity: [0.7, 1, 0.7] } : undefined}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <Eye className="w-4 h-4" />
      <span className="text-sm">
        {message || `${displayCount} people are viewing this`}
      </span>
    </motion.div>
  );
}

interface PopularityIndicatorProps {
  score: number;
  message?: string;
  variant: string;
  animated: boolean;
}

function PopularityIndicator({ score, message, variant, animated }: PopularityIndicatorProps) {
  const isHot = score >= 80;
  const isTrending = score >= 50;

  if (variant === 'badge') {
    if (isHot) {
      return (
        <Badge className="gap-1 bg-orange-500 hover:bg-orange-600">
          <Flame className="w-3 h-3" />
          Hot
        </Badge>
      );
    }
    if (isTrending) {
      return (
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="w-3 h-3" />
          Trending
        </Badge>
      );
    }
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isHot ? (
        <motion.div
          animate={animated ? { scale: [1, 1.1, 1], rotate: [-5, 5, -5] } : undefined}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <Flame className="w-5 h-5 text-orange-500" />
        </motion.div>
      ) : (
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={`text-sm font-medium ${isHot ? 'text-orange-500' : ''}`}>
        {message || (isHot ? 'Hot item!' : isTrending ? 'Trending now' : 'Popular')}
      </span>
    </div>
  );
}

interface FlashSaleBadgeProps {
  endTime?: Date;
  discount: number;
  message?: string;
  variant: string;
  animated: boolean;
}

function FlashSaleBadge({ endTime, discount, message, variant, animated }: FlashSaleBadgeProps) {
  if (variant === 'badge') {
    return (
      <motion.div
        animate={animated ? { scale: [1, 1.05, 1] } : undefined}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <Badge className="gap-1 bg-gradient-to-r from-purple-500 to-pink-500">
          <Zap className="w-3 h-3" />
          Flash Sale
        </Badge>
      </motion.div>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg"
        animate={animated ? { boxShadow: ['0 0 0 rgba(168, 85, 247, 0)', '0 0 20px rgba(168, 85, 247, 0.5)', '0 0 0 rgba(168, 85, 247, 0)'] } : undefined}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6" />
          <div>
            <p className="font-bold text-lg">{message || 'Flash Sale!'}</p>
            <p className="text-sm opacity-90">Up to {discount}% off</p>
          </div>
        </div>
        {endTime && (
          <CountdownTimer endTime={endTime} variant="inline" animated={animated} />
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
      <Zap className="w-4 h-4" />
      <span className="text-sm font-bold">{message || `Flash Sale: ${discount}% off`}</span>
    </div>
  );
}

interface LimitedEditionBadgeProps {
  remaining: number;
  message?: string;
  variant: string;
  animated: boolean;
}

function LimitedEditionBadge({ remaining, message, variant, animated }: LimitedEditionBadgeProps) {
  if (variant === 'badge') {
    return (
      <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600 dark:text-amber-400">
        <Timer className="w-3 h-3" />
        Limited Edition
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
      <Timer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
          Limited Edition
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {message || `Only ${remaining} ever made`}
        </p>
      </div>
    </div>
  );
}

export interface SocialProofProps {
  recentPurchases?: number;
  recentViews?: number;
  wishlistCount?: number;
  className?: string;
  'data-testid'?: string;
}

export function SocialProof({
  recentPurchases = 0,
  recentViews = 0,
  wishlistCount = 0,
  className = '',
  'data-testid': testId,
}: SocialProofProps) {
  return (
    <div 
      className={`flex flex-wrap gap-4 text-sm text-muted-foreground ${className}`}
      data-testid={testId || 'social-proof'}
    >
      {recentPurchases > 0 && (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{recentPurchases} bought recently</span>
        </div>
      )}
      {recentViews > 0 && (
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{recentViews} viewing now</span>
        </div>
      )}
      {wishlistCount > 0 && (
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>{wishlistCount} in wishlists</span>
        </div>
      )}
    </div>
  );
}
