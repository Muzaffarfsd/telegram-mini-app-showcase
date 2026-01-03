import { useState, useEffect, memo } from "react";
import { m } from "framer-motion";
import { 
  Dumbbell, 
  Heart, 
  Star, 
  X,
  ChevronLeft,
  Calendar,
  User,
  Trophy,
  Flame,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Award
} from "lucide-react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { LazyImage, UrgencyIndicator, TrustBadges } from "@/components/shared";
import { useLanguage } from '../../contexts/LanguageContext';

interface FitnessProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Workout {
  id: number;
  name: string;
  duration: number;
  calories: number;
  image: string;
  description: string;
  category: string;
  level: 'Начальный' | 'Средний' | 'Продвинутый';
  trainer: string;
  rating: number;
  isNew?: boolean;
  isPopular?: boolean;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  unlocked: boolean;
}

const workouts: Workout[] = [
  { id: 1, name: 'HIIT Кардио', duration: 30, calories: 350, image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=1200&fit=crop&q=90', description: 'Интенсивная кардио тренировка', category: 'Кардио', level: 'Средний', trainer: 'Анна Петрова', rating: 4.9, isPopular: true },
  { id: 2, name: 'Йога для начинающих', duration: 45, calories: 180, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=1200&fit=crop&q=90', description: 'Мягкая йога для гибкости', category: 'Йога', level: 'Начальный', trainer: 'Мария Иванова', rating: 4.8, isPopular: true },
  { id: 3, name: 'Силовая тренировка', duration: 60, calories: 420, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=1200&fit=crop&q=90', description: 'Тренировка всех групп мышц', category: 'Силовые', level: 'Продвинутый', trainer: 'Дмитрий Соколов', rating: 5.0, isNew: true, isPopular: true },
  { id: 4, name: 'Пилатес', duration: 40, calories: 200, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=1200&fit=crop&q=90', description: 'Укрепление кора и осанки', category: 'Пилатес', level: 'Средний', trainer: 'Елена Волкова', rating: 4.7, isNew: true },
  { id: 5, name: 'Бокс для фитнеса', duration: 45, calories: 500, image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=1200&fit=crop&q=90', description: 'Боксерская тренировка', category: 'Кардио', level: 'Продвинутый', trainer: 'Игорь Петров', rating: 4.9, isPopular: true },
  { id: 6, name: 'Растяжка', duration: 25, calories: 100, image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&h=1200&fit=crop&q=90', description: 'Глубокая растяжка мышц', category: 'Растяжка', level: 'Начальный', trainer: 'Ольга Смирнова', rating: 4.6 },
  { id: 7, name: 'Функциональный тренинг', duration: 50, calories: 380, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1200&fit=crop&q=90', description: 'Упражнения для повседневной жизни', category: 'Функциональные', level: 'Средний', trainer: 'Сергей Новиков', rating: 4.8, isNew: true },
  { id: 8, name: 'Табата', duration: 20, calories: 280, image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&h=1200&fit=crop&q=90', description: 'Интервальная высокоинтенсивная тренировка', category: 'Кардио', level: 'Продвинутый', trainer: 'Анна Петрова', rating: 5.0, isPopular: true },
];

const categories = ['Все', 'Кардио', 'Силовые', 'Йога', 'Пилатес', 'Растяжка', 'Функциональные'];

const collections = [
  {
    id: 1,
    title: 'Жиросжигание',
    subtitle: 'Интенсивные тренировки',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-orange-600/30 to-red-600/30',
    workouts: [1, 5, 8]
  },
  {
    id: 2,
    title: 'Сила и выносливость',
    subtitle: 'Мощные тренировки',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-purple-600/30 to-indigo-600/30',
    workouts: [3, 7]
  },
  {
    id: 3,
    title: 'Гибкость и баланс',
    subtitle: 'Спокойные практики',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-green-600/30 to-emerald-600/30',
    workouts: [2, 4, 6]
  },
];

export default memo(function Fitness({ activeTab }: FitnessProps) {
  const { t } = useLanguage();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 2, 3]));
  
  const [stats, setStats] = useState({
    workoutsCompleted: 47,
    totalMinutes: 1840,
    caloriesBurned: 15680,
    streak: 12,
  });

  const [achievements] = useState<Achievement[]>([
    { id: 1, title: 'Первая тренировка', description: 'Завершите свою первую тренировку', icon: '🎯', progress: 1, total: 1, unlocked: true },
    { id: 2, title: 'Марафонец', description: 'Завершите 50 тренировок', icon: '🏃', progress: 47, total: 50, unlocked: false },
    { id: 3, title: 'Мастер огня', description: 'Сожгите 20000 калорий', icon: '🔥', progress: 15680, total: 20000, unlocked: false },
    { id: 4, title: 'Стальная воля', description: 'Серия из 30 дней', icon: '💪', progress: 12, total: 30, unlocked: false },
  ]);

  useEffect(() => {
    scrollToTop();
    if (activeTab !== 'catalog') {
      setSelectedWorkout(null);
    }
  }, [activeTab]);

  const filteredWorkouts = workouts.filter(w => 
    selectedCategory === 'Все' || w.category === selectedCategory
  );

  const toggleFavorite = (workoutId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(workoutId)) {
      newFavorites.delete(workoutId);
    } else {
      newFavorites.add(workoutId);
    }
    setFavorites(newFavorites);
  };

  const startWorkout = (workout: Workout) => {
    setStats(prev => ({
      workoutsCompleted: prev.workoutsCompleted + 1,
      totalMinutes: prev.totalMinutes + workout.duration,
      caloriesBurned: prev.caloriesBurned + workout.calories,
      streak: prev.streak,
    }));
    setSelectedWorkout(null);
  };

  if (activeTab === 'home') {
    return (
      <div className="h-full overflow-y-auto smooth-scroll-page">
        <div className="relative h-[280px] bg-gradient-to-br from-orange-600/20 via-red-500/20 to-pink-600/20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop&q=90')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-end p-6 pb-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/20 backdrop-blur-xl rounded-xl border border-orange-400/30">
                  <Dumbbell className="w-6 h-6 text-orange-300" />
                </div>
                <h1 className="text-3xl font-bold text-white">FitPro</h1>
              </div>
              <p className="text-white/80">Твой путь к идеальной форме</p>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="px-3 py-2 bg-orange-500/20 backdrop-blur-xl rounded-xl border border-orange-400/30">
                  <p className="text-orange-200 text-xs">Тренировок</p>
                  <p className="text-white text-lg font-bold">{stats.workoutsCompleted}</p>
                </div>
                <div className="px-3 py-2 bg-red-500/20 backdrop-blur-xl rounded-xl border border-red-400/30">
                  <p className="text-red-200 text-xs">Калорий</p>
                  <p className="text-white text-lg font-bold">{stats.caloriesBurned.toLocaleString('ru-RU')}</p>
                </div>
              </div>
            </m.div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl border border-orange-400/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-bold text-lg">{stats.streak} дней</h3>
                  <p className="text-sm text-orange-300">Текущая серия</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">{stats.totalMinutes}</p>
                <p className="text-xs text-orange-300">минут всего</p>
              </div>
            </div>
            <div className="h-2 bg-orange-900/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                style={{ width: `${(stats.streak / 30) * 100}%` }}
              />
            </div>
            <p className="text-xs text-orange-300 mt-2">До достижения "Стальная воля": {30 - stats.streak} дней</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Программы тренировок</h2>
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <div className="grid gap-3">
              {collections.map((collection) => (
                <m.div
                  key={collection.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-32 rounded-2xl overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${collection.image})` }} />
                  <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-r from-black/60 to-transparent" />
                  <div className={`absolute inset-0 bg-gradient-to-r ${collection.gradient}`} />
                  
                  <div className="relative h-full p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{collection.title}</h3>
                      <p className="text-white/80 text-sm">{collection.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                      {workouts.filter(w => collection.workouts.includes(w.id)).slice(0, 3).map(workout => (
                        <div key={workout.id} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30">
                          <LazyImage src={workout.image} alt={workout.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Популярное</h2>
              <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {workouts.filter(w => w.isPopular).map((workout) => (
                <m.div
                  key={workout.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedWorkout(workout)}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover-elevate active-elevate-2 cursor-pointer"
                  data-testid={`card-workout-${workout.id}`}
                >
                  <div className="relative aspect-[3/4]">
                    <LazyImage src={workout.image} alt={workout.name} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(workout.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                      data-testid={`button-favorite-${workout.id}`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(workout.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-xl rounded-full border border-white/20">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {workout.calories} ккал
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium mb-1 line-clamp-1">{workout.name}</h3>
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {workout.duration} мин
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                        <span>{workout.rating}</span>
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'catalog') {
    if (selectedWorkout) {
      return (
        <div className="h-full flex flex-col bg-[#0A0A0A] smooth-scroll-page">
          <div className="relative">
            <div className="aspect-[3/4] relative">
              <LazyImage src={selectedWorkout.image} alt={selectedWorkout.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedWorkout(null)}
                className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                data-testid="button-back"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => toggleFavorite(selectedWorkout.id)}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                data-testid={`button-favorite-detail-${selectedWorkout.id}`}
              >
                <Heart className={`w-6 h-6 ${favorites.has(selectedWorkout.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold">{selectedWorkout.name}</h1>
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/10 rounded-full">
                  <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                  <span className="font-bold text-orange-600">{selectedWorkout.rating}</span>
                </div>
              </div>
              <p className="text-white/60 mb-3">{selectedWorkout.description}</p>
              <p className="text-sm text-white/60">Тренер: {selectedWorkout.trainer}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                <p className="text-sm font-bold">{selectedWorkout.duration} мин</p>
              </div>
              <div className="p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 text-red-600" />
                <p className="text-sm font-bold">{selectedWorkout.calories} ккал</p>
              </div>
              <div className="p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-center">
                <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-bold">{selectedWorkout.level}</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-xl border border-orange-400/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-orange-600" />
                <p className="font-semibold text-orange-100">Трекер достижений</p>
              </div>
              <p className="text-sm text-orange-200">
                Завершите эту тренировку и получите +{selectedWorkout.calories} калорий к статистике
              </p>
            </div>

            <button
              onClick={() => startWorkout(selectedWorkout)}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-2xl hover-elevate active-elevate-2 flex items-center justify-center gap-2"
              data-testid="button-start-workout"
            >
              <Zap className="w-5 h-5" />
              Начать тренировку
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto smooth-scroll-page">
        <div className="sticky top-0 z-10 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10 px-4 py-5">
          <h1 className="text-2xl font-bold mb-4">Тренировки</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 hover-elevate'
                }`}
                data-testid={`button-category-${category}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {filteredWorkouts.map((workout) => (
            <m.div
              key={workout.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedWorkout(workout)}
              className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover-elevate active-elevate-2 cursor-pointer"
              data-testid={`card-catalog-workout-${workout.id}`}
            >
              <div className="relative aspect-[3/4]">
                <LazyImage src={workout.image} alt={workout.name} className="w-full h-full object-cover" />
                {workout.isNew && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 backdrop-blur-xl rounded-full border border-green-400/50">
                    <span className="text-xs font-bold text-white">Новинка</span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(workout.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                  data-testid={`button-favorite-catalog-${workout.id}`}
                >
                  <Heart className={`w-4 h-4 ${favorites.has(workout.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-xl rounded-full border border-white/20">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {workout.calories} ккал
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium mb-1 line-clamp-1">{workout.name}</h3>
                <p className="text-xs text-white/60 mb-2 line-clamp-1">{workout.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-white/60">
                    <Clock className="w-3 h-3" />
                    {workout.duration} мин
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                    <span className="text-sm font-medium">{workout.rating}</span>
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="h-full overflow-y-auto smooth-scroll-page">
        <div className="p-6 bg-white/10 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Алексей Кузнецов</h2>
              <p className="text-sm text-white/60">+7 (999) 888-77-66</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 bg-orange-500/20 backdrop-blur-xl rounded-xl border border-orange-400/30">
              <p className="text-sm text-white/60 mb-1">Тренировки</p>
              <p className="text-2xl font-bold text-orange-600">{stats.workoutsCompleted}</p>
            </div>
            <div className="p-4 bg-red-500/20 backdrop-blur-xl rounded-xl border border-red-400/30">
              <p className="text-sm text-white/60 mb-1">Калорий</p>
              <p className="text-2xl font-bold text-red-600">{stats.caloriesBurned.toLocaleString('ru-RU')}</p>
            </div>
            <div className="p-4 bg-purple-500/20 backdrop-blur-xl rounded-xl border border-purple-400/30">
              <p className="text-sm text-white/60 mb-1">Минут</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalMinutes}</p>
            </div>
            <div className="p-4 bg-green-500/20 backdrop-blur-xl rounded-xl border border-green-400/30">
              <p className="text-sm text-white/60 mb-1">Серия</p>
              <p className="text-2xl font-bold text-green-600">{stats.streak} дней</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              Достижения
            </h3>
            <div className="grid gap-3">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 ${
                    achievement.unlocked ? 'bg-green-500/5 border-green-400/30' : ''
                  }`}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        {achievement.unlocked && (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 rounded-full">
                            Получено
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/60 mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60 whitespace-nowrap">
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-history">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-white/60" />
              <span className="font-medium">История тренировок</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/60" />
          </button>
        </div>
      </div>
    );
  }

  return null;
});
