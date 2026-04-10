import { Router, Request, Response } from "express";
import { streamChat, filterResponse, type ChatMessage } from "../lib/gemini";
import { textToSpeech, getVoices } from "../lib/elevenlabs";

const router = Router();

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;

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

function validateMessages(messages: any): messages is ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  if (messages.length > MAX_MESSAGES) return false;
  return messages.every(
    (m: any) =>
      m &&
      (m.role === "user" || m.role === "model") &&
      Array.isArray(m.parts) &&
      m.parts.length > 0 &&
      m.parts.every(
        (p: any) =>
          p && typeof p.text === "string" && p.text.length <= MAX_MESSAGE_LENGTH
      )
  );
}

router.post("/api/ai/chat", async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: unknown };

  if (!validateMessages(messages)) {
    return res.status(400).json({
      error: `Invalid messages. Max ${MAX_MESSAGES} messages, each up to ${MAX_MESSAGE_LENGTH} chars.`,
    });
  }

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
          res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
          res.end();
        }
      },
      (error) => {
        if (!closed) {
          const lastUserMsg = messages.filter((m: ChatMessage) => m.role === "user").pop();
          const lastText = lastUserMsg?.parts?.[0]?.text || "";
          const topic = detectFallbackTopic(lastText);
          const fallback = CONTEXTUAL_FALLBACKS[topic] || CONTEXTUAL_FALLBACKS.default;
          res.write(`data: ${JSON.stringify({ type: "chunk", text: fallback })}\n\n`);
          res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
          res.end();
          console.error("[AI Chat] Error, used fallback:", error.message, "topic:", topic);
        }
      },
      abortController.signal
    );
  } catch (error: any) {
    if (!closed) {
      const lastUserMsg = messages.filter((m: ChatMessage) => m.role === "user").pop();
      const lastText = lastUserMsg?.parts?.[0]?.text || "";
      const topic = detectFallbackTopic(lastText);
      const fallback = CONTEXTUAL_FALLBACKS[topic] || CONTEXTUAL_FALLBACKS.default;
      res.write(`data: ${JSON.stringify({ type: "chunk", text: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
      console.error("[AI Chat] Catch error, used fallback:", (error as Error).message, "topic:", topic);
    }
  }
});

router.post("/api/ai/tts", async (req: Request, res: Response) => {
  const { text, voiceId, modelId } = req.body as {
    text: string;
    voiceId?: string;
    modelId?: string;
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

export default router;
