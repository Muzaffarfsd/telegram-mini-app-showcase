import { memo, useCallback, useEffect, useRef, useMemo, useState } from "react";
import {
  Check,
  MessageSquare,
  Smartphone,
  Rocket,
  Bot,
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  BellRing,
  Brain,
  BarChart3,
  Shield,
  Users,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { SplineScene } from "./ui/spline-scene";
import { m, useInView } from "@/utils/LazyMotionProvider";

const SPLINE_SCENE_URL =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const SYNE = '"Syne", system-ui, sans-serif';
const INSTRUMENT = '"Instrument Serif", Georgia, serif';
const INTER = '"Inter", -apple-system, system-ui, sans-serif';
const EMERALD = "#34d399";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function Cin({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const r = useRef(null);
  const v = useInView(r, { once: true, margin: "-60px" });
  const rm = prefersReducedMotion();
  return (
    <m.div
      ref={r}
      initial={rm ? { opacity: 1 } : { opacity: 0, y: 32 }}
      animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: rm ? 0 : 0.9,
        ease: EASE,
        delay: rm ? 0 : delay,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

function Ct({ to, suffix = "" }: { to: number; suffix?: string }) {
  const r = useRef(null);
  const v = useInView(r, { once: true });
  const rm = prefersReducedMotion();
  const [n, setN] = useState(rm ? to : 0);
  useEffect(() => {
    if (!v || rm) {
      setN(to);
      return;
    }
    let dead = false;
    const s = performance.now();
    const loop = (t: number) => {
      if (dead) return;
      const p = Math.min((t - s) / 1600, 1);
      setN(Math.round((1 - Math.pow(1 - p, 5)) * to));
      if (p < 1) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => {
      dead = true;
    };
  }, [v, to, rm]);
  return (
    <span ref={r}>
      {n}
      {suffix}
    </span>
  );
}

interface AIProcessPageProps {
  onNavigate: (path: string) => void;
}

const AIProcessPage = memo(({ onNavigate: _ }: AIProcessPageProps) => {
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.MainButton) {
        tg.MainButton.setText(t("showcase.orderProject"));
      }
    } catch (_e) {
      void _e;
    }
  }, [t]);

  const handleGetConsultation = useCallback(() => {
    window.open("https://t.me/web4tgs", "_blank");
  }, []);

  const steps = useMemo(
    () => [
      {
        icon: <Smartphone className="w-5 h-5" aria-hidden="true" />,
        accent: "#60a5fa",
        glow: "rgba(96,165,250,0.15)",
        titleKey: "step1Title" as const,
        descKey: "step1Desc" as const,
        durKey: "step1Duration" as const,
        features: ["step1Feature1", "step1Feature2", "step1Feature3"] as const,
      },
      {
        icon: <Brain className="w-5 h-5" aria-hidden="true" />,
        accent: "#a78bfa",
        glow: "rgba(167,139,250,0.15)",
        titleKey: "step2Title" as const,
        descKey: "step2Desc" as const,
        durKey: "step2Duration" as const,
        features: ["step2Feature1", "step2Feature2", "step2Feature3"] as const,
      },
      {
        icon: <Zap className="w-5 h-5" aria-hidden="true" />,
        accent: "#fbbf24",
        glow: "rgba(251,191,36,0.15)",
        titleKey: "step3Title" as const,
        descKey: "step3Desc" as const,
        durKey: "step3Duration" as const,
        features: ["step3Feature1", "step3Feature2", "step3Feature3"] as const,
      },
      {
        icon: <Rocket className="w-5 h-5" aria-hidden="true" />,
        accent: EMERALD,
        glow: "rgba(52,211,153,0.15)",
        titleKey: "step4Title" as const,
        descKey: "step4Desc" as const,
        durKey: "step4Duration" as const,
        features: ["step4Feature1", "step4Feature2", "step4Feature3"] as const,
      },
    ],
    []
  );

  const whyCards = useMemo(
    () => [
      {
        icon: <Globe className="w-5 h-5" aria-hidden="true" />,
        accent: "#60a5fa",
        titleKey: "feature1Title" as const,
        descKey: "feature1Desc" as const,
      },
      {
        icon: <Zap className="w-5 h-5" aria-hidden="true" />,
        accent: "#fbbf24",
        titleKey: "feature2Title" as const,
        descKey: "feature2Desc" as const,
      },
      {
        icon: <BellRing className="w-5 h-5" aria-hidden="true" />,
        accent: "#a78bfa",
        titleKey: "feature3Title" as const,
        descKey: "feature3Desc" as const,
      },
    ],
    []
  );

  const capabilities = useMemo(
    () => [
      {
        icon: <Bot className="w-5 h-5" aria-hidden="true" />,
        accent: EMERALD,
        titleKey: "capNlp" as const,
        descKey: "capNlpDesc" as const,
      },
      {
        icon: <BarChart3 className="w-5 h-5" aria-hidden="true" />,
        accent: "#60a5fa",
        titleKey: "capAnalytics" as const,
        descKey: "capAnalyticsDesc" as const,
      },
      {
        icon: <Shield className="w-5 h-5" aria-hidden="true" />,
        accent: "#a78bfa",
        titleKey: "capSecurity" as const,
        descKey: "capSecurityDesc" as const,
      },
      {
        icon: <Users className="w-5 h-5" aria-hidden="true" />,
        accent: "#fbbf24",
        titleKey: "capScale" as const,
        descKey: "capScaleDesc" as const,
      },
    ],
    []
  );

  return (
    <div
      className="relative min-h-screen"
      style={{ background: "#050505", position: "relative", overflow: "hidden" }}
    >
      <style>{`
        @keyframes ai-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes ai-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ai-pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .ai-gradient-text {
          background: linear-gradient(135deg, #34d399 0%, #60a5fa 50%, #a78bfa 100%);
          background-size: 200% 200%;
          animation: ai-gradient-shift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ai-card-glow {
          position: relative;
        }
        .ai-card-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(52,211,153,0.2), rgba(96,165,250,0.1), rgba(167,139,250,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .ai-noise {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }
      `}</style>

      <div className="ai-noise" />

      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ paddingTop: "60px" }}
      >
        <SplineScene scene={SPLINE_SCENE_URL} className="w-full h-full" />
      </div>

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 15%, rgba(5,5,5,0.3) 35%, rgba(5,5,5,0.75) 48%, #050505 58%)",
        }}
      />

      <div
        className="relative z-10 min-h-screen pb-32"
        style={{ paddingTop: "100px" }}
      >
        <div className="max-w-[540px] mx-auto px-5">
          <section className="pt-0 pb-0">
            <div className="h-[280px]" />
          </section>

          <Cin>
            <div className="flex justify-center mb-6">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 16px",
                  borderRadius: "100px",
                  background: "rgba(52,211,153,0.08)",
                  border: "1px solid rgba(52,211,153,0.15)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    animation: "ai-pulse-ring 2.5s ease-out infinite",
                    border: "1px solid rgba(52,211,153,0.2)",
                  }}
                />
                <Sparkles
                  className="w-3.5 h-3.5"
                  style={{ color: EMERALD }}
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    color: EMERALD,
                    fontFamily: INTER,
                  }}
                >
                  {t("aiProcess.badge")}
                </span>
              </div>
            </div>
          </Cin>

          <Cin delay={0.08}>
            <h1 className="text-center" style={{ marginBottom: "20px" }}>
              <span
                className="ai-gradient-text"
                style={{
                  display: "block",
                  fontFamily: SYNE,
                  fontWeight: 800,
                  fontSize: "40px",
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                }}
              >
                {t("aiProcess.heroTitle1")}
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: INSTRUMENT,
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "36px",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: "rgba(255,255,255,0.45)",
                  marginTop: "2px",
                }}
              >
                {t("aiProcess.heroTitle2")} {t("aiProcess.heroTitle3")}
              </span>
            </h1>
          </Cin>

          <Cin delay={0.14}>
            <p
              className="text-center"
              style={{
                fontFamily: INTER,
                fontSize: "15px",
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.45)",
                maxWidth: "320px",
                margin: "0 auto 32px",
              }}
            >
              {t("aiProcess.heroSubtitle1")}
              <br />
              {t("aiProcess.heroSubtitle2")}
            </p>
          </Cin>

          <Cin delay={0.18}>
            <div className="flex justify-center mb-12">
              <a
                href="https://t.me/web4tgs"
                target="_blank"
                rel="noopener noreferrer"
                className="active:scale-[0.97]"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "15px 32px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${EMERALD}, #2dd4bf)`,
                  color: "#050505",
                  fontFamily: INTER,
                  fontSize: "15px",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  textDecoration: "none",
                  transition: "transform 0.2s ease, box-shadow 0.3s ease",
                  boxShadow: `0 0 0 1px rgba(52,211,153,0.3), 0 8px 32px rgba(52,211,153,0.25), 0 2px 8px rgba(0,0,0,0.3)`,
                }}
              >
                <MessageSquare className="w-[17px] h-[17px]" aria-hidden="true" />
                {t("aiProcess.getConsultation")}
                <ArrowRight className="w-4 h-4 opacity-50" aria-hidden="true" />
              </a>
            </div>
          </Cin>

          <Cin delay={0.22}>
            <div
              className="grid grid-cols-3 gap-3 mb-16"
              role="list"
              aria-label={t("aiProcess.statsLabel")}
            >
              {[
                {
                  value: 900,
                  suffix: "M+",
                  label: t("aiProcess.stats.users"),
                },
                {
                  raw: "24/7",
                  label: t("aiProcess.stats.support"),
                },
                {
                  value: 100,
                  suffix: "%",
                  label: t("aiProcess.stats.automation"),
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  role="listitem"
                  className="ai-card-glow"
                  style={{
                    padding: "20px 8px",
                    borderRadius: "18px",
                    textAlign: "center",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontFamily: SYNE,
                      fontWeight: 800,
                      fontSize: "24px",
                      letterSpacing: "-0.03em",
                      color: "#fff",
                      marginBottom: "6px",
                    }}
                  >
                    {"value" in stat && stat.value !== undefined ? (
                      <Ct to={stat.value} suffix={stat.suffix} />
                    ) : (
                      stat.raw
                    )}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: INTER,
                      fontSize: "10px",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </Cin>

          <Cin>
            <SectionHeading
              line1={t("aiProcess.capabilitiesTitle1")}
              line2={t("aiProcess.capabilitiesTitle2")}
            />
          </Cin>

          <div className="grid grid-cols-2 gap-3 mb-16">
            {capabilities.map((cap, i) => (
              <Cin key={cap.titleKey} delay={i * 0.06}>
                <div
                  className="ai-card-glow"
                  style={{
                    borderRadius: "20px",
                    padding: "20px 16px",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.008) 100%)",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `${cap.accent}12`,
                      color: cap.accent,
                      marginBottom: "14px",
                    }}
                  >
                    {cap.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: SYNE,
                      fontWeight: 700,
                      fontSize: "14px",
                      letterSpacing: "-0.02em",
                      color: "#fff",
                      marginBottom: "6px",
                      lineHeight: 1.3,
                    }}
                  >
                    {t(`aiProcess.capabilities.${cap.titleKey}`)}
                  </h3>
                  <p
                    style={{
                      fontFamily: INTER,
                      fontSize: "12px",
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {t(`aiProcess.capabilities.${cap.descKey}`)}
                  </p>
                </div>
              </Cin>
            ))}
          </div>

          <Cin>
            <SectionHeading
              line1={t("aiProcess.benefitsTitle1")}
              line2={t("aiProcess.benefitsTitle2")}
            />
          </Cin>

          <div className="space-y-2.5 mb-16">
            {(
              [
                "benefit1",
                "benefit2",
                "benefit3",
                "benefit4",
                "benefit5",
                "benefit6",
              ] as const
            ).map((key, i) => (
              <Cin key={key} delay={i * 0.05}>
                <BenefitRow text={t(`aiProcess.benefits.${key}`)} index={i} />
              </Cin>
            ))}
          </div>

          <Cin>
            <SectionHeading
              line1={t("aiProcess.howItWorksTitle1")}
              line2={t("aiProcess.howItWorksTitle2")}
            />
          </Cin>

          <div className="relative mb-16">
            <div
              style={{
                position: "absolute",
                left: "31px",
                top: "28px",
                bottom: "28px",
                width: "1px",
                background: `linear-gradient(180deg, ${EMERALD}40, rgba(96,165,250,0.2), rgba(167,139,250,0.2), ${EMERALD}40)`,
              }}
              aria-hidden="true"
            />

            <div className="space-y-3">
              {steps.map((step, i) => (
                <Cin key={step.titleKey} delay={i * 0.08}>
                  <StepCard
                    stepNumber={i + 1}
                    icon={step.icon}
                    accent={step.accent}
                    glow={step.glow}
                    title={t(`aiProcess.steps.${step.titleKey}`)}
                    description={t(`aiProcess.steps.${step.descKey}`)}
                    duration={t(`aiProcess.steps.${step.durKey}`)}
                    features={step.features.map((fk) =>
                      t(`aiProcess.steps.${fk}`)
                    )}
                  />
                </Cin>
              ))}
            </div>
          </div>

          <Cin>
            <SectionHeading
              line1={t("aiProcess.whyTelegramTitle1")}
              line2={t("aiProcess.whyTelegramTitle2")}
            />
          </Cin>

          <div className="space-y-3 mb-16">
            {whyCards.map((card, i) => (
              <Cin key={card.titleKey} delay={i * 0.08}>
                <WhyCard
                  icon={card.icon}
                  accent={card.accent}
                  title={t(`aiProcess.whyTelegram.${card.titleKey}`)}
                  description={t(`aiProcess.whyTelegram.${card.descKey}`)}
                />
              </Cin>
            ))}
          </div>

          <Cin>
            <div
              className="ai-card-glow"
              style={{
                borderRadius: "28px",
                padding: "40px 24px",
                textAlign: "center",
                background:
                  "linear-gradient(180deg, rgba(52,211,153,0.06) 0%, rgba(52,211,153,0.015) 100%)",
                position: "relative",
                overflow: "hidden",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-60px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "300px",
                  height: "200px",
                  background: `radial-gradient(ellipse, ${EMERALD}12, transparent 70%)`,
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              />

              <div style={{ position: "relative" }}>
                <h2
                  style={{
                    fontFamily: SYNE,
                    fontWeight: 800,
                    fontSize: "30px",
                    letterSpacing: "-0.04em",
                    color: "#fff",
                    marginBottom: "10px",
                    lineHeight: 1.1,
                  }}
                >
                  {t("aiProcess.ctaTitle")}
                </h2>
                <p
                  style={{
                    fontFamily: INTER,
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "28px",
                    maxWidth: "300px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {t("aiProcess.ctaSubtitle1")}
                  <br />
                  {t("aiProcess.ctaSubtitle2")}
                </p>

                <button
                  type="button"
                  onClick={handleGetConsultation}
                  className="active:scale-[0.97]"
                  style={{
                    width: "100%",
                    padding: "16px 24px",
                    borderRadius: "16px",
                    border: "none",
                    background: `linear-gradient(135deg, ${EMERALD}, #2dd4bf)`,
                    color: "#050505",
                    fontFamily: INTER,
                    fontSize: "15px",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.3s ease",
                    boxShadow: `0 8px 32px rgba(52,211,153,0.25), 0 2px 8px rgba(0,0,0,0.3)`,
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {t("aiProcess.ctaButton")}
                  <ArrowRight className="w-4 h-4 opacity-50" aria-hidden="true" />
                </button>

                <p
                  style={{
                    fontFamily: INTER,
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.25)",
                    lineHeight: 1.5,
                    letterSpacing: "0.02em",
                  }}
                >
                  {t("aiProcess.ctaFooter")}
                </p>
              </div>
            </div>
          </Cin>
        </div>
      </div>
    </div>
  );
});

AIProcessPage.displayName = "AIProcessPage";

const SectionHeading = memo(
  ({ line1, line2 }: { line1: string; line2: string }) => (
    <h2 className="text-center mb-10">
      <span
        style={{
          display: "block",
          fontFamily: SYNE,
          fontWeight: 800,
          fontSize: "30px",
          letterSpacing: "-0.04em",
          color: "#fff",
          lineHeight: 1.1,
        }}
      >
        {line1}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: INSTRUMENT,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "28px",
          letterSpacing: "-0.02em",
          color: "rgba(255,255,255,0.35)",
          lineHeight: 1.25,
          marginTop: "2px",
        }}
      >
        {line2}
      </span>
    </h2>
  )
);
SectionHeading.displayName = "SectionHeading";

const StepCard = memo(
  ({
    stepNumber,
    icon,
    accent,
    glow,
    title,
    description,
    duration,
    features,
  }: {
    stepNumber: number;
    icon: React.ReactNode;
    accent: string;
    glow: string;
    title: string;
    description: string;
    duration: string;
    features: string[];
  }) => (
    <div
      className="ai-card-glow"
      style={{
        borderRadius: "22px",
        padding: "20px",
        background: `linear-gradient(180deg, ${glow} 0%, rgba(255,255,255,0.008) 100%)`,
        transition: "transform 0.25s ease",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: accent,
              fontFamily: INTER,
              fontSize: "11px",
              fontWeight: 700,
              color: "#050505",
            }}
          >
            {stepNumber}
          </div>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${accent}15`,
              border: `1px solid ${accent}20`,
              color: accent,
            }}
          >
            {icon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3
              style={{
                fontFamily: SYNE,
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "-0.02em",
                color: "#fff",
                lineHeight: 1.3,
              }}
            >
              {title}
            </h3>
            <span
              style={{
                flexShrink: 0,
                marginLeft: "8px",
                padding: "4px 10px",
                borderRadius: "100px",
                background: `${accent}10`,
                border: `1px solid ${accent}18`,
                fontFamily: INTER,
                fontSize: "10px",
                fontWeight: 600,
                color: `${accent}bb`,
                letterSpacing: "0.02em",
              }}
            >
              {duration}
            </span>
          </div>
          <p
            style={{
              fontFamily: INTER,
              fontSize: "13px",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.38)",
              marginBottom: "12px",
            }}
          >
            {description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {features.map((f, i) => (
              <span
                key={i}
                style={{
                  padding: "5px 11px",
                  borderRadius: "9px",
                  background: `${accent}0c`,
                  border: `1px solid ${accent}15`,
                  fontFamily: INTER,
                  fontSize: "11px",
                  fontWeight: 500,
                  color: `${accent}cc`,
                  letterSpacing: "0.01em",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
);
StepCard.displayName = "StepCard";

const BENEFIT_ACCENTS = [EMERALD, "#60a5fa", "#a78bfa", "#fbbf24", EMERALD, "#60a5fa"];

const BenefitRow = memo(({ text, index }: { text: string; index: number }) => {
  const accent = BENEFIT_ACCENTS[index % BENEFIT_ACCENTS.length];
  return (
    <div
      className="flex items-center gap-3.5 ai-card-glow"
      style={{
        padding: "15px 16px",
        borderRadius: "16px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.008) 100%)",
      }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "10px",
          background: `${accent}12`,
          border: `1px solid ${accent}20`,
        }}
      >
        <Check className="w-3.5 h-3.5" style={{ color: accent }} aria-hidden="true" />
      </div>
      <p
        style={{
          fontFamily: INTER,
          fontSize: "14px",
          lineHeight: 1.5,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 400,
        }}
      >
        {text}
      </p>
    </div>
  );
});
BenefitRow.displayName = "BenefitRow";

const WhyCard = memo(
  ({
    icon,
    accent,
    title,
    description,
  }: {
    icon: React.ReactNode;
    accent: string;
    title: string;
    description: string;
  }) => (
    <div
      className="ai-card-glow"
      style={{
        borderRadius: "22px",
        padding: "22px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.008) 100%)",
        transition: "transform 0.25s ease",
      }}
    >
      <div className="flex gap-4">
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            background: `${accent}12`,
            border: `1px solid ${accent}18`,
            color: accent,
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            style={{
              fontFamily: SYNE,
              fontWeight: 700,
              fontSize: "15px",
              letterSpacing: "-0.02em",
              color: "#fff",
              marginBottom: "5px",
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontFamily: INTER,
              fontSize: "13px",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.38)",
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
);
WhyCard.displayName = "WhyCard";

export default AIProcessPage;
