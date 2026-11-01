import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ChevronRight, Copy, Plus, Share2, Users } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';
import { ProfileProjectsSkeleton } from './ProfileSkeleton';
import { ProfileGlyph, type ProfileIconName } from './ProfileIcons';
import projectsArtwork from '../assets/profile/projects-v1.webp';
import inviteArtwork from '../assets/profile/invite-v1.webp';
import rewardsArtwork from '../assets/profile/rewards-v1.webp';
import tasksArtwork from '../assets/profile/tasks-v1.webp';
import './ProfilePage.css';
import './ProfileExperience.css';

type Project = {
  id: string | number;
  name: string;
  status: string;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
};
type Props = { onNavigate: (section: string) => void; active: boolean };

function ProfileArtwork({
  src,
  className,
  lazy = false,
}: {
  src: string;
  className?: string;
  lazy?: boolean;
}) {
  return (
    <img
      className={className}
      src={src}
      alt=""
      width="480"
      height="440"
      loading={lazy ? 'lazy' : 'eager'}
      onError={(event) => {
        event.currentTarget.style.visibility = 'hidden';
      }}
    />
  );
}

function Row({
  icon,
  title,
  subtitle,
  onClick,
  external = false,
  trailing,
}: {
  icon: ProfileIconName;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  external?: boolean;
  trailing?: string;
}) {
  const content = (
    <>
      <span className={`profile-row-icon profile-icon-${icon}`}>
        <ProfileGlyph name={icon} />
      </span>
      <span className="profile-row-copy">
        <span className="profile-row-title">{title}</span>
        {subtitle && <span className="profile-row-subtitle">{subtitle}</span>}
      </span>
      {trailing && <span className="profile-row-trailing">{trailing}</span>}
      {onClick &&
        (external ? (
          <ArrowUpRight className="profile-row-chevron" size={16} aria-hidden="true" />
        ) : (
          <ChevronRight className="profile-row-chevron" size={17} aria-hidden="true" />
        ))}
    </>
  );
  return onClick ? (
    <button type="button" className="profile-row" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="profile-row">{content}</div>
  );
}

function ProjectRow({ project, ru }: { project: Project; ru: boolean }) {
  const progress =
    typeof project.progress === 'number' && Number.isFinite(project.progress)
      ? Math.max(0, Math.min(100, project.progress))
      : null;
  const date = project.updatedAt || project.createdAt;
  const parsedDate = date ? new Date(date) : null;
  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? new Intl.DateTimeFormat(ru ? 'ru-RU' : 'en', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(parsedDate)
      : null;
  const englishStatuses: Record<string, string> = {
    Готово: 'Ready',
    Завершен: 'Completed',
    'В разработке': 'In progress',
    Разработка: 'In progress',
    Планирование: 'Planning',
    Оплачено: 'Paid',
  };
  const status =
    (ru ? project.status : englishStatuses[project.status] || project.status) ||
    (ru ? 'Статус не указан' : 'Status unavailable');
  return (
    <details className="profile-project-detail">
      <summary className="profile-project">
        <span className="profile-row-icon profile-icon-folder">
          <ProfileGlyph name="folder" />
        </span>
        <span className="profile-row-copy">
          <strong>{project.name}</strong>
          <small>
            {status}
            {progress !== null ? ` · ${progress}%` : ''}
          </small>
        </span>
        <ChevronRight className="profile-project-chevron" size={17} aria-hidden="true" />
      </summary>
      <div className="profile-project-expanded">
        <div className="profile-project-meta">
          <span>{ru ? 'Статус' : 'Status'}</span>
          <strong>{status}</strong>
        </div>
        {progress !== null && (
          <>
            <div className="profile-project-meta">
              <span>{ru ? 'Готовность' : 'Progress'}</span>
              <strong>{progress}%</strong>
            </div>
            <progress
              className="profile-progress"
              value={progress}
              max={100}
              aria-label={ru ? `Готовность: ${progress}%` : `Progress: ${progress}%`}
            />
          </>
        )}
        {formattedDate && (
          <div className="profile-project-meta">
            <span>{project.updatedAt ? (ru ? 'Обновлён' : 'Updated') : ru ? 'Создан' : 'Created'}</span>
            <strong>{formattedDate}</strong>
          </div>
        )}
      </div>
    </details>
  );
}

function ProfilePage({ onNavigate, active }: Props) {
  const { user, initData, isAvailable, webApp, homeScreen, shareApp, inviteFriend, hapticFeedback } =
    useTelegram();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const ru = language === 'ru';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(!!user?.id);
  const [projectsError, setProjectsError] = useState<'auth' | 'unavailable' | null>(null);
  const [projectsReload, setProjectsReload] = useState(0);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState<'missing' | 'unavailable' | null>(null);
  const [referralReload, setReferralReload] = useState(0);
  const [referralInitializing, setReferralInitializing] = useState(false);
  const referralInitializingRef = useRef(false);
  const [friendCode, setFriendCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [applying, setApplying] = useState(false);
  const applyingRef = useRef(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [iconArtReady, setIconArtReady] = useState(false);
  const name = user
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : t('profilePage.user');
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const completed = useMemo(
    () =>
      projects.filter((p) => p.status === 'Готово' || p.status === 'Завершен' || p.progress === 100).length,
    [projects],
  );

  useEffect(() => {
    const image = new Image();
    let cancelled = false;
    let frame = 0;
    image.onload = () => {
      const decoded = typeof image.decode === 'function' ? image.decode() : Promise.resolve();
      decoded
        .then(() => {
          if (!cancelled)
            frame = requestAnimationFrame(() => {
              if (!cancelled)
                frame = requestAnimationFrame(() => {
                  if (!cancelled) setIconArtReady(true);
                });
            });
        })
        .catch(() => {
          if (!cancelled) setIconArtReady(false);
        });
    };
    image.onerror = () => setIconArtReady(false);
    image.src = `${import.meta.env.BASE_URL}profile-icons-selected.webp`;
    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    if (!user?.id) {
      setLoading(false);
      setProjects([]);
      setProjectsError(null);
      return;
    }
    if (!initData) {
      setLoading(false);
      setProjects([]);
      setProjectsError('auth');
      return;
    }
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);
    setLoading(true);
    setProjectsError(null);
    fetch(`/api/user-projects/${user.id}`, {
      headers: { 'x-telegram-init-data': initData },
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) throw new Error('telegram-auth');
        if (!response.ok) throw new Error('Projects unavailable');
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Invalid projects response');
        setProjects(data);
      })
      .catch((error) => {
        if (timedOut || error.name !== 'AbortError') {
          setProjects([]);
          setProjectsError(error.message === 'telegram-auth' ? 'auth' : 'unavailable');
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!controller.signal.aborted || timedOut) setLoading(false);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [active, user?.id, initData, projectsReload]);

  useEffect(() => {
    if (!active) return;
    if (!user?.id || !initData) {
      setReferralCode(null);
      setReferralLoading(false);
      setReferralError(null);
      return;
    }
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);
    setReferralLoading(true);
    setReferralError(null);
    setReferralCode(null);
    fetch(`/api/referrals/stats/${user.id}`, {
      headers: { 'x-telegram-init-data': initData },
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 404) throw new Error('referral-user-missing');
        if (!response.ok) throw new Error('Referral unavailable');
        return response.json();
      })
      .then((data) => {
        if (typeof data.referralCode !== 'string' || !data.referralCode.trim())
          throw new Error('Invalid referral code');
        setReferralCode(data.referralCode);
      })
      .catch((error) => {
        if (timedOut || error.name !== 'AbortError')
          setReferralError(error.message === 'referral-user-missing' ? 'missing' : 'unavailable');
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!controller.signal.aborted || timedOut) setReferralLoading(false);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [active, user?.id, initData, referralReload]);

  const copyCode = async () => {
    if (!referralCode) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(referralCode);
      hapticFeedback?.light();
      toast({
        title: t('profilePage.codeCopied'),
        description: `${t('profilePage.yourReferralCodeIs')} ${referralCode}`,
      });
    } catch {
      toast({
        title: t('profilePage.error'),
        description: ru ? 'Не удалось скопировать код' : 'Could not copy the code',
        variant: 'destructive',
      });
    }
  };
  const share = (withReferral: boolean) => {
    if (withReferral && !referralCode) return;
    const result = withReferral ? inviteFriend(referralCode!) : shareApp(t('profilePage.shareAppMessage'));
    toast(
      result.success
        ? {
            title: ru ? 'Открываем Telegram' : 'Opening Telegram',
            description: withReferral ? t('profilePage.codeAddedToLink') : undefined,
          }
        : {
            title: t('profilePage.error'),
            description: t('profilePage.telegramOpenError'),
            variant: 'destructive',
          },
    );
  };
  const getCsrfToken = async () => {
    const tokenResponse = await fetch('/api/csrf-token', {
      headers: { 'x-telegram-init-data': initData },
      credentials: 'include',
    });
    if (!tokenResponse.ok)
      throw new Error(
        ru
          ? 'Не удалось подготовить запрос. Попробуйте позже.'
          : 'Could not prepare the request. Try again later.',
      );
    const tokenData = await tokenResponse.json();
    if (typeof tokenData.token !== 'string' || !tokenData.token)
      throw new Error(t('profilePage.applyCodeLater'));
    return tokenData.token as string;
  };
  const connectReferral = async () => {
    if (!user?.id || !initData || referralInitializingRef.current) return;
    referralInitializingRef.current = true;
    setReferralInitializing(true);
    try {
      const token = await getCsrfToken();
      const response = await fetch('/api/referrals/user/init', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData,
          'x-csrf-token': token,
        },
        body: '{}',
      });
      if (!response.ok) throw new Error(t('profilePage.applyCodeLater'));
      const data = await response.json();
      if (typeof data.referralCode !== 'string' || !data.referralCode.trim())
        throw new Error(t('profilePage.applyCodeLater'));
      setReferralCode(data.referralCode);
      setReferralError(null);
    } catch {
      setReferralError('unavailable');
    } finally {
      referralInitializingRef.current = false;
      setReferralInitializing(false);
    }
  };
  const applyCode = async () => {
    const normalizedCode = friendCode.trim().toUpperCase();
    if (!normalizedCode || !user?.id || !initData || !referralCode || applyingRef.current) return;
    if (!/^[A-Z0-9]{4,50}$/.test(normalizedCode)) {
      setCodeError(ru ? 'Введите код из латинских букв и цифр' : 'Use letters A–Z and numbers');
      return;
    }
    if (normalizedCode === referralCode?.toUpperCase()) {
      setCodeError(ru ? 'Нельзя применить собственный код' : 'You cannot use your own code');
      return;
    }
    setCodeError('');
    applyingRef.current = true;
    setApplying(true);
    try {
      const token = await getCsrfToken();
      const response = await fetch('/api/referral/apply', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData,
          'x-csrf-token': token,
        },
        body: JSON.stringify({ userId: user.id, referralCode: normalizedCode }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || t('profilePage.applyCodeError'));
      }
      setFriendCode('');
      hapticFeedback?.medium();
      toast({
        title: t('profilePage.codeApplied'),
        description: ru
          ? 'Код принят. Статус бонуса появится в реферальной программе.'
          : 'Code accepted. Check the referral program for reward status.',
      });
    } catch (error) {
      setCodeError(error instanceof Error ? error.message : t('profilePage.applyCodeLater'));
    } finally {
      applyingRef.current = false;
      setApplying(false);
    }
  };
  const addToHome = () => {
    try {
      if (!webApp?.addToHomeScreen) throw new Error('Unavailable');
      homeScreen.add();
      toast({
        title: t('profilePage.addingToHomeScreen'),
        description: t('profilePage.followBrowserInstructions'),
      });
    } catch {
      toast({
        title: t('profilePage.featureUnavailable'),
        description: t('profilePage.browserNotSupported'),
        variant: 'destructive',
      });
    }
  };
  const openExternal = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  return (
    <main className={`profile-page${iconArtReady ? ' has-icon-art' : ''}`} data-testid="profile-page">
      <div className="profile-content">
        <h1 className="profile-visually-hidden">{ru ? 'Профиль' : 'Profile'}</h1>

        <section className="profile-identity" aria-label={ru ? 'Ваш профиль' : 'Your profile'}>
          <div className="profile-avatar" data-testid="user-avatar">
            {user?.photo_url && !photoFailed ? (
              <img src={user.photo_url} alt="" onError={() => setPhotoFailed(true)} />
            ) : user ? (
              <span>{initials}</span>
            ) : (
              <ProfileGlyph name="user" />
            )}
          </div>
          <div className="profile-identity-copy">
            <h2 data-testid="user-name">{name}</h2>
            <p data-testid="user-username">
              {user?.username
                ? `@${user.username}`
                : user
                  ? t('profilePage.activeInTelegram')
                  : ru
                    ? 'Откройте приложение в Telegram'
                    : 'Open the app in Telegram'}
            </p>
            {(!user || !isAvailable) && (
              <span className="profile-status profile-status-guest">
                <span />
                {ru ? 'Гостевой режим' : 'Guest mode'}
              </span>
            )}
          </div>
        </section>

        <section className="profile-section profile-project-section" aria-labelledby="profile-projects-title">
          <div className="profile-project-card">
            <div className="profile-project-hero">
              <div className="profile-project-intro">
                <span className="profile-kicker">{ru ? 'ВАШЕ ПРОСТРАНСТВО' : 'YOUR SPACE'}</span>
                <h2 id="profile-projects-title">{t('profilePage.myProjects')}</h2>
                <p>
                  {ru
                    ? 'Все ваши приложения и их статус в одном месте.'
                    : 'Your apps and their progress, all in one place.'}
                </p>
              </div>
              <ProfileArtwork className="profile-project-art" src={projectsArtwork} />
            </div>
            {loading ? (
              <ProfileProjectsSkeleton label={t('profilePage.loadingProjects')} />
            ) : projectsError ? (
              <div className="profile-empty profile-project-error">
                <span className="profile-empty-icon profile-icon-folder">
                  <ProfileGlyph name="folder" />
                </span>
                <div>
                  <h3>{ru ? 'Ваши проекты' : 'Your projects'}</h3>
                  <p role="alert">
                    {projectsError === 'auth'
                      ? ru
                        ? 'Не удалось подтвердить вход в Telegram. Закройте и снова откройте приложение.'
                        : 'Could not verify your Telegram session. Close and reopen the app.'
                      : ru
                        ? 'Не удалось загрузить проекты.'
                        : 'Could not load projects.'}
                  </p>
                </div>
                <button
                  type="button"
                  className="profile-text-button"
                  onClick={() => setProjectsReload((n) => n + 1)}
                >
                  {ru ? 'Попробовать снова' : 'Try again'}
                </button>
              </div>
            ) : projects.length ? (
              <>
                <div className="profile-stats">
                  <div>
                    <strong>{projects.length}</strong>
                    <span>{t('profilePage.projects')}</span>
                  </div>
                  <div>
                    <strong>{completed}</strong>
                    <span>{t('profilePage.completedCount')}</span>
                  </div>
                  <div>
                    <strong>{projects.length - completed}</strong>
                    <span>{t('profilePage.inWork')}</span>
                  </div>
                </div>
                <div className="profile-project-list">
                  <div className="profile-project-list-heading">
                    <span>{ru ? 'Ваши приложения' : 'Your apps'}</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('constructor')}
                      aria-label={t('profilePage.createNewProject')}
                    >
                      <Plus size={16} aria-hidden="true" />
                      {ru ? 'Добавить' : 'Add'}
                    </button>
                  </div>
                  {projects.map((project) => (
                    <ProjectRow key={project.id} project={project} ru={ru} />
                  ))}
                </div>
              </>
            ) : (
              <div className="profile-empty">
                <span className="profile-empty-icon profile-icon-folder">
                  <ProfileGlyph name="folder" />
                </span>
                <div>
                  <h3>{ru ? 'Пока нет проектов' : 'No projects yet'}</h3>
                  <p>{ru ? 'Здесь появятся ваши приложения' : 'Your apps will appear here'}</p>
                </div>
                <button
                  className="profile-text-button"
                  type="button"
                  onClick={() => onNavigate('constructor')}
                >
                  {t('profilePage.createNewProject')} <ArrowUpRight size={15} />
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="profile-section" aria-labelledby="profile-rewards-title">
          <div className="profile-section-heading">
            <h2 id="profile-rewards-title">{t('profilePage.bonusesAndRewards')}</h2>
          </div>
          <button
            className="profile-referral-feature"
            type="button"
            onClick={() => onNavigate('referral')}
            data-testid="profile-referral-program"
          >
            <span className="profile-referral-feature-copy">
              <span className="profile-kicker">{ru ? 'ВМЕСТЕ ИНТЕРЕСНЕЕ' : 'BETTER TOGETHER'}</span>
              <strong>{t('profilePage.inviteFriends')}</strong>
              <span className="profile-feature-link">
                {ru ? 'О программе' : 'About the program'} <ArrowUpRight size={15} aria-hidden="true" />
              </span>
            </span>
            <ProfileArtwork src={inviteArtwork} lazy />
          </button>
          <div className="profile-perks-grid">
            <button
              className="profile-perk-card"
              type="button"
              onClick={() => onNavigate('rewards')}
              data-testid="profile-rewards"
            >
              <span className="profile-perk-copy">
                <strong>{t('profilePage.digitalRewards')}</strong>
                <span>{ru ? 'Ваши достижения' : 'Your achievements'}</span>
              </span>
              <ProfileArtwork src={rewardsArtwork} lazy />
              <span className="profile-perk-arrow" aria-hidden="true">
                <ArrowUpRight size={16} />
              </span>
            </button>
            <button
              className="profile-perk-card"
              type="button"
              onClick={() => onNavigate('earning')}
              data-testid="profile-earning"
            >
              <span className="profile-perk-copy">
                <strong>{t('profilePage.coinEarning')}</strong>
                <span>{ru ? 'Задания и монеты' : 'Tasks and coins'}</span>
              </span>
              <ProfileArtwork src={tasksArtwork} lazy />
              <span className="profile-perk-arrow" aria-hidden="true">
                <ArrowUpRight size={16} />
              </span>
            </button>
          </div>
        </section>

        <section className="profile-section" aria-labelledby="profile-invite-title">
          <div className="profile-section-heading">
            <h2 id="profile-invite-title">{ru ? 'Ваш код приглашения' : 'Your invitation code'}</h2>
          </div>
          <div className="profile-invite-card">
            <div className="profile-invite-top">
              <span className="profile-invite-icon profile-icon-gift">
                <ProfileGlyph name="gift" />
              </span>
              <div>
                <h3>{t('profilePage.yourReferralCode')}</h3>
                <p>
                  {referralLoading
                    ? ru
                      ? 'Загружаем код…'
                      : 'Loading code…'
                    : referralCode
                      ? t('profilePage.shareWithFriends')
                      : referralError === 'missing'
                        ? ru
                          ? 'Подключите реферальную программу'
                          : 'Connect the referral program'
                        : referralError
                          ? ru
                            ? 'Не удалось загрузить код'
                            : 'Could not load your code'
                          : ru
                            ? 'Доступно после входа через Telegram'
                            : 'Available after opening in Telegram'}
                </p>
              </div>
            </div>
            {referralCode && (
              <div className="profile-code">
                <span>{referralCode}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label={ru ? 'Скопировать реферальный код' : 'Copy referral code'}
                  data-testid="button-copy-referral"
                >
                  <Copy size={18} />
                </button>
              </div>
            )}
            {referralError === 'missing' && (
              <button
                type="button"
                className="profile-retry-link"
                disabled={referralInitializing}
                onClick={connectReferral}
              >
                {referralInitializing ? (ru ? 'Подключаем…' : 'Connecting…') : ru ? 'Подключить' : 'Connect'}
              </button>
            )}
            {referralError === 'unavailable' && (
              <button
                type="button"
                className="profile-retry-link"
                onClick={() => setReferralReload((n) => n + 1)}
              >
                {ru ? 'Попробовать снова' : 'Try again'}
              </button>
            )}
            <button
              className="profile-primary-button"
              type="button"
              disabled={!referralCode}
              onClick={() => share(true)}
              data-testid="button-invite-friend"
            >
              <Users size={18} />
              {t('profilePage.inviteFriend')}
            </button>
            <details className="profile-code-details">
              <summary>
                {ru ? 'У меня есть код друга' : 'I have a friend’s code'}{' '}
                <ChevronRight size={16} aria-hidden="true" />
              </summary>
              <div className="profile-code-form">
                <label htmlFor="friend-referral">{t('profilePage.friendCode')}</label>
                <div>
                  <input
                    id="friend-referral"
                    value={friendCode}
                    onChange={(e) => {
                      setFriendCode(e.target.value.toUpperCase());
                      setCodeError('');
                    }}
                    placeholder="WEB4TG…"
                    disabled={!user?.id || !initData || !referralCode}
                    autoCapitalize="characters"
                    maxLength={50}
                    aria-invalid={!!codeError}
                    aria-describedby={codeError ? 'friend-code-error' : undefined}
                    data-testid="input-friend-referral"
                  />
                  <button
                    type="button"
                    disabled={!user?.id || !initData || !referralCode || !friendCode.trim() || applying}
                    onClick={applyCode}
                    data-testid="button-apply-referral"
                  >
                    {applying ? '…' : t('profilePage.apply')}
                  </button>
                </div>
                {codeError && (
                  <p id="friend-code-error" role="alert">
                    {codeError}
                  </p>
                )}
                {!user?.id || !initData ? (
                  <p>
                    {ru
                      ? 'Откройте приложение в Telegram, чтобы применить код.'
                      : 'Open the app in Telegram to apply a code.'}
                  </p>
                ) : (
                  !referralCode && (
                    <p>
                      {ru
                        ? 'Сначала подключите реферальную программу.'
                        : 'Connect the referral program first.'}
                    </p>
                  )
                )}
              </div>
            </details>
            <button
              className="profile-share-button"
              type="button"
              onClick={() => share(false)}
              data-testid="button-share-app"
            >
              <Share2 size={17} />
              {t('profilePage.shareApp')}
            </button>
          </div>
        </section>

        <section className="profile-section" aria-labelledby="profile-settings-title">
          <div className="profile-section-heading">
            <h2 id="profile-settings-title">{ru ? 'Приложение' : 'Application'}</h2>
          </div>
          <div className="profile-list">
            <Row
              icon="moon"
              title={ru ? 'Тема приложения' : 'App appearance'}
              subtitle={
                ru
                  ? `${theme === 'dark' ? 'Тёмная' : 'Светлая'} · профиль остаётся светлым`
                  : `${theme === 'dark' ? 'Dark' : 'Light'} · profile stays light`
              }
              onClick={() => {
                hapticFeedback?.medium();
                toggleTheme();
              }}
            />
            <Row
              icon="phone"
              title={t('profilePage.addToHomeScreen')}
              subtitle={t('profilePage.quickAccess')}
              onClick={addToHome}
            />
            <div className="profile-row">
              <span className="profile-row-icon profile-icon-language">
                <ProfileGlyph name="language" />
              </span>
              <label className="profile-row-copy profile-row-title" htmlFor="profile-language">
                {t('profilePage.interfaceLanguage')}
              </label>
              <select
                id="profile-language"
                className="profile-language-select"
                value={language}
                onChange={(e) => {
                  hapticFeedback?.light();
                  setLanguage(e.target.value === 'en' ? 'en' : 'ru');
                }}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </section>

        <section className="profile-section" aria-labelledby="profile-support-title">
          <div className="profile-section-heading">
            <h2 id="profile-support-title">{t('profilePage.support')}</h2>
          </div>
          <div className="profile-list">
            <Row
              icon="chat"
              title={t('profilePage.contactUs')}
              subtitle="Telegram"
              external
              onClick={() => openExternal('https://t.me/web4tgs')}
            />
            <Row
              icon="help"
              title={t('profilePage.helpCenter')}
              subtitle={t('profilePage.faqAndGuides')}
              onClick={() => onNavigate('help')}
            />
            <Row icon="star" title={t('profilePage.leaveReview')} onClick={() => onNavigate('review')} />
            <Row
              icon="instagram"
              title="Instagram"
              subtitle="@web4tg"
              external
              onClick={() => openExternal('https://instagram.com/web4tg')}
            />
            <Row
              icon="tiktok"
              title="TikTok"
              subtitle="@web4tg"
              external
              onClick={() => openExternal('https://tiktok.com/@web4tg')}
            />
          </div>
        </section>
        <footer className="profile-footer">
          WEB4TG <span>·</span> {t('profilePage.version')} 1.0.0
        </footer>
      </div>
    </main>
  );
}

export default memo(ProfilePage);
