import { motion, useSpring, useTransform } from '@/utils/LazyMotionProvider';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function AnimatedProgress({
  value,
  max = 100,
  className = '',
  showPercentage = false,
  color = 'emerald',
  size = 'md',
  animated = true
}: AnimatedProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const width = useTransform(spring, [0, 100], ['0%', '100%']);

  useEffect(() => {
    if (animated) {
      spring.set(percentage);
    }
  }, [percentage, spring, animated]);

  const getColorClasses = () => {
    switch (color) {
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
      case 'cyan':
        return 'bg-gradient-to-r from-cyan-500 to-cyan-600';
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 to-amber-600';
      case 'rose':
        return 'bg-gradient-to-r from-rose-500 to-rose-600';
      case 'purple':
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'md':
        return 'h-2.5';
      case 'lg':
        return 'h-4';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'w-full rounded-full overflow-hidden bg-white/10',
        getSizeClasses()
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full relative overflow-hidden',
            getColorClasses()
          )}
          style={{ width: animated ? width : `${percentage}%` }}
          data-testid="progress-bar"
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'linear'
            }}
          />
        </motion.div>
      </div>

      {showPercentage && (
        <motion.div
          className="absolute -top-6 right-0 text-xs font-bold text-white"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'purple';
  showPercentage?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'emerald',
  showPercentage = true,
  className = ''
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const spring = useSpring(circumference, {
    stiffness: 100,
    damping: 30
  });

  useEffect(() => {
    spring.set(offset);
  }, [offset, spring]);

  const getColorClass = () => {
    switch (color) {
      case 'emerald':
        return 'text-emerald-500';
      case 'cyan':
        return 'text-cyan-500';
      case 'amber':
        return 'text-amber-500';
      case 'rose':
        return 'text-rose-500';
      case 'purple':
        return 'text-purple-500';
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={spring}
          className={getColorClass()}
        />
      </svg>

      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-2xl font-bold text-white">
              {Math.round(percentage)}
            </div>
            <div className="text-xs text-white/60">%</div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  className?: string;
}

export function LevelProgress({
  currentLevel,
  currentXP,
  xpToNextLevel,
  className = ''
}: LevelProgressProps) {
  const percentage = (currentXP / xpToNextLevel) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center font-bold text-white text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentLevel}
          </motion.div>
          <div>
            <div className="text-sm font-bold text-white">
              Уровень {currentLevel}
            </div>
            <div className="text-xs text-white/60">
              {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </div>
          </div>
        </div>

        <motion.div
          className="w-12 h-12 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {currentLevel + 1}
        </motion.div>
      </div>

      <AnimatedProgress
        value={currentXP}
        max={xpToNextLevel}
        showPercentage
        size="lg"
      />
    </div>
  );
}
