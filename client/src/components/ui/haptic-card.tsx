import { m as motion } from '@/utils/LazyMotionProvider';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface HapticCardProps {
  hapticStyle?: 'light' | 'medium' | 'heavy';
  pressScale?: number;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  'data-testid'?: string;
}

/**
 * HapticCard - Интерактивная карточка с тактильной отдачей
 * 
 * Особенности:
 * - Вибрация при нажатии
 * - Плавная анимация scale при нажатии
 * - Настраиваемая сила вибрации
 * - Настраиваемый scale эффект
 * 
 * Пример использования:
 * ```tsx
 * <HapticCard 
 *   hapticStyle="light"
 *   pressScale={0.98}
 *   onClick={() => navigate('/demo')}
 *   className="p-6 bg-white/10 rounded-2xl"
 * >
 *   <h3>Демо приложение</h3>
 *   <p>Описание...</p>
 * </HapticCard>
 * ```
 */
export const HapticCard = ({
  hapticStyle = 'light',
  pressScale = 0.98,
  onClick,
  className,
  children,
  ...props
}: HapticCardProps) => {
  const haptic = useHaptic();

  const handlePress = (e: React.MouseEvent<HTMLDivElement>) => {
    // Вызов тактильной вибрации
    if (hapticStyle === 'light') haptic.light();
    else if (hapticStyle === 'medium') haptic.medium();
    else if (hapticStyle === 'heavy') haptic.heavy();
    
    onClick?.(e);
  };

  return (
    <motion.div
      whileTap={{ scale: pressScale }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      onClick={handlePress}
      data-testid={props['data-testid']}
      className={cn(
        'cursor-pointer touch-action-manipulation',
        'user-select-none -webkit-user-select-none',
        '-webkit-tap-highlight-color-transparent',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

/**
 * HapticIconButton - Круглая кнопка с иконкой и тактильной отдачей
 */
interface HapticIconButtonProps {
  hapticStyle?: 'light' | 'medium' | 'heavy';
  icon: ReactNode;
  variant?: 'default' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
  'aria-label'?: string;
}

export const HapticIconButton = ({
  hapticStyle = 'light',
  icon,
  variant = 'default',
  size = 'md',
  onClick,
  className,
  disabled,
  ...props
}: HapticIconButtonProps) => {
  const haptic = useHaptic();

  const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    // Вызов тактильной вибрации
    if (hapticStyle === 'light') haptic.light();
    else if (hapticStyle === 'medium') haptic.medium();
    else if (hapticStyle === 'heavy') haptic.heavy();
    
    onClick?.(e);
  };

  const variantStyles = {
    default: 'bg-white/10 backdrop-blur-md border border-white/20',
    ghost: 'bg-transparent hover:bg-white/10',
    glass: 'bg-white/20 backdrop-blur-xl border border-white/30'
  };

  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      onClick={handlePress}
      disabled={disabled}
      data-testid={props['data-testid']}
      aria-label={props['aria-label']}
      className={cn(
        'rounded-full flex items-center justify-center',
        'text-white shadow-lg',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'touch-action-manipulation user-select-none',
        '-webkit-tap-highlight-color-transparent',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon}
    </motion.button>
  );
};
