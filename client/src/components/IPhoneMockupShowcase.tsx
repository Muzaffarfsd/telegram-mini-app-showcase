import { useState, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import { useLanguage } from "../contexts/LanguageContext";

const apps = [
  {
    id: "radiance",
    nameRu: "Radiance",
    nameEn: "Radiance",
    categoryRu: "Премиальный fashion магазин",
    categoryEn: "Premium fashion store",
    accent: "#10b981",
    demoId: "clothing-store",
    screen: () => (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #0a0a0a 0%, #111827 60%, #064e3b 100%)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#10b981", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>RADIANCE</span>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.25)" }} />
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.25)" }} />
            </div>
          </div>
        </div>
        <div style={{ position: "relative", height: "145px", overflow: "hidden", flexShrink: 0 }}>
          <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=320&h=200&fit=crop&q=75" alt="Radiance" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, #0a0a0a)" }} />
          <div style={{ position: "absolute", bottom: 10, left: 12 }}>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase" }}>New Collection</div>
            <div style={{ color: "#fff", fontSize: "13px", fontWeight: 700, letterSpacing: "-0.01em" }}>Digital Fashion</div>
            <div style={{ marginTop: 5, display: "inline-flex", alignItems: "center", background: "#10b981", borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ color: "#fff", fontSize: "9px", fontWeight: 600 }}>Смотреть →</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "8px 12px", flex: 1 }}>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 7 }}>Рекомендации</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { name: "Silk Blouse", price: "8 990 ₽", img: "photo-1594938298603-c8148c4b984d" },
              { name: "Maxi Dress", price: "12 490 ₽", img: "photo-1515886657613-9f3515b0c78f" },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img src={`https://images.unsplash.com/${item.img}?w=120&h=80&fit=crop&q=65`} alt={item.name} style={{ width: "100%", height: 58, objectFit: "cover" }} />
                <div style={{ padding: "4px 7px" }}>
                  <div style={{ color: "#fff", fontSize: "9px", fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: "#10b981", fontSize: "9px", fontWeight: 700 }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "7px 0 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {["🏠", "🔍", "❤️", "👤"].map((icon, i) => (
            <span key={i} style={{ fontSize: 13, opacity: i === 0 ? 1 : 0.35 }}>{icon}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "techmart",
    nameRu: "Techmart",
    nameEn: "Techmart",
    categoryRu: "Электроника и гаджеты",
    categoryEn: "Electronics & gadgets",
    accent: "#06b6d4",
    demoId: "electronics",
    screen: () => (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0c4a6e 100%)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#06b6d4", fontSize: "13px", fontWeight: 800, letterSpacing: "0.06em" }}>TECHMART</span>
            <div style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 20, padding: "3px 8px" }}>
              <span style={{ color: "#06b6d4", fontSize: "9px" }}>🛒 2</span>
            </div>
          </div>
        </div>
        <div style={{ margin: "8px 12px", borderRadius: 10, overflow: "hidden", position: "relative", height: 115, flexShrink: 0 }}>
          <img src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=320&h=150&fit=crop&q=75" alt="Techmart" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15,23,42,0.88) 0%, transparent 55%)" }} />
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
            <div style={{ color: "#06b6d4", fontSize: "8px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>🔥 Хит</div>
            <div style={{ color: "#fff", fontSize: "11px", fontWeight: 700 }}>iPhone 17 Pro</div>
            <div style={{ color: "#94a3b8", fontSize: "9px" }}>от 129 990 ₽</div>
            <div style={{ marginTop: 5, background: "#06b6d4", borderRadius: 20, padding: "3px 10px", display: "inline-block" }}>
              <span style={{ color: "#fff", fontSize: "9px", fontWeight: 600 }}>Купить</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "0 12px 6px" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {["Смартфоны", "Ноутбуки", "Аудио"].map((cat, i) => (
              <div key={i} style={{ flexShrink: 0, borderRadius: 20, padding: "4px 10px", background: i === 0 ? "#06b6d4" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: i === 0 ? "#000" : "rgba(255,255,255,0.5)", fontSize: "8px", fontWeight: 600 }}>{cat}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 12px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { name: "AirPods Pro", price: "24 990 ₽", img: "photo-1606741965509-717c1a3b1e67" },
              { name: "MacBook Air", price: "129 990 ₽", img: "photo-1517336714731-489689fd1ca8" },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img src={`https://images.unsplash.com/${item.img}?w=120&h=80&fit=crop&q=65`} alt={item.name} style={{ width: "100%", height: 52, objectFit: "cover" }} />
                <div style={{ padding: "4px 7px" }}>
                  <div style={{ color: "#fff", fontSize: "9px", fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: "#06b6d4", fontSize: "9px", fontWeight: 700 }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "7px 0 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {["🏠", "🔍", "🛒", "👤"].map((icon, i) => (
            <span key={i} style={{ fontSize: 13, opacity: i === 0 ? 1 : 0.35 }}>{icon}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "floralart",
    nameRu: "FloralArt",
    nameEn: "FloralArt",
    categoryRu: "Цветы и букеты",
    categoryEn: "Flowers & bouquets",
    accent: "#f472b6",
    demoId: "florist",
    screen: () => (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #fdf2f8 0%, #fff8fc 100%)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(244,114,182,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#be185d", fontSize: "13px", fontWeight: 800, fontFamily: "Georgia, serif", fontStyle: "italic" }}>FloralArt</span>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid rgba(190,24,93,0.25)" }} />
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid rgba(190,24,93,0.25)" }} />
            </div>
          </div>
        </div>
        <div style={{ position: "relative", height: 145, overflow: "hidden", flexShrink: 0 }}>
          <img src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=320&h=200&fit=crop&q=75" alt="FloralArt" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 25%, rgba(253,242,248,0.95))" }} />
          <div style={{ position: "absolute", bottom: 9, left: 12 }}>
            <div style={{ color: "#be185d", fontSize: "8px", fontWeight: 600, letterSpacing: "0.08em" }}>Весенняя коллекция</div>
            <div style={{ color: "#1f2937", fontSize: "12px", fontWeight: 700, fontFamily: "Georgia, serif" }}>Пионовые букеты</div>
            <div style={{ marginTop: 5, background: "#be185d", borderRadius: 20, padding: "3px 10px", display: "inline-block" }}>
              <span style={{ color: "#fff", fontSize: "9px", fontWeight: 600 }}>Заказать →</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "6px 12px" }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["Все", "День рождения", "8 Марта"].map((tag, i) => (
              <div key={i} style={{ flexShrink: 0, borderRadius: 20, padding: "3px 9px", background: i === 0 ? "#be185d" : "rgba(190,24,93,0.07)", border: "1px solid rgba(190,24,93,0.12)" }}>
                <span style={{ color: i === 0 ? "#fff" : "#be185d", fontSize: "8px", fontWeight: 600 }}>{tag}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 12px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { name: "Розы 51 шт", price: "6 490 ₽", img: "photo-1462275646964-a0e3386b89fa" },
              { name: "Белые пионы", price: "4 990 ₽", img: "photo-1490750967868-88df5691cc93" },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 8, overflow: "hidden", background: "#fff", border: "1px solid rgba(190,24,93,0.1)", boxShadow: "0 2px 6px rgba(190,24,93,0.05)" }}>
                <img src={`https://images.unsplash.com/${item.img}?w=120&h=80&fit=crop&q=65`} alt={item.name} style={{ width: "100%", height: 52, objectFit: "cover" }} />
                <div style={{ padding: "4px 7px" }}>
                  <div style={{ color: "#1f2937", fontSize: "9px", fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: "#be185d", fontSize: "9px", fontWeight: 700 }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "7px 0 12px", borderTop: "1px solid rgba(190,24,93,0.08)" }}>
          {["🌸", "🔍", "🛒", "👤"].map((icon, i) => (
            <span key={i} style={{ fontSize: 13, opacity: i === 0 ? 1 : 0.35 }}>{icon}</span>
          ))}
        </div>
      </div>
    ),
  },
];

function IPhoneFrame({ children, accentColor, isCenter }: { children: React.ReactNode; accentColor: string; isCenter: boolean }) {
  const W = 195;
  const H = 415;
  const radius = 36;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        borderRadius: radius,
        background: "linear-gradient(145deg, #2c2c30 0%, #1c1c1e 40%, #0f0f11 100%)",
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.12),
          0 0 0 2px rgba(0,0,0,0.9),
          0 ${isCenter ? 50 : 35}px ${isCenter ? 90 : 65}px rgba(0,0,0,0.75),
          0 0 40px ${accentColor}18,
          inset 0 1px 0 rgba(255,255,255,0.14)
        `,
        flexShrink: 0,
      }}
    >
      {/* Left buttons */}
      <div style={{ position: "absolute", left: -2.5, top: 80, width: 2.5, height: 18, borderRadius: "2px 0 0 2px", background: "linear-gradient(to bottom, #2c2c30, #1c1c1e)" }} />
      <div style={{ position: "absolute", left: -2.5, top: 108, width: 2.5, height: 28, borderRadius: "2px 0 0 2px", background: "linear-gradient(to bottom, #2c2c30, #1c1c1e)" }} />
      <div style={{ position: "absolute", left: -2.5, top: 145, width: 2.5, height: 28, borderRadius: "2px 0 0 2px", background: "linear-gradient(to bottom, #2c2c30, #1c1c1e)" }} />
      {/* Right buttons */}
      <div style={{ position: "absolute", right: -2.5, top: 100, width: 2.5, height: 46, borderRadius: "0 2px 2px 0", background: "linear-gradient(to bottom, #2c2c30, #1c1c1e)" }} />
      <div style={{ position: "absolute", right: -2.5, top: 160, width: 2.5, height: 52, borderRadius: "0 2px 2px 0", background: "linear-gradient(to bottom, #2c2c30, #1c1c1e)" }} />

      {/* Screen bezel */}
      <div style={{ position: "absolute", inset: 5, borderRadius: radius - 5, background: "#000", overflow: "hidden" }}>
        {/* Dynamic Island */}
        <div style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 80,
          height: 24,
          borderRadius: 15,
          background: "#000",
          zIndex: 10,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1c1c1c" }} />
        </div>

        {/* Status bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 42, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 18px 6px", zIndex: 9 }}>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 9, fontWeight: 600, fontFamily: "-apple-system, sans-serif" }}>9:41</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 1 }}>
              {[3, 4, 5, 5].map((h, i) => (
                <div key={i} style={{ width: 2.5, height: h, borderRadius: 1, background: i < 3 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }} />
              ))}
            </div>
            <div style={{ width: 18, height: 9, borderRadius: 2.5, border: "1.5px solid rgba(255,255,255,0.45)", position: "relative" }}>
              <div style={{ position: "absolute", inset: "1.5px", borderRadius: 1, background: "rgba(255,255,255,0.8)", width: "75%" }} />
            </div>
          </div>
        </div>

        {/* App content */}
        <div style={{ position: "absolute", inset: 0, paddingTop: 42, overflow: "hidden" }}>
          {children}
        </div>

        {/* Home indicator */}
        <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 88, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.3)", zIndex: 10 }} />
      </div>

      {/* Frame shine */}
      <div style={{ position: "absolute", inset: 0, borderRadius: radius, background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%)", pointerEvents: "none" }} />
    </div>
  );
}

interface IPhoneMockupShowcaseProps {
  onOpenDemo: (demoId: string) => void;
}

export default function IPhoneMockupShowcase({ onOpenDemo }: IPhoneMockupShowcaseProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const handleOpen = useCallback((demoId: string) => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
      }
    } catch (_) {}
    onOpenDemo(demoId);
  }, [onOpenDemo]);

  return (
    <section className="pb-10 pt-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="mb-3 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest"
          style={{
            background: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.08)",
            border: isDark ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(16,185,129,0.2)",
            color: isDark ? "#34d399" : "#059669",
          }}
        >
          {language === "ru" ? "Демо-приложения" : "Demo apps"}
        </div>
        <h2
          style={{
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            textAlign: "center",
            background: isDark
              ? "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)"
              : "linear-gradient(180deg, #1d1d1f 0%, #3a3a3c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          }}
        >
          {language === "ru" ? "Посмотрите как это работает" : "See how it works"}
        </h2>
        <p
          className="mt-2 text-center"
          style={{
            fontSize: "14px",
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(29,29,31,0.5)",
            fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            maxWidth: 280,
          }}
        >
          {language === "ru"
            ? "Нажмите на телефон чтобы запустить демо"
            : "Tap the phone to launch the demo"}
        </p>
      </div>

      {/* iPhones row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 4,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {apps.map((app, i) => {
          const isCenter = i === 1;
          const Screen = app.screen;
          return (
            <div
              key={app.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                flexShrink: 0,
                cursor: "pointer",
                transform: isCenter ? "translateY(-20px)" : "translateY(0)",
                transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              onClick={() => handleOpen(app.demoId)}
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
            >
              <div
                style={{
                  transform: hoveredApp === app.id ? "scale(1.04) translateY(-6px)" : "scale(1)",
                  transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <IPhoneFrame accentColor={app.accent} isCenter={isCenter}>
                  <Screen />
                </IPhoneFrame>
              </div>

              {/* Label */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    borderRadius: 30,
                    padding: "5px 14px",
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    border: `1px solid ${app.accent}30`,
                    marginBottom: 4,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: app.accent, flexShrink: 0 }} />
                  <span style={{ color: isDark ? "#fff" : "#1d1d1f", fontSize: 13, fontWeight: 700, fontFamily: "-apple-system, sans-serif" }}>
                    {language === "ru" ? app.nameRu : app.nameEn}
                  </span>
                </div>
                <div style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(29,29,31,0.4)", fontSize: 11, fontFamily: "-apple-system, sans-serif" }}>
                  {language === "ru" ? app.categoryRu : app.categoryEn}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
