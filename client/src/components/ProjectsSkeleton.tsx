/** The same light loading language as the order and profile pages. */
export function ProjectsSkeleton({ label }: { label: string }) {
  return <main className="projects-load-skeleton" role="status" aria-label={label} aria-live="polite" aria-busy="true" data-testid="projects-skeleton">
    <div className="projects-load-content projects-page-frame" aria-hidden="true">
      <div className="projects-load-shape projects-load-line" />
      <div className="projects-intro-slot"><span className="projects-intro-ru">Выберите демо и пройдите путь своего клиента.</span><span className="projects-intro-en">Choose a demo and try it as a customer.</span><i className="projects-load-shape projects-load-intro"/></div>
      <div className="projects-load-filters">{[0, 1, 2, 3].map(item => <i key={item} className="projects-load-shape" />)}</div>
      <div className="projects-load-cards">{[0, 1, 2].map(item => <div className="projects-load-shape projects-load-card" key={item} />)}</div>
    </div>
  </main>;
}
