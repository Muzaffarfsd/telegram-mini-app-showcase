import { forwardRef, ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Link } from 'wouter';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type BaseProps = {
  children: ReactNode;
  minSize?: number;
  className?: string;
  activeScale?: number;
  'data-testid'?: string;
};

type OmittedButtonProps = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart';

type ButtonProps = BaseProps & {
  as?: 'button';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps | OmittedButtonProps>;

type AnchorProps = BaseProps & {
  as: 'a';
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | 'href' | OmittedButtonProps>;

type LinkProps = BaseProps & {
  as: 'link';
  href: string;
};

type DivProps = BaseProps & {
  as: 'div';
  onClick?: () => void;
};

export type MobileTapTargetProps = ButtonProps | AnchorProps | LinkProps | DivProps;

export const MobileTapTarget = forwardRef<
  HTMLButtonElement | HTMLAnchorElement | HTMLDivElement,
  MobileTapTargetProps
>(({ 
  children, 
  minSize = 48, 
  className = '',
  activeScale = 0.97,
  'data-testid': testId,
  as = 'button',
  ...props 
}, ref) => {
  const prefersReducedMotion = useReducedMotion();

  const motionProps: MotionProps = prefersReducedMotion
    ? {}
    : {
        whileTap: { scale: activeScale },
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      };

  const baseClassName = `inline-flex items-center justify-center touch-manipulation ${className}`;
  const style = { minWidth: minSize, minHeight: minSize };

  if (as === 'a') {
    const { href, ...anchorProps } = props as AnchorProps;
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={baseClassName}
        style={style}
        data-testid={testId}
        {...motionProps}
        {...anchorProps}
      >
        {children}
      </motion.a>
    );
  }

  if (as === 'link') {
    const { href } = props as LinkProps;
    return (
      <Link href={href}>
        <motion.a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={baseClassName}
          style={style}
          data-testid={testId}
          {...motionProps}
        >
          {children}
        </motion.a>
      </Link>
    );
  }

  if (as === 'div') {
    const { onClick, ...divProps } = props as DivProps;
    return (
      <motion.div
        ref={ref as React.Ref<HTMLDivElement>}
        className={`${baseClassName} cursor-pointer`}
        style={style}
        onClick={onClick}
        data-testid={testId}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        {...motionProps}
        {...divProps}
      >
        {children}
      </motion.div>
    );
  }

  const buttonProps = props as ButtonProps;
  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={baseClassName}
      style={style}
      data-testid={testId}
      {...motionProps}
      {...buttonProps}
    >
      {children}
    </motion.button>
  );
});

MobileTapTarget.displayName = 'MobileTapTarget';

export interface IconTapTargetProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  as?: 'button' | 'a' | 'link';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function IconTapTarget({
  icon,
  label,
  onClick,
  href,
  as = 'button',
  size = 'md',
  variant = 'ghost',
  disabled = false,
  className = '',
  'data-testid': testId,
}: IconTapTargetProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizes = {
    sm: { minSize: 40, iconSize: 'w-4 h-4' },
    md: { minSize: 48, iconSize: 'w-5 h-5' },
    lg: { minSize: 56, iconSize: 'w-6 h-6' },
  };

  const variants = {
    ghost: 'bg-transparent hover:bg-muted',
    outline: 'bg-transparent border border-border hover:bg-muted',
    solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
  };

  const { minSize } = sizes[size];

  const motionProps: MotionProps = prefersReducedMotion || disabled
    ? {}
    : {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      };

  const baseClassName = `inline-flex items-center justify-center rounded-full transition-colors ${variants[variant]} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  } ${className}`;

  const style = { minWidth: minSize, minHeight: minSize, width: minSize, height: minSize };

  const content = (
    <span className={sizes[size].iconSize}>
      {icon}
    </span>
  );

  if (as === 'link' && href) {
    return (
      <Link href={href}>
        <motion.a
          className={baseClassName}
          style={style}
          aria-label={label}
          data-testid={testId}
          {...motionProps}
        >
          {content}
        </motion.a>
      </Link>
    );
  }

  if (as === 'a' && href) {
    return (
      <motion.a
        href={href}
        className={baseClassName}
        style={style}
        aria-label={label}
        data-testid={testId}
        {...motionProps}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={baseClassName}
      style={style}
      aria-label={label}
      data-testid={testId}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}

export interface TapTargetGroupProps {
  children: ReactNode;
  gap?: 'sm' | 'md' | 'lg';
  direction?: 'row' | 'column';
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function TapTargetGroup({
  children,
  gap = 'md',
  direction = 'row',
  wrap = true,
  justify = 'start',
  align = 'center',
  className = '',
}: TapTargetGroupProps) {
  const gaps = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-4',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
  };

  return (
    <div
      className={`flex ${direction === 'column' ? 'flex-col' : 'flex-row'} ${
        wrap ? 'flex-wrap' : ''
      } ${gaps[gap]} ${justifyClasses[justify]} ${alignClasses[align]} ${className}`}
    >
      {children}
    </div>
  );
}

export const TAP_TARGET_SIZE = {
  minimum: 44,
  recommended: 48,
  comfortable: 56,
  large: 64,
} as const;

export function ensureMinTapTarget(size: number): number {
  return Math.max(size, TAP_TARGET_SIZE.minimum);
}

export function getTapTargetPadding(contentSize: number, targetSize = TAP_TARGET_SIZE.recommended): number {
  const padding = (targetSize - contentSize) / 2;
  return Math.max(0, padding);
}
