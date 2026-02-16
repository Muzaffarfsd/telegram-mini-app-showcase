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

  return (
    <div style={{ width: "100%", paddingTop: "8px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          marginBottom: "6px",
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: "13px",
          color: "var(--text-tertiary)",
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "20px",
      }}>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          style={{
            position: "relative",
            width: "44px",
            height: "24px",
            borderRadius: "12px",
            border: "none",
            background: isAnnual ? "#8b5cf6" : "rgba(120,120,128,0.32)",
            cursor: "pointer",
            transition: "background 0.2s",
            padding: 0,
            flexShrink: 0,
          }}
          aria-label={annualBillingLabel}
        >
          <div style={{
            position: "absolute",
            top: "2px",
            left: isAnnual ? "22px" : "2px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }} />
        </button>
        <label
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
          onClick={() => setIsAnnual(!isAnnual)}
        >
          {annualBillingLabel}
        </label>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              position: "relative",
              borderRadius: "16px",
              border: plan.recommended
                ? "1.5px solid rgba(90, 200, 250, 0.4)"
                : "1px solid var(--card-border)",
              background: plan.recommended
                ? "rgba(90, 200, 250, 0.06)"
                : "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(16px)",
              transition: "all 0.2s",
              transform: plan.recommended ? "scale(1.02)" : "scale(1)",
              boxShadow: plan.recommended
                ? "0 0 20px rgba(90, 200, 250, 0.1)"
                : "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {plan.recommended && (
              <div style={{
                position: "absolute",
                top: "-11px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "3px 14px",
                borderRadius: "20px",
                background: "#5AC8FA",
                fontSize: "11px",
                fontWeight: 600,
                color: "#000",
                whiteSpace: "nowrap",
              }}>
                {recommendedLabel}
              </div>
            )}

            <div style={{
              padding: "28px 20px 8px",
              textAlign: "center",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "14px",
              }}>
                {plan.icon}
              </div>
              <p style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}>
                {plan.name}
              </p>
              <p style={{
                fontSize: "13px",
                color: plan.recommended ? "#5AC8FA" : "var(--text-tertiary)",
              }}>
                {plan.description}
              </p>
            </div>

            <div style={{ padding: "12px 20px 20px", textAlign: "center" }}>
              <div style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: "2px",
                transition: "all 0.3s",
              }}>
                {currency}{(isAnnual ? plan.priceYearly : plan.priceMonthly).toLocaleString()}
              </div>
              <p style={{
                fontSize: "13px",
                color: "var(--text-tertiary)",
                marginBottom: "16px",
              }}>
                / {isAnnual ? yearlyLabel : monthlyLabel}
              </p>

              <button
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  marginBottom: "20px",
                  border: plan.recommended ? "none" : "1px solid var(--card-border)",
                  background: plan.recommended ? "#5AC8FA" : "transparent",
                  color: plan.recommended ? "#000" : "var(--text-primary)",
                }}
              >
                {buttonLabel}
              </button>

              <div style={{ textAlign: "left" }}>
                <p style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "6px",
                }}>
                  {overviewLabel}
                </p>
                <p style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  marginBottom: "14px",
                }}>
                  ✓ {plan.users}
                </p>

                <p style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}>
                  {highlightsLabel}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {f.included ? (
                        <Check size={16} color={plan.recommended ? "#5AC8FA" : "#8b5cf6"} style={{ flexShrink: 0 }} />
                      ) : (
                        <X size={16} style={{ color: "var(--text-tertiary)", opacity: 0.5, flexShrink: 0 }} />
                      )}
                      <span style={{
                        fontSize: "13px",
                        color: f.included ? "var(--text-secondary)" : "var(--text-tertiary)",
                        textDecoration: f.included ? "none" : "line-through",
                        opacity: f.included ? 1 : 0.6,
                      }}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
