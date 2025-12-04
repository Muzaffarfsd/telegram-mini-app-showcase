import { Home, Bot, Briefcase, ShoppingCart, Sparkles, MessageCircle, Share2, Users } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { useTelegram } from "@/hooks/useTelegram";

interface UnifiedBottomBarProps {
  currentRoute: string;
  user?: {
    photo_url?: string;
    first_name?: string;
  };
  onNavigate: (path: string) => void;
  hapticFeedback: {
    light: () => void;
    medium: () => void;
  };
}

export default function UnifiedBottomBar({ currentRoute, user, onNavigate, hapticFeedback }: UnifiedBottomBarProps) {
  const { shareApp, openTelegramLink } = useTelegram();

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const handleConsultation = () => {
    hapticFeedback.light();
    openTelegramLink('https://t.me/web4tgs');
  };

  const handleShare = (text?: string) => {
    hapticFeedback.medium();
    shareApp(text || 'Посмотри крутые Mini Apps для бизнеса!');
  };

  const getActionButton = () => {
    switch (currentRoute) {
      case 'showcase':
      case 'projects':
      case 'about':
        return {
          icon: Sparkles,
          text: 'Заказать',
          onClick: () => { hapticFeedback.medium(); onNavigate('/constructor'); },
          color: '#8B5CF6',
        };
      case 'aiAgent':
      case 'aiProcess':
        return {
          icon: Bot,
          text: 'Подключить ИИ',
          onClick: () => { hapticFeedback.medium(); onNavigate('/constructor'); },
          color: '#8B5CF6',
        };
      case 'profile':
      case 'referral':
      case 'rewards':
      case 'earning':
        return {
          icon: Users,
          text: 'Пригласить',
          onClick: () => handleShare('Присоединяйся к Web4TG!'),
          color: '#10B981',
        };
      case 'constructor':
      case 'checkout':
        return null;
      default:
        return {
          icon: Sparkles,
          text: 'Заказать',
          onClick: () => { hapticFeedback.medium(); onNavigate('/constructor'); },
          color: '#8B5CF6',
        };
    }
  };

  const getSecondaryAction = () => {
    switch (currentRoute) {
      case 'showcase':
      case 'aiAgent':
      case 'aiProcess':
      case 'about':
        return {
          icon: MessageCircle,
          onClick: handleConsultation,
        };
      case 'projects':
        return {
          icon: Share2,
          onClick: () => handleShare(),
        };
      case 'profile':
      case 'referral':
      case 'rewards':
      case 'earning':
        return {
          icon: Share2,
          onClick: () => handleShare(),
        };
      default:
        return null;
    }
  };

  const actionButton = getActionButton();
  const secondaryAction = getSecondaryAction();
  
  const isProfileActive = ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute);
  const isAIActive = ['aiAgent', 'aiProcess'].includes(currentRoute);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-auto px-4">
      <div className="relative">
        {/* Animated Background Glow */}
        <div 
          className="absolute -inset-3 rounded-[28px] opacity-25"
          style={{
            background: `radial-gradient(ellipse 60% 80% at 30% 50%, rgba(16, 185, 129, 0.5) 0%, transparent 60%), 
                         radial-gradient(ellipse 40% 60% at 75% 50%, ${actionButton?.color || '#8B5CF6'}66 0%, transparent 50%)`,
            filter: 'blur(20px)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        
        {/* Unified Glass Container */}
        <div 
          className="relative backdrop-blur-xl rounded-[24px] border border-white/20 px-2 py-2 shadow-2xl flex items-center gap-1"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.25),
              inset 0 -1px 0 rgba(0, 0, 0, 0.15),
              0 0 60px rgba(16, 185, 129, 0.15)
            `,
          }}
        >
          {/* Inner Top Highlight */}
          <div 
            className="absolute top-0.5 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
          />
          
          {/* Navigation Section */}
          <nav className="relative flex items-center gap-0.5" role="navigation" aria-label="Главное меню">
            {/* Liquid Glass Blob for active nav item */}
            <div 
              className="absolute transition-all duration-500 ease-out pointer-events-none"
              style={{
                left: currentRoute === 'showcase' ? '2px' :
                      isAIActive ? '46px' :
                      currentRoute === 'projects' ? '90px' :
                      currentRoute === 'constructor' ? '134px' :
                      isProfileActive ? '178px' : '2px',
                top: '2px',
                width: '40px',
                height: '40px',
                zIndex: 1,
              }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.15) 60%, transparent 80%)',
                  borderRadius: '50%',
                  filter: 'blur(8px)',
                }}
              />
            </div>
      
            {/* Nav Icons */}
            <button
              onClick={() => {navigate('/'); hapticFeedback.light();}}
              className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
              style={{ zIndex: 10 }}
              aria-label="Главная"
              data-testid="nav-home"
            >
              <Home
                className={`transition-all duration-200 ${
                  currentRoute === 'showcase' ? 'w-5 h-5 text-white' : 'w-[18px] h-[18px] text-white/60'
                }`}
                strokeWidth={2}
              />
            </button>
            
            <button
              onClick={() => {navigate('/ai-process'); hapticFeedback.light();}}
              className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
              style={{ zIndex: 10 }}
              aria-label="ИИ агент"
              data-testid="nav-ai"
            >
              <Bot
                className={`transition-all duration-200 ${
                  isAIActive ? 'w-5 h-5 text-white' : 'w-[18px] h-[18px] text-white/60'
                }`}
                strokeWidth={2}
              />
            </button>
            
            <button
              onClick={() => {navigate('/projects'); hapticFeedback.light();}}
              className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
              style={{ zIndex: 10 }}
              aria-label="Витрина"
              data-testid="nav-projects"
            >
              <Briefcase
                className={`transition-all duration-200 ${
                  currentRoute === 'projects' ? 'w-5 h-5 text-white' : 'w-[18px] h-[18px] text-white/60'
                }`}
                strokeWidth={2}
              />
            </button>
            
            <button
              onClick={() => {navigate('/constructor'); hapticFeedback.light();}}
              className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
              style={{ zIndex: 10 }}
              aria-label="Конструктор"
              data-testid="nav-constructor"
            >
              <ShoppingCart
                className={`transition-all duration-200 ${
                  currentRoute === 'constructor' ? 'w-5 h-5 text-white' : 'w-[18px] h-[18px] text-white/60'
                }`}
                strokeWidth={2}
              />
            </button>
            
            <button
              onClick={() => {navigate('/profile'); hapticFeedback.light();}}
              className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
              style={{ zIndex: 10 }}
              aria-label="Профиль"
              data-testid="nav-profile"
            >
              <UserAvatar
                photoUrl={user?.photo_url}
                firstName={user?.first_name}
                size="sm"
                className={`transition-all duration-200 !w-7 !h-7 ${
                  isProfileActive ? 'ring-2 ring-white/60 scale-105' : 'opacity-70'
                }`}
              />
            </button>
          </nav>
          
          {/* Divider */}
          {actionButton && (
            <div 
              className="w-px h-8 mx-1"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              }}
            />
          )}
          
          {/* Action Buttons Section */}
          {actionButton && (
            <div className="flex items-center gap-1.5">
              {/* Primary Action Button */}
              <button
                onClick={actionButton.onClick}
                className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${actionButton.color}dd 0%, ${actionButton.color}99 100%)`,
                  border: `1px solid ${actionButton.color}55`,
                  boxShadow: `0 4px 16px ${actionButton.color}33, inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
                data-testid="button-primary-action"
              >
                <actionButton.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-white whitespace-nowrap">
                  {actionButton.text}
                </span>
              </button>
              
              {/* Secondary Action (Icon only) */}
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                  data-testid="button-secondary-action"
                >
                  <secondaryAction.icon className="w-4 h-4 text-white/80" strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
