import { useState, useEffect, useRef, memo, lazy, Suspense, useMemo, useCallback } from "react";
import { AnimatePresence, m } from "@/utils/LazyMotionProvider";
import { useTelegram } from "@/hooks/useTelegram";
import { useRouting, navigate } from "@/hooks/useRouting";
import type { PageContext } from "@/hooks/useAIAgent";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAIInteractions, useSwipeGesture } from "@/hooks/useAIInteractions";
import type { TourStep } from "./AIGuidedTour";

const AIAgentPanel = lazy(() =>
  import("./AIAgentPanel").then((m) => ({ default: m.AIAgentPanel }))
);
const AIGuidedTour = lazy(() =>
  import("./AIGuidedTour").then((m) => ({ default: m.AIGuidedTour }))
);
const AISessionSummary = lazy(() =>
  import("./AISessionSummary").then((m) => ({ default: m.AISessionSummary }))
);

const STORAGE_KEY = "web4tg_ai_chat";

interface QuickAction {
  icon: string;
  label: string;
  action: () => void;
  color?: string;
}

const PAGE_ACTIONS: Record<string, { ru: QuickAction[]; en: QuickAction[] }> = {
  showcase: {
    ru: [
      { icon: "🎯", label: "Подобрать демо", action: () => navigate("/projects"), color: "#34d399" },
      { icon: "💰", label: "Узнать цены", action: () => {}, color: "#f59e0b" },
      { icon: "🏗️", label: "Конструктор", action: () => navigate("/constructor"), color: "#60a5fa" },
    ],
    en: [
      { icon: "🎯", label: "Find a demo", action: () => navigate("/projects"), color: "#34d399" },
      { icon: "💰", label: "See prices", action: () => {}, color: "#f59e0b" },
      { icon: "🏗️", label: "Constructor", action: () => navigate("/constructor"), color: "#60a5fa" },
    ],
  },
  projects: {
    ru: [
      { icon: "⭐", label: "Топ решения", action: () => {}, color: "#f59e0b" },
      { icon: "🔍", label: "Сравнить", action: () => {}, color: "#a78bfa" },
      { icon: "📊", label: "Аналитика", action: () => navigate("/analytics"), color: "#60a5fa" },
    ],
    en: [
      { icon: "⭐", label: "Top picks", action: () => {}, color: "#f59e0b" },
      { icon: "🔍", label: "Compare", action: () => {}, color: "#a78bfa" },
      { icon: "📊", label: "Analytics", action: () => navigate("/analytics"), color: "#60a5fa" },
    ],
  },
  demoApp: {
    ru: [
      { icon: "📋", label: "Получить КП", action: () => {}, color: "#34d399" },
      { icon: "🎨", label: "Кастомизация", action: () => {}, color: "#a78bfa" },
      { icon: "📱", label: "Другие демо", action: () => navigate("/projects"), color: "#60a5fa" },
    ],
    en: [
      { icon: "📋", label: "Get proposal", action: () => {}, color: "#34d399" },
      { icon: "🎨", label: "Customize", action: () => {}, color: "#a78bfa" },
      { icon: "📱", label: "More demos", action: () => navigate("/projects"), color: "#60a5fa" },
    ],
  },
  demoLanding: {
    ru: [
      { icon: "▶️", label: "Запустить демо", action: () => {}, color: "#34d399" },
      { icon: "📋", label: "Получить КП", action: () => {}, color: "#f59e0b" },
      { icon: "💬", label: "Задать вопрос", action: () => {}, color: "#60a5fa" },
    ],
    en: [
      { icon: "▶️", label: "Try demo", action: () => {}, color: "#34d399" },
      { icon: "📋", label: "Get proposal", action: () => {}, color: "#f59e0b" },
      { icon: "💬", label: "Ask question", action: () => {}, color: "#60a5fa" },
    ],
  },
  constructor: {
    ru: [
      { icon: "🤖", label: "AI-помощник", action: () => {}, color: "#34d399" },
      { icon: "💡", label: "Примеры", action: () => navigate("/projects"), color: "#f59e0b" },
      { icon: "📞", label: "Консультация", action: () => {}, color: "#a78bfa" },
    ],
    en: [
      { icon: "🤖", label: "AI helper", action: () => {}, color: "#34d399" },
      { icon: "💡", label: "Examples", action: () => navigate("/projects"), color: "#f59e0b" },
      { icon: "📞", label: "Consultation", action: () => {}, color: "#a78bfa" },
    ],
  },
};

const PROACTIVE_MESSAGES: Record<string, { ru: string; en: string }> = {
  demoApp: { ru: "Нравится это демо? 👀", en: "Like this demo? 👀" },
  projects: { ru: "Помочь подобрать? 🎯", en: "Need help choosing? 🎯" },
  constructor: { ru: "Собираете проект? 🏗️", en: "Building a project? 🏗️" },
};

const PROACTIVE_DELAY = 15000;
const SHAKE_THRESHOLD = 20;
const SHAKE_COOLDOWN = 3000;

const GLASS = {
  bg: "rgba(28,28,30,0.82)",
  border: "rgba(255,255,255,0.15)",
  blur: "saturate(180%) blur(40px)",
};

function getLastAIMessage(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const msgs = JSON.parse(stored);
    if (!Array.isArray(msgs)) return null;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "assistant" && msgs[i].content) {
        const text = msgs[i].content
          .replace(/```[\s\S]*?```/g, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/#{1,6}\s/g, "")
          .trim();
        if (text) return text.slice(0, 80) + (text.length > 80 ? "..." : "");
      }
    }
    return null;
  } catch {
    return null;
  }
}

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const AIAgentButton = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [proactiveMessage, setProactiveMessage] = useState<string | null>(null);
  const [showProactive, setShowProactive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [aiToast, setAiToast] = useState<string | null>(null);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const [tourActive, setTourActive] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const { hapticFeedback } = useTelegram();
  const { route } = useRouting();
  const { language } = useLanguage();
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const proactiveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissedPages = useRef<Set<string>>(new Set());
  const shakeLastTime = useRef(0);
  const shakeLastX = useRef(0);
  const shakeLastY = useRef(0);
  const shakeLastZ = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuOpenedViaLongPress = useRef(false);
  const handleOpenRef = useRef<() => void>(() => {});
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const proactiveHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageContext: PageContext = useMemo(() => ({
    currentPage: route.path,
    demoId: route.params?.id,
  }), [route.path, route.params?.id]);

  const handleToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setAiToast(msg);
    toastTimerRef.current = setTimeout(() => setAiToast(null), 5000);
  }, []);

  const { clipboardSuggestion, dismissClipboard } = useAIInteractions({
    pageComponent: route.component,
    language,
    isOpen,
    onToast: handleToast,
    onOpen: () => handleOpenRef.current(),
  });

  useSwipeGesture(fabRef, useMemo(() => ({
    onSwipeUp: () => {
      queueMicrotask(() => hapticFeedback.light());
      handleOpenRef.current();
    },
    onSwipeLeft: () => {
      queueMicrotask(() => hapticFeedback.light());
      const personaSwitchEvent = new CustomEvent("ai-persona-cycle", { detail: "next" });
      window.dispatchEvent(personaSwitchEvent);
      handleToast(language === "ru" ? "🔄 Переключена персона" : "🔄 Persona switched");
    },
    onSwipeRight: () => {
      queueMicrotask(() => hapticFeedback.light());
      const personaSwitchEvent = new CustomEvent("ai-persona-cycle", { detail: "prev" });
      window.dispatchEvent(personaSwitchEvent);
      handleToast(language === "ru" ? "🔄 Переключена персона" : "🔄 Persona switched");
    },
  }), [hapticFeedback, language, handleToast]));

  useEffect(() => {
    const handleTourEvent = (e: Event) => {
      const steps = (e as CustomEvent).detail;
      if (Array.isArray(steps) && steps.length > 0) {
        setTourSteps(steps);
        setTourActive(true);
      }
    };
    const handleSummaryEvent = () => {
      setShowSessionSummary(true);
    };
    window.addEventListener("ai-guided-tour", handleTourEvent);
    window.addEventListener("ai-session-summary", handleSummaryEvent);
    return () => {
      window.removeEventListener("ai-guided-tour", handleTourEvent);
      window.removeEventListener("ai-session-summary", handleSummaryEvent);
    };
  }, []);

  useEffect(() => {
    setLastMessage(getLastAIMessage());
  }, [isOpen]);

  useEffect(() => {
    pageEntryRef.current = Date.now();
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
        if (proactiveHideTimerRef.current) clearTimeout(proactiveHideTimerRef.current);
        proactiveHideTimerRef.current = setTimeout(() => setShowProactive(false), 8000);
      }, PROACTIVE_DELAY);
    }

    return () => {
      if (proactiveTimer.current) clearTimeout(proactiveTimer.current);
      if (proactiveHideTimerRef.current) clearTimeout(proactiveHideTimerRef.current);
    };
  }, [route.component, isOpen, language]);

  const pageEntryRef = useRef(Date.now());

  useEffect(() => {
    const previewTimer = setTimeout(() => {
      const msg = getLastAIMessage();
      if (msg && !isOpen && !showMenu) {
        setLastMessage(msg);
        setShowPreview(true);
        if (previewHideTimerRef.current) clearTimeout(previewHideTimerRef.current);
        previewHideTimerRef.current = setTimeout(() => setShowPreview(false), 6000);
      }
    }, 5000);

    return () => {
      clearTimeout(previewTimer);
      if (previewHideTimerRef.current) clearTimeout(previewHideTimerRef.current);
    };
  }, [route.component]);

  useEffect(() => {
    const handleAiToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string") handleToast(detail);
    };
    window.addEventListener("ai-toast", handleAiToast);
    return () => {
      window.removeEventListener("ai-toast", handleAiToast);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [handleToast]);

  useEffect(() => {
    let lastShakeTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const now = Date.now();
      const timeDiff = now - shakeLastTime.current;

      if (timeDiff > 100) {
        const diffX = Math.abs(acc.x - shakeLastX.current);
        const diffY = Math.abs(acc.y - shakeLastY.current);
        const diffZ = Math.abs(acc.z - shakeLastZ.current);
        const speed = (diffX + diffY + diffZ) / (timeDiff / 1000);

        if (speed > SHAKE_THRESHOLD && now - lastShakeTime > SHAKE_COOLDOWN) {
          lastShakeTime = now;
          if (!isOpen) {
            queueMicrotask(() => hapticFeedback.heavy());
            const ctx = route.component;
            const pageLabel = language === "ru"
              ? `Вижу, ты на странице "${ctx}". Чем помочь?`
              : `I see you're on the "${ctx}" page. How can I help?`;
            if (shakeToastTimerRef.current) clearTimeout(shakeToastTimerRef.current);
            setAiToast(pageLabel);
            shakeToastTimerRef.current = setTimeout(() => setAiToast(null), 4000);
            handleOpenRef.current();
          }
        }

        shakeLastTime.current = now;
        shakeLastX.current = acc.x;
        shakeLastY.current = acc.y;
        shakeLastZ.current = acc.z;
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isOpen, route.component, language]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasOpened(true);
    setShowProactive(false);
    setShowMenu(false);
    setShowPreview(false);
    dismissedPages.current.add(route.component);
    queueMicrotask(() => hapticFeedback.medium());
  }, [route.component, hapticFeedback]);

  handleOpenRef.current = handleOpen;

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleDismissProactive = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProactive(false);
    dismissedPages.current.add(route.component);
  }, [route.component]);

  const handleFabPointerDown = useCallback(() => {
    menuOpenedViaLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      menuOpenedViaLongPress.current = true;
      setShowMenu(true);
      setShowPreview(false);
      queueMicrotask(() => hapticFeedback.medium());
    }, 400);
  }, [hapticFeedback]);

  const handleFabPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleFabClick = useCallback(() => {
    if (menuOpenedViaLongPress.current) {
      menuOpenedViaLongPress.current = false;
      return;
    }
    if (showMenu) {
      setShowMenu(false);
      return;
    }
    handleOpen();
  }, [showMenu, handleOpen]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    queueMicrotask(() => hapticFeedback.light());

    if (action.label === "Узнать цены" || action.label === "See prices" ||
        action.label === "Получить КП" || action.label === "Get proposal" ||
        action.label === "Задать вопрос" || action.label === "Ask question" ||
        action.label === "AI-помощник" || action.label === "AI helper" ||
        action.label === "Консультация" || action.label === "Consultation" ||
        action.label === "Сравнить" || action.label === "Compare" ||
        action.label === "Кастомизация" || action.label === "Customize" ||
        action.label === "Топ решения" || action.label === "Top picks") {
      setShowMenu(false);
      handleOpen();
      return;
    }

    if (action.label === "Запустить демо" || action.label === "Try demo") {
      const demoId = route.params?.id;
      if (demoId) navigate(`/demos/${demoId}/app`);
      setShowMenu(false);
      return;
    }

    action.action();
    setShowMenu(false);
  }, [handleOpen, route.params?.id]);

  const pageActions = useMemo(() => {
    const actions = PAGE_ACTIONS[route.component];
    if (!actions) return PAGE_ACTIONS.showcase[language === "ru" ? "ru" : "en"];
    return actions[language === "ru" ? "ru" : "en"];
  }, [route.component, language]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (previewHideTimerRef.current) clearTimeout(previewHideTimerRef.current);
      if (proactiveHideTimerRef.current) clearTimeout(proactiveHideTimerRef.current);
      if (shakeToastTimerRef.current) clearTimeout(shakeToastTimerRef.current);
      if (proactiveTimer.current) clearTimeout(proactiveTimer.current);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {aiToast && (
          <m.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            style={{
              position: "fixed", top: "20px", left: "16px", right: "16px",
              background: GLASS.bg,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
              color: "#fff", padding: "14px 18px",
              borderRadius: "16px",
              border: `0.5px solid ${GLASS.border}`,
              fontSize: "14px", fontWeight: 500,
              zIndex: 10001, letterSpacing: "-0.01em",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", gap: "10px",
            }}
          >
            <span style={{
              width: "28px", height: "28px", borderRadius: "14px",
              background: "linear-gradient(145deg, #34d399dd, #34d39966)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", flexShrink: 0,
            }}>🧑‍💼</span>
            <span style={{ flex: 1, lineHeight: "1.4" }}>{aiToast}</span>
            <button type="button" onClick={() => setAiToast(null)}
              style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                cursor: "pointer", fontSize: "16px", padding: "4px", flexShrink: 0,
              }}
            >×</button>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreview && lastMessage && !isOpen && !showMenu && !showProactive && (
          <m.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={handleOpen}
            style={{
              position: "fixed", right: "78px", bottom: "95px",
              background: GLASS.bg,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
              color: "rgba(255,255,255,0.8)", padding: "10px 14px",
              borderRadius: "14px 14px 4px 14px",
              border: `0.5px solid ${GLASS.border}`,
              fontSize: "12.5px", lineHeight: "1.45",
              maxWidth: "220px", cursor: "pointer",
              zIndex: 9988, letterSpacing: "-0.01em",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div style={{
              fontSize: "10px", color: "#34d399", fontWeight: 600,
              marginBottom: "4px", letterSpacing: "0.02em",
            }}>
              🧑‍💼 {language === "ru" ? "Алекс" : "Alex"}
            </div>
            {lastMessage}
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProactive && proactiveMessage && !showMenu && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={handleOpen}
            style={{
              position: "fixed", right: "16px", bottom: "155px",
              background: GLASS.bg,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
              color: "#fff", padding: "11px 16px",
              borderRadius: "18px 18px 6px 18px",
              border: `0.5px solid ${GLASS.border}`,
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
      </AnimatePresence>

      <AnimatePresence>
        {showMenu && !isOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowMenu(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                zIndex: 9989,
              }}
            />

            <m.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 22, stiffness: 320, mass: 0.6 }}
              style={{
                position: "fixed", right: "16px", bottom: "155px",
                background: GLASS.bg,
                backdropFilter: GLASS.blur,
                WebkitBackdropFilter: GLASS.blur,
                borderRadius: "20px",
                border: `0.5px solid ${GLASS.border}`,
                padding: "6px",
                zIndex: 9991,
                boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
                minWidth: "180px",
              }}
            >
              <div style={{
                padding: "10px 12px 6px",
                fontSize: "10px", fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                {language === "ru" ? "Быстрые действия" : "Quick Actions"}
              </div>

              {pageActions.map((action, i) => (
                <m.button
                  key={i}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.2 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "11px 12px",
                    background: "transparent", border: "none",
                    color: "#fff", fontSize: "13.5px", fontWeight: 500,
                    cursor: "pointer", borderRadius: "14px",
                    letterSpacing: "-0.01em",
                    transition: "background 0.15s",
                    textAlign: "left",
                  }}
                  onPointerEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onPointerLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    width: "32px", height: "32px", borderRadius: "10px",
                    background: `${action.color || "#34d399"}15`,
                    border: `0.5px solid ${action.color || "#34d399"}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", flexShrink: 0,
                  }}>
                    {action.icon}
                  </span>
                  {action.label}
                </m.button>
              ))}

              <div style={{
                height: "0.5px",
                background: "rgba(255,255,255,0.08)",
                margin: "4px 12px",
              }} />

              <m.button
                type="button"
                onClick={handleOpen}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: pageActions.length * 0.06, duration: 0.2 }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%", padding: "11px 12px",
                  background: "transparent", border: "none",
                  color: "#34d399", fontSize: "13.5px", fontWeight: 500,
                  cursor: "pointer", borderRadius: "14px",
                  letterSpacing: "-0.01em",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onPointerEnter={(e) => { e.currentTarget.style.background = "rgba(52,211,153,0.06)"; }}
                onPointerLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{
                  width: "32px", height: "32px", borderRadius: "10px",
                  background: "rgba(52,211,153,0.12)",
                  border: "0.5px solid rgba(52,211,153,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px", flexShrink: 0,
                }}>
                  💬
                </span>
                {language === "ru" ? "Открыть чат" : "Open chat"}
              </m.button>
            </m.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {clipboardSuggestion && !isOpen && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={() => { dismissClipboard(); handleOpen(); }}
            style={{
              position: "fixed", right: "78px", bottom: "100px",
              background: "rgba(10,14,18,0.92)",
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
              color: "#fff", padding: "10px 14px",
              borderRadius: "14px 14px 4px 14px",
              border: "0.5px solid rgba(52,211,153,0.2)",
              fontSize: "12.5px", lineHeight: "1.45",
              maxWidth: "240px", cursor: "pointer",
              zIndex: 9989, letterSpacing: "-0.01em",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(52,211,153,0.06)",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "4px",
            }}>
              <span style={{
                fontSize: "10px", color: "#34d399", fontWeight: 600,
                letterSpacing: "0.02em",
              }}>
                🧑‍💼 {language === "ru" ? "Алекс" : "Alex"}
              </span>
              <button type="button" onClick={(e) => { e.stopPropagation(); dismissClipboard(); }}
                style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.3)",
                  cursor: "pointer", fontSize: "12px", padding: "0 2px",
                }}>×</button>
            </div>
            <span style={{ color: "rgba(255,255,255,0.75)" }}>{clipboardSuggestion}</span>
          </m.div>
        )}
      </AnimatePresence>

      <m.button
        ref={fabRef}
        type="button"
        onClick={handleFabClick}
        onPointerDown={handleFabPointerDown}
        onPointerUp={handleFabPointerUp}
        onPointerCancel={handleFabPointerUp}
        whileTap={{ scale: 0.92 }}
        style={{
          position: "fixed", right: "16px", bottom: "90px",
          width: "54px", height: "54px", borderRadius: "27px",
          border: "0.5px solid rgba(255,255,255,0.15)",
          background: showMenu
            ? "rgba(52,211,153,0.95)"
            : "rgba(52,211,153,0.85)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          boxShadow: showMenu
            ? "0 4px 28px rgba(52,211,153,0.5), 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)"
            : "0 4px 20px rgba(52,211,153,0.3), 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9990,
          WebkitTapHighlightColor: "transparent",
          transition: "background 0.3s, box-shadow 0.3s",
        }}
        aria-label={showMenu ? "Close menu" : "Chat with Alex"}
      >
        {showMenu ? <CloseIcon /> : <ChatIcon />}
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

      {tourActive && tourSteps.length > 0 && (
        <Suspense fallback={null}>
          <AIGuidedTour
            steps={tourSteps}
            isActive={tourActive}
            onComplete={() => { setTourActive(false); setTourSteps([]); }}
            onSkip={() => { setTourActive(false); setTourSteps([]); }}
            language={language}
          />
        </Suspense>
      )}

      {showSessionSummary && (
        <Suspense fallback={null}>
          <AISessionSummary
            isVisible={showSessionSummary}
            onDismiss={() => setShowSessionSummary(false)}
            onOpenChat={() => { setShowSessionSummary(false); handleOpen(); }}
            language={language}
          />
        </Suspense>
      )}
    </>
  );
});
