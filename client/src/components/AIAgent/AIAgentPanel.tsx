import { useRef, useEffect, memo, useState } from "react";
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
  blur: "saturate(180%) blur(40px)",
  btnBg: "rgba(255,255,255,0.08)",
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

export const AIAgentPanel = memo(({ isOpen, onClose, pageContext }: AIAgentPanelProps) => {
  const {
    messages, filteredMessages, isLoading, isSpeaking, voiceMode,
    activePersona, personas, dealStage, dealTemperature,
    sendMessage, speakText, stopGeneration,
    switchPersona, toggleVoiceMode,
    showOnboarding, dismissOnboarding,
    searchQuery, setSearchQuery,
    shareConversation, speechLang,
  } = useAIAgent(pageContext);
  const { language } = useLanguage();
  const { hapticFeedback } = useTelegram();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPersonas, setShowPersonas] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

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
                <button type="button"
                  onClick={() => setShowPersonas(!showPersonas)}
                  style={{
                    width: "34px", height: "34px", borderRadius: "17px",
                    border: `0.5px solid ${showPersonas ? activePersona.color + "40" : GLASS.borderSub}`,
                    background: showPersonas ? `${activePersona.color}14` : GLASS.btnBg,
                    color: showPersonas ? activePersona.color : "rgba(255,255,255,0.5)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                  }}
                  aria-label="Switch persona"
                >
                  <PeopleIcon size={15} />
                </button>
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

              {displayMessages.map((msg, idx) => {
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
                    <AIAgentMessage
                      message={msg}
                      onSpeak={msg.role === "assistant" ? handleSpeak : undefined}
                      onButtonClick={handleButtonClick}
                      isSpeaking={isSpeaking}
                    />
                  </div>
                );
              })}
            </div>

            <AIAgentInput
              onSend={handleSend}
              isLoading={isLoading}
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
