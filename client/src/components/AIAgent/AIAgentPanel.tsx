import { useRef, useEffect, memo, useState, useCallback, useMemo } from "react";
import { AnimatePresence, m } from "@/utils/LazyMotionProvider";
import { useAIAgent, type PageContext, type Persona } from "@/hooks/useAIAgent";
import { AIAgentMessage } from "./AIAgentMessage";
import { AIAgentInput } from "./AIAgentInput";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTelegram } from "@/hooks/useTelegram";

interface AIAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext?: PageContext;
}

const STAGE_COLORS: Record<string, string> = {
  awareness: "#60a5fa",
  interest: "#a78bfa",
  consideration: "#f59e0b",
  decision: "#f97316",
  action: "#34d399",
};

const STAGE_LABELS: Record<string, { ru: string; en: string }> = {
  awareness: { ru: "Знакомство", en: "Awareness" },
  interest: { ru: "Интерес", en: "Interest" },
  consideration: { ru: "Выбор", en: "Consideration" },
  decision: { ru: "Решение", en: "Decision" },
  action: { ru: "Сделка", en: "Action" },
};

const GLASS = {
  bg: "rgba(28, 28, 30, 0.72)",
  border: "rgba(255,255,255,0.18)",
  borderSub: "rgba(255,255,255,0.08)",
  blur: "saturate(180%) blur(40px)",
  btnBg: "rgba(255,255,255,0.08)",
};

/* v7: opaque OLED panel + OKLCH text scale */
const PANEL = {
  bg: "#0a0a0c",
  bgRaised: "rgba(255,255,255,0.035)",
  borderTopGlow: "rgba(52,211,153,0.18)",
  ink: "rgba(255,255,255,0.94)",
  body: "rgba(255,255,255,0.72)",
  sub: "rgba(255,255,255,0.52)",
  meta: "rgba(255,255,255,0.36)",
  hair: "rgba(255,255,255,0.08)",
  hairSoft: "rgba(255,255,255,0.05)",
};
const EMERALD_V7 = "#34d399";
const EMERALD_SOFT_V7 = "#6ee7b7";
const ONDER_FONT = '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const DISPLAY_FONT_V7 = '"Stengazeta", "Manrope", system-ui, sans-serif';

/* ──────────────────────────────────────────────────────────────────
   v7 wave 3 — AlexOrb: replaces emoji avatar with editorial vector identity
   Dual-ring core (OLED + emerald rim) + slow conic-gradient halo rotation.
   Respects prefers-reduced-motion (no rotation).
   ────────────────────────────────────────────────────────────────── */
const AlexOrb = ({ size = 40, accent = "#34d399", soft = "#6ee7b7", live = false }: {
  size?: number; accent?: string; soft?: string; live?: boolean;
}) => {
  const ringStroke = Math.max(1, Math.round(size * 0.04));
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative", width: size, height: size,
        borderRadius: "50%",
        flexShrink: 0,
      }}
    >
      {/* outer conic halo (slow rotation) */}
      <div className="alex-orb-halo" style={{
        position: "absolute", inset: -2, borderRadius: "50%",
        background: `conic-gradient(from 0deg, ${accent} 0%, transparent 30%, ${soft}aa 50%, transparent 70%, ${accent} 100%)`,
        opacity: live ? 0.95 : 0.55,
        filter: `blur(${Math.max(2, size * 0.06)}px)`,
        transition: "opacity 0.35s cubic-bezier(0.32,0.72,0,1)",
      }} />
      {/* dark core */}
      <div style={{
        position: "absolute", inset: 2, borderRadius: "50%",
        background: "radial-gradient(circle at 30% 25%, #1a1a1f 0%, #050507 70%)",
        border: `0.5px solid rgba(255,255,255,0.12)`,
      }} />
      {/* inner emerald rim */}
      <div style={{
        position: "absolute", inset: Math.max(2, size * 0.18), borderRadius: "50%",
        border: `${ringStroke}px solid ${accent}`,
        boxShadow: `0 0 ${Math.round(size * 0.28)}px ${accent}55, inset 0 0 ${Math.round(size * 0.16)}px ${accent}33`,
        opacity: 0.92,
      }} />
      {/* inner dot */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: Math.max(3, Math.round(size * 0.14)),
        height: Math.max(3, Math.round(size * 0.14)),
        borderRadius: "50%",
        background: accent,
        boxShadow: `0 0 ${Math.round(size * 0.22)}px ${accent}`,
        animation: live ? "alex-orb-pulse 2.4s cubic-bezier(0.32,0.72,0,1) infinite" : undefined,
      }} />
    </div>
  );
};

const ChevronDownIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const PeopleIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3.5" />
    <path d="M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
    <circle cx="17.5" cy="8.5" r="2.5" />
    <path d="M20 21v-.5a3.5 3.5 0 0 0-3-3.46" />
  </svg>
);

const SearchIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const ShareIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const InsightsIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20V10" />
    <path d="M18 20V4" />
    <path d="M6 20v-4" />
  </svg>
);

const ArrowDownIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

function getDateLabel(date: Date, lang: string): string {
  const now = new Date();
  const d = new Date(date);
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return lang === "ru" ? "Сегодня" : "Today";
  if (isYesterday) return lang === "ru" ? "Вчера" : "Yesterday";

  return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
  });
}

const ONBOARDING_STEPS = [
  {
    ru: "Алекс — ваш AI-консультант. Расскажите о бизнесе, и он подберёт решение",
    en: "Alex is your AI consultant. Tell about your business and he'll find a solution",
    icon: "💬",
  },
  {
    ru: "Нажмите 📷 чтобы загрузить скриншот конкурента для анализа",
    en: "Tap 📷 to upload a competitor screenshot for analysis",
    icon: "📸",
  },
  {
    ru: "Нажмите 📞 чтобы включить голосовой режим — как звонок Алексу",
    en: "Tap 📞 to enable voice mode — like calling Alex",
    icon: "🎙️",
  },
  {
    ru: "Переключайтесь между 4 экспертами — дизайнер, разработчик, стратег",
    en: "Switch between 4 experts — designer, developer, strategist",
    icon: "👥",
  },
];

const SUGGESTED_REPLIES_BY_STAGE: Record<string, { ru: string[]; en: string[] }> = {
  awareness: {
    ru: ["Расскажите подробнее", "Покажите примеры", "Какие ниши?"],
    en: ["Tell me more", "Show examples", "What niches?"],
  },
  interest: {
    ru: ["Сколько это стоит?", "Какие сроки?", "Покажите портфолио"],
    en: ["What's the cost?", "What's the timeline?", "Show portfolio"],
  },
  consideration: {
    ru: ["Сравните варианты", "Какие гарантии?", "Посчитайте ROI"],
    en: ["Compare options", "What guarantees?", "Calculate ROI"],
  },
  decision: {
    ru: ["Давайте начнём!", "Расскажите об оплате", "Составьте бриф"],
    en: ["Let's start!", "Payment details?", "Create a brief"],
  },
  action: {
    ru: ["Реквизиты для оплаты", "Условия рассрочки?", "Когда старт?"],
    en: ["Payment details", "Installment terms?", "When do we start?"],
  },
};

function ConversationInsights({ dealStage, dealTemperature, messageCount, language }: {
  dealStage: string; dealTemperature: number; messageCount: number; language: string;
}) {
  const stages = ["awareness", "interest", "consideration", "decision", "action"];
  const currentIdx = stages.indexOf(dealStage);
  const labels = STAGE_LABELS[dealStage];
  const stageLabel = labels ? (language === "ru" ? labels.ru : labels.en) : dealStage;
  const stageColor = STAGE_COLORS[dealStage] || "#60a5fa";
  const pct = Math.round(dealTemperature * 100);

  return (
    <m.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      style={{ overflow: "hidden", flexShrink: 0 }}
    >
      <div style={{
        padding: "14px 20px",
        borderBottom: `0.5px solid ${GLASS.borderSub}`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "12px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>
            {language === "ru" ? "ПРОГРЕСС ДИАЛОГА" : "CONVERSATION PROGRESS"}
          </div>
          <div style={{
            fontSize: "11px", fontWeight: 600, color: stageColor,
            background: `${stageColor}15`, padding: "3px 10px", borderRadius: "8px",
            border: `0.5px solid ${stageColor}25`,
          }}>
            {stageLabel} · {pct}%
          </div>
        </div>

        <div style={{
          display: "flex", gap: "3px", marginBottom: "10px",
        }}>
          {stages.map((s, i) => (
            <div key={s} style={{
              flex: 1, height: "3px", borderRadius: "1.5px",
              background: i <= currentIdx
                ? `linear-gradient(90deg, ${STAGE_COLORS[s] || "#60a5fa"}, ${STAGE_COLORS[stages[Math.min(i + 1, stages.length - 1)]] || "#34d399"})`
                : "rgba(255,255,255,0.06)",
              transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1)",
              boxShadow: i <= currentIdx ? `0 0 8px ${STAGE_COLORS[s]}30` : "none",
            }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: "10px",
            padding: "8px 10px", border: "0.5px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.02em" }}>
              {language === "ru" ? "СООБЩЕНИЙ" : "MESSAGES"}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              {messageCount}
            </div>
          </div>
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: "10px",
            padding: "8px 10px", border: "0.5px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.02em" }}>
              {language === "ru" ? "ГОТОВНОСТЬ" : "READINESS"}
            </div>
            <div style={{
              fontSize: "16px", fontWeight: 700, color: stageColor, letterSpacing: "-0.02em",
            }}>
              {pct}%
            </div>
          </div>
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: "10px",
            padding: "8px 10px", border: "0.5px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.02em" }}>
              {language === "ru" ? "СТАДИЯ" : "STAGE"}
            </div>
            <div style={{
              fontSize: "12px", fontWeight: 600, color: stageColor, letterSpacing: "-0.01em",
              marginTop: "2px",
            }}>
              {stageLabel}
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}

export const AIAgentPanel = memo(({ isOpen, onClose, pageContext }: AIAgentPanelProps) => {
  const {
    messages, filteredMessages, isLoading, isSpeaking, voiceMode,
    activePersona, dealStage, dealTemperature,
    sendMessage, speakText, stopGeneration, retryMessage,
    toggleVoiceMode,
    showOnboarding, dismissOnboarding,
    searchQuery, setSearchQuery,
    shareConversation, speechLang,
    scheduleFollowup, cancelFollowup,
    thinkingPhrase, pagesVisited, setMessageFeedback,
    memory, updateMemory, clearMemoryField,
  } = useAIAgent(pageContext);
  const { language } = useLanguage();
  const { hapticFeedback } = useTelegram();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /* v7 wave 4: keyboard tracking — visualViewport + Telegram viewportChanged + window resize fallback */
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let baseHeight = window.innerHeight;
    const update = () => {
      let offset = 0;
      const vv = window.visualViewport;
      if (vv) {
        offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      } else {
        offset = Math.max(0, baseHeight - window.innerHeight);
      }
      setKeyboardHeight(offset > 80 ? offset : 0);  /* ignore small bars/notches */
    };
    /* Telegram WebApp viewport */
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.onEvent) {
      tg.onEvent("viewportChanged", update);
    }
    /* visualViewport (modern browsers + WebKit) */
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", update);
      window.visualViewport.addEventListener("scroll", update);
    }
    /* Fallback — window resize (older Android WebView) */
    window.addEventListener("resize", update);
    update();
    return () => {
      if (tg?.offEvent) tg.offEvent("viewportChanged", update);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", update);
        window.visualViewport.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
    };
  }, []);

  /* auto-scroll to bottom when keyboard opens (so the latest message stays visible above keyboard) */
  useEffect(() => {
    if (keyboardHeight > 0 && scrollRef.current) {
      const el = scrollRef.current;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [keyboardHeight]);

  /* v7 wave 4 — swipe-down-to-close (iOS bottom-sheet pattern).
     Three behaviours combined:
       1. Fast downward flick (velocity > 0.65 px/ms) from anywhere → closes.
       2. Drag from top "grabber zone" (~100px) → always tracks finger + closes if > 120px.
       3. Drag from messages area → only if scroll is at the top + > 120px. */
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const touchStartScrollTop = useRef(0);
  const touchInGrabberZone = useRef(false);

  const onPanelTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStartY.current = t.clientY;
    touchStartTime.current = Date.now();
    touchStartScrollTop.current = scrollRef.current?.scrollTop ?? 0;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    touchInGrabberZone.current = (t.clientY - rect.top) < 100;
  }, []);

  const onPanelTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta < 6) return;
    /* only react to downward swipes from grabber-zone OR top of scroll */
    if (touchInGrabberZone.current || touchStartScrollTop.current <= 0) {
      if (!isDragging) setIsDragging(true);
      setDragY(Math.max(0, delta * 0.92));
    }
  }, [isDragging]);

  const onPanelTouchEnd = useCallback(() => {
    const duration = Date.now() - touchStartTime.current;
    const velocity = dragY / Math.max(duration, 1);
    /* also catch a "fast flick down" gesture regardless of scroll position */
    const flick = !isDragging && (Date.now() - touchStartTime.current) < 250;
    if (dragY > 120 || velocity > 0.65 || (flick && dragY > 60)) {
      queueMicrotask(() => hapticFeedback.light());
      onClose();
      setDragY(0);
      setIsDragging(false);
      return;
    }
    setDragY(0);
    setIsDragging(false);
  }, [dragY, isDragging, onClose, hapticFeedback]);



  const lastStreamContent = useMemo(() => {
    const last = messages[messages.length - 1];
    return last?.isStreaming ? last.content : null;
  }, [messages]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const last = messages[messages.length - 1];
    const isStreaming = last?.isStreaming && last?.role === "assistant";
    if (isAtBottom || isStreaming) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isAtBottom, lastStreamContent]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setIsAtBottom(atBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      setIsAtBottom(true);
    }
  }, []);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    const isThinking = lastMsg?.isStreaming && !lastMsg?.content && lastMsg?.role === "assistant";

    if (isThinking) {
      setThinkingSeconds(0);
      thinkingTimerRef.current = setInterval(() => {
        setThinkingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      setThinkingSeconds(0);
    }

    return () => {
      if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
    };
  }, [messages]);

  const handleSend = (content: string, imageBase64?: string, imageMimeType?: string) => {
    queueMicrotask(() => hapticFeedback.light());
    cancelFollowup();
    setIsAtBottom(true);
    sendMessage(content, imageBase64, imageMimeType);
  };

  const handleClose = () => {
    queueMicrotask(() => hapticFeedback.light());
    scheduleFollowup();
    onClose();
  };

  const handleSpeak = (text: string) => {
    queueMicrotask(() => hapticFeedback.light());
    speakText(text);
  };

  const handleButtonClick = (text: string) => {
    queueMicrotask(() => hapticFeedback.light());
    cancelFollowup();
    setIsAtBottom(true);
    sendMessage(text);
  };

  const handleOpenDemo = useCallback((demoId: string) => {
    queueMicrotask(() => hapticFeedback.medium());
    cancelFollowup();
    onClose();
    /* navigate after the close animation finishes */
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.hash = `#/demos/${demoId}/app`;
      }
    }, 280);
  }, [hapticFeedback, cancelFollowup, onClose]);

  const handleReply = useCallback((text: string) => {
    const prefix = `> ${text.slice(0, 60)}${text.length > 60 ? "..." : ""}\n\n`;
    cancelFollowup();
    setIsAtBottom(true);
    sendMessage(prefix);
  }, [sendMessage, cancelFollowup]);

  const handleFeedback = useCallback((messageId: string, fb: "up" | "down" | null) => {
    queueMicrotask(() => hapticFeedback.light());
    setMessageFeedback(messageId, fb);
    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [{
          category: "ai",
          action: "message_feedback",
          timestamp: Date.now(),
          messageId,
          feedback: fb,
          persona: activePersona.id,
        }],
      }),
    }).catch(() => {});
  }, [activePersona, hapticFeedback, setMessageFeedback]);

  const handleNextOnboarding = () => {
    queueMicrotask(() => hapticFeedback.light());
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(s => s + 1);
    } else {
      dismissOnboarding();
    }
  };

  const stageColor = STAGE_COLORS[dealStage] || "#60a5fa";
  const displayMessages = showSearch && searchQuery ? filteredMessages : messages;

  const lastMsg = messages[messages.length - 1];
  const showSuggested = lastMsg?.role === "assistant" && !lastMsg.isStreaming && !isLoading && messages.length > 0;
  const suggestedReplies = SUGGESTED_REPLIES_BY_STAGE[dealStage] || SUGGESTED_REPLIES_BY_STAGE.awareness;
  const suggestions = language === "ru" ? suggestedReplies.ru : suggestedReplies.en;

  const dynamicSuggestions = useMemo(() => {
    if (!lastMsg || lastMsg.role !== "assistant" || !lastMsg.content) return suggestions;
    const text = lastMsg.content.toLowerCase();
    const dynamic: string[] = [];

    if (language === "ru") {
      if (/цен[аы]|стоимост|\d+\s*₽|тариф/.test(text) && !dynamic.includes("Что входит в стоимость?")) dynamic.push("Что входит в стоимость?");
      if (/демо|пример|портфолио|проект/.test(text) && !dynamic.includes("Покажите ещё примеры")) dynamic.push("Покажите ещё примеры");
      if (/день|дней|недел|срок|быстро/.test(text) && !dynamic.includes("Можно быстрее?")) dynamic.push("Можно быстрее?");
      if (/mvp|базов|минимал/.test(text) && !dynamic.includes("Что в MVP?")) dynamic.push("Что в MVP?");
      if (/roi|окупаем|экономи|потер/.test(text) && !dynamic.includes("Посчитайте ROI для меня")) dynamic.push("Посчитайте ROI для меня");
      if (/рассрочк|оплат|предоплат/.test(text) && !dynamic.includes("Какие варианты оплаты?")) dynamic.push("Какие варианты оплаты?");
    } else {
      if (/price|cost|\$|tariff/.test(text)) dynamic.push("What's included?");
      if (/demo|example|portfolio/.test(text)) dynamic.push("Show more examples");
      if (/day|week|timeline|fast/.test(text)) dynamic.push("Can it be faster?");
      if (/mvp|basic|minimal/.test(text)) dynamic.push("What's in MVP?");
      if (/roi|savings|loss/.test(text)) dynamic.push("Calculate ROI for me");
    }

    return dynamic.length > 0 ? dynamic.slice(0, 3) : suggestions;
  }, [lastMsg, language, suggestions]);

  const visitedDemos = useMemo(() => {
    return pagesVisited.filter(p => p.startsWith("/demos/") && p.includes("/app"));
  }, [pagesVisited]);

  const demoNames: Record<string, string> = useMemo(() => ({
    "/demos/restaurant/app": language === "ru" ? "Ресторан" : "Restaurant",
    "/demos/beauty/app": language === "ru" ? "Салон" : "Beauty",
    "/demos/shop/app": language === "ru" ? "Магазин" : "Shop",
    "/demos/fitness/app": language === "ru" ? "Фитнес" : "Fitness",
    "/demos/hotel/app": language === "ru" ? "Отель" : "Hotel",
    "/demos/education/app": language === "ru" ? "Обучение" : "Education",
    "/demos/clinic/app": language === "ru" ? "Клиника" : "Clinic",
    "/demos/auto/app": language === "ru" ? "Авто" : "Auto",
    "/demos/realestate/app": language === "ru" ? "Недвижимость" : "Real Estate",
  }), [language]);

  const showComparisonChip = visitedDemos.length >= 3 && showSuggested;
  const comparisonLabel = useMemo(() => {
    if (visitedDemos.length < 3) return "";
    const names = visitedDemos.slice(-3).map(d => demoNames[d] || d.split("/")[2]).join(", ");
    return language === "ru" ? `Сравнить: ${names}` : `Compare: ${names}`;
  }, [visitedDemos, demoNames, language]);

  let lastDateLabel = "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)", zIndex: 9998,
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            }}
          />

          <m.div
            initial={{ y: "100%" }}
            animate={{ y: dragY }}
            exit={{ y: "100%" }}
            transition={isDragging ? { type: "tween", duration: 0 } : { type: "spring", damping: 34, stiffness: 420, mass: 0.65 }}
            onTouchStart={onPanelTouchStart}
            onTouchMove={onPanelTouchMove}
            onTouchEnd={onPanelTouchEnd}
            onTouchCancel={onPanelTouchEnd}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              height: keyboardHeight > 0 ? `calc(100dvh - ${keyboardHeight}px)` : "88dvh", zIndex: 9999,
              display: "flex", flexDirection: "column",
              background: PANEL.bg,
              borderRadius: "24px 24px 0 0",
              border: `0.5px solid ${PANEL.hair}`,
              borderTop: `1px solid ${PANEL.borderTopGlow}`,
              borderBottom: "none",
              overflow: "hidden",
              boxShadow: "0 -16px 80px rgba(0,0,0,0.65), 0 -2px 24px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "1px",
              background: `linear-gradient(90deg, transparent 8%, ${EMERALD_V7}66 50%, transparent 92%)`,
              zIndex: 1,
            }} />

            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "8px 0 0", flexShrink: 0,
            }}>
              <div style={{
                width: "36px", height: "4px", borderRadius: "2px",
                background: "rgba(255,255,255,0.2)", marginBottom: "12px",
              }} />
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "4px 20px 14px",
              borderBottom: `0.5px solid ${GLASS.borderSub}`,
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  position: "relative",
                  width: "44px", height: "44px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 ${Math.round(dealTemperature * 20)}px ${stageColor}${Math.round(dealTemperature * 70).toString(16).padStart(2, "0")}`,
                  borderRadius: "50%",
                  transition: "box-shadow 1.2s ease",
                }}>
                  <AlexOrb size={44} accent={activePersona.color} soft={activePersona.color} live={isLoading} />
                  <div style={{
                    position: "absolute", bottom: "-1px", right: "-1px",
                    width: "12px", height: "12px", borderRadius: "50%",
                    background: stageColor,
                    border: "2px solid #0a0a0c",
                    transition: "background 0.6s",
                    boxShadow: `0 0 6px ${stageColor}80`,
                  }} />
                </div>
                <div>
                  <div style={{
                    fontFamily: ONDER_FONT,
                    fontSize: "0.95rem", fontWeight: 600, color: PANEL.ink,
                    letterSpacing: "0.06em", textTransform: "uppercase" as const,
                  }}>
                    {activePersona.name}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: isLoading ? activePersona.color : "rgba(255,255,255,0.45)",
                    display: "flex", alignItems: "center", gap: "5px",
                    letterSpacing: "-0.01em",
                  }}>
                    {isLoading ? (
                      <>
                        <span style={{
                          width: "5px", height: "5px", borderRadius: "50%",
                          background: activePersona.color, display: "inline-block",
                          animation: "ai-pulse 1.4s ease-in-out infinite",
                        }} />
                        <span style={{ fontStyle: "italic" }}>{thinkingPhrase}</span>
                      </>
                    ) : (
                      <>{activePersona.role}</>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                {messages.length > 2 && (
                  <button type="button"
                    onClick={() => { setShowInsights(s => !s); queueMicrotask(() => hapticFeedback.light()); }}
                    style={{
                      width: "34px", height: "34px", borderRadius: "17px",
                      border: `0.5px solid ${showInsights ? activePersona.color + "40" : GLASS.borderSub}`,
                      background: showInsights ? `${activePersona.color}14` : GLASS.btnBg,
                      color: showInsights ? activePersona.color : "rgba(255,255,255,0.5)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                    }}
                    aria-label="Insights"
                  >
                    <InsightsIcon />
                  </button>
                )}
                {messages.length > 0 && (
                  <button type="button"
                    onClick={() => { setShowSearch(s => !s); queueMicrotask(() => hapticFeedback.light()); }}
                    style={{
                      width: "34px", height: "34px", borderRadius: "17px",
                      border: `0.5px solid ${showSearch ? activePersona.color + "40" : GLASS.borderSub}`,
                      background: showSearch ? `${activePersona.color}14` : GLASS.btnBg,
                      color: showSearch ? activePersona.color : "rgba(255,255,255,0.5)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                    }}
                    aria-label="Search"
                  >
                    <SearchIcon />
                  </button>
                )}
                {messages.length > 0 && (
                  <button type="button"
                    onClick={() => { shareConversation(); queueMicrotask(() => hapticFeedback.light()); }}
                    style={{
                      width: "34px", height: "34px", borderRadius: "17px",
                      border: `0.5px solid ${GLASS.borderSub}`,
                      background: GLASS.btnBg,
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                    }}
                    aria-label="Share"
                  >
                    <ShareIcon />
                  </button>
                )}
                <button type="button" onClick={handleClose}
                  style={{
                    width: "34px", height: "34px", borderRadius: "17px",
                    border: `0.5px solid ${GLASS.borderSub}`,
                    background: GLASS.btnBg,
                    color: "rgba(255,255,255,0.55)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                  }}
                  aria-label="Close"
                >
                  <ChevronDownIcon size={18} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showInsights && messages.length > 2 && (
                <ConversationInsights
                  dealStage={dealStage}
                  dealTemperature={dealTemperature}
                  messageCount={messages.length}
                  language={language}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSearch && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  style={{ overflow: "hidden", flexShrink: 0 }}
                >
                  <div style={{ padding: "10px 20px", borderBottom: `0.5px solid ${GLASS.borderSub}` }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      background: "rgba(255,255,255,0.06)", borderRadius: "14px",
                      padding: "0 12px", border: "0.5px solid rgba(255,255,255,0.08)",
                    }}>
                      <SearchIcon size={13} color="rgba(255,255,255,0.3)" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={language === "ru" ? "Поиск в чате..." : "Search messages..."}
                        autoFocus
                        style={{
                          flex: 1, background: "transparent", border: "none", outline: "none",
                          color: "#fff", fontSize: "14px", padding: "10px 0",
                          fontFamily: "inherit", letterSpacing: "-0.01em",
                        }}
                      />
                      {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery("")}
                          style={{
                            background: "none", border: "none", color: "rgba(255,255,255,0.3)",
                            cursor: "pointer", fontSize: "14px", padding: "0 2px",
                          }}
                        >×</button>
                      )}
                    </div>
                    {searchQuery && (
                      <div style={{
                        fontSize: "11px", color: "rgba(255,255,255,0.3)",
                        marginTop: "6px", letterSpacing: "-0.01em",
                      }}>
                        {language === "ru"
                          ? `Найдено: ${filteredMessages.length}`
                          : `Found: ${filteredMessages.length}`
                        }
                      </div>
                    )}
                  </div>
                </m.div>
              )}
            </AnimatePresence>


            <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
              <div ref={scrollRef} onScroll={handleScroll} style={{
                height: "100%", overflowY: "auto", overflowX: "hidden",
                display: "flex", flexDirection: "column", gap: "4px",
                padding: "16px 0 8px", overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
              }}>
                {messages.length === 0 && !showOnboarding && (
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    flex: 1, gap: "20px", padding: "40px 28px", textAlign: "center",
                  }}>
                    <div style={{
                      width: "72px", height: "72px", borderRadius: "36px",
                      background: `linear-gradient(145deg, ${activePersona.color}20, ${activePersona.color}08)`,
                      border: `0.5px solid ${activePersona.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "28px", fontWeight: 600, color: activePersona.color,
                      boxShadow: `0 4px 24px ${activePersona.color}15`,
                    }}>
                      {activePersona.emoji}
                    </div>
                    <div>
                      <div style={{
                        fontSize: "20px", fontWeight: 600, color: "#fff",
                        marginBottom: "8px", letterSpacing: "-0.01em",
                      }}>
                        {language === "ru" ? (
                          <>
                            Привет! Я{" "}
                            <span style={{
                              fontFamily: ONDER_FONT, fontWeight: 700,
                              letterSpacing: "0.06em", textTransform: "uppercase",
                              color: activePersona.color,
                            }}>
                              {activePersona.name}
                            </span>
                            {" )"}
                          </>
                        ) : (
                          <>
                            Hey! I&rsquo;m{" "}
                            <span style={{
                              fontFamily: ONDER_FONT, fontWeight: 700,
                              letterSpacing: "0.06em", textTransform: "uppercase",
                              color: activePersona.color,
                            }}>
                              {activePersona.name}
                            </span>
                            {" )"}
                          </>
                        )}
                      </div>
                      <div style={{
                        fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: "1.6",
                        letterSpacing: "-0.01em", maxWidth: "280px", margin: "0 auto",
                      }}>
                        {language === "ru"
                          ? activePersona.id === "alex"
                            ? "Консультант WEB4TG Studio. Помогу подобрать решение для вашего бизнеса"
                            : `${activePersona.role} WEB4TG Studio`
                          : `${activePersona.role} at WEB4TG Studio`
                        }
                      </div>
                    </div>

                    <div style={{
                      display: "flex", flexDirection: "column", gap: "6px",
                      width: "100%", maxWidth: "300px", marginTop: "4px",
                    }}>
                      {(language === "ru"
                        ? [
                            "Расскажите, чем занимается ваш бизнес",
                            "Сколько стоит Mini App для ресторана?",
                            "Покажите примеры готовых проектов",
                            "Как быстро можно запуститься?",
                          ]
                        : [
                            "Tell me about your business",
                            "How much does a restaurant Mini App cost?",
                            "Show me examples of finished projects",
                            "How fast can we launch?",
                          ]
                      ).map((q, i) => (
                        <button key={i} type="button" onClick={() => handleSend(q)}
                          style={{
                            padding: "12px 16px", borderRadius: "16px",
                            border: `0.5px solid ${GLASS.borderSub}`,
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.65)", fontSize: "13.5px",
                            textAlign: "left", cursor: "pointer",
                            transition: "all 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
                            WebkitTapHighlightColor: "transparent",
                            letterSpacing: "-0.01em",
                          }}
                        >{q}</button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.length === 0 && showOnboarding && (
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    flex: 1, gap: "16px", padding: "40px 28px", textAlign: "center",
                  }}>
                    <div style={{
                      width: "64px", height: "64px", borderRadius: "32px",
                      background: "rgba(52,211,153,0.1)",
                      border: "0.5px solid rgba(52,211,153,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "28px",
                    }}>
                      {ONBOARDING_STEPS[onboardingStep].icon}
                    </div>
                    <div style={{
                      fontSize: "15px", color: "rgba(255,255,255,0.75)", lineHeight: "1.6",
                      letterSpacing: "-0.01em", maxWidth: "280px",
                    }}>
                      {language === "ru"
                        ? ONBOARDING_STEPS[onboardingStep].ru
                        : ONBOARDING_STEPS[onboardingStep].en
                      }
                    </div>
                    <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                      {ONBOARDING_STEPS.map((_, i) => (
                        <div key={i} style={{
                          width: i === onboardingStep ? "20px" : "6px",
                          height: "6px", borderRadius: "3px",
                          background: i === onboardingStep ? "#34d399" : "rgba(255,255,255,0.12)",
                          transition: "all 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
                        }} />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button type="button" onClick={dismissOnboarding}
                        style={{
                          padding: "8px 20px", borderRadius: "20px",
                          border: `0.5px solid ${GLASS.borderSub}`,
                          background: "transparent",
                          color: "rgba(255,255,255,0.4)", fontSize: "13px",
                          cursor: "pointer", fontWeight: 500,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {language === "ru" ? "Пропустить" : "Skip"}
                      </button>
                      <button type="button" onClick={handleNextOnboarding}
                        style={{
                          padding: "8px 24px", borderRadius: "20px",
                          border: "none",
                          background: "linear-gradient(145deg, #34d399, #059669)",
                          color: "#fff", fontSize: "13px",
                          cursor: "pointer", fontWeight: 600,
                          letterSpacing: "-0.01em",
                          boxShadow: "0 2px 8px rgba(52,211,153,0.3)",
                        }}
                      >
                        {onboardingStep < ONBOARDING_STEPS.length - 1
                          ? (language === "ru" ? "Далее" : "Next")
                          : (language === "ru" ? "Начать" : "Start")
                        }
                      </button>
                    </div>
                  </div>
                )}

                {/* v7: Memory rail — visible "what I know about you" */}
                {(memory && (memory.userName || memory.businessType || memory.businessName || (memory.lastTopics && memory.lastTopics.length > 0))) && (
                  <div style={{
                    margin: "0 0 14px",
                    padding: "14px 16px 12px",
                    borderRadius: 18,
                    background: PANEL.bgRaised,
                    border: `1px solid ${PANEL.hair}`,
                    position: "relative",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                      <span style={{
                        fontFamily: ONDER_FONT, fontSize: "0.5rem", fontWeight: 700,
                        letterSpacing: "0.14em", textTransform: "uppercase" as const,
                        color: EMERALD_SOFT_V7,
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: 99, background: EMERALD_V7, display: "inline-block", boxShadow: `0 0 6px ${EMERALD_V7}` }} />
                        {language === "ru" ? "Что я знаю о вас" : "What I know about you"}
                      </span>
                      <span style={{ fontFamily: "Manrope", fontSize: "0.66rem", color: PANEL.meta }}>
                        {language === "ru" ? "Тап чтобы убрать" : "Tap to remove"}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {memory.userName && (
                        <button
                          type="button"
                          onClick={() => { hapticFeedback?.light?.(); clearMemoryField?.('userName'); }}
                          aria-label={language === "ru" ? `Удалить имя ${memory.userName}` : `Remove name ${memory.userName}`}
                          style={{
                            padding: "6px 11px 6px 9px", borderRadius: 999, minHeight: 30,
                            background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.28)",
                            display: "inline-flex", alignItems: "center", gap: 6,
                            fontFamily: "Manrope", fontSize: "0.78rem", fontWeight: 600, color: PANEL.ink,
                            cursor: "pointer", transition: "all 0.2s ease",
                          }}
                          data-testid="memory-chip-name"
                        >
                          <span style={{ color: EMERALD_SOFT_V7, fontWeight: 700, fontSize: "0.62rem", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{language === "ru" ? "Имя" : "Name"}</span>
                          <span>{memory.userName}</span>
                          <span style={{ color: PANEL.meta, fontSize: "0.8rem", lineHeight: 1 }}>×</span>
                        </button>
                      )}
                      {(memory.businessName || memory.businessType) && (
                        <button
                          type="button"
                          onClick={() => { hapticFeedback?.light?.(); clearMemoryField?.(memory.businessName ? 'businessName' : 'businessType'); }}
                          aria-label={language === "ru" ? "Удалить бизнес" : "Remove business"}
                          style={{
                            padding: "6px 11px 6px 9px", borderRadius: 999, minHeight: 30,
                            background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.28)",
                            display: "inline-flex", alignItems: "center", gap: 6,
                            fontFamily: "Manrope", fontSize: "0.78rem", fontWeight: 600, color: PANEL.ink,
                            cursor: "pointer", transition: "all 0.2s ease",
                          }}
                          data-testid="memory-chip-business"
                        >
                          <span style={{ color: "#93c5fd", fontWeight: 700, fontSize: "0.62rem", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{language === "ru" ? "Бизнес" : "Business"}</span>
                          <span>{memory.businessName || memory.businessType}</span>
                          <span style={{ color: PANEL.meta, fontSize: "0.8rem", lineHeight: 1 }}>×</span>
                        </button>
                      )}
                      {(memory.lastTopics || []).slice(-3).map((topic, i) => (
                        <button
                          type="button"
                          key={`topic-${i}-${topic}`}
                          onClick={() => { hapticFeedback?.light?.(); updateMemory?.({ lastTopics: (memory.lastTopics || []).filter((t) => t !== topic) }); }}
                          aria-label={language === "ru" ? `Удалить тему ${topic}` : `Remove topic ${topic}`}
                          style={{
                            padding: "6px 11px 6px 9px", borderRadius: 999, minHeight: 30,
                            background: "rgba(255,255,255,0.04)", border: `1px solid ${PANEL.hair}`,
                            display: "inline-flex", alignItems: "center", gap: 6,
                            fontFamily: "Manrope", fontSize: "0.78rem", fontWeight: 500, color: PANEL.body,
                            cursor: "pointer", transition: "all 0.2s ease",
                          }}
                          data-testid={`memory-chip-topic-${i}`}
                        >
                          <span>{topic}</span>
                          <span style={{ color: PANEL.meta, fontSize: "0.8rem", lineHeight: 1 }}>×</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {displayMessages.map((msg) => {
                  const dateLabel = getDateLabel(msg.timestamp, language);
                  const showDate = dateLabel !== lastDateLabel;
                  if (showDate) lastDateLabel = dateLabel;

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div style={{
                          display: "flex", justifyContent: "center",
                          padding: "12px 0 6px",
                        }}>
                          <span style={{
                            fontSize: "11px", fontWeight: 500,
                            color: "rgba(255,255,255,0.25)",
                            background: "rgba(255,255,255,0.04)",
                            padding: "4px 12px", borderRadius: "10px",
                            letterSpacing: "-0.01em",
                          }}>
                            {dateLabel}
                          </span>
                        </div>
                      )}
                      <m.div
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                      >
                        <AIAgentMessage
                          message={msg}
                          onSpeak={msg.role === "assistant" ? handleSpeak : undefined}
                          onButtonClick={handleButtonClick}
                          onReply={handleReply}
                          onRetry={retryMessage}
                          onFeedback={handleFeedback}
                          onOpenDemo={handleOpenDemo}
                          isSpeaking={isSpeaking}
                          thinkingSeconds={thinkingSeconds}
                          thinkingPhrase={thinkingPhrase}
                        />
                      </m.div>
                    </div>
                  );
                })}

                {showSuggested && (
                  <m.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
                    style={{
                      display: "flex", gap: "6px", flexWrap: "wrap",
                      padding: "8px 16px 4px",
                    }}
                  >
                    {dynamicSuggestions.map((s, i) => (
                      <m.button key={s} type="button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 + i * 0.06 }}
                        onClick={() => handleSend(s)}
                        style={{
                          padding: "8px 14px", borderRadius: "20px",
                          border: `0.5px solid ${activePersona.color}25`,
                          background: `${activePersona.color}0a`,
                          color: `${activePersona.color}cc`,
                          fontSize: "12px", fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
                          WebkitTapHighlightColor: "transparent",
                          letterSpacing: "-0.01em",
                          display: "flex", alignItems: "center", gap: "5px",
                        }}
                      >
                        <span style={{ fontSize: "10px", opacity: 0.7 }}>✨</span>
                        {s}
                      </m.button>
                    ))}
                    {showComparisonChip && (
                      <m.button type="button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: 0.35 }}
                        onClick={() => handleSend(
                          language === "ru"
                            ? `Сравни демо, которые я посмотрел: ${visitedDemos.slice(-3).map(d => demoNames[d] || d.split("/")[2]).join(", ")}. Какое лучше подходит для моего бизнеса?`
                            : `Compare the demos I viewed: ${visitedDemos.slice(-3).map(d => demoNames[d] || d.split("/")[2]).join(", ")}. Which suits my business best?`
                        )}
                        style={{
                          padding: "8px 14px", borderRadius: "20px",
                          border: "0.5px solid rgba(249,115,22,0.3)",
                          background: "rgba(249,115,22,0.08)",
                          color: "#f97316",
                          fontSize: "12px", fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
                          WebkitTapHighlightColor: "transparent",
                          letterSpacing: "-0.01em",
                          display: "flex", alignItems: "center", gap: "5px",
                        }}
                      >
                        <span style={{ fontSize: "12px" }}>⚖️</span>
                        {comparisonLabel}
                      </m.button>
                    )}
                  </m.div>
                )}
              </div>

              <AnimatePresence>
                {!isAtBottom && (
                  <m.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                    onClick={scrollToBottom}
                    style={{
                      position: "absolute", bottom: "12px", right: "16px",
                      width: "36px", height: "36px", borderRadius: "18px",
                      background: "rgba(28,28,30,0.9)",
                      backdropFilter: "saturate(180%) blur(20px)",
                      WebkitBackdropFilter: "saturate(180%) blur(20px)",
                      border: `0.5px solid ${GLASS.border}`,
                      color: "#fff", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                      zIndex: 5,
                    }}
                    aria-label="Scroll to bottom"
                  >
                    <ArrowDownIcon />
                  </m.button>
                )}
              </AnimatePresence>
            </div>

            <AIAgentInput
              onSend={handleSend}
              isLoading={isLoading}
              onStop={stopGeneration}
              voiceMode={voiceMode}
              onToggleVoiceMode={toggleVoiceMode}
              speechLang={speechLang}
              placeholder={
                language === "ru"
                  ? `Напишите ${activePersona.name === "Алекс" ? "Алексу" : activePersona.name}...`
                  : `Message ${activePersona.name}...`
              }
            />
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
});
