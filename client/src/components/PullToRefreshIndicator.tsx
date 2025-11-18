import { motion, AnimatePresence } from '@/utils/LazyMotionProvider';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  shouldShow: boolean;
  progress: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  shouldShow,
  progress
}: PullToRefreshIndicatorProps) {
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
          style={{
            transform: `translateY(${Math.min(pullDistance * 0.5, 60)}px)`
          }}
        >
          <div className="mt-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-3 shadow-lg">
            <motion.div
              animate={{
                rotate: isRefreshing ? 360 : progress * 360
              }}
              transition={{
                duration: isRefreshing ? 1 : 0,
                repeat: isRefreshing ? Infinity : 0,
                ease: "linear"
              }}
            >
              <RefreshCw 
                className={`w-5 h-5 ${isRefreshing ? 'text-emerald-400' : 'text-white'}`}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
