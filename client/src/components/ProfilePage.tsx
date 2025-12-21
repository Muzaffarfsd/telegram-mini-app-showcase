import { useState, useEffect, useCallback, useMemo, memo, startTransition, useRef } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  User, 
  Settings, 
  MessageCircle, 
  FileText, 
  CreditCard, 
  Home, 
  Calculator, 
  Wrench, 
  Edit, 
  Crown, 
  Star, 
  Smartphone, 
  CheckCircle,
  ChevronRight,
  Phone,
  Mail,
  Building,
  Bell,
  Shield,
  HelpCircle,
  ExternalLink,
  Package,
  Clock,
  TrendingUp,
  Send,
  Instagram,
  Music,
  Sparkles,
  Rocket,
  UserCircle2,
  Plus,
  Users,
  Gift,
  Coins
} from "lucide-react";
import { useTelegram } from "../hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Copy, Share2, UserPlus } from "lucide-react";

// iOS 26 Design System Palette
const createProfilePalette = (isDark: boolean) => ({
  // Surface colors
  surface: isDark ? '#0f0f11' : '#F2F4F6',
  cardBg: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.98)',
  cardBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  cardShadow: isDark ? 'none' : '0 0 0 0.5px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)',
  
  // Text colors (Apple HIG opacity levels)
  textPrimary: isDark ? 'rgba(255, 255, 255, 0.9)' : '#000000',
  textSecondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(60, 60, 67, 0.6)',
  textTertiary: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(60, 60, 67, 0.3)',
  textQuaternary: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(60, 60, 67, 0.18)',
  
  // Accent colors
  accent: isDark ? '#A78BFA' : '#007AFF',
  accentBg: isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(0, 122, 255, 0.1)',
  
  // Interactive states
  hoverBg: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
  activeBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  
  // Dividers and borders
  divider: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  inputBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  inputBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
  
  // Button styles
  btnPrimaryBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
  btnPrimaryBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
  btnGlowBg: isDark 
    ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)' 
    : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
  btnGlowBorder: isDark ? 'rgba(255,255,255,0.15)' : 'transparent',
  btnGlowShadow: isDark 
    ? '0 0 20px rgba(255,255,255,0.08), 0 0 40px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.15)'
    : '0 4px 16px rgba(0,122,255,0.3), 0 1px 3px rgba(0,122,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
  
  // Avatar
  avatarBg: isDark ? '#000000' : 'rgba(0, 0, 0, 0.04)',
  avatarBorder: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0, 0, 0, 0.08)',
  
  // Switch
  switchBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  switchActiveBg: isDark ? 'rgba(255, 255, 255, 0.25)' : '#34C759',
  
  // Progress
  progressBg: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.06)',
  
  // Top highlight (cards)
  cardHighlight: isDark 
    ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.12) 70%, transparent)'
    : 'none',
  
  // Icon backgrounds
  iconBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  iconBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
});

interface ProfilePageProps {
  onNavigate: (section: string) => void;
}

// Memoized Status Icon Component
const StatusIcon = memo(({ status }: { status: string }) => {
  switch (status) {
    case 'Готово':
    case 'Завершен':
      return <CheckCircle className="w-4 h-4 text-system-green" />;
    case 'В разработке':
    case 'Разработка':
      return <Clock className="w-4 h-4 text-system-orange" />;
    case 'Планирование':
    case 'Оплачено':
      return <Package className="w-4 h-4 text-system-blue" />;
    default:
      return <Clock className="w-4 h-4 text-secondary-label" />;
  }
});
StatusIcon.displayName = 'StatusIcon';

// Helper function to get user initials
const getUserInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return '?';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Helper function to generate gradient color based on user ID
const getGradientForUser = (userId: number | null): string => {
  if (!userId) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Cyan-Purple
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', // Orange-Pink
  ];
  
  return gradients[userId % gradients.length];
};

// Memoized User Card Component
const UserCard = memo(({ profileData, isAvailable, telegramUser }: { profileData: any, isAvailable: boolean, telegramUser: any }) => {
  const hasValidUser = !!telegramUser && !!telegramUser.first_name;
  const initials = getUserInitials(profileData.name);
  const photoUrl = telegramUser?.photo_url;
  
  return (
    <section className="p-6 text-center relative overflow-hidden">
      {/* User Avatar - Premium minimal style */}
      <div className="relative w-24 h-24 mx-auto z-10" data-testid="user-avatar">
        <div 
          className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden"
          style={{
            border: '1.5px solid rgba(255,255,255,0.2)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5)'
          }}
          data-testid="avatar-container"
        >
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={profileData.name}
              className="w-full h-full object-cover"
              data-testid="avatar-image"
            />
          ) : hasValidUser ? (
            <span className="text-3xl font-bold text-white/80">{initials}</span>
          ) : (
            <User className="w-10 h-10 text-white/50" />
          )}
        </div>
      </div>
      
      {/* User name */}
      <h2 className="ios-title2 mt-4 text-white" data-testid="user-name">
        {profileData.name}
      </h2>
      
      {profileData.username && (
        <div className="ios-footnote text-white/50 mt-1" data-testid="user-username">
          {profileData.username}
        </div>
      )}
    </section>
  );
});
UserCard.displayName = 'UserCard';

// Memoized Stats Card Component - iOS 26 Style
const StatsCard = memo(({ stats }: { stats: { total: number, completed: number, inProgress: number } }) => (
  <div className="ios26-stats-card">
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-system-blue/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Package className="w-6 h-6 text-system-blue" />
        </div>
        <div className="text-2xl font-semibold text-system-blue">{stats.total}</div>
        <div className="text-xs text-white/50 mt-1">Проектов</div>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-system-green/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-6 h-6 text-system-green" />
        </div>
        <div className="text-2xl font-semibold text-system-green">{stats.completed}</div>
        <div className="text-xs text-white/50 mt-1">Завершено</div>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-system-orange/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Clock className="w-6 h-6 text-system-orange" />
        </div>
        <div className="text-2xl font-semibold text-system-orange">{stats.inProgress}</div>
        <div className="text-xs text-white/50 mt-1">В работе</div>
      </div>
    </div>
  </div>
));
StatsCard.displayName = 'StatsCard';

// Memoized Project Item Component
const ProjectItem = memo(({ project, isLast }: { project: any, isLast: boolean }) => (
  <div className={`p-4 ${!isLast ? 'border-b border-white/10' : ''}`}>
    <div className="flex items-center space-x-3">
      <StatusIcon status={project.status} />
      <div className="flex-1">
        <div className="ios-body font-bold text-white">{project.name}</div>
        <div className="flex items-center space-x-2">
          <span className={`ios-caption2 font-semibold ${
            project.status === 'Готово' || project.status === 'Завершен' ? 'text-system-green' :
            project.status === 'В разработке' || project.status === 'Разработка' ? 'text-system-orange' :
            'text-system-blue'
          }`}>
            {project.status}
          </span>
          <span className="ios-caption2 text-white/40">•</span>
          <span className="ios-caption2 text-white/70 font-medium">{project.progress || 0}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              project.status === 'Готово' || project.status === 'Завершен' ? 'bg-system-green' : 
              project.status === 'В разработке' || project.status === 'Разработка' ? 'bg-system-orange' : 
              'bg-system-blue'
            }`}
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-white/40" />
    </div>
  </div>
));
ProjectItem.displayName = 'ProjectItem';

// Virtualized Projects List Component
const ProjectsVirtualList = memo(({ projects, onNavigateConstructor }: { 
  projects: any[], 
  onNavigateConstructor: () => void 
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: projects.length + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 3,
  });

  return (
    <section>
      <div className="space-y-3">
        <div className="ios-list-header text-white/70 font-medium px-2">Мои проекты</div>
        
        <div 
          ref={parentRef}
          className="liquid-glass-card rounded-2xl overflow-auto"
          style={{ maxHeight: '400px' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLast = virtualRow.index === projects.length;
              
              if (isLast) {
                return (
                  <div
                    key="add-project"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="p-4 border-t border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={onNavigateConstructor}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-system-blue" />
                        </div>
                        <div className="flex-1">
                          <div className="ios-body font-bold text-system-blue">Создать новый проект</div>
                          <div className="ios-footnote text-white/70">Запустите еще одно приложение</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      </div>
                    </div>
                  </div>
                );
              }
              
              const project = projects[virtualRow.index];
              return (
                <div
                  key={project.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <ProjectItem project={project} isLast={virtualRow.index === projects.length - 1} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});
ProjectsVirtualList.displayName = 'ProjectsVirtualList';

// Generate referral code from user ID
const generateReferralCode = (userId: number | null): string => {
  if (!userId) return 'WEB4TG';
  const base = userId.toString(36).toUpperCase();
  return `W4T${base}`;
};

// Profile Page Component
function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, isAvailable, homeScreen, shareApp, inviteFriend, hapticFeedback } = useTelegram();
  const { toast } = useToast();
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [friendReferralCode, setFriendReferralCode] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  // Memoized profile data
  const profileData = useMemo(() => ({
    name: user ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 'Пользователь',
    username: user?.username ? `@${user.username}` : null,
    telegramId: user?.id || null,
    language: user?.language_code || 'ru',
    joinedAt: user ? 'Активен в Telegram' : 'Не подключен'
  }), [user]);

  // Generate user's referral code
  const myReferralCode = useMemo(() => generateReferralCode(user?.id || null), [user?.id]);
  
  // Copy referral code to clipboard
  const handleCopyReferralCode = useCallback(() => {
    navigator.clipboard.writeText(myReferralCode);
    hapticFeedback?.light();
    toast({
      title: "Код скопирован",
      description: `Ваш реферальный код: ${myReferralCode}`,
    });
  }, [myReferralCode, hapticFeedback, toast]);

  // Invite friend with referral code - uses native Telegram deep link
  const handleInviteFriend = useCallback(() => {
    console.log('[Profile] Invite friend clicked, code:', myReferralCode);
    
    const result = inviteFriend(myReferralCode);
    
    if (result.success) {
      toast({
        title: "Приглашение отправлено",
        description: `Ваш реферальный код ${myReferralCode} добавлен в ссылку`,
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось открыть Telegram. Попробуйте скопировать код вручную.",
        variant: "destructive",
      });
    }
  }, [myReferralCode, inviteFriend, toast]);

  // Share app without referral code
  const handleShareApp = useCallback(() => {
    console.log('[Profile] Share app clicked');
    
    const result = shareApp('Посмотри WEB4TG - платформа для создания Telegram приложений!');
    
    if (result.success) {
      toast({
        title: "Отправлено",
        description: "Открываю Telegram для отправки...",
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось открыть Telegram",
        variant: "destructive",
      });
    }
  }, [shareApp, toast]);

  // Apply friend's referral code
  const handleApplyReferralCode = useCallback(async () => {
    if (!friendReferralCode.trim()) {
      toast({
        title: "Введите код",
        description: "Пожалуйста, введите реферальный код друга",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingCode(true);
    hapticFeedback?.light();

    try {
      const response = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          referralCode: friendReferralCode.trim().toUpperCase(),
        }),
      });

      if (response.ok) {
        hapticFeedback?.medium();
        toast({
          title: "Код применён",
          description: "Реферальный код успешно активирован!",
        });
        setFriendReferralCode('');
      } else {
        const error = await response.json();
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось применить код",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось применить код. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingCode(false);
    }
  }, [friendReferralCode, user?.id, hapticFeedback, toast]);

  // Fetch projects with transition for smooth UI
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!profileData.telegramId) {
        setIsLoadingProjects(false);
        return;
      }

      try {
        const response = await fetch(`/api/user-projects/${profileData.telegramId}`);
        if (response.ok) {
          const projects = await response.json();
          startTransition(() => {
            setUserProjects(projects);
          });
        } else {
          setUserProjects([]);
        }
      } catch (error) {
        console.log('Проекты не найдены, пользователь новый');
        setUserProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchUserProjects();
  }, [profileData.telegramId]);

  // Memoized stats
  const stats = useMemo(() => ({
    total: userProjects.length,
    completed: userProjects.filter(p => p.status === 'Готово' || p.status === 'Завершен' || p.progress === 100).length,
    inProgress: userProjects.filter(p => p.status !== 'Готово' && p.status !== 'Завершен' && p.progress !== 100).length
  }), [userProjects]);

  // Memoized language display
  const languageDisplay = useMemo(() => {
    switch (profileData.language) {
      case 'ru': return 'Русский';
      case 'en': return 'English';
      default: return profileData.language || 'Русский';
    }
  }, [profileData.language]);

  // Memoized navigation callbacks
  const handleNavigateConstructor = useCallback(() => onNavigate('constructor'), [onNavigate]);
  const handleNavigatePricing = useCallback(() => onNavigate('constructor'), [onNavigate]);
  const handleNavigateHelp = useCallback(() => onNavigate('help'), [onNavigate]);
  const handleNavigateReview = useCallback(() => onNavigate('review'), [onNavigate]);
  const handleNavigateReferral = useCallback(() => onNavigate('referral'), [onNavigate]);
  const handleNavigateRewards = useCallback(() => onNavigate('rewards'), [onNavigate]);
  const handleNavigateEarning = useCallback(() => onNavigate('earning'), [onNavigate]);

  // Memoized external link handlers
  const handleTelegramClick = useCallback(() => window.open('https://t.me/web4tgs', '_blank'), []);
  const handleInstagramClick = useCallback(() => window.open('https://instagram.com/web4tg', '_blank'), []);
  const handleTikTokClick = useCallback(() => window.open('https://tiktok.com/@web4tg', '_blank'), []);
  
  // Toggle handlers
  const toggleAutoSave = useCallback(() => setAutoSave(prev => !prev), []);
  const toggleBackup = useCallback(() => setBackupEnabled(prev => !prev), []);
  const toggleNotifications = useCallback(() => setNotificationsEnabled(prev => !prev), []);

  // iOS 26 Theme Support
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const palette = useMemo(() => createProfilePalette(isDark), [isDark]);

  return (
    <div className="min-h-screen pb-24 smooth-scroll-page ios26-profile" style={{ paddingTop: '140px', background: palette.surface, color: palette.textSecondary }}>
      <style>{`
        .ios26-profile .ios26-card {
          background: ${palette.cardBg};
          backdrop-filter: blur(40px) saturate(150%);
          -webkit-backdrop-filter: blur(40px) saturate(150%);
          border-radius: 20px;
          border: 1px solid ${palette.cardBorder};
          box-shadow: ${palette.cardShadow};
          overflow: hidden;
        }
        .ios26-profile .ios26-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: ${palette.cardHighlight};
          pointer-events: none;
        }
        .ios26-profile .ios26-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${palette.iconBg};
          border: 1px solid ${palette.iconBorder};
          flex-shrink: 0;
        }
        .ios26-profile .ios26-item {
          padding: 16px;
          transition: background 0.2s ease;
        }
        .ios26-profile .ios26-item:hover {
          background: ${palette.hoverBg};
        }
        .ios26-profile .ios26-item:active {
          background: ${palette.activeBg};
        }
        .ios26-profile .ios26-divider {
          height: 1px;
          background: ${palette.divider};
          margin: 0 16px;
        }
        .ios26-profile .ios26-header {
          font-size: 13px;
          font-weight: 500;
          color: ${palette.textTertiary};
          padding: 0 4px;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .ios26-profile .ios26-title {
          font-size: 15px;
          font-weight: 500;
          color: ${palette.textPrimary};
        }
        .ios26-profile .ios26-subtitle {
          font-size: 13px;
          color: ${palette.textTertiary};
          margin-top: 1px;
        }
        .ios26-profile .ios26-stats-card {
          background: ${palette.cardBg};
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 20px;
          border: 1px solid ${palette.cardBorder};
          box-shadow: ${palette.cardShadow};
          padding: 20px;
        }
        .ios26-profile .ios26-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${palette.iconBg};
          margin: 0 auto 10px;
        }
        .ios26-profile .ios26-stat-value {
          font-size: 24px;
          font-weight: 600;
          color: ${palette.textPrimary};
          letter-spacing: -0.02em;
        }
        .ios26-profile .ios26-stat-label {
          font-size: 12px;
          color: ${palette.textTertiary};
          margin-top: 2px;
        }
        .ios26-profile .ios26-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: ${palette.iconBg};
          border-radius: 100px;
          border: 1px solid ${palette.iconBorder};
          font-size: 12px;
          color: ${palette.textSecondary};
        }
        .ios26-profile .ios26-input {
          background: ${palette.inputBg};
          border: 1px solid ${palette.inputBorder};
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          color: ${palette.textPrimary};
          transition: border-color 0.2s ease;
        }
        .ios26-profile .ios26-input:focus {
          border-color: ${palette.accent};
          outline: none;
        }
        .ios26-profile .ios26-input::placeholder {
          color: ${palette.textQuaternary};
        }
        .ios26-profile .ios26-btn-primary {
          background: ${palette.btnPrimaryBg};
          border: 1px solid ${palette.btnPrimaryBorder};
          border-radius: 12px;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 500;
          color: ${palette.textPrimary};
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .ios26-profile .ios26-btn-primary:hover {
          background: ${palette.activeBg};
        }
        .ios26-profile .ios26-btn-primary:active {
          transform: scale(0.98);
        }
        .ios26-profile .ios26-switch {
          width: 51px;
          height: 31px;
          border-radius: 16px;
          background: ${palette.switchBg};
          position: relative;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .ios26-profile .ios26-switch.active {
          background: ${palette.switchActiveBg};
        }
        .ios26-profile .ios26-switch-thumb {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: white;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .ios26-profile .ios26-switch.active .ios26-switch-thumb {
          transform: translateX(20px);
        }
        .ios26-profile .ios26-btn-glow {
          position: relative;
          background: ${palette.btnGlowBg};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${palette.btnGlowBorder};
          border-radius: 14px;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 500;
          color: white;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          overflow: hidden;
          box-shadow: ${palette.btnGlowShadow};
          animation: ${isDark ? 'ios26-pulse-glow 3s ease-in-out infinite' : 'none'};
        }
        .ios26-profile .ios26-btn-glow::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s ease;
          display: ${isDark ? 'block' : 'none'};
        }
        .ios26-profile .ios26-btn-glow:hover {
          transform: translateY(-2px);
        }
        .ios26-profile .ios26-btn-glow:hover::before {
          left: 100%;
        }
        .ios26-profile .ios26-btn-glow:active {
          transform: translateY(0) scale(0.98);
        }
        @keyframes ios26-pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255,255,255,0.08), 0 0 40px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.15);
          }
          50% {
            box-shadow: 0 0 25px rgba(255,255,255,0.12), 0 0 50px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.2);
          }
        }
      `}</style>
      <div className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-6">
        
        {/* User Profile Card */}
        <div className="scroll-fade-in">
          <UserCard profileData={profileData} isAvailable={isAvailable} telegramUser={user} />
        </div>

        {/* Statistics */}
        <section className="scroll-fade-in-delay-1">
          <div className="space-y-2">
            <div className="ios26-header">Статистика активности</div>
            
            {isLoadingProjects ? (
              <div className="ios26-card relative p-6 text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3"></div>
                <div className="text-[13px] text-white/40">Загружаем ваши проекты...</div>
              </div>
            ) : userProjects.length > 0 ? (
              <StatsCard stats={stats} />
            ) : (
              <div className="ios26-card relative p-6 text-center">
                <div className="ios26-stat-icon mx-auto mb-4" style={{ width: '56px', height: '56px' }}>
                  <Package className="w-7 h-7 text-white/50" />
                </div>
                <h3 className="text-[17px] font-semibold mb-2 text-white/90">Ваши конкуренты уже в Telegram</h3>
                <p className="text-[13px] text-white/50 mb-5 leading-relaxed">
                  Пока вы думаете — они забирают ваших клиентов. Запустите своё приложение за 7 дней и получайте заявки 24/7.
                </p>
                <button 
                  className="ios26-btn-glow w-full mb-3"
                  onClick={handleNavigateConstructor}
                >
                  Заказать разработку
                </button>
                <button 
                  className="ios26-btn-primary w-full"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}
                  onClick={handleNavigatePricing}
                >
                  Выбрать шаблон
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Telegram Integration */}
        <section className="scroll-fade-in-delay-2">
          <div className="space-y-2">
            <div className="ios26-header">Интеграция с Telegram</div>
            
            <div className="ios26-card relative">
              <div className="ios26-item">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                    <Send className="w-5 h-5 text-system-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Язык интерфейса</div>
                    <div className="ios26-subtitle">{languageDisplay}</div>
                  </div>
                </div>
              </div>
              <div className="ios26-divider" />
              <div className="ios26-item">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-green/20 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-system-green" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Статус подключения</div>
                    <div className="ios26-subtitle">{profileData.joinedAt}</div>
                  </div>
                  {isAvailable && <CheckCircle className="w-5 h-5 text-system-green" />}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Referral System Section */}
        <section className="scroll-fade-in-delay-3">
          <div className="space-y-2">
            <div className="ios26-header">Пригласить друзей</div>
            
            <div className="ios26-card relative">
              {/* My Referral Code */}
              <div className="ios26-item">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Ваш реферальный код</div>
                    <div className="ios26-subtitle">Поделитесь с друзьями</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 font-mono text-lg text-emerald-400 text-center tracking-wider">
                    {myReferralCode}
                  </div>
                  <button 
                    onClick={handleCopyReferralCode}
                    className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                    data-testid="button-copy-referral"
                  >
                    <Copy className="w-5 h-5 text-emerald-400" />
                  </button>
                </div>
              </div>
              <div className="ios26-divider" />

              {/* Invite Friend Button */}
              <div className="ios26-item">
                <button 
                  onClick={handleInviteFriend}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  data-testid="button-invite-friend"
                >
                  <UserPlus className="w-5 h-5" />
                  Пригласить друга
                </button>
              </div>
              <div className="ios26-divider" />

              {/* Enter Friend's Code */}
              <div className="ios26-item">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Код друга</div>
                    <div className="ios26-subtitle">Введите реферальный код</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={friendReferralCode}
                    onChange={(e) => setFriendReferralCode(e.target.value.toUpperCase())}
                    placeholder="W4TXXXXXX"
                    className="flex-1 bg-white/10 rounded-xl px-4 py-3 font-mono text-white placeholder-white/30 text-center tracking-wider border border-white/10 focus:border-blue-500/50 focus:outline-none transition-colors"
                    data-testid="input-friend-referral"
                  />
                  <button 
                    onClick={handleApplyReferralCode}
                    disabled={isApplyingCode}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold rounded-xl transition-colors"
                    data-testid="button-apply-referral"
                  >
                    {isApplyingCode ? '...' : 'Применить'}
                  </button>
                </div>
              </div>
              <div className="ios26-divider" />

              {/* Share App Button */}
              <div className="ios26-item">
                <button 
                  onClick={handleShareApp}
                  className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10"
                  data-testid="button-share-app"
                >
                  <Share2 className="w-5 h-5" />
                  Поделиться приложением
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bonuses & Rewards Section */}
        <section className="scroll-fade-in-delay-3">
          <div className="space-y-2">
            <div className="ios26-header">Бонусы и награды</div>
            
            <div className="ios26-card relative">
              <div className="ios26-item cursor-pointer" onClick={handleNavigateReferral}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Реферальная программа</div>
                    <div className="ios26-subtitle">Приглашайте друзей и зарабатывайте</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
              <div className="ios26-divider" />

              <div className="ios26-item cursor-pointer" onClick={handleNavigateRewards}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Цифровые награды</div>
                    <div className="ios26-subtitle">Достижения, уровни и бонусы</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
              <div className="ios26-divider" />

              <div className="ios26-item cursor-pointer" onClick={handleNavigateEarning}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Coins className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Заработок монет</div>
                    <div className="ios26-subtitle">Выполняйте задания и зарабатывайте</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* My Projects */}
        {!isLoadingProjects && userProjects.length > 0 && (
          <ProjectsVirtualList 
            projects={userProjects} 
            onNavigateConstructor={handleNavigateConstructor}
          />
        )}

        {/* Smart Features */}
        <section className="scroll-fade-in-delay-4">
          <div className="space-y-2">
            <div className="ios26-header">Умные функции</div>
            
            <div className="ios26-card relative">
              <div className="ios26-item">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-green/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-system-green" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Автосохранение</div>
                    <div className="ios26-subtitle">Проекты сохраняются каждые 30 секунд</div>
                  </div>
                  <div 
                    className={`ios-switch ${autoSave ? 'ios-switch-active' : ''} cursor-pointer`}
                    onClick={toggleAutoSave}
                  >
                    <div className="ios-switch-thumb"></div>
                  </div>
                </div>
              </div>
              <div className="ios26-divider" />
              
              <div className="ios26-item">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-system-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Резервные копии</div>
                    <div className="ios26-subtitle">Автоматическое резервирование в облако</div>
                  </div>
                  <div 
                    className={`ios-switch ${backupEnabled ? 'ios-switch-active' : ''} cursor-pointer`}
                    onClick={toggleBackup}
                  >
                    <div className="ios-switch-thumb"></div>
                  </div>
                </div>
              </div>
              <div className="ios26-divider" />
              
              <div className="ios26-item">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-purple/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-system-purple" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Уведомления о статусе</div>
                    <div className="ios26-subtitle">Получать обновления о ходе разработки</div>
                  </div>
                  <div 
                    className={`ios-switch ${notificationsEnabled ? 'ios-switch-active' : ''} cursor-pointer`}
                    onClick={toggleNotifications}
                  >
                    <div className="ios-switch-thumb"></div>
                  </div>
                </div>
              </div>
              <div className="ios26-divider" />

              <div className="ios26-item cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-orange/20 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-system-orange" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Тема оформления</div>
                    <div className="ios26-subtitle">Темная тема (автоматически)</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
              <div className="ios26-divider" />

              <div 
                className="ios26-item cursor-pointer"
                onClick={() => {
                  if (homeScreen) {
                    try {
                      homeScreen.add();
                      toast({
                        title: "Добавление на главный экран",
                        description: "Следуйте инструкциям браузера для добавления ярлыка приложения",
                      });
                    } catch (error) {
                      toast({
                        title: "Функция недоступна",
                        description: "Ваша версия Telegram не поддерживает эту функцию",
                        variant: "destructive",
                      });
                    }
                  } else {
                    toast({
                      title: "Функция недоступна",
                      description: "Ваш браузер не поддерживает добавление на главный экран",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Добавить на главный экран</div>
                    <div className="ios26-subtitle">Быстрый доступ к приложению</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <div className="space-y-2">
            <div className="ios26-header">Поддержка</div>
            
            <div className="ios26-card relative">
              <div className="ios26-item cursor-pointer" onClick={handleTelegramClick}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-system-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Связаться с нами</div>
                    <div className="ios26-subtitle">Техподдержка 24/7</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
              <div className="ios26-divider" />
              
              <div className="ios26-item cursor-pointer" onClick={handleTelegramClick}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                    <Send className="w-5 h-5 text-system-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Telegram</div>
                    <div className="ios26-subtitle">@web4tgs</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/40" />
                </div>
              </div>
              <div className="ios26-divider" />
              
              <div className="ios26-item cursor-pointer" onClick={handleInstagramClick}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white/90" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Instagram</div>
                    <div className="ios26-subtitle">@web4tg</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/40" />
                </div>
              </div>
              <div className="ios26-divider" />
              
              <div className="ios26-item cursor-pointer" onClick={handleTikTokClick}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/20">
                    <Music className="w-5 h-5 text-white/90" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">TikTok</div>
                    <div className="ios26-subtitle">@web4tg</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/40" />
                </div>
              </div>
              <div className="ios26-divider" />
              
              <div className="ios26-item cursor-pointer" onClick={handleNavigateHelp}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-green/20 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-system-green" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Справка</div>
                    <div className="ios26-subtitle">FAQ и инструкции</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
              <div className="ios26-divider" />
              
              <div className="ios26-item cursor-pointer" onClick={handleNavigateReview}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-system-orange/20 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-system-orange" />
                  </div>
                  <div className="flex-1">
                    <div className="ios26-title">Оставить отзыв</div>
                    <div className="ios26-subtitle">Оцените наш сервис</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* App Info */}
        <section className="text-center space-y-2 pb-4">
          <div className="ios-footnote text-white/40 font-medium">WEB4TG Platform</div>
          <div className="ios-footnote text-white/40">Версия 1.0.0</div>
        </section>
      </div>
    </div>
  );
}

export default memo(ProfilePage);
