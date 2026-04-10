import { useState, useEffect, useRef, memo, lazy, Suspense, useMemo } from "react";
import { m } from "@/utils/LazyMotionProvider";
import { useTelegram } from "@/hooks/useTelegram";
import { useRouting } from "@/hooks/useRouting";
import type { PageContext } from "@/hooks/useAIAgent";
import { useLanguage } from "@/contexts/LanguageContext";

const AIAgentPanel = lazy(() =>
  import("./AIAgentPanel").then((m) => ({ default: m.AIAgentPanel }))
);

const PROACTIVE_MESSAGES: Record<string, { ru: string; en: string }> = {
  demoApp: { ru: "Нравится это демо?", en: "Like this demo?" },
  projects: { ru: "Помочь подобрать?", en: "Need help choosing?" },
  constructor: { ru: "Собираете проект?", en: "Building a project?" },
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
  const proactiveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.92 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          onClick={handleOpen}
          style={{
            position: "fixed", right: "16px", bottom: "155px",
            background: "rgba(28,28,30,0.75)",
            backdropFilter: "saturate(180%) blur(40px)",
            WebkitBackdropFilter: "saturate(180%) blur(40px)",
            color: "#fff", padding: "11px 16px",
            borderRadius: "18px 18px 6px 18px",
            border: "0.5px solid rgba(255,255,255,0.15)",
            fontSize: "13.5px", fontWeight: 500,
            maxWidth: "200px", cursor: "pointer",
            zIndex: 9989, letterSpacing: "-0.01em",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <span>{proactiveMessage}</span>
          <button type="button" onClick={handleDismissProactive}
            style={{
              position: "absolute", top: "-5px", right: "-5px",
              width: "18px", height: "18px", borderRadius: "9px",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", fontSize: "10px",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center",
            }}
          >×</button>
        </m.div>
      )}

      <m.button
        type="button"
        onClick={handleOpen}
        whileTap={{ scale: 0.92 }}
        style={{
          position: "fixed", right: "16px", bottom: "90px",
          width: "54px", height: "54px", borderRadius: "27px",
          border: "0.5px solid rgba(255,255,255,0.15)",
          background: "rgba(52,211,153,0.85)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          boxShadow: "0 4px 20px rgba(52,211,153,0.3), 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9990,
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Chat with Alex"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
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
