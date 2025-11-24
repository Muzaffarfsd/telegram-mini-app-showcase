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
  const gradient = getGradientForUser(profileData.telegramId);
  
  return (
    <section className="liquid-glass-card-elevated rounded-2xl p-6 text-center liquid-glass-shimmer">
      {/* User Avatar with Initials */}
      <div className="relative w-24 h-24 mx-auto mb-4" data-testid="user-avatar">
        {hasValidUser ? (
          <div 
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg border-2 border-white/20"
            style={{ background: gradient }}
            data-testid="avatar-initials"
          >
            <span className="text-3xl font-bold text-white">{initials}</span>
          </div>
        ) : (
          <div className="w-full h-full bg-system-blue/10 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-system-blue" />
          </div>
        )}
        
        {/* Telegram Status Badge */}
        {isAvailable && hasValidUser && (
          <div 
            className="absolute bottom-0 right-0 w-7 h-7 bg-system-green rounded-full border-2 border-background flex items-center justify-center"
            data-testid="telegram-status-badge"
          >
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <h2 className="ios-title2 mb-2 text-white" data-testid="user-name">
        {profileData.name}
      </h2>
      
      {profileData.username && (
        <div className="ios-footnote text-system-blue mb-3" data-testid="user-username">
          {profileData.username}
        </div>
      )}
      
      <div className="flex items-center justify-center space-x-2 mb-4" data-testid="connection-status">
        {isAvailable && hasValidUser ? (
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
    </section>
  );
});
UserCard.displayName = 'UserCard';

// Memoized Stats Card Component
const StatsCard = memo(({ stats }: { stats: { total: number, completed: number, inProgress: number } }) => (
  <div className="liquid-glass-card rounded-2xl p-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-system-blue/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Package className="w-6 h-6 text-system-blue" />
        </div>
        <div className="ios-title3 font-bold text-system-blue">{stats.total}</div>
        <div className="ios-caption2 text-white/70">Проектов</div>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-system-green/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-6 h-6 text-system-green" />
        </div>
        <div className="ios-title3 font-bold text-system-green">{stats.completed}</div>
        <div className="ios-caption2 text-white/70">Завершено</div>
      </div>
      <div className="text-center">
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

// Profile Page Component
function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, isAvailable, homeScreen } = useTelegram();
  const { toast } = useToast();
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Memoized profile data
  const profileData = useMemo(() => ({
    name: user ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 'Пользователь',
    username: user?.username ? `@${user.username}` : null,
    telegramId: user?.id || null,
    language: user?.language_code || 'ru',
    joinedAt: user ? 'Активен в Telegram' : 'Не подключен'
  }), [user]);

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

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* User Profile Card */}
        <UserCard profileData={profileData} isAvailable={isAvailable} telegramUser={user} />

        {/* Statistics */}
        <section>
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Статистика активности</div>
            
            {isLoadingProjects ? (
              <div className="liquid-glass-card rounded-2xl p-6 text-center">
                <div className="w-8 h-8 border-2 border-system-blue/30 border-t-system-blue rounded-full animate-spin mx-auto mb-3"></div>
                <div className="ios-footnote text-white/70">Загружаем ваши проекты...</div>
              </div>
            ) : userProjects.length > 0 ? (
              <StatsCard stats={stats} />
            ) : (
              <div className="liquid-glass-card rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-system-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-system-blue" />
                </div>
                <h3 className="ios-body font-bold mb-2 text-white">Пора создать первое приложение!</h3>
                <p className="ios-footnote text-white/70 mb-4 leading-relaxed">
                  У вас пока нет проектов. Создайте свое первое Telegram приложение и начните зарабатывать уже сегодня!
                </p>
                <button 
                  className="ios-button-filled w-full mb-3"
                  onClick={handleNavigateConstructor}
                >
                  Создать приложение
                </button>
                <button 
                  className="ios-button-plain w-full"
                  onClick={handleNavigatePricing}
                >
                  Выбрать шаблон
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Telegram Integration */}
        <section>
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Интеграция с Telegram</div>
            
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5 text-system-blue" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Язык интерфейса</div>
                  <div className="ios-footnote text-white/70">{languageDisplay}</div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-green/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-system-green" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Статус подключения</div>
                  <div className="ios-footnote text-white/70">{profileData.joinedAt}</div>
                </div>
                {isAvailable && <CheckCircle className="w-5 h-5 text-system-green" />}
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Bonuses & Rewards Section */}
        <section>
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Бонусы и награды</div>
            
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateReferral}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios-body text-white font-semibold">Реферальная программа</div>
                    <div className="ios-footnote text-white/70">Приглашайте друзей и зарабатывайте</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>

              <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateRewards}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios-body text-white font-semibold">Цифровые награды</div>
                    <div className="ios-footnote text-white/70">Достижения, уровни и бонусы</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>

              <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateEarning}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Coins className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios-body text-white font-semibold">Заработок монет</div>
                    <div className="ios-footnote text-white/70">Выполняйте задания и зарабатывайте</div>
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
        <section>
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Умные функции</div>
            
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-green/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-system-green" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Автосохранение</div>
                  <div className="ios-footnote text-white/70">Проекты сохраняются каждые 30 секунд</div>
                </div>
                <div 
                  className={`ios-switch ${autoSave ? 'ios-switch-active' : ''} cursor-pointer`}
                  onClick={toggleAutoSave}
                >
                  <div className="ios-switch-thumb"></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-system-blue" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Резервные копии</div>
                  <div className="ios-footnote text-white/70">Автоматическое резервирование в облако</div>
                </div>
                <div 
                  className={`ios-switch ${backupEnabled ? 'ios-switch-active' : ''} cursor-pointer`}
                  onClick={toggleBackup}
                >
                  <div className="ios-switch-thumb"></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-purple/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-system-purple" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Уведомления о статусе</div>
                  <div className="ios-footnote text-white/70">Получать обновления о ходе разработки</div>
                </div>
                <div 
                  className={`ios-switch ${notificationsEnabled ? 'ios-switch-active' : ''} cursor-pointer`}
                  onClick={toggleNotifications}
                >
                  <div className="ios-switch-thumb"></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-orange/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-system-orange" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Тема оформления</div>
                  <div className="ios-footnote text-white/70">Темная тема (автоматически)</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>

            <div 
              className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => {
                if (homeScreen) {
                  homeScreen.add();
                  toast({
                    title: "Добавление на главный экран",
                    description: "Следуйте инструкциям браузера для добавления ярлыка приложения",
                  });
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
                  <div className="ios-body text-white font-semibold">Добавить на главный экран</div>
                  <div className="ios-footnote text-white/70">Быстрый доступ к приложению</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Поддержка</div>
            
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleTelegramClick}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-system-blue" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Связаться с нами</div>
                  <div className="ios-footnote text-white/70">Техподдержка 24/7</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleTelegramClick}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5 text-system-blue" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Telegram</div>
                  <div className="ios-footnote text-white/70">@web4tgs</div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleInstagramClick}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white/90" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Instagram</div>
                  <div className="ios-footnote text-white/70">@web4tg</div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleTikTokClick}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/20">
                  <Music className="w-5 h-5 text-white/90" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">TikTok</div>
                  <div className="ios-footnote text-white/70">@web4tg</div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateHelp}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-green/20 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-system-green" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Справка</div>
                  <div className="ios-footnote text-white/70">FAQ и инструкции</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateReview}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-orange/20 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-system-orange" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Оставить отзыв</div>
                  <div className="ios-footnote text-white/70">Оцените наш сервис</div>
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
