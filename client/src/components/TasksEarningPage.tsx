import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Coins, CheckCircle, Heart, Share2, Eye, Users, MessageCircle, ArrowLeft, Sparkles, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';

interface Task {
  id: string;
  platform: 'tiktok' | 'instagram';
  type: 'like' | 'follow' | 'share' | 'view' | 'comment';
  title: string;
  description: string;
  coins: number;
  url: string;
  completed: boolean;
  verificationStatus?: 'pending' | 'verifying' | 'verified' | 'failed';
  attempts?: number;
  minimumTime?: number;
}

interface UserBalance {
  totalCoins: number;
  availableCoins: number;
  tasksCompleted: number;
  currentStreak: number;
}

const discountTiers = [
  { coins: 500, discount: 5, label: '5% скидка' },
  { coins: 1000, discount: 10, label: '10% скидка' },
  { coins: 2000, discount: 15, label: '15% скидка' },
  { coins: 3500, discount: 20, label: '20% скидка' },
  { coins: 5000, discount: 25, label: '25% скидка' }
];

// Расширенный список заданий - 20 штук
const allTasks: Task[] = [
  // TikTok задания
  {
    id: 'tiktok_follow',
    platform: 'tiktok',
    type: 'follow',
    title: 'Подписка на TikTok',
    description: 'Подпишитесь на наш TikTok аккаунт',
    coins: 150,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 5
  },
  {
    id: 'tiktok_like_1',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк видео о МиниАппах',
    description: 'Поставьте лайк нашему видео про создание Telegram приложений',
    coins: 50,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 8
  },
  {
    id: 'tiktok_like_2',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк видео про AI',
    description: 'Лайкните видео о возможностях искусственного интеллекта',
    coins: 50,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 8
  },
  {
    id: 'tiktok_like_3',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк туториала',
    description: 'Поставьте лайк обучающему видео по созданию ботов',
    coins: 50,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 8
  },
  {
    id: 'tiktok_share_1',
    platform: 'tiktok',
    type: 'share',
    title: 'Репост в TikTok',
    description: 'Поделитесь нашим видео о заработке с ТГ ботами',
    coins: 100,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 10
  },
  {
    id: 'tiktok_comment_1',
    platform: 'tiktok',
    type: 'comment',
    title: 'Комментарий в TikTok',
    description: 'Оставьте комментарий под любым нашим видео',
    coins: 75,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 15
  },
  {
    id: 'tiktok_comment_2',
    platform: 'tiktok',
    type: 'comment',
    title: 'Второй комментарий TikTok',
    description: 'Прокомментируйте еще одно наше видео',
    coins: 75,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 15
  },
  {
    id: 'tiktok_view_1',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр TikTok',
    description: 'Досмотрите до конца видео про разработку',
    coins: 30,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 10
  },
  {
    id: 'tiktok_view_2',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр лайфхаков',
    description: 'Посмотрите видео с лайфхаками по Telegram',
    coins: 30,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 10
  },
  {
    id: 'tiktok_view_3',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр кейсов',
    description: 'Изучите наши успешные кейсы в видео',
    coins: 30,
    url: 'https://tiktok.com/@web4tg',
    completed: false,
    minimumTime: 10
  },
  
  // Instagram задания
  {
    id: 'instagram_follow',
    platform: 'instagram',
    type: 'follow',
    title: 'Подписка на Instagram',
    description: 'Подпишитесь на наш Instagram аккаунт',
    coins: 120,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 4
  },
  {
    id: 'instagram_like_1',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк поста в Instagram',
    description: 'Лайкните наш пост про новые функции',
    coins: 40,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 6
  },
  {
    id: 'instagram_like_2',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк Reels',
    description: 'Поставьте лайк нашему Reels',
    coins: 40,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 6
  },
  {
    id: 'instagram_like_3',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк фото проекта',
    description: 'Лайкните фото одного из наших проектов',
    coins: 40,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 6
  },
  {
    id: 'instagram_share_1',
    platform: 'instagram',
    type: 'share',
    title: 'Stories репост',
    description: 'Поделитесь нашим постом в своих Stories',
    coins: 80,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 8
  },
  {
    id: 'instagram_comment_1',
    platform: 'instagram',
    type: 'comment',
    title: 'Комментарий в Instagram',
    description: 'Прокомментируйте наш пост',
    coins: 60,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 12
  },
  {
    id: 'instagram_comment_2',
    platform: 'instagram',
    type: 'comment',
    title: 'Второй комментарий',
    description: 'Оставьте комментарий под другим постом',
    coins: 60,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 12
  },
  {
    id: 'instagram_view_1',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр Instagram Reels',
    description: 'Посмотрите наш Reels о МиниАппах',
    coins: 25,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 8
  },
  {
    id: 'instagram_view_2',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр портфолио',
    description: 'Посмотрите нашу галерею работ в Stories',
    coins: 25,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 8
  },
  {
    id: 'instagram_view_3',
    platform: 'instagram',
    type: 'view',
    title: 'Просмотр обзора',
    description: 'Изучите обзор наших услуг в Reels',
    coins: 25,
    url: 'https://instagram.com/web4tg',
    completed: false,
    minimumTime: 8
  }
];

interface TasksEarningPageProps {
  onNavigate: (section: string) => void;
}

// Минималистичная Task Card с черным жидким стеклом
const MinimalTaskCard = memo(({ task, onTaskClick, isVerifying }: { 
  task: Task, 
  onTaskClick: (task: Task) => void,
  isVerifying: boolean 
}) => {
  const getTaskIcon = () => {
    switch (task.type) {
      case 'like': return <Heart className="w-4 h-4" />;
      case 'follow': return <Users className="w-4 h-4" />;
      case 'share': return <Share2 className="w-4 h-4" />;
      case 'view': return <Eye className="w-4 h-4" />;
      case 'comment': return <MessageCircle className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative rounded-xl p-4 cursor-pointer transition-all duration-300',
        'backdrop-blur-xl border',
        task.completed
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-black/60'
      )}
      onClick={() => !task.completed && !isVerifying && onTaskClick(task)}
      data-testid={`task-${task.id}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
            task.platform === 'tiktok' 
              ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400'
              : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400'
          )}>
            {getTaskIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm mb-0.5 truncate">{task.title}</h3>
            <p className="text-white/50 text-xs truncate">{task.description}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 font-bold text-sm">+{task.coins}</span>
          </div>
          
          {task.completed ? (
            <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
              <CheckCircle className="w-2.5 h-2.5 mr-1" />
              Готово
            </Badge>
          ) : task.verificationStatus === 'failed' ? (
            <Badge variant="outline" className="text-[10px] h-5 bg-red-500/20 text-red-400 border-red-500/50">
              Ошибка
            </Badge>
          ) : isVerifying ? (
            <Badge variant="outline" className="text-[10px] h-5 bg-blue-500/20 text-blue-400 border-blue-500/50">
              Проверка...
            </Badge>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
});
MinimalTaskCard.displayName = 'MinimalTaskCard';

// Анимированный прогресс-бар
const AnimatedProgressBar = memo(({ value, max, label }: { value: number, max: number, label: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="text-emerald-400 font-semibold">{value} / {max}</span>
      </div>
      
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
});
AnimatedProgressBar.displayName = 'AnimatedProgressBar';

export function TasksEarningPage({ onNavigate }: TasksEarningPageProps) {
  const { user, initData, hapticFeedback } = useTelegram();
  const [balance, setBalance] = useState<UserBalance>({
    totalCoins: 0,
    availableCoins: 0,
    tasksCompleted: 0,
    currentStreak: 0
  });
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [loading, setLoading] = useState(true);
  const [verifyingTask, setVerifyingTask] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id || !initData) {
        setLoading(false);
        return;
      }

      try {
        const balanceRes = await fetch('/api/tasks/balance', {
          headers: { 'X-Telegram-Init-Data': initData }
        });
        const balanceData = await balanceRes.json();
        setBalance({
          totalCoins: balanceData.totalCoins || 0,
          availableCoins: balanceData.availableCoins || 0,
          tasksCompleted: balanceData.tasksCompleted || 0,
          currentStreak: balanceData.currentStreak || 0
        });

        const progressRes = await fetch('/api/tasks/progress', {
          headers: { 'X-Telegram-Init-Data': initData }
        });
        const progressData = await progressRes.json();

        setTasks(prev => prev.map(task => {
          const progress = progressData.find((p: any) => p.taskId === task.id);
          if (progress) {
            return {
              ...task,
              completed: progress.completed,
              verificationStatus: progress.verificationStatus,
              attempts: progress.attempts
            };
          }
          return task;
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id, initData]);

  const handleTaskClick = async (task: Task) => {
    if (!user?.id || !initData || task.completed || task.verificationStatus === 'failed') {
      hapticFeedback.heavy();
      return;
    }

    hapticFeedback.light();
    
    try {
      const startRes = await fetch('/api/tasks/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData
        },
        body: JSON.stringify({
          task_id: task.id,
          platform: task.platform,
          task_type: task.type,
          coins_reward: task.coins
        })
      });

      if (!startRes.ok) {
        const error = await startRes.json();
        console.error('Error starting task:', error);
        if (startRes.status === 429) {
          hapticFeedback.heavy();
          alert(`Подождите ${error.retry_after} секунд.`);
        }
        return;
      }

      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, verificationStatus: 'verifying' } : t
      ));

      window.open(task.url, '_blank');

      const minimumTime = task.minimumTime || 5;
      setVerifyingTask(task.id);

      setTimeout(async () => {
        try {
          const verifyRes = await fetch('/api/tasks/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Telegram-Init-Data': initData
            },
            body: JSON.stringify({ task_id: task.id })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.verified) {
            hapticFeedback.selection();
            
            setTasks(prev => prev.map(t =>
              t.id === task.id ? { ...t, completed: true, verificationStatus: 'verified' } : t
            ));

            setBalance(prev => ({
              ...prev,
              totalCoins: verifyData.new_balance,
              availableCoins: verifyData.new_balance,
              tasksCompleted: prev.tasksCompleted + 1
            }));
          } else {
            hapticFeedback.heavy();
            setTasks(prev => prev.map(t=>
              t.id === task.id ? { ...t, verificationStatus: 'failed' } : t
            ));
          }
        } catch (error) {
          console.error('Error verifying task:', error);
          hapticFeedback.heavy();
        } finally {
          setVerifyingTask(null);
        }
      }, minimumTime * 1000 + 2000);

    } catch (error) {
      console.error('Error handling task click:', error);
      hapticFeedback.heavy();
    }
  };

  const tiktokTasks = useMemo(() => tasks.filter(t => t.platform === 'tiktok'), [tasks]);
  const instagramTasks = useMemo(() => tasks.filter(t => t.platform === 'instagram'), [tasks]);
  
  const nextTier = useMemo(() => 
    discountTiers.find(tier => balance.totalCoins < tier.coins),
    [balance.totalCoins]
  );
  
  const currentDiscount = useMemo(() => 
    [...discountTiers].reverse().find(tier => balance.totalCoins >= tier.coins),
    [balance.totalCoins]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-4 py-6 space-y-4 pb-24">
        
        {/* Back Button */}
        <button 
          onClick={() => {
            hapticFeedback.light();
            onNavigate('profile');
          }}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Назад</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Coins className="w-8 h-8 text-amber-400" />
            Заработок монет
          </h1>
          <p className="text-white/60 text-sm">
            Выполняйте задания и получайте скидки до 25%
          </p>
        </motion.div>

        {/* Balance Card - Минималистичное черное жидкое стекло */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-black/40 border border-white/10 p-6"
          data-testid="balance-card"
        >
          {/* Gradient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Баланс</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{balance.totalCoins}</span>
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              
              <motion.div
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <Coins className="w-7 h-7 text-white" />
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 text-center">
                <div className="text-white/50 text-[10px] mb-0.5">Заработано</div>
                <div className="text-white font-bold text-sm">{balance.totalCoins}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 text-center">
                <div className="text-white/50 text-[10px] mb-0.5">Выполнено</div>
                <div className="text-white font-bold text-sm">{balance.tasksCompleted}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 text-center">
                <div className="text-white/50 text-[10px] mb-0.5">Стрик</div>
                <div className="text-white font-bold text-sm">{balance.currentStreak} 🔥</div>
              </div>
            </div>

            {/* Animated Progress to Next Tier */}
            {nextTier && (
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <AnimatedProgressBar 
                  value={balance.totalCoins}
                  max={nextTier.coins}
                  label={`До ${nextTier.label}`}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* How it Works - Минималистично */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-4"
        >
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Как это работает
          </h3>
          
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <span className="text-sm">⚡</span>
              </div>
              <div>
                <div className="text-xs font-medium text-white">Выполняйте задания</div>
                <div className="text-[10px] text-white/50">TikTok и Instagram</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-white">Получайте монеты</div>
                <div className="text-[10px] text-white/50">25-150 за задание</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-white">Получайте скидки</div>
                <div className="text-[10px] text-white/50">До 25% на разработку</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TikTok Tasks */}
        {tiktokTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-4"
          >
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-lg">🎵</span>
              TikTok задания
            </h3>
            
            <div className="space-y-2">
              {tiktokTasks.map((task) => (
                <MinimalTaskCard
                  key={task.id}
                  task={task}
                  onTaskClick={handleTaskClick}
                  isVerifying={verifyingTask === task.id}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Instagram Tasks */}
        {instagramTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-4"
          >
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-lg">📷</span>
              Instagram задания
            </h3>
            
            <div className="space-y-2">
              {instagramTasks.map((task) => (
                <MinimalTaskCard
                  key={task.id}
                  task={task}
                  onTaskClick={handleTaskClick}
                  isVerifying={verifyingTask === task.id}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Discount Tiers - Минималистично */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-4"
        >
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Скидки
          </h3>
          <div className="space-y-1.5">
            {discountTiers.map((tier, index) => (
              <div 
                key={index}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-lg transition-all text-xs',
                  balance.totalCoins >= tier.coins 
                    ? 'bg-emerald-500/20 border border-emerald-500/30' 
                    : 'bg-white/5 border border-white/10'
                )}
              >
                <span className="text-white/60">{tier.coins} монет</span>
                <span className={cn(
                  'font-bold',
                  balance.totalCoins >= tier.coins ? 'text-emerald-400' : 'text-white/40'
                )}>
                  {tier.label}
                  {balance.totalCoins >= tier.coins && ' ✓'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
