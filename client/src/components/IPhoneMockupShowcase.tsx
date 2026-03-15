import { useState } from "react";
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
    route: "/#/demos/clothing-store/app",
  },
  {
    id: "techmart",
    nameRu: "Techmart",
    nameEn: "Techmart",
    categoryRu: "Электроника и гаджеты",
    categoryEn: "Electronics & gadgets",
    accent: "#06b6d4",
    demoId: "electronics",
    route: "/#/demos/electronics/app",
  },
  {
    id: "floralart",
    nameRu: "FloralArt",
    nameEn: "FloralArt",
    categoryRu: "Цветы и букеты",
    categoryEn: "Flowers & bouquets",
    accent: "#f472b6",
    demoId: "florist",
    route: "/#/demos/florist/app",
  },
];

function IPhoneFrame({
  children,
  accentColor,
  isCenter,
}: {
  children: React.ReactNode;
  accentColor: string;
  isCenter: boolean;
}) {
  const W = 200;
  const H = 420;
  const radius = 38;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        borderRadius: radius,
        background: "linear-gradient(145deg, #2c2c30 0%, #1c1c1e 40%, #0f0f11 100%)",
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.13),
          0 0 0 2.5px rgba(0,0,0,0.95),
          0 ${isCenter ? 55 : 38}px ${isCenter ? 100 : 70}px rgba(0,0,0,0.8),
          0 0 50px ${accentColor}20,
          inset 0 1px 0 rgba(255,255,255,0.15)
        `,
        flexShrink: 0,
      }}
    >
      {/* Left buttons */}
      <div style={{ position: "absolute", left: -2.5, top: 82, width: 2.5, height: 19, borderRadius: "2px 0 0 2px", background: "#222226" }} />
      <div style={{ position: "absolute", left: -2.5, top: 111, width: 2.5, height: 30, borderRadius: "2px 0 0 2px", background: "#222226" }} />
      <div style={{ position: "absolute", left: -2.5, top: 150, width: 2.5, height: 30, borderRadius: "2px 0 0 2px", background: "#222226" }} />
      {/* Right buttons */}
      <div style={{ position: "absolute", right: -2.5, top: 104, width: 2.5, height: 50, borderRadius: "0 2px 2px 0", background: "#222226" }} />
      <div style={{ position: "absolute", right: -2.5, top: 168, width: 2.5, height: 55, borderRadius: "0 2px 2px 0", background: "#222226" }} />

      {/* Screen bezel */}
      <div
        style={{
          position: "absolute",
          inset: 5,
          borderRadius: radius - 5,
          background: "#000",
          overflow: "hidden",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 84,
            height: 25,
            borderRadius: 16,
            background: "#000",
            zIndex: 20,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }} />
          <div style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: "#1c1c1c" }} />
        </div>

        {/* Status bar overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 44,
            zIndex: 15,
            pointerEvents: "none",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "0 18px 5px",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 9, fontWeight: 600, fontFamily: "-apple-system, sans-serif" }}>9:41</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 1 }}>
              {[3, 4, 5, 5].map((h, i) => (
                <div key={i} style={{ width: 2.5, height: h, borderRadius: 1, background: i < 3 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)" }} />
              ))}
            </div>
            <div style={{ width: 18, height: 9, borderRadius: 2.5, border: "1.5px solid rgba(255,255,255,0.5)", position: "relative" }}>
              <div style={{ position: "absolute", inset: "1.5px", borderRadius: 1, background: "rgba(255,255,255,0.85)", width: "70%" }} />
            </div>
          </div>
        </div>

        {/* App iframe — real app content */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 90,
            height: 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.32)",
            zIndex: 20,
          }}
        />
      </div>

      {/* Frame shine */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

interface IPhoneMockupShowcaseProps {
  onOpenDemo?: (demoId: string) => void;
}

export default function IPhoneMockupShowcase({ onOpenDemo: _onOpenDemo }: IPhoneMockupShowcaseProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

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
          gap: 14,
          overflowX: "auto",
          paddingBottom: 4,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {apps.map((app, i) => {
          const isCenter = i === 1;
          return (
            <div
              key={app.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                flexShrink: 0,
                transform: isCenter ? "translateY(-20px)" : "translateY(0)",
                transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
            >
              <div
                style={{
                  transform:
                    hoveredApp === app.id
                      ? "scale(1.04) translateY(-6px)"
                      : "scale(1)",
                  transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <IPhoneFrame accentColor={app.accent} isCenter={isCenter}>
                  <iframe
                    src={app.route}
                    title={app.nameRu}
                    style={{
                      width: "390px",
                      height: "844px",
                      border: "none",
                      transform: "scale(0.4872)",
                      transformOrigin: "top left",
                      background: "#000",
                    }}
                    loading="lazy"
                    allow="clipboard-write"
                  />
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
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: app.accent,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: isDark ? "#fff" : "#1d1d1f",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "-apple-system, sans-serif",
                    }}
                  >
                    {language === "ru" ? app.nameRu : app.nameEn}
                  </span>
                </div>
                <div
                  style={{
                    color: isDark ? "rgba(255,255,255,0.3)" : "rgba(29,29,31,0.4)",
                    fontSize: 11,
                    fontFamily: "-apple-system, sans-serif",
                  }}
                >
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
