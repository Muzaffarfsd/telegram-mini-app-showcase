import './AIConsultantPage.css';

export function AIConsultantSkeleton({ label }: { label: string }) {
  return <main className="consultant-page" role="status" aria-label={label} aria-live="polite" aria-busy="true" data-testid="consultant-skeleton"><div className="consultant-shell consultant-loading-shape" aria-hidden="true">{[0, 1, 2, 3, 4].map((item) => <div className="profile-skeleton" key={item} />)}</div><span className="profile-visually-hidden">{label}</span></main>;
}
