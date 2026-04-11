import { useState, useEffect, useRef, useCallback } from "react";

export interface ScrollMilestone {
  id: string;
  threshold: number;
  messageRu: string;
  messageEn: string;
  triggered: boolean;
}

export interface SwipeDirection {
  direction: "up" | "down" | "left" | "right" | null;
  distance: number;
}

interface UseAIInteractionsOptions {
  pageComponent: string;
  language: string;
  isOpen: boolean;
  onToast: (msg: string) => void;
  onOpen: () => void;
}

const IDLE_TIMEOUT = 60000;
const EXIT_COOLDOWN = 30000;

const IDLE_MESSAGES: Record<string, { ru: string; en: string }> = {
  showcase: {
    ru: "Заметил, что вы задумались 🤔 Подобрать решение под ваш бизнес?",
    en: "I noticed you're thinking 🤔 Can I help find a solution for your business?",
  },
  projects: {
    ru: "Нужна помощь с выбором? Могу сравнить решения для вас",
    en: "Need help choosing? I can compare solutions for you",
  },
  demoApp: {
    ru: "Как вам демо? Могу рассказать подробнее о возможностях",
    en: "What do you think of the demo? I can tell you more about its features",
  },
  demoLanding: {
    ru: "Хотите попробовать демо вживую? Просто нажмите «Запустить»",
    en: "Want to try the demo live? Just click 'Launch'",
  },
  constructor: {
    ru: "Нужна помощь с конструктором? Расскажу, как собрать идеальное приложение",
    en: "Need help with the constructor? I'll show you how to build the perfect app",
  },
};

const EXIT_MESSAGES: Record<string, { ru: string; en: string }> = {
  showcase: {
    ru: "Подождите! 🎁 Могу подготовить бесплатный анализ для вашего бизнеса",
    en: "Wait! 🎁 I can prepare a free analysis for your business",
  },
  projects: {
    ru: "Перед уходом — хотите получить персональную подборку решений?",
    en: "Before you go — want a personalized selection of solutions?",
  },
  demoApp: {
    ru: "Уже уходите? Могу отправить КП с ценами в чат 📋",
    en: "Leaving already? I can send a proposal with prices to chat 📋",
  },
  default: {
    ru: "Спасибо за визит! Я всегда на связи — просто напишите 💬",
    en: "Thanks for visiting! I'm always here — just write 💬",
  },
};

const SCROLL_MESSAGES: Record<string, { ru: string; en: string }> = {
  pricing: {
    ru: "Вижу, вы дошли до цен 💰 Хотите персональное предложение?",
    en: "I see you reached the pricing section 💰 Want a personalized offer?",
  },
  bottom: {
    ru: "Дочитали до конца! 🏆 Готов ответить на вопросы",
    en: "You read till the end! 🏆 Ready to answer questions",
  },
  features: {
    ru: "Нравится функционал? Могу показать, как это работает вживую",
    en: "Like the features? I can show you how it works live",
  },
};

export function useAIInteractions({
  pageComponent,
  language,
  isOpen,
  onToast,
  onOpen,
}: UseAIInteractionsOptions) {
  const [clipboardSuggestion, setClipboardSuggestion] = useState<string | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitShownRef = useRef(0);
  const scrollTriggeredRef = useRef<Set<string>>(new Set());
  const clipboardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isOpenRef.current) return;

    idleTimerRef.current = setTimeout(() => {
      if (isOpenRef.current) return;
      const msgs = IDLE_MESSAGES[pageComponent] || IDLE_MESSAGES.showcase;
      const msg = language === "ru" ? msgs.ru : msgs.en;
      onToast(msg);
    }, IDLE_TIMEOUT);
  }, [pageComponent, language, onToast]);

  useEffect(() => {
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"];
    const handler = () => resetIdleTimer();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    scrollTriggeredRef.current.clear();
  }, [pageComponent]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isOpenRef.current) {
        const now = Date.now();
        if (now - exitShownRef.current < EXIT_COOLDOWN) return;
        exitShownRef.current = now;

        const msgs = EXIT_MESSAGES[pageComponent] || EXIT_MESSAGES.default;
        const msg = language === "ru" ? msgs.ru : msgs.en;
        onToast(msg);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pageComponent, language, onToast]);

  useEffect(() => {
    if (isOpen) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPercent = (scrollTop / docHeight) * 100;

      if (scrollPercent > 70 && !scrollTriggeredRef.current.has("bottom")) {
        scrollTriggeredRef.current.add("bottom");
        const msg = language === "ru" ? SCROLL_MESSAGES.bottom.ru : SCROLL_MESSAGES.bottom.en;
        onToast(msg);
        return;
      }

      const pricingEl = document.querySelector("[data-section='pricing'], [data-section='prices'], #pricing");
      if (pricingEl && !scrollTriggeredRef.current.has("pricing")) {
        const rect = pricingEl.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.6 && rect.bottom > 0) {
          scrollTriggeredRef.current.add("pricing");
          const msg = language === "ru" ? SCROLL_MESSAGES.pricing.ru : SCROLL_MESSAGES.pricing.en;
          onToast(msg);
          return;
        }
      }

      const featuresEl = document.querySelector("[data-section='features'], #features");
      if (featuresEl && !scrollTriggeredRef.current.has("features")) {
        const rect = featuresEl.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
          scrollTriggeredRef.current.add("features");
          const msg = language === "ru" ? SCROLL_MESSAGES.features.ru : SCROLL_MESSAGES.features.en;
          onToast(msg);
        }
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [isOpen, language, onToast]);

  useEffect(() => {
    const handleCopy = () => {
      if (isOpenRef.current) return;
      const selection = window.getSelection()?.toString().trim();
      if (!selection || selection.length < 5) return;

      let suggestion: string;
      if (/\d+[\s.,]?\d*\s*(₽|руб|р\.|usd|\$|€)/i.test(selection)) {
        suggestion = language === "ru"
          ? `📋 Скопировали цену? Могу подготовить детальное сравнение`
          : `📋 Copied a price? I can prepare a detailed comparison`;
      } else if (selection.length > 50) {
        suggestion = language === "ru"
          ? `📋 Интересный фрагмент! Хотите обсудить?`
          : `📋 Interesting excerpt! Want to discuss it?`;
      } else {
        suggestion = language === "ru"
          ? `📋 Скопировано. Нужна дополнительная информация?`
          : `📋 Copied. Need more information?`;
      }

      if (clipboardTimerRef.current) clearTimeout(clipboardTimerRef.current);
      setClipboardSuggestion(suggestion);
      clipboardTimerRef.current = setTimeout(() => setClipboardSuggestion(null), 6000);
    };

    document.addEventListener("copy", handleCopy);
    return () => {
      document.removeEventListener("copy", handleCopy);
      if (clipboardTimerRef.current) clearTimeout(clipboardTimerRef.current);
    };
  }, [language]);

  const dismissClipboard = useCallback(() => {
    if (clipboardTimerRef.current) clearTimeout(clipboardTimerRef.current);
    setClipboardSuggestion(null);
  }, []);

  return {
    clipboardSuggestion,
    dismissClipboard,
  };
}

export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement | null>,
  callbacks: {
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
  },
  threshold = 50
) {
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const handleStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    };

    const handleEnd = (e: TouchEvent) => {
      if (!startRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startRef.current.x;
      const dy = touch.clientY - startRef.current.y;
      const dt = Date.now() - startRef.current.time;
      startRef.current = null;

      if (dt > 500) return;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < threshold && absDy < threshold) return;

      if (absDy > absDx) {
        if (dy < -threshold) callbacks.onSwipeUp?.();
        else if (dy > threshold) callbacks.onSwipeDown?.();
      } else {
        if (dx < -threshold) callbacks.onSwipeLeft?.();
        else if (dx > threshold) callbacks.onSwipeRight?.();
      }
    };

    el.addEventListener("touchstart", handleStart, { passive: true });
    el.addEventListener("touchend", handleEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleStart);
      el.removeEventListener("touchend", handleEnd);
    };
  }, [elementRef, callbacks, threshold]);
}

const VOICE_NAV_COMMANDS: Array<{
  patterns: RegExp[];
  path: string;
}> = [
  { patterns: [/демо\s*рестор/i, /restaurant\s*demo/i, /покажи.*рестор/i, /show.*restaurant/i], path: "/demos/restaurant/app" },
  { patterns: [/демо\s*магаз/i, /shop\s*demo/i, /покажи.*магаз/i, /show.*shop/i], path: "/demos/shop/app" },
  { patterns: [/проект/i, /project/i, /портфолио/i, /portfolio/i], path: "/projects" },
  { patterns: [/конструктор/i, /constructor/i, /builder/i], path: "/constructor" },
  { patterns: [/аналитик/i, /analytics/i], path: "/analytics" },
  { patterns: [/главн/i, /home/i, /на\s*главную/i, /go\s*home/i], path: "/" },
  { patterns: [/демо/i, /demo/i, /все\s*демо/i, /all\s*demo/i], path: "/projects" },
];

export function parseVoiceNavigation(text: string): string | null {
  const normalized = text.toLowerCase().trim();
  for (const cmd of VOICE_NAV_COMMANDS) {
    for (const pattern of cmd.patterns) {
      if (pattern.test(normalized)) {
        return cmd.path;
      }
    }
  }
  return null;
}

export function getSessionSummary(language: string): {
  pagesVisited: string[];
  totalTime: number;
  demosViewed: number;
  recommendation: string;
} {
  let pagesVisited: string[] = [];
  try {
    const stored = localStorage.getItem("web4tg_pages_visited");
    if (stored) pagesVisited = JSON.parse(stored);
  } catch {}

  const lastVisit = localStorage.getItem("web4tg_last_visit");
  const totalTime = lastVisit ? Math.floor((Date.now() - parseInt(lastVisit)) / 1000) : 0;
  const demosViewed = pagesVisited.filter(p => p.includes("/demos/")).length;

  let recommendation: string;
  if (language === "ru") {
    if (demosViewed >= 3) {
      recommendation = "Вы просмотрели несколько демо — готов подготовить сравнительный анализ!";
    } else if (demosViewed > 0) {
      recommendation = "Посмотрите ещё пару демо для лучшего понимания возможностей";
    } else if (pagesVisited.length > 2) {
      recommendation = "Рекомендую попробовать наши демо — там самое интересное!";
    } else {
      recommendation = "Спасибо за визит! Возвращайтесь в любое время 👋";
    }
  } else {
    if (demosViewed >= 3) {
      recommendation = "You've viewed several demos — ready to prepare a comparison!";
    } else if (demosViewed > 0) {
      recommendation = "Check out a few more demos to better understand the capabilities";
    } else if (pagesVisited.length > 2) {
      recommendation = "I recommend trying our demos — that's where the magic is!";
    } else {
      recommendation = "Thanks for visiting! Come back anytime 👋";
    }
  }

  return { pagesVisited, totalTime, demosViewed, recommendation };
}
