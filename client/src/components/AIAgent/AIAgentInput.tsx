import { useState, useRef, useCallback, memo } from "react";
import { Send, Square, Mic, MicOff } from "lucide-react";

interface AIAgentInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export const AIAgentInput = memo(
  ({ onSend, onStop, isLoading, placeholder }: AIAgentInputProps) => {
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleSend = useCallback(() => {
      if (input.trim() && !isLoading) {
        onSend(input.trim());
        setInput("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "40px";
        }
      }
    }, [input, isLoading, onSend]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend]
    );

    const handleInput = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        const el = e.target;
        el.style.height = "40px";
        el.style.height = Math.min(el.scrollHeight, 120) + "px";
      },
      []
    );

    const toggleRecording = useCallback(async () => {
      if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          setIsRecording(false);
        };

        mediaRecorder.start();
        setIsRecording(true);

        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        }, 30000);
      } catch {
        setIsRecording(false);
      }
    }, [isRecording]);

    return (
      <div
        style={{
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10,10,12,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "8px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "22px",
            padding: "4px 4px 4px 16px",
            border: "1px solid rgba(255,255,255,0.08)",
            transition: "border-color 0.2s",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Message..."}
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "15px",
              lineHeight: "1.4",
              resize: "none",
              height: "40px",
              maxHeight: "120px",
              padding: "8px 0",
              fontFamily: "inherit",
            }}
          />

          <button
            type="button"
            onClick={toggleRecording}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              background: isRecording
                ? "rgba(239,68,68,0.2)"
                : "transparent",
              color: isRecording ? "#ef4444" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
            aria-label={isRecording ? "Stop recording" : "Voice input"}
          >
            {isRecording ? (
              <MicOff className="w-[18px] h-[18px]" />
            ) : (
              <Mic className="w-[18px] h-[18px]" />
            )}
          </button>

          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(239,68,68,0.15)",
                color: "#ef4444",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="Stop generation"
            >
              <Square className="w-4 h-4" fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                background: input.trim()
                  ? "linear-gradient(135deg, #34d399, #059669)"
                  : "rgba(255,255,255,0.06)",
                color: input.trim() ? "#fff" : "rgba(255,255,255,0.2)",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" style={{ marginLeft: "1px" }} />
            </button>
          )}
        </div>
      </div>
    );
  }
);
