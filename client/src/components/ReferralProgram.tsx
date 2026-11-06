import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Copy, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTelegram } from '../hooks/useTelegram';
import { profilePost, ProfileRequestError, referralCodeFromStart } from '../lib/profileRequest';
import { ProfileDetailArtwork, ProfileDetailLayout, ProfileDetailLoading } from './ProfileDetailLayout';
import referralArtwork from '../assets/profile/referral-detail-v5.webp';

type ReferralStats = {
  referralCode?: string | null;
  totalReferrals?: number | null;
  activeReferrals?: number | null;
  referredByCode?: string | null;
};

export function ReferralProgram({ className = '' }: { className?: string }) {
  const { language } = useLanguage();
  const { user, initData, inviteFriend, openTelegramLink } = useTelegram();
  const queryClient = useQueryClient();
  const ru = language === 'ru';
  const [friendCode, setFriendCode] = useState('');
  const [friendOpen, setFriendOpen] = useState(false);
  const appliedStartRef = useRef(false);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');
  useEffect(() => {
    if (appliedStartRef.current) return;
    const suggested = referralCodeFromStart(initData);
    if (suggested) {
      appliedStartRef.current = true;
      setFriendCode(suggested);
      setFriendOpen(true);
    }
  }, [initData]);
  const stats = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats', user?.id],
    enabled: Boolean(user?.id && initData),
    retry: false,
    refetchOnMount: 'always',
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/referrals/stats/${user!.id}`, {
        headers: { 'x-telegram-init-data': initData },
        signal,
      });
      if (!response.ok) throw new ProfileRequestError('Could not load referral information', response.status);
      return response.json();
    },
  });
  const connect = useMutation({
    mutationFn: () => profilePost('/api/referrals/user/init', initData, {}),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats', user?.id] }),
  });
  const apply = useMutation({
    mutationFn: (code: string) =>
      profilePost('/api/referral/apply', initData, { userId: user?.id, referralCode: code }),
    onSuccess: () => {
      setFriendCode('');
      setFormError('');
      setFeedback(
        ru ? 'Код принят. Статус появится в программе.' : 'Code accepted. Check your program status.',
      );
      void queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats', user?.id] });
    },
    onError: (error) => {
      const known = error instanceof ProfileRequestError && error.status >= 400 && error.status < 500;
      setFormError(
        known && ru
          ? error.message
          : ru
            ? 'Не удалось применить код. Попробуйте позже.'
            : 'Could not apply the code. Please try again later.',
      );
    },
  });
  const code = typeof stats.data?.referralCode === 'string' ? stats.data.referralCode : '';
  const missing = stats.error instanceof ProfileRequestError && stats.error.status === 404;
  const authenticated = Boolean(user?.id && initData);
  const count = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value) ? String(value) : '—';

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setFeedback(ru ? 'Код скопирован.' : 'Code copied.');
    } catch {
      setFeedback(ru ? 'Не удалось скопировать код.' : 'Could not copy the code.');
    }
  };
  const share = () => {
    if (!code) return;
    const result = inviteFriend(code);
    setFeedback(
      result.success
        ? ru
          ? 'Открываем приглашение в Telegram.'
          : 'Opening your invitation in Telegram.'
        : ru
          ? 'Не удалось открыть Telegram.'
          : 'Could not open Telegram.',
    );
  };

  return (
    <ProfileDetailLayout
      title={ru ? 'Приглашайте друзей' : 'Invite your friends'}
      intro={
        ru
          ? 'Поделитесь WEB4TG и следите за приглашениями в одном месте.'
          : 'Share WEB4TG and keep track of your invitations.'
      }
      eyebrow={ru ? 'РЕФЕРАЛЬНАЯ ПРОГРАММА' : 'REFERRAL PROGRAM'}
      testId="profile-referral-page"
    >
      <div className={`pd-card pd-referral-hero ${className}`}>
        <div className="pd-referral-hero-copy">
          <span className="pd-kicker">
            {ru ? 'ОДНА ССЫЛКА — НОВОЕ ЗНАКОМСТВО' : 'ONE LINK, A NEW CONNECTION'}
          </span>
          <strong>{ru ? 'Хорошим делятся' : 'Good things are shared'}</strong>
          <p>
            {ru
              ? 'Пригласите друга в WEB4TG по личной ссылке.'
              : 'Invite a friend to WEB4TG with your personal link.'}
          </p>
        </div>
        <ProfileDetailArtwork src={referralArtwork} className="pd-referral-hero-art" />
      </div>
      <section className="pd-section" aria-labelledby="referral-code-title">
        <h2 id="referral-code-title">{ru ? 'Ваш код приглашения' : 'Your invitation code'}</h2>
        {!authenticated ? (
          <div className="pd-notice">
            {ru
              ? 'Откройте приложение в Telegram, чтобы получить код и увидеть статистику.'
              : 'Open the app in Telegram to get your code and see your stats.'}
          </div>
        ) : stats.isLoading ? (
          <ProfileDetailLoading label={ru ? 'Загрузка программы' : 'Loading your program'} />
        ) : missing ? (
          <div className="pd-notice">
            <p>
              {ru
                ? 'Подключите программу, чтобы получить личный код.'
                : 'Connect the program to get your personal code.'}
            </p>
            <button
              className="pd-button"
              type="button"
              disabled={connect.isPending}
              onClick={() => connect.mutate()}
              data-testid="referral-connect"
            >
              {connect.isPending ? (ru ? 'Подключаем…' : 'Connecting…') : ru ? 'Подключить' : 'Connect'}
            </button>
            {connect.isError && (
              <p className="pd-form-error" role="alert">
                {ru ? 'Не удалось подключить программу.' : 'Could not connect the program.'}
              </p>
            )}
          </div>
        ) : stats.isError ? (
          <div className="pd-notice">
            <p>{ru ? 'Не удалось загрузить данные программы.' : 'Could not load program data.'}</p>
            <button className="pd-button secondary" type="button" onClick={() => void stats.refetch()}>
              {ru ? 'Попробовать снова' : 'Try again'}
            </button>
          </div>
        ) : code ? (
          <div className="pd-card pd-referral-code-card">
            <div className="pd-referral-code">
              <span>{code}</span>
              <button
                type="button"
                onClick={() => void copy()}
                aria-label={ru ? 'Скопировать код' : 'Copy code'}
                data-testid="referral-copy"
              >
                <Copy size={18} />
              </button>
            </div>
            <button className="pd-button full" type="button" onClick={share} data-testid="referral-share">
              <Share2 size={17} aria-hidden="true" />
              {ru ? 'Пригласить друга' : 'Invite a friend'}
            </button>
          </div>
        ) : (
          <div className="pd-notice">
            {ru
              ? 'Код пока недоступен. Попробуйте обновить данные.'
              : 'Your code is unavailable. Try refreshing.'}
            <button className="pd-button secondary" type="button" onClick={() => void stats.refetch()}>
              {ru ? 'Обновить' : 'Refresh'}
            </button>
          </div>
        )}
        {feedback && (
          <p className="pd-inline-feedback" role="status">
            {feedback}
          </p>
        )}
      </section>

      {stats.data && (
        <section className="pd-section" aria-labelledby="referral-stats-title">
          <h2 id="referral-stats-title">{ru ? 'Ваши приглашения' : 'Your invitations'}</h2>
          <div className="pd-grid">
            <div className="pd-card pd-stat">
              <strong>{count(stats.data.totalReferrals)}</strong>
              <span>{ru ? 'Всего приглашено' : 'Total invited'}</span>
            </div>
            <div className="pd-card pd-stat">
              <strong>{count(stats.data.activeReferrals)}</strong>
              <span>{ru ? 'Активные' : 'Active'}</span>
            </div>
          </div>
        </section>
      )}

      <section className="pd-section" aria-labelledby="referral-how-title">
        <span className="pd-kicker">{ru ? 'ТРИ ПРОСТЫХ ШАГА' : 'THREE SIMPLE STEPS'}</span>
        <h2 id="referral-how-title">{ru ? 'Как это работает' : 'How it works'}</h2>
        <ol className="pd-referral-steps">
          {(ru
            ? [
                ['Поделитесь ссылкой', 'Откройте приглашение и выберите друга в Telegram.'],
                ['Друг открывает WEB4TG', 'Код приглашения уже будет в ссылке.'],
                ['Следите за приглашениями', 'Статистика появится в вашем профиле.'],
              ]
            : [
                ['Share your link', 'Open the invitation and choose a friend in Telegram.'],
                ['Your friend opens WEB4TG', 'The invitation code is included in the link.'],
                ['Track invitations', 'Your statistics appear in your profile.'],
              ]
          ).map(([title, description], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pd-section">
        <details
          className="pd-card pd-disclosure"
          open={friendOpen}
          onToggle={(event) => setFriendOpen(event.currentTarget.open)}
        >
          <summary>{ru ? 'У меня есть код друга' : 'I have a friend’s code'}</summary>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const normalized = friendCode.trim().toUpperCase();
              if (!authenticated || !code || apply.isPending) return;
              if (!/^[A-Z0-9]{4,50}$/.test(normalized)) {
                setFormError(ru ? 'Введите код из латинских букв и цифр.' : 'Use 4–50 letters and numbers.');
                return;
              }
              if (normalized === code.toUpperCase()) {
                setFormError(ru ? 'Нельзя применить собственный код.' : 'You cannot use your own code.');
                return;
              }
              setFormError('');
              apply.mutate(normalized);
            }}
          >
            <label className="pd-field" htmlFor="referral-friend-code">
              <span>{ru ? 'Код друга' : 'Friend’s code'}</span>
              <input
                id="referral-friend-code"
                value={friendCode}
                autoCapitalize="characters"
                maxLength={50}
                disabled={!authenticated || !code}
                onChange={(event) => {
                  setFriendCode(event.target.value.toUpperCase());
                  setFormError('');
                }}
                placeholder="WEB4TG…"
                aria-invalid={Boolean(formError)}
              />
            </label>
            {formError && (
              <p className="pd-form-error" role="alert">
                {formError}
              </p>
            )}
            {!code && (
              <p className="pd-form-hint">
                {ru
                  ? 'Сначала подключите программу через Telegram.'
                  : 'First connect the program in Telegram.'}
              </p>
            )}
            <button
              className="pd-button secondary"
              type="submit"
              disabled={!authenticated || !code || !friendCode.trim() || apply.isPending}
              data-testid="referral-apply"
            >
              {apply.isPending ? '…' : ru ? 'Применить код' : 'Apply code'}
            </button>
          </form>
        </details>
      </section>
      <section className="pd-section pd-card pd-next-card">
        <div>
          <strong>{ru ? 'Остались вопросы?' : 'Have a question?'}</strong>
          <p className="pd-muted">
            {ru ? 'Расскажем об условиях программы в Telegram.' : 'Ask us about the program in Telegram.'}
          </p>
        </div>
        <button
          className="pd-button secondary"
          type="button"
          onClick={() => openTelegramLink('https://t.me/web4tgs')}
        >
          {ru ? 'Связаться с нами' : 'Contact us'} <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </section>
    </ProfileDetailLayout>
  );
}
