import { useRef, useEffect, memo, useState } from "react";
import { X, Trash2, Users } from "lucide-react";
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

const GLASS = {
  bg: "rgba(28, 28, 30, 0.72)",
  border: "rgba(255,255,255,0.18)",
  borderSub: "rgba(255,255,255,0.08)",
  highlight: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)",
  blur: "saturate(180%) blur(40px)",
  btnBg: "rgba(255,255,255,0.08)",
  btnBgActive: "rgba(255,255,255,0.14)",
};

export const AIAgentPanel = memo(({ isOpen, onClose, pageContext }: AIAgentPanelProps) => {
  const {
    messages, isLoading, isSpeaking, voiceMode,
    activePersona, personas, dealStage, dealTemperature,
    sendMessage, speakText, stopGeneration, clearHistory,
    switchPersona, toggleVoiceMode,
  } = useAIAgent(pageContext);
  const { language } = useLanguage();
  const { hapticFeedback } = useTelegram();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPersonas, setShowPersonas] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    }
  }, [messages]);

  const handleSend = (content: string, imageBase64?: string, imageMimeType?: string) => {
    queueMicrotask(() => hapticFeedback.light());
    sendMessage(content, imageBase64, imageMimeType);
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

  const handlePersonaSelect = (p: Persona) => {
    switchPersona(p.id);
    setShowPersonas(false);
    queueMicrotask(() => hapticFeedback.light());
  };

  const stageColor = STAGE_COLORS[dealStage] || "#60a5fa";

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
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 340, mass: 0.75 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              height: "88dvh", zIndex: 9999,
              display: "flex", flexDirection: "column",
              background: GLASS.bg,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
              borderRadius: "24px 24px 0 0",
              border: `0.5px solid ${GLASS.border}`,
              borderBottom: "none",
              overflow: "hidden",
              boxShadow: "0 -8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
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
                  width: "40px", height: "40px", borderRadius: "20px",
                  background: `linear-gradient(145deg, ${activePersona.color}dd, ${activePersona.color}66)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: 600, color: "#fff",
                  letterSpacing: "-0.02em", position: "relative",
                  boxShadow: `0 2px 12px ${activePersona.color}40, 0 0 ${Math.round(dealTemperature * 24)}px ${stageColor}${Math.round(dealTemperature * 50).toString(16).padStart(2, "0")}`,
                  transition: "box-shadow 1.2s ease",
                  border: "0.5px solid rgba(255,255,255,0.25)",
                }}>
                  {activePersona.emoji}
                  <div style={{
                    position: "absolute", bottom: "0px", right: "0px",
                    width: "11px", height: "11px", borderRadius: "50%",
                    background: stageColor,
                    border: "2px solid rgba(28,28,30,0.8)",
                    transition: "background 0.6s",
                    boxShadow: `0 0 6px ${stageColor}80`,
                  }} />
                </div>
                <div>
                  <div style={{
                    fontSize: "17px", fontWeight: 600, color: "#fff",
                    letterSpacing: "-0.02em",
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
                        {language === "ru" ? "печатает..." : "typing..."}
                      </>
                    ) : (
                      <>{activePersona.role}</>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button type="button"
                  onClick={() => setShowPersonas(!showPersonas)}
                  style={{
                    width: "34px", height: "34px", borderRadius: "17px",
                    border: `0.5px solid ${showPersonas ? activePersona.color + "50" : GLASS.borderSub}`,
                    background: showPersonas ? `${activePersona.color}18` : GLASS.btnBg,
                    color: showPersonas ? activePersona.color : "rgba(255,255,255,0.5)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  aria-label="Switch persona"
                >
                  <Users className="w-[15px] h-[15px]" />
                </button>
                {messages.length > 0 && (
                  <button type="button" onClick={handleClear}
                    style={{
                      width: "34px", height: "34px", borderRadius: "17px",
                      border: `0.5px solid ${GLASS.borderSub}`,
                      background: GLASS.btnBg,
                      color: "rgba(255,255,255,0.5)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    aria-label="Clear chat"
                  >
                    <Trash2 className="w-[15px] h-[15px]" />
                  </button>
                )}
                <button type="button" onClick={handleClose}
                  style={{
                    width: "34px", height: "34px", borderRadius: "17px",
                    border: `0.5px solid ${GLASS.borderSub}`,
                    background: GLASS.btnBg,
                    color: "rgba(255,255,255,0.55)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  aria-label="Close"
                >
                  <X className="w-[16px] h-[16px]" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showPersonas && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                  style={{ overflow: "hidden", flexShrink: 0 }}
                >
                  <div style={{
                    display: "flex", gap: "8px", padding: "12px 20px",
                    borderBottom: `0.5px solid ${GLASS.borderSub}`,
                    overflowX: "auto", scrollbarWidth: "none",
                  }}>
                    {personas.map(p => (
                      <button key={p.id} type="button"
                        onClick={() => handlePersonaSelect(p)}
                        style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "8px 14px", borderRadius: "18px",
                          border: `0.5px solid ${p.id === activePersona.id ? p.color + "50" : GLASS.borderSub}`,
                          background: p.id === activePersona.id
                            ? `${p.color}14`
                            : "rgba(255,255,255,0.05)",
                          cursor: "pointer", flexShrink: 0,
                          transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                        }}
                      >
                        <span style={{
                          width: "24px", height: "24px", borderRadius: "12px",
                          background: `linear-gradient(145deg, ${p.color}cc, ${p.color}66)`,
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: "11px", fontWeight: 600, color: "#fff",
                          border: "0.5px solid rgba(255,255,255,0.2)",
                        }}>{p.emoji}</span>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{p.name}</div>
                          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em" }}>{p.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            <div ref={scrollRef} style={{
              flex: 1, overflowY: "auto", overflowX: "hidden",
              display: "flex", flexDirection: "column", gap: "8px",
              padding: "16px 0 8px", overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
            }}>
              {messages.length === 0 && (
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
                      marginBottom: "8px", letterSpacing: "-0.03em",
                    }}>
                      {language === "ru" ? `Привет! Я ${activePersona.name} )` : `Hey! I'm ${activePersona.name} )`}
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
              voiceMode={voiceMode}
              onToggleVoiceMode={toggleVoiceMode}
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
