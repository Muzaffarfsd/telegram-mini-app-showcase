import { useState, useEffect, memo } from "react";
import { m } from "framer-motion";
import { 
  Heart, 
  Star, 
  X,
  Sparkles,
  Calendar,
  Clock,
  User,
  Gift,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  Check
} from "lucide-react";

interface BeautyProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Booking {
  id: number;
  serviceName: string;
  specialist: string;
  date: string;
  time: string;
  price: number;
  image: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  duration: string;
  specialist: string;
  rating: number;
  isPopular?: boolean;
  isNew?: boolean;
}

const services: Service[] = [
  { id: 1, name: 'Классическая стрижка', price: 2500, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=1200&fit=crop&q=90', description: 'Профессиональная стрижка с мытьем головы и укладкой от мастера салона', category: 'Парикмахерские', duration: '60 мин', specialist: 'Анна Смирнова', rating: 4.9, isPopular: true },
  { id: 2, name: 'Окрашивание волос', price: 6500, image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=1200&fit=crop&q=90', description: 'Профессиональное окрашивание премиум красками Wella с уходом', category: 'Парикмахерские', duration: '180 мин', specialist: 'Елена Козлова', rating: 4.8, isPopular: true },
  { id: 3, name: 'Балаяж', price: 8900, image: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=800&h=1200&fit=crop&q=90', description: 'Модное окрашивание балаяж с плавными переходами', category: 'Парикмахерские', duration: '240 мин', specialist: 'Мария Петрова', rating: 4.9, isNew: true, isPopular: true },
  { id: 4, name: 'Маникюр + гель-лак', price: 1900, image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=1200&fit=crop&q=90', description: 'Маникюр с покрытием гель-лак и дизайном на выбор', category: 'Маникюр', duration: '90 мин', specialist: 'Ольга Иванова', rating: 4.8, isPopular: true },
  { id: 5, name: 'Френч маникюр', price: 2200, image: 'https://images.unsplash.com/photo-1610992015732-2449b2604950?w=800&h=1200&fit=crop&q=90', description: 'Элегантный французский маникюр с укреплением ногтевой пластины', category: 'Маникюр', duration: '75 мин', specialist: 'Наталья Волкова', rating: 4.9 },
  { id: 6, name: 'Дизайн ногтей', price: 3500, image: 'https://images.unsplash.com/photo-1604654894610-df63bc138bb9?w=800&h=1200&fit=crop&q=90', description: 'Художественный дизайн ногтей любой сложности', category: 'Маникюр', duration: '120 мин', specialist: 'Дарья Кузнецова', rating: 4.7 },
  { id: 7, name: 'СПА педикюр', price: 3200, image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&h=1200&fit=crop&q=90', description: 'Расслабляющий СПА педикюр с массажем стоп и уходом', category: 'Педикюр', duration: '100 мин', specialist: 'Светлана Белова', rating: 4.9, isPopular: true },
  { id: 8, name: 'Аппаратный педикюр', price: 2800, image: 'https://images.unsplash.com/photo-1587662784763-0021b5f0b1b7?w=800&h=1200&fit=crop&q=90', description: 'Профессиональный аппаратный педикюр с покрытием', category: 'Педикюр', duration: '80 мин', specialist: 'Татьяна Морозова', rating: 4.8 },
  { id: 9, name: 'Чистка лица', price: 4500, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=1200&fit=crop&q=90', description: 'Глубокая чистка лица с увлажняющей маской и массажем', category: 'Косметология', duration: '90 мин', specialist: 'Юлия Титова', rating: 4.8, isPopular: true },
  { id: 10, name: 'Химический пилинг', price: 5500, image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=1200&fit=crop&q=90', description: 'Профессиональный химический пилинг для обновления кожи', category: 'Косметология', duration: '60 мин', specialist: 'Анна Соколова', rating: 4.7 },
  { id: 11, name: 'Массаж лица', price: 3200, image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=1200&fit=crop&q=90', description: 'Антивозрастной массаж лица с серумами премиум класса', category: 'Косметология', duration: '45 мин', specialist: 'Валентина Крылова', rating: 4.6, isNew: true },
  { id: 12, name: 'Ботокс для волос', price: 7500, image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=1200&fit=crop&q=90', description: 'Восстанавливающая процедура для гладкости и блеска волос', category: 'Парикмахерские', duration: '120 мин', specialist: 'Анна Смирнова', rating: 4.9, isNew: true },
  { id: 13, name: 'Наращивание ресниц', price: 4900, image: 'https://images.unsplash.com/photo-1583001931096-959e90c3d930?w=800&h=1200&fit=crop&q=90', description: 'Классическое наращивание ресниц 2D-3D эффект', category: 'Косметология', duration: '150 мин', specialist: 'Ирина Павлова', rating: 4.8 },
  { id: 14, name: 'Вечерняя укладка', price: 3800, image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&h=1200&fit=crop&q=90', description: 'Роскошная вечерняя укладка на любой случай', category: 'Парикмахерские', duration: '90 мин', specialist: 'Мария Петрова', rating: 4.7 },
  { id: 15, name: 'Массаж тела', price: 6500, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=1200&fit=crop&q=90', description: 'Расслабляющий массаж всего тела с ароматическими маслами', category: 'Массаж', duration: '60 мин', specialist: 'Ольга Смирнова', rating: 4.9, isPopular: true },
  { id: 16, name: 'Антицеллюлитный массаж', price: 7200, image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=1200&fit=crop&q=90', description: 'Эффективный массаж против целлюлита с разогревом', category: 'Массаж', duration: '75 мин', specialist: 'Марина Белова', rating: 4.6 },
];

const categories = ['Все', 'Парикмахерские', 'Маникюр', 'Педикюр', 'Косметология', 'Массаж'];

// Featured collections for homepage
const collections = [
  {
    id: 1,
    title: 'Уход за волосами',
    subtitle: 'Стрижка + окрашивание',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-pink-500/30 to-rose-500/30',
    accentColor: '#EC4899',
    services: [1, 2, 3]
  },
  {
    id: 2,
    title: 'Маникюр & Педикюр',
    subtitle: 'Идеальные ногти',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-purple-500/30 to-pink-500/30',
    accentColor: '#A855F7',
    services: [4, 5, 6]
  },
  {
    id: 3,
    title: 'SPA & Релакс',
    subtitle: 'Массаж и уход',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-violet-500/30 to-purple-500/30',
    accentColor: '#8B5CF6',
    services: [15, 16]
  },
];

export default memo(function Beauty({ activeTab }: BeautyProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedService(null);
    }
  }, [activeTab]);

  const filteredServices = services.filter(s => 
    selectedCategory === 'Все' || s.category === selectedCategory
  );

  const toggleFavorite = (serviceId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(serviceId)) {
      newFavorites.delete(serviceId);
    } else {
      newFavorites.add(serviceId);
    }
    setFavorites(newFavorites);
  };

  const openService = (service: Service) => {
    setSelectedService(service);
  };

  const bookService = () => {
    if (!selectedService) return;
    
    const booking: Booking = {
      id: Date.now(),
      serviceName: selectedService.name,
      specialist: selectedService.specialist,
      date: 'Уточняется',
      time: 'Согласуем',
      price: selectedService.price,
      image: selectedService.image
    };
    
    setBookings([...bookings, booking]);
    setSelectedService(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // SERVICE DETAIL PAGE
  if (activeTab === 'catalog' && selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-24">
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedService(null)}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid="button-back-to-catalog"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedService.id);
            }}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid="button-favorite-service"
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedService.id) ? 'fill-pink-400 text-pink-400' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] overflow-hidden">
          <img
            src={selectedService.image}
            alt={selectedService.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-t-3xl -mt-8 relative z-10 p-6 space-y-6 pb-32">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-pink-300 font-semibold">{selectedService.category}</span>
              {selectedService.isNew && (
                <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  NEW
                </span>
              )}
              {selectedService.isPopular && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full">
                  Популярно
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-3">{selectedService.name}</h2>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-bold text-pink-400">{formatPrice(selectedService.price)}</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(selectedService.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-white/70">{selectedService.rating}</span>
            </div>
          </div>

          <p className="text-sm text-white/80 leading-relaxed">{selectedService.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
              <Clock className="w-5 h-5 text-pink-400 mb-2" />
              <p className="text-xs text-white/60">Длительность</p>
              <p className="text-sm font-semibold">{selectedService.duration}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
              <User className="w-5 h-5 text-pink-400 mb-2" />
              <p className="text-xs text-white/60">Мастер</p>
              <p className="text-sm font-semibold">{selectedService.specialist}</p>
            </div>
          </div>

          <button
            onClick={bookService}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all"
            data-testid="button-book-now"
          >
            Записаться на процедуру
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE - Liquid Glass 2025
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-24">
        <div className="p-6 space-y-6">
          
          {/* Collections Grid - Liquid Glass Cards */}
          <div className="space-y-4 pt-4">
            {collections.map((collection, idx) => (
              <m.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group cursor-pointer overflow-hidden rounded-3xl"
                style={{ height: idx === 0 ? '280px' : '180px' }}
                data-testid={`collection-${collection.id}`}
              >
                {/* Background Image */}
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-70`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                
                {/* Liquid Glass Effect */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Glow on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl"
                  style={{ backgroundColor: collection.accentColor }}
                ></div>
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="space-y-2">
                    {idx === 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5" style={{ color: collection.accentColor }} />
                        <span 
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: collection.accentColor }}
                        >
                          Популярные услуги
                        </span>
                      </div>
                    )}
                    <h3 className="text-3xl font-bold leading-tight">{collection.title}</h3>
                    <p className="text-sm text-white/80">{collection.subtitle}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>

          {/* Popular Services */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <h3 className="text-xl font-bold">Популярное</h3>
              </div>
              <button className="text-sm text-white/60 hover:text-white transition-colors">
                Все
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {services.filter(s => s.isPopular).slice(0, 4).map((service) => (
                <m.div
                  key={service.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openService(service)}
                  className="relative cursor-pointer group"
                  data-testid={`popular-service-${service.id}`}
                >
                  {/* Glass Card */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {service.isNew && (
                        <div className="px-2 py-1 bg-pink-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-xl">
                          <Sparkles className="w-3 h-3" />
                          NEW
                        </div>
                      )}
                    </div>
                    
                    {/* Favorite */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(service.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                      data-testid={`button-favorite-${service.id}`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.has(service.id) ? 'fill-pink-400 text-pink-400' : 'text-white'}`}
                      />
                    </button>
                  </div>

                  {/* Service Info */}
                  <div className="mt-2">
                    <p className="text-xs text-pink-300 mb-1">{service.category}</p>
                    <p className="text-sm font-medium text-white/90 truncate">{service.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-bold text-pink-400">{formatPrice(service.price)}</p>
                      <p className="text-xs text-white/40">{service.duration}</p>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>

          <div className="h-4"></div>
        </div>
      </div>
    );
  }

  // CATALOG PAGE
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-24">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Услуги</h1>
            <Sparkles className="w-6 h-6 text-pink-400" />
          </div>

          {/* Hero Banner */}
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
              alt="Banner"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <h2 className="text-3xl font-bold tracking-tight text-pink-300 mb-1">
                Весенние<br/>Спецпредложения
              </h2>
              <p className="text-sm text-white/80">Скидки до 30%</p>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-xl'
                }`}
                data-testid={`button-category-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <m.div
                key={service.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openService(service)}
                className="relative cursor-pointer"
                data-testid={`service-card-${service.id}`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2 bg-white/5 backdrop-blur-xl border border-white/10">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {service.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-pink-500/90 text-white text-xs font-bold rounded-full backdrop-blur-xl">
                      NEW
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(service.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                    data-testid={`button-favorite-${service.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(service.id) ? 'fill-pink-400 text-pink-400' : 'text-white'}`}
                    />
                  </button>
                </div>

                <div>
                  <p className="text-xs text-pink-300 mb-1">{service.category}</p>
                  <p className="text-sm font-medium text-white/90 truncate mb-1">{service.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-pink-400">{formatPrice(service.price)}</p>
                    <p className="text-xs text-white/40">{service.duration}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CART (BOOKINGS) PAGE
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-32">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Мои записи</h1>

          {bookings.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 mb-4">У вас пока нет записей</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={booking.image}
                      alt={booking.serviceName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{booking.serviceName}</h3>
                    <p className="text-sm text-white/60 mb-1">{booking.specialist}</p>
                    <p className="text-xs text-white/50 mb-2">{booking.date} • {booking.time}</p>
                    <p className="font-bold text-pink-400">{formatPrice(booking.price)}</p>
                  </div>
                  <button
                    onClick={() => setBookings(bookings.filter(b => b.id !== booking.id))}
                    className="p-2 h-fit hover:bg-white/10 rounded-lg transition-colors"
                    data-testid={`button-cancel-${booking.id}`}
                  >
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // PROFILE PAGE
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-24">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Профиль</h1>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">Анна Иванова</h2>
            <p className="text-sm text-white/60">anna.ivanova@example.com</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <p className="text-2xl font-bold mb-1">{bookings.length}</p>
              <p className="text-xs text-white/60">Записей</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <p className="text-2xl font-bold mb-1">{favorites.size}</p>
              <p className="text-xs text-white/60">Избранное</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Gift className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <p className="text-2xl font-bold mb-1">350</p>
              <p className="text-xs text-white/60">Бонусов</p>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-my-bookings">
              <Calendar className="w-5 h-5 text-pink-400" />
              <span className="flex-1 text-left font-medium">Мои записи</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-loyalty">
              <Gift className="w-5 h-5 text-pink-400" />
              <span className="flex-1 text-left font-medium">Программа лояльности</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-contacts">
              <Phone className="w-5 h-5 text-pink-400" />
              <span className="flex-1 text-left font-medium">Контакты</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
});
