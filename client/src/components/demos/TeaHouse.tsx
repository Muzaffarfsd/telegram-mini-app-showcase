import { useState } from "react";
import { 
  Star, 
  Heart, 
  Filter, 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  ChevronRight, 
  Leaf,
  Award,
  Gift,
  Clock,
  Thermometer
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";

interface TeaHouseProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export default function TeaHouse({ activeTab = 'home', onNavigate }: TeaHouseProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все сорта');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  
  // 20 premium teas
  const teas = [
    {
      id: '1',
      name: 'Да Хун Пао',
      origin: 'Китай, Фуцзянь',
      price: 185,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Улун',
      description: 'Легендарный улун с утесов Уи Шань',
      rating: 4.95,
      caffeine: 'Средний',
      brewTime: '3-5 минут',
      temperature: '95°C',
      weight: '50г',
      year: 2024,
      premium: true
    },
    {
      id: '2',
      name: 'Лун Цзин',
      origin: 'Китай, Чжэцзян',
      price: 120,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
      category: 'Зелёный',
      description: 'Знаменитый зелёный чай из Ханчжоу',
      rating: 4.8,
      caffeine: 'Высокий',
      brewTime: '2-3 минуты',
      temperature: '80°C',
      weight: '50г',
      year: 2024,
      premium: false
    },
    {
      id: '3',
      name: 'Пу-эр Шэн',
      origin: 'Китай, Юньнань',
      price: 95,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Пу-эр',
      description: 'Выдержанный сырой пу-эр 15 лет',
      rating: 4.7,
      caffeine: 'Средний',
      brewTime: '30 секунд',
      temperature: '100°C',
      weight: '357г (блин)',
      year: 2009,
      premium: true
    },
    {
      id: '4',
      name: 'Эрл Грей Супериор',
      origin: 'Англия',
      price: 65,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Чёрный',
      description: 'Классический английский чай с бергамотом',
      rating: 4.5,
      caffeine: 'Высокий',
      brewTime: '3-5 минут',
      temperature: '100°C',
      weight: '100г',
      year: 2024,
      premium: false
    },
    {
      id: '5',
      name: 'Гёкуро',
      origin: 'Япония',
      price: 240,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Зелёный',
      description: 'Элитный японский теневой чай',
      rating: 4.9,
      caffeine: 'Высокий',
      brewTime: '1-2 минуты',
      temperature: '60°C',
      weight: '30г',
      year: 2024,
      premium: true
    },
    {
      id: '6',
      name: 'Железная Богиня Гуаньинь',
      origin: 'Китай, Фуцзянь',
      price: 155,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Улун',
      description: 'Классический Тигуаньинь высшего сорта',
      rating: 4.8,
      caffeine: 'Средний',
      brewTime: '3-5 минут',
      temperature: '95°C',
      weight: '50г',
      year: 2024,
      premium: true
    },
    {
      id: '7',
      name: 'Дарджилинг FTGFOP',
      origin: 'Индия',
      price: 85,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Чёрный',
      description: 'Мускатный аромат с гималайских склонов',
      rating: 4.6,
      caffeine: 'Высокий',
      brewTime: '3-4 минуты',
      temperature: '100°C',
      weight: '100г',
      year: 2024,
      premium: false
    },
    {
      id: '8',
      name: 'Белый Пион',
      origin: 'Китай, Фуцзянь',
      price: 135,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Белый',
      description: 'Деликатный белый чай с нежным вкусом',
      rating: 4.7,
      caffeine: 'Низкий',
      brewTime: '5-7 минут',
      temperature: '85°C',
      weight: '50г',
      year: 2024,
      premium: false
    },
    {
      id: '9',
      name: 'Маття церемониальная',
      origin: 'Япония',
      price: 320,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Маття',
      description: 'Церемониальная маття высшего сорта',
      rating: 4.95,
      caffeine: 'Очень высокий',
      brewTime: 'Взбивание',
      temperature: '70°C',
      weight: '30г',
      year: 2024,
      premium: true
    },
    {
      id: '10',
      name: 'Лапсанг Сушонг',
      origin: 'Китай, Фуцзянь',
      price: 75,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Чёрный',
      description: 'Копчёный чай с сосновым ароматом',
      rating: 4.4,
      caffeine: 'Высокий',
      brewTime: '3-5 минут',
      temperature: '100°C',
      weight: '100г',
      year: 2024,
      premium: false
    },
    {
      id: '11',
      name: 'Жасминовые Жемчужины',
      origin: 'Китай, Фуцзянь',
      price: 105,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Ароматизированный',
      description: 'Зелёный чай с цветами жасмина',
      rating: 4.6,
      caffeine: 'Средний',
      brewTime: '2-3 минуты',
      temperature: '85°C',
      weight: '50г',
      year: 2024,
      premium: false
    },
    {
      id: '12',
      name: 'Ройбуш ванильный',
      origin: 'ЮАР',
      price: 45,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Травяной',
      description: 'Африканский красный куст с ванилью',
      rating: 4.3,
      caffeine: 'Без кофеина',
      brewTime: '5-7 минут',
      temperature: '100°C',
      weight: '100г',
      year: 2024,
      premium: false
    },
    {
      id: '13',
      name: 'Формоза Улун',
      origin: 'Тайвань',
      price: 195,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Улун',
      description: 'Высокогорный тайваньский улун',
      rating: 4.85,
      caffeine: 'Средний',
      brewTime: '3-5 минут',
      temperature: '95°C',
      weight: '50г',
      year: 2024,
      premium: true
    },
    {
      id: '14',
      name: 'Ассам TGFOP',
      origin: 'Индия',
      price: 70,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Чёрный',
      description: 'Крепкий утренний чай из Ассама',
      rating: 4.5,
      caffeine: 'Очень высокий',
      brewTime: '3-5 минут',
      temperature: '100°C',
      weight: '100г',
      year: 2024,
      premium: false
    },
    {
      id: '15',
      name: 'Кимун Конгоу',
      origin: 'Китай, Аньхой',
      price: 90,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Чёрный',
      description: 'Китайский чёрный чай с винным букетом',
      rating: 4.6,
      caffeine: 'Высокий',
      brewTime: '3-4 минуты',
      temperature: '95°C',
      weight: '100г',
      year: 2024,
      premium: false
    },
    {
      id: '16',
      name: 'Шен Пу-эр 2015',
      origin: 'Китай, Юньнань',
      price: 145,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Пу-эр',
      description: 'Выдержанный сырой пу-эр из старых деревьев',
      rating: 4.8,
      caffeine: 'Средний',
      brewTime: '20-30 секунд',
      temperature: '100°C',
      weight: '357г (блин)',
      year: 2015,
      premium: true
    },
    {
      id: '17',
      name: 'Чай Масала',
      origin: 'Индия',
      price: 55,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Пряный',
      description: 'Традиционная индийская смесь со специями',
      rating: 4.4,
      caffeine: 'Высокий',
      brewTime: '5-7 минут',
      temperature: '100°C',
      weight: '100г',
      year: 2024,
      premium: false
    },
    {
      id: '18',
      name: 'Серебряные Иглы',
      origin: 'Китай, Фуцзянь',
      price: 280,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Белый',
      description: 'Элитный белый чай из почек',
      rating: 4.9,
      caffeine: 'Низкий',
      brewTime: '5-10 минут',
      temperature: '85°C',
      weight: '30г',
      year: 2024,
      premium: true
    },
    {
      id: '19',
      name: 'Сенча Гёкуро стиль',
      origin: 'Япония',
      price: 125,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Зелёный',
      description: 'Премиальная сенча теневой сушки',
      rating: 4.7,
      caffeine: 'Высокий',
      brewTime: '1-2 минуты',
      temperature: '70°C',
      weight: '50г',
      year: 2024,
      premium: true
    },
    {
      id: '20',
      name: 'Тикуаньинь Ван',
      origin: 'Китай, Фуцзянь',
      price: 220,
      image: 'https://images.unsplash.com/photo-1597318343706-0a1bb9cbae84?w=400',
      category: 'Улун',
      description: 'Король Железной Богини Милосердия',
      rating: 4.95,
      caffeine: 'Средний',
      brewTime: '30 секунд',
      temperature: '100°C',
      weight: '50г',
      year: 2024,
      premium: true
    }
  ];

  const categories = ['Все сорта', 'Зелёный', 'Чёрный', 'Улун', 'Пу-эр', 'Белый', 'Травяной', 'Ароматизированный', 'Маття', 'Пряный'];
  
  const filteredTeas = selectedCategory === 'Все сорта' 
    ? teas 
    : teas.filter(tea => tea.category === selectedCategory);

  const toggleFavorite = (teaId: string) => {
    setFavorites(prev => 
      prev.includes(teaId) 
        ? prev.filter(id => id !== teaId)
        : [...prev, teaId]
    );
  };

  const addToCart = (tea: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === tea.id);
      if (existing) {
        return prev.map(item => 
          item.id === tea.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...tea, quantity: 1 }];
    });
  };

  const updateQuantity = (teaId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== teaId));
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === teaId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Preload first 6 product images for instant visibility
  useImagePreloader({
    images: teas.slice(0, 6).map(item => item.image),
    priority: true
  });


  const renderHomeTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat smooth-scroll-page" data-scroll="demo-tea-house">
      <div className="max-w-md mx-auto">
        
        {/* Zen Header */}
        <div className="px-6 pt-20 pb-20 text-center">
          <div className="w-1 h-20 bg-green-700 mx-auto mb-12"></div>
          <h1 className="text-2xl font-normal text-gray-900 mb-4 tracking-[0.2em]">TeaHouse</h1>
          <p className="text-gray-500 text-sm font-normal">Mindful Tea Ceremony</p>
        </div>

        {/* Zen Garden */}
        <div className="px-6 pb-24">
          <div className="aspect-[3/2] rounded-none overflow-hidden bg-gray-100 mb-16">
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1564890269302-d38e2dc4cd19?w=800&h=533&fit=crop&crop=center" 
              alt="Tea Ceremony"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <h2 className="text-lg font-normal text-gray-900">Daily Ritual</h2>
              <p className="text-gray-600 text-sm font-normal leading-relaxed max-w-xs mx-auto">
                Experience the ancient art of tea through carefully selected leaves and mindful preparation.
              </p>
            </div>
            <button 
              className="border border-gray-300 text-gray-900 px-12 py-3 text-sm font-normal hover:bg-gray-100 transition-colors"
              onClick={() => onNavigate?.('catalog')}
            >
              Browse Tea
            </button>
          </div>
        </div>

        {/* Philosophy */}
        <div className="px-6 py-24 border-t border-gray-200">
          <div className="text-center space-y-12">
            <h3 className="text-base font-normal text-gray-900">The Way of Tea</h3>
            <div className="grid grid-cols-1 gap-12 max-w-xs mx-auto">
              {[
                { word: '静', meaning: 'Stillness', desc: 'Find peace in the moment' },
                { word: '和', meaning: 'Harmony', desc: 'Balance in every sip' },
                { word: '清', meaning: 'Purity', desc: 'Clear mind and spirit' }
              ].map((principle, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="text-3xl font-normal text-green-700">{principle.word}</div>
                  <div className="text-gray-900 text-sm font-medium">{principle.meaning}</div>
                  <div className="text-gray-500 text-xs font-normal">{principle.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Selection */}
        <div className="px-6 py-24 border-t border-gray-200">
          <div className="space-y-16">
            <div className="text-center">
              <h3 className="text-base font-normal text-gray-900 mb-4">Curated Selection</h3>
              <div className="w-12 h-px bg-gray-300 mx-auto"></div>
            </div>
            
            <div className="space-y-20">
              {teas.filter(tea => tea.premium).slice(0, 2).map((tea, index) => (
                <div 
                  key={tea.id} 
                  className="group cursor-pointer text-center"
                  onClick={() => onNavigate?.('catalog')}
                >
                  <div className="aspect-square rounded-none overflow-hidden bg-gray-100 mb-8 max-w-xs mx-auto">
                    <OptimizedImage 
                      src={tea.image} 
                      alt={tea.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-gray-900 font-normal text-base">{tea.name}</h4>
                    <p className="text-gray-500 text-sm font-normal">{tea.origin}</p>
                    <div className="pt-2">
                      <div className="w-6 h-px bg-gray-300 mx-auto mb-2"></div>
                      <p className="text-gray-900 font-normal">${tea.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderCatalogTab = () => (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 font-montserrat">
      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-montserrat font-bold text-gray-900">Каталог чая</h1>
          <p className="text-gray-600 font-montserrat">Найдите свой идеальный вкус</p>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-1 flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск чая..."
                className="flex-1 bg-transparent border-none outline-none font-montserrat text-gray-900 placeholder-gray-400"
              />
            </div>
            <button className="w-20 h-20 bg-gradient-to-r from-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Filter className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-xl font-montserrat font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category 
                    ? 'bg-gradient-to-r from-teal-500 to-green-600 text-white shadow-lg' 
                    : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-white'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Teas Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredTeas.map((tea) => (
            <div key={tea.id} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all">
              <div className="relative mb-3">
                <OptimizedImage src={tea.image} alt={tea.name} className="w-full h-32 object-cover rounded-xl" />
                <div className="absolute top-2 left-2 flex space-x-1">
                  {tea.premium && (
                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">PREMIUM</span>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(tea.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(tea.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
              
              <h3 className="text-gray-900 font-montserrat font-semibold text-sm mb-1 line-clamp-1">{tea.name}</h3>
              <p className="text-teal-600 text-xs font-montserrat mb-1">{tea.origin}</p>
              <p className="text-gray-500 text-xs font-montserrat mb-2">{tea.weight} • {tea.temperature}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-gray-600 text-xs">{tea.rating}</span>
                </div>
                <span className="text-teal-600 font-bold text-sm">${tea.price}</span>
              </div>
              
              <button
                onClick={() => addToCart(tea)}
                className="w-full bg-gradient-to-r from-teal-500 to-green-600 text-white font-montserrat font-semibold py-2 rounded-xl hover:shadow-lg transition-all"
              >
                В корзину
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCartTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 min-h-screen">
      <h1 className="text-2xl font-montserrat font-bold text-gray-900">Корзина</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-montserrat">Корзина пуста</p>
          <p className="text-gray-400 text-sm font-montserrat">Добавьте чай из каталога</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3">
                  <OptimizedImage src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-montserrat font-semibold">{item.name}</h4>
                    <p className="text-teal-600 text-sm font-montserrat">{item.origin}</p>
                    <p className="text-gray-600 text-sm">{item.weight} • ${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-gray-900 font-montserrat font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-montserrat">Подытог:</span>
              <span className="text-gray-900 font-montserrat font-semibold">${cartTotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-montserrat">Доставка:</span>
              <span className="text-gray-900 font-montserrat font-semibold">$10</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-xl font-montserrat font-bold text-gray-900">Итого:</span>
              <span className="text-xl font-montserrat font-bold text-teal-600">${cartTotal + 10}</span>
            </div>
            
            <button className="w-full bg-gradient-to-r from-teal-500 to-green-600 text-white font-montserrat font-semibold py-3 rounded-xl hover:shadow-xl transition-all">
              Оформить заказ
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 min-h-screen">
      <h1 className="text-2xl font-montserrat font-bold text-gray-900">Профиль</h1>
      
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-lg">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-xl font-montserrat font-bold text-white">ЧД</span>
          </div>
          <div>
            <h3 className="text-xl font-montserrat font-semibold text-gray-900">Tea Master</h3>
            <p className="text-teal-600 font-montserrat">Ценитель чайного искусства</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-montserrat font-bold text-teal-600">89</p>
            <p className="text-gray-600 text-sm font-montserrat">Сортов попробовано</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-montserrat font-bold text-green-600">$2.1K</p>
            <p className="text-gray-600 text-sm font-montserrat">Потрачено</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-montserrat font-semibold text-gray-900">Избранные сорта</h2>
        {teas.filter(tea => favorites.includes(tea.id)).map((tea) => (
          <div key={tea.id} className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-white/30 shadow-lg flex items-center space-x-3">
            <OptimizedImage src={tea.image} alt={tea.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h4 className="text-gray-900 font-montserrat font-semibold">{tea.name}</h4>
              <p className="text-teal-600 text-sm font-montserrat">{tea.origin} • ${tea.price}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        ))}
        {favorites.length === 0 && (
          <p className="text-gray-500 text-center py-4 font-montserrat">Нет избранных сортов</p>
        )}
      </div>
    </div>
  );

  switch (activeTab) {
    case 'catalog':
      return renderCatalogTab();
    case 'cart':
      return renderCartTab();
    case 'profile':
      return renderProfileTab();
    default:
      return renderHomeTab();
  }
}