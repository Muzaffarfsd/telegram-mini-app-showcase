import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, CheckCircle, ChevronDown, ChevronUp, Clock, Gift, Users, 
  Sparkles, ArrowRight, Crown, Star, Zap, Trophy, Target
} from 'lucide-react';
import { SiTelegram, SiYoutube, SiInstagram, SiTiktok } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface Task {
  id: string;
  platform: 'telegram' | 'youtube' | 'instagram' | 'tiktok' | 'daily';
  titleKey: string;
  descKey: string;
  coins: number;
  url?: string;
  completed: boolean;
  type: 'daily' | 'social';
}

interface EarningPageProps {
  onNavigate: (section: string) => void;
}

const dailyTasks: Omit<Task, 'completed'>[] = [
  { id: 'daily_login', platform: 'daily', titleKey: 'dailyLogin', descKey: 'dailyLoginDesc', coins: 10, type: 'daily' },
  { id: 'daily_demo', platform: 'daily', titleKey: 'viewDemos', descKey: 'viewDemosDesc', coins: 25, type: 'daily' },
  { id: 'daily_share', platform: 'daily', titleKey: 'shareApp', descKey: 'shareAppDesc', coins: 30, type: 'daily' },
];

const telegramTasks: Omit<Task, 'completed'>[] = [
  { id: 'tg_follow', platform: 'telegram', titleKey: 'tgFollow', descKey: 'tgFollowDesc', coins: 100, url: 'https://t.me/web4_tg', type: 'social' },
  { id: 'tg_read1', platform: 'telegram', titleKey: 'tgRead1', descKey: 'tgReadDesc', coins: 20, url: 'https://t.me/web4_tg', type: 'social' },
  { id: 'tg_read2', platform: 'telegram', titleKey: 'tgRead2', descKey: 'tgReadDesc', coins: 20, url: 'https://t.me/web4_tg', type: 'social' },
  { id: 'tg_read3', platform: 'telegram', titleKey: 'tgRead3', descKey: 'tgReadDesc', coins: 20, url: 'https://t.me/web4_tg', type: 'social' },
  { id: 'tg_react1', platform: 'telegram', titleKey: 'tgReact1', descKey: 'tgReactDesc', coins: 30, url: 'https://t.me/web4_tg', type: 'social' },
  { id: 'tg_react2', platform: 'telegram', titleKey: 'tgReact2', descKey: 'tgReactDesc', coins: 30, url: 'https://t.me/web4_tg', type: 'social' },
  { id: 'tg_forward', platform: 'telegram', titleKey: 'tgForward', descKey: 'tgForwardDesc', coins: 50, url: 'https://t.me/web4_tg', type: 'social' },
  { id: 'tg_comment', platform: 'telegram', titleKey: 'tgComment', descKey: 'tgCommentDesc', coins: 40, url: 'https://t.me/web4_tg', type: 'social' },
];

const youtubeTasks: Omit<Task, 'completed'>[] = [
  { id: 'yt_follow', platform: 'youtube', titleKey: 'ytFollow', descKey: 'ytFollowDesc', coins: 100, url: 'https://youtube.com/@web4tg', type: 'social' },
  { id: 'yt_bell', platform: 'youtube', titleKey: 'ytBell', descKey: 'ytBellDesc', coins: 50, url: 'https://youtube.com/@web4tg', type: 'social' },
  { id: 'yt_like1', platform: 'youtube', titleKey: 'ytLike1', descKey: 'ytLikeDesc', coins: 30, url: 'https://youtube.com/@web4tg', type: 'social' },
  { id: 'yt_like2', platform: 'youtube', titleKey: 'ytLike2', descKey: 'ytLikeDesc', coins: 30, url: 'https://youtube.com/@web4tg', type: 'social' },
  { id: 'yt_like3', platform: 'youtube', titleKey: 'ytLike3', descKey: 'ytLikeDesc', coins: 30, url: 'https://youtube.com/@web4tg', type: 'social' },
  { id: 'yt_comment1', platform: 'youtube', titleKey: 'ytComment1', descKey: 'ytCommentDesc', coins: 50, url: 'https://youtube.com/@web4tg', type: 'social' },
  { id: 'yt_comment2', platform: 'youtube', titleKey: 'ytComment2', descKey: 'ytCommentDesc', coins: 50, url: 'https://youtube.com/@web4tg', type: 'social' },
  { id: 'yt_watch1', platform: 'youtube', titleKey: 'ytWatch1', descKey: 'ytWatchDesc', coins: 40, url: 'https://youtube.com/@web4tg', type: 'social' },
  { id: 'yt_watch2', platform: 'youtube', titleKey: 'ytWatch2', descKey: 'ytWatchDesc', coins: 40, url: 'https://youtube.com/@web4tg', type: 'social' },
  { id: 'yt_share', platform: 'youtube', titleKey: 'ytShare', descKey: 'ytShareDesc', coins: 60, url: 'https://youtube.com/@web4tg', type: 'social' },
];

const instagramTasks: Omit<Task, 'completed'>[] = [
  { id: 'ig_follow', platform: 'instagram', titleKey: 'igFollow', descKey: 'igFollowDesc', coins: 100, url: 'https://instagram.com/web4tg', type: 'social' },
  { id: 'ig_like1', platform: 'instagram', titleKey: 'igLike1', descKey: 'igLikeDesc', coins: 25, url: 'https://instagram.com/web4tg', type: 'social' },
  { id: 'ig_like2', platform: 'instagram', titleKey: 'igLike2', descKey: 'igLikeDesc', coins: 25, url: 'https://instagram.com/web4tg', type: 'social' },
  { id: 'ig_like3', platform: 'instagram', titleKey: 'igLike3', descKey: 'igLikeDesc', coins: 25, url: 'https://instagram.com/web4tg', type: 'social' },
  { id: 'ig_reels', platform: 'instagram', titleKey: 'igReels', descKey: 'igReelsDesc', coins: 30, url: 'https://instagram.com/web4tg', type: 'social' },
  { id: 'ig_comment1', platform: 'instagram', titleKey: 'igComment1', descKey: 'igCommentDesc', coins: 50, url: 'https://instagram.com/web4tg', type: 'social' },
  { id: 'ig_comment2', platform: 'instagram', titleKey: 'igComment2', descKey: 'igCommentDesc', coins: 50, url: 'https://instagram.com/web4tg', type: 'social' },
  { id: 'ig_save', platform: 'instagram', titleKey: 'igSave', descKey: 'igSaveDesc', coins: 35, url: 'https://instagram.com/web4tg', type: 'social' },
  { id: 'ig_story', platform: 'instagram', titleKey: 'igStory', descKey: 'igStoryDesc', coins: 70, url: 'https://instagram.com/web4tg', type: 'social' },
  { id: 'ig_dm', platform: 'instagram', titleKey: 'igDm', descKey: 'igDmDesc', coins: 40, url: 'https://instagram.com/web4tg', type: 'social' },
];

const tiktokTasks: Omit<Task, 'completed'>[] = [
  { id: 'tt_follow', platform: 'tiktok', titleKey: 'ttFollow', descKey: 'ttFollowDesc', coins: 100, url: 'https://tiktok.com/@web4tg', type: 'social' },
  { id: 'tt_like1', platform: 'tiktok', titleKey: 'ttLike1', descKey: 'ttLikeDesc', coins: 25, url: 'https://tiktok.com/@web4tg', type: 'social' },
  { id: 'tt_like2', platform: 'tiktok', titleKey: 'ttLike2', descKey: 'ttLikeDesc', coins: 25, url: 'https://tiktok.com/@web4tg', type: 'social' },
  { id: 'tt_like3', platform: 'tiktok', titleKey: 'ttLike3', descKey: 'ttLikeDesc', coins: 25, url: 'https://tiktok.com/@web4tg', type: 'social' },
  { id: 'tt_like4', platform: 'tiktok', titleKey: 'ttLike4', descKey: 'ttLikeDesc', coins: 25, url: 'https://tiktok.com/@web4tg', type: 'social' },
  { id: 'tt_comment1', platform: 'tiktok', titleKey: 'ttComment1', descKey: 'ttCommentDesc', coins: 50, url: 'https://tiktok.com/@web4tg', type: 'social' },
  { id: 'tt_comment2', platform: 'tiktok', titleKey: 'ttComment2', descKey: 'ttCommentDesc', coins: 50, url: 'https://tiktok.com/@web4tg', type: 'social' },
  { id: 'tt_watch1', platform: 'tiktok', titleKey: 'ttWatch1', descKey: 'ttWatchDesc', coins: 20, url: 'https://tiktok.com/@web4tg', type: 'social' },
  { id: 'tt_watch2', platform: 'tiktok', titleKey: 'ttWatch2', descKey: 'ttWatchDesc', coins: 20, url: 'https://tiktok.com/@web4tg', type: 'social' },
  { id: 'tt_share', platform: 'tiktok', titleKey: 'ttShare', descKey: 'ttShareDesc', coins: 60, url: 'https://tiktok.com/@web4tg', type: 'social' },
];

const discountTiers = [
  { coins: 500, discount: 1, levelKey: 'tier1' },
  { coins: 1000, discount: 2, levelKey: 'tier2' },
  { coins: 1500, discount: 3, levelKey: 'tier3' },
  { coins: 2000, discount: 5, levelKey: 'tier4' },
  { coins: 3000, discount: 7, levelKey: 'tier5' },
  { coins: 5000, discount: 10, levelKey: 'tier6' },
];

export function EarningPage({ onNavigate }: EarningPageProps) {
  const { t } = useLanguage();
  const [totalCoins, setTotalCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['daily']));
  const [dailyResetTime, setDailyResetTime] = useState('');

  const allTasks = useMemo(() => {
    const tasks = [
      ...dailyTasks,
      ...telegramTasks,
      ...youtubeTasks,
      ...instagramTasks,
      ...tiktokTasks,
    ];
    return tasks.map(task => ({ ...task, completed: completedTasks.has(task.id) }));
  }, [completedTasks]);

  const totalTasksCount = allTasks.length;
  const completedCount = completedTasks.size;
  const progressPercent = (completedCount / totalTasksCount) * 100;

  useEffect(() => {
    const updateResetTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setDailyResetTime(`${hours}${t('earning.hours')} ${minutes}${t('earning.minutes')}`);
    };
    updateResetTime();
    const interval = setInterval(updateResetTime, 60000);
    return () => clearInterval(interval);
  }, [t]);

  const handleTaskClick = useCallback((task: Task) => {
    if (task.completed) return;
    
    if (task.url) {
      window.open(task.url, '_blank');
    }
    
    setCompletedTasks(prev => {
      const next = new Set(prev);
      next.add(task.id);
      return next;
    });
    setTotalCoins(prev => prev + task.coins);
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram': return <SiTelegram className="w-5 h-5" />;
      case 'youtube': return <SiYoutube className="w-5 h-5" />;
      case 'instagram': return <SiInstagram className="w-5 h-5" />;
      case 'tiktok': return <SiTiktok className="w-5 h-5" />;
      case 'daily': return <Clock className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'telegram': return 'text-[#0088cc] bg-[#0088cc]/10 border-[#0088cc]/30';
      case 'youtube': return 'text-[#FF0000] bg-[#FF0000]/10 border-[#FF0000]/30';
      case 'instagram': return 'text-[#E4405F] bg-[#E4405F]/10 border-[#E4405F]/30';
      case 'tiktok': return 'text-foreground bg-foreground/10 border-foreground/30';
      case 'daily': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default: return 'text-primary bg-primary/10 border-primary/30';
    }
  };

  const renderTaskSection = (
    sectionKey: string,
    tasks: Task[],
    icon: React.ReactNode,
    colorClass: string
  ) => {
    const isExpanded = expandedSections.has(sectionKey);
    const sectionCompleted = tasks.filter(t => t.completed).length;
    const sectionTotal = tasks.length;

    return (
      <div key={sectionKey} className="space-y-2">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-xl transition-all",
            "bg-card border border-border hover-elevate"
          )}
          data-testid={`section-${sectionKey}`}
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", colorClass)}>
              {icon}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground">
                {t(`earning.sections.${sectionKey}`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {sectionCompleted} / {sectionTotal} {t('earning.tasksCompleted')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sectionKey === 'daily' && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {dailyResetTime}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pl-2">
                {tasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer",
                      "bg-background border border-border",
                      task.completed 
                        ? "opacity-60" 
                        : "hover-elevate active-elevate-2"
                    )}
                    onClick={() => handleTaskClick(task)}
                    data-testid={`task-${task.id}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0",
                        task.completed ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : colorClass
                      )}>
                        {task.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          getPlatformIcon(task.platform)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {t(`earning.tasks.${task.titleKey}`)}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {t(`earning.tasks.${task.descKey}`)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-amber-500">+{task.coins}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="text-center space-y-2 mb-4">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {t('earning.howItWorks')}
            </p>
            <p className="text-sm text-muted-foreground italic">
              {t('earning.howItWorksQuote')}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">{t('earning.yourProgress')}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Coins className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-bold text-amber-500">{totalCoins}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('earning.coinsCollected')}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{streak}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('earning.daysInRow')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedCount} {t('earning.of')} {totalTasksCount} {t('earning.tasksCompletedLower')}
              </span>
              <span className="font-medium text-foreground">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </Card>

        <div className="space-y-3">
          {renderTaskSection(
            'daily',
            allTasks.filter(t => t.type === 'daily'),
            <Clock className="w-5 h-5" />,
            getPlatformColor('daily')
          )}
          {renderTaskSection(
            'telegram',
            allTasks.filter(t => t.platform === 'telegram'),
            <SiTelegram className="w-5 h-5" />,
            getPlatformColor('telegram')
          )}
          {renderTaskSection(
            'youtube',
            allTasks.filter(t => t.platform === 'youtube'),
            <SiYoutube className="w-5 h-5" />,
            getPlatformColor('youtube')
          )}
          {renderTaskSection(
            'instagram',
            allTasks.filter(t => t.platform === 'instagram'),
            <SiInstagram className="w-5 h-5" />,
            getPlatformColor('instagram')
          )}
          {renderTaskSection(
            'tiktok',
            allTasks.filter(t => t.platform === 'tiktok'),
            <SiTiktok className="w-5 h-5" />,
            getPlatformColor('tiktok')
          )}
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            {t('earning.exchangeRate')}
          </h3>
          <div className="space-y-3">
            {discountTiers.map((tier, index) => (
              <div
                key={tier.coins}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  totalCoins >= tier.coins
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-muted/50 border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    totalCoins >= tier.coins ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {tier.coins} {t('earning.coins')} = {t('earning.discountOf')} {tier.discount}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(`earning.tiers.${tier.levelKey}`)}
                    </p>
                  </div>
                </div>
                {totalCoins >= tier.coins && (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            {t('earning.discountNote')}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-violet-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{t('earning.inviteFriends')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('earning.inviteBonus')}
              </p>
            </div>
            <Button 
              className="w-full"
              onClick={() => {}}
              data-testid="button-invite-friends"
            >
              <Users className="w-4 h-4 mr-2" />
              {t('earning.inviteButton')}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
          <div className="text-center space-y-4">
            <h3 className="font-bold text-lg text-foreground">{t('earning.readyToOrder')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('earning.orderDescription')}
            </p>
            <Button 
              variant="default"
              className="w-full"
              onClick={() => onNavigate('consultation')}
              data-testid="button-order-app"
            >
              {t('earning.orderButton')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
