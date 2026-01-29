import { SimpleLoader } from "./ui/SimpleLoader";

export function PageLoadingFallback() {
  return (
    <div className="page-loading-fallback fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <SimpleLoader />
    </div>
  );
}
