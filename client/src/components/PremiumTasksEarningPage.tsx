import { motion, AnimatePresence } from '@/utils/LazyMotionProvider';
import { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react';
import { 
  Coins, CheckCircle, Heart, Share2, Eye, Users, MessageCircle, 
  ArrowLeft, Sparkles, Award, Youtube, Send, Gift, Zap, 
  Trophy, Star, Flame, Target, Clock, TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';
import { deepLinker } from '@/lib/deepLinks';
import { useRewards } from '@/contexts/RewardsContext';
import { useAwardXP, useCompleteTask } from '@/hooks/useGamification';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'telegram' | 'referral' | 'daily' | 'special';
  type: 'like' | 'follow' | 'share' | 'view' | 'comment' | 'subscribe' | 'join' | 'invite' | 'checkin' | 'streak';
  title: string;
  description: string;
  coins: number;
  url?: string;
  username?: string;
  completed: boolean;
  featured?: boolean;
  streak?: number;
  expiresIn?: number;
}

interface UserBalance {
  totalCoins: number;
  availableCoins: number;
  tasksCompleted: number;
  currentStreak: number;
  dailyCheckInStreak: number;
}

const premiumTasks: Task[] = [
  // Featured Daily Tasks
  {
    id: 'daily_checkin',
    platform: 'daily',
    type: 'checkin',
    title: 'Ежедневный вход',
    description: 'Заходите каждый день и получайте бонус',
    coins: 50,
    completed: false,
    featured: true,
    streak: 3
  },
  {
    id: 'daily_bonus',
    platform: 'special',
    type: 'checkin',
    title: 'Бонус недели',
    description: 'Войдите 7 дней подряд',
    coins: 500,
    completed: false,
    featured: true,
    streak: 7
  },
  
  // TikTok Tasks
  {
    id: 'tiktok_follow',
    platform: 'tiktok',
    type: 'follow',
    title: 'Подпишитесь на TikTok',
    description: 'Подписка на @web4tg',
    coins: 150,
    username: 'web4tg',
    completed: false
  },
  {
    id: 'tiktok_like_1',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк видео о МиниАппах',
    description: 'Поставьте лайк популярному видео',
    coins: 50,
    username: 'web4tg',
    completed: false
  },
  {
    id: 'tiktok_like_2',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк видео про AI',
    description: 'Оцените обзор AI технологий',
    coins: 50,
    username: 'web4tg',
    completed: false
  },
  {
    id: 'tiktok_share',
    platform: 'tiktok',
    type: 'share',
    title: 'Репост в TikTok',
    description: 'Поделитесь с друзьями',
    coins: 100,
    username: 'web4tg',
    completed: false
  },
  {
    id: 'tiktok_comment',
    platform: 'tiktok',
    type: 'comment',
    title: 'Комментарий в TikTok',
    description: 'Оставьте комментарий',
    coins: 75,
    username: 'web4tg',
    completed: false
  },
  
  // Instagram Tasks
  {
    id: 'instagram_follow',
    platform: 'instagram',
    type: 'follow',
    title: 'Подпишитесь на Instagram',
    description: 'Подписка на @web4tg',
    coins: 120,
    username: 'web4tg',
    completed: false
  },
  {
    id: 'instagram_like_1',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк поста в Instagram',
    description: 'Лайк нашего последнего поста',
    coins: 40,
    username: 'web4tg',
    completed: false
  },
  {
    id: 'instagram_like_2',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк Reels',
    description: 'Поставьте лайк Reels',
    coins: 40,
    username: 'web4tg',
    completed: false
  },
  {
    id: 'instagram_story',
    platform: 'instagram',
    type: 'share',
    title: 'Stories репост',
    description: 'Поделитесь в Stories',
    coins: 80,
    username: 'web4tg',
    completed: false
  },
  {
    id: 'instagram_comment',
    platform: 'instagram',
    type: 'comment',
    title: 'Комментарий в Instagram',
    description: 'Оставьте комментарий',
    coins: 60,
    username: 'web4tg',
    completed: false
  },
  
  // YouTube Tasks
  {
    id: 'youtube_subscribe',
    platform: 'youtube',
    type: 'subscribe',
    title: 'Подпишитесь на YouTube',
    description: 'Подписка на канал WEB4TG',
    coins: 100,
    url: 'UC_WEB4TG_CHANNEL',
    completed: false,
    featured: true
  },
  {
    id: 'youtube_like',
    platform: 'youtube',
    type: 'like',
    title: 'Лайк видео YouTube',
    description: 'Лайкните обучающее видео',
    coins: 40,
    url: 'dQw4w9WgXcQ',
    completed: false
  },
  {
    id: 'youtube_comment',
    platform: 'youtube',
    type: 'comment',
    title: 'Комментарий YouTube',
    description: 'Напишите комментарий',
    coins: 60,
    url: 'dQw4w9WgXcQ',
    completed: false
  },
  {
    id: 'youtube_watch',
    platform: 'youtube',
    type: 'view',
    title: 'Просмотр туториала',
    description: 'Досмотрите до конца',
    coins: 30,
    url: 'dQw4w9WgXcQ',
    completed: false
  },
  
  // Telegram Tasks
  {
    id: 'telegram_channel_1',
    platform: 'telegram',
    type: 'join',
    title: 'Канал новостей WEB4TG',
    description: 'Присоединитесь к каналу',
    coins: 100,
    url: 'web4tg_news',
    completed: false,
    featured: true
  },
  {
    id: 'telegram_channel_2',
    platform: 'telegram',
    type: 'join',
    title: 'Канал обучения',
    description: 'Бесплатные уроки по Telegram',
    coins: 100,
    url: 'web4tg_education',
    completed: false
  },
  {
    id: 'telegram_group',
    platform: 'telegram',
    type: 'join',
    title: 'Чат разработчиков',
    description: 'Присоединитесь к сообществу',
    coins: 80,
    url: 'web4tg_dev_chat',
    completed: false
  },
  
  // Referral Tasks
  {
    id: 'referral_1',
    platform: 'referral',
    type: 'invite',
    title: 'Пригласите друга',
    description: 'Получите 200 монет за каждого',
    coins: 200,
    completed: false,
    featured: true
  },
  {
    id: 'referral_5',
    platform: 'referral',
    type: 'invite',
    title: 'Пригласите 5 друзей',
    description: 'Бонус за активность',
    coins: 1500,
    completed: false
  },
  {
    id: 'referral_10',
    platform: 'referral',
    type: 'invite',
    title: 'Пригласите 10 друзей',
    description: 'Эксклюзивная награда',
    coins: 3500,
    completed: false
  },
  
  // Special Tasks
  {
    id: 'week_streak',
    platform: 'special',
    type: 'streak',
    title: '7 дней подряд',
    description: 'Войдите 7 дней подряд',
    coins: 300,
    completed: false,
    streak: 7
  },
  {
    id: 'month_streak',
    platform: 'special',
    type: 'streak',
    title: '30 дней подряд',
    description: 'Легендарная серия',
    coins: 2000,
    completed: false,
    featured: true,
    streak: 30
  },
  {
    id: 'complete_all_social',
    platform: 'special',
    type: 'checkin',
    title: 'Все соцсети',
    description: 'Завершите все задания соцсетей',
    coins: 500,
    completed: false,
    featured: true
  },
  
  // Additional TikTok Tasks
  {
    id: 'tiktok_watch_1',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр TikTok #1',
    description: 'Посмотрите видео о боте',
    coins: 35,
    username: 'web4tg',
    completed: false
  },
  {
    id: 'tiktok_watch_2',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр TikTok #2',
    description: 'Посмотрите обзор функций',
    coins: 35,
    username: 'web4tg',
    completed: false
  },
  
  // Additional Instagram Tasks
  {
    id: 'instagram_save',
    platform: 'instagram',
    type: 'like',
    title: 'Сохранить пост Instagram',
    description: 'Сохраните в коллекцию',
    coins: 45,
    username: 'web4tg',
    completed: false
  },
  
  // Additional YouTube Tasks
  {
    id: 'youtube_share',
    platform: 'youtube',
    type: 'share',
    title: 'Поделиться YouTube видео',
    description: 'Поделитесь с друзьями',
    coins: 70,
    url: 'dQw4w9WgXcQ',
    completed: false
  },
  {
    id: 'youtube_playlist',
    platform: 'youtube',
    type: 'subscribe',
    title: 'Добавить в плейлист',
    description: 'Сохраните в плейлист',
    coins: 50,
    url: 'dQw4w9WgXcQ',
    completed: false
  },
  {
    id: 'youtube_notification',
    platform: 'youtube',
    type: 'subscribe',
    title: 'Включить уведомления',
    description: 'Нажмите колокольчик',
    coins: 60,
    url: 'UC_WEB4TG_CHANNEL',
    completed: false
  },
  
  // Additional Telegram Tasks
  {
    id: 'telegram_bot_start',
    platform: 'telegram',
    type: 'join',
    title: 'Запустить бота',
    description: 'Запустите официального бота',
    coins: 50,
    url: 'web4tg_bot',
    completed: false
  },
  
  // Additional Referral Tasks
  {
    id: 'referral_3',
    platform: 'referral',
    type: 'invite',
    title: 'Пригласите 3 друзей',
    description: 'Получите бонус',
    coins: 700,
    completed: false
  },
  
  // Additional Special/Daily Tasks
  {
    id: 'three_day_streak',
    platform: 'special',
    type: 'streak',
    title: '3 дня подряд',
    description: 'Войдите 3 дня подряд',
    coins: 100,
    completed: false,
    streak: 3
  },
  {
    id: 'complete_10_tasks',
    platform: 'special',
    type: 'checkin',
    title: 'Завершите 10 заданий',
    description: 'Выполните любые 10 заданий',
    coins: 250,
    completed: false
  }
];

interface TasksEarningPageProps {
  onNavigate: (section: string) => void;
}

// Premium Liquid Glass Task Card
const PremiumTaskCard = memo(({ task, onTaskClick, isVerifying }: { 
  task: Task, 
  onTaskClick: (task: Task) => void,
  isVerifying: boolean 
}) => {
  const getTaskIcon = () => {
    switch (task.platform) {
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'telegram': return <Send className="w-5 h-5" />;
      case 'referral': return <Users className="w-5 h-5" />;
      case 'daily': return <Clock className="w-5 h-5" />;
      case 'special': return <Trophy className="w-5 h-5" />;
      default:
        switch (task.type) {
          case 'like': return <Heart className="w-5 h-5" />;
          case 'follow': return <Users className="w-5 h-5" />;
          case 'share': return <Share2 className="w-5 h-5" />;
          case 'view': return <Eye className="w-5 h-5" />;
          case 'comment': return <MessageCircle className="w-5 h-5" />;
          default: return <Sparkles className="w-5 h-5" />;
        }
    }
  };

  const getPlatformGradient = () => {
    switch (task.platform) {
      case 'tiktok': return 'from-pink-500/20 to-purple-500/20 border-pink-500/40';
      case 'instagram': return 'from-purple-500/20 to-pink-500/20 border-purple-500/40';
      case 'youtube': return 'from-red-500/20 to-orange-500/20 border-red-500/40';
      case 'telegram': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40';
      case 'referral': return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40';
      case 'daily': return 'from-amber-500/20 to-yellow-500/20 border-amber-500/40';
      case 'special': return 'from-violet-500/20 to-fuchsia-500/20 border-violet-500/40';
      default: return 'from-white/10 to-white/5 border-white/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: task.completed ? 0 : -2 }}
      whileTap={{ scale: task.completed ? 1 : 0.99 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'relative rounded-2xl p-5 cursor-pointer',
        'backdrop-blur-[40px] saturate-150 border',
        'will-change-transform',
        'hover:shadow-lg hover:shadow-white/10 transition-shadow duration-150',
        task.completed
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : `bg-gradient-to-br ${getPlatformGradient()}`,
        task.featured && !task.completed && 'ring-2 ring-amber-400/30 shadow-xl shadow-amber-400/10'
      )}
      onClick={() => !task.completed && !isVerifying && onTaskClick(task)}
      data-testid={`task-${task.id}`}
    >
      {/* Premium Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent rounded-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            'bg-gradient-to-br backdrop-blur-xl border transition-all duration-300',
            getPlatformGradient(),
            'shadow-lg'
          )}>
            {getTaskIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-base truncate">
                {task.title}
              </h3>
              {task.featured && !task.completed && (
                <Star className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" fill="currentColor" />
              )}
            </div>
            <p className="text-white/60 text-sm truncate">{task.description}</p>
            {task.streak && (
              <div className="flex items-center gap-1.5 mt-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-400 text-xs font-medium">{task.streak} дней подряд</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 backdrop-blur-xl border border-amber-400/30">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold text-sm">+{task.coins}</span>
          </div>
          
          {task.completed ? (
            <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/50 backdrop-blur-xl">
              <CheckCircle className="w-3 h-3 mr-1" />
              Готово
            </Badge>
          ) : isVerifying ? (
            <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/50 backdrop-blur-xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-3 h-3 mr-1" />
              </motion.div>
              Проверка...
            </Badge>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
});
PremiumTaskCard.displayName = 'PremiumTaskCard';

export function PremiumTasksEarningPage({ onNavigate }: TasksEarningPageProps) {
  const { user, initData, hapticFeedback } = useTelegram();
  const { userStats, updateStats } = useRewards();
  const awardXP = useAwardXP();
  const completeTaskGamification = useCompleteTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>(premiumTasks);
  const [verifyingTasks, setVerifyingTasks] = useState<Set<string>>(new Set());
  
  // Использовать ref вместо state для хранения timeouts (не вызывает re-render)
  const verificationTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup timeouts только при unmount
  useEffect(() => {
    return () => {
      verificationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      verificationTimeoutsRef.current.clear();
    };
  }, []);

  // Загрузить баланс монет из API
  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ['/api/tasks/balance'],
    queryFn: async () => {
      if (!initData) return null;
      const res = await fetch('/api/tasks/balance', {
        headers: { 'x-telegram-init-data': initData }
      });
      if (!res.ok) throw new Error('Failed to load balance');
      return await res.json();
    },
    enabled: !!initData && !!user?.id,
  });

  // Загрузить прогресс заданий из API
  const { data: tasksProgressData, refetch: refetchProgress } = useQuery({
    queryKey: ['/api/tasks/progress'],
    queryFn: async () => {
      if (!initData) return [];
      const res = await fetch('/api/tasks/progress', {
        headers: { 'x-telegram-init-data': initData }
      });
      if (!res.ok) throw new Error('Failed to load tasks');
      return await res.json();
    },
    enabled: !!initData && !!user?.id,
  });

  // Синхронизировать состояние completed из БД
  useEffect(() => {
    if (tasksProgressData && Array.isArray(tasksProgressData)) {
      setTasks(prev => prev.map(task => {
        const progress = tasksProgressData.find((p: any) => p.taskId === task.id);
        return progress ? { ...task, completed: progress.completed } : task;
      }));
    }
  }, [tasksProgressData]);

  const balance = balanceData || {
    totalCoins: userStats?.totalCoins || 0,
    availableCoins: userStats?.totalCoins || 0,
    tasksCompleted: userStats?.tasksCompleted || 0,
    currentStreak: userStats?.currentStreak || 0,
    dailyCheckInStreak: 0
  };

  const handleTaskClick = useCallback(async (task: Task) => {
    if (!user?.id || task.completed || !initData || verifyingTasks.has(task.id)) {
      hapticFeedback.heavy();
      return;
    }

    hapticFeedback.light();
    setVerifyingTasks(prev => new Set(prev).add(task.id));

    try {
      // Вызов /api/tasks/start
      const startRes = await fetch('/api/tasks/start', {
        method: 'POST',
        headers: {
          'x-telegram-init-data': initData,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: task.id,
          platform: task.platform,
          task_type: task.type,
          coins_reward: task.coins,
        }),
      });

      if (!startRes.ok) {
        const error = await startRes.json();
        throw new Error(error.error || 'Failed to start task');
      }

      // Открыть соответствующее приложение
      if (task.platform === 'tiktok' && task.username) {
        deepLinker.openTikTok(task.username);
      } else if (task.platform === 'instagram' && task.username) {
        deepLinker.openInstagram(task.username);
      } else if (task.platform === 'youtube' && task.url) {
        deepLinker.openYouTube(task.url);
      } else if (task.platform === 'telegram' && task.url) {
        deepLinker.openTelegramChannel(task.url);
      } else if (task.platform === 'referral') {
        const shareText = `Присоединяйся к WEB4TG и получи бонусные монеты!`;
        deepLinker.shareViaMessenger(shareText, window.location.href);
      } else if (task.platform === 'daily' || task.platform === 'special') {
        hapticFeedback.selection();
      }

      // Через 5.5 секунд вызвать /api/tasks/verify (минимум 5s требуется на бэкенде)
      const timeoutId = setTimeout(async () => {
        try {
          const verifyRes = await fetch('/api/tasks/verify', {
            method: 'POST',
            headers: {
              'x-telegram-init-data': initData,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task_id: task.id }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success && verifyData.verified) {
            hapticFeedback.selection();
            
            // Обновить локальное состояние
            setTasks(prev => prev.map(t =>
              t.id === task.id ? { ...t, completed: true } : t
            ));
            
            // Обновить баланс из нового API response
            refetchBalance();
            refetchProgress();
            
            // Обновить геймификацию
            const xpReward = Math.floor(task.coins / 2);
            awardXP(xpReward);
            completeTaskGamification();

            toast({
              title: '✅ Задание выполнено!',
              description: `Вы заработали ${task.coins} монет`,
            });
          } else {
            throw new Error(verifyData.reason || 'Verification failed');
          }
        } catch (error) {
          console.error('Verification error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Попробуйте еще раз';
          toast({
            title: '❌ Ошибка проверки',
            description: errorMessage,
            variant: 'destructive',
          });
        } finally {
          setVerifyingTasks(prev => {
            const next = new Set(prev);
            next.delete(task.id);
            return next;
          });
          verificationTimeoutsRef.current.delete(task.id);
        }
      }, 5500);

      // Сохранить timeout в ref для cleanup при unmount
      verificationTimeoutsRef.current.set(task.id, timeoutId);
    } catch (error) {
      console.error('Task start error:', error);
      toast({
        title: '❌ Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось начать задание',
        variant: 'destructive',
      });
      setVerifyingTasks(prev => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  }, [user?.id, initData, hapticFeedback, awardXP, completeTaskGamification, refetchBalance, refetchProgress, toast, verifyingTasks]);

  const totalPossibleCoins = useMemo(() => premiumTasks.reduce((sum, t) => sum + t.coins, 0), []);
  const earnedCoins = useMemo(() => tasks.filter(t => t.completed).reduce((sum, t) => sum + t.coins, 0), [tasks]);
  const progressPercent = useMemo(() => totalPossibleCoins > 0 ? (earnedCoins / totalPossibleCoins) * 100 : 0, [earnedCoins, totalPossibleCoins]);
  
  const featuredTasks = useMemo(() => tasks.filter(t => t.featured && !t.completed), [tasks]);
  const tiktokTasks = useMemo(() => tasks.filter(t => t.platform === 'tiktok'), [tasks]);
  const instagramTasks = useMemo(() => tasks.filter(t => t.platform === 'instagram'), [tasks]);
  const youtubeTasks = useMemo(() => tasks.filter(t => t.platform === 'youtube'), [tasks]);
  const telegramTasks = useMemo(() => tasks.filter(t => t.platform === 'telegram'), [tasks]);
  const specialTasks = useMemo(() => tasks.filter(t => t.platform === 'special' || t.platform === 'referral'), [tasks]);

  return (
    <div className="min-h-screen bg-black text-white" style={{ paddingTop: '140px' }}>
      <div className="max-w-md mx-auto px-4 py-6 space-y-5 pb-24">
        
        {/* Premium Glass Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              hapticFeedback.light();
              onNavigate('profile');
            }}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Назад</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-[40px] bg-white/10 border border-white/20">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-white font-bold text-lg">{balance.totalCoins}</span>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-400/30">
              <Coins className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text">
            Зарабатывайте монеты
          </h1>
          <p className="text-white/60 text-base max-w-xs mx-auto">
            Выполняйте задания и получайте эксклюзивные скидки до 25%
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl p-5 backdrop-blur-[40px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span className="text-white font-semibold">Прогресс заработка</span>
            </div>
            <span className="text-amber-400 font-bold text-sm">{Math.round(progressPercent)}%</span>
          </div>
          
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
            />
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-white/60">
              Заработано: <span className="text-white font-semibold">{earnedCoins}</span>
            </span>
            <span className="text-white/60">
              Доступно: <span className="text-amber-400 font-semibold">{totalPossibleCoins}</span>
            </span>
          </div>
        </motion.div>

        {/* Featured Tasks */}
        {featuredTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-white font-bold text-lg">Избранные задания</h2>
            </div>
            
            {featuredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PremiumTaskCard 
                  task={task}
                  onTaskClick={handleTaskClick}
                  isVerifying={verifyingTasks.has(task.id)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* TikTok Tasks */}
        {tiktokTasks.some(t => !t.completed) && (
          <div className="space-y-3">
            <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center">
                <span className="text-xs">🎵</span>
              </div>
              TikTok
            </h2>
            
            {tiktokTasks.filter(t => !t.completed).map(task => (
              <PremiumTaskCard 
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                isVerifying={verifyingTasks.has(task.id)}
              />
            ))}
          </div>
        )}

        {/* Instagram Tasks */}
        {instagramTasks.some(t => !t.completed) && (
          <div className="space-y-3">
            <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                <span className="text-xs">📸</span>
              </div>
              Instagram
            </h2>
            
            {instagramTasks.filter(t => !t.completed).map(task => (
              <PremiumTaskCard 
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                isVerifying={verifyingTasks.has(task.id)}
              />
            ))}
          </div>
        )}

        {/* YouTube Tasks */}
        {youtubeTasks.some(t => !t.completed) && (
          <div className="space-y-3">
            <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
                <Youtube className="w-3.5 h-3.5 text-red-400" />
              </div>
              YouTube
            </h2>
            
            {youtubeTasks.filter(t => !t.completed).map(task => (
              <PremiumTaskCard 
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                isVerifying={verifyingTasks.has(task.id)}
              />
            ))}
          </div>
        )}

        {/* Telegram Tasks */}
        {telegramTasks.some(t => !t.completed) && (
          <div className="space-y-3">
            <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-blue-400" />
              </div>
              Telegram
            </h2>
            
            {telegramTasks.filter(t => !t.completed).map(task => (
              <PremiumTaskCard 
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                isVerifying={verifyingTasks.has(task.id)}
              />
            ))}
          </div>
        )}

        {/* Special Tasks */}
        {specialTasks.some(t => !t.completed) && (
          <div className="space-y-3">
            <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-5 h-5 text-violet-400" />
              Специальные задания
            </h2>
            
            {specialTasks.filter(t => !t.completed).map(task => (
              <PremiumTaskCard 
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                isVerifying={verifyingTasks.has(task.id)}
              />
            ))}
          </div>
        )}

        {/* Completion Message */}
        {tasks.every(t => t.completed) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 px-6 rounded-3xl backdrop-blur-[40px] bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
          >
            <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Все задания выполнены!</h3>
            <p className="text-white/70 text-sm">
              Вы заработали {balance.totalCoins} монет. Ожидайте новые задания скоро!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
