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
  Zap,
  Smartphone,
  Laptop,
  Watch,
  Headphones
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";

interface GadgetLabProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export default function GadgetLab({ activeTab = 'home', onNavigate }: GadgetLabProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все гаджеты');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  
  // 20 tech gadgets
  const gadgets = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      brand: 'Apple',
      price: 1199,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Смартфоны',
      description: 'Флагманский смартфон с титановым корпусом',
      rating: 4.9,
      specs: 'A17 Pro, 256GB, 5G',
      warranty: '1 год',
      inStock: true,
      new: true
    },
    {
      id: '2',
      name: 'MacBook Pro 16"',
      brand: 'Apple',
      price: 2399,
      image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400',
      category: 'Ноутбуки',
      description: 'Профессиональный ноутбук для креативных задач',
      rating: 4.8,
      specs: 'M3 Max, 32GB RAM, 1TB SSD',
      warranty: '1 год',
      inStock: true,
      new: true
    },
    {
      id: '3',
      name: 'Apple Watch Ultra 2',
      brand: 'Apple',
      price: 799,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Умные часы',
      description: 'Экстремальные умные часы для активного образа жизни',
      rating: 4.7,
      specs: 'GPS, Cellular, Titanium',
      warranty: '1 год',
      inStock: true,
      new: false
    },
    {
      id: '4',
      name: 'AirPods Pro 2',
      brand: 'Apple',
      price: 249,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Наушники',
      description: 'Беспроводные наушники с активным шумоподавлением',
      rating: 4.6,
      specs: 'ANC, Spatial Audio, USB-C',
      warranty: '1 год',
      inStock: true,
      new: false
    },
    {
      id: '5',
      name: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Смартфоны',
      description: 'Флагман с S Pen и AI функциями',
      rating: 4.8,
      specs: 'Snapdragon 8 Gen 3, 512GB',
      warranty: '2 года',
      inStock: true,
      new: true
    },
    {
      id: '6',
      name: 'Meta Quest 3',
      brand: 'Meta',
      price: 499,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'VR',
      description: 'VR-гарнитура нового поколения',
      rating: 4.5,
      specs: 'Mixed Reality, 128GB',
      warranty: '1 год',
      inStock: false,
      new: true
    },
    {
      id: '7',
      name: 'iPad Pro 12.9"',
      brand: 'Apple',
      price: 1099,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Планшеты',
      description: 'Профессиональный планшет с M2 чипом',
      rating: 4.7,
      specs: 'M2, 256GB, Wi-Fi + Cellular',
      warranty: '1 год',
      inStock: true,
      new: false
    },
    {
      id: '8',
      name: 'Sony WH-1000XM5',
      brand: 'Sony',
      price: 399,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Наушники',
      description: 'Премиальные беспроводные наушники',
      rating: 4.6,
      specs: 'ANC, 30h battery, Hi-Res',
      warranty: '2 года',
      inStock: true,
      new: false
    },
    {
      id: '9',
      name: 'Tesla Model S Plaid',
      brand: 'Tesla',
      price: 89990,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Электромобили',
      description: 'Самый быстрый серийный электромобиль',
      rating: 4.9,
      specs: '1020 HP, 0-100 2.1s',
      warranty: '4 года',
      inStock: false,
      new: false
    },
    {
      id: '10',
      name: 'DJI Mini 4 Pro',
      brand: 'DJI',
      price: 759,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Дроны',
      description: 'Компактный дрон с 4K камерой',
      rating: 4.5,
      specs: '4K/60fps, 34min flight',
      warranty: '1 год',
      inStock: true,
      new: true
    },
    {
      id: '11',
      name: 'Nintendo Switch OLED',
      brand: 'Nintendo',
      price: 349,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Игровые консоли',
      description: 'Портативная игровая консоль с OLED экраном',
      rating: 4.4,
      specs: 'OLED 7", 64GB, Joy-Con',
      warranty: '1 год',
      inStock: true,
      new: false
    },
    {
      id: '12',
      name: 'Logitech MX Master 3S',
      brand: 'Logitech',
      price: 99,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Аксессуары',
      description: 'Эргономичная беспроводная мышь для работы',
      rating: 4.6,
      specs: 'Wireless, 70 days battery',
      warranty: '1 год',
      inStock: true,
      new: false
    },
    {
      id: '13',
      name: 'Google Pixel 8 Pro',
      brand: 'Google',
      price: 999,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Смартфоны',
      description: 'AI-смартфон с лучшей камерой',
      rating: 4.7,
      specs: 'Tensor G3, 256GB, AI',
      warranty: '2 года',
      inStock: true,
      new: true
    },
    {
      id: '14',
      name: 'Steam Deck OLED',
      brand: 'Valve',
      price: 649,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Игровые консоли',
      description: 'Портативная игровая консоль для Steam',
      rating: 4.5,
      specs: 'OLED, 1TB SSD, SteamOS',
      warranty: '1 год',
      inStock: false,
      new: true
    },
    {
      id: '15',
      name: 'Dyson V15 Detect',
      brand: 'Dyson',
      price: 749,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Умный дом',
      description: 'Беспроводной пылесос с лазерным детектором',
      rating: 4.4,
      specs: 'Laser detect, 60min runtime',
      warranty: '2 года',
      inStock: true,
      new: false
    },
    {
      id: '16',
      name: 'Samsung Galaxy Watch 6',
      brand: 'Samsung',
      price: 329,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Умные часы',
      description: 'Умные часы с продвинутым мониторингом здоровья',
      rating: 4.3,
      specs: 'Wear OS, 40mm, GPS+LTE',
      warranty: '1 год',
      inStock: true,
      new: false
    },
    {
      id: '17',
      name: 'ASUS ROG Ally',
      brand: 'ASUS',
      price: 699,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Игровые консоли',
      description: 'Windows-консоль для мобильного гейминга',
      rating: 4.2,
      specs: 'Ryzen Z1 Extreme, 512GB',
      warranty: '1 год',
      inStock: true,
      new: true
    },
    {
      id: '18',
      name: 'Apple Studio Display',
      brand: 'Apple',
      price: 1599,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Мониторы',
      description: '5K монитор для профессиональной работы',
      rating: 4.6,
      specs: '27" 5K, P3, 600 nits',
      warranty: '1 год',
      inStock: true,
      new: false
    },
    {
      id: '19',
      name: 'Razer DeathAdder V3 Pro',
      brand: 'Razer',
      price: 149,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Аксессуары',
      description: 'Игровая мышь с беспроводной зарядкой',
      rating: 4.5,
      specs: 'Wireless, 90h battery',
      warranty: '2 года',
      inStock: true,
      new: false
    },
    {
      id: '20',
      name: 'Nothing Phone (2)',
      brand: 'Nothing',
      price: 699,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      category: 'Смартфоны',
      description: 'Уникальный смартфон с прозрачным дизайном',
      rating: 4.3,
      specs: 'Snapdragon 8+ Gen 1, 256GB',
      warranty: '1 год',
      inStock: true,
      new: true
    }
  ];

  const categories = ['Все гаджеты', 'Смартфоны', 'Ноутбуки', 'Планшеты', 'Умные часы', 'Наушники', 'VR', 'Дроны', 'Игровые консоли', 'Умный дом', 'Мониторы', 'Аксессуары', 'Электромобили'];
  
  const filteredGadgets = selectedCategory === 'Все гаджеты' 
    ? gadgets 
    : gadgets.filter(gadget => gadget.category === selectedCategory);

  const toggleFavorite = (gadgetId: string) => {
    setFavorites(prev => 
      prev.includes(gadgetId) 
        ? prev.filter(id => id !== gadgetId)
        : [...prev, gadgetId]
    );
  };

  const addToCart = (gadget: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === gadget.id);
      if (existing) {
        return prev.map(item => 
          item.id === gadget.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...gadget, quantity: 1 }];
    });
  };

  const updateQuantity = (gadgetId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== gadgetId));
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === gadgetId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Preload first 6 product images for instant visibility
  useImagePreloader({
    images: gadgets.slice(0, 6).map(item => item.image),
    priority: true
  });


  const renderHomeTab = () => (
    <div className="min-h-screen bg-slate-100 font-montserrat">
      <div className="max-w-md mx-auto">
        
        {/* Tech Header */}
        <div className="px-6 pt-20 pb-16 text-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-3 tracking-wide">GadgetLab</h1>
          <p className="text-slate-500 text-sm font-medium">Future Technology</p>
        </div>

        {/* Hero Tech */}
        <div className="px-6 pb-20">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 mb-12 relative">
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=600&fit=crop&crop=center" 
              alt="Latest Technology"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">• NEW
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-6">
              <div className="text-white">
                <h2 className="text-lg font-semibold mb-2">Next-Gen Innovation</h2>
                <p className="text-white/80 text-sm mb-4">Experience the future today</p>
                <button 
                  className="bg-white text-slate-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                  onClick={() => onNavigate?.('catalog')}
                >
                  Explore Tech
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Innovation Stats */}
        <div className="px-6 py-20 border-t border-slate-300">
          <div className="text-center mb-16">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Innovation Metrics</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Cutting-edge technology designed to enhance productivity and creativity.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 text-center">
            {[
              { number: '5G', label: 'Connectivity' },
              { number: 'AI', label: 'Intelligence' },
              { number: '24H', label: 'Battery Life' },
              { number: '100%', label: 'Wireless' }
            ].map((spec, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-blue-600 mb-1">{spec.number}</div>
                <div className="text-slate-500 text-xs font-medium">{spec.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="px-6 py-20 border-t border-slate-300">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-lg font-semibold text-slate-900">Featured</h3>
            <button 
              className="text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors"
              onClick={() => onNavigate?.('catalog')}
            >
              View all
            </button>
          </div>
          
          <div className="space-y-12">
            {gadgets.filter(gadget => gadget.new).slice(0, 2).map((gadget, index) => (
              <div 
                key={gadget.id} 
                className="group cursor-pointer"
                onClick={() => onNavigate?.('catalog')}
              >
                <div className="aspect-[5/3] rounded-xl overflow-hidden bg-slate-200 mb-6 relative">
                  <OptimizedImage 
                    src={gadget.image} 
                    alt={gadget.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {gadget.new && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      NEW
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-slate-900 font-semibold text-base">{gadget.name}</h4>
                      <p className="text-blue-600 text-sm font-medium">{gadget.brand}</p>
                    </div>
                    <p className="text-slate-900 font-semibold">${gadget.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-3 h-3 text-blue-500 fill-current"
                      />
                    ))}
                    <span className="text-slate-500 text-xs ml-2">{gadget.rating}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 font-montserrat">
      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-montserrat font-bold text-gray-900">Каталог гаджетов</h1>
          <p className="text-gray-600 font-montserrat">Технологии, которые изменят вашу жизнь</p>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-1 flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск гаджетов..."
                className="flex-1 bg-transparent border-none outline-none font-montserrat text-gray-900 placeholder-gray-400"
              />
            </div>
            <button className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                    : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-white'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gadgets Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredGadgets.map((gadget) => (
            <div key={gadget.id} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all">
              <div className="relative mb-3">
                <OptimizedImage src={gadget.image} alt={gadget.name} className="w-full h-32 object-cover rounded-xl" />
                <div className="absolute top-2 left-2 flex space-x-1">
                  {gadget.new && (
                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
                  )}
                  {!gadget.inStock && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">OUT</span>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(gadget.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(gadget.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
              
              <h3 className="text-gray-900 font-montserrat font-semibold text-sm mb-1 line-clamp-1">{gadget.name}</h3>
              <p className="text-cyan-600 text-xs font-montserrat mb-1">{gadget.brand}</p>
              <p className="text-gray-500 text-xs font-montserrat mb-2">{gadget.specs}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-gray-600 text-xs">{gadget.rating}</span>
                </div>
                <span className="text-cyan-600 font-bold text-sm">${gadget.price.toLocaleString()}</span>
              </div>
              
              <button
                onClick={() => addToCart(gadget)}
                disabled={!gadget.inStock}
                className={`w-full font-montserrat font-semibold py-2 rounded-xl hover:shadow-lg transition-all ${
                  gadget.inStock
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {gadget.inStock ? 'В корзину' : 'Нет в наличии'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCartTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-montserrat font-bold text-gray-900">Корзина</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-montserrat">Корзина пуста</p>
          <p className="text-gray-400 text-sm font-montserrat">Добавьте гаджеты из каталога</p>
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
                    <p className="text-cyan-600 text-sm font-montserrat">{item.brand}</p>
                    <p className="text-gray-600 text-sm">{item.warranty} • ${item.price.toLocaleString()}</p>
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
                      className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center"
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
              <span className="text-gray-900 font-montserrat font-semibold">${cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-montserrat">Доставка:</span>
              <span className="text-gray-900 font-montserrat font-semibold">Бесплатно</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-xl font-montserrat font-bold text-gray-900">Итого:</span>
              <span className="text-xl font-montserrat font-bold text-cyan-600">${cartTotal.toLocaleString()}</span>
            </div>
            
            <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-montserrat font-semibold py-3 rounded-xl hover:shadow-xl transition-all">
              Оформить заказ
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-montserrat font-bold text-gray-900">Профиль</h1>
      
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-lg">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xl font-montserrat font-bold text-white">ГЛ</span>
          </div>
          <div>
            <h3 className="text-xl font-montserrat font-semibold text-gray-900">Tech Enthusiast</h3>
            <p className="text-cyan-600 font-montserrat">Любитель технологий</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-montserrat font-bold text-cyan-600">23</p>
            <p className="text-gray-600 text-sm font-montserrat">Гаджетов</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-montserrat font-bold text-blue-600">$15K</p>
            <p className="text-gray-600 text-sm font-montserrat">Потрачено</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-montserrat font-semibold text-gray-900">Избранные гаджеты</h2>
        {gadgets.filter(gadget => favorites.includes(gadget.id)).map((gadget) => (
          <div key={gadget.id} className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-white/30 shadow-lg flex items-center space-x-3">
            <OptimizedImage src={gadget.image} alt={gadget.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h4 className="text-gray-900 font-montserrat font-semibold">{gadget.name}</h4>
              <p className="text-cyan-600 text-sm font-montserrat">{gadget.brand} • ${gadget.price.toLocaleString()}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        ))}
        {favorites.length === 0 && (
          <p className="text-gray-500 text-center py-4 font-montserrat">Нет избранных гаджетов</p>
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