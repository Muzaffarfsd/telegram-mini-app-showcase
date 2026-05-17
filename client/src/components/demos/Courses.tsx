import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Heart, 
  Star, 
  Clock, 
  Play,
  Plus,
  Minus,
  X,
  ChevronRight,
  Award,
  Users,
  CheckCircle,
  BarChart3,
  Download
} from "lucide-react";
import { createProductImageErrorHandler } from "@/utils/imageUtils";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { LazyImage, UrgencyIndicator, TrustBadges } from "@/components/shared";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { useLanguage } from '../../contexts/LanguageContext';

interface CoursesProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface EnrolledCourse {
  id: number;
  name: string;
  progress: number;
  nextLesson: string;
  image: string;
}

const courses = [
  { id: 1, name: 'Основы программирования на Python', price: 49, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Изучите Python с нуля и создайте свои первые программы', category: 'Программирование', instructor: 'Алексей Петров', duration: '12 часов', lessons: 24, students: 15420, rating: 4.8, level: 'Начинающий', certificate: true, language: 'Русский' },
  { id: 2, name: 'Веб-разработка с JavaScript', price: 65, image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Создание интерактивных веб-сайтов с использованием JavaScript', category: 'Веб-разработка', instructor: 'Мария Иванова', duration: '18 часов', lessons: 36, students: 8965, rating: 4.9, level: 'Средний', certificate: true, language: 'Русский' },
  { id: 3, name: 'Дизайн интерфейсов в Figma', price: 55, image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Научитесь создавать красивые и функциональные интерфейсы', category: 'Дизайн', instructor: 'Анна Смирнова', duration: '15 часов', lessons: 30, students: 12340, rating: 4.7, level: 'Начинающий', certificate: true, language: 'Русский' },
  { id: 4, name: 'Машинное обучение для начинающих', price: 89, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Погрузитесь в мир искусственного интеллекта и машинного обучения', category: 'Data Science', instructor: 'Дмитрий Козлов', duration: '25 часов', lessons: 50, students: 6780, rating: 4.9, level: 'Продвинутый', certificate: true, language: 'Русский' },
  { id: 5, name: 'Цифровой маркетинг 2024', price: 45, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Актуальные стратегии продвижения в интернете', category: 'Маркетинг', instructor: 'Елена Волкова', duration: '10 часов', lessons: 20, students: 23450, rating: 4.6, level: 'Начинающий', certificate: true, language: 'Русский' },
  { id: 6, name: 'Фотография и обработка', price: 38, image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'От основ фотографии до профессиональной обработки в Lightroom', category: 'Творчество', instructor: 'Игорь Белов', duration: '14 часов', lessons: 28, students: 9876, rating: 4.8, level: 'Средний', certificate: true, language: 'Русский' },
  { id: 7, name: 'Excel для профессионалов', price: 35, image: 'https://images.unsplash.com/photo-1586861848620-bfe73d85fc92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Продвинутые функции Excel для анализа данных и автоматизации', category: 'Офисные программы', instructor: 'Ольга Крылова', duration: '8 часов', lessons: 16, students: 18920, rating: 4.5, level: 'Средний', certificate: true, language: 'Русский' },
  { id: 8, name: 'Мобильная разработка на React Native', price: 78, image: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Создание мобильных приложений для iOS и Android', category: 'Мобильная разработка', instructor: 'Сергей Морозов', duration: '22 часов', lessons: 44, students: 5432, rating: 4.9, level: 'Продвинутый', certificate: true, language: 'Русский' },
  { id: 9, name: 'Блокчейн и криптовалюты', price: 95, image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Понимание технологии блокчейн и криптовалютного рынка', category: 'Финтех', instructor: 'Владимир Титов', duration: '16 часов', lessons: 32, students: 3210, rating: 4.7, level: 'Продвинутый', certificate: true, language: 'Русский' },
  { id: 10, name: 'Английский для IT-специалистов', price: 42, image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Технический английский для работы в международных IT-компаниях', category: 'Языки', instructor: 'Sarah Johnson', duration: '20 часов', lessons: 40, students: 14680, rating: 4.6, level: 'Средний', certificate: true, language: 'Русский' },
  { id: 11, name: 'Стартап от идеи до продажи', price: 85, image: 'https://images.unsplash.com/photo-1556484687-30636164638b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Полный цикл создания и развития технологического стартапа', category: 'Бизнес', instructor: 'Андрей Соколов', duration: '30 часов', lessons: 60, students: 7890, rating: 4.8, level: 'Продвинутый', certificate: true, language: 'Русский' },
  { id: 12, name: 'DevOps и облачные технологии', price: 92, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Автоматизация разработки и развертывания приложений', category: 'DevOps', instructor: 'Максим Зайцев', duration: '28 часов', lessons: 56, students: 4560, rating: 4.9, level: 'Продвинутый', certificate: true, language: 'Русский' },
  { id: 13, name: 'Кибербезопасность для всех', price: 58, image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Основы защиты информации и этичного хакинга', category: 'Безопасность', instructor: 'Татьяна Белова', duration: '18 часов', lessons: 36, students: 11230, rating: 4.7, level: 'Средний', certificate: true, language: 'Русский' },
  { id: 14, name: 'Анимация и 3D-моделирование', price: 68, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Создание 3D-моделей и анимации в Blender', category: 'Творчество', instructor: 'Валентин Орлов', duration: '24 часов', lessons: 48, students: 6750, rating: 4.8, level: 'Средний', certificate: true, language: 'Русский' },
  { id: 15, name: 'Искусственный интеллект и ChatGPT', price: 72, image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Использование ИИ для повышения продуктивности в работе', category: 'ИИ и автоматизация', instructor: 'Николай Семенов', duration: '12 часов', lessons: 24, students: 19850, rating: 4.9, level: 'Начинающий', certificate: true, language: 'Русский' },
  { id: 16, name: 'Игровая разработка на Unity', price: 75, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Создание 2D и 3D игр с использованием движка Unity', category: 'Игровая разработка', instructor: 'Роман Крылов', duration: '35 часов', lessons: 70, students: 8420, rating: 4.8, level: 'Продвинутый', certificate: true, language: 'Русский' },
  { id: 17, name: 'Дата-аналитика в Python', price: 82, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Анализ данных с использованием Pandas, NumPy и Matplotlib', category: 'Data Science', instructor: 'Светлана Попова', duration: '26 часов', lessons: 52, students: 9630, rating: 4.9, level: 'Средний', certificate: true, language: 'Русский' },
  { id: 18, name: 'UI/UX дизайн мобильных приложений', price: 62, image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Проектирование пользовательского опыта для мобильных устройств', category: 'Дизайн', instructor: 'Юлия Волкова', duration: '16 часов', lessons: 32, students: 7890, rating: 4.7, level: 'Средний', certificate: true, language: 'Русский' },
  { id: 19, name: 'Контент-маркетинг и SMM', price: 48, image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Создание эффективного контента для социальных сетей', category: 'Маркетинг', instructor: 'Алина Козлова', duration: '14 часов', lessons: 28, students: 16540, rating: 4.6, level: 'Начинающий', certificate: true, language: 'Русский' },
  { id: 20, name: 'Личная эффективность и тайм-менеджмент', price: 32, image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Техники управления временем и повышения продуктивности', category: 'Саморазвитие', instructor: 'Михаил Титов', duration: '8 часов', lessons: 16, students: 25670, rating: 4.5, level: 'Начинающий', certificate: true, language: 'Русский' }
];

const categories = ['Все', 'Программирование', 'Веб-разработка', 'Дизайн', 'Data Science', 'Маркетинг', 'Творчество', 'Мобильная разработка', 'Бизнес', 'Языки', 'ИИ и автоматизация', 'Саморазвитие'];

const levels = ['Все', 'Начинающий', 'Средний', 'Продвинутый'];

const initialEnrolledCourses: EnrolledCourse[] = [
  { id: 1, name: 'Основы программирования на Python', progress: 75, nextLesson: 'Урок 18: Работа с файлами', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60' },
  { id: 3, name: 'Дизайн интерфейсов в Figma', progress: 35, nextLesson: 'Урок 11: Создание компонентов', image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60' },
];

export default function Courses({ activeTab }: CoursesProps) {
  const { t } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>(initialEnrolledCourses);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedLevel, setSelectedLevel] = useState('Все');
  const [favorites, setFavorites] = useState<number[]>([1, 2, 4, 15]);

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  const openCourseModal = (course: typeof courses[0]) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeCourseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const toggleFavorite = (courseId: number) => {
    setFavorites(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'Все' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'Все' || course.level === selectedLevel;
    
    return matchesCategory && matchesLevel;
  });

  const popularCourses = courses.filter(course => course.students > 10000);

  // Preload first 6 product images for instant visibility
  useImagePreloader({
    images: courses.slice(0, 6).map(item => item.image),
    priority: true
  });


  const renderHomeTab = () => (
    <div className="min-h-screen bg-purple-50 font-montserrat">
      <div className="max-w-md mx-auto">
        
        {/* Learning Header */}
        <div className="px-6 pt-20 pb-16 text-center">
          <div className="w-20 h-20 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-purple-900 mb-3 tracking-wide">LearnHub</h1>
          <p className="text-purple-600 text-sm font-medium">Premium Online Education</p>
        </div>

        {/* Hero Learning Section */}
        <div className="px-6 pb-20">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-purple-100 mb-12 relative">
            <LazyImage 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop&crop=center" 
              alt="Premium Online Learning"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-xl font-semibold mb-2">Expand Your Knowledge</h2>
              <p className="text-white/80 text-sm mb-4">Expert-led courses and certifications</p>
              <button 
                className="bg-white text-purple-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                onClick={() => openCourseModal(courses[0])}
              >
                Start Learning
              </button>
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="px-6 py-20 border-t border-purple-200">
          <div className="text-center mb-16">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">Learn With Excellence</h3>
            <p className="text-purple-600 text-sm font-medium leading-relaxed">
              Master new skills with industry-leading instructors and comprehensive curriculums.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 text-center">
            {[
              { number: '500+', label: 'Courses' },
              { number: '50K+', label: 'Students' },
              { number: '95%', label: 'Completion Rate' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-purple-600 mb-1">{stat.number}</div>
                <div className="text-purple-500 text-xs font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Courses */}
        <div className="px-6 py-20 border-t border-purple-200">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-lg font-semibold text-purple-900">Popular Courses</h3>
            <button 
              className="text-purple-500 text-sm font-medium hover:text-purple-600 transition-colors"
              onClick={() => setSelectedCategory('Все')}
            >
              View all
            </button>
          </div>
          
          <div className="space-y-12">
            {courses.slice(0, 2).map((course, index) => (
              <div 
                key={course.id} 
                className="group cursor-pointer"
                onClick={() => openCourseModal(course)}
              >
                <div className="aspect-[5/3] rounded-xl overflow-hidden bg-purple-100 mb-6 relative">
                  <LazyImage 
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {course.duration}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-purple-900 text-xs font-medium px-2 py-1 rounded flex items-center space-x-1">
                    <Star className="w-3 h-3 text-purple-500 fill-current" />
                    <span>{course.rating}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-purple-900 font-semibold text-base">{course.name}</h4>
                      <p className="text-purple-500 text-sm font-medium">{course.instructor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-900 font-semibold">${course.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  const renderCatalogTab = () => (
    <div className="bg-white min-h-screen">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="ios-title font-bold">Каталог курсов</h1>
      
      {/* Фильтры */}
      <div className="space-y-3">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ios-footnote font-medium ${
                selectedCategory === category
                  ? 'bg-system-indigo text-white'
                  : 'bg-quaternary-system-fill text-label'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 rounded-full whitespace-nowrap ios-caption2 font-medium ${
                selectedLevel === level
                  ? 'bg-system-purple text-white'
                  : 'bg-fill text-secondary-label'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Список курсов */}
      <div className="space-y-3">
        {filteredCourses.map((course) => (
          <div 
            key={course.id} 
            className="ios-card p-4 cursor-pointer"
            onClick={() => openCourseModal(course)}
          >
            <div className="flex items-center space-x-3">
              <LazyImage 
                src={course.image} 
                alt={course.name} 
                className="w-20 h-20 object-cover rounded-lg"
                onError={createProductImageErrorHandler('courses', 'service')}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="ios-body font-semibold line-clamp-1">{course.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(course.id);
                    }}
                    className="p-1"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(course.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-secondary-label'
                      }`} 
                    />
                  </button>
                </div>
                <p className="ios-footnote text-secondary-label mb-1">{course.instructor}</p>
                <p className="ios-caption2 text-tertiary-label mb-2 line-clamp-1">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-secondary-label" />
                      <span className="ios-caption2">{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="ios-caption2">{course.rating}</span>
                    </div>
                    <span className="ios-caption2 px-2 py-1 bg-quaternary-system-fill rounded">{course.level}</span>
                  </div>
                  <span className="ios-body font-bold text-system-indigo">${course.price}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );

  const renderCartTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="ios-title font-bold">Мои курсы</h1>
      
      {enrolledCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-quaternary-label mx-auto mb-4" />
          <p className="ios-body text-secondary-label">Нет записанных курсов</p>
          <p className="ios-footnote text-tertiary-label">Выберите курс из каталога</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="ios-card p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <LazyImage 
                    src={course.image} 
                    alt={course.name} 
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={createProductImageErrorHandler('courses', 'service')}
                  />
                  <div className="flex-1">
                    <h4 className="ios-body font-semibold line-clamp-2">{course.name}</h4>
                    <p className="ios-footnote text-secondary-label">{course.nextLesson}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="ios-footnote text-secondary-label">Прогресс обучения</span>
                    <span className="ios-footnote font-semibold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-quaternary-system-fill rounded-full h-2">
                    <div 
                      className="bg-system-indigo h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-system-indigo text-white ios-footnote font-semibold py-2 rounded-lg flex items-center justify-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Продолжить</span>
                    </button>
                    <button className="flex-1 bg-quaternary-system-fill text-label ios-footnote font-medium py-2 rounded-lg flex items-center justify-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Материалы</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ios-card p-4">
            <h3 className="ios-headline font-semibold mb-2">Статистика обучения</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="ios-title font-bold text-system-indigo">{enrolledCourses.length}</p>
                <p className="ios-footnote text-secondary-label">Активных курсов</p>
              </div>
              <div className="text-center">
                <p className="ios-title font-bold text-system-green">
                  {Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)}%
                </p>
                <p className="ios-footnote text-secondary-label">Средний прогресс</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="ios-title font-bold">Профиль студента</h1>
      
      <div className="ios-card p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-system-indigo rounded-full flex items-center justify-center">
            <span className="ios-title font-bold text-white">УХ</span>
          </div>
          <div>
            <h3 className="ios-headline font-semibold">Студент Pro</h3>
            <p className="ios-body text-secondary-label">Активный ученик</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="ios-title font-bold text-system-indigo">8</p>
            <p className="ios-footnote text-secondary-label">Завершено</p>
          </div>
          <div className="text-center">
            <p className="ios-title font-bold text-system-green">12</p>
            <p className="ios-footnote text-secondary-label">Сертификатов</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="ios-headline font-semibold">Избранные курсы</h2>
        {courses.filter(course => favorites.includes(course.id)).map((course) => (
          <div key={course.id} className="ios-card p-3 flex items-center space-x-3">
            <LazyImage 
              src={course.image} 
              alt={course.name} 
              className="w-20 h-20 object-cover rounded-lg"
              onError={createProductImageErrorHandler('courses', 'service')}
            />
            <div className="flex-1">
              <h4 className="ios-body font-semibold line-clamp-1">{course.name}</h4>
              <p className="ios-footnote text-secondary-label">{course.instructor} • ${course.price}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-tertiary-label" />
          </div>
        ))}
      </div>

      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">Достижения</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🏆', name: 'Первый курс', desc: 'Завершен' },
            { icon: '🔥', name: 'Марафонец', desc: '7 дней подряд' },
            { icon: '💎', name: 'Эксперт', desc: '5 сертификатов' }
          ].map((achievement) => (
            <div key={achievement.name} className="text-center">
              <div className="w-20 h-20 bg-quaternary-system-fill rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-xl">{achievement.icon}</span>
              </div>
              <p className="ios-caption2 font-semibold">{achievement.name}</p>
              <p className="ios-caption text-secondary-label">{achievement.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">Статистика обучения</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="ios-body">Общее время обучения:</span>
            <span className="ios-body font-medium">156 часов</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Любимая категория:</span>
            <span className="ios-body font-medium">Программирование</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Потрачено на курсы:</span>
            <span className="ios-body font-medium text-system-indigo">$425</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-system-background smooth-scroll-page">
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'catalog' && renderCatalogTab()}
        {activeTab === 'cart' && renderCartTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>

      {/* Модальное окно */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-system-background max-w-md mx-auto w-full rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="ios-title font-bold line-clamp-2">{selectedCourse.name}</h3>
              <button onClick={closeCourseModal}>
                <X className="w-6 h-6 text-secondary-label" />
              </button>
            </div>
            
            <LazyImage 
              src={selectedCourse.image} 
              alt={selectedCourse.name} 
              className="w-full h-48 object-cover rounded-xl"
              onError={createProductImageErrorHandler('courses', 'service')}
            />
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="ios-body font-medium">{selectedCourse.instructor}</span>
                <span className="px-3 py-1 rounded-full ios-caption2 font-semibold bg-quaternary-system-fill text-label">
                  {selectedCourse.level}
                </span>
              </div>
              
              <p className="ios-body text-secondary-label">{selectedCourse.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="ios-card p-3">
                  <p className="ios-caption2 text-secondary-label">Длительность</p>
                  <p className="ios-body font-semibold">{selectedCourse.duration}</p>
                </div>
                <div className="ios-card p-3">
                  <p className="ios-caption2 text-secondary-label">Уроков</p>
                  <p className="ios-body font-semibold">{selectedCourse.lessons}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ios-footnote">{selectedCourse.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-secondary-label" />
                  <span className="ios-footnote">{selectedCourse.students.toLocaleString()} студентов</span>
                </div>
                {selectedCourse.certificate && (
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-system-green" />
                    <span className="ios-footnote text-system-green">Сертификат</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="ios-title font-bold text-system-indigo">${selectedCourse.price}</span>
                <span className="px-3 py-1 rounded-full ios-caption2 font-semibold bg-system-indigo/10 text-system-indigo">
                  {selectedCourse.category}
                </span>
              </div>
              
              <button className="w-full bg-system-indigo text-white ios-body font-semibold py-3 rounded-xl">
                Записаться
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}