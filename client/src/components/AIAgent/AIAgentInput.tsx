import { useState, useRef, useCallback, useEffect, memo } from "react";
import { Send, Square, Mic, MicOff, Camera, Phone, PhoneOff } from "lucide-react";

interface AIAgentInputProps {
  onSend: (message: string, imageBase64?: string, imageMimeType?: string) => void;
  onStop: () => void;
  isLoading: boolean;
  placeholder?: string;
  voiceMode?: boolean;
  onToggleVoiceMode?: () => void;
}

export const AIAgentInput = memo(
  ({ onSend, onStop, isLoading, placeholder, voiceMode, onToggleVoiceMode }: AIAgentInputProps) => {
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = useCallback(() => {
      if ((input.trim() || imageData) && !isLoading) {
        onSend(input.trim(), imageData?.base64, imageData?.mimeType);
        setInput("");
        setPreviewImage(null);
        setImageData(null);
        if (textareaRef.current) textareaRef.current.style.height = "40px";
      }
    }, [input, isLoading, onSend, imageData]);

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

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        const mimeType = file.type || "image/jpeg";
        setPreviewImage(result);
        setImageData({ base64, mimeType });
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const clearImage = useCallback(() => {
      setPreviewImage(null);
      setImageData(null);
    }, []);

    const startSpeechRecognition = useCallback(() => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toggleRecording();
        return;
      }

      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "ru-RU";
      recognition.continuous = voiceMode;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInput(finalTranscript + interim);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (finalTranscript.trim()) {
          if (voiceMode) {
            onSend(finalTranscript.trim());
            setInput("");
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    }, [isListening, voiceMode, onSend]);

    const toggleRecording = useCallback(async () => {
      if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          if (mediaRecorder.state === "recording") mediaRecorder.stop();
        }, 30000);
      } catch {
        setIsRecording(false);
      }
    }, [isRecording]);

    useEffect(() => {
      return () => {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
          recognitionRef.current = null;
        }
        if (mediaRecorderRef.current?.state === "recording") {
          try { mediaRecorderRef.current.stop(); } catch {}
        }
      };
    }, []);

    const isActive = isRecording || isListening;

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
        {previewImage && (
          <div style={{ marginBottom: "8px", position: "relative", display: "inline-block" }}>
            <img src={previewImage} alt="" style={{
              maxHeight: "80px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
            }} />
            <button type="button" onClick={clearImage} style={{
              position: "absolute", top: "-6px", right: "-6px",
              width: "20px", height: "20px", borderRadius: "50%",
              background: "rgba(239,68,68,0.9)", border: "none",
              color: "#fff", fontSize: "12px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
        )}

        {voiceMode && (
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            marginBottom: "8px", padding: "6px 10px",
            background: "rgba(52,211,153,0.08)", borderRadius: "10px",
            border: "1px solid rgba(52,211,153,0.15)",
          }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: isListening ? "#34d399" : "rgba(52,211,153,0.4)",
              animation: isListening ? "ai-pulse 1s ease-in-out infinite" : "none",
            }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
              {isListening ? "Слушаю..." : "Голосовой режим активен — нажмите микрофон"}
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "6px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "22px",
            padding: "4px 4px 4px 14px",
            border: `1px solid ${isActive ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}`,
            transition: "border-color 0.2s",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "32px", height: "36px", borderRadius: "50%",
              border: "none", background: "transparent",
              color: "rgba(255,255,255,0.35)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "color 0.2s",
            }}
            aria-label="Attach image"
          >
            <Camera className="w-[17px] h-[17px]" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={voiceMode ? "Или напишите текстом..." : (placeholder || "Message...")}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", color: "#fff", fontSize: "15px",
              lineHeight: "1.4", resize: "none", height: "40px",
              maxHeight: "120px", padding: "8px 0", fontFamily: "inherit",
            }}
          />

          {onToggleVoiceMode && (
            <button
              type="button"
              onClick={onToggleVoiceMode}
              style={{
                width: "32px", height: "36px", borderRadius: "50%",
                border: "none",
                background: voiceMode ? "rgba(52,211,153,0.15)" : "transparent",
                color: voiceMode ? "#34d399" : "rgba(255,255,255,0.3)",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0, transition: "all 0.2s",
              }}
              aria-label={voiceMode ? "Disable voice mode" : "Enable voice mode"}
            >
              {voiceMode ? <PhoneOff className="w-[15px] h-[15px]" /> : <Phone className="w-[15px] h-[15px]" />}
            </button>
          )}

          <button
            type="button"
            onClick={startSpeechRecognition}
            style={{
              width: "36px", height: "36px", borderRadius: "50%",
              border: "none",
              background: isActive ? "rgba(239,68,68,0.2)" : "transparent",
              color: isActive ? "#ef4444" : "rgba(255,255,255,0.4)",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0, transition: "all 0.2s",
            }}
            aria-label={isActive ? "Stop recording" : "Voice input"}
          >
            {isActive ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
          </button>

          {isLoading ? (
            <button
              type="button" onClick={onStop}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "none", background: "rgba(239,68,68,0.15)",
                color: "#ef4444", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
              aria-label="Stop generation"
            >
              <Square className="w-4 h-4" fill="currentColor" />
            </button>
          ) : (
            <button
              type="button" onClick={handleSend}
              disabled={!input.trim() && !imageData}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "none",
                background: (input.trim() || imageData)
                  ? "linear-gradient(135deg, #34d399, #059669)"
                  : "rgba(255,255,255,0.06)",
                color: (input.trim() || imageData) ? "#fff" : "rgba(255,255,255,0.2)",
                cursor: (input.trim() || imageData) ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.2s",
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
