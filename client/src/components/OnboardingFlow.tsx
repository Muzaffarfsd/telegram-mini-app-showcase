import { useState, useCallback, useEffect, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTelegram } from '../hooks/useTelegram';
import { Sparkles, Compass, Coins, ChevronRight, X } from 'lucide-react';

const SYNE = "'Syne', sans-serif";
const EMERALD = '#34d399';
const STORAGE_KEY = 'onboarding_completed';

interface OnboardingFlowProps {
  onNavigate: (section: string) => void;
  onComplete: () => void;
}

const steps = [
  {
    icon: Sparkles,
    titleRu: 'Добро пожаловать в WEB4TG',
    titleEn: 'Welcome to WEB4TG',
    descRu: 'Откройте для себя 18+ премиум решений для Telegram. Смотрите демо, тестируйте и выбирайте лучшее для вашего бизнеса.',
    descEn: 'Discover 18+ premium Telegram solutions. Browse demos, test and choose the best for your business.',
    ctaRu: 'Смотреть демо',
    ctaEn: 'Explore Demos',
    action: 'showcase',
  },
  {
    icon: Compass,
    titleRu: 'Соберите свой проект',
    titleEn: 'Build Your Project',
    descRu: 'Используйте конструктор для создания вашего идеального Telegram приложения. Выберите шаблон, добавьте функции и получите точную стоимость.',
    descEn: 'Use the constructor to build your perfect Telegram app. Pick a template, add features and get an exact price.',
    ctaRu: 'Открыть конструктор',
    ctaEn: 'Open Constructor',
    action: 'constructor',
  },
  {
    icon: Coins,
    titleRu: 'Зарабатывайте скидки',
    titleEn: 'Earn Discounts',
    descRu: 'Выполняйте задания, приглашайте друзей и обменивайте монеты на скидки до 50% на разработку.',
    descEn: 'Complete tasks, invite friends and exchange coins for up to 50% development discounts.',
    ctaRu: 'Начать зарабатывать',
    ctaEn: 'Start Earning',
    action: 'earning',
  },
];

function OnboardingFlow({ onNavigate, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const { language } = useLanguage();
  const { hapticFeedback } = useTelegram();
  const isRu = language === 'ru';

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
      hapticFeedback.light();
    } else {
      hapticFeedback.medium();
      onComplete();
    }
  }, [step, hapticFeedback, onComplete]);

  const handleCTA = useCallback(() => {
    hapticFeedback.medium();
    onComplete();
    onNavigate(steps[step].action);
  }, [step, hapticFeedback, onComplete, onNavigate]);

  const handleSkip = useCallback(() => {
    hapticFeedback.light();
    onComplete();
  }, [hapticFeedback, onComplete]);

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5,5,5,0.96)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
      }}
    >
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.06)',
          border: 'none', borderRadius: '50%',
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
        }}
        aria-label={isRu ? 'Пропустить' : 'Skip'}
      >
        <X size={18} />
      </button>

      <div style={{ textAlign: 'center', maxWidth: 340 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: `linear-gradient(135deg, ${EMERALD}25, ${EMERALD}08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
        }}>
          <Icon size={34} color={EMERALD} />
        </div>

        <h2 style={{
          fontFamily: SYNE, fontSize: '1.5rem', fontWeight: 800,
          color: '#fff', marginBottom: 12, lineHeight: 1.2,
        }}>
          {isRu ? current.titleRu : current.titleEn}
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem',
          lineHeight: 1.6, marginBottom: 36,
        }}>
          {isRu ? current.descRu : current.descEn}
        </p>

        <button
          onClick={handleCTA}
          style={{
            width: '100%', padding: '15px 24px', borderRadius: 14,
            background: EMERALD, color: '#050505',
            fontFamily: SYNE, fontWeight: 700, fontSize: '0.95rem',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 12,
          }}
        >
          {isRu ? current.ctaRu : current.ctaEn}
          <ChevronRight size={18} />
        </button>

        <button
          onClick={handleNext}
          style={{
            width: '100%', padding: '12px 24px', borderRadius: 14,
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontWeight: 600, fontSize: '0.85rem',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
          }}
        >
          {step < steps.length - 1
            ? (isRu ? 'Далее' : 'Next')
            : (isRu ? 'Начать' : 'Get Started')
          }
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8,
              height: 8, borderRadius: 4,
              background: i === step ? EMERALD : 'rgba(255,255,255,0.12)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    let usedCloudStorage = false;
    if (webApp?.CloudStorage) {
      try {
        webApp.CloudStorage.getItem(STORAGE_KEY, (err: Error | null, val: string | null) => {
          if (!err && val !== 'true') {
            setShowOnboarding(true);
          }
          setChecked(true);
        });
        usedCloudStorage = true;
      } catch {
        usedCloudStorage = false;
      }
    }
    if (!usedCloudStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== 'true') {
        setShowOnboarding(true);
      }
      setChecked(true);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    setShowOnboarding(false);
    const webApp = window.Telegram?.WebApp;
    if (webApp?.CloudStorage) {
      try {
        webApp.CloudStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } else {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  return { showOnboarding: checked && showOnboarding, completeOnboarding };
}

export default memo(OnboardingFlow);
