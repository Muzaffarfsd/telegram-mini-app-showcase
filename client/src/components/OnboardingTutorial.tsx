import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Gift, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'tma_onboarding_complete';

interface OnboardingStep {
  icon: typeof Sparkles;
  title: string;
  description: string;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    icon: Sparkles,
    title: 'Добро пожаловать!',
    description: 'Это витрина Mini App для вашего бизнеса. Здесь вы найдете готовые решения для ресторанов, фитнеса, магазинов и многого другого.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Gift,
    title: 'Бонусная программа',
    description: 'Приглашайте друзей и получайте монеты! За каждого приглашенного друга вы получите бонус.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Trophy,
    title: 'Достижения',
    description: 'Выполняйте задания, зарабатывайте XP и открывайте новые уровни. Чем выше уровень - тем больше бонусов!',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Zap,
    title: 'ИИ Агенты',
    description: 'Узнайте как искусственный интеллект может автоматизировать ваш бизнес и увеличить продажи.',
    color: 'from-blue-500 to-cyan-500',
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
      setTimeout(() => setIsVisible(true), 1000);
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
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
        data-testid="onboarding-overlay"
      >
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(30, 30, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          data-testid="onboarding-modal"
        >
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors z-10"
            aria-label="Закрыть"
            data-testid="button-onboarding-skip"
          >
            <X className="w-5 h-5" />
          </button>

          <div className={`h-40 bg-gradient-to-br ${step.color} flex items-center justify-center`}>
            <m.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            >
              <Icon className="w-20 h-20 text-white drop-shadow-lg" />
            </m.div>
          </div>

          <div className="p-6">
            <m.div
              key={`content-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-white mb-3" data-testid="text-onboarding-title">
                {step.title}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6" data-testid="text-onboarding-description">
                {step.description}
              </p>
            </m.div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentStep ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    className="text-white/70 hover:text-white"
                    data-testid="button-onboarding-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Назад
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  data-testid="button-onboarding-next"
                >
                  {currentStep === steps.length - 1 ? 'Начать' : 'Далее'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
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
