import { memo } from "react";
import { Volume2, VolumeX, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import type { AIMessage } from "@/hooks/useAIAgent";

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

export const AIAgentMessage = memo(
  ({ message, onSpeak, onButtonClick, isSpeaking }: AIAgentMessageProps) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        <div
          style={{
            maxWidth: "88%",
            padding: isUser ? "10px 14px" : "12px 14px",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isUser
              ? "linear-gradient(135deg, #34d399, #059669)"
              : "rgba(255,255,255,0.06)",
            border: isUser ? "none" : "1px solid rgba(255,255,255,0.06)",
            color: isUser ? "#fff" : "rgba(255,255,255,0.88)",
            fontSize: "14px",
            lineHeight: "1.55",
            wordBreak: "break-word",
          }}
        >
          {isUser ? (
            <span>{message.content}</span>
          ) : message.content ? (
            <div
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(message.content),
              }}
            />
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
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              paddingLeft: "4px",
              marginTop: "4px",
              maxWidth: "88%",
            }}
          >
            {message.buttons.map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onButtonClick?.(btn)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "1px solid rgba(52,211,153,0.3)",
                  background: "rgba(52,211,153,0.08)",
                  color: "#34d399",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        )}

        {!isUser && message.content && !message.isStreaming && (
          <div
            style={{
              display: "flex",
              gap: "2px",
              paddingLeft: "4px",
            }}
          >
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "none",
                border: "none",
                padding: "4px 6px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.3)",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                transition: "color 0.15s",
              }}
              aria-label="Copy"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            {onSpeak && (
              <button
                type="button"
                onClick={() => onSpeak(message.content)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "4px 6px",
                  cursor: "pointer",
                  color: isSpeaking ? "#34d399" : "rgba(255,255,255,0.3)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s",
                }}
                aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);
