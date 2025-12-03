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
  Edit3, 
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
  Coins,
  Share2,
  QrCode,
  Trophy,
  Flame,
  Target,
  Zap,
  Award,
  Camera
} from "lucide-react";
import { useTelegram } from "../hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";
import { useGamification, type Achievement } from "@/hooks/useGamification";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  GiFlame,
  GiTrophyCup,
  GiTreasureMap,
  GiBinoculars,
  GiRocketFlight,
  GiCutDiamond,
  GiImperialCrown
} from 'react-icons/gi';

interface ProfilePageProps {
  onNavigate: (section: string) => void;
}

const getUserInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return '?';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getGradientForUser = (userId: number | null): string => {
  if (!userId) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
  ];
  return gradients[userId % gradients.length];
};

const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  } catch (e) {}
};

const AnimatedAvatar = memo(({ 
  photoUrl, 
  name, 
  userId, 
  isOnline,
  isPremium,
  onEditClick 
}: { 
  photoUrl?: string;
  name: string;
  userId: number | null;
  isOnline: boolean;
  isPremium?: boolean;
  onEditClick?: () => void;
}) => {
  const initials = getUserInitials(name);
  const gradient = getGradientForUser(userId);
  const [imageError, setImageError] = useState(false);
  const hasPhoto = photoUrl && !imageError;

  return (
    <div className="relative inline-block" data-testid="animated-avatar">
      <div className="avatar-ring-container">
        <svg className="avatar-ring" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="25%" stopColor="#4facfe" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="75%" stopColor="#f093fb" />
              <stop offset="100%" stopColor="#00f2fe" />
            </linearGradient>
          </defs>
          <circle 
            cx="60" 
            cy="60" 
            r="56" 
            fill="none" 
            stroke="url(#avatarGradient)" 
            strokeWidth="3"
            strokeLinecap="round"
            className="avatar-ring-path"
          />
        </svg>
        
        <div 
          className="avatar-image-container"
          data-testid="avatar-content"
        >
          {hasPhoto ? (
            <img 
              src={photoUrl} 
              alt={name}
              className="w-full h-full rounded-full object-cover"
              onError={() => setImageError(true)}
              data-testid="avatar-photo"
            />
          ) : (
            <div 
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{ background: gradient }}
              data-testid="avatar-initials"
            >
              <span className="text-3xl font-bold text-white drop-shadow-lg">{initials}</span>
            </div>
          )}
        </div>

        {isOnline && (
          <div className="avatar-online-status" data-testid="online-status">
            <div className="avatar-online-pulse" />
            <div className="avatar-online-dot" />
          </div>
        )}

        {isPremium && (
          <div className="avatar-premium-badge" data-testid="premium-badge">
            <Crown className="w-3.5 h-3.5 text-yellow-900" />
          </div>
        )}

        {onEditClick && (
          <button 
            className="avatar-edit-button"
            onClick={() => {
              triggerHaptic('light');
              onEditClick();
            }}
            aria-label="Редактировать профиль"
            data-testid="button-edit-avatar"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
});
AnimatedAvatar.displayName = 'AnimatedAvatar';

const GamificationSummary = memo(({ 
  stats, 
  leaderboard,
  achievements,
  onViewAll 
}: { 
  stats: {
    level: number;
    xp: number;
    xpToNextLevel: number;
    streak: { current: number; best: number };
  };
  leaderboard: { position: number; totalUsers: number };
  achievements: Achievement[];
  onViewAll: () => void;
}) => {
  const levelProgress = useMemo(() => 
    Math.min((stats.xp / stats.xpToNextLevel) * 100, 100), 
    [stats.xp, stats.xpToNextLevel]
  );

  const topAchievements = useMemo(() => 
    achievements.filter(a => a.unlocked).slice(0, 4),
    [achievements]
  );

  const achievementIcons: Record<string, React.ReactNode> = useMemo(() => ({
    'compass': <GiTreasureMap className="w-6 h-6 text-amber-400" />,
    'telescope': <GiBinoculars className="w-6 h-6 text-blue-400" />,
    'star': <GiTrophyCup className="w-6 h-6 text-yellow-400" />,
    'flame': <GiFlame className="w-6 h-6 text-orange-400" />,
    'rocket': <GiRocketFlight className="w-6 h-6 text-cyan-400" />,
    'gem': <GiCutDiamond className="w-6 h-6 text-pink-400" />,
    'crown': <GiImperialCrown className="w-6 h-6 text-yellow-400" />,
  }), []);

  return (
    <div className="space-y-4" data-testid="gamification-summary">
      <div className="liquid-glass-card rounded-2xl p-4 gamification-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="level-badge">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{stats.level}</span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Уровень {stats.level}</div>
              <div className="text-white/60 text-xs">{stats.xp} / {stats.xpToNextLevel} XP</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="streak-container" data-testid="streak-counter">
              <div className="fire-icon">
                <GiFlame className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-white font-bold text-lg">{stats.streak.current}</span>
            </div>
            
            <div 
              className="rank-badge"
              data-testid="leaderboard-position"
            >
              <span className="text-xs text-white/70">#</span>
              <span className="text-white font-bold">{leaderboard.position}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Progress 
            value={levelProgress} 
            className="h-2 bg-white/10" 
          />
          <div 
            className="xp-progress-glow"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      {topAchievements.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="ios-list-header text-white/70 font-medium">Достижения</div>
            <button 
              className="text-system-blue text-xs font-medium"
              onClick={() => {
                triggerHaptic('light');
                onViewAll();
              }}
              data-testid="button-view-all-achievements"
            >
              Все
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {topAchievements.map((achievement, index) => (
              <div 
                key={achievement.id}
                className="achievement-mini-card stagger-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`achievement-badge-${achievement.id}`}
              >
                <div className="achievement-icon-mini">
                  {achievementIcons[achievement.icon] || <Award className="w-6 h-6 text-amber-400" />}
                </div>
                <div className="text-[10px] text-white/80 font-medium text-center line-clamp-1 mt-1">
                  {achievement.name}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-[8px] h-4 mt-1 ${
                    achievement.level === 'Platinum' ? 'border-cyan-400/50 text-cyan-300' :
                    achievement.level === 'Gold' ? 'border-yellow-400/50 text-yellow-300' :
                    achievement.level === 'Silver' ? 'border-gray-400/50 text-gray-300' :
                    'border-orange-600/50 text-orange-300'
                  }`}
                >
                  {achievement.level}
                </Badge>
              </div>
            ))}
            
            <button 
              className="achievement-mini-card add-achievement"
              onClick={() => {
                triggerHaptic('light');
                onViewAll();
              }}
              data-testid="button-more-achievements"
            >
              <Plus className="w-6 h-6 text-white/40" />
              <div className="text-[10px] text-white/40 mt-1">Ещё</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
GamificationSummary.displayName = 'GamificationSummary';

const ProfileHeaderActions = memo(({ 
  onEdit, 
  onShare, 
  onSettings 
}: { 
  onEdit: () => void;
  onShare: () => void;
  onSettings: () => void;
}) => (
  <div className="flex items-center gap-2" data-testid="profile-header-actions">
    <button 
      className="header-action-btn"
      onClick={() => { triggerHaptic('light'); onEdit(); }}
      aria-label="Редактировать профиль"
      data-testid="button-edit-profile"
    >
      <Edit3 className="w-5 h-5 text-white/80" />
    </button>
    <button 
      className="header-action-btn"
      onClick={() => { triggerHaptic('light'); onShare(); }}
      aria-label="Поделиться профилем"
      data-testid="button-share-profile"
    >
      <Share2 className="w-5 h-5 text-white/80" />
    </button>
    <button 
      className="header-action-btn"
      onClick={() => { triggerHaptic('light'); onSettings(); }}
      aria-label="Настройки"
      data-testid="button-settings"
    >
      <Settings className="w-5 h-5 text-white/80" />
    </button>
  </div>
));
ProfileHeaderActions.displayName = 'ProfileHeaderActions';

const ReferralPreviewCard = memo(({ 
  invitedCount, 
  onNavigate 
}: { 
  invitedCount: number;
  onNavigate: () => void;
}) => {
  const avatarColors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  const displayCount = Math.min(invitedCount, 5);
  const remainingCount = Math.max(0, invitedCount - 5);

  return (
    <div 
      className="liquid-glass-card rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-all duration-300"
      onClick={() => { triggerHaptic('light'); onNavigate(); }}
      data-testid="referral-preview-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Приглашено друзей</div>
            <div className="text-white/60 text-xs">Зарабатывайте бонусы</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {invitedCount > 0 ? (
            <div className="flex -space-x-2">
              {Array.from({ length: displayCount }).map((_, i) => (
                <div 
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: avatarColors[i % avatarColors.length], zIndex: displayCount - i }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="w-7 h-7 rounded-full border-2 border-black bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  +{remainingCount}
                </div>
              )}
            </div>
          ) : (
            <div className="text-white/40 text-sm">0</div>
          )}
          <ChevronRight className="w-5 h-5 text-white/40" />
        </div>
      </div>
    </div>
  );
});
ReferralPreviewCard.displayName = 'ReferralPreviewCard';

const ProfileSkeleton = memo(() => (
  <div className="space-y-6 animate-pulse" data-testid="profile-skeleton">
    <div className="liquid-glass-card rounded-2xl p-6 text-center">
      <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4 bg-white/10" />
      <Skeleton className="h-6 w-32 mx-auto mb-2 bg-white/10" />
      <Skeleton className="h-4 w-24 mx-auto mb-4 bg-white/10" />
      <Skeleton className="h-10 w-full bg-white/10 rounded-xl" />
    </div>
    
    <div className="liquid-glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl bg-white/10" />
          <div>
            <Skeleton className="h-4 w-20 mb-1 bg-white/10" />
            <Skeleton className="h-3 w-16 bg-white/10" />
          </div>
        </div>
        <Skeleton className="w-16 h-8 rounded-lg bg-white/10" />
      </div>
      <Skeleton className="h-2 w-full rounded bg-white/10" />
    </div>
    
    <div className="liquid-glass-card rounded-2xl p-4">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="text-center">
            <Skeleton className="w-12 h-12 rounded-full mx-auto mb-2 bg-white/10" />
            <Skeleton className="h-5 w-8 mx-auto mb-1 bg-white/10" />
            <Skeleton className="h-3 w-16 mx-auto bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  </div>
));
ProfileSkeleton.displayName = 'ProfileSkeleton';

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

const StatsCard = memo(({ stats }: { stats: { total: number, completed: number, inProgress: number } }) => (
  <div className="liquid-glass-card rounded-2xl p-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center stagger-fade-in" style={{ animationDelay: '0ms' }}>
        <div className="w-12 h-12 bg-system-blue/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Package className="w-6 h-6 text-system-blue" />
        </div>
        <div className="ios-title3 font-bold text-system-blue">{stats.total}</div>
        <div className="ios-caption2 text-white/70">Проектов</div>
      </div>
      <div className="text-center stagger-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="w-12 h-12 bg-system-green/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-6 h-6 text-system-green" />
        </div>
        <div className="ios-title3 font-bold text-system-green">{stats.completed}</div>
        <div className="ios-caption2 text-white/70">Завершено</div>
      </div>
      <div className="text-center stagger-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="w-12 h-12 bg-system-orange/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Clock className="w-6 h-6 text-system-orange" />
        </div>
        <div className="ios-title3 font-bold text-system-orange">{stats.inProgress}</div>
        <div className="ios-caption2 text-white/70">В работе</div>
      </div>
    </div>
  </div>
));
StatsCard.displayName = 'StatsCard';

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

const SettingsItem = memo(({ 
  icon: Icon, 
  iconBg, 
  iconColor, 
  title, 
  subtitle, 
  onClick, 
  rightElement,
  isLast = false,
  testId
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
  testId: string;
}) => (
  <div 
    className={`p-4 ${!isLast ? 'border-b border-white/10' : ''} ${onClick ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
    onClick={onClick ? () => { triggerHaptic('light'); onClick(); } : undefined}
    data-testid={testId}
  >
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <div className="ios-body text-white font-semibold">{title}</div>
        <div className="ios-footnote text-white/70">{subtitle}</div>
      </div>
      {rightElement || (onClick && <ChevronRight className="w-5 h-5 text-white/40" />)}
    </div>
  </div>
));
SettingsItem.displayName = 'SettingsItem';

const ToggleSwitch = memo(({ enabled, onToggle, testId }: { enabled: boolean; onToggle: () => void; testId: string }) => (
  <div 
    className={`ios-switch ${enabled ? 'ios-switch-active' : ''} cursor-pointer`}
    onClick={() => { triggerHaptic('light'); onToggle(); }}
    data-testid={testId}
    role="switch"
    aria-checked={enabled}
  >
    <div className="ios-switch-thumb" />
  </div>
));
ToggleSwitch.displayName = 'ToggleSwitch';

function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, isAvailable, homeScreen } = useTelegram();
  const { toast } = useToast();
  const { stats: gamificationStats, leaderboard, dailyTasks } = useGamification();
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [referralCount, setReferralCount] = useState(0);

  const profileData = useMemo(() => ({
    name: user ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 'Пользователь',
    username: user?.username ? `@${user.username}` : null,
    telegramId: user?.id || null,
    photoUrl: user?.photo_url,
    language: user?.language_code || 'ru',
    joinedAt: user ? 'Активен в Telegram' : 'Не подключен',
    isPremium: false
  }), [user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));

      if (profileData.telegramId) {
        try {
          const [projectsRes, referralRes] = await Promise.allSettled([
            fetch(`/api/user-projects/${profileData.telegramId}`),
            fetch(`/api/referrals/${profileData.telegramId}`)
          ]);
          
          if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
            const projects = await projectsRes.value.json();
            startTransition(() => setUserProjects(projects));
          }
          
          if (referralRes.status === 'fulfilled' && referralRes.value.ok) {
            const referralData = await referralRes.value.json();
            setReferralCount(referralData.totalReferrals || 3);
          } else {
            setReferralCount(3);
          }
        } catch (error) {
          console.log('Data loading error, using defaults');
          setReferralCount(3);
        }
      }
      
      setIsLoading(false);
    };

    loadData();
  }, [profileData.telegramId]);

  const projectStats = useMemo(() => ({
    total: userProjects.length,
    completed: userProjects.filter(p => p.status === 'Готово' || p.status === 'Завершен' || p.progress === 100).length,
    inProgress: userProjects.filter(p => p.status !== 'Готово' && p.status !== 'Завершен' && p.progress !== 100).length
  }), [userProjects]);

  const languageDisplay = useMemo(() => {
    switch (profileData.language) {
      case 'ru': return 'Русский';
      case 'en': return 'English';
      default: return profileData.language || 'Русский';
    }
  }, [profileData.language]);

  const handleNavigateConstructor = useCallback(() => onNavigate('constructor'), [onNavigate]);
  const handleNavigateHelp = useCallback(() => onNavigate('help'), [onNavigate]);
  const handleNavigateReview = useCallback(() => onNavigate('review'), [onNavigate]);
  const handleNavigateReferral = useCallback(() => onNavigate('referral'), [onNavigate]);
  const handleNavigateRewards = useCallback(() => onNavigate('rewards'), [onNavigate]);
  const handleNavigateEarning = useCallback(() => onNavigate('earning'), [onNavigate]);
  
  const handleEditProfile = useCallback(() => {
    toast({ title: "Редактирование профиля", description: "Функция в разработке" });
  }, [toast]);
  
  const handleShareProfile = useCallback(() => {
    const shareUrl = `https://t.me/web4tg_bot?start=profile_${profileData.telegramId}`;
    if (navigator.share) {
      navigator.share({ title: 'Мой профиль WEB4TG', url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Ссылка скопирована", description: "Поделитесь профилем с друзьями" });
    }
  }, [profileData.telegramId, toast]);
  
  const handleSettings = useCallback(() => {
    toast({ title: "Настройки", description: "Раздел в разработке" });
  }, [toast]);

  const handleTelegramClick = useCallback(() => window.open('https://t.me/web4tgs', '_blank'), []);
  const handleInstagramClick = useCallback(() => window.open('https://instagram.com/web4tg', '_blank'), []);
  const handleTikTokClick = useCallback(() => window.open('https://tiktok.com/@web4tg', '_blank'), []);

  const handleAddToHomeScreen = useCallback(() => {
    if (homeScreen) {
      try {
        homeScreen.add();
        toast({
          title: "Добавление на главный экран",
          description: "Следуйте инструкциям браузера",
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
  }, [homeScreen, toast]);

  return (
    <div className="min-h-screen bg-black text-white pb-24" style={{ paddingTop: '100px' }}>
      <style>{`
        .avatar-ring-container {
          position: relative;
          width: 108px;
          height: 108px;
        }
        
        .avatar-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          animation: avatarRingSpin 4s linear infinite;
        }
        
        .avatar-ring-path {
          stroke-dasharray: 280;
          stroke-dashoffset: 40;
        }
        
        @keyframes avatarRingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .avatar-image-container {
          position: absolute;
          top: 6px;
          left: 6px;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        
        .avatar-online-status {
          position: absolute;
          bottom: 6px;
          right: 6px;
          width: 20px;
          height: 20px;
        }
        
        .avatar-online-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid #000;
        }
        
        .avatar-online-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          animation: onlinePulse 2s ease-out infinite;
        }
        
        @keyframes onlinePulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        .avatar-premium-badge {
          position: absolute;
          top: 0;
          right: 0;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #000;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
        }
        
        .avatar-edit-button {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }
        
        .avatar-edit-button:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: translateX(-50%) scale(1.1);
        }
        
        .level-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
          border: 1px solid rgba(251, 191, 36, 0.3);
          padding: 6px 12px;
          border-radius: 12px;
        }
        
        .gamification-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        
        .streak-container {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .fire-icon {
          animation: fireFlicker 0.5s ease-in-out infinite alternate;
        }
        
        @keyframes fireFlicker {
          0% { transform: scale(1) rotate(-2deg); }
          100% { transform: scale(1.1) rotate(2deg); }
        }
        
        .rank-badge {
          display: flex;
          align-items: baseline;
          gap: 2px;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .xp-progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.5), transparent);
          border-radius: 9999px;
          filter: blur(4px);
          pointer-events: none;
        }
        
        .achievement-mini-card {
          flex-shrink: 0;
          width: 80px;
          padding: 12px 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.2s ease;
        }
        
        .achievement-mini-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        
        .achievement-mini-card.add-achievement {
          border-style: dashed;
          cursor: pointer;
        }
        
        .achievement-icon-mini {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .header-action-btn {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .header-action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .header-action-btn:active {
          transform: scale(0.95);
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .stagger-fade-in {
          opacity: 0;
          animation: staggerFadeIn 0.4s ease forwards;
        }
        
        @keyframes staggerFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .profile-section {
          opacity: 0;
          animation: sectionFadeIn 0.5s ease forwards;
        }
        
        @keyframes sectionFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>

      <div className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-6">
        
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <section className="profile-section" style={{ animationDelay: '0ms' }}>
              <div className="liquid-glass-card-elevated rounded-2xl p-6 text-center liquid-glass-shimmer">
                <div className="flex justify-end mb-2">
                  <ProfileHeaderActions 
                    onEdit={handleEditProfile}
                    onShare={handleShareProfile}
                    onSettings={handleSettings}
                  />
                </div>
                
                <div className="flex justify-center mb-4">
                  <AnimatedAvatar 
                    photoUrl={profileData.photoUrl}
                    name={profileData.name}
                    userId={profileData.telegramId}
                    isOnline={isAvailable}
                    isPremium={profileData.isPremium}
                    onEditClick={handleEditProfile}
                  />
                </div>
                
                <h2 className="ios-title2 mb-1 text-white" data-testid="user-name">
                  {profileData.name}
                </h2>
                
                {profileData.username && (
                  <div className="ios-footnote text-system-blue mb-3" data-testid="user-username">
                    {profileData.username}
                  </div>
                )}
                
                <div className="flex items-center justify-center space-x-2 mb-4" data-testid="connection-status">
                  {isAvailable && user ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-system-green" />
                      <span className="ios-footnote text-system-green">Подключен к Telegram</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 text-system-blue" />
                      <span className="ios-footnote text-system-blue">WEB4TG Client</span>
                    </>
                  )}
                </div>

                {profileData.telegramId && (
                  <div className="bg-system-blue/10 backdrop-blur-xl rounded-xl border border-system-blue/30 p-3" data-testid="user-telegram-id">
                    <div className="ios-caption1 text-white/70 mb-1 font-medium">ID пользователя</div>
                    <div className="ios-footnote font-mono text-system-blue font-semibold">#{profileData.telegramId}</div>
                  </div>
                )}
              </div>
            </section>

            <section className="profile-section" style={{ animationDelay: '100ms' }}>
              <GamificationSummary 
                stats={gamificationStats}
                leaderboard={leaderboard}
                achievements={gamificationStats.achievements}
                onViewAll={handleNavigateRewards}
              />
            </section>

            <section className="profile-section" style={{ animationDelay: '200ms' }}>
              <div className="space-y-3">
                <div className="ios-list-header text-white/70 font-medium px-2">Статистика проектов</div>
                {userProjects.length > 0 ? (
                  <StatsCard stats={projectStats} />
                ) : (
                  <div className="liquid-glass-card rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-system-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Rocket className="w-8 h-8 text-system-blue" />
                    </div>
                    <h3 className="ios-body font-bold mb-2 text-white">Создайте первое приложение!</h3>
                    <p className="ios-footnote text-white/70 mb-4 leading-relaxed">
                      Запустите свой бизнес в Telegram уже сегодня
                    </p>
                    <button 
                      className="ios-button-filled w-full"
                      onClick={handleNavigateConstructor}
                      data-testid="button-create-first-project"
                    >
                      Начать сейчас
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="profile-section" style={{ animationDelay: '300ms' }}>
              <div className="space-y-3">
                <div className="ios-list-header text-white/70 font-medium px-2">Бонусы</div>
                <ReferralPreviewCard 
                  invitedCount={referralCount}
                  onNavigate={handleNavigateReferral}
                />
                
                <div className="liquid-glass-card rounded-2xl overflow-hidden">
                  <SettingsItem 
                    icon={Gift}
                    iconBg="bg-amber-500/20"
                    iconColor="text-amber-400"
                    title="Цифровые награды"
                    subtitle="Достижения и бонусы"
                    onClick={handleNavigateRewards}
                    testId="nav-rewards"
                  />
                  <SettingsItem 
                    icon={Coins}
                    iconBg="bg-yellow-500/20"
                    iconColor="text-yellow-400"
                    title="Заработок монет"
                    subtitle="Выполняйте задания"
                    onClick={handleNavigateEarning}
                    isLast
                    testId="nav-earning"
                  />
                </div>
              </div>
            </section>

            <section className="profile-section" style={{ animationDelay: '400ms' }}>
              <div className="space-y-3">
                <div className="ios-list-header text-white/70 font-medium px-2">Telegram</div>
                <div className="liquid-glass-card rounded-2xl overflow-hidden">
                  <SettingsItem 
                    icon={Send}
                    iconBg="bg-system-blue/20"
                    iconColor="text-system-blue"
                    title="Язык интерфейса"
                    subtitle={languageDisplay}
                    testId="setting-language"
                  />
                  <SettingsItem 
                    icon={Smartphone}
                    iconBg="bg-system-green/20"
                    iconColor="text-system-green"
                    title="Статус подключения"
                    subtitle={profileData.joinedAt}
                    rightElement={isAvailable && <CheckCircle className="w-5 h-5 text-system-green" />}
                    isLast
                    testId="setting-connection"
                  />
                </div>
              </div>
            </section>

            <section className="profile-section" style={{ animationDelay: '500ms' }}>
              <div className="space-y-3">
                <div className="ios-list-header text-white/70 font-medium px-2">Настройки</div>
                <div className="liquid-glass-card rounded-2xl overflow-hidden">
                  <SettingsItem 
                    icon={CheckCircle}
                    iconBg="bg-system-green/20"
                    iconColor="text-system-green"
                    title="Автосохранение"
                    subtitle="Каждые 30 секунд"
                    rightElement={<ToggleSwitch enabled={autoSave} onToggle={() => setAutoSave(!autoSave)} testId="toggle-autosave" />}
                    testId="toggle-autosave"
                  />
                  <SettingsItem 
                    icon={Shield}
                    iconBg="bg-system-blue/20"
                    iconColor="text-system-blue"
                    title="Резервные копии"
                    subtitle="В облако"
                    rightElement={<ToggleSwitch enabled={backupEnabled} onToggle={() => setBackupEnabled(!backupEnabled)} testId="toggle-backup" />}
                    testId="toggle-backup"
                  />
                  <SettingsItem 
                    icon={Bell}
                    iconBg="bg-purple-500/20"
                    iconColor="text-purple-400"
                    title="Уведомления"
                    subtitle="О ходе разработки"
                    rightElement={<ToggleSwitch enabled={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} testId="toggle-notifications" />}
                    testId="toggle-notifications"
                  />
                  <SettingsItem 
                    icon={Smartphone}
                    iconBg="bg-emerald-500/20"
                    iconColor="text-emerald-500"
                    title="На главный экран"
                    subtitle="Быстрый доступ"
                    onClick={handleAddToHomeScreen}
                    isLast
                    testId="button-add-homescreen"
                  />
                </div>
              </div>
            </section>

            <section className="profile-section" style={{ animationDelay: '600ms' }}>
              <div className="space-y-3">
                <div className="ios-list-header text-white/70 font-medium px-2">Поддержка</div>
                <div className="liquid-glass-card rounded-2xl overflow-hidden">
                  <SettingsItem 
                    icon={Send}
                    iconBg="bg-system-blue/20"
                    iconColor="text-system-blue"
                    title="Telegram"
                    subtitle="@web4tgs"
                    onClick={handleTelegramClick}
                    rightElement={<ExternalLink className="w-4 h-4 text-white/40" />}
                    testId="link-telegram"
                  />
                  <SettingsItem 
                    icon={Instagram}
                    iconBg="bg-gradient-to-br from-purple-500 to-pink-500"
                    iconColor="text-white/90"
                    title="Instagram"
                    subtitle="@web4tg"
                    onClick={handleInstagramClick}
                    rightElement={<ExternalLink className="w-4 h-4 text-white/40" />}
                    testId="link-instagram"
                  />
                  <SettingsItem 
                    icon={Music}
                    iconBg="bg-white/5 border border-white/20"
                    iconColor="text-white/90"
                    title="TikTok"
                    subtitle="@web4tg"
                    onClick={handleTikTokClick}
                    rightElement={<ExternalLink className="w-4 h-4 text-white/40" />}
                    testId="link-tiktok"
                  />
                  <SettingsItem 
                    icon={HelpCircle}
                    iconBg="bg-system-green/20"
                    iconColor="text-system-green"
                    title="Справка"
                    subtitle="FAQ и инструкции"
                    onClick={handleNavigateHelp}
                    testId="nav-help"
                  />
                  <SettingsItem 
                    icon={Star}
                    iconBg="bg-system-orange/20"
                    iconColor="text-system-orange"
                    title="Оставить отзыв"
                    subtitle="Оцените сервис"
                    onClick={handleNavigateReview}
                    isLast
                    testId="nav-review"
                  />
                </div>
              </div>
            </section>

            <section className="text-center space-y-2 pb-4 profile-section" style={{ animationDelay: '700ms' }}>
              <div className="ios-footnote text-white/40 font-medium">WEB4TG Platform</div>
              <div className="ios-footnote text-white/40">Версия 2.0.0</div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(ProfilePage);
