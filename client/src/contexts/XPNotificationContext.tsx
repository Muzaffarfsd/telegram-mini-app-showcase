import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { XPNotification, AchievementNotification } from '@/components/XPNotification';
import {
  Compass,
  Telescope,
  Star,
  Flame,
  Wrench,
  Layers,
  Rocket,
  Zap
} from 'lucide-react';

interface XPNotif {
  id: string;
  amount: number;
  message: string;
}

interface AchievementNotif {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

interface XPNotificationContextValue {
  showXPNotification: (amount: number, message: string) => void;
  showAchievementNotification: (name: string, description: string, iconName: string) => void;
}

const XPNotificationContext = createContext<XPNotificationContextValue | undefined>(undefined);

const iconMap: Record<string, ReactNode> = {
  'compass': <Compass className="w-16 h-16 text-amber-400" />,
  'telescope': <Telescope className="w-16 h-16 text-blue-400" />,
  'star': <Star className="w-16 h-16 text-yellow-400" />,
  'flame': <Flame className="w-16 h-16 text-orange-400" />,
  'wrench': <Wrench className="w-16 h-16 text-emerald-400" />,
  'layers': <Layers className="w-16 h-16 text-purple-400" />,
  'rocket': <Rocket className="w-16 h-16 text-cyan-400" />,
  'zap': <Zap className="w-16 h-16 text-yellow-400" />
};

export function XPNotificationProvider({ children }: { children: ReactNode }) {
  const [xpNotifs, setXpNotifs] = useState<XPNotif[]>([]);
  const [achievementNotifs, setAchievementNotifs] = useState<AchievementNotif[]>([]);

  const showXPNotification = useCallback((amount: number, message: string) => {
    const id = Date.now().toString() + Math.random();
    setXpNotifs(prev => [...prev, { id, amount, message }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setXpNotifs(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const showAchievementNotification = useCallback((name: string, description: string, iconName: string) => {
    const id = Date.now().toString() + Math.random();
    setAchievementNotifs(prev => [...prev, { id, name, description, iconName }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setAchievementNotifs(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  // Listen to gamification update events
  useEffect(() => {
    const handleGamificationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { unlockedAchievements } = customEvent.detail || {};
      
      if (unlockedAchievements && unlockedAchievements.length > 0) {
        unlockedAchievements.forEach((achievement: any) => {
          setTimeout(() => {
            showAchievementNotification(
              achievement.name,
              achievement.description,
              achievement.icon
            );
          }, 500);
        });
      }
    };

    window.addEventListener('gamification_update', handleGamificationUpdate);
    return () => {
      window.removeEventListener('gamification_update', handleGamificationUpdate);
    };
  }, [showAchievementNotification]);

  const closeXPNotif = useCallback((id: string) => {
    setXpNotifs(prev => prev.filter(n => n.id !== id));
  }, []);

  const closeAchievementNotif = useCallback((id: string) => {
    setAchievementNotifs(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <XPNotificationContext.Provider value={{ showXPNotification, showAchievementNotification }}>
      {children}
      
      {/* Render XP Notifications */}
      {xpNotifs.map((notif, index) => (
        <div key={notif.id} style={{ top: `${6 + index * 5}rem` }} className="fixed left-1/2 -translate-x-1/2 z-50">
          <XPNotification
            amount={notif.amount}
            message={notif.message}
            show={true}
            onClose={() => closeXPNotif(notif.id)}
          />
        </div>
      ))}
      
      {/* Render Achievement Notifications */}
      {achievementNotifs.map((notif, index) => (
        <div key={notif.id} style={{ top: `${6 + index * 6}rem` }} className="fixed left-1/2 -translate-x-1/2 z-50">
          <AchievementNotification
            name={notif.name}
            description={notif.description}
            icon={iconMap[notif.iconName] || <Star className="w-16 h-16 text-yellow-400" />}
            show={true}
            onClose={() => closeAchievementNotif(notif.id)}
          />
        </div>
      ))}
    </XPNotificationContext.Provider>
  );
}

export function useXPNotifications() {
  const context = useContext(XPNotificationContext);
  if (!context) {
    throw new Error('useXPNotifications must be used within XPNotificationProvider');
  }
  return context;
}
