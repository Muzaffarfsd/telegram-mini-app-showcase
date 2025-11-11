import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface XPNotificationProps {
  amount: number;
  message: string;
  show: boolean;
  onClose: () => void;
}

export function XPNotification({ amount, message, show, onClose }: XPNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <motion.div
            className="relative bg-gradient-to-br from-emerald-500/90 to-cyan-500/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/30"
            animate={{
              boxShadow: [
                '0 0 20px rgba(16, 185, 129, 0.3)',
                '0 0 40px rgba(16, 185, 129, 0.6)',
                '0 0 20px rgba(16, 185, 129, 0.3)'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {/* Sparkles Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    scale: 0
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                />
              ))}
            </div>

            <div className="relative flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-full bg-yellow-400/30 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-6 h-6 text-yellow-300" fill="currentColor" />
              </motion.div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl font-bold text-white"
                  >
                    +{amount} XP
                  </motion.div>
                  <Star className="w-5 h-5 text-yellow-300" fill="currentColor" />
                </div>
                <div className="text-sm text-white/90 font-medium">
                  {message}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AchievementNotificationProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  show: boolean;
  onClose: () => void;
}

export function AchievementNotification({ 
  name, 
  description, 
  icon, 
  show, 
  onClose 
}: AchievementNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <motion.div
            className="relative bg-gradient-to-br from-amber-500/90 via-orange-500/90 to-yellow-500/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/40"
            animate={{
              boxShadow: [
                '0 0 30px rgba(245, 158, 11, 0.4)',
                '0 0 60px rgba(245, 158, 11, 0.8)',
                '0 0 30px rgba(245, 158, 11, 0.4)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Confetti Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#fbbf24', '#f59e0b', '#ef4444', '#8b5cf6'][i % 4]
                  }}
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${50 + (Math.random() - 0.5) * 200}%`,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05
                  }}
                />
              ))}
            </div>

            <div className="relative text-center">
              <div className="flex justify-center mb-3">
                <motion.div
                  className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {icon}
                </motion.div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-white" fill="currentColor" />
                <h3 className="text-xl font-bold text-white">
                  Достижение разблокировано!
                </h3>
              </div>

              <h4 className="text-lg font-semibold text-white mb-1">
                {name}
              </h4>
              <p className="text-sm text-white/90">
                {description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
