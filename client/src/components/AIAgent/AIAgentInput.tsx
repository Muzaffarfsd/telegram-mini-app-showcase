import { useState, useRef, useCallback, useEffect, memo, useMemo } from "react";

interface AIAgentInputProps {
  onSend: (message: string, imageBase64?: string, imageMimeType?: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  placeholder?: string;
  voiceMode?: boolean;
  onToggleVoiceMode?: () => void;
  speechLang?: string;
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

const PhoneIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const StopIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const EMOJI_CATEGORIES = [
  { key: "recent", label: "🕐", emojis: [] as string[] },
  { key: "smileys", label: "😀", emojis: [
    "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","☹️","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"
  ]},
  { key: "gestures", label: "👋", emojis: [
    "👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄","🫦","👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴","👵"
  ]},
  { key: "hearts", label: "❤️", emojis: [
    "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️","🫶","😍","🥰","😘","😻","💑","👩‍❤️‍👨","👨‍❤️‍👨","👩‍❤️‍👩","💏","💋","🌹","🥀","💐","🌸","🌺","💍","💎"
  ]},
  { key: "animals", label: "🐶", emojis: [
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪲","🪳","🦟","🦗","🕷️","🦂","🐢","🐍","🦎","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔"
  ]},
  { key: "food", label: "🍕", emojis: [
    "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🥛","🍼","🫖","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾","🫗","🧊"
  ]},
  { key: "travel", label: "🚗", emojis: [
    "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️","🛵","🚲","🛴","🛹","🛼","🚁","🛸","✈️","🛩️","🚀","🛶","⛵","🚤","🛥️","🛳️","⛴️","🚢","🗼","🗽","🗿","🏰","🏯","🏟️","🎡","🎢","🎠","⛲","⛱️","🏖️","🏝️","🏜️","🌋","⛰️","🏔️","🗻","🏕️","🛖","🏠","🏡","🏘️","🏚️","🏗️","🏭","🏢","🏬","🏣","🏤","🏥","🏦","🏨","🏪","🏫","🏩","💒","🏛️","⛪","🕌","🕍","🛕","🕋","⛩️","🛤️","🛣️","🗺️","🌍","🌎","🌏","🌐","🧭"
  ]},
  { key: "objects", label: "💡", emojis: [
    "⌚","📱","📲","💻","⌨️","🖥️","🖨️","🖱️","🖲️","💾","💿","📀","📼","📷","📸","📹","🎥","📽️","🎬","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏲️","⏰","🕰️","⌛","📡","🔋","🔌","💡","🔦","🕯️","🧯","🛢️","💸","💵","💴","💶","💷","🪙","💰","💳","💎","⚖️","🪜","🧰","🪛","🔧","🔨","⚒️","🛠️","⛏️","🪚","🔩","⚙️","🪤","🧲","🔫","💣","🧨","🪓","🔪","🗡️","⚔️","🛡️","🚬","⚰️","🪦","⚱️","🏺","🔮","📿","🧿","🪬","💈","⚗️","🔭","🔬","🕳️","🩹","🩺","🩻","🩼","💊","💉","🩸","🧬","🦠","🧫","🧪","🌡️","🧹","🪠","🧺","🧻","🧼","🫧","🪥","🧽","🧴","🛎️","🔑","🗝️","🚪","🪑","🛋️","🛏️","🛌","🧸","🪆","🖼️","🪞","🪟","🛍️","🛒","🎁","🎈","🎏","🎀","🪄","🪅","🎊","🎉","🎎","🏮","🎐","🧧","✉️","📩","📨","📧","💌","📥","📤","📦","🏷️","🪧","📪","📫","📬","📭","📮","📯","📜","📃","📄","📑","🧾","📊","📈","📉","🗒️","🗓️","📆","📅","🗑️","📇","🗃️","🗳️","🗄️","📋","📁","📂","🗂️","🗞️","📰","📓","📔","📒","📕","📗","📘","📙","📚","📖","🔖","🧷","🔗","📎","🖇️","📐","📏","🧮","📌","📍","✂️","🖊️","🖋️","✒️","🖌️","🖍️","📝","✏️","🔍","🔎","🔏","🔐","🔒","🔓"
  ]},
  { key: "symbols", label: "⭐", emojis: [
    "⭐","🌟","✨","⚡","🔥","💥","☄️","🌈","☀️","🌤️","⛅","🌥️","🌦️","🌧️","⛈️","🌩️","🌪️","❄️","☃️","⛄","🌬️","💨","🌊","💧","💦","☔","🎯","🏆","🥇","🥈","🥉","🏅","🎖️","🏵️","🎗️","⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🎪","🎭","🎨","🎼","🎵","🎶","🎹","🥁","🪘","🎷","🎺","🪗","🎸","🪕","🎻","🎲","♟️","🎯","🎳","🎮","🕹️","🎰","✅","❌","❓","❗","‼️","⁉️","💯","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔶","🔷","🔸","🔹","▪️","▫️","◼️","◻️","◾","◽","🔲","🔳","⬛","⬜","♠️","♣️","♥️","♦️","🃏","🀄","🎴","🔇","🔈","🔉","🔊","📢","📣","🔔","🔕","🎵","🎶","🏧","🚮","🚰","♿","🚹","🚺","🚻","🚼","🚾","🛂","🛃","🛄","🛅","⚠️","🚸","⛔","🚫","🚳","🚭","🚯","🚱","🚷","📵","🔞","☢️","☣️","⬆️","↗️","➡️","↘️","⬇️","↙️","⬅️","↖️","↕️","↔️","↩️","↪️","⤴️","⤵️","🔃","🔄","🔙","🔚","🔛","🔜","🔝"
  ]},
];

const RECENT_EMOJI_KEY = "web4tg_recent_emoji";
const MAX_RECENT = 32;

function getRecentEmoji(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_EMOJI_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
function addRecentEmoji(emoji: string) {
  const recent = getRecentEmoji().filter(e => e !== emoji);
  recent.unshift(emoji);
  localStorage.setItem(RECENT_EMOJI_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

const SmileIcon = ({ size = 17, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [searchQuery, setSearchQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const recentEmojis = useMemo(() => getRecentEmoji(), []);
  const categoriesWithRecent = useMemo(() => {
    const cats = [...EMOJI_CATEGORIES];
    cats[0] = { ...cats[0], emojis: recentEmojis };
    return cats;
  }, [recentEmojis]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleEmojiClick = useCallback((emoji: string) => {
    addRecentEmoji(emoji);
    onSelect(emoji);
  }, [onSelect]);

  const currentEmojis = useMemo(() => {
    const cat = categoriesWithRecent.find(c => c.key === activeCategory);
    return cat?.emojis || [];
  }, [activeCategory, categoriesWithRecent]);

  return (
    <div ref={panelRef} style={{
      position: "absolute", bottom: "100%", left: 0, right: 0,
      marginBottom: "4px", background: "rgba(28,28,30,0.96)",
      backdropFilter: "saturate(180%) blur(40px)",
      WebkitBackdropFilter: "saturate(180%) blur(40px)",
      borderRadius: "16px 16px 0 0",
      border: "0.5px solid rgba(255,255,255,0.12)",
      boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
      zIndex: 10, overflow: "hidden",
    }}>
      <div style={{
        display: "flex", gap: "2px", padding: "8px 8px 4px",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {categoriesWithRecent.map(cat => (
          cat.key === "recent" && cat.emojis.length === 0 ? null :
          <button key={cat.key} type="button"
            onClick={() => setActiveCategory(cat.key)}
            style={{
              width: "32px", height: "32px", borderRadius: "8px",
              border: "none", cursor: "pointer", fontSize: "16px",
              background: activeCategory === cat.key ? "rgba(52,211,153,0.15)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.15s",
            }}
          >{cat.label}</button>
        ))}
      </div>
      <div style={{
        height: "200px", overflowY: "auto", overflowX: "hidden",
        padding: "8px", scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}>
        {activeCategory === "recent" && currentEmojis.length === 0 ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", color: "rgba(255,255,255,0.25)", fontSize: "13px",
          }}>Недавние эмодзи появятся здесь</div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "2px",
          }}>
            {currentEmojis.map((emoji, i) => (
              <button key={`${emoji}-${i}`} type="button"
                onClick={() => handleEmojiClick(emoji)}
                style={{
                  width: "100%", aspectRatio: "1", border: "none",
                  background: "transparent", borderRadius: "8px",
                  cursor: "pointer", fontSize: "22px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >{emoji}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const BAR_COUNT = 24;

function VoiceWaveform({ analyserRef, isActive, color }: {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isActive: boolean;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const barWidth = Math.max(2, (w / BAR_COUNT) - 1.5);
    const gap = (w - barWidth * BAR_COUNT) / (BAR_COUNT - 1);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const analyser = analyserRef.current;

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const step = Math.floor(bufferLength / BAR_COUNT);
        for (let i = 0; i < BAR_COUNT; i++) {
          const val = dataArray[i * step] / 255;
          const barH = Math.max(2, val * h * 0.85);
          const x = i * (barWidth + gap);
          const y = (h - barH) / 2;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, 1);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.4 + val * 0.6;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      } else {
        for (let i = 0; i < BAR_COUNT; i++) {
          const t = Date.now() / 400 + i * 0.3;
          const val = 0.15 + Math.sin(t) * 0.1;
          const barH = Math.max(2, val * h);
          const x = i * (barWidth + gap);
          const y = (h - barH) / 2;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, 1);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.3;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%", height: "32px",
        display: "block",
      }}
    />
  );
}

export const AIAgentInput = memo(
  ({ onSend, isLoading, onStop, placeholder, voiceMode, onToggleVoiceMode, speechLang }: AIAgentInputProps) => {
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showEmoji, setShowEmoji] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const insertEmoji = useCallback((emoji: string) => {
      setInput(prev => prev + emoji);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, []);

    const cleanupAudioPipeline = useCallback(() => {
      analyserRef.current = null;
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
      audioCtxRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }, []);

    const setupAnalyser = useCallback((stream: MediaStream) => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.7;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch {}
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
        cleanupAudioPipeline();
        return;
      }

      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        streamRef.current = stream;
        setupAnalyser(stream);

        const recognition = new SpeechRecognition();
        recognition.lang = speechLang || "ru-RU";
        recognition.continuous = voiceMode;
        recognition.interimResults = true;
        recognitionRef.current = recognition;

        let finalTranscript = "";
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);

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
          cleanupAudioPipeline();
          if (finalTranscript.trim()) {
            if (voiceMode) {
              onSend(finalTranscript.trim());
              setInput("");
            }
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          cleanupAudioPipeline();
        };

        recognition.start();
        setIsListening(true);
      }).catch(() => {});
    }, [isListening, voiceMode, onSend, speechLang, cleanupAudioPipeline, setupAnalyser]);

    const toggleRecording = useCallback(async () => {
      if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        cleanupAudioPipeline();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setupAnalyser(stream);

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          cleanupAudioPipeline();
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
    }, [isRecording, cleanupAudioPipeline, setupAnalyser]);

    useEffect(() => {
      return () => {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
          recognitionRef.current = null;
        }
        if (mediaRecorderRef.current?.state === "recording") {
          try { mediaRecorderRef.current.stop(); } catch {}
        }
        cleanupAudioPipeline();
      };
    }, [cleanupAudioPipeline]);

    const isActive = isRecording || isListening;
    const hasDraft = !!(input.trim() || imageData);

    const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    return (
      <div style={{
        padding: "10px 16px",
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
        background: "rgba(28,28,30,0.6)",
        backdropFilter: "saturate(180%) blur(40px)",
        WebkitBackdropFilter: "saturate(180%) blur(40px)",
        position: "relative",
      }}>
        {showEmoji && (
          <EmojiPicker
            onSelect={insertEmoji}
            onClose={() => setShowEmoji(false)}
          />
        )}
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

        {isActive && (
          <div style={{
            marginBottom: "8px", padding: "10px 14px",
            background: "rgba(52,211,153,0.06)", borderRadius: "16px",
            border: "0.5px solid rgba(52,211,153,0.15)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "6px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "4px",
                  background: "#ef4444",
                  animation: "ai-pulse 1s ease-in-out infinite",
                  boxShadow: "0 0 8px rgba(239,68,68,0.5)",
                }} />
                <span style={{
                  fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.6)",
                  letterSpacing: "-0.01em",
                }}>
                  {isListening ? "Распознаю речь" : "Запись"}
                </span>
              </div>
              <span style={{
                fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {formatTime(recordingTime)}
              </span>
            </div>
            <VoiceWaveform
              analyserRef={analyserRef}
              isActive={isActive}
              color="#34d399"
            />
          </div>
        )}

        {voiceMode && !isActive && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginBottom: "8px", padding: "8px 12px",
            background: "rgba(52,211,153,0.06)", borderRadius: "12px",
            border: "0.5px solid rgba(52,211,153,0.12)",
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "3px",
              background: "rgba(52,211,153,0.4)",
            }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "-0.01em" }}>
              Голосовой режим — нажмите микрофон
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

          <button type="button"
            onClick={() => setShowEmoji(prev => !prev)}
            style={{
              width: "34px", height: "36px", borderRadius: "17px",
              border: "none",
              background: showEmoji ? "rgba(52,211,153,0.12)" : "transparent",
              color: showEmoji ? "#34d399" : "rgba(255,255,255,0.35)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s",
            }}
            aria-label="Emoji"
          >
            <SmileIcon />
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

          <button type="button"
            onClick={isActive ? () => { recognitionRef.current?.stop(); if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop(); setIsListening(false); setIsRecording(false); cleanupAudioPipeline(); } : startSpeechRecognition}
            style={{
              width: "34px", height: "36px", borderRadius: "17px",
              border: "none",
              background: isActive ? "rgba(239,68,68,0.15)" : "transparent",
              color: isActive ? "#ef4444" : "rgba(255,255,255,0.35)",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
              transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
            aria-label={isActive ? "Stop recording" : "Voice input"}
          >
            {isActive ? <StopIcon /> : <MicIcon />}
          </button>

          {isLoading && onStop ? (
            <button type="button" onClick={onStop}
              style={{
                width: "34px", height: "34px", borderRadius: "17px",
                border: "none",
                background: "rgba(239,68,68,0.15)",
                color: "#ef4444",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                boxShadow: "0 2px 8px rgba(239,68,68,0.2)",
              }}
              aria-label="Stop generation"
            >
              <StopIcon size={13} />
            </button>
          ) : (
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
          )}
        </div>
      </div>
    );
  }
);
