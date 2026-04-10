import { useState, useRef, useCallback, useEffect, memo } from "react";

interface AIAgentInputProps {
  onSend: (message: string, imageBase64?: string, imageMimeType?: string) => void;
  isLoading: boolean;
  placeholder?: string;
  voiceMode?: boolean;
  onToggleVoiceMode?: () => void;
}

const ArrowUpIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

const CameraIcon = ({ size = 17, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7.5 6.5H4a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 4 19.5h16a1.5 1.5 0 0 0 1.5-1.5V8a1.5 1.5 0 0 0-1.5-1.5h-3.5L14.5 4z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </svg>
);

const MicIcon = ({ size = 17, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 18v4M8 22h8" />
  </svg>
);

const WaveformIcon = ({ size = 17, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M4 12h0M8 8v8M12 5v14M16 8v8M20 12h0" />
  </svg>
);

const PhoneIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const AIAgentInput = memo(
  ({ onSend, isLoading, placeholder, voiceMode, onToggleVoiceMode }: AIAgentInputProps) => {
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
    const hasDraft = !!(input.trim() || imageData);

    return (
      <div style={{
        padding: "10px 16px",
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
        background: "rgba(28,28,30,0.6)",
        backdropFilter: "saturate(180%) blur(40px)",
        WebkitBackdropFilter: "saturate(180%) blur(40px)",
      }}>
        {previewImage && (
          <div style={{ marginBottom: "8px", position: "relative", display: "inline-block" }}>
            <img src={previewImage} alt="" style={{
              maxHeight: "72px", borderRadius: "12px",
              border: "0.5px solid rgba(255,255,255,0.12)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }} />
            <button type="button" onClick={clearImage} style={{
              position: "absolute", top: "-5px", right: "-5px",
              width: "18px", height: "18px", borderRadius: "9px",
              background: "rgba(120,120,128,0.6)", border: "none",
              color: "#fff", fontSize: "10px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 600, lineHeight: 1,
            }}>×</button>
          </div>
        )}

        {voiceMode && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginBottom: "8px", padding: "8px 12px",
            background: "rgba(52,211,153,0.06)", borderRadius: "12px",
            border: "0.5px solid rgba(52,211,153,0.12)",
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "3px",
              background: isListening ? "#34d399" : "rgba(52,211,153,0.4)",
              animation: isListening ? "ai-pulse 1s ease-in-out infinite" : "none",
              boxShadow: isListening ? "0 0 8px rgba(52,211,153,0.5)" : "none",
            }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "-0.01em" }}>
              {isListening ? "Слушаю..." : "Голосовой режим — нажмите микрофон"}
            </span>
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "flex-end", gap: "4px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "24px", padding: "4px 4px 4px 6px",
          border: `0.5px solid ${isActive ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
          transition: "border-color 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.15)",
        }}>
          <input
            ref={fileInputRef} type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect} style={{ display: "none" }}
          />

          <button type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "34px", height: "36px", borderRadius: "17px",
              border: "none", background: "transparent",
              color: "rgba(255,255,255,0.35)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "color 0.2s",
            }}
            aria-label="Attach image"
          >
            <CameraIcon />
          </button>

          <textarea
            ref={textareaRef} value={input}
            onChange={handleInput} onKeyDown={handleKeyDown}
            placeholder={voiceMode ? "Или напишите текстом..." : (placeholder || "Message...")}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", color: "#fff", fontSize: "15px",
              lineHeight: "1.45", resize: "none", height: "40px",
              maxHeight: "120px", padding: "8px 0", fontFamily: "inherit",
              letterSpacing: "-0.01em",
            }}
          />

          {onToggleVoiceMode && (
            <button type="button" onClick={onToggleVoiceMode}
              style={{
                width: "34px", height: "36px", borderRadius: "17px",
                border: "none",
                background: voiceMode ? "rgba(52,211,153,0.12)" : "transparent",
                color: voiceMode ? "#34d399" : "rgba(255,255,255,0.28)",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
                transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
              }}
              aria-label={voiceMode ? "Disable voice mode" : "Enable voice mode"}
            >
              <PhoneIcon />
            </button>
          )}

          <button type="button" onClick={startSpeechRecognition}
            style={{
              width: "34px", height: "36px", borderRadius: "17px",
              border: "none",
              background: isActive ? "rgba(52,211,153,0.12)" : "transparent",
              color: isActive ? "#34d399" : "rgba(255,255,255,0.35)",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
              transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
            aria-label={isActive ? "Stop recording" : "Voice input"}
          >
            {isActive ? <WaveformIcon /> : <MicIcon />}
          </button>

          <button type="button" onClick={handleSend} disabled={!hasDraft && !isLoading}
            style={{
              width: "34px", height: "34px", borderRadius: "17px",
              border: "none",
              background: hasDraft
                ? "linear-gradient(145deg, #34d399, #059669)"
                : "rgba(255,255,255,0.06)",
              color: hasDraft ? "#fff" : "rgba(255,255,255,0.15)",
              cursor: hasDraft ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
              boxShadow: hasDraft ? "0 2px 8px rgba(52,211,153,0.3)" : "none",
            }}
            aria-label="Send message"
          >
            <ArrowUpIcon size={15} />
          </button>
        </div>
      </div>
    );
  }
);
