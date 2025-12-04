import { MessageCircle, Sparkles, Share2, Users, Bot } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface GlassActionButtonsProps {
  currentRoute: string;
  onNavigate: (path: string) => void;
}

export default function GlassActionButtons({ currentRoute, onNavigate }: GlassActionButtonsProps) {
  const { shareApp, openTelegramLink, hapticFeedback } = useTelegram();

  const handleOrderProject = () => {
    hapticFeedback.medium();
    onNavigate('/constructor');
  };

  const handleConsultation = () => {
    hapticFeedback.light();
    openTelegramLink('https://t.me/web4tgs');
  };

  const handleShare = (text?: string) => {
    hapticFeedback.medium();
    shareApp(text || 'Посмотри крутые Mini Apps для бизнеса!');
  };

  const handleConnectAI = () => {
    hapticFeedback.medium();
    onNavigate('/constructor');
  };

  type ButtonConfig = {
    text: string;
    icon: typeof Sparkles;
    onClick: () => void;
    primary?: boolean;
    color?: string;
  };

  const getButtonsForRoute = (): ButtonConfig[] => {
    switch (currentRoute) {
      case 'showcase':
        return [
          { text: 'Заказать проект', icon: Sparkles, onClick: handleOrderProject, primary: true, color: '#8B5CF6' },
          { text: 'Консультация', icon: MessageCircle, onClick: handleConsultation },
        ];
      
      case 'projects':
        return [
          { text: 'Заказать проект', icon: Sparkles, onClick: handleOrderProject, primary: true, color: '#8B5CF6' },
          { text: 'Поделиться', icon: Share2, onClick: () => handleShare() },
        ];
      
      case 'demoLanding':
      case 'demoApp':
        return [
          { text: 'Хочу такое же', icon: Sparkles, onClick: handleOrderProject, primary: true, color: '#10B981' },
          { text: 'Поделиться', icon: Share2, onClick: () => handleShare() },
        ];
      
      case 'aiAgent':
      case 'aiProcess':
        return [
          { text: 'Подключить ИИ', icon: Bot, onClick: handleConnectAI, primary: true, color: '#8B5CF6' },
          { text: 'Консультация', icon: MessageCircle, onClick: handleConsultation },
        ];
      
      case 'about':
        return [
          { text: 'Начать проект', icon: Sparkles, onClick: handleOrderProject, primary: true, color: '#8B5CF6' },
          { text: 'Консультация', icon: MessageCircle, onClick: handleConsultation },
        ];
      
      case 'profile':
      case 'referral':
      case 'rewards':
      case 'earning':
        return [
          { text: 'Пригласить друга', icon: Users, onClick: () => handleShare('Присоединяйся к Web4TG!'), primary: true, color: '#10B981' },
        ];
      
      case 'constructor':
      case 'checkout':
        return [];
      
      default:
        return [
          { text: 'Заказать проект', icon: Sparkles, onClick: handleOrderProject, primary: true, color: '#8B5CF6' },
        ];
    }
  };

  const buttons = getButtonsForRoute();

  if (buttons.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-auto">
      <div className="relative">
        {/* Animated Background Glow */}
        <div 
          className="absolute -inset-3 rounded-full opacity-25"
          style={{
            background: `radial-gradient(circle, ${buttons[0]?.color || '#8B5CF6'}99 0%, ${buttons[0]?.color || '#8B5CF6'}33 50%, transparent 70%)`,
            filter: 'blur(24px)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        
        {/* Liquid Glass Container */}
        <div 
          className="relative backdrop-blur-xl rounded-full border border-white/25 px-2 py-2 shadow-2xl flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2),
              0 0 40px ${buttons[0]?.color || '#8B5CF6'}22
            `,
          }}
        >
          {/* Inner Highlight */}
          <div 
            className="absolute top-0.5 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
          />
          
          {buttons.map((button, index) => {
            const Icon = button.icon;
            const isPrimary = button.primary;
            
            return (
              <button
                key={index}
                onClick={button.onClick}
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95"
                style={{
                  background: isPrimary 
                    ? `linear-gradient(135deg, ${button.color}dd 0%, ${button.color}99 100%)`
                    : 'rgba(255, 255, 255, 0.08)',
                  border: isPrimary 
                    ? `1px solid ${button.color}66`
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isPrimary 
                    ? `0 4px 16px ${button.color}44, inset 0 1px 0 rgba(255,255,255,0.2)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
                data-testid={`button-action-${index}`}
              >
                <Icon 
                  className="w-4 h-4" 
                  style={{ color: isPrimary ? '#FFFFFF' : 'rgba(255,255,255,0.8)' }}
                  strokeWidth={2.5}
                />
                <span 
                  className="text-sm font-semibold whitespace-nowrap"
                  style={{ 
                    color: isPrimary ? '#FFFFFF' : 'rgba(255,255,255,0.9)',
                    textShadow: isPrimary ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {button.text}
                </span>
                
                {/* Shine effect for primary button */}
                {isPrimary && (
                  <div 
                    className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
                      animation: 'shine 3s ease-in-out infinite',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <style>{`
        @keyframes shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
