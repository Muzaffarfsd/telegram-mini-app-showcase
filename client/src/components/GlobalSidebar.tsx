import { useState } from "react";
import { Menu, X, Sparkles, MessageCircle, Zap, Users, Home } from "lucide-react";
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

  const menuItems = [
    { icon: Home, label: 'Главная', section: '', routes: ['showcase'] },
    { icon: Sparkles, label: 'Демо приложения', section: 'projects', routes: ['projects'] },
    { icon: Zap, label: 'ИИ Ассистент', section: 'ai-process', routes: ['aiProcess', 'aiAgent'] },
    { icon: Users, label: 'О студии', section: 'about', routes: ['about'] },
    { icon: MessageCircle, label: 'Заказать проект', section: 'constructor', routes: ['constructor', 'checkout'] },
  ];

  const isActive = (routes: string[]) => routes.includes(currentRoute);

  return (
    <>
      {/* SIDEBAR OVERLAY */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* SIDEBAR PANEL */}
      <div 
        className={`fixed top-0 left-0 h-full z-[100] transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          width: '300px',
          background: '#0A0A0B',
          borderRight: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {/* Sidebar Header with User */}
        <div style={{ 
          padding: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar
                photoUrl={user?.photo_url}
                firstName={user?.first_name}
                size="md"
                className="ring-2 ring-white/10"
              />
              <div>
                <p style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#FAFAFA'
                }}>
                  {user?.first_name || 'Гость'}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#52525B',
                  marginTop: '2px'
                }}>
                  Web4TG Studio
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              aria-label="Закрыть меню"
              data-testid="button-close-sidebar"
            >
              <X size={18} color="#71717A" />
            </button>
          </div>
        </div>
        
        {/* Sidebar Navigation */}
        <nav style={{ padding: '20px 16px' }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#52525B',
            textTransform: 'uppercase',
            padding: '8px 12px',
            marginBottom: '8px'
          }}>
            Навигация
          </p>
          
          {/* Nav Items */}
          {menuItems.map((item) => {
            const active = isActive(item.routes);
            return (
              <button
                key={item.section}
                onClick={() => {
                  onNavigate(item.section);
                  setSidebarOpen(false);
                }}
                className="w-full group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '6px',
                  transition: 'all 0.2s'
                }}
                data-testid={`button-nav-${item.section || 'home'}`}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  background: active ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                  transition: 'all 0.2s'
                }}>
                  <item.icon size={18} color={active ? '#A78BFA' : '#71717A'} />
                </div>
                <span style={{
                  fontSize: '15px',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#FAFAFA' : '#A1A1AA',
                  transition: 'all 0.2s'
                }}>
                  {item.label}
                </span>
                {active && (
                  <div style={{
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#A78BFA'
                  }} />
                )}
              </button>
            );
          })}
          
          {/* Profile Button with Avatar */}
          <button
            onClick={() => {
              onNavigate('profile');
              setSidebarOpen(false);
            }}
            className="w-full group"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute) ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute) ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              cursor: 'pointer',
              marginBottom: '6px',
              transition: 'all 0.2s'
            }}
            data-testid="button-nav-profile"
          >
            <UserAvatar
              photoUrl={user?.photo_url}
              firstName={user?.first_name}
              size="sm"
              className={['profile', 'referral', 'rewards', 'earning'].includes(currentRoute) ? 'ring-2 ring-violet-400/50' : ''}
            />
            <span style={{
              fontSize: '15px',
              fontWeight: ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute) ? 600 : 500,
              color: ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute) ? '#FAFAFA' : '#A1A1AA',
              transition: 'all 0.2s'
            }}>
              Профиль
            </span>
            {['profile', 'referral', 'rewards', 'earning'].includes(currentRoute) && (
              <div style={{
                marginLeft: 'auto',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#A78BFA'
              }} />
            )}
          </button>
        </nav>
        
        {/* Quick Stats */}
        <div style={{
          margin: '16px',
          padding: '20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.15)'
        }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#A78BFA',
            marginBottom: '8px'
          }}>
            Декабрь 2025
          </p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#FAFAFA',
            letterSpacing: '-0.03em'
          }}>
            3 слота
          </p>
          <p style={{
            fontSize: '13px',
            color: '#71717A',
            marginTop: '4px'
          }}>
            осталось на этот месяц
          </p>
        </div>
        
        {/* Sidebar Footer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#52525B'
          }}>
            2025 Web4TG Studio
          </p>
          <p style={{
            fontSize: '11px',
            color: '#3F3F46',
            marginTop: '4px'
          }}>
            Премиум Telegram Mini Apps
          </p>
        </div>
      </div>

      {/* TOP BAR WITH MENU BUTTON */}
      <div 
        className="fixed top-0 left-0 right-0 z-[90]"
        style={{
          background: 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.04)'
        }}
      >
        <div className="max-w-md mx-auto px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            aria-label="Открыть меню"
            data-testid="button-open-sidebar"
          >
            <Menu size={20} color="#FAFAFA" />
          </button>
          
          <p style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: '#71717A'
          }}>
            WEB4TG
          </p>
          
          {/* User Avatar in Header */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            aria-label="Профиль"
            data-testid="button-header-avatar"
          >
            <UserAvatar
              photoUrl={user?.photo_url}
              firstName={user?.first_name}
              size="sm"
            />
          </button>
        </div>
      </div>
    </>
  );
}
