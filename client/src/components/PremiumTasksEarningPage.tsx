import { useState, useCallback } from 'react';
import { 
  Coins, CheckCircle, Users, Gift, ArrowRight,
  Heart, MessageCircle, Eye, UserPlus, Youtube, Send,
  Share2, Bell, Star, ThumbsUp, Bookmark, Play
} from 'lucide-react';
import { SiTiktok, SiInstagram } from 'react-icons/si';
import { useTelegram } from '@/hooks/useTelegram';
import { useRewards } from '@/contexts/RewardsContext';
import { useToast } from '@/hooks/use-toast';

interface TasksEarningPageProps {
  onNavigate: (section: string) => void;
}

interface SocialTask {
  id: string;
  platform: 'youtube' | 'telegram' | 'instagram' | 'tiktok';
  type: string;
  title: string;
  description: string;
  coins: number;
  url: string;
}

const socialTasks: SocialTask[] = [
  // YouTube Tasks (10 заданий)
  {
    id: 'youtube_subscribe',
    platform: 'youtube',
    type: 'subscribe',
    title: 'Подписаться на YouTube',
    description: 'Подписка на канал WEB4TG',
    coins: 100,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  {
    id: 'youtube_bell',
    platform: 'youtube',
    type: 'bell',
    title: 'Включить уведомления',
    description: 'Нажми на колокольчик',
    coins: 50,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  {
    id: 'youtube_like_1',
    platform: 'youtube',
    type: 'like',
    title: 'Лайк видео #1',
    description: 'Поставь лайк на последнее видео',
    coins: 30,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  {
    id: 'youtube_like_2',
    platform: 'youtube',
    type: 'like',
    title: 'Лайк видео #2',
    description: 'Поставь лайк на второе видео',
    coins: 30,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  {
    id: 'youtube_like_3',
    platform: 'youtube',
    type: 'like',
    title: 'Лайк видео #3',
    description: 'Поставь лайк на третье видео',
    coins: 30,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  {
    id: 'youtube_comment_1',
    platform: 'youtube',
    type: 'comment',
    title: 'Комментарий #1',
    description: 'Напиши комментарий под видео',
    coins: 50,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  {
    id: 'youtube_comment_2',
    platform: 'youtube',
    type: 'comment',
    title: 'Комментарий #2',
    description: 'Напиши ещё один комментарий',
    coins: 50,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  {
    id: 'youtube_view_1',
    platform: 'youtube',
    type: 'view',
    title: 'Просмотр видео #1',
    description: 'Посмотри видео до конца',
    coins: 40,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  {
    id: 'youtube_view_2',
    platform: 'youtube',
    type: 'view',
    title: 'Просмотр видео #2',
    description: 'Посмотри второе видео',
    coins: 40,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  {
    id: 'youtube_share',
    platform: 'youtube',
    type: 'share',
    title: 'Поделиться видео',
    description: 'Отправь видео другу',
    coins: 60,
    url: 'https://www.youtube.com/@WEB4TG'
  },
  
  // Telegram Tasks (8 заданий)
  {
    id: 'telegram_subscribe',
    platform: 'telegram',
    type: 'subscribe',
    title: 'Подписаться на канал',
    description: 'Подписка на канал WEB4TG',
    coins: 100,
    url: 'https://t.me/web4_tg'
  },
  {
    id: 'telegram_read_1',
    platform: 'telegram',
    type: 'view',
    title: 'Прочитать пост #1',
    description: 'Прочитай последний пост',
    coins: 20,
    url: 'https://t.me/web4_tg'
  },
  {
    id: 'telegram_read_2',
    platform: 'telegram',
    type: 'view',
    title: 'Прочитать пост #2',
    description: 'Прочитай второй пост',
    coins: 20,
    url: 'https://t.me/web4_tg'
  },
  {
    id: 'telegram_read_3',
    platform: 'telegram',
    type: 'view',
    title: 'Прочитать пост #3',
    description: 'Прочитай третий пост',
    coins: 20,
    url: 'https://t.me/web4_tg'
  },
  {
    id: 'telegram_reaction_1',
    platform: 'telegram',
    type: 'like',
    title: 'Реакция на пост #1',
    description: 'Поставь реакцию на пост',
    coins: 30,
    url: 'https://t.me/web4_tg'
  },
  {
    id: 'telegram_reaction_2',
    platform: 'telegram',
    type: 'like',
    title: 'Реакция на пост #2',
    description: 'Поставь ещё одну реакцию',
    coins: 30,
    url: 'https://t.me/web4_tg'
  },
  {
    id: 'telegram_share',
    platform: 'telegram',
    type: 'share',
    title: 'Переслать пост',
    description: 'Перешли пост другу',
    coins: 50,
    url: 'https://t.me/web4_tg'
  },
  {
    id: 'telegram_comment',
    platform: 'telegram',
    type: 'comment',
    title: 'Комментарий в канале',
    description: 'Напиши комментарий под постом',
    coins: 40,
    url: 'https://t.me/web4_tg'
  },
  
  // Instagram Tasks (10 заданий)
  {
    id: 'instagram_subscribe',
    platform: 'instagram',
    type: 'subscribe',
    title: 'Подписаться на Instagram',
    description: 'Подписка на @web4tg',
    coins: 100,
    url: 'https://www.instagram.com/web4tg/'
  },
  {
    id: 'instagram_like_1',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк поста #1',
    description: 'Поставь лайк на последний пост',
    coins: 25,
    url: 'https://www.instagram.com/web4tg/'
  },
  {
    id: 'instagram_like_2',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк поста #2',
    description: 'Поставь лайк на второй пост',
    coins: 25,
    url: 'https://www.instagram.com/web4tg/'
  },
  {
    id: 'instagram_like_3',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк поста #3',
    description: 'Поставь лайк на третий пост',
    coins: 25,
    url: 'https://www.instagram.com/web4tg/'
  },
  {
    id: 'instagram_like_reels',
    platform: 'instagram',
    type: 'like',
    title: 'Лайк Reels',
    description: 'Поставь лайк на Reels',
    coins: 30,
    url: 'https://www.instagram.com/web4tg/'
  },
  {
    id: 'instagram_comment_1',
    platform: 'instagram',
    type: 'comment',
    title: 'Комментарий #1',
    description: 'Напиши комментарий под постом',
    coins: 50,
    url: 'https://www.instagram.com/web4tg/'
  },
  {
    id: 'instagram_comment_2',
    platform: 'instagram',
    type: 'comment',
    title: 'Комментарий #2',
    description: 'Напиши ещё один комментарий',
    coins: 50,
    url: 'https://www.instagram.com/web4tg/'
  },
  {
    id: 'instagram_save',
    platform: 'instagram',
    type: 'save',
    title: 'Сохранить пост',
    description: 'Сохрани пост в коллекцию',
    coins: 35,
    url: 'https://www.instagram.com/web4tg/'
  },
  {
    id: 'instagram_story',
    platform: 'instagram',
    type: 'share',
    title: 'Репост в Stories',
    description: 'Поделись постом в Stories',
    coins: 70,
    url: 'https://www.instagram.com/web4tg/'
  },
  {
    id: 'instagram_share',
    platform: 'instagram',
    type: 'share',
    title: 'Отправить другу',
    description: 'Отправь пост другу в Direct',
    coins: 40,
    url: 'https://www.instagram.com/web4tg/'
  },
  
  // TikTok Tasks (10 заданий)
  {
    id: 'tiktok_subscribe',
    platform: 'tiktok',
    type: 'subscribe',
    title: 'Подписаться на TikTok',
    description: 'Подписка на @web4tg',
    coins: 100,
    url: 'https://www.tiktok.com/@web4tg'
  },
  {
    id: 'tiktok_like_1',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк видео #1',
    description: 'Поставь лайк на последнее видео',
    coins: 25,
    url: 'https://www.tiktok.com/@web4tg'
  },
  {
    id: 'tiktok_like_2',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк видео #2',
    description: 'Поставь лайк на второе видео',
    coins: 25,
    url: 'https://www.tiktok.com/@web4tg'
  },
  {
    id: 'tiktok_like_3',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк видео #3',
    description: 'Поставь лайк на третье видео',
    coins: 25,
    url: 'https://www.tiktok.com/@web4tg'
  },
  {
    id: 'tiktok_like_4',
    platform: 'tiktok',
    type: 'like',
    title: 'Лайк видео #4',
    description: 'Поставь лайк на четвёртое видео',
    coins: 25,
    url: 'https://www.tiktok.com/@web4tg'
  },
  {
    id: 'tiktok_comment_1',
    platform: 'tiktok',
    type: 'comment',
    title: 'Комментарий #1',
    description: 'Напиши комментарий под видео',
    coins: 50,
    url: 'https://www.tiktok.com/@web4tg'
  },
  {
    id: 'tiktok_comment_2',
    platform: 'tiktok',
    type: 'comment',
    title: 'Комментарий #2',
    description: 'Напиши ещё один комментарий',
    coins: 50,
    url: 'https://www.tiktok.com/@web4tg'
  },
  {
    id: 'tiktok_view_1',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр видео #1',
    description: 'Посмотри видео до конца',
    coins: 20,
    url: 'https://www.tiktok.com/@web4tg'
  },
  {
    id: 'tiktok_view_2',
    platform: 'tiktok',
    type: 'view',
    title: 'Просмотр видео #2',
    description: 'Посмотри второе видео',
    coins: 20,
    url: 'https://www.tiktok.com/@web4tg'
  },
  {
    id: 'tiktok_share',
    platform: 'tiktok',
    type: 'share',
    title: 'Поделиться видео',
    description: 'Отправь видео другу',
    coins: 60,
    url: 'https://www.tiktok.com/@web4tg'
  }
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'youtube': return <Youtube size={20} />;
    case 'telegram': return <Send size={20} />;
    case 'instagram': return <SiInstagram size={20} />;
    case 'tiktok': return <SiTiktok size={20} />;
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
    default: return <Star size={16} />;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'youtube': return { bg: 'rgba(255, 0, 0, 0.1)', color: '#FF0000' };
    case 'telegram': return { bg: 'rgba(41, 182, 246, 0.1)', color: '#29B6F6' };
    case 'instagram': return { bg: 'rgba(228, 64, 95, 0.1)', color: '#E4405F' };
    case 'tiktok': return { bg: 'rgba(0, 242, 234, 0.1)', color: '#00F2EA' };
    default: return { bg: 'rgba(139, 92, 246, 0.1)', color: '#A78BFA' };
  }
};

export function PremiumTasksEarningPage({ onNavigate }: TasksEarningPageProps) {
  const { hapticFeedback } = useTelegram();
  const { userStats } = useRewards();
  const { toast } = useToast();
  
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleTaskClick = useCallback((task: SocialTask) => {
    if (completedTasks.has(task.id)) return;
    
    hapticFeedback.light();
    window.open(task.url, '_blank');
    
    setTimeout(() => {
      if (!completedTasks.has(task.id)) {
        setCompletedTasks(prev => new Set(prev).add(task.id));
        hapticFeedback.selection();
        toast({
          title: 'Задание выполнено!',
          description: `+${task.coins} монет`,
        });
      }
    }, 3000);
  }, [completedTasks, hapticFeedback, toast]);

  const totalEarned = Array.from(completedTasks).reduce((sum, taskId) => {
    const task = socialTasks.find(t => t.id === taskId);
    return sum + (task?.coins || 0);
  }, 0);

  const maxCoins = socialTasks.reduce((sum, t) => sum + t.coins, 0);
  
  const platformTasks = {
    youtube: socialTasks.filter(t => t.platform === 'youtube'),
    telegram: socialTasks.filter(t => t.platform === 'telegram'),
    instagram: socialTasks.filter(t => t.platform === 'instagram'),
    tiktok: socialTasks.filter(t => t.platform === 'tiktok')
  };

  const renderTaskSection = (platform: 'youtube' | 'telegram' | 'instagram' | 'tiktok', title: string) => {
    const tasks = platformTasks[platform];
    const colors = getPlatformColor(platform);
    
    return (
      <section className="px-7 py-8">
        <p 
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}
        >
          {title}
        </p>
        
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = completedTasks.has(task.id);
            return (
              <div 
                key={task.id}
                onClick={() => handleTaskClick(task)}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '14px',
                  background: isCompleted 
                    ? 'rgba(16, 185, 129, 0.06)' 
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isCompleted 
                    ? '1px solid rgba(16, 185, 129, 0.2)' 
                    : '1px solid rgba(255, 255, 255, 0.04)',
                  cursor: isCompleted ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                data-testid={`task-${task.id}`}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  background: colors.bg,
                  color: colors.color,
                  flexShrink: 0
                }}>
                  {getPlatformIcon(task.platform)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#FAFAFA'
                    }}>
                      {task.title}
                    </p>
                    <div style={{ color: '#71717A' }}>
                      {getTypeIcon(task.type)}
                    </div>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#71717A',
                    lineHeight: '1.4'
                  }}>
                    {task.description}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}>
                    <Coins size={14} color="#A78BFA" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#A78BFA' }}>+{task.coins}</span>
                  </div>
                  {isCompleted && (
                    <CheckCircle size={18} color="#10B981" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div 
      className="min-h-screen pb-32 smooth-scroll-page"
      style={{ 
        background: '#09090B',
        color: '#E4E4E7',
        paddingTop: '140px'
      }}
    >
      <div className="max-w-md mx-auto">
        
        {/* HERO SECTION */}
        <header className="px-7 pt-8 pb-16">
          <p 
            className="scroll-fade-in"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: '#71717A',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}
          >
            Заработок монет
          </p>
          
          <h1 
            className="scroll-fade-in-delay-1"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: '1.2',
              color: '#FAFAFA'
            }}
          >
            Выполняй задания,
            <br />
            <span style={{ color: '#A78BFA' }}>копи монеты</span>
            <br />
            получай скидку.
          </h1>
          
          <p 
            className="scroll-fade-in-delay-2"
            style={{
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: '1.6',
              color: '#71717A',
              marginTop: '20px',
              maxWidth: '320px'
            }}
          >
            Подписывайся, лайкай, комментируй — чем больше заданий выполнишь, тем больше монет получишь. Монеты = скидка на разработку.
          </p>
        </header>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* HOW IT WORKS SECTION */}
        <section className="px-7 py-12">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            Как это работает
          </p>
          
          <div 
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.04) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.15)'
            }}
          >
            <p style={{
              fontSize: '17px',
              fontWeight: 500,
              color: '#E4E4E7',
              lineHeight: '1.5',
              fontStyle: 'italic'
            }}>
              «Чем активнее ты в наших соцсетях — тем больше монет копишь. Накопленные монеты обмениваются на скидку при заказе разработки Telegram Mini App.»
            </p>
          </div>
        </section>

        {/* BALANCE SECTION */}
        <section className="px-7 py-8">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            Твой прогресс
          </p>
          
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}
          >
            <div 
              style={{
                padding: '20px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                textAlign: 'center'
              }}
            >
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#A78BFA',
                letterSpacing: '-0.03em'
              }}>
                {(userStats?.totalCoins || 0) + totalEarned}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#52525B',
                marginTop: '4px'
              }}>
                монет собрано
              </p>
            </div>
            <div 
              style={{
                padding: '20px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                textAlign: 'center'
              }}
            >
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#FAFAFA',
                letterSpacing: '-0.03em'
              }}>
                {completedTasks.size}/{socialTasks.length}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#52525B',
                marginTop: '4px'
              }}>
                заданий выполнено
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div style={{ marginTop: '16px' }}>
            <div style={{
              height: '8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(completedTasks.size / socialTasks.length) * 100}%`,
                background: 'linear-gradient(90deg, #A78BFA, #8B5CF6)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{
              fontSize: '12px',
              color: '#52525B',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              Максимум {maxCoins} монет за все задания
            </p>
          </div>
        </section>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* TASK SECTIONS */}
        {renderTaskSection('youtube', `YouTube — ${platformTasks.youtube.length} заданий`)}
        {renderTaskSection('telegram', `Telegram — ${platformTasks.telegram.length} заданий`)}
        {renderTaskSection('instagram', `Instagram — ${platformTasks.instagram.length} заданий`)}
        {renderTaskSection('tiktok', `TikTok — ${platformTasks.tiktok.length} заданий`)}

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* EXCHANGE RATES - выгодные для владельца */}
        <section className="px-7 py-8">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}
          >
            Курс обмена на скидку
          </p>
          
          <div className="space-y-3">
            {[
              { coins: 500, discount: '1%', label: 'Начальный уровень' },
              { coins: 1000, discount: '2%', label: 'Активный пользователь' },
              { coins: 1500, discount: '3%', label: 'Продвинутый уровень' },
              { coins: 2000, discount: '5%', label: 'Эксперт соцсетей' },
              { coins: 3000, discount: '7%', label: 'Мастер активности' },
              { coins: 5000, discount: '10%', label: 'Легенда WEB4TG' }
            ].map((tier, index) => {
              const currentCoins = (userStats?.totalCoins || 0) + totalEarned;
              const isAchieved = currentCoins >= tier.coins;
              
              return (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '20px',
                    borderRadius: '14px',
                    background: isAchieved 
                      ? 'rgba(16, 185, 129, 0.06)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isAchieved 
                      ? '1px solid rgba(16, 185, 129, 0.2)' 
                      : '1px solid rgba(255, 255, 255, 0.04)'
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: isAchieved 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(139, 92, 246, 0.1)',
                    flexShrink: 0
                  }}>
                    {isAchieved ? (
                      <CheckCircle size={20} color="#10B981" />
                    ) : (
                      <Coins size={20} color="#A78BFA" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#FAFAFA',
                      marginBottom: '4px'
                    }}>
                      {tier.coins} монет = скидка {tier.discount}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: '#71717A',
                      lineHeight: '1.4'
                    }}>
                      {tier.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <p style={{
            fontSize: '12px',
            color: '#52525B',
            marginTop: '16px',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            Скидка применяется к заказу разработки
            <br />
            Telegram Mini App в нашей студии
          </p>
        </section>

        {/* CTA SECTION */}
        <section className="px-7 py-12">
          <div 
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              background: 'rgba(139, 92, 246, 0.2)',
              margin: '0 auto 16px'
            }}>
              <Users size={28} color="#A78BFA" />
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#FAFAFA',
              marginBottom: '8px'
            }}>
              Приглашай друзей
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: '#71717A',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Получай 100 монет за каждого
              <br />
              приглашённого друга
            </p>
            
            <button
              onClick={() => onNavigate('referral')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                background: '#A78BFA',
                border: 'none',
                color: '#09090B',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              data-testid="button-referral-program"
            >
              Пригласить друзей
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* READY TO ORDER */}
        <section className="px-7 py-8 pb-16">
          <p 
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            Готовы заказать?
          </p>
          
          <div 
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}
          >
            <p style={{
              fontSize: '15px',
              fontWeight: 500,
              color: '#E4E4E7',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Накопил монеты? Используй их при заказе разработки Telegram Mini App. Чем больше монет — тем выше скидка на твой проект.
            </p>
            
            <button
              onClick={() => onNavigate('constructor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '14px 24px',
                borderRadius: '12px',
                background: 'transparent',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#A78BFA',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              data-testid="button-order-app"
            >
              Заказать приложение
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

export default PremiumTasksEarningPage;
