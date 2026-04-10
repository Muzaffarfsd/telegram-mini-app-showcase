import { memo, useState, useCallback, useMemo } from "react";
import type { AIMessage, WidgetData } from "@/hooks/useAIAgent";

interface AIAgentMessageProps {
  message: AIMessage;
  onSpeak?: (text: string) => void;
  onButtonClick?: (text: string) => void;
  isSpeaking?: boolean;
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
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.25);padding:10px 12px;border-radius:12px;overflow-x:auto;border:0.5px solid rgba(255,255,255,0.06);margin:6px 0"><code class="language-$1" style="font-size:12px;line-height:1.5">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:5px;font-size:0.85em;border:0.5px solid rgba(255,255,255,0.06)">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.*$)/gm, '<h4 style="font-size:0.92em;font-weight:600;margin:10px 0 4px;letter-spacing:-0.01em">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 style="font-size:1em;font-weight:600;margin:12px 0 5px;letter-spacing:-0.01em">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 style="font-size:1.08em;font-weight:600;margin:14px 0 6px;letter-spacing:-0.02em">$1</h2>')
    .replace(/^- (.*$)/gm, '<div style="display:flex;gap:8px;margin:3px 0;line-height:1.5"><span style="color:rgba(255,255,255,0.25);font-size:0.7em;margin-top:2px">●</span><span>$1</span></div>')
    .replace(/^\d+\. (.*$)/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:rgba(255,255,255,0.35);font-weight:600;min-width:18px;font-size:0.85em">$&</span></div>')
    .replace(/\n\n/g, '<div style="height:8px"></div>')
    .replace(/\n/g, "<br>");
}

const PERSONA_COLORS: Record<string, string> = {
  alex: "#34d399",
  designer: "#a78bfa",
  developer: "#60a5fa",
  strategist: "#f59e0b",
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

const HeartIcon = ({ size = 11, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

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

export const AIAgentMessage = memo(
  ({ message, onSpeak, onButtonClick, isSpeaking }: AIAgentMessageProps) => {
    const [copied, setCopied] = useState(false);
    const [liked, setLiked] = useState(false);
    const isUser = message.role === "user";
    const personaColor = PERSONA_COLORS[message.persona || "alex"] || "#34d399";

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [message.content]);

    const renderedContent = useMemo(() => {
      if (!message.content) return "";
      return renderMarkdown(message.content);
    }, [message.content]);

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
              {message.personaName?.[0]}
            </span>
            {message.personaName}
          </div>
        )}

        <div style={{
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
        }}>
          {isUser ? (
            <span>{message.content}</span>
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
            <button type="button" onClick={() => setLiked(l => !l)}
              style={{
                background: "none", border: "none", padding: "4px 6px",
                cursor: "pointer", color: liked ? "#ff2d55" : "rgba(255,255,255,0.18)",
                borderRadius: "8px", display: "flex", alignItems: "center",
                transition: "color 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
              }}
              aria-label="Like"
            >
              <HeartIcon filled={liked} />
            </button>
          </div>
        )}
      </div>
    );
  }
);
