import { memo, useState, useCallback } from 'react';
import { 
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Mail,
  FileText,
  LogOut,
  Smartphone,
  Cloud,
  Star,
  User,
  Settings,
  CreditCard
} from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfilePageProps {
  onNavigate?: (page: string) => void;
}

const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  } catch {}
};

const AppleAvatar = memo(({ 
  photoUrl, 
  name, 
  size = 88 
}: { 
  photoUrl?: string; 
  name: string; 
  size?: number;
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div 
      className="relative"
      style={{ width: size, height: size }}
      data-testid="avatar-container"
    >
      <div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          padding: 1
        }}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-[#1C1C1E]">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={name}
              className="w-full h-full object-cover"
              data-testid="avatar-image"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2C2C2E] to-[#1C1C1E]"
              data-testid="avatar-initials"
            >
              <span 
                className="font-semibold text-white/90"
                style={{ fontSize: size * 0.35 }}
              >
                {initials}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
AppleAvatar.displayName = 'AppleAvatar';

const AppleListRow = memo(({ 
  icon: Icon,
  title,
  subtitle,
  value,
  showChevron = true,
  onClick,
  destructive = false,
  testId
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  value?: string;
  showChevron?: boolean;
  onClick?: () => void;
  destructive?: boolean;
  testId: string;
}) => (
  <button
    className="w-full flex items-center gap-3 py-3 px-4 transition-colors duration-150 active:bg-white/5"
    onClick={() => { triggerHaptic('light'); onClick?.(); }}
    data-testid={testId}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
      destructive ? 'bg-red-500/10' : 'bg-white/5'
    }`}>
      <Icon className={`w-4 h-4 ${destructive ? 'text-red-400' : 'text-white/60'}`} />
    </div>
    <div className="flex-1 text-left">
      <div className={`text-[15px] font-normal ${destructive ? 'text-red-400' : 'text-white/90'}`}>
        {title}
      </div>
      {subtitle && (
        <div className="text-[13px] text-white/40 mt-0.5">{subtitle}</div>
      )}
    </div>
    {value && (
      <span className="text-[15px] text-white/40 mr-1">{value}</span>
    )}
    {showChevron && (
      <ChevronRight className="w-4 h-4 text-white/20" />
    )}
  </button>
));
AppleListRow.displayName = 'AppleListRow';

const AppleToggle = memo(({ 
  enabled, 
  onToggle,
  testId
}: { 
  enabled: boolean; 
  onToggle: () => void;
  testId: string;
}) => (
  <button
    className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ${
      enabled ? 'bg-[#30D158]' : 'bg-white/10'
    }`}
    onClick={(e) => { 
      e.stopPropagation();
      triggerHaptic('light'); 
      onToggle(); 
    }}
    role="switch"
    aria-checked={enabled}
    data-testid={testId}
  >
    <div 
      className={`absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-md transition-transform duration-200 ${
        enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
      }`}
    />
  </button>
));
AppleToggle.displayName = 'AppleToggle';

const AppleListSection = memo(({ 
  title, 
  children 
}: { 
  title?: string; 
  children: React.ReactNode;
}) => (
  <div className="mb-6">
    {title && (
      <div className="text-[13px] text-white/40 uppercase tracking-wide px-4 mb-2">
        {title}
      </div>
    )}
    <div className="bg-[#1C1C1E] rounded-xl overflow-hidden divide-y divide-white/5">
      {children}
    </div>
  </div>
));
AppleListSection.displayName = 'AppleListSection';

const ProfileSkeleton = memo(() => (
  <div className="min-h-screen bg-black px-4 pt-8" data-testid="profile-skeleton">
    <div className="flex flex-col items-center mb-8">
      <Skeleton className="w-[88px] h-[88px] rounded-full bg-white/5" />
      <Skeleton className="h-6 w-32 mt-4 bg-white/5 rounded" />
      <Skeleton className="h-4 w-24 mt-2 bg-white/5 rounded" />
    </div>
    <div className="space-y-6">
      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-4 border-b border-white/5 last:border-0">
            <Skeleton className="w-8 h-8 rounded-lg bg-white/5" />
            <Skeleton className="h-4 w-32 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
));
ProfileSkeleton.displayName = 'ProfileSkeleton';

function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, isAvailable } = useTelegram();
  const { toast } = useToast();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [isLoading] = useState(false);

  const userName = user?.first_name 
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : 'Пользователь';
  
  const userPhoto = user?.photo_url;

  const handleNavigation = useCallback((page: string) => {
    triggerHaptic('light');
    if (onNavigate) {
      onNavigate(page);
    }
  }, [onNavigate]);

  const handleLogout = useCallback(() => {
    triggerHaptic('medium');
    toast({
      title: "Выход",
      description: "Для выхода закройте приложение в Telegram",
    });
  }, [toast]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div 
      className="min-h-screen bg-black"
      data-testid="profile-page"
    >
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <AppleAvatar 
          photoUrl={userPhoto} 
          name={userName}
          size={88}
        />
        
        <h1 
          className="text-[22px] font-semibold text-white mt-4 tracking-tight"
          data-testid="profile-name"
        >
          {userName}
        </h1>
        
        {user?.username && (
          <p 
            className="text-[15px] text-white/50 mt-1"
            data-testid="profile-username"
          >
            @{user.username}
          </p>
        )}

        {isAvailable && (
          <div className="flex items-center gap-1.5 mt-3">
            <div className="w-2 h-2 rounded-full bg-[#30D158]" />
            <span className="text-[13px] text-white/50">Telegram</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-safe-bottom">
        <AppleListSection title="Аккаунт">
          <AppleListRow
            icon={User}
            title="Редактировать профиль"
            onClick={() => handleNavigation('edit-profile')}
            testId="row-edit-profile"
          />
          <AppleListRow
            icon={CreditCard}
            title="Подписка"
            value="Free"
            onClick={() => handleNavigation('subscription')}
            testId="row-subscription"
          />
          <AppleListRow
            icon={Star}
            title="Реферальная программа"
            onClick={() => handleNavigation('referral')}
            testId="row-referral"
          />
        </AppleListSection>

        <AppleListSection title="Настройки">
          <div className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Bell className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-[15px] text-white/90">Уведомления</span>
            </div>
            <AppleToggle 
              enabled={notificationsEnabled} 
              onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
              testId="toggle-notifications"
            />
          </div>
          <div className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Cloud className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-[15px] text-white/90">Синхронизация</span>
            </div>
            <AppleToggle 
              enabled={cloudSyncEnabled} 
              onToggle={() => setCloudSyncEnabled(!cloudSyncEnabled)}
              testId="toggle-cloud-sync"
            />
          </div>
          <AppleListRow
            icon={Shield}
            title="Конфиденциальность"
            onClick={() => handleNavigation('privacy')}
            testId="row-privacy"
          />
          <AppleListRow
            icon={Smartphone}
            title="Устройства"
            value="1"
            onClick={() => handleNavigation('devices')}
            testId="row-devices"
          />
        </AppleListSection>

        <AppleListSection title="Поддержка">
          <AppleListRow
            icon={HelpCircle}
            title="Помощь"
            onClick={() => handleNavigation('help')}
            testId="row-help"
          />
          <AppleListRow
            icon={Mail}
            title="Связаться с нами"
            onClick={() => handleNavigation('contact')}
            testId="row-contact"
          />
          <AppleListRow
            icon={FileText}
            title="Условия использования"
            onClick={() => handleNavigation('terms')}
            testId="row-terms"
          />
        </AppleListSection>

        <AppleListSection>
          <AppleListRow
            icon={Settings}
            title="Дополнительно"
            onClick={() => handleNavigation('advanced')}
            testId="row-advanced"
          />
          <AppleListRow
            icon={LogOut}
            title="Выйти"
            onClick={handleLogout}
            destructive
            showChevron={false}
            testId="row-logout"
          />
        </AppleListSection>

        <div className="text-center py-6">
          <p className="text-[13px] text-white/30">
            Версия 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(ProfilePage);
