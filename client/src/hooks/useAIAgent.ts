import { useState, useCallback, useRef, useEffect } from "react";
import { navigate } from "./useRouting";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function useAIAgent() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

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
      if (abortRef.current) {
        abortRef.current.abort();
      }
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const processActions = useCallback((text: string) => {
    const actionRegex = /```action\s*\n([\s\S]*?)\n```/g;
    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      try {
        const action = JSON.parse(match[1]);
        if (action.type === "navigate" && action.path) {
          setTimeout(() => {
            navigate(action.path);
          }, 500);
        }
      } catch {}
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);

      const allMessages = [
        ...messages,
        userMessage,
      ].map((msg) => ({
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: msg.content }],
      }));

      abortRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

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
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      content: fullText,
                    };
                    return updated;
                  });
                } else if (data.type === "done") {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      isStreaming: false,
                    };
                    return updated;
                  });
                } else if (data.type === "error") {
                  fullText = `Error: ${data.message}`;
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      content: fullText,
                      isStreaming: false,
                    };
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
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: "Sorry, an error occurred. Please try again.",
              isStreaming: false,
            };
            return updated;
          });
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, processActions]
  );

  const speakText = useCallback(async (text: string) => {
    if (isSpeaking) {
      cleanupAudio();
      return;
    }

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .trim();

    if (!cleanText) return;

    setIsSpeaking(true);

    try {
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText.slice(0, 5000),
        }),
      });

      if (!response.ok) throw new Error("TTS failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        cleanupAudio();
      };

      audio.onerror = () => {
        cleanupAudio();
      };

      await audio.play();
    } catch {
      cleanupAudio();
    }
  }, [isSpeaking, cleanupAudio]);

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

  const clearHistory = useCallback(() => {
    setMessages([]);
    cleanupAudio();
  }, [cleanupAudio]);

  return {
    messages,
    isLoading,
    isSpeaking,
    sendMessage,
    speakText,
    stopGeneration,
    clearHistory,
  };
}
