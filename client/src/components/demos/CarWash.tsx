import { useState } from "react";
import { 
  Car, 
  Heart,
  Clock, 
  Star, 
  MapPin, 
  Calendar,
  Plus,
  Minus,
  X,
  ChevronRight,
  Droplets,
  Shield,
  Sparkles,
  Check
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";

interface CarWashProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Booking {
  id: number;
  serviceName: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  status: 'Подтверждено' | 'В работе' | 'Завершено';
}

const services = [
  { id: 1, name: 'Экспресс мойка', price: 15, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Быстрая наружная мойка кузова и колес', category: 'Базовые услуги', duration: '20 мин', includes: ['Мойка кузова', 'Мойка колес', 'Сушка'], rating: 4.5, popular: true },
  { id: 2, name: 'Стандартная мойка', price: 25, image: 'https://images.unsplash.com/photo-1607616053700-a2d4c9d39c91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Полная мойка снаружи и пылесос салона', category: 'Базовые услуги', duration: '35 мин', includes: ['Мойка кузова', 'Мойка колес', 'Пылесос салона', 'Протирка панели'], rating: 4.7, popular: true },
  { id: 3, name: 'Комплексная мойка', price: 40, image: 'https://images.unsplash.com/photo-1590362891992-e2ffc2d1de20?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Полная мойка снаружи и внутри с уборкой салона', category: 'Базовые услуги', duration: '50 мин', includes: ['Мойка кузова', 'Мойка колес', 'Полная уборка салона', 'Чистка стекол'], rating: 4.8, popular: true },
  { id: 4, name: 'Мойка двигателя', price: 20, image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Профессиональная мойка двигателя с защитой электроники', category: 'Дополнительные услуги', duration: '25 мин', includes: ['Защита электроники', 'Мойка двигателя', 'Сушка'], rating: 4.6, popular: false },
  { id: 5, name: 'Воскование кузова', price: 35, image: 'https://images.unsplash.com/photo-1583472759196-02b0c3e1cd7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Защитное воскование для блеска и защиты лакокрасочного покрытия', category: 'Защитные покрытия', duration: '40 мин', includes: ['Воскование кузова', 'Полировка', 'Защита ЛКП'], rating: 4.9, popular: false },
  { id: 6, name: 'Полировка фар', price: 30, image: 'https://images.unsplash.com/photo-1549317336-206569e8475c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Восстановление прозрачности и яркости фар', category: 'Детейлинг', duration: '30 мин', includes: ['Шлифовка фар', 'Полировка', 'Защитное покрытие'], rating: 4.7, popular: false },
  { id: 7, name: 'Химчистка салона', price: 60, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Глубокая химчистка сидений, ковриков и обивки', category: 'Химчистка', duration: '90 мин', includes: ['Химчистка сидений', 'Чистка ковриков', 'Чистка обивки', 'Устранение запахов'], rating: 4.8, popular: true },
  { id: 8, name: 'Озонирование салона', price: 25, image: 'https://images.unsplash.com/photo-1551831961-59b2b121f833?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Дезинфекция и устранение неприятных запахов озоном', category: 'Дополнительные услуги', duration: '30 мин', includes: ['Обработка озоном', 'Дезинфекция', 'Устранение запахов'], rating: 4.5, popular: false },
  { id: 9, name: 'Керамическое покрытие', price: 150, image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Нанесение керамического покрытия для долговременной защиты', category: 'Защитные покрытия', duration: '180 мин', includes: ['Подготовка поверхности', 'Нанесение керамики', 'Полировка', 'Гарантия 2 года'], rating: 4.9, popular: false },
  { id: 10, name: 'Антидождь для стекол', price: 18, image: 'https://images.unsplash.com/photo-1595838541611-e76b73ed3a5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Обработка стекол водоотталкивающим составом', category: 'Дополнительные услуги', duration: '15 мин', includes: ['Очистка стекол', 'Нанесение состава', 'Полировка'], rating: 4.4, popular: false },
  { id: 11, name: 'Полная полировка кузова', price: 120, image: 'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Профессиональная полировка всего кузова для устранения царапин', category: 'Детейлинг', duration: '150 мин', includes: ['Подготовка поверхности', 'Абразивная полировка', 'Финишная полировка', 'Защитное покрытие'], rating: 4.9, popular: false },
  { id: 12, name: 'Чернение резины и пластика', price: 22, image: 'https://images.unsplash.com/photo-1486831111037-f5e79b97fc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Восстановление цвета резиновых и пластиковых элементов', category: 'Детейлинг', duration: '25 мин', includes: ['Очистка поверхности', 'Нанесение состава', 'Полировка'], rating: 4.3, popular: false },
  { id: 13, name: 'Удаление битумных пятен', price: 28, image: 'https://images.unsplash.com/photo-1472851187339-7ece2e80e6a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Профессиональное удаление битума и дорожной смолы', category: 'Дополнительные услуги', duration: '35 мин', includes: ['Размягчение битума', 'Удаление пятен', 'Полировка участков'], rating: 4.6, popular: false },
  { id: 14, name: 'Мойка днища', price: 18, image: 'https://images.unsplash.com/photo-1544365638-0d97af0de1ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Мойка днища автомобиля от грязи и реагентов', category: 'Дополнительные услуги', duration: '20 мин', includes: ['Мойка днища', 'Удаление реагентов', 'Антикоррозийная обработка'], rating: 4.5, popular: false },
  { id: 15, name: 'Консервация на зиму', price: 45, image: 'https://images.unsplash.com/photo-1570471160066-f740de48f6b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Комплекс процедур для подготовки авто к зимнему сезону', category: 'Сезонные услуги', duration: '60 мин', includes: ['Антикоррозийная обработка', 'Защита кузова', 'Обработка замков'], rating: 4.7, popular: false },
  { id: 16, name: 'Подготовка к лету', price: 40, image: 'https://images.unsplash.com/photo-1609378778529-b9d7a3c6b29c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Комплекс услуг для подготовки автомобиля к летнему сезону', category: 'Сезонные услуги', duration: '55 мин', includes: ['Глубокая мойка', 'Кондиционирование салона', 'Защита от УФ'], rating: 4.6, popular: false },
  { id: 17, name: 'Экспресс детейлинг', price: 80, image: 'https://images.unsplash.com/photo-1550913114-f8ba46640c4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Быстрый детейлинг для придания автомобилю выставочного вида', category: 'Детейлинг', duration: '75 мин', includes: ['Полная мойка', 'Воскование', 'Чистка салона', 'Чернение резины'], rating: 4.8, popular: true },
  { id: 18, name: 'Удаление наклеек', price: 15, image: 'https://images.unsplash.com/photo-1486831111037-f5e79b97fc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Профессиональное удаление наклеек без повреждения лакокрасочного покрытия', category: 'Дополнительные услуги', duration: '15 мин', includes: ['Размягчение клея', 'Удаление наклеек', 'Полировка поверхности'], rating: 4.2, popular: false },
  { id: 19, name: 'Антикоррозийная обработка', price: 55, image: 'https://images.unsplash.com/photo-1605515298946-d062f2598d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Защитная обработка металлических элементов от коррозии', category: 'Защитные покрытия', duration: '70 мин', includes: ['Очистка поверхности', 'Нанесение состава', 'Защита скрытых полостей'], rating: 4.7, popular: false },
  { id: 20, name: 'VIP детейлинг', price: 200, image: 'https://images.unsplash.com/photo-1621135802920-133df7cabc62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', description: 'Полный комплекс премиум услуг для идеального состояния автомобиля', category: 'VIP услуги', duration: '240 мин', includes: ['Полная полировка', 'Керамическое покрытие', 'Химчистка салона', 'Озонирование', 'Защита всех поверхностей'], rating: 5.0, popular: true }
];

const categories = ['Все', 'Базовые услуги', 'Детейлинг', 'Химчистка', 'Защитные покрытия', 'Дополнительные услуги', 'Сезонные услуги', 'VIP услуги'];

const initialBookings: Booking[] = [
  { id: 1, serviceName: 'Стандартная мойка', date: 'Завтра', time: '10:00', duration: '35 мин', price: 25, status: 'Подтверждено' },
  { id: 2, serviceName: 'Химчистка салона', date: 'Пятница', time: '14:00', duration: '90 мин', price: 60, status: 'Подтверждено' },
];

export default function CarWash({ activeTab }: CarWashProps) {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<number[]>([3, 7, 17, 20]);

  const openServiceModal = (service: typeof services[0]) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const toggleFavorite = (serviceId: number) => {
    setFavorites(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const filteredServices = selectedCategory === 'Все' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const popularServices = services.filter(service => service.popular);

  // Preload first 6 product images for instant visibility
  useImagePreloader({
    images: services.slice(0, 6).map(item => item.image),
    priority: true
  });


  const renderHomeTab = () => (
    <div className="max-w-md mx-auto px-4 space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="ios-title font-bold mb-2">Авто Блеск</h1>
        <p className="ios-subheadline text-secondary-label">Профессиональная автомойка 🚗</p>
      </div>

      {/* Быстрое бронирование */}
      <div className="ios-card p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="ios-headline font-semibold">Бронирование онлайн</h3>
            <p className="ios-body">Забронируйте время и приезжайте к назначенному часу</p>
          </div>
          <Calendar className="w-8 h-8" />
        </div>
      </div>

      {/* Популярные услуги */}
      <div>
        <h2 className="ios-title font-semibold mb-4">Популярные услуги</h2>
        <div className="grid grid-cols-2 gap-3">
          {popularServices.slice(0, 4).map((service) => (
            <div 
              key={service.id} 
              className="ios-card p-3 cursor-pointer"
              onClick={() => openServiceModal(service)}
            >
              <OptimizedImage src={service.image} alt={service.name} className="w-full h-32 object-cover rounded-lg mb-2" />
              <h4 className="ios-footnote font-semibold line-clamp-2">{service.name}</h4>
              <p className="ios-caption2 text-secondary-label mb-2">{service.duration}</p>
              <div className="flex items-center justify-between">
                <span className="ios-caption font-bold text-system-orange">${service.price}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="ios-caption2">{service.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Быстрые услуги */}
      <div>
        <h2 className="ios-title font-semibold mb-4">Экспресс услуги</h2>
        <div className="space-y-3">
          {services.filter(s => parseInt(s.duration) <= 30).slice(0, 3).map((service) => (
            <div 
              key={service.id} 
              className="ios-card p-3 cursor-pointer flex items-center space-x-3"
              onClick={() => openServiceModal(service)}
            >
              <OptimizedImage src={service.image} alt={service.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <h4 className="ios-body font-semibold">{service.name}</h4>
                <p className="ios-footnote text-secondary-label">{service.duration} • ${service.price}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-tertiary-label" />
            </div>
          ))}
        </div>
      </div>

      {/* Информация о автомойке */}
      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">Наши преимущества</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-system-orange" />
            <span className="ios-body">Работаем без выходных 8:00 - 22:00</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-system-orange" />
            <span className="ios-body">Гарантия качества на все услуги</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-system-orange" />
            <span className="ios-body">Профессиональная косметика и оборудование</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCatalogTab = () => (
    <div className="bg-white min-h-screen">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="ios-title font-bold">Каталог услуг</h1>
      
      {/* Категории */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ios-footnote font-medium ${
              selectedCategory === category
                ? 'bg-system-orange text-white'
                : 'bg-quaternary-system-fill text-label'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Список услуг */}
      <div className="space-y-3">
        {filteredServices.map((service) => (
          <div 
            key={service.id} 
            className="ios-card p-4 cursor-pointer"
            onClick={() => openServiceModal(service)}
          >
            <div className="flex items-center space-x-3">
              <OptimizedImage src={service.image} alt={service.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="ios-body font-semibold">{service.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(service.id);
                    }}
                    className="p-1"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(service.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-secondary-label'
                      }`} 
                    />
                  </button>
                </div>
                <p className="ios-footnote text-secondary-label mb-2 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-secondary-label" />
                      <span className="ios-caption2">{service.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ios-caption2">{service.rating}</span>
                    </div>
                    {service.popular && (
                      <span className="px-2 py-1 rounded-full ios-caption2 font-semibold bg-system-orange/10 text-system-orange">
                        Популярно
                      </span>
                    )}
                  </div>
                  <span className="ios-body font-bold text-system-orange">${service.price}</span>
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
      <h1 className="ios-title font-bold">Мои записи</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-quaternary-label mx-auto mb-4" />
          <p className="ios-body text-secondary-label">Нет активных записей</p>
          <p className="ios-footnote text-tertiary-label">Забронируйте услугу из каталога</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="ios-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="ios-body font-semibold">{booking.serviceName}</h4>
                  <span className={`px-2 py-1 rounded-full ios-caption2 font-semibold ${
                    booking.status === 'Подтверждено' ? 'bg-green-100 text-green-700' :
                    booking.status === 'В работе' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-secondary-label" />
                    <span className="ios-footnote">{booking.date}, {booking.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-secondary-label" />
                    <span className="ios-footnote">Длительность: {booking.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="ios-body font-bold text-system-orange">${booking.price}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button className="flex-1 bg-quaternary-system-fill text-label ios-footnote font-medium py-2 rounded-lg">
                    Перенести
                  </button>
                  <button className="flex-1 bg-system-red text-white ios-footnote font-medium py-2 rounded-lg">
                    Отменить
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="ios-card p-4">
            <h3 className="ios-headline font-semibold mb-2">Итого записей: {bookings.length}</h3>
            <p className="ios-body text-secondary-label">Общая стоимость: ${bookings.reduce((sum, booking) => sum + booking.price, 0)}</p>
          </div>

          {/* Адрес автомойки */}
          <div className="ios-card p-4 bg-system-orange/5 border border-system-orange/20">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-system-orange" />
              <span className="ios-body font-semibold text-system-orange">Как нас найти</span>
            </div>
            <p className="ios-footnote text-secondary-label">
              ул. Автомойщиков, 15 (рядом с заправкой Shell)
            </p>
            <p className="ios-footnote text-secondary-label">
              Работаем: 8:00 - 22:00, без выходных
            </p>
          </div>
        </>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="ios-title font-bold">Профиль автовладельца</h1>
      
      <div className="ios-card p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-system-orange rounded-full flex items-center justify-center">
            <span className="ios-title font-bold text-white">АБ</span>
          </div>
          <div>
            <h3 className="ios-headline font-semibold">Авто Блеск VIP</h3>
            <p className="ios-body text-secondary-label">Постоянный клиент</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="ios-title font-bold text-system-orange">31</p>
            <p className="ios-footnote text-secondary-label">Посещений</p>
          </div>
          <div className="text-center">
            <p className="ios-title font-bold text-system-green">10%</p>
            <p className="ios-footnote text-secondary-label">Скидка</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="ios-headline font-semibold">Избранные услуги</h2>
        {services.filter(service => favorites.includes(service.id)).map((service) => (
          <div key={service.id} className="ios-card p-3 flex items-center space-x-3">
            <OptimizedImage src={service.image} alt={service.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h4 className="ios-body font-semibold">{service.name}</h4>
              <p className="ios-footnote text-secondary-label">${service.price} • {service.duration}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-tertiary-label" />
          </div>
        ))}
      </div>

      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">История обслуживания</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="ios-body">Последнее посещение:</span>
            <span className="ios-body font-medium">14 дек 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Любимая услуга:</span>
            <span className="ios-body font-medium">Комплексная мойка</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Потрачено всего:</span>
            <span className="ios-body font-medium text-system-orange">$1,240</span>
          </div>
        </div>
      </div>

      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">Мой автомобиль</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="ios-body">Марка:</span>
            <span className="ios-body font-medium">BMW X5</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Год:</span>
            <span className="ios-body font-medium">2022</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Цвет:</span>
            <span className="ios-body font-medium">Черный металлик</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-system-background">
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'catalog' && renderCatalogTab()}
        {activeTab === 'cart' && renderCartTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>

      {/* Модальное окно */}
      {isModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-system-background max-w-md mx-auto w-full rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="ios-title font-bold line-clamp-2">{selectedService.name}</h3>
              <button onClick={closeServiceModal}>
                <X className="w-6 h-6 text-secondary-label" />
              </button>
            </div>
            
            <OptimizedImage src={selectedService.image} alt={selectedService.name} className="w-full h-48 object-cover rounded-xl" />
            
            <div className="space-y-3">
              <p className="ios-body text-secondary-label">{selectedService.description}</p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-secondary-label" />
                  <span className="ios-footnote">{selectedService.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ios-footnote">{selectedService.rating}</span>
                </div>
                <span className="px-3 py-1 rounded-full ios-caption2 font-semibold bg-quaternary-system-fill text-label">
                  {selectedService.category}
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="ios-body font-semibold">Что включено:</h4>
                <div className="space-y-1">
                  {selectedService.includes.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-system-green" />
                      <span className="ios-footnote text-secondary-label">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="ios-title font-bold text-system-orange">${selectedService.price}</span>
                {selectedService.popular && (
                  <span className="px-3 py-1 rounded-full ios-caption2 font-semibold bg-system-orange/10 text-system-orange">
                    Популярная услуга
                  </span>
                )}
              </div>
              
              <button className="w-full bg-system-orange text-white ios-body font-semibold py-3 rounded-xl">
                Забронировать услугу
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}