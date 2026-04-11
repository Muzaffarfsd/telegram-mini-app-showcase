import { useState, useEffect, useCallback, useRef, memo, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, m } from "@/utils/LazyMotionProvider";

export interface TourStep {
  selector: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface AIGuidedTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  language: string;
}

interface CutoutRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SAFE_SELECTOR = /^\[data-[\w-]+(=['"]\w+['"])?\]$|^#[\w-]+$|^\.[\w-]+$/;
const PADDING = 12;
const TOOLTIP_GAP = 16;

export const AIGuidedTour = memo(({ steps, isActive, onComplete, onSkip, language }: AIGuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cutout, setCutout] = useState<CutoutRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; arrowSide: string }>({
    top: 0, left: 0, arrowSide: "bottom",
  });
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const step = steps[currentStep];

  const updatePosition = useCallback(() => {
    if (!step || !SAFE_SELECTOR.test(step.selector)) {
      setCutout(null);
      return;
    }

    try {
      const el = document.querySelector(step.selector);
      if (!el) {
        setCutout(null);
        return;
      }

      el.scrollIntoView({ behavior: "smooth", block: "center" });

      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const c: CutoutRect = {
          top: rect.top - PADDING,
          left: rect.left - PADDING,
          width: rect.width + PADDING * 2,
          height: rect.height + PADDING * 2,
        };
        setCutout(c);

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const tooltipW = Math.min(320, vw - 32);
        const tooltipH = 140;

        let tTop: number;
        let tLeft: number;
        let arrow = "top";

        const pos = step.position || "auto";

        if (pos === "bottom" || (pos !== "top" && c.top + c.height + TOOLTIP_GAP + tooltipH < vh)) {
          tTop = c.top + c.height + TOOLTIP_GAP;
          arrow = "top";
        } else {
          tTop = c.top - TOOLTIP_GAP - tooltipH;
          arrow = "bottom";
        }

        tLeft = c.left + c.width / 2 - tooltipW / 2;
        tLeft = Math.max(16, Math.min(tLeft, vw - tooltipW - 16));
        tTop = Math.max(16, Math.min(tTop, vh - tooltipH - 16));

        setTooltipPos({ top: tTop, left: tLeft, arrowSide: arrow });
      });
    } catch {
      setCutout(null);
    }
  }, [step]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  }, [currentStep, steps.length, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      return;
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, currentStep, updatePosition, onSkip, handleNext, handlePrev]);

  if (!isActive || !step) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {isActive && (
        <m.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={language === "ru" ? "Пошаговый тур" : "Guided tour"}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10010,
            pointerEvents: "auto",
          }}
          onClick={onSkip}
        >
          <svg
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
          >
            <defs>
              <mask id="tour-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {cutout && (
                  <rect
                    x={cutout.left}
                    y={cutout.top}
                    width={cutout.width}
                    height={cutout.height}
                    rx="16"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0" y="0"
              width="100%" height="100%"
              fill="rgba(0,0,0,0.75)"
              mask="url(#tour-mask)"
            />
            {cutout && (
              <rect
                x={cutout.left}
                y={cutout.top}
                width={cutout.width}
                height={cutout.height}
                rx="16"
                fill="none"
                stroke="rgba(52,211,153,0.5)"
                strokeWidth="2"
                className="ai-tour-cutout-border"
              />
            )}
          </svg>

          <m.div
            key={currentStep}
            initial={{ opacity: 0, y: tooltipPos.arrowSide === "top" ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: Math.min(320, window.innerWidth - 32),
              background: "rgba(15,20,25,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: "20px",
              border: "0.5px solid rgba(255,255,255,0.12)",
              padding: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
              zIndex: 10011,
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "8px",
            }}>
              <span style={{
                fontSize: "10px", fontWeight: 600, color: "#34d399",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {language === "ru" ? "Шаг" : "Step"} {currentStep + 1}/{steps.length}
              </span>
              <button
                type="button"
                onClick={onSkip}
                aria-label={language === "ru" ? "Пропустить тур" : "Skip tour"}
                style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.35)",
                  fontSize: "12px", cursor: "pointer", padding: "2px 6px",
                  fontWeight: 500,
                }}
              >
                {language === "ru" ? "Пропустить" : "Skip"}
              </button>
            </div>

            <div style={{
              fontSize: "15px", fontWeight: 600, color: "#fff",
              marginBottom: "6px", letterSpacing: "-0.02em",
            }}>
              {step.title}
            </div>

            <div style={{
              fontSize: "13px", color: "rgba(255,255,255,0.65)",
              lineHeight: "1.55", marginBottom: "16px",
              letterSpacing: "-0.01em",
            }}>
              {step.description}
            </div>

            <div style={{
              width: "100%", height: "3px", borderRadius: "2px",
              background: "rgba(255,255,255,0.06)", marginBottom: "14px",
              overflow: "hidden",
            }}>
              <m.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                style={{
                  height: "100%", borderRadius: "2px",
                  background: "linear-gradient(90deg, #34d399, #34d399cc)",
                }}
              />
            </div>

            <div style={{
              display: "flex", gap: "8px", justifyContent: "flex-end",
            }}>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    padding: "8px 18px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.06)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)", fontSize: "13px",
                    fontWeight: 500, cursor: "pointer",
                    letterSpacing: "-0.01em",
                  }}
                >
                  ←
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: "8px 24px", borderRadius: "12px",
                  background: "linear-gradient(145deg, #34d399, #2ab883)",
                  border: "none", color: "#000",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 4px 16px rgba(52,211,153,0.3)",
                }}
              >
                {currentStep < steps.length - 1
                  ? (language === "ru" ? "Далее →" : "Next →")
                  : (language === "ru" ? "Готово ✓" : "Done ✓")
                }
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
});
