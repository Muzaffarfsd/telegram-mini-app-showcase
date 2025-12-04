import { useState } from "react";
import { Plus, X, Sparkles, MessageCircle, Share2, Bot } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface FloatingActionButtonProps {
  currentRoute: string;
  onNavigate: (path: string) => void;
  hapticFeedback: {
    light: () => void;
    medium: () => void;
    heavy: () => void;
  };
}

export default function FloatingActionButton({ 
  currentRoute, 
  onNavigate, 
  hapticFeedback 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { shareApp, openTelegramLink } = useTelegram();

  const toggleMenu = () => {
    hapticFeedback.medium();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    hapticFeedback.light();
    action();
    setIsOpen(false);
  };

  const handleConsultation = () => {
    openTelegramLink('https://t.me/web4tgs');
  };

  const handleShare = () => {
    shareApp('Посмотри крутые Mini Apps для бизнеса!');
  };

  const handleOrder = () => {
    onNavigate('/constructor');
  };

  const handleAI = () => {
    onNavigate('/ai-process');
  };

  const getActions = () => {
    const baseActions = [
      { 
        icon: Sparkles, 
        label: 'Заказать', 
        onClick: handleOrder,
        color: '#8B5CF6',
        bgColor: 'rgba(139, 92, 246, 0.2)',
      },
      { 
        icon: MessageCircle, 
        label: 'Консультация', 
        onClick: handleConsultation,
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.2)',
      },
      { 
        icon: Share2, 
        label: 'Поделиться', 
        onClick: handleShare,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.2)',
      },
    ];

    if (!['aiAgent', 'aiProcess'].includes(currentRoute)) {
      baseActions.unshift({
        icon: Bot,
        label: 'ИИ-агент',
        onClick: handleAI,
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.2)',
      });
    }

    return baseActions;
  };

  const actions = getActions();

  if (['constructor', 'checkout'].includes(currentRoute)) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          onClick={() => {
            hapticFeedback.light();
            setIsOpen(false);
          }}
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-28 right-4 z-50 flex flex-col-reverse items-end gap-3">
        
        {/* Action Buttons */}
        {actions.map((action, index) => (
          <div
            key={action.label}
            className="flex items-center gap-3 transition-all duration-300"
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen 
                ? 'translateY(0) scale(1)' 
                : `translateY(${(index + 1) * 20}px) scale(0.8)`,
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              pointerEvents: isOpen ? 'auto' : 'none',
            }}
          >
            {/* Label */}
            <div 
              className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
              style={{
                background: 'rgba(24, 24, 27, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {action.label}
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => handleAction(action.onClick)}
              className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-95"
              style={{
                background: action.bgColor,
                border: `1px solid ${action.color}40`,
                boxShadow: `0 4px 20px ${action.color}30`,
              }}
              data-testid={`fab-action-${action.label.toLowerCase()}`}
            >
              <action.icon 
                className="w-5 h-5" 
                style={{ color: action.color }}
                strokeWidth={2}
              />
            </button>
          </div>
        ))}

        {/* Main FAB Button */}
        <button
          onClick={toggleMenu}
          className="relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 active:scale-95"
          style={{
            background: isOpen 
              ? 'rgba(239, 68, 68, 0.9)' 
              : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: isOpen
              ? '0 8px 32px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              : '0 8px 32px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
          data-testid="fab-main"
        >
          {/* Animated glow */}
          {!isOpen && (
            <div 
              className="absolute -inset-2 rounded-full opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 70%)',
                filter: 'blur(12px)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          )}
          
          {/* Icon with rotation */}
          <div
            className="relative transition-transform duration-300"
            style={{
              transform: isOpen ? 'rotate(135deg)' : 'rotate(0deg)',
            }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" strokeWidth={2.5} />
            ) : (
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            )}
          </div>
        </button>
      </div>
    </>
  );
}
