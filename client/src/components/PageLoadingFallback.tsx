import { HamsterLoader } from "./HamsterLoader";

export function PageLoadingFallback() {
  return (
    <div className="page-loading-fallback flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="flex flex-col items-center gap-6">
        <HamsterLoader />
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
      </div>
    </div>
  );
}
