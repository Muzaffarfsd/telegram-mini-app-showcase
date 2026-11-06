import { ArrowUpRight, Check, Compass, Layers3, Rocket, Sparkles } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { useLanguage } from '../contexts/LanguageContext';
import { navigate } from '../hooks/useRouting';
import { ProfileDetailArtwork, ProfileDetailLayout } from './ProfileDetailLayout';
import journeyArtwork from '../assets/profile/journey-detail-v5.webp';

const english: Record<string, { name: string; description: string }> = {
  'explorer-bronze': { name: 'Explorer', description: 'Explore 3 demo apps' },
  'explorer-silver': { name: 'Experienced explorer', description: 'Explore 10 demo apps' },
  'early-adopter': { name: 'Getting started', description: 'Open the app for the first time' },
  'constructor-novice': { name: 'Architect', description: 'Start your first project' },
  'feature-master': { name: 'Feature expert', description: 'Add 5 features to a project' },
};
const visibleIds = new Set(Object.keys(english));

export function GamificationHub() {
  const { language } = useLanguage();
  const { stats } = useGamification();
  const ru = language === 'ru';
  const achievements = Array.isArray(stats.achievements)
    ? stats.achievements.filter((achievement) => visibleIds.has(achievement.id))
    : [];
  const currentXp = Number.isFinite(stats.xp) ? Math.max(0, stats.xp) : 0;
  const goalXp = Number.isFinite(stats.xpToNextLevel) ? Math.max(1, stats.xpToNextLevel) : 100;
  const progress = Math.min(100, Math.round((currentXp / goalXp) * 100));
  const level = Number.isFinite(stats.level) ? Math.max(1, stats.level) : 1;
  const iconFor = (id: string) =>
    id.startsWith('explorer')
      ? Compass
      : id === 'feature-master'
        ? Layers3
        : id === 'constructor-novice'
          ? Rocket
          : Sparkles;

  return (
    <ProfileDetailLayout
      title={ru ? 'Ваш путь в WEB4TG' : 'Your WEB4TG journey'}
      intro={
        ru
          ? 'Здесь можно следить за своим опытом и достижениями.'
          : 'Keep track of your experience and achievements.'
      }
      eyebrow={ru ? 'НАГРАДЫ И УРОВНИ' : 'REWARDS AND LEVELS'}
      testId="profile-rewards-page"
    >
      <div className="pd-card pd-level-card">
        <div className="pd-level-top">
          <div>
            <span className="pd-kicker">{ru ? 'ВАШ УРОВЕНЬ' : 'YOUR LEVEL'}</span>
            <strong>{ru ? `Уровень ${level}` : `Level ${level}`}</strong>
            <p className="pd-muted">
              {ru ? 'Прогресс сохраняется на этом устройстве.' : 'Progress is saved on this device.'}
            </p>
          </div>
          <ProfileDetailArtwork src={journeyArtwork} className="pd-level-art" />
        </div>
        <div className="pd-progress-label">
          <span>{ru ? 'Опыт' : 'Experience'}</span>
          <span>
            {currentXp} / {goalXp} XP
          </span>
        </div>
        <progress
          value={progress}
          max="100"
          aria-label={ru ? `Прогресс уровня: ${progress}%` : `Level progress: ${progress}%`}
        />
      </div>

      <section className="pd-section" aria-labelledby="achievements-title">
        <div className="pd-section-title">
          <div>
            <span className="pd-kicker">{ru ? 'ВАШИ ШАГИ' : 'YOUR MILESTONES'}</span>
            <h2 id="achievements-title">{ru ? 'Достижения' : 'Achievements'}</h2>
          </div>
        </div>
        <div className="pd-achievement-list">
          {achievements.map((achievement) => {
            const Icon = iconFor(achievement.id);
            const max = Number.isFinite(achievement.maxProgress) ? Math.max(1, achievement.maxProgress) : 1;
            const value = Number.isFinite(achievement.progress)
              ? Math.max(0, Math.min(max, achievement.progress))
              : 0;
            return (
              <article className="pd-card pd-achievement" key={achievement.id}>
                <div className="pd-achievement-head">
                  <span className="pd-achievement-symbol">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <small>
                    {achievement.unlocked ? (
                      <>
                        <Check size={14} aria-hidden="true" />
                        {ru ? 'Открыто' : 'Unlocked'}
                      </>
                    ) : (
                      `${value} / ${max}`
                    )}
                  </small>
                </div>
                <strong>{ru ? achievement.name : english[achievement.id].name}</strong>
                <p>{ru ? achievement.description : english[achievement.id].description}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="pd-section pd-card pd-next-card">
        <div>
          <strong>{ru ? 'Продолжить знакомство' : 'Keep exploring'}</strong>
          <p className="pd-muted">
            {ru
              ? 'Посмотрите приложения или начните свой проект.'
              : 'Explore apps or start your own project.'}
          </p>
        </div>
        <div className="pd-action-row">
          <button className="pd-button secondary" type="button" onClick={() => navigate('/')}>
            {ru ? 'Смотреть приложения' : 'Explore apps'} <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          <button className="pd-button secondary" type="button" onClick={() => navigate('/constructor')}>
            {ru ? 'Создать проект' : 'Start a project'} <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>
      </section>
    </ProfileDetailLayout>
  );
}
