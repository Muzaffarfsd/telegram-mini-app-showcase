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
  Check,
  Package,
  Search,
  Filter,
  Menu
} from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { Skeleton } from "../ui/skeleton";
import { useFilter } from "@/hooks/useFilter";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { LazyImage, UrgencyIndicator, TrustBadges } from "@/components/shared";

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

interface Order {
  id: number;
  items: Booking[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
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

const collections = [
  {
    id: 1,
    title: 'Уход за волосами',
    subtitle: 'Стрижка + окрашивание',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-[var(--theme-primary)]/30 to-[var(--theme-accent)]/30',
    accentColor: 'var(--theme-primary)',
    services: [1, 2, 3]
  },
  {
    id: 2,
    title: 'Маникюр & Педикюр',
    subtitle: 'Идеальные ногти',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-purple-500/30 to-[var(--theme-primary)]/30',
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: services,
    searchFields: ['name', 'description', 'category', 'specialist'] as (keyof Service)[],
  });

  useEffect(() => {
    scrollToTop();
    if (activeTab !== 'catalog') {
      setSelectedService(null);
    }
  }, [activeTab]);

  const filteredServices = filteredItems.filter(s => 
    selectedCategory === 'Все' || s.category === selectedCategory
  );

  const handleImageLoad = (serviceId: number) => {
    setLoadedImages(prev => new Set(prev).add(serviceId));
  };

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

  const handleCheckout = () => {
    if (bookings.length === 0) return;
    
    const total = bookings.reduce((sum, booking) => sum + booking.price, 0);
    const newOrder: Order = {
      id: Date.now(),
      items: [...bookings],
      total: total,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setBookings([]);
    setShowCheckoutSuccess(true);
    setTimeout(() => setShowCheckoutSuccess(false), 3000);
  };

  if (activeTab === 'catalog' && selectedService) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedService(null)}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid="button-back"
            aria-label="Назад"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedService.id);
            }}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid={`button-favorite-${selectedService.id}`}
            aria-label="Добавить в избранное"
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedService.id) ? 'text-white' : 'text-white'}`}
              style={favorites.has(selectedService.id) ? { fill: 'var(--theme-primary)', color: 'var(--theme-primary)' } : {}}
            />
          </button>
        </div>

        <div className="relative h-[60vh] overflow-hidden">
          <LazyImage
            src={selectedService.image}
            alt={selectedService.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-t-3xl -mt-8 relative z-10 p-6 space-y-6 pb-32">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--theme-primary)' }}>{selectedService.category}</span>
              {selectedService.isNew && (
                <span className="px-2 py-1 text-xs font-bold rounded-full flex items-center gap-1" style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-background)' }}>
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
              <p className="text-3xl font-bold" style={{ color: 'var(--theme-primary)' }}>{formatPrice(selectedService.price)}</p>
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
              <Clock className="w-5 h-5 mb-2" style={{ color: 'var(--theme-primary)' }} />
              <p className="text-xs text-white/60">Длительность</p>
              <p className="text-sm font-semibold">{selectedService.duration}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
              <User className="w-5 h-5 mb-2" style={{ color: 'var(--theme-primary)' }} />
              <p className="text-xs text-white/60">Мастер</p>
              <p className="text-sm font-semibold">{selectedService.specialist}</p>
            </div>
          </div>

          <TrustBadges />

          <button
            onClick={bookService}
            className="w-full text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-accent))' }}
            data-testid="button-book-now"
          >
            Записаться на процедуру
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6 space-y-6">
          
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
                <LazyImage
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-70`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl"
                  style={{ backgroundColor: collection.accentColor }}
                ></div>
                
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

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                <h3 className="text-xl font-bold">Популярное</h3>
              </div>
              <button className="text-sm text-white/60 hover:text-white transition-colors" data-testid="button-view-all-popular">
                Все
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {services.filter(s => s.isPopular).slice(0, 4).map((service, idx) => (
                <m.div
                  key={service.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openService(service)}
                  className="relative cursor-pointer group"
                  data-testid={`popular-service-${service.id}`}
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <LazyImage
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-2 left-2 flex gap-2">
                      {service.isNew && (
                        <div className="px-2 py-1 text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-xl" style={{ backgroundColor: 'var(--theme-primary)' }}>
                          <Sparkles className="w-3 h-3" />
                          NEW
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(service.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                      data-testid={`button-favorite-${service.id}`}
                      aria-label="Добавить в избранное"
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.has(service.id) ? 'text-white' : 'text-white'}`}
                        style={favorites.has(service.id) ? { fill: 'var(--theme-primary)', color: 'var(--theme-primary)' } : {}}
                      />
                    </button>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs mb-1" style={{ color: 'var(--theme-primary)' }}>{service.category}</p>
                    <p className="text-sm font-medium text-white/90 truncate">{service.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-bold" style={{ color: 'var(--theme-primary)' }}>{formatPrice(service.price)}</p>
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

  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-xl font-bold">Услуги</h1>
            <Sparkles className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Поиск услуг..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--theme-primary)' } as any}
              data-testid="input-search"
              aria-label="Поиск услуг"
            />
          </div>

          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <LazyImage
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <h2 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--theme-primary)' }}>
                Салон красоты
              </h2>
              <p className="text-white/80 text-sm">Лучшие мастера города</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                style={selectedCategory === category ? { backgroundColor: 'var(--theme-primary)' } : {}}
                data-testid={`button-category-${category}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 grid grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <m.div
              key={service.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => openService(service)}
              className="relative cursor-pointer group"
              data-testid={`service-${service.id}`}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                <LazyImage
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                <div className="absolute top-2 left-2 flex gap-2">
                  {service.isNew && (
                    <div className="px-2 py-1 text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-xl" style={{ backgroundColor: 'var(--theme-primary)' }}>
                      <Sparkles className="w-3 h-3" />
                      NEW
                    </div>
                  )}
                  {service.isPopular && (
                    <div className="px-2 py-1 bg-purple-500/90 text-white text-xs font-bold rounded-full backdrop-blur-xl">
                      Популярно
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(service.id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                  data-testid={`button-favorite-catalog-${service.id}`}
                >
                  <Heart 
                    className={`w-4 h-4 ${favorites.has(service.id) ? 'text-white' : 'text-white'}`}
                    style={favorites.has(service.id) ? { fill: 'var(--theme-primary)', color: 'var(--theme-primary)' } : {}}
                  />
                </button>
                
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm font-medium truncate">{service.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-base font-bold" style={{ color: 'var(--theme-primary)' }}>{formatPrice(service.price)}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-white/70">{service.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Мои записи</h1>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Нет активных записей</p>
              <p className="text-sm text-white/40">Выберите услугу из каталога</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="flex gap-4">
                      <LazyImage src={booking.image} alt={booking.serviceName} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{booking.serviceName}</h3>
                        <p className="text-sm text-white/60">{booking.specialist}</p>
                        <p className="text-sm text-white/60">{booking.date} • {booking.time}</p>
                        <p className="font-bold mt-2" style={{ color: 'var(--theme-primary)' }}>{formatPrice(booking.price)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Итого:</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                    {formatPrice(bookings.reduce((sum, b) => sum + b.price, 0))}
                  </span>
                </div>
                
                <TrustBadges />
                
                <button
                  onClick={handleCheckout}
                  className="w-full text-white font-bold py-4 rounded-xl"
                  style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-accent))' }}
                  data-testid="button-checkout"
                >
                  Подтвердить запись
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--theme-primary), var(--theme-accent))' }}>
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold">Красавица</h2>
            <p className="text-white/60">Постоянный клиент</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>{orders.length}</p>
              <p className="text-sm text-white/60">Визитов</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-2xl font-bold text-green-400">15%</p>
              <p className="text-sm text-white/60">Скидка</p>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all">
              <Gift className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
              <span>Бонусная программа</span>
            </button>
            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all">
              <Calendar className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
              <span>История записей</span>
            </button>
            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all">
              <MapPin className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
              <span>Адреса салонов</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
});
