import { motion } from '@/utils/LazyMotionProvider';
import { Calendar, Gift, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DailyReward {
  day: number;
  reward: string;
  xp: number;
  claimed: boolean;
  available: boolean;
  special?: boolean;
}

interface DailyRewardsProps {
  className?: string;
}

export function DailyRewards({ className = '' }: DailyRewardsProps) {
  const [rewards, setRewards] = useState<DailyReward[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('daily_rewards');
    const lastClaim = localStorage.getItem('daily_rewards_last_claim');
    const today = new Date().toISOString().split('T')[0];

    if (stored && lastClaim === today) {
      setRewards(JSON.parse(stored));
      const claimed = JSON.parse(stored);
      setCurrentDay(claimed.filter((r: DailyReward) => r.claimed).length + 1);
    } else {
      // Initialize rewards
      const newRewards: DailyReward[] = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        reward: getRewardForDay(i + 1),
        xp: getXPForDay(i + 1),
        claimed: false,
        available: i === 0,
        special: [7, 14, 21, 30].includes(i + 1),
      }));
      setRewards(newRewards);
      setCurrentDay(1);
    }
  }, []);

  const getRewardForDay = (day: number): string => {
    if (day === 7) return '1000 монет + 5% скидка';
    if (day === 14) return '2000 монет + 10% скидка';
    if (day === 21) return '3000 монет + 15% скидка';
    if (day === 30) return '5000 монет + VIP статус';
    if (day % 5 === 0) return `${day * 50} монет`;
    return `${day * 20} монет`;
  };

  const getXPForDay = (day: number): number => {
    if (day === 30) return 1000;
    if (day === 21) return 500;
    if (day === 14) return 300;
    if (day === 7) return 200;
    return 50 + day * 10;
  };

  const claimReward = (day: number) => {
    if (day !== currentDay) return;

    const updated = rewards.map(r =>
      r.day === day
        ? { ...r, claimed: true, available: false }
        : r.day === day + 1
        ? { ...r, available: true }
        : r
    );

    setRewards(updated);
    setCurrentDay(day + 1);
    setShowClaimAnimation(true);

    // Save to localStorage
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('daily_rewards', JSON.stringify(updated));
    localStorage.setItem('daily_rewards_last_claim', today);

    setTimeout(() => setShowClaimAnimation(false), 2000);
  };

  return (
    <div className={cn('space-y-6', className)} data-testid="daily-rewards">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 mb-3"
        >
          <Calendar className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">
            Ежедневные награды
          </h2>
        </motion.div>
        <p className="text-white/60 text-sm">
          Заходите каждый день и получайте награды
        </p>
        <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-300">
            День {currentDay} из 30
          </span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-5 gap-3">
        {rewards.map((reward, index) => (
          <motion.div
            key={reward.day}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className={cn(
              'relative aspect-square rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer',
              reward.claimed
                ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                : reward.available
                ? 'bg-white/10 border-2 border-emerald-500 hover:bg-white/15 hover:scale-105 active:scale-95'
                : 'bg-white/5 border border-white/10 opacity-60',
              reward.special && !reward.claimed && 'ring-2 ring-amber-500/50'
            )}
            onClick={() => reward.available && claimReward(reward.day)}
            whileHover={reward.available ? { scale: 1.05 } : {}}
            whileTap={reward.available ? { scale: 0.95 } : {}}
            data-testid={`reward-day-${reward.day}`}
          >
            {/* Special Badge */}
            {reward.special && !reward.claimed && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Status Icon */}
            <div className="mb-1">
              {reward.claimed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : reward.available ? (
                <Gift className="w-6 h-6 text-emerald-400 animate-bounce" />
              ) : (
                <Lock className="w-6 h-6 text-white/40" />
              )}
            </div>

            {/* Day Number */}
            <div className={cn(
              'text-lg font-bold',
              reward.claimed
                ? 'text-emerald-300'
                : reward.available
                ? 'text-white'
                : 'text-white/40'
            )}>
              {reward.day}
            </div>

            {/* XP Badge */}
            <div className={cn(
              'mt-1 text-xs font-semibold',
              reward.special ? 'text-amber-400' : 'text-white/60'
            )}>
              +{reward.xp} XP
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current Reward Details */}
      {rewards.find(r => r.available) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-medium rounded-2xl p-6 border border-emerald-500/30"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                Награда дня {currentDay}
              </h3>
              <p className="text-white/70 text-sm mb-3">
                {rewards.find(r => r.available)?.reward}
              </p>
              <button
                onClick={() => {
                  const available = rewards.find(r => r.available);
                  if (available) claimReward(available.day);
                }}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 active:scale-95"
                data-testid="button-claim-reward"
              >
                Получить награду
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Claim Animation */}
      {showClaimAnimation && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="glass-strong rounded-3xl p-8 text-center animate-success-scale">
            <div className="w-20 h-20 rounded-full bg-emerald-500 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Награда получена!
            </h3>
            <p className="text-white/70">
              +{rewards.find(r => r.day === currentDay - 1)?.xp} XP
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface RewardStreakProps {
  currentStreak: number;
  bestStreak: number;
  className?: string;
}

export function RewardStreak({
  currentStreak,
  bestStreak,
  className = ''
}: RewardStreakProps) {
  return (
    <div className={cn('flex items-center gap-6 justify-center', className)}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Текущий стрик
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-white">{currentStreak}</span>
          <span className="text-white/60">дней</span>
        </div>
      </div>

      <div className="w-px h-12 bg-white/10" />

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Лучший стрик
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-amber-400">{bestStreak}</span>
          <span className="text-white/60">дней</span>
        </div>
      </div>
    </div>
  );
}
