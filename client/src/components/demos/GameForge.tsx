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
  Gamepad2,
  Zap,
  Trophy,
  Shield,
  Target
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";

interface GameForgeProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export default function GameForge({ activeTab = 'home', onNavigate }: GameForgeProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все товары');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  
  // 20 gaming gear items
  const gamingGear = [
    {
      id: '1',
      name: 'Razer DeathAdder V3 Pro',
      brand: 'Razer',
      price: 149,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Мыши',
      description: 'Беспроводная игровая мышь с зарядкой',
      rating: 4.8,
      specs: '30K DPI, 90h battery, HyperSpeed',
      warranty: '2 года',
      rgb: true,
      inStock: true,
      gaming: true
    },
    {
      id: '2',
      name: 'SteelSeries Apex Pro TKL',
      brand: 'SteelSeries',
      price: 199,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Клавиатуры',
      description: 'Механическая клавиатура с регулируемыми переключателями',
      rating: 4.7,
      specs: 'OmniPoint 2.0, RGB, TKL',
      warranty: '2 года',
      rgb: true,
      inStock: true,
      gaming: true
    },
    {
      id: '3',
      name: 'ASUS ROG Swift PG279Q',
      brand: 'ASUS',
      price: 699,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Мониторы',
      description: '27" QHD монитор с G-SYNC',
      rating: 4.6,
      specs: '165Hz, 1ms, G-SYNC, IPS',
      warranty: '3 года',
      rgb: false,
      inStock: true,
      gaming: true
    },
    {
      id: '4',
      name: 'HyperX Cloud Alpha',
      brand: 'HyperX',
      price: 99,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Гарнитуры',
      description: 'Игровая гарнитура с двойной камерой',
      rating: 4.5,
      specs: 'Dual Chamber, Detach Mic',
      warranty: '2 года',
      rgb: false,
      inStock: true,
      gaming: true
    },
    {
      id: '5',
      name: 'Corsair K95 RGB Platinum',
      brand: 'Corsair',
      price: 199,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Клавиатуры',
      description: 'Премиальная механическая клавиатура',
      rating: 4.7,
      specs: 'Cherry MX, RGB, Macro Keys',
      warranty: '2 года',
      rgb: true,
      inStock: true,
      gaming: true
    },
    {
      id: '6',
      name: 'Logitech G Pro X Superlight',
      brand: 'Logitech',
      price: 149,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Мыши',
      description: 'Ультралегкая беспроводная игровая мышь',
      rating: 4.8,
      specs: '25K DPI, 70h battery, 63g',
      warranty: '2 года',
      rgb: false,
      inStock: false,
      gaming: true
    },
    {
      id: '7',
      name: 'Noblechairs Hero',
      brand: 'Noblechairs',
      price: 449,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Кресла',
      description: 'Премиальное игровое кресло',
      rating: 4.6,
      specs: 'Кожа, 4D подлокотники',
      warranty: '5 лет',
      rgb: false,
      inStock: true,
      gaming: true
    },
    {
      id: '8',
      name: 'Elgato Stream Deck',
      brand: 'Elgato',
      price: 149,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Стримерское',
      description: 'Пульт управления для стримеров',
      rating: 4.7,
      specs: '15 клавиш, LCD дисплеи',
      warranty: '1 год',
      rgb: false,
      inStock: true,
      gaming: false
    },
    {
      id: '9',
      name: 'SCUF Reflex Pro',
      brand: 'SCUF',
      price: 259,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Геймпады',
      description: 'Профессиональный контроллер для PS5',
      rating: 4.5,
      specs: 'Paddles, Adaptive Triggers',
      warranty: '1 год',
      rgb: false,
      inStock: true,
      gaming: true
    },
    {
      id: '10',
      name: 'Blue Yeti X',
      brand: 'Blue',
      price: 169,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Микрофоны',
      description: 'Конденсаторный USB микрофон',
      rating: 4.4,
      specs: 'Cardioid, Real-time LED',
      warranty: '2 года',
      rgb: true,
      inStock: true,
      gaming: false
    },
    {
      id: '11',
      name: 'MSI GeForce RTX 4090',
      brand: 'MSI',
      price: 1599,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Видеокарты',
      description: 'Флагманская видеокарта для 4K гейминга',
      rating: 4.9,
      specs: '24GB GDDR6X, DLSS 3.0',
      warranty: '3 года',
      rgb: true,
      inStock: false,
      gaming: true
    },
    {
      id: '12',
      name: 'Alienware AW3423DWF',
      brand: 'Alienware',
      price: 1099,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Мониторы',
      description: '34" QD-OLED изогнутый монитор',
      rating: 4.8,
      specs: '175Hz, 0.1ms, HDR400',
      warranty: '3 года',
      rgb: true,
      inStock: true,
      gaming: true
    },
    {
      id: '13',
      name: 'Corsair Dark Core RGB Pro',
      brand: 'Corsair',
      price: 89,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Мыши',
      description: 'Беспроводная мышь с RGB подсветкой',
      rating: 4.3,
      specs: '18K DPI, Qi charging, RGB',
      warranty: '2 года',
      rgb: true,
      inStock: true,
      gaming: true
    },
    {
      id: '14',
      name: 'Rode PodMic',
      brand: 'Rode',
      price: 199,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Микрофоны',
      description: 'Динамический микрофон для стриминга',
      rating: 4.6,
      specs: 'Dynamic, XLR, Broadcast',
      warranty: '1 год',
      rgb: false,
      inStock: true,
      gaming: false
    },
    {
      id: '15',
      name: 'Thrustmaster T300 RS',
      brand: 'Thrustmaster',
      price: 349,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Рули',
      description: 'Гоночный руль с Force Feedback',
      rating: 4.5,
      specs: 'Force Feedback, 1080°',
      warranty: '2 года',
      rgb: false,
      inStock: true,
      gaming: true
    },
    {
      id: '16',
      name: 'Secretlab Titan Evo 2022',
      brand: 'Secretlab',
      price: 519,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Кресла',
      description: 'Эргономичное игровое кресло',
      rating: 4.7,
      specs: 'NEO Hybrid, Magnetic',
      warranty: '5 лет',
      rgb: false,
      inStock: true,
      gaming: true
    },
    {
      id: '17',
      name: 'Xbox Elite Controller',
      brand: 'Microsoft',
      price: 179,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Геймпады',
      description: 'Элитный беспроводной контроллер',
      rating: 4.4,
      specs: 'Paddles, Hair Triggers',
      warranty: '1 год',
      rgb: false,
      inStock: true,
      gaming: true
    },
    {
      id: '18',
      name: 'Elgato HD60 S+',
      brand: 'Elgato',
      price: 199,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Стримерское',
      description: 'Карта захвата 4K60 HDR',
      rating: 4.6,
      specs: '4K60 HDR, Zero-Lag',
      warranty: '1 год',
      rgb: false,
      inStock: true,
      gaming: false
    },
    {
      id: '19',
      name: 'Astro A50 Wireless',
      brand: 'Astro',
      price: 299,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Гарнитуры',
      description: 'Премиальная беспроводная гарнитура',
      rating: 4.5,
      specs: 'Dolby Audio, 15h battery',
      warranty: '1 год',
      rgb: false,
      inStock: true,
      gaming: true
    },
    {
      id: '20',
      name: 'BenQ ZOWIE XL2546K',
      brand: 'BenQ',
      price: 499,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Мониторы',
      description: '25" киберспортивный монитор',
      rating: 4.6,
      specs: '240Hz, 0.5ms, DyAc+',
      warranty: '3 года',
      rgb: false,
      inStock: true,
      gaming: true
    }
  ];

  const categories = ['Все товары', 'Мыши', 'Клавиатуры', 'Мониторы', 'Гарнитуры', 'Кресла', 'Геймпады', 'Видеокарты', 'Микрофоны', 'Стримерское', 'Рули'];
  
  const filteredGear = selectedCategory === 'Все товары' 
    ? gamingGear 
    : gamingGear.filter(gear => gear.category === selectedCategory);

  const toggleFavorite = (gearId: string) => {
    setFavorites(prev => 
      prev.includes(gearId) 
        ? prev.filter(id => id !== gearId)
        : [...prev, gearId]
    );
  };

  const addToCart = (gear: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === gear.id);
      if (existing) {
        return prev.map(item => 
          item.id === gear.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...gear, quantity: 1 }];
    });
  };

  const updateQuantity = (gearId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== gearId));
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === gearId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Preload first 6 product images for instant visibility
  useImagePreloader({
    images: gamingGear.slice(0, 6).map(item => item.image),
    priority: true
  });


  const renderHomeTab = () => (
    <div className="min-h-screen bg-black font-montserrat">
      <div className="max-w-md mx-auto">
        
        {/* Gaming Header */}
        <div className="px-6 pt-20 pb-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded flex items-center justify-center mx-auto mb-8">
            <Gamepad2 className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">GameForge</h1>
          <p className="text-gray-400 text-sm font-medium">Pro Gaming Arsenal</p>
        </div>

        {/* Hero Setup */}
        <div className="px-6 pb-20">
          <div className="aspect-[16/10] rounded-lg overflow-hidden bg-gray-900 mb-12 relative">
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=500&fit=crop&crop=center" 
              alt="Gaming Setup"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Live</div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-xl font-bold mb-2">Championship Setup</h2>
              <p className="text-white/80 text-sm mb-4">Professional esports equipment</p>
              <button 
                className="bg-cyan-400 text-black px-6 py-2 rounded text-sm font-bold hover:bg-cyan-300 transition-colors"
                onClick={() => onNavigate?.('catalog')}
              >
                Build Setup
              </button>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="px-6 py-20 border-t border-gray-800">
          <div className="text-center mb-16">
            <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Every millisecond counts. Professional-grade equipment for competitive advantage.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 text-center">
            {[
              { number: '1ms', label: 'Response Time' },
              { number: '240Hz', label: 'Refresh Rate' },
              { number: '99%', label: 'Win Rate' },
              { number: '500+', label: 'FPS' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-cyan-400 mb-1">{stat.number}</div>
                <div className="text-gray-400 text-xs font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Gear */}
        <div className="px-6 py-20 border-t border-gray-800">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-lg font-bold text-white">Pro Gear</h3>
            <button 
              className="text-gray-400 text-sm font-medium hover:text-cyan-400 transition-colors"
              onClick={() => onNavigate?.('catalog')}
            >
              View all
            </button>
          </div>
          
          <div className="space-y-12">
            {gamingGear.filter(gear => gear.gaming && gear.rating >= 4.7).slice(0, 2).map((gear, index) => (
              <div 
                key={gear.id} 
                className="group cursor-pointer"
                onClick={() => onNavigate?.('catalog')}
              >
                <div className="aspect-[5/3] rounded-lg overflow-hidden bg-gray-900 mb-6 relative">
                  <OptimizedImage 
                    src={gear.image} 
                    alt={gear.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {gear.rgb && (
                    <div className="absolute top-3 left-3 bg-cyan-400 text-black text-xs font-bold px-2 py-1 rounded">
                      RGB
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-bold text-base">{gear.name}</h4>
                      <p className="text-cyan-400 text-sm font-medium">{gear.brand}</p>
                    </div>
                    <p className="text-white font-bold">${gear.price}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-3 h-3 text-cyan-400 fill-current"
                        />
                      ))}
                      <span className="text-gray-400 text-xs ml-2">{gear.rating}</span>
                    </div>
                    <div className="bg-gray-800 text-cyan-400 text-xs font-bold px-2 py-1 rounded">
                      PRO
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 font-montserrat">
      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-montserrat font-bold text-white">Арсенал игрока</h1>
          <p className="text-gray-300 font-montserrat">Соберите идеальную игровую станцию</p>
        </div>

        {/* Search */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="flex-1 flex items-center space-x-3 bg-white/10 rounded-2xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск снаряжения..."
                className="flex-1 bg-transparent border-none outline-none font-montserrat text-white placeholder-gray-400"
              />
            </div>
            <button className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                    : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gear Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredGear.map((gear) => (
            <div key={gear.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="relative mb-3">
                <OptimizedImage src={gear.image} alt={gear.name} className="w-full h-32 object-cover rounded-xl" />
                <div className="absolute top-2 left-2 flex space-x-1">
                  {gear.rgb && (
                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">RGB</span>
                  )}
                  {!gear.inStock && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">OUT</span>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(gear.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(gear.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>
              
              <h3 className="text-white font-montserrat font-semibold text-sm mb-1 line-clamp-1">{gear.name}</h3>
              <p className="text-purple-200 text-xs font-montserrat mb-1">{gear.brand}</p>
              <p className="text-gray-400 text-xs font-montserrat mb-2">{gear.specs}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-gray-300 text-xs">{gear.rating}</span>
                </div>
                <span className="text-purple-400 font-bold text-sm">${gear.price}</span>
              </div>
              
              <button
                onClick={() => addToCart(gear)}
                disabled={!gear.inStock}
                className={`w-full font-montserrat font-semibold py-2 rounded-xl hover:shadow-lg transition-all ${
                  gear.inStock
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {gear.inStock ? 'В корзину' : 'Нет в наличии'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCartTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 min-h-screen">
      <h1 className="text-2xl font-montserrat font-bold text-white">Корзина</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-300 font-montserrat">Корзина пуста</p>
          <p className="text-gray-500 text-sm font-montserrat">Добавьте снаряжение из каталога</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <OptimizedImage src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h4 className="text-white font-montserrat font-semibold">{item.name}</h4>
                    <p className="text-purple-200 text-sm font-montserrat">{item.brand}</p>
                    <p className="text-gray-300 text-sm">{item.warranty} • ${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-white font-montserrat font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-montserrat">Подытог:</span>
              <span className="text-white font-montserrat font-semibold">${cartTotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-montserrat">Доставка:</span>
              <span className="text-white font-montserrat font-semibold">Бесплатно</span>
            </div>
            <hr className="border-white/20" />
            <div className="flex justify-between items-center">
              <span className="text-xl font-montserrat font-bold text-white">Итого:</span>
              <span className="text-xl font-montserrat font-bold text-purple-400">${cartTotal}</span>
            </div>
            
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-montserrat font-semibold py-3 rounded-xl hover:shadow-xl transition-all">
              Оформить заказ
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 min-h-screen">
      <h1 className="text-2xl font-montserrat font-bold text-white">Профиль</h1>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-xl font-montserrat font-bold text-white">ГФ</span>
          </div>
          <div>
            <h3 className="text-xl font-montserrat font-semibold text-white">Pro Gamer</h3>
            <p className="text-purple-200 font-montserrat">Мастер киберспорта</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-montserrat font-bold text-purple-400">15</p>
            <p className="text-gray-300 text-sm font-montserrat">Девайсов</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-montserrat font-bold text-pink-400">$3.2K</p>
            <p className="text-gray-300 text-sm font-montserrat">Потрачено</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-montserrat font-semibold text-white">Избранное снаряжение</h2>
        {gamingGear.filter(gear => favorites.includes(gear.id)).map((gear) => (
          <div key={gear.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/20 flex items-center space-x-3">
            <OptimizedImage src={gear.image} alt={gear.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h4 className="text-white font-montserrat font-semibold">{gear.name}</h4>
              <p className="text-purple-200 text-sm font-montserrat">{gear.brand} • ${gear.price}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        ))}
        {favorites.length === 0 && (
          <p className="text-gray-500 text-center py-4 font-montserrat">Нет избранного снаряжения</p>
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