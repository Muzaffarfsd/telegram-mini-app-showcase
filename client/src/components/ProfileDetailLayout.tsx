import { type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { navigate } from '../hooks/useRouting';
import './ProfilePage.css';
import './ProfileDetailLayout.css';

type ProfileDetailLayoutProps = {
  title: string;
  intro?: string;
  eyebrow?: string;
  onBack?: () => void;
  children: ReactNode;
  testId: string;
};

export function ProfileDetailLayout({
  title,
  intro,
  eyebrow,
  onBack,
  children,
  testId,
}: ProfileDetailLayoutProps) {
  const { language } = useLanguage();
  return (
    <main className="profile-detail-page" data-testid={testId}>
      <div className="profile-detail-content">
        <button
          className="pd-back"
          type="button"
          onClick={onBack ?? (() => navigate('/profile'))}
          data-testid="button-back"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          {language === 'ru' ? 'Профиль' : 'Profile'}
        </button>
        <header className="pd-header">
          {eyebrow && <span className="pd-kicker">{eyebrow}</span>}
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
        </header>
        {children}
      </div>
    </main>
  );
}

export function ProfileDetailArtwork({ src, className = '' }: { src: string; className?: string }) {
  return (
    <img
      className={className}
      src={src}
      alt=""
      width="480"
      height="440"
      onError={(event) => {
        event.currentTarget.style.visibility = 'hidden';
      }}
    />
  );
}

export function ProfileDetailLoading({ label }: { label: string }) {
  return (
    <div className="pd-loading" role="status" aria-live="polite" aria-label={label} aria-busy="true">
      <div className="profile-skeleton pd-loading-art" />
      <div className="pd-loading-lines">
        <div className="profile-skeleton pd-loading-line" />
        <div className="profile-skeleton pd-loading-line short" />
      </div>
    </div>
  );
}
