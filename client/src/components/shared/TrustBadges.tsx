import { motion } from 'framer-motion';
import { 
  Shield, 
  Truck, 
  RefreshCw, 
  CreditCard, 
  Award, 
  Lock, 
  Star,
  CheckCircle,
  Clock,
  Headphones,
  Zap,
  LucideIcon
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface TrustBadge {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  highlight?: boolean;
}

export const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  {
    id: 'secure',
    icon: Lock,
    title: 'Secure Checkout',
    subtitle: '256-bit SSL encryption',
  },
  {
    id: 'shipping',
    icon: Truck,
    title: 'Free Shipping',
    subtitle: 'On orders over $50',
  },
  {
    id: 'returns',
    icon: RefreshCw,
    title: 'Easy Returns',
    subtitle: '30-day money back',
  },
  {
    id: 'support',
    icon: Headphones,
    title: '24/7 Support',
    subtitle: 'Always here to help',
  },
];

export const PREMIUM_TRUST_BADGES: TrustBadge[] = [
  {
    id: 'authentic',
    icon: Award,
    title: '100% Authentic',
    subtitle: 'Guaranteed genuine',
    highlight: true,
  },
  {
    id: 'secure',
    icon: Shield,
    title: 'Buyer Protection',
    subtitle: 'Full coverage',
  },
  {
    id: 'fast',
    icon: Zap,
    title: 'Express Delivery',
    subtitle: '1-2 business days',
  },
  {
    id: 'quality',
    icon: Star,
    title: 'Premium Quality',
    subtitle: 'Hand-inspected',
  },
];

export interface TrustBadgesProps {
  badges?: TrustBadge[];
  variant?: 'horizontal' | 'vertical' | 'grid' | 'compact';
  showIcons?: boolean;
  showSubtitles?: boolean;
  animated?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function TrustBadges({
  badges = DEFAULT_TRUST_BADGES,
  variant = 'horizontal',
  showIcons = true,
  showSubtitles = true,
  animated = true,
  className = '',
  'data-testid': testId,
}: TrustBadgesProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
  };

  const getContainerClasses = () => {
    switch (variant) {
      case 'vertical':
        return 'flex flex-col gap-3';
      case 'grid':
        return 'grid grid-cols-2 gap-4 sm:grid-cols-4';
      case 'compact':
        return 'flex flex-wrap items-center justify-center gap-4';
      default:
        return 'flex items-center justify-between gap-4 overflow-x-auto';
    }
  };

  const getItemClasses = () => {
    switch (variant) {
      case 'vertical':
        return 'flex items-center gap-3 p-3 rounded-lg bg-muted/50';
      case 'grid':
        return 'flex flex-col items-center text-center p-4 rounded-lg bg-muted/50';
      case 'compact':
        return 'flex items-center gap-2';
      default:
        return 'flex items-center gap-2 flex-shrink-0';
    }
  };

  return (
    <motion.div
      variants={shouldAnimate ? containerVariants : undefined}
      initial={shouldAnimate ? 'hidden' : undefined}
      animate={shouldAnimate ? 'visible' : undefined}
      className={`${getContainerClasses()} ${className}`}
      data-testid={testId || 'trust-badges'}
      role="list"
      aria-label="Trust badges"
    >
      {badges.map((badge) => {
        const Icon = badge.icon;
        
        return (
          <motion.div
            key={badge.id}
            variants={shouldAnimate ? itemVariants : undefined}
            className={`${getItemClasses()} ${badge.highlight ? 'bg-primary/10 border border-primary/20' : ''}`}
            role="listitem"
            data-testid={`badge-${badge.id}`}
          >
            {showIcons && (
              <div className={`flex-shrink-0 ${badge.highlight ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className={variant === 'grid' ? 'w-8 h-8 mb-2' : 'w-5 h-5'} />
              </div>
            )}
            
            <div className={variant === 'grid' ? '' : 'min-w-0'}>
              <p className={`font-medium text-sm ${badge.highlight ? 'text-primary' : ''}`}>
                {badge.title}
              </p>
              {showSubtitles && badge.subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {badge.subtitle}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export interface PaymentBadgesProps {
  providers?: string[];
  className?: string;
  'data-testid'?: string;
}

const PAYMENT_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  visa: { icon: CreditCard, label: 'Visa' },
  mastercard: { icon: CreditCard, label: 'Mastercard' },
  amex: { icon: CreditCard, label: 'American Express' },
  paypal: { icon: CreditCard, label: 'PayPal' },
  apple: { icon: CreditCard, label: 'Apple Pay' },
  google: { icon: CreditCard, label: 'Google Pay' },
};

export function PaymentBadges({
  providers = ['visa', 'mastercard', 'amex', 'paypal'],
  className = '',
  'data-testid': testId,
}: PaymentBadgesProps) {
  return (
    <div 
      className={`flex items-center gap-3 ${className}`}
      data-testid={testId || 'payment-badges'}
      role="list"
      aria-label="Accepted payment methods"
    >
      <Lock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
      <span className="text-xs text-muted-foreground">Secure payment:</span>
      <div className="flex items-center gap-2">
        {providers.map((provider) => {
          const config = PAYMENT_ICONS[provider];
          if (!config) return null;
          
          const Icon = config.icon;
          return (
            <div
              key={provider}
              className="p-1.5 rounded bg-muted/50"
              role="listitem"
              aria-label={config.label}
            >
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface SecurityBadgeProps {
  variant?: 'inline' | 'stacked';
  className?: string;
  'data-testid'?: string;
}

export function SecurityBadge({
  variant = 'inline',
  className = '',
  'data-testid': testId,
}: SecurityBadgeProps) {
  if (variant === 'stacked') {
    return (
      <div 
        className={`flex flex-col items-center text-center p-4 rounded-lg border bg-card ${className}`}
        data-testid={testId || 'security-badge'}
      >
        <Shield className="w-10 h-10 text-green-600 dark:text-green-400 mb-2" />
        <h3 className="font-semibold">Secure Shopping</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your data is protected with industry-standard encryption
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>SSL Encrypted</span>
          <CheckCircle className="w-3 h-3 ml-2" />
          <span>PCI Compliant</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 ${className}`}
      data-testid={testId || 'security-badge'}
    >
      <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          Secure Checkout
        </p>
        <p className="text-xs text-green-600 dark:text-green-400">
          256-bit SSL encryption
        </p>
      </div>
      <Lock className="w-4 h-4 text-green-500" />
    </div>
  );
}

export interface GuaranteeBadgeProps {
  type?: 'money-back' | 'authentic' | 'quality';
  days?: number;
  className?: string;
  'data-testid'?: string;
}

export function GuaranteeBadge({
  type = 'money-back',
  days = 30,
  className = '',
  'data-testid': testId,
}: GuaranteeBadgeProps) {
  const configs = {
    'money-back': {
      icon: RefreshCw,
      title: `${days}-Day Money Back`,
      subtitle: 'No questions asked',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    'authentic': {
      icon: Award,
      title: '100% Authentic',
      subtitle: 'Verified genuine products',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    'quality': {
      icon: Star,
      title: 'Quality Guarantee',
      subtitle: 'Premium materials only',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg ${config.bg} ${className}`}
      data-testid={testId || 'guarantee-badge'}
    >
      <Icon className={`w-8 h-8 ${config.color}`} />
      <div>
        <p className={`font-semibold ${config.color}`}>{config.title}</p>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
      </div>
    </div>
  );
}
