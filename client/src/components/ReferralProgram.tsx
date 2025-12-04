import { motion } from '@/utils/LazyMotionProvider';
import { Copy, Check, Users, Gift, TrendingUp, Share2, X } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { BronzeMedal, SilverMedal, GoldMedal, PlatinumMedal } from '@/components/icons/GamificationIcons';
import { useTelegram } from '@/hooks/useTelegram';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingRewards: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

interface ReferralProgramProps {
  className?: string;
}

// Memoized Tier Level Component
const TierLevel = memo(({ level, isActive }: { level: any, isActive: boolean }) => {
  const getTierMedalSmall = useCallback((tier: string) => {
    switch (tier) {
      case 'Bronze':
        return <BronzeMedal className="w-10 h-10" />;
      case 'Silver':
        return <SilverMedal className="w-10 h-10" />;
      case 'Gold':
        return <GoldMedal className="w-10 h-10" />;
      case 'Platinum':
        return <PlatinumMedal className="w-10 h-10" />;
      default:
        return <BronzeMedal className="w-10 h-10" />;
    }
  }, []);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-xl transition-all',
        isActive
          ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
          : 'bg-white/5 border border-white/10'
      )}
      data-testid={`tier-${level.tier.toLowerCase()}`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {getTierMedalSmall(level.tier)}
        </motion.div>
        <div>
          <div className="text-white font-semibold">{level.tier}</div>
          <div className="text-white/60 text-xs">{level.referrals} рефералов</div>
        </div>
      </div>
      <div className="text-emerald-400 font-bold">
        {level.commission}
      </div>
    </div>
  );
});
TierLevel.displayName = 'TierLevel';

// Memoized Stats Card Component
const StatsCard = memo(({ icon: Icon, value, label, subtext, iconBg, textColor }: {
  icon: any,
  value: string | number,
  label: string,
  subtext: string,
  iconBg: string,
  textColor: string
}) => (
  <div className="glass-medium rounded-2xl p-4 border border-white/10">
    <div className="flex items-center gap-3 mb-2">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
        <Icon className={cn('w-5 h-5', textColor)} />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">
          {value}
        </div>
        <div className="text-xs text-white/60">
          {label}
        </div>
      </div>
    </div>
    <div className={cn('text-xs font-medium', textColor)}>
      {subtext}
    </div>
  </div>
));
StatsCard.displayName = 'StatsCard';

export function ReferralProgram({ className = '' }: ReferralProgramProps) {
  const { user, initData, shareApp, inviteFriend } = useTelegram();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Загрузить статистику из API
  const { data: statsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/referrals/stats', user?.id],
    queryFn: async () => {
      if (!user?.id || !initData) return null;
      const res = await fetch(`/api/referrals/stats/${user.id}`, {
        headers: { 'x-telegram-init-data': initData }
      });
      if (!res.ok) throw new Error('Failed to load stats');
      return await res.json();
    },
    enabled: !!user?.id && !!initData,
  });

  const stats: ReferralStats = statsData ? {
    referralCode: statsData.referralCode || '',
    totalReferrals: statsData.totalReferrals || 0,
    activeReferrals: statsData.activeReferrals || 0,
    totalEarnings: parseFloat(statsData.totalEarnings || '0'),
    pendingRewards: parseFloat(statsData.pendingRewards || '0'),
    tier: (statsData.tier || 'Bronze') as 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  } : {
    referralCode: '',
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingRewards: 0,
    tier: 'Bronze'
  };

  // Проверить, есть ли код в URL (Telegram start parameter)
  useEffect(() => {
    if (!statsData && user?.id) {
      const urlParams = new URLSearchParams(window.location.search);
      const startParam = urlParams.get('tgWebAppStartParam');
      if (startParam && startParam.startsWith('WEB4TG')) {
        setReferralCodeInput(startParam);
        setShowReferralInput(true);
      }
    }
  }, [statsData, user?.id]);

  // Применить реферальный код
  const applyReferralCode = useCallback(async () => {
    if (!user?.id || !referralCodeInput || !initData) return;

    try {
      const res = await fetch('/api/referrals/user/init', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData 
        },
        body: JSON.stringify({
          referred_by_code: referralCodeInput,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to apply referral code');
      }

      setShowReferralInput(false);
      refetch();
      toast({
        title: '✅ Реферальный код применен!',
        description: 'Вы получили приветственный бонус',
      });
    } catch (error) {
      console.error('Error applying referral code:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось применить код',
        variant: 'destructive',
      });
    }
  }, [user, referralCodeInput, initData, refetch, toast]);

  // Memoized handlers
  const copyReferralCode = useCallback(() => {
    if (!stats.referralCode) {
      toast({
        title: "Ошибка",
        description: "Реферальный код не найден",
        variant: "destructive",
      });
      return;
    }
    
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Код скопирован",
      description: `Ваш реферальный код: ${stats.referralCode}`,
    });
  }, [stats.referralCode, toast]);

  const shareReferralLink = useCallback(() => {
    console.log('[Referral] Share link clicked:', stats.referralCode);
    
    if (!stats.referralCode) {
      toast({
        title: "Ошибка",
        description: "Реферальный код не найден. Попробуйте обновить страницу.",
        variant: "destructive",
      });
      return;
    }
    
    const result = inviteFriend(stats.referralCode);
    
    if (result.success) {
      toast({
        title: "Приглашение отправлено",
        description: `Ваш код ${stats.referralCode} добавлен в ссылку https://t.me/w4tg_bot/w4tg`,
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось открыть Telegram. Скопируйте код вручную.",
        variant: "destructive",
      });
    }
  }, [stats.referralCode, inviteFriend, toast]);

  // Memoized tier color
  const tierColor = useMemo(() => {
    switch (stats.tier) {
      case 'Bronze':
        return 'from-amber-700 to-amber-800';
      case 'Silver':
        return 'from-gray-400 to-gray-500';
      case 'Gold':
        return 'from-amber-400 to-amber-500';
      case 'Platinum':
        return 'from-purple-500 to-purple-600';
    }
  }, [stats.tier]);

  // Memoized tier benefits
  const benefits = useMemo(() => {
    switch (stats.tier) {
      case 'Bronze':
        return { commission: 10, bonus: 100 };
      case 'Silver':
        return { commission: 15, bonus: 200 };
      case 'Gold':
        return { commission: 20, bonus: 500 };
      case 'Platinum':
        return { commission: 30, bonus: 1000 };
    }
  }, [stats.tier]);

  // Memoized tier medal
  const tierMedal = useMemo(() => {
    switch (stats.tier) {
      case 'Bronze':
        return <BronzeMedal className="w-16 h-16" />;
      case 'Silver':
        return <SilverMedal className="w-16 h-16" />;
      case 'Gold':
        return <GoldMedal className="w-16 h-16" />;
      case 'Platinum':
        return <PlatinumMedal className="w-16 h-16" />;
    }
  }, [stats.tier]);

  // Memoized tier levels
  const tierLevels = useMemo(() => [
    { tier: 'Bronze', referrals: '0-9', commission: '10%', color: 'amber-700' },
    { tier: 'Silver', referrals: '10-29', commission: '15%', color: 'gray-400' },
    { tier: 'Gold', referrals: '30-99', commission: '20%', color: 'amber-400' },
    { tier: 'Platinum', referrals: '100+', commission: '30%', color: 'purple-500' },
  ], []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pb-24 flex items-center justify-center" style={{ paddingTop: '140px' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white/60">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24" style={{ paddingTop: '140px' }}>
      <div className={cn('max-w-md mx-auto px-4 py-6 space-y-6', className)} data-testid="referral-program">
        {/* Header */}
        <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 mb-3"
        >
          <Users className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">
            Реферальная программа
          </h2>
        </motion.div>
        <p className="text-white/60 text-sm">
          Приглашайте друзей и зарабатывайте вместе
        </p>
      </div>

      {/* Tier Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'glass-medium rounded-2xl p-6 border border-white/20 bg-gradient-to-br',
          tierColor
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              {tierMedal}
            </motion.div>
            <div>
              <div className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
                Ваш уровень
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.tier}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
              Комиссия
            </div>
            <div className="text-2xl font-bold text-white">
              {benefits.commission}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="glass-subtle rounded-xl p-3 text-center">
            <div className="text-white/70 text-xs mb-1">Вы получаете</div>
            <div className="text-white font-bold">100 🪙</div>
          </div>
          <div className="glass-subtle rounded-xl p-3 text-center">
            <div className="text-white/70 text-xs mb-1">Друг получает</div>
            <div className="text-white font-bold">50 🪙</div>
          </div>
        </div>
      </motion.div>

      {/* Referral Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-medium rounded-2xl p-6 border border-emerald-500/30"
      >
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-1">
            Ваш реферальный код
          </h3>
          <p className="text-sm text-white/60">
            Поделитесь кодом с друзьями
          </p>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 glass-subtle rounded-xl px-4 py-4 text-center">
            <div className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">
              {stats.referralCode}
            </div>
          </div>
          <button
            onClick={copyReferralCode}
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95',
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/15'
            )}
            data-testid="button-copy-code"
          >
            {copied ? (
              <Check className="w-6 h-6" />
            ) : (
              <Copy className="w-6 h-6" />
            )}
          </button>
        </div>

        <button
          onClick={shareReferralLink}
          className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          data-testid="button-share-link"
        >
          <Share2 className="w-5 h-5" />
          Поделиться ссылкой
        </button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatsCard
          icon={Users}
          value={stats.totalReferrals}
          label="Всего рефералов"
          subtext={`${stats.activeReferrals} активных`}
          iconBg="bg-emerald-500/20"
          textColor="text-emerald-400"
        />
        <StatsCard
          icon={Gift}
          value={`${stats.totalEarnings.toLocaleString()} 🪙`}
          label="Всего заработано"
          subtext={`От ${stats.totalReferrals} рефералов`}
          iconBg="bg-amber-500/20"
          textColor="text-amber-400"
        />
      </motion.div>

      {/* How it Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-subtle rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Как это работает
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold text-sm">
              1
            </div>
            <div>
              <div className="text-white font-semibold mb-1">
                Поделитесь кодом
              </div>
              <div className="text-white/60 text-sm">
                Отправьте друзьям ваш уникальный реферальный код
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold text-sm">
              2
            </div>
            <div>
              <div className="text-white font-semibold mb-1">
                Друг регистрируется
              </div>
              <div className="text-white/60 text-sm">
                Ваш друг вводит код при регистрации и получает 50 🪙
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold text-sm">
              3
            </div>
            <div>
              <div className="text-white font-semibold mb-1">
                Получайте вознаграждения
              </div>
              <div className="text-white/60 text-sm">
                Вы получаете 100 🪙 за каждого друга
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tier Levels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-subtle rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">
          Уровни партнёра
        </h3>
        
        <div className="space-y-3">
          {tierLevels.map((level) => (
            <TierLevel
              key={level.tier}
              level={level}
              isActive={stats.tier === level.tier}
            />
          ))}
        </div>
      </motion.div>

      {/* Кнопка для ввода реферального кода (для пользователей без кода) */}
      {!statsData?.referredByCode && stats.totalReferrals === 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => setShowReferralInput(true)}
          className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 active:scale-95"
          data-testid="button-enter-code"
        >
          Есть реферальный код?
        </motion.button>
      )}
    </div>

    {/* Модальное окно для ввода реферального кода */}
    {showReferralInput && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-medium rounded-2xl p-6 border border-white/20 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">
              Введите реферальный код
            </h3>
            <button
              onClick={() => setShowReferralInput(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              data-testid="button-close-modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <p className="text-white/60 text-sm mb-4">
            Если у вас есть реферальный код от друга, введите его ниже, чтобы получить приветственный бонус!
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
              placeholder="WEB4TG..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 font-mono text-lg tracking-wider"
              data-testid="input-referral-code"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowReferralInput(false)}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300"
                data-testid="button-skip"
              >
                Пропустить
              </button>
              <button
                onClick={applyReferralCode}
                disabled={!referralCodeInput}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-apply-code"
              >
                Применить
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </div>
  );
}
