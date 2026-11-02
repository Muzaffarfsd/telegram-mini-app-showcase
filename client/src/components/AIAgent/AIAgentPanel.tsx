import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, ChevronDown, MoreHorizontal, Search, Share2, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "@/utils/LazyMotionProvider";
import { useAIAgent, type PageContext } from "@/hooks/useAIAgent";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTelegram } from "@/hooks/useTelegram";
import consultant from "@/assets/consultant/header-consultant-v1.webp";
import { AIAgentMessage } from "./AIAgentMessage";
import { AIAgentInput, type AIAgentDraft } from "./AIAgentInput";
import "./AIAgentPanel.css";

interface AIAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext?: PageContext;
}

const STAGES: Record<string, { ru: string; en: string }> = {
  awareness: { ru: "Знакомство", en: "Introduction" },
  interest: { ru: "Возможности", en: "Exploring" },
  consideration: { ru: "Выбор", en: "Considering" },
  decision: { ru: "Планирование", en: "Planning" },
  action: { ru: "Следующий шаг", en: "Next step" },
};

function dateLabel(date: Date, language: string) {
  const value = new Date(date);
  const today = new Date();
  if (value.toDateString() === today.toDateString()) return language === "ru" ? "Сегодня" : "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (value.toDateString() === yesterday.toDateString()) return language === "ru" ? "Вчера" : "Yesterday";
  return value.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "long" });
}

export const AIAgentPanel = memo(({ isOpen, onClose, pageContext }: AIAgentPanelProps) => {
  const {
    demoMode, messages, filteredMessages, isLoading, isSpeaking, voiceMode, activePersona, dealStage,
    sendMessage, speakText, stopGeneration, retryMessage, toggleVoiceMode, dismissOnboarding,
    searchQuery, setSearchQuery, shareConversation, speechLang, scheduleFollowup, cancelFollowup,
    thinkingPhrase, setMessageFeedback, memory, updateMemory, clearMemoryField,
  } = useAIAgent(pageContext);
  const { language } = useLanguage();
  const { hapticFeedback } = useTelegram();
  const ru = language === "ru";
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<AIAgentDraft>({ input: "", previewImage: null, imageData: null });
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ y: number; time: number } | null>(null);
  const dragDistance = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [panelNotice, setPanelNotice] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<{ id: number; text: string } | null>(null);
  const clearReplyDraft = useCallback(() => setReplyDraft(null), []);
  const [atBottom, setAtBottom] = useState(true);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => dialogRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(frame);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const offset = viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
      setKeyboardHeight(offset > 80 ? offset : 0);
    };
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    const tg = (window as any).Telegram?.WebApp;
    tg?.onEvent?.("viewportChanged", update);
    update();
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      tg?.offEvent?.("viewportChanged", update);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setShowActions(false);
      setShowSearch(false);
      setShowInsights(false);
      setPanelNotice(null);
      setDragY(0);
      setDragging(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last?.isStreaming || last.content || last.role !== "assistant") {
      setThinkingSeconds(0);
      return;
    }
    const timer = window.setInterval(() => setThinkingSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    const last = messages[messages.length - 1];
    if (el && messages.length > 0 && (atBottom || last?.isStreaming || keyboardHeight > 0)) el.scrollTop = el.scrollHeight;
  }, [messages, atBottom, keyboardHeight]);

  const close = useCallback(() => {
    queueMicrotask(() => hapticFeedback.light());
    scheduleFollowup();
    onClose();
  }, [hapticFeedback, onClose, scheduleFollowup]);

  const send = useCallback((content: string, imageBase64?: string, imageMimeType?: string) => {
    queueMicrotask(() => hapticFeedback.light());
    dismissOnboarding();
    cancelFollowup();
    setAtBottom(true);
    sendMessage(content, imageBase64, imageMimeType);
  }, [cancelFollowup, dismissOnboarding, hapticFeedback, sendMessage]);

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStart.current = { y: event.touches[0].clientY, time: Date.now() };
    dragDistance.current = 0;
  };
  const onTouchMove = (event: React.TouchEvent<HTMLElement>) => {
    if (!touchStart.current) return;
    const distance = Math.max(0, event.touches[0].clientY - touchStart.current.y);
    if (distance > 4) {
      dragDistance.current = distance;
      setDragging(true);
      setDragY(distance);
    }
  };
  const onTouchEnd = () => {
    if (touchStart.current) {
      const distance = dragDistance.current;
      const velocity = distance / Math.max(1, Date.now() - touchStart.current.time);
      if (distance > 110 || (distance > 35 && velocity > 0.65)) close();
    }
    touchStart.current = null;
    dragDistance.current = 0;
    setDragging(false);
    setDragY(0);
  };

  const feedback = useCallback((messageId: string, value: "up" | "down" | null) => {
    setMessageFeedback(messageId, value);
    if (demoMode) return;
    fetch("/api/analytics/events", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: [{ category: "ai", action: "message_feedback", timestamp: Date.now(), messageId, feedback: value, persona: activePersona.id }] }),
    }).catch(() => {});
  }, [activePersona.id, demoMode, setMessageFeedback]);

  const openDemo = useCallback((demoId: string) => {
    cancelFollowup();
    onClose();
    window.setTimeout(() => { window.location.hash = `#/demos/${demoId}/app`; }, 220);
  }, [cancelFollowup, onClose]);

  const displayMessages = showSearch && searchQuery ? filteredMessages : messages;
  const lastMessage = messages[messages.length - 1];
  const showSuggestions = lastMessage?.role === "assistant" && !lastMessage.isStreaming && !isLoading;
  const followUps = useMemo(() => {
    const text = lastMessage?.content.toLowerCase() || "";
    if (ru) {
      if (/цен[аы]|стоимост|тариф/.test(text)) return ["Что входит в стоимость?", "Какие сроки?"];
      if (/демо|пример|портфолио/.test(text)) return ["Покажите ещё примеры", "Как выбрать подходящий?"];
      return ["Расскажите подробнее", "Покажите примеры"];
    }
    if (/price|cost|tariff/.test(text)) return ["What's included?", "How long does it take?"];
    if (/demo|example|portfolio/.test(text)) return ["Show more examples", "How do I choose?"];
    return ["Tell me more", "Show examples"];
  }, [lastMessage, ru]);

  const starters = ru ? [
    { title: "Подобрать приложение", prompt: "Помогите выбрать Mini App для моего бизнеса" },
    { title: "Узнать стоимость", prompt: "Расскажите о стоимости разработки Mini App" },
    { title: "Посмотреть примеры", prompt: "Покажите примеры готовых проектов" },
  ] : [
    { title: "Find an app", prompt: "Help me choose a Mini App for my business" },
    { title: "Explore pricing", prompt: "Tell me about Mini App development pricing" },
    { title: "See examples", prompt: "Show me examples of finished projects" },
  ];
  const hasMemory = !!(memory?.userName || memory?.businessName || memory?.businessType || memory?.lastTopics?.length);
  let previousDate = "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div className="ai-chat-scrim" aria-hidden="true" onClick={close}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
          <m.div
            ref={dialogRef} className="ai-chat-sheet" role="dialog" aria-modal="true" aria-label={ru ? "ИИ-консультант" : "AI consultant"} tabIndex={-1}
            data-testid="ai-chat-panel"
            initial={reducedMotion ? { opacity: 1 } : { y: "100%" }}
            animate={{ opacity: 1, y: dragY }}
            exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            transition={dragging ? { duration: 0 } : { duration: reducedMotion ? 0.01 : 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={keyboardHeight > 0 ? { bottom: keyboardHeight, height: `calc(100dvh - ${keyboardHeight}px)` } : undefined}
          >
            <div className="ai-chat-grabber" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd} data-testid="ai-chat-grabber">
              <span />
            </div>
            <header className="ai-chat-header"
              onTouchStart={event => { if (!(event.target as HTMLElement).closest("button")) onTouchStart(event); }}
              onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
              <img className="ai-chat-avatar" src={consultant} alt="" width="44" height="44" />
              <div className="ai-chat-identity">
                <h2>{ru ? "ИИ-консультант" : "AI consultant"} {demoMode && <span className="ai-chat-demo-badge">{ru ? "Демо" : "Demo"}</span>}</h2>
                <p aria-live="polite">{isLoading ? thinkingPhrase : demoMode ? (ru ? "Пример диалога" : "Example conversation") : (ru ? "Помогу с вашим проектом" : "Here to help with your project")}</p>
              </div>
              <div className="ai-chat-header-actions">
                {messages.length > 0 && (
                  <div className="ai-chat-menu-wrap">
                    <button type="button" className="ai-chat-icon-button" aria-label="More actions" aria-expanded={showActions} onClick={() => setShowActions(value => !value)}><MoreHorizontal size={21} /></button>
                    {showActions && <div className="ai-chat-action-menu" data-testid="ai-chat-actions">
                      <button type="button" onClick={() => { setShowSearch(value => !value); setShowActions(false); }}><Search size={17} />{ru ? "Поиск в диалоге" : "Search conversation"}</button>
                      <button type="button" onClick={async () => {
                        setShowActions(false);
                        const result = await shareConversation();
                        if (result === "copied") setPanelNotice(ru ? "Диалог скопирован" : "Conversation copied");
                        if (result === "unavailable") setPanelNotice(ru ? "Не удалось поделиться диалогом" : "Couldn't share the conversation");
                      }}><Share2 size={17} />{ru ? "Поделиться диалогом" : "Share conversation"}</button>
                      {messages.length > 2 && <button type="button" onClick={() => { setShowInsights(value => !value); setShowActions(false); }}><SlidersHorizontal size={17} />{ru ? "О диалоге" : "About conversation"}</button>}
                    </div>}
                  </div>
                )}
                <button type="button" className="ai-chat-icon-button" onClick={close} aria-label="Close"><ChevronDown size={21} /></button>
              </div>
            </header>

            {showSearch && <div className="ai-chat-search">
              <Search size={18} aria-hidden="true" />
              <input autoFocus value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder={ru ? "Поиск в диалоге" : "Search conversation"} aria-label={ru ? "Поиск в диалоге" : "Search conversation"} />
              <button type="button" className="ai-chat-icon-button" onClick={() => { setSearchQuery(""); setShowSearch(false); }} aria-label={ru ? "Закрыть поиск" : "Close search"}><X size={18} /></button>
            </div>}
            {showInsights && <div className="ai-chat-insights">
              <span>{ru ? "Сообщений" : "Messages"}: <strong>{messages.length}</strong></span>
              <span>{ru ? "Этап" : "Stage"}: <strong>{(STAGES[dealStage] || STAGES.awareness)[ru ? "ru" : "en"]}</strong></span>
            </div>}
            {panelNotice && <div className="ai-chat-panel-notice" role="status">{panelNotice}<button type="button" onClick={() => setPanelNotice(null)} aria-label={ru ? "Закрыть уведомление" : "Dismiss notice"}><X size={15} /></button></div>}

            <div className="ai-chat-body">
              <div ref={scrollRef} className="ai-chat-scroll" onScroll={() => {
                const el = scrollRef.current;
                if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
              }}>
                {messages.length === 0 && !searchQuery && <div className="ai-chat-welcome">
                  <div className="ai-chat-hero-art"><img src={consultant} alt="" width="144" height="144" /></div>
                  <div className="ai-chat-welcome-copy">
                    <p className="ai-chat-kicker">WEB4TG · {demoMode ? (ru ? "ДЕМО" : "DEMO") : "AI"}</p>
                    <h3>{ru ? "Привет! Я ваш ИИ-консультант" : "Hello! I'm your AI consultant"}</h3>
                    <p>{demoMode ? (ru ? "Попробуйте пример диалога: настоящие ответы появятся после подключения ИИ." : "Try an example conversation. Real answers will be available after AI is connected.") : (ru ? "Помогу выбрать приложение, разобраться с возможностями и обсудить ваш проект." : "I'll help you choose an app, explore its features and discuss your project.")}</p>
                  </div>
                  <div className="ai-chat-starters" aria-label={ru ? "Варианты вопросов" : "Suggested questions"}>
                    {starters.map((item, index) => <button type="button" key={item.title} onClick={() => send(item.prompt)}>
                      <span className="ai-chat-starter-number">0{index + 1}</span><span>{item.title}</span><ArrowUpRight size={17} aria-hidden="true" />
                    </button>)}
                  </div>
                </div>}

                {hasMemory && messages.length > 0 && <details className="ai-chat-memory">
                  <summary>{ru ? "Что я запомнил" : "What I remember"}</summary>
                  <div>
                    {memory.userName && <button type="button" onClick={() => clearMemoryField("userName")} aria-label={ru ? `Удалить имя ${memory.userName}` : `Remove name ${memory.userName}`} data-testid="memory-chip-name">{memory.userName} <X size={13} /></button>}
                    {(memory.businessName || memory.businessType) && <button type="button" onClick={() => clearMemoryField(memory.businessName ? "businessName" : "businessType")} aria-label={ru ? "Удалить бизнес" : "Remove business"} data-testid="memory-chip-business">{memory.businessName || memory.businessType} <X size={13} /></button>}
                    {(memory.lastTopics || []).slice(-3).map((topic, index) => <button type="button" key={topic} data-testid={`memory-chip-topic-${index}`} onClick={() => updateMemory({ lastTopics: memory.lastTopics.filter(value => value !== topic) })} aria-label={ru ? `Удалить тему ${topic}` : `Remove topic ${topic}`}>{topic} <X size={13} /></button>)}
                  </div>
                </details>}

                {showSearch && searchQuery && displayMessages.length === 0 && <p className="ai-chat-empty-search">{ru ? "Сообщений не найдено" : "No messages found"}</p>}
                <div className="ai-chat-messages" aria-live="polite">
                  {displayMessages.map(message => {
                    const date = dateLabel(message.timestamp, language);
                    const showDate = date !== previousDate;
                    previousDate = date;
                    return <div key={message.id}>
                      {showDate && <div className="ai-chat-date">{date}</div>}
                      {message.isDemo && <div className="ai-chat-example-label">{ru ? "Пример ответа" : "Example response"}</div>}
                      <AIAgentMessage message={message} onSpeak={!demoMode && message.role === "assistant" ? speakText : undefined}
                        onButtonClick={send} onReply={text => setReplyDraft({ id: Date.now(), text })}
                        onRetry={retryMessage} onFeedback={feedback} onOpenDemo={openDemo} isSpeaking={isSpeaking}
                        thinkingSeconds={thinkingSeconds} thinkingPhrase={thinkingPhrase} />
                    </div>;
                  })}
                </div>
                {showSuggestions && !searchQuery && <div className="ai-chat-followups">
                  {followUps.map(item => <button key={item} type="button" onClick={() => send(item)}>{item}<ArrowUpRight size={15} /></button>)}
                </div>}
              </div>
              {!atBottom && <button type="button" className="ai-chat-scroll-bottom" aria-label="Scroll to bottom" onClick={() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" }); setAtBottom(true); }}><ArrowDown size={18} /></button>}
            </div>
            <AIAgentInput draftRef={draftRef} replyDraft={replyDraft} onReplyApplied={clearReplyDraft} demoMode={demoMode} onSend={send} isLoading={isLoading} onStop={stopGeneration} voiceMode={voiceMode}
              onToggleVoiceMode={demoMode ? undefined : toggleVoiceMode} speechLang={speechLang} placeholder={ru ? "Напишите сообщение..." : "Write a message..."} />
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
});
