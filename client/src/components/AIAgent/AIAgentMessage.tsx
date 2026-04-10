import { memo, useState, useCallback, useMemo } from "react";
import { Volume2, VolumeX, Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
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
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-size:0.85em">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.*$)/gm, '<h4 style="font-size:0.95em;font-weight:700;margin:12px 0 4px">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 style="font-size:1.05em;font-weight:700;margin:14px 0 6px">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 style="font-size:1.1em;font-weight:700;margin:16px 0 8px">$1</h2>')
    .replace(/^- (.*$)/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:rgba(255,255,255,0.3)">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.*$)/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:rgba(255,255,255,0.4);font-weight:600;min-width:18px">$&</span></div>')
    .replace(/\n\n/g, '<div style="height:10px"></div>')
    .replace(/\n/g, "<br>");
}

const PERSONA_COLORS: Record<string, string> = {
  alex: "#34d399",
  designer: "#a78bfa",
  developer: "#60a5fa",
  strategist: "#f59e0b",
};

function ROICalculatorWidget({ data }: { data: WidgetData }) {
  const [clients, setClients] = useState(100);
  const [avgCheck, setAvgCheck] = useState(1500);
  const monthlyLoss = data.monthlyLoss || (clients * avgCheck * 0.2);
  const cost = data.templateCost || 150000;
  const paybackDays = Math.ceil(cost / (monthlyLoss / 30));
  const yearSavings = monthlyLoss * 12;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(5,150,105,0.04))",
      border: "1px solid rgba(52,211,153,0.2)",
      borderRadius: "16px",
      padding: "16px",
      marginTop: "10px",
    }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#34d399", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "16px" }}>📊</span> ROI-калькулятор
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
          Клиентов в месяц
          <input
            type="range" min="10" max="500" value={clients}
            onChange={e => setClients(Number(e.target.value))}
            style={{ width: "100%", marginTop: "4px", accentColor: "#34d399" }}
          />
          <span style={{ color: "#fff", fontWeight: 600 }}>{clients}</span>
        </label>
        <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
          Средний чек (₽)
          <input
            type="range" min="300" max="10000" step="100" value={avgCheck}
            onChange={e => setAvgCheck(Number(e.target.value))}
            style={{ width: "100%", marginTop: "4px", accentColor: "#34d399" }}
          />
          <span style={{ color: "#fff", fontWeight: 600 }}>{avgCheck.toLocaleString()} ₽</span>
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Потери/мес</div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#ef4444" }}>{Math.round(monthlyLoss).toLocaleString()} ₽</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Окупаемость</div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#34d399" }}>{paybackDays} дн.</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "10px", textAlign: "center", gridColumn: "1 / -1" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Экономия за год</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#34d399" }}>{Math.round(yearSavings).toLocaleString()} ₽</div>
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
      padding: "2px", scrollSnapType: "x mandatory",
    }}>
      {packages.map((pkg: any, i: number) => (
        <div key={i} style={{
          minWidth: "140px", flex: "1",
          background: pkg.recommended
            ? "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(5,150,105,0.08))"
            : "rgba(255,255,255,0.04)",
          border: pkg.recommended ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px", padding: "14px", scrollSnapAlign: "start",
          position: "relative",
        }}>
          {pkg.recommended && (
            <div style={{
              position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
              background: "#34d399", color: "#000", fontSize: "9px", fontWeight: 700,
              padding: "2px 8px", borderRadius: "0 0 6px 6px", letterSpacing: "0.05em",
            }}>ТОП</div>
          )}
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{pkg.name}</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: pkg.recommended ? "#34d399" : "rgba(255,255,255,0.7)", marginBottom: "10px" }}>{pkg.price}</div>
          {(pkg.features || []).map((f: string, fi: number) => (
            <div key={fi} style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "flex", gap: "4px", marginBottom: "3px" }}>
              <span style={{ color: "#34d399" }}>✓</span> {f}
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
      background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      border: "1px solid rgba(52,211,153,0.25)",
      borderRadius: "16px", padding: "18px", marginTop: "10px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: "80px", height: "80px",
        background: "radial-gradient(circle, rgba(52,211,153,0.15), transparent)",
        borderRadius: "0 0 0 80px",
      }} />
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", fontWeight: 600, marginBottom: "4px" }}>
        ПЕРСОНАЛЬНОЕ ПРЕДЛОЖЕНИЕ
      </div>
      <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "2px" }}>
        {data.clientName || "Ваш проект"}
      </div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "14px" }}>
        {data.niche} · {data.template}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
        {[
          { label: "Стоимость", value: data.price, color: "#fff" },
          { label: "Срок", value: data.timeline, color: "#60a5fa" },
          { label: "ROI", value: data.roi, color: "#34d399" },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{item.label}</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>
      {data.features && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {data.features.map((f: string, i: number) => (
            <span key={i} style={{
              fontSize: "10px", background: "rgba(52,211,153,0.12)", color: "#34d399",
              padding: "3px 8px", borderRadius: "8px", fontWeight: 500,
            }}>{f}</span>
          ))}
        </div>
      )}
      <div style={{
        marginTop: "12px", textAlign: "center", fontSize: "10px",
        color: "rgba(255,255,255,0.3)", fontStyle: "italic",
      }}>
        Предоплата 35% · 14 дней правок · Договор
      </div>
    </div>
  );
}

function DealProgressWidget({ data }: { data: WidgetData }) {
  const stages = data.stages || ["awareness", "interest", "consideration", "decision", "action"];
  const stageLabels: Record<string, string> = {
    awareness: "Знакомство",
    interest: "Интерес",
    consideration: "Выбор",
    decision: "Решение",
    action: "Сделка",
  };
  const currentIdx = stages.indexOf(data.stage || "awareness");

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px", padding: "12px", marginTop: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "2px", marginBottom: "6px" }}>
        {stages.map((s: string, i: number) => (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              height: "3px", width: "100%", borderRadius: "2px",
              background: i <= currentIdx
                ? `linear-gradient(90deg, ${i === currentIdx ? "#34d399" : "#059669"}, ${i === currentIdx ? "#34d399" : "#059669"})`
                : "rgba(255,255,255,0.08)",
              transition: "background 0.5s",
            }} />
            <div style={{
              fontSize: "9px", fontWeight: i === currentIdx ? 700 : 400,
              color: i <= currentIdx ? "#34d399" : "rgba(255,255,255,0.25)",
              textAlign: "center", lineHeight: "1.2",
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
    const [reaction, setReaction] = useState<"up" | "down" | null>(null);
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: "4px",
          padding: "0 16px",
        }}
      >
        {!isUser && message.personaName && message.persona !== "alex" && (
          <div style={{
            fontSize: "11px", fontWeight: 600, color: personaColor,
            paddingLeft: "4px", display: "flex", alignItems: "center", gap: "4px",
          }}>
            <span style={{
              width: "16px", height: "16px", borderRadius: "50%",
              background: personaColor, display: "inline-flex", alignItems: "center",
              justifyContent: "center", fontSize: "9px", fontWeight: 800, color: "#000",
            }}>
              {message.personaName?.[0]}
            </span>
            {message.personaName}
          </div>
        )}

        <div
          style={{
            maxWidth: "88%",
            padding: isUser ? "10px 14px" : "12px 14px",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isUser
              ? "linear-gradient(135deg, #34d399, #059669)"
              : "rgba(255,255,255,0.06)",
            border: isUser ? "none" : `1px solid ${message.persona && message.persona !== "alex" ? personaColor + "20" : "rgba(255,255,255,0.06)"}`,
            color: isUser ? "#fff" : "rgba(255,255,255,0.88)",
            fontSize: "14px",
            lineHeight: "1.55",
            wordBreak: "break-word",
          }}
        >
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
            <div style={{ display: "flex", gap: "4px", padding: "4px 0" }}>
              <div className="ai-typing-dot" style={{ animationDelay: "0ms" }} />
              <div className="ai-typing-dot" style={{ animationDelay: "150ms" }} />
              <div className="ai-typing-dot" style={{ animationDelay: "300ms" }} />
            </div>
          ) : null}
        </div>

        {!isUser && message.buttons && message.buttons.length > 0 && !message.isStreaming && (
          <div
            style={{
              display: "flex", gap: "6px", flexWrap: "wrap",
              paddingLeft: "4px", marginTop: "4px", maxWidth: "88%",
            }}
          >
            {message.buttons.map((btn, i) => (
              <button
                key={i} type="button"
                onClick={() => onButtonClick?.(btn)}
                style={{
                  padding: "6px 14px", borderRadius: "20px",
                  border: `1px solid ${personaColor}40`,
                  background: `${personaColor}12`,
                  color: personaColor, fontSize: "12.5px", fontWeight: 500,
                  cursor: "pointer", transition: "all 0.15s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        )}

        {!isUser && message.content && !message.isStreaming && (
          <div style={{ display: "flex", gap: "2px", paddingLeft: "4px" }}>
            <button type="button" onClick={handleCopy}
              style={{
                background: "none", border: "none", padding: "4px 6px",
                cursor: "pointer", color: "rgba(255,255,255,0.3)",
                borderRadius: "6px", display: "flex", alignItems: "center", transition: "color 0.15s",
              }}
              aria-label="Copy"
            >
              {copied ? <Check className="w-3.5 h-3.5" style={{ color: "#34d399" }} /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {onSpeak && (
              <button type="button" onClick={() => onSpeak(message.content)}
                style={{
                  background: "none", border: "none", padding: "4px 6px",
                  cursor: "pointer", color: isSpeaking ? "#34d399" : "rgba(255,255,255,0.3)",
                  borderRadius: "6px", display: "flex", alignItems: "center", transition: "color 0.15s",
                }}
                aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
            <button type="button" onClick={() => setReaction(r => r === "up" ? null : "up")}
              style={{
                background: "none", border: "none", padding: "4px 6px",
                cursor: "pointer", color: reaction === "up" ? "#34d399" : "rgba(255,255,255,0.2)",
                borderRadius: "6px", display: "flex", alignItems: "center", transition: "color 0.15s",
              }}
              aria-label="Like"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button type="button" onClick={() => setReaction(r => r === "down" ? null : "down")}
              style={{
                background: "none", border: "none", padding: "4px 6px",
                cursor: "pointer", color: reaction === "down" ? "#ef4444" : "rgba(255,255,255,0.2)",
                borderRadius: "6px", display: "flex", alignItems: "center", transition: "color 0.15s",
              }}
              aria-label="Dislike"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }
);
