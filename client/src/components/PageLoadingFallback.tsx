import { lazy, Suspense } from "react";
import { LoadingSpinner } from "./apple-ui/LoadingProgress";

const NeonLoader = lazy(() => import("./ui/neon-raymarcher"));

export function PageLoadingFallback() {
  return (
    <div className="page-loading-fallback fixed inset-0 z-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <LoadingSpinner size="large" />
        </div>
      }>
        <NeonLoader />
      </Suspense>
    </div>
  );
}
