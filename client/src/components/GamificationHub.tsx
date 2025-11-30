import { motion } from '@/utils/LazyMotionProvider';
import { 
  GiTreasureMap,
  GiBinoculars,
  GiTrophyCup,
  GiFlame,
  GiHammerNails,
  GiBrickWall,
  GiRocketFlight,
  GiLightningHelix,
  GiCutDiamond,
  GiImperialCrown,
  GiShield,
  GiSparkles,
  GiBullseye,
  GiLaurelCrown,
  GiPodium
} from 'react-icons/gi';
import { useMemo, memo } from 'react';
import { useGamification, type DailyTask, type Achievement } from '@/hooks/useGamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BronzeMedal, 
  SilverMedal, 
  GoldMedal, 
  PlatinumMedal
} from '@/components/icons/GamificationIcons';

// Memoized Daily Task Component
const DailyTaskItem = memo(({ task, index }: { task: DailyTask, index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`p-4 rounded-lg border ${
      task.completed
        ? 'bg-emerald-500/20 border-emerald-500/30'
        : 'bg-white/5 border-white/10'
    }`}
    data-testid={`task-${task.id}`}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <h4 className={`text-sm font-semibold ${
          task.completed ? 'text-emerald-300 line-through' : 'text-white'
        }`}>
          {task.name}
        </h4>
        <p className="text-xs text-white/60 mt-1">{task.description}</p>
      </div>
      <Badge 
        variant={task.completed ? "default" : "secondary"}
        className={task.completed ? 'bg-emerald-500' : ''}
      >
        +{task.xp} XP
      </Badge>
    </div>
    <Progress 
      value={(task.progress / task.maxProgress) * 100} 
      className="h-1.5 bg-white/10" 
    />
  </motion.div>
));
DailyTaskItem.displayName = 'DailyTaskItem';

// Memoized Achievement Component
const AchievementItem = memo(({ achievement, index, iconMap }: { 
  achievement: Achievement, 
  index: number,
  iconMap: Record<string, React.ReactNode>
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    className={`p-4 rounded-lg border text-center ${
      achievement.unlocked
        ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30'
        : 'bg-white/5 border-white/10 opacity-60'
    }`}
    data-testid={`achievement-${achievement.id}`}
  >
    <motion.div
      className="flex justify-center mb-2"
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {iconMap[achievement.icon] || achievement.icon}
    </motion.div>
    <h4 className="text-xs font-semibold text-white mb-1">
      {achievement.name}
    </h4>
    <Badge 
      variant="outline" 
      className={`text-[10px] h-5 ${
        achievement.level === 'Platinum' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50' :
        achievement.level === 'Gold' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50' :
        achievement.level === 'Silver' ? 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/50' :
        'bg-gradient-to-r from-orange-700/20 to-orange-600/20 border-orange-600/50'
      }`}
    >
      {achievement.level}
    </Badge>
    <div className="mt-2">
      <Progress 
        value={(achievement.progress / achievement.maxProgress) * 100} 
        className="h-1 bg-white/10" 
      />
      <p className="text-[10px] text-white/50 mt-1">
        {achievement.progress}/{achievement.maxProgress}
      </p>
    </div>
  </motion.div>
));
AchievementItem.displayName = 'AchievementItem';

// Memoized Leaderboard Item Component
const LeaderboardItem = memo(({ entry, position }: { entry: any, position: number }) => {
  const getRankMedal = () => {
    if (position === 0) return <GoldMedal className="w-6 h-6" />;
    if (position === 1) return <SilverMedal className="w-6 h-6" />;
    if (position === 2) return <BronzeMedal className="w-6 h-6" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: position * 0.05 }}
      className={`flex items-center justify-between p-3 rounded-lg ${
        entry.isCurrentUser 
          ? 'bg-emerald-500/20 border border-emerald-500/30' 
          : 'bg-white/5'
      }`}
      data-testid={`leaderboard-${position}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 text-center">
          {getRankMedal() || <span className="text-white/60 font-bold">{position + 1}</span>}
        </div>
        <div>
          <div className="text-white font-semibold">{entry.name}</div>
          <div className="text-white/60 text-xs">Уровень {entry.level}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-emerald-400 font-bold">{entry.xp.toLocaleString()}</div>
        <div className="text-white/60 text-xs">XP</div>
      </div>
    </motion.div>
  );
});
LeaderboardItem.displayName = 'LeaderboardItem';

export function GamificationHub() {
  const { stats, dailyTasks, leaderboard } = useGamification();

  // Memoize level progress calculation
  const levelProgress = useMemo(() => 
    (stats.xp / stats.xpToNextLevel) * 100, 
    [stats.xp, stats.xpToNextLevel]
  );

  // Memoize icon mapping for achievements - Beautiful gaming icons from react-icons/gi
  const iconMap = useMemo<Record<string, React.ReactNode>>(() => {
    console.log('[GamificationHub] Игровые иконки загружены из react-icons/gi ✅');
    return {
      'compass': <GiTreasureMap className="w-12 h-12 text-amber-400" />,
      'telescope': <GiBinoculars className="w-12 h-12 text-blue-400" />,
      'star': <GiTrophyCup className="w-12 h-12 text-yellow-400" />,
      'flame': <GiFlame className="w-12 h-12 text-orange-400" />,
      'wrench': <GiHammerNails className="w-12 h-12 text-emerald-400" />,
      'layers': <GiBrickWall className="w-12 h-12 text-purple-400" />,
      'rocket': <GiRocketFlight className="w-12 h-12 text-cyan-400" />,
      'zap': <GiLightningHelix className="w-12 h-12 text-yellow-400" />,
      'gem': <GiCutDiamond className="w-12 h-12 text-pink-400" />,
      'crown': <GiImperialCrown className="w-12 h-12 text-yellow-400" />,
      'shield': <GiShield className="w-12 h-12 text-blue-400" />,
      'sparkles': <GiSparkles className="w-12 h-12 text-purple-400" />,
    };
  }, []);

  // Memoize level medal
  const levelMedal = useMemo(() => {
    if (stats.level >= 30) return <PlatinumMedal className="w-10 h-10" />;
    if (stats.level >= 20) return <GoldMedal className="w-10 h-10" />;
    if (stats.level >= 10) return <SilverMedal className="w-10 h-10" />;
    return <BronzeMedal className="w-10 h-10" />;
  }, [stats.level]);

  return (
    <div className="min-h-screen bg-black text-white pb-24" style={{ paddingTop: '140px' }}>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6" data-testid="gamification-hub">
      {/* User Progress Card */}
      <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {levelMedal}
              </motion.div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  Уровень {stats.level}
                </CardTitle>
                <CardDescription className="text-white/60">
                  {stats.xp} / {stats.xpToNextLevel} XP
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <GiFlame className="w-5 h-5" />
              <span className="text-2xl font-bold">{stats.streak.current}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={levelProgress} className="h-3 bg-white/10" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalXp}</div>
              <div className="text-xs text-white/60">Всего XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.streak.best}</div>
              <div className="text-xs text-white/60">Лучший стрик</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.completedTasks}</div>
              <div className="text-xs text-white/60">Выполнено</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Tasks */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GiBullseye className="w-5 h-5 text-emerald-400" />
            Ежедневные задания
          </CardTitle>
          <CardDescription className="text-white/60">
            Выполняйте задания и получайте XP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyTasks.map((task: DailyTask, index: number) => (
              <DailyTaskItem key={task.id} task={task} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GiTrophyCup className="w-5 h-5 text-emerald-400" />
            Достижения
          </CardTitle>
          <CardDescription className="text-white/60">
            Разблокируйте награды и бонусы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {stats.achievements.slice(0, 4).map((achievement: Achievement, index: number) => (
              <AchievementItem 
                key={achievement.id} 
                achievement={achievement} 
                index={index} 
                iconMap={iconMap}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GiPodium className="w-5 h-5 text-emerald-400" />
            Таблица лидеров
          </CardTitle>
          <CardDescription className="text-white/60">
            Ваша позиция: #{leaderboard.position} из {leaderboard.totalUsers.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.nearbyUsers.map((user: { rank: number; name: string; level: number; xp: number }, index: number) => (
              <div
                key={user.rank}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  user.name === 'Вы'
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-white/5'
                }`}
                data-testid={`leaderboard-${user.rank}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    user.rank <= 3
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  #{user.rank}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${
                    user.name === 'Вы' ? 'text-emerald-300' : 'text-white'
                  }`}>
                    {user.name}
                  </div>
                  <div className="text-xs text-white/50">
                    Уровень {user.level} • {user.xp.toLocaleString()} XP
                  </div>
                </div>
                {user.name === 'Вы' && (
                  <GiLaurelCrown className="w-5 h-5 text-emerald-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
}
