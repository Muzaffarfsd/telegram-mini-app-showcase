import { LoadingSpinner } from "./apple-ui/LoadingProgress";

export function PageLoadingFallback() {
  return (
    <div className="page-loading-fallback flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="large" />
      </div>
    </div>
  );
}
