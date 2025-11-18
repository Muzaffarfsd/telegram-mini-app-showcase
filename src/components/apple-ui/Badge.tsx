interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'medium',
  className = ''
}: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white/90',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    error: 'bg-red-500/20 text-red-400'
  };
  
  const sizes = {
    small: 'px-2 py-1 text-xs rounded-md',
    medium: 'px-3 py-1.5 text-sm rounded-lg'
  };
  
  return (
    <span className={`
      inline-flex items-center font-medium
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
}
