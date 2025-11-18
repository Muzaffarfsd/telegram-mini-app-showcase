import { motion } from '@/utils/LazyMotionProvider';

interface LoadingProgressProps {
  progress?: number;
  label?: string;
  indeterminate?: boolean;
}

export function LoadingProgress({ 
  progress = 0, 
  label,
  indeterminate = false 
}: LoadingProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      {label && (
        <p className="text-sm text-white/70 font-medium">
          {label}
        </p>
      )}
      
      <div className="w-full max-w-xs">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          {indeterminate ? (
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{ width: '40%' }}
            />
          ) : (
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          )}
        </div>
      </div>
      
      {!indeterminate && (
        <p className="text-xs text-white/50 font-medium tabular-nums">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
}

export function LoadingSpinner({ size = 'medium', className = '' }: { size?: 'small' | 'medium' | 'large'; className?: string }) {
  const sizes = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };
  
  return (
    <div className={`inline-flex ${className}`}>
      <div className={`
        ${sizes[size]}
        border-white/20
        border-t-emerald-500
        rounded-full
        animate-spin
      `} />
    </div>
  );
}

export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-emerald-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: [0.4, 0, 0.2, 1]
          }}
        />
      ))}
    </div>
  );
}
