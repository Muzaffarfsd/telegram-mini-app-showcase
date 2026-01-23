import { NeonLoader } from "./ui/neon-raymarcher";

export function PageLoadingFallback() {
  return (
    <div className="page-loading-fallback fixed inset-0 z-50">
      <NeonLoader />
    </div>
  );
}
