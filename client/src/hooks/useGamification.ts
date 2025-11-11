import { useState, useEffect } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  progress: number;
  maxProgress: number;
  reward: string;
  unlocked: boolean;
  icon: string;
}

export interface DailyTask {
  id: string;
  name: string;
  description: string;
  xp: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streak: {
    current: number;
    best: number;
    lastVisit: string;
  };
  achievements: Achievement[];
  completedTasks: number;
}

interface GamificationData {
  stats: UserStats;
  dailyTasks: DailyTask[];
  leaderboard: {
    position: number;
    totalUsers: number;
    nearbyUsers: Array<{
      rank: number;
      name: string;
      level: number;
      xp: number;
    }>;
  };
}

// Factory functions to create fresh copies (avoid shared mutable state)
function createDefaultAchievements(): Achievement[] {
  return [
    {
      id: 'explorer-bronze',
      name: 'Исследователь',
      description: 'Просмотрите 3 демо-приложения',
      level: 'Bronze',
      progress: 0,
      maxProgress: 3,
      reward: '50 XP бонус',
      unlocked: false,
      icon: 'compass'
    },
    {
      id: 'explorer-silver',
      name: 'Опытный исследователь',
      description: 'Просмотрите 10 демо-приложений',
      level: 'Silver',
      progress: 0,
      maxProgress: 10,
      reward: '200 XP бонус',
      unlocked: false,
      icon: 'telescope'
    },
    {
      id: 'early-adopter',
      name: 'Ранний пользователь',
      description: 'Откройте приложение в первый раз',
      level: 'Gold',
      progress: 1,
      maxProgress: 1,
      reward: '100 XP бонус',
      unlocked: true,
      icon: 'star'
    },
    {
      id: 'streak-master',
      name: 'Мастер регулярности',
      description: 'Посещайте приложение 7 дней подряд',
      level: 'Platinum',
      progress: 0,
      maxProgress: 7,
      reward: 'VIP статус на месяц',
      unlocked: false,
      icon: 'flame'
    },
    {
      id: 'constructor-novice',
      name: 'Архитектор',
      description: 'Создайте свой первый проект',
      level: 'Bronze',
      progress: 0,
      maxProgress: 1,
      reward: '75 XP бонус',
      unlocked: false,
      icon: 'wrench'
    },
    {
      id: 'feature-master',
      name: 'Эксперт функций',
      description: 'Добавьте 5+ функций в проект',
      level: 'Silver',
      progress: 0,
      maxProgress: 5,
      reward: '150 XP бонус',
      unlocked: false,
      icon: 'layers'
    },
    {
      id: 'order-placed',
      name: 'Решительный',
      description: 'Оформите первый заказ',
      level: 'Gold',
      progress: 0,
      maxProgress: 1,
      reward: '300 XP бонус',
      unlocked: false,
      icon: 'rocket'
    },
    {
      id: 'xp-collector',
      name: 'Коллекционер опыта',
      description: 'Наберите 1000 XP',
      level: 'Platinum',
      progress: 0,
      maxProgress: 1000,
      reward: 'Эксклюзивный бейдж',
      unlocked: false,
      icon: 'zap'
    }
  ];
}

function createDefaultDailyTasks(): DailyTask[] {
  return [
  {
    id: 'view-demos',
    name: 'Просмотрите 3 демо',
    description: 'Изучите минимум 3 демо-приложения',
    xp: 50,
    completed: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'customize-project',
    name: 'Настройте проект',
    description: 'Откройте конструктор и настройте проект',
    xp: 100,
    completed: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'share',
    name: 'Поделитесь с другом',
    description: 'Отправьте ссылку другу',
    xp: 150,
    completed: false,
    progress: 0,
    maxProgress: 1
  }
];
}

function calculateLevel(totalXp: number): number {
  // XP required for each level: level^2 * 100
  let level = 1;
  while (totalXp >= level * level * 100) {
    totalXp -= level * level * 100;
    level++;
  }
  return level;
}

function xpForNextLevel(level: number): number {
  return level * level * 100;
}

export function useGamification(): GamificationData {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const stored = localStorage.getItem('gamification_stats');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load gamification stats:', error);
    }
    
    // Default stats with fresh copies
    return {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalXp: 0,
      streak: {
        current: 1,
        best: 1,
        lastVisit: new Date().toISOString().split('T')[0]
      },
      achievements: createDefaultAchievements(),
      completedTasks: 0
    };
  });

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const stored = localStorage.getItem('daily_tasks');
      const lastReset = localStorage.getItem('daily_tasks_reset');
      
      // Reset daily tasks if it's a new day
      if (lastReset !== today) {
        localStorage.setItem('daily_tasks_reset', today);
        return createDefaultDailyTasks();
      }
      
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load daily tasks:', error);
    }
    
    return createDefaultDailyTasks();
  });

  // Update streak
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (stats.streak.lastVisit === yesterday) {
      // Continue streak
      setStats(prev => ({
        ...prev,
        streak: {
          current: prev.streak.current + 1,
          best: Math.max(prev.streak.best, prev.streak.current + 1),
          lastVisit: today
        }
      }));
    } else if (stats.streak.lastVisit !== today) {
      // Reset streak
      setStats(prev => ({
        ...prev,
        streak: {
          ...prev.streak,
          current: 1,
          lastVisit: today
        }
      }));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('gamification_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('daily_tasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  return {
    stats,
    dailyTasks,
    leaderboard: {
      position: Math.floor(Math.random() * 1000) + 1,
      totalUsers: 5000,
      nearbyUsers: [
        { rank: 141, name: 'Александр П.', level: 12, xp: 14400 },
        { rank: 142, name: 'Вы', level: stats.level, xp: stats.totalXp },
        { rank: 143, name: 'Мария С.', level: 11, xp: 12100 },
        { rank: 144, name: 'Дмитрий К.', level: 11, xp: 12000 },
        { rank: 145, name: 'Елена В.', level: 10, xp: 10000 }
      ]
    }
  };
}

export function useAwardXP() {
  return (xpAmount: number) => {
    const stored = localStorage.getItem('gamification_stats');
    if (!stored) return;
    
    const stats: UserStats = JSON.parse(stored);
    const newTotalXp = stats.totalXp + xpAmount;
    const newLevel = calculateLevel(newTotalXp);
    const xpInCurrentLevel = newTotalXp - (newLevel - 1) * (newLevel - 1) * 100;
    const xpNeeded = xpForNextLevel(newLevel);
    
    const updatedStats = {
      ...stats,
      level: newLevel,
      xp: xpInCurrentLevel,
      xpToNextLevel: xpNeeded,
      totalXp: newTotalXp
    };
    
    localStorage.setItem('gamification_stats', JSON.stringify(updatedStats));
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('gamification_update'));
  };
}

export function useCompleteTask() {
  return (taskId: string) => {
    const stored = localStorage.getItem('daily_tasks');
    if (!stored) return;
    
    const tasks: DailyTask[] = JSON.parse(stored);
    const task = tasks.find(t => t.id === taskId);
    
    if (task && !task.completed) {
      task.completed = true;
      task.progress = task.maxProgress;
      
      localStorage.setItem('daily_tasks', JSON.stringify(tasks));
      
      // Award XP
      const awardXP = useAwardXP();
      awardXP(task.xp);
      
      // Trigger update
      window.dispatchEvent(new Event('gamification_update'));
    }
  };
}

// Track demo view for achievements
export function trackDemoView() {
  const statsStr = localStorage.getItem('gamification_stats');
  if (!statsStr) return;
  
  const stats: UserStats = JSON.parse(statsStr);
  const achievements = stats.achievements;
  
  // Update explorer achievements
  const explorerBronze = achievements.find(a => a.id === 'explorer-bronze');
  const explorerSilver = achievements.find(a => a.id === 'explorer-silver');
  
  let updated = false;
  let unlockedAchievements: Achievement[] = [];
  
  if (explorerBronze && explorerBronze.progress < explorerBronze.maxProgress) {
    explorerBronze.progress++;
    if (explorerBronze.progress >= explorerBronze.maxProgress && !explorerBronze.unlocked) {
      explorerBronze.unlocked = true;
      unlockedAchievements.push(explorerBronze);
      const awardXP = useAwardXP();
      awardXP(50); // Award bonus XP
    }
    updated = true;
  }
  
  if (explorerSilver && explorerSilver.progress < explorerSilver.maxProgress) {
    explorerSilver.progress++;
    if (explorerSilver.progress >= explorerSilver.maxProgress && !explorerSilver.unlocked) {
      explorerSilver.unlocked = true;
      unlockedAchievements.push(explorerSilver);
      const awardXP = useAwardXP();
      awardXP(200); // Award bonus XP
    }
    updated = true;
  }
  
  if (updated) {
    localStorage.setItem('gamification_stats', JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('gamification_update', { 
      detail: { unlockedAchievements } 
    }));
  }
}

// Track project creation
export function trackProjectCreation() {
  const statsStr = localStorage.getItem('gamification_stats');
  if (!statsStr) return;
  
  const stats: UserStats = JSON.parse(statsStr);
  const achievement = stats.achievements.find(a => a.id === 'constructor-novice');
  
  if (achievement && !achievement.unlocked) {
    achievement.progress = 1;
    achievement.unlocked = true;
    
    localStorage.setItem('gamification_stats', JSON.stringify(stats));
    const awardXP = useAwardXP();
    awardXP(75 + 50); // Base XP + bonus
    
    window.dispatchEvent(new CustomEvent('gamification_update', { 
      detail: { unlockedAchievements: [achievement] } 
    }));
  }
}

// Track feature selection
export function trackFeatureAdded() {
  const statsStr = localStorage.getItem('gamification_stats');
  if (!statsStr) return;
  
  const stats: UserStats = JSON.parse(statsStr);
  const achievement = stats.achievements.find(a => a.id === 'feature-master');
  
  if (achievement && achievement.progress < achievement.maxProgress) {
    achievement.progress++;
    
    if (achievement.progress >= achievement.maxProgress && !achievement.unlocked) {
      achievement.unlocked = true;
      localStorage.setItem('gamification_stats', JSON.stringify(stats));
      const awardXP = useAwardXP();
      awardXP(150); // Award bonus XP
      
      window.dispatchEvent(new CustomEvent('gamification_update', { 
        detail: { unlockedAchievements: [achievement] } 
      }));
    } else {
      localStorage.setItem('gamification_stats', JSON.stringify(stats));
      window.dispatchEvent(new Event('gamification_update'));
    }
  }
}

// Track order placement
export function trackOrderPlaced() {
  const statsStr = localStorage.getItem('gamification_stats');
  if (!statsStr) return;
  
  const stats: UserStats = JSON.parse(statsStr);
  const achievement = stats.achievements.find(a => a.id === 'order-placed');
  
  if (achievement && !achievement.unlocked) {
    achievement.progress = 1;
    achievement.unlocked = true;
    
    localStorage.setItem('gamification_stats', JSON.stringify(stats));
    const awardXP = useAwardXP();
    awardXP(300 + 200); // Base XP + bonus
    
    window.dispatchEvent(new CustomEvent('gamification_update', { 
      detail: { unlockedAchievements: [achievement] } 
    }));
  }
}
