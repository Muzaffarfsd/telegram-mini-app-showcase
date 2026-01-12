// Optimized for Telegram Mini App performance
import { useState, useEffect, useCallback, useMemo, memo, startTransition, useRef } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  User, 
  CheckCircle,
  ChevronRight,
  Smartphone,
  Package,
  Clock,
  Send,
  Gift,
  Coins,
  Copy,
  Share2,
  UserPlus,
  Users,
  Wrench
} from "lucide-react";
import { useTelegram } from "../hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "../contexts/LanguageContext";

interface ProfilePageProps {
  onNavigate: (section: string) => void;
}

// iOS 26 Design System Palette
const createProfilePalette = (isDark: boolean) => ({
  surface: isDark ? '#0f0f11' : '#F2F4F6',
  cardBg: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.98)',
  cardBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  cardShadow: isDark ? 'none' : '0 0 0 0.5px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)',
  textPrimary: isDark ? 'rgba(255, 255, 255, 0.9)' : '#000000',
  textSecondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(60, 60, 67, 0.6)',
  textTertiary: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(60, 60, 67, 0.3)',
  textQuaternary: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(60, 60, 67, 0.18)',
  accent: isDark ? '#A78BFA' : '#007AFF',
  hoverBg: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
  activeBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  divider: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  inputBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  inputBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
  btnPrimaryBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
  btnPrimaryBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
  btnGlowBg: isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
  btnGlowBorder: isDark ? 'rgba(255,255,255,0.15)' : 'transparent',
  btnGlowShadow: isDark ? '0 0 20px rgba(255,255,255,0.08), 0 0 40px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.15)' : '0 4px 16px rgba(0,122,255,0.3), 0 1px 3px rgba(0,122,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
  avatarBg: isDark ? '#000000' : 'rgba(0, 0, 0, 0.04)',
  avatarBorder: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0, 0, 0, 0.08)',
  switchBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  switchActiveBg: isDark ? 'rgba(255, 255, 255, 0.25)' : '#34C759',
  progressBg: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.06)',
  cardHighlight: isDark ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.12) 70%, transparent)' : 'none',
  iconBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  iconBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
});

type ProfilePalette = ReturnType<typeof createProfilePalette>;

const UserCard = memo(({ profileData, telegramUser, palette }: { 
  profileData: any, 
  telegramUser: any,
  palette: ProfilePalette 
}) => {
  const photoUrl = telegramUser?.photo_url;
  return (
    <section className="p-6 text-center relative overflow-hidden">
      <div className="relative w-24 h-24 mx-auto z-10">
        <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
          style={{ background: palette.avatarBg, border: `1.5px solid ${palette.avatarBorder}` }}>
          {photoUrl ? <img src={photoUrl} alt={profileData.name} className="w-full h-full object-cover" /> :
            <User className="w-10 h-10" style={{ color: palette.textTertiary }} />}
        </div>
      </div>
      <h2 className="ios-title2 mt-4" style={{ color: palette.textPrimary }}>{profileData.name}</h2>
      {profileData.username && <div className="ios-footnote mt-1" style={{ color: palette.textTertiary }}>{profileData.username}</div>}
    </section>
  );
});

const StatsCard = memo(({ stats, palette, t }: { stats: any, palette: ProfilePalette, t: any }) => (
  <div className="ios26-stats-card grid grid-cols-3 gap-4" style={{ background: palette.cardBg, borderRadius: '20px', padding: '20px' }}>
    {[
      { label: t('profilePage.projects'), value: stats.total, icon: Package, color: 'text-system-blue', bg: 'bg-system-blue/10' },
      { label: t('profilePage.completedCount'), value: stats.completed, icon: CheckCircle, color: 'text-system-green', bg: 'bg-system-green/10' },
      { label: t('profilePage.inWork'), value: stats.inProgress, icon: Clock, color: 'text-system-orange', bg: 'bg-system-orange/10' }
    ].map((s, i) => (
      <div key={i} className="text-center">
        <div className={`w-12 h-12 ${s.bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
          <s.icon className={`w-6 h-6 ${s.color}`} />
        </div>
        <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
        <div className="text-xs mt-1" style={{ color: palette.textTertiary }}>{s.label}</div>
      </div>
    ))}
  </div>
));

export default memo(function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, isAvailable, shareApp, inviteFriend, hapticFeedback } = useTelegram();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const { theme } = useTheme();
  const palette = useMemo(() => createProfilePalette(theme === 'dark'), [theme]);

  const profileData = useMemo(() => ({
    name: user ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : t('profilePage.user'),
    username: user?.username ? `@${user.username}` : null,
    telegramId: user?.id || null,
    joinedAt: user ? t('profilePage.activeInTelegram') : t('profilePage.notConnected')
  }), [user, t]);

  const myReferralCode = useMemo(() => `W4T${(user?.id || 0).toString(36).toUpperCase()}`, [user?.id]);

  useEffect(() => {
    let isMounted = true;
    if (!profileData.telegramId) { setIsLoadingProjects(false); return; }
    fetch(`/api/user-projects/${profileData.telegramId}`).then(res => res.ok ? res.json() : []).then(data => {
      if (isMounted) startTransition(() => { setUserProjects(data); setIsLoadingProjects(false); });
    }).catch(() => { if (isMounted) setIsLoadingProjects(false); });
    return () => { isMounted = false; };
  }, [profileData.telegramId]);

  const stats = useMemo(() => ({
    total: userProjects.length,
    completed: userProjects.filter(p => p.status === 'Готово' || p.progress === 100).length,
    inProgress: userProjects.filter(p => p.status !== 'Готово' && p.progress !== 100).length
  }), [userProjects]);

  return (
    <div className="min-h-screen pb-24 smooth-scroll-page ios26-profile gpu-layer" 
      style={{ paddingTop: '140px', background: palette.surface, color: palette.textSecondary, contain: 'layout' }}>
      <style>{`
        .ios26-profile .ios26-card { background: ${palette.cardBg}; border-radius: 20px; border: 1px solid ${palette.cardBorder}; overflow: hidden; }
        .ios26-profile .ios26-item { padding: 16px; transition: background 0.2s ease; }
        .ios26-profile .ios26-divider { height: 1px; background: ${palette.divider}; margin: 0 16px; }
        .ios26-profile .ios26-btn-glow { background: ${palette.btnGlowBg}; border-radius: 14px; padding: 16px; color: white; display: flex; align-items: center; justify-content: center; gap: 10px; }
      `}</style>
      <div className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-6">
        <UserCard profileData={profileData} telegramUser={user} palette={palette} />
        <section className="space-y-2">
          <div className="text-[13px] font-medium px-1" style={{ color: palette.textTertiary }}>{t('profilePage.activityStats')}</div>
          {isLoadingProjects ? <div className="ios26-card p-6 text-center">Loading...</div> :
            userProjects.length > 0 ? <StatsCard stats={stats} palette={palette} t={t} /> :
            <div className="ios26-card p-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <button className="ios26-btn-glow w-full" onClick={() => onNavigate('constructor')}>{t('profilePage.orderDevelopment')}</button>
            </div>}
        </section>
        <section className="space-y-2">
          <div className="text-[13px] font-medium px-1" style={{ color: palette.textTertiary }}>{t('profilePage.telegramIntegration')}</div>
          <div className="ios26-card">
            <div className="ios26-item flex items-center space-x-3">
              <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center"><Send className="w-5 h-5 text-system-blue" /></div>
              <div className="flex-1"><div className="text-[15px] font-medium">{t('profilePage.interfaceLanguage')}</div></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});