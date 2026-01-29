import { PremiumGreenLoader } from "./ui/PremiumGreenLoader";

export function PageLoadingFallback() {
  return (
    <div className="page-loading-fallback fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <PremiumGreenLoader />
    </div>
  );
}
