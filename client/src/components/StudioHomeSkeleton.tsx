/** A quiet first-load layout that keeps the white surface while the home bundle loads. */
export function StudioHomeSkeleton({ label }: { label: string }) {
  const bar = (width: string, height: number) => <div className="profile-skeleton" style={{ width, height, borderRadius: 8 }} />;
  return <main role="status" aria-label={label} aria-busy="true" style={{ minHeight: '100dvh', background: '#fff', padding: 'calc(max(env(safe-area-inset-top, 0px), var(--csat, 0px), 12px) + 82px) 20px 80px' }}>
    <div aria-hidden="true" style={{ maxWidth: 500, margin: '0 auto', display: 'grid', gap: 12 }}>
      {bar('45%', 11)}<div style={{ height: 7 }} />{bar('74%', 31)}{bar('86%', 31)}<div style={{ height: 1 }} />{bar('90%', 14)}{bar('68%', 14)}<div style={{ height: 18 }} />{bar('38%', 11)}{bar('58%', 20)}
      <div style={{ display: 'flex', gap: 6, marginTop: 1 }}>{bar('26%', 40)}{bar('24%', 40)}{bar('22%', 40)}</div>
      <div style={{ width: '100%', height: 'min(88vw, 380px)', minHeight: 280, borderRadius: 25, background: '#f5f5f4' }} />
    </div>
  </main>;
}
