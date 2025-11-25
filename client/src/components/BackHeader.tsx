import { ChevronLeft } from "lucide-react";

interface BackHeaderProps {
  onBack: () => void;
  title?: string;
}

export function BackHeader({ onBack, title }: BackHeaderProps) {
  return (
    <div 
      className="sticky top-0 z-50 flex items-center gap-3 py-3 bg-background/80 backdrop-blur-xl border-b border-white/10"
      style={{
        paddingTop: 'calc(var(--tg-safe-area-top, 0px) + 12px)',
        paddingLeft: 'calc(var(--tg-safe-area-left, 0px) + 56px)',
        paddingRight: 'calc(var(--tg-safe-area-right, 0px) + 16px)',
      }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
        aria-label="Назад"
        data-testid="button-back"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Назад</span>
      </button>
      {title && (
        <span className="ml-auto text-white/60 text-sm">{title}</span>
      )}
    </div>
  );
}

export default BackHeader;
