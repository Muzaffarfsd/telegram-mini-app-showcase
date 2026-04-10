import { useRef, useEffect, memo } from "react";
import { X, Trash2, MessageCircle } from "lucide-react";
import { AnimatePresence, m } from "@/utils/LazyMotionProvider";
import { useAIAgent } from "@/hooks/useAIAgent";
import { AIAgentMessage } from "./AIAgentMessage";
import { AIAgentInput } from "./AIAgentInput";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTelegram } from "@/hooks/useTelegram";

interface AIAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAgentPanel = memo(({ isOpen, onClose }: AIAgentPanelProps) => {
  const {
    messages,
    isLoading,
    isSpeaking,
    sendMessage,
    speakText,
    stopGeneration,
    clearHistory,
  } = useAIAgent();
  const { language } = useLanguage();
  const { hapticFeedback } = useTelegram();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages]);

  const handleSend = (content: string) => {
    queueMicrotask(() => hapticFeedback.light());
    sendMessage(content);
  };

  const handleClose = () => {
    queueMicrotask(() => hapticFeedback.light());
    onClose();
  };

  const handleClear = () => {
    queueMicrotask(() => hapticFeedback.medium());
    clearHistory();
  };

  const handleSpeak = (text: string) => {
    queueMicrotask(() => hapticFeedback.light());
    speakText(text);
  };

  const handleButtonClick = (text: string) => {
    queueMicrotask(() => hapticFeedback.light());
    sendMessage(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 9998,
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          <m.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              height: "85dvh",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              background: "rgba(14,14,16,0.98)",
              borderRadius: "20px 20px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 16px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #34d399, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "-0.02em",
                  }}
                >
                  A
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {language === "ru" ? "Алекс" : "Alex"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: isLoading
                        ? "#34d399"
                        : "rgba(255,255,255,0.4)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#34d399",
                            display: "inline-block",
                            animation: "ai-pulse 1.5s ease-in-out infinite",
                          }}
                        />
                        {language === "ru" ? "печатает..." : "typing..."}
                      </>
                    ) : (
                      <>{language === "ru" ? "консультант WEB4TG" : "WEB4TG consultant"}</>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px" }}>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Close"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px 0",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    gap: "16px",
                    padding: "40px 32px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(5,150,105,0.08))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: 700,
                      color: "#34d399",
                    }}
                  >
                    A
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: "6px",
                      }}
                    >
                      {language === "ru"
                        ? "Привет! Я Алекс )"
                        : "Hey! I'm Alex )"}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.45)",
                        lineHeight: "1.5",
                      }}
                    >
                      {language === "ru"
                        ? "Консультант WEB4TG Studio. Помогу подобрать решение для вашего бизнеса и запустить Mini App за 7-15 дней"
                        : "WEB4TG Studio consultant. I'll help find the right solution for your business and launch a Mini App in 7-15 days"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      width: "100%",
                      maxWidth: "320px",
                      marginTop: "8px",
                    }}
                  >
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
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(q)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "14px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.03)",
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "13px",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <AIAgentMessage
                  key={msg.id}
                  message={msg}
                  onSpeak={msg.role === "assistant" ? handleSpeak : undefined}
                  onButtonClick={handleButtonClick}
                  isSpeaking={isSpeaking}
                />
              ))}
            </div>

            <AIAgentInput
              onSend={handleSend}
              onStop={stopGeneration}
              isLoading={isLoading}
              placeholder={
                language === "ru"
                  ? "Напишите Алексу..."
                  : "Message Alex..."
              }
            />
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
});
