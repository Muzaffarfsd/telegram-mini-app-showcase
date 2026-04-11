import { memo, useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { AIMessage, WidgetData } from "@/hooks/useAIAgent";

interface AIAgentMessageProps {
  message: AIMessage;
  onSpeak?: (text: string) => void;
  onButtonClick?: (text: string) => void;
  onReply?: (text: string) => void;
  onRetry?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: "up" | "down" | null) => void;
  isSpeaking?: boolean;
  thinkingSeconds?: number;
  thinkingPhrase?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/```action[\s\S]*?```/g, "")
    .replace(/```buttons[\s\S]*?```/g, "")
    .replace(/```widget[\s\S]*?```/g, "")
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
      `<div style="position:relative;margin:6px 0"><pre style="background:rgba(0,0,0,0.25);padding:10px 12px;border-radius:12px;overflow-x:auto;border:0.5px solid rgba(255,255,255,0.06)"><code class="language-${lang}" style="font-size:12px;line-height:1.5">${code}</code></pre><button onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent);this.textContent='✓';setTimeout(()=>this.textContent='Copy',1500)" style="position:absolute;top:6px;right:6px;padding:3px 8px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:10px;cursor:pointer;font-family:inherit;letter-spacing:0.02em">Copy</button></div>`)
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:5px;font-size:0.85em;border:0.5px solid rgba(255,255,255,0.06)">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
      const safeUrl = /^https?:\/\//i.test(url) ? url : '#';
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#34d399;text-decoration:none;border-bottom:1px solid rgba(52,211,153,0.3);transition:border-color 0.2s">${text}</a>`;
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.*$)/gm, '<h4 style="font-size:0.92em;font-weight:600;margin:10px 0 4px;letter-spacing:-0.01em">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 style="font-size:1em;font-weight:600;margin:12px 0 5px;letter-spacing:-0.01em">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 style="font-size:1.08em;font-weight:600;margin:14px 0 6px;letter-spacing:-0.02em">$1</h2>')
    .replace(/^- (.*$)/gm, '<div style="display:flex;gap:8px;margin:3px 0;line-height:1.5"><span style="color:rgba(255,255,255,0.25);font-size:0.7em;margin-top:2px">●</span><span>$1</span></div>')
    .replace(/^(\d+)\. (.*$)/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:rgba(255,255,255,0.35);font-weight:600;min-width:18px;font-size:0.85em">$1.</span><span>$2</span></div>')
    .replace(/(https?:\/\/[^\s<"]+)/g, (match, _url, offset, str) => {
      const before = str.slice(Math.max(0, offset - 6), offset);
      if (before.includes('href="') || before.includes('">')) return match;
      return `<a href="${match}" target="_blank" rel="noopener noreferrer" style="color:#34d399;text-decoration:none;border-bottom:1px solid rgba(52,211,153,0.3)">${match}</a>`;
    })
    .replace(/\n\n/g, '<div style="height:8px"></div>')
    .replace(/\n/g, "<br>");
}

const PERSONA_COLORS: Record<string, string> = {
  alex: "#34d399",
  designer: "#a78bfa",
  developer: "#60a5fa",
  strategist: "#f59e0b",
};

const PERSONA_EMOJIS: Record<string, string> = {
  alex: "🧑‍💼",
  designer: "🎨",
  developer: "💻",
  strategist: "📊",
};

const GLASS_MSG = {
  assistant: "rgba(255,255,255,0.06)",
  assistantBorder: "rgba(255,255,255,0.08)",
  user: "rgba(52,211,153,0.18)",
  userBorder: "rgba(52,211,153,0.25)",
};

const CopyIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const SpeakerIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const SpeakerOffIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const ThumbsUpIcon = ({ size = 12, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    <path d="M14 2l-3 7v13h8.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14" />
  </svg>
);

const ThumbsDownIcon = ({ size = 12, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 2H20a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
    <path d="M10 22l3-7V2H4.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10" />
  </svg>
);

const ReplyIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

function useTypewriter(content: string, isStreaming: boolean) {
  const [displayed, setDisplayed] = useState(content);
  const prevLenRef = useRef(0);
  const rafRef = useRef<number>(0);
  const targetRef = useRef(content);
  const currentRef = useRef(content);

  useEffect(() => {
    targetRef.current = content;

    if (!isStreaming) {
      setDisplayed(content);
      currentRef.current = content;
      prevLenRef.current = content.length;
      return;
    }

    if (content.length < currentRef.current.length) {
      currentRef.current = "";
      setDisplayed("");
    }

    const animate = () => {
      const target = targetRef.current;
      const current = currentRef.current;

      if (current.length < target.length) {
        const charsToAdd = Math.min(
          Math.max(3, Math.ceil((target.length - current.length) * 0.35)),
          target.length - current.length
        );
        const next = target.slice(0, current.length + charsToAdd);
        currentRef.current = next;
        setDisplayed(next);
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [content, isStreaming]);

  return displayed;
}

function ThinkingIndicator({ seconds, personaColor, phrase }: { seconds: number; personaColor: string; phrase?: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "6px 0",
    }}>
      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "3px",
            background: personaColor,
            animation: `ai-thinking-bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
            opacity: 0.8,
          }} />
        ))}
      </div>
      <span style={{
        fontSize: "12px", color: "rgba(255,255,255,0.45)",
        fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
        fontStyle: "italic",
      }}>
        {phrase || "Думаю над ответом..."}
        {seconds > 2 && <span style={{ color: "rgba(255,255,255,0.25)", marginLeft: "6px" }}>{seconds}s</span>}
      </span>
    </div>
  );
}

function ROICalculatorWidget({ data }: { data: WidgetData }) {
  const [clients, setClients] = useState(100);
  const [avgCheck, setAvgCheck] = useState(1500);
  const monthlyLoss = data.monthlyLoss || (clients * avgCheck * 0.2);
  const cost = data.templateCost || 150000;
  const paybackDays = Math.ceil(cost / (monthlyLoss / 30));
  const yearSavings = monthlyLoss * 12;

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "0.5px solid rgba(52,211,153,0.2)",
      borderRadius: "16px", padding: "16px", marginTop: "10px",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#34d399", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", letterSpacing: "-0.01em" }}>
        <span style={{ fontSize: "14px" }}>📊</span> ROI-калькулятор
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "-0.01em" }}>
          Клиентов в месяц
          <input type="range" min="10" max="500" value={clients}
            onChange={e => setClients(Number(e.target.value))}
            style={{ width: "100%", marginTop: "4px", accentColor: "#34d399", height: "3px" }}
          />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{clients}</span>
        </label>
        <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "-0.01em" }}>
          Средний чек (₽)
          <input type="range" min="300" max="10000" step="100" value={avgCheck}
            onChange={e => setAvgCheck(Number(e.target.value))}
            style={{ width: "100%", marginTop: "4px", accentColor: "#34d399", height: "3px" }}
          />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{avgCheck.toLocaleString()} ₽</span>
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "12px" }}>
        {[
          { label: "Потери/мес", value: `${Math.round(monthlyLoss).toLocaleString()} ₽`, color: "#ef4444" },
          { label: "Окупаемость", value: `${paybackDays} дн.`, color: "#34d399" },
        ].map((item, i) => (
          <div key={i} style={{
            background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "10px",
            textAlign: "center", border: "0.5px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}>{item.label}</div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</div>
          </div>
        ))}
        <div style={{
          background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "10px",
          textAlign: "center", gridColumn: "1 / -1", border: "0.5px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}>Экономия за год</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#34d399", letterSpacing: "-0.02em" }}>{Math.round(yearSavings).toLocaleString()} ₽</div>
        </div>
      </div>
    </div>
  );
}

function PriceComparisonWidget({ data }: { data: WidgetData }) {
  const packages = data.packages || [];
  return (
    <div style={{
      display: "flex", gap: "6px", overflowX: "auto", marginTop: "10px",
      padding: "2px", scrollSnapType: "x mandatory", scrollbarWidth: "none",
    }}>
      {packages.map((pkg: any, i: number) => (
        <div key={i} style={{
          minWidth: "130px", flex: "1",
          background: pkg.recommended ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.03)",
          border: pkg.recommended ? "0.5px solid rgba(52,211,153,0.25)" : "0.5px solid rgba(255,255,255,0.06)",
          borderRadius: "14px", padding: "14px", scrollSnapAlign: "start",
          position: "relative",
          boxShadow: pkg.recommended ? "inset 0 1px 0 rgba(52,211,153,0.1)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
          {pkg.recommended && (
            <div style={{
              position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
              background: "linear-gradient(135deg, #34d399, #059669)", color: "#000",
              fontSize: "8px", fontWeight: 700, padding: "2px 10px",
              borderRadius: "0 0 8px 8px", letterSpacing: "0.08em",
            }}>ТОП</div>
          )}
          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#fff", marginBottom: "4px", letterSpacing: "-0.01em" }}>{pkg.name}</div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: pkg.recommended ? "#34d399" : "rgba(255,255,255,0.65)", marginBottom: "10px", letterSpacing: "-0.02em" }}>{pkg.price}</div>
          {(pkg.features || []).map((f: string, fi: number) => (
            <div key={fi} style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.45)", display: "flex", gap: "4px", marginBottom: "3px" }}>
              <span style={{ color: "#34d399", fontSize: "9px" }}>✓</span> {f}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProposalWidget({ data }: { data: WidgetData }) {
  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(15,32,39,0.9), rgba(32,58,67,0.7), rgba(44,83,100,0.5))",
      border: "0.5px solid rgba(52,211,153,0.2)",
      borderRadius: "18px", padding: "18px", marginTop: "10px",
      position: "relative", overflow: "hidden",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.3)",
    }}>
      <div style={{
        position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px",
        background: "radial-gradient(circle, rgba(52,211,153,0.1), transparent 70%)",
      }} />
      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.18em", fontWeight: 600, marginBottom: "6px" }}>
        ПЕРСОНАЛЬНОЕ ПРЕДЛОЖЕНИЕ
      </div>
      <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "2px", letterSpacing: "-0.02em" }}>
        {data.clientName || "Ваш проект"}
      </div>
      <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.4)", marginBottom: "14px" }}>
        {data.niche} · {data.template}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
        {[
          { label: "Стоимость", value: data.price, color: "#fff" },
          { label: "Срок", value: data.timeline, color: "#60a5fa" },
          { label: "ROI", value: data.roi, color: "#34d399" },
        ].map((item, i) => (
          <div key={i} style={{
            textAlign: "center", background: "rgba(0,0,0,0.15)",
            borderRadius: "10px", padding: "8px 4px",
            border: "0.5px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.03em" }}>{item.label}</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: item.color, letterSpacing: "-0.01em" }}>{item.value}</div>
          </div>
        ))}
      </div>
      {data.features && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {data.features.map((f: string, i: number) => (
            <span key={i} style={{
              fontSize: "9.5px", background: "rgba(52,211,153,0.1)", color: "#34d399",
              padding: "3px 8px", borderRadius: "8px", fontWeight: 500,
              border: "0.5px solid rgba(52,211,153,0.15)",
            }}>{f}</span>
          ))}
        </div>
      )}
      <div style={{
        marginTop: "12px", textAlign: "center", fontSize: "9.5px",
        color: "rgba(255,255,255,0.25)", fontStyle: "italic", letterSpacing: "-0.01em",
      }}>
        Предоплата 35% · 14 дней правок · Договор
      </div>
    </div>
  );
}

function DealProgressWidget({ data }: { data: WidgetData }) {
  const stages = data.stages || ["awareness", "interest", "consideration", "decision", "action"];
  const stageLabels: Record<string, string> = {
    awareness: "Знакомство", interest: "Интерес", consideration: "Выбор",
    decision: "Решение", action: "Сделка",
  };
  const currentIdx = stages.indexOf(data.stage || "awareness");

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)",
      borderRadius: "14px", padding: "12px", marginTop: "10px",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "4px" }}>
        {stages.map((s: string, i: number) => (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
            <div style={{
              height: "3px", width: "100%", borderRadius: "1.5px",
              background: i <= currentIdx
                ? `linear-gradient(90deg, #059669, #34d399)`
                : "rgba(255,255,255,0.06)",
              transition: "background 0.6s cubic-bezier(0.32, 0.72, 0, 1)",
              boxShadow: i <= currentIdx ? "0 0 6px rgba(52,211,153,0.3)" : "none",
            }} />
            <div style={{
              fontSize: "8.5px", fontWeight: i === currentIdx ? 600 : 400,
              color: i <= currentIdx ? "#34d399" : "rgba(255,255,255,0.2)",
              textAlign: "center", lineHeight: "1.2", letterSpacing: "-0.01em",
            }}>
              {stageLabels[s] || s}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetRenderer({ widget }: { widget: WidgetData }) {
  try {
    switch (widget.type) {
      case "roi_calculator": return <ROICalculatorWidget data={widget} />;
      case "price_comparison":
        if (!Array.isArray(widget.packages)) return null;
        return <PriceComparisonWidget data={widget} />;
      case "proposal": return <ProposalWidget data={widget} />;
      case "deal_progress":
        if (!Array.isArray(widget.stages)) return null;
        return <DealProgressWidget data={widget} />;
      default: return null;
    }
  } catch { return null; }
}

function LongPressMenu({ x, y, onCopy, onReply, onSpeak, onClose }: {
  x: number; y: number;
  onCopy: () => void; onReply?: () => void; onSpeak?: () => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [onClose]);

  const items = [
    { label: "Копировать", icon: <CopyIcon size={14} />, action: onCopy },
    ...(onReply ? [{ label: "Ответить", icon: <ReplyIcon size={14} />, action: onReply }] : []),
    ...(onSpeak ? [{ label: "Озвучить", icon: <SpeakerIcon size={14} />, action: onSpeak }] : []),
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: Math.min(x, window.innerWidth - 160),
        top: Math.min(y, window.innerHeight - (items.length * 44 + 16)),
        background: "rgba(38,38,40,0.95)",
        backdropFilter: "saturate(180%) blur(40px)",
        WebkitBackdropFilter: "saturate(180%) blur(40px)",
        borderRadius: "14px",
        border: "0.5px solid rgba(255,255,255,0.15)",
        padding: "6px",
        zIndex: 10010,
        minWidth: "140px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        animation: "ai-menu-in 0.18s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      {items.map((item, i) => (
        <button key={i} type="button"
          onClick={() => { item.action(); onClose(); }}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            width: "100%", padding: "10px 12px",
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.8)", fontSize: "13px",
            fontWeight: 500, cursor: "pointer", borderRadius: "8px",
            textAlign: "left", fontFamily: "inherit",
            letterSpacing: "-0.01em",
            transition: "background 0.15s",
          }}
          onPointerEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onPointerLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ color: "rgba(255,255,255,0.45)" }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

const RetryIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export const AIAgentMessage = memo(
  ({ message, onSpeak, onButtonClick, onReply, onRetry, onFeedback, isSpeaking, thinkingSeconds, thinkingPhrase }: AIAgentMessageProps) => {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<"up" | "down" | null>(message.feedback || null);
    const [feedbackToast, setFeedbackToast] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
    const isUser = message.role === "user";
    const personaColor = PERSONA_COLORS[message.persona || "alex"] || "#34d399";
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const displayedContent = useTypewriter(message.content, !!message.isStreaming);

    useEffect(() => {
      return () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      };
    }, []);

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [message.content]);

    const renderedContent = useMemo(() => {
      if (!displayedContent) return "";
      return renderMarkdown(displayedContent);
    }, [displayedContent]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      longPressTimer.current = setTimeout(() => {
        setMenuPos({ x, y });
      }, 500);
    }, []);

    const handlePointerUp = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }, []);

    const handlePointerCancel = handlePointerUp;

    const handleTap = useCallback(() => {
      if (!menuPos) setShowTime(s => !s);
    }, [menuPos]);

    const isThinking = message.isStreaming && !message.content && !isUser;
    const isError = !!message.isError;

    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: "4px", padding: "2px 16px",
      }}>
        {!isUser && message.personaName && message.persona !== "alex" && (
          <div style={{
            fontSize: "11px", fontWeight: 500, color: personaColor,
            paddingLeft: "6px", display: "flex", alignItems: "center", gap: "5px",
            letterSpacing: "-0.01em",
          }}>
            <span style={{
              width: "16px", height: "16px", borderRadius: "8px",
              background: `linear-gradient(145deg, ${personaColor}cc, ${personaColor}66)`,
              display: "inline-flex", alignItems: "center",
              justifyContent: "center", fontSize: "8px", fontWeight: 700, color: "#fff",
              border: "0.5px solid rgba(255,255,255,0.15)",
            }}>
              {PERSONA_EMOJIS[message.persona || "alex"] || message.personaName?.[0]}
            </span>
            {message.personaName}
          </div>
        )}

        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={handleTap}
          onContextMenu={e => { e.preventDefault(); setMenuPos({ x: e.clientX, y: e.clientY }); }}
          style={{
            maxWidth: "85%",
            padding: isUser ? "10px 16px" : "12px 16px",
            borderRadius: isUser ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
            background: isUser ? GLASS_MSG.user : GLASS_MSG.assistant,
            border: `0.5px solid ${isUser ? GLASS_MSG.userBorder : (message.persona && message.persona !== "alex" ? personaColor + "18" : GLASS_MSG.assistantBorder)}`,
            color: isUser ? "#fff" : "rgba(255,255,255,0.88)",
            fontSize: "14px", lineHeight: "1.6", wordBreak: "break-word",
            letterSpacing: "-0.01em",
            boxShadow: isUser
              ? "inset 0 1px 0 rgba(255,255,255,0.08)"
              : "inset 0 1px 0 rgba(255,255,255,0.04)",
            cursor: "default",
            WebkitUserSelect: "text",
            userSelect: "text",
          }}
        >
          {isUser ? (
            <>
              {message.imageUrl && (
                <img src={message.imageUrl} alt="" style={{
                  maxWidth: "200px", maxHeight: "150px", borderRadius: "12px",
                  objectFit: "cover", border: "0.5px solid rgba(255,255,255,0.1)",
                  marginBottom: "4px",
                }} />
              )}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                <span style={{ flex: 1 }}>{message.content}</span>
                <span style={{
                  flexShrink: 0, display: "inline-flex", alignItems: "center",
                  marginBottom: "1px", opacity: 0.5,
                }}>
                  {message.status === "read" ? (
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 5.5l3 3L10 2" />
                      <path d="M5.5 5.5l3 3L14.5 2" />
                    </svg>
                  ) : message.status === "delivered" ? (
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 5.5l3 3L10 2" />
                      <path d="M5.5 5.5l3 3L14.5 2" />
                    </svg>
                  ) : message.status === "sent" ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 5.5l3 3L9 2" />
                    </svg>
                  ) : null}
                </span>
              </div>
            </>
          ) : isThinking ? (
            <ThinkingIndicator seconds={thinkingSeconds || 0} personaColor={personaColor} phrase={thinkingPhrase} />
          ) : renderedContent ? (
            <>
              <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
              {message.widgets?.map((w, i) => (
                <WidgetRenderer key={i} widget={w} />
              ))}
            </>
          ) : message.isStreaming ? (
            <div style={{ display: "flex", gap: "5px", padding: "4px 0" }}>
              <div className="ai-typing-dot" style={{ animationDelay: "0ms" }} />
              <div className="ai-typing-dot" style={{ animationDelay: "150ms" }} />
              <div className="ai-typing-dot" style={{ animationDelay: "300ms" }} />
            </div>
          ) : null}
        </div>

        {showTime && (
          <div style={{
            fontSize: "10px", color: "rgba(255,255,255,0.25)",
            padding: isUser ? "0 8px 0 0" : "0 0 0 8px",
            letterSpacing: "-0.01em",
          }}>
            {message.timestamp instanceof Date
              ? message.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
              : ""}
          </div>
        )}

        {!isUser && message.buttons && message.buttons.length > 0 && !message.isStreaming && (
          <div style={{
            display: "flex", gap: "6px", flexWrap: "wrap",
            paddingLeft: "6px", marginTop: "2px", maxWidth: "85%",
          }}>
            {message.buttons.map((btn, i) => (
              <button key={i} type="button"
                onClick={() => onButtonClick?.(btn)}
                style={{
                  padding: "7px 14px", borderRadius: "20px",
                  border: `0.5px solid ${personaColor}30`,
                  background: `${personaColor}0a`,
                  color: personaColor, fontSize: "12.5px", fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
                  WebkitTapHighlightColor: "transparent",
                  letterSpacing: "-0.01em",
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        )}

        {isError && onRetry && (
          <button type="button" onClick={() => onRetry(message.id)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", marginLeft: "6px", marginTop: "2px",
              borderRadius: "16px", border: "0.5px solid rgba(255,82,82,0.25)",
              background: "rgba(255,82,82,0.08)", color: "#ff5252",
              fontSize: "12px", fontWeight: 500, cursor: "pointer",
              transition: "all 0.2s", letterSpacing: "-0.01em",
            }}
          >
            <RetryIcon size={11} /> Повторить
          </button>
        )}

        {!isUser && message.content && !message.isStreaming && (
          <div style={{ display: "flex", gap: "2px", paddingLeft: "6px" }}>
            <button type="button" onClick={handleCopy}
              style={{
                background: "none", border: "none", padding: "4px 6px",
                cursor: "pointer", color: copied ? "#34d399" : "rgba(255,255,255,0.22)",
                borderRadius: "8px", display: "flex", alignItems: "center",
                transition: "color 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
              }}
              aria-label="Copy"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
            {onSpeak && (
              <button type="button" onClick={() => onSpeak(message.content)}
                style={{
                  background: "none", border: "none", padding: "4px 6px",
                  cursor: "pointer", color: isSpeaking ? "#34d399" : "rgba(255,255,255,0.22)",
                  borderRadius: "8px", display: "flex", alignItems: "center",
                  transition: "color 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
                aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? <SpeakerOffIcon /> : <SpeakerIcon />}
              </button>
            )}
            {onReply && (
              <button type="button" onClick={() => onReply(message.content.slice(0, 100))}
                style={{
                  background: "none", border: "none", padding: "4px 6px",
                  cursor: "pointer", color: "rgba(255,255,255,0.22)",
                  borderRadius: "8px", display: "flex", alignItems: "center",
                  transition: "color 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
                aria-label="Reply"
              >
                <ReplyIcon />
              </button>
            )}
            <button type="button" onClick={() => {
                const next = feedback === "up" ? null : "up" as const;
                setFeedback(next);
                onFeedback?.(message.id, next);
                if (next) { setFeedbackToast(true); setTimeout(() => setFeedbackToast(false), 2000); }
              }}
              style={{
                background: "none", border: "none", padding: "4px 6px",
                cursor: "pointer", color: feedback === "up" ? "#34d399" : "rgba(255,255,255,0.18)",
                borderRadius: "8px", display: "flex", alignItems: "center",
                transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                transform: feedback === "up" ? "scale(1.15)" : "scale(1)",
              }}
              aria-label="Helpful"
            >
              <ThumbsUpIcon filled={feedback === "up"} />
            </button>
            <button type="button" onClick={() => {
                const next = feedback === "down" ? null : "down" as const;
                setFeedback(next);
                onFeedback?.(message.id, next);
                if (next) { setFeedbackToast(true); setTimeout(() => setFeedbackToast(false), 2000); }
              }}
              style={{
                background: "none", border: "none", padding: "4px 6px",
                cursor: "pointer", color: feedback === "down" ? "#ff5252" : "rgba(255,255,255,0.18)",
                borderRadius: "8px", display: "flex", alignItems: "center",
                transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                transform: feedback === "down" ? "scale(1.15)" : "scale(1)",
              }}
              aria-label="Not helpful"
            >
              <ThumbsDownIcon filled={feedback === "down"} />
            </button>
          </div>
        )}

        {feedbackToast && (
          <div style={{
            fontSize: "10px", color: feedback === "up" ? "#34d399" : "#ff5252",
            paddingLeft: "6px", letterSpacing: "-0.01em",
            animation: "ai-fade-in 0.3s ease",
          }}>
            {feedback === "up" ? "Спасибо за отзыв! 👍" : "Учтём, спасибо 🙏"}
          </div>
        )}

        {menuPos && (
          <LongPressMenu
            x={menuPos.x} y={menuPos.y}
            onCopy={handleCopy}
            onReply={onReply ? () => onReply(message.content.slice(0, 100)) : undefined}
            onSpeak={!isUser && onSpeak ? () => onSpeak(message.content) : undefined}
            onClose={() => setMenuPos(null)}
          />
        )}
      </div>
    );
  }
);
