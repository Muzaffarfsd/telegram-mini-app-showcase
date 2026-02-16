import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className,
  currency = "$",
  monthlyLabel = "month",
  yearlyLabel = "year",
  highlightsLabel = "Highlights",
  overviewLabel = "Overview",
  recommendedLabel = "Recommended",
}: PricingModuleProps) {
  const [isAnnual, setIsAnnual] = React.useState(defaultAnnual);

  return (
    <section
      className={cn(
        "w-full py-6",
        className
      )}
    >
      <div className="mx-auto text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</p>

        <div className="flex items-center justify-center gap-2 mb-8">
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={(checked) => setIsAnnual(checked)}
          />
          <label
            htmlFor="billing-toggle"
            className="text-sm cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            {annualBillingLabel}
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative rounded-xl transition-all",
                plan.recommended
                  ? "border-[#5AC8FA] ring-1 ring-[#5AC8FA]/30 scale-[1.02]"
                  : "border-white/10 hover:border-white/20"
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: '#5AC8FA', color: '#000' }}
                >
                  {recommendedLabel}
                </div>
              )}

              <CardHeader className="text-center pt-7 pb-3">
                <div className="flex justify-center mb-3">{plan.icon}</div>
                <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>{plan.name}</CardTitle>
                <CardDescription style={{ color: plan.recommended ? '#5AC8FA' : 'var(--text-tertiary)' }}>
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="text-3xl font-bold mb-1 transition-all duration-300" style={{ color: 'var(--text-primary)' }}>
                  {currency}{isAnnual ? plan.priceYearly.toLocaleString() : plan.priceMonthly.toLocaleString()}
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                  / {isAnnual ? yearlyLabel : monthlyLabel}
                </p>

                <Button
                  variant={plan.recommended ? "default" : "outline"}
                  className={cn(
                    "w-full mb-5",
                    plan.recommended && "bg-[#5AC8FA] hover:bg-[#5AC8FA]/90 text-black"
                  )}
                >
                  {buttonLabel}
                </Button>

                <div className="text-left text-sm">
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{overviewLabel}</h4>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>✓ {plan.users}</p>

                  <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{highlightsLabel}</h4>
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {f.included ? (
                          <Check className="w-4 h-4 shrink-0" style={{ color: plan.recommended ? '#5AC8FA' : 'var(--accent-primary, #8b5cf6)' }} />
                        ) : (
                          <X className="w-4 h-4 shrink-0" style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            !f.included && "line-through opacity-60"
                          )}
                          style={{ color: f.included ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}
                        >
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
