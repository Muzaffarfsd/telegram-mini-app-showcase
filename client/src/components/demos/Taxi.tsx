import { useState } from "react";
import { 
  Car, 
  Heart, 
  Star, 
  MapPin, 
  Clock,
  Plus,
  Minus,
  X,
  ChevronRight,
  Navigation,
  Shield,
  CreditCard,
  User,
  Phone
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";

interface TaxiProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Trip {
  id: number;
  from: string;
  to: string;
  date: string;
  price: number;
  status: 'Завершена' | 'В пути' | 'Ожидает';
  driver: string;
  car: string;
}

const drivers = [
  { id: 1, name: 'Александр Петров', car: 'Toyota Camry', year: 2020, plate: 'А123БВ777', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.9, trips: 2840, category: 'Эконом', price: 8, features: ['Кондиционер', 'Музыка', 'USB зарядка'], eta: '3 мин', distance: '0.8 км' },
  { id: 2, name: 'Михаил Иванов', car: 'BMW 3 Series', year: 2021, plate: 'В456ГД777', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.8, trips: 1920, category: 'Комфорт', price: 12, features: ['Кожаные сиденья', 'Wi-Fi', 'Минеральная вода'], eta: '5 мин', distance: '1.2 км' },
  { id: 3, name: 'Дмитрий Сидоров', car: 'Mercedes E-Class', year: 2022, plate: 'С789ЕЖ777', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 5.0, trips: 1150, category: 'Бизнес', price: 18, features: ['Премиум салон', 'Шампанское', 'Газеты'], eta: '7 мин', distance: '2.1 км' },
  { id: 4, name: 'Сергей Козлов', car: 'Kia Rio', year: 2019, plate: 'Д012ЗИ777', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.7, trips: 3560, category: 'Эконом', price: 7, features: ['Кондиционер', 'Радио'], eta: '4 мин', distance: '1.0 км' },
  { id: 5, name: 'Анатолий Волков', car: 'Hyundai Solaris', year: 2020, plate: 'Е345КЛ777', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.6, trips: 2180, category: 'Эконом', price: 8, features: ['Кондиционер', 'Bluetooth'], eta: '6 мин', distance: '1.5 км' },
  { id: 6, name: 'Владимир Новиков', car: 'Audi A6', year: 2021, plate: 'Ж678МН777', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.9, trips: 980, category: 'Бизнес', price: 20, features: ['Премиум салон', 'Массаж сидений', 'Климат-контроль'], eta: '10 мин', distance: '3.2 км' },
  { id: 7, name: 'Игорь Смирнов', car: 'Volkswagen Polo', year: 2020, plate: 'З901ОП777', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.5, trips: 2670, category: 'Эконом', price: 8, features: ['Кондиционер', 'USB'], eta: '8 мин', distance: '2.0 км' },
  { id: 8, name: 'Роман Федоров', car: 'Lexus GS', year: 2022, plate: 'И234РС777', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 5.0, trips: 640, category: 'Премиум', price: 25, features: ['VIP салон', 'Личный водитель', 'Закуски'], eta: '12 мин', distance: '4.0 км' },
  { id: 9, name: 'Евгений Морозов', car: 'Skoda Rapid', year: 2019, plate: 'К567ТУ777', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.4, trips: 4120, category: 'Эконом', price: 7, features: ['Радио', 'Кондиционер'], eta: '5 мин', distance: '1.1 км' },
  { id: 10, name: 'Павел Орлов', car: 'Nissan Sentra', year: 2020, plate: 'Л890ФХ777', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.6, trips: 1890, category: 'Комфорт', price: 11, features: ['Кожаный салон', 'Музыка', 'Wi-Fi'], eta: '9 мин', distance: '2.8 км' },
  { id: 11, name: 'Олег Крылов', car: 'Ford Focus', year: 2021, plate: 'М123ЦЧ777', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.7, trips: 2340, category: 'Комфорт', price: 10, features: ['Подогрев сидений', 'Bluetooth', 'Зарядка'], eta: '7 мин', distance: '1.8 км' },
  { id: 12, name: 'Виктор Зайцев', car: 'Renault Logan', year: 2019, plate: 'Н456ШЩ777', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.3, trips: 5670, category: 'Эконом', price: 6, features: ['Кондиционер'], eta: '11 мин', distance: '3.5 км' },
  { id: 13, name: 'Геннадий Белов', car: 'Mazda 6', year: 2020, plate: 'О789ЪЫ777', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.8, trips: 1560, category: 'Комфорт', price: 13, features: ['Премиум аудио', 'Кожа', 'Климат'], eta: '6 мин', distance: '1.6 км' },
  { id: 14, name: 'Алексей Тихонов', car: 'Chevrolet Cruze', year: 2021, plate: 'П012ЬЭ777', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.5, trips: 2890, category: 'Эконом', price: 8, features: ['USB зарядка', 'Кондиционер'], eta: '14 мин', distance: '4.2 км' },
  { id: 15, name: 'Константин Попов', car: 'Infiniti Q50', year: 2022, plate: 'Р345ЮЯ777', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.9, trips: 780, category: 'Премиум', price: 22, features: ['VIP салон', 'Массаж', 'Шампанское'], eta: '15 мин', distance: '5.0 км' },
  { id: 16, name: 'Станислав Гусев', car: 'Lada Vesta', year: 2020, plate: 'С678АБ777', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.2, trips: 3450, category: 'Эконом', price: 6, features: ['Радио'], eta: '13 мин', distance: '3.8 км' },
  { id: 17, name: 'Денис Соколов', car: 'Peugeot 408', year: 2021, plate: 'Т901ВГ777', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.6, trips: 1670, category: 'Комфорт', price: 12, features: ['Панорамная крыша', 'Wi-Fi', 'Климат'], eta: '16 мин', distance: '5.5 км' },
  { id: 18, name: 'Артём Лебедев', car: 'Mitsubishi Lancer', year: 2019, plate: 'У234ДЕ777', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.4, trips: 2980, category: 'Эконом', price: 7, features: ['Кондиционер', 'Bluetooth'], eta: '18 мин', distance: '6.0 км' },
  { id: 19, name: 'Валерий Кузнецов', car: 'Jaguar XF', year: 2022, plate: 'Ф567ЖЗ777', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 5.0, trips: 420, category: 'Люкс', price: 30, features: ['Люкс салон', 'Персональный водитель', 'Встреча с табличкой'], eta: '20 мин', distance: '7.2 км' },
  { id: 20, name: 'Максим Ефимов', car: 'Honda Civic', year: 2020, plate: 'Х890ИК777', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400', rating: 4.7, trips: 2150, category: 'Комфорт', price: 11, features: ['Спортивный салон', 'Подогрев', 'Премиум звук'], eta: '22 мин', distance: '8.0 км' }
];

const categories = ['Все', 'Эконом', 'Комфорт', 'Бизнес', 'Премиум', 'Люкс'];

const initialTrips: Trip[] = [
  { id: 1, from: 'Красная площадь', to: 'Домодедово', date: 'Сегодня 14:30', price: 45, status: 'В пути', driver: 'Александр П.', car: 'Toyota Camry' },
  { id: 2, from: 'Тверская, 15', to: 'Ленинский пр., 99', date: 'Вчера 09:15', price: 18, status: 'Завершена', driver: 'Михаил И.', car: 'BMW 3 Series' },
];

export default function Taxi({ activeTab }: TaxiProps) {
  const [selectedDriver, setSelectedDriver] = useState<typeof drivers[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<number[]>([1, 2, 3, 6]);
  const [currentLocation] = useState('Тверская площадь');
  const [destination, setDestination] = useState('');

  const openDriverModal = (driver: typeof drivers[0]) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const closeDriverModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  const toggleFavorite = (driverId: number) => {
    setFavorites(prev => 
      prev.includes(driverId) 
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const filteredDrivers = selectedCategory === 'Все' 
    ? drivers 
    : drivers.filter(driver => driver.category === selectedCategory);

  // Preload first 6 product images for instant visibility
  useImagePreloader({
    images: drivers.slice(0, 6).map(item => item.image),
    priority: true
  });


  const renderHomeTab = () => (
    <div className="min-h-screen bg-yellow-50 font-montserrat">
      <div className="max-w-md mx-auto">
        
        {/* Modern Taxi Header */}
        <div className="px-6 pt-20 pb-16 text-center">
          <div className="w-20 h-20 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-8">
            <Car className="w-6 h-6 text-yellow-900" />
          </div>
          <h1 className="text-2xl font-semibold text-yellow-900 mb-3 tracking-wide">CityRide</h1>
          <p className="text-yellow-600 text-sm font-medium">Premium Urban Transport</p>
        </div>

        {/* Hero Taxi Section */}
        <div className="px-6 pb-20">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-yellow-100 mb-12 relative">
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop&crop=center" 
              alt="Premium City Transportation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/80 via-yellow-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-xl font-semibold mb-2">Your Ride Awaits</h2>
              <p className="text-white/80 text-sm mb-4">Professional drivers, premium vehicles</p>
              <button 
                className="bg-white text-yellow-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
                onClick={() => openDriverModal(drivers[0])}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Service Stats */}
        <div className="px-6 py-20 border-t border-yellow-200">
          <div className="text-center mb-16">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">Why Choose Us</h3>
            <p className="text-yellow-600 text-sm font-medium leading-relaxed">
              Fast, reliable, and comfortable rides across the city.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 text-center">
            {[
              { number: '5 min', label: 'Average Wait' },
              { number: '4.9★', label: 'Rating' },
              { number: '50K+', label: 'Rides Daily' },
              { number: '24/7', label: 'Available' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-yellow-600 mb-1">{stat.number}</div>
                <div className="text-yellow-500 text-xs font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Drivers */}
        <div className="px-6 py-20 border-t border-yellow-200">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-lg font-semibold text-yellow-900">Available Drivers</h3>
            <button 
              className="text-yellow-500 text-sm font-medium hover:text-yellow-600 transition-colors"
              onClick={() => setSelectedCategory('Все')}
            >
              View all
            </button>
          </div>
          
          <div className="space-y-12">
            {drivers.slice(0, 2).map((driver, index) => (
              <div 
                key={driver.id} 
                className="group cursor-pointer"
                onClick={() => openDriverModal(driver)}
              >
                <div className="aspect-[5/3] rounded-xl overflow-hidden bg-yellow-100 mb-6 relative">
                  <OptimizedImage 
                    src={index === 0 ? 
                      "https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=800&h=480&fit=crop&crop=center" : 
                      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=480&fit=crop&crop=center"
                    }
                    alt={driver.car}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                    {driver.eta}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-yellow-900 text-xs font-medium px-2 py-1 rounded flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span>{driver.rating}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-yellow-900 font-semibold text-base">{driver.name}</h4>
                      <p className="text-yellow-500 text-sm font-medium">{driver.car} • {driver.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-900 font-semibold">${driver.price}/km</p>
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
        <h1 className="ios-title font-bold">Доступные водители</h1>
      
      {/* Фильтр по категориям */}
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

      {/* Список водителей */}
      <div className="space-y-3">
        {filteredDrivers.map((driver) => (
          <div 
            key={driver.id} 
            className="ios-card p-4 cursor-pointer"
            onClick={() => openDriverModal(driver)}
          >
            <div className="flex items-center space-x-3">
              <OptimizedImage src={driver.image} alt={driver.name} className="w-20 h-20 object-cover rounded-full" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="ios-body font-semibold">{driver.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(driver.id);
                    }}
                    className="p-1"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(driver.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-secondary-label'
                      }`} 
                    />
                  </button>
                </div>
                <p className="ios-footnote text-secondary-label mb-1">{driver.car} ({driver.year}) • {driver.plate}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="ios-caption2 px-2 py-1 bg-quaternary-system-fill rounded">{driver.category}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="ios-caption2">{driver.rating}</span>
                    </div>
                    <span className="ios-caption2 text-secondary-label">{driver.trips} поездок</span>
                  </div>
                  <div className="text-right">
                    <p className="ios-body font-bold text-system-orange">от ${driver.price}</p>
                    <p className="ios-footnote text-system-green">{driver.eta}</p>
                  </div>
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
      <h1 className="ios-title font-bold">Мои поездки</h1>
      
      {trips.length === 0 ? (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-quaternary-label mx-auto mb-4" />
          <p className="ios-body text-secondary-label">Нет поездок</p>
          <p className="ios-footnote text-tertiary-label">Закажите первую поездку</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip.id} className="ios-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-system-green rounded-full"></div>
                      <span className="ios-footnote text-secondary-label">{trip.from}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-system-red rounded-full"></div>
                      <span className="ios-footnote text-secondary-label">{trip.to}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full ios-caption2 font-semibold ${
                    trip.status === 'Завершена' ? 'bg-green-100 text-green-700' :
                    trip.status === 'В пути' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {trip.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="ios-footnote text-secondary-label">Водитель:</span>
                    <span className="ios-footnote font-medium">{trip.driver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="ios-footnote text-secondary-label">Автомобиль:</span>
                    <span className="ios-footnote font-medium">{trip.car}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="ios-footnote text-secondary-label">Дата:</span>
                    <span className="ios-footnote font-medium">{trip.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="ios-body font-semibold">Стоимость:</span>
                    <span className="ios-body font-bold text-system-orange">${trip.price}</span>
                  </div>
                </div>

                {trip.status === 'В пути' && (
                  <div className="flex space-x-2 mt-3">
                    <button className="flex-1 bg-system-orange text-white ios-footnote font-semibold py-2 rounded-lg">
                      Отследить поездку
                    </button>
                    <button className="flex-1 bg-quaternary-system-fill text-label ios-footnote font-medium py-2 rounded-lg">
                      Связаться с водителем
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ios-card p-4">
            <h3 className="ios-headline font-semibold mb-2">Статистика поездок</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="ios-title font-bold text-system-orange">{trips.length}</p>
                <p className="ios-footnote text-secondary-label">Всего поездок</p>
              </div>
              <div className="text-center">
                <p className="ios-title font-bold text-system-green">
                  ${trips.reduce((sum, trip) => sum + trip.price, 0)}
                </p>
                <p className="ios-footnote text-secondary-label">Общая стоимость</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="ios-title font-bold">Профиль пассажира</h1>
      
      <div className="ios-card p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-system-orange rounded-full flex items-center justify-center">
            <span className="ios-title font-bold text-white">СТ</span>
          </div>
          <div>
            <h3 className="ios-headline font-semibold">Премиум пассажир</h3>
            <p className="ios-body text-secondary-label">Постоянный клиент</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="ios-title font-bold text-system-orange">87</p>
            <p className="ios-footnote text-secondary-label">Поездок</p>
          </div>
          <div className="text-center">
            <p className="ios-title font-bold text-system-yellow">4.9</p>
            <p className="ios-footnote text-secondary-label">Рейтинг</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="ios-headline font-semibold">Избранные водители</h2>
        {drivers.filter(driver => favorites.includes(driver.id)).map((driver) => (
          <div key={driver.id} className="ios-card p-3 flex items-center space-x-3">
            <OptimizedImage src={driver.image} alt={driver.name} className="w-20 h-20 object-cover rounded-full" />
            <div className="flex-1">
              <h4 className="ios-body font-semibold">{driver.name}</h4>
              <p className="ios-footnote text-secondary-label">{driver.car} • {driver.rating} ⭐</p>
            </div>
            <ChevronRight className="w-5 h-5 text-tertiary-label" />
          </div>
        ))}
      </div>

      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">Способы оплаты</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-system-blue" />
            <div className="flex-1">
              <p className="ios-body font-medium">•••• 4589</p>
              <p className="ios-footnote text-secondary-label">Visa</p>
            </div>
            <span className="ios-caption2 px-2 py-1 bg-system-blue/10 text-system-blue rounded">Основная</span>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-system-purple" />
            <div className="flex-1">
              <p className="ios-body font-medium">•••• 7821</p>
              <p className="ios-footnote text-secondary-label">MasterCard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="ios-card p-4">
        <h3 className="ios-headline font-semibold mb-3">Статистика</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="ios-body">Любимый тариф:</span>
            <span className="ios-body font-medium">Комфорт</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Средняя поездка:</span>
            <span className="ios-body font-medium">$15</span>
          </div>
          <div className="flex justify-between">
            <span className="ios-body">Потрачено всего:</span>
            <span className="ios-body font-medium text-system-orange">$1,290</span>
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
      {isModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-system-background max-w-md mx-auto w-full rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="ios-title font-bold">{selectedDriver.name}</h3>
              <button onClick={closeDriverModal}>
                <X className="w-6 h-6 text-secondary-label" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <OptimizedImage src={selectedDriver.image} alt={selectedDriver.name} className="w-20 h-20 object-cover rounded-full" />
              <div className="flex-1">
                <h4 className="ios-headline font-semibold">{selectedDriver.car}</h4>
                <p className="ios-body text-secondary-label">{selectedDriver.year} • {selectedDriver.plate}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ios-body font-medium">{selectedDriver.rating}</span>
                  <span className="ios-footnote text-secondary-label">({selectedDriver.trips} поездок)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="ios-card p-3 text-center">
                <Clock className="w-5 h-5 text-secondary-label mx-auto mb-1" />
                <p className="ios-caption2 text-secondary-label">Время прибытия</p>
                <p className="ios-body font-semibold text-system-green">{selectedDriver.eta}</p>
              </div>
              <div className="ios-card p-3 text-center">
                <MapPin className="w-5 h-5 text-secondary-label mx-auto mb-1" />
                <p className="ios-caption2 text-secondary-label">Расстояние</p>
                <p className="ios-body font-semibold">{selectedDriver.distance}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="ios-body font-semibold">Удобства:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDriver.features.map((feature, index) => (
                  <span key={index} className="px-3 py-1 rounded-full ios-caption2 font-semibold bg-quaternary-system-fill text-label">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="ios-footnote text-secondary-label">Стоимость поездки</p>
                <p className="ios-title font-bold text-system-orange">от ${selectedDriver.price}</p>
              </div>
              <span className="px-3 py-1 rounded-full ios-caption2 font-semibold bg-system-orange/10 text-system-orange">
                {selectedDriver.category}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 bg-system-orange text-white ios-body font-semibold py-3 rounded-xl">
                Заказать поездку
              </button>
              <button className="flex-1 bg-quaternary-system-fill text-label ios-body font-medium py-3 rounded-xl">
                Позвонить водителю
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}