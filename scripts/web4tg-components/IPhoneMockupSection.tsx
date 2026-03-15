"use client";

import { useState } from "react";

const apps = [
  {
    id: "radiance",
    name: "Radiance",
    category: "Премиальный fashion магазин",
    accent: "#10b981",
    bg: "linear-gradient(160deg, #0a0a0a 0%, #111827 50%, #064e3b 100%)",
    screen: (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #0a0a0a 0%, #111827 60%, #064e3b 100%)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#10b981", fontSize: "18px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>RADIANCE</span>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)" }} />
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)" }} />
            </div>
          </div>
        </div>
        {/* Hero image */}
        <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=300&fit=crop&q=80"
            alt="Radiance Fashion"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #0a0a0a)" }} />
          <div style={{ position: "absolute", bottom: 12, left: 16 }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>New Collection</div>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em" }}>Digital Fashion</div>
            <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, background: "#10b981", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ color: "#fff", fontSize: "10px", fontWeight: 600 }}>Смотреть коллекцию</span>
            </div>
          </div>
        </div>
        {/* Products */}
        <div style={{ padding: "12px 16px", flex: 1 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Рекомендации</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { name: "Silk Blouse", price: "8 990 ₽", img: "photo-1594938298603-c8148c4b984d" },
              { name: "Maxi Dress", price: "12 490 ₽", img: "photo-1515886657613-9f3515b0c78f" },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img src={`https://images.unsplash.com/${item.img}?w=150&h=120&fit=crop&q=70`} alt={item.name} style={{ width: "100%", height: 80, objectFit: "cover" }} />
                <div style={{ padding: "6px 8px" }}>
                  <div style={{ color: "#fff", fontSize: "11px", fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: "#10b981", fontSize: "11px", fontWeight: 600 }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom nav */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {["🏠", "🔍", "❤️", "👤"].map((icon, i) => (
            <span key={i} style={{ fontSize: 16, opacity: i === 0 ? 1 : 0.4 }}>{icon}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "techmart",
    name: "Techmart",
    category: "Электроника и гаджеты",
    accent: "#06b6d4",
    bg: "linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%)",
    screen: (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0c4a6e 100%)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#06b6d4", fontSize: "17px", fontWeight: 800, letterSpacing: "0.05em" }}>TECHMART</span>
            <div style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 20, padding: "4px 10px" }}>
              <span style={{ color: "#06b6d4", fontSize: "10px" }}>🛒 2</span>
            </div>
          </div>
        </div>
        {/* Hero */}
        <div style={{ margin: "12px 16px", borderRadius: 14, overflow: "hidden", position: "relative", height: 160 }}>
          <img
            src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=200&fit=crop&q=80"
            alt="Techmart"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15,23,42,0.9) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
            <div style={{ color: "#06b6d4", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>🔥 Хит продаж</div>
            <div style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>iPhone 17 Pro</div>
            <div style={{ color: "#94a3b8", fontSize: "11px" }}>от 129 990 ₽</div>
            <div style={{ marginTop: 8, background: "#06b6d4", borderRadius: 20, padding: "4px 12px", display: "inline-block" }}>
              <span style={{ color: "#fff", fontSize: "10px", fontWeight: 600 }}>Купить</span>
            </div>
          </div>
        </div>
        {/* Categories */}
        <div style={{ padding: "0 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {["Смартфоны", "Ноутбуки", "Аудио", "Аксессуары"].map((cat, i) => (
              <div key={i} style={{ flexShrink: 0, borderRadius: 20, padding: "5px 12px", background: i === 0 ? "#06b6d4" : "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ color: i === 0 ? "#000" : "rgba(255,255,255,0.6)", fontSize: "10px", fontWeight: 600 }}>{cat}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Products */}
        <div style={{ padding: "0 16px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { name: "AirPods Pro", price: "24 990 ₽", img: "photo-1606741965509-717c1a3b1e67" },
              { name: "MacBook Air", price: "129 990 ₽", img: "photo-1517336714731-489689fd1ca8" },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img src={`https://images.unsplash.com/${item.img}?w=150&h=100&fit=crop&q=70`} alt={item.name} style={{ width: "100%", height: 70, objectFit: "cover" }} />
                <div style={{ padding: "6px 8px" }}>
                  <div style={{ color: "#fff", fontSize: "10px", fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: "#06b6d4", fontSize: "10px", fontWeight: 700 }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom nav */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {["🏠", "🔍", "🛒", "👤"].map((icon, i) => (
            <span key={i} style={{ fontSize: 16, opacity: i === 0 ? 1 : 0.4 }}>{icon}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "floralart",
    name: "FloralArt",
    category: "Цветы и букеты",
    accent: "#f472b6",
    bg: "linear-gradient(160deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)",
    screen: (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #fdf2f8 0%, #fff5fb 100%)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(244,114,182,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ color: "#be185d", fontSize: "17px", fontWeight: 800, fontFamily: "Georgia, serif", fontStyle: "italic" }}>FloralArt</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(190,24,93,0.3)" }} />
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(190,24,93,0.3)" }} />
            </div>
          </div>
        </div>
        {/* Hero */}
        <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
          <img
            src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=250&fit=crop&q=80"
            alt="FloralArt"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(253,242,248,0.95))" }} />
          <div style={{ position: "absolute", bottom: 10, left: 16 }}>
            <div style={{ color: "#be185d", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em" }}>Весенняя коллекция</div>
            <div style={{ color: "#1f2937", fontSize: "15px", fontWeight: 700, fontFamily: "Georgia, serif" }}>Пионовые букеты</div>
            <div style={{ marginTop: 6, background: "#be185d", borderRadius: 20, padding: "4px 12px", display: "inline-block" }}>
              <span style={{ color: "#fff", fontSize: "10px", fontWeight: 600 }}>Заказать</span>
            </div>
          </div>
        </div>
        {/* Occasions */}
        <div style={{ padding: "10px 16px 8px" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["Все", "День рождения", "Свадьба", "8 Марта"].map((tag, i) => (
              <div key={i} style={{ flexShrink: 0, borderRadius: 20, padding: "4px 10px", background: i === 0 ? "#be185d" : "rgba(190,24,93,0.08)", border: "1px solid rgba(190,24,93,0.15)" }}>
                <span style={{ color: i === 0 ? "#fff" : "#be185d", fontSize: "9px", fontWeight: 600 }}>{tag}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Products */}
        <div style={{ padding: "0 16px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { name: "Розы 51 шт", price: "6 490 ₽", img: "photo-1462275646964-a0e3386b89fa" },
              { name: "Белые пионы", price: "4 990 ₽", img: "photo-1490750967868-88df5691cc93" },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: "#fff", border: "1px solid rgba(190,24,93,0.1)", boxShadow: "0 2px 8px rgba(190,24,93,0.06)" }}>
                <img src={`https://images.unsplash.com/${item.img}?w=150&h=100&fit=crop&q=70`} alt={item.name} style={{ width: "100%", height: 70, objectFit: "cover" }} />
                <div style={{ padding: "6px 8px" }}>
                  <div style={{ color: "#1f2937", fontSize: "10px", fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: "#be185d", fontSize: "10px", fontWeight: 700 }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom nav */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0 16px", borderTop: "1px solid rgba(190,24,93,0.08)" }}>
          {["🌸", "🔍", "🛒", "👤"].map((icon, i) => (
            <span key={i} style={{ fontSize: 16, opacity: i === 0 ? 1 : 0.4 }}>{icon}</span>
          ))}
        </div>
      </div>
    ),
  },
];

function IPhoneFrame({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: 270,
        height: 570,
        borderRadius: 50,
        background: "linear-gradient(145deg, #2a2a2e 0%, #1a1a1e 40%, #111113 100%)",
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.12),
          0 0 0 2px rgba(0,0,0,0.8),
          0 40px 80px rgba(0,0,0,0.7),
          0 20px 40px rgba(0,0,0,0.5),
          inset 0 1px 0 rgba(255,255,255,0.15),
          0 0 60px ${accentColor}22
        `,
        flexShrink: 0,
      }}
    >
      {/* Side buttons - Volume Up */}
      <div style={{ position: "absolute", left: -3, top: 120, width: 3, height: 36, borderRadius: "2px 0 0 2px", background: "linear-gradient(to bottom, #2a2a2e, #1a1a1e)", boxShadow: "-1px 0 0 rgba(255,255,255,0.08)" }} />
      {/* Side buttons - Volume Down */}
      <div style={{ position: "absolute", left: -3, top: 168, width: 3, height: 36, borderRadius: "2px 0 0 2px", background: "linear-gradient(to bottom, #2a2a2e, #1a1a1e)", boxShadow: "-1px 0 0 rgba(255,255,255,0.08)" }} />
      {/* Action button */}
      <div style={{ position: "absolute", left: -3, top: 88, width: 3, height: 22, borderRadius: "2px 0 0 2px", background: "linear-gradient(to bottom, #2a2a2e, #1a1a1e)", boxShadow: "-1px 0 0 rgba(255,255,255,0.08)" }} />
      {/* Camera control button */}
      <div style={{ position: "absolute", right: -3, top: 200, width: 3, height: 70, borderRadius: "0 2px 2px 0", background: "linear-gradient(to bottom, #2a2a2e, #1a1a1e)", boxShadow: "1px 0 0 rgba(255,255,255,0.08)" }} />
      {/* Power button */}
      <div style={{ position: "absolute", right: -3, top: 120, width: 3, height: 60, borderRadius: "0 2px 2px 0", background: "linear-gradient(to bottom, #2a2a2e, #1a1a1e)", boxShadow: "1px 0 0 rgba(255,255,255,0.08)" }} />

      {/* Screen bezel */}
      <div
        style={{
          position: "absolute",
          inset: 6,
          borderRadius: 44,
          background: "#000",
          overflow: "hidden",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 32,
            borderRadius: 20,
            background: "#000",
            zIndex: 10,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#222" }} />
        </div>

        {/* Status bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "0 24px 8px",
            zIndex: 9,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600 }}>9:41</span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 1 }}>
              {[3, 4, 5, 5].map((h, i) => (
                <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: i < 3 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)" }} />
              ))}
            </div>
            <span style={{ fontSize: 10 }}>📶</span>
            <div style={{ width: 22, height: 11, borderRadius: 3, border: "1.5px solid rgba(255,255,255,0.5)", position: "relative" }}>
              <div style={{ position: "absolute", inset: "1.5px", borderRadius: 1.5, background: "rgba(255,255,255,0.85)", width: "75%" }} />
              <div style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", width: 2.5, height: 5, borderRadius: "0 1px 1px 0", background: "rgba(255,255,255,0.4)" }} />
            </div>
          </div>
        </div>

        {/* App screen content — pushed down for Dynamic Island */}
        <div style={{ position: "absolute", inset: 0, paddingTop: 56, overflow: "hidden" }}>
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.35)",
            zIndex: 10,
          }}
        />
      </div>

      {/* Frame shine */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 50,
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function IPhoneMockupSection() {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  return (
    <section
      style={{
        padding: "100px 20px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%), #050505",
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: 80 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 30,
            padding: "6px 18px",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Демо-приложения
          </span>
        </div>
        <h2
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Посмотрите как это{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #10b981, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            работает
          </span>
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          Три готовых решения для вашего бизнеса в Telegram
        </p>
      </div>

      {/* iPhone trio */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 32,
          flexWrap: "wrap",
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
                gap: 32,
                transform: isCenter ? "translateY(-30px)" : "translateY(0)",
                transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                cursor: "pointer",
              }}
              onMouseEnter={() => setActiveApp(app.id)}
              onMouseLeave={() => setActiveApp(null)}
            >
              <div
                style={{
                  transform:
                    activeApp === app.id
                      ? "scale(1.04) translateY(-8px)"
                      : "scale(1)",
                  transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <IPhoneFrame accentColor={app.accent}>
                  {app.screen}
                </IPhoneFrame>
              </div>

              {/* App label below phone */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${app.accent}33`,
                    borderRadius: 30,
                    padding: "8px 20px",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: app.accent }} />
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{app.name}</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{app.category}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <a
          href="https://t.me/w4tg_bot"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            padding: "16px 36px",
            borderRadius: 50,
            textDecoration: "none",
            boxShadow: "0 20px 40px rgba(16,185,129,0.35)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          Запустить моё приложение
          <span style={{ fontSize: 18 }}>→</span>
        </a>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 16 }}>
          Первая демо через 3 дня · от 150 000 ₽
        </div>
      </div>
    </section>
  );
}
