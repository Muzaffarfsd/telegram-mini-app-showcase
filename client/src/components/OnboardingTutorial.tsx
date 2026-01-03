import { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Gift, Trophy, Zap } from 'lucide-react';
import { useABTest, EXPERIMENTS } from '@/hooks/useABTest';
import { useLanguage } from '../contexts/LanguageContext';

const ONBOARDING_KEY = 'tma_onboarding_complete';
const CLOUD_STORAGE_KEY = 'onboarding_v1';

interface TelegramCloudStorage {
  getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
  setItem: (key: string, value: string, callback: (error: Error | null) => void) => void;
}

function isCloudStorageSupported(): boolean {
  try {
    const webApp = window.Telegram?.WebApp as { version?: string } | undefined;
    const version = webApp?.version;
    if (!version) return false;
    const [major, minor] = version.split('.').map(Number);
    return major > 6 || (major === 6 && minor >= 9);
  } catch {
    return false;
  }
}

function getTelegramCloudStorage(): TelegramCloudStorage | null {
  if (!isCloudStorageSupported()) {
    return null;
  }
  
  try {
    const webApp = window.Telegram?.WebApp as { CloudStorage?: TelegramCloudStorage } | undefined;
    return webApp?.CloudStorage ?? null;
  } catch {
    return null;
  }
}

async function getOnboardingStatus(): Promise<boolean> {
  const localValue = localStorage.getItem(ONBOARDING_KEY) === 'true';
  
  const cloudStorage = getTelegramCloudStorage();
  if (!cloudStorage) {
    return localValue;
  }
  
  try {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(localValue), 2000);
      
      try {
        cloudStorage.getItem(CLOUD_STORAGE_KEY, (error: Error | null, value: string | null) => {
          clearTimeout(timeout);
          if (!error && value === 'true') {
            localStorage.setItem(ONBOARDING_KEY, 'true');
            resolve(true);
          } else if (localValue) {
            try {
              cloudStorage.setItem(CLOUD_STORAGE_KEY, 'true', () => {});
            } catch {}
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } catch {
        clearTimeout(timeout);
        resolve(localValue);
      }
    });
  } catch {
    return localValue;
  }
}

function setOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true');
  
  try {
    const cloudStorage = getTelegramCloudStorage();
    if (cloudStorage) {
      cloudStorage.setItem(CLOUD_STORAGE_KEY, 'true', () => {});
    }
  } catch {}
}

interface OnboardingStep {
  icon: typeof Sparkles;
  titleKey: string;
  descKey: string;
  gradient: string;
}

const allStepsConfig: OnboardingStep[] = [
  {
    icon: Sparkles,
    titleKey: 'onboarding.welcome',
    descKey: 'onboarding.welcomeDesc',
    gradient: 'from-emerald-400/80 to-cyan-400/80',
  },
  {
    icon: Gift,
    titleKey: 'onboarding.bonusProgram',
    descKey: 'onboarding.bonusProgramDesc',
    gradient: 'from-violet-400/80 to-fuchsia-400/80',
  },
  {
    icon: Trophy,
    titleKey: 'onboarding.achievements',
    descKey: 'onboarding.achievementsDesc',
    gradient: 'from-amber-400/80 to-orange-400/80',
  },
  {
    icon: Zap,
    titleKey: 'onboarding.aiAgents',
    descKey: 'onboarding.aiAgentsDesc',
    gradient: 'from-blue-400/80 to-indigo-400/80',
  },
];

const simplifiedStepsConfig: OnboardingStep[] = [
  {
    icon: Sparkles,
    titleKey: 'onboarding.welcome',
    descKey: 'onboarding.welcomeDescSimple',
    gradient: 'from-emerald-400/80 to-cyan-400/80',
  },
  {
    icon: Zap,
    titleKey: 'onboarding.earnBonuses',
    descKey: 'onboarding.earnBonusesDesc',
    gradient: 'from-violet-400/80 to-fuchsia-400/80',
  },
];

interface OnboardingTutorialProps {
  onComplete?: () => void;
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const { variant, isVariantB, trackConversion } = useABTest(EXPERIMENTS.ONBOARDING_FLOW);
  
  const stepsConfig = isVariantB ? simplifiedStepsConfig : allStepsConfig;

  useEffect(() => {
    let mounted = true;
    
    getOnboardingStatus().then((completed) => {
      if (!mounted) return;
      if (!completed) {
        setTimeout(() => setIsVisible(true), 800);
      }
    });
    
    return () => { mounted = false; };
  }, []);

  const handleNext = () => {
    if (currentStep < stepsConfig.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteAction();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteAction = () => {
    setOnboardingComplete();
    trackConversion();
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    handleCompleteAction();
  };

  if (!isVisible) return null;

  const stepConfig = stepsConfig[currentStep];
  const Icon = stepConfig.icon;

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ 
          background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        data-testid="onboarding-overlay"
        data-ab-variant={variant}
      >
        <m.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="relative w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
          data-testid="onboarding-modal"
        >
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full z-10 transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            aria-label={t('onboarding.close')}
            data-testid="button-onboarding-skip"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>

          <div 
            className={`h-44 bg-gradient-to-br ${stepConfig.gradient} flex items-center justify-center relative overflow-hidden`}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
              }}
            />
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)',
              }}
            />
            <m.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
              className="relative"
            >
              <div 
                className="absolute inset-0 blur-2xl opacity-50"
                style={{ background: 'rgba(255,255,255,0.5)' }}
              />
              <Icon className="w-20 h-20 text-white relative z-10 drop-shadow-lg" />
            </m.div>
          </div>

          <div className="p-6 pt-5">
            <m.div
              key={`content-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <h2 
                className="text-xl font-semibold mb-2"
                style={{ color: 'rgba(255,255,255,0.95)' }}
                data-testid="text-onboarding-title"
              >
                {t(stepConfig.titleKey)}
              </h2>
              <p 
                className="text-sm leading-relaxed mb-6"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                data-testid="text-onboarding-description"
              >
                {t(stepConfig.descKey)}
              </p>
            </m.div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {stepsConfig.map((_, idx) => (
                  <m.div
                    key={idx}
                    animate={{
                      scale: idx === currentStep ? 1 : 0.8,
                      opacity: idx === currentStep ? 1 : 0.4,
                    }}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                      background: idx === currentStep 
                        ? 'rgba(255,255,255,0.9)' 
                        : 'rgba(255,255,255,0.3)',
                      boxShadow: idx === currentStep 
                        ? '0 0 8px rgba(255,255,255,0.5)' 
                        : 'none',
                    }}
                    data-testid={`indicator-step-${idx}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    data-testid="button-onboarding-prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('onboarding.back')}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                    color: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                  data-testid="button-onboarding-next"
                >
                  {currentStep === stepsConfig.length - 1 ? t('onboarding.start') : t('onboarding.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}

export function useOnboardingComplete() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
