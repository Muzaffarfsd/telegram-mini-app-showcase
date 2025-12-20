import { LoadingSpinner } from "./apple-ui/LoadingProgress";

export function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="large" />
        <p className="text-sm text-white/60">Loading...</p>
      </div>
    </div>
  );
}
