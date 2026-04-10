import { Router, Request, Response } from "express";
import { streamChat, type ChatMessage } from "../lib/gemini";
import { textToSpeech, getVoices } from "../lib/elevenlabs";

const router = Router();

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;

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

  try {
    await streamChat(
      messages,
      (text) => {
        if (!closed) {
          res.write(`data: ${JSON.stringify({ type: "chunk", text })}\n\n`);
        }
      },
      () => {
        if (!closed) {
          res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
          res.end();
        }
      },
      (error) => {
        if (!closed) {
          res.write(
            `data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`
          );
          res.end();
        }
      },
      abortController.signal
    );
  } catch (error: any) {
    if (!closed) {
      res.write(
        `data: ${JSON.stringify({ type: "error", message: error.message || "Internal error" })}\n\n`
      );
      res.end();
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
