import { useState, useEffect, memo } from "react";
import { m } from "framer-motion";
import { 
  Heart, 
  Star, 
  X,
  Clock,
  Utensils,
  ChevronLeft,
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Package,
  Search,
  Filter,
  Menu
} from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { Skeleton } from "../ui/skeleton";
import { useFilter } from "@/hooks/useFilter";

interface RestaurantProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

interface Dish {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  cookTime: string;
  rating: number;
  ingredients: string;
  isChefSpecial?: boolean;
  isNew?: boolean;
}

const dishes: Dish[] = [
  { id: 1, name: 'Стейк Рибай', price: 3200, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=1200&fit=crop&q=90', description: 'Премиум стейк из мраморной говядины с трюфельным маслом', category: 'Основные блюда', cookTime: '25 мин', rating: 4.9, ingredients: 'Говядина, трюфель, розмарин', isChefSpecial: true },
  { id: 2, name: 'Лосось на пару', price: 2800, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=1200&fit=crop&q=90', description: 'Филе лосося на пару с овощами гриль и соусом терияки', category: 'Основные блюда', cookTime: '20 мин', rating: 4.8, ingredients: 'Лосось, овощи, терияки', isChefSpecial: true },
  { id: 3, name: 'Ризотто с белыми грибами', price: 2200, image: 'https://images.unsplash.com/photo-1476124369491-b79e6d6c0f16?w=800&h=1200&fit=crop&q=90', description: 'Кремовое ризотто с белыми грибами и пармезаном', category: 'Основные блюда', cookTime: '30 мин', rating: 4.7, ingredients: 'Рис арборио, белые грибы, пармезан', isNew: true },
  { id: 4, name: 'Утиная грудка', price: 3500, image: 'https://images.unsplash.com/photo-1587863568021-6e3bff40e288?w=800&h=1200&fit=crop&q=90', description: 'Утиная грудка с апельсиновым соусом и картофельным пюре', category: 'Основные блюда', cookTime: '35 мин', rating: 4.9, ingredients: 'Утка, апельсины, картофель', isChefSpecial: true },
  { id: 5, name: 'Паста Карбонара', price: 1800, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=1200&fit=crop&q=90', description: 'Классическая римская паста с беконом гуанчале и сыром пекорино', category: 'Паста', cookTime: '15 мин', rating: 4.8, ingredients: 'Паста, гуанчале, яйцо, пекорино' },
  { id: 6, name: 'Тальятелле с трюфелем', price: 2400, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=1200&fit=crop&q=90', description: 'Домашняя паста с черным трюфелем и сливочным соусом', category: 'Паста', cookTime: '18 мин', rating: 4.9, ingredients: 'Паста, трюфель, сливки, пармезан', isChefSpecial: true },
  { id: 7, name: 'Лобстер Фра Дьяволо', price: 4500, image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=1200&fit=crop&q=90', description: 'Паста с омаром в остром томатном соусе', category: 'Паста', cookTime: '22 мин', rating: 4.8, ingredients: 'Омар, томаты, чили, паста', isNew: true, isChefSpecial: true },
  { id: 8, name: 'Боскайола', price: 1900, image: 'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=800&h=1200&fit=crop&q=90', description: 'Паста с белыми грибами, беконом и сливками', category: 'Паста', cookTime: '16 мин', rating: 4.6, ingredients: 'Паста, грибы, бекон, сливки' },
  { id: 9, name: 'Устрицы свежие', price: 3800, image: 'https://images.unsplash.com/photo-1567608198472-8d8b4c86545f?w=800&h=1200&fit=crop&q=90', description: 'Свежие устрицы с лимоном и мигнонеттой (6 шт)', category: 'Закуски', cookTime: '5 мин', rating: 4.9, ingredients: 'Устрицы, лимон, мигнонетта', isChefSpecial: true },
  { id: 10, name: 'Фуа-гра', price: 4200, image: 'https://images.unsplash.com/photo-1535745318714-da922ca9cc81?w=800&h=1200&fit=crop&q=90', description: 'Фуа-гра с карамелизованными яблоками и бриошью', category: 'Закуски', cookTime: '10 мин', rating: 4.8, ingredients: 'Фуа-гра, яблоки, бриошь', isChefSpecial: true },
  { id: 11, name: 'Тар-тар из тунца', price: 2600, image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&h=1200&fit=crop&q=90', description: 'Свежий тар-тар из желтоперого тунца с авокадо', category: 'Закуски', cookTime: '8 мин', rating: 4.7, ingredients: 'Тунец, авокадо, кунжут' },
  { id: 12, name: 'Буррата с томатами', price: 1600, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=1200&fit=crop&q=90', description: 'Сыр буррата с томатами черри и базиликом', category: 'Закуски', cookTime: '5 мин', rating: 4.8, ingredients: 'Буррата, томаты, базилик, масло' },
  { id: 13, name: 'Тирамису', price: 900, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=1200&fit=crop&q=90', description: 'Классический итальянский десерт с маскарпоне и эспрессо', category: 'Десерты', cookTime: '5 мин', rating: 4.9, ingredients: 'Маскарпоне, кофе, савоярди, какао' },
  { id: 14, name: 'Крем-брюле', price: 850, image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=1200&fit=crop&q=90', description: 'Классический французский десерт с карамелизованной корочкой', category: 'Десерты', cookTime: '7 мин', rating: 4.8, ingredients: 'Сливки, яйца, ваниль, сахар' },
  { id: 15, name: 'Шоколадный фондан', price: 950, image: 'https://images.unsplash.com/photo-1541599468348-e96984315921?w=800&h=1200&fit=crop&q=90', description: 'Теплый шоколадный кекс с жидкой начинкой', category: 'Десерты', cookTime: '12 мин', rating: 4.9, ingredients: 'Шоколад, масло, яйца, мука', isNew: true },
  { id: 16, name: 'Панна котта с ягодами', price: 800, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=1200&fit=crop&q=90', description: 'Нежный сливочный десерт с лесными ягодами', category: 'Десерты', cookTime: '5 мин', rating: 4.7, ingredients: 'Сливки, ваниль, ягоды, сахар' },
];

const categories = ['Все', 'Закуски', 'Основные блюда', 'Паста', 'Десерты'];

// Featured collections
const collections = [
  {
    id: 1,
    title: 'Выбор шеф-повара',
    subtitle: 'Авторские блюда',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-amber-600/30 to-yellow-600/30',
    accentColor: '#D97706',
    dishes: [1, 4, 6]
  },
  {
    id: 2,
    title: 'Морские деликатесы',
    subtitle: 'Свежие морепродукты',
    image: 'https://images.unsplash.com/photo-1567608198472-8d8b4c86545f?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-blue-600/30 to-cyan-600/30',
    accentColor: '#0EA5E9',
    dishes: [9, 10, 11]
  },
  {
    id: 3,
    title: 'Сладкие удовольствия',
    subtitle: 'Десерты',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-rose-600/30 to-pink-600/30',
    accentColor: '#E11D48',
    dishes: [13, 15]
  },
];

export default memo(function Restaurant({ activeTab }: RestaurantProps) {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: dishes,
    searchFields: ['name', 'description', 'category', 'ingredients'] as (keyof Dish)[],
  });

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedDish(null);
    }
  }, [activeTab]);

  const filteredDishes = filteredItems.filter(d => 
    selectedCategory === 'Все' || d.category === selectedCategory
  );

  const handleImageLoad = (dishId: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), dishId]));
  };

  const toggleFavorite = (dishId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(dishId)) {
      newFavorites.delete(dishId);
    } else {
      newFavorites.add(dishId);
    }
    setFavorites(newFavorites);
  };

  const openDish = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const addToOrder = () => {
    if (!selectedDish) return;
    
    const existing = orderItems.find(item => item.id === selectedDish.id);
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.id === selectedDish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        id: selectedDish.id,
        name: selectedDish.name,
        price: selectedDish.price,
        quantity: 1,
        image: selectedDish.image
      }]);
    }
    setSelectedDish(null);
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
    if (orderItems.length === 0) return;
    
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: Date.now(),
      items: [...orderItems],
      total: total,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setOrderItems([]);
    setShowCheckoutSuccess(true);
    setTimeout(() => setShowCheckoutSuccess(false), 3000);
  };

  // DISH DETAIL PAGE
  if (activeTab === 'catalog' && selectedDish) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-24 smooth-scroll-page" data-scroll="demo-restaurant">
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedDish(null)}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid="button-back"
            aria-label="Назад"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedDish.id);
            }}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid={`button-favorite-${selectedDish.id}`}
            aria-label="Добавить в избранное"
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedDish.id) ? 'fill-amber-400 text-amber-400' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] overflow-hidden">
          <img
            src={selectedDish.image}
            alt={selectedDish.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-t-3xl -mt-8 relative z-10 p-6 space-y-6 pb-32">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-amber-300 font-semibold">{selectedDish.category}</span>
              {selectedDish.isNew && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full">
                  NEW
                </span>
              )}
              {selectedDish.isChefSpecial && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300" />
                  Chef's Special
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-3">{selectedDish.name}</h2>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-bold text-amber-400">{formatPrice(selectedDish.price)}</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(selectedDish.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-white/70">{selectedDish.rating}</span>
            </div>
          </div>

          <p className="text-sm text-white/80 leading-relaxed">{selectedDish.description}</p>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-white/80">Состав:</h3>
            <p className="text-sm text-white/60">{selectedDish.ingredients}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-white/70">Время приготовления: {selectedDish.cookTime}</span>
          </div>

          <button
            onClick={addToOrder}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
            data-testid="button-add-to-order"
          >
            Добавить в заказ
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE - Premium Dark Theme
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-24 smooth-scroll-page" data-scroll="demo-restaurant">
        <div className="p-6 space-y-6">
          
          {/* Collections Grid */}
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
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
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
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                          Рекомендации шефа
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

          {/* Chef's Specials */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <h3 className="text-xl font-bold">Выбор шефа</h3>
              </div>
              <button className="text-sm text-white/60 hover:text-white transition-colors" data-testid="button-view-all-chef">
                Все
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {dishes.filter(d => d.isChefSpecial).slice(0, 4).map((dish, idx) => (
                <m.div
                  key={dish.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openDish(dish)}
                  className="relative cursor-pointer group"
                  data-testid={`chef-special-${dish.id}`}
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-2 left-2 flex gap-2">
                      {dish.isNew && (
                        <div className="px-2 py-1 bg-amber-500/90 text-white text-xs font-bold rounded-full backdrop-blur-xl">
                          NEW
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(dish.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                      data-testid={`button-favorite-${dish.id}`}
                      aria-label="Добавить в избранное"
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.has(dish.id) ? 'fill-amber-400 text-amber-400' : 'text-white'}`}
                      />
                    </button>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs text-amber-300 mb-1">{dish.category}</p>
                    <p className="text-sm font-medium text-white/90 truncate">{dish.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-bold text-amber-400">{formatPrice(dish.price)}</p>
                      <p className="text-xs text-white/40">{dish.cookTime}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-24 smooth-scroll-page" data-scroll="demo-restaurant">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-xl font-bold">Меню</h1>
            <Utensils className="w-6 h-6 text-amber-400" />
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              data-testid="input-search"
              aria-label="Поиск блюд"
            />
          </div>

          {/* Hero Banner */}
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img
              src="https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80"
              alt="Banner"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <h2 className="text-3xl font-bold tracking-tight text-amber-300 mb-1">
                Сезонное<br/>Меню
              </h2>
              <p className="text-sm text-white/80">Новые блюда от шефа</p>
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
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-xl'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredDishes.map((dish, idx) => (
              <m.div
                key={dish.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openDish(dish)}
                className="relative cursor-pointer"
                data-testid={`dish-card-${dish.id}`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2 bg-white/5 backdrop-blur-xl border border-white/10">
                  {!loadedImages.has(dish.id) && (
                    <Skeleton className="absolute inset-0 rounded-2xl bg-white/10" />
                  )}
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages.has(dish.id) ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(dish.id)}
                  />
                  
                  {dish.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 text-white text-xs font-bold rounded-full backdrop-blur-xl">
                      NEW
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(dish.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                    data-testid={`button-favorite-${dish.id}`}
                    aria-label="Добавить в избранное"
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(dish.id) ? 'fill-amber-400 text-amber-400' : 'text-white'}`}
                    />
                  </button>
                </div>

                <div>
                  <p className="text-xs text-amber-300 mb-1">{dish.category}</p>
                  <p className="text-sm font-medium text-white/90 truncate mb-1">{dish.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-amber-400">{formatPrice(dish.price)}</p>
                    <p className="text-xs text-white/40">{dish.cookTime}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CART PAGE
  if (activeTab === 'cart') {
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-32 smooth-scroll-page" data-scroll="demo-restaurant">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Корзина</h1>

          {orderItems.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 mb-4">Ваша корзина пуста</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-24">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      <p className="text-sm text-white/60 mb-2">Количество: {item.quantity}</p>
                      <p className="font-bold text-amber-400">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <button
                      onClick={() => setOrderItems(orderItems.filter(i => i.id !== item.id))}
                      className="p-2 h-fit hover:bg-white/10 rounded-lg transition-colors"
                      data-testid={`button-remove-${item.id}`}
                      aria-label="Удалить из корзины"
                    >
                      <X className="w-5 h-5 text-white/40" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="fixed bottom-24 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 p-6">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg">Итого:</span>
                    <span className="text-2xl font-bold text-amber-400">{formatPrice(total)}</span>
                  </div>
                  <ConfirmDrawer
                    trigger={
                      <button
                        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                        data-testid="button-checkout"
                      >
                        Оформить заказ
                      </button>
                    }
                    title="Оформить заказ?"
                    description={`${orderItems.length} блюд на сумму ${formatPrice(total)}`}
                    confirmText="Оформить"
                    cancelText="Отмена"
                    variant="default"
                    onConfirm={handleCheckout}
                  />
                </div>
              </div>
              {showCheckoutSuccess && (
                <div className="fixed top-20 left-4 right-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-black p-4 rounded-2xl text-center font-bold z-50 animate-pulse">
                  Заказ успешно оформлен!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // PROFILE PAGE
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-24 smooth-scroll-page" data-scroll="demo-restaurant">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Профиль</h1>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-yellow-600 mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">Дмитрий Соколов</h2>
            <p className="text-sm text-white/60">dmitry.sokolov@example.com</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold mb-1">{orders.length}</p>
              <p className="text-xs text-white/60">Заказов</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Heart className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold mb-1">{favorites.size}</p>
              <p className="text-xs text-white/60">Избранное</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Star className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold mb-1">250</p>
              <p className="text-xs text-white/60">Баллов</p>
            </div>
          </div>

          <div className="scroll-fade-in mb-6">
            <h3 className="text-lg font-bold mb-4">Мои заказы</h3>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>У вас пока нет заказов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white/10 rounded-xl p-4" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/70">Заказ #{order.id.toString().slice(-6)}</span>
                      <span className="text-sm text-white/70">{order.date}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/80">{order.items.length} блюд</span>
                      <span className="font-bold text-amber-400">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                        {order.status === 'processing' ? 'Готовится' : order.status === 'shipped' ? 'В пути' : 'Доставлен'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-my-orders">
              <Package className="w-5 h-5 text-amber-400" />
              <span className="flex-1 text-left font-medium">История заказов</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-reservation">
              <Utensils className="w-5 h-5 text-amber-400" />
              <span className="flex-1 text-left font-medium">Забронировать стол</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-contacts">
              <Phone className="w-5 h-5 text-amber-400" />
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
