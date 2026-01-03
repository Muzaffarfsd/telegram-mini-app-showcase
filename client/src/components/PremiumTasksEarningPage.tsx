import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Coins, CheckCircle, Users, Gift, ArrowRight,
  Heart, MessageCircle, Eye, UserPlus, Youtube, Send,
  Share2, Bell, Star, Bookmark, Clock, Flame, Loader2
} from 'lucide-react';
import { SiTiktok, SiInstagram } from 'react-icons/si';
import { useTelegram } from '@/hooks/useTelegram';
import { useRewards } from '@/contexts/RewardsContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';

interface TasksEarningPageProps {
  onNavigate: (section: string) => void;
}

interface SocialTask {
  id: string;
  platform: 'youtube' | 'telegram' | 'instagram' | 'tiktok' | 'daily';
  type: string;
  title: string;
  description: string;
  coins: number;
  url: string;
  channelUsername?: string;
}

export function PremiumTasksEarningPage({ onNavigate }: TasksEarningPageProps) {
  const { hapticFeedback, initData, user } = useTelegram();
  const { userStats } = useRewards();
  const { toast } = useToast();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [pendingTasks, setPendingTasks] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [timeToReset, setTimeToReset] = useState('');

  const dailyTasks: SocialTask[] = useMemo(() => [
    { id: 'daily_visit', platform: 'daily', type: 'visit', title: t('tasks.daily_visit_title'), description: t('tasks.daily_visit_desc'), coins: 10, url: '' },
    { id: 'daily_view_demos', platform: 'daily', type: 'view', title: t('tasks.daily_view_demos_title'), description: t('tasks.daily_view_demos_desc'), coins: 25, url: '' },
    { id: 'daily_share', platform: 'daily', type: 'share', title: t('tasks.daily_share_title'), description: t('tasks.daily_share_desc'), coins: 30, url: '' }
  ], [t]);

  const socialTasks: SocialTask[] = useMemo(() => [
    { id: 'youtube_subscribe', platform: 'youtube', type: 'subscribe', title: t('tasks.youtube_subscribe_title'), description: t('tasks.youtube_subscribe_desc'), coins: 100, url: 'https://www.youtube.com/@WEB4TG' },
    { id: 'youtube_bell', platform: 'youtube', type: 'bell', title: t('tasks.youtube_bell_title'), description: t('tasks.youtube_bell_desc'), coins: 50, url: 'https://www.youtube.com/@WEB4TG' },
    { id: 'youtube_like_1', platform: 'youtube', type: 'like', title: t('tasks.youtube_like_1_title'), description: t('tasks.youtube_like_1_desc'), coins: 30, url: 'https://www.youtube.com/@WEB4TG' },
    { id: 'youtube_comment_1', platform: 'youtube', type: 'comment', title: t('tasks.youtube_comment_1_title'), description: t('tasks.youtube_comment_1_desc'), coins: 50, url: 'https://www.youtube.com/@WEB4TG' },
    { id: 'telegram_subscribe', platform: 'telegram', type: 'subscribe', title: t('tasks.telegram_subscribe_title'), description: t('tasks.telegram_subscribe_desc'), coins: 100, url: 'https://t.me/web4_tg', channelUsername: 'web4_tg' },
    { id: 'telegram_read_1', platform: 'telegram', type: 'view', title: t('tasks.telegram_read_1_title'), description: t('tasks.telegram_read_1_desc'), coins: 20, url: 'https://t.me/web4_tg', channelUsername: 'web4_tg' },
    { id: 'instagram_subscribe', platform: 'instagram', type: 'subscribe', title: t('tasks.instagram_subscribe_title'), description: t('tasks.instagram_subscribe_desc'), coins: 100, url: 'https://www.instagram.com/web4tg/' },
    { id: 'tiktok_subscribe', platform: 'tiktok', type: 'subscribe', title: t('tasks.tiktok_subscribe_title'), description: t('tasks.tiktok_subscribe_desc'), coins: 100, url: 'https://www.tiktok.com/@web4tg' }
  ], [t]);
  
  // Theme-aware colors
  const colors = {
    background: isDark ? '#09090B' : '#F2F4F6',
    foreground: isDark ? '#E4E4E7' : '#1e293b',
    textPrimary: isDark ? '#FAFAFA' : '#000000',
    textSecondary: isDark ? '#71717A' : '#64748b',
    textMuted: isDark ? '#52525B' : '#94a3b8',
    cardBg: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)',
    hairline: isDark ? '#27272A' : '#e2e8f0',
    progressBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  };

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeToReset(t('tasks.resetIn').replace('{time}', `${hours}h ${minutes}m`));
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [t]);

  useEffect(() => {
    const loadProgress = async () => {
      if (initData && user?.id) {
        try {
          const response = await fetch(`/api/user/${user.id}/tasks-progress`, {
            headers: { 'x-telegram-init-data': initData }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.completedTasks) setCompletedTasks(new Set(data.completedTasks));
            if (data.streak) setStreak(data.streak);
          }
        } catch (error) { console.log('Could not load progress:', error); }
      }
    };
    loadProgress();
  }, [initData, user?.id]);

  const handleTaskClick = useCallback(async (task: SocialTask) => {
    if (completedTasks.has(task.id) || pendingTasks.has(task.id)) return;
    hapticFeedback.light();
    if (task.url) window.open(task.url, '_blank');
    setPendingTasks(prev => new Set(prev).add(task.id));
    const waitTime = task.platform === 'telegram' && task.type === 'subscribe' ? 3000 : 5000;
    
    setTimeout(async () => {
      if (initData) {
        try {
          const response = await fetch('/api/tasks/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
            body: JSON.stringify({
              task_id: task.id, platform: task.platform, task_type: task.type,
              coins_reward: task.coins, channelUsername: task.channelUsername || null
            })
          });
          const data = await response.json();
          if (data.success) {
            setCompletedTasks(prev => new Set(prev).add(task.id));
            hapticFeedback.selection();
            toast({
              title: task.platform === 'daily' ? t('tasks.dailyTaskTitle') : t('tasks.taskCompletedTitle'),
              description: `+${task.coins} ${t('tasks.coinsLabel')}`,
            });
            if (data.streak) setStreak(data.streak);
          } else {
            toast({
              title: task.platform === 'telegram' ? t('tasks.subscribeFirst') : t('tasks.error'),
              description: data.error || (task.platform === 'telegram' ? t('tasks.subscribeFirstDesc') : t('tasks.tryLater')),
              variant: 'destructive'
            });
          }
        } catch (error) {
          toast({ title: t('tasks.connectionErrorTitle'), description: t('tasks.tryLater'), variant: 'destructive' });
        }
      } else {
        toast({ title: t('tasks.authRequired'), description: t('tasks.openInTelegram'), variant: 'destructive' });
      }
      setPendingTasks(prev => { const next = new Set(prev); next.delete(task.id); return next; });
    }, waitTime);
  }, [completedTasks, pendingTasks, hapticFeedback, toast, initData, t]);

  const totalEarned = Array.from(completedTasks).reduce((sum, taskId) => {
    const task = [...socialTasks, ...dailyTasks].find(t => t.id === taskId);
    return sum + (task?.coins || 0);
  }, 0);

  const platformTasks = {
    daily: dailyTasks,
    youtube: socialTasks.filter(t => t.platform === 'youtube'),
    telegram: socialTasks.filter(t => t.platform === 'telegram'),
    instagram: socialTasks.filter(t => t.platform === 'instagram'),
    tiktok: socialTasks.filter(t => t.platform === 'tiktok')
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube size={20} />;
      case 'telegram': return <Send size={20} />;
      case 'instagram': return <SiInstagram size={20} />;
      case 'tiktok': return <SiTiktok size={20} />;
      case 'daily': return <Clock size={20} />;
      default: return <Gift size={20} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscribe': return <UserPlus size={16} />;
      case 'like': return <Heart size={16} />;
      case 'comment': return <MessageCircle size={16} />;
      case 'view': return <Eye size={16} />;
      case 'share': return <Share2 size={16} />;
      case 'bell': return <Bell size={16} />;
      case 'save': return <Bookmark size={16} />;
      case 'visit': return <Clock size={16} />;
      default: return <Star size={16} />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube': return { bg: 'rgba(255, 0, 0, 0.1)', color: '#FF0000' };
      case 'telegram': return { bg: 'rgba(41, 182, 246, 0.1)', color: '#29B6F6' };
      case 'instagram': return { bg: 'rgba(228, 64, 95, 0.1)', color: '#E4405F' };
      case 'tiktok': return { bg: 'rgba(0, 242, 234, 0.1)', color: '#00F2EA' };
      case 'daily': return { bg: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24' };
      default: return { bg: 'rgba(139, 92, 246, 0.1)', color: '#A78BFA' };
    }
  };

  const renderTaskCard = (task: SocialTask) => {
    const isCompleted = completedTasks.has(task.id);
    const isPending = pendingTasks.has(task.id);
    const platformColors = getPlatformColor(task.platform);
    
    return (
      <div 
        key={task.id}
        onClick={() => handleTaskClick(task)}
        style={{
          display: 'flex', gap: '16px', padding: '20px', borderRadius: '14px',
          background: isCompleted ? 'rgba(16, 185, 129, 0.06)' : colors.cardBg,
          border: isCompleted ? '1px solid rgba(16, 185, 129, 0.2)' : `1px solid ${colors.cardBorder}`,
          cursor: isCompleted || isPending ? 'default' : 'pointer',
          opacity: isPending ? 0.7 : 1, transition: 'all 0.2s ease'
        }}
        data-testid={`task-${task.id}`}
      >
        <div style={{
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '12px', background: platformColors.bg, color: platformColors.color, flexShrink: 0
        }}>
          {getPlatformIcon(task.platform)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary }}>{task.title}</p>
            <div style={{ color: colors.textSecondary }}>{getTypeIcon(task.type)}</div>
          </div>
          <p style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: '1.4' }}>{task.description}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Coins size={14} color="#FBBF24" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FBBF24' }}>+{task.coins}</span>
          </div>
          {isCompleted && <CheckCircle size={16} color="#10B981" />}
          {isPending && <Loader2 size={16} className="animate-spin" color={colors.textSecondary} />}
        </div>
      </div>
    );
  };

  const renderTaskSection = (platform: string, title: string) => {
    const tasks = platformTasks[platform as keyof typeof platformTasks];
    if (!tasks || tasks.length === 0) return null;
    return (
      <section className="px-7 py-8">
        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '20px' }}>
          {title}
        </p>
        <div className="space-y-3">
          {tasks.map(renderTaskCard)}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background }}>
      <div className="max-w-md mx-auto">
        <header className="px-7 pt-12 pb-8">
          <button onClick={() => onNavigate('profile')} className="mb-6 flex items-center gap-2" style={{ background: 'none', border: 'none', padding: 0, color: colors.textSecondary, cursor: 'pointer' }}>
            <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{t('tasks.back')}</span>
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: colors.textPrimary, marginBottom: '8px' }}>{t('tasks.earnCoins')}</h1>
          <p style={{ fontSize: '15px', color: colors.textSecondary, lineHeight: '1.5' }}>{t('tasks.earnCoinsDesc')}</p>
        </header>

        <section className="px-7 mb-8">
          <div style={{ padding: '24px', borderRadius: '24px', background: isDark ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{t('tasks.balance')}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '40px', fontWeight: 800 }}>{(userStats?.totalCoins || 0) + totalEarned}</span>
                  <Coins size={24} />
                </div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={24} fill="currentColor" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, padding: '12px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>{t('tasks.streak')}</p>
                <p style={{ fontSize: '16px', fontWeight: 700 }}>{streak} {t('common.today')}</p>
              </div>
              <div style={{ flex: 1, padding: '12px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>{t('tasks.completedLabel')}</p>
                <p style={{ fontSize: '16px', fontWeight: 700 }}>{completedTasks.size} / {[...socialTasks, ...dailyTasks].length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-7 py-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: colors.textMuted, textTransform: 'uppercase' }}>{t('tasks.dailyTasksTitle')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <Clock size={14} color="#FBBF24" />
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#FBBF24' }}>{timeToReset}</span>
            </div>
          </div>
          <div className="space-y-3">{dailyTasks.map(renderTaskCard)}</div>
        </section>

        {renderTaskSection('telegram', t('tasks.platformTasksWithVerification').replace('{platform}', 'Telegram').replace('{count}', String(platformTasks.telegram.length)))}
        {renderTaskSection('youtube', t('tasks.platformTasks').replace('{platform}', 'YouTube').replace('{count}', String(platformTasks.youtube.length)))}
        {renderTaskSection('instagram', t('tasks.platformTasks').replace('{platform}', 'Instagram').replace('{count}', String(platformTasks.instagram.length)))}
        {renderTaskSection('tiktok', t('tasks.platformTasks').replace('{platform}', 'TikTok').replace('{count}', String(platformTasks.tiktok.length)))}

        <div className="mx-7" style={{ height: '1px', background: colors.hairline }} />

        <section className="px-7 py-8">
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '20px' }}>{t('tasks.exchangeRateTitle')}</p>
          <div className="space-y-3">
            {[
              { coins: 500, discount: '1%', key: 'starter' },
              { coins: 1000, discount: '2%', key: 'active' },
              { coins: 1500, discount: '3%', key: 'advanced' },
              { coins: 2000, discount: '5%', key: 'expert' },
              { coins: 3000, discount: '7%', key: 'master' },
              { coins: 5000, discount: '10%', key: 'legend' }
            ].map((tier, index) => {
              const currentCoins = (userStats?.totalCoins || 0) + totalEarned;
              const isAchieved = currentCoins >= tier.coins;
              return (
                <div key={index} style={{ display: 'flex', gap: '16px', padding: '20px', borderRadius: '14px', background: isAchieved ? 'rgba(16, 185, 129, 0.06)' : colors.cardBg, border: isAchieved ? '1px solid rgba(16, 185, 129, 0.2)' : `1px solid ${colors.cardBorder}` }}>
                  <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: isAchieved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)', flexShrink: 0 }}>
                    {isAchieved ? <CheckCircle size={20} color="#10B981" /> : <Coins size={20} color="#A78BFA" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, marginBottom: '4px' }}>{t('tasks.tierLabel').replace('{coins}', String(tier.coins)).replace('{discount}', tier.discount)}</p>
                    <p style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: '1.4' }}>{t(`tasks.tiers.${tier.key}`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '16px', textAlign: 'center', lineHeight: '1.5' }}>{t('tasks.discountAppliedTo')}</p>
        </section>

        <section className="px-7 py-12">
          <div style={{ padding: '28px', borderRadius: '20px', background: isDark ? 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.08) 100%)' : 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.12) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.2)', margin: '0 auto 16px' }}><Users size={28} color="#A78BFA" /></div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: colors.textPrimary, marginBottom: '8px' }}>{t('tasks.inviteFriendsTitle')}</h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '20px', lineHeight: '1.5' }}>{t('tasks.inviteFriendsDesc')}</p>
            <button onClick={() => onNavigate('referral')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', background: '#A78BFA', border: 'none', color: '#09090B', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} data-testid="button-referral-program">{t('tasks.inviteFriendsBtn')}<ArrowRight size={18} /></button>
          </div>
        </section>

        <section className="px-7 py-8 pb-16">
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '16px' }}>{t('tasks.readyToOrderTitle')}</p>
          <div style={{ padding: '24px', borderRadius: '16px', background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
            <p style={{ fontSize: '15px', fontWeight: 500, color: colors.foreground, lineHeight: '1.6', marginBottom: '20px' }}>{t('tasks.readyToOrderDesc')}</p>
            <button onClick={() => onNavigate('constructor')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px 24px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#A78BFA', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} data-testid="button-order-app">{t('tasks.orderAppBtn')}<ArrowRight size={18} /></button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PremiumTasksEarningPage;
