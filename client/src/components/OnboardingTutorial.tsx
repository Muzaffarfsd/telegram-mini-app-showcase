import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Gift, Trophy, Zap } from 'lucide-react';

const ONBOARDING_KEY = 'tma_onboarding_complete';

interface OnboardingStep {
  icon: typeof Sparkles;
  title: string;
  description: string;
  gradient: string;
}

const steps: OnboardingStep[] = [
  {
    icon: Sparkles,
    title: 'Добро пожаловать!',
    description: 'Это витрина Mini App для вашего бизнеса. Здесь вы найдете готовые решения для ресторанов, фитнеса, магазинов и многого другого.',
    gradient: 'from-emerald-400/80 to-cyan-400/80',
  },
  {
    icon: Gift,
    title: 'Бонусная программа',
    description: 'Приглашайте друзей и получайте монеты! За каждого приглашенного друга вы получите бонус.',
    gradient: 'from-violet-400/80 to-fuchsia-400/80',
  },
  {
    icon: Trophy,
    title: 'Достижения',
    description: 'Выполняйте задания, зарабатывайте XP и открывайте новые уровни. Чем выше уровень - тем больше бонусов!',
    gradient: 'from-amber-400/80 to-orange-400/80',
  },
  {
    icon: Zap,
    title: 'ИИ Агенты',
    description: 'Узнайте как искусственный интеллект может автоматизировать ваш бизнес и увеличить продажи.',
    gradient: 'from-blue-400/80 to-indigo-400/80',
  },
];

interface OnboardingTutorialProps {
  onComplete?: () => void;
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setTimeout(() => setIsVisible(true), 800);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

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
            aria-label="Закрыть"
            data-testid="button-onboarding-skip"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>

          <div 
            className={`h-44 bg-gradient-to-br ${step.gradient} flex items-center justify-center relative overflow-hidden`}
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
                {step.title}
              </h2>
              <p 
                className="text-sm leading-relaxed mb-6"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                data-testid="text-onboarding-description"
              >
                {step.description}
              </p>
            </m.div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {steps.map((_, idx) => (
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
                    Назад
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
                  {currentStep === steps.length - 1 ? 'Начать' : 'Далее'}
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
