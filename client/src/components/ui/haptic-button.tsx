import { m as motion } from '@/utils/LazyMotionProvider';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface HapticButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  hapticStyle?: 'light' | 'medium' | 'heavy';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
}

/**
 * HapticButton - Кнопка с тактильной отдачей и анимацией сжатия
 * 
 * Особенности:
 * - Вибрация при нажатии (Telegram Haptic Feedback)
 * - Плавная анимация scale при нажатии
 * - 4 варианта дизайна (primary, secondary, ghost, destructive)
 * - 3 размера (sm, md, lg)
 * - 3 стиля вибрации (light, medium, heavy)
 * 
 * Пример использования:
 * ```tsx
 * <HapticButton 
 *   variant="primary" 
 *   size="md"
 *   hapticStyle="light"
 *   onClick={() => console.log('Clicked!')}
 * >
 *   Нажми меня
 * </HapticButton>
 * ```
 */
export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  (
    { 
      className, 
      variant = 'primary', 
      size = 'md',
      hapticStyle = 'light',
      onClick, 
      children,
      disabled,
      ...props 
    }, 
    ref
  ) => {
    const haptic = useHaptic();

    const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      
      // Вызов тактильной вибрации
      if (hapticStyle === 'light') haptic.light();
      else if (hapticStyle === 'medium') haptic.medium();
      else if (hapticStyle === 'heavy') haptic.heavy();
      
      onClick?.(e);
    };

    const baseStyles = `
      relative inline-flex items-center justify-center
      font-medium transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
    `;

    const variantStyles = {
      primary: `
        bg-gradient-to-r from-blue-500 to-blue-600 
        text-white shadow-lg shadow-blue-500/30
        hover:from-blue-600 hover:to-blue-700
        active:from-blue-700 active:to-blue-800
        focus-visible:ring-blue-500
      `,
      secondary: `
        bg-white/10 backdrop-blur-md border border-white/20
        text-white shadow-lg
        hover:bg-white/20
        active:bg-white/30
        focus-visible:ring-white
      `,
      ghost: `
        bg-transparent text-white
        hover:bg-white/10
        active:bg-white/20
        focus-visible:ring-white
      `,
      destructive: `
        bg-gradient-to-r from-red-500 to-red-600
        text-white shadow-lg shadow-red-500/30
        hover:from-red-600 hover:to-red-700
        active:from-red-700 active:to-red-800
        focus-visible:ring-red-500
      `
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-lg min-h-8',
      md: 'px-6 py-3 text-base rounded-xl min-h-10',
      lg: 'px-8 py-4 text-lg rounded-2xl min-h-12'
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        onClick={handlePress}
        disabled={disabled}
        type={props.type || 'button'}
        data-testid={props['data-testid']}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
      >
        {children}
      </motion.button>
    );
  }
);

HapticButton.displayName = 'HapticButton';
