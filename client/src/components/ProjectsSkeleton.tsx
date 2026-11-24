/** The same light loading language as the order and profile pages. */
export function ProjectsSkeleton({ label }: { label: string }) {
  return <main className="projects-load-skeleton" role="status" aria-label={label} aria-live="polite" aria-busy="true" data-testid="projects-skeleton">
    <div className="projects-load-content route-fallback" aria-hidden="true">
      <div className="projects-load-shape projects-load-line" />
      <div className="projects-load-filters">{[0, 1, 2, 3].map(item => <i key={item} className="projects-load-shape" />)}</div>
      <div className="projects-load-cards">{[0, 1, 2].map(item => <div className="projects-load-shape projects-load-card" key={item} />)}</div>
    </div>
  </main>;
}
