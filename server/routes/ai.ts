import { Router, Request, Response } from "express";
import { streamChat, filterResponse, getPersonaName, type ChatMessage, type ChatMessagePart, type ChatOptions, type PageContext } from "../lib/gemini";
import { textToSpeech, getVoices } from "../lib/elevenlabs";
import { validateTelegramInitData } from "../telegramAuth";

const router = Router();

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

const CONTEXTUAL_FALLBACKS: Record<string, string> = {
  price: "Шаблоны стоят от 150 000₽ (магазин) до 200 000₽ (фитнес). Подписки: Мини 9 900₽/мес, Стандарт 14 900₽/мес, Премиум 24 900₽/мес. Предоплата 35%, 14 дней правок. Напишите нишу — подберу оптимальный вариант)",
  portfolio: "У нас 20+ реализованных проектов. Radiance — магазин одежды, окупился за 25 дней. GlowSpa — салон красоты, no-show снизился на 45%. DeluxeDine — ресторан, экономия 35к/мес на комиссиях. Хотите посмотреть демо?",
  timeline: "Сроки зависят от сложности: стандартный шаблон — 7-10 дней, с доработками — до 15 дней. Что планируете — магазин, запись на услуги, ресторан?",
  payment: "Схема оплаты: 35% предоплата + 65% после сдачи проекта. 14 дней бесплатных правок включены. Возможна рассрочка. Какой проект планируете?",
  subscription: "Тарифы подписки: Мини (9 900₽/мес) — базовая поддержка, Стандарт (14 900₽/мес) — рекомендуемый, Премиум (24 900₽/мес) — полный пакет. Расскажите о бизнесе — подберу подходящий)",
  discount: "У нас есть система лояльности — монеты за подписки, рефералы и задания. Скидки до 25%. Также работает реферальная программа с 3 уровнями. Хотите узнать подробнее?",
  consultation: "Хорошо, давайте организую консультацию с нашим менеджером. Расскажите коротко — какая у вас ниша и какие задачи хотите решить?",
  default: "Привет! Я Алекс, консультант WEB4TG Studio. Мы делаем Telegram Mini Apps для бизнеса — магазины, рестораны, салоны, фитнес и другие ниши. Запуск за 7-15 дней. Расскажите о вашем бизнесе — подберу решение)"
};

function detectFallbackTopic(lastMessage: string): string {
  const lower = lastMessage.toLowerCase();
  if (/цен[аы]|стоимость|сколько стоит|прайс|бюджет|дорого/.test(lower)) return "price";
  if (/портфолио|примеры|работы|кейс|проект/.test(lower)) return "portfolio";
  if (/сроки|когда|быстро|долго|время|дней/.test(lower)) return "timeline";
  if (/оплат[аы]|реквизит|перевод|счёт|счет|рассрочк/.test(lower)) return "payment";
  if (/подписк|тариф|пакет|план/.test(lower)) return "subscription";
  if (/скидк|бонус|монет|промокод|акци/.test(lower)) return "discount";
  if (/консультац|менеджер|позвонить|связаться/.test(lower)) return "consultation";
  return "default";
}

function validatePart(p: any): p is ChatMessagePart {
  if (!p) return false;
  const hasText = p.text !== undefined;
  const hasImage = p.inlineData !== undefined;
  if (!hasText && !hasImage) return false;
  if (hasText && typeof p.text !== "string") return false;
  if (hasText && p.text.length > MAX_MESSAGE_LENGTH) return false;
  if (hasImage) {
    if (!p.inlineData || typeof p.inlineData.mimeType !== "string" || typeof p.inlineData.data !== "string") return false;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(p.inlineData.mimeType)) return false;
    if (p.inlineData.data.length > MAX_IMAGE_SIZE) return false;
  }
  return true;
}

function validateMessages(messages: any): messages is ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  if (messages.length > MAX_MESSAGES) return false;
  return messages.every(
    (m: any) =>
      m &&
      (m.role === "user" || m.role === "model") &&
      Array.isArray(m.parts) &&
      m.parts.length > 0 &&
      m.parts.every(validatePart)
  );
}

function validatePageContext(ctx: any): ctx is PageContext | undefined {
  if (!ctx) return true;
  if (typeof ctx !== "object") return false;
  if (typeof ctx.currentPage !== "string") return false;
  return true;
}

function validateMemory(mem: any): mem is Record<string, any> | undefined {
  if (!mem) return true;
  if (typeof mem !== "object" || Array.isArray(mem)) return false;
  if (mem.userName !== undefined && (typeof mem.userName !== "string" || mem.userName.length > 30)) return false;
  if (mem.businessType !== undefined && (typeof mem.businessType !== "string" || mem.businessType.length > 40)) return false;
  if (mem.businessName !== undefined && (typeof mem.businessName !== "string" || mem.businessName.length > 40)) return false;
  if (mem.lastTopics !== undefined && (!Array.isArray(mem.lastTopics) || mem.lastTopics.length > 5 || !mem.lastTopics.every((t: any) => typeof t === "string" && t.length <= 20))) return false;
  if (mem.interactionCount !== undefined && (typeof mem.interactionCount !== "number" || mem.interactionCount < 0 || mem.interactionCount > 9999)) return false;
  if (mem.daysSinceFirst !== undefined && (typeof mem.daysSinceFirst !== "number" || mem.daysSinceFirst < 0 || mem.daysSinceFirst > 365)) return false;
  return true;
}

router.post("/api/ai/chat", async (req: Request, res: Response) => {
  const { messages, pageContext, persona, memory } = req.body as {
    messages: unknown;
    pageContext?: unknown;
    persona?: string;
    memory?: unknown;
  };

  if (!validateMessages(messages)) {
    return res.status(400).json({
      error: `Invalid messages. Max ${MAX_MESSAGES} messages, each up to ${MAX_MESSAGE_LENGTH} chars.`,
    });
  }

  if (!validatePageContext(pageContext)) {
    return res.status(400).json({ error: "Invalid pageContext" });
  }

  const validPersonas = ["alex", "designer", "developer", "strategist"];
  const activePersona = (typeof persona === "string" && validPersonas.includes(persona) ? persona : "alex") as ChatOptions["persona"];

  const validMemory = validateMemory(memory) ? memory as any : undefined;

  const chatOptions: ChatOptions = {
    persona: activePersona,
    pageContext: pageContext as PageContext | undefined,
    memory: validMemory,
  };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const abortController = new AbortController();
  let closed = false;

  req.on("close", () => {
    closed = true;
    abortController.abort();
  });

  let fullText = "";
  const personaName = getPersonaName(activePersona);

  try {
    await streamChat(
      messages,
      (text) => {
        if (!closed) {
          fullText += text;
          res.write(`data: ${JSON.stringify({ type: "chunk", text })}\n\n`);
        }
      },
      () => {
        if (!closed) {
          const filtered = filterResponse(fullText);
          if (filtered !== fullText) {
            res.write(`data: ${JSON.stringify({ type: "replace", text: filtered })}\n\n`);
          }
          res.write(`data: ${JSON.stringify({ type: "done", persona: activePersona, personaName })}\n\n`);
          res.end();
        }
      },
      (error) => {
        if (!closed) {
          const lastUserMsg = messages.filter((m: ChatMessage) => m.role === "user").pop();
          const lastText = lastUserMsg?.parts?.find((p: ChatMessagePart) => p.text)?.text || "";
          const topic = detectFallbackTopic(lastText);
          const fallback = CONTEXTUAL_FALLBACKS[topic] || CONTEXTUAL_FALLBACKS.default;
          res.write(`data: ${JSON.stringify({ type: "chunk", text: fallback })}\n\n`);
          res.write(`data: ${JSON.stringify({ type: "done", persona: activePersona, personaName })}\n\n`);
          res.end();
          console.error("[AI Chat] Error, used fallback:", error.message, "topic:", topic);
        }
      },
      abortController.signal,
      chatOptions
    );
  } catch (error: any) {
    if (!closed) {
      const lastUserMsg = messages.filter((m: ChatMessage) => m.role === "user").pop();
      const lastText = lastUserMsg?.parts?.find((p: ChatMessagePart) => p.text)?.text || "";
      const topic = detectFallbackTopic(lastText);
      const fallback = CONTEXTUAL_FALLBACKS[topic] || CONTEXTUAL_FALLBACKS.default;
      res.write(`data: ${JSON.stringify({ type: "chunk", text: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: "done", persona: activePersona, personaName })}\n\n`);
      res.end();
      console.error("[AI Chat] Catch error, used fallback:", (error as Error).message, "topic:", topic);
    }
  }
});

router.post("/api/ai/tts", async (req: Request, res: Response) => {
  const { text, voiceId, modelId, emotion } = req.body as {
    text: string;
    voiceId?: string;
    modelId?: string;
    emotion?: string;
  };

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required" });
  }

  if (text.length > 5000) {
    return res
      .status(400)
      .json({ error: "Text too long. Maximum 5000 characters." });
  }

  try {
    const audioBuffer = await textToSpeech(text, voiceId, modelId);

    if (!audioBuffer) {
      return res.status(500).json({ error: "Failed to generate speech" });
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length.toString());
    res.send(audioBuffer);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to generate speech" });
  }
});

router.get("/api/ai/voices", async (_req: Request, res: Response) => {
  try {
    const voices = await getVoices();
    res.json({
      voices: voices.map((v) => ({
        voice_id: v.voice_id,
        name: v.name,
        category: v.category,
        labels: v.labels,
        preview_url: v.preview_url,
      })),
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch voices" });
  }
});

const FOLLOWUP_MESSAGES: Record<string, { text: string; button: string }> = {
  consideration: {
    text: "👋 Привет! Это Алекс из WEB4TG Studio.\n\nВы изучали наши решения — есть вопросы или сомнения? Я помогу разобраться и подберу оптимальный вариант для вашего бизнеса.\n\n💬 Продолжим разговор?",
    button: "💬 Продолжить диалог",
  },
  decision: {
    text: "🔥 Привет! Алекс из WEB4TG Studio.\n\nМы с вами почти определились с решением! Хотите обсудить детали — сроки, оплату или доработки? Готов ответить на любые вопросы.\n\n🚀 Давайте закроем все вопросы?",
    button: "🚀 Обсудить детали",
  },
};

const pendingFollowups = new Map<number, ReturnType<typeof setTimeout>>();
const FOLLOWUP_DELAY = 30 * 60 * 1000;

function extractTelegramId(req: Request): number | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;

  const initData = req.headers["x-telegram-init-data"] as string;
  if (!initData) {
    const bodyId = req.body?.telegramId;
    return typeof bodyId === "number" ? bodyId : null;
  }

  const validated = validateTelegramInitData(initData, botToken);
  if (validated?.user?.id) return validated.user.id;
  return null;
}

router.post("/api/ai/followup", async (req: Request, res: Response) => {
  const telegramId = extractTelegramId(req);
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId required" });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(503).json({ error: "Bot not configured" });
  }

  const { dealStage } = req.body as { dealStage?: string };
  const stage = dealStage || "consideration";
  if (!FOLLOWUP_MESSAGES[stage]) {
    return res.json({ scheduled: false, reason: "stage not eligible" });
  }

  if (pendingFollowups.has(telegramId)) {
    clearTimeout(pendingFollowups.get(telegramId)!);
  }

  const webAppUrl = process.env.WEBAPP_URL || (
    process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : `https://${process.env.REPLIT_DEV_DOMAIN}`
  );

  const timer = setTimeout(async () => {
    pendingFollowups.delete(telegramId);
    const msg = FOLLOWUP_MESSAGES[stage];
    if (!msg) return;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramId,
          text: msg.text,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[
              { text: msg.button, web_app: { url: webAppUrl || "" } },
            ]],
          },
        }),
      });

      const result = await response.json();
      if (result.ok) {
        console.log(`[AI Followup] Sent to ${telegramId}, stage: ${stage}`);
      } else {
        console.error(`[AI Followup] Telegram API error for ${telegramId}:`, result.description);
      }
    } catch (error) {
      console.error("[AI Followup] Failed:", error);
    }
  }, FOLLOWUP_DELAY);

  pendingFollowups.set(telegramId, timer);

  res.json({ scheduled: true, delay: FOLLOWUP_DELAY / 1000, stage });
});

router.post("/api/ai/followup/cancel", async (req: Request, res: Response) => {
  const telegramId = extractTelegramId(req);

  if (telegramId && pendingFollowups.has(telegramId)) {
    clearTimeout(pendingFollowups.get(telegramId)!);
    pendingFollowups.delete(telegramId);
    return res.json({ cancelled: true });
  }

  res.json({ cancelled: false });
});

router.get("/api/ai/personas", (_req: Request, res: Response) => {
  res.json({
    personas: [
      { id: "alex", name: "Алекс", role: "Консультант", color: "#34d399", emoji: "A" },
      { id: "designer", name: "Марина", role: "UI/UX дизайнер", color: "#a78bfa", emoji: "M" },
      { id: "developer", name: "Артём", role: "Разработчик", color: "#60a5fa", emoji: "D" },
      { id: "strategist", name: "Ольга", role: "Бизнес-стратег", color: "#f59e0b", emoji: "O" },
    ],
  });
});

export default router;
