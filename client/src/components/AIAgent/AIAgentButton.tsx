import { useState, useEffect, useRef, memo, lazy, Suspense, useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { m } from "@/utils/LazyMotionProvider";
import { useTelegram } from "@/hooks/useTelegram";
import { useRouting } from "@/hooks/useRouting";
import type { PageContext } from "@/hooks/useAIAgent";
import { useLanguage } from "@/contexts/LanguageContext";

const AIAgentPanel = lazy(() =>
  import("./AIAgentPanel").then((m) => ({ default: m.AIAgentPanel }))
);

const PROACTIVE_MESSAGES: Record<string, { ru: string; en: string }> = {
  demoApp: {
    ru: "Нравится это демо?",
    en: "Like this demo?",
  },
  projects: {
    ru: "Помочь подобрать?",
    en: "Need help choosing?",
  },
  constructor: {
    ru: "Собираете проект?",
    en: "Building a project?",
  },
};

const PROACTIVE_DELAY = 15000;

export const AIAgentButton = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [proactiveMessage, setProactiveMessage] = useState<string | null>(null);
  const [showProactive, setShowProactive] = useState(false);
  const { hapticFeedback } = useTelegram();
  const { route } = useRouting();
  const { language } = useLanguage();
  const proactiveTimer = useRef<ReturnType<typeof setTimeout>>();
  const dismissedPages = useRef<Set<string>>(new Set());
  const pageEntryTime = useRef(Date.now());

  const pageContext: PageContext = useMemo(() => ({
    currentPage: route.path,
    demoId: route.params?.id,
  }), [route.path, route.params?.id]);

  useEffect(() => {
    pageEntryTime.current = Date.now();
    setShowProactive(false);
    setProactiveMessage(null);

    if (proactiveTimer.current) clearTimeout(proactiveTimer.current);

    if (isOpen || dismissedPages.current.has(route.component)) return;

    const messages = PROACTIVE_MESSAGES[route.component];
    if (messages) {
      proactiveTimer.current = setTimeout(() => {
        const msg = language === "ru" ? messages.ru : messages.en;
        setProactiveMessage(msg);
        setShowProactive(true);
        setTimeout(() => {
          setShowProactive(false);
        }, 8000);
      }, PROACTIVE_DELAY);
    }

    return () => {
      if (proactiveTimer.current) clearTimeout(proactiveTimer.current);
    };
  }, [route.component, isOpen, language]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasOpened(true);
    setShowProactive(false);
    dismissedPages.current.add(route.component);
    queueMicrotask(() => hapticFeedback.medium());
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismissProactive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProactive(false);
    dismissedPages.current.add(route.component);
  };

  return (
    <>
      {showProactive && proactiveMessage && (
        <m.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={handleOpen}
          style={{
            position: "fixed", right: "16px", bottom: "150px",
            background: "rgba(14,14,16,0.95)", color: "#fff",
            padding: "10px 14px", borderRadius: "14px 14px 4px 14px",
            border: "1px solid rgba(52,211,153,0.2)",
            fontSize: "13px", fontWeight: 500,
            maxWidth: "200px", cursor: "pointer",
            zIndex: 9989, backdropFilter: "blur(12px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <span>{proactiveMessage}</span>
          <button type="button" onClick={handleDismissProactive}
            style={{
              position: "absolute", top: "-6px", right: "-6px",
              width: "18px", height: "18px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", border: "none",
              color: "rgba(255,255,255,0.5)", fontSize: "11px",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center",
            }}
          >×</button>
        </m.div>
      )}

      <m.button
        type="button"
        onClick={handleOpen}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "fixed", right: "16px", bottom: "90px",
          width: "52px", height: "52px", borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #34d399, #059669)",
          boxShadow: "0 4px 16px rgba(52,211,153,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9990,
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Chat with Alex"
      >
        <MessageCircle className="w-6 h-6" style={{ color: "#fff" }} />
      </m.button>

      {hasOpened && (
        <Suspense fallback={null}>
          <AIAgentPanel
            isOpen={isOpen}
            onClose={handleClose}
            pageContext={pageContext}
          />
        </Suspense>
      )}
    </>
  );
});
