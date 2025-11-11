import { useState, useCallback } from 'react';
import { useAwardXP } from './useGamification';

interface XPNotification {
  id: string;
  amount: number;
  message: string;
  show: boolean;
}

interface AchievementNotif {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  show: boolean;
}

export function useXPSystem() {
  const [xpNotifications, setXpNotifications] = useState<XPNotification[]>([]);
  const [achievementNotifs, setAchievementNotifs] = useState<AchievementNotif[]>([]);
  const awardXP = useAwardXP();

  const showXPNotification = useCallback((amount: number, message: string) => {
    const id = Date.now().toString();
    setXpNotifications(prev => [...prev, { id, amount, message, show: true }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setXpNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const showAchievementNotification = useCallback((
    name: string,
    description: string,
    icon: React.ReactNode
  ) => {
    const id = Date.now().toString();
    setAchievementNotifs(prev => [...prev, { id, name, description, icon, show: true }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setAchievementNotifs(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const awardXPWithNotification = useCallback((amount: number, message: string) => {
    awardXP(amount);
    showXPNotification(amount, message);
  }, [awardXP, showXPNotification]);

  const closeXPNotification = useCallback((id: string) => {
    setXpNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const closeAchievementNotification = useCallback((id: string) => {
    setAchievementNotifs(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    xpNotifications,
    achievementNotifs,
    awardXPWithNotification,
    showAchievementNotification,
    closeXPNotification,
    closeAchievementNotification
  };
}
