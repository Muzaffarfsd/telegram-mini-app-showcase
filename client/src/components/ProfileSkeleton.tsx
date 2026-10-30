import './ProfilePage.css';

export function ProfileSkeleton({ label }: { label: string }) {
  return <main className="profile-page" aria-label={label} aria-busy="true" role="status" aria-live="polite">
    <div className="profile-content profile-loading" aria-hidden="true">
      <div className="profile-skeleton profile-skeleton-heading" />
      <div className="profile-skeleton profile-skeleton-subheading" />
      <div className="profile-skeleton-identity"><div className="profile-skeleton profile-skeleton-avatar"/><div className="profile-skeleton-lines"><div className="profile-skeleton profile-skeleton-line-wide"/><div className="profile-skeleton profile-skeleton-line-short"/></div></div>
      <div className="profile-skeleton profile-skeleton-section-title" />
      <div className="profile-skeleton profile-skeleton-card" />
    </div>
    <span className="profile-visually-hidden">{label}</span>
  </main>;
}

export function ProfileProjectsSkeleton({ label }: { label: string }) {
  return <div className="profile-project-loading" role="status" aria-live="polite" aria-label={label} aria-busy="true"><div aria-hidden="true" className="profile-project-loading-inner"><div className="profile-skeleton profile-skeleton-avatar-small"/><div className="profile-skeleton-lines"><div className="profile-skeleton profile-skeleton-line-wide"/><div className="profile-skeleton profile-skeleton-line-short"/></div></div><span className="profile-visually-hidden">{label}</span></div>;
}
