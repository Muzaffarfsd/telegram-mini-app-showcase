import { Ultimate2026Loader } from "./ui/Ultimate2026Loader";

export function PageLoadingFallback() {
  return (
    <div className="page-loading-fallback fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Ultimate2026Loader />
    </div>
  );
}
