import './OrderExperience.css';

export function OrderSkeleton({ label }: { label: string }) {
  return <main className="order-page order-loading" data-testid="order-skeleton" role="status" aria-label={label} aria-live="polite" aria-busy="true">
    <div className="order-shell" aria-hidden="true">
      <div className="order-loading-heading">
        <div className="profile-skeleton order-loading-step" />
        <div className="profile-skeleton order-loading-title" />
        <div className="profile-skeleton order-loading-subtitle" />
      </div>
      <div className="order-loading-cards">{[0, 1, 2, 3].map((item) => <div className="order-loading-card" key={item}><div className="order-loading-lines"><div className="profile-skeleton" /><div className="profile-skeleton" /><div className="profile-skeleton" /></div><div className="profile-skeleton order-loading-image" /></div>)}</div>
      <div className="profile-skeleton order-loading-button" />
    </div>
    <span className="profile-visually-hidden">{label}</span>
  </main>;
}
