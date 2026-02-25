export function PageLoadingFallback() {
  return (
    <div 
      className="fixed inset-0 z-40"
      style={{
        background: 'var(--bg-primary, #000)',
      }}
    />
  );
}
