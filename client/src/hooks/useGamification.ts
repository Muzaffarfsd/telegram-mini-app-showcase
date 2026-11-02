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
  viewedDemoIds?: string[];
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

function createDefaultStats(): UserStats {
  return {
    level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0,
    streak: { current: 1, best: 1, lastVisit: new Date().toISOString().slice(0, 10) },
    achievements: createDefaultAchievements(), completedTasks: 0,
  };
}

function readStats(): UserStats {
  try {
    const stored = localStorage.getItem('gamification_stats');
    if (stored) {
      const parsed: UserStats = JSON.parse(stored);
      if (Array.isArray(parsed.achievements) && parsed.streak) return parsed;
    }
  } catch (error) {
    console.error('Failed to load gamification stats:', error);
  }
  return createDefaultStats();
}

function withXP(stats: UserStats, amount: number): UserStats {
  const totalXp = Math.max(0, (Number(stats.totalXp) || 0) + amount);
  let level = 1;
  let remaining = totalXp;
  while (remaining >= level * level * 100) {
    remaining -= level * level * 100;
    level++;
  }
  return { ...stats, level, xp: remaining, xpToNextLevel: level * level * 100, totalXp };
}

function saveStats(stats: UserStats, unlockedAchievements: Achievement[] = []) {
  localStorage.setItem('gamification_stats', JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent('gamification_update', { detail: { unlockedAchievements } }));
}

export function useGamification(): GamificationData {
  const [stats, setStats] = useState<UserStats>(readStats);

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

  useEffect(() => {
    const sync = () => setStats(readStats());
    window.addEventListener('gamification_update', sync);
    return () => window.removeEventListener('gamification_update', sync);
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
    if (!Number.isFinite(xpAmount) || xpAmount <= 0) return;
    saveStats(withXP(readStats(), xpAmount));
  };
}

export function useCompleteTask() {
  return (taskId: string) => {
    let tasks: DailyTask[];
    try { tasks = JSON.parse(localStorage.getItem('daily_tasks') || 'null') || createDefaultDailyTasks(); }
    catch { tasks = createDefaultDailyTasks(); }
    const task = tasks.find(item => item.id === taskId);
    if (!task || task.completed) return;
    task.completed = true;
    task.progress = task.maxProgress;
    localStorage.setItem('daily_tasks', JSON.stringify(tasks));
    saveStats(withXP(readStats(), task.xp));
  };
}

// Local achievements start tracking even before the rewards page is first opened.
export function trackDemoView(demoId?: string) {
  const stats = readStats();
  if (demoId) {
    const viewed = Array.isArray(stats.viewedDemoIds) ? stats.viewedDemoIds : [];
    if (viewed.includes(demoId)) return;
    stats.viewedDemoIds = [...viewed, demoId];
  }
  const unlocked: Achievement[] = [];
  let bonus = 0;
  for (const [id, xp] of [['explorer-bronze', 50], ['explorer-silver', 200]] as const) {
    const achievement = stats.achievements.find(item => item.id === id);
    if (!achievement || achievement.progress >= achievement.maxProgress) continue;
    achievement.progress++;
    if (achievement.progress >= achievement.maxProgress && !achievement.unlocked) {
      achievement.unlocked = true;
      unlocked.push(achievement);
      bonus += xp;
    }
  }
  saveStats(withXP(stats, bonus), unlocked);
}

export function trackProjectCreation() {
  const stats = readStats();
  const achievement = stats.achievements.find(item => item.id === 'constructor-novice');
  if (!achievement || achievement.unlocked) return;
  achievement.progress = 1;
  achievement.unlocked = true;
  saveStats(withXP(stats, 125), [achievement]);
}

export function trackFeatureAdded() {
  const stats = readStats();
  const achievement = stats.achievements.find(item => item.id === 'feature-master');
  if (!achievement || achievement.progress >= achievement.maxProgress) return;
  achievement.progress++;
  const justUnlocked = achievement.progress >= achievement.maxProgress && !achievement.unlocked;
  if (justUnlocked) achievement.unlocked = true;
  saveStats(withXP(stats, justUnlocked ? 150 : 0), justUnlocked ? [achievement] : []);
}

export function trackOrderPlaced() {
  const stats = readStats();
  const achievement = stats.achievements.find(item => item.id === 'order-placed');
  if (!achievement || achievement.unlocked) return;
  achievement.progress = 1;
  achievement.unlocked = true;
  saveStats(withXP(stats, 500), [achievement]);
}
