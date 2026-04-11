import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { navigate } from "./useRouting";
import { parseVoiceNavigation } from "./useAIInteractions";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
  buttons?: string[];
  widgets?: WidgetData[];
  imageUrl?: string;
  persona?: string;
  personaName?: string;
  status?: "sending" | "sent" | "delivered" | "read";
  feedback?: "up" | "down" | null;
}

export interface WidgetData {
  type: string;
  [key: string]: any;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  color: string;
  emoji: string;
  voiceId: string;
}

export interface PageContext {
  currentPage: string;
  demoId?: string;
  timeOnPage?: number;
  pagesVisited?: string[];
  returnVisit?: boolean;
  scrollDepth?: number;
}

export interface BehaviorSignals {
  timeOnPage: number;
  pagesVisited: string[];
  returnVisit: boolean;
  scrollDepth: number;
}

const ALEX_PERSONA: Persona = { id: "alex", name: "Алекс", role: "Консультант", color: "#34d399", emoji: "🧑‍💼", voiceId: "pNInz6obpgDQGcFmaJgB" };
const PERSONAS: Persona[] = [ALEX_PERSONA];

const STORAGE_KEY = "web4tg_ai_chat";
const PAGES_KEY = "web4tg_pages_visited";
const VISIT_KEY = "web4tg_last_visit";
const ONBOARDING_KEY = "web4tg_ai_onboarding_done";
const MEMORY_KEY = "web4tg_ai_memory";

export interface AIMemory {
  userName?: string;
  businessType?: string;
  businessName?: string;
  preferences: string[];
  lastTopics: string[];
  interactionCount: number;
  firstSeen: number;
  lastSeen: number;
}

function loadMemory(): AIMemory {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return {
          userName: parsed.userName || undefined,
          businessType: parsed.businessType || undefined,
          businessName: parsed.businessName || undefined,
          preferences: Array.isArray(parsed.preferences) ? parsed.preferences.slice(-5) : [],
          lastTopics: Array.isArray(parsed.lastTopics) ? parsed.lastTopics.slice(-5) : [],
          interactionCount: typeof parsed.interactionCount === "number" ? parsed.interactionCount : 0,
          firstSeen: typeof parsed.firstSeen === "number" ? parsed.firstSeen : Date.now(),
          lastSeen: Date.now(),
        };
      }
    }
  } catch {}
  return { preferences: [], lastTopics: [], interactionCount: 0, firstSeen: Date.now(), lastSeen: Date.now() };
}

function saveMemory(memory: AIMemory) {
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); } catch {}
}

function extractMemoryFromText(text: string, memory: AIMemory): AIMemory {
  const updated = { ...memory, lastSeen: Date.now(), interactionCount: memory.interactionCount + 1 };

  if (!updated.userName) {
    const nameMatch = text.match(/(?:меня зовут|я\s+[-–—]\s*|мое имя|my name is)\s+([А-ЯЁA-Z][а-яёa-z]{1,20})/i);
    if (nameMatch) updated.userName = nameMatch[1];
  }

  if (!updated.businessType) {
    const bizPatterns: [RegExp, string][] = [
      [/ресторан|кафе|еда|food|доставк[аи]|кухн/i, "ресторан"],
      [/салон|красот|маникюр|парикмахер|барбер|spa|спа/i, "салон красоты"],
      [/магазин|shop|торговл|продаж[аи]|товар|одежд/i, "магазин"],
      [/фитнес|спортзал|тренажер|gym|тренер/i, "фитнес"],
      [/клиник|медицин|врач|стоматолог|здоров/i, "клиника"],
      [/отел[ьи]|гостиниц|hotel|бронирован/i, "отель"],
      [/авто|car|машин|сервис|ремонт/i, "автосервис"],
      [/образован|школ|курс|обучен|тренинг/i, "образование"],
      [/недвижимость|аренд|квартир|риэлтор/i, "недвижимость"],
    ];
    for (const [pattern, type] of bizPatterns) {
      if (pattern.test(text)) { updated.businessType = type; break; }
    }
  }

  if (!updated.businessName) {
    const bnMatch = text.match(/(?:называется|компания|бренд|бизнес)\s+[«"]?([А-ЯЁA-Z][А-ЯЁа-яёA-Za-z\s]{1,30}?)[»"]?(?:\s|,|\.|\!|$)/);
    if (bnMatch) updated.businessName = bnMatch[1].trim();
  }

  const topicPatterns: [RegExp, string][] = [
    [/цен[аы]|стоимость|сколько стоит|бюджет/i, "цены"],
    [/сроки|когда|быстро|долго/i, "сроки"],
    [/функци[яи]|возможност|интеграц/i, "функционал"],
    [/дизайн|интерфейс|ui|ux/i, "дизайн"],
    [/оплат|рассрочк|реквизит/i, "оплата"],
    [/портфолио|примеры|кейс/i, "портфолио"],
  ];
  for (const [pattern, topic] of topicPatterns) {
    if (pattern.test(text) && !updated.lastTopics.includes(topic)) {
      updated.lastTopics = [...updated.lastTopics, topic].slice(-5);
    }
  }

  return updated;
}

export function getThinkingPhrase(lastUserMessage: string, lang?: string): string {
  const lower = lastUserMessage.toLowerCase();
  const isEn = lang?.startsWith("en");

  if (/цен[аы]|стоимость|сколько|бюджет|дорого|прайс|тариф|price|cost|budget/.test(lower))
    return isEn ? "Calculating costs..." : "Считаю стоимость...";
  if (/портфолио|пример|работ|кейс|проект|показ|portfolio|example|project|show/.test(lower))
    return isEn ? "Finding examples..." : "Подбираю примеры...";
  if (/сроки|когда|быстро|долго|дней|время|timeline|when|fast|deadline/.test(lower))
    return isEn ? "Estimating timeline..." : "Оцениваю сроки...";
  if (/дизайн|интерфейс|ui|ux|красив|стиль|design|interface|style/.test(lower))
    return isEn ? "Thinking about design..." : "Продумываю дизайн...";
  if (/конкурент|сравн|альтернатив|аналог|competitor|compare|alternative/.test(lower))
    return isEn ? "Analyzing the market..." : "Анализирую рынок...";
  if (/оплат|реквизит|рассрочк|перевод|payment|invoice|installment/.test(lower))
    return isEn ? "Preparing payment details..." : "Готовлю детали оплаты...";
  if (/бизнес|компани|ниш|отрасл|business|company|industry|niche/.test(lower))
    return isEn ? "Analyzing your business..." : "Анализирую ваш бизнес...";
  if (/roi|окупаем|доход|прибыль|экономи|потер|savings|revenue|profit/.test(lower))
    return isEn ? "Calculating ROI..." : "Считаю экономику...";
  if (/функци|возможност|интеграц|api|модул|feature|integration|module/.test(lower))
    return isEn ? "Selecting features..." : "Подбираю функционал...";
  if (/ресторан|кафе|еда|доставк|restaurant|food|delivery|cafe/.test(lower))
    return isEn ? "Finding restaurant solutions..." : "Подбираю решение для ресторана...";
  if (/салон|красот|маникюр|спа|salon|beauty|spa/.test(lower))
    return isEn ? "Finding beauty solutions..." : "Подбираю решение для салона...";
  if (/магазин|shop|товар|каталог|store|catalog|product/.test(lower))
    return isEn ? "Finding shop solutions..." : "Подбираю решение для магазина...";
  if (/фитнес|спорт|тренер|зал|fitness|gym|trainer/.test(lower))
    return isEn ? "Finding fitness solutions..." : "Подбираю решение для фитнеса...";
  if (/помог|совет|подскаж|рекоменд|help|advice|suggest|recommend/.test(lower))
    return isEn ? "Preparing recommendation..." : "Готовлю рекомендацию...";
  if (/привет|здравств|добр|хай|hello|hey|hi\b/.test(lower))
    return isEn ? "Preparing greeting..." : "Готовлю приветствие...";
  return isEn ? "Thinking..." : "Думаю над ответом...";
}

const DEAL_STAGES = ["awareness", "interest", "consideration", "decision", "action"] as const;
type DealStage = typeof DEAL_STAGES[number];

function detectDealStage(messages: AIMessage[]): DealStage {
  const allText = messages.map(m => m.content).join(" ").toLowerCase();
  if (/оплачу|реквизит|перевод|рассрочк|оплат/.test(allText)) return "action";
  if (/давайте|начинаем|договор|бриф|заказ|хочу заказ/.test(allText)) return "decision";
  if (/сравни|гарант|не уверен|подумаю|конкурент|сомнев/.test(allText)) return "consideration";
  if (/цен|стоимост|сколько|функц|срок|тариф/.test(allText)) return "interest";
  if (messages.length > 4) return "interest";
  return "awareness";
}

function getDealTemperature(stage: DealStage): number {
  const map: Record<DealStage, number> = { awareness: 0.15, interest: 0.35, consideration: 0.55, decision: 0.8, action: 1.0 };
  return map[stage];
}

function loadMessages(): AIMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
      status: m.role === "user" ? "read" : undefined,
    })).slice(-50);
  } catch { return []; }
}

function saveMessages(messages: AIMessage[]) {
  try {
    const toSave = messages.slice(-50).map(m => ({
      ...m,
      imageUrl: undefined,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

function loadPagesVisited(): string[] {
  try {
    const stored = localStorage.getItem(PAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function savePagesVisited(pages: string[]) {
  try { localStorage.setItem(PAGES_KEY, JSON.stringify(pages.slice(-20))); } catch {}
}

function isReturnVisit(): boolean {
  try {
    const last = localStorage.getItem(VISIT_KEY);
    const now = Date.now();
    localStorage.setItem(VISIT_KEY, String(now));
    if (!last) return false;
    return now - Number(last) > 30 * 60 * 1000;
  } catch { return false; }
}

function isOnboardingDone(): boolean {
  try { return localStorage.getItem(ONBOARDING_KEY) === "1"; } catch { return false; }
}

function setOnboardingDone() {
  try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch {}
}

function getUserLanguage(): string {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.language_code) {
      return tg.initDataUnsafe.user.language_code;
    }
  } catch {}
  return navigator.language || "ru";
}

function getSpeechLang(): string {
  const lang = getUserLanguage().toLowerCase();
  if (lang.startsWith("en")) return "en-US";
  if (lang.startsWith("uk")) return "uk-UA";
  if (lang.startsWith("de")) return "de-DE";
  if (lang.startsWith("fr")) return "fr-FR";
  if (lang.startsWith("es")) return "es-ES";
  if (lang.startsWith("it")) return "it-IT";
  if (lang.startsWith("pt")) return "pt-BR";
  if (lang.startsWith("zh")) return "zh-CN";
  if (lang.startsWith("ja")) return "ja-JP";
  if (lang.startsWith("ko")) return "ko-KR";
  return "ru-RU";
}

let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch { return null; }
}

function playMessageSound() {
  try {
    const audioCtx = getAudioCtx();
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(1100, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch {}
}

function trackAIEvent(eventName: string, metadata?: Record<string, any>) {
  try {
    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [{
          category: "ai",
          action: eventName,
          timestamp: Date.now(),
          ...metadata,
        }],
      }),
    }).catch(() => {});
  } catch {}
}

export function useAIAgent(pageContext?: PageContext) {
  const [messages, setMessages] = useState<AIMessage[]>(() => loadMessages());
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone());
  const [searchQuery, setSearchQuery] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const pageEntryTime = useRef(Date.now());
  const pagesVisited = useRef<string[]>(loadPagesVisited());
  const returnVisit = useRef(isReturnVisit());
  const sessionStartRef = useRef(Date.now());
  const messageCountRef = useRef(0);
  const memoryRef = useRef<AIMemory>(loadMemory());
  const [thinkingPhrase, setThinkingPhrase] = useState("Думаю над ответом...");

  useEffect(() => {
    if (pageContext?.currentPage) {
      const p = pageContext.currentPage;
      if (!pagesVisited.current.includes(p)) {
        pagesVisited.current = [...pagesVisited.current, p];
        savePagesVisited(pagesVisited.current);
      }
      pageEntryTime.current = Date.now();
    }
  }, [pageContext?.currentPage]);

  useEffect(() => {
    const nonStreaming = messages.filter(m => !m.isStreaming);
    if (nonStreaming.length > 0) saveMessages(nonStreaming);
  }, [messages]);

  const dealStage = useMemo(() => detectDealStage(messages), [messages]);
  const dealTemperature = useMemo(() => getDealTemperature(dealStage), [dealStage]);
  const speechLang = useMemo(() => getSpeechLang(), []);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(m => m.content.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setOnboardingDone();
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      cleanupAudio();
      const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (messageCountRef.current > 0) {
        trackAIEvent("ai_session_end", {
          duration,
          messageCount: messageCountRef.current,
          dealStage,
          persona: activePersona.id,
        });
      }
    };
  }, [cleanupAudio]);

  const parseButtons = useCallback((text: string): string[] => {
    const buttonRegex = /```buttons\s*\n\s*(\[[\s\S]*?\])\s*\n```/g;
    const match = buttonRegex.exec(text);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) return parsed.slice(0, 2);
      } catch {}
    }
    return [];
  }, []);

  const parseWidgets = useCallback((text: string): WidgetData[] => {
    const widgets: WidgetData[] = [];
    const widgetRegex = /```widget\s*\n([\s\S]*?)\n```/g;
    let match;
    while ((match = widgetRegex.exec(text)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        if (data && data.type) widgets.push(data);
      } catch {}
    }
    return widgets;
  }, []);

  const processActions = useCallback((text: string) => {
    const ALLOWED_PATHS = [
      "/", "/projects", "/constructor", "/profile", "/referral",
      "/rewards", "/earning", "/coinshop"
    ];
    const ALLOWED_PATH_PREFIXES = ["/demos/"];

    const actionRegex = /```action\s*\n([\s\S]*?)\n```/g;
    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      try {
        const action = JSON.parse(match[1]);
        if (action.type === "navigate" && typeof action.path === "string") {
          const path = action.path;
          const isAllowed = ALLOWED_PATHS.includes(path) ||
            ALLOWED_PATH_PREFIXES.some(prefix => path.startsWith(prefix));
          if (isAllowed) {
            setTimeout(() => navigate(path), 500);
          }
        }
        if (action.type === "demo_tour" && Array.isArray(action.steps)) {
          let totalDelay = 0;
          for (const step of action.steps) {
            if (typeof step.path === "string") {
              const p = step.path.split("#")[0];
              const isAllowed = ALLOWED_PATHS.includes(p) ||
                ALLOWED_PATH_PREFIXES.some(prefix => p.startsWith(prefix));
              if (isAllowed) {
                const delay = totalDelay + (step.delay || 0);
                setTimeout(() => navigate(p), delay);
                totalDelay = delay + 2000;
              }
            }
          }
        }
        if (action.type === "switch_persona" && typeof action.persona === "string") {
          const p = PERSONAS.find(pp => pp.id === action.persona);
          if (p) setActivePersona(p);
        }
        if (action.type === "spotlight" && typeof action.selector === "string") {
          const sel = action.selector;
          const isSafe = /^\[data-[\w-]+(=['"]\w+['"])?\]$/.test(sel) || /^#[\w-]+$/.test(sel) || /^\.[\w-]+$/.test(sel);
          if (isSafe) {
            setTimeout(() => {
              try {
                const el = document.querySelector(sel);
                if (el) {
                  el.classList.add("ai-spotlight-highlight");
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  const dur = Math.min(Math.max(Number(action.duration) || 5000, 1000), 10000);
                  setTimeout(() => el.classList.remove("ai-spotlight-highlight"), dur);
                }
              } catch {}
            }, 600);
          }
        }
        if (action.type === "toast" && typeof action.message === "string") {
          const toastEvent = new CustomEvent("ai-toast", { detail: action.message });
          window.dispatchEvent(toastEvent);
        }
        if (action.type === "guided_tour" && Array.isArray(action.steps)) {
          const tourSteps = action.steps
            .filter((s: any) => typeof s.selector === "string" && typeof s.title === "string")
            .map((s: any) => ({
              selector: s.selector,
              title: s.title,
              description: s.description || "",
              position: s.position,
            }));
          if (tourSteps.length > 0) {
            const tourEvent = new CustomEvent("ai-guided-tour", { detail: tourSteps });
            window.dispatchEvent(tourEvent);
          }
        }
        if (action.type === "session_summary") {
          const summaryEvent = new CustomEvent("ai-session-summary");
          window.dispatchEvent(summaryEvent);
        }
      } catch {}
    }
  }, []);

  const buildPageContext = useCallback((): PageContext | undefined => {
    if (!pageContext) return undefined;
    const timeOnPage = Math.floor((Date.now() - pageEntryTime.current) / 1000);
    return {
      ...pageContext,
      timeOnPage,
      pagesVisited: pagesVisited.current,
      returnVisit: returnVisit.current,
    };
  }, [pageContext]);

  const getMemoryForAPI = useCallback((): Record<string, any> | undefined => {
    const m = memoryRef.current;
    if (!m.userName && !m.businessType && m.interactionCount < 2) return undefined;
    const mem: Record<string, any> = {};
    if (m.userName) mem.userName = m.userName;
    if (m.businessType) mem.businessType = m.businessType;
    if (m.businessName) mem.businessName = m.businessName;
    if (m.lastTopics.length > 0) mem.lastTopics = m.lastTopics;
    if (m.interactionCount > 0) mem.interactionCount = m.interactionCount;
    if (m.firstSeen) {
      const days = Math.floor((Date.now() - m.firstSeen) / (1000 * 60 * 60 * 24));
      if (days > 0) mem.daysSinceFirst = days;
    }
    return mem;
  }, []);

  const sendMessage = useCallback(
    async (content: string, imageBase64?: string, imageMimeType?: string) => {
      if ((!content.trim() && !imageBase64) || isLoading) return;

      const navPath = !imageBase64 ? parseVoiceNavigation(content.trim()) : null;
      if (navPath && voiceMode) {
        const navMsg: AIMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content: content.trim(),
          timestamp: new Date(),
          status: "read",
        };
        const navResponse: AIMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "🧭 Навигация...",
          timestamp: new Date(),
          persona: activePersona.id,
          personaName: activePersona.name,
        };
        setMessages(prev => [...prev, navMsg, navResponse]);
        setTimeout(() => navigate(navPath), 600);
        return;
      }

      messageCountRef.current += 1;
      setThinkingPhrase(getThinkingPhrase(content.trim(), getUserLanguage()));

      memoryRef.current = extractMemoryFromText(content.trim(), memoryRef.current);
      saveMemory(memoryRef.current);

      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        imageUrl: imageBase64 ? `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}` : undefined,
        status: "sent",
      };

      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
        persona: activePersona.id,
        personaName: activePersona.name,
      };

      setMessages((prev) => {
        const updated = prev.map(m =>
          m.role === "user" && m.status === "sent" ? { ...m, status: "delivered" as const } : m
        );
        return [...updated, userMessage, assistantMessage];
      });
      setIsLoading(true);

      trackAIEvent("ai_message_sent", {
        persona: activePersona.id,
        dealStage,
        hasImage: !!imageBase64,
        messageLength: content.length,
      });

      const allMessages = [
        ...messages,
        userMessage,
      ].map((msg) => {
        const parts: any[] = [{ text: msg.content || " " }];
        return {
          role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
          parts,
        };
      });

      if (imageBase64) {
        const lastMsg = allMessages[allMessages.length - 1];
        lastMsg.parts.push({
          inlineData: { mimeType: imageMimeType || "image/jpeg", data: imageBase64 },
        });
      }

      abortRef.current = new AbortController();
      const ctx = buildPageContext();
      const memory = getMemoryForAPI();

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            pageContext: ctx,
            persona: activePersona.id,
            memory,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        setMessages(prev => prev.map(m =>
          m.id === userMessage.id ? { ...m, status: "delivered" as const } : m
        ));

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "chunk" && data.text) {
                  fullText += data.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    updated[lastIdx] = { ...updated[lastIdx], content: fullText };
                    return updated;
                  });
                } else if (data.type === "replace" && data.text) {
                  fullText = data.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    updated[lastIdx] = { ...updated[lastIdx], content: fullText };
                    return updated;
                  });
                } else if (data.type === "done") {
                  const buttons = parseButtons(fullText);
                  const widgets = parseWidgets(fullText);

                  playMessageSound();

                  setMessages((prev) => {
                    const updated = prev.map(m =>
                      m.id === userMessage.id ? { ...m, status: "read" as const } : m
                    );
                    const lastIdx = updated.length - 1;
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      isStreaming: false,
                      buttons: buttons.length > 0 ? buttons : undefined,
                      widgets: widgets.length > 0 ? widgets : undefined,
                      persona: data.persona || activePersona.id,
                      personaName: data.personaName || activePersona.name,
                    };
                    return updated;
                  });

                  trackAIEvent("ai_response_received", {
                    persona: data.persona || activePersona.id,
                    dealStage: detectDealStage([...messages, userMessage]),
                    responseLength: fullText.length,
                    hasWidgets: widgets.length > 0,
                    hasButtons: buttons.length > 0,
                  });

                  if (voiceMode && fullText) {
                    const cleanText = fullText
                      .replace(/```[\s\S]*?```/g, "")
                      .replace(/\*\*(.*?)\*\*/g, "$1")
                      .replace(/\*(.*?)\*/g, "$1")
                      .replace(/#{1,6}\s/g, "")
                      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                      .replace(/`([^`]+)`/g, "$1")
                      .trim();
                    if (cleanText) speakTextInternal(cleanText);
                  }
                } else if (data.type === "error") {
                  fullText = "Ох, что-то пошло не так. Попробуйте ещё раз)";
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    updated[lastIdx] = { ...updated[lastIdx], content: fullText, isStreaming: false, isError: true };
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }

        processActions(fullText);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = { ...updated[lastIdx], content: "Ох, связь подвела. Попробуйте ещё раз)", isStreaming: false, isError: true };
            return updated;
          });
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, processActions, parseButtons, parseWidgets, activePersona, buildPageContext, getMemoryForAPI, voiceMode, dealStage]
  );

  const speakTextInternal = useCallback(async (text: string) => {
    cleanupAudio();
    setIsSpeaking(true);
    try {
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          voiceId: activePersona.voiceId,
        }),
      });
      if (!response.ok) throw new Error("TTS failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => cleanupAudio();
      audio.onerror = () => cleanupAudio();
      await audio.play();
    } catch { cleanupAudio(); }
  }, [cleanupAudio, activePersona.voiceId]);

  const speakText = useCallback(async (text: string) => {
    if (isSpeaking) { cleanupAudio(); return; }
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .trim();
    if (!cleanText) return;
    await speakTextInternal(cleanText);
  }, [isSpeaking, cleanupAudio, speakTextInternal]);

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.isStreaming) {
          updated[lastIdx] = { ...updated[lastIdx], isStreaming: false };
        }
        return updated;
      });
      setIsLoading(false);
    }
  }, []);

  const retryMessage = useCallback((errorMessageId: string) => {
    setMessages(prev => {
      const errorIdx = prev.findIndex(m => m.id === errorMessageId);
      if (errorIdx === -1) return prev;
      let userIdx = -1;
      for (let i = errorIdx - 1; i >= 0; i--) {
        if (prev[i].role === "user") { userIdx = i; break; }
      }
      if (userIdx === -1) return prev;
      const userMsg = prev[userIdx];
      const trimmed = prev.filter((_m, i) => i < userIdx || i > errorIdx);
      setTimeout(() => sendMessage(userMsg.content), 0);
      return trimmed;
    });
  }, [sendMessage]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    cleanupAudio();
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, [cleanupAudio]);

  const switchPersona = useCallback((personaId: string) => {
    const p = PERSONAS.find(pp => pp.id === personaId);
    if (p) {
      setActivePersona(p);
      trackAIEvent("ai_persona_switch", { persona: personaId });
    }
  }, []);

  useEffect(() => {
    const handlePersonaCycle = (e: Event) => {
      const dir = (e as CustomEvent).detail;
      setActivePersona(prev => {
        const idx = PERSONAS.findIndex(p => p.id === prev.id);
        let next: number;
        if (dir === "next") {
          next = (idx + 1) % PERSONAS.length;
        } else {
          next = (idx - 1 + PERSONAS.length) % PERSONAS.length;
        }
        trackAIEvent("ai_persona_switch", { persona: PERSONAS[next].id });
        return PERSONAS[next];
      });
    };
    window.addEventListener("ai-persona-cycle", handlePersonaCycle);
    return () => window.removeEventListener("ai-persona-cycle", handlePersonaCycle);
  }, []);

  const toggleVoiceMode = useCallback(() => {
    setVoiceMode(v => {
      const next = !v;
      trackAIEvent("ai_voice_mode_toggle", { enabled: next });
      return next;
    });
  }, []);

  const exportConversation = useCallback(() => {
    if (messages.length === 0) return "";
    const lines = messages.map(m => {
      const time = m.timestamp instanceof Date
        ? m.timestamp.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "";
      const name = m.role === "user" ? "Вы" : (m.personaName || "Алекс");
      const cleanContent = m.content
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s/g, "");
      return `[${time}] ${name}:\n${cleanContent}`;
    });
    return lines.join("\n\n---\n\n");
  }, [messages]);

  const shareConversation = useCallback(() => {
    const text = exportConversation();
    if (!text) return;

    if (navigator.share) {
      navigator.share({ title: "Диалог с WEB4TG AI", text: text.slice(0, 4000) }).catch(() => {});
      return;
    }

    navigator.clipboard.writeText(text).catch(() => {});
  }, [exportConversation]);

  const scheduleFollowup = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    const telegramId = tg?.initDataUnsafe?.user?.id;
    const initData = tg?.initData;
    if (!telegramId) return;

    const stage = detectDealStage(messages);
    if (stage !== "consideration" && stage !== "decision") return;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (initData) headers["x-telegram-init-data"] = initData;

    fetch("/api/ai/followup", {
      method: "POST",
      headers,
      body: JSON.stringify({
        telegramId,
        dealStage: stage,
      }),
    }).catch(() => {});
  }, [messages]);

  const setMessageFeedback = useCallback((messageId: string, fb: "up" | "down" | null) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, feedback: fb } : m
    ));
  }, []);

  const cancelFollowup = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    const telegramId = tg?.initDataUnsafe?.user?.id;
    const initData = tg?.initData;
    if (!telegramId) return;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (initData) headers["x-telegram-init-data"] = initData;

    fetch("/api/ai/followup/cancel", {
      method: "POST",
      headers,
      body: JSON.stringify({ telegramId }),
    }).catch(() => {});
  }, []);

  return {
    messages,
    filteredMessages,
    isLoading,
    isSpeaking,
    voiceMode,
    activePersona,
    personas: PERSONAS,
    dealStage,
    dealTemperature,
    showOnboarding,
    searchQuery,
    speechLang,
    thinkingPhrase,
    sendMessage,
    speakText,
    stopGeneration,
    retryMessage,
    clearHistory,
    switchPersona,
    toggleVoiceMode,
    dismissOnboarding,
    setSearchQuery,
    exportConversation,
    shareConversation,
    scheduleFollowup,
    cancelFollowup,
    setMessageFeedback,
    pagesVisited: pagesVisited.current,
  };
}
