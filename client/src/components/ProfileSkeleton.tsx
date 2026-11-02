import './ProfilePage.css';
import './ProfileExperience.css';

export function ProfileSkeleton({ label }: { label: string }) {
  return (
    <main className="profile-page" aria-label={label} aria-busy="true" role="status" aria-live="polite">
      <div className="profile-content profile-loading" aria-hidden="true">
        <div className="profile-skeleton-identity">
          <div className="profile-skeleton profile-skeleton-avatar" />
          <div className="profile-skeleton-lines">
            <div className="profile-skeleton profile-skeleton-line-wide" />
            <div className="profile-skeleton profile-skeleton-line-short" />
          </div>
        </div>
        <div className="profile-skeleton profile-skeleton-card" />
        <div className="profile-skeleton-perks">
          <div className="profile-skeleton" />
          <div className="profile-skeleton" />
        </div>
      </div>
      <span className="profile-visually-hidden">{label}</span>
    </main>
  );
}

export function ProfileDetailSkeleton({ label }: { label: string }) {
  return (
    <main className="profile-detail-skeleton" data-testid="profile-detail-skeleton" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
      <div className="profile-detail-skeleton-content" aria-hidden="true">
        <div className="profile-skeleton profile-detail-skeleton-back" />
        <div className="profile-skeleton profile-detail-skeleton-kicker" />
        <div className="profile-skeleton profile-detail-skeleton-title" />
        <div className="profile-skeleton profile-detail-skeleton-description" />
        <div className="profile-skeleton profile-detail-skeleton-hero" />
        <div className="profile-skeleton profile-detail-skeleton-section" />
        <div className="profile-skeleton profile-detail-skeleton-card" />
      </div>
    </main>
  );
}

export function ProfileProjectsSkeleton({ label }: { label: string }) {
  return (
    <div
      className="profile-project-loading"
      role="status"
      aria-live="polite"
      aria-label={label}
      aria-busy="true"
    >
      <div aria-hidden="true" className="profile-project-loading-inner">
        <div className="profile-skeleton profile-skeleton-avatar-small" />
        <div className="profile-skeleton-lines">
          <div className="profile-skeleton profile-skeleton-line-wide" />
          <div className="profile-skeleton profile-skeleton-line-short" />
        </div>
      </div>
      <span className="profile-visually-hidden">{label}</span>
    </div>
  );
}
