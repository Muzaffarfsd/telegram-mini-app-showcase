import { useState, memo, lazy, Suspense } from "react";
import { Sparkles } from "lucide-react";
import { m } from "@/utils/LazyMotionProvider";
import { useTelegram } from "@/hooks/useTelegram";

const AIAgentPanel = lazy(() =>
  import("./AIAgentPanel").then((m) => ({ default: m.AIAgentPanel }))
);

export const AIAgentButton = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const { hapticFeedback } = useTelegram();

  const handleOpen = () => {
    setIsOpen(true);
    setHasOpened(true);
    queueMicrotask(() => hapticFeedback.medium());
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <m.button
        type="button"
        onClick={handleOpen}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "fixed",
          right: "16px",
          bottom: "90px",
          width: "52px",
          height: "52px",
          borderRadius: "18px",
          border: "none",
          background: "linear-gradient(135deg, #34d399, #059669)",
          boxShadow:
            "0 4px 16px rgba(52,211,153,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9990,
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="AI Assistant"
      >
        <Sparkles className="w-6 h-6" style={{ color: "#fff" }} />
      </m.button>

      {hasOpened && (
        <Suspense fallback={null}>
          <AIAgentPanel isOpen={isOpen} onClose={handleClose} />
        </Suspense>
      )}
    </>
  );
});
