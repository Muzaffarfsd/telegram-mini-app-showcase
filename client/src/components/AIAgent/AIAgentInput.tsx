import { useState, useRef, useCallback, useEffect, memo, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface AIAgentDraft {
  input: string;
  previewImage: string | null;
  imageData: { base64: string; mimeType: string } | null;
}

interface AIAgentInputProps {
  onSend: (message: string, imageBase64?: string, imageMimeType?: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  placeholder?: string;
  voiceMode?: boolean;
  onToggleVoiceMode?: () => void;
  speechLang?: string;
  draftRef: React.MutableRefObject<AIAgentDraft>;
  demoMode: boolean;
  replyDraft: { id: number; text: string } | null;
  onReplyApplied: () => void;
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
    <div ref={panelRef} className="ai-chat-emoji-picker" style={{
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
  ({ onSend, isLoading, onStop, placeholder, voiceMode, onToggleVoiceMode, speechLang, draftRef, demoMode, replyDraft, onReplyApplied }: AIAgentInputProps) => {
    const { language } = useLanguage();
    const ru = language === "ru";
    const [input, setInput] = useState(() => draftRef.current.input);
    const [isListening, setIsListening] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(() => draftRef.current.previewImage);
    const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(() => draftRef.current.imageData);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showTools, setShowTools] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      draftRef.current = { input, previewImage, imageData };
    }, [draftRef, input, previewImage, imageData]);

    useEffect(() => {
      if (!replyDraft) return;
      const quote = replyDraft.text.slice(0, 60) + (replyDraft.text.length > 60 ? "..." : "");
      setInput(previous => `> ${quote}\n\n${previous}`);
      textareaRef.current?.focus({ preventScroll: true });
      onReplyApplied();
    }, [replyDraft, onReplyApplied]);

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
      if (file.size > 4 * 1024 * 1024) {
        setNotice(ru ? "Изображение должно быть меньше 4 МБ." : "The image must be smaller than 4 MB.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setNotice(ru ? "Выберите изображение JPG, PNG или WebP." : "Choose a JPG, PNG or WebP image.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setNotice(null);

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        const mimeType = file.type || "image/jpeg";
        setPreviewImage(result);
        setImageData({ base64, mimeType });
      };
      reader.onerror = () => setNotice(ru ? "Не удалось открыть изображение. Попробуйте ещё раз." : "Couldn't open the image. Please try again.");
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, [ru]);

    const clearImage = useCallback(() => {
      setPreviewImage(null);
      setImageData(null);
    }, []);

    const insertEmoji = useCallback((emoji: string) => {
      setInput(prev => prev + emoji);
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
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
      if (demoMode) {
        setNotice(ru ? "Голосовой ввод появится после подключения консультанта." : "Voice input will be available after the consultant is connected.");
        return;
      }
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setNotice(ru ? "Голосовой ввод недоступен в этом браузере. Напишите сообщение." : "Voice input isn't available in this browser. Please type your message.");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setNotice(ru ? "Микрофон недоступен в этом браузере." : "The microphone isn't available in this browser.");
        return;
      }
      setNotice(null);

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
          setNotice(ru ? "Не удалось распознать речь. Проверьте доступ к микрофону." : "Couldn't recognize speech. Check microphone access.");
        };

        recognition.start();
        setIsListening(true);
      }).catch(() => setNotice(ru ? "Не удалось получить доступ к микрофону." : "Microphone access was not available."));
    }, [isListening, voiceMode, onSend, speechLang, cleanupAudioPipeline, setupAnalyser, ru, demoMode]);

    useEffect(() => {
      return () => {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
          recognitionRef.current = null;
        }
        cleanupAudioPipeline();
      };
    }, [cleanupAudioPipeline]);

    const isActive = isListening;
    const hasDraft = !!(input.trim() || imageData);

    const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    return (
      <div className="ai-chat-composer">
        {showEmoji && <EmojiPicker onSelect={emoji => { insertEmoji(emoji); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />}
        {showTools && <div className="ai-chat-tools" data-testid="ai-chat-tools">
          <button type="button" aria-label="Attach image" onClick={() => { setShowTools(false); fileInputRef.current?.click(); }}><CameraIcon size={19} />{ru ? "Добавить фото" : "Add image"}</button>
          <button type="button" aria-label="Emoji" onClick={() => { setShowTools(false); setShowEmoji(true); }}><SmileIcon size={19} />{ru ? "Эмодзи" : "Emoji"}</button>
          {onToggleVoiceMode && <button type="button" aria-label={voiceMode ? "Disable voice mode" : "Enable voice mode"} onClick={() => { onToggleVoiceMode(); setShowTools(false); }}><PhoneIcon size={19} />{voiceMode ? (ru ? "Выключить голосовой режим" : "Turn voice mode off") : (ru ? "Включить голосовой режим" : "Turn voice mode on")}</button>}
        </div>}
        {notice && <div className="ai-chat-notice" role="status"><span>{notice}</span><button type="button" aria-label={ru ? "Закрыть уведомление" : "Dismiss notice"} onClick={() => setNotice(null)}><X size={15} /></button></div>}
        {previewImage && <div className="ai-chat-image-preview"><img src={previewImage} alt={ru ? "Прикреплённое изображение" : "Attached image"} /><button type="button" onClick={clearImage} aria-label={ru ? "Удалить изображение" : "Remove image"}><X size={14} /></button></div>}
        {isActive && <div className="ai-chat-recording"><span className="ai-chat-recording-dot" /> <span>{ru ? "Распознаю речь" : "Listening"}</span><VoiceWaveform analyserRef={analyserRef} isActive={isActive} color="#756093" /><span>{formatTime(recordingTime)}</span></div>}
        {voiceMode && !isActive && <div className="ai-chat-voice-mode">{ru ? "Голосовой режим включён" : "Voice mode is on"}</div>}
        <div className="ai-chat-composer-field">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} style={{ display: "none" }} />
          <button type="button" className="ai-chat-compose-action" aria-label={ru ? "Вложения и возможности" : "Attachments and tools"} aria-expanded={showTools} onClick={() => { setShowEmoji(false); setShowTools(value => !value); }}><Plus size={21} /></button>
          <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown} aria-label={ru ? "Сообщение" : "Message"} placeholder={voiceMode ? (ru ? "Или напишите сообщение..." : "Or type a message...") : (placeholder || "Message...")} rows={1} />
          <button type="button" className="ai-chat-compose-action" disabled={isLoading} onClick={isActive ? () => { recognitionRef.current?.stop(); setIsListening(false); cleanupAudioPipeline(); } : startSpeechRecognition} aria-label={isActive ? "Stop recording" : "Voice input"}>{isActive ? <StopIcon size={15} /> : <MicIcon size={19} />}</button>
          {isLoading && onStop ? <button type="button" className="ai-chat-send is-stop" onClick={onStop} aria-label="Stop generation"><StopIcon size={14} /></button> :
            <button type="button" className="ai-chat-send" onClick={handleSend} disabled={!hasDraft} aria-label="Send message"><ArrowUpIcon size={18} /></button>}
        </div>
      </div>
    );
  }
);
