import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTelegram } from '../hooks/useTelegram';
import { profilePost, ProfileRequestError } from '../lib/profileRequest';
import { ProfileDetailArtwork, ProfileDetailLayout, ProfileDetailLoading } from './ProfileDetailLayout';
import earningArtwork from '../assets/profile/earning-detail-v1.webp';

interface Props {
  onNavigate: (section: string) => void;
}
type TaskProgress = { taskId: string; completed: boolean; completedAt?: string | null };
type Balance = { availableCoins: number; tasksCompleted: number };
type TaskId = 'daily_visit' | 'telegram_subscribe';
const taskData: Record<TaskId, { platform: string; type: string; coins: number; channelUsername?: string }> =
  {
    daily_visit: { platform: 'daily', type: 'visit', coins: 10 },
    telegram_subscribe: { platform: 'telegram', type: 'subscribe', coins: 100, channelUsername: 'web4_tg' },
  };

export function EarningPage({ onNavigate }: Props) {
  const { language } = useLanguage();
  const { user, initData, openTelegramLink } = useTelegram();
  const queryClient = useQueryClient();
  const ru = language === 'ru';
  const authenticated = Boolean(user?.id && initData);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const load = async <T,>(url: string, signal: AbortSignal): Promise<T> => {
    const response = await fetch(url, { headers: { 'x-telegram-init-data': initData }, signal });
    if (!response.ok) throw new ProfileRequestError('Could not load tasks', response.status);
    return response.json();
  };
  const balance = useQuery<Balance>({
    queryKey: ['/api/tasks/balance', user?.id],
    enabled: authenticated,
    retry: false,
    refetchOnMount: 'always',
    queryFn: ({ signal }) => load('/api/tasks/balance', signal),
  });
  const progress = useQuery<TaskProgress[]>({
    queryKey: ['/api/tasks/progress', user?.id],
    enabled: authenticated,
    retry: false,
    refetchOnMount: 'always',
    queryFn: ({ signal }) => load('/api/tasks/progress', signal),
  });
  const complete = useMutation({
    mutationFn: (id: TaskId) => {
      const task = taskData[id];
      return profilePost<{ success: boolean; coins_awarded?: number }>('/api/tasks/complete', initData, {
        task_id: id,
        platform: task.platform,
        task_type: task.type,
        coins_reward: task.coins,
        ...(task.channelUsername ? { channelUsername: task.channelUsername } : {}),
      });
    },
    onSuccess: (result) => {
      if (!result.success) {
        setError(ru ? 'Не удалось подтвердить выполнение.' : 'Could not verify the task.');
        return;
      }
      setError('');
      setFeedback(
        typeof result.coins_awarded === 'number'
          ? ru
            ? `Задание выполнено. Начислено: ${result.coins_awarded} монет.`
            : `Task completed. Coins added: ${result.coins_awarded}.`
          : ru
            ? 'Задание подтверждено.'
            : 'Task confirmed.',
      );
      void queryClient.invalidateQueries({ queryKey: ['/api/tasks/balance', user?.id] });
      void queryClient.invalidateQueries({ queryKey: ['/api/tasks/progress', user?.id] });
    },
    onError: (reason) => {
      setFeedback('');
      setError(
        reason instanceof ProfileRequestError && reason.status === 400 && ru
          ? reason.message
          : ru
            ? 'Не удалось подтвердить задание. Попробуйте ещё раз.'
            : 'Could not verify the task. Please try again.',
      );
    },
  });
  const items = Array.isArray(progress.data) ? progress.data : [];
  const completed = (id: TaskId) =>
    items.some((item) => {
      if (item.taskId !== id || !item.completed) return false;
      if (id !== 'daily_visit') return true;
      const date = item.completedAt ? new Date(item.completedAt) : null;
      return Boolean(
        date &&
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10),
      );
    });
  const submit = (id: TaskId) => {
    if (!authenticated || complete.isPending || submitting.current || completed(id)) return;
    setFeedback('');
    setError('');
    submitting.current = true;
    complete.mutate(id, { onSettled: () => { submitting.current = false; } });
  };
  const failed = balance.isError || progress.isError;
  const missingAccount = balance.error instanceof ProfileRequestError && balance.error.status === 404;
  const loading = authenticated && (balance.isLoading || progress.isLoading);

  return (
    <ProfileDetailLayout
      title={ru ? 'Задания и монеты' : 'Tasks and coins'}
      intro={
        ru
          ? 'Выполняйте доступные задания и следите за балансом.'
          : 'Complete available tasks and track your balance.'
      }
      eyebrow={ru ? 'ВАШИ ВОЗМОЖНОСТИ' : 'YOUR OPPORTUNITIES'}
      testId="profile-earning-page"
    >
      <div className="pd-card pd-wallet-card">
        <div className="pd-wallet-copy">
          <span className="pd-kicker">{ru ? 'ДОСТУПНО МОНЕТ' : 'AVAILABLE COINS'}</span>
          <strong>
            {loading
              ? '…'
              : authenticated && !balance.isError && typeof balance.data?.availableCoins === 'number'
                ? balance.data.availableCoins.toLocaleString(ru ? 'ru-RU' : 'en-US')
                : '—'}
          </strong>
          <p>{ru ? 'Ваш баланс в WEB4TG' : 'Your WEB4TG balance'}</p>
          {authenticated && !balance.isError && typeof balance.data?.tasksCompleted === 'number' && (
            <small>
              {ru ? 'Выполнено заданий: ' : 'Tasks completed: '}
              {balance.data.tasksCompleted}
            </small>
          )}
        </div>
        <ProfileDetailArtwork src={earningArtwork} className="pd-wallet-art" />
      </div>
      {!authenticated && (
        <div className="pd-notice pd-after-hero">
          {ru
            ? 'Откройте приложение в Telegram, чтобы видеть баланс и выполнять задания.'
            : 'Open the app in Telegram to see your balance and complete tasks.'}
        </div>
      )}
      {loading && (
        <div className="pd-after-hero">
          <ProfileDetailLoading label={ru ? 'Загрузка заданий' : 'Loading tasks'} />
        </div>
      )}
      {missingAccount ? (
        <div className="pd-notice pd-after-hero">
          <p>{ru ? 'Чтобы получать монеты, сначала подключите профиль.' : 'Connect your profile to start collecting coins.'}</p>
          <button className="pd-button secondary" type="button" onClick={() => onNavigate('referral')} data-testid="earning-connect-profile">
            {ru ? 'Подключить профиль' : 'Connect profile'}
          </button>
        </div>
      ) : failed && (
        <div className="pd-notice pd-after-hero">
          <p>{ru ? 'Не удалось загрузить баланс или задания.' : 'Could not load your balance or tasks.'}</p>
          <button
            className="pd-button secondary"
            type="button"
            onClick={() => {
              void balance.refetch();
              void progress.refetch();
            }}
          >
            {ru ? 'Попробовать снова' : 'Try again'}
          </button>
        </div>
      )}
      {feedback && (
        <p className="pd-inline-feedback" role="status">
          {feedback}
        </p>
      )}
      {error && (
        <p className="pd-form-error" role="alert">
          {error}
        </p>
      )}

      <section className="pd-section" aria-labelledby="earning-tasks-title">
        <h2 id="earning-tasks-title">{ru ? 'Доступные задания' : 'Available tasks'}</h2>
        <div className="pd-task-list">
          <article className="pd-card pd-task">
            <div className="pd-task-head">
              <div>
                <span className="pd-kicker">{ru ? 'КАЖДЫЙ ДЕНЬ' : 'DAILY'}</span>
                <strong>{ru ? 'Загляните в приложение' : 'Visit the app'}</strong>
                <p>{ru ? 'Получите монеты за сегодняшний визит. Обновляется в 00:00 UTC.' : 'Collect coins for today’s visit. Resets at 00:00 UTC.'}</p>
              </div>
              <span className="pd-task-coins">+10</span>
            </div>
            <button
              className="pd-button secondary"
              type="button"
              disabled={!authenticated || loading || failed || completed('daily_visit') || complete.isPending}
              onClick={() => submit('daily_visit')}
              data-testid="earning-daily"
            >
              {completed('daily_visit') ? (
                <>
                  <Check size={16} />
                  {ru ? 'Получено сегодня' : 'Collected today'}
                </>
              ) : complete.isPending && complete.variables === 'daily_visit' ? (
                ru ? (
                  'Проверяем…'
                ) : (
                  'Checking…'
                )
              ) : ru ? (
                'Получить монеты'
              ) : (
                'Collect coins'
              )}
            </button>
          </article>
          <article className="pd-card pd-task">
            <div className="pd-task-head">
              <div>
                <span className="pd-kicker">TELEGRAM</span>
                <strong>{ru ? 'Подпишитесь на канал' : 'Join our channel'}</strong>
                <p>
                  {ru
                    ? 'Откройте канал и затем проверьте подписку.'
                    : 'Open the channel, then verify your subscription.'}
                </p>
              </div>
              <span className="pd-task-coins">+100</span>
            </div>
            <div className="pd-action-row">
              <button
                className="pd-button secondary"
                type="button"
                onClick={() => openTelegramLink('https://t.me/web4_tg')}
                data-testid="earning-open-channel"
              >
                {ru ? 'Открыть канал' : 'Open channel'} <ExternalLink size={15} aria-hidden="true" />
              </button>
              <button
                className="pd-button secondary"
                type="button"
                disabled={
                  !authenticated || loading || failed || completed('telegram_subscribe') || complete.isPending
                }
                onClick={() => submit('telegram_subscribe')}
                data-testid="earning-verify-channel"
              >
                {completed('telegram_subscribe')
                  ? ru
                    ? 'Выполнено'
                    : 'Completed'
                  : complete.isPending && complete.variables === 'telegram_subscribe'
                    ? ru
                      ? 'Проверяем…'
                      : 'Checking…'
                    : ru
                      ? 'Проверить'
                      : 'Verify'}
              </button>
            </div>
          </article>
        </div>
      </section>
      <section className="pd-section pd-card pd-earning-referral">
        <div>
          <span className="pd-kicker">{ru ? 'ВМЕСТЕ С ДРУЗЬЯМИ' : 'BETTER TOGETHER'}</span>
          <strong>{ru ? 'Пригласите друга' : 'Invite a friend'}</strong>
          <p className="pd-muted">
            {ru ? 'Узнайте о реферальной программе.' : 'Learn about the referral program.'}
          </p>
          <button type="button" onClick={() => onNavigate('referral')}>
            {ru ? 'Подробнее' : 'Learn more'} <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </div>
      </section>
    </ProfileDetailLayout>
  );
}
