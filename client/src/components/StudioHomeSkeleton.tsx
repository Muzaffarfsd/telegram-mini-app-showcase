export function StudioHomeSkeleton({ label }: { label: string }) {
  return <main className="home-load-page" role="status" aria-label={label} aria-busy="true">
      <div className="home-load-content" aria-hidden="true">
        <div className="home-load-intro">
          <i className="home-load-shape home-load-title"/><i className="home-load-shape home-load-title"/>
          <i className="home-load-shape home-load-copy"/><i className="home-load-shape home-load-copy"/>
          <div className="home-load-actions"><i className="home-load-shape"/><i className="home-load-shape"/></div>
        </div>
        <div className="home-load-demo">
          <i className="home-load-shape home-load-label"/>
          <div className="home-load-options"><i className="home-load-shape"/><i className="home-load-shape"/><i className="home-load-shape"/></div>
          <div className="home-load-card"/>
        </div>
      </div>
  </main>;
}
