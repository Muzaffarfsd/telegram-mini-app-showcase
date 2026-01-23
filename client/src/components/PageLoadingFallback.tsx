import { HamsterLoader } from "./HamsterLoader";

export function PageLoadingFallback() {
  return (
    <div className="page-loading-fallback flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <HamsterLoader />
    </div>
  );
}
