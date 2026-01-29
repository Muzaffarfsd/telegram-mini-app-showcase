import { Ultimate2026Loader } from "./ui/Ultimate2026Loader";

export function PageLoadingFallback() {
  return (
    <div className="page-loading-fallback fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl">
      <Ultimate2026Loader />
    </div>
  );
}
