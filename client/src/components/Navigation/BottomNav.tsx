import { memo, useCallback } from "react";
import { Home, ShoppingCart, Briefcase, Bot } from "lucide-react";
import UserAvatar from "../UserAvatar";
import { useLanguage } from "../../contexts/LanguageContext";
import { usePerformanceClass } from "../../hooks/usePerformanceClass";
import { navigate } from "../../hooks/useRouting";
import type { Route } from "../../hooks/useRouting";

interface NavTabProps {
  onClick: () => void;
  isActive: boolean;
  ariaLabel: string;
  testId: string;
  label: string;
  children: React.ReactNode;
}

const NavTab = memo(({ onClick, isActive, ariaLabel, testId, label, children }: NavTabProps) => (
  <button
    type="button"
    className="relative z-30 flex items-center justify-center rounded-[14px] gpu-layer"
    style={{
      height: '44px',
      minWidth: '44px',
      appearance: 'none',
      border: 'none',
      background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
      padding: isActive ? '0 14px' : '0 12px',
      outline: 'none',
      cursor: 'pointer',
      gap: isActive ? '7px' : '0',
      transition: 'background 0.22s ease-out, padding 0.28s ease-out, gap 0.28s ease-out',
      WebkitTapHighlightColor: 'transparent',
    }}
    onClick={onClick}
    aria-label={ariaLabel}
    data-testid={testId}
  >
    <div className="relative z-10 flex-shrink-0 nav-tab-icon">
      {children}
    </div>
    <span
      className="relative z-10 leading-none overflow-hidden whitespace-nowrap"
      style={{
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: '#fff',
        maxWidth: isActive ? '80px' : '0',
        opacity: isActive ? 1 : 0,
        transition: 'max-width 0.28s ease-out, opacity 0.18s ease-out',
      }}
    >
      {label}
    </span>
  </button>
));

const LiquidGlassFilter = memo(() => (
  <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
    <filter id="glass-distortion" x="-5%" y="-5%" width="110%" height="110%" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.015" numOctaves="2" seed="17" result="turbulence" />
      <feGaussianBlur in="turbulence" stdDeviation="4" result="softMap" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale="6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
));

interface BottomNavProps {
  route: Route;
  user: any;
  hapticFeedback: any;
}

export const BottomNav = memo(({ route, user, hapticFeedback }: BottomNavProps) => {
  const { language } = useLanguage();
  const { capabilities } = usePerformanceClass();
  const isAI = route.component === 'aiProcess' || route.component === 'aiAgent';
  const isProfile = ['profile', 'referral', 'rewards', 'earning'].includes(route.component);

  const navAction = useCallback((path: string) => {
    navigate(path);
    queueMicrotask(() => hapticFeedback.light());
  }, [hapticFeedback]);

  const blurStyle = capabilities.supportsBlur
    ? { backdropFilter: 'blur(40px) saturate(1.4)', WebkitBackdropFilter: 'blur(40px) saturate(1.4)', filter: 'url(#glass-distortion)' }
    : { background: 'rgba(20, 20, 22, 0.92)' };

  return (
    <>
      <LiquidGlassFilter />
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-bottom-4 duration-300"
        style={{
          isolation: 'isolate',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '8px',
        }}
      >
        <nav
          className="relative flex items-center rounded-[22px] gpu-layer"
          style={{
            padding: '5px 6px',
            gap: '2px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0,0,0,0.1)',
            background: 'rgba(20, 20, 22, 0.65)',
          }}
          role="navigation"
          aria-label={language === 'ru' ? 'Главное меню' : 'Main menu'}
        >
          <div
            className="absolute inset-0 z-0 rounded-[22px] pointer-events-none"
            style={blurStyle}
          />
          <div
            className="absolute inset-0 z-10 rounded-[22px] pointer-events-none"
            style={{
              boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.10), inset 0 -0.5px 0 rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)',
            }}
          />

          <NavTab
            onClick={() => navAction('/')}
            isActive={route.component === 'showcase'}
            ariaLabel={language === 'ru' ? 'Главная' : 'Home'}
            testId="nav-showcase"
            label={language === 'ru' ? 'Главная' : 'Home'}
          >
            <Home
              className="w-[21px] h-[21px]"
              style={{
                color: route.component === 'showcase' ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s ease-out',
              }}
              strokeWidth={route.component === 'showcase' ? 2 : 1.5}
            />
          </NavTab>

          <NavTab
            onClick={() => navAction('/ai-process')}
            isActive={isAI}
            ariaLabel={language === 'ru' ? 'ИИ агент' : 'AI Agent'}
            testId="nav-ai"
            label={language === 'ru' ? 'ИИ' : 'AI'}
          >
            <Bot
              className="w-[21px] h-[21px]"
              style={{
                color: isAI ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s ease-out',
              }}
              strokeWidth={isAI ? 2 : 1.5}
            />
          </NavTab>

          <NavTab
            onClick={() => navAction('/projects')}
            isActive={route.component === 'projects'}
            ariaLabel={language === 'ru' ? 'Проекты' : 'Projects'}
            testId="nav-projects"
            label={language === 'ru' ? 'Кейсы' : 'Cases'}
          >
            <Briefcase
              className="w-[21px] h-[21px]"
              style={{
                color: route.component === 'projects' ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s ease-out',
              }}
              strokeWidth={route.component === 'projects' ? 2 : 1.5}
            />
          </NavTab>

          <NavTab
            onClick={() => navAction('/constructor')}
            isActive={route.component === 'constructor'}
            ariaLabel={language === 'ru' ? 'Заказать' : 'Order'}
            testId="nav-constructor"
            label={language === 'ru' ? 'Заказ' : 'Order'}
          >
            <ShoppingCart
              className="w-[21px] h-[21px]"
              style={{
                color: route.component === 'constructor' ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s ease-out',
              }}
              strokeWidth={route.component === 'constructor' ? 2 : 1.5}
            />
          </NavTab>

          <NavTab
            onClick={() => navAction('/profile')}
            isActive={isProfile}
            ariaLabel={language === 'ru' ? 'Профиль' : 'Profile'}
            testId="nav-profile"
            label={language === 'ru' ? 'Профиль' : 'Profile'}
          >
            <UserAvatar
              photoUrl={user?.photo_url}
              firstName={user?.first_name}
              size="sm"
              className={`w-6 h-6 ${isProfile ? 'ring-[1.5px] ring-white/40' : 'opacity-45'}`}
            />
          </NavTab>
        </nav>
      </div>
    </>
  );
});
