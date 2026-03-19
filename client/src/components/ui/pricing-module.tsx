import * as React from "react";
import { Check, X } from "lucide-react";

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  priceMonthly: number;
  priceYearly: number;
  users: string;
  features: PlanFeature[];
  recommended?: boolean;
}

export interface PricingModuleProps {
  title?: string;
  subtitle?: string;
  annualBillingLabel?: string;
  buttonLabel?: string;
  plans: PricingPlan[];
  defaultAnnual?: boolean;
  className?: string;
  currency?: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
  highlightsLabel?: string;
  overviewLabel?: string;
  recommendedLabel?: string;
}

export function PricingModule({
  title = "Pricing Plans",
  subtitle = "Choose a plan that fits your needs.",
  annualBillingLabel = "Annual billing",
  buttonLabel = "Get started",
  plans,
  defaultAnnual = false,
  currency = "$",
  monthlyLabel = "month",
  yearlyLabel = "year",
  highlightsLabel = "Highlights",
  overviewLabel = "Overview",
  recommendedLabel = "Recommended",
}: PricingModuleProps) {
  const [isAnnual, setIsAnnual] = React.useState(defaultAnnual);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = React.useState(
    Math.max(plans.findIndex(p => p.recommended), 0)
  );

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.children[activeIdx] as HTMLElement;
    if (target) {
      const offset = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;
      el.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, []);

  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(center - childCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    setActiveIdx(closest);
  }, []);

  const scrollTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.children[idx] as HTMLElement;
    if (target) {
      const offset = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;
      el.scrollTo({ left: offset, behavior: 'smooth' });
    }
  };

  const ACCENT = "#5AC8FA";

  return (
    <div style={{ width: "100%", paddingTop: "8px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: 700,
          letterSpacing: "-0.035em",
          color: "var(--text-primary)",
          marginBottom: "8px",
          lineHeight: 1.2,
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.5,
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px",
      }}>
        <div style={{
          display: "inline-flex",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "3px",
          gap: "2px",
        }}>
          <button
            onClick={() => setIsAnnual(false)}
            style={{
              padding: "7px 18px",
              borderRadius: "10px",
              border: "none",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.25s ease",
              letterSpacing: "-0.01em",
              background: !isAnnual ? "rgba(255,255,255,0.12)" : "transparent",
              color: !isAnnual ? "#fff" : "rgba(255,255,255,0.4)",
              boxShadow: !isAnnual ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
            }}
          >
            {monthlyLabel}
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            style={{
              padding: "7px 18px",
              borderRadius: "10px",
              border: "none",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.25s ease",
              letterSpacing: "-0.01em",
              background: isAnnual ? "rgba(255,255,255,0.12)" : "transparent",
              color: isAnnual ? "#fff" : "rgba(255,255,255,0.4)",
              boxShadow: isAnnual ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
            }}
          >
            {yearlyLabel}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="pricing-scroll-container"
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "12px",
          paddingLeft: "24px",
          paddingRight: "24px",
          marginLeft: "-20px",
          marginRight: "-20px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {plans.map((plan, idx) => {
          const isActive = idx === activeIdx;
          const isRec = !!plan.recommended;

          return (
            <div
              key={plan.id}
              onClick={() => scrollTo(idx)}
              style={{
                position: "relative",
                borderRadius: "20px",
                minWidth: "255px",
                maxWidth: "275px",
                flexShrink: 0,
                scrollSnapAlign: "center",
                transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
                transform: isActive ? "scale(1)" : "scale(0.94)",
                opacity: isActive ? 1 : 0.55,
                cursor: isActive ? "default" : "pointer",
              }}
            >
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                background: isRec
                  ? `linear-gradient(165deg, rgba(90,200,250,0.12) 0%, rgba(90,200,250,0.03) 50%, rgba(90,200,250,0.08) 100%)`
                  : `linear-gradient(165deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 100%)`,
                border: isRec
                  ? "1px solid rgba(90,200,250,0.25)"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isRec
                  ? "0 0 40px rgba(90,200,250,0.06), 0 8px 32px -8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "0 8px 32px -8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                pointerEvents: "none",
              }} />

              {isRec && (
                <div style={{
                  position: "absolute",
                  top: "-1px",
                  left: 0,
                  right: 0,
                  height: "2px",
                  borderRadius: "20px 20px 0 0",
                  background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                  pointerEvents: "none",
                }} />
              )}

              {isRec && (
                <div style={{
                  position: "absolute",
                  top: "12px",
                  right: "14px",
                  padding: "3px 10px",
                  borderRadius: "8px",
                  background: "rgba(90,200,250,0.15)",
                  border: "1px solid rgba(90,200,250,0.2)",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: ACCENT,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                  zIndex: 2,
                }}>
                  {recommendedLabel}
                </div>
              )}

              <div style={{ position: "relative", zIndex: 1, padding: "28px 22px 24px" }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                  background: isRec
                    ? "linear-gradient(135deg, rgba(90,200,250,0.15), rgba(90,200,250,0.05))"
                    : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                  border: isRec
                    ? "1px solid rgba(90,200,250,0.15)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}>
                  {plan.icon}
                </div>

                <p style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "4px",
                  letterSpacing: "-0.02em",
                }}>
                  {plan.name}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: isRec ? "rgba(90,200,250,0.7)" : "rgba(255,255,255,0.35)",
                  lineHeight: 1.4,
                  marginBottom: "20px",
                }}>
                  {plan.description}
                </p>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                    <span style={{
                      fontSize: "36px",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      transition: "opacity 0.3s ease",
                    }}>
                      {currency}{(isAnnual ? plan.priceYearly : plan.priceMonthly).toLocaleString()}
                    </span>
                  </div>
                  <p style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.3)",
                    marginTop: "4px",
                    letterSpacing: "-0.01em",
                  }}>
                    / {isAnnual ? yearlyLabel : monthlyLabel}
                  </p>
                </div>

                <button
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    marginBottom: "22px",
                    letterSpacing: "-0.01em",
                    border: "none",
                    background: isRec
                      ? `linear-gradient(135deg, ${ACCENT}, #3b9fd4)`
                      : "rgba(255,255,255,0.08)",
                    color: isRec ? "#000" : "rgba(255,255,255,0.8)",
                    boxShadow: isRec
                      ? `0 4px 16px rgba(90,200,250,0.25), 0 1px 2px rgba(0,0,0,0.2)`
                      : "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  {buttonLabel}
                </button>

                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: "16px",
                }}>
                  <p style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: "12px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                  }}>
                    {highlightsLabel}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {f.included ? (
                          <div style={{
                            width: 18,
                            height: 18,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isRec ? "rgba(90,200,250,0.12)" : "rgba(255,255,255,0.06)",
                            flexShrink: 0,
                          }}>
                            <Check size={11} color={isRec ? ACCENT : "rgba(255,255,255,0.5)"} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div style={{
                            width: 18,
                            height: 18,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.03)",
                            flexShrink: 0,
                          }}>
                            <X size={10} style={{ color: "rgba(255,255,255,0.15)" }} strokeWidth={2} />
                          </div>
                        )}
                        <span style={{
                          fontSize: "12px",
                          color: f.included ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.3,
                        }}>
                          {f.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "6px",
        marginTop: "16px",
      }}>
        {plans.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            style={{
              width: i === activeIdx ? 24 : 6,
              height: 6,
              borderRadius: 3,
              border: "none",
              padding: 0,
              cursor: "pointer",
              background: i === activeIdx
                ? `linear-gradient(90deg, ${ACCENT}, #3b9fd4)`
                : "rgba(255,255,255,0.12)",
              transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
              boxShadow: i === activeIdx ? `0 0 8px rgba(90,200,250,0.3)` : "none",
            }}
          />
        ))}
      </div>

      <style>{`
        .pricing-scroll-container::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
