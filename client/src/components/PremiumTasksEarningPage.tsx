import { useState, useCallback } from 'react';
import { 
  Coins, CheckCircle, Users, Gift, Zap, 
  Trophy, ExternalLink, Youtube, Send
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
  platform: string;
  title: string;
  description: string;
  coins: number;
  url: string;
  icon: JSX.Element;
  color: string;
  bgColor: string;
}

const socialTasks: SocialTask[] = [
  {
    id: 'youtube_subscribe',
    platform: 'YouTube',
    title: 'Подпишись на YouTube',
    description: 'Смотри обзоры и туториалы',
    coins: 100,
    url: 'https://www.youtube.com/@WEB4TG',
    icon: <Youtube size={22} />,
    color: '#FF0000',
    bgColor: 'rgba(255, 0, 0, 0.1)'
  },
  {
    id: 'telegram_join',
    platform: 'Telegram',
    title: 'Подпишись на Telegram',
    description: 'Новости и анонсы первым',
    coins: 100,
    url: 'https://t.me/web4_tg',
    icon: <Send size={22} />,
    color: '#29B6F6',
    bgColor: 'rgba(41, 182, 246, 0.1)'
  },
  {
    id: 'instagram_follow',
    platform: 'Instagram',
    title: 'Подпишись на Instagram',
    description: 'Красивый контент и сторис',
    coins: 100,
    url: 'https://www.instagram.com/web4tg/',
    icon: <SiInstagram size={22} />,
    color: '#E4405F',
    bgColor: 'rgba(228, 64, 95, 0.1)'
  },
  {
    id: 'tiktok_follow',
    platform: 'TikTok',
    title: 'Подпишись на TikTok',
    description: 'Короткие видео и тренды',
    coins: 100,
    url: 'https://www.tiktok.com/@web4tg',
    icon: <SiTiktok size={22} />,
    color: '#00F2EA',
    bgColor: 'rgba(0, 242, 234, 0.1)'
  }
];

export function PremiumTasksEarningPage({ onNavigate }: TasksEarningPageProps) {
  const { hapticFeedback } = useTelegram();
  const { userStats } = useRewards();
  const { toast } = useToast();
  
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleTaskClick = useCallback((task: SocialTask) => {
    hapticFeedback.light();
    
    window.open(task.url, '_blank');
    
    setTimeout(() => {
      if (!completedTasks.has(task.id)) {
        setCompletedTasks(prev => new Set(prev).add(task.id));
        hapticFeedback.selection();
        toast({
          title: 'Задание выполнено!',
          description: `+${task.coins} монет за подписку на ${task.platform}`,
        });
      }
    }, 3000);
  }, [completedTasks, hapticFeedback, toast]);

  const totalEarned = Array.from(completedTasks).reduce((sum, taskId) => {
    const task = socialTasks.find(t => t.id === taskId);
    return sum + (task?.coins || 0);
  }, 0);

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
            Заработок
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
            Зарабатывай
            <br />
            <span style={{ color: '#F59E0B' }}>монеты</span>
            <br />
            за подписки.
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
            Подпишись на наши соцсети и получи монеты. Чем больше подписок — тем больше наград.
          </p>
        </header>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* BALANCE SECTION */}
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
            Твой баланс
          </p>
          
          <div 
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,179,8,0.04) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                background: 'rgba(245, 158, 11, 0.2)',
              }}>
                <Coins size={28} color="#F59E0B" />
              </div>
              <div>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#FAFAFA',
                  letterSpacing: '-0.03em',
                  lineHeight: 1
                }}>
                  {(userStats?.totalCoins || 0) + totalEarned}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#71717A',
                  marginTop: '4px'
                }}>
                  монет заработано
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TASKS SECTION */}
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
            Задания
          </p>
          
          <div className="space-y-4">
            {socialTasks.map((task) => {
              const isCompleted = completedTasks.has(task.id);
              
              return (
                <button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  disabled={isCompleted}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    borderRadius: '14px',
                    background: isCompleted 
                      ? 'rgba(16, 185, 129, 0.08)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isCompleted 
                      ? '1px solid rgba(16, 185, 129, 0.3)' 
                      : '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: isCompleted ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  data-testid={`button-task-${task.id}`}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: task.bgColor,
                    color: task.color,
                    flexShrink: 0
                  }}>
                    {task.icon}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#FAFAFA',
                      marginBottom: '4px'
                    }}>
                      {task.title}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: '#71717A',
                      lineHeight: '1.4'
                    }}>
                      {task.description}
                    </p>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end',
                    gap: '8px',
                    flexShrink: 0
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      <Coins size={14} color="#F59E0B" />
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        color: '#F59E0B' 
                      }}>
                        +{task.coins}
                      </span>
                    </div>
                    
                    {isCompleted ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#10B981'
                      }}>
                        <CheckCircle size={16} />
                        <span style={{ fontSize: '12px', fontWeight: 500 }}>Готово</span>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#71717A'
                      }}>
                        <ExternalLink size={14} />
                        <span style={{ fontSize: '12px' }}>Открыть</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STATS SECTION */}
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
            Статистика
          </p>
          
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}
          >
            {[
              { value: completedTasks.size, label: 'заданий выполнено', icon: Trophy },
              { value: socialTasks.length - completedTasks.size, label: 'заданий осталось', icon: Zap },
              { value: `${totalEarned}`, label: 'монет сегодня', icon: Coins },
              { value: '400', label: 'максимум монет', icon: Gift }
            ].map((stat, index) => (
              <div 
                key={index}
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  margin: '0 auto 12px'
                }}>
                  <stat.icon size={20} color="#F59E0B" />
                </div>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#FAFAFA',
                  letterSpacing: '-0.03em'
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#52525B',
                  marginTop: '4px'
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* REFERRAL CTA SECTION */}
        <section className="px-7 py-12">
          <div 
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,179,8,0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
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
              background: 'rgba(245, 158, 11, 0.2)',
              margin: '0 auto 16px'
            }}>
              <Users size={28} color="#F59E0B" />
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
              Получай 200 монет за
              <br />
              каждого приглашённого друга
            </p>
            
            <button
              onClick={() => onNavigate('referral')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                background: '#F59E0B',
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
              <Gift size={18} />
            </button>
          </div>
        </section>

        {/* INFO SECTION */}
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
            Как это работает
          </p>
          
          <div 
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '12px',
                color: '#52525B',
                marginBottom: '4px'
              }}>
                Шаг 1
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#FAFAFA'
              }}>
                Нажми на задание
              </p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '12px',
                color: '#52525B',
                marginBottom: '4px'
              }}>
                Шаг 2
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#FAFAFA'
              }}>
                Подпишись на канал
              </p>
            </div>
            
            <div>
              <p style={{
                fontSize: '12px',
                color: '#52525B',
                marginBottom: '4px'
              }}>
                Шаг 3
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#FAFAFA'
              }}>
                Получи монеты автоматически
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default PremiumTasksEarningPage;
