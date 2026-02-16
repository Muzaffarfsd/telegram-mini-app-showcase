import { useState, memo } from "react";
import { Check, X, Layers, Monitor, Users, Building2 } from "lucide-react";

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
  monthlyLabel?: string;
  yearlyLabel?: string;
  buttonLabel?: string;
  plans: PricingPlan[];
  defaultAnnual?: boolean;
  currency?: string;
  highlightsLabel?: string;
  overviewLabel?: string;
}

export const PricingModule = memo(function PricingModule({
  title = "Pricing Plans",
  subtitle = "Choose a plan that fits your needs.",
  annualBillingLabel = "Annual billing",
  monthlyLabel = "month",
  yearlyLabel = "year",
  buttonLabel = "Get started",
  plans,
  defaultAnnual = false,
  currency = "$",
  highlightsLabel = "Highlights",
  overviewLabel = "Overview",
}: PricingModuleProps) {
  const [isAnnual, setIsAnnual] = useState(defaultAnnual);

  return (
    <div style={{ width: "100%" }}>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "4px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-tertiary)",
          marginBottom: "16px",
        }}
      >
        {subtitle}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          style={{
            position: "relative",
            width: "44px",
            height: "24px",
            borderRadius: "12px",
            border: "none",
            background: isAnnual
              ? "var(--accent-primary, #8b5cf6)"
              : "var(--button-secondary-bg, rgba(120,120,128,0.16))",
            cursor: "pointer",
            transition: "background 0.2s",
            padding: 0,
            flexShrink: 0,
          }}
          aria-label={annualBillingLabel}
        >
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: isAnnual ? "22px" : "2px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </button>
        <span
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
          }}
        >
          {annualBillingLabel}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              position: "relative",
              padding: "20px",
              borderRadius: "16px",
              background: plan.recommended
                ? "rgba(90, 200, 250, 0.06)"
                : "var(--card-bg)",
              border: plan.recommended
                ? "1.5px solid rgba(90, 200, 250, 0.25)"
                : "1px solid var(--card-border)",
              transition: "all 0.2s",
            }}
          >
            {plan.recommended && (
              <div
                style={{
                  position: "absolute",
                  top: "-9px",
                  right: "16px",
                  padding: "2px 10px",
                  borderRadius: "8px",
                  background: "#5AC8FA",
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#000",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Recommended
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: plan.recommended
                      ? "rgba(90, 200, 250, 0.15)"
                      : "var(--button-secondary-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {plan.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "2px",
                    }}
                  >
                    {plan.name}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: plan.recommended
                        ? "#5AC8FA"
                        : "var(--text-tertiary)",
                    }}
                  >
                    {plan.description}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {currency}
                  {isAnnual ? plan.priceYearly : plan.priceMonthly}
                </span>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                  }}
                >
                  / {isAnnual ? yearlyLabel : monthlyLabel}
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                marginBottom: "8px",
              }}
            >
              ✓ {plan.users}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginBottom: "14px",
              }}
            >
              {plan.features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {f.included ? (
                    <Check
                      size={14}
                      style={{
                        color: plan.recommended
                          ? "#5AC8FA"
                          : "var(--accent-primary, #8b5cf6)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <X
                      size={14}
                      style={{
                        color: "var(--text-tertiary)",
                        opacity: 0.5,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "12px",
                      color: f.included
                        ? "var(--text-secondary)"
                        : "var(--text-tertiary)",
                      textDecoration: f.included ? "none" : "line-through",
                      opacity: f.included ? 1 : 0.6,
                    }}
                  >
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            <button
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: plan.recommended
                  ? "none"
                  : "1px solid var(--card-border)",
                background: plan.recommended
                  ? "#5AC8FA"
                  : "var(--button-secondary-bg)",
                color: plan.recommended ? "#000" : "var(--text-primary)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
            >
              {buttonLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export { Layers, Monitor, Users as UsersIcon, Building2 };
