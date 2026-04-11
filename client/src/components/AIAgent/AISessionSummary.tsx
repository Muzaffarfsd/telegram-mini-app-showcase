import { memo, useMemo, useEffect } from "react";
import { AnimatePresence, m } from "@/utils/LazyMotionProvider";
import { getSessionSummary } from "@/hooks/useAIInteractions";

interface AISessionSummaryProps {
  isVisible: boolean;
  onDismiss: () => void;
  onOpenChat: () => void;
  language: string;
}

const PAGE_LABELS: Record<string, { ru: string; en: string }> = {
  "/": { ru: "Главная", en: "Home" },
  "/projects": { ru: "Проекты", en: "Projects" },
  "/constructor": { ru: "Конструктор", en: "Constructor" },
  "/analytics": { ru: "Аналитика", en: "Analytics" },
};

function formatPageName(path: string, lang: string): string {
  const label = PAGE_LABELS[path];
  if (label) return lang === "ru" ? label.ru : label.en;
  const demoMatch = path.match(/\/demos\/([^/]+)/);
  if (demoMatch) return `Demo: ${demoMatch[1]}`;
  return path;
}

function formatTime(seconds: number, lang: string): string {
  if (seconds < 60) return lang === "ru" ? `${seconds} сек` : `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (lang === "ru") return sec > 0 ? `${min} мин ${sec} сек` : `${min} мин`;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

export const AISessionSummary = memo(({ isVisible, onDismiss, onOpenChat, language }: AISessionSummaryProps) => {
  const summary = useMemo(() => getSessionSummary(language), [language, isVisible]);
  const uniquePages = useMemo(() => [...new Set(summary.pagesVisited)].slice(0, 6), [summary.pagesVisited]);

  useEffect(() => {
    if (!isVisible) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isVisible, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.92 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          role="dialog"
          aria-modal="true"
          aria-label={language === "ru" ? "Итоги сессии" : "Session Summary"}
          style={{
            position: "fixed",
            bottom: "160px", left: "16px", right: "16px",
            background: "rgba(10,14,18,0.96)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            borderRadius: "24px",
            border: "0.5px solid rgba(255,255,255,0.1)",
            padding: "24px",
            zIndex: 10005,
            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(52,211,153,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
            maxWidth: "380px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <button
            type="button"
            onClick={onDismiss}
            aria-label={language === "ru" ? "Закрыть" : "Close"}
            style={{
              position: "absolute", top: "12px", right: "14px",
              background: "rgba(255,255,255,0.06)", border: "none",
              color: "rgba(255,255,255,0.35)", fontSize: "14px",
              width: "26px", height: "26px", borderRadius: "13px",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center",
            }}
          >×</button>

          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "18px",
          }}>
            <span style={{
              width: "36px", height: "36px", borderRadius: "12px",
              background: "linear-gradient(145deg, rgba(52,211,153,0.2), rgba(52,211,153,0.05))",
              border: "0.5px solid rgba(52,211,153,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>📊</span>
            <div>
              <div style={{
                fontSize: "15px", fontWeight: 600, color: "#fff",
                letterSpacing: "-0.02em",
              }}>
                {language === "ru" ? "Итоги сессии" : "Session Summary"}
              </div>
              <div style={{
                fontSize: "11px", color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.01em",
              }}>
                {language === "ru" ? "Ваша активность" : "Your activity"}
              </div>
            </div>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px", marginBottom: "16px",
          }}>
            {[
              {
                value: uniquePages.length.toString(),
                label: language === "ru" ? "Страниц" : "Pages",
                icon: "📄",
              },
              {
                value: summary.demosViewed.toString(),
                label: language === "ru" ? "Демо" : "Demos",
                icon: "🎮",
              },
              {
                value: formatTime(summary.totalTime, language),
                label: language === "ru" ? "Время" : "Time",
                icon: "⏱",
              },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "14px",
                border: "0.5px solid rgba(255,255,255,0.06)",
                padding: "12px 10px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "14px", marginBottom: "4px" }}>{stat.icon}</div>
                <div style={{
                  fontSize: "16px", fontWeight: 700, color: "#34d399",
                  letterSpacing: "-0.02em",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: "10px", color: "rgba(255,255,255,0.35)",
                  marginTop: "2px", letterSpacing: "0.02em",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {uniquePages.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{
                fontSize: "10px", fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.05em", textTransform: "uppercase",
                marginBottom: "8px",
              }}>
                {language === "ru" ? "Посещённые страницы" : "Visited pages"}
              </div>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: "4px",
              }}>
                {uniquePages.map((page, i) => (
                  <span key={i} style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: "rgba(52,211,153,0.08)",
                    border: "0.5px solid rgba(52,211,153,0.15)",
                    color: "rgba(52,211,153,0.8)",
                    fontSize: "11px", fontWeight: 500,
                    letterSpacing: "-0.01em",
                  }}>
                    {formatPageName(page, language)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{
            background: "rgba(52,211,153,0.06)",
            border: "0.5px solid rgba(52,211,153,0.12)",
            borderRadius: "14px",
            padding: "12px 14px",
            marginBottom: "16px",
          }}>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "8px",
            }}>
              <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>🧑‍💼</span>
              <div style={{
                fontSize: "13px", color: "rgba(255,255,255,0.7)",
                lineHeight: "1.5", letterSpacing: "-0.01em",
              }}>
                {summary.recommendation}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenChat}
            style={{
              width: "100%", padding: "13px",
              borderRadius: "14px",
              background: "linear-gradient(145deg, #34d399, #2ab883)",
              border: "none", color: "#000",
              fontSize: "14px", fontWeight: 600,
              cursor: "pointer", letterSpacing: "-0.01em",
              boxShadow: "0 4px 20px rgba(52,211,153,0.3)",
            }}
          >
            {language === "ru" ? "💬 Обсудить с Алексом" : "💬 Discuss with Alex"}
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
});
