import { useState, useCallback } from "react";
import { Menu, X, Sparkles, MessageCircle, Bot, Users, Home, Send, ChevronRight } from "lucide-react";
import { SiInstagram, SiTelegram } from "react-icons/si";
import UserAvatar from "./UserAvatar";

interface GlobalSidebarProps {
  currentRoute: string;
  onNavigate: (section: string) => void;
  user?: {
    photo_url?: string;
    first_name?: string;
  };
}

export default function GlobalSidebar({ currentRoute, onNavigate, user }: GlobalSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    { 
      icon: Home, 
      label: 'Главная', 
      section: '', 
      routes: ['showcase'],
      description: 'Все возможности'
    },
    { 
      icon: Sparkles, 
      label: 'Бизнес приложения', 
      section: 'projects', 
      routes: ['projects'],
      description: 'Готовые решения'
    },
    { 
      icon: Bot, 
      label: 'ИИ агент для бизнеса', 
      section: 'ai-process', 
      routes: ['aiProcess', 'aiAgent'],
      description: 'Автоматизация 24/7'
    },
    { 
      icon: Users, 
      label: 'О студии', 
      section: 'about', 
      routes: ['about'],
      description: 'Наша команда'
    },
    { 
      icon: MessageCircle, 
      label: 'Заказать проект', 
      section: 'constructor', 
      routes: ['constructor', 'checkout'],
      description: 'Индивидуальное решение'
    },
  ];

  const isActive = (routes: string[]) => routes.includes(currentRoute);

  const handleNavClick = useCallback((section: string) => {
    setPressedItem(section);
    setTimeout(() => {
      onNavigate(section);
      setSidebarOpen(false);
      setPressedItem(null);
    }, 180);
  }, [onNavigate]);

  const socialLinks = [
    { 
      icon: SiInstagram, 
      label: 'Instagram', 
      url: 'https://instagram.com/web4tg',
      color: '#E4405F',
      hoverBg: 'rgba(228, 64, 95, 0.15)'
    },
    { 
      icon: SiTelegram, 
      label: 'Telegram канал', 
      url: 'https://t.me/web4_tg',
      color: '#26A5E4',
      hoverBg: 'rgba(38, 165, 228, 0.15)'
    },
    { 
      icon: Send, 
      label: 'Консультация', 
      url: 'https://t.me/web4tgs',
      color: '#A78BFA',
      hoverBg: 'rgba(167, 139, 250, 0.15)'
    },
  ];

  const isProfileActive = ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute);
  const isProfilePressed = pressedItem === 'profile';
  const isProfileHovered = hoveredItem === 'profile';

  return (
    <>
      {/* SIDEBAR OVERLAY */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ 
          background: 'rgba(0,0,0,0.75)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* SIDEBAR PANEL */}
      <div 
        className={`fixed top-0 left-0 h-full z-[100] transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          width: '320px',
          background: 'linear-gradient(180deg, #0C0C0E 0%, #09090B 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: sidebarOpen ? '20px 0 60px rgba(0,0,0,0.5)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {/* Decorative gradient line at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.5) 50%, transparent 100%)'
        }} />

        {/* Sidebar Header with User */}
        <div style={{ 
          padding: '28px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div style={{
                position: 'relative'
              }}>
                <UserAvatar
                  photoUrl={user?.photo_url}
                  firstName={user?.first_name}
                  size="md"
                  className="ring-2 ring-white/10"
                />
                {/* Online indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#22C55E',
                  border: '2px solid #0C0C0E'
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#FAFAFA'
                }}>
                  {user?.first_name || 'Гость'}
                </p>
                
                {/* Level Progress Bar */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.15) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.25)'
                      }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#A78BFA',
                          letterSpacing: '0.02em'
                        }}>
                          LVL 1
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: '#52525B'
                      }}>
                        Новичок
                      </span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#71717A'
                    }}>
                      0/100 XP
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '6px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden'
                  }}>
                    {/* Progress Fill */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: '5%',
                      borderRadius: '4px',
                      background: 'linear-gradient(90deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%)',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)',
                      transition: 'width 0.5s ease'
                    }} />
                    {/* Shimmer Effect */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                      animation: 'shimmer 2s infinite'
                    }} />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
              aria-label="Закрыть меню"
              data-testid="button-close-sidebar"
            >
              <X size={18} color="#A1A1AA" />
            </button>
          </div>
        </div>
        
        {/* Sidebar Navigation */}
        <nav style={{ padding: '24px 16px', flex: 1 }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#52525B',
            textTransform: 'uppercase',
            padding: '0 16px',
            marginBottom: '12px'
          }}>
            Навигация
          </p>
          
          {/* Nav Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const active = isActive(item.routes);
              const isPressed = pressedItem === item.section;
              const isHovered = hoveredItem === item.section;
              
              return (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item.section)}
                  onMouseEnter={() => setHoveredItem(item.section)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="w-full group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: isPressed 
                      ? 'rgba(139, 92, 246, 0.2)' 
                      : active 
                        ? 'rgba(255,255,255,0.06)' 
                        : isHovered
                          ? 'rgba(255,255,255,0.04)'
                          : 'transparent',
                    border: isPressed 
                      ? '1px solid rgba(139, 92, 246, 0.35)'
                      : active 
                        ? '1px solid rgba(255,255,255,0.08)' 
                        : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  data-testid={`button-nav-${item.section || 'home'}`}
                >
                  {/* Glow effect for active */}
                  {active && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '24px',
                      borderRadius: '0 4px 4px 0',
                      background: 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)'
                    }} />
                  )}
                  
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: isPressed 
                      ? 'rgba(139, 92, 246, 0.3)'
                      : active 
                        ? 'rgba(139, 92, 246, 0.15)' 
                        : 'rgba(255,255,255,0.04)',
                    border: active ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0
                  }}>
                    <item.icon 
                      size={20} 
                      color={isPressed || active ? '#A78BFA' : isHovered ? '#E4E4E7' : '#71717A'} 
                      style={{ transition: 'color 0.2s ease' }}
                    />
                  </div>
                  
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: isPressed || active ? 600 : 500,
                      color: isPressed || active ? '#FAFAFA' : isHovered ? '#E4E4E7' : '#A1A1AA',
                      transition: 'all 0.2s ease',
                      display: 'block'
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#52525B',
                      marginTop: '2px',
                      display: 'block',
                      opacity: active || isHovered ? 1 : 0.7,
                      transition: 'opacity 0.2s ease'
                    }}>
                      {item.description}
                    </span>
                  </div>
                  
                  <ChevronRight 
                    size={16} 
                    color={active ? '#A78BFA' : '#3F3F46'}
                    style={{
                      opacity: active || isHovered ? 1 : 0,
                      transform: isHovered && !active ? 'translateX(2px)' : 'translateX(0)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </button>
              );
            })}
          </div>
          
          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            margin: '16px 0'
          }} />
          
          {/* Profile Button with Avatar */}
          <button
            onClick={() => handleNavClick('profile')}
            onMouseEnter={() => setHoveredItem('profile')}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-full group"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '14px',
              background: isProfilePressed
                ? 'rgba(139, 92, 246, 0.2)'
                : isProfileActive 
                  ? 'rgba(255,255,255,0.06)' 
                  : isProfileHovered
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
              border: isProfilePressed
                ? '1px solid rgba(139, 92, 246, 0.35)'
                : isProfileActive 
                  ? '1px solid rgba(255,255,255,0.08)' 
                  : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isProfilePressed ? 'scale(0.98)' : 'scale(1)',
              position: 'relative'
            }}
            data-testid="button-nav-profile"
          >
            {/* Glow effect for active */}
            {isProfileActive && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '3px',
                height: '24px',
                borderRadius: '0 4px 4px 0',
                background: 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)',
                boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)'
              }} />
            )}
            
            <div style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserAvatar
                photoUrl={user?.photo_url}
                firstName={user?.first_name}
                size="sm"
                className={isProfilePressed || isProfileActive ? 'ring-2 ring-violet-400/40' : ''}
              />
            </div>
            
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span style={{
                fontSize: '15px',
                fontWeight: isProfilePressed || isProfileActive ? 600 : 500,
                color: isProfilePressed || isProfileActive ? '#FAFAFA' : isProfileHovered ? '#E4E4E7' : '#A1A1AA',
                transition: 'all 0.2s ease',
                display: 'block'
              }}>
                Мой профиль
              </span>
              <span style={{
                fontSize: '11px',
                color: '#52525B',
                marginTop: '2px',
                display: 'block',
                opacity: isProfileActive || isProfileHovered ? 1 : 0.7,
                transition: 'opacity 0.2s ease'
              }}>
                Награды и достижения
              </span>
            </div>
            
            <ChevronRight 
              size={16} 
              color={isProfileActive ? '#A78BFA' : '#3F3F46'}
              style={{
                opacity: isProfileActive || isProfileHovered ? 1 : 0,
                transform: isProfileHovered && !isProfileActive ? 'translateX(2px)' : 'translateX(0)',
                transition: 'all 0.2s ease'
              }}
            />
          </button>
        </nav>
        
        {/* Apple-Style App Progress Card */}
        <div style={{
          margin: '0 16px 12px',
          padding: '20px',
          borderRadius: '20px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative blur orb */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
            filter: 'blur(25px)',
            pointerEvents: 'none'
          }} />
          
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.08) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34,197,94,0.1)'
              }}>
                <Sparkles size={18} color="#22C55E" />
              </div>
              <div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FAFAFA',
                  display: 'block',
                  letterSpacing: '-0.01em'
                }}>
                  Ваше приложение
                </span>
                <span style={{
                  fontSize: '11px',
                  color: '#52525B',
                  marginTop: '2px',
                  display: 'block'
                }}>
                  Отслеживайте прогресс
                </span>
              </div>
            </div>
            
            {/* Percentage Badge */}
            <div style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(16,185,129,0.1) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.25)'
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#22C55E',
                letterSpacing: '-0.02em'
              }}>
                0%
              </span>
            </div>
          </div>
          
          {/* Apple-Style Progress Track */}
          <div style={{
            position: 'relative',
            marginBottom: '16px'
          }}>
            {/* Background Track */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden'
            }}>
              {/* Progress Fill with Glow */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '2%',
                borderRadius: '3px',
                background: 'linear-gradient(90deg, #22C55E 0%, #10B981 100%)',
                boxShadow: '0 0 16px rgba(34, 197, 94, 0.6), 0 0 4px rgba(34, 197, 94, 0.8)',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
              {/* Animated Pulse */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '2%',
                borderRadius: '3px',
                background: 'rgba(255,255,255,0.3)',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
            </div>
          </div>
          
          {/* Apple-Style Stage Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            {/* Connecting Line */}
            <div style={{
              position: 'absolute',
              top: '11px',
              left: '22px',
              right: '22px',
              height: '2px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '1px',
              zIndex: 0
            }} />
            
            {[
              { label: 'Бриф', active: true, completed: false },
              { label: 'Дизайн', active: false, completed: false },
              { label: 'Код', active: false, completed: false },
              { label: 'Запуск', active: false, completed: false }
            ].map((stage, index) => (
              <div 
                key={stage.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 1
                }}
              >
                {/* Stage Dot */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: stage.completed 
                    ? 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)'
                    : stage.active 
                      ? 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(16,185,129,0.2) 100%)'
                      : 'rgba(255,255,255,0.04)',
                  border: stage.completed 
                    ? '2px solid rgba(34,197,94,0.5)'
                    : stage.active 
                      ? '2px solid rgba(34,197,94,0.4)'
                      : '2px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: stage.active || stage.completed 
                    ? '0 0 12px rgba(34,197,94,0.3)' 
                    : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {stage.completed ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: stage.active 
                        ? '#22C55E' 
                        : 'rgba(255,255,255,0.2)',
                      boxShadow: stage.active ? '0 0 8px rgba(34,197,94,0.6)' : 'none'
                    }} />
                  )}
                </div>
                
                {/* Stage Label */}
                <span style={{
                  fontSize: '10px',
                  fontWeight: stage.active || stage.completed ? 600 : 500,
                  color: stage.active || stage.completed ? '#A1A1AA' : '#52525B',
                  letterSpacing: '0.02em',
                  transition: 'color 0.3s ease'
                }}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Stats Card */}
        <div style={{
          margin: '0 16px 16px',
          padding: '20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.06) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient orb */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }} />
          
          <div style={{ position: 'relative' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: '#A78BFA',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              Декабрь 2025
            </p>
            <p style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FAFAFA',
              letterSpacing: '-0.03em',
              lineHeight: 1
            }}>
              3 слота
            </p>
            <p style={{
              fontSize: '13px',
              color: '#71717A',
              marginTop: '6px'
            }}>
              осталось на этот месяц
            </p>
          </div>
        </div>
        
        {/* Sidebar Footer with Social Links */}
        <div style={{
          padding: '20px 24px 28px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)'
        }}>
          {/* Social Links Label */}
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            Связаться с нами
          </p>
          
          {/* Social Links */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-label={social.label}
                data-testid={`link-social-${social.label.toLowerCase().replace(' ', '-')}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = social.hoverBg;
                  e.currentTarget.style.borderColor = `${social.color}40`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${social.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <social.icon size={22} color={social.color} />
              </a>
            ))}
          </div>
          
          {/* Copyright */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#71717A'
              }}>
                Web4TG Studio
              </p>
              <p style={{
                fontSize: '11px',
                color: '#3F3F46',
                marginTop: '2px'
              }}>
                2025
              </p>
            </div>
            <div style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#22C55E',
                letterSpacing: '0.02em'
              }}>
                ONLINE
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOP BAR WITH MENU BUTTON */}
      <div 
        className="fixed top-0 left-0 right-0 z-[90]"
        style={{
          background: 'rgba(9,9,11,0.88)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.04)'
        }}
      >
        <div className="max-w-md mx-auto px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
            aria-label="Открыть меню"
            data-testid="button-open-sidebar"
          >
            <Menu size={22} color="#FAFAFA" />
          </button>
          
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)'
            }} />
            <p style={{
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#FAFAFA'
            }}>
              WEB4TG
            </p>
          </div>
          
          {/* Empty space for balance */}
          <div style={{ width: '44px' }} />
        </div>
      </div>
    </>
  );
}
